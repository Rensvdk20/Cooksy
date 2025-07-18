import { z } from 'zod';

const userSchema = z.object({
	id: z.string().uuid(),
	name: z.string().nonempty().max(100),
	email: z.string().email(),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
});

export type User = z.infer<typeof userSchema>;
