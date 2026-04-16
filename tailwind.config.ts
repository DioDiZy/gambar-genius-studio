
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				brand: {
					purple: "#8B5CF6",
					pink: "#D946EF",
					blue: "#0EA5E9",
				},
				fun: {
					purple: 'hsl(var(--fun-purple))',
					teal: 'hsl(var(--fun-teal))',
					yellow: 'hsl(var(--fun-yellow))',
					coral: 'hsl(var(--fun-coral))',
					blue: 'hsl(var(--fun-blue))',
					green: 'hsl(var(--fun-green))',
					'purple-light': 'hsl(var(--fun-purple-light))',
					'teal-light': 'hsl(var(--fun-teal-light))',
					'yellow-light': 'hsl(var(--fun-yellow-light))',
					'coral-light': 'hsl(var(--fun-coral-light))',
					'blue-light': 'hsl(var(--fun-blue-light))',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'2xl': '1.25rem',
				'3xl': '1.5rem',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'pulse-slow': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' },
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' },
				},
				'wiggle': {
					'0%, 100%': { transform: 'rotate(-2deg)' },
					'50%': { transform: 'rotate(2deg)' },
				},
				'bounce-gentle': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-4px)' },
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-slow': 'pulse-slow 3s infinite ease-in-out',
				'float': 'float 6s infinite ease-in-out',
				'wiggle': 'wiggle 1s infinite ease-in-out',
				'bounce-gentle': 'bounce-gentle 2s infinite ease-in-out',
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'hero-gradient': 'linear-gradient(102.3deg, rgba(147,39,143,1) 5.9%, rgba(234,172,232,1) 64%, rgba(246,219,245,1) 89%)',
				'creative-gradient': 'linear-gradient(90deg, hsla(277, 75%, 84%, 1) 0%, hsla(297, 50%, 51%, 1) 100%)',
				'blue-gradient': 'linear-gradient(90deg, hsla(221, 45%, 73%, 1) 0%, hsla(220, 78%, 29%, 1) 100%)',
				'fun-gradient': 'linear-gradient(135deg, hsl(255 70% 60%) 0%, hsl(175 60% 45%) 100%)',
				'fun-gradient-warm': 'linear-gradient(135deg, hsl(42 95% 65%) 0%, hsl(12 85% 65%) 100%)',
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				heading: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
			},
			fontSize: {
				'kid-xs': ['0.8125rem', { lineHeight: '1.25rem' }],
				'kid-sm': ['0.9375rem', { lineHeight: '1.375rem' }],
				'kid-base': ['1.0625rem', { lineHeight: '1.625rem' }],
				'kid-lg': ['1.25rem', { lineHeight: '1.75rem' }],
				'kid-xl': ['1.5rem', { lineHeight: '2rem' }],
				'kid-2xl': ['2rem', { lineHeight: '2.5rem' }],
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
