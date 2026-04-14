// Netlify serverless function — emails the Brand Positioning Kit as a PDF
// attachment to the user via Resend.
//
// Required env var: RESEND_API_KEY (add in Netlify site settings → Environment variables)
// Optional env var: FROM_EMAIL (defaults to "Bidya <noreply@bidya.co>")
//
// Request body:
//   { email: string, name: string, brand: string, pdfBase64: string }

export default async function handler(req) {
  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error:
          "RESEND_API_KEY not configured. Add it in Netlify site settings → Environment variables. Sign up for free at resend.com.",
      }),
      { status: 500, headers: corsHeaders }
    );
  }

  try {
    const { email, name, brand, pdfBase64 } = await req.json();

    if (!email || !pdfBase64) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: email, pdfBase64" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const from = process.env.FROM_EMAIL || "Bidya <noreply@bidya.co>";
    const firstName = (name || "").split(" ")[0] || "there";
    const brandName = brand || "your brand";
    const filename = `${brandName.replace(/[^a-z0-9]/gi, "_")}_Brand_Positioning_Kit.pdf`;

    const htmlBody = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1a1a1a;line-height:1.65">
        <p style="font-size:13px;letter-spacing:0.16em;text-transform:uppercase;color:#B83232;font-weight:700;margin-bottom:20px">Your Brand Positioning Kit</p>
        <h1 style="font-size:26px;font-weight:800;line-height:1.25;margin-bottom:20px">${firstName}, here's ${brandName}'s full kit.</h1>
        <p style="font-size:16px;margin-bottom:18px">Your Brand Playbook, Growth Case Study, and Content Strategy — all three written specifically for ${brandName} — are attached to this email as one PDF.</p>
        <p style="font-size:16px;margin-bottom:18px">This isn't a template. It isn't a generic framework with your name at the top. Every page is written for the brand you described, the customer you serve, and the category you actually operate in.</p>
        <p style="font-size:16px;margin-bottom:24px"><strong>How to use it:</strong> read it once end-to-end, then keep it open on the side when you're writing, briefing designers, or making decisions about what ${brandName} should or shouldn't do next.</p>
        <p style="font-size:15px;color:#666;margin-top:32px">Reply to this email if anything in the kit doesn't feel right — we read every response.</p>
        <p style="font-size:13px;color:#999;margin-top:24px">— Bidya</p>
      </div>
    `;

    const resendPayload = {
      from,
      to: [email],
      subject: `${brandName}'s Brand Positioning Kit is here`,
      html: htmlBody,
      attachments: [
        {
          filename,
          content: pdfBase64,
        },
      ],
    };

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(resendPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", JSON.stringify(data));
      return new Response(
        JSON.stringify({
          error: "Email delivery failed",
          details: data,
          message: data?.message || "Unknown Resend API error",
        }),
        { status: response.status, headers: corsHeaders }
      );
    }

    return new Response(JSON.stringify({ ok: true, id: data.id }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err) {
    console.error("send-kit error:", err.message, err.stack);
    return new Response(
      JSON.stringify({ error: "Internal server error", message: err.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}
