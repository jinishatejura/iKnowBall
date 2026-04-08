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

