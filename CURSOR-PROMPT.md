# Cursor Onboarding Prompt

> Copy everything below this line and paste it into Cursor's chat when you first open the project.
> This gives Cursor full context about your project so it can help you effectively.

---

## Paste This Into Cursor:

```
I'm working on a project called Garden — a personal dashboard ("Your Personal OS") built with Next.js 15 and the App Router. Before we start, please read the .cursorrules file at the root of this project. It contains the complete architecture, design system, data flow, and customization documentation.

Here's a quick orientation:

**What this project is:**
A single-page personal dashboard that aggregates live stock data (Yahoo Finance), RSS articles (Substack newsletters), news headlines (NYT, BBC, CNN, Wired), and financial goal tracking into a beautifully designed page. The aesthetic is "Botanical Minimalism" — warm cream backgrounds, deep forest greens, serif display typography, nature photography, and lowercase text throughout.

**Key files to understand:**
- `.cursorrules` — FULL project context (read this first, it's your bible for this project)
- `app/page.tsx` — Main dashboard page (client component, ~690 lines)
- `app/hooks/usePreferences.ts` — Shared preferences hook that stores user settings in localStorage
- `app/preferences/page.tsx` — Settings page where users customize their dashboard
- `app/api/stocks/route.ts` — Yahoo Finance stock quotes API
- `app/api/feeds/route.ts` — RSS feed fetching (supports GET with defaults, POST with custom feeds)
- `app/api/growth/route.ts` — Plaid-ready placeholder for future bank integration
- `app/globals.css` — Design tokens, custom fonts, Tailwind base layers

**How data flows:**
1. User preferences (name, tickers, feeds, goals) are stored in localStorage via the `usePreferences()` hook
2. The main page reads preferences and passes them to API calls
3. `/api/stocks` fetches live quotes from Yahoo Finance using the `yahoo-finance2` package
4. `/api/feeds` fetches RSS articles and news using the `rss-parser` package
5. Growth goals are read directly from localStorage (no API needed yet)

**Design rules to follow:**
- All UI text is lowercase (except "GARDEN" title)
- Color palette: cream (#ECECE8), forest green (#2B4937), deep green (#244231), accent green (#4FAF6F)
- Three fonts: OPTI Century Expanded Two (display/titles), Instrument Sans (body), Cutive (dates/labels)
- Mobile-first responsive design
- Quiet, nature-inspired interactions — no flashy animations

**What's already working:**
- Live stock quotes with real Yahoo Finance data
- Live RSS article feeds from configurable Substack newsletters
- Live news headlines from configurable news sources
- Preferences page to customize everything (name, tickers, feeds, goals)
- Growth section with configurable financial goals
- Smooth scroll navigation with intersection observer
- Mobile-responsive layout
- Error states and loading states for all data sections

**What I want to work on next (pick any to help me with):**
- Connect Growth section to real bank data via Plaid API
- Add a weather widget
- Add calendar integration (Google Calendar)
- Dark mode toggle
- Integrate Spotify "currently playing"
- Push notifications for stock price alerts
- Add more visual polish and micro-interactions

When I ask you to make changes, always:
1. Read `.cursorrules` if you haven't already
2. Follow the botanical minimalism design system (colors, fonts, lowercase text)
3. Keep the mobile-first responsive approach
4. Store any new user settings in the `usePreferences()` hook
5. Use Next.js API routes for any new data fetching
6. Maintain the existing code patterns and file organization

Let me know you've read the .cursorrules file and I'll tell you what I want to work on first.
```

---

## How to Use This

1. Open your `GARDEN-CURSOR` folder in Cursor
2. Open Cursor's AI chat (Cmd+L or the chat panel)
3. Copy the text between the ``` markers above and paste it in
4. Cursor will read your `.cursorrules` file and have full context
5. Then just tell it what you want to build next!

---

## Tips for Working with Cursor on This Project

**For quick fixes:** Just describe the issue naturally. Example: "The stock quotes aren't showing loading spinners" — Cursor will know where to look.

**For new features:** Start with "I want to add [feature]" and Cursor will propose an approach based on the architecture in `.cursorrules`.

**For design changes:** Reference the design system. Example: "Make the Winds section use a darker green background like the Seeds section" — Cursor knows the color tokens.

**For Plaid integration:** Say "Let's implement the Plaid bank connection. Follow the instructions in .cursorrules under 'Future Integration: Plaid'" — the roadmap is already written.

**If Cursor seems confused:** Tell it to "re-read .cursorrules" — that file has everything it needs.
