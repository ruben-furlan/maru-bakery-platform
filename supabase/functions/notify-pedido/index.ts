/// <reference path="./deno.d.ts" />
// =====================================================================
// Marü Bakery — Edge Function: notify-pedido
// Recibe el Database Webhook de INSERT en public.pedidos y envía emails
// vía Resend:
//   - Consulta simple (footer): notificación a la dueña.
//   - Pedido del carrito: resumen a la dueña + confirmación al cliente.
//
// Deploy:  npx supabase functions deploy notify-pedido --no-verify-jwt
// Secrets: RESEND_API_KEY, WEBHOOK_SECRET, NOTIFY_EMAIL_TO, NOTIFY_EMAIL_FROM
// =====================================================================

interface ItemPedido {
  nombre: string;
  precio: number;
  cantidad: number;
}

interface PedidoRecord {
  id: string;
  nombre: string;
  contacto: string;
  mensaje: string;
  producto: string | null;
  estado: string;
  creado_en: string;
  apellido: string | null;
  email: string | null;
  telefono: string | null;
  entrega: 'envio' | 'punto_encuentro' | null;
  direccion: string | null;
  pago: 'transferencia' | 'efectivo' | null;
  fecha_entrega: string | null;
  preferencias: string | null;
  items: ItemPedido[] | null;
  total: number | null;
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

/** Formatea una fecha tipo "2026-06-20" como "sábado, 20 de junio de 2026". */
function formatearDia(fecha: string): string {
  const dia = new Date(`${fecha}T12:00:00-03:00`);
  if (Number.isNaN(dia.getTime())) return fecha;
  return new Intl.DateTimeFormat('es-UY', { timeZone: 'America/Montevideo', dateStyle: 'full' }).format(dia);
}

function formatearPesos(monto: number): string {
  return `$ ${new Intl.NumberFormat('es-UY', { maximumFractionDigits: 0 }).format(monto)}`;
}

function fila(etiqueta: string, valor: string): string {
  return `<tr>
    <td style="padding:8px 0;color:#7C0F2A;font-weight:bold;vertical-align:top;width:140px;">${etiqueta}</td>
    <td style="padding:8px 0;color:#3d3d3d;line-height:1.5;">${valor}</td>
  </tr>`;
}

/** Marco común de los emails (header bordó + footer crema). */
function envolver(contenido: string): string {
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
              ${contenido}
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

/** Tabla con los productos del pedido y el total. */
function tablaItems(items: ItemPedido[], total: number | null): string {
  const filas = items
    .map(
      (item) => `<tr>
        <td style="padding:6px 0;color:#3d3d3d;">${escapeHtml(item.nombre)} × ${item.cantidad}</td>
        <td style="padding:6px 0;color:#3d3d3d;text-align:right;">${formatearPesos(item.precio * item.cantidad)}</td>
      </tr>`,
    )
    .join('');
  const filaTotal =
    total != null
      ? `<tr>
          <td style="padding:10px 0 0;color:#7C0F2A;font-weight:bold;border-top:1px solid #e6d4a8;">Total</td>
          <td style="padding:10px 0 0;color:#7C0F2A;font-weight:bold;text-align:right;border-top:1px solid #e6d4a8;">${formatearPesos(total)}</td>
        </tr>`
      : '';
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;margin:12px 0;">
    ${filas}
    ${filaTotal}
  </table>`;
}

/** Filas con los datos de entrega y pago del checkout. */
function filasCheckout(pedido: PedidoRecord): string {
  const entrega = pedido.entrega === 'envio' ? 'Envío a domicilio' : 'Punto de encuentro';
  return [
    fila('Entrega', escapeHtml(entrega)),
    pedido.direccion ? fila(pedido.entrega === 'envio' ? 'Dirección' : 'Punto', escapeHtml(pedido.direccion)) : '',
    fila('Pago', pedido.pago === 'transferencia' ? 'Transferencia' : 'Efectivo'),
    pedido.fecha_entrega ? fila('Día de entrega', escapeHtml(formatearDia(pedido.fecha_entrega))) : '',
    pedido.preferencias ? fila('Preferencias', escapeHtml(pedido.preferencias).replaceAll('\n', '<br>')) : '',
  ].join('');
}

/** Email para la dueña: nuevo pedido del carrito. */
function htmlPedidoDuena(pedido: PedidoRecord): string {
  const nombreCompleto = escapeHtml(`${pedido.nombre} ${pedido.apellido ?? ''}`.trim());
  return envolver(`
    <h1 style="margin:0 0 6px;color:#7C0F2A;font-size:20px;">🧺 ¡Nuevo pedido recibido!</h1>
    <p style="margin:0 0 20px;color:#6b6b6b;font-size:13px;">${formatearFecha(pedido.creado_en)}</p>
    ${tablaItems(pedido.items ?? [], pedido.total)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;border-top:1px solid #e6d4a8;">
      ${fila('Cliente', nombreCompleto)}
      ${fila('Email', escapeHtml(pedido.email ?? ''))}
      ${fila('Teléfono', escapeHtml(pedido.telefono ?? ''))}
      ${filasCheckout(pedido)}
    </table>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto 8px;">
      <tr>
        <td style="background-color:#7C0F2A;border-radius:8px;">
          <a href="${PANEL_URL}" style="display:inline-block;padding:12px 28px;color:#F2E3BC;font-size:15px;font-weight:bold;text-decoration:none;">Ver en el panel</a>
        </td>
      </tr>
    </table>
  `);
}

/** Email para el cliente: resumen y confirmación de su pedido. */
function htmlPedidoCliente(pedido: PedidoRecord): string {
  return envolver(`
    <h1 style="margin:0 0 6px;color:#7C0F2A;font-size:20px;">🎂 ¡Gracias por tu pedido, ${escapeHtml(pedido.nombre)}!</h1>
    <p style="margin:0 0 20px;color:#3d3d3d;font-size:15px;line-height:1.5;">
      Recibimos tu pedido y en breve nos ponemos en contacto para confirmarlo.
      Acá va el resumen:
    </p>
    ${tablaItems(pedido.items ?? [], pedido.total)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;border-top:1px solid #e6d4a8;">
      ${filasCheckout(pedido)}
    </table>
    <p style="margin:24px 0 0;color:#6b6b6b;font-size:13px;line-height:1.5;">
      Si querés cambiar algo del pedido, respondé este correo o escribinos por WhatsApp. 💛
    </p>
  `);
}

/** Email para la dueña: consulta simple del footer (comportamiento original). */
function htmlConsulta(pedido: PedidoRecord): string {
  const mensaje = escapeHtml(pedido.mensaje).replaceAll('\n', '<br>');
  return envolver(`
    <h1 style="margin:0 0 6px;color:#7C0F2A;font-size:20px;">🧁 Nueva consulta recibida</h1>
    <p style="margin:0 0 20px;color:#6b6b6b;font-size:13px;">${formatearFecha(pedido.creado_en)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;border-top:1px solid #e6d4a8;">
      ${fila('Nombre', escapeHtml(pedido.nombre))}
      ${fila('Contacto', escapeHtml(pedido.contacto))}
      ${pedido.producto ? fila('Producto', escapeHtml(pedido.producto)) : ''}
      ${fila('Mensaje', mensaje)}
    </table>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto 8px;">
      <tr>
        <td style="background-color:#7C0F2A;border-radius:8px;">
          <a href="${PANEL_URL}" style="display:inline-block;padding:12px 28px;color:#F2E3BC;font-size:15px;font-weight:bold;text-decoration:none;">Ver en el panel</a>
        </td>
      </tr>
    </table>
  `);
}

async function enviarEmail(
  apiKey: string,
  mensaje: { from: string; to: string; subject: string; html: string; reply_to?: string },
): Promise<boolean> {
  const respuesta = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(mensaje),
  });
  if (!respuesta.ok) {
    const detalle = await respuesta.text();
    console.error(`notify-pedido: Resend respondió ${respuesta.status}: ${detalle}`);
  }
  return respuesta.ok;
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
    const esPedidoCarrito = Array.isArray(pedido.items) && pedido.items.length > 0;

    if (!esPedidoCarrito) {
      const ok = await enviarEmail(resendApiKey, {
        from: emailFrom,
        to: emailTo,
        subject: `🧁 Nueva consulta de ${pedido.nombre} — Marü Bakery`,
        html: htmlConsulta(pedido),
      });
      return ok ? json({ ok: true }, 200) : json({ error: 'No se pudo enviar el email' }, 500);
    }

    // Pedido del carrito: aviso a la dueña + confirmación al cliente.
    const okDuena = await enviarEmail(resendApiKey, {
      from: emailFrom,
      to: emailTo,
      subject: `🧺 Nuevo pedido de ${pedido.nombre} ${pedido.apellido ?? ''} — Marü Bakery`.trim(),
      html: htmlPedidoDuena(pedido),
      reply_to: pedido.email ?? undefined,
    });

    let okCliente = true;
    if (pedido.email) {
      okCliente = await enviarEmail(resendApiKey, {
        from: emailFrom,
        to: pedido.email,
        subject: '🎂 Recibimos tu pedido — Marü Bakery',
        html: htmlPedidoCliente(pedido),
        reply_to: emailTo,
      });
    }

    if (!okDuena && !okCliente) {
      return json({ error: 'No se pudo enviar ningún email' }, 500);
    }
    return json({ ok: true, duena: okDuena, cliente: okCliente }, 200);
  } catch (error) {
    console.error('notify-pedido: error inesperado', error);
    return json({ error: 'Error interno' }, 500);
  }
});
