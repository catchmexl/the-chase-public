# AGENTS.md

## Project Overview

**The Chase** — rules & legal docs repository for an urban real-life chase game by JLL Chasing Reality UG (Berlin). A mobile app fetches rules content from this repo via GitHub raw URLs.

## Tech Stack

- **Content**: Markdown (rules), HTML/CSS (legal pages)
- **Validation**: Node.js v18+ custom validator, documented JSON Schema (Draft-07)

## Project Structure

```
rules/               # Game rules system
  rules.json         # Manifest — lists all rule sections with metadata
  rules_manifest.schema.json
  validate-rules.js  # Custom validation script
  *.md               # Individual rule files (objective, gameplay, etc.)
  de/
    rules.json       # German localized manifest
    *.md             # German localized rule files
  variants/
    <variant>/
      rules.json     # English map-specific manifest
      *.md           # Complete English rules variant
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

## Localization and Translation Placement

English rules are the default source and live directly under `rules/`:

- `rules/rules.json`
- `rules/*.md`

German rules live under `rules/de/`:

- `rules/de/rules.json`
- `rules/de/*.md`

Localized rule manifests must mirror the root manifest for `id`, `file`,
`category`, and `order`. Translate only display metadata (`title`,
`description`) and markdown content unless a deliberate product change requires
otherwise. Keep placeholders such as `{{CLOSING_IN}}` unchanged.

When adding another rule locale, create `rules/<locale>/`, copy the current root
`rules.json` and referenced markdown files into that folder, translate them in
place, then run `node validate-rules.js` from `rules/`.

Do not place localized rule markdown files at the root of `rules/`; the root is
reserved for the English default.

## Map-Specific Rule Variants

English map-specific rules live under `rules/variants/<variant>/`. Each variant
is a complete rules set with its own manifest and markdown files. Variant
manifests mirror the root manifest for `id`, `file`, `category`, and `order`,
while display metadata and content may differ. Variant identifiers use
kebab-case and are selected by the app's map configuration.

App/UI translations do not live in this public repo. They belong in the Flutter
app repository under `lib/l10n/app_*.arb`, with terminology coordinated through
that repository's `docs/translation.md`.

For non-rule public HTML documents in this repo, keep translated variants next
to the source document with an explicit locale suffix, for example
`privacy-policy.de.html` or `privacy-policy.en.html`, and update any consuming
links when adding such variants.

## Validation

Run `node validate-rules.js` from `rules/`.

The validator checks file existence, no duplicate IDs/orders/files, no orphaned markdown files, and localized/variant manifest parity against the root manifest. `rules_manifest.schema.json` documents the manifest contract, but the current validator implements checks directly instead of using an external JSON Schema validator.

## App Integration

The mobile app fetches the default `rules.json` or an English map-specific manifest from `rules/variants/<variant>/rules.json`, then loads individual markdown files. 24-hour cache per locale or variant.
