export const DESIRE_OPTIONS = ["No", "Kinda", "Yes", "I am so ready", "One Million beers please"] as const

export type JevContextInput = {
  localTime?: string
  dayOfWeek?: string
  hour?: number
  timezone?: string
  beersToday?: number
  situation?: string
  tomorrowOutlook?: string
  desireLevel?: number
}

function normalizeJevContext(input: JevContextInput) {
  const desireLevel = typeof input.desireLevel === "number" && Number.isFinite(input.desireLevel)
    ? Math.max(0, Math.min(DESIRE_OPTIONS.length - 1, Math.round(input.desireLevel)))
    : 2

  return {
    localTime: input.localTime || "unknown",
    dayOfWeek: input.dayOfWeek || "unknown day",
    timezone: input.timezone || "unknown",
    beersToday: typeof input.beersToday === "number" && Number.isFinite(input.beersToday)
      ? Math.max(0, Math.min(20, Math.round(input.beersToday)))
      : 0,
    situation: typeof input.situation === "string" ? input.situation.trim().slice(0, 240) || "No specific situation provided." : "No specific situation provided.",
    tomorrowOutlook: typeof input.tomorrowOutlook === "string" ? input.tomorrowOutlook.trim().slice(0, 80) || "Normal day" : "Normal day",
    desire: DESIRE_OPTIONS[desireLevel],
  }
}

export function buildJevState(input: JevContextInput) {
  const context = normalizeJevContext(input)

  return [
    `The user’s local time is ${context.localTime} on a ${context.dayOfWeek}.`,
    `The user had ${context.beersToday} beer${context.beersToday === 1 ? "" : "s"} so far today.`,
    `The user situation is: ${context.situation}`,
    `Tomorrow is looking like: ${context.tomorrowOutlook}.`,
    `The user says they want another beer: ${context.desire}. Treat this as a mood signal, not a reason to ignore responsible drinking context.`,
    `The user's timezone is ${context.timezone}.`,
  ].join("\n")
}
