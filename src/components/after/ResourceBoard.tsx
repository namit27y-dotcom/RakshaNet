import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ResourceListing, ResourceType } from '../../types';
import {
  PackageCheck,
  PlusCircle,
  HandHeart,
  PhoneCall,
  Search,
  CheckCircle2,
  Building,
  HeartHandshake,
  Sparkles,
  X,
  MapPin,
  Flame,
  Award
} from 'lucide-react';
import { getResourceMatches, ResourceMatch } from '../../services/recovery/ngoService';
import { allocateAid } from '../../services/recovery/aidService';

export const ResourceBoard: React.FC = () => {
  const { resources, addResource, claimResource, selectedLocation, userCoords, refreshData, showToast, userRole } = useApp();

  const [activeTab, setActiveTab] = useState<'ALL' | 'HAVE' | 'NEED'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [type, setType] = useState<'HAVE' | 'NEED'>('HAVE');
  const [itemCategory, setItemCategory] = useState<ResourceType>('Drinking Water');
  const [title, setTitle] = useState('');
  const [quantity, setQuantity] = useState('');
  const [organization, setOrganization] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');

  // Matchmaking modal states
  const [selectedNeed, setSelectedNeed] = useState<ResourceListing | null>(null);
  const [matches, setMatches] = useState<ResourceMatch[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [allocationQuantities, setAllocationQuantities] = useState<Record<string, string>>({});
  const [isAllocating, setIsAllocating] = useState<string | null>(null);

  const filteredResources = resources.filter((r) => {
    if (activeTab !== 'ALL' && r.type !== activeTab) return false;
    if (selectedCategory !== 'all' && r.itemCategory !== selectedCategory) return false;
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !quantity || !contactName || !phone) return;

    const coords: [number, number] = userCoords || selectedLocation.coordinates;

    await addResource({
      type,
      itemCategory,
      title,
      quantity,
      organization: organization || 'Individual Relief Volunteer',
      contactName,
      phone,
      locationName: `${selectedLocation.district}, ${selectedLocation.state}`,
      coordinates: coords
    });

    setTitle('');
    setQuantity('');
    setOrganization('');
    setContactName('');
    setPhone('');
    setShowAddForm(false);
  };

  const handleOpenMatchModal = async (res: ResourceListing) => {
    setSelectedNeed(res);
    setIsLoadingMatches(true);
    try {
      const results = await getResourceMatches(res.id);
      setMatches(results);
      // Pre-fill quantities
      const initialQty: Record<string, string> = {};
      const neededQty = parseFloat(res.quantity) || 1;
      results.forEach((m) => {
        initialQty[m.resourceId] = Math.min(neededQty, m.quantityAvailable).toString();
      });
      setAllocationQuantities(initialQty);
    } catch (err: any) {
      showToast(`❌ Failed to retrieve matches: ${err.message || err}`);
    } finally {
      setIsLoadingMatches(false);
    }
  };

  const handleAllocate = async (match: ResourceMatch) => {
    if (!selectedNeed) return;
    setIsAllocating(match.resourceId);

    const inputQty = parseFloat(allocationQuantities[match.resourceId]);
    const neededQty = parseFloat(selectedNeed.quantity) || 1;
    const qty = isNaN(inputQty) ? Math.min(neededQty, match.quantityAvailable) : inputQty;

    try {
      await allocateAid({
        aidNeedId: selectedNeed.id,
        ngoId: match.ngoId,
        resourceId: match.resourceId,
        quantityAllocated: qty
      });
      showToast(`✅ Allocated ${qty} units from ${match.organizationName}!`);
      refreshData();
      
      // Refresh matches list
      const results = await getResourceMatches(selectedNeed.id);
      setMatches(results);
    } catch (err: any) {
      showToast(`❌ Allocation failed: ${err.message || err}`);
    } finally {
      setIsAllocating(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <HeartHandshake className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700 uppercase">
                FR3.2 NGO & Citizen Relief Exchange
              </span>
            </div>
            <h3 className="text-2xl font-bold font-heading text-slate-900">Relief Supply Matchmaking Board</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Connect donor supplies ("HAVE") with verified shelter & community shortage demands ("NEED") to eliminate aid bottlenecking.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-md hover:brightness-110 transition shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{showAddForm ? 'Close Listing Form' : 'Post Aid Offer / Demand'}</span>
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <form
            onSubmit={handleSubmit}
            className="p-5 rounded-xl bg-slate-50 border border-emerald-200 space-y-4 pt-4 border-t border-slate-200 animate-in fade-in"
          >
            <h4 className="text-xs font-bold text-emerald-700 uppercase font-heading">
              New Relief Listing Entry
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Listing Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'HAVE' | 'NEED')}
                  className="w-full mt-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 font-bold focus:border-emerald-500 focus:outline-none"
                >
                  <option value="HAVE">🎁 HAVE (Offering Aid / Supplies)</option>
                  <option value="NEED">🆘 NEED (Requesting Urgent Aid)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Supply Category</label>
                <select
                  value={itemCategory}
                  onChange={(e) => setItemCategory(e.target.value as ResourceType)}
                  className="w-full mt-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Drinking Water">💧 Drinking Water</option>
                  <option value="Food & Rations">🍲 Food & Rations</option>
                  <option value="Medical Kits">💊 Medical Kits / Pharma</option>
                  <option value="Blankets & Clothing">👕 Blankets & Clothes</option>
                  <option value="Rescue Boats / Equipment">🚤 Rescue Boats & Gear</option>
                  <option value="Generators & Power">⚡ Generators & Fuel</option>
                  <option value="Baby & Infant Care">👶 Baby Formula & Care</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Title / Item Summary</label>
                <input
                  type="text"
                  placeholder="e.g. 500 Crates Sealed Bottled Water"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Quantity</label>
                <input
                  type="text"
                  placeholder="e.g. 200"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Organization / Group</label>
                <input
                  type="text"
                  placeholder="e.g. Rotary Club / Red Cross"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Contact Person</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Radhika"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Phone</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 font-mono focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs hover:bg-emerald-700 transition"
            >
              PUBLISH AID LISTING
            </button>
          </form>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Items ({resources.length})
          </button>
          <button
            onClick={() => setActiveTab('HAVE')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'HAVE' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🎁 Available Aid ("HAVE")
          </button>
          <button
            onClick={() => setActiveTab('NEED')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'NEED' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🆘 Needed Aid ("NEED")
          </button>
        </div>

        <div className="w-full sm:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
          >
            <option value="all">📦 All Categories</option>
            <option value="Drinking Water">💧 Drinking Water</option>
            <option value="Food & Rations">🍲 Food & Rations</option>
            <option value="Medical Kits">💊 Medical Kits</option>
            <option value="Blankets & Clothing">👕 Blankets & Clothing</option>
            <option value="Rescue Boats / Equipment">🚤 Rescue Boats</option>
            <option value="Generators & Power">⚡ Generators</option>
          </select>
        </div>
      </div>

      {/* Grid of Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredResources.map((res) => (
          <div
            key={res.id}
            className={`glass-panel p-5 rounded-2xl border transition space-y-3 bg-white ${
              res.type === 'HAVE' ? 'border-emerald-200' : 'border-amber-200'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span
                  className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                    res.type === 'HAVE'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-900 border border-amber-200'
                  }`}
                >
                  {res.type === 'HAVE' ? 'AVAILABLE OFFER' : 'URGENT NEED'}
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-1.5 font-heading">{res.title}</h4>
              </div>

              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-50 text-emerald-700 border border-slate-200 shrink-0">
                {res.quantity}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>{res.organization}</span>
              <span>•</span>
              <span>📍 {res.locationName}</span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <div className="text-slate-600">
                Contact: <span className="text-slate-900 font-bold">{res.contactName}</span>
              </div>

              {res.status === 'FULFILLED' || res.status === 'MATCHED' ? (
                <span className="px-3 py-1 rounded-lg bg-blue-100 text-blue-800 font-bold border border-blue-200 uppercase text-[10px]">
                  ✓ FULFILLED / MATCHED
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${res.phone}`}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 transition"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>Call</span>
                  </a>
                  <button
                    onClick={() => {
                      if (res.type === 'NEED') {
                        handleOpenMatchModal(res);
                      } else {
                        claimResource(res.id);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition"
                  >
                    {res.type === 'NEED' ? 'AI Match Matchmaker' : 'Match / Claim Aid'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Matchmaking Recommendation Modal */}
      {selectedNeed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white max-w-3xl w-full rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600"></div>

            <button
              onClick={() => setSelectedNeed(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black font-heading text-slate-900">
                  SURAKSHA NGO Resource Matchmaking
                </h3>
                <p className="text-xs text-slate-500">
                  Select a recommended NGO resource match for: <strong className="text-slate-800">{selectedNeed.title} ({selectedNeed.quantity})</strong>
                </p>
              </div>
            </div>

            {isLoadingMatches ? (
              <div className="py-12 text-center space-y-3">
                <Sparkles className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-700 font-mono">Running proximity & priority matchmaking engine...</p>
              </div>
            ) : matches.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <p className="text-xs font-bold text-slate-700">No suitable NGO resource matches found.</p>
                <p className="text-[10px] text-slate-500">Try listing a general request or broadening categories.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {matches.map((match) => {
                  const score = match.matchScore;
                  const scoreColor = score >= 80 ? 'text-emerald-700 bg-emerald-100 border-emerald-200' : (score >= 60 ? 'text-amber-700 bg-amber-100 border-amber-200' : 'text-rose-700 bg-rose-100 border-rose-200');

                  return (
                    <div key={match.resourceId} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase tracking-wider ${scoreColor}`}>
                            Score: {score}%
                          </span>
                          <span className="font-extrabold text-slate-900 text-sm font-heading">{match.organizationName}</span>
                          {match.verificationStatus === 'verified' && (
                            <span className="px-1.5 py-0.2 bg-blue-100 text-blue-700 text-[8px] font-bold rounded flex items-center gap-0.5 border border-blue-200 uppercase">
                              <Award className="w-2.5 h-2.5" /> Verified
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-[11px] text-slate-600 font-semibold">
                          <span className="flex items-center gap-1">
                            📦 Item: <strong className="text-slate-800">{match.itemName}</strong>
                          </span>
                          <span className="flex items-center gap-0.5">
                            📍 {match.distanceKm} km away
                          </span>
                          <span className="flex items-center gap-0.5">
                            Stock: {match.quantityAvailable} available
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-500 leading-normal italic font-semibold">
                          Recommendation Reason: {match.recommendedReason}
                        </p>
                      </div>

                      {/* Allocation form widget */}
                      <div className="flex items-center gap-2 border-t md:border-t-0 pt-2 md:pt-0">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase">Qty to Allocate</label>
                          <input
                            type="number"
                            min="1"
                            max={match.quantityAvailable}
                            value={allocationQuantities[match.resourceId] || ''}
                            onChange={(e) => setAllocationQuantities({
                              ...allocationQuantities,
                              [match.resourceId]: e.target.value
                            })}
                            className="w-20 px-2 py-1 bg-white border border-slate-200 rounded text-center font-mono font-bold"
                          />
                        </div>

                        <button
                          onClick={() => handleAllocate(match)}
                          disabled={isAllocating === match.resourceId}
                          className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold tracking-wide uppercase text-[10px] transition shrink-0"
                        >
                          {isAllocating === match.resourceId ? 'Allocating...' : 'Allocate Aid'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedNeed(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
              >
                Dismiss Matcher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
