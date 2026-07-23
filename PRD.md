# Product Requirements Document (PRD)
## Everyday Matters Tracker

**Version:** 1.0  
**Date:** July 20, 2026  
**Status:** Draft  
**Author:** Arianna — Final Project Oya Summer

---

## 1. Executive Summary

Everyday Matters Tracker is a unified, low-stimulation productivity and wellness app that helps users manage school assignments, daily tasks, events, and health metrics in one calm, glanceable view. Unlike fragmented tools such as Google Calendar, Apple Calendar, or Notion, this app prioritizes clarity over complexity—so users can quickly see what needs attention without feeling overwhelmed.

---

## 2. Problem Statement

### The Issue
Keeping up with school work, personal tasks, events, and health habits across multiple apps is difficult. Existing tools often:

- Require heavy formatting and setup (e.g., Notion databases, calendar event fields)
- Spread information across disconnected surfaces
- Use visually busy interfaces that increase cognitive load
- Make it hard to see priorities at a glance

### The Goal
Provide a single, stress-free place where users can see everything that matters—what’s due, what’s planned, and how they’re doing—without visual noise or unnecessary steps.

---

## 3. Product Vision

**What are we building?**  
An app that tracks school assignments, daily tasks, events, and health (steps, active movement, sleep, meals, hydration)—all optional and customizable.

**Who is it for?**  
Anyone who wants to stay organized and on track without the friction of traditional productivity tools. Primary personas include students, busy professionals, and wellness-minded individuals.

**How will we build it?**  
A responsive web application (mobile-first, desktop-friendly) with a modular feature system. Users enable only the modules they need. The UI emphasizes calm design, clear hierarchy, and at-a-glance readability.

---

## 4. Goals & Success Metrics

### Product Goals
| Goal | Description |
|------|-------------|
| **Clarity** | Users can identify today’s priorities within 5 seconds of opening the app |
| **Low stimulation** | Clean, minimal UI with restrained color, spacing, and motion |
| **Flexibility** | Every feature module is optional and user-configurable |
| **Stress reduction** | No guilt-inducing notifications or cluttered dashboards by default |

### Success Metrics (v1)
| Metric | Target |
|--------|--------|
| Time to first task/event entry | < 30 seconds |
| Daily active use (returning users) | Track after launch |
| Tasks completed per day (logged) | Display to user; avg. with difficulty |
| Module adoption rate | % of users enabling each optional module |
| User-reported overwhelm (survey) | Low scores on “feels overwhelming” |

---

## 5. User Requirements & Use Cases

### Core User Needs
- Accomplish goals and stay on track across school, life, and health
- Experience a stress-free app that does not exceed user expectations
- View information that is **clean, organized, and digestible at a glance**

### Primary Use Cases

| ID | Use Case | User Story |
|----|----------|------------|
| UC-01 | Morning check-in | As a user, I want to open the app and immediately see today’s assignments, tasks, events, and health summary so I know what my day looks like. |
| UC-02 | Quick task capture | As a user, I want to add a recurring or common task with one tap so I don’t lose momentum. |
| UC-03 | Assignment tracking | As a student, I want to track school assignments with due dates and completion status without complex formatting. |
| UC-04 | Event awareness | As a user, I want events on a timeline so I can see how my day is structured. |
| UC-05 | Mood-aware scheduling | As a user, I want to log my daily mood so the app can help me understand how I feel relative to my schedule. |
| UC-06 | Activity logging | As a user, I want to log steps, workouts (type, duration), and active movement without heart rate tracking. |
| UC-07 | Sleep tracking | As a user, I want to record sleep duration, quality, and schedule to spot patterns. |
| UC-08 | Nutrition & hydration | As a user, I want to log meals and water intake in a simple, non-bulky way. |
| UC-09 | Progress reflection | As a user, I want to see my average tasks completed per day (with difficulty) to understand my habits over time. |
| UC-10 | Personalization | As a user, I want to turn features on/off and switch between dark and light mode for comfort. |

---

## 6. Feature Overview

All features below are **optional modules**. Users customize which appear on their dashboard and in navigation.

### 6.1 Core Modules

#### A. Calendar-Like Timeline
- Chronological view of the day/week
- Displays assignments, tasks, events, and optional health entries on a unified timeline
- Visual distinction by item type (color/icon, not heavy labels)
- Tap to expand details; collapsed by default for low stimulation

#### B. To-Do List (Non-Bullet Format)
- Card- or row-based task presentation (not traditional bullet lists)
- Fields: title, due date/time, difficulty (e.g., Easy / Medium / Hard), completion status
- Optional grouping: Today, Upcoming, Completed
- Swipe or tap to complete

#### C. School Assignments
- Assignment name, course/subject, due date, status (Not Started / In Progress / Done)
- Appears on timeline and/or dedicated assignments view
- Filter by course and due date

#### D. Events
- Title, date/time, location (optional), notes (optional)
- Shown on timeline alongside tasks and assignments

### 6.2 Wellness Modules (Optional)

#### E. Daily Mood Checker
- Simple mood selection (e.g., emoji or 1–5 scale)
- Optional note
- Displayed on daily view to contextualize schedule and habits
- *Not* a clinical mental health tool; for personal reflection only

#### F. Physical Activity
- **Included:** steps, workouts, duration, activity type, active movement
- **Excluded:** heart rate (explicitly out of scope)
- Manual entry and/or device sync (future consideration for v2)

#### G. Sleep Monitor
- Duration (hours/minutes)
- Quality rating (user-defined scale, e.g., 1–5 stars)
- Bedtime and wake time (schedule)

#### H. Meals & Hydration
- Meal log: meal type (breakfast/lunch/dinner/snack), optional description
- Hydration: water intake (glasses or ml/oz)
- Minimal UI—quick log, not a full nutrition database

### 6.3 Productivity & Insights

#### I. Quick Task Entry
- One-tap creation for user-defined “common activities” (e.g., “Review notes,” “Gym,” “Drink water”)
- Configurable shortcuts on home or floating action button

#### J. Task Completion Analytics
- Average tasks completed per day
- Breakdown by difficulty (Easy / Medium / Hard)
- Simple chart or stat cards—no dense analytics dashboard

### 6.4 Platform & UX

#### K. Dark / Light Mode
- System preference detection
- Manual toggle in settings
- Consistent contrast and readability in both modes

#### L. Responsive Design
- Mobile-first layout
- Desktop layout with expanded timeline and side panels
- Touch-friendly targets on mobile; keyboard-friendly on desktop

---

## 7. Functional Requirements

### 7.1 Dashboard (Home)
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | Display a unified “Today” view combining enabled modules | P0 |
| FR-02 | Show incomplete/high-priority items above the fold | P0 |
| FR-03 | Allow user to hide/show modules from settings | P0 |
| FR-04 | Support pull-to-refresh or auto-sync on open | P1 |

### 7.2 Timeline
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-05 | Render items on a calendar-like horizontal or vertical timeline | P0 |
| FR-06 | Support day and week views | P1 |
| FR-07 | Color-code or icon-code item types without clutter | P0 |

### 7.3 Tasks & Assignments
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-08 | Create, edit, delete, and complete tasks | P0 |
| FR-09 | Assign difficulty level to tasks | P1 |
| FR-10 | Create, edit, delete assignments with course and due date | P0 |
| FR-11 | Mark assignments complete | P0 |

### 7.4 Events
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-12 | Create, edit, delete events with date/time | P0 |
| FR-13 | Display events on timeline | P0 |

### 7.5 Wellness Logging
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-14 | Log daily mood (single entry per day, editable) | P1 |
| FR-15 | Log steps, workout type, duration, active movement | P1 |
| FR-16 | Log sleep duration, quality, bedtime, wake time | P1 |
| FR-17 | Log meals and hydration | P2 |
| FR-18 | **Do not** collect or display heart rate | P0 |

### 7.6 Quick Entry & Shortcuts
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-19 | User can define up to N quick-action shortcuts | P1 |
| FR-20 | One tap creates a pre-filled task or log entry | P1 |

### 7.7 Analytics
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-21 | Calculate and display average tasks completed per day | P1 |
| FR-22 | Show completion breakdown by difficulty | P1 |
| FR-23 | Time range: last 7 days and last 30 days | P2 |

### 7.8 Settings & Personalization
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-24 | Toggle each module on/off | P0 |
| FR-25 | Dark/light theme toggle | P0 |
| FR-26 | Responsive layout for mobile and desktop | P0 |

---

## 8. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | Initial load < 3s on average mobile connection |
| **Accessibility** | WCAG 2.1 AA target: sufficient contrast, focus states, screen reader labels |
| **Privacy** | Health and mood data stored securely; no selling of user data |
| **Offline** | Basic read/write for today’s entries when offline (stretch goal for v1) |
| **Scalability** | Support single-user accounts; multi-device sync in v1 or v2 |

---

## 9. Out of Scope (v1)

- Heart rate monitoring or integration
- Social features, sharing, or collaboration
- Full nutrition database or calorie counting
- Clinical mental health diagnosis or therapy tools
- Native iOS/Android apps (web responsive only for v1)
- Third-party calendar sync (Google/Apple) — consider for v2
- Push notifications (optional for v2; default off to reduce stimulation)

---

## 10. User Experience Principles

1. **Glanceable first** — The most important information is visible without scrolling or tapping.
2. **Calm by default** — Muted palette, generous whitespace, limited animations.
3. **Progress, not pressure** — Analytics inform; they do not shame.
4. **Optional depth** — Simple defaults; advanced fields hidden until needed.
5. **Consistent patterns** — Same interaction model for tasks, assignments, and events.

### Information Hierarchy (Suggested)
```
Today’s priorities (incomplete items)
    ↓
Timeline (day structure)
    ↓
Wellness snapshot (if modules enabled)
    ↓
Insights (avg. completions, optional)
```

---

## 11. Information Architecture (Draft)

```
Home (Today Dashboard)
├── Timeline View
├── Tasks (card list)
├── Assignments
├── Events
├── Wellness Hub (optional)
│   ├── Mood
│   ├── Activity
│   ├── Sleep
│   └── Meals & Hydration
├── Insights (avg. tasks / difficulty)
└── Settings
    ├── Module toggles
    ├── Quick shortcuts
    ├── Theme (dark/light)
    └── Account (future)
```

---

## 12. User Flows (Key Paths)

### Flow 1: First-Time Setup
1. User opens app → brief welcome (skip allowed)
2. User selects which modules to enable
3. User lands on empty Today dashboard with gentle onboarding hints
4. User adds first task or event via quick entry

### Flow 2: Daily Use
1. User opens app → sees Today dashboard
2. User scans timeline and priority cards
3. User completes items (tap/swipe)
4. User optionally logs mood, activity, or sleep
5. User closes app with clear sense of what’s left

### Flow 3: Quick Task
1. User taps quick-action button or shortcut
2. Pre-filled task created (or one-field confirm)
3. Item appears on timeline and task list immediately

---

## 13. Technical Considerations (High Level)

| Area | Recommendation |
|------|----------------|
| **Platform** | Responsive web app (React, Vue, or similar) |
| **Data** | Local storage for MVP; cloud backend for sync in v1.1+ |
| **Auth** | Optional for MVP; email/social login for multi-device |
| **Design system** | Component library with dark/light tokens from day one |

*Final stack to be decided during technical planning.*

---

## 14. Release Plan

### MVP (v1.0)
- Today dashboard with module toggles
- Tasks (card format), assignments, events
- Timeline (day view)
- Dark/light mode
- Responsive mobile + desktop
- Basic task completion stats

### v1.1
- Mood, activity, sleep modules
- Quick task shortcuts
- Week timeline view
- Difficulty-based analytics

### v1.2
- Meals & hydration
- 7/30-day insights
- Offline support
- Optional calendar import

---

## 15. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Feature creep overwhelms users | Strict modularity; everything optional |
| Too similar to existing apps | Differentiate via low-stimulation UX and unified glance view |
| Health data sensitivity | Clear privacy policy; local-first option |
| Scope too large for final project | Prioritize MVP; wellness modules as phased add-ons |

---

## 16. Open Questions

1. Should mood influence how the schedule is displayed (e.g., lighter day suggestion), or only log for reflection?
2. Will assignments sync with a school LMS, or manual entry only?
3. Is user authentication required for the final project deliverable?
4. What is the target launch date / demo date for the course?
5. Preferred design reference or brand colors?

---

## 17. Appendix

### Glossary
| Term | Definition |
|------|------------|
| **Module** | An optional feature area (e.g., Sleep, Mood) the user can enable or disable |
| **Timeline** | Calendar-like chronological view of items |
| **Quick entry** | One-tap shortcut to create a common task or log |
| **Low stimulation** | UI designed to reduce visual and cognitive overload |

### Reference: Feature ↔ User Requirement Mapping

| User Need | Feature |
|-----------|---------|
| Stay on track | Timeline, tasks, assignments, events |
| Stress-free | Optional modules, calm UI, no bullet clutter |
| Glanceable | Today dashboard, card-based tasks |
| Health awareness | Activity, sleep, meals, hydration (no heart rate) |
| Personalization | Module toggles, dark/light mode, quick shortcuts |
| Progress insight | Avg. tasks/day with difficulty |

---

*End of PRD*
