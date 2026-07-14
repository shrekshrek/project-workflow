# AGENTS.md

Fixture project: minimal single-tier Node service with existing feature history.

## Commands

- test: `node --test`

## Project Structure

- `src/user/` — user profile module
- `src/billing/` — billing module

## Boundaries

- 🚫 Never: commit secrets
- ⚠️ 灾难性不变量 / 高爆破半径路径: `src/billing/`
