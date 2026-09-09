import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const topic = body?.data?.webHookEvent?.topic;
    const itemId = body?.data?.webHookEvent?.itemId;

    if (!topic || !itemId) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    console.log(`\n🔔 [1/4] WEBHOOK PRIMLJEN! Quote ID: ${itemId}`);

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: integration, error: dbError } = await supabaseAdmin
      .from("integrations")
      .select("user_id, jobber_access_token")
      .not("jobber_access_token", "is", null)
      .limit(1)
      .single();

    if (dbError || !integration) {
      console.error("❌ [2/4] GREŠKA U BAZI: Nema aktivnog tokena.", dbError);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    console.log("✅ [2/4] Token pronađen. Vučem podatke sa Jobbera...");

    // ISPRAVKA: Direktno ubacujemo itemId u string upita, bez varijabli
    const jobberResponse = await fetch("https://api.getjobber.com/api/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${integration.jobber_access_token}`,
        "X-JOBBER-GRAPHQL-VERSION": "2026-07-27"
      },
      body: JSON.stringify({
        query: `
          query {
            quote(id: "${itemId}") {
              quoteNumber
              client { name }
              amounts { total }
            }
          }
        `
      })
    });

    const jobberData = await jobberResponse.json();
    console.log("🔍 [3/4] ODGOVOR JOBBERA:", JSON.stringify(jobberData, null, 2));

    const quoteInfo = jobberData?.data?.quote;

    if (quoteInfo) {
      console.log(`✅ [4/4] Spremam u bazu: #${quoteInfo.quoteNumber} za ${quoteInfo.client.name}`);
      const { error } = await supabaseAdmin.from("leads").insert([
        {
          user_id: integration.user_id,
          name: quoteInfo.client.name,
          email: "klijent@primer.com",
          status: "Pending Follow-up",
          notes: `Automatski uvezeno sa Jobbera. Predračun #${quoteInfo.quoteNumber} u iznosu od $${quoteInfo.amounts.total}.`
        }
      ]);

      if (error) console.error("❌ GREŠKA PRI UPISU U BAZU:", error);
      else console.log("🚀 LEAD JE USPEŠNO UBAČEN U DASHBOARD!");
    } else {
      console.error("❌ [4/4] Jobber nije vratio Quote podatke! Pogledaj log iznad.");
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error("❌ KRITIČNA GREŠKA:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}