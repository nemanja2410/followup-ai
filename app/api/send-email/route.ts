import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, name, message } = await request.json();

    // Resend zahteva da šalješ sa verifikovanog domena, 
    // ali za testiranje dozvoljavaju onboarding@resend.dev na tvoj sopstveni email
    const data = await resend.emails.send({
      from: "Followup AI <onboarding@resend.dev>",
      to: "nemanjaback761@gmail.com", // <-- Fiksirano za testiranje
      subject: `Checking in regarding your quote, ${name}`,
      text: message,
    });

    return NextResponse.json({ success: true, data }, { status: 200 });

  } catch (error) {
    console.error("Greška pri slanju:", error);
    return NextResponse.json({ success: false, error: "Slanje emaila nije uspelo." }, { status: 500 });
  }
}