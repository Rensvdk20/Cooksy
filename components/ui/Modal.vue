<template>
<DialogRoot>
	<DialogPortal>
		<DialogOverlay class="fixed inset-0 bg-black/50" />
		<DialogContent class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-800 p-4 rounded-xl">
			<slot />
		</DialogContent>
	</DialogPortal>
</DialogRoot>
</template>
