import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { code } = await request.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false }, { status: 400 })
    }

    // SUPER_ROOT_CODE is server-side only (no NEXT_PUBLIC_ prefix)
    const superRootCode = process.env.SUPER_ROOT_CODE || 'SUPERADMIN2024'

    const isValid = code.trim() === superRootCode

    return NextResponse.json({ valid: isValid })
  } catch {
    return NextResponse.json({ valid: false }, { status: 500 })
  }
}
