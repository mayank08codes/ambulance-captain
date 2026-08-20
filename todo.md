# Project TODO

- [x] Define the ambulance-driver app scope and primary workflows
- [x] Create the mobile interface design plan
- [x] Replace the starter home screen with the driver dashboard
- [x] Add online/offline availability state and request simulation
- [x] Add incoming ambulance request accept/decline flow
- [x] Add request detail with pickup and passenger information
- [x] Add OTP verification flow with deterministic demo OTP
- [x] Add active trip screen with map-style route visualization
- [x] Add nearby hospital list with distance, capabilities, and reviews
- [x] Add hospital detail and route comparison flow
- [x] Add payment summary and trip completion flow
- [x] Add trip history and driver profile/settings screens
- [x] Add branded ambulance app icon and update app configuration
- [x] Add deterministic tests for core request, OTP, route, and payment transitions
- [x] Run type checking, linting, and app preview verification
- [ ] Save the final project checkpoint

## Desktop adaptation

- [x] Add a responsive wide-screen layout for the same driver workflow
- [x] Add desktop sidebar navigation and active-trip workspace treatment
- [x] Preserve desktop access to requests, OTP, maps, hospitals, routes, payments, history, and profile
- [ ] Verify responsive behavior at desktop and mobile viewport sizes
- [ ] Save a new checkpoint for the desktop-enabled project

## Desktop web rebuild

- [x] Rebuild the driver experience as a proper desktop-first web application
- [x] Add desktop web navigation for dashboard, requests, active trip, hospitals, routes, payments, history, and profile
- [x] Add desktop web interactive request, OTP, trip, hospital, route, and payment panels
- [x] Add responsive behavior for smaller browser widths without presenting it as a phone-only app
- [x] Run web application tests and preview verification
- [ ] Save a checkpoint for the desktop web application

## Real operations upgrade

- [ ] Audit every clickable control and remove dead-end interactions
- [x] Replace the map mock with a real map/GPS integration path
- [x] Add browser geolocation permission, live driver position, and location status
- [x] Add working route launch/navigation actions and route refresh states
- [x] Add editable driver profile and settings screens with save feedback
- [x] Add complete request, OTP, trip, hospital, route, payment, and history state transitions
- [ ] Add persistent backend-ready operational data flow or documented fallback
- [x] Request and configure required real-service secrets without exposing them in chat
- [x] Run end-to-end web interaction and integration validation
- [ ] Save a new checkpoint for the upgraded application

## Delhi Google Maps workflow

- [x] Configure Google Maps browser integration for Delhi
- [x] Add Delhi pickup, driver, and hospital coordinates
- [x] Add single-driver request acceptance with request locking
- [x] Start navigation automatically after valid OTP verification
- [x] Show live distance, ETA, route progress, and nearby hospitals
- [x] Detect arrival at the selected hospital from GPS proximity or a clear fallback action
- [x] Open payment automatically after trip completion
- [x] Make hospital, route, payment, profile, and settings actions fully navigable and editable
- [ ] Validate the end-to-end Delhi request-to-payment flow

## No-key live-style Delhi build

- [x] Replace static map mock with OpenStreetMap tiles and an interactive map view
- [x] Add browser geolocation permission and live driver position tracking
- [x] Add Delhi request, pickup, destination, and hospital markers
- [x] Add distance and ETA calculations for nearby hospitals
- [x] Add request locking so one driver owns the accepted request
- [x] Make OTP verification automatically start navigation state
- [x] Add trip progress and arrival detection with a testable fallback
- [x] Automatically open the payment session after arrival
- [x] Make profile, settings, hospital, route, history, and payment controls fully functional
- [x] Validate the entire no-key live-style workflow

## Google Maps customer-to-driver workflow

- [x] Inspect Savife reference interactions and visual patterns
- [x] Configure the user-provided Google Maps API key securely
- [ ] Add customer-side ambulance booking state to the web app
- [ ] Add driver assignment and request handoff state
- [x] Detect and display the driver’s live browser location
- [x] Start Google Maps route only after driver acceptance and valid OTP
- [x] Select and display the nearest suitable hospital from the active trip location
- [x] Show live route, distance, ETA, and arrival state
- [ ] Validate the complete customer booking to driver navigation workflow
- [ ] Save a new Google Maps-enabled checkpoint

## Branded login experience

- [x] Add a branded Ambulance Captain login screen using the app logo
- [x] Add driver phone/email and password or OTP entry states
- [x] Add login validation, loading, error, and success feedback
- [x] Connect successful login to the driver dashboard
- [x] Add logout or session reset behavior
- [x] Validate login responsiveness and clickable controls

## Complete captain workflow

- [x] Add branded login with driver session state
- [x] Add captain availability toggle with online/offline feedback
- [ ] Add incoming request queue and request sound/visual attention state
- [x] Add request detail, patient, pickup, urgency, fare, and ETA information
- [x] Add accept, decline, timeout, and request-lock behavior
- [ ] Add OTP entry, validation, resend, and trip-start transition
- [x] Add live trip map with GPS status, route, ETA, distance, and hospital recommendation
- [ ] Add call/help/share-location actions with usable feedback
- [x] Add arrival detection, trip completion, payment confirmation, and receipt state
- [x] Add earnings dashboard, payout summary, and trip history
- [x] Add editable profile, documents, vehicle details, settings, help, and logout
- [ ] Validate every navigation item and primary button end to end

## Live hospital recommendations

- [x] Add hospital capacity, emergency capability, specialty, and open-status data fields
- [x] Calculate live distance and ETA from the driver GPS position for every hospital
- [x] Rank hospitals with a transparent recommendation score
- [x] Show why each hospital is recommended, including distance, ETA, rating, capacity, and capability
- [x] Add full hospital detail view with address, phone, services, beds, reviews, and operating status
- [x] Add compare hospitals flow before navigation begins
- [x] Update recommendations and map markers when driver location changes
- [x] Validate recommendation ranking and hospital detail interactions

## Location-neutral welcome refresh

- [x] Remove city-specific wording from the visible brand and welcome entry experience
- [x] Create an attractive Ambulance Captain welcome page with logo, value proposition, and emergency operations highlights
- [x] Redesign the basic login panel into a polished sign-in experience
- [x] Add clear login validation, loading, error, and demo-access feedback
- [x] Keep successful sign-in connected to the driver operations dashboard
- [x] Validate the welcome page at desktop and smaller browser widths
- [ ] Save a checkpoint for the refreshed welcome experience

## Welcome page content cleanup

- [x] Remove rating, coverage, one-tap, and other unsupported performance metrics from the welcome/login page
- [x] Replace city-specific welcome copy with location-neutral emergency operations messaging
- [x] Keep the first page focused on brand, trust, safety, and sign-in
- [x] Validate the revised welcome page and save a checkpoint

## Login label refinement

- [x] Change the primary login action label to exactly “Sign in”
- [x] Validate that the simplified button still submits the login flow correctly

## Welcome headline refinement

- [x] Replace the generic welcome headline with a specific ambulance-driver mission statement
- [x] Validate the updated headline in the welcome page and save a checkpoint

## Brand identity refresh

- [x] Generate a distinctive Ambulance Captain logo with emergency and route-care symbolism
- [x] Replace the simple logo across the web welcome page and app assets
- [x] Update the welcome headline with a meaningful ambulance-driver mission statement
- [x] Validate logo readability and branding consistency across sizes
- [ ] Save a checkpoint for the brand refresh

## Colorful welcome background

- [x] Add layered navy, teal, cyan, and coral background colors to the welcome page
- [x] Preserve readable contrast for the logo, headline, trust items, and sign-in card
- [x] Validate the colorful background and save a checkpoint

## RescueRoute identity

- [x] Rename visible app branding from Ambulance Captain to RescueRoute
- [x] Update the app configuration display name to RescueRoute
- [x] Ensure the logo clearly depicts an ambulance rather than an abstract route mark
- [x] Apply RescueRoute branding consistently to the welcome page, login card, and app surfaces

## Red ambulance-car logo update

- [x] Generate a recognizable ambulance-car logo with a red emergency body
- [x] Replace the current logo in the welcome page, sign-in card, and navigation brand
- [x] Update favicon and app configuration logo references
- [x] Validate red logo contrast and small-size readability
- [ ] Save a checkpoint for the logo update

## Restore simple ambulance logo

- [x] Restore the previous simple ambulance logo asset in the welcome page and sign-in card
- [x] Restore the simple logo in navigation branding and app configuration
- [x] Validate the restored logo and save a checkpoint

## Logo visibility and header separation

- [ ] Fix the ambulance logo asset so the ambulance is visibly rendered inside the mark
- [ ] Separate the RescueRoute app name from the logo instead of placing it inside the logo block
- [ ] Make RescueRoute a bold standalone heading at the top of the welcome and sign-in surfaces
- [ ] Validate logo visibility and header spacing and save a checkpoint

## Visible red ambulance logo

- [ ] Create a simple red ambulance silhouette with a white medical cross
- [ ] Ensure the logo is clearly visible at small and large sizes
- [ ] Keep RescueRoute as a separate bold app-name heading
- [ ] Validate the logo and save a checkpoint

## Separate blue logo and app name

- [ ] Keep the blue ambulance logo as a standalone mark
- [ ] Display RescueRoute as a separate bold heading beside or above the logo
- [ ] Validate separation across welcome, sign-in, sidebar, and browser branding

## SavLife Captain branding update

- [x] Change the visible app name to “SavLife Captain”
- [x] Place the ambulance logo on the left side of the app name in the brand header
- [x] Update the sidebar, welcome/sign-in surfaces, and app configuration consistently

## Colorful SavLife Captain welcome refinement

- [x] Improve the welcome background with a richer blue, cyan, and violet color treatment
- [x] Refine headline, supporting text, brand text, and sign-in typography colors for stronger contrast
- [x] Validate desktop visual balance and readability

## Standalone blue ambulance icon correction

- [x] Replace the broken-looking logo image with a clearly visible simple ambulance illustration
- [x] Keep the ambulance illustration inside a blue square icon
- [x] Remove all SavLife Captain text from inside the square icon
- [x] Keep SavLife Captain separate beside the icon and validate the welcome/sign-in surfaces

## Large top SavLife Captain title

- [x] Make SavLife Captain a large bold title at the top
- [x] Position the title immediately to the right of the blue ambulance square
- [x] Keep the title outside the square and validate welcome/sign-in alignment

## Trust label readability refinement

- [x] Increase the font size and weight of Verified driver access, Live trip guidance, and Hospital-aware routing
- [x] Improve trust-label contrast and spacing on the colorful background
- [x] Validate readability at desktop width

## Post-login white-screen bug

- [x] Reproduce the blank screen after successful driver sign-in
- [x] Inspect runtime errors and post-login component rendering
- [x] Fix the sign-in-to-operations transition
- [x] Validate the operations screen after login at desktop width

## Deployed blank page and complete workflow hardening

- [x] Reproduce the deployed blank page and identify the production runtime failure
- [x] Harden the app entrypoint so sign-in and operations render without a white screen
- [x] Validate request acceptance, OTP, live navigation, hospital selection, arrival, payment, history, profile, settings, and help flows
- [x] Validate the complete desktop workflow and save a new checkpoint

## Location-neutral live workflow

- [x] Remove Delhi-specific labels and copy from the driver workflow
- [x] Replace Delhi-only fallback assumptions with browser GPS and location-neutral fallback wording
- [x] Keep request, OTP, live hospital routing, arrival, and payment flow usable without a Delhi location
- [x] Validate and checkpoint the location-neutral workflow
- [x] Reuse the existing configured Google Maps key without requesting a new key

## Captain-style live map workflow

- [ ] Make the active-trip map visibly persistent and usable
- [ ] Add Captain-style request, online status, OTP, navigation, hospital, arrival, and payment emphasis
- [ ] Validate the live map across request and active-trip states
- [ ] Save a checkpoint for the Captain-style workflow update

## Automatic nearest-hospital route start

- [ ] Select the nearest suitable hospital from the captain's current GPS position
- [ ] Start the active live route automatically after valid OTP verification
- [ ] Show the selected hospital, route, distance, ETA, and arrival/payment transitions without an extra manual start step
- [ ] Validate and checkpoint the automatic route-start workflow

## Live map visibility and workflow stability

- [x] Prevent the post-login React removeChild crash by isolating the Google Maps canvas
- [x] Detect Google Maps authorization failures without blanking the Captain dashboard
- [x] Show a real OpenStreetMap route surface with live ambulance and hospital markers as fallback
- [x] Keep the map bounded inside the Rapido Captain-style operations workspace
- [x] Validate TypeScript, tests, production build, sign-in, dashboard, and visible map fallback

## Advanced data accuracy and operations UX

- [x] Audit every displayed hospital distance, ETA, route duration, and unit label for consistency
- [x] Replace hardcoded-looking hospital metrics with calculations derived from the active driver and hospital coordinates
- [x] Keep distance in kilometers and ETA in realistic minutes with clear calculation context
- [x] Upgrade the dashboard with richer live-operation status, hospital comparison, route intelligence, and operational detail
- [x] Validate the advanced desktop workflow and save a checkpoint

## Unified one-page Captain operations console

- [x] Keep incoming booking, passenger details, acceptance, OTP, hospital recommendation, map, ETA, arrival, and payment visible in one primary workspace
- [x] Remove the need to switch sidebar icons for the core booking-to-payment journey
- [x] Add a clear AI-assisted hospital decision panel with explainable reasons and confidence context
- [x] Make the map and route update inline immediately after valid OTP verification
- [x] Validate the complete one-page workflow and preserve secondary pages only for history/profile/settings

## Nearby hospital intelligence correction

- [ ] Audit why the active hospital distance can show 11,763 km instead of a nearby demo distance
- [ ] Correct the demo driver and hospital coordinates so the recommended hospital is approximately 3–4 km away when GPS is unavailable
- [ ] Keep distance and travel-time calculations consistent and visibly explain their source
- [ ] Add AI-assisted hospital comparison for rating, review feedback, emergency capability, capacity, and care details
- [ ] Validate the recommendation, metrics, and one-page booking workflow

## Automatic Google live location and place names

- [ ] Reuse the existing Google Maps key without requesting it again
- [ ] Track the captain’s live browser GPS position while authenticated and online
- [ ] Reverse-geocode the current position into a readable place name
- [ ] Show named pickup, captain, route, and hospital locations in the unified console
- [ ] Validate live updates and a graceful fallback when Google services are unavailable

## Driver location clarity

- [x] Display the fetched current GPS place under the exact label “Driver location”
- [x] Keep patient pickup as a separate named destination
- [x] Ensure topbar, map panel, request card, and route panel never call the driver location patient location

## Visible driver map and automatic OTP route

- [x] Render a visible map surface in the unified console
- [x] Show the captain’s current GPS position with a clear Driver location marker
- [x] Start the live route automatically after valid OTP 4826
- [x] Keep the route, hospital, distance, ETA, and driver marker visible in the same workspace
- [x] Validate Google-map and fallback-map behavior after OTP

## Explainable AI hospital recommendation

- [x] Add an explainable AI-style hospital decision using live driver distance and ETA
- [x] Include emergency capability, open status, capacity, rating, review volume, and feedback in the decision
- [x] Show why the recommended hospital was selected and compare alternatives
- [x] Trigger the recommendation before route start and keep it visible in the one-page console
- [x] Validate the AI recommendation and complete OTP-to-map workflow

## Distance accuracy correction

- [ ] Trace every driver and hospital coordinate source used by the map and ranking logic
- [ ] Normalize coordinate order and distance units across all calculations
- [ ] Remove impossible values such as 11,763 km from the nearby demo workflow
- [ ] Keep hospital distance, route distance, and ETA mathematically consistent
- [ ] Validate the corrected 3–4 km recommendation through OTP-to-payment

## Live ambulance map animation

- [x] Add smooth route-aware ambulance marker movement during active navigation
- [x] Add visible motion feedback in the fallback map and Google Maps marker
- [x] Keep animation synchronized with trip progress and stop it on arrival/payment
- [x] Validate the animated map through the OTP-to-navigation flow

## Live map and advanced ambulance operations

- [x] Use the validated Google Maps key for live maps, Places, reverse geocoding, and directions
- [x] Add a pre-shift checklist for oxygen level, stretcher sanitation, and defibrillator readiness
- [x] Add an incoming emergency booking popup and patient verification before active dispatch
- [ ] Add cancellation handling with a nearby next-request option
- [ ] Add OTP and five-second patient audio-ping verification status before active dispatch
- [ ] Automatically route the driver to the next closest waiting request after cancellation
- [ ] Route hospital navigation to dedicated ER ramp or ambulance-dock coordinates
- [ ] Validate verification, cancellation recovery, and ER entrance guidance end to end
- [x] Open real Google Maps driving directions after valid OTP verification
- [x] Use the driver’s current GPS as origin and the hospital ER dock as destination
- [x] Preserve the fallback route when Google Maps authorization or rendering fails
- [x] Restore the previous live-map behavior without changing other workflow features
- [x] Validate that OTP, animation, hospital recommendation, ER dock, patient verification, and payment remain unchanged
- [x] Add AI hospital ranking from driver-relative distance, ETA, capacity, ratings, and emergency capability
- [x] Add exact ER entrance or ambulance-dock guidance for selected hospitals
- [x] Add night-visibility mode and mandatory rest prompts after consecutive emergency runs
- [ ] Validate the complete booking-to-OTP-to-hospital-to-payment workflow with the new safety controls
- [ ] Add a rest-or-continue popup after consecutive completed drives and payments
- [ ] Make Rest update availability safely and Continue keep the captain ready for the next request
- [ ] On Continue, automatically open the next incoming emergency request
- [ ] On Rest, pause availability and suppress incoming request alerts until resumed
- [ ] Transfer the next request back to dispatch when the captain chooses Rest
- [ ] Show a clear confirmation that another available ambulance can receive the request


- [ ] Validate the prompt after payment without breaking trip completion

- [ ] Update README.md with the latest SavLife Captain features, workflow, setup, and validation notes
- [x] Correct hospital phone data and remove unverified contact numbers from visible UI
- [x] Validate hospital contact display across hospital cards and selected route details

- [x] Commit the README update to the connected GitHub repository
- [x] Document the rest-or-continue safety prompt and dispatch transfer behavior in README.md
- [x] Document the technology used for availability state, trip state, and request handoff



## Selectable AI hospital recommendations

- [x] Show four AI-ranked hospital recommendations with distance, ETA, rating, capacity, and selection reason
- [x] Allow the captain to select another recommended hospital when it is more suitable or nearer
- [x] Recalculate the active route and destination after hospital selection
- [x] Validate hospital switching without breaking arrival and payment flow

## Readable driver location

- [x] Replace visible latitude/longitude output with a readable driver place name or address
- [x] Keep internal coordinates available for distance, route, and map calculations
- [x] Provide a clear fallback label when reverse geocoding is unavailable
- [x] Validate the location display in the dashboard and active-trip panels

## Preserve previous console structure

- [x] Keep the existing booking, OTP, route, ambulance animation, and payment layout unchanged
- [x] Change only the patient transfer wording to a clear medical reason
- [x] Reconfirm fast post-OTP movement and automatic payment remain intact

## Emergency reason wording

- [x] Replace the generic Patient transfer request title with a clear condition-based emergency reason
- [x] Keep the reason visible consistently across booking, OTP, route, and payment states
- [x] Validate the new wording without changing the patient condition details

## Fast post-OTP route and payment handoff

- [x] Start ambulance movement immediately after OTP 4826 verification
- [x] Advance the ambulance marker quickly along the connected route to the hospital
- [x] Automatically detect route completion and open the payment stage
- [x] Validate OTP-to-moving-marker-to-payment without extra manual steps

## Patient details and driver income

- [x] Add patient condition/disease, contact phone, allergies, and emergency notes to the booking detail
- [x] Keep driver personal details out of the booking page and show them only in Driver profile
- [x] Move driver income and personal financial metrics to the Earnings section
- [x] Keep sensitive patient information clearly labeled for captain-only operational use
- [x] Add trip earnings and captain income breakdown to the payment and earnings surfaces
- [x] Connect completed trip fare to the driver income summary
- [x] Validate patient details and earnings through the booking-to-payment flow
