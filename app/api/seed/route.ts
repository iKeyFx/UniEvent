import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Only allowed in development
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Seed disabled in production' }, { status: 403 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ''

  const supabase = createClient(supabaseUrl, supabaseKey)

  const log: string[] = []

  // ── 1. Create demo organiser ─────────────────────────────────────
  const orgEmail = 'organiser@uni.edu'
  const orgPassword = 'password123'
  const orgName = 'Dr. Fatima Bello'

  const { data: orgSignUp, error: orgSignUpErr } = await supabase.auth.signUp({
    email: orgEmail,
    password: orgPassword,
    options: { data: { name: orgName, role: 'organiser' } },
  })

  let organiserId: string

  if (orgSignUpErr && orgSignUpErr.message.includes('already registered')) {
    // Already exists — sign in instead
    const { data: orgSignIn, error: orgSignInErr } = await supabase.auth.signInWithPassword({
      email: orgEmail,
      password: orgPassword,
    })
    if (orgSignInErr || !orgSignIn.user) {
      return NextResponse.json({ error: 'Could not sign in as organiser: ' + orgSignInErr?.message }, { status: 500 })
    }
    organiserId = orgSignIn.user.id
    log.push(`Organiser already exists (${organiserId}) — signed in`)
  } else if (orgSignUpErr) {
    return NextResponse.json({ error: 'Organiser sign-up failed: ' + orgSignUpErr.message }, { status: 500 })
  } else {
    organiserId = orgSignUp.user!.id
    log.push(`Created organiser account: ${orgEmail} (${organiserId})`)
  }

  // ── 2. Create demo student ──────────────────────────────────────
  const stuEmail = 'student@uni.edu'
  const stuPassword = 'password123'
  const stuName = 'Alex Okafor'

  const { error: stuErr } = await supabase.auth.signUp({
    email: stuEmail,
    password: stuPassword,
    options: { data: { name: stuName, role: 'student' } },
  })

  if (stuErr && !stuErr.message.includes('already registered')) {
    return NextResponse.json({ error: 'Student sign-up failed: ' + stuErr.message }, { status: 500 })
  }
  log.push(stuErr ? `Student already exists (${stuEmail})` : `Created student account: ${stuEmail}`)

  // ── 3. Sign in as organiser so RLS allows event inserts ─────────
  const { data: session, error: sessionErr } = await supabase.auth.signInWithPassword({
    email: orgEmail,
    password: orgPassword,
  })
  if (sessionErr || !session.user) {
    return NextResponse.json({ error: 'Could not get organiser session' }, { status: 500 })
  }

  // ── 4. Check for existing events ────────────────────────────────
  const { data: existing } = await supabase.from('events').select('id')
  if (existing && existing.length > 0) {
    log.push(`Skipping events — ${existing.length} already exist`)
    return NextResponse.json({ ok: true, log, message: 'Seed already applied' })
  }

  // ── 5. Insert events ────────────────────────────────────────────
  const events = [
    {
      title: 'Tech Career Fair 2026',
      description: 'Meet over 30 top tech companies recruiting for internships and graduate roles. Bring your CV and dress professionally.',
      date: '2026-06-10', time: '10:00', location: 'Main Hall, Block A',
      category: 'career', capacity: 200,
      organiser_name: orgName, organiser_id: organiserId,
    },
    {
      title: 'Python for Data Science Workshop',
      description: 'Hands-on workshop covering NumPy, Pandas, and Matplotlib. Laptops required. All skill levels welcome.',
      date: '2026-06-15', time: '14:00', location: 'Lab 204, IT Building',
      category: 'workshop', capacity: 30,
      organiser_name: 'CS Society', organiser_id: organiserId,
    },
    {
      title: 'End of Term Social Night',
      description: 'Celebrate the end of semester with music, food, and friends. Free entry for all registered students.',
      date: '2026-06-20', time: '19:00', location: 'Student Union Hall',
      category: 'social', capacity: 150,
      organiser_name: 'Student Union', organiser_id: organiserId,
    },
    {
      title: 'Research Methods Seminar',
      description: 'Postgrad seminar on qualitative and quantitative research methods. Dr. Adeyemi presenting on mixed-methods approaches.',
      date: '2026-06-08', time: '11:00', location: 'Lecture Theatre 3',
      category: 'academic', capacity: 80,
      organiser_name: 'Research Office', organiser_id: organiserId,
    },
    {
      title: 'Entrepreneurship Bootcamp',
      description: 'Two-day intensive bootcamp on startup ideation, business models, and pitching. Limited places available.',
      date: '2026-07-02', time: '09:00', location: 'Innovation Hub',
      category: 'workshop', capacity: 25,
      organiser_name: 'Business School', organiser_id: organiserId,
    },
    {
      title: 'Diversity & Inclusion Forum',
      description: 'Panel discussion with staff and student representatives on building a more inclusive campus community.',
      date: '2026-06-25', time: '13:00', location: 'Conference Room B',
      category: 'academic', capacity: 60,
      organiser_name: 'Equality Office', organiser_id: organiserId,
    },
  ]

  const { error: insertErr } = await supabase.from('events').insert(events)
  if (insertErr) {
    return NextResponse.json({ error: 'Event insert failed: ' + insertErr.message }, { status: 500 })
  }
  log.push(`Inserted ${events.length} events`)

  return NextResponse.json({ ok: true, log })
}
