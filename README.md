# StudyMate AI

> Your offline AI study assistant: organize subjects, turn raw material into notes, drill flashcards and quizzes, and follow a study plan that adapts to your exams.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Zero dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)
![Works offline](https://img.shields.io/badge/works-offline-blue)

## Problem

Students juggle several subjects, long textbook chapters, and exam dates that all arrive at once. Turning study material into useful notes, testing yourself, and deciding what to study each day takes time. Many AI tools also require an account, a paid API key, or an internet connection.

## Solution

StudyMate AI is a browser-based study assistant built primarily as a single `index.html` file. Open it in a browser to access:

- Subjects with exam dates
- An offline notes generator for summaries, key concepts, definitions, and bullet notes
- An editable Markdown notes editor
- Flashcards with SM-2-style spaced repetition
- Multiple-choice and true/false quizzes with scoring and explanations
- A study planner that schedules sessions around upcoming exams
- A dashboard showing study progress

The core app works without installation, a server, an account, or an internet connection.

## Features

| Area | What it does |
|---|---|
| Dashboard | Shows subjects, upcoming exams, average quiz score, planner completion, flashcards due, and today's sessions. |
| Subjects | Add and delete subjects and set exam dates. |
| Notes | Paste text or load `.txt` and `.md` files, generate structured notes, edit Markdown, preview content, and download notes. |
| Flashcards | Generate cards from notes or add them manually. Flip cards and rate them Again, Good, or Easy to schedule future reviews. |
| Quiz | Generate multiple-choice and true/false questions from notes. Review scores, correct answers, and source sentences. |
| Planner | Create a day-by-day study plan based on exam dates, quiz performance, and a daily time budget. Mark sessions as complete. |
| Extras | Dark mode, demo data, data reset, and optional online AI settings. |

## How the Offline Study Engine Works

The offline engine runs in JavaScript inside the browser. Its core logic is exposed through `window.StudyCore` for testing.

The offline engine is rule-based and deterministic; it does not make network requests.

1. **Sentence splitting:** Splits text into sentences while attempting to preserve decimal numbers such as `9.8`.
2. **Keyword scoring:** Counts meaningful words after removing common stopwords. Frequent terms help identify key concepts.
3. **Summaries:** Scores sentences using keyword frequency and sentence length, then selects relevant sentences in their original order.
4. **Definitions:** Detects definition-style sentences such as “X is…”, “X refers to…”, and “X means…”.
5. **Quizzes:** Creates fill-in-the-blank multiple-choice questions using keywords and distractors from the source material. It can also create true/false questions.
6. **Flashcards:** Uses an SM-2-style spaced-repetition approach. Cards have an ease factor, review interval, and due date. Again, Good, and Easy ratings affect scheduling.
7. **Study planning:** Allocates study time according to exam urgency and quiz performance, while respecting the daily time budget and scheduling review before exams.

The quality of generated notes, quizzes, and flashcards depends on the clarity and content of the source material.

## Optional Online AI

The app also supports an optional OpenAI-compatible API, if configured in Settings.

Users can enter a compatible base URL, API key, and model. Notes and quizzes can then request generated content through a chat-completions endpoint. If the request fails or the response is invalid, the app can fall back to its offline engine.

**Security note:** The API key is stored in the browser's `localStorage` and sent to the configured API endpoint. Do not use this feature on a shared computer, and clear the API settings when finished. Do not enter an API key unless you trust the endpoint.

## Quick Start

1. Open or download this repository.
2. Open `index.html` in Microsoft Edge, Chrome, Firefox, or Safari.
3. Select **Load demo data** on the Dashboard.
4. Explore subjects, notes, flashcards, quizzes, and the study planner.

You do not need Python, Node.js, npm, or Git to run the main HTML application.

### Setup by Operating System

- **Windows:** Right-click `index.html` and choose Open with → Microsoft Edge.
- **macOS:** Double-click `index.html`, or run `open index.html`.
- **Linux:** Run `xdg-open index.html`.

Alternatively, you can use a static server. For example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Demo Walkthrough

See [DEMO_GUIDE.md](DEMO_GUIDE.md) for the short demonstration guide.

## Project Structure

```text
index.html          Main offline application, styles, logic, and UI
README.md           Project documentation
DEMO_GUIDE.md       Short demonstration guide for judges
LICENSE             MIT license
tests.html          In-browser test runner
tests.js            Unit tests and UI smoke tests
app.py              Older Streamlit prototype
requirements.txt    Dependencies for the older Streamlit prototype
```

The main offline application is `index.html`. The Streamlit files are retained as an earlier prototype and are not required to run the main HTML app.

## Technology

StudyMate AI uses vanilla HTML, CSS, and JavaScript. The main offline app has no external library dependencies or build step.

- Runs directly from a local HTML file.
- Works offline for its core features.
- Stores user data in the browser's `localStorage`.
- Separates core study logic into `StudyCore` to make it easier to test and maintain.
- Supports responsive layouts and light and dark themes.

### Accessibility

The app is designed with accessibility in mind, including semantic HTML, labelled controls, keyboard-friendly navigation, visible focus indicators, a skip link, status announcements, and escaping of user-provided text before rendering.

Full accessibility compliance has not been independently verified and would require additional manual testing with assistive technologies.

## Privacy

Subjects, notes, flashcards, scores, study plans, and settings are stored in the browser's `localStorage`.

The core offline features do not upload this data. If optional online AI is configured, the relevant content is sent to the selected API endpoint to generate responses.

Using **Reset data** removes the app's locally stored study data. Clear API settings separately if needed.

## Running Tests

The repository includes an in-browser test runner and JavaScript tests.

- Open `tests.html` in a browser to try the test runner.
- Depending on browser security restrictions, local file access may require a static server or additional browser configuration.
- If a test fails, review the displayed error details before making a conclusion about the result.

The test suite is intended to cover text processing, definitions, summaries, quiz generation and grading, planner constraints, flashcard scheduling, storage, dashboard statistics, offline fallback, and UI behaviour.

**Note:** Automated test results must be verified by running the test suite. The presence of test files does not itself confirm that all tests pass.

## Troubleshooting

- **Data appears to be missing:** Browser storage is specific to the browser profile. Private browsing may not retain data.
- **Tests cannot access `StudyCore`:** The browser may be blocking local file iframe access. Try running the project with a static server.
- **Online AI is unavailable:** Check the API URL, model, API key, network connection, and API permissions. The offline engine may still work if the online request fails.
- **The app does not open correctly:** Download the complete repository and open `index.html` in a modern browser.

## Roadmap

- PDF import
- Data backup and restore using JSON
- Improved keyword and phrase extraction
- Image-based flashcards
- Progressive Web App support for mobile installation

## License

This project is licensed under the [MIT License](LICENSE).

Copyright (c) 2026 StudyMate AI Contributors.
