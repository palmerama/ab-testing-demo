# A/B Testing Demo

End-to-end A/B testing with **Sanity Studio** + **GrowthBook** + **Next.js**.

Based on the [Sanity Learn A/B Testing course](https://www.sanity.io/learn/course/a-b-testing), extended with real GrowthBook integration.

## Structure

```
├── studio/          # Sanity Studio with @sanity/personalization-plugin (GrowthBook)
├── frontend/        # Next.js app with GrowthBook SDK
├── data/            # Sample dataset (events, artists, venues)
└── README.md
```

## Setup

### 1. Import sample data

```bash
cd studio
npm install
npx sanity dataset import ../data/production.tar.gz production
```

### 2. Start Sanity Studio

```bash
cd studio
npm run dev
```

### 3. Configure GrowthBook

1. Create an experiment/feature flag in GrowthBook (e.g. `event-name`)
2. Add variants: `control` and `variant`
3. Get your **Client Key** from SDK Configuration → SDK Connections

### 4. Start the frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local with your GrowthBook Client Key
npm run dev
```

### 5. Set up experiment content in Studio

1. Open an Event document
2. In the "Name (Experiment)" field, add a default value
3. Click the flask icon to add an experiment
4. Select your GrowthBook experiment
5. Add variant content
6. Publish

Visit the event page in the frontend — different users will see different content based on their assigned variant.

## How it works

1. **Middleware** assigns each visitor a unique ID (cookie-based)
2. **GrowthBook SDK** evaluates the feature flag server-side, determining which variant to show
3. **GROQ query** uses `coalesce()` to resolve the correct variant content from Sanity
4. **Tracking component** fires experiment view events (replace with your analytics)
