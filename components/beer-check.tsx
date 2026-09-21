"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowRight, Check, Clock3, Minus, Plus, RotateCcw, Sparkles, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

const SITUATION_PRESETS = [
  "I am at a party",
  "Chilling home alone",
  "I am at work",
  "Hanging out with friends",
  "Out for dinner",
]

type Decision = {
  shouldHaveAnotherBeer: boolean
  probability: number
  demo: boolean
}

function getLocalContext() {
  const now = new Date()

  return {
    localTime: new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(now),
    dayOfWeek: new Intl.DateTimeFormat(undefined, { weekday: "long" }).format(now),
    hour: now.getHours(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }
}

export default function BeerCheck() {
  const [beersToday, setBeersToday] = useState(0)
  const [situation, setSituation] = useState("")
  const [obligationsDone, setObligationsDone] = useState(true)
  const [localContext, setLocalContext] = useState({
    localTime: "your local time",
    dayOfWeek: "today",
    hour: 12,
    timezone: "local time",
  })
  const [decision, setDecision] = useState<Decision | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const answerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setLocalContext(getLocalContext()))

    return () => window.cancelAnimationFrame(frame)
  }, [])

  const askJev = async () => {
    const context = getLocalContext()
    const currentSituation = situation.trim() || "No specific situation provided."

    setLocalContext(context)
    setIsLoading(true)
    setDecision(null)
    setError("")

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...context,
          beersToday,
          situation: currentSituation,
          obligationsDone,
        }),
      })

      const payload = (await response.json()) as Decision & { error?: string }

      if (!response.ok) {
        throw new Error(payload.error || "Jev is taking a quick break. Try again in a moment.")
      }

      setDecision(payload)
      window.setTimeout(() => answerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Something went wrong. Try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const beerLabel = beersToday === 1 ? "beer" : "beers"

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#f4eadf] px-4 py-5 text-[#311b1b] sm:px-6 sm:py-8 lg:px-10">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-8 -z-10 size-72 rounded-full bg-[#f7c85f]/35 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 bottom-0 -z-10 size-96 rounded-full bg-[#d98781]/25 blur-3xl" />

      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-6xl flex-col sm:min-h-[calc(100vh-4rem)]">
        <header className="flex items-center justify-between px-1 pb-5 sm:px-3 sm:pb-7">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-[#65182b] text-lg shadow-[0_5px_0_#3f0e1a]">🍺</div>
            <div>
              <p className="font-heading text-[15px] font-bold tracking-[0.12em] text-[#65182b]">BEER JEV</p>
              <p className="text-[11px] font-medium tracking-wide text-[#927d73]">a tiny second opinion</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-xs font-semibold text-[#927d73] sm:flex">
            <span className="size-2 rounded-full bg-[#65a67b] shadow-[0_0_0_4px_#65a67b1f]" />
            <span>Jev is online</span>
          </div>
        </header>

        <section className="grid flex-1 overflow-hidden rounded-[28px] border border-[#e6d8cc] bg-[#fffaf5] shadow-[0_24px_70px_rgba(91,45,37,0.16)] lg:grid-cols-[1.08fr_0.92fr]">
          <div className="relative flex min-h-[620px] flex-col overflow-hidden bg-[#65182b] px-6 py-7 text-[#fff8ee] sm:px-10 sm:py-10 lg:min-h-0 lg:px-12 lg:py-11">
            <div aria-hidden="true" className="absolute -right-24 -top-28 size-80 rounded-full border-[38px] border-[#f6bd4b]/15" />
            <div aria-hidden="true" className="absolute bottom-[-5rem] left-[-4rem] size-52 rounded-full border-[26px] border-[#d98781]/10" />

            <div className="relative flex items-center justify-between">
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#f7c85f]">
                the only question that matters
              </span>
              <span className="font-heading text-2xl font-black tracking-[-0.1em] text-white/80">JEV<span className="text-[#f7c85f]">.</span></span>
            </div>

            <div className="relative mt-auto pt-16 lg:pt-12">
              <p className="mb-4 text-sm font-medium text-[#f7c85f]">Let&apos;s consult the expert.</p>
              <h1 className="max-w-xl font-heading text-[clamp(3rem,6.2vw,5.8rem)] font-black leading-[0.92] tracking-[-0.075em] text-balance">
                Should I have a<span className="text-[#f7c85f]">(nother)</span> beer?
              </h1>
              <p className="mt-6 max-w-md text-base leading-7 text-[#f9e8db]/75 sm:text-lg">
                Give Jev the context. He&apos;ll make the call. No judgment, just a tiny bit of very specific wisdom.
              </p>
            </div>

            <div ref={answerRef} aria-live="polite" className="relative mt-9 min-h-[174px]">
              {isLoading ? (
                <div className="flex h-full min-h-[174px] items-center gap-4 rounded-2xl border border-white/15 bg-white/10 px-5 py-5">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#f7c85f] text-[#65182b]">
                    <Sparkles className="size-5 animate-pulse" />
                  </span>
                  <div>
                    <p className="font-heading text-lg font-bold">Jev is thinking...</p>
                    <p className="mt-1 text-sm text-[#f9e8db]/65">Balancing the facts, vibes, and your beer math.</p>
                  </div>
                </div>
              ) : decision ? (
                <div className="relative overflow-hidden rounded-2xl bg-[#fff8ee] px-5 py-5 text-[#311b1b] shadow-[0_13px_30px_rgba(38,8,18,0.18)] sm:px-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9b6e5e]">Jev&apos;s verdict</p>
                      <p className="mt-1 font-heading text-3xl font-black tracking-[-0.05em] text-[#65182b] sm:text-4xl">
                        {decision.shouldHaveAnotherBeer ? "One more sounds okay." : "Call it here."}
                      </p>
                    </div>
                    <span className={`grid size-10 shrink-0 place-items-center rounded-full ${decision.shouldHaveAnotherBeer ? "bg-[#d8edce] text-[#346744]" : "bg-[#f4d5ce] text-[#a2443a]"}`}>
                      {decision.shouldHaveAnotherBeer ? <Check className="size-5" strokeWidth={3} /> : <X className="size-5" strokeWidth={3} />}
                    </span>
                  </div>
                  <p className="mt-4 max-w-lg text-sm leading-6 text-[#6d5550]">
                    {decision.shouldHaveAnotherBeer
                      ? "Enjoy it slowly, keep some water close, and let this be a good one."
                      : "Future-you has entered the chat. Water, snack, and a graceful exit sound pretty good right now."}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-[#eadcd0] pt-3 text-[11px] font-semibold text-[#9b8178]">
                    <span>{decision.demo ? "Demo mode · add an API key for live Jev" : "Live answer from Jev"}</span>
                    <span>{Math.round(decision.probability * 100)}% yes</span>
                  </div>
                </div>
              ) : error ? (
                <div className="flex min-h-[174px] flex-col justify-between rounded-2xl border border-[#f4c1b5] bg-[#fff8ee] px-5 py-5 text-[#65182b]">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#a2443a]">A small hiccup</p>
                    <p className="mt-2 text-sm leading-6">{error}</p>
                  </div>
                  <Button type="button" variant="link" className="h-auto justify-start gap-2 p-0 text-[#65182b]" onClick={askJev}>
                    <RotateCcw className="size-3.5" /> Try again
                  </Button>
                </div>
              ) : (
                <div className="flex min-h-[174px] flex-col justify-between rounded-2xl border border-dashed border-white/20 bg-white/[0.07] px-5 py-5">
                  <div className="flex items-center gap-3 text-[#f9e8db]/70">
                    <span className="grid size-10 place-items-center rounded-xl border border-white/15 bg-white/10 text-xl">?</span>
                    <span className="text-sm leading-5">Your verdict will land here.<br /><span className="text-[#f9e8db]/45">No pressure. Just ask.</span></span>
                  </div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#f9e8db]/40">Powered by TypeSafe AI · Jev</p>
                </div>
              )}
            </div>

            <div className="relative mt-6">
              <Button
                type="button"
                size="lg"
                className="h-14 w-full justify-between rounded-2xl bg-[#f7c85f] px-5 text-base font-bold text-[#4c1120] shadow-[0_5px_0_#b77a2b] hover:bg-[#ffd477] active:translate-y-0.5 active:shadow-[0_2px_0_#b77a2b]"
                onClick={askJev}
                disabled={isLoading}
              >
                <span className="flex items-center gap-2.5">
                  {isLoading ? <Sparkles className="size-5 animate-pulse" /> : decision ? <RotateCcw className="size-5" /> : <Sparkles className="size-5" />}
                  {isLoading ? "Asking Jev..." : decision ? "Ask again" : "Ask Jev"}
                </span>
                <ArrowRight className="size-5" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col bg-[#fffaf5] px-6 py-7 sm:px-10 sm:py-10 lg:px-11 lg:py-11">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#ae8c78]">Your context</p>
                <h2 className="mt-2 font-heading text-2xl font-black tracking-[-0.045em] text-[#4c2427] sm:text-3xl">Give Jev the facts.</h2>
              </div>
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f6e1d3] text-xl">📝</div>
            </div>

            <div className="mt-8 space-y-7">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#eadcd0] bg-[#fffdfb] p-4">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#ae8c78]"><Clock3 className="size-3.5" /> Local time</div>
                  <p className="mt-2 font-heading text-2xl font-black tracking-[-0.05em] text-[#65182b]">{localContext.localTime}</p>
                  <p className="mt-0.5 text-xs font-medium text-[#9b8178]">{localContext.dayOfWeek} · {localContext.timezone}</p>
                </div>

                <div className="rounded-2xl border border-[#eadcd0] bg-[#fffdfb] p-4">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.14em] text-[#ae8c78]"><span>Beers today</span><span className="text-[#c08b39]">{beersToday === 0 ? "fresh start" : beersToday === 1 ? "just one" : "keep count"}</span></div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="font-heading text-2xl font-black tracking-[-0.05em] text-[#65182b]">{beersToday} <span className="text-base font-bold tracking-normal text-[#9b8178]">{beerLabel}</span></p>
                    <div className="flex gap-1.5">
                      <Button type="button" variant="outline" size="icon-sm" className="rounded-xl border-[#eadcd0] text-[#65182b] hover:bg-[#f6e1d3]" onClick={() => setBeersToday((count) => Math.max(0, count - 1))} aria-label="Remove a beer"><Minus /></Button>
                      <Button type="button" variant="outline" size="icon-sm" className="rounded-xl border-[#eadcd0] text-[#65182b] hover:bg-[#f6e1d3]" onClick={() => setBeersToday((count) => Math.min(20, count + 1))} aria-label="Add a beer"><Plus /></Button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="situation" className="mb-2.5 block text-sm font-bold text-[#4c2427]">What&apos;s the situation?</label>
                <Textarea id="situation" value={situation} onChange={(event) => setSituation(event.target.value)} placeholder="Tell Jev what&apos;s going on..." className="min-h-20 rounded-2xl border-[#eadcd0] bg-[#fffdfb] px-4 py-3 text-sm leading-6 text-[#4c2427] shadow-none placeholder:text-[#b9a198] focus-visible:border-[#c08b39] focus-visible:ring-[#c08b39]/20" maxLength={240} />
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {SITUATION_PRESETS.map((preset) => (
                    <Button key={preset} type="button" variant="outline" size="sm" className={`h-8 rounded-full border-[#eadcd0] px-3 text-xs font-semibold text-[#80655e] hover:border-[#d4aa64] hover:bg-[#fff4df] hover:text-[#65182b] ${situation === preset ? "border-[#c08b39] bg-[#fff4df] text-[#65182b]" : "bg-transparent"}`} onClick={() => setSituation((current) => current === preset ? "" : preset)}>{preset}</Button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2.5 text-sm font-bold text-[#4c2427]">Anything important left today?</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button type="button" variant="outline" className={`h-auto min-h-11 justify-start rounded-xl border-[#eadcd0] px-3 text-left text-xs font-semibold leading-4 text-[#80655e] hover:bg-[#fff4df] hover:text-[#65182b] ${obligationsDone ? "border-[#8fba8e] bg-[#edf7ea] text-[#346744] hover:bg-[#edf7ea]" : "bg-transparent"}`} onClick={() => setObligationsDone(true)}><Check className="size-4" /> Nope, I&apos;m clear</Button>
                  <Button type="button" variant="outline" className={`h-auto min-h-11 justify-start rounded-xl border-[#eadcd0] px-3 text-left text-xs font-semibold leading-4 text-[#80655e] hover:bg-[#fff4df] hover:text-[#65182b] ${!obligationsDone ? "border-[#d4aa64] bg-[#fff4df] text-[#8c5c1d] hover:bg-[#fff4df]" : "bg-transparent"}`} onClick={() => setObligationsDone(false)}><Clock3 className="size-4" /> Yeah, a few things</Button>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-8"><div className="rounded-2xl bg-[#f8eee6] px-4 py-3.5 text-xs leading-5 text-[#8f756c]"><span className="font-bold text-[#65182b]">Jev only sees what you share.</span> Your context stays in this tiny moment—no account, no scorekeeping beyond today.</div></div>
          </div>
        </section>

        <footer className="flex items-center justify-between px-1 pt-4 text-[11px] font-medium text-[#a58d82] sm:px-3 sm:pt-5"><span>Make good choices. Drink water.</span><span className="hidden sm:inline">Not medical advice · Just a vibe check</span></footer>
      </div>
    </main>
  )
}
