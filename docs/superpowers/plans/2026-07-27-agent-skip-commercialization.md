# Agent Skip Commercialization Implementation Plan

> **For agentic workers:** Implement task-by-task.

**Goal:** Hide commercialization in the publish wizard for Agents; auto-save DIRECT; keep Owner flow unchanged.

**Architecture:** Central `publish-wizard-steps.ts` drives progress and next/prev navigation. Step4 deep-link guard for agents.

**Tech Stack:** React, React Router, existing `useIsAgent`, Playwright e2e.

## Global Constraints
- Reuse `useIsAgent()`; no new role source of truth.
- TypeScript strict; no hardcoded step totals outside config.

## Tasks
- [ ] Add `publish-wizard-steps.ts` + wire Progress/Step1–4
- [ ] Agent deep-link guard on Step4 (idempotent DIRECT save)
- [ ] E2E: owner unchanged + agent skip/redirect/idempotency
