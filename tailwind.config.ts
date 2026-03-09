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
					foreground: 'hsl(var(--card-foreground))',
					border: 'hsl(var(--card-border))',
					white: 'hsl(var(--card-white))',
					'white-foreground': 'hsl(var(--card-white-foreground))'
				},
				// White theme colors
				'pure-white': 'hsl(var(--pure-white))',
				'soft-white': 'hsl(var(--soft-white))',
				'muted-white': 'hsl(var(--muted-white))',
				'muted-white-foreground': 'hsl(var(--muted-white-foreground))',
				'border-white': 'hsl(var(--border-white))',
				// Neon accent colors
				'electric-blue': 'hsl(var(--electric-blue))',
				'neon-purple': 'hsl(var(--neon-purple))',
				'neon-magenta': 'hsl(var(--neon-magenta))',
				'soft-orange': 'hsl(var(--soft-orange))',
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				'sans': ['Inter', 'system-ui', 'sans-serif'],
				'mono': ['JetBrains Mono', 'monospace'],
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'gradient-shift': {
					'0%': { 'background-position': '0% 50%' },
					'50%': { 'background-position': '100% 50%' },
					'100%': { 'background-position': '0% 50%' }
				},
				'float': {
					'0%': { transform: 'translateY(0px) translateX(0px)' },
					'33%': { transform: 'translateY(-30px) translateX(10px)' },
					'66%': { transform: 'translateY(-20px) translateX(-10px)' },
					'100%': { transform: 'translateY(0px) translateX(0px)' }
				},
				'pulse-glow': {
					'0%, 100%': { boxShadow: 'var(--glow-blue)' },
					'50%': { boxShadow: 'var(--glow-blue), 0 0 60px hsl(210 100% 56% / 0.8)' }
				},
				'typing': {
					'from': { width: '0' },
					'to': { width: '100%' }
				},
				'blink': {
					'0%, 50%': { borderColor: 'transparent' },
					'51%, 100%': { borderColor: 'hsl(var(--primary))' }
				},
				'fadeIn': {
					'from': { opacity: '0', transform: 'translateY(20px)' },
					'to': { opacity: '1', transform: 'translateY(0)' }
				},
				'slideUp': {
					'from': { opacity: '0', transform: 'translateY(50px)' },
					'to': { opacity: '1', transform: 'translateY(0)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'gradient-shift': 'gradientShift 8s ease infinite',
				'float': 'float 20s infinite linear',
				'float-bubbles': 'floatBubbles 15s infinite ease-in-out',
				'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
				'typing': 'typing 4s steps(40, end)',
				'blink': 'blink 1s infinite',
				'fadeIn': 'fadeIn 0.6s ease-out',
				'slideUp': 'slideUp 0.8s ease-out',
				'slideInUp': 'slideInUp 0.8s ease-out',
				'slideInLeft': 'slideInLeft 0.8s ease-out',
				'slideInRight': 'slideInRight 0.8s ease-out',
				'scaleIn': 'scaleIn 0.6s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
