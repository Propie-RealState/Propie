# Edit Property Finalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align wizard Step 5 with domain finalization (publish vs save edits) via a lightweight strategy.

**Architecture:** Shared wizard; `resolveWizardFinalization(publishMode)` returns CTA/copy/`finalize()`. Create calls `publishProperty`; edit no-ops network and shows edit success.

**Tech Stack:** React, TypeScript, existing `showToast`, Playwright e2e.

## Global Constraints

- Do not change backend `/publish` contract
- Do not duplicate wizard steps
- Strict TypeScript; reuse `PublishWizardCTA` loading prop
- Publish analytics only in create finalize path

---

### Task 1: Finalization strategy module

**Files:**
- Create: `web/src/app/modules/publish/finalization/resolve-wizard-finalization.ts`
- Create: `web/src/lib/api-error-message.ts` (shared message extractor)

- [ ] **Step 1:** Add strategy types + publish/save_edits strategies + resolver
- [ ] **Step 2:** Wire `PublishStep5` to strategy (CTA, loading, toast, success)
- [ ] **Step 3:** Parameterize `PublishSuccess` copy from strategy
- [ ] **Step 4:** Toast on Steps 1–4 catch blocks
- [ ] **Step 5:** E2E edit finalize (no `/publish` call) + keep create e2e
- [ ] **Step 6:** Run Playwright; caveman review; `graphify update .`
