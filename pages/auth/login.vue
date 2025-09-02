<script setup lang="ts">
import type { Credentials } from '~/schemas/auth/authSchema';

const { fetch } = useUserSession();

useHead({
	title: 'Login | Cooksy',
});

definePageMeta({
	title: 'Login | Cooksy',
	description: 'Login to your Cooksy account',
	head: {
		title: 'Login | Cooksy',

	}
});

const credentials = ref<Credentials>({
	email: '',
	password: '',
});

const isLoading = ref(false);
const error = ref<string | null>(null);

async function login(credentials: Credentials) {
	if (isLoading.value) return;

	isLoading.value = true;
	error.value = null;

	try {
		await $fetch('/api/auth/login', {
			method: 'POST',
			body: credentials,
		});

		await fetch();
		await navigateTo('/');
	} catch (err: any) {
		error.value = err?.data?.message || err?.message || 'Login failed. Please try again.';
	} finally {
		isLoading.value = false;
	}
}

function clearError() {
	error.value = null;
}
</script>


<template>
	<div class="overflow-hidden relative">
		<div class="min-h-screen mt-[-72px] flex items-center justify-center px-4 py-8">
			<div class="bg-white text-black rounded-lg max-w-fit p-8">
				<div class="mb-4">
					<h1 class="text-2xl">Sign in to Cooksy</h1>
					<p class="text-gray-700">Start adding all your delicious recipes!</p>
				</div>

				<div v-if="error" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
					<div class="flex items-center justify-between">
						<span>{{ error }}</span>
						<button @click="clearError" class="text-red-500 hover:text-red-700 cursor-pointer p-1">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
							</svg>
						</button>
					</div>
				</div>

				<form @submit.prevent="login(credentials)">
					<input
						class="border border-gray-300 rounded-md p-2 px-3 mb-4 w-full focus:outline-none focus:ring-1"
						v-model="credentials.email"
						type="email"
						placeholder="Email"
						required
						:disabled="isLoading"
						@input="clearError"
					/>
					<input
						class="border border-gray-300 rounded-md p-2 px-3 mb-4 w-full focus:outline-none focus:ring-1"
						v-model="credentials.password"
						type="password"
						placeholder="Password"
						required
						:disabled="isLoading"
						@input="clearError"
					/>
					<button
						class="bg-black text-white rounded-md p-2 w-full cursor-pointer hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
						type="submit"
						:disabled="isLoading"
					>
						<span v-if="!isLoading">Login</span>
						<div v-else class="flex items-center">
							<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Signing in...
						</div>
					</button>
				</form>
			</div>
		</div>
		<div class="absolute bottom-[-5px] left-[8vw] w-85 hidden lg:block">
			<img src="/img/login/cook.svg" alt="2 people cooking" />
		</div>
	</div>
</template>
