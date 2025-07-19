import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-05-15',
	devtools: { enabled: true },
	css: ['~/assets/css/main.css'],
	components: [
		{
			path: '~/components/',
			pathPrefix: false,
			extensions: ['vue'],
			pattern: '**/*'
		}
	],
	vite: {
		plugins: [
			tailwindcss(),
		]
	},
	modules: [
		['@nuxtjs/google-fonts', {
			families: {
				Fredoka: [400, 500],
			},
			display: 'swap',
		}],
		'nuxt-auth-utils', 'nuxt-security',
	],
	security: {
		headers: {
			xXSSProtection: '1',
		},
		rateLimiter: process.env.NODE_ENV === 'development' ? false : {
			headers: true
		},
	},
})
