import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-05-15',
	devtools: { enabled: true },
	css: ['~/assets/css/main.css'],
	app: {
		head: {
			link: [
				{ rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon-96x96.png' },
				{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
				{ rel: 'shortcut icon', href: '/favicon.ico' },
				{ rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
				{ rel: 'manifest', href: '/site.webmanifest' }
			],
			meta: [
				{ name: 'apple-mobile-web-app-title', content: 'Cooksy' }
			]
		}
	},
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
		'nuxt-auth-utils', 'nuxt-security', 'reka-ui/nuxt'
	],
	security: {
		headers: {
			xXSSProtection: '1',
			contentSecurityPolicy: {
				"default-src": ["'self'"],
				'img-src': ["'self'", "https://i.imgur.com", "https://ik.imagekit.io/aeris/", "data:"],
			}
		},
		rateLimiter: process.env.NODE_ENV === 'development' ? false : {
			headers: true
		},
	},
	routeRules: {
		"/api/image/upload": {
			security: {
				requestSizeLimiter: {
					maxRequestSizeInBytes: 5000000, // 5MB
					throwError: true,
				}
			}
		},
	}
})
