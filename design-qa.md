# Design QA — AI 掼蛋训练空间场景

final result: blocked

## Comparison Target

- Source visual truth: `C:\Users\Administrator\.codex\attachments\986353a9-3ef8-49ef-baf7-11315b0accd7\image-1.png`
- Project asset: `D:\coding\2.掼蛋\public\assets\background\training-world-bg.png`
- Implementation routes: `/`（Opening Scene → Training Entry Scene）与 `/training?level=...`
- Intended viewports: `1440 × 900`、`1366 × 768`、`844 × 390`、`667 × 375`、`568 × 320`
- States: opening fully revealed、button transition、training entry fully revealed
- Implementation screenshot: unavailable; the in-app browser tab entered a restricted local error page before the final capture and could not be restored automatically under browser safety policy.

## Full-view Comparison Evidence

Blocked. The supplied source image was opened and inspected at original quality. The final browser-rendered implementation could not be captured after the last fixes, so no valid same-viewport side-by-side comparison exists yet.

## Focused Region Comparison Evidence

Blocked for the same reason. Required focus regions are:

- Background orientation, complete-image treatment, and top/bottom blend.
- Opening title, AI Coach silhouette, and glass CTA separation.
- `844 × 390` and `568 × 320` training-card density.
- Transition brightness peak and black-overlay reveal.

## Findings

- [BLOCKER] Missing final browser-rendered screenshots.
  - Evidence: source image is available, but the final implementation capture is unavailable.
  - Impact: image quality, color balance, real crop, font rendering, and transition polish cannot be certified from code or build output alone.
  - Fix: restore the in-app browser to `http://localhost:3000/`, capture the listed viewports and states, compare them with the source in one combined image, then update this report.

## Static Review History

1. Earlier review found unsupported Tailwind opacity suffixes; all affected values were changed to explicit arbitrary opacity tokens.
2. Earlier review found `object-cover` cropped the wide source image on PC; the implementation now uses a blurred cover layer behind a complete `object-contain` foreground.
3. Earlier review found a possible sharp boundary between those layers; top and bottom environment gradients now cover the blend region.
4. Earlier review found `max-height: 430px` compact rules could lose to the 600px rules; the compact height and padding overrides now use explicit important modifiers.
5. Earlier review found a hard black cut and missing focus handoff; the transition now exits over `0.38s`, and the Training Entry heading receives programmatic focus without entering the Tab order.
6. Static responsive review reports no P0/P1/P2 issues at the five target viewports after these fixes, but browser evidence is still required.

## Functional Verification

- `pnpm lint`: passed.
- `pnpm typecheck`: passed.
- `pnpm build`: passed.
- HTTP checks: `/` and `/practice` returned `200`.
- Training stage URLs are validated and initialize the existing Game Arena level through `searchParams.level`.
- Primary button click and final transition were not re-tested in the browser after the last fixes.
- Browser console errors were not checked after the last fixes.

## Implementation Checklist

- [x] Original PNG preserved byte-for-byte and registered by `assetId`.
- [x] Opening, background, transition, and entry components implemented.
- [x] First-visit persistence and reduced-motion behavior implemented.
- [x] PC and short landscape layouts statically reviewed.
- [x] Lint, typecheck, and production build passed.
- [ ] Restore browser preview and capture final visual evidence.
- [ ] Run same-viewport side-by-side comparison and change `final result` to `passed` only if no actionable P0/P1/P2 findings remain.
