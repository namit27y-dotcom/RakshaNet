import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import {
  DistrictZone,
  DisasterType,
  HelpRequest,
  SafeCheckin,
  Shelter,
  DamageReport,
  ResourceListing,
  USGSQuake,
  EmergencyContact,
  Incident,
  ResponseTeam,
  AlertItem
} from '../types';
import { INDIAN_DISTRICT_ZONES } from '../data/disasterZones';
import {
  INITIAL_HELP_REQUESTS,
  INITIAL_SAFE_CHECKINS,
  INITIAL_SHELTERS,
  INITIAL_DAMAGE_REPORTS,
  INITIAL_RESOURCES
} from '../data/seedData';
import { fetchLiveUSGSQuakes } from '../services/usgsService';
import { supabase } from '../services/supabaseClient';
import { analyzeIncidentWithAi, generateSituationBriefWithAi } from '../services/aiService';
import { fetchWeatherForLocation, WeatherData } from '../services/weatherService';
import { getDamageReports } from '../services/recovery/damageReportService';

const mapDBResourceCategoryToUI = (cat: string): any => {
  switch (cat) {
    case 'food': return 'Food & Rations';
    case 'water': case 'drinking_water': return 'Drinking Water';
    case 'medical': case 'medicine': return 'Medical Kits';
    case 'power': case 'fuel': return 'Generators & Power';
    case 'blankets': case 'clothing': return 'Blankets & Clothing';
    case 'transport': case 'rescue_boats': return 'Rescue Boats / Equipment';
    default: return 'Baby & Infant Care';
  }
};

const mapUIResourceCategoryToDB = (cat: string): string => {
  switch (cat) {
    case 'Food & Rations': return 'food';
    case 'Drinking Water': return 'water';
    case 'Medical Kits': return 'medical';
    case 'Generators & Power': return 'power';
    case 'Blankets & Clothing': return 'clothing';
    case 'Rescue Boats / Equipment': return 'transport';
    default: return 'other';
  }
};

interface AppContextType {
  activeModule: 'before' | 'during' | 'after';
  setActiveModule: (mod: 'before' | 'during' | 'after') => void;

  selectedLocation: DistrictZone;
  setSelectedLocation: (zone: DistrictZone) => void;
  userCoords: [number, number] | null;
  detectUserLocation: () => void;
  isLocating: boolean;

  allDistricts: DistrictZone[];

  // Database Driven Lists
  helpRequests: HelpRequest[];
  safeCheckins: SafeCheckin[];
  shelters: Shelter[];
  damageReports: DamageReport[];
  resources: ResourceListing[];
  usgsQuakes: USGSQuake[];
  emergencyContacts: EmergencyContact[];
  incidents: Incident[];
  responseTeams: ResponseTeam[];
  alerts: AlertItem[];
  currentWeather: WeatherData | null;

  // Filters
  filterDisasterType: DisasterType;
  setFilterDisasterType: (t: DisasterType) => void;
  filterUrgency: string;
  setFilterUrgency: (u: string) => void;
  filterCategory: string;
  setFilterCategory: (c: string) => void;

  // Database Actions
  addHelpRequest: (req: Omit<HelpRequest, 'id' | 'timestamp' | 'status'>) => Promise<void>;
  addSafeCheckin: (chk: Omit<SafeCheckin, 'id' | 'timestamp'>) => Promise<void>;
  addDamageReport: (dmg: Omit<DamageReport, 'id' | 'timestamp' | 'verified'> & { imageFile?: File }) => Promise<void>;
  addResource: (res: Omit<ResourceListing, 'id' | 'timestamp' | 'status'>) => Promise<void>;
  claimResource: (id: string) => Promise<void>;
  updateHelpStatus: (id: string, status: HelpRequest['status']) => Promise<void>;
  addEmergencyContact: (c: Omit<EmergencyContact, 'id'>) => void;
  removeEmergencyContact: (id: string) => void;
  assignTeamToIncident: (teamId: string, incidentId: string) => Promise<void>;

  // AI Situation Briefing
  generateBrief: () => Promise<string>;
  isGeneratingBrief: boolean;

  // Demo simulator
  isDemoSimulating: boolean;
  toggleDemoSimulation: () => void;

  // Notifications Toast & Modals
  activeToast: string | null;
  showToast: (msg: string) => void;
  isSosModalOpen: boolean;
  setIsSosModalOpen: (b: boolean) => void;
  isSafeModalOpen: boolean;
  setIsSafeModalOpen: (b: boolean) => void;

  // Auth additions
  currentUser: User | null;
  currentProfile: any | null;
  userRole: 'citizen' | 'volunteer' | 'ngo' | 'responder' | 'admin';
  signOut: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeModule, setActiveModule] = useState<'before' | 'during' | 'after'>('during');
  const [selectedLocation, setSelectedLocation] = useState<DistrictZone>(INDIAN_DISTRICT_ZONES[0]);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // States initialized from database or seed fallback
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>(INITIAL_HELP_REQUESTS);
  const [safeCheckins, setSafeCheckins] = useState<SafeCheckin[]>(INITIAL_SAFE_CHECKINS);
  const [shelters, setShelters] = useState<Shelter[]>(INITIAL_SHELTERS);
  const [damageReports, setDamageReports] = useState<DamageReport[]>(INITIAL_DAMAGE_REPORTS);
  const [resources, setResources] = useState<ResourceListing[]>(INITIAL_RESOURCES);
  const [usgsQuakes, setUsgsQuakes] = useState<USGSQuake[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [responseTeams, setResponseTeams] = useState<ResponseTeam[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);

  // Auth state variables
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentProfile, setCurrentProfile] = useState<any | null>(null);
  const [userRole, setUserRole] = useState<'citizen' | 'volunteer' | 'ngo' | 'responder' | 'admin'>('citizen');

  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(() => {
    const saved = localStorage.getItem('rakshanet_contacts');
    return saved
      ? JSON.parse(saved)
      : [
          { id: 'c-1', name: 'Papa (Home)', relationOrRole: 'Family', phone: '+91 98100 12345', isPrimary: true },
          { id: 'c-2', name: 'District Emergency Officer', relationOrRole: 'Govt Helplines', phone: '1077', isPrimary: false },
          { id: 'c-3', name: 'NDRF Control Room', relationOrRole: 'National Disaster Force', phone: '1070', isPrimary: false }
        ];
  });

  // Filters
  const [filterDisasterType, setFilterDisasterType] = useState<DisasterType>('all');
  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Toasts & Modals
  const [activeToast, setActiveToast] = useState<string | null>(null);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isSafeModalOpen, setIsSafeModalOpen] = useState(false);

  // Demo simulator mode
  const [isDemoSimulating, setIsDemoSimulating] = useState(false);

  const showToast = (msg: string) => {
    setActiveToast(msg);
    setTimeout(() => {
      setActiveToast(null);
    }, 4500);
  };

  // Helper log audit
  const logAuditAction = async (action: string, entityType: string, entityId?: string, metadata?: any) => {
    try {
      await supabase.from('audit_logs').insert([{ action, entity_type: entityType, entity_id: entityId, metadata }]);
    } catch (_) {}
  };

  // Profile loader helper
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error && data) {
        setCurrentProfile(data);
        setUserRole(data.role);
      } else {
        setUserRole('citizen');
      }
    } catch (_) {
      setUserRole('citizen');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setCurrentProfile(null);
    setUserRole('citizen');
    showToast('🔑 Signed out successfully.');
  };

  // 1. Initial Load from Supabase Database
  const fetchSupabaseData = async () => {
    try {
      // Load SOS Requests
      const { data: sosData } = await supabase
        .from('sos_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (sosData && sosData.length > 0) {
        setHelpRequests(
          sosData.map((d: any) => ({
            id: d.id,
            name: d.name,
            phone: d.phone,
            coordinates: [d.latitude, d.longitude],
            locationName: d.location_name,
            category: d.category,
            urgency: d.urgency,
            peopleCount: d.people_count,
            note: d.note,
            photoUrl: d.photo_url,
            timestamp: new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: d.status,
            incidentId: d.incident_id
          }))
        );
      }

      // Load Safe Checkins
      const { data: safeData } = await supabase.from('safe_checkins').select('*').order('created_at', { ascending: false });
      if (safeData && safeData.length > 0) {
        setSafeCheckins(
          safeData.map((d: any) => ({
            id: d.id,
            name: d.name,
            phone: d.phone,
            coordinates: [d.latitude, d.longitude],
            locationName: d.location_name,
            message: d.message,
            timestamp: new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }))
        );
      }

      // Load Shelters
      const { data: shelterData } = await supabase.from('shelters').select('*');
      if (shelterData && shelterData.length > 0) {
        setShelters(
          shelterData.map((d: any) => ({
            id: d.id,
            name: d.name,
            locationName: d.location_name,
            coordinates: [d.latitude, d.longitude],
            capacity: d.capacity,
            currentOccupancy: d.occupied,
            facilities: d.facilities || [],
            contactPerson: d.contact_person,
            phone: d.phone,
            status: d.status,
            medicalSupport: d.medical_support,
            waterAvailable: d.water_available,
            foodAvailable: d.food_available
          }))
        );
      }

      // Load Damage Reports (from recovery_damage_reports table)
      try {
        const dmg = await getDamageReports();
        if (dmg) {
          setDamageReports(dmg);
        }
      } catch (err) {
        console.warn('Error loading damage reports from Supabase:', err);
      }

      // Load Resources (compiled from ngo_resources and recovery_aid_needs tables)
      try {
        const { data: ngoRes } = await supabase
          .from('ngo_resources')
          .select('*, ngos(organization_name, contact_person, phone, address, latitude, longitude)')
          .order('created_at', { ascending: false });

        const { data: aidNeeds } = await supabase
          .from('recovery_aid_needs')
          .select('*')
          .order('created_at', { ascending: false });

        const haveResources: ResourceListing[] = (ngoRes || []).map((r: any) => ({
          id: r.id,
          type: 'HAVE',
          itemCategory: mapDBResourceCategoryToUI(r.resource_type),
          title: r.item_name,
          quantity: `${r.quantity_available - r.quantity_allocated} ${r.unit}`,
          organization: r.ngos?.organization_name || 'NGO Partner',
          contactName: r.ngos?.contact_person || 'Coordinator',
          phone: r.ngos?.phone || '',
          locationName: r.ngos?.address || 'Relief Center',
          coordinates: [r.ngos?.latitude || 0, r.ngos?.longitude || 0],
          timestamp: new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: (Number(r.quantity_available) - Number(r.quantity_allocated)) <= 0 ? 'FULFILLED' : 'OPEN'
        }));

        const needResources: ResourceListing[] = (aidNeeds || []).map((n: any) => ({
          id: n.id,
          type: 'NEED',
          itemCategory: mapDBResourceCategoryToUI(n.category),
          title: n.item_name,
          quantity: `${Number(n.quantity_required) - Number(n.quantity_fulfilled)} units`,
          organization: 'Community Demand',
          contactName: 'Emergency Desk',
          phone: '+91 1070',
          locationName: n.location || '',
          coordinates: [n.latitude || 0, n.longitude || 0],
          timestamp: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: n.status === 'fulfilled' ? 'FULFILLED' : (n.status === 'partially_fulfilled' ? 'MATCHED' : 'OPEN')
        }));

        setResources([...haveResources, ...needResources]);
      } catch (err) {
        console.warn('Error loading resources from Supabase:', err);
      }

      // Load Incidents
      const { data: incData } = await supabase.from('incidents').select('*').order('created_at', { ascending: false });
      if (incData) {
        setIncidents(
          incData.map((d: any) => ({
            id: d.id,
            title: d.title,
            incidentType: d.incident_type,
            severity: d.severity,
            status: d.status,
            priorityScore: d.priority_score,
            description: d.description,
            locationName: d.location_name,
            coordinates: [d.latitude, d.longitude],
            peopleAffected: d.people_affected,
            reportedBy: d.reported_by,
            assignedTeamId: d.assigned_team_id,
            createdAt: d.created_at
          }))
        );
      }

      // Load Response Teams
      const { data: teamData } = await supabase.from('response_teams').select('*');
      if (teamData) {
        setResponseTeams(
          teamData.map((d: any) => ({
            id: d.id,
            teamName: d.team_name,
            teamType: d.team_type,
            status: d.status,
            membersCount: d.members_count,
            coordinates: [d.latitude, d.longitude],
            currentIncidentId: d.current_incident_id
          }))
        );
      }

      // Load Alerts
      const { data: alertData } = await supabase.from('alerts').select('*').eq('active', true);
      if (alertData) {
        setAlerts(
          alertData.map((d: any) => ({
            id: d.id,
            title: d.title,
            message: d.message,
            severity: d.severity,
            alertType: d.alert_type,
            location: d.location,
            active: d.active,
            createdAt: d.created_at
          }))
        );
      }
    } catch (err) {
      console.warn('Using initial seed data fallback while connecting to Supabase:', err);
    }
  };

  // 2. Set Up Supabase Realtime Channel and Auth Session Listeners
  useEffect(() => {
    // Load initial user session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser(session.user);
        fetchProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setCurrentUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setCurrentUser(null);
        setCurrentProfile(null);
        setUserRole('citizen');
      }
      fetchSupabaseData();
    });

    fetchSupabaseData();

    const channel = supabase
      .channel('public_db_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sos_requests' }, () => {
        fetchSupabaseData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, () => {
        fetchSupabaseData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'response_teams' }, () => {
        fetchSupabaseData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shelters' }, () => {
        fetchSupabaseData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'recovery_damage_reports' }, () => {
        fetchSupabaseData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ngo_resources' }, () => {
        fetchSupabaseData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'recovery_aid_needs' }, () => {
        fetchSupabaseData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'relief_camps' }, () => {
        fetchSupabaseData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      subscription.unsubscribe();
    };
  }, []);

  // Fetch Weather when selected location changes
  useEffect(() => {
    fetchWeatherForLocation(
      selectedLocation.coordinates[0],
      selectedLocation.coordinates[1],
      `${selectedLocation.district}, ${selectedLocation.state}`
    ).then((w) => setCurrentWeather(w));
  }, [selectedLocation]);

  // Fetch USGS Quakes on mount
  useEffect(() => {
    fetchLiveUSGSQuakes().then((quakes) => setUsgsQuakes(quakes));
  }, []);

  // Sync contacts to LocalStorage
  useEffect(() => {
    localStorage.setItem('rakshanet_contacts', JSON.stringify(emergencyContacts));
  }, [emergencyContacts]);

  // Detect Geolocation
  const detectUserLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser. Defaulting to Puri, Odisha.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserCoords(coords);
        setIsLocating(false);
        showToast(`📍 Geolocation locked: ${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`);

        // Find closest district zone
        let minDistance = Infinity;
        let closestZone = INDIAN_DISTRICT_ZONES[0];
        INDIAN_DISTRICT_ZONES.forEach((zone) => {
          const d = Math.hypot(zone.coordinates[0] - coords[0], zone.coordinates[1] - coords[1]);
          if (d < minDistance) {
            minDistance = d;
            closestZone = zone;
          }
        });
        setSelectedLocation(closestZone);
      },
      (err) => {
        setIsLocating(false);
        showToast('Location permission denied or unavailable. Selected nearest district.');
      },
      { timeout: 8000 }
    );
  };

  // Database Actions
  const addHelpRequest = async (reqData: Omit<HelpRequest, 'id' | 'timestamp' | 'status'>) => {
    const tempId = `sos-${Date.now()}`;
    const newReq: HelpRequest = {
      ...reqData,
      id: tempId,
      timestamp: 'Just now',
      status: 'PENDING'
    };

    setHelpRequests((prev) => [newReq, ...prev]);
    showToast(`🚨 SOS Broadcast Sent for ${newReq.name}!`);

    try {
      // 1. Insert into Supabase Table
      const { data, error } = await supabase
        .from('sos_requests')
        .insert([
          {
            name: reqData.name,
            phone: reqData.phone,
            latitude: reqData.coordinates[0],
            longitude: reqData.coordinates[1],
            location_name: reqData.locationName,
            category: reqData.category,
            urgency: reqData.urgency,
            people_count: reqData.peopleCount,
            note: reqData.note,
            photo_url: reqData.photoUrl,
            status: 'PENDING'
          }
        ])
        .select()
        .single();

      const insertedId = data?.id || tempId;

      // 2. Trigger Gemini AI Analysis & Create Associated Incident
      const aiAssessment = await analyzeIncidentWithAi({
        incident: reqData,
        weather: currentWeather,
        riskProfile: selectedLocation,
        peopleAffected: reqData.peopleCount
      });

      const { data: incData } = await supabase
        .from('incidents')
        .insert([
          {
            title: `Emergency ${reqData.category}: ${reqData.locationName}`,
            incident_type: reqData.category,
            severity: aiAssessment.severity,
            status: 'OPEN',
            priority_score: aiAssessment.priority_score,
            description: `${reqData.note} (AI Recommendation: ${aiAssessment.recommended_action})`,
            location_name: reqData.locationName,
            latitude: reqData.coordinates[0],
            longitude: reqData.coordinates[1],
            people_affected: reqData.peopleCount,
            reported_by: reqData.name
          }
        ])
        .select()
        .single();

      if (incData && insertedId) {
        await supabase.from('sos_requests').update({ incident_id: incData.id }).eq('id', insertedId);
      }

      await logAuditAction('SOS_CREATED', 'sos_requests', insertedId, { name: reqData.name, category: reqData.category });
      fetchSupabaseData();
    } catch (e) {
      console.warn('Database sync warning on SOS insert:', e);
    }
  };

  const addSafeCheckin = async (chkData: Omit<SafeCheckin, 'id' | 'timestamp'>) => {
    const newChk: SafeCheckin = {
      ...chkData,
      id: `safe-${Date.now()}`,
      timestamp: 'Just now'
    };

    setSafeCheckins((prev) => [newChk, ...prev]);
    showToast(`✅ Safe status broadcasted for ${newChk.name}`);

    try {
      await supabase.from('safe_checkins').insert([
        {
          name: chkData.name,
          phone: chkData.phone,
          latitude: chkData.coordinates[0],
          longitude: chkData.coordinates[1],
          location_name: chkData.locationName,
          message: chkData.message
        }
      ]);
      await logAuditAction('SAFE_CHECKIN', 'safe_checkins', undefined, { name: chkData.name });
      fetchSupabaseData();
    } catch (e) {
      console.warn('Database sync warning on safe checkin:', e);
    }
  };

  const addDamageReport = async (dmgData: any) => {
    try {
      showToast(`🏚️ Submitting damage report for ${dmgData.infraType}...`);
      const { createDamageReport } = await import('../services/recovery/damageReportService');
      const newDmg = await createDamageReport({
        reporterName: dmgData.reporterName,
        reporterPhone: dmgData.reporterPhone,
        locationName: dmgData.locationName,
        coordinates: dmgData.coordinates,
        infraType: dmgData.infraType,
        severity: dmgData.severity,
        description: dmgData.description,
        imageFile: dmgData.imageFile
      });
      setDamageReports((prev) => [newDmg, ...prev]);
      showToast(`🏚️ Damage report logged for ${newDmg.infraType}`);
      await logAuditAction('DAMAGE_REPORT', 'recovery_damage_reports', newDmg.id, { infra: dmgData.infraType });
      fetchSupabaseData();
    } catch (e: any) {
      console.warn('Database sync warning on damage report:', e);
      showToast(`❌ Failed to submit damage report: ${e.message || e}`);
    }
  };

  const addResource = async (resData: Omit<ResourceListing, 'id' | 'timestamp' | 'status'>) => {
    try {
      showToast(`📦 Publishing listing: ${resData.title}...`);
      if (resData.type === 'HAVE') {
        let ngoId = '';
        if (currentUser) {
          const { data: ngoData } = await supabase
            .from('ngos')
            .select('id')
            .eq('user_id', currentUser.id)
            .maybeSingle();
          if (ngoData) {
            ngoId = ngoData.id;
          } else {
            const { data: newNgo, error: ngoErr } = await supabase
              .from('ngos')
              .insert([{
                user_id: currentUser.id,
                organization_name: resData.organization || 'Local Help Alliance',
                contact_person: resData.contactName || currentUser.email?.split('@')[0] || 'Member',
                phone: resData.phone || '',
                email: currentUser.email || '',
                verification_status: 'verified',
                latitude: resData.coordinates[0],
                longitude: resData.coordinates[1]
              }])
              .select()
              .single();
            if (ngoErr) throw ngoErr;
            ngoId = newNgo.id;
          }
        } else {
          throw new Error('You must be signed in to post an aid offer.');
        }

        const { error } = await supabase
          .from('ngo_resources')
          .insert([{
            ngo_id: ngoId,
            resource_type: mapUIResourceCategoryToDB(resData.itemCategory),
            item_name: resData.title,
            quantity_available: parseFloat(resData.quantity) || 100,
            unit: 'units',
            availability_status: 'available'
          }]);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('recovery_aid_needs')
          .insert([{
            location: resData.locationName,
            district: selectedLocation.district,
            state: selectedLocation.state,
            latitude: resData.coordinates[0],
            longitude: resData.coordinates[1],
            category: mapUIResourceCategoryToDB(resData.itemCategory),
            item_name: resData.title,
            quantity_required: parseFloat(resData.quantity) || 100,
            priority: 'medium',
            created_by: currentUser?.id || null
          }]);

        if (error) throw error;
      }

      showToast(`📦 Resource listing created: ${resData.title}`);
      await logAuditAction('RESOURCE_CREATED', resData.type === 'HAVE' ? 'ngo_resources' : 'recovery_aid_needs', undefined, { title: resData.title });
      fetchSupabaseData();
    } catch (e: any) {
      console.warn('Database sync warning on resource insert:', e);
      showToast(`❌ Failed to publish listing: ${e.message || e}`);
    }
  };

  const claimResource = async (id: string) => {
    try {
      showToast('⌛ Claiming resource...');
      const { data: ngoRes } = await supabase.from('ngo_resources').select('id').eq('id', id).maybeSingle();
      if (ngoRes) {
        const { error } = await supabase.from('ngo_resources').update({ availability_status: 'allocated' }).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('recovery_aid_needs').update({ status: 'partially_fulfilled' }).eq('id', id);
        if (error) throw error;
      }
      showToast('🎉 Claim registered successfully!');
      fetchSupabaseData();
    } catch (e: any) {
      console.warn('Database sync warning on claim resource:', e);
      showToast(`❌ Claim failed: ${e.message || e}`);
    }
  };

  const updateHelpStatus = async (id: string, status: HelpRequest['status']) => {
    setHelpRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    showToast(`Status updated to ${status} for ticket #${id}`);

    try {
      await supabase.from('sos_requests').update({ status }).eq('id', id);
      await logAuditAction('SOS_STATUS_UPDATED', 'sos_requests', id, { status });
    } catch (e) {
      console.warn('Database sync warning on status update:', e);
    }
  };

  const assignTeamToIncident = async (teamId: string, incidentId: string) => {
    try {
      await supabase.from('response_teams').update({ status: 'DEPLOYED', current_incident_id: incidentId }).eq('id', teamId);
      await supabase.from('incidents').update({ status: 'IN_PROGRESS', assigned_team_id: teamId }).eq('id', incidentId);

      showToast(`🚒 Rescue Team assigned to Incident!`);
      await logAuditAction('TEAM_ASSIGNED', 'incidents', incidentId, { teamId });
      fetchSupabaseData();
    } catch (e) {
      console.warn('Database sync warning on team assignment:', e);
    }
  };

  const generateBrief = async (): Promise<string> => {
    setIsGeneratingBrief(true);
    const totalCap = shelters.reduce((acc, s) => acc + s.capacity, 0);
    const totalOcc = shelters.reduce((acc, s) => acc + s.currentOccupancy, 0);
    const occupancyPercent = totalCap > 0 ? Math.round((totalOcc / totalCap) * 100) : 72;

    const brief = await generateSituationBriefWithAi({
      activeIncidentsCount: incidents.length || 3,
      sosCount: helpRequests.length || 5,
      criticalCount: helpRequests.filter((r) => r.urgency === 'CRITICAL').length || 2,
      shelterOccupancyPercent: occupancyPercent,
      teamCount: responseTeams.filter((t) => t.status === 'DEPLOYED').length || 2,
      district: selectedLocation.district
    });

    setIsGeneratingBrief(false);
    return brief;
  };

  const addEmergencyContact = (c: Omit<EmergencyContact, 'id'>) => {
    const newC: EmergencyContact = { ...c, id: `c-${Date.now()}` };
    setEmergencyContacts((prev) => [...prev, newC]);
    showToast(`Contact saved: ${newC.name}`);
  };

  const removeEmergencyContact = (id: string) => {
    setEmergencyContacts((prev) => prev.filter((c) => c.id !== id));
  };

  // Live Demo Simulation Timer
  useEffect(() => {
    if (!isDemoSimulating) return;

    const interval = setInterval(async () => {
      const demoNames = ['Rohan Verma', 'Karan Patel', 'Meera Krishnan', 'Simran Kaur', 'Tariq Ahmed'];
      const demoCategories: HelpRequest['category'][] = ['Trapped', 'Medical', 'Food & Water', 'Evacuation'];
      const demoDistricts = INDIAN_DISTRICT_ZONES;

      const randomDistrict = demoDistricts[Math.floor(Math.random() * demoDistricts.length)];
      const randomName = demoNames[Math.floor(Math.random() * demoNames.length)];
      const randomCat = demoCategories[Math.floor(Math.random() * demoCategories.length)];
      const randomLat = randomDistrict.coordinates[0] + (Math.random() - 0.5) * 0.05;
      const randomLng = randomDistrict.coordinates[1] + (Math.random() - 0.5) * 0.05;

      await addHelpRequest({
        name: randomName,
        phone: '+91 98765 43210',
        coordinates: [randomLat, randomLng],
        locationName: `${randomDistrict.district}, ${randomDistrict.state}`,
        category: randomCat,
        urgency: 'CRITICAL',
        peopleCount: Math.floor(Math.random() * 5) + 1,
        note: `[SIMULATED DISASTER SIGNAL] Water rising rapidly. Need immediate rescue assistance in ${randomDistrict.district}.`
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [isDemoSimulating]);

  const toggleDemoSimulation = () => {
    setIsDemoSimulating((prev) => {
      const next = !prev;
      showToast(next ? '⚡ Live Demo Simulator ENABLED (Incoming signals active)' : '⏸️ Demo Simulator Paused');
      return next;
    });
  };

  return (
    <AppContext.Provider
      value={{
        activeModule,
        setActiveModule,
        selectedLocation,
        setSelectedLocation,
        userCoords,
        detectUserLocation,
        isLocating,
        allDistricts: INDIAN_DISTRICT_ZONES,
        helpRequests,
        safeCheckins,
        shelters,
        damageReports,
        resources,
        usgsQuakes,
        emergencyContacts,
        incidents,
        responseTeams,
        alerts,
        currentWeather,
        filterDisasterType,
        setFilterDisasterType,
        filterUrgency,
        setFilterUrgency,
        filterCategory,
        setFilterCategory,
        addHelpRequest,
        addSafeCheckin,
        addDamageReport,
        addResource,
        claimResource,
        updateHelpStatus,
        addEmergencyContact,
        removeEmergencyContact,
        assignTeamToIncident,
        generateBrief,
        isGeneratingBrief,
        isDemoSimulating,
        toggleDemoSimulation,
        activeToast,
        showToast,
        isSosModalOpen,
        setIsSosModalOpen,
        isSafeModalOpen,
        setIsSafeModalOpen,
        currentUser,
        currentProfile,
        userRole,
        signOut: handleSignOut,
        refreshData: fetchSupabaseData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
