# Task 8: Unit Tests for lib/bluesky.ts

## Summary

Created comprehensive unit tests for the Bluesky API posting function in `lib/bluesky.ts`.

## Files Created

- `__tests__/lib/bluesky.test.ts` - Unit tests for the `postToBluesky` function

## Test Coverage

The test suite covers 15 test cases across 4 categories:

### Credential Validation (3 tests)
- Returns error when BLUESKY_HANDLE is missing
- Returns error when BLUESKY_APP_PASSWORD is missing
- Returns error when both credentials are missing

### Successful Posting (4 tests)
- Returns success with URI on successful post
- Calls login with correct credentials
- Calls detectFacets to process rich text
- Creates post with correct structure (text, facets, createdAt)

### Error Handling (3 tests)
- Handles login failure with error message
- Handles post failure with error message
- Handles non-Error exceptions with "Unknown error"

### Hashtag Formatting (5 tests)
- Formats single tag correctly with # prefix
- Formats multiple tags correctly
- Removes spaces from tags (e.g., "react native" becomes "#reactnative")
- Handles empty tags array
- Includes title, description, and URL in post text

## Key Implementation Details

1. **Mock Setup**: Used `vi.hoisted()` to ensure mock functions are available during Vitest's mock hoisting phase
2. **Class Mocks**: Created proper class mocks for `BskyAgent` and `RichText` since they're instantiated at module load time
3. **Environment Stubbing**: Used `vi.stubEnv()` for `BLUESKY_HANDLE` and `BLUESKY_APP_PASSWORD`
4. **Consistent Patterns**: Followed the same testing patterns used in other lib tests (posts.test.ts, search.test.ts)

## Test Execution

```bash
npm test -- --run __tests__/lib/bluesky.test.ts
```

All 15 tests pass successfully.
