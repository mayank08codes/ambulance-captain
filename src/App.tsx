import { useMemo, useState } from "react";
import { Activity, Ambulance, ArrowRight, BadgeCheck, BarChart3, Bell, Check, ChevronRight, CircleHelp, Clock3, CreditCard, Hospital, LayoutDashboard, MapPin, Menu, Navigation, Phone, Route, Settings, ShieldCheck, Star, Truck, UserRound, Wallet, X } from "lucide-react";

type Section = "dashboard" | "requests" | "trip" | "hospitals" | "history" | "profile";
type TripStage = "incoming" | "otp" | "enroute" | "arrived" | "completed";

const hospitals = [
  { name: "CityCare Emergency Centre", rating: 4.8, reviews: 1240, distance: "2.8 km", eta: "9 min", beds: "ER available", tag: "Best route" },
  { name: "St. Mary's Multispeciality", rating: 4.6, reviews: 864, distance: "3.6 km", eta: "12 min", beds: "Cardiac unit", tag: "Top rated" },
  { name: "Northside General Hospital", rating: 4.4, reviews: 702, distance: "5.1 km", eta: "16 min", beds: "Trauma centre", tag: "24/7 intake" },
];

const navItems: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "requests", label: "Requests", icon: Bell },
  { id: "trip", label: "Active trip", icon: Navigation },
  { id: "hospitals", label: "Hospitals & routes", icon: Hospital },
  { id: "history", label: "Trip history", icon: Clock3 },
  { id: "profile", label: "Driver profile", icon: UserRound },
];

function App() {
  const [section, setSection] = useState<Section>("dashboard");
  const [tripStage, setTripStage] = useState<TripStage>("incoming");
  const [online, setOnline] = useState(true);
  const [otp, setOtp] = useState("");
  const [selectedHospital, setSelectedHospital] = useState(hospitals[0]);
  const [notice, setNotice] = useState("");

  const tripLabel = useMemo(() => ({ incoming: "New request", otp: "Verify passenger", enroute: "En route", arrived: "At hospital", completed: "Completed" }[tripStage]), [tripStage]);
  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 2600); };
  const openTrip = () => { setSection("trip"); setTripStage("enroute"); };
  const acceptRequest = () => { setTripStage("otp"); setSection("requests"); notify("Request accepted. Ask the passenger for the OTP."); };
  const verifyOtp = () => { if (otp === "4826") { setTripStage("enroute"); setSection("trip"); notify("Passenger verified. Navigation is ready."); } else notify("Demo OTP is 4826."); };
  const completeTrip = () => { setTripStage("completed"); setSection("history"); notify("Trip completed and ₹680 marked as paid."); };

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Ambulance size={22} /></div><div><strong>Ambulance Captain</strong><span>Driver operations</span></div></div>
      <div className="online-card"><span className="status-dot" /><div><b>{online ? "You are online" : "You are offline"}</b><small>{online ? "Receiving nearby requests" : "Go online to receive requests"}</small></div><button className={`switch ${online ? "on" : ""}`} onClick={() => setOnline(!online)} aria-label="Toggle availability"><span /></button></div>
      <nav className="nav-list">{navItems.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-item ${section === id ? "active" : ""}`} onClick={() => setSection(id)}><Icon size={18} /><span>{label}</span>{id === "requests" && online && <em>1</em>}</button>)}</nav>
      <div className="sidebar-bottom"><button className="nav-item"><CircleHelp size={18} /><span>Help & support</span></button><div className="driver-mini"><div className="avatar">RK</div><div><b>Ravi Kumar</b><small>Captain · BLS-2041</small></div><Settings size={16} /></div></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="mobile-menu"><Menu size={20} /></div><div><span className="eyebrow">TUESDAY · 08:42 AM</span><h1>{section === "dashboard" ? "Good morning, Ravi" : navItems.find((item) => item.id === section)?.label}</h1></div><div className="top-actions"><span className="live-pill"><span className="status-dot" /> Live dispatch</span><button className="icon-button"><Bell size={18} /></button><div className="top-avatar">RK</div></div></header>
      <div className="page-content">
        {section === "dashboard" && <Dashboard online={online} onOpenRequest={() => setSection("requests")} onViewTrip={openTrip} onHistory={() => setSection("history")} />}
        {section === "requests" && <Requests stage={tripStage} otp={otp} setOtp={setOtp} onAccept={acceptRequest} onVerify={verifyOtp} onDecline={() => { setTripStage("incoming"); setSection("dashboard"); notify("Request declined."); }} />}
        {section === "trip" && <ActiveTrip stage={tripStage} hospital={selectedHospital} onHospitals={() => setSection("hospitals")} onArrive={() => setTripStage("arrived")} onComplete={completeTrip} />}
        {section === "hospitals" && <Hospitals selected={selectedHospital} onSelect={setSelectedHospital} onStart={() => { setTripStage("enroute"); setSection("trip"); notify(`Navigation set for ${selectedHospital.name}.`); }} />}
        {section === "history" && <History />}
        {section === "profile" && <Profile online={online} onToggle={() => setOnline(!online)} />}
      </div>
    </main>
    {notice && <div className="toast"><BadgeCheck size={18} />{notice}</div>}
  </div>;
}

function Dashboard({ online, onOpenRequest, onViewTrip, onHistory }: { online: boolean; onOpenRequest: () => void; onViewTrip: () => void; onHistory: () => void }) {
  return (
    <>
      <section className="hero-row">
        <div>
          <p className="muted">Ready to keep your city moving?</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={onOpenRequest}><Bell size={17} /> Review new request <ArrowRight size={16} /></button>
            <button className="secondary-button" onClick={onViewTrip}><Navigation size={17} /> Open trip workspace</button>
          </div>
        </div>
        <div className="hero-metric"><span>Today's earnings</span><strong>₹4,260</strong><small>+18% vs yesterday</small></div>
      </section>
      <div className="stat-grid">
        <Stat icon={Truck} label="Trips completed" value="6" detail="Today" />
        <Stat icon={Wallet} label="Collected" value="₹4,260" detail="UPI & cash" />
        <Stat icon={Clock3} label="Online time" value="4h 18m" detail="Since 04:24 AM" />
        <Stat icon={Star} label="Driver rating" value="4.9" detail="128 ratings" />
      </div>
      <div className="content-grid">
        <section className="panel request-panel">
          <PanelHeading title="Incoming request" action="View details" onClick={onOpenRequest} />
          <div className="request-highlight"><div className="priority"><span className="priority-dot" /> HIGH PRIORITY</div><span className="muted">12 sec ago</span></div>
          <h2>Pickup near Indiranagar Metro</h2>
          <p className="muted">Patient transfer · 3.2 km away · Basic Life Support</p>
          <div className="request-data"><Data label="Estimated fare" value="₹680" /><Data label="Payment" value="UPI" /><Data label="Urgency" value="High" tone="red" /></div>
          <button className="link-button" onClick={onOpenRequest}>Review and respond <ChevronRight size={16} /></button>
          <div className="safety-banner"><ShieldCheck size={20} /><div><b>Safety check complete</b><span>Ambulance documents and emergency kit are up to date.</span></div><Check size={18} /></div>
        </section>
        <section className="panel">
          <PanelHeading title="Today's route activity" action="View history" onClick={onHistory} />
          <div className="activity-list"><ActivityRow time="08:12 AM" title="CityCare Emergency Centre" detail="Trip AC-1047 · Paid ₹680" /><ActivityRow time="06:48 AM" title="St. Mary's Multispeciality" detail="Trip AC-1046 · Paid ₹540" /><ActivityRow time="Yesterday" title="Northside General Hospital" detail="Trip AC-1045 · Paid ₹720" /></div>
        </section>
      </div>
      <div className={`availability-bar ${online ? "available" : "offline"}`}><div className="status-dot" /><div><b>{online ? "You are available for dispatch" : "You are offline"}</b><span>{online ? "New ambulance requests will appear in Requests." : "Switch online to receive nearby requests."}</span></div><span className="bar-action">{online ? "1 request waiting" : "Go online"}</span></div>
    </>
  );
}

function Requests({ stage, otp, setOtp, onAccept, onVerify, onDecline }: { stage: TripStage; otp: string; setOtp: (value: string) => void; onAccept: () => void; onVerify: () => void; onDecline: () => void }) {
  return <div className="wide-grid"><section className="panel request-detail"><PanelHeading title="Request AC-1048" action="12 sec ago" /><div className="request-header"><div className="priority"><span className="priority-dot" /> HIGH PRIORITY</div><span className="tag">Patient transfer</span></div><h2>Indiranagar Metro Station</h2><p className="muted">12th Main Road, Bengaluru · 3.2 km away</p><MapMock compact /><div className="detail-grid"><Data label="Patient" value="Aarav Mehta" /><Data label="Contact" value="+91 98••• 2041" /><Data label="Ambulance" value="Basic Life Support" /><Data label="Payment" value="UPI · ₹680 est." /></div><div className="note"><ShieldCheck size={18} /><span>Requester says the patient is conscious and needs transfer to an emergency department.</span></div></section><section className="panel decision-panel">{stage === "incoming" ? <><div className="panel-icon red"><Bell size={22} /></div><h2>Review this request</h2><p className="muted">Accept to verify the passenger and start navigation, or decline to return it to dispatch.</p><button className="primary-button full" onClick={onAccept}><Check size={17} /> Accept request</button><button className="secondary-button full" onClick={onDecline}><X size={17} /> Decline request</button></> : <><div className="panel-icon teal"><BadgeCheck size={22} /></div><h2>Verify passenger OTP</h2><p className="muted">Ask the passenger for the 4-digit code shown in their app.</p><label className="field-label">Passenger OTP</label><input className="otp-field" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="4826" inputMode="numeric" /><span className="helper">Demo code: 4826</span><button className="primary-button full" onClick={onVerify}><BadgeCheck size={17} /> Verify and start trip</button></>}</section></div>;
}

function ActiveTrip({ stage, hospital, onHospitals, onArrive, onComplete }: { stage: TripStage; hospital: typeof hospitals[number]; onHospitals: () => void; onArrive: () => void; onComplete: () => void }) {
  return <><div className="trip-toolbar"><div><span className="eyebrow">TRIP AC-1048 · {stage === "arrived" ? "ARRIVED" : "EN ROUTE"}</span><h2>Taking Aarav to emergency care</h2></div><div className="trip-toolbar-actions"><button className="secondary-button"><Phone size={16} /> Dispatcher</button><button className="danger-button"><Activity size={16} /> Emergency</button></div></div><div className="trip-layout"><section className="panel map-panel"><div className="map-head"><span><MapPin size={16} /> Live route</span><span className="traffic"><span className="status-dot" /> Light traffic</span></div><MapMock /><div className="map-footer"><div><span className="muted">ARRIVING IN</span><strong>{stage === "arrived" ? "Arrived" : "09 min"}</strong></div><div><span className="muted">DISTANCE</span><strong>2.8 km</strong></div><div><span className="muted">DESTINATION</span><strong>{hospital.name}</strong></div></div></section><aside className="panel trip-side"><div className="side-section"><span className="eyebrow">NEXT ACTION</span><h3>{stage === "arrived" ? "Complete trip" : "Choose the best hospital"}</h3><p className="muted">{stage === "arrived" ? "Confirm handover and collect the final payment." : "Compare nearby emergency departments by ETA, reviews, and available care."}</p></div><div className="selected-hospital"><Hospital size={20} /><div><b>{hospital.name}</b><span>{hospital.rating} ★ · {hospital.eta} · {hospital.beds}</span></div></div>{stage !== "arrived" ? <button className="primary-button full" onClick={onHospitals}><Route size={17} /> Compare hospitals</button> : <button className="primary-button full" onClick={onComplete}><CreditCard size={17} /> Complete & collect ₹680</button>}<button className="secondary-button full" onClick={onArrive}><MapPin size={17} /> Mark as arrived</button></aside></div></>;
}

function Hospitals({ selected, onSelect, onStart }: { selected: typeof hospitals[number]; onSelect: (hospital: typeof hospitals[number]) => void; onStart: () => void }) {
  return <><div className="page-heading"><div><span className="eyebrow">ROUTE PLANNER</span><h2>Nearby emergency hospitals</h2><p className="muted">Choose the safest destination for the passenger based on ETA, reviews, and care availability.</p></div><button className="primary-button" onClick={onStart}><Navigation size={17} /> Start navigation</button></div><div className="hospital-layout"><section className="panel hospital-list">{hospitals.map((hospital) => <button key={hospital.name} className={`hospital-row ${selected.name === hospital.name ? "selected" : ""}`} onClick={() => onSelect(hospital)}><div className="hospital-icon"><Hospital size={20} /></div><div className="hospital-main"><div className="hospital-name"><b>{hospital.name}</b><span className="tag">{hospital.tag}</span></div><span className="muted">{hospital.beds} · {hospital.reviews.toLocaleString()} reviews</span><div className="hospital-meta"><span className="rating"><Star size={14} fill="currentColor" /> {hospital.rating}</span><span>{hospital.distance}</span><strong>{hospital.eta}</strong></div></div><ChevronRight size={18} /></button>)}</section><section className="panel route-panel"><PanelHeading title="Route comparison" action="Updated now" /><MapMock /><div className="route-option selected"><div><b>Recommended route</b><span>Outer Ring Road · light traffic</span></div><strong>09 min</strong></div><div className="route-option"><div><b>Alternative route</b><span>Old Airport Road · moderate traffic</span></div><strong>13 min</strong></div><div className="route-option"><div><b>Fastest on clear roads</b><span>Inner Ring Road · variable traffic</span></div><strong>11 min</strong></div></section></div></>;
}

function History() { return <div className="panel"><PanelHeading title="Trip history" action="August 2026" /><table><thead><tr><th>Trip</th><th>Destination</th><th>Time</th><th>Payment</th><th>Status</th></tr></thead><tbody>{[{ id: "AC-1047", name: "CityCare Emergency Centre", time: "08:12 AM", fare: "₹680" }, { id: "AC-1046", name: "St. Mary's Multispeciality", time: "06:48 AM", fare: "₹540" }, { id: "AC-1045", name: "Northside General Hospital", time: "Yesterday, 09:34 PM", fare: "₹720" }].map((trip) => <tr key={trip.id}><td><b>{trip.id}</b></td><td>{trip.name}</td><td>{trip.time}</td><td>{trip.fare} · UPI</td><td><span className="paid"><Check size={13} /> Paid</span></td></tr>)}</tbody></table></div>; }
function Profile({ online, onToggle }: { online: boolean; onToggle: () => void }) { return <div className="profile-grid"><section className="panel profile-card"><div className="profile-avatar">RK</div><h2>Ravi Kumar</h2><p className="muted">Ambulance Captain · Bengaluru</p><div className="profile-rating"><Star size={18} fill="currentColor" /> 4.9 <span>128 ratings</span></div><button className="secondary-button full"><Settings size={16} /> Edit profile</button></section><section className="panel settings-card"><PanelHeading title="Driver settings" action="Saved" /><SettingRow icon={Activity} title="Availability" detail={online ? "Online and receiving requests" : "Offline"} action={<button className={`switch ${online ? "on" : ""}`} onClick={onToggle}><span /></button>} /><SettingRow icon={ShieldCheck} title="Documents & verification" detail="All documents are current" action={<BadgeCheck size={18} color="#0F766E" />} /><SettingRow icon={Wallet} title="Payout account" detail="HDFC Bank · ending 2041" action={<ChevronRight size={18} />} /><SettingRow icon={Bell} title="Notifications" detail="Request alerts enabled" action={<ChevronRight size={18} />} /></section></div>; }

function MapMock({ compact = false }: { compact?: boolean }) { return <div className={`map-mock ${compact ? "compact" : ""}`}><div className="map-grid" /><div className="road road-one" /><div className="road road-two" /><div className="route-line" /><div className="map-pin start"><MapPin size={16} /></div><div className="map-pin end"><Hospital size={16} /></div><span className="map-label start-label">Pickup</span><span className="map-label end-label">Hospital</span><div className="map-legend"><span><i className="blue-dot" /> Ambulance</span><span><i className="red-dot" /> Destination</span></div></div>; }
function Stat({ icon: Icon, label, value, detail }: { icon: typeof Truck; label: string; value: string; detail: string }) { return <div className="stat-card"><div className="stat-icon"><Icon size={18} /></div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>; }
function Data({ label, value, tone }: { label: string; value: string; tone?: "red" }) { return <div><span className="data-label">{label}</span><strong className={tone === "red" ? "red-text" : ""}>{value}</strong></div>; }
function PanelHeading({ title, action, onClick }: { title: string; action?: string; onClick?: () => void }) { return <div className="panel-heading"><h3>{title}</h3>{action && <button className="text-button" onClick={onClick}>{action} <ChevronRight size={15} /></button>}</div>; }
function ActivityRow({ time, title, detail }: { time: string; title: string; detail: string }) { return <div className="activity-row"><span className="activity-time">{time}</span><div className="activity-icon"><Hospital size={16} /></div><div><b>{title}</b><span>{detail}</span></div><ChevronRight size={16} /></div>; }
function SettingRow({ icon: Icon, title, detail, action }: { icon: typeof Activity; title: string; detail: string; action: React.ReactNode }) { return <div className="setting-row"><div className="setting-icon"><Icon size={17} /></div><div><b>{title}</b><span>{detail}</span></div><div className="setting-action">{action}</div></div>; }

export default App;
