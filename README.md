# A/B Testing Demo — Sanity + GrowthBook + Next.js

End-to-end A/B testing demo using:
- **Sanity Studio** with `@sanity/personalization-plugin` (GrowthBook integration)
- **GrowthBook** for experiment management and feature flags
- **Next.js** frontend with server-side variant resolution

## Project Structure

```
├── studio/          # Sanity Studio (standalone)
│   ├── schemaTypes/ # Event, Artist, Venue schemas
│   └── sanity.config.ts
├── frontend/        # Next.js app
│   ├── src/
│   │   ├── app/         # Pages (events list + event detail)
│   │   ├── sanity/      # Client, queries, env
│   │   ├── lib/         # GrowthBook server + tracking
│   │   └── middleware.ts # Cookie-based user ID assignment
│   └── .env.local.example
└── README.md
```

## Setup

### 1. Install dependencies

```bash
# Studio
cd studio
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Import seed data

Download the seed data and import it:

```bash
cd studio
curl -L -o production.tar.gz "https://cdn.sanity.io/files/3do82whm/next/ac266d280e1806c1aeb6b01ebf7a5e4516ead0c1.gz"
npx sanity dataset import production.tar.gz production
```

This imports events, artists, and venues (2010–2030).

### 3. Configure GrowthBook

1. Create a GrowthBook account at [growthbook.io](https://www.growthbook.io)
2. Create an **SDK Connection** (Node.js) → copy the **Client Key**
3. Create an **API Key** (readonly) → this is used by the Sanity plugin

#### Create a Feature Flag in GrowthBook:
1. Go to **Features** → **Add Feature**
2. Name: `event-name`
3. Value type: **String**
4. Default value: `control`
5. Add an **Experiment Rule**:
   - Control: `control`
   - Variation 1: `variant`
6. Save and **Publish**

### 4. Configure environment variables

```bash
cd frontend
cp .env.local.example .env.local
# Edit .env.local with your GrowthBook Client Key
```

### 5. Enter GrowthBook API key in Studio

When you first open an experiment field in the Studio, you'll be prompted to enter the GrowthBook readonly API key. This is stored in the Content Lake.

### 6. Run

```bash
# Terminal 1 — Studio
cd studio
npx sanity dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

- Studio: http://localhost:3333
- Frontend: http://localhost:3000

## How It Works

### Studio
The `event` schema has a `newName` field of type `experimentString`. This field lets editors set a default value and variant values for each experiment. The plugin fetches available experiments from GrowthBook automatically.

### Frontend
1. **Middleware** assigns each visitor a unique ID via a `gb-user-id` cookie
2. **GrowthBook SDK** evaluates the feature flag server-side to determine the variant
3. **GROQ query** uses `coalesce()` to resolve the correct variant content:
   - First tries the matching variant value
   - Falls back to the experiment default
   - Falls back to the original `name` field
4. **Tracking component** logs experiment views (replace with your analytics)

### Debug
Each event page shows a debug bar at the bottom with the current experiment, variant, and user ID. Clear the `gb-user-id` cookie to get a new random assignment.
