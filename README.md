# Think Marketplace

A curated showcase of apps, tools, and agents built on the [Think Protocol](https://thinkagents.ai). Discover AI you own.

![Think Marketplace](https://img.shields.io/badge/Think-Marketplace-58bed7)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page
│   ├── browse/            # Browse directory
│   ├── listing/[slug]/    # Listing detail pages
│   ├── builder/[slug]/    # Builder profile pages
│   ├── submit/            # Submit listing form
│   └── about/             # About page
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Header, footer, layout
│   ├── listing-card.tsx   # Listing card component
│   └── theme-*.tsx        # Theme provider & toggle
├── lib/
│   ├── data/seed.ts       # Demo seed data
│   ├── supabase/          # Supabase client utilities
│   └── utils.ts           # Utility functions
└── types/
    └── index.ts           # TypeScript type definitions
```

## 🛠 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Fonts**: Goudy Bookletter 1911 (headings) + Inter (body)
- **Database**: [Supabase](https://supabase.com/) (Postgres)
- **Auth**: [ConnectKit](https://docs.family.co/connectkit) (planned for wallet + email)
- **Hosting**: [Vercel](https://vercel.com/)

## 🎨 Design System

### Colors

| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| Background | `#FEFCF5` (warm cream) | `#0D0D0D` → `#0A0D21` (gradient) |
| Foreground | `#0D0D0D` | `#FEFCF5` |
| Primary (CTA) | `#58bed7` | `#58bed7` |

### Accessibility

- WCAG 2.1 AA compliant contrast ratios
- Keyboard navigation support
- Skip-to-content link
- Focus states on all interactive elements
- Semantic HTML structure
- ARIA labels where appropriate

## 🗃 Database Setup

1. Create a [Supabase](https://supabase.com/) project
2. Run the schema SQL in `src/lib/supabase/schema.sql`
3. Add your Supabase URL and anon key to `.env.local`

The app currently uses seed data for demo purposes. Connect Supabase to persist real listings.

## 📝 Listing Types

| Type | Description |
|------|-------------|
| **Agent** | Autonomous AI with Soul, Mind, and Body (Think Agent Standard) |
| **Tool** | Deterministic module — same input always produces same output |
| **App** | Complete application built on Think |

## 🤝 Contributing

This is a **contributor-only showcase**. To be featured:

1. **Build**: FE component, API route, schema, or integration
2. **UX**: Flows, wireframes, UI kit, or layout system
3. **Content**: Listing template, taxonomy, or Think framing copy
4. **Ops**: Documentation, contributor onboarding, or QA checklist

### Development

```bash
# Run development server
npm run dev

# Type checking
npm run type-check

# Lint
npm run lint

# Build for production
npm run build
```

## 📅 Roadmap

### v1 (Jan 31, 2026)
- [x] Home page with featured listings
- [x] Browse with search & filters
- [x] Listing detail pages
- [x] Builder profiles
- [x] Submit listing form
- [x] Dark/light theme
- [ ] Supabase integration
- [ ] ConnectKit wallet auth

### v2 (Future)
- [ ] x402 payments on ApeChain
- [ ] ThinkOS app store integration
- [ ] Ratings & reviews
- [ ] Builder dashboards

## 📄 License

MIT © [Think Protocol](https://thinkagents.ai)

---

**Built with 🧠 by the Think community**
