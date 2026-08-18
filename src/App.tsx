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
  tag: string;
  location: Coordinates;
};

const DELHI_DRIVER: Coordinates = { lat: 28.6139, lng: 77.209 };
const DELHI_PICKUP: Coordinates = { lat: 28.6315, lng: 77.2167 };
const hospitals: HospitalOption[] = [
  { name: "CityCare Emergency Centre", rating: 4.8, reviews: 1240, beds: "ER available", capacity: 82, speciality: "Emergency, trauma, ICU", emergencyLevel: "Level 1 trauma", openNow: true, address: "14 Barakhamba Road, Connaught Place, New Delhi", phone: "+91 11 4100 2200", tag: "Best overall", location: { lat: 28.628, lng: 77.218 } },
  { name: "St. Mary's Multispeciality", rating: 4.6, reviews: 864, beds: "Cardiac unit", capacity: 64, speciality: "Cardiac, emergency, NICU", emergencyLevel: "Level 2 trauma", openNow: true, address: "22 Pusa Road, Central Delhi", phone: "+91 11 4333 8800", tag: "Top rated", location: { lat: 28.642, lng: 77.221 } },
  { name: "Northside General Hospital", rating: 4.4, reviews: 702, beds: "Trauma centre", capacity: 46, speciality: "Trauma, orthopaedics, ER", emergencyLevel: "Level 1 trauma", openNow: true, address: "8 Ring Road, Civil Lines, New Delhi", phone: "+91 11 4555 7711", tag: "24/7 intake", location: { lat: 28.595, lng: 77.205 } },
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
  const earth = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return earth * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function hospitalRecommendation(hospital: HospitalOption, position: Coordinates) {
  const distance = distanceKm(position, hospital.location);
  const eta = Math.max(3, Math.round(distance * 4.2));
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
  const [otp, setOtp] = useState("");
  const [selectedHospital, setSelectedHospital] = useState(hospitals[0]);
  const [notice, setNotice] = useState("");
  const [driverPosition, setDriverPosition] = useState<Coordinates>(DELHI_DRIVER);
  const [gpsStatus, setGpsStatus] = useState("Delhi fallback location");
  const [progress, setProgress] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "paid">("pending");
  const [profile, setProfile] = useState({ name: "Ravi Kumar", phone: "+91 98765 42041", vehicle: "BLS-2041" });
  const [editingProfile, setEditingProfile] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const notify = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  };

  useEffect(() => {
    if (!navigator.geolocation || tripStage !== "enroute") return;
    setGpsStatus("Requesting live browser GPS");
    const watch = navigator.geolocation.watchPosition(
      (position) => {
        setDriverPosition({ lat: position.coords.latitude, lng: position.coords.longitude });
        setGpsStatus("Live GPS connected");
      },
      () => setGpsStatus("GPS unavailable · using Delhi demo route"),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 8000 },
    );
    return () => navigator.geolocation.clearWatch(watch);
  }, [tripStage]);

  useEffect(() => {
    if (tripStage !== "enroute") return;
    const timer = window.setInterval(() => {
      setProgress((current) => {
        const next = Math.min(current + 12, 100);
        if (next >= 100) {
          window.clearInterval(timer);
          setTripStage("payment");
          setSection("payment");
          notify("Hospital arrival detected. Payment session opened automatically.");
        }
        return next;
      });
    }, 1800);
    return () => window.clearInterval(timer);
  }, [tripStage]);

  const selectedDistance = useMemo(() => distanceKm(driverPosition, selectedHospital.location), [driverPosition, selectedHospital]);
  const selectedEta = Math.max(3, Math.round(selectedDistance * 4.2));

  if (!authenticated) return <Login onLogin={() => setAuthenticated(true)} />;

  const acceptRequest = () => { setTripStage("otp"); setSection("requests"); notify("Request locked to you. Ask the passenger for the OTP."); };
  const verifyOtp = () => {
    if (otp === "4826") { setTripStage("enroute"); setProgress(0); setSection("trip"); notify("Passenger verified. Navigation started automatically."); }
    else notify("Enter the demo OTP 4826.");
  };
  const completePayment = () => { setPaymentStatus("paid"); setTripStage("completed"); setSection("history"); notify("₹680 payment recorded and trip closed."); };
  const openHelp = () => notify("Support request opened. Dispatcher callback is available.");

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Ambulance size={22} /></div><div><strong>SavLife Captain</strong><span>Driver operations</span></div></div>
      <div className="online-card"><span className="status-dot" /><div><b>{online ? "You are online" : "You are offline"}</b><small>{online ? "Receiving requests" : "Go online to receive requests"}</small></div><button className={`switch ${online ? "on" : ""}`} onClick={() => setOnline(!online)} aria-label="Toggle availability"><span /></button></div>
      <nav className="nav-list">{navItems.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-item ${section === id ? "active" : ""}`} onClick={() => setSection(id)}><Icon size={18} /><span>{label}</span>{id === "requests" && online && <em>1</em>}</button>)}</nav>
      <div className="sidebar-bottom"><button className={`nav-item ${section === "help" ? "active" : ""}`} onClick={() => setSection("help")}><CircleHelp size={18} /><span>Help & support</span></button><button className="driver-mini" onClick={() => setSection("profile")}><div className="avatar">RK</div><div><b>{profile.name}</b><small>Captain · {profile.vehicle}</small></div><Settings size={16} /></button></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="mobile-menu"><Menu size={20} /></div><div><span className="eyebrow">DELHI · LIVE OPERATIONS</span><h1>{section === "dashboard" ? `Good morning, ${profile.name.split(" ")[0]}` : section === "payment" ? "Payment" : navItems.find((item) => item.id === section)?.label}</h1></div><div className="top-actions"><span className="live-pill"><span className="status-dot" /> {gpsStatus}</span><button className="icon-button" onClick={() => notify(notifications ? "You have 1 new dispatch alert." : "Notifications are paused.")}><Bell size={18} /></button><button className="top-avatar" onClick={() => setSection("profile")}>RK</button></div></header>
      <div className="page-content">
        {section === "dashboard" && <Dashboard online={online} onOpenRequest={() => setSection("requests")} onViewTrip={() => setSection(tripStage === "incoming" ? "requests" : "trip")} onHistory={() => setSection("history")} />}
        {section === "requests" && <Requests stage={tripStage} otp={otp} setOtp={setOtp} onAccept={acceptRequest} onVerify={verifyOtp} onDecline={() => { setTripStage("incoming"); setSection("dashboard"); notify("Request returned to dispatch."); }} driverPosition={driverPosition} selectedHospital={selectedHospital} />}
        {section === "trip" && <ActiveTrip stage={tripStage} hospital={selectedHospital} position={driverPosition} progress={progress} distance={selectedDistance} eta={selectedEta} gpsStatus={gpsStatus} onHospitals={() => setSection("hospitals")} onArrive={() => { setProgress(100); setTripStage("payment"); setSection("payment"); notify("Arrival confirmed. Payment session opened automatically."); }} />}
        {section === "hospitals" && <Hospitals selected={selectedHospital} onSelect={setSelectedHospital} position={driverPosition} onStart={() => { setTripStage("enroute"); setSection("trip"); notify(`Navigation started to ${selectedHospital.name}.`); }} />}
        {section === "history" && <History paymentStatus={paymentStatus} />}
        {section === "profile" && <Profile profile={profile} setProfile={setProfile} online={online} onToggle={() => setOnline(!online)} editing={editingProfile} setEditing={setEditingProfile} notifications={notifications} setNotifications={setNotifications} notify={notify} />}
        {section === "earnings" && <Earnings onHistory={() => setSection("history")} notify={notify} />}
        {section === "settings" && <SettingsPage online={online} notifications={notifications} setNotifications={setNotifications} onToggle={() => setOnline(!online)} onLogout={() => setAuthenticated(false)} notify={notify} />}
        {section === "help" && <HelpPage notify={notify} />}
        {section === "payment" && <Payment hospital={selectedHospital} status={paymentStatus} onPay={completePayment} onBack={() => setSection("trip")} />}
      </div>
    </main>
    {notice && <div className="toast"><BadgeCheck size={18} />{notice}</div>}
  </div>;
}

function Dashboard({ online, onOpenRequest, onViewTrip, onHistory }: { online: boolean; onOpenRequest: () => void; onViewTrip: () => void; onHistory: () => void }) {
  return <><section className="hero-row"><div><p className="muted">Ready to keep Delhi moving?</p><div className="hero-actions"><button className="primary-button" onClick={onOpenRequest}><Bell size={17} /> Review new request <ArrowRight size={16} /></button><button className="secondary-button" onClick={onViewTrip}><Navigation size={17} /> Open trip workspace</button></div></div><div className="hero-metric"><span>Today's earnings</span><strong>₹4,260</strong><small>+18% vs yesterday</small></div></section><div className="stat-grid"><Stat icon={Truck} label="Trips completed" value="6" detail="Today" /><Stat icon={Wallet} label="Collected" value="₹4,260" detail="UPI & cash" /><Stat icon={Clock3} label="Online time" value="4h 18m" detail="Since 04:24 AM" /><Stat icon={Star} label="Driver rating" value="4.9" detail="128 ratings" /></div><div className="content-grid"><section className="panel request-panel"><PanelHeading title="Incoming Delhi request" action="View details" onClick={onOpenRequest} /><div className="request-highlight"><div className="priority"><span className="priority-dot" /> HIGH PRIORITY</div><span className="muted">12 sec ago</span></div><h2>Pickup near Connaught Place</h2><p className="muted">Patient transfer · 3.2 km away · Basic Life Support</p><MapView compact position={DELHI_DRIVER} hospital={hospitals[0]} /><div className="request-data"><Data label="Estimated fare" value="₹680" /><Data label="Payment" value="UPI" /><Data label="Urgency" value="High" tone="red" /></div><button className="link-button" onClick={onOpenRequest}>Review and respond <ChevronRight size={16} /></button><div className="safety-banner"><ShieldCheck size={20} /><div><b>Safety check complete</b><span>Ambulance documents and emergency kit are up to date.</span></div><Check size={18} /></div></section><section className="panel"><PanelHeading title="Today's route activity" action="View history" onClick={onHistory} /><div className="activity-list"><ActivityRow time="08:12 AM" title="CityCare Emergency Centre" detail="Trip AC-1047 · Paid ₹680" /><ActivityRow time="06:48 AM" title="St. Mary's Multispeciality" detail="Trip AC-1046 · Paid ₹540" /><ActivityRow time="Yesterday" title="Northside General Hospital" detail="Trip AC-1045 · Paid ₹720" /></div></section></div><div className={`availability-bar ${online ? "available" : "offline"}`}><div className="status-dot" /><div><b>{online ? "You are available for dispatch" : "You are offline"}</b><span>{online ? "New Delhi ambulance requests will appear in Requests." : "Switch online to receive nearby requests."}</span></div><span className="bar-action">{online ? "1 request waiting" : "Go online"}</span></div></>;
}

function Requests({ stage, otp, setOtp, onAccept, onVerify, onDecline, driverPosition, selectedHospital }: { stage: TripStage; otp: string; setOtp: (value: string) => void; onAccept: () => void; onVerify: () => void; onDecline: () => void; driverPosition: Coordinates; selectedHospital: HospitalOption }) {
  const pickupDistance = distanceKm(driverPosition, DELHI_PICKUP).toFixed(1);
  return <div className="wide-grid"><section className="panel request-detail"><PanelHeading title="Request AC-1048" action="Live · Delhi" /><div className="request-header"><div className="priority"><span className="priority-dot" /> HIGH PRIORITY</div><span className="tag">Patient transfer</span></div><h2>Connaught Place pickup</h2><p className="muted">Rajiv Chowk Gate 3, New Delhi · {pickupDistance} km away</p><MapView compact position={driverPosition} hospital={selectedHospital} /><div className="detail-grid"><Data label="Patient" value="Aarav Mehta" /><Data label="Contact" value="+91 98••• 2041" /><Data label="Ambulance" value="Basic Life Support" /><Data label="Payment" value="UPI · ₹680 est." /></div><div className="note"><ShieldCheck size={18} /><span>Requester says the patient is conscious and needs transfer to an emergency department.</span></div></section><section className="panel decision-panel">{stage === "incoming" ? <><div className="panel-icon red"><Bell size={22} /></div><h2>Review this request</h2><p className="muted">Accept to lock this request to your ambulance, or decline to return it to dispatch.</p><button className="primary-button full" onClick={onAccept}><Check size={17} /> Accept and lock request</button><button className="secondary-button full" onClick={onDecline}><X size={17} /> Decline request</button></> : <><div className="panel-icon teal"><BadgeCheck size={22} /></div><h2>Verify passenger OTP</h2><p className="muted">The trip cannot start until the passenger gives you the code.</p><label className="field-label">Passenger OTP</label><input className="otp-field" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="4826" inputMode="numeric" /><span className="helper">Demo code: 4826</span><button className="primary-button full" onClick={onVerify}><BadgeCheck size={17} /> Verify and start navigation</button></>}</section></div>;
}

function ActiveTrip({ stage, hospital, position, progress, distance, eta, gpsStatus, onHospitals, onArrive }: { stage: TripStage; hospital: HospitalOption; position: Coordinates; progress: number; distance: number; eta: number; gpsStatus: string; onHospitals: () => void; onArrive: () => void }) {
  return <><div className="trip-toolbar"><div><span className="eyebrow">TRIP AC-1048 · {stage === "arrived" || stage === "payment" ? "ARRIVED" : "EN ROUTE"}</span><h2>Taking Aarav to emergency care</h2></div><div className="trip-toolbar-actions"><button className="secondary-button" onClick={() => window.open("tel:+919876542041")}><Phone size={16} /> Dispatcher</button><button className="danger-button" onClick={() => alert("Emergency assistance requested for this demo trip.")}><Activity size={16} /> Emergency</button></div></div><div className="trip-layout"><section className="panel map-panel"><div className="map-head"><span><MapPin size={16} /> Live OpenStreetMap route</span><span className="traffic"><span className="status-dot" /> {gpsStatus}</span></div><MapView position={position} hospital={hospital} /><div className="progress-track"><span style={{ width: `${progress}%` }} /></div><div className="map-footer"><div><span className="muted">ARRIVING IN</span><strong>{progress >= 100 ? "Arrived" : `${eta} min`}</strong></div><div><span className="muted">DISTANCE</span><strong>{distance.toFixed(1)} km</strong></div><div><span className="muted">DESTINATION</span><strong>{hospital.name}</strong></div></div></section><aside className="panel trip-side"><div className="side-section"><span className="eyebrow">AUTOMATIC TRIP DETECTION</span><h3>{progress >= 100 ? "Hospital arrival detected" : "Navigation in progress"}</h3><p className="muted">{progress >= 100 ? "The payment session opens automatically after arrival." : "GPS progress updates the route and nearby hospital distance."}</p></div><div className="selected-hospital"><Hospital size={20} /><div><b>{hospital.name}</b><span>{hospital.rating} ★ · {distance.toFixed(1)} km · {hospital.beds}</span></div></div>{progress < 100 ? <><button className="primary-button full" onClick={onHospitals}><Route size={17} /> Compare nearby hospitals</button><button className="secondary-button full" onClick={onArrive}><MapPin size={17} /> Simulate GPS arrival</button></> : <button className="primary-button full" onClick={onArrive}><CreditCard size={17} /> Open payment session</button>}</aside></div></>;
}

function Hospitals({ selected, onSelect, position, onStart }: { selected: HospitalOption; onSelect: (hospital: HospitalOption) => void; position: Coordinates; onStart: () => void }) {
  const rankedHospitals = [...hospitals].sort((a, b) => hospitalRecommendation(b, position).score - hospitalRecommendation(a, position).score);
  const selectedMetrics = hospitalRecommendation(selected, position);
  return <><div className="page-heading"><div><span className="eyebrow">DELHI ROUTE PLANNER</span><h2>Nearest suitable hospitals</h2><p className="muted">Recommendations update from the driver’s current GPS position and balance ETA, emergency capability, capacity, rating, and open status.</p></div><button className="primary-button" onClick={onStart}><Navigation size={17} /> Start navigation to selected</button></div><div className="hospital-layout"><section className="panel hospital-list"><PanelHeading title="Ranked recommendations" action={`${rankedHospitals.length} hospitals`} />{rankedHospitals.map((hospital, index) => { const metrics = hospitalRecommendation(hospital, position); return <button key={hospital.name} className={`hospital-row ${selected.name === hospital.name ? "selected" : ""}`} onClick={() => onSelect(hospital)}><div className="rank-badge">{index + 1}</div><div className="hospital-icon"><Hospital size={20} /></div><div className="hospital-main"><div className="hospital-name"><b>{hospital.name}</b><span className="tag">{index === 0 ? "Recommended" : hospital.tag}</span></div><span className="muted">{hospital.speciality} · {hospital.capacity}% emergency capacity</span><div className="hospital-meta"><span className="rating"><Star size={14} fill="currentColor" /> {hospital.rating} ({hospital.reviews.toLocaleString()})</span><span>{metrics.distance.toFixed(1)} km</span><strong>{metrics.eta} min</strong></div></div><ChevronRight size={18} /></button>; })}</section><section className="panel route-panel"><PanelHeading title="Hospital details & route" action={selected.openNow ? "Open now" : "Closed"} /><MapView position={position} hospital={selected} /><div className="hospital-detail-head"><div className="hospital-icon large"><Hospital size={24} /></div><div><h3>{selected.name}</h3><span className="muted">{selected.address}</span></div></div><div className="hospital-detail-grid"><Data label="Distance" value={`${selectedMetrics.distance.toFixed(1)} km`} /><Data label="ETA" value={`${selectedMetrics.eta} min`} /><Data label="Rating" value={`${selected.rating} / 5`} /><Data label="Capacity" value={`${selected.capacity}%`} /></div><div className="hospital-detail-copy"><b>{selected.emergencyLevel} · {selected.speciality}</b><span>{selected.beds}. Emergency intake is currently {selected.openNow ? "open" : "unavailable"}.</span><span>{selected.phone}</span></div><div className="route-option selected"><div><b>Recommended route</b><span>Fastest available corridor from live driver location</span></div><strong>{selectedMetrics.eta} min</strong></div><div className="route-option"><div><b>Alternative route</b><span>Ring Road fallback · longer distance</span></div><strong>{Math.max(5, Math.round(selectedMetrics.distance * 5.2))} min</strong></div><button className="primary-button full" onClick={onStart}><Navigation size={17} /> Navigate to {selected.name}</button></section></div></>;
}

function Payment({ hospital, status, onPay, onBack }: { hospital: HospitalOption; status: "pending" | "paid"; onPay: () => void; onBack: () => void }) { return <div className="payment-layout"><section className="panel payment-card"><div className="panel-icon teal"><CreditCard size={22} /></div><span className="eyebrow">TRIP AC-1048 · AUTOMATIC PAYMENT SESSION</span><h2>{status === "paid" ? "Payment completed" : "Collect trip payment"}</h2><p className="muted">Arrival at {hospital.name} was detected. Review the fare and close the trip.</p><div className="fare-total"><span>Total fare</span><strong>₹680</strong></div><div className="fare-lines"><Data label="Base trip" value="₹520" /><Data label="Emergency service" value="₹100" /><Data label="Platform fee" value="₹60" /><Data label="Method" value="UPI" /></div>{status === "pending" ? <button className="primary-button full" onClick={onPay}><Check size={17} /> Confirm payment received</button> : <div className="paid-banner"><Check size={18} /> Payment marked paid and trip closed.</div>}<button className="secondary-button full" onClick={onBack}>Back to active trip</button></section></div>; }

function History({ paymentStatus }: { paymentStatus: "pending" | "paid" }) { return <div className="panel"><PanelHeading title="Trip history" action="August 2026" /><table><thead><tr><th>Trip</th><th>Destination</th><th>Time</th><th>Payment</th><th>Status</th></tr></thead><tbody>{[{ id: "AC-1048", name: "CityCare Emergency Centre", time: "Now", fare: "₹680", status: paymentStatus === "paid" ? "Paid" : "Payment pending" }, { id: "AC-1047", name: "CityCare Emergency Centre", time: "08:12 AM", fare: "₹680", status: "Paid" }, { id: "AC-1046", name: "St. Mary's Multispeciality", time: "06:48 AM", fare: "₹540", status: "Paid" }].map((trip) => <tr key={trip.id}><td><b>{trip.id}</b></td><td>{trip.name}</td><td>{trip.time}</td><td>{trip.fare} · UPI</td><td><span className={trip.status === "Paid" ? "paid" : "pending-pill"}>{trip.status === "Paid" && <Check size={13} />} {trip.status}</span></td></tr>)}</tbody></table></div>; }

function Profile({ profile, setProfile, online, onToggle, editing, setEditing, notifications, setNotifications, notify }: { profile: { name: string; phone: string; vehicle: string }; setProfile: (value: { name: string; phone: string; vehicle: string }) => void; online: boolean; onToggle: () => void; editing: boolean; setEditing: (value: boolean) => void; notifications: boolean; setNotifications: (value: boolean) => void; notify: (message: string) => void }) { const [draft, setDraft] = useState(profile); return <div className="profile-grid"><section className="panel profile-card"><div className="profile-avatar">RK</div>{editing ? <><label className="field-label">Driver name</label><input className="text-field" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /><label className="field-label">Phone</label><input className="text-field" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} /><label className="field-label">Vehicle ID</label><input className="text-field" value={draft.vehicle} onChange={(e) => setDraft({ ...draft, vehicle: e.target.value })} /><button className="primary-button full" onClick={() => { setProfile(draft); setEditing(false); notify("Driver profile saved."); }}><Check size={16} /> Save profile</button></> : <><h2>{profile.name}</h2><p className="muted">SavLife Captain · Emergency response</p><div className="profile-rating"><Star size={18} fill="currentColor" /> 4.9 <span>128 ratings</span></div><button className="secondary-button full" onClick={() => { setDraft(profile); setEditing(true); }}><Settings size={16} /> Edit profile</button></>}</section><section className="panel settings-card"><PanelHeading title="Driver settings" action="Saved" /><SettingRow icon={Activity} title="Availability" detail={online ? "Online and receiving requests" : "Offline"} action={<button className={`switch ${online ? "on" : ""}`} onClick={onToggle}><span /></button>} /><SettingRow icon={ShieldCheck} title="Documents & verification" detail="All documents are current" action={<BadgeCheck size={18} color="#0F766E" />} /><SettingRow icon={Wallet} title="Payout account" detail="HDFC Bank · ending 2041" action={<button className="icon-button" onClick={() => notify("Payout account settings opened.")}><ChevronRight size={18} /></button>} /><SettingRow icon={Bell} title="Notifications" detail={notifications ? "Request alerts enabled" : "Request alerts paused"} action={<button className={`switch ${notifications ? "on" : ""}`} onClick={() => setNotifications(!notifications)}><span /></button>} /></section></div>; }

function MapView({ compact = false, position, hospital }: { compact?: boolean; position: Coordinates; hospital: HospitalOption }) {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const driverMarkerRef = useRef<google.maps.Marker | null>(null);
  const hospitalMarkerRef = useRef<google.maps.Marker | null>(null);
  const directionsRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const googleKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

  useEffect(() => {
    if (!mapElement.current || !googleKey) return;
    let disposed = false;
    setOptions({ key: googleKey, v: "weekly", libraries: ["places"] });
    Promise.all([importLibrary("maps"), importLibrary("routes"), importLibrary("places")]).then(() => {
      if (disposed || !mapElement.current) return;
      const googleApi = window.google;
      if (!googleApi) return;
      const driver = { lat: position.lat, lng: position.lng };
      const destination = { lat: hospital.location.lat, lng: hospital.location.lng };
      const map = new googleApi.maps.Map(mapElement.current, { center: driver, zoom: 13, mapTypeControl: false, streetViewControl: false, fullscreenControl: true, gestureHandling: "greedy" });
      mapRef.current = map;
      driverMarkerRef.current = new googleApi.maps.Marker({ map, position: driver, title: "Live ambulance position", label: "🚑" });
      hospitalMarkerRef.current = new googleApi.maps.Marker({ map, position: destination, title: hospital.name, label: "H" });
      directionsRef.current = new googleApi.maps.DirectionsRenderer({ map, suppressMarkers: true, polylineOptions: { strokeColor: "#0F766E", strokeWeight: 6, strokeOpacity: 0.9 } });
      new googleApi.maps.DirectionsService().route({ origin: driver, destination, travelMode: googleApi.maps.TravelMode.DRIVING, provideRouteAlternatives: true }, (result, status) => {
        if (status === "OK" && result && directionsRef.current) directionsRef.current.setDirections(result);
      });
      const bounds = new googleApi.maps.LatLngBounds();
      bounds.extend(driver);
      bounds.extend(destination);
      map.fitBounds(bounds, 48);
    }).catch(() => undefined);
    return () => {
      disposed = true;
      driverMarkerRef.current?.setMap(null);
      hospitalMarkerRef.current?.setMap(null);
      directionsRef.current?.setMap(null);
      mapRef.current = null;
    };
  }, [googleKey, position.lat, position.lng, hospital.name, hospital.location.lat, hospital.location.lng]);

  return <div className={`leaflet-map google-map ${compact ? "compact" : ""}`} ref={mapElement}>{!googleKey && <div className="map-fallback">Google Maps key is not configured.</div>}</div>;
}
function Stat({ icon: Icon, label, value, detail }: { icon: typeof Truck; label: string; value: string; detail: string }) { return <div className="stat-card"><div className="stat-icon"><Icon size={18} /></div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>; }
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

function SettingsPage({ online, notifications, setNotifications, onToggle, onLogout, notify }: { online: boolean; notifications: boolean; setNotifications: (value: boolean) => void; onToggle: () => void; onLogout: () => void; notify: (message: string) => void }) {
  return <div className="settings-page"><div className="page-heading"><div><span className="eyebrow">ACCOUNT CONTROLS</span><h2>Settings</h2><p className="muted">Manage how Captain receives dispatch requests and trip updates.</p></div></div><section className="panel settings-card"><SettingRow icon={Activity} title="Availability" detail={online ? "Online and receiving requests" : "Offline and not receiving requests"} action={<button className={`switch ${online ? "on" : ""}`} onClick={onToggle}><span /></button>} /><SettingRow icon={Bell} title="Request notifications" detail={notifications ? "Sound and browser alerts enabled" : "Alerts paused"} action={<button className={`switch ${notifications ? "on" : ""}`} onClick={() => setNotifications(!notifications)}><span /></button>} /><SettingRow icon={Navigation} title="Automatic trip detection" detail="Use GPS progress to detect hospital arrival" action={<button className="icon-button" onClick={() => notify("Automatic trip detection is enabled.")}><BadgeCheck size={18} color="#0F766E" /></button>} /><SettingRow icon={ShieldCheck} title="Safety and documents" detail="All ambulance documents are current" action={<button className="icon-button" onClick={() => notify("Documents are current.")}><ChevronRight size={18} /></button>} /></section><section className="panel danger-zone"><div><h3>Sign out of Captain</h3><p className="muted">You will stop receiving requests on this browser until you sign in again.</p></div><button className="danger-button" onClick={onLogout}>Sign out</button></section></div>;
}

function HelpPage({ notify }: { notify: (message: string) => void }) {
  return <div className="help-page"><div className="page-heading"><div><span className="eyebrow">CAPTAIN SUPPORT</span><h2>Help & support</h2><p className="muted">Get quick guidance while you are online or on a trip.</p></div></div><div className="help-grid"><button className="panel help-card" onClick={() => notify("Dispatcher callback requested.")}><Phone size={22} /><div><h3>Call dispatcher</h3><p className="muted">Get help with an active request or route.</p></div><ChevronRight size={18} /></button><button className="panel help-card" onClick={() => notify("Emergency support has been alerted for this demo.")}><Activity size={22} /><div><h3>Emergency support</h3><p className="muted">Alert the operations team during a critical trip.</p></div><ChevronRight size={18} /></button><button className="panel help-card" onClick={() => notify("Safety guide opened.")}><ShieldCheck size={22} /><div><h3>Safety guide</h3><p className="muted">Review patient transfer and ambulance safety steps.</p></div><ChevronRight size={18} /></button></div></div>;
}
