export type DisasterType = 'flood' | 'cyclone' | 'earthquake' | 'heatwave' | 'landslide' | 'all';

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';

export interface DistrictZone {
  id: string;
  district: string;
  state: string;
  coordinates: [number, number]; // [lat, lng]
  riskLevel: RiskLevel;
  primaryRisk: DisasterType;
  secondaryRisks: DisasterType[];
  populationExposed: string;
  advisoryText: string;
  historicalNote: string;
  riskScore?: number;
}

export type HelpCategory = 'Trapped' | 'Medical' | 'Food & Water' | 'Evacuation' | 'Elderly / Child Assistance';

export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM';

export interface HelpRequest {
  id: string;
  name: string;
  phone: string;
  coordinates: [number, number];
  locationName: string;
  category: HelpCategory;
  urgency: UrgencyLevel;
  peopleCount: number;
  note: string;
  photoUrl?: string;
  timestamp: string;
  status: 'PENDING' | 'DISPATCHED' | 'RESOLVED';
  incidentId?: string;
}

export interface SafeCheckin {
  id: string;
  name: string;
  phone: string;
  coordinates: [number, number];
  locationName: string;
  message: string;
  timestamp: string;
}

export interface Shelter {
  id: string;
  name: string;
  locationName: string;
  coordinates: [number, number];
  capacity: number;
  currentOccupancy: number;
  facilities: string[];
  contactPerson: string;
  phone: string;
  status: 'OPEN' | 'FULL' | 'PREPARING';
  medicalSupport?: boolean;
  waterAvailable?: boolean;
  foodAvailable?: boolean;
}

export type InfrastructureType =
  | 'Roads & Bridges'
  | 'Electricity & Power'
  | 'Housing & Buildings'
  | 'Water Supply'
  | 'Medical Facility'
  | 'Schools / Public Infra';

export interface DamageReport {
  id: string;
  reporterName: string;
  reporterPhone: string;
  locationName: string;
  coordinates: [number, number];
  infraType: InfrastructureType;
  severity: 1 | 2 | 3 | 4 | 5; // 1 low to 5 catastrophic
  description: string;
  photoUrl?: string;
  timestamp: string;
  verified: boolean;
}

export type ResourceType =
  | 'Food & Rations'
  | 'Drinking Water'
  | 'Medical Kits'
  | 'Blankets & Clothing'
  | 'Rescue Boats / Equipment'
  | 'Generators & Power'
  | 'Baby & Infant Care';

export interface ResourceListing {
  id: string;
  type: 'HAVE' | 'NEED';
  itemCategory: ResourceType;
  title: string;
  quantity: string;
  organization: string;
  contactName: string;
  phone: string;
  locationName: string;
  coordinates: [number, number];
  timestamp: string;
  status: 'OPEN' | 'MATCHED' | 'FULFILLED';
  imageUrl?: string;
}

export interface USGSQuake {
  id: string;
  magnitude: number;
  place: string;
  time: number;
  coordinates: [number, number]; // [lat, lng]
  depthKm: number;
  tsunami: number;
  url: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationOrRole: string;
  phone: string;
  isPrimary?: boolean;
}

export interface ChecklistItem {
  id: string;
  category: 'Water & Food' | 'Medical' | 'Documents & Cash' | 'Safety Tools' | 'Special Needs';
  title: string;
  description: string;
  disasters: DisasterType[];
  forProfiles: ('kids' | 'elderly' | 'pets' | 'general')[];
}

export interface Incident {
  id: string;
  title: string;
  incidentType: string;
  severity: 'NORMAL' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'ESCALATED' | 'RESOLVED' | 'CLOSED';
  priorityScore: number;
  description: string;
  locationName: string;
  coordinates: [number, number];
  peopleAffected: number;
  reportedBy?: string;
  assignedTeamId?: string;
  createdAt: string;
}

export interface ResponseTeam {
  id: string;
  teamName: string;
  teamType: string;
  status: 'AVAILABLE' | 'DEPLOYED' | 'BUSY' | 'OFFLINE';
  membersCount: number;
  coordinates: [number, number];
  currentIncidentId?: string;
}

export interface AlertItem {
  id: string;
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
  alertType: string;
  location: string;
  active: boolean;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}
