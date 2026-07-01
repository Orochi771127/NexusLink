# Local Preview

Use a local server for UI and Raphael verification. GitHub Pages is a deployment surface, not the first place to diagnose an integration.

```bash
cd C:\Users\User\NexusLink_RaphaelAI_Workspace\NexusLink
python -m http.server 8765
```

Open <http://localhost:8765/>.

## Required viewports

- 390×844
- 393×852
- 430×932
- 1280×800

In Chrome DevTools, open Device Toolbar with `Ctrl+Shift+M`, choose Responsive, enter each width and height, then reload the page after changing source files. Keep DevTools Console open while exercising the page.

## Local-only review

Stay local while changing DOM, CSS, controller wiring, Raphael/Soul Talk behavior, Pixi visibility, or responsive layout. Validate the console, one live Pixi canvas, Home navigation, Soul Talk typed input, and quick-reply chips before requesting review.

## When a push is appropriate

Push only after the approved task scope has passed its local validation, `git diff --check`, JavaScript syntax checks, and human review/commit approval. Do not use a first mobile refresh of GitHub Pages as deployment evidence: Pages can cache or take time to publish. Verify the deployed commit and wait for the published revision before treating a mobile result as current.
