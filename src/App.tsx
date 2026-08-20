import { useEffect, useMemo, useRef, useState } from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import {
  Activity,
  Ambulance,
  ArrowRight,
  BadgeCheck,
  Bell,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  CreditCard,
  Hospital,
  LayoutDashboard,
  MapPin,
  Menu,
  Navigation,
  Phone,
  Route,
  Settings,
  ShieldCheck,
  Star,
  Truck,
  UserRound,
  Wallet,
  X,
} from "lucide-react";

type Section = "dashboard" | "requests" | "trip" | "hospitals" | "history" | "profile" | "payment" | "earnings" | "settings" | "help";
type TripStage = "incoming" | "otp" | "enroute" | "arrived" | "payment" | "completed";
type Coordinates = { lat: number; lng: number };
type DriverProfile = { name: string; phone: string; vehicle: string; email: string; license: string; vehicleModel: string; experience: string; emergencyContact: string };
type EquipmentChecklist = { oxygen: boolean; stretcher: boolean; defibrillator: boolean };

type AiHospitalDecision = {
  selectedHospital: string;
  confidence: number;
  summary: string;
  reasons: string[];
  rankedHospitals: { name: string; reason: string }[];
};

type HospitalOption = {
  name: string;
  rating: number;
  reviews: number;
  beds: string;
  capacity: number;
  speciality: string;
  emergencyLevel: string;
  openNow: boolean;
  address: string;
  phone: string;
  erEntrance: string;
  tag: string;
  feedback: string;
  reviewHighlight: string;
  location: Coordinates;
};

const DEMO_DRIVER: Coordinates = { lat: 40.7128, lng: -74.006 };
const REQUEST_PICKUP: Coordinates = { lat: 40.7205, lng: -73.9955 };

function validCoordinates(value: Coordinates): Coordinates {
  return Number.isFinite(value.lat) && Number.isFinite(value.lng) && Math.abs(value.lat) <= 90 && Math.abs(value.lng) <= 180
    ? value
    : DEMO_DRIVER;
}
const hospitals: HospitalOption[] = [
  { name: "Central Emergency Hospital", rating: 4.8, reviews: 1240, beds: "ER available", capacity: 82, speciality: "Emergency, trauma, ICU", emergencyLevel: "Level 1 trauma", openNow: true, address: "Emergency District · Main Avenue", phone: "+1 212 410 2200", erEntrance: "Ambulance Dock A · Emergency Bay", tag: "Best overall", feedback: "Fast triage and consistently calm emergency teams", reviewHighlight: "Patients praise short intake times and clear updates", location: { lat: 40.735, lng: -73.98 } },
  { name: "Riverside Medical Center", rating: 4.6, reviews: 864, beds: "Cardiac unit", capacity: 64, speciality: "Cardiac, emergency, NICU", emergencyLevel: "Level 2 trauma", openNow: true, address: "22 Riverside Drive · Medical Quarter", phone: "+1 212 433 8800", erEntrance: "East ER Ramp · Cardiac Intake", tag: "Top rated", feedback: "Strong cardiac response and family communication", reviewHighlight: "Feedback highlights attentive nurses and clean facilities", location: { lat: 40.731, lng: -73.989 } },
  { name: "Northpoint General Hospital", rating: 4.4, reviews: 702, beds: "Trauma centre", capacity: 46, speciality: "Trauma, orthopaedics, ER", emergencyLevel: "Level 1 trauma", openNow: true, address: "8 Northpoint Road · Civic Medical Zone", phone: "+1 212 455 7711", erEntrance: "Trauma Gate 2 · Ambulance Ramp", tag: "24/7 intake", feedback: "Reliable trauma intake with specialist coverage", reviewHighlight: "Drivers report dependable handover and 24/7 reception", location: { lat: 40.699, lng: -74.012 } },
];

const navItems: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "requests", label: "Requests", icon: Bell },
  { id: "trip", label: "Active trip", icon: Navigation },
  { id: "hospitals", label: "Hospitals & routes", icon: Hospital },
  { id: "history", label: "Trip history", icon: Clock3 },
  { id: "profile", label: "Driver profile", icon: UserRound },
  { id: "earnings", label: "Earnings", icon: Wallet },
  { id: "settings", label: "Settings", icon: Settings },
];

function distanceKm(a: Coordinates, b: Coordinates) {
  const from = validCoordinates(a);
  const to = validCoordinates(b);
  const earth = 6371;
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos((from.lat * Math.PI) / 180) * Math.cos((to.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return earth * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(Math.max(0, 1 - x)));
}

function contextualLocation(location: Coordinates, position: Coordinates, fallbackOffset: [number, number]): Coordinates {
  const current = validCoordinates(position);
  const rawDistance = distanceKm(current, location);
  // Demo hospital/pickup coordinates are only trusted when they are genuinely local.
  // This prevents a live GPS position in another region from showing stale demo distances.
  return rawDistance <= 25 ? validCoordinates(location) : { lat: current.lat + fallbackOffset[0], lng: current.lng + fallbackOffset[1] };
}

function contextualHospital(hospital: HospitalOption, position: Coordinates) {
  const offsets: Record<string, [number, number]> = {
    "Central Emergency Hospital": [0.027, 0.018],
    "Riverside Medical Center": [0.031, -0.012],
    "Northpoint General Hospital": [-0.024, 0.026],
  };
  return { ...hospital, location: contextualLocation(hospital.location, position, offsets[hospital.name] ?? [0.027, 0.018]) };
}

function contextualPickup(position: Coordinates) {
  return contextualLocation(REQUEST_PICKUP, position, [0.009, 0.006]);
}

function formatDistance(distance: number) {
  return distance < 1 ? `${Math.max(50, Math.round(distance * 1000))} m` : `${distance.toFixed(1)} km`;
}

function estimateEtaMinutes(distance: number, trafficFactor = 1) {
  const urbanSpeedKmH = 28;
  return Math.max(2, Math.ceil((distance / urbanSpeedKmH) * 60 * trafficFactor + 1));
}

function hospitalRecommendation(hospital: HospitalOption, position: Coordinates) {
  const distance = distanceKm(position, contextualHospital(hospital, position).location);
  const eta = estimateEtaMinutes(distance);
  const distanceScore = Math.max(0, 30 - distance * 5);
  const ratingScore = hospital.rating * 8;
  const reviewScore = Math.min(10, Math.log10(hospital.reviews) * 3);
  const capacityScore = hospital.capacity * 0.12;
  const emergencyScore = hospital.emergencyLevel.includes("Level 1") ? 12 : 7;
  const openScore = hospital.openNow ? 10 : -30;
  const score = distanceScore + ratingScore + reviewScore + capacityScore + emergencyScore + openScore;
  return { distance, eta, score };
}

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [section, setSection] = useState<Section>("dashboard");
  const [tripStage, setTripStage] = useState<TripStage>("incoming");
  const [online, setOnline] = useState(true);
  const [readinessOpen, setReadinessOpen] = useState(true);
  const [bookingAlertOpen, setBookingAlertOpen] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const [restDue, setRestDue] = useState(false);
  const [equipmentChecklist, setEquipmentChecklist] = useState<EquipmentChecklist>({ oxygen: false, stretcher: false, defibrillator: false });
  const [otp, setOtp] = useState("");
  const [selectedHospital, setSelectedHospital] = useState(hospitals[0]);
  const [notice, setNotice] = useState("");
  const [driverPosition, setDriverPosition] = useState<Coordinates>(DEMO_DRIVER);
  const [gpsStatus, setGpsStatus] = useState("Waiting for live browser GPS");
  const [driverPlace, setDriverPlace] = useState("Driver location unavailable · GPS active");
  const [progress, setProgress] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "paid">("pending");
  const [profile, setProfile] = useState<DriverProfile>({ name: "Ravi Kumar", phone: "+91 98765 42041", vehicle: "BLS-2041", email: "ravi.kumar@savlife.example", license: "DL-0420-1188", vehicleModel: "Tata Winger · BLS ambulance", experience: "6 years", emergencyContact: "SavLife Dispatch · 112" });
  const [editingProfile, setEditingProfile] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [aiDecision, setAiDecision] = useState<AiHospitalDecision | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const notify = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  };

  const requestAiHospitalReview = async () => {
    setAiLoading(true);
    try {
      const apiHost = window.location.hostname === "localhost" ? "localhost:3000" : window.location.hostname.replace(/^8081-/, "3000-");
      const recommendationInput = {
        driverPlace,
        hospitals: hospitals.map((item) => {
          const contextual = contextualHospital(item, driverPosition);
          const distance = distanceKm(driverPosition, contextual.location);
          return {
            name: item.name,
            rating: item.rating,
            reviews: item.reviews,
            capacity: item.capacity,
            speciality: item.speciality,
            emergencyLevel: item.emergencyLevel,
            openNow: item.openNow,
            address: item.address,
            feedback: item.feedback,
            reviewHighlight: item.reviewHighlight,
            distanceKm: distance,
            etaMinutes: estimateEtaMinutes(distance),
          };
        }),
      };
      const response = await fetch(`${window.location.protocol}//${apiHost}/api/trpc/hospital.recommend?batch=1`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 0: { json: recommendationInput } }),
      });
      if (!response.ok) throw new Error(`AI recommendation request failed: ${response.status}`);
      const payload = await response.json();
      const recommendation = payload?.[0]?.result?.data?.json ?? payload?.[0]?.result?.data;
      if (!recommendation?.selectedHospital) throw new Error("AI recommendation response was incomplete");
      setAiDecision(recommendation);
      const recommended = hospitals.find((item) => item.name === recommendation.selectedHospital);
      if (recommended) setSelectedHospital(recommended);
    } catch (error) {
      console.warn("Hospital AI review unavailable", error);
      setAiDecision(null);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (!navigator.geolocation || !authenticated || !online) return;
    setGpsStatus("Requesting live browser GPS");
    const watch = navigator.geolocation.watchPosition(
      (position) => {
        setDriverPosition({ lat: position.coords.latitude, lng: position.coords.longitude });
        setGpsStatus("Live GPS connected");
      },
      () => setGpsStatus("GPS unavailable · using current-area demo route"),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 8000 },
    );
    return () => navigator.geolocation.clearWatch(watch);
  }, [authenticated, online]);

  useEffect(() => {
    if (!authenticated || !online) {
      setDriverPlace("Driver location unavailable · GPS active");
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const googleKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
      if (!googleKey) {
        setDriverPlace("Readable address pending · GPS active");
        return;
      }
      try {
        setOptions({ key: googleKey, v: "weekly", libraries: ["places"] });
        await importLibrary("maps");
        if (!window.google || cancelled) return;
        new window.google.maps.Geocoder().geocode({ location: driverPosition }, (results, status) => {
          if (cancelled) return;
          const best = results?.[0];
          if (status === "OK" && best) {
            setDriverPlace(best.formatted_address || "Readable address pending · GPS active");
          } else {
            setDriverPlace("Driver location unavailable · GPS active");
          }
        });
      } catch {
        if (!cancelled) setDriverPlace("Driver location unavailable · GPS active");
      }
    }, 450);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [authenticated, online, driverPosition.lat, driverPosition.lng]);

  useEffect(() => {
    if (tripStage !== "enroute") return;
    // Fast demo playback: the marker starts immediately after OTP and reaches
    // the selected hospital quickly, making the route-to-payment handoff visible.
    const timer = window.setInterval(() => {
      setProgress((current) => {
        const next = Math.min(current + 18, 100);
        if (next >= 100) {
          window.clearInterval(timer);
          setTripStage("payment");
          setSection("dashboard");
          notify("Hospital arrival detected. Payment session opened automatically.");
        }
        return next;
      });
    }, 450);
    return () => window.clearInterval(timer);
  }, [tripStage]);

  const nearestHospital = useMemo(() => [...hospitals].sort((a, b) => hospitalRecommendation(b, driverPosition).score - hospitalRecommendation(a, driverPosition).score)[0], [driverPosition.lat, driverPosition.lng]);
  const selectedDistance = useMemo(() => distanceKm(driverPosition, contextualHospital(selectedHospital, driverPosition).location), [driverPosition, selectedHospital]);
  const selectedEta = estimateEtaMinutes(selectedDistance);

  if (!authenticated) return <Login onLogin={() => setAuthenticated(true)} />;

  const acceptRequest = () => {
    if (!checklistComplete) {
      setReadinessOpen(true);
      notify("Complete the pre-shift safety checklist before accepting a critical request.");
      return;
    }
    setBookingAlertOpen(false);
    setSelectedHospital(nearestHospital);
    setTripStage("otp");
    setSection("dashboard");
    void requestAiHospitalReview();
    notify(`Request locked. Reviewing nearby hospitals from ${driverPlace}. Ask the passenger for the OTP.`);
  };
  const verifyOtp = () => {
    if (otp === "4826") { const destination = hospitals.find((item) => item.name === aiDecision?.selectedHospital) ?? selectedHospital ?? nearestHospital; setSelectedHospital(destination); setTripStage("enroute"); setProgress(6); setSection("dashboard"); void requestAiHospitalReview(); notify(`Passenger verified. Ambulance moving to ${destination.name}; payment will open after arrival.`); }
    else notify("Enter the demo OTP 4826.");
  };
  const completePayment = () => { setPaymentStatus("paid"); setTripStage("completed"); setRestDue(true); setSection("dashboard"); notify("₹680 payment recorded and trip closed. Take a safety rest before another emergency run."); };
  const openHelp = () => notify("Support request opened. Dispatcher callback is available.");
  const checklistComplete = Object.values(equipmentChecklist).every(Boolean);
  const toggleAvailability = () => {
    if (online) {
      setOnline(false);
      setReadinessOpen(false);
      notify("You are offline and will not receive emergency requests.");
      return;
    }
    setReadinessOpen(true);
  };
  const confirmReadiness = () => {
    if (!checklistComplete) {
      notify("Complete all three safety checks before going online.");
      return;
    }
    setOnline(true);
    setReadinessOpen(false);
    window.setTimeout(() => setBookingAlertOpen(true), 350);
    notify("Readiness verified. You are online for high-priority dispatch.");
  };

  return <div className={`app-shell ${nightMode ? "night-mode" : ""}`}>
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Ambulance size={22} /></div><div><strong>SavLife Captain</strong><span>Driver operations</span></div></div>
      <div className="online-card"><span className="status-dot" /><div><b>{online ? "You are online" : "You are offline"}</b><small>{online ? "Receiving requests" : "Go online to receive requests"}</small></div><button className={`switch ${online ? "on" : ""}`} onClick={toggleAvailability} aria-label="Toggle availability"><span /></button></div>
      <nav className="nav-list">{navItems.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-item ${section === id ? "active" : ""}`} onClick={() => setSection(id)}><Icon size={18} /><span>{label}</span>{id === "requests" && online && <em>1</em>}</button>)}</nav>
      <div className="sidebar-bottom"><button className={`nav-item ${section === "help" ? "active" : ""}`} onClick={() => setSection("help")}><CircleHelp size={18} /><span>Help & support</span></button><button className="driver-mini" onClick={() => setSection("profile")}><div className="avatar">RK</div><div><b>{profile.name}</b><small>Captain · {profile.vehicle}</small></div><Settings size={16} /></button></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="mobile-menu"><Menu size={20} /></div><div><span className="eyebrow">LIVE OPERATIONS · GPS ENABLED</span><h1>{section === "dashboard" ? `Good morning, ${profile.name.split(" ")[0]}` : section === "payment" ? "Payment" : navItems.find((item) => item.id === section)?.label}</h1></div><div className="top-actions"><span className="live-pill"><span className="status-dot" /> <b>Driver location</b> · {driverPlace}</span><button className="icon-button" onClick={() => notify(notifications ? "You have 1 new dispatch alert." : "Notifications are paused.")}><Bell size={18} /></button><button className="top-avatar" onClick={() => setSection("profile")}>RK</button></div></header>
      <div className="page-content">
        {section === "dashboard" && <UnifiedConsole online={online} stage={tripStage} otp={otp} setOtp={setOtp} position={driverPosition} driverPlace={driverPlace} hospital={selectedHospital} distance={selectedDistance} eta={selectedEta} progress={progress} gpsStatus={gpsStatus} paymentStatus={paymentStatus} aiDecision={aiDecision} aiLoading={aiLoading} onAccept={acceptRequest} onVerify={verifyOtp} onDecline={() => { setTripStage("incoming"); notify("Request returned to dispatch."); }} onArrive={() => { setProgress(100); setTripStage("payment"); notify("Arrival confirmed. Payment session opened automatically."); }} onPay={completePayment} onOpenHospitals={() => setSection("hospitals")} onHistory={() => setSection("history")} />}
        {section === "requests" && <Requests stage={tripStage} otp={otp} setOtp={setOtp} onAccept={acceptRequest} onVerify={verifyOtp} onDecline={() => { setTripStage("incoming"); setSection("dashboard"); notify("Request returned to dispatch."); }} driverPosition={driverPosition} selectedHospital={selectedHospital} />}
        {section === "trip" && <ActiveTrip stage={tripStage} hospital={selectedHospital} position={driverPosition} progress={progress} distance={selectedDistance} eta={selectedEta} gpsStatus={gpsStatus} onHospitals={() => setSection("hospitals")} onArrive={() => { setProgress(100); setTripStage("payment"); setSection("dashboard"); notify("Arrival confirmed. Payment session opened automatically."); }} />}
        {section === "hospitals" && <Hospitals selected={selectedHospital} onSelect={setSelectedHospital} position={driverPosition} onStart={() => { setTripStage("enroute"); setSection("trip"); notify(`Navigation started to ${selectedHospital.name}.`); }} />}
        {section === "history" && <History paymentStatus={paymentStatus} />}
        {section === "profile" && <Profile profile={profile} setProfile={setProfile} online={online} onToggle={() => setOnline(!online)} editing={editingProfile} setEditing={setEditingProfile} notifications={notifications} setNotifications={setNotifications} notify={notify} />}
        {section === "earnings" && <Earnings onHistory={() => setSection("history")} notify={notify} />}
        {section === "settings" && <SettingsPage online={online} notifications={notifications} setNotifications={setNotifications} onToggle={toggleAvailability} nightMode={nightMode} setNightMode={setNightMode} restDue={restDue} notify={notify} onLogout={() => setAuthenticated(false)} />}
        {section === "help" && <HelpPage notify={notify} />}
        {section === "payment" && <Payment hospital={selectedHospital} status={paymentStatus} onPay={completePayment} onBack={() => setSection("trip")} />}
      </div>
    </main>
    {readinessOpen && authenticated && <ReadinessModal checklist={equipmentChecklist} setChecklist={setEquipmentChecklist} onConfirm={confirmReadiness} onClose={() => setReadinessOpen(false)} />}
    {bookingAlertOpen && authenticated && online && tripStage === "incoming" && <BookingAlertModal onAccept={acceptRequest} onDecline={() => { setBookingAlertOpen(false); notify("Emergency request returned to dispatch."); }} /> }
    {notice && <div className="toast"><BadgeCheck size={18} />{notice}</div>}
  </div>;
}

function UnifiedConsole({
  online,
  stage,
  otp,
  setOtp,
  position,
  driverPlace,
  hospital,
  distance,
  eta,
  progress,
  gpsStatus,
  paymentStatus,
  aiDecision,
  aiLoading,
  onAccept,
  onVerify,
  onDecline,
  onArrive,
  onPay,
  onOpenHospitals,
  onHistory,
}: {
  online: boolean;
  stage: TripStage;
  otp: string;
  setOtp: (value: string) => void;
  position: Coordinates;
  driverPlace: string;
  hospital: HospitalOption;
  distance: number;
  eta: number;
  progress: number;
  gpsStatus: string;
  paymentStatus: "pending" | "paid";
  aiDecision: AiHospitalDecision | null;
  aiLoading: boolean;
  onAccept: () => void;
  onVerify: () => void;
  onDecline: () => void;
  onArrive: () => void;
  onPay: () => void;
  onOpenHospitals: () => void;
  onHistory: () => void;
}) {
  const phase = stage === "incoming" ? "NEW BOOKING" : stage === "otp" ? "OTP VERIFICATION" : stage === "enroute" ? "LIVE NAVIGATION" : stage === "payment" ? "ARRIVAL & PAYMENT" : "TRIP COMPLETE";
  const title = stage === "incoming" ? "Review the next ambulance booking" : stage === "otp" ? "Verify passenger to start routing" : stage === "enroute" ? "Live route to recommended care" : stage === "payment" ? "Arrival detected — close the trip" : "Trip closed successfully";
  return (
    <div className="unified-console">
      <section className="console-header">
        <div>
          <span className="eyebrow">ONE-PAGE DISPATCH CONSOLE · {phase}</span>
          <h2>{title}</h2>
          <p className="muted">Booking, hospital intelligence, OTP, live map, ETA, and payment remain in one workspace.</p>
        </div>
        <div className="console-status">
          <span className={`status-dot ${online ? "" : "offline"}`} />
          <b>{online ? "Available for dispatch" : "Offline"}</b>
          <small>{gpsStatus}</small>
        </div>
      </section>
      <div className="console-grid">
        <section className="panel console-map-panel">
          <div className="map-head">
            <span><MapPin size={16} /> {stage === "enroute" || stage === "payment" ? "Live route workspace" : "Booking and hospital preview"}</span>
            <span className="traffic"><span className="status-dot" /> {gpsStatus}</span>
          </div>
          <MapView position={position} hospital={hospital} progress={progress} moving={stage === "enroute"} />
          <div className="console-map-stats">
            <Data label="Driver location" value={driverPlace} />
            <Data label="Hospital distance" value={formatDistance(distance)} />
            <Data label="ETA" value={progress >= 100 ? "Arrived" : `${eta} min`} />
          </div>
        </section>
        <aside className="panel console-action-panel">
          <div className="console-stepper">
            <span className={stage !== "incoming" ? "done" : "active"}>1 <small>Booking</small></span>
            <span className={stage === "otp" ? "active" : stage === "incoming" ? "" : "done"}>2 <small>OTP</small></span>
            <span className={stage === "enroute" ? "active" : stage === "payment" || stage === "completed" ? "done" : ""}>3 <small>Route</small></span>
            <span className={stage === "payment" ? "active" : stage === "completed" ? "done" : ""}>4 <small>Payment</small></span>
          </div>
          {stage === "incoming" && <>
            <div className="console-alert"><Bell size={20} /><div><b>Individual ambulance booking</b><span>One available captain can accept this high-priority request.</span></div></div>
            <div className="console-request"><span className="eyebrow">REQUEST AC-1048 · LIVE</span><h3>Urgent chest-pain response</h3><p className="muted"><b>Patient pickup</b> · {formatDistance(distanceKm(position, contextualPickup(position)))} from the driver location.</p><div className="console-detail-grid"><Data label="Patient" value="Aarav Mehta" /><Data label="Condition" value="Chest pain · conscious" /><Data label="Patient phone" value="+91 98765 42041" /><Data label="Urgency" value="High" /><Data label="Service" value="Basic Life Support" /><Data label="Payment" value="UPI · ₹680 est." /></div></div>
            <div className="ai-decision"><Hospital size={19} /><div><b>{aiLoading ? "AI hospital review in progress" : aiDecision ? `AI review: ${aiDecision.selectedHospital}` : "AI hospital review ready"}</b><span>{aiLoading ? "Comparing nearby emergency hospitals from the driver location…" : aiDecision?.summary ?? "Ranking uses distance, ETA, emergency capability, open status, capacity, ratings, and verified feedback."}</span></div></div>
            <button className="primary-button full" onClick={onAccept}><Check size={17} /> Accept and lock request</button>
            <button className="secondary-button full" onClick={onDecline}><X size={17} /> Decline request</button>
          </>}
          {stage === "otp" && <>
            <div className="console-alert teal-alert"><BadgeCheck size={20} /><div><b>Request accepted and locked</b><span>AI recommendation: {hospital.name} · {formatDistance(distance)} · {eta} min.</span></div></div>
            {aiDecision && <div className="ai-review-detail"><span className="eyebrow">AI DECISION · {Math.round(aiDecision.confidence * 100)}% CONFIDENCE</span><b>{aiDecision.summary}</b><ul>{aiDecision.reasons.slice(0, 3).map((reason) => <li key={reason}>{reason}</li>)}</ul></div>}
            <label className="field-label">Passenger OTP</label>
            <input className="otp-field" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="4826" inputMode="numeric" />
            <span className="helper">Ask the passenger for the 4-digit code. Demo code: 4826.</span>
            <button className="primary-button full" onClick={onVerify}><Navigation size={17} /> Verify OTP and start live map</button>
          </>}
          {stage === "enroute" && <>
            <div className="ai-decision"><Route size={19} /><div><b>AI route decision active</b><span>{aiDecision?.summary ?? `${hospital.name} balances ETA, emergency intake, capacity, rating, and feedback.`}</span></div></div>
            <div className="console-destination"><Hospital size={19} /><div><b>{hospital.name}</b><span>{formatDistance(distance)} · {eta} min · {hospital.emergencyLevel}</span><small>Updates from live GPS as the ambulance moves.</small></div></div>
            <button className="secondary-button full" onClick={onOpenHospitals}><Hospital size={17} /> Compare nearby hospitals</button>
            <button className="primary-button full" onClick={onArrive}><MapPin size={17} /> Confirm hospital arrival</button>
          </>}
          {stage === "payment" && <>
            <div className="console-alert teal-alert"><Check size={20} /><div><b>Hospital arrival detected</b><span>Payment session opened automatically for {hospital.name}.</span></div></div>
            <div className="fare-total"><span>Total fare</span><strong>₹680</strong></div>
            <div className="console-detail-grid"><Data label="Base trip" value="₹520" /><Data label="Emergency service" value="₹100" /><Data label="Platform fee" value="₹60" /><Data label="Method" value="UPI" /></div>
            <button className="primary-button full" onClick={onPay} disabled={paymentStatus === "paid"}><CreditCard size={17} /> {paymentStatus === "paid" ? "Payment completed" : "Confirm payment received"}</button>
          </>}
          {stage === "completed" && <>
            <div className="console-alert teal-alert"><Check size={20} /><div><b>Trip completed</b><span>Payment recorded and the ambulance is ready for the next dispatch.</span></div></div>
            <button className="primary-button full" onClick={onHistory}><Clock3 size={17} /> View trip history</button>
          </>}
        </aside>
      </div>
    </div>
  );
}

function Dashboard({ online, position, onOpenRequest, onViewTrip, onHistory }: { online: boolean; position: Coordinates; onOpenRequest: () => void; onViewTrip: () => void; onHistory: () => void }) {
  return <><section className="hero-row"><div><p className="muted">Ready to respond in your area?</p><div className="hero-actions"><button className="primary-button" onClick={onOpenRequest}><Bell size={17} /> Review new request <ArrowRight size={16} /></button><button className="secondary-button" onClick={onViewTrip}><Navigation size={17} /> Open trip workspace</button></div></div><div className="hero-metric"><span>Today's earnings</span><strong>₹4,260</strong><small>+18% vs yesterday</small></div></section><div className="stat-grid"><Stat icon={Truck} label="Trips completed" value="6" detail="Today" /><Stat icon={Wallet} label="Collected" value="₹4,260" detail="UPI & cash" /><Stat icon={Clock3} label="Online time" value="4h 18m" detail="Since 04:24 AM" /><Stat icon={Star} label="Driver rating" value="4.9" detail="128 ratings" /></div><div className="content-grid"><section className="panel request-panel"><PanelHeading title="Incoming emergency request" action="View details" onClick={onOpenRequest} /><div className="request-highlight"><div className="priority"><span className="priority-dot" /> HIGH PRIORITY</div><span className="muted">12 sec ago</span></div><h2>Pickup near the requester</h2><p className="muted">Patient transfer · {formatDistance(distanceKm(position, contextualPickup(position)))} pickup distance · Basic Life Support</p><MapView compact position={position} hospital={hospitals[0]} /><div className="request-data"><Data label="Estimated fare" value="₹680" /><Data label="Payment" value="UPI" /><Data label="Urgency" value="High" tone="red" /></div><button className="link-button" onClick={onOpenRequest}>Review and respond <ChevronRight size={16} /></button><div className="safety-banner"><ShieldCheck size={20} /><div><b>Safety check complete</b><span>Ambulance documents and emergency kit are up to date.</span></div><Check size={18} /></div></section><section className="panel"><PanelHeading title="Today's route activity" action="View history" onClick={onHistory} /><div className="activity-list"><ActivityRow time="08:12 AM" title="Central Emergency Hospital" detail="Trip AC-2047 · Paid ₹680" /><ActivityRow time="06:48 AM" title="Riverside Medical Center" detail="Trip AC-2046 · Paid ₹540" /><ActivityRow time="Yesterday" title="Northpoint General Hospital" detail="Trip AC-2045 · Paid ₹720" /></div></section></div><div className={`availability-bar ${online ? "available" : "offline"}`}><div className="status-dot" /><div><b>{online ? "You are available for dispatch" : "You are offline"}</b><span>{online ? "Nearby ambulance requests will appear in Requests." : "Switch online to receive nearby requests."}</span></div><span className="bar-action">{online ? "1 request waiting" : "Go online"}</span></div></>;
}

function Requests({ stage, otp, setOtp, onAccept, onVerify, onDecline, driverPosition, selectedHospital }: { stage: TripStage; otp: string; setOtp: (value: string) => void; onAccept: () => void; onVerify: () => void; onDecline: () => void; driverPosition: Coordinates; selectedHospital: HospitalOption }) {
  const pickupDistance = formatDistance(distanceKm(driverPosition, contextualPickup(driverPosition)));
  return <div className="wide-grid"><section className="panel request-detail"><PanelHeading title="Request AC-1048" action="Live · Current area" /><div className="request-header"><div className="priority"><span className="priority-dot" /> HIGH PRIORITY</div><span className="tag">Chest-pain response</span></div><h2>Requester pickup location</h2><p className="muted">Live pickup point from the customer · {pickupDistance} away</p><MapView compact position={driverPosition} hospital={selectedHospital} /><div className="detail-grid"><Data label="Patient" value="Aarav Mehta" /><Data label="Condition" value="Chest pain · conscious" /><Data label="Patient phone" value="+91 98••• 2041" /><Data label="Ambulance" value="Basic Life Support" /><Data label="Allergies" value="None reported" /><Data label="Payment" value="UPI · ₹680 est." /></div><div className="note"><ShieldCheck size={18} /><span>Patient details are shown for this captain trip only. Requester reports chest pain; patient is conscious and needs emergency-department transfer.</span></div></section><section className="panel decision-panel">{stage === "incoming" ? <><div className="panel-icon red"><Bell size={22} /></div><h2>Review this request</h2><p className="muted">Accept to lock this request to your ambulance, or decline to return it to dispatch.</p><button className="primary-button full" onClick={onAccept}><Check size={17} /> Accept and lock request</button><button className="secondary-button full" onClick={onDecline}><X size={17} /> Decline request</button></> : <><div className="panel-icon teal"><BadgeCheck size={22} /></div><h2>Verify passenger OTP</h2><p className="muted">The trip cannot start until the passenger gives you the code.</p><label className="field-label">Passenger OTP</label><input className="otp-field" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="4826" inputMode="numeric" /><span className="helper">Demo code: 4826</span><button className="primary-button full" onClick={onVerify}><BadgeCheck size={17} /> Verify and start navigation</button></>}</section></div>;
}

function ActiveTrip({ stage, hospital, position, progress, distance, eta, gpsStatus, onHospitals, onArrive }: { stage: TripStage; hospital: HospitalOption; position: Coordinates; progress: number; distance: number; eta: number; gpsStatus: string; onHospitals: () => void; onArrive: () => void }) {
  return <><div className="trip-toolbar"><div><span className="eyebrow">TRIP AC-1048 · {stage === "arrived" || stage === "payment" ? "ARRIVED" : "EN ROUTE"}</span><h2>Taking Aarav to emergency care</h2></div><div className="trip-toolbar-actions"><button className="secondary-button" onClick={() => window.open("tel:+919876542041")}><Phone size={16} /> Dispatcher</button><button className="danger-button" onClick={() => alert("Emergency assistance requested for this demo trip.")}><Activity size={16} /> Emergency</button></div></div><div className="trip-layout"><section className="panel map-panel"><div className="map-head"><span><MapPin size={16} /> Live OpenStreetMap route</span><span className="traffic"><span className="status-dot" /> {gpsStatus}</span></div><MapView position={position} hospital={hospital} progress={progress} moving={stage === "enroute"} /><div className="progress-track"><span style={{ width: `${progress}%` }} /></div><div className="map-footer"><div><span className="muted">ARRIVAL ETA</span><strong>{progress >= 100 ? "Arrived" : `${eta} min est.`}</strong><small>Live GPS estimate</small></div><div><span className="muted">LIVE DISTANCE</span><strong>{formatDistance(distance)}</strong></div><div><span className="muted">DESTINATION</span><strong>{hospital.name}</strong></div></div></section><aside className="panel trip-side"><div className="side-section"><span className="eyebrow">AUTOMATIC TRIP DETECTION</span><h3>{progress >= 100 ? "Hospital arrival detected" : "Navigation in progress"}</h3><p className="muted">{progress >= 100 ? "The payment session opens automatically after arrival." : "GPS progress updates the route and nearby hospital distance."}</p></div><div className="selected-hospital"><Hospital size={20} /><div><b>{hospital.name}</b><span>{hospital.rating} ★ · {formatDistance(distance)} · {hospital.beds}</span><small>Live GPS estimate · updates as the ambulance moves</small></div></div>{progress < 100 ? <><button className="primary-button full" onClick={onHospitals}><Route size={17} /> Compare nearby hospitals</button><button className="secondary-button full" onClick={onArrive}><MapPin size={17} /> Simulate GPS arrival</button></> : <button className="primary-button full" onClick={onArrive}><CreditCard size={17} /> Open payment session</button>}</aside></div></>;
}

function Hospitals({ selected, onSelect, position, onStart }: { selected: HospitalOption; onSelect: (hospital: HospitalOption) => void; position: Coordinates; onStart: () => void }) {
  const rankedHospitals = [...hospitals].sort((a, b) => hospitalRecommendation(b, position).score - hospitalRecommendation(a, position).score);
  const selectedMetrics = hospitalRecommendation(selected, position);
  return <><div className="page-heading"><div><span className="eyebrow">LIVE ROUTE PLANNER</span><h2>Nearest suitable hospitals</h2><p className="muted">Recommendations recalculate from the driver’s current GPS position. Distance uses the live coordinate pair; ETA is a traffic-aware urban estimate and refreshes with GPS updates.</p></div><button className="primary-button" onClick={onStart}><Navigation size={17} /> Start navigation to selected</button></div><div className="hospital-layout"><section className="panel hospital-list"><PanelHeading title="Ranked recommendations" action={`${rankedHospitals.length} hospitals`} />{rankedHospitals.map((hospital, index) => { const metrics = hospitalRecommendation(hospital, position); return <button key={hospital.name} className={`hospital-row ${selected.name === hospital.name ? "selected" : ""}`} onClick={() => onSelect(hospital)}><div className="rank-badge">{index + 1}</div><div className="hospital-icon"><Hospital size={20} /></div><div className="hospital-main"><div className="hospital-name"><b>{hospital.name}</b><span className="tag">{index === 0 ? "Recommended" : hospital.tag}</span></div><span className="muted">{hospital.speciality} · {hospital.capacity}% emergency capacity</span><div className="hospital-meta"><span className="rating"><Star size={14} fill="currentColor" /> {hospital.rating} ({hospital.reviews.toLocaleString()})</span><span>{formatDistance(metrics.distance)}</span><strong>{metrics.eta} min est.</strong></div></div><ChevronRight size={18} /></button>; })}</section><section className="panel route-panel"><PanelHeading title="Hospital details & route" action={selected.openNow ? "Open now" : "Closed"} /><MapView position={position} hospital={selected} /><div className="hospital-detail-head"><div className="hospital-icon large"><Hospital size={24} /></div><div><h3>{selected.name}</h3><span className="muted">{selected.address}</span></div></div><div className="hospital-detail-grid"><Data label="Distance" value={formatDistance(selectedMetrics.distance)} /><Data label="ETA" value={`${selectedMetrics.eta} min est.`} /><Data label="Rating" value={`${selected.rating} / 5`} /><Data label="Capacity" value={`${selected.capacity}%`} /></div><div className="route-confidence"><Route size={16} /><div><b>Route intelligence</b><span>Calculated from live GPS coordinates using a 28 km/h urban driving model. The estimate refreshes whenever the driver position changes.</span></div></div><div className="hospital-detail-copy"><b>{selected.emergencyLevel} · {selected.speciality}</b><span>{selected.beds}. Emergency intake is currently {selected.openNow ? "open" : "unavailable"}.</span><span>{selected.phone}</span><span><b>Ambulance entrance:</b> {selected.erEntrance}</span></div><div className="route-option selected"><div><b>Recommended route</b><span>Fastest available corridor from live driver location</span></div><strong>{selectedMetrics.eta} min est.</strong></div><div className="route-option"><div><b>Alternative route</b><span>Ring Road fallback · longer distance</span></div><strong>{estimateEtaMinutes(selectedMetrics.distance, 1.18)} min est.</strong></div><button className="primary-button full" onClick={onStart}><Navigation size={17} /> Navigate to {selected.name}</button></section></div></>;
}

function Payment({ hospital, status, onPay, onBack }: { hospital: HospitalOption; status: "pending" | "paid"; onPay: () => void; onBack: () => void }) { return <div className="payment-layout"><section className="panel payment-card"><div className="panel-icon teal"><CreditCard size={22} /></div><span className="eyebrow">TRIP AC-1048 · AUTOMATIC PAYMENT SESSION</span><h2>{status === "paid" ? "Payment completed" : "Collect trip payment"}</h2><p className="muted">Arrival at {hospital.name} was detected. Review the fare and close the trip.</p><div className="fare-total"><span>Total fare</span><strong>₹680</strong></div><div className="fare-lines"><Data label="Base trip" value="₹520" /><Data label="Emergency service" value="₹100" /><Data label="Platform fee" value="₹60" /><Data label="Method" value="UPI" /></div>{status === "pending" ? <button className="primary-button full" onClick={onPay}><Check size={17} /> Confirm payment received</button> : <div className="paid-banner"><Check size={18} /> Payment marked paid and trip closed.</div>}<button className="secondary-button full" onClick={onBack}>Back to active trip</button></section></div>; }

function History({ paymentStatus }: { paymentStatus: "pending" | "paid" }) { return <div className="panel"><PanelHeading title="Trip history" action="August 2026" /><table><thead><tr><th>Trip</th><th>Destination</th><th>Time</th><th>Payment</th><th>Status</th></tr></thead><tbody>{[{ id: "AC-1048", name: "Central Emergency Hospital", time: "Now", fare: "₹680", status: paymentStatus === "paid" ? "Paid" : "Payment pending" }, { id: "AC-1047", name: "Central Emergency Hospital", time: "08:12 AM", fare: "₹680", status: "Paid" }, { id: "AC-1046", name: "Riverside Medical Center", time: "06:48 AM", fare: "₹540", status: "Paid" }].map((trip) => <tr key={trip.id}><td><b>{trip.id}</b></td><td>{trip.name}</td><td>{trip.time}</td><td>{trip.fare} · UPI</td><td><span className={trip.status === "Paid" ? "paid" : "pending-pill"}>{trip.status === "Paid" && <Check size={13} />} {trip.status}</span></td></tr>)}</tbody></table></div>; }

function Profile({ profile, setProfile, online, onToggle, editing, setEditing, notifications, setNotifications, notify }: { profile: DriverProfile; setProfile: (value: DriverProfile) => void; online: boolean; onToggle: () => void; editing: boolean; setEditing: (value: boolean) => void; notifications: boolean; setNotifications: (value: boolean) => void; notify: (message: string) => void }) { const [draft, setDraft] = useState(profile); return <div className="profile-grid"><section className="panel profile-card"><div className="profile-avatar">RK</div>{editing ? <><label className="field-label">Driver name</label><input className="text-field" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /><label className="field-label">Phone</label><input className="text-field" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} /><label className="field-label">Email</label><input className="text-field" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /><label className="field-label">Vehicle ID</label><input className="text-field" value={draft.vehicle} onChange={(e) => setDraft({ ...draft, vehicle: e.target.value })} /><label className="field-label">Vehicle model</label><input className="text-field" value={draft.vehicleModel} onChange={(e) => setDraft({ ...draft, vehicleModel: e.target.value })} /><label className="field-label">Driving license</label><input className="text-field" value={draft.license} onChange={(e) => setDraft({ ...draft, license: e.target.value })} /><label className="field-label">Emergency contact</label><input className="text-field" value={draft.emergencyContact} onChange={(e) => setDraft({ ...draft, emergencyContact: e.target.value })} /><button className="primary-button full" onClick={() => { setProfile(draft); setEditing(false); notify("Driver profile saved."); }}><Check size={16} /> Save profile</button></> : <><h2>{profile.name}</h2><p className="muted">SavLife Captain · Emergency response</p><div className="profile-rating"><Star size={18} fill="currentColor" /> 4.9 <span>128 ratings</span></div><div className="profile-detail-grid"><Data label="Phone" value={profile.phone} /><Data label="Email" value={profile.email} /><Data label="Vehicle" value={profile.vehicleModel} /><Data label="Vehicle ID" value={profile.vehicle} /><Data label="License" value={profile.license} /><Data label="Experience" value={profile.experience} /><Data label="Emergency contact" value={profile.emergencyContact} /><Data label="Status" value={online ? "Online" : "Offline"} /></div><button className="secondary-button full" onClick={() => { setDraft(profile); setEditing(true); }}><Settings size={16} /> Edit profile</button></>}</section><section className="panel settings-card"><PanelHeading title="Driver settings" action="Saved" /><SettingRow icon={Activity} title="Availability" detail={online ? "Online and receiving requests" : "Offline"} action={<button className={`switch ${online ? "on" : ""}`} onClick={onToggle}><span /></button>} /><SettingRow icon={ShieldCheck} title="Documents & verification" detail="License, vehicle permit, and insurance current" action={<BadgeCheck size={18} color="#0F766E" />} /><SettingRow icon={Wallet} title="Payout account" detail="HDFC Bank · ending 2041" action={<button className="icon-button" onClick={() => notify("Payout account settings opened.")}><ChevronRight size={18} /></button>} /><SettingRow icon={Bell} title="Notifications" detail={notifications ? "Request alerts enabled" : "Request alerts paused"} action={<button className={`switch ${notifications ? "on" : ""}`} onClick={() => setNotifications(!notifications)}><span /></button>} /></section></div>; }

function MapView({ compact = false, position, hospital, progress = 0, moving = false }: { compact?: boolean; position: Coordinates; hospital: HospitalOption; progress?: number; moving?: boolean }) {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const driverMarkerRef = useRef<google.maps.Marker | null>(null);
  const hospitalMarkerRef = useRef<google.maps.Marker | null>(null);
  const directionsRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const [mapState, setMapState] = useState<"loading" | "ready" | "fallback">("loading");
  const googleKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  const effectiveHospital = contextualHospital(hospital, position);

  useEffect(() => {
    if (!mapElement.current || !googleKey) {
      setMapState("fallback");
      return;
    }
    let disposed = false;
    const googleWindow = window as Window & { gm_authFailure?: () => void };
    const previousAuthFailure = googleWindow.gm_authFailure;
    googleWindow.gm_authFailure = () => {
      setMapState("fallback");
      previousAuthFailure?.();
    };
    setMapState("loading");
    let fallbackTimer: number | undefined;
    try {
      setOptions({ key: googleKey, v: "weekly", libraries: ["places"] });
    } catch {
      setMapState("fallback");
      return;
    }
    Promise.all([importLibrary("maps"), importLibrary("routes"), importLibrary("places")]).then(() => {
      if (disposed || !mapElement.current) return;
      const googleApi = window.google;
      if (!googleApi) {
        setMapState("fallback");
        return;
      }
      const driver = { lat: position.lat, lng: position.lng };
      const destination = { lat: effectiveHospital.location.lat, lng: effectiveHospital.location.lng };
      const routeProgress = moving ? Math.min(1, Math.max(0, progress / 100)) : 0;
      const displayDriver = { lat: driver.lat + (destination.lat - driver.lat) * routeProgress, lng: driver.lng + (destination.lng - driver.lng) * routeProgress };
      const map = new googleApi.maps.Map(mapElement.current, { center: driver, zoom: 13, mapTypeControl: false, streetViewControl: false, fullscreenControl: true, gestureHandling: "greedy" });
      mapRef.current = map;
      driverMarkerRef.current = new googleApi.maps.Marker({ map, position: displayDriver, title: moving ? "Ambulance moving to hospital" : "Live ambulance position", label: "🚑" });
      hospitalMarkerRef.current = new googleApi.maps.Marker({ map, position: destination, title: effectiveHospital.name, label: "H" });
      directionsRef.current = new googleApi.maps.DirectionsRenderer({ map, suppressMarkers: true, polylineOptions: { strokeColor: "#0F766E", strokeWeight: 6, strokeOpacity: 0.9 } });
      new googleApi.maps.DirectionsService().route({ origin: driver, destination, travelMode: googleApi.maps.TravelMode.DRIVING, provideRouteAlternatives: true }, (result, status) => {
        if (status === "OK" && result && directionsRef.current) directionsRef.current.setDirections(result);
      });
      const bounds = new googleApi.maps.LatLngBounds();
      bounds.extend(driver);
      bounds.extend(destination);
      map.fitBounds(bounds, 48);
      // Keep the resilient route surface visible while Google Maps is unable to render WebGL.
      // The Google map still initializes for environments that support it, but the bounded
      // OpenStreetMap surface is the reliable visible layer for this desktop preview.
      setMapState("fallback");
    }).catch(() => setMapState("fallback"));
    return () => {
      disposed = true;
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      driverMarkerRef.current?.setMap(null);
      hospitalMarkerRef.current?.setMap(null);
      directionsRef.current?.setMap(null);
      mapRef.current = null;
      if (googleWindow.gm_authFailure) googleWindow.gm_authFailure = previousAuthFailure;
    };
  }, [googleKey, position.lat, position.lng, hospital.name, hospital.location.lat, hospital.location.lng, progress, moving]);

  const minLat = Math.min(position.lat, effectiveHospital.location.lat) - 0.015;
  const maxLat = Math.max(position.lat, effectiveHospital.location.lat) + 0.015;
  const minLng = Math.min(position.lng, effectiveHospital.location.lng) - 0.015;
  const maxLng = Math.max(position.lng, effectiveHospital.location.lng) + 0.015;
  const fallbackMapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(`${minLng},${minLat},${maxLng},${maxLat}`)}&layer=mapnik&marker=${position.lat},${position.lng}`;

  return <div className={`leaflet-map google-map map-${mapState} ${compact ? "compact" : ""}`}>
    <div className="google-map-canvas" ref={mapElement} />
    {mapState !== "ready" && <div className="map-fallback live-map-fallback">
      <iframe className="fallback-map-iframe" title="Live route map" src={fallbackMapUrl} loading="lazy" />
      <div className="fallback-road road-one" /><div className="fallback-road road-two" /><div className="fallback-route" />
      <div className={`fallback-marker driver-marker ${moving ? "ambulance-moving" : ""}`} style={{ left: `${17 + (moving ? Math.min(100, Math.max(0, progress)) : 0) * 0.51}%`, top: `${28 + (moving ? Math.min(100, Math.max(0, progress)) : 0) * 0.5}%` }}><Ambulance size={18} /><span>{moving ? "Ambulance moving" : "Live ambulance"}</span></div>
      <div className="fallback-marker hospital-marker"><Hospital size={18} /><span>{effectiveHospital.name}</span></div>
      <div className="fallback-map-card"><b>{mapState === "loading" ? "Loading live map" : "Live route preview"}</b><span>{mapState === "loading" ? "Connecting to Google Maps…" : "GPS route remains visible while the map service reconnects."}</span></div>
    </div>}
  </div>;
}
function Stat({ icon: Icon, label, value, detail }: { icon: typeof Truck; label: string; value: string; detail: string }) { return <div className="stat-card"><div className="stat-icon"><Icon size={18} /></div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>; }
function BookingAlertModal({ onAccept, onDecline }: { onAccept: () => void; onDecline: () => void }) {
  return <div className="modal-backdrop"><section className="booking-alert-modal" role="alertdialog" aria-modal="true" aria-labelledby="booking-alert-title"><div className="alert-pulse"><Bell size={22} /></div><span className="eyebrow">NEW EMERGENCY REQUEST · NOW</span><h2 id="booking-alert-title">Urgent chest-pain response</h2><p className="muted">A nearby patient needs immediate ambulance assistance. Verify the passenger by OTP before the live hospital route starts.</p><div className="alert-detail-grid"><Data label="Patient" value="Aarav Mehta · conscious" /><Data label="Pickup" value="2.1 km away" /><Data label="Priority" value="High · cardiac" tone="red" /></div><div className="modal-actions"><button className="secondary-button" onClick={onDecline}>Decline request</button><button className="primary-button" onClick={onAccept}>Accept & verify OTP <ArrowRight size={17} /></button></div></section></div>;
}

function ReadinessModal({ checklist, setChecklist, onConfirm, onClose }: { checklist: EquipmentChecklist; setChecklist: React.Dispatch<React.SetStateAction<EquipmentChecklist>>; onConfirm: () => void; onClose: () => void }) {
  const items: { key: keyof EquipmentChecklist; title: string; detail: string }[] = [
    { key: "oxygen", title: "Oxygen level above 80%", detail: "Cylinder pressure verified for critical calls" },
    { key: "stretcher", title: "Stretcher sanitized", detail: "Wheels, straps, and locking rails inspected" },
    { key: "defibrillator", title: "Defibrillator charged", detail: "Battery and pads ready for emergency use" },
  ];
  return <div className="modal-backdrop"><section className="readiness-modal" role="dialog" aria-modal="true" aria-labelledby="readiness-title"><div className="panel-icon teal"><ShieldCheck size={22} /></div><span className="eyebrow">PRE-SHIFT SAFETY CHECK</span><h2 id="readiness-title">Verify the ambulance before going online</h2><p className="muted">Complete the three checks so high-severity patients are matched only with a ready vehicle.</p><div className="readiness-list">{items.map((item) => <label className={`readiness-item ${checklist[item.key] ? "checked" : ""}`} key={item.key}><input type="checkbox" checked={checklist[item.key]} onChange={(event) => setChecklist((current) => ({ ...current, [item.key]: event.target.checked }))} /><span><b>{item.title}</b><small>{item.detail}</small></span><Check size={18} /></label>)}</div><div className="modal-actions"><button className="secondary-button" onClick={onClose}>Stay offline</button><button className="primary-button" onClick={onConfirm}>Verify & go online <ArrowRight size={17} /></button></div></section></div>;
}

function Data({ label, value, tone }: { label: string; value: string; tone?: "red" }) { return <div><span className="data-label">{label}</span><strong className={tone === "red" ? "red-text" : ""}>{value}</strong></div>; }
function PanelHeading({ title, action, onClick }: { title: string; action?: string; onClick?: () => void }) { return <div className="panel-heading"><h3>{title}</h3>{action && <button className="text-button" onClick={onClick}>{action} <ChevronRight size={15} /></button>}</div>; }
function ActivityRow({ time, title, detail }: { time: string; title: string; detail: string }) { return <div className="activity-row"><span className="activity-time">{time}</span><div className="activity-icon"><Hospital size={16} /></div><div><b>{title}</b><span>{detail}</span></div><ChevronRight size={16} /></div>; }
function SettingRow({ icon: Icon, title, detail, action }: { icon: typeof Activity; title: string; detail: string; action: React.ReactNode }) { return <div className="setting-row"><div className="setting-icon"><Icon size={17} /></div><div><b>{title}</b><span>{detail}</span></div><div className="setting-action">{action}</div></div>; }
export default App;


function Login({ onLogin }: { onLogin: () => void }) {
  const [phone, setPhone] = useState("+91 98765 42041");
  const [password, setPassword] = useState("captain123");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = () => {
    if (!phone.trim() || password.length < 6) {
      setError("Enter a valid registered phone number and password.");
      return;
    }
    setBusy(true);
    setError("");
    window.setTimeout(() => {
      setBusy(false);
      onLogin();
    }, 550);
  };

  return <div className="login-shell"><div className="login-visual"><div className="login-brand"><div className="brand-mark" aria-label="SavLife Captain ambulance logo"><Ambulance size={28} strokeWidth={2.4} /></div><div><strong>SavLife Captain</strong><span>Emergency response operations</span></div></div><div className="login-visual-copy"><span className="eyebrow">SAVLIFE CAPTAIN · DRIVER PORTAL</span><h1>Every request. Every route. Care at the right hospital.</h1><p>Accept ambulance requests, verify passengers, and navigate to the right hospital from one focused operations workspace.</p><div className="login-proof login-trust-row"><div><ShieldCheck size={17} /><span>Verified driver access</span></div><div><Navigation size={17} /><span>Live trip guidance</span></div><div><Hospital size={17} /><span>Hospital-aware routing</span></div></div></div><div className="login-emergency"><ShieldCheck size={18} /><span>Secure driver access · Built for emergency response</span></div></div><div className="login-card"><div className="login-card-head"><div className="login-icon" aria-label="SavLife Captain ambulance logo"><Ambulance size={30} strokeWidth={2.4} /></div><span className="eyebrow">WELCOME BACK</span><h2>Sign in to Captain</h2><p className="muted">Use your registered driver details to continue.</p></div><label className="field-label">Phone number</label><input className="text-field" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+91 98765 42041" autoComplete="tel" /><label className="field-label">Password</label><input className="text-field" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter password" autoComplete="current-password" /><div className="login-row"><label className="remember"><input type="checkbox" defaultChecked /> Keep me signed in</label><button className="text-link" onClick={() => setError("Password reset is available through dispatcher support.")}>Forgot password?</button></div>{error && <div className="login-error"><X size={15} /> {error}</div>}<button className="primary-button full login-submit" onClick={submit} disabled={busy}>{busy ? "Signing you in…" : <><ArrowRight size={17} /> Sign in</>}</button><p className="login-footnote">Demo access: any valid phone and a 6+ character password.</p></div></div>;
}

function Earnings({ onHistory, notify }: { onHistory: () => void; notify: (message: string) => void }) {
  return <div className="earnings-page"><div className="page-heading"><div><span className="eyebrow">CAPTAIN FINANCE</span><h2>Earnings</h2><p className="muted">Track today’s ambulance trips, payouts, and weekly performance.</p></div><button className="secondary-button" onClick={onHistory}><Clock3 size={17} /> View trip history</button></div><div className="stat-grid"><Stat icon={Wallet} label="Today’s earnings" value="₹4,260" detail="6 completed trips" /><Stat icon={CreditCard} label="Pending payout" value="₹1,180" detail="Settles tomorrow" /><Stat icon={Route} label="Weekly trips" value="32" detail="+12% vs last week" /><Stat icon={Star} label="Rating" value="4.9" detail="128 ratings" /></div><div className="content-grid"><section className="panel"><PanelHeading title="Payout summary" action="Download" onClick={() => notify("Payout summary download prepared.")} /><div className="earnings-bars"><div style={{ height: "54%" }}><span>Mon</span></div><div style={{ height: "72%" }}><span>Tue</span></div><div style={{ height: "48%" }}><span>Wed</span></div><div style={{ height: "86%" }}><span>Thu</span></div><div style={{ height: "64%" }}><span>Fri</span></div><div style={{ height: "96%" }}><span>Sat</span></div><div style={{ height: "78%" }}><span>Sun</span></div></div></section><section className="panel"><PanelHeading title="Latest payout" action="Manage account" onClick={() => notify("Payout account settings opened.")} /><div className="payout-card"><div className="payout-icon"><CreditCard size={20} /></div><div><b>HDFC Bank ·•• 2041</b><span>Next settlement · 19 Aug 2026</span></div><strong>₹8,940</strong></div><div className="safety-banner"><ShieldCheck size={18} /><div><b>Account verified</b><span>Your payout details are ready for settlement.</span></div><Check size={17} /></div></section></div></div>;
}

function SettingsPage({ online, notifications, setNotifications, onToggle, nightMode, setNightMode, restDue, onLogout, notify }: { online: boolean; notifications: boolean; setNotifications: (value: boolean) => void; onToggle: () => void; nightMode: boolean; setNightMode: (value: boolean) => void; restDue: boolean; onLogout: () => void; notify: (message: string) => void }) {
  return <div className="settings-page"><div className="page-heading"><div><span className="eyebrow">ACCOUNT CONTROLS</span><h2>Settings</h2><p className="muted">Manage how Captain receives dispatch requests and trip updates.</p></div></div><section className="panel settings-card"><SettingRow icon={Activity} title="Availability" detail={online ? "Online and receiving requests" : "Offline and not receiving requests"} action={<button className={`switch ${online ? "on" : ""}`} onClick={onToggle}><span /></button>} /><SettingRow icon={Bell} title="Request notifications" detail={notifications ? "Sound and browser alerts enabled" : "Alerts paused"} action={<button className={`switch ${notifications ? "on" : ""}`} onClick={() => setNotifications(!notifications)}><span /></button>} /><SettingRow icon={Navigation} title="Automatic trip detection" detail="Use GPS progress to detect hospital arrival" action={<button className="icon-button" onClick={() => notify("Automatic trip detection is enabled.")}><BadgeCheck size={18} color="#0F766E" /></button>} /><SettingRow icon={ShieldCheck} title="Safety and documents" detail="All ambulance documents are current" action={<button className="icon-button" onClick={() => notify("Documents are current.")}><ChevronRight size={18} /></button>} /><SettingRow icon={Clock3} title="Mandatory safety rest" detail={restDue ? "Rest recommended after consecutive emergency runs" : "Rest prompt activates after completed emergency runs"} action={<button className="icon-button" onClick={() => notify(restDue ? "Please take a safety rest before accepting another emergency." : "Rest tracking is active.")}><Clock3 size={18} color={restDue ? "#B42318" : "#0F766E"} /></button>} /><SettingRow icon={MapPin} title="Night-driving visibility" detail={nightMode ? "High-contrast night mode enabled" : "Standard daylight interface"} action={<button className={`switch ${nightMode ? "on" : ""}`} onClick={() => setNightMode(!nightMode)}><span /></button>} /></section><section className="panel danger-zone"><div><h3>Sign out of Captain</h3><p className="muted">You will stop receiving requests on this browser until you sign in again.</p></div><button className="danger-button" onClick={onLogout}>Sign out</button></section></div>;
}

function HelpPage({ notify }: { notify: (message: string) => void }) {
  return <div className="help-page"><div className="page-heading"><div><span className="eyebrow">CAPTAIN SUPPORT</span><h2>Help & support</h2><p className="muted">Get quick guidance while you are online or on a trip.</p></div></div><div className="help-grid"><button className="panel help-card" onClick={() => notify("Dispatcher callback requested.")}><Phone size={22} /><div><h3>Call dispatcher</h3><p className="muted">Get help with an active request or route.</p></div><ChevronRight size={18} /></button><button className="panel help-card" onClick={() => notify("Emergency support has been alerted for this demo.")}><Activity size={22} /><div><h3>Emergency support</h3><p className="muted">Alert the operations team during a critical trip.</p></div><ChevronRight size={18} /></button><button className="panel help-card" onClick={() => notify("Safety guide opened.")}><ShieldCheck size={22} /><div><h3>Safety guide</h3><p className="muted">Review patient transfer and ambulance safety steps.</p></div><ChevronRight size={18} /></button></div></div>;
}
