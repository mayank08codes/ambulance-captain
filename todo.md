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
