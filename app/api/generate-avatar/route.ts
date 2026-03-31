import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Profession prompts for chibi avatar generation
const PROFESSION_PROMPTS: Record<string, { vi: string; en: string }> = {
  phi: {
    vi: 'phi hành gia',
    en: 'astronaut with space helmet and white spacesuit',
  },
  hk: {
    vi: 'hiệp sĩ',
    en: 'knight with shining armor and sword',
  },
  it: {
    vi: 'nhân viên IT lập trình viên',
    en: 'IT programmer with laptop and glasses',
  },
}

const GENDER_PROMPTS: Record<string, string> = {
  nam: 'male boy',
  nu: 'female girl',
}

const LEVEL_DESCRIPTIONS: Record<number, string> = {
  1:   'beginner, simple outfit',
  5:   'novice, basic uniform',
  10:  'apprentice, standard uniform',
  15:  'intermediate, improved uniform with accessories',
  25:  'advanced, detailed uniform with badge',
  40:  'expert, elaborate uniform with special effects',
  55:  'master, impressive uniform with glowing effects',
  70:  'grandmaster, legendary uniform with aura',
  100: 'legendary, ultimate divine uniform with wings and halo',
}

export async function POST(request: Request) {
  try {
    const { gender, profession, level } = await request.json()

    if (!gender || !profession || !level) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const professionPrompt = PROFESSION_PROMPTS[profession]
    if (!professionPrompt) {
      return NextResponse.json({ error: 'Unknown profession' }, { status: 400 })
    }

    const genderPrompt = GENDER_PROMPTS[gender] || 'character'
    const levelDesc = LEVEL_DESCRIPTIONS[level] || 'standard uniform'

    // Check if already cached in Cloudinary
    const publicId = `family-tasks/avatars/${gender}_${profession}_level${level}`
    try {
      const existing = await cloudinary.api.resource(publicId)
      if (existing?.secure_url) {
        return NextResponse.json({ url: existing.secure_url, cached: true })
      }
    } catch {
      // Not cached, proceed to generate
    }

    // Generate with Gemini
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 })
    }

    const prompt = `Create a cute chibi anime style avatar of a ${genderPrompt} ${professionPrompt.en}. 
Style: chibi, kawaii, colorful, cartoon, game character, full body, white background.
Level: ${levelDesc}.
The character should look friendly and playful, suitable for a family task management app for kids.
No text, no watermark, clean white background.`

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
        }),
      }
    )

    if (!geminiRes.ok) {
      const err = await geminiRes.json()
      console.error('Gemini error:', err)
      return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 })
    }

    const geminiData = await geminiRes.json()
    const imagePart = geminiData?.candidates?.[0]?.content?.parts?.find(
      (p: any) => p.inlineData?.mimeType?.startsWith('image/')
    )

    if (!imagePart?.inlineData?.data) {
      return NextResponse.json({ error: 'No image in response' }, { status: 500 })
    }

    // Upload to Cloudinary
    const uploadRes = await cloudinary.uploader.upload(
      `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
      {
        public_id: publicId,
        overwrite: false,
        folder: '',
      }
    )

    return NextResponse.json({ url: uploadRes.secure_url, cached: false })
  } catch (err: any) {
    console.error('generate-avatar error:', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
