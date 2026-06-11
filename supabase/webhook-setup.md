# Webhook de pedidos → notify-pedido

Configura el Database Webhook que dispara la Edge Function `notify-pedido`
cada vez que llega una consulta nueva desde el formulario de la landing
(INSERT en `public.pedidos`).

> Prerrequisito: la función debe estar deployada y los secrets configurados.
> Ver la sección **Notificaciones por email** del [README](../README.md).

## Paso a paso (dashboard de Supabase)

1. Entrá al proyecto en [supabase.com](https://supabase.com) y andá a
   **Database → Webhooks**.
2. Si es la primera vez, habilitá los webhooks cuando el dashboard lo pida.
3. Click en **Create a new hook** y completá:

   | Campo | Valor |
   |---|---|
   | **Name** | `pedidos-notify` |
   | **Table** | `public.pedidos` |
   | **Events** | solo `INSERT` |
   | **Type** | HTTP Request |
   | **Method** | `POST` |
   | **URL** | `https://<PROJECT_REF>.supabase.co/functions/v1/notify-pedido` |

   Reemplazá `<PROJECT_REF>` por la referencia del proyecto
   (**Settings → General → Reference ID**).

4. En **HTTP Headers** agregá:

   | Header | Valor |
   |---|---|
   | `Authorization` | `Bearer <WEBHOOK_SECRET>` |
   | `Content-Type` | `application/json` |

   `<WEBHOOK_SECRET>` debe ser **exactamente el mismo valor** que el secret
   `WEBHOOK_SECRET` configurado en la función (generá uno largo y aleatorio,
   por ejemplo con `openssl rand -hex 32`).

5. Guardá con **Create webhook**.

## Verificación

Insertá una fila de prueba desde **SQL Editor**:

```sql
insert into public.pedidos (nombre, contacto, mensaje, producto)
values ('Prueba Webhook', '099 123 456', 'Mensaje de prueba del webhook.', 'Torta de chocolate intenso');
```

En menos de un minuto debería llegar el email a `NOTIFY_EMAIL_TO`.
Si no llega, revisá los logs en **Edge Functions → notify-pedido → Logs**.
