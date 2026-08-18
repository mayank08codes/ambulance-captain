import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { ScreenContainer } from "@/components/screen-container";

const navy = "#102A43";
const red = "#D64545";
const teal = "#0F766E";
const sky = "#E8F1F5";
const slate = "#52606D";
const amber = "#D97706";
const border = "#D9E2EC";
const ink = "#172B4D";
const white = "#FFFFFF";

type Screen = "home" | "request" | "trip" | "hospitals" | "routes" | "payment" | "history" | "profile";

type Hospital = {
  name: string;
  rating: string;
  reviews: string;
  distance: string;
  eta: string;
  tags: string[];
  route: string;
};

const hospitals: Hospital[] = [
  { name: "CityCare Emergency Centre", rating: "4.8", reviews: "1,240", distance: "2.8 km", eta: "9 min", tags: ["24/7 ER", "Trauma", "ICU"], route: "Fastest · 9 min" },
  { name: "St. Mary's Multispeciality", rating: "4.6", reviews: "864", distance: "3.6 km", eta: "12 min", tags: ["24/7 ER", "Cardiac", "Pharmacy"], route: "Recommended · 12 min" },
  { name: "Northside General Hospital", rating: "4.5", reviews: "532", distance: "4.9 km", eta: "15 min", tags: ["Trauma", "NICU", "Blood bank"], route: "Low traffic · 15 min" },
];

const routes = [
  { label: "Recommended", time: "9 min", distance: "2.8 km", traffic: "Light traffic", color: teal, note: "Best balance of speed and safety" },
  { label: "Fastest", time: "8 min", distance: "3.1 km", traffic: "Moderate traffic", color: red, note: "One signal-heavy junction" },
  { label: "Least congested", time: "12 min", distance: "3.9 km", traffic: "Very light traffic", color: amber, note: "Wider roads for smoother driving" },
];

function Icon({ name, size = 22, color = ink }: { name: React.ComponentProps<typeof MaterialIcons>["name"]; size?: number; color?: string }) {
  return <MaterialIcons name={name} size={size} color={color} />;
}

function ActionButton({ label, onPress, tone = "primary", icon }: { label: string; onPress: () => void; tone?: "primary" | "danger" | "soft" | "outline"; icon?: React.ComponentProps<typeof MaterialIcons>["name"] }) {
  const toneStyle = tone === "danger" ? styles.dangerButton : tone === "soft" ? styles.softButton : tone === "outline" ? styles.outlineButton : styles.primaryButton;
  const textStyle = tone === "soft" ? styles.softButtonText : tone === "outline" ? styles.outlineButtonText : styles.buttonText;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.actionButton, toneStyle, pressed && styles.pressed]}>
      {icon ? <Icon name={icon} size={19} color={tone === "soft" || tone === "outline" ? navy : white} /> : null}
      <Text style={textStyle}>{label}</Text>
    </Pressable>
  );
}

function Header({ title, onBack, right }: { title: string; onBack?: () => void; right?: React.ReactNode }) {
  return (
    <View style={styles.headerRow}>
      <View style={styles.headerSide}>{onBack ? <Pressable onPress={onBack} hitSlop={10} style={styles.iconButton}><Icon name="arrow-back" color={navy} /></Pressable> : <View style={styles.brandMark}><Icon name="local-hospital" size={18} color={white} /></View>}</View>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={[styles.headerSide, styles.headerRight]}>{right}</View>
    </View>
  );
}

function MapPanel({ compact = false }: { compact?: boolean }) {
  return (
    <View style={[styles.mapPanel, compact && styles.compactMap]}>
      <View style={styles.mapLabel}><Icon name="navigation" size={14} color={teal} /><Text style={styles.mapLabelText}>Live route preview</Text></View>
      <View style={styles.mapRoadA} /><View style={styles.mapRoadB} /><View style={styles.mapRoadC} />
      <View style={[styles.mapPin, styles.driverPin]}><Icon name="local-shipping" size={16} color={white} /></View>
      <View style={[styles.mapPin, styles.pickupPin]}><Icon name="person-pin-circle" size={22} color={red} /></View>
      <View style={[styles.mapPin, styles.hospitalPin]}><Icon name="local-hospital" size={20} color={teal} /></View>
      <View style={styles.routeLineOne} /><View style={styles.routeLineTwo} />
      <View style={styles.mapBottomChip}><Text style={styles.mapBottomMain}>2.8 km</Text><Text style={styles.mapBottomSub}>to CityCare Emergency Centre</Text></View>
    </View>
  );
}

function DashboardScreen({ onOpenRequest, onOpenHistory, onOpenProfile, online, setOnline, completed }: { onOpenRequest: () => void; onOpenHistory: () => void; onOpenProfile: () => void; online: boolean; setOnline: (value: boolean) => void; completed: boolean }) {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Header title="Ambulance Captain" right={<Pressable onPress={onOpenProfile} style={styles.avatar}><Text style={styles.avatarText}>RK</Text></Pressable>} />
      <View style={styles.greeting}><View><Text style={styles.eyebrow}>TUESDAY · 08:42 AM</Text><Text style={styles.pageTitle}>Good morning, Ravi</Text><Text style={styles.muted}>Ready to keep your city moving?</Text></View><View style={[styles.onlineDot, online ? styles.onlineDotOn : styles.onlineDotOff]} /></View>
      {completed ? <View style={styles.successBanner}><Icon name="check-circle" color={teal} size={20} /><View><Text style={styles.successTitle}>Trip completed successfully</Text><Text style={styles.successText}>₹680 collected · Receipt #AC-1048</Text></View></View> : null}
      <View style={styles.statusCard}><View><Text style={styles.cardKicker}>DRIVER STATUS</Text><Text style={styles.statusTitle}>{online ? "You are online" : "You are offline"}</Text><Text style={styles.muted}>{online ? "You can receive nearby requests" : "Go online to receive requests"}</Text></View><Pressable onPress={() => setOnline(!online)} style={[styles.toggle, online && styles.toggleOn]}><View style={[styles.toggleKnob, online && styles.toggleKnobOn]} /></Pressable></View>
      {online ? <Pressable onPress={onOpenRequest} style={({ pressed }) => [styles.requestCard, pressed && styles.pressed]}><View style={styles.requestTop}><View style={styles.urgentBadge}><Icon name="priority-high" size={14} color={white} /><Text style={styles.urgentText}>NEW REQUEST</Text></View><Text style={styles.requestTime}>12 sec ago</Text></View><Text style={styles.requestTitle}>Pickup near Indiranagar Metro</Text><Text style={styles.muted}>Patient transfer · 3.2 km away</Text><View style={styles.requestMetaRow}><View><Text style={styles.metaLabel}>EST. FARE</Text><Text style={styles.metaValue}>₹680</Text></View><View><Text style={styles.metaLabel}>PAYMENT</Text><Text style={styles.metaValue}>UPI</Text></View><View><Text style={styles.metaLabel}>URGENCY</Text><Text style={[styles.metaValue, { color: red }]}>High</Text></View><Icon name="chevron-right" color={red} size={25} /></View></Pressable> : <View style={styles.emptyCard}><Icon name="sensors-off" color={slate} size={28} /><Text style={styles.emptyTitle}>You are not receiving requests</Text><Text style={styles.mutedCenter}>Switch your status online when you are ready for dispatch.</Text></View>}
      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Today at a glance</Text><Pressable onPress={onOpenHistory}><Text style={styles.linkText}>View history</Text></Pressable></View>
      <View style={styles.statsGrid}><View style={styles.statCard}><Icon name="local-shipping" color={teal} /><Text style={styles.statValue}>6</Text><Text style={styles.statLabel}>Trips completed</Text></View><View style={styles.statCard}><Icon name="payments" color={amber} /><Text style={styles.statValue}>₹4,260</Text><Text style={styles.statLabel}>Today&apos;s earnings</Text></View><View style={styles.statCard}><Icon name="timer" color={navy} /><Text style={styles.statValue}>4h 18m</Text><Text style={styles.statLabel}>Online time</Text></View><View style={styles.statCard}><Icon name="star" color={amber} /><Text style={styles.statValue}>4.9</Text><Text style={styles.statLabel}>Driver rating</Text></View></View>
      <View style={styles.tipCard}><View style={styles.tipIcon}><Icon name="lightbulb" color={amber} /></View><View style={{ flex: 1 }}><Text style={styles.tipTitle}>Safety check</Text><Text style={styles.muted}>Your ambulance documents and emergency kit are up to date.</Text></View><Icon name="chevron-right" color={slate} /> </View>
    </ScrollView>
  );
}

function RequestScreen({ onBack, onStartTrip }: { onBack: () => void; onStartTrip: () => void }) {
  const [otp, setOtp] = useState("");
  const [accepted, setAccepted] = useState(false);
  const valid = otp === "4826";
  return <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><Header title="Request details" onBack={onBack} right={<View style={styles.headerPill}><Text style={styles.headerPillText}>AC-1048</Text></View>} /><View style={styles.urgentHeader}><View style={styles.urgentBadge}><Icon name="priority-high" size={14} color={white} /><Text style={styles.urgentText}>HIGH PRIORITY</Text></View><Text style={styles.urgentHeaderText}>Passenger pickup</Text></View><Text style={styles.pageTitle}>Indiranagar Metro Station</Text><Text style={styles.muted}>12th Main Road, Bengaluru · 3.2 km away</Text><MapPanel compact /><View style={styles.detailGrid}><View style={styles.detailItem}><Text style={styles.metaLabel}>PATIENT</Text><Text style={styles.detailValue}>Aarav Mehta</Text></View><View style={styles.detailItem}><Text style={styles.metaLabel}>CONTACT</Text><Text style={styles.detailValue}>+91 98••• 2041</Text></View><View style={styles.detailItem}><Text style={styles.metaLabel}>AMBULANCE</Text><Text style={styles.detailValue}>Basic Life Support</Text></View><View style={styles.detailItem}><Text style={styles.metaLabel}>PAYMENT</Text><Text style={styles.detailValue}>UPI · ₹680 est.</Text></View></View><View style={styles.noteCard}><Icon name="info-outline" color={navy} /><Text style={styles.noteText}>Requester says the patient is conscious and needs transfer to an emergency department.</Text></View>{accepted ? <View style={styles.otpCard}><Text style={styles.sectionTitle}>Verify passenger OTP</Text><Text style={styles.muted}>Ask the passenger for the 4-digit code shown in their app.</Text><TextInput value={otp} onChangeText={(value) => setOtp(value.replace(/[^0-9]/g, "").slice(0, 4))} keyboardType="number-pad" maxLength={4} placeholder="••••" placeholderTextColor="#9FB3C8" style={styles.otpInput} /><Text style={styles.demoHint}>Demo OTP: 4826</Text>{valid ? <Text style={styles.validText}>OTP verified. You can start the trip.</Text> : null}<ActionButton label="Start trip" icon="play-arrow" onPress={valid ? onStartTrip : () => setOtp("")} tone={valid ? "primary" : "soft"} /></View> : <View style={styles.acceptPanel}><Text style={styles.sectionTitle}>Ready to accept this request?</Text><Text style={styles.muted}>Review the pickup details, then accept to begin passenger verification.</Text><ActionButton label="Accept request" icon="check" onPress={() => setAccepted(true)} /><ActionButton label="Decline request" icon="close" onPress={onBack} tone="outline" /></View>}</ScrollView>;
}

function TripScreen({ onHospitals, onPayment }: { onHospitals: () => void; onPayment: () => void }) {
  return <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><Header title="Active trip" right={<View style={styles.activePill}><View style={styles.pulseDot} /><Text style={styles.activePillText}>EN ROUTE</Text></View>} /><View style={styles.tripHero}><Text style={styles.eyebrow}>TRIP AC-1048</Text><Text style={styles.pageTitle}>Taking Aarav to emergency care</Text><Text style={styles.muted}>Pickup verified · 08:48 AM</Text></View><MapPanel /><View style={styles.etaRow}><View><Text style={styles.metaLabel}>ARRIVING IN</Text><Text style={styles.etaValue}>09 min</Text></View><View><Text style={styles.metaLabel}>DISTANCE</Text><Text style={styles.etaValue}>2.8 km</Text></View><View style={styles.trafficBox}><Icon name="traffic" color={teal} size={18} /><Text style={styles.trafficText}>Light traffic</Text></View></View><View style={styles.actionStack}><ActionButton label="Find nearby hospitals" icon="local-hospital" onPress={onHospitals} /><ActionButton label="Mark as arrived" icon="place" onPress={onPayment} tone="soft" /></View><View style={styles.emergencyBar}><Icon name="call" color={red} /><View style={{ flex: 1 }}><Text style={styles.emergencyTitle}>Emergency contact</Text><Text style={styles.muted}>Call dispatcher if the condition changes.</Text></View><Text style={styles.callText}>Call</Text></View></ScrollView>;
}

function HospitalScreen({ onBack, onRoutes }: { onBack: () => void; onRoutes: () => void }) {
  return <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><Header title="Nearby hospitals" onBack={onBack} right={<View style={styles.headerPill}><Text style={styles.headerPillText}>3 options</Text></View>} /><Text style={styles.pageTitle}>Choose the best destination</Text><Text style={styles.muted}>Sorted by emergency readiness and arrival time</Text><View style={styles.filterRow}><View style={styles.filterActive}><Text style={styles.filterActiveText}>Emergency ready</Text></View><View style={styles.filter}><Text style={styles.filterText}>Highest rated</Text></View><View style={styles.filter}><Text style={styles.filterText}>Nearest</Text></View></View>{hospitals.map((hospital, index) => <View key={hospital.name} style={[styles.hospitalCard, index === 0 && styles.hospitalCardSelected]}><View style={styles.hospitalTop}><View style={styles.hospitalIcon}><Icon name="local-hospital" color={index === 0 ? white : teal} /></View><View style={{ flex: 1 }}><Text style={styles.hospitalName}>{hospital.name}</Text><View style={styles.ratingRow}><Icon name="star" size={15} color={amber} /><Text style={styles.ratingText}>{hospital.rating} ({hospital.reviews})</Text><Text style={styles.dotSep}>·</Text><Text style={styles.distanceText}>{hospital.distance}</Text></View></View><Text style={styles.hospitalEta}>{hospital.eta}</Text></View><View style={styles.tagRow}>{hospital.tags.map((tag) => <View key={tag} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>)}</View><Text style={styles.hospitalRoute}>{hospital.route}</Text>{index === 0 ? <ActionButton label="Compare routes" icon="alt-route" onPress={onRoutes} /> : <Pressable onPress={onRoutes} style={styles.textAction}><Text style={styles.linkText}>View reviews and routes</Text><Icon name="chevron-right" color={teal} size={19} /></Pressable>}</View>)}</ScrollView>;
}

function RoutesScreen({ onBack, onSelect }: { onBack: () => void; onSelect: () => void }) {
  const [selected, setSelected] = useState(0);
  return <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><Header title="Compare routes" onBack={onBack} right={<View style={styles.headerPill}><Text style={styles.headerPillText}>CityCare ER</Text></View>} /><Text style={styles.pageTitle}>Select a route</Text><Text style={styles.muted}>All routes lead to CityCare Emergency Centre</Text><View style={styles.routeMap}><View style={styles.routeGridLineOne} /><View style={styles.routeGridLineTwo} /><View style={styles.routePathOne} /><View style={styles.routePathTwo} /><View style={styles.routePathThree} /><View style={styles.routeStart}><Icon name="local-shipping" color={white} size={15} /></View><View style={styles.routeEnd}><Icon name="local-hospital" color={white} size={16} /></View></View>{routes.map((route, index) => <Pressable key={route.label} onPress={() => setSelected(index)} style={[styles.routeCard, selected === index && styles.routeCardSelected]}><View style={[styles.radio, selected === index && { borderColor: route.color }]}>{selected === index ? <View style={[styles.radioDot, { backgroundColor: route.color }]} /> : null}</View><View style={{ flex: 1 }}><View style={styles.routeTitleRow}><Text style={styles.routeLabel}>{route.label}</Text>{index === 0 ? <View style={styles.bestBadge}><Text style={styles.bestBadgeText}>BEST FOR PATIENT</Text></View> : null}</View><Text style={styles.routeNote}>{route.note}</Text><View style={styles.routeMeta}><Text style={styles.routeTime}>{route.time}</Text><Text style={styles.dotSep}>·</Text><Text style={styles.routeNote}>{route.distance}</Text><Text style={styles.dotSep}>·</Text><Text style={[styles.routeNote, { color: route.color }]}>{route.traffic}</Text></View></View></Pressable>)}<ActionButton label="Use selected route" icon="navigation" onPress={onSelect} /></ScrollView>;
}

function PaymentScreen({ onComplete }: { onComplete: () => void }) {
  return <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><Header title="Trip payment" right={<View style={styles.activePill}><Text style={styles.activePillText}>ARRIVED</Text></View>} /><View style={styles.paymentHero}><View style={styles.paymentIcon}><Icon name="check" color={white} size={30} /></View><Text style={styles.pageTitle}>Patient arrived safely</Text><Text style={styles.muted}>CityCare Emergency Centre · 08:57 AM</Text></View><View style={styles.fareCard}><View style={styles.fareRow}><Text style={styles.muted}>Base fare</Text><Text style={styles.fareValue}>₹520</Text></View><View style={styles.fareRow}><Text style={styles.muted}>Distance charge</Text><Text style={styles.fareValue}>₹120</Text></View><View style={styles.fareRow}><Text style={styles.muted}>Emergency care fee</Text><Text style={styles.fareValue}>₹40</Text></View><View style={styles.divider} /><View style={styles.fareRow}><Text style={styles.totalLabel}>Total collected</Text><Text style={styles.totalValue}>₹680</Text></View></View><View style={styles.paymentStatus}><Icon name="account-balance-wallet" color={teal} /><View style={{ flex: 1 }}><Text style={styles.paymentStatusTitle}>UPI payment pending</Text><Text style={styles.muted}>Ask the requester to complete payment in their app.</Text></View><Text style={styles.pendingText}>Pending</Text></View><ActionButton label="Confirm payment & complete" icon="check-circle" onPress={onComplete} /><Text style={styles.receiptHint}>A digital receipt will be created after confirmation.</Text></ScrollView>;
}

function HistoryScreen({ onBack }: { onBack: () => void }) {
  return <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><Header title="Trip history" onBack={onBack} /><Text style={styles.pageTitle}>Your completed trips</Text><Text style={styles.muted}>Tuesday, 18 August 2026</Text>{[{ name: "CityCare Emergency Centre", time: "08:12 AM", fare: "₹680", status: "Paid" }, { name: "St. Mary's Multispeciality", time: "06:48 AM", fare: "₹540", status: "Paid" }, { name: "Northside General Hospital", time: "Yesterday, 09:34 PM", fare: "₹720", status: "Paid" }].map((trip) => <View key={trip.time} style={styles.historyCard}><View style={styles.historyIcon}><Icon name="local-hospital" color={teal} size={20} /></View><View style={{ flex: 1 }}><Text style={styles.historyName}>{trip.name}</Text><Text style={styles.muted}>{trip.time} · Trip AC-{trip.time.includes("08:12") ? "1047" : "1046"}</Text></View><View style={styles.historyRight}><Text style={styles.historyFare}>{trip.fare}</Text><Text style={styles.paidText}>{trip.status}</Text></View></View>)}</ScrollView>;
}

function ProfileScreen({ onBack }: { onBack: () => void }) {
  return <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><Header title="Driver profile" onBack={onBack} /><View style={styles.profileCard}><View style={styles.profileAvatar}><Text style={styles.profileAvatarText}>RK</Text></View><View><Text style={styles.profileName}>Ravi Kumar</Text><Text style={styles.muted}>Captain since March 2024</Text><View style={styles.ratingRow}><Icon name="star" size={15} color={amber} /><Text style={styles.ratingText}>4.9 driver rating</Text></View></View></View><View style={styles.settingsList}>{[{ icon: "local-shipping", label: "Ambulance details", value: "KA 05 MN 4821" }, { icon: "verified-user", label: "Verification status", value: "Verified" }, { icon: "notifications-none", label: "Notifications", value: "On" }, { icon: "help-outline", label: "Help & support", value: "" }].map((item) => <View key={item.label} style={styles.settingsRow}><Icon name={item.icon as React.ComponentProps<typeof MaterialIcons>["name"]} color={teal} /><Text style={styles.settingsLabel}>{item.label}</Text><Text style={styles.settingsValue}>{item.value}</Text><Icon name="chevron-right" color="#9FB3C8" size={20} /></View>)}</View></ScrollView>;
}

export default function HomeScreen() {
  const [screen, setScreen] = useState<Screen>("home");
  const [online, setOnline] = useState(true);
  const [completed, setCompleted] = useState(false);
  const title = useMemo(() => screen, [screen]);
  if (title === "request") return <ScreenContainer><RequestScreen onBack={() => setScreen("home")} onStartTrip={() => setScreen("trip")} /></ScreenContainer>;
  if (title === "trip") return <ScreenContainer><TripScreen onHospitals={() => setScreen("hospitals")} onPayment={() => setScreen("payment")} /></ScreenContainer>;
  if (title === "hospitals") return <ScreenContainer><HospitalScreen onBack={() => setScreen("trip")} onRoutes={() => setScreen("routes")} /></ScreenContainer>;
  if (title === "routes") return <ScreenContainer><RoutesScreen onBack={() => setScreen("hospitals")} onSelect={() => setScreen("trip")} /></ScreenContainer>;
  if (title === "payment") return <ScreenContainer><PaymentScreen onComplete={() => { setCompleted(true); setScreen("home"); }} /></ScreenContainer>;
  if (title === "history") return <ScreenContainer><HistoryScreen onBack={() => setScreen("home")} /></ScreenContainer>;
  if (title === "profile") return <ScreenContainer><ProfileScreen onBack={() => setScreen("home")} /></ScreenContainer>;
  return <ScreenContainer><DashboardScreen online={online} setOnline={setOnline} completed={completed} onOpenRequest={() => setScreen("request")} onOpenHistory={() => setScreen("history")} onOpenProfile={() => setScreen("profile")} /></ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 34, gap: 16, width: "100%", maxWidth: 1180, alignSelf: "center" },
  headerRow: { minHeight: 42, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  headerSide: { width: 70, alignItems: "flex-start" },
  headerRight: { alignItems: "flex-end" },
  headerTitle: { color: navy, fontSize: 17, fontWeight: "800" },
  brandMark: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: red },
  iconButton: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 18, backgroundColor: sky },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: navy, alignItems: "center", justifyContent: "center" },
  avatarText: { color: white, fontWeight: "800", fontSize: 12 },
  headerPill: { backgroundColor: sky, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
  headerPillText: { color: navy, fontSize: 11, fontWeight: "800" },
  activePill: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#D9F3EF", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
  activePillText: { color: teal, fontSize: 10, fontWeight: "900", letterSpacing: 0.6 },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: teal },
  greeting: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginTop: 4 },
  eyebrow: { color: slate, fontSize: 10, fontWeight: "900", letterSpacing: 1.1, marginBottom: 6 },
  pageTitle: { color: navy, fontSize: 26, lineHeight: 31, fontWeight: "900", letterSpacing: -0.4 },
  muted: { color: slate, fontSize: 13, lineHeight: 19 },
  onlineDot: { width: 12, height: 12, borderRadius: 6, marginTop: 7 },
  onlineDotOn: { backgroundColor: teal },
  onlineDotOff: { backgroundColor: "#9FB3C8" },
  statusCard: { backgroundColor: navy, borderRadius: 18, padding: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardKicker: { color: "#9FB3C8", fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  statusTitle: { color: white, fontSize: 18, fontWeight: "800", marginTop: 4, marginBottom: 2 },
  toggle: { width: 52, height: 32, borderRadius: 20, backgroundColor: "#52606D", padding: 3, justifyContent: "center" },
  toggleOn: { backgroundColor: teal },
  toggleKnob: { width: 26, height: 26, borderRadius: 13, backgroundColor: white },
  toggleKnobOn: { alignSelf: "flex-end" },
  requestCard: { backgroundColor: white, borderRadius: 18, borderWidth: 1, borderColor: "#F2B8B5", padding: 17, shadowColor: navy, shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 2 },
  requestTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  urgentBadge: { backgroundColor: red, borderRadius: 7, paddingHorizontal: 8, paddingVertical: 5, flexDirection: "row", alignItems: "center", gap: 4 },
  urgentText: { color: white, fontSize: 10, fontWeight: "900", letterSpacing: 0.6 },
  requestTime: { color: slate, fontSize: 11 },
  requestTitle: { color: navy, fontSize: 18, fontWeight: "900", marginBottom: 3 },
  requestMetaRow: { borderTopWidth: 1, borderTopColor: border, marginTop: 16, paddingTop: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  metaLabel: { color: slate, fontSize: 9, fontWeight: "900", letterSpacing: 0.7, marginBottom: 4 },
  metaValue: { color: navy, fontSize: 14, fontWeight: "800" },
  emptyCard: { alignItems: "center", backgroundColor: sky, borderRadius: 18, padding: 26, gap: 7 },
  emptyTitle: { color: navy, fontWeight: "800", fontSize: 16 },
  mutedCenter: { color: slate, fontSize: 13, lineHeight: 19, textAlign: "center", maxWidth: 260 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  sectionTitle: { color: navy, fontSize: 16, fontWeight: "900" },
  linkText: { color: teal, fontSize: 13, fontWeight: "800" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, width: "100%" },
  statCard: { flex: 1, minWidth: 210, backgroundColor: white, borderRadius: 15, borderWidth: 1, borderColor: border, padding: 14, gap: 7 },
  statValue: { color: navy, fontSize: 21, fontWeight: "900" },
  statLabel: { color: slate, fontSize: 11 },
  tipCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#FFF8E7", padding: 14, borderRadius: 15 },
  tipIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: "#FFE8A3", alignItems: "center", justifyContent: "center" },
  tipTitle: { color: navy, fontSize: 13, fontWeight: "900", marginBottom: 2 },
  successBanner: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#D9F3EF", borderRadius: 14, padding: 13 },
  successTitle: { color: teal, fontWeight: "900", fontSize: 13 },
  successText: { color: teal, fontSize: 12, marginTop: 2 },
  urgentHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  urgentHeaderText: { color: slate, fontSize: 13, fontWeight: "700" },
  mapPanel: { height: 230, width: "100%", maxWidth: 900, alignSelf: "center", backgroundColor: sky, borderRadius: 20, overflow: "hidden", position: "relative", borderWidth: 1, borderColor: "#C9DCE5" },
  compactMap: { height: 180, marginTop: 6 },
  mapLabel: { position: "absolute", left: 12, top: 12, flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.9)", paddingHorizontal: 9, paddingVertical: 6, borderRadius: 12, zIndex: 3 },
  mapLabelText: { color: navy, fontSize: 10, fontWeight: "800" },
  mapRoadA: { position: "absolute", top: 28, left: -40, width: 420, height: 26, backgroundColor: "#FFFFFF", transform: [{ rotate: "22deg" }] },
  mapRoadB: { position: "absolute", top: 100, left: -30, width: 420, height: 20, backgroundColor: "#FFFFFF", transform: [{ rotate: "-32deg" }] },
  mapRoadC: { position: "absolute", top: 168, left: 42, width: 350, height: 18, backgroundColor: "#FFFFFF", transform: [{ rotate: "14deg" }] },
  routeLineOne: { position: "absolute", width: 190, height: 5, backgroundColor: teal, top: 120, left: 70, transform: [{ rotate: "-29deg" }], borderRadius: 4 },
  routeLineTwo: { position: "absolute", width: 125, height: 5, backgroundColor: teal, top: 89, left: 198, transform: [{ rotate: "40deg" }], borderRadius: 4 },
  mapPin: { position: "absolute", width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", shadowColor: navy, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  driverPin: { backgroundColor: navy, left: 46, top: 138 },
  pickupPin: { left: 175, top: 62, backgroundColor: white },
  hospitalPin: { right: 42, top: 120, backgroundColor: white },
  mapBottomChip: { position: "absolute", bottom: 12, left: 12, right: 12, backgroundColor: "rgba(255,255,255,0.94)", borderRadius: 13, padding: 10, flexDirection: "row", alignItems: "center", gap: 9 },
  mapBottomMain: { color: navy, fontSize: 15, fontWeight: "900" },
  mapBottomSub: { color: slate, fontSize: 11 },
  detailGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, paddingVertical: 2 },
  detailItem: { width: "47%", backgroundColor: sky, borderRadius: 12, padding: 12 },
  detailValue: { color: navy, fontWeight: "800", fontSize: 13 },
  noteCard: { flexDirection: "row", gap: 9, alignItems: "flex-start", backgroundColor: "#F2F6F8", padding: 13, borderRadius: 13 },
  noteText: { flex: 1, color: navy, fontSize: 12, lineHeight: 18 },
  otpCard: { backgroundColor: white, borderWidth: 1, borderColor: border, borderRadius: 16, padding: 16, gap: 8 },
  acceptPanel: { backgroundColor: white, borderWidth: 1, borderColor: border, borderRadius: 16, padding: 16, gap: 10 },
  otpInput: { alignSelf: "flex-start", width: 150, borderBottomWidth: 2, borderBottomColor: teal, color: navy, fontSize: 28, fontWeight: "900", letterSpacing: 10, paddingVertical: 5 },
  demoHint: { color: slate, fontSize: 11 },
  validText: { color: teal, fontSize: 12, fontWeight: "800" },
  actionButton: { minHeight: 52, borderRadius: 15, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 18 },
  primaryButton: { backgroundColor: teal },
  dangerButton: { backgroundColor: red },
  softButton: { backgroundColor: sky },
  outlineButton: { backgroundColor: white, borderWidth: 1, borderColor: border },
  buttonText: { color: white, fontSize: 15, fontWeight: "900" },
  softButtonText: { color: navy, fontSize: 15, fontWeight: "900" },
  outlineButtonText: { color: navy, fontSize: 15, fontWeight: "900" },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
  tripHero: { gap: 2 },
  etaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 },
  etaValue: { color: navy, fontSize: 20, fontWeight: "900" },
  trafficBox: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#D9F3EF", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
  trafficText: { color: teal, fontSize: 11, fontWeight: "800" },
  actionStack: { gap: 10 },
  emergencyBar: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: "#F2B8B5", borderRadius: 14, padding: 13, backgroundColor: "#FFF7F6" },
  emergencyTitle: { color: navy, fontSize: 13, fontWeight: "900" },
  callText: { color: red, fontWeight: "900" },
  filterRow: { flexDirection: "row", gap: 8, marginTop: 2 },
  filter: { borderWidth: 1, borderColor: border, borderRadius: 20, paddingHorizontal: 11, paddingVertical: 8 },
  filterActive: { backgroundColor: navy, borderRadius: 20, paddingHorizontal: 11, paddingVertical: 8 },
  filterText: { color: slate, fontSize: 11, fontWeight: "800" },
  filterActiveText: { color: white, fontSize: 11, fontWeight: "800" },
  hospitalCard: { backgroundColor: white, borderRadius: 17, borderWidth: 1, borderColor: border, padding: 15, gap: 11 },
  hospitalCardSelected: { borderColor: teal, borderWidth: 1.5 },
  hospitalTop: { flexDirection: "row", alignItems: "center", gap: 11 },
  hospitalIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: "#D9F3EF", alignItems: "center", justifyContent: "center" },
  hospitalName: { color: navy, fontSize: 15, fontWeight: "900", marginBottom: 4 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { color: slate, fontSize: 11, fontWeight: "700" },
  dotSep: { color: "#9FB3C8", paddingHorizontal: 2 },
  distanceText: { color: slate, fontSize: 11 },
  hospitalEta: { color: teal, fontSize: 17, fontWeight: "900" },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: { backgroundColor: sky, borderRadius: 7, paddingHorizontal: 8, paddingVertical: 5 },
  tagText: { color: navy, fontSize: 10, fontWeight: "800" },
  hospitalRoute: { color: teal, fontSize: 12, fontWeight: "800" },
  textAction: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 2 },
  routeMap: { height: 160, borderRadius: 18, overflow: "hidden", backgroundColor: sky, borderWidth: 1, borderColor: "#C9DCE5", position: "relative" },
  routeGridLineOne: { position: "absolute", left: 40, top: -20, width: 16, height: 220, backgroundColor: white, transform: [{ rotate: "26deg" }] },
  routeGridLineTwo: { position: "absolute", left: 210, top: -20, width: 15, height: 220, backgroundColor: white, transform: [{ rotate: "-18deg" }] },
  routePathOne: { position: "absolute", top: 73, left: 35, width: 245, height: 5, backgroundColor: teal, transform: [{ rotate: "-16deg" }], borderRadius: 5 },
  routePathTwo: { position: "absolute", top: 98, left: 38, width: 230, height: 4, backgroundColor: red, transform: [{ rotate: "-4deg" }], borderRadius: 5 },
  routePathThree: { position: "absolute", top: 94, left: 48, width: 220, height: 4, backgroundColor: amber, transform: [{ rotate: "15deg" }], borderRadius: 5 },
  routeStart: { position: "absolute", left: 22, top: 70, width: 30, height: 30, borderRadius: 15, backgroundColor: navy, alignItems: "center", justifyContent: "center" },
  routeEnd: { position: "absolute", right: 27, top: 52, width: 34, height: 34, borderRadius: 17, backgroundColor: teal, alignItems: "center", justifyContent: "center" },
  routeCard: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 14, borderWidth: 1, borderColor: border, borderRadius: 15, backgroundColor: white },
  routeCardSelected: { borderColor: teal, backgroundColor: "#F5FBFA" },
  radio: { width: 21, height: 21, borderRadius: 11, borderWidth: 2, borderColor: "#9FB3C8", alignItems: "center", justifyContent: "center", marginTop: 1 },
  radioDot: { width: 11, height: 11, borderRadius: 6 },
  routeTitleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  routeLabel: { color: navy, fontSize: 15, fontWeight: "900" },
  bestBadge: { backgroundColor: "#D9F3EF", borderRadius: 5, paddingHorizontal: 5, paddingVertical: 3 },
  bestBadgeText: { color: teal, fontSize: 8, fontWeight: "900" },
  routeNote: { color: slate, fontSize: 11, lineHeight: 17 },
  routeMeta: { flexDirection: "row", alignItems: "center", marginTop: 5, gap: 4 },
  routeTime: { color: navy, fontSize: 13, fontWeight: "900" },
  paymentHero: { alignItems: "center", gap: 4, paddingVertical: 10 },
  paymentIcon: { width: 58, height: 58, borderRadius: 29, backgroundColor: teal, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  fareCard: { backgroundColor: white, borderWidth: 1, borderColor: border, borderRadius: 16, padding: 16, gap: 13 },
  fareRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  fareValue: { color: navy, fontSize: 14, fontWeight: "800" },
  divider: { height: 1, backgroundColor: border },
  totalLabel: { color: navy, fontSize: 15, fontWeight: "900" },
  totalValue: { color: teal, fontSize: 21, fontWeight: "900" },
  paymentStatus: { flexDirection: "row", alignItems: "center", gap: 11, backgroundColor: "#FFF8E7", padding: 14, borderRadius: 14 },
  paymentStatusTitle: { color: navy, fontSize: 13, fontWeight: "900", marginBottom: 2 },
  pendingText: { color: amber, fontSize: 11, fontWeight: "900" },
  receiptHint: { color: slate, fontSize: 11, textAlign: "center" },
  historyCard: { backgroundColor: white, borderWidth: 1, borderColor: border, borderRadius: 15, padding: 13, flexDirection: "row", alignItems: "center", gap: 10 },
  historyIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#D9F3EF", alignItems: "center", justifyContent: "center" },
  historyName: { color: navy, fontSize: 13, fontWeight: "900", marginBottom: 3 },
  historyRight: { alignItems: "flex-end", gap: 3 },
  historyFare: { color: navy, fontSize: 14, fontWeight: "900" },
  paidText: { color: teal, fontSize: 10, fontWeight: "900" },
  profileCard: { backgroundColor: navy, borderRadius: 18, padding: 18, flexDirection: "row", alignItems: "center", gap: 13 },
  profileAvatar: { width: 58, height: 58, borderRadius: 29, backgroundColor: "#2E5A7A", alignItems: "center", justifyContent: "center" },
  profileAvatarText: { color: white, fontSize: 18, fontWeight: "900" },
  profileName: { color: white, fontSize: 19, fontWeight: "900", marginBottom: 3 },
  settingsList: { backgroundColor: white, borderRadius: 16, borderWidth: 1, borderColor: border, overflow: "hidden" },
  settingsRow: { minHeight: 58, flexDirection: "row", alignItems: "center", gap: 11, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: border },
  settingsLabel: { color: navy, fontSize: 13, fontWeight: "800", flex: 1 },
  settingsValue: { color: slate, fontSize: 12 },
});
