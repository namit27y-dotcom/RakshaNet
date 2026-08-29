import { supabase } from '../supabaseClient';

export interface RecoveryDashboardStats {
  damageReportsCount: number;
  criticalDamageReports: number;
  aidFulfillmentRate: number;
  resolvedSosCount: number;
  totalSosCount: number;
  activeReliefCamps: number;
  totalShelteredCitizens: number;
  campCapacity: number;
  campOccupancy: number;
  campUtilizationPercentage: number;
}

export interface CommunityAidFulfillment {
  category: string;
  requiredQuantity: number;
  receivedQuantity: number;
  fulfilledQuantity: number;
  fulfillmentPercentage: number;
  status: string;
}

export interface InfrastructureDamageBreakdown {
  infrastructureType: string;
  incidentCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

export const getRecoveryDashboardStats = async (): Promise<RecoveryDashboardStats> => {
  const { data, error } = await supabase.rpc('get_recovery_dashboard_stats');
  
  if (error) {
    console.error('Error fetching dashboard stats RPC:', error);
    // Fallback static metrics (unhardcoded where possible)
    return {
      damageReportsCount: 0,
      criticalDamageReports: 0,
      aidFulfillmentRate: 0,
      resolvedSosCount: 0,
      totalSosCount: 0,
      activeReliefCamps: 0,
      totalShelteredCitizens: 0,
      campCapacity: 0,
      campOccupancy: 0,
      campUtilizationPercentage: 0
    };
  }

  // RPC returns array of 1 row
  const stats = data && data[0] ? data[0] : {};
  return {
    damageReportsCount: Number(stats.damage_reports_count || 0),
    criticalDamageReports: Number(stats.critical_damage_reports || 0),
    aidFulfillmentRate: Number(stats.aid_fulfillment_rate || 0),
    resolvedSosCount: Number(stats.resolved_sos_count || 0),
    totalSosCount: Number(stats.total_sos_count || 0),
    activeReliefCamps: Number(stats.active_relief_camps || 0),
    totalShelteredCitizens: Number(stats.total_sheltered_citizens || 0),
    campCapacity: Number(stats.camp_capacity || 0),
    campOccupancy: Number(stats.camp_occupancy || 0),
    campUtilizationPercentage: Number(stats.camp_utilization_percentage || 0)
  };
};

export const getCommunityAidFulfillment = async (): Promise<CommunityAidFulfillment[]> => {
  const { data, error } = await supabase.rpc('get_community_aid_fulfillment');
  
  if (error) {
    console.error('Error fetching community aid fulfillment RPC:', error);
    return [];
  }

  return (data || []).map((d: any) => ({
    category: d.category,
    requiredQuantity: Number(d.required_quantity || 0),
    receivedQuantity: Number(d.received_quantity || 0),
    fulfilledQuantity: Number(d.fulfilled_quantity || 0),
    fulfillmentPercentage: Number(d.fulfillment_percentage || 0),
    status: d.status || 'SHORTAGE'
  }));
};

export const getInfrastructureDamageBreakdown = async (): Promise<InfrastructureDamageBreakdown[]> => {
  const { data, error } = await supabase.rpc('get_infrastructure_damage_breakdown');

  if (error) {
    console.error('Error fetching infra damage breakdown RPC:', error);
    return [];
  }

  return (data || []).map((d: any) => ({
    infrastructureType: d.infrastructure_type,
    incidentCount: Number(d.incident_count || 0),
    criticalCount: Number(d.critical_count || 0),
    highCount: Number(d.high_count || 0),
    mediumCount: Number(d.medium_count || 0),
    lowCount: Number(d.low_count || 0)
  }));
};

export const getRecoverySituationSummary = async (stats: RecoveryDashboardStats): Promise<string> => {
  return `📋 **RECOVERY OPERATIONS SITUATION SUMMARY**
  
  - **Damage Assessment**: ${stats.damageReportsCount} total reports logged, including ${stats.criticalDamageReports} critical structural audits.
  - **Relief Camps**: ${stats.activeReliefCamps} active camps sheltering ${stats.totalShelteredCitizens} citizens (${stats.campUtilizationPercentage}% capacity utilized).
  - **SOS Incidents**: ${stats.resolvedSosCount} / ${stats.totalSosCount} emergency response tickets resolved.
  - **Supply Fulfilled**: Overall community aid need is running at ${stats.aidFulfillmentRate}% fulfillment.`;
};
