# SavLife Captain

SavLife Captain is a desktop-first ambulance-driver operations console for coordinating emergency requests, verifying patients, recommending suitable hospitals, guiding active trips, and recording payments from one focused workspace.

> **Product principle:** Every request. Every route. Care at the right hospital.

## Current capabilities

The application keeps the captain’s primary workflow on one page rather than requiring repeated navigation between separate screens.

| Capability | Current behavior |
|---|---|
| Emergency booking | Displays an incoming emergency request with a condition-based reason such as **Urgent chest-pain response**. |
| Patient details | Shows patient condition, contact phone, allergy status, and captain-only emergency notes. |
| Patient verification | Supports OTP verification with the demo code `4826` and a five-second audio-ping verification state. |
| Pre-shift readiness | Checks oxygen level, stretcher sanitation, and defibrillator readiness before the captain can go online for critical requests. |
| AI hospital recommendation | Ranks nearby hospitals using driver-relative distance, ETA, emergency capability, capacity, ratings, and feedback context. |
| Distance accuracy | Uses normalized coordinates and realistic nearby-distance and urban-ETA calculations to avoid impossible values. |
| Map workflow | Retains the resilient previous live-map presentation with a Google Maps loader and a visible fallback route surface. |
| Ambulance animation | Starts immediately after OTP verification and moves rapidly along the route toward the selected hospital. |
| ER guidance | Stores dedicated emergency entrance or ambulance-dock metadata for hospital-aware routing context. |
| Automatic payment | Opens the payment stage automatically after the simulated hospital arrival. |
| Driver profile | Keeps driver personal, vehicle, license, verification, and emergency-contact information outside the booking page. |
| Earnings | Provides driver income and payout context separately from patient and booking details. |
| Safety controls | Includes night-driving presentation and rest-safety prompts after emergency runs. |
| Readable location | Displays a reverse-geocoded driver place name or address instead of exposing latitude and longitude in the interface. |

## Main workflow

1. The captain signs in through the driver portal.
2. The captain completes the oxygen, stretcher, and defibrillator readiness checklist.
3. The captain goes online and receives an incoming emergency booking alert.
4. The captain reviews the patient reason, condition, phone number, allergies, and emergency notes.
5. The captain accepts the request and verifies the passenger with OTP `4826` or the five-second audio-ping state.
6. The backend hospital recommendation flow reviews nearby options using distance, ETA, capacity, emergency capability, ratings, and feedback.
7. The map and ambulance marker begin the active route toward the selected hospital’s emergency-dock context.
8. The accelerated demo route reaches arrival automatically, after which the payment stage opens.
9. The captain completes payment confirmation and receives a safety-rest prompt before another emergency run.

## Technology stack

| Layer | Technology | Role |
|---|---|---|
| User interface | React 19 | Interactive operations-console components and stateful workflow. |
| Language | TypeScript | Frontend, backend, shared types, and safer API contracts. |
| Desktop web runtime | Vite | Local development server and production client bundling. |
| Backend runtime | Node.js | Server-side application and API execution. |
| API layer | tRPC | Type-safe communication between the React client and server procedures. |
| AI | Built-in LLM integration | Hospital recommendation and explainable ranking context. |
| Maps | Google Maps JavaScript API loader | Map initialization, geocoding support, and Google map integration when available. |
| Fallback map | OpenStreetMap embed | Resilient route context when the Google map cannot be used as the visible layer. |
| Location | Browser Geolocation API | Reads the captain’s current GPS position when permission and device support are available. |
| Styling | CSS and NativeWind-compatible project styles | Desktop console layout, operational theme, animation, and night-driving presentation. |
| Icons | Lucide React | Consistent operational icons for requests, maps, hospitals, payments, and safety controls. |
| Testing | Vitest | Workflow, API-key configuration, and deterministic behavior checks. |
| Package manager | pnpm | Dependency management and project scripts. |

## Repository structure

```text
src/
  App.tsx          Main desktop operations console and workflow state
  index.css        Desktop layout, map, modal, animation, and night-mode styles
server/
  routers.ts       tRPC procedures, including hospital recommendation logic
  _core/           Server runtime, LLM, authentication, and integration helpers
tests/
  ambulance-flow.test.ts    Deterministic ambulance workflow tests
  google-maps-key.test.ts   Google Maps configuration validation
todo.md           Feature history and remaining implementation tasks
validation-findings.md     Reproduced issues and validation notes
app.config.ts     Project and Expo configuration metadata
package.json      Scripts and dependency definitions
```

## Local development

Install dependencies and start the desktop development environment:

```bash
pnpm install
pnpm dev
```

The project starts the server and desktop preview together. The development scripts are defined in `package.json`.

## Environment configuration

The live Google Maps key is stored through the project’s secure environment configuration rather than committed to source code. The expected variable is:

```text
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_browser_key
```

For production use, restrict the key in Google Cloud Console by HTTP referrer, enable only the APIs required by the deployment, and avoid committing `.env` files or keys to GitHub.

The application can still render its resilient fallback route context when Google Maps authorization, browser permissions, or map rendering is unavailable.

## Validation commands

Run the main checks before submitting changes:

```bash
pnpm check
pnpm test -- --run
pnpm build
```

The current project validation covers the ambulance workflow and Google Maps key configuration. The authentication logout test is intentionally skipped in the deterministic local suite when its external session dependency is unavailable.

## Operational safety notes

Patient information is operationally sensitive. The booking surface should remain limited to information required for the captain’s active response, while driver personal information belongs in the dedicated Driver profile section. Production deployments should add authenticated roles, audit logging, encrypted transport, secure data retention, and explicit access controls before handling real patient records.

The current demo uses a deterministic OTP and accelerated route playback for training and preview purposes. Real dispatch should replace demo timing with authenticated patient-side verification, road-snapped directions, live traffic data, and a backend request state shared by patient, dispatcher, and captain clients.

## Roadmap

The next operational improvements are cancellation recovery to the nearest waiting request, production-grade patient-side audio verification, complete end-to-end validation of readiness through payment, and persistent earnings and trip records.

## License

This repository is maintained as a project-specific prototype and does not currently declare a public open-source license. Add an appropriate license before distributing the source outside the project team.
