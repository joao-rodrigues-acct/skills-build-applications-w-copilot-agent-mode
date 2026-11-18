# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

- Presentation tier decision: Keep React pages and shared API-client responsibilities in `octofit-tracker/frontend/src`. Pages call relative `/api` endpoints through the shared client and present loading, empty, error, and success states; they do not own business rules or persistence.
- Logic tier decision: Keep HTTP handling and application behavior in Express/TypeScript routes and services under `octofit-tracker/backend/src`. Routes validate requests and return deliberate client errors for invalid input rather than leaking database cast errors.
- Data tier decision: Define persistence and field validation in the Mongoose models under `octofit-tracker/backend/src/models`; keep representative, repeatable seed data in `src/scripts/seed.ts`. MongoDB remains on port `27017`.
- Activity tracking approach: Validate that submitted user and team IDs are well-formed and refer to existing records. Create and list activities with the submitted user, team, type, and minutes, plus computed points and an occurrence date.
- Team management approach: Create and list teams while retaining their name, mascot, and members. Reject a missing team name with `400`.
- Leaderboard approach: Aggregate activity points by team, sort from highest total to lowest, and return each team name, total points, and 1-based rank.
- Workout suggestions approach: Match the requested email to a user, then recommend workouts based on that user's goal or recent activity and explain the recommendation. Return a deliberate 4xx response when no user matches.
- Implementation order: Complete data models and validation first, implement and verify API contracts second, and finish React presentation last. This keeps each tier dependent on an already-defined contract.

## Test plan

Baseline before implementation: data tests had **4 failed and 1 passed** (the seed-data test passed); API tests had **4 failed**; frontend tests had **15 failed**. The failures identify incomplete model validation, API behavior, and presentation contracts, respectively.

- **Data tier:** `npm run test:data --prefix octofit-tracker/backend` validates required model fields and seed behavior. A failure indicates a persistence schema/validation or seed-data contract issue.
- **Logic tier:** `npm run test:api --prefix octofit-tracker/backend` validates API request handling, response contracts, leaderboard ordering, and workout recommendations. A failure indicates route/service behavior does not meet the API contract.
- **Presentation tier:** `npm test --prefix octofit-tracker/frontend` validates API-backed rendering and loading, empty, and error states. A failure indicates the client or page behavior does not meet the presentation contract.
- **Build checks:** `npm run build --prefix octofit-tracker/backend` and `npm run build --prefix octofit-tracker/frontend` check that each tier compiles after its changes; they complement, but do not replace, the contract tests above.
