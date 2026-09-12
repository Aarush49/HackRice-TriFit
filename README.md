# TriFit

**An AI-powered training coach for endurance and hybrid-race athletes (Hyrox, triathlon, Ironman-distance events) — built for HackRice 16, Healthcare Track.**

## What is TriFit?

TriFit replaces the private coach you can't afford with an LLM-powered coaching system that builds and adjusts your training plan in real time — while helping you understand and improve your long-term healthspan, not just your race time.

Private coaching for endurance racing costs $150-400/month. Self-coached athletes struggle to balance running, swimming, cycling, and strength while managing recovery — and often end up overtrained, undertrained, or injured. TriFit gives people who've never had access to a coach a smart, adaptive, and encouraging one.

## Why Healthcare Track

TriFit is built around the longevity/healthspan framework:

- **Biomarkers & diagnostics** → training data feeds a personal fitness/biological age score
- **Lifestyle factors** → exercise, sleep, nutrition, HRV, resting heart rate, and stress all logged and factored into coaching
- **Coaching & goal-setting** → an LLM generates and adapts your training plan dynamically with real-time feedback
- **Education & Voice** → every plan change comes with a plain-language explanation of the "why", with optional AI voice guidance via ElevenLabs
- **Open Wearables Ingress** → seamless integration with health metrics (HRV, readiness, sleep duration, resting HR, Zone 2 minutes)

Race training becomes the vehicle for building real, measurable healthspan — not just a faster finish time.

## Core Features

- **Branching onboarding** — race type (Hyrox or triathlon), goals, baseline fitness, recovery/lifestyle, and coaching-style preference, with race-specific questions (e.g. functional fitness for Hyrox vs. swim/bike for triathlon)
- **Activity & Wearable logging** — run, swim, bike, and strength sessions, plus sleep, soreness/fatigue, and Open Wearables telemetry (HRV, resting HR, readiness)
- **Training load engine** — TSS/CTL/ATL/TSB calculated via the `trainingload` package
- **LLM plan generator & adjuster** — powered by Google Gemini API to build personalized 7-day adaptive plans and reshuffle them in real time when sessions are missed or recovery flags arise
- **AI Voice Coaching (ElevenLabs)** — multi-modal audio advice and session briefings powered by ElevenLabs Text-to-Speech API
- **Fitness/biological age score** — the app's signature stat, calculated from VO2 max, resting HR, training consistency, and sleep quality, tracked over time
- **Personal bests, XP & gamification** — streak counters, level/XP progression (`add-xp`), and tier tracking (Bronze → Platinum) to keep motivation high without unhealthy peer comparison
- **Safety guardrails** — caps week-over-week training load increase to reduce injury risk

## Pages & Screens

| Page / Screen | Purpose |
|---|---|
| Splash & Authentication | High-energy intro screens with JWT-backed signup/login |
| Branching Onboarding | Race selection (Hyrox vs. Triathlon), baseline metrics, recovery, equipment & style |
| Daily Missions / Homepage | Today's workout session, daily mission checklist, streak counter, race countdown, and voice coach player |
| Longevity Dashboard | Biological age vs. chronological age, VO2 Max, training load trends (CTL/ATL/TSB), wearable readiness metrics, and advice |
| Training Schedule | Interactive weekly calendar with live plan generation, session detail modal, and AI dynamic plan adjustment |
| Progress & Gamification | XP progress bar, leveling, tier rank, personal bests, and milestone celebrations |
| Profile | Athlete baseline vs. current stats, race details, connected devices, and workout history |

## Design Direction

Bright, friendly, habit-forming UI — built using React Native / Expo with modern dark-mode aesthetic styling (`#0B0E14` background, `#00E5FF` electric cyan accents, `#FF007A` neon magenta highlights). Warm, encouraging coach persona; daily missions, XP rewards, streaks, and tier progression drive daily engagement while safety-related coaching stays grounded.

## Tech Stack

- **Mobile Frontend:** React Native / Expo (JavaScript)
- **Backend API:** FastAPI (Python)
- **Database:** TimescaleDB / PostgreSQL via `psycopg2` ( hosted on TigerData )
- **Authentication:** JWT (JSON Web Tokens) with `bcrypt` password hashing
- **AI / LLM:** Google Gemini API (`google-genai` SDK with structured JSON schemas)
- **AI Voice Synthesis:** ElevenLabs TTS API (`elevenlabs` SDK)
- **Training load calculations:** `trainingload` (PyPI)

## Datasets & Wearable Protocols

- Kaggle Strava Running Dataset — demo seed data and formula validation
- `trainingload` — TSS/CTL/ATL/TSB formulas + Strava archive parsing
- Open Wearables Standard Payload Schema — standardized JSON structure for wearable metric ingestion (HRV, readiness, resting HR, Zone 2 minutes)

## API Endpoints Summary

### Auth & User
- `POST /api/register` (or `/signup`) - User account registration
- `POST /api/login` (or `/login`) - JWT authentication
- `GET /api/user-stats` (or `/user`) - Fetch user XP, streak, and profile data
- `POST /api/add-xp` - Award user experience points and update streaks

### Onboarding & Profile
- `POST /api/onboarding` (or `/onboarding`) - Save complete athlete profile & baseline metrics
- `GET /api/onboarding` - Retrieve stored athlete onboarding configuration

### AI Training Plan Engine
- `POST /api/plan/generate` - Generate personalized multi-discipline training plan via Gemini LLM
- `GET /api/plan/current` (or `/api/training-plan`) - Retrieve current weekly training plan
- `POST /api/plan/adjust` - Dynamically adjust training plan based on fatigue, soreness, or missed workouts

### Open Wearables & Telemetry
- `POST /api/wearables/ingress` - Ingest wearable metrics payload (HRV, sleep, readiness)
- `GET /api/wearables/current` - Fetch latest wearable readiness and biometric metrics
- `POST /api/wearables/sync-simulated` - Inject mock wearable data for demonstration

### AI Voice Coach
- `POST /api/tts` (or `/tts`) - Synthesize coach advice text into streaming audio via ElevenLabs API

## How It's Different

Adaptive AI training tools already exist (e.g. Athletica.ai). TriFit's differentiation:

- **Healthspan framing, not just performance** — a biological/fitness age score, not just faster splits
- **Built for accessibility** — designed for people who've never had a coach, not athletes already in a performance ecosystem
- **Plain-language education & Multi-modal Voice** — coach explanations assume no prior sports-science vocabulary, available in audio format
- **Gamification without toxicity** — personal bests, XP, and streaks instead of public leaderboards

## Team

- Onboarding + logging UI
- Training load engine + bio-age score
- LLM prompt/schema + integration + educational-insight generation

## Status

Built for HackRice 16. Not currently branded with any trademarked event names in the product itself.

