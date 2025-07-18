import type { User as AppUser } from '~/schemas/user/userSchema';

declare module '#auth-utils' {
	interface User extends AppUser {}
}
