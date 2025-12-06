# MediQuest

A gamified educational platform where you roleplay through genetics scenarios using AI simulation, adaptive learning, and competitive challenges.

## Features

### The Clinic
- **Infinite Patient Scenarios**: AI-generated patient cases with realistic presentations
- **Investigation System**: Order blood work, karyotype analysis, and physical examinations
- **Instant Feedback**: Get detailed debriefs explaining the correct diagnosis
- **XP Rewards**: Earn more XP for diagnosing with fewer investigations

### The Tutor Lab
Three learning modes powered by AI:
1. **General Chat**: Have conversations about any genetics topic
2. **Learn → Quiz**: Get an explanation first, then test your knowledge
3. **Quiz → Learn**: Test yourself first, then learn from your mistakes

### The Leaderboard
- Compete with peers for top rankings
- Track your progress with XP and levels
- Earn achievements and badges

## Tech Stack

- **Framework**: Next.js 15 (App Router, Server Actions, TypeScript)
- **Styling**: Tailwind CSS + Custom UI Components
- **Icons**: Lucide React
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth (Email/Password)
- **AI**: Groq SDK (llama-3.1-70b-versatile)

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- PostgreSQL database
- Groq API key

### Installation

1. Clone the repository and install dependencies:
```bash
bun install
```

2. Set up environment variables in `.env`:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mediquest"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"

# Groq AI
GROQ_API_KEY="your-groq-api-key"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

3. Push the database schema:
```bash
bun run db:push
```

4. Start the development server:
```bash
bun run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Database Commands

```bash
bun run db:generate  # Generate migrations
bun run db:migrate   # Run migrations
bun run db:push      # Push schema to database
bun run db:studio    # Open Drizzle Studio
```

## Project Structure

```
mediquest/
├── app/
│   ├── api/
│   │   ├── auth/[...all]/    # Better Auth API routes
│   │   ├── clinic/           # Clinic case generation API
│   │   └── tutor/            # Tutor AI API
│   ├── auth/
│   │   ├── login/            # Login page
│   │   └── register/         # Registration page
│   ├── dashboard/
│   │   ├── clinic/           # The Clinic feature
│   │   ├── tutor/            # The Tutor Lab feature
│   │   ├── leaderboard/      # Leaderboard page
│   │   └── profile/          # User profile page
│   └── page.tsx              # Landing page
├── components/
│   ├── dashboard/            # Dashboard components
│   └── ui/                   # UI components
├── lib/
│   ├── db/                   # Database schema and connection
│   ├── auth.ts               # Better Auth configuration
│   ├── auth-client.ts        # Auth client for React
│   ├── groq.ts               # Groq SDK configuration
│   └── utils.ts              # Utility functions
└── drizzle.config.ts         # Drizzle configuration
```

## License

MIT
