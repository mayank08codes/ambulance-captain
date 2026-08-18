import { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
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

type Section = "dashboard" | "requests" | "trip" | "hospitals" | "history" | "profile" | "payment";
type TripStage = "incoming" | "otp" | "enroute" | "arrived" | "payment" | "completed";
type Coordinates = { lat: number; lng: number };

type HospitalOption = {
  name: string;
  rating: number;
  reviews: number;
  beds: string;
  tag: string;
  location: Coordinates;
};

const DELHI_DRIVER: Coordinates = { lat: 28.6139, lng: 77.209 };
const DELHI_PICKUP: Coordinates = { lat: 28.6315, lng: 77.2167 };
const hospitals: HospitalOption[] = [
  { name: "CityCare Emergency Centre", rating: 4.8, reviews: 1240, beds: "ER available", tag: "Best route", location: { lat: 28.628, lng: 77.218 } },
  { name: "St. Mary's Multispeciality", rating: 4.6, reviews: 864, beds: "Cardiac unit", tag: "Top rated", location: { lat: 28.642, lng: 77.221 } },
  { name: "Northside General Hospital", rating: 4.4, reviews: 702, beds: "Trauma centre", tag: "24/7 intake", location: { lat: 28.595, lng: 77.205 } },
];

const navItems: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "requests", label: "Requests", icon: Bell },
  { id: "trip", label: "Active trip", icon: Navigation },
  { id: "hospitals", label: "Hospitals & routes", icon: Hospital },
  { id: "history", label: "Trip history", icon: Clock3 },
  { id: "profile", label: "Driver profile", icon: UserRound },
];

function distanceKm(a: Coordinates, b: Coordinates) {
  const earth = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return earth * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function App() {
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

  const acceptRequest = () => { setTripStage("otp"); setSection("requests"); notify("Request locked to you. Ask the passenger for the OTP."); };
  const verifyOtp = () => {
    if (otp === "4826") { setTripStage("enroute"); setProgress(0); setSection("trip"); notify("Passenger verified. Navigation started automatically."); }
    else notify("Enter the demo OTP 4826.");
  };
  const completePayment = () => { setPaymentStatus("paid"); setTripStage("completed"); setSection("history"); notify("₹680 payment recorded and trip closed."); };
  const openHelp = () => notify("Support request opened. Dispatcher callback is available.");

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Ambulance size={22} /></div><div><strong>Ambulance Captain</strong><span>Delhi driver operations</span></div></div>
      <div className="online-card"><span className="status-dot" /><div><b>{online ? "You are online" : "You are offline"}</b><small>{online ? "Receiving Delhi requests" : "Go online to receive requests"}</small></div><button className={`switch ${online ? "on" : ""}`} onClick={() => setOnline(!online)} aria-label="Toggle availability"><span /></button></div>
      <nav className="nav-list">{navItems.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-item ${section === id ? "active" : ""}`} onClick={() => setSection(id)}><Icon size={18} /><span>{label}</span>{id === "requests" && online && <em>1</em>}</button>)}</nav>
      <div className="sidebar-bottom"><button className="nav-item" onClick={openHelp}><CircleHelp size={18} /><span>Help & support</span></button><button className="driver-mini" onClick={() => setSection("profile")}><div className="avatar">RK</div><div><b>{profile.name}</b><small>Captain · {profile.vehicle}</small></div><Settings size={16} /></button></div>
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
  return <><div className="page-heading"><div><span className="eyebrow">DELHI ROUTE PLANNER</span><h2>Nearby emergency hospitals</h2><p className="muted">Distance and ETA are calculated from the current driver position.</p></div><button className="primary-button" onClick={onStart}><Navigation size={17} /> Start navigation</button></div><div className="hospital-layout"><section className="panel hospital-list">{hospitals.map((hospital) => { const km = distanceKm(position, hospital.location); return <button key={hospital.name} className={`hospital-row ${selected.name === hospital.name ? "selected" : ""}`} onClick={() => onSelect(hospital)}><div className="hospital-icon"><Hospital size={20} /></div><div className="hospital-main"><div className="hospital-name"><b>{hospital.name}</b><span className="tag">{hospital.tag}</span></div><span className="muted">{hospital.beds} · {hospital.reviews.toLocaleString()} reviews</span><div className="hospital-meta"><span className="rating"><Star size={14} fill="currentColor" /> {hospital.rating}</span><span>{km.toFixed(1)} km</span><strong>{Math.max(3, Math.round(km * 4.2))} min</strong></div></div><ChevronRight size={18} /></button>; })}</section><section className="panel route-panel"><PanelHeading title="Route comparison" action="Updated now" /><MapView position={position} hospital={selected} /><div className="route-option selected"><div><b>Recommended route</b><span>Central Delhi corridor · calculated from GPS</span></div><strong>{Math.max(3, Math.round(distanceKm(position, selected.location) * 4.2))} min</strong></div><div className="route-option"><div><b>Alternative route</b><span>Ring Road · traffic fallback</span></div><strong>{Math.max(5, Math.round(distanceKm(position, selected.location) * 5.2))} min</strong></div></section></div></>;
}

function Payment({ hospital, status, onPay, onBack }: { hospital: HospitalOption; status: "pending" | "paid"; onPay: () => void; onBack: () => void }) { return <div className="payment-layout"><section className="panel payment-card"><div className="panel-icon teal"><CreditCard size={22} /></div><span className="eyebrow">TRIP AC-1048 · AUTOMATIC PAYMENT SESSION</span><h2>{status === "paid" ? "Payment completed" : "Collect trip payment"}</h2><p className="muted">Arrival at {hospital.name} was detected. Review the fare and close the trip.</p><div className="fare-total"><span>Total fare</span><strong>₹680</strong></div><div className="fare-lines"><Data label="Base trip" value="₹520" /><Data label="Emergency service" value="₹100" /><Data label="Platform fee" value="₹60" /><Data label="Method" value="UPI" /></div>{status === "pending" ? <button className="primary-button full" onClick={onPay}><Check size={17} /> Confirm payment received</button> : <div className="paid-banner"><Check size={18} /> Payment marked paid and trip closed.</div>}<button className="secondary-button full" onClick={onBack}>Back to active trip</button></section></div>; }

function History({ paymentStatus }: { paymentStatus: "pending" | "paid" }) { return <div className="panel"><PanelHeading title="Trip history" action="August 2026" /><table><thead><tr><th>Trip</th><th>Destination</th><th>Time</th><th>Payment</th><th>Status</th></tr></thead><tbody>{[{ id: "AC-1048", name: "CityCare Emergency Centre", time: "Now", fare: "₹680", status: paymentStatus === "paid" ? "Paid" : "Payment pending" }, { id: "AC-1047", name: "CityCare Emergency Centre", time: "08:12 AM", fare: "₹680", status: "Paid" }, { id: "AC-1046", name: "St. Mary's Multispeciality", time: "06:48 AM", fare: "₹540", status: "Paid" }].map((trip) => <tr key={trip.id}><td><b>{trip.id}</b></td><td>{trip.name}</td><td>{trip.time}</td><td>{trip.fare} · UPI</td><td><span className={trip.status === "Paid" ? "paid" : "pending-pill"}>{trip.status === "Paid" && <Check size={13} />} {trip.status}</span></td></tr>)}</tbody></table></div>; }

function Profile({ profile, setProfile, online, onToggle, editing, setEditing, notifications, setNotifications, notify }: { profile: { name: string; phone: string; vehicle: string }; setProfile: (value: { name: string; phone: string; vehicle: string }) => void; online: boolean; onToggle: () => void; editing: boolean; setEditing: (value: boolean) => void; notifications: boolean; setNotifications: (value: boolean) => void; notify: (message: string) => void }) { const [draft, setDraft] = useState(profile); return <div className="profile-grid"><section className="panel profile-card"><div className="profile-avatar">RK</div>{editing ? <><label className="field-label">Driver name</label><input className="text-field" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /><label className="field-label">Phone</label><input className="text-field" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} /><label className="field-label">Vehicle ID</label><input className="text-field" value={draft.vehicle} onChange={(e) => setDraft({ ...draft, vehicle: e.target.value })} /><button className="primary-button full" onClick={() => { setProfile(draft); setEditing(false); notify("Driver profile saved."); }}><Check size={16} /> Save profile</button></> : <><h2>{profile.name}</h2><p className="muted">Ambulance Captain · Delhi</p><div className="profile-rating"><Star size={18} fill="currentColor" /> 4.9 <span>128 ratings</span></div><button className="secondary-button full" onClick={() => { setDraft(profile); setEditing(true); }}><Settings size={16} /> Edit profile</button></>}</section><section className="panel settings-card"><PanelHeading title="Driver settings" action="Saved" /><SettingRow icon={Activity} title="Availability" detail={online ? "Online and receiving requests" : "Offline"} action={<button className={`switch ${online ? "on" : ""}`} onClick={onToggle}><span /></button>} /><SettingRow icon={ShieldCheck} title="Documents & verification" detail="All documents are current" action={<BadgeCheck size={18} color="#0F766E" />} /><SettingRow icon={Wallet} title="Payout account" detail="HDFC Bank · ending 2041" action={<button className="icon-button" onClick={() => notify("Payout account settings opened.")}><ChevronRight size={18} /></button>} /><SettingRow icon={Bell} title="Notifications" detail={notifications ? "Request alerts enabled" : "Request alerts paused"} action={<button className={`switch ${notifications ? "on" : ""}`} onClick={() => setNotifications(!notifications)}><span /></button>} /></section></div>; }

function MapView({ compact = false, position, hospital }: { compact?: boolean; position: Coordinates; hospital: HospitalOption }) { const mapElement = useRef<HTMLDivElement>(null); const map = useRef<L.Map | null>(null); const markers = useRef<L.LayerGroup | null>(null); useEffect(() => { if (!mapElement.current || map.current) return; map.current = L.map(mapElement.current, { zoomControl: true }).setView([position.lat, position.lng], 13); L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap contributors", maxZoom: 19 }).addTo(map.current); markers.current = L.layerGroup().addTo(map.current); return () => { map.current?.remove(); map.current = null; }; }, [position.lat, position.lng]); useEffect(() => { if (!map.current || !markers.current) return; markers.current.clearLayers(); const driverIcon = L.divIcon({ className: "leaflet-driver-marker", html: "<span>🚑</span>", iconSize: [32, 32], iconAnchor: [16, 16] }); const hospitalIcon = L.divIcon({ className: "leaflet-hospital-marker", html: "<span>+</span>", iconSize: [30, 30], iconAnchor: [15, 15] }); L.marker([position.lat, position.lng], { icon: driverIcon }).bindTooltip("Ambulance position", { direction: "top" }).addTo(markers.current); L.marker([hospital.location.lat, hospital.location.lng], { icon: hospitalIcon }).bindTooltip(hospital.name, { direction: "top" }).addTo(markers.current); L.polyline([[position.lat, position.lng], [hospital.location.lat, hospital.location.lng]], { color: "#0f766e", weight: 5, opacity: 0.9 }).addTo(markers.current); map.current.fitBounds([[position.lat, position.lng], [hospital.location.lat, hospital.location.lng]], { padding: [20, 20] }); }, [position, hospital]); return <div className={`leaflet-map ${compact ? "compact" : ""}`} ref={mapElement} />; }
function Stat({ icon: Icon, label, value, detail }: { icon: typeof Truck; label: string; value: string; detail: string }) { return <div className="stat-card"><div className="stat-icon"><Icon size={18} /></div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>; }
function Data({ label, value, tone }: { label: string; value: string; tone?: "red" }) { return <div><span className="data-label">{label}</span><strong className={tone === "red" ? "red-text" : ""}>{value}</strong></div>; }
function PanelHeading({ title, action, onClick }: { title: string; action?: string; onClick?: () => void }) { return <div className="panel-heading"><h3>{title}</h3>{action && <button className="text-button" onClick={onClick}>{action} <ChevronRight size={15} /></button>}</div>; }
function ActivityRow({ time, title, detail }: { time: string; title: string; detail: string }) { return <div className="activity-row"><span className="activity-time">{time}</span><div className="activity-icon"><Hospital size={16} /></div><div><b>{title}</b><span>{detail}</span></div><ChevronRight size={16} /></div>; }
function SettingRow({ icon: Icon, title, detail, action }: { icon: typeof Activity; title: string; detail: string; action: React.ReactNode }) { return <div className="setting-row"><div className="setting-icon"><Icon size={17} /></div><div><b>{title}</b><span>{detail}</span></div><div className="setting-action">{action}</div></div>; }
export default App;
