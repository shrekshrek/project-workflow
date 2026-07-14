# AGENTS.md

Fixture project: minimal single-tier Node service.

## Commands

- test: `node --test`

## Project Structure

- `src/` — application modules

## Boundaries

- 🚫 Never: commit secrets
- ⚠️ 灾难性不变量 / 高爆破半径路径: `src/billing/`
