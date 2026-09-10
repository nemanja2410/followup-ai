import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name, notes, quoteValue } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { message: "Gemini API key is not configured." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
    });

    const valueLine =
      typeof quoteValue === "number"
        ? `Quote amount: $${quoteValue}`
        : "";

    const prompt = `You are a busy home-service business owner following up on a quote sent through Jobber.

Write a concise, natural, polite follow-up email (2-4 sentences). Do not sound like a corporate robot. Write as the sender using "I". Do not include a subject line or sign-off placeholders. Output only the email body.

Client Name: ${name}
${valueLine}
Context/Notes: ${notes || "Quote was sent. Checking in to see if they have questions."}`;

    let result;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        result = await model.generateContent(prompt);
        break;
      } catch (error: unknown) {
        const status = (error as { status?: number })?.status;
        console.error(`Gemini attempt ${attempt} failed:`, error);

        if (status === 503 && attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
          continue;
        }

        throw error;
      }
    }

    if (!result) {
      throw new Error("Gemini did not return a result.");
    }

    const aiDraft = result.response.text().trim();

    return NextResponse.json({ message: aiDraft });
  } catch (error: unknown) {
    console.error("Gemini API Error:", error);

    const status = (error as { status?: number })?.status;
    if (status === 503) {
      return NextResponse.json(
        { message: "The AI service is busy. Try again in a moment." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { message: "Could not generate a draft. Try again." },
      { status: 500 }
    );
  }
}
