function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function companyFromFromHeader(from: string) {
  const named = from.match(/^\s*"?([^"<]+)"?\s*</);
  const name = named?.[1]?.trim();
  if (name && !/^followup\s*ai$/i.test(name)) return name;
  return null;
}

export function resolveCompanyName(options: {
  businessName?: string | null;
  fromHeader: string;
}) {
  const fromProfile = options.businessName?.trim();
  if (fromProfile) return fromProfile;
  return companyFromFromHeader(options.fromHeader) || "Your estimate";
}

export function parseFollowupDraft(raw: string) {
  const trimmed = raw.trim();
  const fenced = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    const parsed = JSON.parse(fenced) as {
      subject?: unknown;
      body?: unknown;
      cta?: unknown;
    };
    const subject = typeof parsed.subject === "string" ? parsed.subject.trim() : "";
    const body = typeof parsed.body === "string" ? parsed.body.trim() : "";
    const cta = typeof parsed.cta === "string" ? parsed.cta.trim() : "";
    if (body) {
      return {
        subject: subject || "Following up on your estimate",
        body,
        cta: cta || "Reply with a time that works for you",
      };
    }
  } catch {
    // Plain-text drafts from older prompt shape.
  }

  return {
    subject: "Following up on your estimate",
    body: trimmed,
    cta: "Reply with a time that works for you",
  };
}

export function renderFollowupText(options: {
  body: string;
  cta: string;
  companyName: string;
  replyEmail: string;
}) {
  return [
    options.body.trim(),
    "",
    options.cta.trim(),
    "",
    `— ${options.companyName}`,
    options.replyEmail ? `Reply to ${options.replyEmail}` : "",
  ]
    .filter((line) => line !== undefined)
    .join("\n")
    .trim();
}

export function renderFollowupHtml(options: {
  body: string;
  cta: string;
  companyName: string;
  replyEmail: string;
}) {
  const company = escapeHtml(options.companyName);
  const cta = escapeHtml(options.cta);
  const reply = options.replyEmail.trim();
  const mailto = reply
    ? `mailto:${escapeHtml(reply)}?subject=${encodeURIComponent("Re: your estimate")}`
    : "#";
  const paragraphs = options.body
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map(
      (part) =>
        `<p style="margin:0 0 16px 0;font-size:16px;line-height:1.65;color:#3f3f46;">${escapeHtml(part).replace(/\n/g, "<br />")}</p>`
    )
    .join("");

  const footerContact = reply
    ? `${company}<br /><a href="mailto:${escapeHtml(reply)}" style="color:#71717a;text-decoration:none;">${escapeHtml(reply)}</a>`
    : company;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(options.companyName)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border:1px solid #e4e4e7;border-radius:8px;">
          <tr>
            <td style="padding:28px 32px 20px 32px;border-bottom:1px solid #f4f4f5;">
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:20px;letter-spacing:-0.02em;color:#18181b;">${company}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px 8px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
              ${paragraphs}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 32px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:6px;background-color:#18181b;">
                    <a href="${mailto}" style="display:inline-block;padding:12px 22px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">${cta}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 32px;border-top:1px solid #f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#71717a;">
              ${footerContact}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
