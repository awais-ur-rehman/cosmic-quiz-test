# Cosmic Quiz

A 10-question cosmic personality quiz built with Next.js 15, Payload CMS 3, and Postgres. Questions and scoring are managed through the Payload admin. Results are saved per email and can be retrieved later.

---

## Stack

- Next.js 15 (App Router)
- Payload CMS 3 with Postgres
- Tailwind CSS v4
- TypeScript

---

## Running locally

**Requirements:** Node 20+, pnpm, Docker (for Postgres)

**1. Clone and install**

```bash
git clone <your-repo-url>
cd test-fullstack-web-cms-next
pnpm install
```

**2. Set up environment**

```bash
cp .env.example .env
```

Edit `.env`:

```
DATABASE_URI=postgresql://postgres:postgres@localhost:5432/cosmic_quiz
PAYLOAD_SECRET=pick-any-random-string
```

**3. Start Postgres**

```bash
docker compose up -d
```

This starts a Postgres instance on port 5432 and creates the `cosmic_quiz` database automatically.

**4. Start the dev server**

```bash
pnpm dev
```

On first boot, Payload runs migrations and seeds the quiz. Open `http://localhost:3000`.

**5. Payload admin**

`http://localhost:3000/admin` — create an admin user on first visit. From there you can edit questions, options, scores, and result ranges directly.

---

## Building for production

```bash
pnpm build
pnpm start
```

---

## Running tests

Make sure the dev server is running on port 3000, then:

```bash
pnpm test:e2e
```

Playwright runs 18 end-to-end tests covering the full quiz flow, result screen, score-13 easter egg, email save, and result lookup.

---

## Project structure

```
src/
  collections/
    Quizzes.ts       quiz schema — title, questions array, results array
    Submissions.ts   saved results — score, breakdown, email, notes (encrypted)
  lib/
    encryption.ts    shift cipher used by the notes hooks
    scoring.ts       computeScore and matchResult (including the score-13 override)
  seed/
    quiz.ts          seeds the sample quiz on first run, skips if data exists
  actions/
    quiz.ts          server actions — submitQuiz, saveResult, lookupByEmail
  app/
    (frontend)/
      page.tsx           quiz page — server component, fetches and shuffles options
      lookup/page.tsx    past results page
      components/
        QuizForm.tsx     one-question-at-a-time UI, client component
        ResultView.tsx   score, breakdown table, save panel
        LookupForm.tsx   email lookup form
        SiteHeader.tsx   top nav
```

---

## How it works

**Quiz flow**

The quiz page is a server component. It fetches the active quiz from Payload using the local API, shuffles each question's options server-side, and passes the data down as props. The score for each option travels with the shuffled data, so the order never affects scoring.

`QuizForm` is the only client component. It tracks which answer was selected for each question and navigates one question at a time. On the final question, clicking "See my result" calls the `submitQuiz` server action, which re-fetches the quiz from the database, computes the score, and returns the result. Nothing score-related is trusted from the client.

**Scoring**

Each of the 10 questions has 4 options scored 0 through 3. The total ranges from 0 to 30. The result is matched against ranges stored in the quiz:

| Score | Result |
|---|---|
| 0-6 | Mooncat |
| 7-14 | Solar Fox |
| 15-22 | Cosmic Bear |
| 23-30 | Galactic Dragon |

If the total is exactly 13, the result is replaced with the easter egg message before range matching runs.

**Saving results**

After seeing their result, users can optionally add notes and an email address. Clicking "Save result" calls the `saveResult` server action, which writes a Submission to the database. If no email is provided, nothing is saved — the result is still shown.

**Looking up past results**

`/lookup` accepts an email and returns the most recent Submission for that address. Notes come back decrypted via the Payload `afterRead` hook.

**Notes encryption**

The `notes` field on Submissions is encrypted before it hits the database using a shift cipher (as specified in the brief). A `beforeChange` hook encrypts incoming plaintext. An `afterRead` hook decrypts on every read, so the admin UI and the lookup flow both get readable text automatically. This is a toy cipher per the brief, not production cryptography.

**Editable from Payload admin**

Questions, option labels, option scores, question order, and result ranges are all stored as Payload collection fields. Everything can be changed from the admin UI without touching code.

---

## What I prioritized

The data layer came first — collections, encryption hooks, scoring logic — because the rest of the app depends on it being correct. Once that was solid, the server actions and UI were straightforward to wire up.

I kept client-side JavaScript to a minimum. The quiz page is a server component. The only client component is `QuizForm`, which handles answer selection and calls server actions on submit. There is no client-side state management library.

The one-question-at-a-time flow was a deliberate UX choice over showing all 10 questions at once. It keeps the interface focused and makes it easier to track progress.

## What I would improve with more time

- Error boundaries around the quiz and lookup pages so a failed fetch shows something useful instead of a blank screen.
- Email format validation with inline feedback before the save request goes out.
- A way to take the quiz multiple times and see a history of results, not just the latest.
- The shift cipher is per the brief. In a real app this would be AES-256 or similar, with the key in an environment variable.
- The seed runs on every `onInit` call and exits early if data exists. For production this would be a proper migration script.

## Assumptions

- One quiz at a time. The app fetches the first quiz in the collection. Supporting multiple quizzes would need a routing change.
- The `notes` field is only encrypted on creation, not on admin edits. Updating notes through the Payload admin would re-encrypt already-encrypted text. Since submissions are write-once in normal use this is not an issue, but worth noting.
- Postgres is expected locally via Docker. No SQLite fallback was added since the brief specifies Postgres.
