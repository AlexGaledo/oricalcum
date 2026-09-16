import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/shared/components/icons/logo";
import { EnterCta } from "./enter-cta";
import {
  ACCENT_PRESETS,
  ARCHITECTURE,
  CAPABILITIES,
  LANDING,
  MCP_TOOLS,
  SCREENS,
  SCREEN_SIZE,
  STACK,
  STEPS,
} from "../content";

const EXTERNAL = { target: "_blank", rel: "noopener noreferrer" } as const;

function Eyebrow({ children }: { children: string }) {
  return <p className="lp-eyebrow">// {children}</p>;
}

function TopBar() {
  return (
    <header className="lp-top">
      <Link href="/" className="lp-brand" aria-label="Oricalcum home">
        <span className="brand-mark">
          <Logo />
        </span>
        <span className="brand-name">{LANDING.name}</span>
      </Link>
      <nav className="lp-top-nav" aria-label="Primary">
        <a href="#features">features</a>
        <a href="#architecture">architecture</a>
        <a href={LANDING.github} {...EXTERNAL}>
          github
        </a>
        <Link href="/login" className="lp-btn lp-btn--ghost lp-top-cta">
          sign in
        </Link>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="lp-hero" aria-labelledby="lp-title">
      <div className="lp-orb" aria-hidden="true" />
      <div className="lp-hero-inner">
        <div className="splash-logo lp-hero-logo" aria-hidden="true">
          <Logo />
        </div>
        <h1 id="lp-title" className="lp-title">
          {LANDING.name}
        </h1>
        <p className="lp-motto">{LANDING.motto}</p>
        <p className="lp-pitch">{LANDING.pitch}</p>
        <div className="lp-cta-row">
          <EnterCta />
          <a href={LANDING.github} {...EXTERNAL} className="lp-btn lp-btn--ghost">
            Source on GitHub
          </a>
        </div>
        <p className="lp-hero-note">Free while in beta. Google sign-in or email.</p>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="lp-section" aria-labelledby="lp-how">
      <Eyebrow>how it works</Eyebrow>
      <h2 id="lp-how" className="lp-h2">
        Three moves
      </h2>
      <ol className="lp-steps">
        {STEPS.map((step) => (
          <li key={step.n} className="lp-step lp-corners">
            <span className="lp-step-n">{step.n} /</span>
            <h3 className="lp-step-title">{step.title}</h3>
            <p className="lp-step-body">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Capabilities() {
  return (
    <section id="features" className="lp-section" aria-labelledby="lp-features">
      <Eyebrow>capabilities</Eyebrow>
      <h2 id="lp-features" className="lp-h2">
        What ships
      </h2>
      <p className="lp-lede">Everything below is in the app today.</p>
      <ul className="lp-grid">
        {CAPABILITIES.map((cap) => (
          <li key={cap.title} className="lp-card">
            <h3 className="lp-card-title">{cap.title}</h3>
            <p className="lp-card-body">{cap.body}</p>
            {cap.title === "Themes & tweaks" && (
              <ul className="lp-swatches" aria-label="Accent presets">
                {ACCENT_PRESETS.map((p) => (
                  <li key={p.value}>
                    <span className="lp-swatch" style={{ background: p.value }} aria-hidden="true" />
                    {p.label}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Architecture() {
  return (
    <section id="architecture" className="lp-section" aria-labelledby="lp-arch">
      <Eyebrow>architecture</Eyebrow>
      <h2 id="lp-arch" className="lp-h2">
        One request, end to end
      </h2>
      <p className="lp-lede">
        The backend is the source of truth; the browser only caches. Every agent is built fresh per
        request with its tools bound to that request&apos;s auth and project scope.
      </p>
      <ol className="lp-arch lp-corners">
        {ARCHITECTURE.map((node, i) => (
          <li key={node.title} className="lp-arch-node">
            <span className="lp-arch-title">{node.title}</span>
            <span className="lp-arch-sub">{node.sub}</span>
            {i < ARCHITECTURE.length - 1 && (
              <span className="lp-arch-arrow" aria-hidden="true">
                &rarr;
              </span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

function McpTools() {
  const total = MCP_TOOLS.reduce((sum, g) => sum + g.tools.length, 0);
  return (
    <section className="lp-section" aria-labelledby="lp-mcp">
      <Eyebrow>mcp tools</Eyebrow>
      <h2 id="lp-mcp" className="lp-h2">
        {total} tools, three groups
      </h2>
      <p className="lp-lede">
        Served by fastMCP, consumed through langchain-mcp-adapters. The agent and the REST API share
        one implementation.
      </p>
      <dl className="lp-tools">
        {MCP_TOOLS.map((group) => (
          <div key={group.group} className="lp-tools-row">
            <dt className="lp-tools-group">{group.group}</dt>
            <dd className="lp-tools-list">
              {group.tools.map((tool) => (
                <code key={tool} className="lp-chip">
                  {tool}
                </code>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Screens() {
  return (
    <section className="lp-section" aria-labelledby="lp-screens">
      <Eyebrow>screens</Eyebrow>
      <h2 id="lp-screens" className="lp-h2">
        In the app
      </h2>
      <ul className="lp-screens">
        {SCREENS.map((shot, i) => (
          <li key={shot.src}>
            <figure className="lp-figure">
              <div className="lp-frame lp-corners">
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  width={SCREEN_SIZE.width}
                  height={SCREEN_SIZE.height}
                  sizes="(max-width: 720px) 100vw, 50vw"
                  priority={i === 0}
                />
              </div>
              <figcaption>
                <span className="lp-figure-label">
                  {String(i + 1).padStart(2, "0")} / {shot.label}
                </span>
                <span className="lp-figure-caption">{shot.caption}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Footer() {
  return (
    <footer className="lp-footer">
      <Eyebrow>stack</Eyebrow>
      <ul className="lp-stack" aria-label="Built with">
        {STACK.map((s) => (
          <li key={s} className="lp-chip lp-chip--pill">
            {s}
          </li>
        ))}
      </ul>
      <p className="lp-footer-motto">{LANDING.motto.toLowerCase()}</p>
      <div className="lp-cta-row lp-cta-row--center">
        <EnterCta />
        <a href={LANDING.github} {...EXTERNAL} className="lp-btn lp-btn--ghost">
          Source
        </a>
      </div>
      <p className="lp-copy">&copy; {new Date().getFullYear()} Oricalcum</p>
    </footer>
  );
}

export function LandingPage() {
  return (
    <div className="lp">
      <TopBar />
      <main id="main-content">
        <Hero />
        <HowItWorks />
        <Capabilities />
        <Architecture />
        <McpTools />
        <Screens />
      </main>
      <Footer />
    </div>
  );
}
