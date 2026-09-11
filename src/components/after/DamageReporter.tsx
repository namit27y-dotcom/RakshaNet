import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InfrastructureType } from '../../types';
import { Building2, AlertTriangle, Camera, Upload, CheckCircle2, ShieldAlert, Check, X } from 'lucide-react';
import { verifyDamageReport, rejectDamageReport } from '../../services/recovery/damageReportService';

export const DamageReporter: React.FC = () => {
  const { addDamageReport, selectedLocation, userCoords, damageReports, userRole, refreshData, showToast } = useApp();

  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [locationName, setLocationName] = useState(
    `${selectedLocation.district}, ${selectedLocation.state}`
  );
  const [infraType, setInfraType] = useState<InfrastructureType>('Roads & Bridges');
  const [severity, setSeverity] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [description, setDescription] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSimulatePhoto = () => {
    // Generate a mock file to simulate photo upload
    fetch('https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=500&auto=format&fit=crop&q=60')
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'simulated_damage.jpg', { type: 'image/jpeg' });
        setImageFile(file);
        setPhotoPreview(URL.createObjectURL(blob));
        showToast('📸 Attached sample image file.');
      })
      .catch(() => {
        // Fallback static preview url
        setPhotoPreview('https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=500&auto=format&fit=crop&q=60');
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporterName || !reporterPhone || !description) return;
    setIsSubmitting(true);

    const coords: [number, number] = userCoords || selectedLocation.coordinates;

    try {
      await addDamageReport({
        reporterName,
        reporterPhone,
        locationName,
        coordinates: coords,
        infraType,
        severity,
        description,
        imageFile: imageFile || undefined
      });

      setReporterName('');
      setReporterPhone('');
      setDescription('');
      setPhotoPreview(null);
      setImageFile(null);
    } catch (err: any) {
      showToast(`❌ Submission error: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (id: string) => {
    if (userRole !== 'admin' && userRole !== 'responder') {
      showToast('❌ Access Restricted: Verification requires Rescue Responder or Admin clearance.');
      return;
    }
    try {
      showToast('⌛ Verifying damage report...');
      await verifyDamageReport(id);
      showToast('✅ Report successfully verified!');
      refreshData();
    } catch (err: any) {
      showToast(`❌ Verification failed: ${err.message || err}`);
    }
  };

  const handleReject = async (id: string) => {
    if (userRole !== 'admin' && userRole !== 'responder') {
      showToast('❌ Access Restricted: Rejecting reports requires Rescue Responder or Admin clearance.');
      return;
    }
    try {
      showToast('⌛ Rejecting damage report...');
      await rejectDamageReport(id);
      showToast('❌ Report rejected.');
      refreshData();
    } catch (err: any) {
      showToast(`❌ Action failed: ${err.message || err}`);
    }
  };


  // Responders and Admins see all reports; citizens see only verified (unless they are the reporter, which RLS enforces)
  const visibleReports = damageReports.filter((r) => {
    if (userRole === 'admin' || userRole === 'responder') return true;
    return r.verified;
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700 uppercase">FR3.1 Post-Disaster Damage Audit</span>
          </div>
          <h3 className="text-2xl font-bold font-heading text-slate-900">Community Infrastructure Damage Portal</h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Report structural destruction, severed roads, power transformer failures, and hospital damage to accelerate official reconstruction aid.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Damage Form */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-200 bg-white space-y-5 shadow-sm">
          <h4 className="text-sm font-bold text-slate-900 uppercase font-heading">
            Submit New Infrastructure Damage Report
          </h4>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700">Reporter Name / Agency</label>
                <input
                  type="text"
                  placeholder="e.g. Suresh Menon (Ward Officer)"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Contact Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700">Affected Infrastructure Category</label>
                <select
                  value={infraType}
                  onChange={(e) => setInfraType(e.target.value as InfrastructureType)}
                  className="w-full mt-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Roads & Bridges">🌉 Roads & Bridges Cutoff</option>
                  <option value="Electricity & Power">⚡ Electricity Substation / Grid</option>
                  <option value="Housing & Buildings">🏠 Housing & Residential Collapse</option>
                  <option value="Water Supply">💧 Water Pipeline / Sewage Breach</option>
                  <option value="Medical Facility">🏥 Hospital / Clinic Damage</option>
                  <option value="Schools / Public Infra">🏫 School / Community Hall</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Damage Severity Index (1 to 5)</label>
                <div className="flex items-center gap-1.5 mt-1">
                  {([1, 2, 3, 4, 5] as const).map((lvl) => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setSeverity(lvl)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold font-mono transition border ${
                        severity === lvl
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Lvl {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Specific Location Landmark</label>
              <input
                type="text"
                placeholder="e.g. Chooralmala Main Bridge, Wayanad"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Detailed Structural Damage Description</label>
              <textarea
                rows={3}
                placeholder="Describe structural collapse, access blockages, hazards..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            {/* Photo upload input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Damage Evidence Photo</label>
                <button
                  type="button"
                  onClick={handleSimulatePhoto}
                  className="text-[11px] text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Attach Demo Image</span>
                </button>
              </div>

              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-slate-400" />
                    <p className="text-xs text-slate-500">
                      <span className="font-bold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-[10px] text-slate-400">PNG, JPG or JPEG (Max 5MB)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {photoPreview && (
                <div className="relative rounded-xl overflow-hidden h-32 border border-slate-200 mt-2">
                  <img src={photoPreview} alt="Damage Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoPreview(null);
                      setImageFile(null);
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full transition shadow-md"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-md hover:brightness-110 transition flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>{isSubmitting ? 'UPLOADING & SUBMITTING...' : 'SUBMIT DAMAGE AUDIT REPORT'}</span>
            </button>
          </form>
        </div>

        {/* Existing Reports List */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
          <h4 className="text-xs font-bold text-slate-900 uppercase font-heading tracking-wider">
            Damage Audit Log ({visibleReports.length})
          </h4>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {visibleReports.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-4">No damage audits recorded.</p>
            ) : (
              visibleReports.map((r) => (
                <div key={r.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{r.infraType}</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200 shrink-0">
                      SEVERITY {r.severity}/5
                    </span>
                  </div>
                  
                  {r.photoUrl && (
                    <div className="relative rounded-lg overflow-hidden h-20 border border-slate-200 my-1.5">
                      <img src={r.photoUrl} alt="Damage Evidence" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <p className="text-slate-700 italic">"{r.description}"</p>
                  
                  <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200 pt-1.5 mt-2">
                    <span>📍 {r.locationName}</span>
                    <span>By {r.reporterName}</span>
                  </div>

                  {/* Verification Actions for Responders / Admins */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                      r.verified 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {r.verified ? '✓ Verified' : '⌚ Pending Review'}
                    </span>

                    {!r.verified && (userRole === 'admin' || userRole === 'responder') && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleVerify(r.id)}
                          className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center justify-center"
                          title="Verify Audit"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleReject(r.id)}
                          className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition flex items-center justify-center"
                          title="Reject Audit"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
