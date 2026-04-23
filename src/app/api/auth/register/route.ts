import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { email, password, fullName, role, phone } = await request.json()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role, phone }
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  await supabase.from("profiles").upsert({
    id: data.user.id,
    email,
    full_name: fullName,
    role,
    phone,
    active: true,
  })

  return NextResponse.json({ success: true })
}
