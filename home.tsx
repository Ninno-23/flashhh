import { ArrowRight, Flame } from "lucide-react";
import { LIBRARY } from "@/lib/study/library";
import { mastery, packKey, streakCount, trackRollup } from "@/lib/study/progress";
import { useStudy } from "@/lib/study/store";
import { materializeKit } from "@/lib/study/types";

function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function HomeView() {
  const progress = useStudy((state) => state.progress);
  const decks = useStudy((state) => state.decks);
  const studiedDays = useStudy((state) => state.studiedDays);
  const setView = useStudy((state) => state.setView);
  const streak = streakCount(studiedDays);

  const opened = LIBRARY.map((pack) => ({
    pack,
    at: progress[packKey(pack.id)]?.lastOpened ?? 0,
    ratio: mastery(pack.kit.flashcards.length, progress[packKey(pack.id)]),
  }))
    .filter((item) => item.at > 0)
    .sort((a, b) => b.at - a.at);

  const continuePack = opened[0];
  const due = LIBRARY.map((pack) => {
    const kit = materializeKit(pack.kit);
    const known = new Set(progress[packKey(pack.id)]?.known ?? []);
    const left = kit.flashcards.filter((card) => !known.has(card.id)).length;
    return { pack, left, ratio: mastery(kit.flashcards.length, progress[packKey(pack.id)]) };
  })
    .filter((item) => item.ratio > 0 && item.left > 0)
    .sort((a, b) => b.left - a.left);

  const nextDue = due[0];

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-6 sm:py-8">
        <header>
          <p className="text-sm font-medium text-accent">Study desk</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Pick up where the notes left off.</h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">
            Read a guide, flip the cards, then take the quiz. Drop a photo, PDF, or Word file in Tutor when the notes
            are yours.
          </p>
          {streak > 0 ? (
            <p className="mt-4 inline-flex h-9 items-center gap-2 rounded-full bg-paper px-3 text-sm">
              <Flame className="size-4 text-accent" />
              <span className="tabular-nums font-medium">{streak}</span>
              <span className="text-muted">{streak === 1 ? "day streak" : "day streak"}</span>
            </p>
          ) : null}
        </header>

        {continuePack ? (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Continue</h2>
            <button
              type="button"
              onClick={() => setView({ kind: "lesson", packId: continuePack.pack.id })}
              className="mt-3 flex w-full items-center gap-4 rounded-3xl border border-line bg-canvas p-4 text-left hover:bg-paper"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                  {continuePack.pack.track} · {continuePack.pack.level}
                </p>
                <p className="mt-1 text-lg font-semibold">{continuePack.pack.title}</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-bubble">
                  <div className="h-full rounded-full bg-accent" style={{ width: percent(continuePack.ratio) }} />
                </div>
                <p className="mt-2 text-sm text-muted tabular-nums">{percent(continuePack.ratio)} learned</p>
              </div>
              <ArrowRight className="size-5 shrink-0 text-muted" />
            </button>
          </section>
        ) : null}

        <section className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() =>
              nextDue
                ? setView({ kind: "cards", ref: { type: "pack", id: nextDue.pack.id } })
                : setView({ kind: "guides" })
            }
            className="rounded-3xl bg-ink p-5 text-left text-canvas"
          >
            <p className="text-sm text-canvas/70">Practice</p>
            <p className="mt-2 text-xl font-semibold">{nextDue ? `${nextDue.left} cards still open` : "Start a guide"}</p>
            <p className="mt-2 text-sm text-canvas/70">
              {nextDue ? nextDue.pack.title : "Python and AWS sets are ready to study."}
            </p>
          </button>
          <button
            type="button"
            onClick={() => setView({ kind: "tutor" })}
            className="rounded-3xl border border-line bg-paper p-5 text-left"
          >
            <p className="text-sm text-muted">Tutor</p>
            <p className="mt-2 text-xl font-semibold">Ask about a file</p>
            <p className="mt-2 text-sm text-muted">Photos, PDFs, and Word notes become a set you can save.</p>
          </button>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Tracks</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {(["Python", "AWS"] as const).map((track) => {
              const count = LIBRARY.filter((pack) => pack.track === track).length;
              const ratio = trackRollup(track, progress);
              return (
                <button
                  key={track}
                  type="button"
                  onClick={() => setView({ kind: "guides" })}
                  className="rounded-3xl border border-line p-4 text-left hover:bg-paper"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-lg font-semibold">{track}</p>
                    <p className="text-sm text-muted tabular-nums">{percent(ratio)}</p>
                  </div>
                  <p className="mt-1 text-sm text-muted">{count} lessons</p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-bubble">
                    <div className="h-full rounded-full bg-accent" style={{ width: percent(ratio) }} />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Your sets</h2>
            <button type="button" className="text-sm font-medium text-accent" onClick={() => setView({ kind: "practice" })}>
              Practice
            </button>
          </div>
          {decks.length === 0 ? (
            <p className="mt-3 rounded-3xl border border-dashed border-line px-4 py-6 text-sm leading-relaxed text-muted">
              Nothing saved yet. In Tutor, turn a file into flashcards and save the set.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {decks.slice(0, 4).map((deck) => (
                <li key={deck.id}>
                  <button
                    type="button"
                    onClick={() => setView({ kind: "cards", ref: { type: "deck", id: deck.id } })}
                    className="flex h-14 w-full items-center justify-between gap-3 rounded-2xl border border-line px-4 text-left hover:bg-paper"
                  >
                    <span className="truncate font-medium">{deck.title}</span>
                    <span className="shrink-0 text-sm text-muted tabular-nums">{deck.kit.flashcards.length} cards</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
