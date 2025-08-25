import { z } from 'zod';

export const credentialsSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().nonempty('Password is required').min(8, 'Password must be at least 8 characters long')
});

export type Credentials = z.infer<typeof credentialsSchema>;
