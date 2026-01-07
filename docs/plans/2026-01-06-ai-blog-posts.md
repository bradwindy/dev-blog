# AI-Generated Blog Posts Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use hyperpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Create 12 unique, high-quality blog posts for windybank.net based on Bradley's recent development work across 12 repositories.

**Architecture:** Each blog post is a standalone MDX file in `/content/blog/` with YAML frontmatter. Posts use the existing `Callout` component and Shiki syntax highlighting. Variety is achieved through different content formats (tutorial, deep-dive, case study, thought piece, quick tips) and writing styles.

**Tech Stack:** Next.js 15 MDX blog with gray-matter frontmatter parsing, Shiki highlighting, and Tailwind CSS styling.

---

## Blog Post Overview

| # | Title | Format | Repo | Tags |
|---|-------|--------|------|------|
| 1 | Geohash-Based IDs: A Clever Pattern for Location Data | Deep Dive | nz-speed-cameras | `Next.js`, `GIS`, `patterns` |
| 2 | Building MCP Servers in Three Languages | Tutorial | mcp-apple-notes, app-intents-mcp, mcp-ical | `MCP`, `TypeScript`, `Swift`, `Python` |
| 3 | Live Activities in iOS: From Concept to Lock Screen | Tutorial | TopographicNZ | `iOS`, `SwiftUI`, `ActivityKit` |
| 4 | Integrating Apple's JournalingSuggestions API | Deep Dive | HabitTracker | `iOS`, `SwiftUI`, `JournalingSuggestions` |
| 5 | The Timezone Problem: A 5-Layer Solution | Case Study | mcp-ical | `Python`, `datetime`, `architecture` |
| 6 | XCUITest Page Objects: Maintainable iOS UI Testing | Tutorial | bRadio | `iOS`, `testing`, `XCUITest` |
| 7 | Snapshot Testing SwiftUI: Multi-Device, Multi-Theme | Quick Tips | bRadio, HabitTracker | `iOS`, `testing`, `SwiftUI` |
| 8 | Encoding Best Practices in Claude Code Skills | Thought Piece | hyperpowers | `AI`, `Claude`, `developer-experience` |
| 9 | Project Generation with Tuist | Tutorial | bRadio, TopographicNZ | `iOS`, `Tuist`, `tooling` |
| 10 | Web Scraping That Survives HTML Changes | Case Study | nz-speed-cameras | `Next.js`, `scraping`, `patterns` |
| 11 | Interactive Maps at Scale: Clustering 900+ Markers | Tutorial | nz-speed-cameras | `React`, `Leaflet`, `performance` |
| 12 | SwiftData + DataThespian: Thread-Safe Persistence | Deep Dive | HabitTracker, TopographicNZ | `iOS`, `SwiftData`, `concurrency` |

---

## Task 1: Geohash-Based IDs Deep Dive

**Files:**
- Create: `/Users/bradley/Developer/dev-blog/content/blog/geohash-based-ids.mdx`

**Step 1: Write the MDX file**

```mdx
---
title: "Geohash-Based IDs: A Clever Pattern for Location Data"
description: "How to use geohashing to create unique, deterministic identifiers from coordinates without a central database."
publishedAt: 2026-01-06
tags: ["Next.js", "GIS", "patterns"]
draft: false
---

When building the NZ Speed Camera Map, I needed unique IDs for 896 cameras. The catch: no database, just coordinate data from a government CSV. Geohashing solved this elegantly.

<Callout type="tip">
Geohashes encode latitude/longitude into a string where nearby locations share prefixes. An 8-character geohash gives ~19m precision—perfect for distinguishing cameras.
</Callout>

## The Problem

Government data includes coordinates but no stable IDs. Camera names change. Addresses vary. I needed IDs that:
- Stay consistent across data updates
- Require no central authority
- Allow proximity queries

## The Solution

```typescript
import ngeohash from 'ngeohash';

export function generateCameraId(lat: number, lng: number): string {
  return ngeohash.encode(lat, lng, 8);  // ~19m precision
}
```

An 8-character geohash like `rbsm6p7q` uniquely identifies a camera's location. Even if metadata changes, coordinates don't—so the ID remains stable.

## Precision Levels

| Characters | Precision | Use Case |
|------------|-----------|----------|
| 4 | ~20km | City-level |
| 6 | ~600m | Neighborhood |
| 8 | ~19m | Building |
| 10 | ~1m | Exact point |

## Practical Benefits

**Deduplication**: When scraping data, duplicates naturally collapse:

```typescript
const uniqueCameras = Array.from(
  new Map(cameras.map((c) => [c.id, c])).values()
);
```

**Proximity**: Cameras with shared prefixes are nearby—useful for clustering.

**SEO-friendly slugs**: Combine geohash with readable info:

```typescript
const slug = `auckland-cbd-${geohash.slice(0, 6)}`;
```

## When to Use This Pattern

- Static datasets with coordinates
- No database available
- Need deterministic IDs from location data
- Want built-in proximity information

<Callout type="info">
This pattern won't work for moving objects or when sub-meter precision matters. For those cases, use UUIDs with a coordinate lookup.
</Callout>

## Code

The full implementation is in [nz-speed-cameras on GitHub](https://github.com/bradleywilson/nz-speed-cameras).
```

**Step 2: Verify the file renders**

Run: `npm run dev` and visit `http://localhost:3000/blog/geohash-based-ids`
Expected: Post renders with syntax highlighting, callouts, and table

**Step 3: Commit**

```bash
git add content/blog/geohash-based-ids.mdx
git commit -m "$(cat <<'EOF'
feat(blog): add geohash-based IDs deep dive post

Explains using geohashing to create deterministic location-based IDs
without a central database, based on the nz-speed-cameras project.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Building MCP Servers in Three Languages

**Files:**
- Create: `/Users/bradley/Developer/dev-blog/content/blog/mcp-servers-three-languages.mdx`

**Step 1: Write the MDX file**

```mdx
---
title: "Building MCP Servers in Three Languages"
description: "Comparing TypeScript, Swift, and Python approaches to building Model Context Protocol servers for Claude."
publishedAt: 2026-01-07
tags: ["MCP", "TypeScript", "Swift", "Python"]
draft: false
---

I've built three MCP servers in three different languages. Here's what I learned about each approach.

<Callout type="info">
MCP (Model Context Protocol) is an open standard for connecting AI assistants to external tools and data. Think of it as "USB-C for AI."
</Callout>

## The Three Servers

| Server | Language | Purpose |
|--------|----------|---------|
| mcp-apple-notes | TypeScript | Semantic search over Apple Notes |
| app-intents-mcp | Swift | Expose macOS App Intents to Claude |
| mcp-ical | Python | Calendar management with timezone handling |

## TypeScript: mcp-apple-notes

Best for: Rapid development, npm ecosystem, vector search integrations.

```typescript
// index.ts
const server = new Server(
  { name: "apple-notes", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    { name: "search-notes", description: "Semantic search...", inputSchema: {...} },
    { name: "create-note", description: "Create a new note", inputSchema: {...} }
  ]
}));
```

**Key features:**
- LanceDB for vector embeddings with HuggingFace model
- Hybrid search using Reciprocal Rank Fusion
- Direct SQLite access to Apple Notes database

## Swift: app-intents-mcp

Best for: macOS system integration, App Intents discovery, native performance.

```swift
// Server.swift
public actor Server {
    func handleListTools() async -> ListToolsResult {
        return ListToolsResult(tools: [
            Tool(name: "list_intents", description: "List available intents"),
            Tool(name: "run_intent", description: "Execute an intent")
        ])
    }
}
```

**Key features:**
- Actor-based concurrency for thread safety
- Bundle scanning for intent discovery
- Shortcuts bridge for execution

## Python: mcp-ical

Best for: EventKit via PyObjC, complex domain logic, rapid prototyping.

```python
# server.py
@server.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(name="list_events", description="List calendar events"),
        Tool(name="create_event", description="Create a calendar event")
    ]
```

**Key features:**
- 5-layer timezone handling architecture
- Recurring event support with occurrence matching
- Natural language event creation

## Comparison

| Aspect | TypeScript | Swift | Python |
|--------|------------|-------|--------|
| Setup time | Fast (npm) | Medium (SPM) | Fast (uv/pip) |
| Type safety | Good | Excellent | Moderate |
| macOS APIs | Via bridges | Native | Via PyObjC |
| Ecosystem | Massive | Growing | Large |
| Debugging | Good | Excellent | Good |

## Which Should You Choose?

- **TypeScript**: Web services, databases, vector search
- **Swift**: macOS system integration, performance-critical
- **Python**: Prototyping, complex logic, scientific computing

<Callout type="tip">
Start with Python for prototyping, then port to TypeScript or Swift for production if needed.
</Callout>

## Resources

- [MCP Specification](https://modelcontextprotocol.io)
- [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Python SDK](https://github.com/modelcontextprotocol/python-sdk)
```

**Step 2: Verify the file renders**

Run: `npm run dev` and visit `http://localhost:3000/blog/mcp-servers-three-languages`

**Step 3: Commit**

```bash
git add content/blog/mcp-servers-three-languages.mdx
git commit -m "$(cat <<'EOF'
feat(blog): add MCP servers comparison post

Compares building MCP servers in TypeScript, Swift, and Python
based on three real implementations.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Live Activities in iOS Tutorial

**Files:**
- Create: `/Users/bradley/Developer/dev-blog/content/blog/live-activities-ios.mdx`

**Step 1: Write the MDX file**

```mdx
---
title: "Live Activities in iOS: From Concept to Lock Screen"
description: "A practical guide to implementing Live Activities with ActivityKit, including navigation display and Dynamic Island integration."
publishedAt: 2026-01-08
tags: ["iOS", "SwiftUI", "ActivityKit"]
draft: false
---

Live Activities display real-time information on the Lock Screen and Dynamic Island. Here's how I implemented them for GPS track recording in TopographicNZ.

## What You'll Build

A Live Activity showing:
- Recording duration and distance
- Current elevation
- Navigation info (bearing, distance to waypoint)

## Prerequisites

- iOS 16.1+ target
- Widget Extension added to your project
- `NSSupportsLiveActivities` set to `YES` in Info.plist

## Step 1: Define ActivityAttributes

Create a struct describing your activity's data:

```swift
// TrackRecordingAttributes.swift
import ActivityKit

struct TrackRecordingAttributes: ActivityAttributes {
    // Static data (doesn't change during activity)
    let trackName: String

    // Dynamic data (updates throughout)
    struct ContentState: Codable, Hashable {
        let duration: TimeInterval
        let distance: Double  // meters
        let elevation: Double
        let navigationTarget: String?
        let distanceToTarget: Double?
        let bearingToTarget: Double?
    }
}
```

<Callout type="tip">
Keep `ContentState` small. ActivityKit has payload limits, and smaller updates are faster.
</Callout>

## Step 2: Create the Widget Extension

In your Widget Extension, define the activity configuration:

```swift
// TopographicNZWidgetsLiveActivity.swift
struct TrackRecordingActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: TrackRecordingAttributes.self) { context in
            // Lock Screen view
            LockScreenView(context: context)
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Label(formatDuration(context.state.duration),
                          systemImage: "timer")
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Label(formatDistance(context.state.distance),
                          systemImage: "figure.walk")
                }
                DynamicIslandExpandedRegion(.bottom) {
                    if let target = context.state.navigationTarget {
                        NavigationRow(target: target,
                                     distance: context.state.distanceToTarget,
                                     bearing: context.state.bearingToTarget)
                    }
                }
            } compactLeading: {
                Image(systemName: "record.circle")
                    .foregroundColor(.red)
            } compactTrailing: {
                Text(formatDuration(context.state.duration))
                    .monospacedDigit()
            } minimal: {
                Image(systemName: "record.circle")
                    .foregroundColor(.red)
            }
        }
    }
}
```

## Step 3: Start the Activity

In your main app, request the Live Activity:

```swift
// LiveActivityService.swift
@MainActor
class LiveActivityService {
    private var currentActivity: Activity<TrackRecordingAttributes>?

    func startRecording(trackName: String) throws {
        let attributes = TrackRecordingAttributes(trackName: trackName)
        let initialState = TrackRecordingAttributes.ContentState(
            duration: 0,
            distance: 0,
            elevation: 0,
            navigationTarget: nil,
            distanceToTarget: nil,
            bearingToTarget: nil
        )

        currentActivity = try Activity.request(
            attributes: attributes,
            content: .init(state: initialState, staleDate: nil)
        )
    }
}
```

## Step 4: Update the Activity

Send updates as your data changes:

```swift
func updateRecording(duration: TimeInterval, distance: Double, elevation: Double) async {
    guard let activity = currentActivity else { return }

    let updatedState = TrackRecordingAttributes.ContentState(
        duration: duration,
        distance: distance,
        elevation: elevation,
        navigationTarget: navigationTarget,
        distanceToTarget: distanceToTarget,
        bearingToTarget: bearingToTarget
    )

    await activity.update(
        ActivityContent(state: updatedState, staleDate: nil)
    )
}
```

<Callout type="warning">
Don't update too frequently. Once per second is plenty for most use cases. More frequent updates drain battery.
</Callout>

## Step 5: End the Activity

Clean up when recording stops:

```swift
func stopRecording() async {
    guard let activity = currentActivity else { return }

    let finalState = activity.content.state
    await activity.end(
        ActivityContent(state: finalState, staleDate: nil),
        dismissalPolicy: .default
    )
    currentActivity = nil
}
```

## Testing Tips

1. **Simulator limitations**: Dynamic Island requires a physical device
2. **Use previews**: SwiftUI Previews work for Lock Screen views
3. **Check Info.plist**: `NSSupportsLiveActivities` must be `YES`

## Common Gotchas

- **Codable conformance**: `ContentState` must be Codable and Hashable
- **Size limits**: Keep content state under 4KB
- **Duration**: Activities auto-end after 8 hours
- **Widget extension**: Live Activities run in the extension process, not your app

## Full Code

See the complete implementation in [TopographicNZ on GitHub](https://github.com/bradleywilson/TopographicNZ).
```

**Step 2: Verify and commit** (same pattern as above)

---

## Task 4: JournalingSuggestions API Deep Dive

**Files:**
- Create: `/Users/bradley/Developer/dev-blog/content/blog/journaling-suggestions-api.mdx`

**Step 1: Write the MDX file**

```mdx
---
title: "Integrating Apple's JournalingSuggestions API"
description: "A comprehensive guide to parsing journaling suggestions, handling 11+ content types, and navigating Swift 6 concurrency challenges."
publishedAt: 2026-01-09
tags: ["iOS", "SwiftUI", "JournalingSuggestions"]
draft: false
---

Apple's JournalingSuggestions API surfaces meaningful moments from device data—photos, workouts, locations, and more. Here's how I integrated it into HabitTracker, including the Swift 6 compatibility challenges.

<Callout type="info">
JournalingSuggestions requires iOS 17.2+ and only works on physical devices. The picker runs out-of-process for privacy.
</Callout>

## What JournalingSuggestions Provides

The API surfaces 11+ content types:
- Photos and videos
- Workouts and motion activity
- Locations and contacts
- Songs and podcasts
- Reflections and state of mind (iOS 18+)

## The Privacy Model

Users explicitly select suggestions through a system picker. Your app never sees:
- Unselected suggestions
- Raw device data
- Suggestion metadata

This is intentional—privacy by design.

## Basic Implementation

```swift
import JournalingSuggestions
import SwiftUI

struct JournalEditorView: View {
    @State private var selectedSuggestion: JournalingSuggestion?

    var body: some View {
        VStack {
            JournalingSuggestionsPicker(label: "Add from Suggestions") { suggestion in
                self.selectedSuggestion = suggestion
                await parseSuggestion(suggestion)
            }
        }
    }
}
```

## Parsing Content Types

Each suggestion contains typed content. Here's how to extract it:

```swift
func parseSuggestion(_ suggestion: JournalingSuggestion) async {
    for item in suggestion.content {
        switch item {
        case let photo as JournalingSuggestion.Photo:
            await handlePhoto(photo)
        case let workout as JournalingSuggestion.Workout:
            handleWorkout(workout)
        case let location as JournalingSuggestion.Location:
            handleLocation(location)
        case let contact as JournalingSuggestion.Contact:
            handleContact(contact)
        case let song as JournalingSuggestion.Song:
            handleSong(song)
        // ... handle other types
        default:
            print("Unknown content type: \(type(of: item))")
        }
    }
}
```

## Swift 6 Concurrency Challenge

The JournalingSuggestions framework isn't fully Sendable-compliant. You'll hit this error:

```
'@preconcurrency' attribute on module 'JournalingSuggestions' is
deprecated; this module is now Sendable-safe
```

The fix: Use `@preconcurrency import`:

```swift
@preconcurrency import JournalingSuggestions
```

<Callout type="warning">
This is a known issue. Apple's framework predates strict concurrency checking. The `@preconcurrency` import suppresses the warning without breaking functionality.
</Callout>

## Handling Photos and Videos

Photos require async loading:

```swift
func handlePhoto(_ photo: JournalingSuggestion.Photo) async {
    // Load the image data
    if let data = try? await photo.photo.load() {
        let uiImage = UIImage(data: data)
        // Use the image...
    }
}
```

Videos have platform differences:

```swift
func handleVideo(_ video: JournalingSuggestion.LivePhoto) async {
    #if targetEnvironment(simulator)
    // Simulator: Use still image fallback
    if let imageData = try? await video.photo.load() {
        // Handle as image
    }
    #else
    // Device: Access video asset
    if let videoURL = video.video {
        // Handle video playback
    }
    #endif
}
```

## Deep Linking to Apple Apps

Make locations open in Maps:

```swift
func openInMaps(_ location: JournalingSuggestion.Location) {
    let coordinate = location.location.coordinate
    let url = URL(string: "maps://?ll=\(coordinate.latitude),\(coordinate.longitude)")!
    UIApplication.shared.open(url)
}
```

Make songs open in Apple Music:

```swift
func openInMusic(_ song: JournalingSuggestion.Song) {
    if let musicURL = URL(string: "music://music.apple.com/search?term=\(song.song.title)") {
        UIApplication.shared.open(musicURL)
    }
}
```

## Testing Strategy

Since the picker only works on device:

1. **Unit test parsing logic** with mock data
2. **Snapshot test UI components** with synthetic suggestions
3. **Manual test** the full flow on device

```swift
// Mock suggestion for testing
extension JournalingSuggestion {
    static var mockPhoto: Self {
        // Create mock for snapshot tests
    }
}
```

## iOS 18 Additions

iOS 18 adds:
- **State of Mind**: Mood and emotion tracking from Health
- **Reflection Prompts**: Writing prompts for self-reflection
- **Generic Media**: Third-party apps (Spotify, Pocket Casts)

Check availability:

```swift
if #available(iOS 18, *) {
    // Handle state of mind suggestions
}
```

## Full Implementation

See the complete parser in [HabitTracker on GitHub](https://github.com/bradleywilson/HabitTracker).
```

**Step 2: Verify and commit**

---

## Task 5: Timezone Problem Case Study

**Files:**
- Create: `/Users/bradley/Developer/dev-blog/content/blog/timezone-five-layers.mdx`

**Step 1: Write the MDX file**

```mdx
---
title: "The Timezone Problem: A 5-Layer Solution"
description: "How a simple calendar MCP server led to a comprehensive timezone handling architecture."
publishedAt: 2026-01-10
tags: ["Python", "datetime", "architecture"]
draft: false
---

Building an MCP server for calendar management seemed straightforward—until I hit timezones. What started as a simple bug fix became a complete architectural redesign.

## The Problem

EventKit (Apple's calendar framework) requires naive datetimes in local time. But MCP tools receive timezone-aware datetimes. And recurring events span timezone boundaries.

Initial symptoms:
- Events created at wrong times
- Recurring event updates failing
- Cross-timezone queries returning wrong results

## The Wrong Approach

My first fix: Convert everything to UTC.

```python
# DON'T DO THIS
def to_utc(dt: datetime) -> datetime:
    return dt.astimezone(timezone.utc)
```

This broke immediately. EventKit doesn't want UTC—it wants naive local time. Converting to UTC then stripping timezone info shifted events by hours.

## The 5-Layer Architecture

After much debugging, I developed a 5-layer approach:

### Layer 1: Model Layer (Always Aware)

All internal `Event` objects use timezone-aware datetimes:

```python
@dataclass
class Event:
    start: datetime  # Always timezone-aware
    end: datetime    # Always timezone-aware
    timezone: str    # Original timezone for display
```

### Layer 2: Input Boundary

Convert incoming datetimes to aware local time immediately:

```python
def normalize_input(dt: datetime | str) -> datetime:
    if isinstance(dt, str):
        dt = parser.parse(dt)

    if dt.tzinfo is None:
        # Assume local timezone for naive inputs
        return dt.replace(tzinfo=get_local_timezone())

    # Convert to local for consistent handling
    return dt.astimezone(get_local_timezone())
```

### Layer 3: EventKit Boundary

Convert to naive local time only at the EventKit API boundary:

```python
def to_eventkit_datetime(dt: datetime) -> datetime:
    """Convert to naive local time for EventKit."""
    if dt.tzinfo is not None:
        local_dt = dt.astimezone(get_local_timezone())
        return local_dt.replace(tzinfo=None)
    return dt
```

<Callout type="tip">
This is the key insight: Keep datetimes aware internally, convert to naive only at the OS API boundary.
</Callout>

### Layer 4: Query Normalization

For date range queries, normalize boundaries to local midnight:

```python
def normalize_query_range(start: datetime, end: datetime) -> tuple[datetime, datetime]:
    """Ensure query boundaries align with local calendar days."""
    local_start = start.astimezone(get_local_timezone())
    local_end = end.astimezone(get_local_timezone())

    # Align to start/end of day
    day_start = local_start.replace(hour=0, minute=0, second=0, microsecond=0)
    day_end = local_end.replace(hour=23, minute=59, second=59, microsecond=999999)

    return day_start, day_end
```

### Layer 5: Occurrence Matching

For recurring events, match specific occurrences across timezone changes:

```python
def find_event_occurrence(
    self,
    event_id: str,
    occurrence_date: datetime
) -> Event | None:
    """Find a specific occurrence of a recurring event."""
    event = self.get_event(event_id)
    if not event:
        return None

    # Normalize the target date to local timezone
    target_local = occurrence_date.astimezone(get_local_timezone())
    target_date = target_local.date()

    # Find occurrences on that date
    for occurrence in event.occurrences(target_date, target_date):
        if occurrence.start.date() == target_date:
            return occurrence

    return None
```

## The Result

After implementing all 5 layers:
- Events created at correct times regardless of input format
- Recurring events update correctly
- Cross-timezone queries return expected results
- Users in any timezone get consistent behavior

## Lessons Learned

1. **Naive datetimes are a code smell**—make everything aware internally
2. **Boundary conversion is key**—convert at the edges, not throughout
3. **Test across timezones**—set `TZ` environment variable in tests
4. **Document assumptions**—which layers expect which formats

<Callout type="warning">
If you're storing datetimes, store them with timezone info. Naive datetimes are only acceptable at API boundaries that require them.
</Callout>

## Full Implementation

See the complete timezone handling in [mcp-ical on GitHub](https://github.com/bradleywilson/mcp-ical).
```

**Step 2: Verify and commit**

---

## Task 6: XCUITest Page Objects Tutorial

**Files:**
- Create: `/Users/bradley/Developer/dev-blog/content/blog/xcuitest-page-objects.mdx`

**Step 1: Write the MDX file**

```mdx
---
title: "XCUITest Page Objects: Maintainable iOS UI Testing"
description: "How to use the Page Object pattern to write UI tests that don't break with every UI change."
publishedAt: 2026-01-11
tags: ["iOS", "testing", "XCUITest"]
draft: false
---

UI tests are notoriously fragile. A button moves, a label changes, and suddenly half your tests fail. The Page Object pattern fixes this by encapsulating UI structure in reusable objects.

## The Problem

Without Page Objects, tests look like this:

```swift
func testPlayerFlow() {
    app.buttons["95bFM"].tap()
    app.buttons["play.circle.fill"].tap()
    XCTAssertTrue(app.staticTexts["Now Playing"].exists)
    app.buttons["list.bullet"].tap()
    // ... more element queries scattered everywhere
}
```

When the UI changes, you update dozens of tests.

## The Solution: Page Objects

Encapsulate each screen in a class:

```swift
// HomeScreen.swift
class HomeScreen {
    let app: XCUIApplication

    init(app: XCUIApplication) {
        self.app = app
    }

    // Elements
    var stationButton95bFM: XCUIElement {
        app.buttons[AccessibilityIdentifiers.Home.stationButton("95bFM")]
    }

    var nowPlayingBar: XCUIElement {
        app.otherElements[AccessibilityIdentifiers.Home.nowPlayingBar]
    }

    // Actions
    func selectStation(_ name: String) -> PlayerScreen {
        app.buttons[AccessibilityIdentifiers.Home.stationButton(name)].tap()
        return PlayerScreen(app: app)
    }

    func tapNowPlayingBar() -> PlayerScreen {
        nowPlayingBar.tap()
        return PlayerScreen(app: app)
    }

    // Verification
    func verifyOnScreen() {
        XCTAssertTrue(stationButton95bFM.waitForExistence(timeout: 5))
    }
}
```

Now tests read like user stories:

```swift
func testPlayerFlow() {
    let homeScreen = HomeScreen(app: app)
    homeScreen.verifyOnScreen()

    let playerScreen = homeScreen.selectStation("95bFM")
    playerScreen.verifyOnScreen()
    playerScreen.tapPlay()

    let trackList = playerScreen.openTrackList()
    trackList.verifyOnScreen()
}
```

## Centralized Accessibility Identifiers

Define identifiers in one place:

```swift
// AccessibilityIdentifiers.swift
enum AccessibilityIdentifiers {
    enum Home {
        static let nowPlayingBar = "home.nowPlayingBar"
        static func stationButton(_ station: String) -> String {
            "home.station.\(station)"
        }
    }

    enum Player {
        static let playButton = "player.playButton"
        static let pauseButton = "player.pauseButton"
        static let trackListButton = "player.trackListButton"
    }

    enum TrackList {
        static let collectionView = "trackList.collectionView"
        static func trackRow(_ id: String) -> String {
            "trackList.row.\(id)"
        }
    }
}
```

<Callout type="tip">
Use descriptive, hierarchical identifiers. `player.playButton` is easier to debug than `btn1`.
</Callout>

## Base Test Class

Reduce boilerplate with a base class:

```swift
// BaseTest.swift
class BaseTest: XCTestCase {
    var app: XCUIApplication!

    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        app.launchArguments = ["--uitesting", "--reset-data"]
        app.launchEnvironment = [
            "UITESTING": "1",
            "ANIMATION_SPEED": "0"
        ]
        app.launch()
    }

    func waitForElement(_ element: XCUIElement, timeout: TimeInterval = 5) -> Bool {
        element.waitForExistence(timeout: timeout)
    }
}
```

## Handling Platform Quirks

iOS has some UI testing quirks. Here's how to handle them:

### Tab Bar Identifiers

iOS 26's Tab API doesn't propagate accessibility identifiers:

```swift
// Workaround: Match by label
var homeTab: XCUIElement {
    app.buttons["Home"]  // Use visible label, not identifier
}
```

### Volume Slider

`MPVolumeView` doesn't expose proper identifiers:

```swift
var volumeSlider: XCUIElement {
    // Fall back to first slider on screen
    app.sliders.firstMatch
}
```

### Custom Gestures

Some views need custom dismiss gestures:

```swift
func dismissTrackList() {
    let start = app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.2))
    let end = app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.9))
    start.press(forDuration: 0.1, thenDragTo: end)
}
```

## Test Organization

Structure tests by user flow:

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

## Benefits

1. **Maintenance**: UI changes affect one Page Object, not all tests
2. **Readability**: Tests read like user stories
3. **Reusability**: Common actions defined once
4. **Debugging**: Clear structure makes failures easier to diagnose

<Callout type="info">
Page Objects add initial setup time, but pay off quickly as your test suite grows.
</Callout>

## Full Implementation

See the complete pattern in [bRadio on GitHub](https://github.com/bradleywilson/bRadio).
```

**Step 2: Verify and commit**

---

## Task 7: Snapshot Testing Quick Tips

**Files:**
- Create: `/Users/bradley/Developer/dev-blog/content/blog/snapshot-testing-swiftui.mdx`

**Step 1: Write the MDX file**

```mdx
---
title: "Snapshot Testing SwiftUI: Multi-Device, Multi-Theme"
description: "Quick tips for setting up comprehensive snapshot testing across devices and color schemes."
publishedAt: 2026-01-12
tags: ["iOS", "testing", "SwiftUI"]
draft: false
---

Snapshot testing catches visual regressions automatically. Here's how to test SwiftUI views across multiple devices and themes efficiently.

## Setup

Install swift-snapshot-testing:

```swift
// Package.swift
.package(url: "https://github.com/pointfreeco/swift-snapshot-testing", from: "1.17.0")
```

## Device Configurations

Define reusable device configs:

```swift
// SnapshotConfiguration.swift
import SnapshotTesting

enum DeviceConfig {
    static let iPhone16 = ViewImageConfig.iPhone13Pro
    static let iPadAir = ViewImageConfig.iPadPro11
}

enum ScreenConfiguration: CaseIterable {
    case iPhoneLight, iPhoneDark, iPadLight, iPadDark

    var config: ViewImageConfig {
        switch self {
        case .iPhoneLight, .iPhoneDark: return DeviceConfig.iPhone16
        case .iPadLight, .iPadDark: return DeviceConfig.iPadAir
        }
    }

    var traits: UITraitCollection {
        switch self {
        case .iPhoneLight, .iPadLight:
            return UITraitCollection(userInterfaceStyle: .light)
        case .iPhoneDark, .iPadDark:
            return UITraitCollection(userInterfaceStyle: .dark)
        }
    }
}
```

## Base Test Case

Disable animations for deterministic snapshots:

```swift
// SnapshotTestCase.swift
class SnapshotTestCase: XCTestCase {
    override func setUp() {
        super.setUp()
        UIView.setAnimationsEnabled(false)
    }

    override func tearDown() {
        UIView.setAnimationsEnabled(true)
        super.tearDown()
    }
}
```

## Helper Methods

Test all configurations at once:

```swift
extension SnapshotTestCase {
    func assertSnapshots<V: View>(
        of view: V,
        named name: String,
        file: StaticString = #file,
        testName: String = #function,
        line: UInt = #line
    ) {
        for config in ScreenConfiguration.allCases {
            assertSnapshot(
                of: view,
                as: .image(
                    layout: .device(config: config.config),
                    traits: config.traits
                ),
                named: "\(name)_\(config)",
                file: file,
                testName: testName,
                line: line
            )
        }
    }

    func assertComponentSnapshots<V: View>(
        of view: V,
        named name: String,
        size: CGSize,
        file: StaticString = #file,
        testName: String = #function,
        line: UInt = #line
    ) {
        // Components: just light/dark, fixed size
        for style in [UIUserInterfaceStyle.light, .dark] {
            assertSnapshot(
                of: view,
                as: .image(
                    layout: .fixed(width: size.width, height: size.height),
                    traits: UITraitCollection(userInterfaceStyle: style)
                ),
                named: "\(name)_\(style == .light ? "Light" : "Dark")",
                file: file,
                testName: testName,
                line: line
            )
        }
    }
}
```

<Callout type="tip">
Use `assertSnapshots` for full screens, `assertComponentSnapshots` for isolated components.
</Callout>

## Writing Tests

```swift
class CircleButtonSnapshotTests: SnapshotTestCase {
    func testPlayButton() {
        let view = CircleButton(size: 60, icon: "play.fill") {}
        assertComponentSnapshots(
            of: view,
            named: "play",
            size: CGSize(width: 80, height: 80)
        )
    }

    func testPauseButtonLarge() {
        let view = CircleButton(size: 120, icon: "pause.fill") {}
        assertComponentSnapshots(
            of: view,
            named: "pause_large",
            size: CGSize(width: 140, height: 140)
        )
    }
}
```

## Recording Baselines

First run creates reference images:

```bash
RECORD_SNAPSHOTS=1 xcodebuild test ...
```

Or in code:

```swift
// Temporarily set to record
isRecording = true
```

## Directory Structure

Snapshots organize automatically:

```
bRadioTests/
└── Snapshots/
    └── Components/
        └── CircleButtonSnapshotTests/
            └── __Snapshots__/
                ├── testPlayButton.play_Light.png
                ├── testPlayButton.play_Dark.png
                ├── testPauseButtonLarge.pause_large_Light.png
                └── testPauseButtonLarge.pause_large_Dark.png
```

## CI Integration

Fail on differences:

```yaml
- name: Run snapshot tests
  run: |
    xcodebuild test \
      -scheme bRadio \
      -destination 'platform=iOS Simulator,name=iPhone 15 Pro' \
      -resultBundlePath TestResults.xcresult
```

<Callout type="warning">
Simulator differences can cause false failures. Pin simulator versions in CI.
</Callout>

## Quick Reference

| Scenario | Method | Size |
|----------|--------|------|
| Full screen | `assertSnapshots` | Device-based |
| Component | `assertComponentSnapshots` | Fixed |
| Single config | `assertSnapshot` | Manual |

Snapshot testing catches regressions before users do.
```

**Step 2: Verify and commit**

---

## Task 8: Claude Code Skills Thought Piece

**Files:**
- Create: `/Users/bradley/Developer/dev-blog/content/blog/encoding-best-practices-skills.mdx`

**Step 1: Write the MDX file**

```mdx
---
title: "Encoding Best Practices in Claude Code Skills"
description: "Thoughts on capturing development workflows as executable documentation that AI assistants can follow."
publishedAt: 2026-01-13
tags: ["AI", "Claude", "developer-experience"]
draft: false
---

What if your best practices didn't just live in wikis—what if they were executable? That's the premise behind Claude Code skills.

## The Problem with Documentation

Most best practices are write-only. Someone documents a workflow, it sits in Confluence, and developers either don't find it or don't follow it.

TDD is a perfect example. Everyone agrees it's valuable. Few teams actually practice it consistently. The knowledge exists; the discipline doesn't.

## Skills as Executable Specs

Claude Code skills are markdown files that Claude follows as instructions. Here's the structure:

```markdown
---
name: test-driven-development
description: Use when implementing features or bugfixes
---

# Test-Driven Development

## The Iron Law

**NO IMPLEMENTATION WITHOUT A FAILING TEST FIRST.**

## Workflow

1. Write a test that fails
2. Run it to prove it fails
3. Write minimal code to pass
4. Run tests to prove they pass
5. Refactor if needed
6. Commit
```

When you invoke `/tdd`, Claude follows this exactly. No shortcuts, no rationalization.

## The Iron Law Pattern

The most important pattern: **NO X WITHOUT Y FIRST.**

- No implementation without a failing test
- No merge without passing CI
- No feature without a plan

This language creates a hard decision gate. It's not "try to write tests first"—it's a non-negotiable prerequisite.

<Callout type="tip">
Frame constraints as laws, not suggestions. "NO X WITHOUT Y" is more effective than "consider doing Y before X."
</Callout>

## Description Matters More Than You Think

Skill descriptions determine when Claude uses them. A critical discovery:

**Bad description:**
> "Skill for test-driven development that ensures tests are written before implementation using the RED-GREEN-REFACTOR cycle."

This summarizes the workflow. Claude reads the summary and thinks it understands the skill without reading the full content.

**Good description:**
> "Use when implementing features or bugfixes, before writing implementation code."

This specifies *when* to use the skill, not *what* it does. Claude must read the full skill to understand the workflow.

## Skill Composition

Skills can reference other skills:

```markdown
## After Implementation

Use @requesting-code-review to verify your work before merging.
```

This creates workflows that chain naturally:
1. `/brainstorm` → Define what to build
2. `/write-plan` → Plan implementation
3. `/tdd` → Implement with tests
4. `/code-review` → Verify quality
5. `/finish-branch` → Clean up and merge

## What I've Encoded

Fourteen skills covering:
- **Brainstorming**: Socratic design refinement before coding
- **Writing plans**: 3-phase context gathering before planning
- **TDD**: RED-GREEN-REFACTOR enforcement
- **Debugging**: 4-phase systematic investigation
- **Code review**: Two-stage (spec compliance, then quality)
- **Git worktrees**: Isolated development environments

Each captures hard-won workflow knowledge that would otherwise live in my head.

## The Surprising Benefit

Skills aren't just for AI. Writing them clarified my own processes.

"How do I actually debug?" became a documented 4-phase system. "What makes a good code review?" became a checklist with specific criteria.

The act of encoding forces precision.

## Should You Write Skills?

If you:
- Have workflows you want followed consistently
- Onboard new team members regularly
- Find yourself explaining the same process repeatedly
- Want AI assistance that follows your standards

Then yes. Start with one workflow you care about. Make it executable.

<Callout type="info">
Skills are living documents. Start simple, iterate based on what Claude gets wrong.
</Callout>

## Getting Started

Clone the hyperpowers template:

```bash
git clone https://github.com/bradleywilson/hyperpowers
```

Create a skill in `skills/your-workflow/SKILL.md`. Install it as a Claude Code plugin.

Your best practices are now executable.
```

**Step 2: Verify and commit**

---

## Task 9: Tuist Tutorial

**Files:**
- Create: `/Users/bradley/Developer/dev-blog/content/blog/project-generation-tuist.mdx`

**Step 1: Write the MDX file**

```mdx
---
title: "Project Generation with Tuist"
description: "How to define iOS projects as Swift code, with reusable templates and consistent configuration."
publishedAt: 2026-01-14
tags: ["iOS", "Tuist", "tooling"]
draft: false
---

Xcode projects are notoriously hard to merge. `.xcodeproj` files are XML that git can't resolve sensibly. Tuist solves this by generating projects from Swift code.

## Why Tuist?

1. **Mergeable configs**: Swift files merge cleanly
2. **Reusable templates**: Define patterns once, use everywhere
3. **Consistent settings**: No more "works on my machine"
4. **Type safety**: Catch config errors at generation time

## Project Structure

```
MyApp/
├── Project.swift          # Main project definition
├── Tuist/
│   ├── Package.swift      # Dependencies
│   ├── Tuist.swift        # Tuist configuration
│   └── ProjectDescriptionHelpers/
│       └── Project+Templates.swift
├── MyApp/
│   └── Sources/
└── MyAppTests/
    └── Sources/
```

## Basic Project.swift

```swift
import ProjectDescription

let project = Project(
    name: "MyApp",
    organizationName: "Windybank",
    targets: [
        .target(
            name: "MyApp",
            destinations: [.iPhone, .iPad],
            product: .app,
            bundleId: "net.windybank.MyApp",
            deploymentTargets: .iOS("17.0"),
            infoPlist: .extendingDefault(with: [
                "UILaunchStoryboardName": "LaunchScreen",
            ]),
            sources: ["MyApp/Sources/**"],
            resources: ["MyApp/Resources/**"],
            dependencies: [
                .external(name: "Alamofire"),
            ]
        ),
        .target(
            name: "MyAppTests",
            destinations: [.iPhone, .iPad],
            product: .unitTests,
            bundleId: "net.windybank.MyApp.tests",
            sources: ["MyAppTests/**"],
            dependencies: [
                .target(name: "MyApp"),
            ]
        ),
    ]
)
```

## Adding Dependencies

Define in `Tuist/Package.swift`:

```swift
// Tuist/Package.swift
import PackageDescription

let package = Package(
    name: "Dependencies",
    dependencies: [
        .package(url: "https://github.com/Alamofire/Alamofire", from: "5.11.0"),
        .package(url: "https://github.com/pointfreeco/swift-snapshot-testing", from: "1.17.0"),
    ]
)
```

<Callout type="tip">
Tuist resolves SPM packages once, then caches them. Much faster than Xcode's resolution.
</Callout>

## Reusable Templates

Create helpers in `ProjectDescriptionHelpers/`:

```swift
// Project+Templates.swift
import ProjectDescription

extension Project {
    public static func app(
        name: String,
        bundleIdPrefix: String = "net.windybank",
        destinations: Destinations = [.iPhone, .iPad],
        dependencies: [TargetDependency] = []
    ) -> Project {
        Project(
            name: name,
            organizationName: "Windybank",
            settings: .settings(base: baseSettings),
            targets: [
                .appTarget(name: name, bundleIdPrefix: bundleIdPrefix,
                          destinations: destinations, dependencies: dependencies),
                .testTarget(name: "\(name)Tests", bundleIdPrefix: bundleIdPrefix,
                           destinations: destinations, appName: name),
            ],
            schemes: [
                .appScheme(name: name),
            ]
        )
    }
}

private let baseSettings: SettingsDictionary = [
    "SWIFT_VERSION": "6.0",
    "SWIFT_STRICT_CONCURRENCY": "complete",
]
```

Now `Project.swift` is just:

```swift
import ProjectDescription
import ProjectDescriptionHelpers

let project = Project.app(
    name: "MyApp",
    dependencies: [
        .external(name: "Alamofire"),
    ]
)
```

## Generating the Project

```bash
# Install Tuist
curl -Ls https://install.tuist.io | bash

# Generate Xcode project
tuist generate

# Open in Xcode
open MyApp.xcworkspace
```

## Multi-Platform Support

```swift
.target(
    name: "MyApp",
    destinations: [.iPhone, .iPad, .mac, .appleTV],
    // ...
)
```

Tuist handles the conditional compilation automatically.

## Schemes with Coverage

```swift
extension Scheme {
    public static func appScheme(name: String) -> Scheme {
        Scheme(
            name: name,
            shared: true,
            buildAction: .buildAction(targets: [.target(name)]),
            testAction: .targets(
                [.target("\(name)Tests")],
                configuration: .debug,
                options: .options(coverage: true)
            ),
            runAction: .runAction(configuration: .debug)
        )
    }
}
```

## Benefits I've Seen

- **Zero merge conflicts** on project files
- **Consistent settings** across 5 iOS projects
- **Faster CI** with cached dependencies
- **Type-safe configuration** catches errors early

<Callout type="warning">
Tuist-generated projects shouldn't be committed. Add `*.xcodeproj` and `*.xcworkspace` to `.gitignore`.
</Callout>

## Getting Started

1. Install Tuist
2. Run `tuist init` in your project
3. Move sources to match Tuist's expectations
4. Generate and verify

Start simple, add templates as patterns emerge.
```

**Step 2: Verify and commit**

---

## Task 10: Web Scraping Case Study

**Files:**
- Create: `/Users/bradley/Developer/dev-blog/content/blog/web-scraping-survives-changes.mdx`

**Step 1: Write the MDX file**

```mdx
---
title: "Web Scraping That Survives HTML Changes"
description: "Building resilient scrapers with multiple parsing strategies and graceful fallbacks."
publishedAt: 2026-01-15
tags: ["Next.js", "scraping", "patterns"]
draft: false
---

The NZ Transport Agency publishes speed camera data as HTML tables. Great—except the page structure changes without warning. Here's how I built a scraper that adapts.

## The Challenge

Government websites aren't APIs. They're HTML documents designed for humans, not machines. When they redesign:
- Class names change
- Table structures reorganize
- New sections appear

A brittle scraper breaks. A resilient one adapts.

## Strategy 1: Multiple Selectors

Try specific selectors first, fall back to general ones:

```typescript
// scraper.ts
function findDataTables($: CheerioAPI): Cheerio<Element>[] {
  // Strategy 1: Specific content area classes
  const specific = $('.c-content-area table, .main-content table');
  if (specific.length > 0) return specific.toArray();

  // Strategy 2: Semantic elements
  const semantic = $('article table, main table');
  if (semantic.length > 0) return semantic.toArray();

  // Strategy 3: Any table (last resort)
  return $('table').toArray();
}
```

<Callout type="tip">
Order strategies from most specific to most general. Specific selectors are more reliable when they work.
</Callout>

## Strategy 2: Content Validation

Don't trust structure—validate content:

```typescript
function isValidCameraTable(table: Cheerio<Element>, $: CheerioAPI): boolean {
  const headers = $(table).find('th').map((_, el) => $(el).text().toLowerCase()).get();

  // Must have expected columns
  const requiredHeaders = ['location', 'type', 'latitude', 'longitude'];
  return requiredHeaders.every(h =>
    headers.some(header => header.includes(h))
  );
}
```

## Strategy 3: Coordinate Validation

Geographic data has natural bounds:

```typescript
function validateCoordinates(lat: number, lng: number): boolean {
  // New Zealand bounds
  const NZ_BOUNDS = {
    lat: { min: -47.5, max: -34.0 },
    lng: { min: 166.0, max: 179.0 }
  };

  return (
    lat >= NZ_BOUNDS.lat.min && lat <= NZ_BOUNDS.lat.max &&
    lng >= NZ_BOUNDS.lng.min && lng <= NZ_BOUNDS.lng.max
  );
}
```

Invalid coordinates? Something's wrong with parsing—fail loudly.

## Strategy 4: Deduplication

Geohash IDs naturally deduplicate:

```typescript
function deduplicateCameras(cameras: Camera[]): Camera[] {
  const seen = new Map<string, Camera>();

  for (const camera of cameras) {
    const id = generateCameraId(camera.lat, camera.lng);
    // Keep first occurrence (or most complete data)
    if (!seen.has(id)) {
      seen.set(id, { ...camera, id });
    }
  }

  return Array.from(seen.values());
}
```

## The Full Pipeline

```typescript
async function scrapeCameras(): Promise<Camera[]> {
  const html = await fetchPage(NZTA_URL);
  const $ = cheerio.load(html);

  // Find tables with multiple strategies
  const tables = findDataTables($);

  // Parse each table
  let cameras: Camera[] = [];
  for (const table of tables) {
    if (isValidCameraTable($(table), $)) {
      const parsed = parseTable($(table), $);
      cameras.push(...parsed);
    }
  }

  // Validate coordinates
  cameras = cameras.filter(c => validateCoordinates(c.lat, c.lng));

  // Deduplicate
  cameras = deduplicateCameras(cameras);

  // Sanity check
  if (cameras.length < 100) {
    throw new Error(`Only found ${cameras.length} cameras—expected 800+`);
  }

  return cameras;
}
```

<Callout type="warning">
Always add sanity checks. If your scraper suddenly returns 0 results, that's a parsing failure, not empty data.
</Callout>

## Testing the Scraper

Snapshot the page structure:

```typescript
describe('Camera Scraper', () => {
  it('parses current NZTA page structure', async () => {
    const cameras = await scrapeCameras();

    expect(cameras.length).toBeGreaterThan(800);
    expect(cameras.every(c => validateCoordinates(c.lat, c.lng))).toBe(true);
    expect(cameras.every(c => c.id.length === 8)).toBe(true);
  });
});
```

When tests fail, the page structure changed—time to update strategies.

## Lessons Learned

1. **Layer your strategies**—specific first, general last
2. **Validate content, not structure**—tables should contain expected data
3. **Use domain knowledge**—coordinates have bounds, counts have expectations
4. **Fail loudly**—zero results is an error, not success
5. **Test regularly**—scraper health checks catch changes early

The scraper has survived 3 NZTA redesigns without manual intervention.
```

**Step 2: Verify and commit**

---

## Task 11: Interactive Maps Tutorial

**Files:**
- Create: `/Users/bradley/Developer/dev-blog/content/blog/interactive-maps-clustering.mdx`

**Step 1: Write the MDX file**

```mdx
---
title: "Interactive Maps at Scale: Clustering 900+ Markers"
description: "Performance techniques for rendering hundreds of map markers with Leaflet and React."
publishedAt: 2026-01-16
tags: ["React", "Leaflet", "performance"]
draft: false
---

Rendering 900 markers on a map sounds simple—until it isn't. Without optimization, the page freezes. Here's how to make it fast.

## The Problem

```tsx
// Don't do this with 900 markers
{cameras.map(camera => (
  <Marker key={camera.id} position={[camera.lat, camera.lng]} />
))}
```

Each marker is a DOM element. 900 DOM elements updating on pan/zoom = browser death.

## Solution: Marker Clustering

Group nearby markers into clusters:

```tsx
import MarkerClusterGroup from 'react-leaflet-cluster';

<MapContainer center={center} zoom={6}>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  <MarkerClusterGroup
    chunkedLoading
    maxClusterRadius={60}
    spiderfyOnMaxZoom
    showCoverageOnHover={false}
  >
    {cameras.map(camera => (
      <Marker key={camera.id} position={[camera.lat, camera.lng]}>
        <Popup>{camera.name}</Popup>
      </Marker>
    ))}
  </MarkerClusterGroup>
</MapContainer>
```

<Callout type="tip">
`chunkedLoading` spreads marker processing across frames, preventing UI freezes during initial load.
</Callout>

## Custom Cluster Icons

Default clusters are boring. Add context:

```tsx
const createClusterIcon = (cluster: MarkerCluster) => {
  const count = cluster.getChildCount();
  const size = count < 10 ? 'small' : count < 100 ? 'medium' : 'large';

  return L.divIcon({
    html: `<div class="cluster-icon cluster-${size}">${count}</div>`,
    className: 'custom-cluster',
    iconSize: L.point(40, 40),
  });
};

<MarkerClusterGroup iconCreateFunction={createClusterIcon}>
```

## Custom Marker Icons

SVG markers are sharper and more flexible than images:

```tsx
const createMarkerIcon = (camera: Camera) => {
  const color = getColorForType(camera.type);

  const svg = `
    <svg width="25" height="41" viewBox="0 0 25 41">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 21.9 12.5 41 12.5 41S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0Z"
            fill="${color}"/>
      <circle cx="12.5" cy="12.5" r="6" fill="white"/>
    </svg>
  `;

  return L.divIcon({
    html: svg,
    className: 'custom-marker',
    iconSize: [25, 41],
    iconAnchor: [12.5, 41],
  });
};
```

## Dynamic Imports

Leaflet doesn't work with SSR. Dynamic import solves this:

```tsx
// CameraMap.tsx
const CameraMap = dynamic(
  () => import('./CameraMapClient'),
  {
    ssr: false,
    loading: () => <MapSkeleton />
  }
);
```

Add webpack prefetch for faster subsequent loads:

```tsx
const CameraMap = dynamic(
  () => import(/* webpackPrefetch: true */ './CameraMapClient'),
  { ssr: false }
);
```

## Filtering Performance

Filter before rendering, not during:

```tsx
const [filters, setFilters] = useState({ type: null, region: null });

const filteredCameras = useMemo(() => {
  return cameras.filter(camera => {
    if (filters.type && camera.type !== filters.type) return false;
    if (filters.region && camera.region !== filters.region) return false;
    return true;
  });
}, [cameras, filters]);

// Only render filtered markers
<MarkerClusterGroup>
  {filteredCameras.map(camera => (
    <Marker key={camera.id} ... />
  ))}
</MarkerClusterGroup>
```

<Callout type="warning">
Don't filter inside the render loop. useMemo ensures filtering only runs when filters change.
</Callout>

## Theme-Aware Tiles

Switch tile providers based on theme:

```tsx
const { theme } = useTheme();

const tileUrl = theme === 'dark'
  ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
  : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

<TileLayer url={tileUrl} />
```

## Performance Checklist

- [ ] Use marker clustering
- [ ] Enable chunked loading
- [ ] Custom icons with SVG (not images)
- [ ] Dynamic import with SSR disabled
- [ ] Memoize filtered data
- [ ] Lazy load map component

With these optimizations, 900 markers render smoothly on mobile devices.
```

**Step 2: Verify and commit**

---

## Task 12: SwiftData + DataThespian Deep Dive

**Files:**
- Create: `/Users/bradley/Developer/dev-blog/content/blog/swiftdata-datathespian.mdx`

**Step 1: Write the MDX file**

```mdx
---
title: "SwiftData + DataThespian: Thread-Safe Persistence"
description: "How to use SwiftData safely in Swift 6 with strict concurrency using the DataThespian wrapper."
publishedAt: 2026-01-17
tags: ["iOS", "SwiftData", "concurrency"]
draft: false
---

SwiftData is Apple's modern persistence framework. But with Swift 6's strict concurrency, using it safely requires care. DataThespian provides a clean solution.

## The Concurrency Problem

SwiftData model objects aren't `Sendable`. You can't pass them between actors:

```swift
// This won't compile in Swift 6
func fetchTrack() async -> Track {
    let context = modelContainer.mainContext
    let track = try! context.fetch(FetchDescriptor<Track>()).first!
    return track  // Error: Track is not Sendable
}
```

## The DataThespian Pattern

DataThespian wraps ModelActor to provide thread-safe database access:

```swift
import DataThespian

@ModelActor
actor DatabaseService {
    func fetchTracks() -> [TrackProxy] {
        let tracks = try! modelExecutor.modelContext.fetch(
            FetchDescriptor<Track>()
        )
        return tracks.map { TrackProxy(from: $0) }
    }
}
```

## Proxy Objects

Create `Sendable` proxies that cross actor boundaries:

```swift
struct TrackProxy: Sendable {
    let id: PersistentIdentifier
    let name: String
    let distance: Double
    let duration: TimeInterval

    init(from track: Track) {
        self.id = track.persistentModelID
        self.name = track.name
        self.distance = track.distance
        self.duration = track.duration
    }
}
```

<Callout type="tip">
Proxies contain only primitive, Sendable types. Use them for reads; go back to the model for writes.
</Callout>

## Read Pattern

```swift
// ViewModel
@Observable @MainActor
class TrackListViewModel {
    private let database: DatabaseService
    var tracks: [TrackProxy] = []

    func loadTracks() async {
        tracks = await database.fetchTracks()
    }
}
```

## Write Pattern

Writes need the original model context:

```swift
extension DatabaseService {
    func updateTrack(id: PersistentIdentifier, name: String) {
        let context = modelExecutor.modelContext
        guard let track = context.model(for: id) as? Track else { return }
        track.name = name
        try? context.save()
    }
}
```

## Avoiding @Query Conflicts

SwiftUI's `@Query` and manual fetches can conflict. Choose one approach:

```swift
// Option 1: Pure @Query (simple cases)
struct TrackListView: View {
    @Query var tracks: [Track]

    var body: some View {
        List(tracks) { track in
            Text(track.name)
        }
    }
}

// Option 2: Pure ViewModel (complex cases)
struct TrackListView: View {
    @State var viewModel: TrackListViewModel

    var body: some View {
        List(viewModel.tracks) { proxy in
            Text(proxy.name)
        }
        .task { await viewModel.loadTracks() }
    }
}
```

<Callout type="warning">
Don't mix @Query with manual context operations. They can see different data states.
</Callout>

## Manual Refresh

When you mutate data, refresh manually:

```swift
class TrackListViewModel {
    @Published var tracks: [TrackProxy] = []

    func deleteTrack(_ proxy: TrackProxy) async {
        await database.deleteTrack(id: proxy.id)
        await loadTracks()  // Refresh after mutation
    }
}
```

## Testing with In-Memory Containers

```swift
// TestContainer.swift
struct TestContainer {
    static func create() -> ModelContainer {
        let config = ModelConfiguration(isStoredInMemoryOnly: true)
        return try! ModelContainer(
            for: Track.self, Waypoint.self,
            configurations: config
        )
    }

    static func populated() -> ModelContainer {
        let container = create()
        let context = container.mainContext

        // Add test data
        context.insert(Track(name: "Test Track", distance: 1000))
        try! context.save()

        return container
    }
}
```

## Full Architecture

```
┌─────────────────┐     ┌──────────────────┐
│   SwiftUI View  │────▶│    ViewModel     │
│   (@State VM)   │     │   (@Observable)  │
└─────────────────┘     └────────┬─────────┘
                                 │
                                 │ async/await
                                 ▼
                        ┌──────────────────┐
                        │  DatabaseService │
                        │   (@ModelActor)  │
                        └────────┬─────────┘
                                 │
                                 │ ModelContext
                                 ▼
                        ┌──────────────────┐
                        │   SwiftData      │
                        │   (SQLite)       │
                        └──────────────────┘
```

## Key Takeaways

1. **Model objects aren't Sendable**—use proxies for reads
2. **Writes need context**—pass PersistentIdentifier, fetch model, mutate
3. **Don't mix @Query with manual fetches**—choose one pattern
4. **Refresh after mutations**—no automatic observation across actors
5. **Test with in-memory containers**—fast, isolated, deterministic

DataThespian makes SwiftData safe under strict concurrency.
```

**Step 2: Verify and commit**

---

## Final Steps

### Verify All Posts Render

**Step 1: Run dev server**

```bash
cd /Users/bradley/Developer/dev-blog
npm run dev
```

**Step 2: Visit each post**

- http://localhost:3000/blog/geohash-based-ids
- http://localhost:3000/blog/mcp-servers-three-languages
- http://localhost:3000/blog/live-activities-ios
- http://localhost:3000/blog/journaling-suggestions-api
- http://localhost:3000/blog/timezone-five-layers
- http://localhost:3000/blog/xcuitest-page-objects
- http://localhost:3000/blog/snapshot-testing-swiftui
- http://localhost:3000/blog/encoding-best-practices-skills
- http://localhost:3000/blog/project-generation-tuist
- http://localhost:3000/blog/web-scraping-survives-changes
- http://localhost:3000/blog/interactive-maps-clustering
- http://localhost:3000/blog/swiftdata-datathespian

**Step 3: Check blog index**

Visit http://localhost:3000/blog and verify all 12 posts appear.

### Run Build

```bash
npm run build
```

Expected: Build succeeds with no errors.

### Final Commit

```bash
git add .
git commit -m "$(cat <<'EOF'
feat(blog): add 12 AI-generated blog posts

Based on recent development work across repositories:
- nz-speed-cameras (geohashing, scraping, maps)
- TopographicNZ (Live Activities)
- HabitTracker (JournalingSuggestions, SwiftData)
- mcp-apple-notes, app-intents-mcp, mcp-ical (MCP servers)
- bRadio (testing patterns, Tuist)
- hyperpowers (Claude Code skills)

Posts cover tutorials, deep dives, case studies, and thought pieces.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

---

## Implementation Notes

### Style Variety Applied

| Post | Format | Tone | Length |
|------|--------|------|--------|
| Geohash IDs | Deep Dive | Technical, precise | Medium |
| MCP Three Languages | Comparison Tutorial | Pragmatic | Long |
| Live Activities | Step-by-Step Tutorial | Instructional | Long |
| JournalingSuggestions | Deep Dive | Problem-solving | Long |
| Timezone Problem | Case Study | Narrative | Medium |
| XCUITest Page Objects | Tutorial | Practical | Medium |
| Snapshot Testing | Quick Tips | Concise | Short |
| Claude Code Skills | Thought Piece | Reflective | Medium |
| Tuist | Tutorial | Getting-started | Medium |
| Web Scraping | Case Study | Lessons-learned | Medium |
| Interactive Maps | Tutorial | Performance-focused | Medium |
| SwiftData | Deep Dive | Architecture | Medium |

### Tag Distribution

- iOS/Swift: 7 posts
- Web/JavaScript: 3 posts
- AI/Tools: 2 posts
- Testing: 3 posts
- Architecture: 4 posts

### Frontmatter Conventions

- `publishedAt`: Staggered dates (Jan 6-17, 2026)
- `tags`: 2-4 tags per post, lowercase where conventional
- `draft: false`: All posts ready for publication
