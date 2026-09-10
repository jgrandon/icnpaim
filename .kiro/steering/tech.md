# Tech Stack

## Runtime & language

- **Node.js** (package.json declares `engines.node: 24`; the Dockerfile builds on `node:14` — be aware of the mismatch).
- Server source is **ES modules** (`import`/`export`) transpiled with **Babel** into `server/lib`.
- Frontend is **React 17** JSX bundled with **Webpack 5** + Babel.

## Backend

- **Express 4** HTTP server (`server/src/server.js`), views rendered with **Pug**.
- **express-session** for sessions; expired sessions are purged on a 60s interval via **toad-scheduler**.
- LTI: **ims-lti**, **jsonwebtoken**, **pem-jwk** for LTI 1.1/1.3 flows, JWKS, and token services.
- **ims-caliper** for analytics events.
- HTTP clients: **axios** and **request** (legacy) for Blackboard and WordPress REST calls.

## Data layer

- **PostgreSQL** via **pg** — primary relational store (see `db/db.SQL` for schema: Subject, Unit, Content, Student, Progress, Grade, LearningRoute*).
- **node-json-db** — JSON file store under `server/src/database/*.json` for LTI app registrations, auth data, Blackboard tokens, and CIM data.
- **mongodb** driver is present as a dependency.
- WordPress acts as an external content source via its REST API / Custom Post Types.

## Frontend

- **React 17**, **react-router-dom 5**, **react-bootstrap**, **@material-ui/core** + **@material-ui/icons** (v4).
- **CSS Modules** enabled in Webpack (`*.module.css`); global styles in `public/css`.
- Utilities: **lodash**, **moment**, **classnames/clsx**, **uuid**, **query-string**, **react-sortablejs**.

## Configuration

- Environment via **dotenv** (`.env`, `.env.prod`, `.env.example`) — loaded server-side and injected into the browser bundle by **dotenv-webpack**.
- JSON config in `server/config/config.json`, overridable with `server/config/config_override.json` and env vars (`APP_URL`, `PORT`, `DATABASE_DIRECTORY`, `LTI_TEST_PROVIDER_PORT`).
- Key env vars: `LTI_*` (issuer, client id, deployment, endpoints), `WP_API_BASE` + `WORDPRESS_API_USER`/`WORDPRESS_API_PASSWORD` (or `WP_BASIC_AUTH`/`WP_JWT`), `BLACKBOARD_API_*`, `SESSION_SECRET`, `NODE_ENV`, `PORT`.

## Common commands

```bash
# Install (uses npm ci, skips scripts)
npm install

# Build backend (Babel: server/src -> server/lib) and frontend (Webpack)
npm run build-server
npm run build-public        # runs with --openssl-legacy-provider
npm run build               # both of the above

# Run the built server
npm start                   # node server/lib/server.js

# Build + run in one step
npm run dev
```

> Note: `build-public` sets `NODE_OPTIONS=--openssl-legacy-provider` and is written for a bash shell. On Windows/PowerShell adapt the env var (`$env:NODE_OPTIONS='--openssl-legacy-provider'`) or run inside WSL/Docker.

## Build & deploy

- **Docker**: `Dockerfile` builds both bundles and runs `launch.sh` (which optionally appends `HOST_ENTRY` to `/etc/hosts`, then starts the server). Container listens on `PORT` (defaults 8080).
- `docker-compose.yml` at root for the tool; `db/docker-compose.yml` for the database.
- CI/CD via GitHub Actions (`.github/workflows/deploy.yml`); intended for Railway-style hosting.

## Conventions

- Lint with **ESLint** (`eslint`, `eslint-plugin-react`); keep new code lint-clean.
- Never commit real secrets — use `.env.example` as the template.
- `NODE_TLS_REJECT_UNAUTHORIZED=0` is set for dev against self-signed LMS certs; do not rely on it in production.
