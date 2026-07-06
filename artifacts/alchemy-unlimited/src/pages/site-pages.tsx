import { useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/lenses", label: "Lenses" },
  { href: "/works", label: "Works" },
  { href: "/contact", label: "Contact" },
];

const NOTE_COPY = {
  about:
    "Use this page to test whether Alchemy feels like an assembly of people before it feels like a studio.",
  lenses:
    "These are perspectives, not services. The titles should invite interpretation while staying concrete.",
  works:
    "Keep the portfolio lightweight for now. Polish and proof matter more than deep case studies.",
  contact:
    "The two-path contact page separates people interested in the collective from people bringing a project.",
};

const PEOPLE = [
  {
    name: "Ravin Raori",
    role: "Creative producer, artist, and strategy lead",
    linkLabel: "ravinraori.com",
  },
  {
    name: "Nick",
    role: "Creative producer, collaborator, and cultural strategist",
    linkLabel: "Individual site placeholder",
  },
];

const LENSES = [
  {
    title: "Creative Producing",
    definition: "Turning complex ideas into formats people can enter, use, and remember.",
  },
  {
    title: "Public Engagement",
    definition: "Designing encounters that make audiences feel invited into the work.",
  },
  {
    title: "Narrative Systems",
    definition: "Building structures that help institutions explain what they are becoming.",
  },
  {
    title: "Curatorial Strategy",
    definition: "Composing people, ideas, objects, and contexts into legible public forms.",
  },
  {
    title: "Emerging Technology + Culture",
    definition: "Translating new tools and speculative worlds into human cultural experiences.",
  },
];

const WORKS = [
  {
    title: "Digital Futures",
    context: "Emerging technology, learning, and public imagination",
    body:
      "A lightweight case-study placeholder for work where research, facilitation, and future-facing cultural questions came together through an Alchemy lens.",
  },
  {
    title: "Bond",
    context: "Creative production, public format, and shared identity",
    body:
      "A lightweight case-study placeholder for work that can demonstrate polish, trust, and the collective's ability to make a project feel held.",
  },
  {
    title: "Upcoming Collaboration",
    context: "Placeholder",
    body:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.",
  },
];

function PageShell({
  eyebrow,
  title,
  intro,
  noteKey,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  noteKey: keyof typeof NOTE_COPY;
  children: ReactNode;
}) {
  const [location] = useLocation();

  return (
    <main className="min-h-screen bg-[#f7f3ea] text-[#151311]">
      <header className="sticky top-0 z-20 border-b border-[#151311]/10 bg-[#f7f3ea]/90 px-5 py-4 backdrop-blur-md md:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="h-3 w-3 bg-[#ff6737]" />
            <span className="text-[0.92rem] font-semibold">Alchemy Unlimited</span>
          </Link>
          <nav className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 md:gap-x-5">
            {NAV_ITEMS.map((item) => {
              const active = item.href === location;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-[0.74rem] font-semibold uppercase tracking-[0.16em] transition-colors duration-150"
                  style={{ color: active ? "#151311" : "rgba(21,19,17,0.48)" }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:px-10 md:py-16 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#72695d]">
            {eyebrow}
          </p>
          <h1 className="mt-5 max-w-[13ch] text-[3rem] font-semibold leading-[0.98] tracking-[-0.05em] text-[#151311] md:text-[5.2rem]">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-[1rem] leading-[1.74] text-[#4e473f] md:text-[1.08rem]">
            {intro}
          </p>
        </div>

        <aside className="h-fit border border-[#7c6828]/20 bg-[#fce591] p-5 shadow-[0_18px_38px_rgba(73,60,18,0.12)]">
          <div className="mx-auto mb-4 h-5 w-24 rounded-[3px] bg-[#f7ecc0]" />
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#675c35]">
            Studio note
          </p>
          <p className="mt-4 text-[0.88rem] leading-[1.62] text-[#3d3729]">
            {NOTE_COPY[noteKey]}
          </p>
        </aside>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16 md:px-10">{children}</section>
    </main>
  );
}

export function AboutPage() {
  return (
    <PageShell
      eyebrow="About"
      title="A collection of humans."
      intro="Alchemy is being shaped as an assembly of creative producers, collaborators, and recurring partners. The page should make the collective model feel transparent while leaving room for the name and identity to keep evolving."
      noteKey="about"
    >
      <div className="grid gap-px bg-[#151311]/12 md:grid-cols-2">
        {PEOPLE.map((person) => (
          <article key={person.name} className="min-h-[18rem] bg-[#fffaf0] p-6 md:p-8">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#786f63]">
              Person
            </p>
            <h2 className="mt-8 text-[2rem] font-semibold leading-none tracking-[-0.04em]">
              {person.name}
            </h2>
            <p className="mt-4 max-w-md text-[0.96rem] leading-[1.66] text-[#4e473f]">
              {person.role}
            </p>
            <p className="mt-8 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#ff6737]">
              {person.linkLabel}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-10 grid gap-8 border-t border-[#151311]/12 pt-10 lg:grid-cols-2">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#786f63]">
            Collaborator layer
          </p>
          <p className="mt-4 max-w-xl text-[1rem] leading-[1.72] text-[#4e473f]">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec ullamcorper
            nulla non metus auctor fringilla. This section can later list recurring
            collaborators, network members, or producer cohort family.
          </p>
        </div>
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#786f63]">
            Year One invitation
          </p>
          <p className="mt-4 max-w-xl text-[1rem] leading-[1.72] text-[#4e473f]">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. This placeholder
            should become the near-term invitation for prospective members before launch.
          </p>
        </div>
      </div>
    </PageShell>
  );
}

export function LensesPage() {
  return (
    <PageShell
      eyebrow="Lenses"
      title="Ways of seeing creative challenges."
      intro="The lenses frame Alchemy's capabilities as perspectives rather than services. Each one should be broad enough to invite interpretation and specific enough to feel usable."
      noteKey="lenses"
    >
      <div className="grid gap-px bg-[#151311]/12 md:grid-cols-2 lg:grid-cols-3">
        {LENSES.map((lens, index) => (
          <article key={lens.title} className="min-h-[20rem] bg-[#fffaf0] p-6 md:p-7">
            <p className="text-[0.78rem] font-semibold tracking-[-0.03em] text-[#151311]">
              0{index + 1}
            </p>
            <h2 className="mt-10 max-w-[11ch] text-[1.8rem] font-semibold leading-[1.02] tracking-[-0.04em]">
              {lens.title}
            </h2>
            <p className="mt-5 text-[0.96rem] leading-[1.62] text-[#4e473f]">
              {lens.definition}
            </p>
            <p className="mt-5 text-[0.86rem] leading-[1.62] text-[#7a7165]">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere
              erat a ante venenatis dapibus posuere velit aliquet.
            </p>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

export function WorksPage() {
  const [activeWork, setActiveWork] = useState<(typeof WORKS)[number] | null>(null);

  return (
    <PageShell
      eyebrow="Works"
      title="Proof without over-explaining."
      intro="This is a lightweight portfolio layer for now: polished project cards and a simple lightbox, with deeper case studies deferred until the content is ready."
      noteKey="works"
    >
      <div className="grid gap-px bg-[#151311]/12 md:grid-cols-3">
        {WORKS.map((work) => (
          <button
            key={work.title}
            type="button"
            onClick={() => setActiveWork(work)}
            className="min-h-[22rem] bg-[#fffaf0] p-6 text-left transition-colors duration-150 hover:bg-[#fce591]"
          >
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#786f63]">
              {work.context}
            </p>
            <h2 className="mt-16 text-[2.1rem] font-semibold leading-none tracking-[-0.045em]">
              {work.title}
            </h2>
            <p className="mt-5 text-[0.94rem] leading-[1.62] text-[#4e473f]">
              {work.body}
            </p>
          </button>
        ))}
      </div>

      {activeWork ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#151311]/72 p-5 backdrop-blur-sm">
          <article className="w-full max-w-2xl bg-[#fffaf0] p-6 text-[#151311] shadow-[0_28px_80px_rgba(0,0,0,0.28)] md:p-8">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#786f63]">
                  {activeWork.context}
                </p>
                <h2 className="mt-5 text-[2.4rem] font-semibold leading-none tracking-[-0.05em]">
                  {activeWork.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveWork(null)}
                className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#ff6737]"
              >
                Close
              </button>
            </div>
            <div className="mt-8 aspect-video bg-[linear-gradient(135deg,#d7ecff,#fce591_54%,#f3d7e3)]" />
            <p className="mt-6 text-[1rem] leading-[1.72] text-[#4e473f]">
              {activeWork.body}
            </p>
          </article>
        </div>
      ) : null}
    </PageShell>
  );
}

export function ContactPage() {
  return (
    <PageShell
      eyebrow="Contact"
      title="Two ways into the conversation."
      intro="The contact page separates people who are interested in the collective from people bringing a project, so the first exchange can be clearer."
      noteKey="contact"
    >
      <div className="grid gap-px bg-[#151311]/12 md:grid-cols-2">
        <article className="min-h-[22rem] bg-[#fffaf0] p-6 md:p-8">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#786f63]">
            Path 1
          </p>
          <h2 className="mt-12 max-w-[12ch] text-[2.4rem] font-semibold leading-none tracking-[-0.05em]">
            Interested in the collective.
          </h2>
          <p className="mt-5 max-w-md text-[1rem] leading-[1.66] text-[#4e473f]">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. This route can
            become the invitation for collaborators, members, and network/family roles.
          </p>
        </article>

        <article className="min-h-[22rem] bg-[#fffaf0] p-6 md:p-8">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#786f63]">
            Path 2
          </p>
          <h2 className="mt-12 max-w-[12ch] text-[2.4rem] font-semibold leading-none tracking-[-0.05em]">
            Interested in a project.
          </h2>
          <p className="mt-5 max-w-md text-[1rem] leading-[1.66] text-[#4e473f]">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. This route can
            become the entry point for commissions, partnerships, and project inquiries.
          </p>
        </article>
      </div>

      <div className="mt-10 border-t border-[#151311]/12 pt-10">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#786f63]">
          Contact details
        </p>
        <p className="mt-4 text-[1.1rem] font-semibold text-[#151311]">
          hello@alchemy.example
        </p>
      </div>
    </PageShell>
  );
}
