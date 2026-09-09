import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  try {
    const { name, notes } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { message: "Gemini API key nije podešen." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
    });

    const prompt = `You are an elite executive assistant helping an independent professional draft a follow-up email to a client.

Write a concise, natural, and polite follow-up email based strictly on the provided context/notes.

Keep it under 3-4 sentences. Do NOT sound like a corporate robot. Use a friendly but professional tone.

Write directly as the sender (use "I"). Do not include subject lines or placeholders. Just output the email body.

Client Name: ${name}

Context/Notes: ${
      notes || "Just checking in to see if you need any further assistance."
    }`;

    // Retry up to 3 times if Gemini is temporarily unavailable
    let result;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        result = await model.generateContent(prompt);
        break;
      } catch (error: any) {
        console.error(`Gemini attempt ${attempt} failed:`, error);

        if (error?.status === 503 && attempt < 3) {
          await new Promise((resolve) =>
            setTimeout(resolve, 2000 * attempt)
          );
          continue;
        }

        throw error;
      }
    }

    if (!result) {
      throw new Error("Gemini nije vratio rezultat.");
    }

    const aiDraft = result.response.text().trim();

    return NextResponse.json({ message: aiDraft });
  } catch (error: any) {
    console.error("Gemini API Error:", error);

    if (error?.status === 503) {
      return NextResponse.json(
        {
          message:
            "AI servis je trenutno preopterećen. Pokušaj ponovo za nekoliko trenutaka.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        message:
          "Došlo je do greške pri komunikaciji sa AI servisom.",
      },
      { status: 500 }
    );
  }
}