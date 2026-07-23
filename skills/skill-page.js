import "./materials-nav.js";

const prompt = `Create a Remotion animation for:

<ENTER ANIMATION DESCRIPTION>

1. Visit https://www.remotion.dev/docs and follow the current official setup.
2. Install Remotion or inspect the existing Remotion project.
3. Download and unpack:
   https://materials.buriedsignals.com/downloads/map-explainer.zip
   https://materials.buriedsignals.com/downloads/3d-flyover.zip
   https://materials.buriedsignals.com/downloads/newsroom-chart-animations.zip
4. Read each SKILL.md, select the relevant skill or combine them, then build, preview, render and review the animation.

Begin now.`;

window.addEventListener("materials-copy-agent-prompt", async () => {
  await navigator.clipboard.writeText(prompt);
  document.querySelector("materials-nav")?.setCopied();
});
