import type {
  SafetyKpis, SOSAlert, DeviationAlert, IncidentRow,
  SOSResponseData, SOSIncidentDetail, RouteDeviationDetail,
} from "../types/safety.types";

export const MOCK_KPIS: SafetyKpis = {
  activeSOS: 1,
  investigating: 2,
  resolvedLast30: 4,
  totalIncidents: 8,
};

export const MOCK_SOS_ALERTS: SOSAlert[] = [
  {
    id: "SOS001",
    passenger: "Sarah Johnson",
    driver: "Michael Okonkwo",
    location: "Victoria Island, Lagos",
    gps: "6.4281, 3.4219",
    rideId: "RIDE2847",
    tripId: "RIDE2847",
    status: "active",
    triggeredAt: "2025-01-15T14:42:00.000Z",
    minutesAgo: 2,
    emergencyContacts: 2,
  },
  {
    id: "SOS002",
    passenger: "Amara Nwankwo",
    driver: "David Mensah",
    location: "Lekki Phase I, Lagos",
    gps: "6.4698, 3.5852",
    rideId: "RIDE2901",
    tripId: "RIDE2901",
    status: "responding",
    triggeredAt: "2025-01-15T14:24:00.000Z",
    minutesAgo: 18,
    emergencyContacts: 1,
  },
];

export const MOCK_DEVIATION_ALERTS: DeviationAlert[] = [
  {
    id: "DEV-1042",
    state: "soft_alert",
    stateLabel: "Soft Alert",
    description: "Route deviation detected — Driver: David Mensah · Passenger: Sarah Johnson",
    location: "Off-route near Ikeja, Lagos",
    tripId: "RIDE2901",
    time: "14:42",
    timer: "00:47",
    passenger: "Sarah Johnson",
    driver: "David Mensah",
    gps: "6.4281, 3.4219",
  },
  {
    id: "DEV-1042b",
    state: "escalated_alert",
    stateLabel: "Escalated",
    description: "Escalated — grace period expired with no dismissal",
    location: "Off-route near Ikeja, Lagos",
    tripId: "RIDE2901",
    time: "14:44",
    timer: "00:38",
    passenger: "Sarah Johnson",
    driver: "David Mensah",
    gps: "6.4281, 3.4219",
  },
  {
    id: "SOS001",
    state: "sos_active",
    stateLabel: "Active SOS",
    description: "Auto-escalated from route deviation — Driver: David Mensah",
    location: "Ikeja, Lagos",
    tripId: "RIDE2901",
    time: "14:46",
    passenger: "Sarah Johnson",
    driver: "David Mensah",
    gps: "6.4281, 3.4219",
  },
];

export const MOCK_INCIDENTS: IncidentRow[] = [
  { id: "INC001", type: "sos",             rideId: "RIDE2801", passenger: "James Adeyemi",  driver: "Chidi Okonjo",    location: "Ikeja, Lagos",      dateTime: "2025-06-30 08:32 AM", severity: "high",   status: "resolved"     },
  { id: "INC002", type: "harassment",      rideId: "RIDE2745", passenger: "Fatima Aliyu",   driver: "Emeka Nwosu",     location: "Garki, Abuja",      dateTime: "2025-06-29 07:15 PM", severity: "medium", status: "investigating" },
  { id: "INC003", type: "accident",        rideId: "RIDE2712", passenger: "Bola Adunola",   driver: "Seun Alade",      location: "Port Harcourt",     dateTime: "2025-06-28 03:45 PM", severity: "high",   status: "resolved"     },
  { id: "INC004", type: "route_deviation", rideId: "RIDE2690", passenger: "Ngozi Obi",      driver: "Tunde Bakare",    location: "Surulere, Lagos",   dateTime: "2025-06-28 11:20 AM", severity: "low",    status: "resolved"     },
  { id: "INC005", type: "sos",             rideId: "RIDE2651", passenger: "Kemi Fashola",   driver: "Gbenga Oluwole",  location: "Wuse 2, Abuja",     dateTime: "2025-06-27 09:55 PM", severity: "high",   status: "closed"       },
  { id: "INC006", type: "accident",        rideId: "RIDE2620", passenger: "Chioma Eze",     driver: "Rotimi Afolabi",  location: "Ikeja GRA, Lagos",  dateTime: "2025-06-25 05:30 PM", severity: "medium", status: "closed"       },
  { id: "INC007", type: "harassment",      rideId: "RIDE2599", passenger: "Chioma Eze",     driver: "Rotimi Afolabi",  location: "Ikeja GRA, Lagos",  dateTime: "2025-06-25 05:30 PM", severity: "medium", status: "closed"       },
  { id: "INC008", type: "theft",           rideId: "RIDE2620", passenger: "Yusuf Adamu",    driver: "Biodun Ogundimu", location: "Maitama, Abuja",    dateTime: "2025-06-26 02:30 PM", severity: "high",   status: "investigating" },
];

export const MOCK_INCIDENT_DETAILS: Record<string, {
  id: string; rideId: string; type: string; status: string;
  passenger: string; driver: string; location: string;
  dateTime: string; description: string;
}> = {
  INC001: { id: "INC001", rideId: "RIDE2801", type: "sos",        status: "resolved",     passenger: "James Adeyemi", driver: "Chidi Okonjo",   location: "Ikeja, Lagos",    dateTime: "2025-06-30 · 08:32 AM", description: "Passenger triggered SOS during ride. Police notified. Resolved safely." },
  INC002: { id: "INC002", rideId: "RIDE2745", type: "harassment", status: "investigating", passenger: "Fatima Aliyu",  driver: "Emeka Nwosu",    location: "Garki, Abuja",   dateTime: "2025-06-29 · 07:15 PM", description: "Passenger reported verbal harassment by driver." },
  INC004: { id: "INC004", rideId: "RIDE2690", type: "route_deviation", status: "resolved", passenger: "Ngozi Obi",   driver: "Tunde Bakare",   location: "Surulere, Lagos", dateTime: "2025-06-28 · 11:20 AM", description: "Driver took an unexpected route. Passenger reported concern. Resolved." },
  INC005: { id: "INC005", rideId: "RIDE2651", type: "sos",        status: "closed",       passenger: "Kemi Fashola",  driver: "Gbenga Oluwole", location: "Wuse 2, Abuja",  dateTime: "2025-06-27 · 09:55 PM", description: "Passenger activated SOS. False alarm — passenger confirmed safety." },
};

export const MOCK_SOS_RESPONSE: SOSResponseData = {
  sosId: "SOS001",
  passenger: "Sarah Johnson",
  driver: "Michael Okonkwo",
  tripId: "RIDE2847",
  route: "Victoria Island → Lekki Phase I",
  gps: "6.4281, 3.4219",
  triggeredAt: "2025-01-15 · 14:42",
  emergencyContacts: [
    { name: "John Johnson", relation: "Spouse", phone: "+234 802 000 1111" },
    { name: "Mary Johnson", relation: "Sister", phone: "+234 802 000 2222" },
  ],
  escalation: {
    type: "Police / Emergency Services",
    status: "INITIATING",
    note: "Escalation began automatically on Respond — running in parallel with the call.",
  },
};

export const MOCK_SOS_INCIDENT_DETAIL: SOSIncidentDetail = {
  sosId: "SOS000",
  triggeredBy: "John Akpan (passenger)",
  driver: "Chioma Eze",
  tripId: "RIDE2840",
  time: "14 Jan 2024, 19:10",
  lastLocation: "GRA, Port Harcourt",
  status: "resolved",
  emergencyContactsNotified: [
    { name: "Ngozi Akpan", relation: "Wife", phone: "+234 803 555 0110", notifiedAt: "19:10:05" },
  ],
  resolution: {
    resolvedBy: "Ops — Adaeze N.",
    resolvedAt: "14 Jan 2024, 19:32",
    note: "Passenger confirmed safe by phone. Driver completed the trip without further incident; no dispatch to security partner was required.",
  },
  investigationNotes: ["Ops review — driver cleared, no policy breach. 14 Jan 2024, 19:40"],
  auditTrail: [
    { event: "SOS triggered",              actor: "passenger",       time: "19:10:00" },
    { event: "Emergency contacts notified", actor: "system",          time: "19:10:05" },
    { event: "Marked resolved — passenger safe", actor: "Ops · Adaeze N.", time: "19:32" },
  ],
};

export const MOCK_ROUTE_DEVIATION: RouteDeviationDetail = {
  devId: "DEV-0428",
  driver: "David Mensah",
  tripId: "RIDE2855",
  route: "Ojuelegba → Murtala Muhammed Airport",
  state: "escalated_alert",
  confidence: "High",
  distanceOffRoute: "210 m",
  progressToDestination: "Moving away",
  consecutiveBreaches: "5 of 6 pings",
  corridorStatus: "Outside all 3 routes",
  rerouteCheck: "Not explanatory",
  driverResponse: { sentAt: "14:41:30", elapsed: "47s elapsed", hasResponse: false },
  escalationSteps: [
    { label: "ON_ROUTE",        active: false },
    { label: "SOFT_ALERT",      active: false },
    { label: "ESCALATED_ALERT", active: true  },
    { label: "SOS_ACTIVE",      active: false },
  ],
  responseActions: [
    { label: "Notify passenger",       status: "Done · 14:41:35" },
    { label: "Dispatch security partner", action: "Dispatch", color: "teal" },
    { label: "Place 112 call (ops)",   action: "Call 112",  color: "red"  },
  ],
  auditTrail: [
    { event: "Soft alert raised",         actor: "engine · 210 m off, 4/6 breaches", time: "14:40:10" },
    { event: "Driver prompted in-app",    actor: "engine · 14:41:30",                time: "14:41:30" },
    { event: "Escalated — no response",   actor: "engine · progress worsening",      time: "14:41:30" },
    { event: "Passenger notified",        actor: "system",                           time: "14:41:35" },
  ],
};

export const MOCK_SAFETY_INCIDENTS_QUEUE = [
  {
    id: "SOS001", type: "sos", status: "active",
    title: "Triggered by Sarah Johnson (passenger) · Driver: David Mensah",
    location: "Ikeja, Lagos", tripId: "RIDE2855", time: "15 Jan 2024, 14:42",
    badge: "SOS_ACTIVE", emergencyContacts: 2,
  },
  {
    id: "SOS000", type: "sos", status: "resolved",
    title: "Triggered by John Akpan (passenger) · Driver: Chioma Eze",
    location: "GRA, Port Harcourt", tripId: "RIDE2840", time: "14 Jan 2024, 19:10",
    badge: "RESOLVED", emergencyContacts: 1,
  },
  {
    id: "DEV-0428", type: "deviation", status: "active",
    title: "Route deviation · Driver: David Mensah · 210 m off nearest route",
    location: "Ojuelegba → Airport", tripId: "RIDE2855", time: "15 Jan 2024, 14:41",
    badge: "ESCALATED_ALERT", autoSosIn: "43s",
  },
];