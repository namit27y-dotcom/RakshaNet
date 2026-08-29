import { supabase } from '../supabaseClient';
import { DamageReport, InfrastructureType } from '../../types';

export const uploadDamageEvidence = async (file: File, userId: string, reportId: string): Promise<string> => {
  // Validate file is image
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed.');
  }
  // Validate file size (e.g. 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File size exceeds 5MB limit.');
  }

  const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const path = `${userId}/${reportId}/${filename}`;
  
  const { data, error } = await supabase.storage
    .from('damage-evidence')
    .upload(path, file, { cacheControl: '3600', upsert: true });

  if (error) throw error;
  return data.path;
};

export const getDamageEvidenceUrl = async (path: string): Promise<string> => {
  const { data, error } = await supabase.storage
    .from('damage-evidence')
    .createSignedUrl(path, 3600); // 1 hour expiry

  if (error) {
    console.error('Error generating signed URL:', error);
    // Return a fallback public URL or empty string
    return '';
  }
  return data.signedUrl;
};

export const deleteDamageEvidence = async (path: string): Promise<void> => {
  const { error } = await supabase.storage
    .from('damage-evidence')
    .remove([path]);
  if (error) throw error;
};

export const createDamageReport = async (report: {
  reporterName: string;
  reporterPhone: string;
  locationName: string;
  coordinates: [number, number];
  infraType: InfrastructureType;
  severity: 1 | 2 | 3 | 4 | 5;
  description: string;
  imageFile?: File;
}): Promise<DamageReport> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required to submit damage reports.');

  const reportId = crypto.randomUUID();
  let imagePath = '';

  if (report.imageFile) {
    imagePath = await uploadDamageEvidence(report.imageFile, user.id, reportId);
  }

  const { data, error } = await supabase
    .from('recovery_damage_reports')
    .insert([
      {
        id: reportId,
        reporter_id: user.id,
        title: `Damage to ${report.infraType}`,
        description: report.description,
        infrastructure_type: report.infraType,
        severity: report.severity,
        latitude: report.coordinates[0],
        longitude: report.coordinates[1],
        address: report.locationName,
        images: imagePath ? JSON.stringify([imagePath]) : '[]',
        status: 'submitted',
        verification_status: 'pending'
      }
    ])
    .select('*, profiles(full_name, phone)')
    .single();

  if (error) throw error;
  
  let signedPhotoUrl = '';
  if (imagePath) {
    signedPhotoUrl = await getDamageEvidenceUrl(imagePath);
  }

  return {
    id: data.id,
    reporterName: data.profiles?.full_name || report.reporterName || 'Citizen',
    reporterPhone: data.profiles?.phone || report.reporterPhone || '',
    locationName: data.address || '',
    coordinates: [data.latitude, data.longitude],
    infraType: data.infrastructure_type,
    severity: data.severity,
    description: data.description,
    photoUrl: signedPhotoUrl || undefined,
    timestamp: new Date(data.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    verified: data.verification_status === 'verified'
  };
};

export const mapDBSourceToDamageReport = async (d: any): Promise<DamageReport> => {
  let imagesList: string[] = [];
  try {
    imagesList = typeof d.images === 'string' ? JSON.parse(d.images) : (Array.isArray(d.images) ? d.images : []);
  } catch (_) {}

  let photoUrl = '';
  if (imagesList && imagesList.length > 0) {
    photoUrl = await getDamageEvidenceUrl(imagesList[0]);
  }

  return {
    id: d.id,
    reporterName: d.profiles?.full_name || 'Citizen',
    reporterPhone: d.profiles?.phone || '',
    locationName: d.address || '',
    coordinates: [d.latitude, d.longitude],
    infraType: d.infrastructure_type,
    severity: d.severity,
    description: d.description || '',
    photoUrl: photoUrl || undefined,
    timestamp: new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    verified: d.verification_status === 'verified'
  };
};

export const getDamageReports = async (): Promise<DamageReport[]> => {
  const { data, error } = await supabase
    .from('recovery_damage_reports')
    .select('*, profiles(full_name, phone)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  const mapped = await Promise.all(data.map(mapDBSourceToDamageReport));
  return mapped;
};

export const getVerifiedDamageReports = async (): Promise<DamageReport[]> => {
  const { data, error } = await supabase
    .from('recovery_damage_reports')
    .select('*, profiles(full_name, phone)')
    .eq('verification_status', 'verified')
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  const mapped = await Promise.all(data.map(mapDBSourceToDamageReport));
  return mapped;
};

export const getDamageReportById = async (id: string): Promise<DamageReport | null> => {
  const { data, error } = await supabase
    .from('recovery_damage_reports')
    .select('*, profiles(full_name, phone)')
    .eq('id', id)
    .single();

  if (error) return null;
  return mapDBSourceToDamageReport(data);
};

export const updateDamageReport = async (id: string, updates: any): Promise<void> => {
  const { error } = await supabase
    .from('recovery_damage_reports')
    .update(updates)
    .eq('id', id);
  if (error) throw error;
};

export const verifyDamageReport = async (id: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required.');

  const { error } = await supabase
    .from('recovery_damage_reports')
    .update({
      verification_status: 'verified',
      status: 'verified',
      verified_by: user.id
    })
    .eq('id', id);

  if (error) throw error;
};

export const rejectDamageReport = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('recovery_damage_reports')
    .update({
      verification_status: 'rejected',
      status: 'rejected'
    })
    .eq('id', id);

  if (error) throw error;
};

export const resolveDamageReport = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('recovery_damage_reports')
    .update({
      status: 'resolved'
    })
    .eq('id', id);

  if (error) throw error;
};
