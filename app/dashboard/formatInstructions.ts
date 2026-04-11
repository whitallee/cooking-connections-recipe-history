'use server'

import OpenAI from 'openai'

export async function formatInstructions(
  instructions: string
): Promise<{ result?: string; error?: string }> {
  if (!instructions.trim()) return { error: 'No instructions to format.' }

  const openai = new OpenAI()
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are a recipe editor. Reformat the provided recipe instructions as a clean numbered list — one step per line, e.g. "1. Preheat oven to 375°F.". Preserve all the original content and meaning exactly; only improve the structure and clarity. Return only the formatted instructions with no preamble, explanation, or extra commentary.',
      },
      { role: 'user', content: instructions },
    ],
    max_tokens: 1000,
  })

  const result = response.choices[0].message.content
  if (!result) return { error: 'Could not format instructions. Please try again.' }

  return { result }
}
