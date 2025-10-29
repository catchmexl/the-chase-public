# Changelog

All notable changes to The Chase game rules will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Additional strategic tips based on player feedback
- City-specific variations for different locations
- Advanced game modes

---

## [1.0.0] - 2025-10-29

### Added
- Initial release of structured rules system
- Separated rules into individual markdown files
- Created `rules.json` manifest for app integration
- Added JSON schema for manifest validation
- Comprehensive README with update guidelines
- Four rule categories: core, mechanics, tips, conduct

### Structure
- **Core Rules**: Objective, Preparation, Game Play
- **Mechanics**: Trigger Zones (Clue Points)
- **Tips**: Strategic advice for Chasers and Escapers
- **Conduct**: Fair Play and safety guidelines

### Technical
- Manifest-based rule loading system
- 24-hour cache strategy for app
- Support for rule versioning
- Schema validation for data integrity

---

## Legacy Changes (Pre-1.0.0)

### [0.9.0] - 2025-08-15

#### Changed
- Updated Freeze duration from 5 to 6 minutes
- Clarified that Freeze requires manual confirmation
- Improved Transport Clue description

### [0.8.0] - 2025-06-20

#### Added
- Surveillance (Green Markers) clue point for Chasers only
- 360° video requirement for Surveillance
- Tips for using Clue Points strategically

### [0.7.0] - 2025-05-10

#### Changed
- Phase 3 now restricts Escapers to foot movement only
- Clarified cooldown periods between Freeze and Live Location
- Updated winning condition description

### [0.6.0] - 2025-04-01

#### Added
- Transport Clue (Purple Marker) mechanic
- No cooldown for Transport Clue

#### Changed
- Improved clarity on Clue Point activation process
- Updated tips for both Chasers and Escapers

### [0.5.0] - 2025-02-15

#### Initial
- Basic game rules established
- Three-phase game structure defined
- Initial Clue Points: Freeze and Live Location
- Team structure and duration defined
- Fair Play guidelines established

---

## Version History Summary

| Version | Date       | Type    | Description |
|---------|------------|---------|-------------|
| 1.0.0   | 2025-10-29 | Major   | Structured manifest system |
| 0.9.0   | 2025-08-15 | Minor   | Freeze duration update |
| 0.8.0   | 2025-06-20 | Minor   | Surveillance clue added |
| 0.7.0   | 2025-05-10 | Minor   | Phase 3 movement restriction |
| 0.6.0   | 2025-04-01 | Minor   | Transport Clue added |
| 0.5.0   | 2025-02-15 | Minor   | Initial rules established |

---

## How to Read This Changelog

- **Added** - New features or rule sections
- **Changed** - Changes to existing rules
- **Deprecated** - Features or rules that will be removed soon
- **Removed** - Removed features or rules
- **Fixed** - Bug fixes, typos, clarifications
- **Security** - Security-related changes

## Migration Guides

### Migrating from 0.x to 1.0.0

**For App Developers:**
1. Update API endpoint to fetch `rules.json` instead of `rules.md`
2. Implement manifest parsing logic
3. Fetch individual markdown files based on manifest
4. Update caching strategy to handle multiple files
5. Map old section names to new IDs if using deep linking

**Mapping Guide:**
- `Objective` → `objective`
- `Preparation` → `preparation`
- `Game Play` → `gameplay`
- `POI` → `trigger-zones`
- `TipsChasers` → `tips-chasers`
- `TipsEscapers` → `tips-escapers`
- `Fair Play` → `fair-play`

**For Players:**
No action required. Rules content remains the same, only structure changed.

---

[Unreleased]: https://github.com/catchmexl/the-chase-public/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/catchmexl/the-chase-public/releases/tag/v1.0.0
