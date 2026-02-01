# Vayura
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-7-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->
## Why Vayura?

India lacks district-level visibility into environmental oxygen demand.
Vayura bridges the gap between **data, awareness, and action** by turning
abstract environmental metrics into real-world tree plantation workflows.

**District-Level Oxygen Intelligence for a Greener India**

Vayura is an open-source web application that estimates district-level oxygen demand across India and converts it into actionable tree-plantation and donation workflows. Built with transparency, scientific accuracy, and community contribution at its core.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16.1+-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-blue)](https://www.python.org/)

## Features

- **All Indian Districts**: Comprehensive coverage of every district across India
- **District-Level Analysis**: Search any Indian district to see detailed environmental metrics
- **Oxygen Calculation**: Transparent scientific formulas estimate oxygen demand vs. supply
- **Tree Requirements**: Clear calculation of trees needed to offset oxygen deficit
- **Environmental Health Card**: AQI, soil quality, disaster frequency, population data
- **AI-Powered Data Fetching**: Uses Gemini AI to intelligently aggregate data from multiple government sources
- **Tree Contribution System**: Upload tree plantation photos analyzed by AI for environmental impact
- **NGO Donation Hub**: Donate trees through verified NGOs with transparency scores
- **Contribution Dashboard**: Track your personal impact (planted vs donated trees)
- **Legal & Privacy**: Dedicated Terms of Service and Privacy Policy for secure usage
- **State Leaderboard**: Rankings by oxygen self-sufficiency across Indian states
- **Transparent Methodology**: All formulas and assumptions clearly explained

### Website Features
## District-Level Environmental Intelligence

- **Search and explore all Indian districts**

- **District-wise oxygen demand vs supply estimation**

- **Visual oxygen deficit / surplus indicators**

- **District environmental health score**

## Oxygen & Tree Impact Calculations

- **Scientifically backed human oxygen demand calculation**

- **Dynamic adjustment using AQI, soil quality, and disaster frequency**

- **Automatic calculation of trees required to offset oxygen deficit**

- **Transparent formulas and assumptions shown to users**

## Tree Plantation & Contribution System

- **Upload tree plantation photos**

- **AI-based image verification for plantation authenticity**

- **Auto-calculation of oxygen contribution from planted trees**

- **Track planted trees at district & user level**

## NGO Donation Hub

- **Donate trees via verified environmental NGOs**

- **NGO profiles with transparency & impact scores**

- **Track donated trees separately from planted trees**

- **Clear mapping between donations and districts**

## Personal Contribution Dashboard

- **User-specific dashboard**

- **View total trees planted vs donated**

- **See personal oxygen contribution impact***

- **Contribution history & activity logs**

## Leaderboards & Rankings

- **State-wise oxygen self-sufficiency leaderboard**

- **Rankings based on forest cover and oxygen balance**

- **Public comparison across states and districts**

## Data Visualization & Insights

- **Interactive charts for oxygen demand & supply**

- **Environmental metric graphs (AQI, population, forest cover)**

- **District comparison visuals**

- **Trend-based insights for environmental planning**

## AI-Powered Data Aggregation

- **Intelligent data fetching using Google Gemini AI**

- **Automatic aggregation from multiple government sources**

- **Fallback mechanisms for missing or inconsistent data**

- **Explainable AI outputs for transparency**

## Authentication & Security

- **Secure user authentication (Email / Google)**

- **Role-based access for contributors and admins**

- **Secure image storage for tree uploads**

- **Environment-safe configuration using Firebase**

## Transparency, Legal & Ethics

- **Dedicated Terms of Service and Privacy Policy**

- **Clear disclaimers on estimation accuracy**

- **Responsible AI usage principles**

- **Publicly documented calculation methodology**

## Developer & Open-Source Friendly

- **Modular and scalable architecture**

- **Optional Python microservice for calculations**

- **Firestore-based structured data model**

- **Ready for community contributions**

## Accessibility & Scalability

- **Responsive UI for desktop and mobile**

- **Designed for pan-India scalability**

- **Easily extendable to other countries or regions**

- **Performance-optimized data fetching**


## Tech Stack

### Frontend
- **Next.js 16+** (App Router)
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Recharts** for data visualization

### Backend
- **Node.js** (Next.js API Routes)
- **Python FastAPI** microservice for oxygen calculations (optional)
- **Firebase Firestore** for database
- **Firebase Authentication** for user management
- **Firebase Storage** for image uploads
- **Google Gemini AI** for intelligent data aggregation

## Prerequisites

- Node.js 18+ and npm
- Python 3.11+ (optional, for calculation microservice)
- **Firebase Project**: For authentication, database, and storage
- **Google Gemini API Key**: For intelligent data fetching

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/manasdutta04/vayura.git
cd vayura
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Firebase

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Authentication** (Email/Password and Google providers)
3. Create a **Firestore Database** (start in production mode)
4. Create a **Cloud Storage** bucket
5. Download service account key: Project Settings > Service Accounts > Generate New Private Key
6. Save the JSON file as `firebase-service-account.json` in the project root

### 4. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (Server-side)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key

# OpenWeatherMap (Optional, for AQI fallback)
OPENWEATHERMAP_API_KEY=your_openweathermap_key

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 5. Set Up Firestore

1. Deploy Firestore indexes:
   - Copy the index URL from `firestore.indexes.json` errors
   - Or deploy via Firebase Console

2. Deploy Firestore security rules:
   - Copy rules from `firestore.rules` to Firebase Console > Firestore > Rules

3. Seed initial data:
```bash
npx tsx scripts/seed-districts.ts
npx tsx scripts/seed-forest-cover-data.ts
```

### 6. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Development Notes

- Firebase Admin keys must never be committed
- Use `.env.local` only
- Prefer mock data when working on UI
- Python microservice is optional for frontend contributors

## Oxygen Calculation Methodology

Vayura uses a transparent, scientifically-based formula:

### 1. Base Human O₂ Demand
```
Population × 550 L/day × 365 days → kg/year
```

### 2. Penalty Factors
- **AQI Factor** (1.0 - 1.75×): Higher pollution increases respiratory demand
- **Soil Degradation** (1.0 - 1.6×): Poor soil = less natural O₂ sources
- **Disaster Loss** (1.05 - 1.5×): Frequent disasters destroy vegetation

### 3. Adjusted Demand
```
Base Demand × AQI Factor × Soil Factor × Disaster Factor
```

### 4. Tree O₂ Supply
- Base: 110 kg/year per mature tree
- Adjusted by soil quality (healthier soil = healthier trees)
- Lifespan calculation: 50 years average × 110 kg/year

### 5. Trees Required
```
Oxygen Deficit ÷ Adjusted Tree Supply
```

**All assumptions and data sources are displayed in the UI for full transparency.**

## Data Sources

Vayura uses a multi-tier data fetching approach:

1. **Primary**: Google Gemini AI - Intelligently aggregates data from multiple government sources
2. **Secondary**: OpenWeatherMap API - Real-time AQI data
3. **Fallback**: Built-in government published data and statistical estimates

See [DATA_SOURCES.md](./DATA_SOURCES.md) for complete data source documentation.

---

## 📂 Project Structure

Vayura follows the Next.js 16+ `src/app` directory convention for modularity and scalability:

```text
vayura/
├── src/
│   ├── app/                      # 🚀 NEXT.JS APP ROUTER (Pages & APIs)
│   │   ├── (auth)/               # Auth-related route groups
│   │   ├── api/                  # Serverless Backend Endpoints
│   │   │   ├── districts/        # Oxygen & environmental data fetching
│   │   │   ├── plant/            # AI image verification & uploads
│   │   │   └── leaderboard/      # State-level ranking logic
│   │   ├── dashboard/            # User-specific impact analytics
│   │   ├── districts/            # District-level detail pages
│   │   └── layout.tsx            # Global providers & root UI
│   ├── components/               # 🧱 REUSABLE UI COMPONENTS
│   │   ├── ui/                   # Shadcn/Radix primitive components
│   │   ├── charts/               # Recharts environmental visualizations
│   │   └── maps/                 # Interactive Indian district maps
│   ├── lib/                      # ⚙️ CORE LOGIC & UTILITIES
│   │   ├── firebase/             # Client & Admin SDK configurations
│   │   ├── calculations/         # Scientific O2 demand formulas
│   │   ├── types/                # TypeScript interfaces & enums
│   │   └── utils/                # Formatting & helper functions
│   └── middleware.ts             # Auth & Route protection logic
├── services/                     # 🐍 OPTIONAL MICROSERVICES
│   └── oxygen-calculator/        # Python FastAPI engine (Advanced logic)
├── scripts/                      # 🛠️ AUTOMATION
│   └── seed-data.ts              # Firestore initial seeding scripts
├── public/                       # 🖼️ STATIC ASSETS (Logos, Icons)
├── firestore.rules               # 🔥 Database Security Rules
└── package.json                  # Dependencies & Scripts
```

---

## Contributing

We welcome contributions! This is an open-source project and your help makes it better.

### How to Contribute

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a branch** for your feature (`git checkout -b feature/amazing-feature`)
4. **Make your changes** following our coding standards
5. **Test thoroughly** before committing
6. **Commit** with clear messages (`git commit -m 'Add amazing feature'`)
7. **Push** to your fork (`git push origin feature/amazing-feature`)
8. **Open a Pull Request** on GitHub

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

### Areas for Contribution

- **Data Sources**: Add more government data integrations
- **Features**: New functionality and improvements
- **Documentation**: Improve docs and add examples
- **Bug Fixes**: Report and fix issues
- **UI/UX**: Design improvements and accessibility
- **Testing**: Add tests and improve coverage

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

Copyright (c) 2026 Manas Dutta

## Disclaimer

**Important**: Vayura provides educational estimates based on available data and scientific models. The oxygen calculations and environmental metrics are:

- **Not medical advice**: Do not use for health decisions
- **Not policy guidance**: Consult experts for governance decisions
- **Subject to data availability**: Accuracy depends on source data quality
- **Estimates only**: Real-world conditions vary

Always verify critical information with official sources and domain experts.

## Acknowledgments

- **WHO**: Human oxygen consumption standards
- **USDA Forest Service**: Tree oxygen production research
- **EPA**: Air Quality Index methodology
- **Government of India**: Census, FSI, NDMA, CPCB data
- **OpenWeatherMap**: Air quality data API
- **Google Gemini**: AI-powered data aggregation
- **The open-source community**: For inspiration and support

## Contact & Support

- **GitHub Repository**: [https://github.com/manasdutta04/vayura](https://github.com/manasdutta04/vayura)
- **Issues**: [GitHub Issues](https://github.com/manasdutta04/vayura/issues)
- **Contributions**: [See CONTRIBUTING.md](./CONTRIBUTING.md)

##  Creators

- Developed by [Manas Dutta](https://github.com/manasdutta04)

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://amankumar.site"><img src="https://avatars.githubusercontent.com/u/148977902?v=4?s=100" width="100px;" alt="Aman Kumar "/><br /><sub><b>Aman Kumar </b></sub></a><br /><a href="https://github.com/manasdutta04/vayura/commits?author=Amanc77" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/VITianYash42"><img src="https://avatars.githubusercontent.com/u/175908232?v=4?s=100" width="100px;" alt="Yash Singhal"/><br /><sub><b>Yash Singhal</b></sub></a><br /><a href="https://github.com/manasdutta04/vayura/commits?author=VITianYash42" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Diksha78-bot"><img src="https://avatars.githubusercontent.com/u/184750994?v=4?s=100" width="100px;" alt="Diksha Dhanaji Dabhole"/><br /><sub><b>Diksha Dhanaji Dabhole</b></sub></a><br /><a href="https://github.com/manasdutta04/vayura/commits?author=Diksha78-bot" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/sarojit049"><img src="https://avatars.githubusercontent.com/u/173495732?v=4?s=100" width="100px;" alt="Saroj Kumar"/><br /><sub><b>Saroj Kumar</b></sub></a><br /><a href="https://github.com/manasdutta04/vayura/commits?author=sarojit049" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/aagmanpal"><img src="https://avatars.githubusercontent.com/u/126964489?v=4?s=100" width="100px;" alt="Aagman Pal"/><br /><sub><b>Aagman Pal</b></sub></a><br /><a href="https://github.com/manasdutta04/vayura/commits?author=aagmanpal" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://shaikhwarsi.xyz"><img src="https://avatars.githubusercontent.com/u/86195374?v=4?s=100" width="100px;" alt="ShaikhWarsi"/><br /><sub><b>ShaikhWarsi</b></sub></a><br /><a href="https://github.com/manasdutta04/vayura/commits?author=ShaikhWarsi" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/anshiky73-svg"><img src="https://avatars.githubusercontent.com/u/230556644?v=4?s=100" width="100px;" alt="@nshik"/><br /><sub><b>@nshik</b></sub></a><br /><a href="https://github.com/manasdutta04/vayura/commits?author=anshiky73-svg" title="Documentation">📖</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

Thanks to these amazing people <3

---

**Made with care for a greener India**

*"Every tree counts. Every breath matters."*
