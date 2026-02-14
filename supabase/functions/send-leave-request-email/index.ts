// Edge Function: إشعار بالإيميل عند إضافة طلب إجازة جديد
// يُستدعى عبر Database Webhook على جدول leave_requests (حدث INSERT)
// يرسل إيميلاً إلى الأدمن على ADMIN_LEAVE_NOTIFY_EMAIL

declare const Deno: {
  env: { get(key: string): string | undefined };
  serve: (handler: (req: Request) => Promise<Response>) => void;
};

// @ts-expect-error - Deno ESM URL import (صالح في Supabase Edge Runtime)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Trackify <employees@pixelcodes.net>";
const ADMIN_LEAVE_NOTIFY_EMAIL = Deno.env.get("ADMIN_LEAVE_NOTIFY_EMAIL") || "husseinghazala39@gmail.com";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: {
    id: string;
    user_id: string;
    start_date: string;
    end_date: string;
    leave_type: string;
    notes: string | null;
    status: string;
    created_at?: string;
  };
  old_record?: unknown;
}

function escapeHtml(s: string): string {
  return (s || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  if (!RESEND_API_KEY) {
    return new Response(
      JSON.stringify({ error: "RESEND_API_KEY not set in Edge Function secrets" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const raw = await req.json();
    // دعم تنسيق الـ payload سواء table باسم "leave_requests" أو "public.leave_requests"
    const payload = raw?.payload ?? raw;
    const tableName = (payload?.table ?? "").replace("public.", "");
    if (tableName !== "leave_requests" || payload?.type !== "INSERT" || !payload?.record?.user_id) {
      return new Response(JSON.stringify({ ok: true, skipped: true, reason: "not_leave_insert" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { user_id, start_date, end_date, leave_type, notes } = payload.record;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, job_title")
      .eq("id", user_id)
      .maybeSingle();

    const employeeName = profile?.full_name || "موظف";
    const jobTitle = profile?.job_title || "—";

    const subject = `طلب إجازة جديد - ${employeeName} - Trackify`;
    const html = `
      <div dir="rtl" style="font-family: sans-serif; max-width: 520px; padding: 20px;">
        <h2 style="color: #4338ca;">طلب إجازة جديد</h2>
        <p>تم تقديم طلب إجازة من أحد الموظفين ويحتاج إلى مراجعتك.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; background: #f8fafc; border-radius: 8px; overflow: hidden;">
          <tr><td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-weight: bold;">الموظف</td><td style="padding: 10px 14px; border: 1px solid #e2e8f0;">${escapeHtml(employeeName)}</td></tr>
          <tr><td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-weight: bold;">المسمى</td><td style="padding: 10px 14px; border: 1px solid #e2e8f0;">${escapeHtml(jobTitle)}</td></tr>
          <tr><td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-weight: bold;">من تاريخ</td><td style="padding: 10px 14px; border: 1px solid #e2e8f0;">${escapeHtml(start_date)}</td></tr>
          <tr><td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-weight: bold;">إلى تاريخ</td><td style="padding: 10px 14px; border: 1px solid #e2e8f0;">${escapeHtml(end_date)}</td></tr>
          <tr><td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-weight: bold;">نوع الإجازة</td><td style="padding: 10px 14px; border: 1px solid #e2e8f0;">${escapeHtml(leave_type || "—")}</td></tr>
          ${notes ? `<tr><td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-weight: bold;">ملاحظة</td><td style="padding: 10px 14px; border: 1px solid #e2e8f0;">${escapeHtml(notes)}</td></tr>` : ""}
        </table>
        <p style="color: #64748b; font-size: 14px;">سجّل الدخول إلى لوحة الإدارة → الإجازات للموافقة أو الرفض.</p>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [ADMIN_LEAVE_NOTIFY_EMAIL],
        subject,
        html,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Resend failed", detail: data }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, to: ADMIN_LEAVE_NOTIFY_EMAIL }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
