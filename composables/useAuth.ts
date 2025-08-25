export async function logout() {
	const { clear } = useUserSession();
	await clear();
	await navigateTo('/auth/login');
}
