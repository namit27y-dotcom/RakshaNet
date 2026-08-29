import { supabase } from './supabaseClient';
import { ResponseTeam } from '../types';

export interface DispatchRankResult {
  team: ResponseTeam;
  distanceKm: number;
  score: number;
}

// Calculate Haversine distance in kilometers
export const calculateDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth radius km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
};

export const rankAvailableResponders = (
  targetLat: number,
  targetLng: number,
  requiredType: string,
  teams: ResponseTeam[]
): DispatchRankResult[] => {
  return teams
    .filter((t) => t.status === 'AVAILABLE')
    .map((team) => {
      const distanceKm = calculateDistanceKm(
        targetLat,
        targetLng,
        team.coordinates[0],
        team.coordinates[1]
      );
      const isMatchingType =
        team.teamType.toLowerCase().includes(requiredType.toLowerCase()) ||
        requiredType.toLowerCase().includes(team.teamType.toLowerCase());

      // Ranking score calculation (lower distance + type match = higher score)
      const score = Math.max(0, 100 - distanceKm * 2) + (isMatchingType ? 30 : 0);

      return {
        team,
        distanceKm,
        score
      };
    })
    .sort((a, b) => b.score - a.score);
};

export const dispatchRescueTeam = async (
  teamId: string,
  incidentId: string,
  assignedBy = 'Disaster Command Officer'
) => {
  try {
    // 1. Create rescue_dispatches record
    const { data: dispatchRecord } = await supabase
      .from('rescue_dispatches')
      .insert([
        {
          emergency_id: incidentId,
          responder_id: teamId,
          assigned_by: assignedBy,
          status: 'DISPATCHED',
          eta_minutes: Math.floor(Math.random() * 15) + 10,
          dispatched_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    // 2. Update response_teams table status to DEPLOYED
    await supabase
      .from('response_teams')
      .update({ status: 'DEPLOYED', current_incident_id: incidentId })
      .eq('id', teamId);

    // 3. Update incidents table status to IN_PROGRESS
    await supabase
      .from('incidents')
      .update({ status: 'IN_PROGRESS', assigned_team_id: teamId })
      .eq('id', incidentId);

    // 4. Update sos_requests status to DISPATCHED
    await supabase
      .from('sos_requests')
      .update({ status: 'DISPATCHED' })
      .eq('incident_id', incidentId);

    // 5. Log audit action
    await supabase.from('activity_logs').insert([
      {
        action: 'RESCUE_TEAM_DISPATCHED',
        entity_type: 'incidents',
        entity_id: incidentId,
        metadata: { teamId, assignedBy }
      }
    ]);

    return { success: true, dispatchRecord };
  } catch (err) {
    console.error('Error dispatching rescue team:', err);
    return { success: false, error: err };
  }
};
