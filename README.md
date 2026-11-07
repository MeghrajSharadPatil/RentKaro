# RentKaro — Your Campus. Your Marketplace. Rent Anything.

RentKaro is a college-first peer-to-peer rental platform designed for Indian university campuses with built-in multi-tier expansion to city-wide and multi-city operations without rebuilding the core application.

## Core Architecture & Expansion Modes

1. **MODE 1: `COLLEGE_MODE` (Campus-First Launch)**
   - Verified students only (supports institutional email domains like `@iitb.ac.in` AND physical College ID Card uploads / manual admin verification for colleges without student email domains).
   - College-isolated product discovery, bookings, and campus pickup landmarks (zero private hostel room addresses exposed).
2. **MODE 2: `CITY_MODE` (City-Wide Expansion)**
   - Unlocks nearby colleges, city residents (`PUBLIC_USER`), and local rental shops (`BUSINESS_OWNER`) with neighborhood pickup and doorstep delivery options.
3. **MODE 3: `MULTI_CITY_MODE` (All-India Network)**
   - Connects multiple cities (Mumbai, Pune, Goa) and participating college communities under unified discovery.

## Running Unit Tests & Full-Stack Server

```bash
# Run core business logic unit tests
npx --yes tsx --test src/utils/rentalLogic.test.ts

# Start full-stack Express + Vite server on port 3000
npm run dev
```
