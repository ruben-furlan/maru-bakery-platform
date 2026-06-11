// =====================================================================
// Marü Bakery — Edge Function: notify-pedido
// Recibe el Database Webhook de INSERT en public.pedidos y envía un
// email de notificación a la dueña vía Resend.
//
// Deploy:  npx supabase functions deploy notify-pedido --no-verify-jwt
// Secrets: RESEND_API_KEY, WEBHOOK_SECRET, NOTIFY_EMAIL_TO, NOTIFY_EMAIL_FROM
// =====================================================================

interface PedidoRecord {
  id: string;
  nombre: string;
  contacto: string;
  mensaje: string;
  producto: string | null;
  estado: string;
  creado_en: string;
}

interface WebhookPayload {
  type: string;
  table: string;
  record: PedidoRecord;
}

const PANEL_URL = 'https://maru-bakery.netlify.app/admin';

/** Escapa texto del cliente antes de interpolarlo en el HTML del email. */
function escapeHtml(texto: string): string {
  return texto
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatearFecha(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return iso;
  return new Intl.DateTimeFormat('es-UY', {
    timeZone: 'America/Montevideo',
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(fecha);
}

function armarHtml(pedido: PedidoRecord): string {
  const nombre = escapeHtml(pedido.nombre);
  const contacto = escapeHtml(pedido.contacto);
  const mensaje = escapeHtml(pedido.mensaje).replaceAll('\n', '<br>');
  const producto = pedido.producto ? escapeHtml(pedido.producto) : null;
  const fecha = formatearFecha(pedido.creado_en);

  const filaProducto = producto
    ? `<tr>
         <td style="padding:8px 0;color:#7C0F2A;font-weight:bold;vertical-align:top;width:140px;">Producto</td>
         <td style="padding:8px 0;color:#3d3d3d;">${producto}</td>
       </tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="es">
<body style="margin:0;padding:0;background-color:#F2E3BC;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F2E3BC;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#FBF4E2;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(124,15,42,0.15);">
          <tr>
            <td style="background-color:#7C0F2A;padding:24px 32px;text-align:center;">
              <span style="color:#F2E3BC;font-size:26px;font-weight:bold;letter-spacing:1px;">Marü Bakery</span>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;">
              <h1 style="margin:0 0 6px;color:#7C0F2A;font-size:20px;">🧁 Nueva consulta recibida</h1>
              <p style="margin:0 0 20px;color:#6b6b6b;font-size:13px;">${fecha}</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;border-top:1px solid #e6d4a8;">
                <tr>
                  <td style="padding:12px 0 8px;color:#7C0F2A;font-weight:bold;vertical-align:top;width:140px;">Nombre</td>
                  <td style="padding:12px 0 8px;color:#3d3d3d;">${nombre}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#7C0F2A;font-weight:bold;vertical-align:top;width:140px;">Contacto</td>
                  <td style="padding:8px 0;color:#3d3d3d;">${contacto}</td>
                </tr>
                ${filaProducto}
                <tr>
                  <td style="padding:8px 0;color:#7C0F2A;font-weight:bold;vertical-align:top;width:140px;">Mensaje</td>
                  <td style="padding:8px 0;color:#3d3d3d;line-height:1.5;">${mensaje}</td>
                </tr>
              </table>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto 8px;">
                <tr>
                  <td style="background-color:#7C0F2A;border-radius:8px;">
                    <a href="${PANEL_URL}" style="display:inline-block;padding:12px 28px;color:#F2E3BC;font-size:15px;font-weight:bold;text-decoration:none;">Ver en el panel</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;background-color:#F2E3BC;text-align:center;">
              <span style="color:#7C0F2A;font-size:12px;">Donde el sabor habla por sí solo</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request): Promise<Response> => {
  try {
    const webhookSecret = Deno.env.get('WEBHOOK_SECRET');
    const authHeader = req.headers.get('Authorization');
    if (!webhookSecret || authHeader !== `Bearer ${webhookSecret}`) {
      return json({ error: 'No autorizado' }, 401);
    }

    let payload: WebhookPayload;
    try {
      payload = await req.json();
    } catch {
      return json({ error: 'Payload inválido' }, 400);
    }

    if (payload.type !== 'INSERT' || payload.table !== 'pedidos' || !payload.record) {
      return json({ error: 'Evento no soportado' }, 400);
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const emailTo = Deno.env.get('NOTIFY_EMAIL_TO');
    const emailFrom = Deno.env.get('NOTIFY_EMAIL_FROM');
    if (!resendApiKey || !emailTo || !emailFrom) {
      console.error('notify-pedido: faltan secrets (RESEND_API_KEY / NOTIFY_EMAIL_TO / NOTIFY_EMAIL_FROM)');
      return json({ error: 'Configuración incompleta' }, 500);
    }

    const pedido = payload.record;
    const respuesta = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailFrom,
        to: emailTo,
        subject: `🧁 Nueva consulta de ${pedido.nombre} — Marü Bakery`,
        html: armarHtml(pedido),
      }),
    });

    if (!respuesta.ok) {
      const detalle = await respuesta.text();
      console.error(`notify-pedido: Resend respondió ${respuesta.status}: ${detalle}`);
      return json({ error: 'No se pudo enviar el email' }, 500);
    }

    return json({ ok: true }, 200);
  } catch (error) {
    console.error('notify-pedido: error inesperado', error);
    return json({ error: 'Error interno' }, 500);
  }
});
