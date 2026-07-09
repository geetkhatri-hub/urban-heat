export interface CityMetadata {
  id: string;
  name: string;
  state: string;
  coordinates: [number, number]; // [lat, lng]
}

export const CITIES: CityMetadata[] = [
  { id: 'bengaluru', name: 'Bengaluru', state: 'Karnataka', coordinates: [12.9716, 77.5946] },
  { id: 'delhi', name: 'Delhi', state: 'Delhi NCT', coordinates: [28.6139, 77.2090] },
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra', coordinates: [19.0760, 72.8777] },
  { id: 'chennai', name: 'Chennai', state: 'Tamil Nadu', coordinates: [13.0827, 80.2707] },
  { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana', coordinates: [17.3850, 78.4867] },
  { id: 'pune', name: 'Pune', state: 'Maharashtra', coordinates: [18.5204, 73.8567] },
  { id: 'kolkata', name: 'Kolkata', state: 'West Bengal', coordinates: [22.5726, 88.3639] }
];

export const getCityById = (id: string): CityMetadata | undefined => {
  return CITIES.find(city => city.id === id);
};
