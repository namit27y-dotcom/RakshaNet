import { supabase } from '../supabaseClient';

export interface AidNeed {
  id: string;
  location: string;
  district?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  category: 'water' | 'food' | 'medical' | 'power' | 'shelter' | 'transport' | 'clothing' | 'other';
  itemName: string;
  quantityRequired: number;
  quantityReceived: number;
  quantityFulfilled: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  affectedPeople: number;
  status: 'open' | 'partially_fulfilled' | 'fulfilled' | 'cancelled';
  createdAt: string;
  createdBy?: string;
}

export interface AidAllocation {
  id: string;
  aidNeedId: string;
  ngoId: string;
  resourceId: string;
  quantityAllocated: number;
  allocationStatus: 'pending' | 'approved' | 'dispatched' | 'delivered' | 'cancelled';
  assignedBy?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  ngoName?: string;
  resourceName?: string;
}

export const createAidNeed = async (need: Omit<AidNeed, 'id' | 'quantityReceived' | 'quantityFulfilled' | 'status' | 'createdAt'>): Promise<AidNeed> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('recovery_aid_needs')
    .insert([
      {
        location: need.location,
        district: need.district,
        state: need.state,
        latitude: need.latitude,
        longitude: need.longitude,
        category: need.category,
        item_name: need.itemName,
        quantity_required: need.quantityRequired,
        quantity_received: 0,
        quantity_fulfilled: 0,
        priority: need.priority,
        affected_people: need.affectedPeople,
        status: 'open',
        created_by: user?.id || null
      }
    ])
    .select()
    .single();

  if (error) throw error;
  
  return {
    id: data.id,
    location: data.location,
    district: data.district,
    state: data.state,
    latitude: data.latitude,
    longitude: data.longitude,
    category: data.category,
    itemName: data.item_name,
    quantityRequired: Number(data.quantity_required),
    quantityReceived: Number(data.quantity_received),
    quantityFulfilled: Number(data.quantity_fulfilled),
    priority: data.priority,
    affectedPeople: data.affected_people,
    status: data.status,
    createdAt: data.created_at,
    createdBy: data.created_by
  };
};

export const mapDBToAidNeed = (data: any): AidNeed => ({
  id: data.id,
  location: data.location,
  district: data.district,
  state: data.state,
  latitude: data.latitude,
  longitude: data.longitude,
  category: data.category,
  itemName: data.item_name,
  quantityRequired: Number(data.quantity_required),
  quantityReceived: Number(data.quantity_received),
  quantityFulfilled: Number(data.quantity_fulfilled),
  priority: data.priority,
  affectedPeople: data.affected_people || 0,
  status: data.status,
  createdAt: data.created_at,
  createdBy: data.created_by
});

export const getAidNeeds = async (): Promise<AidNeed[]> => {
  const { data, error } = await supabase
    .from('recovery_aid_needs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapDBToAidNeed);
};

export const getOpenAidNeeds = async (): Promise<AidNeed[]> => {
  const { data, error } = await supabase
    .from('recovery_aid_needs')
    .select('*')
    .in('status', ['open', 'partially_fulfilled'])
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapDBToAidNeed);
};

export const updateAidNeed = async (id: string, updates: Partial<AidNeed>): Promise<void> => {
  const dbUpdates: any = {};
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.quantityReceived !== undefined) dbUpdates.quantity_received = updates.quantityReceived;
  if (updates.quantityFulfilled !== undefined) dbUpdates.quantity_fulfilled = updates.quantityFulfilled;

  const { error } = await supabase
    .from('recovery_aid_needs')
    .update(dbUpdates)
    .eq('id', id);

  if (error) throw error;
};

export const deleteAidNeed = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('recovery_aid_needs')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const allocateAid = async (params: {
  aidNeedId: string;
  ngoId: string;
  resourceId: string;
  quantityAllocated: number;
}): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required.');

  // Call the transaction RPC
  const { data, error } = await supabase.rpc('allocate_aid_transactional', {
    p_aid_need_id: params.aidNeedId,
    p_ngo_id: params.ngoId,
    p_resource_id: params.resourceId,
    p_quantity: params.quantityAllocated,
    p_assigned_by: user.id
  });

  if (error) throw error;
  return data; // Returns the generated allocation ID
};

export const approveAllocation = async (allocationId: string): Promise<void> => {
  const { error } = await supabase
    .from('aid_allocations')
    .update({ allocation_status: 'approved' })
    .eq('id', allocationId);

  if (error) throw error;
};

export const dispatchAid = async (allocationId: string): Promise<void> => {
  const { error } = await supabase
    .from('aid_allocations')
    .update({ 
      allocation_status: 'dispatched',
      dispatched_at: new Date().toISOString()
    })
    .eq('id', allocationId);

  if (error) throw error;
};

export const markAidDelivered = async (allocationId: string): Promise<void> => {
  const { error } = await supabase
    .from('aid_allocations')
    .update({ 
      allocation_status: 'delivered',
      delivered_at: new Date().toISOString()
    })
    .eq('id', allocationId);

  if (error) throw error;
};

export const cancelAllocation = async (allocationId: string): Promise<void> => {
  const { error } = await supabase
    .from('aid_allocations')
    .update({ allocation_status: 'cancelled' })
    .eq('id', allocationId);

  if (error) throw error;
};

export const getAidAllocations = async (): Promise<AidAllocation[]> => {
  const { data, error } = await supabase
    .from('aid_allocations')
    .select(`
      *,
      ngos(organization_name),
      ngo_resources(item_name)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  return (data || []).map((d: any) => ({
    id: d.id,
    aidNeedId: d.aid_need_id,
    ngoId: d.ngo_id,
    resourceId: d.resource_id,
    quantityAllocated: Number(d.quantity_allocated),
    allocationStatus: d.allocation_status,
    assignedBy: d.assigned_by,
    dispatchedAt: d.dispatched_at,
    deliveredAt: d.delivered_at,
    createdAt: d.created_at,
    ngoName: d.ngos?.organization_name,
    resourceName: d.ngo_resources?.item_name
  }));
};

export const getAidNeedFulfillment = async (needId: string): Promise<{
  required: number;
  received: number;
  fulfilled: number;
  percentage: number;
}> => {
  const { data, error } = await supabase
    .from('recovery_aid_needs')
    .select('quantity_required, quantity_received, quantity_fulfilled')
    .eq('id', needId)
    .single();

  if (error) throw error;
  
  const req = Number(data.quantity_required);
  const ful = Number(data.quantity_fulfilled);
  
  return {
    required: req,
    received: Number(data.quantity_received),
    fulfilled: ful,
    percentage: req > 0 ? Math.round((ful / req) * 100) : 0
  };
};
