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
- [ ] Replace the map mock with a real map/GPS integration path
- [ ] Add browser geolocation permission, live driver position, and location status
- [ ] Add working route launch/navigation actions and route refresh states
- [ ] Add editable driver profile and settings screens with save feedback
- [ ] Add complete request, OTP, trip, hospital, route, payment, and history state transitions
- [ ] Add persistent backend-ready operational data flow or documented fallback
- [ ] Request and configure required real-service secrets without exposing them in chat
- [ ] Run end-to-end web interaction and integration validation
- [ ] Save a new checkpoint for the upgraded application

## Delhi Google Maps workflow

- [ ] Configure Google Maps browser integration for Delhi
- [ ] Add Delhi pickup, driver, and hospital coordinates
- [ ] Add single-driver request acceptance with request locking
- [ ] Start navigation automatically after valid OTP verification
- [ ] Show live distance, ETA, route progress, and nearby hospitals
- [ ] Detect arrival at the selected hospital from GPS proximity or a clear fallback action
- [ ] Open payment automatically after trip completion
- [ ] Make hospital, route, payment, profile, and settings actions fully navigable and editable
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
