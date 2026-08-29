import { supabase } from '../supabaseClient';

export interface NGO {
  id: string;
  userId?: string;
  organizationName: string;
  registrationNumber?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  district?: string;
  state?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: string;
}

export interface NGOResource {
  id: string;
  ngoId: string;
  resourceType: 'food' | 'water' | 'medical' | 'medicine' | 'power' | 'fuel' | 'blankets' | 'clothing' | 'transport' | 'other';
  itemName: string;
  quantityAvailable: number;
  quantityAllocated: number;
  unit: string;
  expiryDate?: string;
  availabilityStatus: 'available' | 'partially_allocated' | 'fully_allocated' | 'expired' | 'unavailable';
  createdAt: string;
}

export interface ResourceMatch {
  ngoId: string;
  organizationName: string;
  resourceId: string;
  itemName: string;
  quantityAvailable: number;
  distanceKm: number;
  verificationStatus: string;
  matchScore: number;
  recommendedReason: string;
}

export const createNGO = async (ngo: Omit<NGO, 'id' | 'verificationStatus' | 'createdAt'>): Promise<NGO> => {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('ngos')
    .insert([
      {
        user_id: user?.id || ngo.userId || null,
        organization_name: ngo.organizationName,
        registration_number: ngo.registrationNumber,
        contact_person: ngo.contactPerson,
        phone: ngo.phone,
        email: ngo.email,
        website: ngo.website,
        address: ngo.address,
        latitude: ngo.latitude,
        longitude: ngo.longitude,
        district: ngo.district,
        state: ngo.state,
        verification_status: 'pending'
      }
    ])
    .select()
    .single();

  if (error) throw error;
  
  return {
    id: data.id,
    userId: data.user_id,
    organizationName: data.organization_name,
    registrationNumber: data.registration_number,
    contactPerson: data.contact_person,
    phone: data.phone,
    email: data.email,
    website: data.website,
    address: data.address,
    latitude: data.latitude,
    longitude: data.longitude,
    district: data.district,
    state: data.state,
    verificationStatus: data.verification_status,
    createdAt: data.created_at
  };
};

const mapDBToNGO = (d: any): NGO => ({
  id: d.id,
  userId: d.user_id,
  organizationName: d.organization_name,
  registrationNumber: d.registration_number,
  contactPerson: d.contact_person,
  phone: d.phone,
  email: d.email,
  website: d.website,
  address: d.address,
  latitude: d.latitude,
  longitude: d.longitude,
  district: d.district,
  state: d.state,
  verificationStatus: d.verification_status,
  createdAt: d.created_at
});

export const getNGOs = async (): Promise<NGO[]> => {
  const { data, error } = await supabase
    .from('ngos')
    .select('*')
    .order('organization_name', { ascending: true });

  if (error) throw error;
  return (data || []).map(mapDBToNGO);
};

export const getVerifiedNGOs = async (): Promise<NGO[]> => {
  const { data, error } = await supabase
    .from('ngos')
    .select('*')
    .eq('verification_status', 'verified')
    .order('organization_name', { ascending: true });

  if (error) throw error;
  return (data || []).map(mapDBToNGO);
};

export const updateNGO = async (id: string, updates: Partial<NGO>): Promise<void> => {
  const dbUpdates: any = {};
  if (updates.organizationName !== undefined) dbUpdates.organization_name = updates.organizationName;
  if (updates.contactPerson !== undefined) dbUpdates.contact_person = updates.contactPerson;
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
  if (updates.email !== undefined) dbUpdates.email = updates.email;
  if (updates.website !== undefined) dbUpdates.website = updates.website;
  if (updates.address !== undefined) dbUpdates.address = updates.address;
  if (updates.latitude !== undefined) dbUpdates.latitude = updates.latitude;
  if (updates.longitude !== undefined) dbUpdates.longitude = updates.longitude;
  if (updates.district !== undefined) dbUpdates.district = updates.district;
  if (updates.state !== undefined) dbUpdates.state = updates.state;

  const { error } = await supabase
    .from('ngos')
    .update(dbUpdates)
    .eq('id', id);

  if (error) throw error;
};

export const verifyNGO = async (id: string, status: 'verified' | 'rejected'): Promise<void> => {
  const { error } = await supabase
    .from('ngos')
    .update({ verification_status: status })
    .eq('id', id);

  if (error) throw error;
};

const mapDBToResource = (d: any): NGOResource => ({
  id: d.id,
  ngoId: d.ngo_id,
  resourceType: d.resource_type,
  itemName: d.item_name,
  quantityAvailable: Number(d.quantity_available),
  quantityAllocated: Number(d.quantity_allocated),
  unit: d.unit,
  expiryDate: d.expiry_date,
  availabilityStatus: d.availability_status,
  createdAt: d.created_at
});

export const getNGOResources = async (ngoId?: string): Promise<NGOResource[]> => {
  let query = supabase.from('ngo_resources').select('*');
  if (ngoId) {
    query = query.eq('ngo_id', ngoId);
  }
  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapDBToResource);
};

export const addResource = async (res: Omit<NGOResource, 'id' | 'quantityAllocated' | 'availabilityStatus' | 'createdAt'>): Promise<NGOResource> => {
  const { data, error } = await supabase
    .from('ngo_resources')
    .insert([
      {
        ngo_id: res.ngoId,
        resource_type: res.resourceType,
        item_name: res.itemName,
        quantity_available: res.quantityAvailable,
        quantity_allocated: 0,
        unit: res.unit,
        expiry_date: res.expiryDate || null,
        availability_status: 'available'
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return mapDBToResource(data);
};

export const updateResource = async (id: string, updates: Partial<NGOResource>): Promise<void> => {
  const dbUpdates: any = {};
  if (updates.quantityAvailable !== undefined) dbUpdates.quantity_available = updates.quantityAvailable;
  if (updates.availabilityStatus !== undefined) dbUpdates.availability_status = updates.availabilityStatus;
  if (updates.itemName !== undefined) dbUpdates.item_name = updates.itemName;
  if (updates.unit !== undefined) dbUpdates.unit = updates.unit;
  if (updates.expiryDate !== undefined) dbUpdates.expiry_date = updates.expiryDate;

  const { error } = await supabase
    .from('ngo_resources')
    .update(dbUpdates)
    .eq('id', id);

  if (error) throw error;
};

export const deleteResource = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('ngo_resources')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const getResourceMatches = async (needId: string): Promise<ResourceMatch[]> => {
  const { data, error } = await supabase.rpc('match_ngo_resources', {
    p_aid_need_id: needId
  });

  if (error) throw error;

  return (data || []).map((d: any) => {
    let reason = 'High availability and proximity.';
    if (d.match_score >= 80) reason = 'Highly recommended: Verified NGO with excellent availability nearby.';
    else if (d.match_score >= 60) reason = 'Good match: Reliable resource within geographic range.';
    else if (d.match_score >= 40) reason = 'Moderate match: Resource available but distant.';
    else reason = 'Low match: Limited availability or very far.';

    return {
      ngoId: d.ngo_id,
      organizationName: d.organization_name,
      resourceId: d.resource_id,
      itemName: d.resource_name,
      quantityAvailable: Number(d.available_quantity),
      distanceKm: Number(Number(d.distance_km).toFixed(2)),
      verificationStatus: d.verification_status,
      matchScore: Math.round(Number(d.match_score)),
      recommendedReason: reason
    };
  });
};
