import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";
import { parseFollowupDraft } from "@/lib/followup-email";

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

    const prompt = `You write follow-up emails for a small home-service business (HVAC, plumbing, electrical, and similar). The owner already sent a Jobber estimate and is checking in personally.

Return ONLY valid JSON with these keys:
- "subject": a professional, specific subject line (no spammy words, no ALL CAPS, no emoji)
- "body": 2 to 4 short paragraphs, first-person ("I"), warm and direct, not a marketing newsletter. Do not include a subject, sign-off, or button label in the body.
- "cta": one short, non-pushy button label that asks them to reply (example: "Reply with a time that works")

JSON only. No markdown.

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

    const draft = parseFollowupDraft(result.response.text().trim());

    return NextResponse.json({
      message: draft.body,
      subject: draft.subject,
      cta: draft.cta,
    });
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
