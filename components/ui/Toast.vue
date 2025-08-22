<script setup lang="ts">
import { ToastType } from '~/types/toast';

    const { toasts, hideToast } = useToast();

	const typeClasses = {
        [ToastType.Info]: "bg-blue-600/5",
        [ToastType.Success]: "bg-green-600/5",
        [ToastType.Error]: "bg-red-600/5",
    };
</script>

<template>
    <ToastProvider>
        <div class="absolute top-20 right-10 flex flex-col gap-2">
            <ToastRoot
                v-for="toast in toasts"
                :key="toast.id"
                v-model:open="toast.open"
                :class="[
                    'max-w-80 text-white rounded-lg p-4 shadow-lg transition-colors mb-2',
                    typeClasses[toast.type] || 'bg-zinc-800'
                ]"
            >
                <div class="flex justify-between nb gap-1">
					<ToastTitle>{{ toast.message }}</ToastTitle>
					<div>
						<ToastClose class="opacity-60 cursor-pointer px-2" @click="hideToast(toast.id)">
							x
						</ToastClose>
					</div>
				</div>
            </ToastRoot>
        </div>

        <ToastViewport
            class="fixed top-20 right-10 flex flex-col gap-2 outline-none"
        />
    </ToastProvider>
</template>

<style scoped>
@keyframes slideDownAndFade {
    0% { opacity: 0; transform: translateY(-10px); }
    100% { opacity: 1; transform: translateY(0); }
}
@keyframes slideUpAndFade {
    0% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-10px); }
}

:deep([data-state="open"]) {
    animation: slideDownAndFade 100ms ease-out;
}

:deep([data-state="closed"]) {
    animation: slideUpAndFade 100ms ease-in;
}
</style>
