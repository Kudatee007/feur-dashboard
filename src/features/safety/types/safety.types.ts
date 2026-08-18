export type SOSStatus = "active" | "responding" | "resolved" | "closed";
export type DeviationState = "on_route" | "soft_alert" | "escalated_alert" | "sos_active";
export type IncidentType = "sos" | "harassment" | "accident" | "route_deviation" | "theft";
export type Severity = "high" | "medium" | "low";
export type IncidentStatus = "investigating" | "resolved" | "closed";

export interface SOSAlert {
  id: string;
  passenger: string;
  passengerAvatar?: string;
  driver: string;
  location: string;
  gps: string;
  rideId: string;
  tripId: string;
  status: SOSStatus;
  triggeredAt: string;
  minutesAgo: number;
  emergencyContacts: number;
}

export interface DeviationAlert {
  id: string;
  state: DeviationState;
  stateLabel: string;
  description: string;
  location: string;
  tripId: string;
  time: string;
  timer?: string;
  passenger: string;
  driver: string;
  gps: string;
}

export interface IncidentRow {
  id: string;
  type: IncidentType;
  rideId: string;
  passenger: string;
  driver: string;
  location: string;
  dateTime: string;
  severity: Severity;
  status: IncidentStatus;
}

export interface IncidentDetail {
  id: string;
  rideId: string;
  type: IncidentType;
  status: IncidentStatus;
  passenger: string;
  driver: string;
  location: string;
  dateTime: string;
  description: string;
}

export interface SafetyKpis {
  activeSOS: number;
  investigating: number;
  resolvedLast30: number;
  totalIncidents: number;
}

// ─── SOS Response page ────────────────────────────────────────────────────────

export interface SOSResponseData {
  sosId: string;
  passenger: string;
  driver: string;
  tripId: string;
  route: string;
  gps: string;
  triggeredAt: string;
  emergencyContacts: { name: string; relation: string; phone: string }[];
  escalation: { type: string; status: string; note: string };
}

// ─── SOS Incident Detail page ─────────────────────────────────────────────────

export interface SOSIncidentDetail {
  sosId: string;
  triggeredBy: string;
  driver: string;
  tripId: string;
  time: string;
  lastLocation: string;
  status: SOSStatus;
  emergencyContactsNotified: { name: string; relation: string; phone: string; notifiedAt: string }[];
  resolution?: { resolvedBy: string; resolvedAt: string; note: string };
  investigationNotes: string[];
  auditTrail: { event: string; actor: string; time: string }[];
}

// ─── Route Deviation Detail page ──────────────────────────────────────────────

export interface RouteDeviationDetail {
  devId: string;
  driver: string;
  tripId: string;
  route: string;
  state: DeviationState;
  confidence: string;
  distanceOffRoute: string;
  progressToDestination: string;
  consecutiveBreaches: string;
  corridorStatus: string;
  rerouteCheck: string;
  driverResponse: { sentAt: string; elapsed: string; hasResponse: boolean };
  escalationSteps: { label: string; active: boolean }[];
  responseActions: { label: string; status?: string; action?: string; color?: string }[];
  auditTrail: { event: string; actor: string; time: string }[];
}