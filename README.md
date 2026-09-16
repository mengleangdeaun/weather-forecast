# ការព្យាករណ៍អាកាសធាតុកម្ពុជា · Cambodia Weather Forecast

A modern, high-performance real-time weather forecasting and interactive geospatial application covering all 25 provinces and the capital city of Cambodia. Built with React 19, TypeScript, Vite, Tailwind CSS v4, and MapLibre GL with Apple-inspired human interface aesthetics.

---

## ✨ Key Features

- **📍 All 25 Provinces & Capital Covered**:
  - Full dual-language support (Khmer & English) for province names, capitals, and administrative metadata.
  - Regional filtering: Central Plain (វាលរាបកណ្តាល), Tonle Sap (បឹងទន្លេសាប), Coastal (ឆ្នេរសមុទ្រ), and Plateau & Mountain (ខ្ពង់រាប និងភ្នំ).
  - Fast live search by Khmer name, English name, or provincial capital.

- **🗺️ Interactive MapLibre GL Geospatial Map**:
  - Crisp vector map rendered with Khmer script integration and local RTL/complex script handling.
  - Multiple map layer options: **Roadmap**, **Satellite**, and **Terrain**.
  - Dynamic interactive pins with temperature badges, active province pulse highlight, and rich weather popups.
  - Smooth animated camera fly-to transitions when switching provinces.

- **🛰️ GPS Auto-Location Detection**:
  - One-tap geolocation finder using device GPS.
  - Automatically calculates distance and detects the nearest Cambodian province using the Haversine formula.

- **⛅ Real-Time Weather & Dynamic Atmosphere**:
  - Live temperature (°C), feels-like temperature, humidity percentage, wind speed (km/h), and condition text.
  - Dynamic ambient backgrounds that adapt to live atmospheric conditions: Sunny, Rainy, Thunderstorm, Cloudy, and Nighttime.

- **🌗 Instant Seamless Dark / Light Mode**:
  - Defaults to light mode for crisp readability.
  - Smooth, zero-flicker theme toggle powered by the synchronized `.theme-switching` freeze architecture (preventing component-by-component staggered color delays).

- **📱 Touch & Mobile Optimized**:
  - Built-in prevention of mobile screen auto-zooming on search input and selectors (`font-size: 16px` safeguard and `touch-action: manipulation`).
  - Integrated with Base UI `ScrollArea` for smooth, translucent custom scrollbars on mobile and desktop.

- **🔤 Local High-Fidelity Typography**:
  - Self-hosted woff2 web fonts: **Inter** (Latin) and **Inter Khmer Looped** (Khmer) ensuring zero external layout shifts and consistent cross-platform rendering.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite 8](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + Custom Glassmorphic System |
| **Map Engine** | [MapLibre GL](https://maplibre.org/) |
| **Components & Primitives** | [Base UI](https://base-ui.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Deployment** | GitHub Actions & GitHub Pages |

---

## 📁 Project Structure

```text
weather-forecast/
├── .github/workflows/deploy.yml       # Automated GitHub Pages CI/CD workflow
├── docs/
│   └── SMOOTH_THEME_AND_MOBILE_UX_GUIDE.md  # Architecture guide for theme & UX
├── public/
│   └── favicon.png                   # Official application favicon & Apple touch icon
├── src/
│   ├── assets/fonts/                 # Local Inter and Inter Khmer Looped fonts
│   ├── components/
│   │   ├── ui/
│   │   │   ├── map.tsx               # MapLibre GL wrapper & custom markers
│   │   │   ├── scroll-area.tsx       # Base UI ScrollArea integration
│   │   │   └── button.tsx            # Button primitive
│   │   ├── Header.tsx                # Navigation bar with GPS, refresh & theme toggle
│   │   ├── WeatherHero.tsx           # Primary province hero card & live conditions
│   │   ├── WeatherMetricsGrid.tsx    # Weather metrics (humidity, wind, feels-like)
│   │   ├── ProvinceSelector.tsx      # Province selector with search & ScrollArea
│   │   ├── WeatherMap.tsx            # Main interactive map layout & legend
│   │   └── LocationBanner.tsx        # Geolocation status banner
│   ├── lib/
│   │   ├── provinces.ts              # 25 Cambodia provinces dataset & coordinates
│   │   ├── weather-api.ts            # Weather API data fetching & atmospheric logic
│   │   └── utils.ts                  # Classname merging utility (cn)
│   ├── App.tsx                       # Main application state & theme orchestrator
│   ├── index.css                     # Design tokens, Apple glassmorphism & typography
│   └── main.tsx                      # Application entry point
├── index.html                        # App shell, SEO meta tags & mobile viewport config
├── package.json                      # Project dependencies & scripts
└── vite.config.ts                    # Vite build configuration
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm / yarn

### Installation
```bash
# Clone repository
git clone https://github.com/mengleangdeaun/weather-forecast.git

# Navigate to project directory
cd weather-forecast

# Install dependencies
npm install
```

### Running Locally
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### Type Checking & Linting
```bash
# Run TypeScript compiler check
npm run typecheck

# Run ESLint
npm run lint
```

### Production Build
```bash
npm run build
```
The optimized bundle will be compiled into the `dist/` directory.

---

## 🚢 Deployment

The repository is configured with automated continuous deployment via GitHub Actions:
- Any commit pushed to the `main` or `master` branch automatically triggers `.github/workflows/deploy.yml`.
- The application is built and deployed directly to GitHub Pages.

---

## 📚 Technical Documentation

- **[Smooth Theme Switching & Mobile UX Best Practices Guide](docs/SMOOTH_THEME_AND_MOBILE_UX_GUIDE.md)**:
  Detailed explanation of the `.theme-switching` freeze technique, mobile auto-zoom prevention, Base UI ScrollArea implementation, and MapLibre GL marker lifecycle handling.

---

## 📄 License

MIT License. Designed and built with ❤️ for Cambodia.
