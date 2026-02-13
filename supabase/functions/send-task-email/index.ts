// Edge Function: يُستدعى عند إضافة مهمة (Database Webhook على جدول tasks)
// يرسل إيميل للموظف على بريده المسجّل في Supabase Auth

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Trackify <employees@pixelcodes.net>";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: { id: string; user_id: string; text: string; completed?: boolean };
  old_record?: unknown;
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
    const payload: WebhookPayload = await req.json();
    if (payload.table !== "tasks" || payload.type !== "INSERT" || !payload.record?.user_id) {
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { user_id, text } = payload.record;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(user_id);

    if (userError || !user?.user?.email) {
      return new Response(
        JSON.stringify({ error: "User not found or no email", detail: userError?.message }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const toEmail = user.user.email;
    const subject = "مهمة جديدة من الإدارة - Trackify";
    const html = `
      <div dir="rtl" style="font-family: sans-serif; max-width: 500px; padding: 20px;">
        <h2 style="color: #4338ca;">مهمة جديدة</h2>
        <p>تم تعيين مهمة جديدة لك من لوحة الإدارة:</p>
        <blockquote style="background: #f1f5f9; padding: 16px; border-radius: 8px; border-right: 4px solid #6366f1;">
          ${(text || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}
        </blockquote>
        <p style="color: #64748b; font-size: 14px;">سجّل الدخول إلى التطبيق لمعرفة التفاصيل وإنجاز المهمة.</p>
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
        to: [toEmail],
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

    return new Response(JSON.stringify({ ok: true, to: toEmail }), {
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
