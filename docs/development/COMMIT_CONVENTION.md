# Commit Message Convention

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification to ensure consistent and meaningful commit messages that can be used for automated versioning and changelog generation.

## Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Types

### Primary Types
- **feat**: A new feature for the user
- **fix**: A bug fix for the user
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools and libraries

### Secondary Types
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to our CI configuration files and scripts
- **revert**: Reverts a previous commit

## Scopes

Use these scopes to identify the area of change:

### Core Areas
- **website**: Website management functionality
- **scan**: WordPress scanning features
- **group**: Website grouping system
- **schedule**: Scheduled scan functionality
- **bulk**: Bulk operations system
- **ui**: User interface components
- **api**: API endpoints and controllers

### Technical Areas
- **db**: Database migrations and models
- **auth**: Authentication and authorization
- **config**: Configuration changes
- **deps**: Dependency updates
- **docker**: Docker configuration
- **deploy**: Deployment scripts and configuration

## Examples

### Features
```bash
feat(bulk): add multi-select website operations
feat(scan): implement plugin detection for WordPress sites
feat(group): add color-coded website categorization
feat(ui): add table/grid view toggle for websites
```

### Bug Fixes
```bash
fix(scan): handle SSL certificate validation errors
fix(bulk): prevent duplicate operations on same website
fix(ui): fix responsive layout on mobile devices
fix(schedule): correct timezone handling in cron jobs
```

### Documentation
```bash
docs(api): add bulk operations endpoint documentation
docs(readme): update installation instructions
docs(release): add v0.9.2 changelog and release notes
```

### Refactoring
```bash
refactor(scan): extract common scanning logic to service class
refactor(ui): consolidate table component styling
refactor(bulk): optimize database queries for large operations
```

### Chores
```bash
chore(deps): update Laravel to 12.20.0
chore(build): update Node.js dependencies
chore(release): bump version to v0.9.2
chore(config): update production environment settings
```

## Breaking Changes

For breaking changes, add a `!` after the type/scope and include a `BREAKING CHANGE:` footer:

```bash
feat(api)!: change bulk operations response structure

BREAKING CHANGE: The bulk operations API now returns a different response format with detailed operation results instead of simple success/failure status.
```

## Release Workflow Integration

### Version Bumping
- **patch**: `fix`, `perf`, `docs`, `style`, `refactor`, `test`, `chore`
- **minor**: `feat`
- **major**: any commit with `BREAKING CHANGE` footer or `!` in header

### Automatic Changelog Generation
Commits following this convention will automatically generate:
- Release notes with categorized changes
- Migration guides for breaking changes
- Feature summaries for new functionality
- Bug fix listings with descriptions

## Pre-commit Hooks

Consider installing commitizen for interactive commit message creation:

```bash
npm install -g commitizen cz-conventional-changelog
echo '{ "path": "cz-conventional-changelog" }' > ~/.czrc
```

Then use `git cz` instead of `git commit` for guided commit message creation.

## Validation

The GitHub Actions workflow will validate commit messages and generate appropriate version bumps and release notes based on the conventional commit format.

### Valid Examples
✅ `feat(bulk): add website group assignment in bulk operations`
✅ `fix(scan): resolve timeout issues with large WordPress installations`
✅ `docs(api): update bulk operations endpoint documentation`
✅ `refactor(ui): extract common table components`
✅ `chore(deps): update React to v18`

### Invalid Examples
❌ `Add bulk operations` (missing type)
❌ `fixed bug` (lowercase type, no scope)
❌ `FEAT: new feature` (uppercase type)
❌ `feat add feature` (missing colon)
