import { experimental_evaluate as evaluate } from "ai"

import { buildJevState, type JevContextInput } from "@/lib/jev-context"

type AskRequest = JevContextInput

export async function POST(request: Request) {
  let input: AskRequest

  try {
    input = (await request.json()) as AskRequest
  } catch {
    return Response.json({ error: "Jev couldn’t read that context. Please try again." }, { status: 400 })
  }

  const hasGatewayAuth = Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN)

  if (!hasGatewayAuth) {
    return Response.json({ error: "Jev isn’t connected yet. Add an AI Gateway key or Vercel OIDC token, then try again." }, { status: 503 })
  }

  const state = buildJevState(input)

  try {
    const result = await evaluate({
      model: "typesafe-ai/jev",
      state,
      questions: {
        shouldHaveAnotherBeer: {
          type: "boolean",
          instructions: "Should the user have a/another beer? Consider the time, amount already consumed, situation, tomorrow's outlook, and the user's stated desire. Favor a responsible answer when the context is unclear or alcohol consumption is already high.",
        },
      },
    })

    const probability = result.answers.shouldHaveAnotherBeer.probability

    return Response.json({ shouldHaveAnotherBeer: probability >= 0.5, probability })
  } catch (error) {
    console.error("Jev evaluation failed", error)
    return Response.json({ error: "Jev couldn’t reach the beer desk right now. Please try again in a moment." }, { status: 502 })
  }
}
