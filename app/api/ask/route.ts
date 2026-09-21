import { experimental_evaluate as evaluate } from "ai"

type AskRequest = {
  localTime?: string
  dayOfWeek?: string
  hour?: number
  timezone?: string
  beersToday?: number
  situation?: string
  obligationsDone?: boolean
}

const fallbackDecision = (input: Required<Pick<AskRequest, "hour" | "beersToday" | "obligationsDone">> & Pick<AskRequest, "situation">) => {
  const isLate = input.hour >= 22 || input.hour < 11
  const soundsSocial = /party|friends|dinner|home|chill/i.test(input.situation || "")
  const yes = input.obligationsDone && input.beersToday < 3 && !isLate && (soundsSocial || input.beersToday === 0)

  return { shouldHaveAnotherBeer: yes, probability: yes ? 0.7 : 0.78, demo: true }
}

export async function POST(request: Request) {
  let input: AskRequest

  try {
    input = (await request.json()) as AskRequest
  } catch {
    return Response.json({ error: "Jev couldn’t read that context." }, { status: 400 })
  }

  const hour = typeof input.hour === "number" && Number.isFinite(input.hour) ? Math.max(0, Math.min(23, input.hour)) : 12
  const beersToday = typeof input.beersToday === "number" && Number.isFinite(input.beersToday) ? Math.max(0, Math.min(20, Math.round(input.beersToday))) : 0
  const situation = typeof input.situation === "string" ? input.situation.trim().slice(0, 240) : "No specific situation provided."
  const obligationsDone = input.obligationsDone !== false

  if (!process.env.AI_GATEWAY_API_KEY) {
    return Response.json(fallbackDecision({ hour, beersToday, obligationsDone, situation }))
  }

  const state = [
    `The user’s local time is ${input.localTime || "unknown"} on a ${input.dayOfWeek || "unknown day"}.`,
    `The user had ${beersToday} beer${beersToday === 1 ? "" : "s"} so far today.`,
    `The user situation is: ${situation}`,
    `The user ${obligationsDone ? "has no obligations left for today" : "still has some obligations left for today"}.`,
    `The user's timezone is ${input.timezone || "unknown"}.`,
  ].join("\n")

  try {
    const result = await evaluate({
      model: "typesafe-ai/jev",
      state,
      questions: {
        shouldHaveAnotherBeer: {
          type: "boolean",
          instructions: "Should the user have a/another beer? Consider the time, amount already consumed, situation, and remaining obligations. Favor a responsible answer when the context is unclear or alcohol consumption is already high.",
        },
      },
    })

    const probability = result.answers.shouldHaveAnotherBeer.probability

    return Response.json({ shouldHaveAnotherBeer: probability >= 0.5, probability, demo: false })
  } catch (error) {
    console.error("Jev evaluation failed", error)
    return Response.json({ error: "Jev is taking a quick break. Check your gateway key and try again." }, { status: 502 })
  }
}
