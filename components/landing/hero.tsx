import { PrimaryButton, SecondaryButton } from "./cta-buttons";
import { BoardMockup } from "./board-mockup";

export function Hero() {
  return (
    <section id="product" className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
      <div className="pointer-events-none absolute inset-0 hero-glow" />

      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-accent-purple/30 bg-accent-purple/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-accent-purple-light">
            <span aria-hidden="true">✦</span>
            AI-Powered Task Intelligence
          </div>

          <h1 className="text-5xl font-bold leading-[1.1] tracking-tight md:text-7xl lg:text-[5.5rem]">
            Turn Big Goals
            <br />
            <span className="gradient-text">Into Actions.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
            Blueprint uses AI to break complex projects into tasks, assign them to
            your team, and keep everyone aligned — automatically.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <PrimaryButton href="/app" showArrow className="px-7 py-3.5">
              Start for free
            </PrimaryButton>
            <SecondaryButton href="#how-it-works">See how it works</SecondaryButton>
          </div>
        </div>

        <div className="relative mt-16 md:mt-20">
          <BoardMockup />
        </div>
      </div>
    </section>
  );
}
