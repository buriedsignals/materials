const SKILLS = [
  {slug: "map-explainer", label: "Map Explainer"},
  {slug: "3d-flyover", label: "3D Flyover"},
  {slug: "newsroom-chart-animations", label: "Chart Animations"},
];

const REPOSITORY_URL = "https://github.com/buriedsignals/materials";

const copyIcon = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="8" y="8" width="11" height="11" rx="2"></rect>
    <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"></path>
  </svg>`;

class MaterialsNav extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return;
    const current = this.getAttribute("current");
    const backOnly = this.hasAttribute("back-only");
    const backHref = this.getAttribute("back-href") || "/water-wars/";
    const currentLabel = SKILLS.find((skill) => skill.slug === current)?.label || "Choose a skill";
    const skillHref = (slug) => `../${slug}/`;

    this.attachShadow({mode: "open"});
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --nav-bg: #12181c;
          --nav-panel: #192126;
          --nav-ink: #f5f2ed;
          --nav-muted: #9da7aa;
          --nav-line: rgba(245, 242, 237, 0.16);
          --nav-gold: #d4a853;
          display: block;
          position: relative;
          z-index: 50;
          color: var(--nav-ink);
          font-family: "Space Grotesk", system-ui, sans-serif;
        }

        :host([overlay]) {
          position: fixed;
          top: max(16px, env(safe-area-inset-top));
          right: 20px;
          left: 20px;
          pointer-events: none;
        }

        * { box-sizing: border-box; }

        .shell {
          padding: 14px 28px 12px;
          background: var(--nav-bg);
        }

        :host([overlay]) .shell {
          padding: 0;
          background: transparent;
        }

        .row {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 20px;
        }

        .back {
          min-height: 42px;
          padding: 0 14px;
          justify-self: start;
          display: inline-flex;
          align-items: center;
          border: 1px solid var(--nav-line);
          border-radius: 7px;
          background: rgba(12, 17, 20, 0.88);
          color: var(--nav-ink);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-decoration: none;
          text-transform: uppercase;
          transition: border-color 160ms ease, background-color 160ms ease;
          backdrop-filter: blur(12px);
          pointer-events: auto;
        }

        .back:hover,
        .back:focus-visible {
          border-color: var(--nav-gold);
          background: rgba(32, 41, 46, 0.96);
          outline: none;
        }

        .desktop-skills {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .skill-link {
          min-height: 46px;
          padding: 0 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--nav-line);
          border-radius: 7px;
          background: var(--nav-panel);
          color: var(--nav-muted);
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: border-color 160ms ease, background-color 160ms ease, color 160ms ease;
        }

        .skill-link:hover,
        .skill-link:focus-visible {
          border-color: var(--nav-gold);
          background: #20292e;
          color: var(--nav-ink);
          outline: none;
        }

        .skill-link.active {
          border-color: var(--nav-gold);
          background: var(--nav-gold);
          color: var(--nav-bg);
        }

        .spacer { min-width: 1px; }

        .prompt-row {
          margin-top: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .prompt-action {
          min-height: 36px;
          padding: 0 13px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 0;
          background: transparent;
          color: var(--nav-muted);
          cursor: pointer;
          font: 700 10px "Space Grotesk", system-ui, sans-serif;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          transition: color 160ms ease;
        }

        .prompt-action:hover,
        .prompt-action:focus-visible {
          color: var(--nav-gold);
          outline: none;
        }

        .copy svg {
          width: 15px;
          height: 15px;
          fill: none;
          stroke: currentColor;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-width: 1.7;
        }

        .repo-link {
          text-decoration: none;
        }

        .prompt-divider {
          width: 1px;
          height: 14px;
          background: var(--nav-line);
        }

        .mobile-skills { display: none; }
        .back-only .row { grid-template-columns: 1fr; }

        @media (max-width: 700px) {
          :host([overlay]) {
            top: max(10px, env(safe-area-inset-top));
            right: 12px;
            left: 12px;
          }

          .shell { padding: 12px 15px 10px; }
          .row { grid-template-columns: auto 1fr; }
          .desktop-skills { display: none; }

          .mobile-skills {
            position: relative;
            display: block;
            pointer-events: auto;
          }

          .mobile-skills summary {
            min-height: 46px;
            padding: 0 14px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 18px;
            border: 1px solid var(--nav-line);
            border-radius: 7px;
            background: var(--nav-panel);
            color: var(--nav-ink);
            cursor: pointer;
            font-size: 13px;
            font-weight: 600;
            list-style: none;
          }

          .mobile-skills summary::-webkit-details-marker { display: none; }

          .mobile-skills summary::after {
            content: "";
            width: 7px;
            height: 7px;
            border-right: 1.5px solid var(--nav-muted);
            border-bottom: 1.5px solid var(--nav-muted);
            transform: translateY(-2px) rotate(45deg);
            transition: transform 160ms ease;
          }

          .mobile-skills[open] summary {
            border-color: var(--nav-gold);
            border-radius: 7px 7px 0 0;
          }

          .mobile-skills[open] summary::after {
            transform: translateY(2px) rotate(225deg);
          }

          .mobile-menu {
            position: absolute;
            z-index: 100;
            top: 100%;
            right: 0;
            left: 0;
            display: grid;
            border: 1px solid var(--nav-gold);
            border-top: 0;
            border-radius: 0 0 7px 7px;
            background: #11181c;
            box-shadow: 0 14px 32px rgba(0, 0, 0, 0.38);
          }

          .mobile-menu a {
            min-height: 44px;
            padding: 0 14px;
            display: flex;
            align-items: center;
            border-top: 1px solid var(--nav-line);
            color: var(--nav-muted);
            font-size: 13px;
            font-weight: 600;
            text-decoration: none;
          }

          .mobile-menu a:hover,
          .mobile-menu a:focus-visible,
          .mobile-menu a.active {
            background: var(--nav-panel);
            color: var(--nav-gold);
            outline: none;
          }

          .prompt-row { margin-top: 6px; }
          .back-only .row { grid-template-columns: 1fr; }
        }
      </style>
      <nav class="shell ${backOnly ? "back-only" : ""}" aria-label="Materials navigation">
        <div class="row">
          <a class="back" href="${backHref}">← Sources</a>
          ${backOnly ? "" : `
            <div class="desktop-skills" aria-label="Animation skills">
              ${SKILLS.map((skill) => `<a class="skill-link ${skill.slug === current ? "active" : ""}" href="${skillHref(skill.slug)}">${skill.label}</a>`).join("")}
            </div>
            <details class="mobile-skills">
              <summary>${currentLabel}</summary>
              <div class="mobile-menu">
                ${SKILLS.map((skill) => `<a class="${skill.slug === current ? "active" : ""}" href="${skillHref(skill.slug)}">${skill.label}</a>`).join("")}
              </div>
            </details>
            <span class="spacer" aria-hidden="true"></span>
          `}
        </div>
        ${backOnly ? "" : `
          <div class="prompt-row">
            <button class="copy prompt-action" type="button">${copyIcon}<span>Copy agent prompt</span></button>
            <span class="prompt-divider" aria-hidden="true"></span>
            <a class="repo-link prompt-action" href="${REPOSITORY_URL}" target="_blank" rel="noreferrer">GitHub repository ↗</a>
          </div>
        `}
      </nav>`;

    this.shadowRoot.querySelector(".copy")?.addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("materials-copy-agent-prompt"));
    });
  }

  setCopied() {
    const label = this.shadowRoot?.querySelector(".copy span");
    if (!label) return;
    label.textContent = "Prompt copied";
    window.setTimeout(() => {
      label.textContent = "Copy agent prompt";
    }, 1800);
  }
}

customElements.define("materials-nav", MaterialsNav);
