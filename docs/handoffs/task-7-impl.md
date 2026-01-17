# Task 7: Unit Tests for lib/manifest.ts

## Summary

Created comprehensive unit tests for the manifest module which handles tracking of Bluesky posting status.

## Test File

`__tests__/lib/manifest.test.ts` - 15 tests covering all 5 exported functions

## Functions Tested

### getManifest
- Returns manifest from file when it exists
- Returns default manifest (empty slugs, current timestamp) when file is missing

### saveManifest
- Writes manifest with updated timestamp
- Formats JSON with 2-space indentation

### isPostAlreadyPosted
- Returns true when slug is already in manifest
- Returns false when slug is not in manifest
- Returns false when manifest file does not exist

### markPostAsPosted
- Adds slug to manifest and saves
- Does not duplicate slug if already present
- Creates manifest with slug when file does not exist

### getNewPosts
- Filters to unposted slugs only
- Returns empty array when all slugs are posted
- Returns all slugs when none are posted
- Returns all slugs when manifest does not exist
- Preserves order of input slugs

## Testing Approach

- Mocked `fs` module with `vi.mock('fs')` for all file operations
- Used `vi.useFakeTimers()` and `vi.setSystemTime()` for consistent timestamp testing
- Mock manifest data: `{ postedSlugs: ['already-posted', 'another-posted'], lastUpdated: '2026-01-15T00:00:00.000Z' }`
- Fixed system time to `2026-01-18T12:00:00.000Z` for predictable assertions

## Test Results

```
15 tests passing (4ms)
```

## Commit

`test: add unit tests for lib/manifest`
