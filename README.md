# StudyMate AI

> Your offline AI study assistant: organize subjects, turn raw material into notes, drill flashcards and quizzes, and follow a study plan that adapts to your exams.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Zero dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)
![Works offline](https://img.shields.io/badge/works-offline-blue)

## Problem

Students juggle several subjects, long textbook chapters and exam dates that all land at once. Turning material into usable notes, testing yourself, and deciding what to study each day takes time most students don't have. Many AI tools also need an account, a paid API key or an internet connection.

## Solution

StudyMate AI is a single `index.html` file. Open it in a browser and you get:

- Subjects with exam dates
- An AI notes generator (summary, key concepts, definitions, bullet notes) with an editable Markdown editor
- Auto-generated flashcards with SM-2-style spaced repetition
- Auto-generated quizzes (multiple choice + true/false) with scoring and explanations
- A study planner that schedules your days up to each exam
- A dashboard that shows where you stand

No install, no server, no internet, no account.

## Features

| Area | What it does |
|---|---|
| Dashboard | Stat cards: subjects, upcoming exams with days left, average quiz score, planner completion %, flashcards due today. Today's sessions. |
| Subjects | Add or delete subjects with an exam date. |
| Notes | Paste text or load a `.txt`/`.md` file, then generate structured notes. Edit them as Markdown with a live preview. Download as `.md` or `.txt`. |
| Flashcards | Created from a note (definitions become term/definition cards, key concepts become cloze cards) or added by hand. Practice mode flips cards; rate Again/Good/Easy to schedule the next review. |
| Quiz | Generate N questions from a note: cloze MCQ with 3 keyword distractors, plus true/false. Submit to see the score, correct answers and the source sentence. Scores are saved per subject. |
| Planner | Set hours per day and a start date. You get a day-by-day plan, weighted toward sooner exams and weaker subjects (lower quiz scores), with a review day before every exam. Tick sessions off as you go. |
| Extras | Dark mode, demo data, reset, optional online AI. |

## How the offline AI works

Everything runs in plain JavaScript inside the page (`<script id="core">`, exposed as `window.StudyCore`). It is deterministic and makes no network calls.

1. Sentence splitting: splits on `.`, `!` or `?` followed by a capital letter or digit, so decimals like `9.8` stay intact.
2. Keyword scoring: lowercases, removes stopwords and counts word frequency. The most frequent terms become the key concepts.
3. Summary: each sentence is scored by the sum of its keyword frequencies divided by √length. The top sentences are returned in their original order.
4. Definitions: sentences like *"X is / are / was / refers to / means / is defined as …"* become term/definition pairs. Pronoun subjects ("It is…") are ignored.
5. Quiz: the highest-scoring sentences have their main keyword blanked out (cloze). The distractors are other keywords from the same material. Some questions become true/false by swapping in a different keyword. A seeded random generator keeps results reproducible.
6. Flashcards: SM-2-style scheduling. Each card has an ease (starts at 2.5, never below 1.3), an interval and a due date. "Good" gives intervals of 1 → 6 → interval × ease days. "Easy" adds a bonus. "Again" resets the card and lowers its ease.
7. Planner: for each day, each subject gets weight = (weakness factor) / (days until exam). The weakness factor is 1 + (100 − avg score)/100, or 1.5 if the subject has no quizzes yet. Minutes are split in 15-minute blocks and never go over your daily budget. The day before an exam is reserved for reviewing that subject.

## Optional: real AI

Open Settings and enter an OpenAI-compatible base URL (e.g. `https://api.openai.com/v1`), an API key and a model. Notes and quizzes then call `POST {base}/chat/completions` and ask for JSON. If the request fails, the response is invalid, or the JSON has the wrong shape, the app quietly falls back to the offline engine.

Security note: the API key is stored only in your browser's `localStorage` and is sent only to the URL you enter. Don't use a shared computer for this, and click "Clear API settings" when you're done.

## Quick start

1. Download or clone this repository.
2. Double-click `index.html`. It opens in Microsoft Edge, Chrome, Firefox or Safari.
3. Click **Load demo data** on the Dashboard.

You don't need Python, Node, npm or Git. If you'd rather serve it, any static server works, for example `npx serve .` or `python -m http.server 8000`, then open `http://localhost:8000`.

### Setup per OS

- Windows: right-click `index.html` → Open with → Microsoft Edge.
- macOS: `open index.html` (or double-click it in Finder).
- Linux: `xdg-open index.html`.

## Demo walkthrough (3 minutes)

See [docs/DEMO_GUIDE.md](docs/DEMO_GUIDE.md).

## Project structure

```
index.html          The whole app: styles, core logic (<script id="core">), UI (<script id="app">)
tests/tests.html    In-browser test runner (loads index.html?test=1 in an iframe)
tests/tests.js      Unit tests + UI smoke test
docs/DEMO_GUIDE.md  3-minute demo script for judges
LICENSE             MIT
```

## Tech

Vanilla HTML, CSS and JavaScript in a single file. There are zero dependencies and no build step.

- It runs from `file://`, so judges and students can use it anywhere, even offline in an exam hall.
- There is no supply chain to audit and nothing to install. It loads instantly.
- The pure logic is isolated in `StudyCore`, so it is easy to test and easy to port to a backend later.

Accessibility: semantic HTML, a labelled control for every input, real `<button>`s, ARIA tabs with arrow-key navigation, visible focus outlines, a skip link, a live region for status messages, and high-contrast light and dark themes. All user text is HTML-escaped before rendering. Full WCAG compliance would still need manual testing with assistive technologies.

## Privacy

All data (subjects, notes, cards, scores, plan, settings) stays in your browser's `localStorage`. Nothing is uploaded unless you configure the optional API. **Reset data** removes everything.

## Running tests

- In a browser, open `tests/tests.html`. You need a browser that allows file-to-file iframe access, such as Edge or Chrome started with `--allow-file-access-from-files`, or you can serve the folder with a static server. The page ends with `PASS n/n` or `FAIL` plus details. Tests use a separate storage key, so your real data is untouched.
- Headless (Windows / Edge):

```powershell
& "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless=new --disable-gpu --allow-file-access-from-files --virtual-time-budget=10000 --dump-dom "file:///C:/path/to/repo/tests/tests.html" | Select-String 'id="result"'
```

The tests cover sentence splitting, keywords, definitions, summary length, XSS escaping, quiz generation and grading, planner constraints, SM-2 flashcards, storage, dashboard stats, the offline fallback, and a UI smoke run.

## Troubleshooting

- Data disappeared: `localStorage` is per browser and per profile. Private windows don't keep it.
- Tests say "could not access StudyCore": the browser is blocking `file://` iframe access. Use the flag above or a static server.
- Online AI isn't used: check the base URL (it must include `/v1` for OpenAI) and the key. On any error the app falls back offline, and the status text shows the reason.

## Roadmap

- PDF import
- Sync and export/import of all data as JSON
- Better NLP (multi-word key phrases) and image-based flashcards
- PWA install for mobile

## License

[MIT](LICENSE) © 2026 StudyMate AI Contributors
