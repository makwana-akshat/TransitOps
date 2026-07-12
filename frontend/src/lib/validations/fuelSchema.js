import { z } from 'zod';

export const FuelSchema = z.object({
  id: z.string().uuid().optional(),
  // Add specific fields based on PRD
});
