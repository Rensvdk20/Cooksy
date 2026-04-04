<template>
	<DialogRoot>
		<DialogPortal>
			<DialogOverlay class="fixed inset-0 bg-black/50" />
			<DialogContent
				class="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto -translate-x-1/2 -translate-y-1/2 bg-zinc-800 p-4 sm:p-5 rounded-xl"
			>
				<slot />
			</DialogContent>
		</DialogPortal>
	</DialogRoot>
</template>
