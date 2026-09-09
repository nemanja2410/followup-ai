import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing User ID" }, { status: 400 });
    }

    // 1. Get the Jobber token from the database securely
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: integration, error } = await supabaseAdmin
      .from("integrations")
      .select("jobber_access_token")
      .eq("user_id", userId)
      .single();

    if (error || !integration?.jobber_access_token) {
      return NextResponse.json({ error: "Jobber not connected" }, { status: 401 });
    }

    // 2. Fetch recent quotes from Jobber using GraphQL
    const jobberResponse = await fetch("https://api.getjobber.com/api/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${integration.jobber_access_token}`,
        "X-JOBBER-GRAPHQL-VERSION": "2023-11-15"
      },
      body: JSON.stringify({
        query: `
          query {
            quotes(first: 5) {
              nodes {
                id
                quoteNumber
                quoteStatus
                amounts {
                  total
                }
                client {
                  name
                }
                lineItems {
                  nodes {
                    name
                    description
                  }
                }
              }
            }
          }
        `
      })
    });

    const jobberData = await jobberResponse.json();
    return NextResponse.json({ success: true, quotes: jobberData });

  } catch (error) {
    console.error("Fetch Quotes Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}