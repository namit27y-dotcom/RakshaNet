import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { LayoutDashboard, CheckCircle2, AlertOctagon, TrendingUp, HeartHandshake, ShieldAlert, Sparkles } from 'lucide-react';
import {
  getRecoveryDashboardStats,
  getCommunityAidFulfillment,
  getInfrastructureDamageBreakdown,
  RecoveryDashboardStats,
  CommunityAidFulfillment,
  InfrastructureDamageBreakdown
} from '../../services/recovery/recoveryAnalyticsService';

export const RecoveryDashboard: React.FC = () => {
  const { damageReports, resources, helpRequests, shelters } = useApp();

  const [stats, setStats] = useState<RecoveryDashboardStats | null>(null);
  const [aidFulfillment, setAidFulfillment] = useState<CommunityAidFulfillment[]>([]);
  const [damageBreakdown, setDamageBreakdown] = useState<InfrastructureDamageBreakdown[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const s = await getRecoveryDashboardStats();
      const a = await getCommunityAidFulfillment();
      const d = await getInfrastructureDamageBreakdown();
      setStats(s);
      setAidFulfillment(a);
      setDamageBreakdown(d);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [damageReports, resources, shelters, helpRequests]);

  if (isLoading && !stats) {
    return (
      <div className="py-12 text-center space-y-3">
        <Sparkles className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-700">Loading Recovery Command Metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-center space-y-2">
        <ShieldAlert className="w-8 h-8 mx-auto" />
        <h4 className="text-sm font-bold">Analytics Engine Offline</h4>
        <p className="text-xs">{error}</p>
      </div>
    );
  }

  const activeCampsCount = stats?.activeReliefCamps || 0;
  const totalShelteredCitizens = stats?.totalShelteredCitizens || 0;
  const campCapacity = stats?.campCapacity || 0;
  const campUtilizationPercentage = stats?.campUtilizationPercentage || 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700 uppercase">FR3.3 Macro Recovery Intelligence</span>
          </div>
          <h3 className="text-2xl font-bold font-heading text-slate-900">Aggregated Recovery & Reconstruction Dashboard</h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Real-time analytics for local authorities, NDRF commanders, and NGO donors to monitor rehabilitation progress and aid distribution efficiency.
          </p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
            <span>Damage Reports Logged</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-heading">{stats?.damageReportsCount || 0}</div>
          <div className="text-[10px] text-slate-500 font-mono font-semibold">{stats?.criticalDamageReports || 0} Catastrophic Level 4-5</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
            <span>Aid Fulfillment Rate</span>
            <HeartHandshake className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-600 font-heading">{stats?.aidFulfillmentRate || 0}%</div>
          <div className="text-[10px] text-slate-500 font-mono font-semibold">Pledged vs Demanded Supply</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
            <span>Resolved SOS Tickets</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-blue-600 font-heading">
            {stats?.resolvedSosCount || 0} / {stats?.totalSosCount || 0}
          </div>
          <div className="text-[10px] text-slate-500 font-mono font-semibold">Evacuations & Rescues Completed</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
            <span>Active Relief Camps</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-amber-600 font-heading">{activeCampsCount} Camps</div>
          <div className="text-[10px] text-slate-500 font-mono font-semibold">
            {totalShelteredCitizens.toLocaleString()} / {campCapacity.toLocaleString()} Sheltered ({campUtilizationPercentage}% Capacity)
          </div>
        </div>
      </div>

      {/* Fulfillment Progress Gauges & Infrastructure Damage Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resource Fulfillment Progress Bars */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white space-y-5 shadow-sm">
          <h4 className="text-sm font-bold text-slate-900 uppercase font-heading">
            Community Aid Need Fulfillment Meters
          </h4>

          <div className="space-y-4">
            {aidFulfillment.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No community needs logged yet.</p>
            ) : (
              aidFulfillment.map((item) => {
                const isCritical = item.status.includes('CRITICAL');
                const isShortage = item.status.includes('SHORTAGE') && !isCritical;
                
                let textColor = 'text-emerald-700';
                let barColor = 'bg-emerald-500';
                
                if (isCritical) {
                  textColor = 'text-rose-700';
                  barColor = 'bg-rose-500';
                } else if (isShortage) {
                  textColor = 'text-amber-700';
                  barColor = 'bg-amber-500';
                }

                return (
                  <div key={item.category} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-800">
                      <span>{item.category}</span>
                      <span className={`font-mono font-bold ${textColor}`}>
                        {item.fulfillmentPercentage}% Met {item.status !== 'GOOD' && `(${item.status})`}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${item.fulfillmentPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Damage Breakdown by Sector */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white space-y-5 shadow-sm">
          <h4 className="text-sm font-bold text-slate-900 uppercase font-heading">
            Infrastructure Damage Breakdown
          </h4>

          <div className="space-y-3">
            {damageBreakdown.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No damage reports recorded.</p>
            ) : (
              damageBreakdown.map((item) => {
                let emoji = '🏗️';
                let bgColor = 'bg-slate-100';
                let textColor = 'text-slate-700';
                
                if (item.infrastructureType.includes('Roads')) { emoji = '🌉'; bgColor = 'bg-blue-100'; textColor = 'text-blue-700'; }
                else if (item.infrastructureType.includes('Electricity')) { emoji = '⚡'; bgColor = 'bg-amber-100'; textColor = 'text-amber-700'; }
                else if (item.infrastructureType.includes('Housing')) { emoji = '🏠'; bgColor = 'bg-rose-100'; textColor = 'text-rose-700'; }
                else if (item.infrastructureType.includes('Medical')) { emoji = '🏥'; bgColor = 'bg-emerald-100'; textColor = 'text-emerald-700'; }
                else if (item.infrastructureType.includes('Water')) { emoji = '💧'; bgColor = 'bg-cyan-100'; textColor = 'text-cyan-700'; }
                else if (item.infrastructureType.includes('Public')) { emoji = '🏫'; bgColor = 'bg-purple-100'; textColor = 'text-purple-700'; }

                return (
                  <div key={item.infrastructureType} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <span className={`p-1.5 rounded-lg text-xs leading-none ${bgColor} ${textColor}`}>{emoji}</span>
                      <span>{item.infrastructureType}</span>
                    </div>
                    <div className="flex items-center gap-2 font-semibold">
                      {item.criticalCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
                          {item.criticalCount} Critical
                        </span>
                      )}
                      <span className="font-mono text-xs text-slate-600">{item.incidentCount} Incidents</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
