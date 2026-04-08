# ⚽ iknowBall — Football Dashboard

A premium web application that provides real-time football data across Europe's top leagues. Built as a teaching example to demonstrate JavaScript, API integration, and modern UI development.

![iknowBall](https://img.shields.io/badge/iknowBall-Football%20Dashboard-238636?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAxMDAgMTAwJz48dGV4dCB5PScuOWVtJyBmb250LXNpemU9JzkwJz7imr3vuI88L3RleHQ+PC9zdmc+)

## 🌟 Features

### Core Features
- **Live Match Data** — View matches across 12 major competitions with scores, dates, and status
- **League Standings** — Full league tables with positions, points, goal difference, and **form indicators** (W/D/L)
- **Top Scorers** — Ranked player lists with goals, assists, and match stats (🥇🥈🥉 medals for top 3)
- **Search** — Debounced real-time search across teams and players (using Array `.filter()`)
- **Sort** — Multiple sort options per tab (using Array `.sort()`)
- **Dark / Light Mode** — Toggle theme with localStorage persistence
- **Favorite Competitions** — Star your preferred leagues, saved in localStorage

### Bonus Features
- **Matchday Pagination** — Navigate between matchdays with prev/next buttons
- **Back to Top** — Floating button appears on scroll for easy navigation
- **Matchday Stats** — Summary chips showing played/live/upcoming match counts
- **Champions League Groups** — Full group-stage table support
- **Form Indicators** — Visual W/D/L colored dots in standings table
- **Loading Indicators** — Animated spinner during API calls
- **Error Handling** — User-friendly error messages with retry button

## 🏆 Available Competitions

| Flag | Code | League |
|------|------|--------|
| 🏴󠁧󠁢󠁥󠁮󠁧󠁿 | PL | Premier League |
| 🇪🇸 | PD | La Liga |
| 🇮🇹 | SA | Serie A |
| 🇩🇪 | BL1 | Bundesliga |
| 🇫🇷 | FL1 | Ligue 1 |
| 🏆 | CL | Champions League |
| 🇳🇱 | DED | Eredivisie |
| 🏴󠁧󠁢󠁥󠁮󠁧󠁿 | ELC | Championship |
| 🇵🇹 | PPL | Primeira Liga |
| 🇧🇷 | BSA | Série A (Brazil) |
| 🌍 | WC | FIFA World Cup |
| 🇪🇺 | EC | European Championship |

## 🛠️ Technologies

- **HTML5** — Semantic markup
- **CSS3** — Custom properties (dark/light themes), CSS Grid, Flexbox, animations, responsive design
- **JavaScript (ES6+)** — ES Modules, `async/await`, `fetch`, Array HOFs (`.filter()`, `.sort()`, `.map()`, `.reduce()`, `.find()`)
- **Font**: [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts

## 📡 API

- **Provider**: [football-data.org](https://www.football-data.org/) (Free tier)
- **Version**: v4
- **Endpoints Used**:
  - `GET /competitions/{code}/matches` — Match list with scores and status
  - `GET /competitions/{code}/standings` — League table with form
  - `GET /competitions/{code}/scorers` — Top scorers with assists

## 📂 Project Structure

```
wapproj/
├── index.html          # Main HTML page (semantic structure)
├── css/
│   └── styles.css      # Themes, responsive, animations, form indicators
├── js/
│   ├── app.js          # Main controller (state, rendering, events, pagination)
│   ├── api.js          # API service (fetch calls, error handling)
│   └── utils.js        # Helpers (debounce, localStorage, formatters)
├── proxy.js            # CORS proxy server (needed for local development)
└── README.md           # This file
```

## 🚀 How to Run

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd wapproj
   ```

2. **Start the CORS proxy** (required — football-data.org blocks direct browser requests)
   ```bash
   node proxy.js
   ```

3. **Open with a local server** (required for ES Modules)
   ```bash
   # Option A: Python
   python3 -m http.server 8080

   # Option B: VS Code Live Server extension
   # Right-click index.html > "Open with Live Server"

   # Option C: Node.js
   npx serve .
   ```

4. **Open in browser**
   ```
   http://localhost:8080
   ```

> **Note**: You need both the CORS proxy (step 2) AND the local server (step 3) running for the app to work.

## 🎯 Key JavaScript Concepts Demonstrated

| Concept | Where Used |
|---------|-----------|
| `fetch` + `async/await` | `api.js` — all API calls |
| `.filter()` | `app.js` — search functionality, matchday pagination |
| `.sort()` | `app.js` — sort matches, standings, scorers; sidebar favorites-first |
| `.map()` | `app.js` — rendering lists of cards/rows, form indicators |
| `.reduce()` | `app.js` — grouping matches by date, matchday extraction, stats summaries |
| `.find()` | `app.js` — finding active competition, TOTAL standings |
| `Promise.allSettled()` | `app.js` — parallel API calls with graceful fallback |
| Debouncing | `utils.js` — search input (350ms delay) |
| localStorage | `utils.js` — theme & favorites persistence |
| ES Modules | All JS files use `import`/`export` |
| CSS Custom Properties | `styles.css` — complete theming system |
| Responsive CSS | `styles.css` — mobile (480px), tablet (768px), desktop (1024px+) |

## 👤 Author

**Jinisha Tejura** — jinisha.t7@gmail.com

## 📄 License

This project is created for educational purposes.
