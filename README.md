# On This Day

[![CI](https://github.com/ander-hg/on-this-day/actions/workflows/ci.yml/badge.svg)](https://github.com/ander-hg/on-this-day/actions/workflows/ci.yml)

A small full-stack app that surfaces historical events for the current date,
pulled live from Wikipedia's [On This Day](https://en.wikipedia.org/wiki/Wikipedia:On_this_day)
feed. A FastAPI backend fetches and caches the daily feed; a React + TypeScript
frontend renders the featured event and the rest of the day's history.

![Screenshot of the On This Day app showing a featured historical event card](docs/screenshot.png)

**Live demo:** _added once deployed — see [Deployment](#deployment)_

## Tech stack

- **Backend:** FastAPI, httpx, pytest, ruff, mypy (strict)
- **Frontend:** React, Vite, TypeScript, Vitest, React Testing Library, ESLint, Prettier

## Running locally

You'll need Python 3.11+ and Node.js 20+.

### Backend

```sh
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS/Linux
python -m pip install -e ".[dev]"
uvicorn app.main:app --reload
```

The API is now running at `http://localhost:8000`.

### Frontend

In a second terminal, with the backend still running:

```sh
cd frontend
npm install
npm run dev
```

The app is now running at `http://localhost:5173`. The dev server proxies
`/api` requests to the backend, so both must be running for the app to load
data.

## Tests, linting, and type-checking

```sh
# backend/, with the venv active
pytest -q
ruff check .
mypy .

# frontend/
npm test
npm run lint
npx tsc --noEmit
```

## API

- `GET /api/today?date=MM-DD` — historical events for the given date.
  `date` is optional; it defaults to the current date in UTC.
- `GET /api/health` — service status and a generated timestamp.

## Deployment

Deployed as a single service (build the frontend, then install and run the
backend, which serves both the API and the built frontend from one origin).
The free tier used for this demo may cold-start after a period of
inactivity — the first request after a while can take a few seconds.

## License

[MIT](LICENSE)
