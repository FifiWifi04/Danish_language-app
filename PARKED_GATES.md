# PARKED_GATES — things the routine must NEVER start

A parked item is not "available work". A gate opens only when the owner
moves the item into the `AUTON_STATUS.md` queue. (Rationale for each park
is recorded so the reasoning isn't relearned.)

| Item | Why parked | Gate to open |
|---|---|---|
| Situational dialogue blocks (original spec §2.6) | A third card type + multi-turn UI; value unclear until the core loop has survived real use | Post-Phase-6, owner judgement |
| Forvo human recordings | API terms don't permit redistribution; a public Pages repo redistributes (REVIEW.md A.4) | Licensing check passed, or private repo + paid plan (D-REPO1 revisited) |
| Sagittal mouth-position diagrams (SVG) in the Udtale tab | An agent-drawn articulation diagram that's subtly wrong is worse than text; text + audio + self-recording carry the value | Owner sources/approves reference diagrams |
| Automated pronunciation scoring | Speech scoring is unreliable enough to actively mislead a learner; self-comparison is the honest tool | Owner explicitly requests + a credible scoring approach exists |
| Cross-device progress sync (gist/cloud) | Export/import covers the single-user case; sync adds auth + conflict complexity | Owner actually uses two devices daily and asks |
| Grammar exercise module (beyond per-card notes) | Scope; conversational fluency target is vocabulary + sound first | Owner request |
| Git LFS for audio | ~10 MB of MP3s is fine in plain git (HANDOFF Phase 4) | Audio exceeds ~50 MB |
| Any commercialisation / multi-tenancy | Closed in HANDOFF §5 — build the personal app on its own terms | Not expected to open |
