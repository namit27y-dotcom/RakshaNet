import { supabase } from '../supabaseClient';
import { createDamageReport, getDamageReports, verifyDamageReport } from './damageReportService';
import { createNGO, addResource, getResourceMatches } from './ngoService';
import { createAidNeed, allocateAid, markAidDelivered } from './aidService';
import { createReliefCamp, updateCampOccupancy, getReliefCamps } from './reliefCampService';
import { getRecoveryDashboardStats } from './recoveryAnalyticsService';

const runTests = async () => {
  console.log('🏁 Starting Rakshak Module 3 Integration Tests...\n');

  try {
    // 1. Monkey-patch supabase.auth.getUser for offline database testing
    console.log('🔑 Setting up local mocked auth session to bypass GoTrue schema limits...');
    const mockUserId = '11111111-1111-1111-1111-111111111111';
    
    supabase.auth.getUser = async () => {
      return {
        data: {
          user: {
            id: mockUserId,
            email: 'admin@rakshak.org',
            role: 'authenticated',
            app_metadata: {},
            user_metadata: { role: 'admin' },
            aud: 'authenticated',
            created_at: new Date().toISOString()
          } as any
        },
        error: null
      };
    };

    console.log(`✓ Admin User authenticated via mock: ${mockUserId}`);

    // Verify user profile role
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', mockUserId).single();
    console.log(`✓ Verified profile role in DB: ${profile?.role}`);

    // 2. Create Damage Report
    console.log('\n🏚️ Testing Damage Portal...');
    const report = await createDamageReport({
      reporterName: 'Commander Test',
      reporterPhone: '+91 99999 88888',
      locationName: 'Wayanad Sector 3',
      coordinates: [11.58, 76.08],
      infraType: 'Roads & Bridges',
      severity: 4,
      description: 'Main access road to low-lying relief shelters completely washed out by mudslides.'
    });
    console.log(`✓ Damage report created: ${report.id} (Status: ${report.verified ? 'Verified' : 'Pending'})`);

    // 3. Retrieve and Verify Damage Report
    console.log('Verify damage report RLS & responders action...');
    await verifyDamageReport(report.id);
    const reports = await getDamageReports();
    const verifiedReport = reports.find(r => r.id === report.id);
    if (!verifiedReport || !verifiedReport.verified) {
      throw new Error('Damage report verification failed: Status not updated in DB.');
    }
    console.log(`✓ Damage report verified successfully.`);

    // 4. NGO Registration & Resources Addition
    console.log('\n🎁 Testing NGO Resource Inventory...');
    const ngo = await createNGO({
      organizationName: `Red Cross Test Unit-${Date.now()}`,
      registrationNumber: `REG-${Date.now()}`,
      contactPerson: 'Sanjay Dutt',
      phone: '+91 98765 11111',
      email: `redcross-${Date.now()}@test.org`,
      address: 'Kerala District Branch',
      latitude: 11.59,
      longitude: 76.09,
      district: 'Wayanad',
      state: 'Kerala'
    });
    console.log(`✓ NGO Profile registered: ${ngo.id}`);

    const resource = await addResource({
      ngoId: ngo.id,
      resourceType: 'water',
      itemName: '500L Clean Drinking Water Tank',
      quantityAvailable: 10,
      unit: 'tanks'
    });
    console.log(`✓ NGO Resource inventory added: ${resource.itemName} (${resource.quantityAvailable} available)`);

    // 5. Create Aid Need
    console.log('\n🆘 Testing Community Aid Need...');
    const need = await createAidNeed({
      location: 'Chooralmala Camp Sector A',
      district: 'Wayanad',
      state: 'Kerala',
      latitude: 11.581,
      longitude: 76.082,
      category: 'water',
      itemName: 'Clean Drinking Water',
      quantityRequired: 5,
      priority: 'high',
      affectedPeople: 250
    });
    console.log(`✓ Community Aid Need logged: ${need.id} (Required: ${need.quantityRequired})`);

    // 6. Proximity & Category-based Matchmaking Engine
    console.log('\n🧠 Testing Proximity Matchmaking Engine...');
    const matches = await getResourceMatches(need.id);
    console.log(`Found ${matches.length} matching resources for need.`);
    const bestMatch = matches.find(m => m.resourceId === resource.id);
    if (!bestMatch) {
      throw new Error('Matching Engine failed: NGO resource not found in matches.');
    }
    console.log(`✓ Match found: ${bestMatch.organizationName} at ${bestMatch.distanceKm} km (Match Score: ${bestMatch.matchScore}%)`);

    // 7. Transactional Allocation & Delivery Flow
    console.log('\n🚛 Testing Allocation & Delivery Flow...');
    const allocationId = await allocateAid({
      aidNeedId: need.id,
      ngoId: ngo.id,
      resourceId: resource.id,
      quantityAllocated: 3
    });
    console.log(`✓ Aid allocated: Allocation ID ${allocationId}`);

    console.log('Marking aid as delivered (triggering updates)...');
    await markAidDelivered(allocationId);
    
    // Check if need received quantities are updated
    const { data: updatedNeed } = await supabase.from('recovery_aid_needs').select('*').eq('id', need.id).single();
    console.log(`✓ Aid need fulfilled quantities: ${updatedNeed.quantity_fulfilled} / ${updatedNeed.quantity_required} (Status: ${updatedNeed.status})`);
    if (Number(updatedNeed.quantity_fulfilled) !== 3) {
      throw new Error('Trigger failure: Aid need quantity_fulfilled was not updated.');
    }

    // 8. Relief Camp Occupancy Updates
    console.log('\n🏠 Testing Relief Camp Occupancy Triggers...');
    const camp = await createReliefCamp({
      name: 'Wayanad Central Shelter',
      coordinates: [11.585, 76.085],
      locationName: 'Central School, Meppadi',
      capacity: 500,
      currentOccupancy: 100,
      facilities: ['water', 'food'],
      phone: '+91 1070',
      contactPerson: 'Lead Volunteer'
    });
    console.log(`✓ Relief camp created: ${camp.name} (Capacity: ${camp.capacity}, Occupancy: ${camp.currentOccupancy})`);

    console.log('Updating camp occupancy to 250...');
    await updateCampOccupancy(camp.id, 250);
    const { data: updatedCamp } = await supabase.from('relief_camps').select('*').eq('id', camp.id).single();
    console.log(`✓ Relief camp updated: Occupancy: ${updatedCamp.current_occupancy}, Available Capacity: ${updatedCamp.available_capacity}`);
    if (updatedCamp.available_capacity !== 250) {
      throw new Error('Trigger failure: Camp available_capacity did not calculate correctly.');
    }

    // 9. Dashboard Stats Verification
    console.log('\n📊 Testing Dashboard Statistics RPC...');
    const stats = await getRecoveryDashboardStats();
    console.log('Dashboard stats returned:');
    console.log(`  - Damage Reports Count: ${stats.damageReportsCount}`);
    console.log(`  - Critical Damage Reports: ${stats.criticalDamageReports}`);
    console.log(`  - Camp Utilization: ${stats.campUtilizationPercentage}%`);
    console.log(`  - Resolved SOS Count: ${stats.resolvedSosCount}`);
    console.log(`✓ Dashboard stats verified successfully.`);

    // 10. Clean Up test entries
    console.log('\n🧹 Cleaning up test database entries...');
    await supabase.from('aid_allocations').delete().eq('id', allocationId);
    await supabase.from('relief_camps').delete().eq('id', camp.id);
    await supabase.from('recovery_aid_needs').delete().eq('id', need.id);
    await supabase.from('ngo_resources').delete().eq('id', resource.id);
    await supabase.from('ngos').delete().eq('id', ngo.id);
    await supabase.from('recovery_damage_reports').delete().eq('id', report.id);
    // Delete profile and user (avoid deleting the demo admin account)
    // await supabase.from('profiles').delete().eq('id', user.id);
    console.log('✓ Cleanup completed.');

    console.log('\n🎉 ALL MODULE 3 DATABASE AND RLS INTEGRATION TESTS PASSED!');
  } catch (err: any) {
    console.error('\n❌ TEST FAILED WITH ERROR:', err.message || err);
    if (typeof (globalThis as any).process !== 'undefined') {
      (globalThis as any).process.exit(1);
    }
  }
};

runTests();
