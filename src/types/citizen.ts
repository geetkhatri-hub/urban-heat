export interface CitizenReport {
  id: string;
  userName: string;
  category: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  coordinates: [number, number];
  wardId: string;
  timestamp: string;
  status: 'Pending' | 'Dispatched' | 'Resolved';
  imageUrl?: string;
}
