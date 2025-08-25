<script setup lang="ts">
import { NuxtLink } from '#components';

const { user } = useUserSession();

const isMenuOpen = ref(false);

const handleMobileLogout = () => {
    logout();
    isMenuOpen.value = false;
};
</script>
<template>
    <nav class="max-w-[1200px] mx-auto px-4 py-4">
        <div class="container flex flex-wrap justify-between items-center max-w-full">
            <NuxtLink href="/" class="text-xl font-semibold">Cooksy</NuxtLink>

            <button
                @click="isMenuOpen = !isMenuOpen"
                type="button"
                class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm rounded-lg md:hidden cursor-pointer hover:text-gray-300"
            >
                <span class="sr-only">Toggle menu</span>
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            <div class="hidden md:flex">
                <div v-if="!user" class="md:flex md:space-x-8">
                    <NuxtLink href="/auth/login" class="block py-2 text-white cursor-pointer hover:text-gray-300">Login</NuxtLink>
                </div>
				<div v-else class="md:flex md:space-x-8">
					<div>
						<NuxtLink href="/recipes/create" class="block py-2 text-white cursor-pointer hover:text-gray-300">Create</NuxtLink>
					</div>
					<div>
						<button @click="logout" class="block py-2 text-white cursor-pointer hover:text-gray-300">Logout</button>
					</div>
				</div>
            </div>

            <transition name="fade">
                <div
                    v-if="isMenuOpen"
                    class="fixed inset-0 z-40 bg-zinc-900 bg-opacity-95 flex flex-col items-center justify-center space-y-8 text-2xl md:hidden"
                >
                    <button
                        @click="isMenuOpen = false"
                        class="absolute top-4 right-4 p-2 text-white hover:text-gray-300 cursor-pointer"
                    >
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

					<div v-if="!user" class="flex flex-col items-center space-y-6">
						<NuxtLink
							href="/auth/login"
							@click="isMenuOpen = false"
							class="cursor-pointer hover:text-gray-300"
						>
							Login
						</NuxtLink>
					</div>

					<div v-else class="flex flex-col items-center space-y-6">
						<NuxtLink
							href="/recipes/create"
							@click="isMenuOpen = false"
							class="cursor-pointer hover:text-gray-300"
						>
							Create
						</NuxtLink>
						<button
							@click="handleMobileLogout"
							class="cursor-pointer hover:text-gray-300"
						>
							Logout
						</button>
					</div>
                </div>
            </transition>
        </div>
    </nav>
</template>
<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
