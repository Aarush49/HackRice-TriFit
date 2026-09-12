# TriFit

**An AI-powered training coach for endurance and hybrid-race athletes (Hyrox, triathlon, Ironman-distance events) — built for HackRice 16, Healthcare Track.**

## What is TriFit?

TriFit replaces the private coach you can't afford with an LLM-powered coaching system that builds and adjusts your training plan in real time — while helping you understand and improve your long-term healthspan, not just your race time.

Private coaching for endurance racing costs $150-400/month. Self-coached athletes struggle to balance running, swimming, cycling, and strength while managing recovery — and often end up overtrained, undertrained, or injured. TriFit gives people who've never had access to a coach a smart, adaptive, and encouraging one.

## Why Healthcare Track

TriFit is built around the longevity/healthspan framework:

- **Biomarkers & diagnostics** → training data feeds a personal fitness/biological age score
- **Lifestyle factors** → exercise, sleep, nutrition, and stress all logged and factored into coaching
- **Coaching & goal-setting** → an LLM generates and adapts your training plan
- **Education** → every plan change comes with a plain-language explanation of the "why"

Race training becomes the vehicle for building real, measurable healthspan — not just a faster finish time.

## Core Features

- **Branching onboarding** — race type (Hyrox or triathlon), goals, baseline fitness, recovery/lifestyle, and coaching-style preference, with race-specific questions (e.g. functional fitness for Hyrox vs. swim/bike for triathlon)
- **Activity logging** — run, swim, bike, and strength sessions, plus sleep and soreness/fatigue
- **Training load engine** — TSS/CTL/ATL/TSB calculated via the `trainingload` package
- **LLM plan generator & adjuster** — builds a personalized plan and reshuffles it in real time when a session is missed or fatigue/soreness is reported, with a plain-language explanation for every change
- **Fitness/biological age score** — the app's signature stat, tracked over time
- **Personal bests & tier system** — self-competitive progress tracking (Bronze → Platinum tiers, personal-record cards per discipline) — deliberately not a social leaderboard, so users are never compared against other people
- **Safety guardrails** — caps week-over-week training load increase to reduce injury risk

## Pages

| Page | Purpose |
|---|---|
| Login/Onboarding | Race selection, baseline intake, recovery/lifestyle, coaching-style preference |
| Homepage | Today's session, streak, race countdown, latest coach message |
| Dashboard | Bio-age score, training load trends, discipline balance |
| Your Progress | Tier rank, personal bests, milestone celebrations |
| Nutrition | Lightweight meal/adherence logging |
| Profile | Race details, baseline vs. current stats, session history |

## Design Direction

Bright, friendly, habit-forming UI — closer to Duolingo than a clinical sports dashboard. Warm, encouraging coach persona; streaks and tier progression drive engagement; safety-related coaching stays grounded even within a playful UI.

## Tech Stack

- **Frontend:** JavaScript
- **Backend:** FastAPI (Python)
- **Database/Auth:** TigerData
- **LLM:** Gemini API (structured JSON output for plan generation/adjustment)
- **Training load calculations:** `trainingload` (PyPI)

## Datasets

- Kaggle Strava Running Dataset — demo seed data and formula validation
- `trainingload` — TSS/CTL/ATL/TSB formulas + Strava archive parsing

## How It's Different

Adaptive AI training tools already exist (e.g. Athletica.ai). TriFit's differentiation:

- **Healthspan framing, not just performance** — a biological/fitness age score, not just faster splits
- **Built for accessibility** — designed for people who've never had a coach, not athletes already in a performance ecosystem
- **Plain-language education** — explanations assume no prior sports-science vocabulary

## Team

- Onboarding + logging UI
- Training load engine + bio-age score
- LLM prompt/schema + integration + educational-insight generation

## Status

Built for HackRice 16. Not currently branded with any trademarked event names in the product itself.
