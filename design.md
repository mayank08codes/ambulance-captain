# Ambulance Captain — Mobile Interface Design

## Product Direction

Ambulance Captain is a portrait-oriented driver app for ambulance operators. The primary interaction model is one-handed use during dispatch and navigation. The interface follows mainstream iOS conventions: clear hierarchy, large touch targets, concise status labels, bottom sheets for decisions, and persistent access to the active trip.

## Screen List

| Screen | Primary content and functionality |
|---|---|
| Driver Home | Online/offline status, current shift summary, nearby request card, earnings snapshot, and shortcut to active trip. |
| Incoming Request Sheet | Patient pickup area, estimated distance, request urgency, estimated fare, payment mode, and accept/decline actions with a countdown. |
| Request Detail | Pickup address, patient/contact summary, ambulance type, notes, call/message actions, and route preview to pickup. |
| OTP Verification | Four-digit passenger OTP input, resend/help action, verification feedback, and safe transition into the active trip. |
| Active Trip Map | Driver location, pickup/drop-off markers, route line, ETA, traffic indicator, emergency contact action, and trip-state controls. |
| Hospital Finder | Nearby hospitals sorted by distance/review score, specialty/capability chips, review summaries, and route comparison. |
| Hospital Detail | Hospital rating, review count, emergency department availability, distance, estimated arrival, and select-destination action. |
| Route Comparison | Recommended, fastest, and least-congested route cards with ETA, distance, traffic status, and select action. |
| Payment Summary | Fare breakdown, cash/online status, payment confirmation, receipt reference, and complete-trip action. |
| Trip History | Completed trips, date/time, pickup and hospital, fare, payment status, and detail access. |
| Driver Profile and Settings | Driver/ambulance identity, availability toggle, notification preferences, help, and sign-out. |

## Key User Flows

### Accept and start a request

1. The driver switches to **Online** on Driver Home.
2. An Incoming Request Sheet appears with pickup area, urgency, ETA, fare estimate, and payment mode.
3. The driver taps **Accept request** and sees Request Detail.
4. The driver reviews the pickup route and can call or message the requester.
5. At pickup, the driver taps **Verify passenger OTP**, enters the four-digit code, and starts the trip.

### Navigate to a suitable hospital

1. During the active trip, the driver taps **Find hospital**.
2. Hospital Finder displays nearby hospitals with distance, review score, emergency capability, and estimated arrival.
3. The driver opens a hospital card to inspect reviews and facilities.
4. The driver taps **Compare routes** to see recommended, fastest, and least-congested routes.
5. The driver selects a route and returns to Active Trip Map with the selected destination and ETA.

### Complete payment and trip

1. The driver reaches the selected hospital and taps **Arrived**.
2. Payment Summary displays the fare, payment method, and current payment status.
3. The driver confirms cash collection or waits for online payment confirmation in the prototype.
4. The driver taps **Complete trip** and receives a success confirmation.
5. The completed trip appears in Trip History and the driver returns to Driver Home.

## Interaction and Accessibility Rules

Primary actions use full-width buttons near the lower portion of the screen, with at least comfortable one-handed touch targets. Destructive or potentially premature actions such as declining a request are visually separated from the primary action. Active trip state is always represented by a strong status color and a visible label, not color alone. Important actions provide immediate pressed feedback and concise confirmation states.

## Color Choices

The brand uses a **deep navy** foundation for trust and legibility, a **signal red** accent for urgent dispatch states, and a **teal-green** operational accent for accepted, en-route, and completed states. Supporting colors are a pale blue-gray surface, slate text, amber for attention, and white for elevated cards.

| Token | Color | Use |
|---|---|---|
| Deep navy | `#102A43` | Navigation, headers, primary dark surfaces |
| Signal red | `#D64545` | Emergency urgency, incoming request emphasis |
| Teal green | `#0F766E` | Online state, accepted request, successful completion |
| Sky blue | `#E8F1F5` | Map background and subtle informational surfaces |
| Slate | `#52606D` | Secondary text and metadata |
| Amber | `#D97706` | Traffic warnings and payment attention |
| White | `#FFFFFF` | Cards and primary readable surfaces |

## Prototype Data Boundaries

The first working version uses deterministic local demo data for driver identity, requests, OTP, hospitals, routes, reviews, and payment outcomes. The screens and state transitions are real and testable, while real GPS, production maps, SMS OTP, hospital APIs, and payment processing remain integration points for a later release.
