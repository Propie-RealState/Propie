# Hide commercialization step for Agent publishers

## Problem
Agents see Owner-only commercialization choices during publish.

## Decision
Role-aware `getPublishWizardSteps(isAgent)` is the single source of truth.
Agents omit commercialization, auto-persist `DIRECT`, progress uses filtered step count.
Role via existing `useIsAgent()` only.

## Out of scope
Owner/Client flow changes, API contract changes.
