import { HelpRequest, SafeCheckin, Shelter, DamageReport, ResourceListing, ChecklistItem } from '../types';

export const INITIAL_HELP_REQUESTS: HelpRequest[] = [
  {
    id: 'sos-101',
    name: 'Rajesh Kumar',
    phone: '+91 98401 22314',
    coordinates: [13.0850, 80.2740],
    locationName: 'Vyasa Padi, Chennai',
    category: 'Trapped',
    urgency: 'CRITICAL',
    peopleCount: 4,
    note: 'Water reached 1st floor roof. Elderly mother needs insulin & evacuation boat!',
    timestamp: '12 mins ago',
    status: 'PENDING'
  },
  {
    id: 'sos-102',
    name: 'Ananya Roy',
    phone: '+91 94350 88123',
    coordinates: [24.8350, 92.7820],
    locationName: 'Tarapur, Silchar',
    category: 'Food & Water',
    urgency: 'HIGH',
    peopleCount: 6,
    note: 'No clean drinking water or food for 3 days. 2 infant children in house.',
    timestamp: '25 mins ago',
    status: 'PENDING'
  },
  {
    id: 'sos-103',
    name: 'Vipin Das',
    phone: '+91 97442 11980',
    coordinates: [11.6880, 76.1350],
    locationName: 'Chooralmala, Wayanad',
    category: 'Trapped',
    urgency: 'CRITICAL',
    peopleCount: 3,
    note: 'Road washed out by mudslide. Trapped near primary school building.',
    timestamp: '42 mins ago',
    status: 'DISPATCHED'
  },
  {
    id: 'sos-104',
    name: 'Priya Sharma',
    phone: '+91 98160 55432',
    coordinates: [31.1080, 77.1760],
    locationName: 'Summer Hill, Shimla',
    category: 'Evacuation',
    urgency: 'HIGH',
    peopleCount: 2,
    note: 'Cracks appearing on hillside foundation. Need safe transport to relief camp.',
    timestamp: '1 hour ago',
    status: 'PENDING'
  },
  {
    id: 'sos-105',
    name: 'Mohd. Salim',
    phone: '+91 93341 09876',
    coordinates: [25.5980, 85.1410],
    locationName: 'Kankarbagh, Patna',
    category: 'Medical',
    urgency: 'CRITICAL',
    peopleCount: 1,
    note: 'Dialysis patient stranded due to 3ft waist-deep waterlogging outside home.',
    timestamp: '2 hours ago',
    status: 'PENDING'
  }
];

export const INITIAL_SAFE_CHECKINS: SafeCheckin[] = [
  {
    id: 'safe-201',
    name: 'Siddharth Nair',
    phone: '+91 98950 12345',
    coordinates: [11.6800, 76.1300],
    locationName: 'Meppadi Safe Camp, Wayanad',
    message: 'Evacuated safely with family to higher ground. We are okay!',
    timestamp: '15 mins ago'
  },
  {
    id: 'safe-202',
    name: 'Kavita Sundaram',
    phone: '+91 98410 77654',
    coordinates: [13.0780, 80.2650],
    locationName: 'Kilpauk, Chennai',
    message: 'Power is off but house is dry. Safe and sound.',
    timestamp: '38 mins ago'
  },
  {
    id: 'safe-203',
    name: 'Amitabh Choudhury',
    phone: '+91 94360 44321',
    coordinates: [24.8290, 92.7750],
    locationName: 'Rangirkhari, Silchar',
    message: 'Moved to 2nd floor of relief shelter. Reached safely.',
    timestamp: '1 hour ago'
  }
];

export const INITIAL_SHELTERS: Shelter[] = [
  {
    id: 'sh-301',
    name: 'St. Xavier Community Relief Hub',
    locationName: 'Velachery Main Rd, Chennai',
    coordinates: [13.0012, 80.2244],
    capacity: 450,
    currentOccupancy: 310,
    facilities: ['Clean Water', 'Medical Doctor on Site', 'Hot Meals', 'Mobile Charging'],
    contactPerson: 'Fr. Thomas / NDRF Unit 4',
    phone: '+91 44 2245 9900',
    status: 'OPEN'
  },
  {
    id: 'sh-302',
    name: 'Silchar Govt Higher Secondary School Camp',
    locationName: 'Circuit House Road, Silchar',
    coordinates: [24.8390, 92.7910],
    capacity: 600,
    currentOccupancy: 540,
    facilities: ['Infant Food', 'First Aid', 'Blankets', 'Sanitary Kits'],
    contactPerson: 'District Collector Control Room',
    phone: '+91 3842 245021',
    status: 'OPEN'
  },
  {
    id: 'sh-303',
    name: 'Meppadi Govt Higher Secondary Shelter',
    locationName: 'Meppadi Town, Wayanad',
    coordinates: [11.5540, 76.1210],
    capacity: 350,
    currentOccupancy: 345,
    facilities: ['Trauma Counseling', 'Emergency Medical Ward', 'Helipad Access'],
    contactPerson: 'Tahsildar Wayanad',
    phone: '+91 4936 202251',
    status: 'OPEN'
  },
  {
    id: 'sh-304',
    name: 'Cyclone Shelter #4 - Balasore Coast',
    locationName: 'Chandipur, Odisha',
    coordinates: [21.4700, 87.0200],
    capacity: 1000,
    currentOccupancy: 220,
    facilities: ['Wind-Resistant Structure', 'Solar Backup Generators', 'Satellite Phone'],
    contactPerson: 'ODRAF Officer Mohanty',
    phone: '+91 6782 262055',
    status: 'OPEN'
  }
];

export const INITIAL_DAMAGE_REPORTS: DamageReport[] = [
  {
    id: 'dmg-401',
    reporterName: 'Suresh Menon',
    reporterPhone: '+91 97451 00998',
    locationName: 'Chooralmala Bridge Area, Wayanad',
    coordinates: [11.6870, 76.1340],
    infraType: 'Roads & Bridges',
    severity: 5,
    description: 'Main concrete bridge completely washed away. Access cut off to upper villages.',
    timestamp: '2 hours ago',
    verified: true
  },
  {
    id: 'dmg-402',
    reporterName: 'Prakash Rao',
    reporterPhone: '+91 98402 11223',
    locationName: 'Substation 4, Velachery, Chennai',
    coordinates: [12.9780, 80.2190],
    infraType: 'Electricity & Power',
    severity: 4,
    description: 'Electrical transformer submerged under 4ft water. Substation disabled.',
    timestamp: '4 hours ago',
    verified: true
  },
  {
    id: 'dmg-403',
    reporterName: 'Biren Gogoi',
    reporterPhone: '+91 94351 77665',
    locationName: 'Primary Health Centre, Silchar',
    coordinates: [24.8310, 92.7720],
    infraType: 'Medical Facility',
    severity: 4,
    description: 'Ground floor medical inventory damaged by silt water. Emergency power failed.',
    timestamp: '5 hours ago',
    verified: false
  }
];

export const INITIAL_RESOURCES: ResourceListing[] = [
  {
    id: 'res-501',
    type: 'HAVE',
    itemCategory: 'Drinking Water',
    title: '5,000 Liters Sealed Mineral Water Packs',
    quantity: '500 Crates (10L each)',
    organization: 'Rotary Club Emergency Relief',
    contactName: 'Arvind Swamy',
    phone: '+91 98400 33445',
    locationName: 'Anna Nagar, Chennai',
    coordinates: [13.0878, 80.2170],
    timestamp: '30 mins ago',
    status: 'OPEN'
  },
  {
    id: 'res-502',
    type: 'NEED',
    itemCategory: 'Medical Kits',
    title: 'Urgent Need: Tetanus Shots, Antibiotics, Bandages',
    quantity: '200 First Aid Units',
    organization: 'Wayanad Community Clinic',
    contactName: 'Dr. Radhika',
    phone: '+91 4936 220011',
    locationName: 'Meppadi, Wayanad',
    coordinates: [11.5540, 76.1210],
    timestamp: '1 hour ago',
    status: 'OPEN'
  },
  {
    id: 'res-503',
    type: 'HAVE',
    itemCategory: 'Rescue Boats / Equipment',
    title: '2 Inflatable Motorized Rescue Boats with Lifejackets',
    quantity: '2 Boats + 12 Jackets',
    organization: 'Seva Volunteer Rescue Group',
    contactName: 'Capt. Manpreet',
    phone: '+91 98110 55667',
    locationName: 'Silchar Ghat',
    coordinates: [24.8360, 92.7800],
    timestamp: '2 hours ago',
    status: 'OPEN'
  },
  {
    id: 'res-504',
    type: 'NEED',
    itemCategory: 'Generators & Power',
    title: 'Need 50kVA Heavy Duty Generators for Oxygen Plant Backup',
    quantity: '2 Generators',
    organization: 'District District Hospital Patna',
    contactName: 'Eng. Rakesh Sinha',
    phone: '+91 93340 12890',
    locationName: 'Patna Central Hospital',
    coordinates: [25.6020, 85.1450],
    timestamp: '3 hours ago',
    status: 'OPEN'
  }
];

export const PREPAREDNESS_CHECKLIST_SEED: ChecklistItem[] = [
  // Water & Food
  {
    id: 'ck-1',
    category: 'Water & Food',
    title: 'Clean Water Supply',
    description: '3 liters of water per person per day for at least 3 days (storage in sealed food-grade containers).',
    disasters: ['all'],
    forProfiles: ['general']
  },
  {
    id: 'ck-2',
    category: 'Water & Food',
    title: 'Non-Perishable Ready-to-Eat Food',
    description: 'High-energy foods like dry fruits, nuts, energy bars, ORS packets, canned items (with manual opener).',
    disasters: ['all'],
    forProfiles: ['general']
  },
  {
    id: 'ck-3',
    category: 'Water & Food',
    title: 'Infant Formula & Sterilized Bottles',
    description: '3-5 days supply of baby formula powder, warm water flask, and baby food jars.',
    disasters: ['all'],
    forProfiles: ['kids']
  },
  {
    id: 'ck-4',
    category: 'Water & Food',
    title: 'Pet Food & Portable Bowls',
    description: 'Dry kibble, leash, pet ID tags, and collapsible water bowl.',
    disasters: ['all'],
    forProfiles: ['pets']
  },
  // Medical
  {
    id: 'ck-5',
    category: 'Medical',
    title: 'Personal Prescription Medicines',
    description: 'Minimum 14-day supply of critical daily medications (Insulin, BP, Cardiac, Asthma inhalers).',
    disasters: ['all'],
    forProfiles: ['elderly', 'general']
  },
  {
    id: 'ck-6',
    category: 'Medical',
    title: 'Comprehensive First Aid Kit',
    description: 'Antiseptic solution (Betadine/Dettol), sterile gauze, band-aids, burn ointment, paracetamol, anti-diarrheal tablets.',
    disasters: ['all'],
    forProfiles: ['general']
  },
  // Documents & Cash
  {
    id: 'ck-7',
    category: 'Documents & Cash',
    title: 'Waterproof Document Pouch',
    description: 'Aadhaar cards, insurance policies, property deeds, medical history in double-sealed ziplock bags.',
    disasters: ['flood', 'cyclone'],
    forProfiles: ['general']
  },
  {
    id: 'ck-8',
    category: 'Documents & Cash',
    title: 'Emergency Cash in Small Denominations',
    description: 'ATMs & UPI digital payments fail during blackouts. Keep ₹3,000–₹5,000 in cash notes.',
    disasters: ['all'],
    forProfiles: ['general']
  },
  // Safety Tools
  {
    id: 'ck-9',
    category: 'Safety Tools',
    title: 'High-Lumen Torch & Power Bank',
    description: 'Heavy duty waterproof LED flashlight with extra batteries + fully charged 20,000mAh power bank.',
    disasters: ['all'],
    forProfiles: ['general']
  },
  {
    id: 'ck-10',
    category: 'Safety Tools',
    title: 'Loud Emergency Whistle',
    description: 'Crucial for signaling rescue teams if trapped under rubble or stranded in flood waters.',
    disasters: ['earthquake', 'flood', 'landslide'],
    forProfiles: ['general', 'kids']
  },
  {
    id: 'ck-11',
    category: 'Safety Tools',
    title: 'Battery Radio / FM Receiver',
    description: 'For receiving official All India Radio / SDMA emergency warnings when cellular networks crash.',
    disasters: ['cyclone', 'flood'],
    forProfiles: ['general']
  }
];
