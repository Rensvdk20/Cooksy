import prisma from '~/lib/prisma';
import { User } from '~/schemas/user/userSchema';
import { credentialsSchema } from '~/schemas/auth/authSchema';

export default defineEventHandler(async (event) => {
	const { email, password } = await readValidatedBody(event, credentialsSchema.parse)

	const user = await prisma.user.findUnique({
		where: { email }
	});

	if(user && (await verifyPassword(user.password, password))) {
		await setUserSession(event, {
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
			} satisfies User,
		});

		return {};
	};

	throw createError({
		statusCode: 401,
		message: 'Invalid email or password'
	});
});
