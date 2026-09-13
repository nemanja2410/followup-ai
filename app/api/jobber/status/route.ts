import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  JOBBER_PING_QUERY,
  isJobberAuthFailure,
  jobberGraphqlWithRefresh,
  loadIntegrationByUserId,
} from "@/lib/jobber";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const integration = await loadIntegrationByUserId(user.id);
  if (!integration?.jobber_access_token) {
    return NextResponse.json({ connected: false });
  }

  const result = await jobberGraphqlWithRefresh(integration, JOBBER_PING_QUERY);
  if (isJobberAuthFailure(result) || result.status === 401) {
    return NextResponse.json({ connected: false, reconnect: true });
  }

  const accountId = (result.json.data as { account?: { id?: string } } | undefined)?.account?.id;
  if (!accountId) {
    return NextResponse.json({ connected: false, reconnect: true });
  }

  return NextResponse.json({ connected: true });
}
