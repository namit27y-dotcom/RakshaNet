import { supabase } from '../supabaseClient';
import { Shelter } from '../../types';

// Map database relief_camps to frontend Shelter type
export const mapDBToShelter = (d: any): Shelter => ({
  id: d.id,
  name: d.name,
  locationName: d.address || '',
  coordinates: [d.latitude, d.longitude],
  capacity: d.capacity,
  currentOccupancy: d.current_occupancy,
  facilities: [
    ...(d.water_available ? ['Drinking Water'] : []),
    ...(d.food_available ? ['Food & Rations'] : []),
    ...(d.medical_available ? ['First Aid & Medical'] : []),
    ...(d.electricity_available ? ['Power Backup'] : [])
  ],
  contactPerson: 'Relief Coordinator',
  phone: '+91 1077',
  status: d.status === 'active' ? 'OPEN' : (d.status === 'full' ? 'FULL' : 'PREPARING'),
  medicalSupport: d.medical_available,
  waterAvailable: d.water_available,
  foodAvailable: d.food_available
});

export const getReliefCamps = async (): Promise<Shelter[]> => {
  const { data, error } = await supabase
    .from('relief_camps')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapDBToShelter);
};

export const getActiveReliefCamps = async (): Promise<Shelter[]> => {
  const { data, error } = await supabase
    .from('relief_camps')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapDBToShelter);
};

export const createReliefCamp = async (camp: Omit<Shelter, 'id' | 'status'>): Promise<Shelter> => {
  const status = camp.currentOccupancy >= camp.capacity ? 'full' : 'active';
  const { data, error } = await supabase
    .from('relief_camps')
    .insert([
      {
        name: camp.name,
        latitude: camp.coordinates[0],
        longitude: camp.coordinates[1],
        address: camp.locationName,
        capacity: camp.capacity,
        current_occupancy: camp.currentOccupancy,
        water_available: camp.waterAvailable ?? true,
        food_available: camp.foodAvailable ?? true,
        medical_available: camp.medicalSupport ?? true,
        electricity_available: true,
        status: status
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return mapDBToShelter(data);
};

export const updateReliefCamp = async (id: string, updates: Partial<Shelter>): Promise<void> => {
  const dbUpdates: any = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.capacity !== undefined) dbUpdates.capacity = updates.capacity;
  if (updates.currentOccupancy !== undefined) dbUpdates.current_occupancy = updates.currentOccupancy;
  if (updates.waterAvailable !== undefined) dbUpdates.water_available = updates.waterAvailable;
  if (updates.foodAvailable !== undefined) dbUpdates.food_available = updates.foodAvailable;
  if (updates.medicalSupport !== undefined) dbUpdates.medical_available = updates.medicalSupport;

  const { error } = await supabase
    .from('relief_camps')
    .update(dbUpdates)
    .eq('id', id);

  if (error) throw error;
};

export const updateCampOccupancy = async (id: string, occupancy: number): Promise<void> => {
  // Fetch camp capacity first to validate
  const { data, error: fetchErr } = await supabase
    .from('relief_camps')
    .select('capacity')
    .eq('id', id)
    .single();

  if (fetchErr) throw fetchErr;
  if (occupancy > data.capacity) {
    throw new Error(`Occupancy ${occupancy} cannot exceed capacity ${data.capacity}.`);
  }
  if (occupancy < 0) {
    throw new Error('Occupancy cannot be negative.');
  }

  const status = occupancy >= data.capacity ? 'full' : 'active';

  const { error } = await supabase
    .from('relief_camps')
    .update({ 
      current_occupancy: occupancy,
      status: status
    })
    .eq('id', id);

  if (error) throw error;
};

export const closeReliefCamp = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('relief_camps')
    .update({ status: 'closed', current_occupancy: 0 })
    .eq('id', id);

  if (error) throw error;
};
