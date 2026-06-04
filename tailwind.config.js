/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		fontFamily: {
  			playfair: ['Playfair Display', 'Georgia', 'serif'],
  			inter: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
  			// Editorial defaults — `font-serif` (and headings/body base) now
  			// resolve to Cormorant; `font-sans` stays Inter for crisp chrome.
  			sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
  			serif: ['Cormorant Garamond', 'Fraunces', 'Georgia', 'serif'],
  		},
  		borderRadius: {
  			'4xl': '2rem',
  			'5xl': '2.5rem',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			/* FemWell Premium */
  			ivory: '#FAF8F5',
  			'ivory-dark': '#F3EFE9',
  			fw: {
  				plum: '#2A2035',
  				'plum-light': '#3D3047',
  				rose: '#C4849A',
  				'rose-light': '#E8C4D0',
  				'rose-subtle': '#F5ECF0',
  				'rose-deep': '#E11D74',
  				blush: '#FCE7F3',
  				lavender: '#F5F3FF',
  				'slate-900': '#0F172A',
  				'slate-500': '#64748B',
  				amber: '#F59E0B',
  				mauve: '#8A7E88',
  				'mauve-light': '#C5BAC3',
  				'mauve-subtle': '#F0EBF0',
  				sage: '#7A9E8E',
  				'sage-light': '#B5CEC5',
  				'sage-subtle': '#EBF2EF',
  				border: '#EDE8E4',
  				'border-subtle': '#F5F1EE',
  			},
  			/* shadcn compat */
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
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
  			}
  		},
  		boxShadow: {
  			'fw-sm': '0 1px 3px rgba(42,32,53,0.06), 0 1px 2px rgba(42,32,53,0.04)',
  			'fw-md': '0 4px 16px rgba(42,32,53,0.08), 0 2px 6px rgba(42,32,53,0.04)',
  			'fw-lg': '0 12px 40px rgba(42,32,53,0.10), 0 4px 12px rgba(42,32,53,0.06)',
  		},
  		keyframes: {
  			'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
  			'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
  			'fade-up': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'fade-up': 'fade-up 0.3s ease-out',
  		}
  	}
  },
  safelist: [
    'bg-fw-rose-subtle', 'text-fw-rose', 'bg-fw-sage-subtle', 'text-fw-sage',
    'bg-fw-mauve-subtle', 'text-fw-mauve', 'bg-fw-plum', 'text-fw-plum',
  ],
  plugins: [require("tailwindcss-animate")],
}