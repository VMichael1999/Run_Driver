import type { LocationMarker } from '@shared/types';

export interface ScheduledTrip {
  id: string;
  origin: LocationMarker | null;
  destination: LocationMarker | null;
  scheduledFor: number;
  notes?: string;
  createdAt: number;
}

export interface NewScheduledTripInput {
  origin: LocationMarker | null;
  destination: LocationMarker | null;
  scheduledFor: number;
  notes?: string;
}
