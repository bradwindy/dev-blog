# Blog Post Revisions Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use hyperpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Revise AI-generated blog posts based on user feedback - deleting 5 posts, replacing 1, and enhancing 4 others with additional content.

**Architecture:** Direct file operations - delete unwanted MDX files, edit existing files to remove references and add content.

**Tech Stack:** MDX, Next.js blog

---

## Task 1: Delete Unwanted Blog Posts

**Files:**
- Delete: `content/blog/mcp-servers-three-languages.mdx`
- Delete: `content/blog/timezone-five-layers.mdx`
- Delete: `content/blog/encoding-best-practices-skills.mdx`
- Delete: `content/blog/web-scraping-survives-changes.mdx`
- Delete: `content/blog/interactive-maps-clustering.mdx`

**Step 1: Delete the files**

```bash
rm content/blog/mcp-servers-three-languages.mdx
rm content/blog/timezone-five-layers.mdx
rm content/blog/encoding-best-practices-skills.mdx
rm content/blog/web-scraping-survives-changes.mdx
rm content/blog/interactive-maps-clustering.mdx
```

**Step 2: Commit**

```bash
git add -A
git commit -m "chore: remove unwanted blog posts

Removed per user feedback:
- mcp-servers-three-languages.mdx
- timezone-five-layers.mdx
- encoding-best-practices-skills.mdx
- web-scraping-survives-changes.mdx
- interactive-maps-clustering.mdx"
```

---

## Task 2: Create New CLI Tools vs MCP Blog Post

**Files:**
- Create: `content/blog/cli-tools-over-mcp.mdx`

**Step 1: Create the new blog post**

Create `content/blog/cli-tools-over-mcp.mdx` with the following content:

```mdx
---
title: "Why CLI Tools Beat MCP for AI Coding Assistants"
description: "Comparing native CLI tools and Agent Skills to the Model Context Protocol - when simpler is better."
publishedAt: 2026-01-07
tags: ["AI", "tooling", "Claude Code"]
draft: false
---

The Model Context Protocol (MCP) launched in November 2024 as an open standard for AI-tool integration. It gained rapid adoption, but after months of real-world use, a pattern has emerged: native CLI tools often outperform MCP wrappers.

## The Token Problem

MCP's biggest limitation is context consumption. Each MCP server adds tool definitions to your prompt:

- 5 MCP servers: ~55,000 tokens
- Enterprise setups: 100,000-134,000 tokens

That's half of Claude's context window before you've written a single line of code. Meanwhile, the `gh` CLI for GitHub operations uses essentially zero tokens.

<Callout type="info">
A benchmark study found CLI tools use 98.7% fewer tokens than equivalent MCP integrations.
</Callout>

## Why CLI Tools Win

AI models are already trained on common CLI tools. When Claude uses `git`, `npm`, or `gh`, it's leveraging patterns seen millions of times during training:

1. **Zero token overhead**: Tool definitions aren't needed
2. **Predictable behavior**: Deterministic, well-documented commands
3. **Error handling built-in**: Exit codes and stderr are familiar patterns
4. **Composable**: Unix philosophy works naturally

```bash
# MCP approach: Define server, authenticate, consume tokens
# CLI approach: Just run the command
gh pr create --title "Fix bug" --body "Description"
```

## When MCP Makes Sense

MCP isn't wrong—it solves real problems:

- **Stateful tools**: Database connections, authenticated sessions
- **No CLI exists**: Proprietary APIs without command-line interfaces
- **No shell access**: Web-based AI interfaces

But if a good CLI exists, use it directly.

## Agent Skills: Progressive Disclosure

Claude Code's Skills system takes a different approach. Instead of loading all tool definitions upfront, skills use progressive disclosure:

- **Metadata**: ~100 tokens (just enough to identify relevance)
- **Instructions**: Loaded on-demand (<5,000 tokens)
- **Execution**: Runs when needed

This achieves 73% reduction in repetitive prompt engineering according to Anthropic's benchmarks. Skills are markdown files—anyone can write them without coding.

<Callout type="tip">
Skills are model-portable. The same skill works across different Claude contexts, unlike MCP servers tied to specific integrations.
</Callout>

## The Practical Hierarchy

When building AI coding workflows:

1. **Native CLI first**: `git`, `npm`, `docker`, `gh`, platform CLIs
2. **Skills second**: Reusable workflows, domain expertise, organization patterns
3. **MCP last**: Only when CLI/Skills can't solve the problem

## Real-World Example

Consider GitHub operations:

| Approach | Token Cost | Reliability | Speed |
|----------|------------|-------------|-------|
| MCP GitHub Server | ~10,000 tokens | Variable | Slower |
| `gh` CLI | 0 tokens | 100% | Fast |

The CLI wins on every metric when both options exist.

## Takeaways

- MCP solved an important problem but created new ones (token bloat, security risks)
- CLI tools leverage model training, costing nothing in context
- Skills provide reusable workflows without the overhead
- Choose the right tool for the job—usually the simplest one

The best tool integration is often the one that doesn't require integration at all.
```

**Step 2: Commit**

```bash
git add content/blog/cli-tools-over-mcp.mdx
git commit -m "feat: add blog post on CLI tools vs MCP"
```

---

## Task 3: Enhance Live Activities Blog Post

**Files:**
- Modify: `content/blog/live-activities-ios.mdx`

**Step 1: Add conceptual explainer section after the intro**

After line 9 (the intro paragraph), add a new section explaining what Live Activities are:

```mdx

## What Are Live Activities?

Live Activities are a way to display real-time, glanceable information from your app on the Lock Screen and Dynamic Island. Unlike widgets, which update on a schedule, Live Activities are event-driven and time-bound.

### How They Differ From Widgets

| Feature | Widgets | Live Activities |
|---------|---------|-----------------|
| Updates | Scheduled timeline | Event-driven, real-time |
| Duration | Persistent | 8 hours max (+ 4 hours ended state) |
| Location | Home Screen, Today View | Lock Screen, Dynamic Island |
| Use case | At-a-glance info | Active, time-sensitive events |

### Dynamic Island Regions

The Dynamic Island has three presentation modes:

1. **Compact**: Small leading and trailing areas when multiple activities run
2. **Expanded**: Full view when user long-presses or during transitions
3. **Minimal**: Tiny indicator when your activity isn't the primary one

<Callout type="info">
For minimal presentation, keep images under 45×36.67 points. Larger images fail silently.
</Callout>

### Update Mechanisms

Live Activities can be updated two ways:

1. **Direct updates**: Your app updates the activity while running
2. **Push notifications**: Server-initiated updates via APNs with special headers

For push updates, use these APNs headers:
- `apns-topic: <bundle-id>.push-type.liveactivity`
- `apns-push-type: liveactivity`
```

**Step 2: Add real-world impact section before "Full Code"**

Before the "Full Code" section, add:

```mdx

## Why Live Activities Matter

Real-world data shows significant engagement improvements:

- **23.7% higher retention** for apps using Live Activities
- **50% more sessions** for food delivery tracking apps
- **Uber reported** 2.26% reduction in driver cancellations

Users appreciate glanceable status without opening the app.
```

**Step 3: Commit**

```bash
git add content/blog/live-activities-ios.mdx
git commit -m "docs: enhance Live Activities post with conceptual explainer"
```

---

## Task 4: Remove bRadio References from XCUITest Post

**Files:**
- Modify: `content/blog/xcuitest-page-objects.mdx`

**Step 1: Replace "95bFM" button example (line 17)**

Change:
```swift
    app.buttons["95bFM"].tap()
```
To:
```swift
    app.buttons["loginButton"].tap()
```

**Step 2: Replace stationButton identifier (line 42)**

Change:
```swift
        app.buttons[AccessibilityIdentifiers.Home.stationButton("95bFM")]
```
To:
```swift
        app.buttons[AccessibilityIdentifiers.Home.primaryButton]
```

**Step 3: Replace selectStation call (line 74)**

Change:
```swift
    let playerScreen = homeScreen.selectStation("95bFM")
```
To:
```swift
    let detailScreen = homeScreen.tapPrimaryAction()
```

**Step 4: Replace directory structure (lines 185-197)**

Change:
```
bRadioUITests/
├── Base/
│   └── BaseTest.swift
├── PageObjects/
│   ├── HomeScreen.swift
│   ├── PlayerScreen.swift
│   └── TrackListScreen.swift
├── Helpers/
│   └── AccessibilityIdentifiers.swift
└── Tests/
    ├── NavigationTests.swift
    ├── PlayerTests.swift
    └── TrackListTests.swift
```
To:
```
MyAppUITests/
├── Base/
│   └── BaseTest.swift
├── PageObjects/
│   ├── HomeScreen.swift
│   ├── DetailScreen.swift
│   └── SettingsScreen.swift
├── Helpers/
│   └── AccessibilityIdentifiers.swift
└── Tests/
    ├── NavigationTests.swift
    ├── DetailTests.swift
    └── SettingsTests.swift
```

**Step 5: Update AccessibilityIdentifiers enum to be generic**

Update the enum around lines 88-109 to be more generic (remove station-specific references):

```swift
enum AccessibilityIdentifiers {
    enum Home {
        static let primaryButton = "home.primaryButton"
        static let secondaryButton = "home.secondaryButton"
        static let statusBar = "home.statusBar"
    }

    enum Detail {
        static let actionButton = "detail.actionButton"
        static let closeButton = "detail.closeButton"
        static let contentView = "detail.contentView"
    }

    enum Settings {
        static let tableView = "settings.tableView"
        static func settingRow(_ id: String) -> String {
            "settings.row.\(id)"
        }
    }
}
```

**Step 6: Update HomeScreen class to match new identifiers**

Update HomeScreen around lines 33-64:

```swift
// HomeScreen.swift
class HomeScreen {
    let app: XCUIApplication

    init(app: XCUIApplication) {
        self.app = app
    }

    // Elements
    var primaryButton: XCUIElement {
        app.buttons[AccessibilityIdentifiers.Home.primaryButton]
    }

    var statusBar: XCUIElement {
        app.otherElements[AccessibilityIdentifiers.Home.statusBar]
    }

    // Actions
    func tapPrimaryAction() -> DetailScreen {
        primaryButton.tap()
        return DetailScreen(app: app)
    }

    func tapStatusBar() -> DetailScreen {
        statusBar.tap()
        return DetailScreen(app: app)
    }

    // Verification
    func verifyOnScreen() {
        XCTAssertTrue(primaryButton.waitForExistence(timeout: 5))
    }
}
```

**Step 7: Update test example (lines 69-80)**

```swift
func testDetailFlow() {
    let homeScreen = HomeScreen(app: app)
    homeScreen.verifyOnScreen()

    let detailScreen = homeScreen.tapPrimaryAction()
    detailScreen.verifyOnScreen()
    detailScreen.tapAction()

    let settings = detailScreen.openSettings()
    settings.verifyOnScreen()
}
```

**Step 8: Remove GitHub link (line 213)**

Change:
```mdx
See the complete pattern in [bRadio on GitHub](https://github.com/bradleywilson/bRadio).
```
To:
```mdx
Apply this pattern to any iOS app with UI tests.
```

**Step 9: Commit**

```bash
git add content/blog/xcuitest-page-objects.mdx
git commit -m "docs: remove app-specific references from XCUITest post"
```

---

## Task 5: Enhance Snapshot Testing Post

**Files:**
- Modify: `content/blog/snapshot-testing-swiftui.mdx`

**Step 1: Replace bRadioTests directory structure (line 175)**

Change `bRadioTests/` to `MyAppTests/`

**Step 2: Replace bRadio scheme in CI (line 194)**

Change `-scheme bRadio` to `-scheme MyApp`

**Step 3: Add "Why Snapshot Testing?" section after intro**

After line 9, add:

```mdx

## Why Snapshot Testing?

Snapshot testing solves a specific problem: **visual regression detection**. When code changes, you want to know if the UI changed unexpectedly.

### Benefits

1. **Catches unintended changes**: A single property update can break multiple screens
2. **Documents expected appearance**: Reference images serve as visual documentation
3. **Tests multiple configurations automatically**: Device sizes, dark mode, accessibility sizes
4. **Fast feedback**: Run hundreds of visual checks in seconds

### When NOT to Use Snapshots

- **Frequently changing designs**: You'll spend more time updating snapshots than catching bugs
- **User interaction testing**: Use XCUITest for flows and gestures
- **Business logic**: Unit tests are faster and more precise

<Callout type="tip">
Snapshot testing complements—not replaces—unit and UI testing.
</Callout>
```

**Step 4: Add "Debugging Failed Snapshots" section after "Recording Baselines"**

After the "Recording Baselines" section (around line 168), add:

```mdx

## Debugging Failed Snapshots

When a snapshot fails, swift-snapshot-testing creates a diff showing exactly what changed:

```
__Snapshots__/
├── testLoginButton.login_Light.png           # Reference
├── testLoginButton.login_Light.1.png         # Actual (new)
└── testLoginButton.login_Light.diff.png      # Visual diff
```

### Common Causes

1. **Simulator version mismatch**: Different iOS versions render fonts differently
2. **Animation timing**: Async animations can capture mid-transition states
3. **Dynamic content**: Dates, random IDs, or live data appearing in snapshots

### Handling Dynamic Content

Inject fixed values for non-deterministic content:

```swift
func testTimestamp() {
    // Inject fixed date instead of Date()
    let fixedDate = Date(timeIntervalSince1970: 1704067200)
    let view = TimestampView(date: fixedDate)
    assertSnapshot(of: view, as: .image)
}
```

For animations, disable them in your test base class (already shown above).
```

**Step 5: Add "Common Pitfalls" section before "Quick Reference"**

Before the Quick Reference table, add:

```mdx

## Common Pitfalls

### 1. Adding Package to Wrong Target

swift-snapshot-testing must be added to your **test target**, not your app target.

### 2. Global Configuration Bleeding

With Swift Testing (`@Test`), global state can leak between tests. Use scoped configuration:

```swift
withSnapshotTesting(record: .missing) {
    assertSnapshot(of: view, as: .image)
}
```

### 3. Simulator Inconsistency

Pin your CI simulator to match local development:

```yaml
-destination 'platform=iOS Simulator,name=iPhone 16 Pro,OS=18.0'
```

### 4. Large Snapshot Files

Consider Git LFS for projects with many snapshots. Shopify runs ~2,300 snapshot tests; Spotify runs ~1,600.
```

**Step 6: Commit**

```bash
git add content/blog/snapshot-testing-swiftui.mdx
git commit -m "docs: enhance snapshot testing post with pitfalls and debugging"
```

---

## Task 6: Enhance Tuist Post

**Files:**
- Modify: `content/blog/project-generation-tuist.mdx`

**Step 1: Add "Real-World Success Stories" section after "Why Tuist?"**

After line 17, add:

```mdx

## Real-World Success Stories

Major companies have seen dramatic improvements:

| Company | Scale | Build Time Improvement |
|---------|-------|------------------------|
| Trendyol | 170+ developers | 65% faster (30 min → 10 min) |
| Lapse | 220 modules | 75% faster (53 min → 13 min) |
| Back Market | Large team | Up to 90% with full cache |

These aren't synthetic benchmarks—they're production CI pipelines.
```

**Step 2: Add "Common Mistakes" section before "Getting Started"**

Before line 201, add:

```mdx

## Common Mistakes

### 1. Forgetting `tuist install`

Always run `tuist install` before `tuist generate`. Missing this causes cryptic build failures:

```bash
tuist install  # Resolve dependencies first
tuist generate # Then generate project
```

### 2. Using @_exported

Re-exporting modules breaks Tuist's caching:

```swift
// Bad - breaks caching
@_exported import Foundation

// Good - explicit imports
import Foundation
```

### 3. Complex File Structures

Deep, nested directories slow project generation. Keep source organization simple.

### 4. CocoaPods Compatibility

Tuist doesn't support CocoaPods. Migrate dependencies to Swift packages or Carthage before adopting Tuist.
```

**Step 3: Add "Tuist Cloud" section after "Schemes with Coverage"**

After line 188, add:

```mdx

## Tuist Cloud

Tuist Cloud provides remote caching for teams:

- **Up to 90% cache efficiency** on clean builds
- **Shared artifacts**: One developer builds, everyone benefits
- **Insights dashboard**: Track build times and cache hit rates

```bash
# Enable caching
tuist cache warm

# Generate with cached dependencies
tuist generate
```

<Callout type="info">
Tuist 4.0 (2024) added Swift Macro caching and improved multi-platform support.
</Callout>
```

**Step 4: Update "Getting Started" section with more detail**

Replace lines 201-208:

```mdx
## Getting Started

Migration takes 1-3 months for complex projects. Start incrementally:

1. **Install Tuist**: `curl -Ls https://install.tuist.io | bash`
2. **Create scaffolding**: Add `Tuist.swift` and `Project.swift`
3. **Migrate one target**: Start with your app target
4. **Add tests**: Migrate test targets next
5. **Extract patterns**: Create helpers as patterns emerge
6. **Enable caching**: Connect Tuist Cloud for team benefits

<Callout type="warning">
Commit your `Project.swift` and helpers, but add `*.xcodeproj` and `*.xcworkspace` to `.gitignore`.
</Callout>
```

**Step 5: Commit**

```bash
git add content/blog/project-generation-tuist.mdx
git commit -m "docs: enhance Tuist post with real-world data and common mistakes"
```

---

## Task 7: Enhance DataThespian Post

**Files:**
- Modify: `content/blog/swiftdata-datathespian.mdx`

**Step 1: Add attribution and link after intro (line 9)**

Replace line 9:
```mdx
SwiftData is Apple's modern persistence framework. But with Swift 6's strict concurrency, using it safely requires care. DataThespian provides a clean solution.
```
With:
```mdx
SwiftData is Apple's modern persistence framework. But with Swift 6's strict concurrency, using it safely requires care. [DataThespian](https://github.com/brightdigit/DataThespian), created by Leo Dion at BrightDigit, provides a clean solution.

<Callout type="info">
DataThespian is an open-source library, not my creation. This post explains how I've used it in my projects.
</Callout>
```

**Step 2: Add "Why DataThespian?" section after "The Concurrency Problem"**

After line 22, add:

```mdx

## Why DataThespian?

DataThespian wraps SwiftData's `ModelActor` pattern in a developer-friendly API:

### Key Benefits

1. **Thread-safe by default**: All database operations isolated in an actor
2. **Type-safe queries**: Compile-time validated predicates and selectors
3. **SwiftUI integration**: Environment-based database access via `@Environment(\.database)`
4. **CloudKit support**: Works seamlessly with iCloud sync
5. **Clean API**: Simple `fetch`, `insert`, and `save` methods

### Requirements

- Swift 6.0+
- iOS 17+, macOS 14+, watchOS 10+, tvOS 17+
- Xcode 16.0+

### Installation

```swift
// Package.swift
.package(url: "https://github.com/brightdigit/DataThespian", from: "1.0.0")
```
```

**Step 3: Add "Resources" section at the end**

After line 201, add:

```mdx

## Resources

- [DataThespian on GitHub](https://github.com/brightdigit/DataThespian) - Source code and documentation
- [BrightDigit](https://brightdigit.com) - Leo Dion's company, creators of DataThespian
- [Swift Package Index](https://swiftpackageindex.com/brightdigit/DataThespian) - Package documentation
- [Apple's Swift Concurrency Documentation](https://developer.apple.com/documentation/swift/concurrency) - Understanding actors and sendability
```

**Step 4: Commit**

```bash
git add content/blog/swiftdata-datathespian.mdx
git commit -m "docs: add DataThespian attribution and installation details"
```

---

## Task 8: Verify Build

**Step 1: Run build**

```bash
npm run build
```

**Step 2: Verify all pages generate successfully**

Expected: Build completes without errors, showing the correct number of pages (should be fewer than before due to deleted posts).

**Step 3: Commit if any build fixes needed**

Only if build reveals issues.

---

## Task 9: Final Verification

**Step 1: Start dev server**

```bash
npm run dev
```

**Step 2: Test affected posts**

Visit and verify each modified post renders correctly:
- `/blog/cli-tools-over-mcp` (new post)
- `/blog/live-activities-ios` (enhanced)
- `/blog/xcuitest-page-objects` (updated)
- `/blog/snapshot-testing-swiftui` (enhanced)
- `/blog/project-generation-tuist` (enhanced)
- `/blog/swiftdata-datathespian` (attribution added)

**Step 3: Verify deleted posts return 404**

- `/blog/mcp-servers-three-languages` → 404
- `/blog/timezone-five-layers` → 404
- `/blog/encoding-best-practices-skills` → 404
- `/blog/web-scraping-survives-changes` → 404
- `/blog/interactive-maps-clustering` → 404

---
