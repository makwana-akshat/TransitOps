import { z } from 'zod';

export const TripSchema = z.object({
  id: z.string().uuid().optional(),
  // Add specific fields based on PRD
});
