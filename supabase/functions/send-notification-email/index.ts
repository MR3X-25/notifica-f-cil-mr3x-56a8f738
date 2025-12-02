import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationEmailRequest {
  debtorEmail: string;
  debtorName: string;
  creditorName: string;
  token: string;
  debtAmount: number;
  dueDate: string;
  debtDescription: string;
  accessUrl: string;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: NotificationEmailRequest = await req.json();
    
    console.log("Sending notification email to:", data.debtorEmail);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e3a5f; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #1e3a5f; }
          .amount { font-size: 24px; font-weight: bold; color: #c62828; }
          .btn { display: inline-block; background: #1e3a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; margin: 15px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>MR3X - Notificação Extrajudicial</h1>
          </div>
          <div class="content">
            <p>Prezado(a) <strong>${data.debtorName}</strong>,</p>
            
            <p>Você está recebendo uma <strong>Notificação Extrajudicial</strong> referente a débito pendente.</p>
            
            <div class="info-box">
              <p><strong>Token:</strong> ${data.token}</p>
              <p><strong>Credor:</strong> ${data.creditorName}</p>
              <p><strong>Descrição:</strong> ${data.debtDescription}</p>
              <p><strong>Data de Vencimento:</strong> ${formatDate(data.dueDate)}</p>
              <p class="amount">Valor: ${formatCurrency(data.debtAmount)}</p>
            </div>
            
            <div class="warning">
              <strong>⚠️ IMPORTANTE:</strong> Esta notificação requer sua ciência e aceite. Clique no botão abaixo para acessar a notificação completa e confirmar o recebimento.
            </div>
            
            <center>
              <a href="${data.accessUrl}" class="btn">Acessar Notificação</a>
            </center>
            
            <p style="font-size: 12px; color: #666;">
              Caso o botão não funcione, copie e cole este link no seu navegador:<br>
              <a href="${data.accessUrl}">${data.accessUrl}</a>
            </p>
          </div>
          <div class="footer">
            <p>Esta é uma notificação extrajudicial com validade legal.</p>
            <p>MR3X - Sistema de Notificações Extrajudiciais</p>
            <p>Token de verificação: ${data.token}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "MR3X Notificações <onboarding@resend.dev>",
        to: [data.debtorEmail],
        subject: `Notificação Extrajudicial - ${data.token}`,
        html: emailHtml,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", result);
      throw new Error(result.message || "Failed to send email");
    }

    console.log("Email sent successfully:", result);

    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending notification email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
