/**
 * In-memory sample data for "areas".
 * Shape: { id, name, city, state, center: { lat, lng }, zoom }
 *
 * This module stands in for a real government-data API / database.
 * Services should treat this as the single read source so it can be
 * swapped for a real API/DB later without touching controllers.
 */

const areas = [
  {
    id: 'indiranagar-blr',
    name: 'Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    center: { lat: 12.9784, lng: 77.6408 },
    zoom: 14,
  },
  {
    id: 'kothrud-pune',
    name: 'Kothrud',
    city: 'Pune',
    state: 'Maharashtra',
    center: { lat: 18.5074, lng: 73.8077 },
    zoom: 14,
  },
  {
    id: 'dwarka-delhi',
    name: 'Dwarka',
    city: 'New Delhi',
    state: 'Delhi',
    center: { lat: 28.5921, lng: 77.046 },
    zoom: 13,
  },
];

module.exports = areas;
