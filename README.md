# The Chase - Game Rules

This directory contains the official game rules for **The Chase**, an urban chase game where Escapers try to evade Chasers within a city.

## Structure

The rules are organized into individual markdown files for maintainability and are managed through a manifest file.

### Files

- **`rules.json`** - Manifest file defining all rule sections, their order, and metadata
- **`rules_manifest.schema.json`** - JSON Schema for validating the manifest structure
- **Individual rule files:**
  - `objective.md` - Game objective and winning conditions
  - `preparation.md` - Team setup and game duration
  - `gameplay.md` - Three phases of gameplay
  - `trigger-zones.md` - Clue Points and their effects
  - `tips-chasers.md` - Strategic tips for Chaser teams
  - `tips-escapers.md` - Strategic tips for Escaper team
  - `fair-play.md` - Fair play rules and safety guidelines

## Manifest Structure

The `rules.json` manifest follows this structure:

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
    // ... more rules
  ]
}
```

### Field Descriptions

- **`version`** - Semantic version number (MAJOR.MINOR.PATCH)
- **`lastUpdated`** - ISO 8601 timestamp of last update
- **`rules`** - Array of rule sections with:
  - **`id`** - Unique identifier (kebab-case)
  - **`title`** - Display title for the section
  - **`file`** - Markdown filename
  - **`category`** - One of: `core`, `mechanics`, `tips`, `conduct`
  - **`order`** - Display order (lower numbers first)
  - **`description`** - Optional short description

## Categories

Rules are grouped into four categories:

1. **Core** - Essential game rules (objective, preparation, gameplay)
2. **Mechanics** - Game mechanics and features (trigger zones)
3. **Tips** - Strategic advice for players
4. **Conduct** - Fair play and safety guidelines

## Updating Rules

### 1. Edit Content

Update the relevant `.md` file with your changes. Follow these guidelines:

- Use proper markdown formatting
- Keep content concise and clear
- Use bullet points for lists
- Bold important terms
- Keep line length reasonable (80-100 characters)

### 2. Update Manifest

If adding/removing/reordering rules:

1. Edit `rules.json`
2. Update `version` number:
   - **MAJOR**: Breaking changes (structure changes, removed rules)
   - **MINOR**: New rules or significant additions
   - **PATCH**: Small fixes, typos, clarifications
3. Update `lastUpdated` timestamp

### 3. Validate Changes

Run the validation script (if available):

```bash
node validate-rules.js
```

Or manually validate:
1. Check that all files referenced in `rules.json` exist
2. Verify JSON syntax with a validator
3. Ensure markdown renders correctly
4. Check that manifest follows the schema

### 4. Update Changelog

Add an entry to `CHANGELOG.md` describing your changes:

```markdown
## [1.1.0] - 2025-10-29

### Added
- New section on team communication strategy

### Changed
- Updated Freeze duration from 5 to 6 minutes

### Fixed
- Typo in Fair Play section
```

## Schema Validation

The manifest structure can be validated against `rules_manifest.schema.json`:

```bash
# Using ajv-cli
ajv validate -s rules_manifest.schema.json -d rules.json

# Using online validators
# Visit: https://www.jsonschemavalidator.net/
```

## App Integration

The mobile app fetches rules from this repository via:

```
https://raw.githubusercontent.com/catchmexl/the-chase-public/main/rules/rules.json
```

The app will:
1. Fetch the manifest
2. Download individual markdown files
3. Cache for 24 hours
4. Display in the app with proper formatting

## Versioning

We follow [Semantic Versioning](https://semver.org/):

- **1.0.0** - Initial release
- **1.0.1** - Patch: Bug fixes, typos
- **1.1.0** - Minor: New features, additions
- **2.0.0** - Major: Breaking changes

## Maintenance

### Regular Tasks

- [ ] Review rules quarterly for clarity
- [ ] Update based on player feedback
- [ ] Check all links are valid
- [ ] Validate manifest structure
- [ ] Keep changelog updated

### Breaking Changes

If making breaking changes to the manifest structure:

1. Increment **MAJOR** version
2. Update schema file
3. Coordinate with app development team
4. Document migration path in changelog
5. Maintain backward compatibility when possible

## License

© 2025 The Chase. All rights reserved.

## Contact

For questions or suggestions about the rules, please open an issue in this repository.
