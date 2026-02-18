# CLAUDE.md

## Project Overview

**The Chase** — rules & legal docs repository for an urban real-life chase game by JLL Chasing Reality UG (Berlin). A mobile app fetches rules content from this repo via GitHub raw URLs.

## Tech Stack

- **Content**: Markdown (rules), HTML/CSS (legal pages)
- **Validation**: Node.js v18+, JSON Schema (Draft-07), markdownlint
- **CI/CD**: GitHub Actions (`.github/workflows/validate-rules.yml` — lives inside `rules/`)

## Project Structure

```
rules/               # Game rules system
  rules.json         # Manifest — lists all rule sections with metadata
  rules_manifest.schema.json
  validate-rules.js  # Custom validation script
  *.md               # Individual rule files (objective, gameplay, etc.)
legal-notice.html    # German §5 TMG legal notice
privacy-policy.html
terms-and-conditions.html
```

## Key Conventions

- **Rule categories**: `core`, `mechanics`, `tips`, `conduct`
- **File naming**: kebab-case for markdown files
- **Versioning**: Semantic versioning in `rules.json` (MAJOR=breaking, MINOR=new rules, PATCH=fixes)
- **Placeholders**: `{{PLACEHOLDER}}` syntax in rule markdown for dynamic app values
- **Manifest IDs**: kebab-case, unique; `order` field controls display sequence

## Validation (CI runs on push/PR to main/develop touching `rules/**`)

1. `validate-rules.js` — checks file existence, no duplicate IDs/orders, no orphaned files
2. JSON Schema validation against `rules_manifest.schema.json`
3. Markdown linting (allows long lines, HTML, missing top-level title)

## App Integration

The mobile app fetches `rules.json` from `https://raw.githubusercontent.com/catchmexl/the-chase-public/main/rules/rules.json`, then loads individual markdown files. 24-hour cache.
