/**
 * In-memory sample data for "projects".
 * Shape:
 * {
 *   id, areaId,
 *   name, type: 'road'|'building'|'bridge'|'park'|'utility',
 *   status: 'planned'|'in-progress'|'completed',
 *   budget, spent, currency: 'INR',
 *   contractor, startDate, endDate,
 *   location: { lat, lng },
 *   description,
 *   spendingBreakdown: [ { category, amount } ],
 *   updates: [ { date, title, note } ],
 * }
 *
 * This module stands in for a real government-data API / database.
 * Services should treat this as the single read source so it can be
 * swapped for a real API/DB later without touching controllers.
 */

const projects = [
  // ---- Indiranagar, Bengaluru ----
  {
    id: 'prj-blr-01',
    areaId: 'indiranagar-blr',
    name: '100 Feet Road Widening & Footpath Upgrade',
    type: 'road',
    status: 'planned',
    budget: 45000000,
    spent: 1200000,
    currency: 'INR',
    contractor: 'Karnataka Road Development Corporation',
    startDate: '2026-09-01',
    endDate: '2027-06-30',
    location: { lat: 12.975, lng: 77.6389 },
    description:
      'Widening of the 100 Feet Road stretch between CMH Road and Old Airport Road junction, including continuous footpaths, stormwater drains, and cycle lane markings.',
    spendingBreakdown: [
      { category: 'Survey & Design', amount: 800000 },
      { category: 'Mobilization Advance', amount: 400000 },
    ],
    updates: [
      {
        date: '2026-05-10',
        title: 'Tender Awarded',
        note: 'Contract awarded to Karnataka Road Development Corporation after technical evaluation.',
      },
      {
        date: '2026-06-20',
        title: 'Survey Completed',
        note: 'Topographic survey and utility mapping completed ahead of construction start.',
      },
    ],
  },
  {
    id: 'prj-blr-02',
    areaId: 'indiranagar-blr',
    name: 'Indiranagar Ward Office Modernization',
    type: 'building',
    status: 'in-progress',
    budget: 32000000,
    spent: 18500000,
    currency: 'INR',
    contractor: 'BBMP Civil Works Division',
    startDate: '2025-11-01',
    endDate: '2026-10-31',
    location: { lat: 12.9805, lng: 77.641 },
    description:
      'Structural retrofit and modernization of the Indiranagar ward office, including citizen service counters, solar rooftop, and accessibility ramps.',
    spendingBreakdown: [
      { category: 'Structural Retrofit', amount: 9000000 },
      { category: 'Electrical & Solar', amount: 5500000 },
      { category: 'Interior & Accessibility', amount: 4000000 },
    ],
    updates: [
      {
        date: '2025-12-15',
        title: 'Foundation Work Complete',
        note: 'Structural reinforcement of the ground floor completed on schedule.',
      },
      {
        date: '2026-03-10',
        title: 'Solar Rooftop Installed',
        note: '20kW rooftop solar array installed and grid-connected.',
      },
      {
        date: '2026-06-05',
        title: 'Interior Fit-out Underway',
        note: 'Citizen service counters and accessibility ramps under construction.',
      },
    ],
  },
  {
    id: 'prj-blr-03',
    areaId: 'indiranagar-blr',
    name: 'Domlur Flyover Rehabilitation',
    type: 'bridge',
    status: 'completed',
    budget: 28000000,
    spent: 27400000,
    currency: 'INR',
    contractor: 'L&T Infrastructure',
    startDate: '2024-08-01',
    endDate: '2025-12-15',
    location: { lat: 12.9612, lng: 77.6387 },
    description:
      'Structural rehabilitation and expansion joint replacement on the Domlur flyover connecting Indiranagar to the Outer Ring Road.',
    spendingBreakdown: [
      { category: 'Structural Repair', amount: 14000000 },
      { category: 'Expansion Joints', amount: 6400000 },
      { category: 'Waterproofing & Painting', amount: 4500000 },
      { category: 'Traffic Management', amount: 2500000 },
    ],
    updates: [
      {
        date: '2024-09-20',
        title: 'Traffic Diversion Started',
        note: 'Lane closures implemented to allow structural inspection and repair work.',
      },
      {
        date: '2025-04-18',
        title: 'Expansion Joints Replaced',
        note: 'All eight expansion joints replaced and load tested.',
      },
      {
        date: '2025-12-15',
        title: 'Flyover Reopened',
        note: 'Full rehabilitation completed; flyover reopened to traffic in both directions.',
      },
    ],
  },
  {
    id: 'prj-blr-04',
    areaId: 'indiranagar-blr',
    name: 'Defence Colony Lake Park Development',
    type: 'park',
    status: 'planned',
    budget: 15000000,
    spent: 500000,
    currency: 'INR',
    contractor: 'Bengaluru Urban Forestry Cell',
    startDate: '2026-10-01',
    endDate: '2027-05-31',
    location: { lat: 12.9838, lng: 77.6455 },
    description:
      'Development of a new lakeside public park with walking trails, native plantation, and an open-air amphitheater.',
    spendingBreakdown: [
      { category: 'Landscape Design', amount: 300000 },
      { category: 'Soil Testing', amount: 200000 },
    ],
    updates: [
      {
        date: '2026-04-01',
        title: 'Public Consultation Held',
        note: 'Resident welfare associations consulted on park layout and amenities.',
      },
      {
        date: '2026-06-25',
        title: 'Design Finalized',
        note: 'Final landscape design approved by the BBMP parks committee.',
      },
    ],
  },
  {
    id: 'prj-blr-05',
    areaId: 'indiranagar-blr',
    name: 'Indiranagar Underground Cabling Project',
    type: 'utility',
    status: 'in-progress',
    budget: 22000000,
    spent: 9800000,
    currency: 'INR',
    contractor: 'BESCOM Infrastructure Wing',
    startDate: '2026-01-15',
    endDate: '2026-11-30',
    location: { lat: 12.977, lng: 77.644 },
    description:
      'Conversion of overhead electrical lines to underground cabling to improve reliability and reduce visual clutter along 12th Main and 100 Feet Road.',
    spendingBreakdown: [
      { category: 'Trenching & Ducting', amount: 5200000 },
      { category: 'Cable Procurement', amount: 3600000 },
      { category: 'Restoration of Roads', amount: 1000000 },
    ],
    updates: [
      {
        date: '2026-02-10',
        title: 'Trenching Started',
        note: "Trenching work began on 12th Main Road in phases to minimize disruption.",
      },
      {
        date: '2026-05-22',
        title: '50% Cabling Complete',
        note: 'Underground cabling completed for the 12th Main stretch; work moving to 100 Feet Road.',
      },
    ],
  },

  // ---- Kothrud, Pune ----
  {
    id: 'prj-pun-01',
    areaId: 'kothrud-pune',
    name: 'Kothrud-Warje Connector Road Upgrade',
    type: 'road',
    status: 'in-progress',
    budget: 60000000,
    spent: 34000000,
    currency: 'INR',
    contractor: 'Pune Municipal Corporation - Roads Dept',
    startDate: '2025-10-01',
    endDate: '2026-12-31',
    location: { lat: 18.501, lng: 73.809 },
    description:
      'Four-laning and drainage upgrade of the connector road between Kothrud Depot and Warje, including a dedicated bus corridor.',
    spendingBreakdown: [
      { category: 'Road Widening', amount: 18000000 },
      { category: 'Drainage Works', amount: 9000000 },
      { category: 'Bus Corridor Infrastructure', amount: 7000000 },
    ],
    updates: [
      {
        date: '2025-11-15',
        title: 'Utility Shifting Completed',
        note: 'Water and gas lines relocated ahead of widening work.',
      },
      {
        date: '2026-02-20',
        title: 'Drainage Work 70% Complete',
        note: 'Stormwater drains laid along most of the corridor.',
      },
      {
        date: '2026-06-01',
        title: 'Road Widening Underway',
        note: 'Four-laning work progressing on the Warje side of the corridor.',
      },
    ],
  },
  {
    id: 'prj-pun-02',
    areaId: 'kothrud-pune',
    name: 'Kothrud Citizen Facilitation Centre',
    type: 'building',
    status: 'completed',
    budget: 18000000,
    spent: 17650000,
    currency: 'INR',
    contractor: 'PMC Building Works Division',
    startDate: '2024-06-01',
    endDate: '2025-03-31',
    location: { lat: 18.506, lng: 73.807 },
    description:
      'New citizen facilitation centre offering single-window civic services, property tax counters, and a public grievance cell.',
    spendingBreakdown: [
      { category: 'Civil Construction', amount: 11000000 },
      { category: 'IT & Service Counters', amount: 4200000 },
      { category: 'Furniture & Fixtures', amount: 2450000 },
    ],
    updates: [
      {
        date: '2024-08-10',
        title: 'Construction Commenced',
        note: 'Ground-breaking for the new facilitation centre building.',
      },
      {
        date: '2025-01-20',
        title: 'Structure Completed',
        note: 'Civil structure and roofing completed; interior work commenced.',
      },
      {
        date: '2025-03-31',
        title: 'Centre Opened to Public',
        note: 'Facilitation centre inaugurated and single-window services made operational.',
      },
    ],
  },
  {
    id: 'prj-pun-03',
    areaId: 'kothrud-pune',
    name: 'Vithalwadi Nullah Bridge Construction',
    type: 'bridge',
    status: 'planned',
    budget: 21000000,
    spent: 250000,
    currency: 'INR',
    contractor: 'To be finalized',
    startDate: '2026-11-01',
    endDate: '2027-08-31',
    location: { lat: 18.5095, lng: 73.8055 },
    description:
      'New vehicular bridge over the Vithalwadi nullah to relieve congestion at the existing narrow crossing.',
    spendingBreakdown: [
      { category: 'Preliminary Survey', amount: 150000 },
      { category: 'Geotechnical Investigation', amount: 100000 },
    ],
    updates: [
      {
        date: '2026-05-05',
        title: 'Project Approved',
        note: 'PMC general body approved budget allocation for the new bridge.',
      },
      {
        date: '2026-06-28',
        title: 'Tender Floated',
        note: 'Tender notice published inviting bids from qualified contractors.',
      },
    ],
  },
  {
    id: 'prj-pun-04',
    areaId: 'kothrud-pune',
    name: 'Kothrud Hill Garden Restoration',
    type: 'park',
    status: 'in-progress',
    budget: 9000000,
    spent: 5200000,
    currency: 'INR',
    contractor: 'Pune Garden & Tree Authority',
    startDate: '2025-09-01',
    endDate: '2026-09-30',
    location: { lat: 18.504, lng: 73.811 },
    description:
      'Restoration of the hilltop garden with terraced walking paths, native tree plantation, and rainwater harvesting pits.',
    spendingBreakdown: [
      { category: 'Terracing & Pathways', amount: 2800000 },
      { category: 'Plantation', amount: 1400000 },
      { category: 'Rainwater Harvesting', amount: 1000000 },
    ],
    updates: [
      {
        date: '2025-10-12',
        title: 'Terracing Work Started',
        note: 'Slope stabilization and terraced pathway construction began.',
      },
      {
        date: '2026-01-30',
        title: 'Plantation Drive Held',
        note: 'Over 500 native saplings planted with resident volunteer participation.',
      },
      {
        date: '2026-05-15',
        title: 'Rainwater Pits Completed',
        note: 'Rainwater harvesting pits completed across the garden site.',
      },
    ],
  },
  {
    id: 'prj-pun-05',
    areaId: 'kothrud-pune',
    name: 'Kothrud Water Supply Pipeline Renewal',
    type: 'utility',
    status: 'completed',
    budget: 26000000,
    spent: 26850000,
    currency: 'INR',
    contractor: 'Pune Water Supply Department',
    startDate: '2024-04-01',
    endDate: '2025-02-28',
    location: { lat: 18.5085, lng: 73.8025 },
    description:
      'Replacement of aging cast-iron water supply pipelines across Kothrud with high-density polyethylene piping to reduce leakage.',
    spendingBreakdown: [
      { category: 'Pipeline Procurement', amount: 12500000 },
      { category: 'Excavation & Laying', amount: 9000000 },
      { category: 'Road Restoration', amount: 3600000 },
      { category: 'Contingency Overrun', amount: 1750000 },
    ],
    updates: [
      {
        date: '2024-05-20',
        title: 'Phase 1 Pipeline Laid',
        note: 'Old pipelines replaced along Paud Road stretch.',
      },
      {
        date: '2024-11-10',
        title: 'Leak Detection Survey',
        note: 'Survey identified additional leakage points requiring extra pipe replacement, extending scope.',
      },
      {
        date: '2025-02-28',
        title: 'Project Completed',
        note: 'All identified pipeline sections replaced; final cost exceeded budget due to additional leak repairs.',
      },
    ],
  },

  // ---- Dwarka, New Delhi ----
  {
    id: 'prj-del-01',
    areaId: 'dwarka-delhi',
    name: 'Dwarka Sector 12 Road Resurfacing',
    type: 'road',
    status: 'completed',
    budget: 15000000,
    spent: 14200000,
    currency: 'INR',
    contractor: 'Delhi PWD',
    startDate: '2025-01-10',
    endDate: '2025-06-20',
    location: { lat: 28.589, lng: 77.043 },
    description:
      "Complete resurfacing and lane-marking renewal of internal roads in Dwarka Sector 12, including pothole repair and pedestrian crossings.",
    spendingBreakdown: [
      { category: 'Resurfacing', amount: 9500000 },
      { category: 'Lane Marking & Signage', amount: 2700000 },
      { category: 'Pedestrian Crossings', amount: 2000000 },
    ],
    updates: [
      {
        date: '2025-02-01',
        title: 'Resurfacing Started',
        note: "Milling and resurfacing work began on the sector's main internal roads.",
      },
      {
        date: '2025-04-15',
        title: 'Signage Installed',
        note: 'New lane markings and traffic signage installed.',
      },
      {
        date: '2025-06-20',
        title: 'Work Completed',
        note: 'Road resurfacing completed and reopened to full traffic.',
      },
    ],
  },
  {
    id: 'prj-del-02',
    areaId: 'dwarka-delhi',
    name: 'Dwarka Sector 10 Community Hall',
    type: 'building',
    status: 'planned',
    budget: 24000000,
    spent: 900000,
    currency: 'INR',
    contractor: 'DDA Civil Construction Wing',
    startDate: '2026-09-15',
    endDate: '2027-07-31',
    location: { lat: 28.5955, lng: 77.05 },
    description:
      'Construction of a new multi-purpose community hall for cultural events, civic meetings, and disaster shelter use.',
    spendingBreakdown: [
      { category: 'Architectural Design', amount: 600000 },
      { category: 'Soil Investigation', amount: 300000 },
    ],
    updates: [
      {
        date: '2026-04-20',
        title: 'Land Allotted',
        note: 'DDA allotted the site for community hall construction.',
      },
      {
        date: '2026-06-15',
        title: 'Design Approved',
        note: 'Architectural design and layout approved by the local ward committee.',
      },
    ],
  },
  {
    id: 'prj-del-03',
    areaId: 'dwarka-delhi',
    name: 'Dwarka Sector 21 Metro Underpass',
    type: 'bridge',
    status: 'in-progress',
    budget: 55000000,
    spent: 31000000,
    currency: 'INR',
    contractor: 'Delhi Metro Rail Corporation - Civil Wing',
    startDate: '2025-05-01',
    endDate: '2026-12-15',
    location: { lat: 28.5525, lng: 77.059 },
    description:
      'Construction of a vehicular underpass near Dwarka Sector 21 metro station to ease traffic congestion at the level crossing.',
    spendingBreakdown: [
      { category: 'Excavation & Shoring', amount: 14000000 },
      { category: 'Structural Concrete', amount: 12000000 },
      { category: 'Drainage & Waterproofing', amount: 5000000 },
    ],
    updates: [
      {
        date: '2025-06-18',
        title: 'Excavation Started',
        note: 'Deep excavation work began adjacent to the metro station.',
      },
      {
        date: '2025-12-05',
        title: 'Shoring Completed',
        note: 'Retaining structures completed, enabling safe excavation to full depth.',
      },
      {
        date: '2026-05-10',
        title: 'Concreting Underway',
        note: 'Base slab and wall concreting in progress for the underpass structure.',
      },
    ],
  },
  {
    id: 'prj-del-04',
    areaId: 'dwarka-delhi',
    name: 'Dwarka Sector 9 District Park Upgrade',
    type: 'park',
    status: 'completed',
    budget: 12000000,
    spent: 11480000,
    currency: 'INR',
    contractor: 'DDA Horticulture Department',
    startDate: '2024-10-01',
    endDate: '2025-05-15',
    location: { lat: 28.581, lng: 77.0605 },
    description:
      "Upgrade of the district park with new jogging track, open-air gym, children's play area, and LED lighting.",
    spendingBreakdown: [
      { category: 'Jogging Track', amount: 3800000 },
      { category: 'Open-air Gym', amount: 2200000 },
      { category: "Children's Play Area", amount: 3080000 },
      { category: 'LED Lighting', amount: 2400000 },
    ],
    updates: [
      {
        date: '2024-11-05',
        title: 'Jogging Track Laid',
        note: 'New rubberized jogging track completed around the park perimeter.',
      },
      {
        date: '2025-02-10',
        title: 'Play Area Installed',
        note: "Children's play equipment and open-air gym stations installed.",
      },
      {
        date: '2025-05-15',
        title: 'Park Reopened',
        note: 'Upgraded park reopened to the public with new LED lighting operational.',
      },
    ],
  },
  {
    id: 'prj-del-05',
    areaId: 'dwarka-delhi',
    name: 'Dwarka Sub-Station Capacity Augmentation',
    type: 'utility',
    status: 'planned',
    budget: 40000000,
    spent: 2000000,
    currency: 'INR',
    contractor: 'BSES Rajdhani Power Limited',
    startDate: '2026-12-01',
    endDate: '2027-10-31',
    location: { lat: 28.597, lng: 77.039 },
    description:
      'Augmentation of the local electrical substation capacity to meet rising residential demand and reduce outage frequency.',
    spendingBreakdown: [
      { category: 'Feasibility Study', amount: 1200000 },
      { category: 'Land & Statutory Clearances', amount: 800000 },
    ],
    updates: [
      {
        date: '2026-03-12',
        title: 'Feasibility Study Completed',
        note: 'Load study confirmed need for capacity augmentation at the sector substation.',
      },
      {
        date: '2026-06-10',
        title: 'Clearances in Process',
        note: 'Statutory clearances for equipment installation are being processed.',
      },
    ],
  },
];

module.exports = projects;
