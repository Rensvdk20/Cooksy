const { loggedIn, session, user, clear, fetch } = useUserSession();

export async function logout() {
	await clear();
	await navigateTo('auth/login');
}
