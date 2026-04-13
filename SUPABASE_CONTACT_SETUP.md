# Supabase Contact Setup (Dedicated Project)

Use a dedicated Supabase project for contact leads from `DevTech` and `new_portfolio`.

## 1) Create table

Run in SQL Editor:

```sql
create table if not exists public.contact_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  subject text not null,
  message text not null,
  source text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_leads enable row level security;

create policy "insert_contact_leads_anon"
on public.contact_leads
for insert
to anon
with check (true);
```

## 2) Deploy Edge Function `contact-lead`

```ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

type Payload = {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  source?: string;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const body = (await req.json()) as Payload;

    const required = [body.name, body.email, body.phone, body.subject, body.message, body.source].every(
      (value) => typeof value === "string" && value.trim().length > 0,
    );

    if (!required) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const client = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { error } = await client.from("contact_leads").insert({
      name: body.name,
      email: body.email,
      phone: body.phone,
      subject: body.subject,
      message: body.message,
      source: body.source,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
```

## 3) Configure env in both apps

Use the same values in:

- `DevTech/.env`
- `new_portfolio/.env`

```bash
VITE_CONTACT_EMAIL=you@domain.com
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxx
VITE_SUPABASE_CONTACT_FUNCTION=contact-lead
```

Notes:

- Frontend tries Supabase first.
- If Supabase is unavailable, it falls back to FormSubmit.
