# The Chase - Game Rules

This directory contains the official game rules for **The Chase**.

## Structure

English remains the default and backward-compatible source at the root:

- `rules.json`
- `objective.md`
- `preparation.md`
- `gameplay.md`
- `clue-points.md`
- `types-of-clue-points.md`
- `tips.md`
- `fair-play.md`

Additional locales live in subdirectories and use the same manifest shape:

- `de/rules.json`
- `de/*.md`

Every localized manifest resolves its `file` entries relative to its own
directory.

## Manifest Structure

Each `rules.json` follows this structure:

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-10-29T12:00:00Z",
  "rules": [
    {
      "id": "objective",
      "title": "Objective",
      "file": "objective.md",
      "category": "core",
      "order": 1,
      "description": "The main goal of the game"
    }
  ]
}
```

Field notes:

- `version`: semantic version (`MAJOR.MINOR.PATCH`)
- `lastUpdated`: ISO 8601 timestamp
- `rules`: ordered rule sections
- `id`: stable kebab-case identifier
- `title`: display title for the section
- `file`: markdown filename relative to the current manifest directory
- `category`: one of `core`, `mechanics`, `tips`, `conduct`
- `order`: display order
- `description`: optional short description

## Locale Workflow

When adding a new locale:

1. Create `rules/<locale>/`.
2. Copy the current English `rules.json` into `rules/<locale>/rules.json`.
3. Copy the referenced English markdown files into `rules/<locale>/`.
4. Translate the localized copies in place.
5. Run `node validate-rules.js`.

For the initial localization scaffold, it is valid to copy English content first
and translate later.

## Updating Rules

### Edit content

- Update the relevant `.md` file in the root English set or in a locale folder.
- Keep markdown concise and readable.
- Use headings and bullets where appropriate.

### Update manifests

If adding, removing, or reordering sections:

1. Update the affected `rules.json`.
2. Keep the same section ordering across locales unless there is a clear product
   reason not to.
3. Update `version` and `lastUpdated`.

### Validate

Run:

```bash
cd rules
node validate-rules.js
```

The validator checks:

- every `rules.json` under `rules/**`
- referenced markdown files relative to each manifest directory
- duplicate IDs, orders, and files inside a manifest
- orphaned markdown files inside each manifest directory
- localized manifests match the root manifest IDs, files, categories, and order

## App Integration

The mobile app fetches:

- English default: `https://raw.githubusercontent.com/catchmexl/the-chase-public/main/rules/rules.json`
- Localized manifests: `https://raw.githubusercontent.com/catchmexl/the-chase-public/main/rules/<locale>/rules.json`

The app then:

1. Fetches the locale-specific manifest when available
2. Downloads markdown files listed in that manifest
3. Falls back to the root English manifest/content when localized content is
   missing
4. Caches content per locale

## Versioning

We follow [Semantic Versioning](https://semver.org/):

- `PATCH`: typo fixes and clarifications
- `MINOR`: new rule sections or meaningful content additions
- `MAJOR`: breaking manifest structure changes

## License

© 2025 The Chase. All rights reserved.
