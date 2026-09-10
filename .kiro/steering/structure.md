# Project Structure

The repo is split into a **backend** (`server/`) and a **frontend** (`public/`), plus database and deployment assets at the root.

## Root

- `package.json` — scripts, deps (backend + frontend live in one package).
- `webpack.config.js` — frontend bundling (entry `public/src/app.js`, output `public/dist/bundle.js`).
- `.babelrc` — Babel config for the server build.
- `Dockerfile`, `launch.sh`, `docker-compose.yml` — containerization/run.
- `.env`, `.env.prod`, `.env.example` — environment configuration.
- `db/` — SQL schema and migrations: `db.SQL` (full schema), `seeding.SQL`, `updates/` (versioned migrations like `v1.2.SQL`), `docker-compose.yml`.
- `wordpress-setup-instructions.md` — how to wire up WordPress CPTs and endpoints.
- `test-wp-*.js` — standalone WordPress connectivity test scripts.
- `version.json` — app version metadata.

## Backend — `server/`

- `server/src/` — ES module source (transpiled to `server/lib/` by Babel).
  - `server.js` — Express app bootstrap, middleware, static serving, scheduler, routes, and an LMS HTTP proxy.
  - `config/config.js` + `server/config/config.json` — layered config (JSON < override JSON < env vars).
  - `app/` — application logic:
    - `routes.js`, `api-routes.js` — route registration (LTI/view routes vs. REST API).
    - LTI flows: `lti.js`, `lti-adv.js`, `lti-content-item.js`, `deep-linking.js`, `names-roles.js`, `proctoring.js`, `lti-token-service.js`, `hmac-sha1.js`.
    - Integrations: `wp-client.js`, `wp-grade-cpt.js`, `clients/wordpress.js`, `clients/blackboard.js`, `test-wp-connection.js`.
    - Grades & progress: `assign-grades.js`, `action_log.js`, `eventstore.js`, `groups.js`.
    - `handlers/` — request handlers per domain: `content.js`, `course.js`, `units.js`, `students.js`, `progress.js`, `grades.js`, `columns.js`, plus a `v2/` subfolder for newer handlers.
    - `db/` — data access adapters: `postgres.js` (relational), `dda.js`, `blackboard.js`.
    - `session-middleware.js`, `rest-service.js`, `processor.js`, `utils.js`, `lib/`.
  - `database/` — JSON file stores (`applications-data.json`, `auth-data.json`, `blackboard*.json`, `cim-data.json`) and `db-utility.js`.
- `server/views/` — Pug templates.
- `server/mockLti.json` — mock LTI payload for testing.

## Frontend — `public/`

- `public/src/` — React app source.
  - `app.js` — entry point.
  - `components/`
    - `organisms/` — composite UI (e.g. `contentCard/`, `Modal/`, `VerticalTabs/`, `TooltipIconButton.jsx`).
    - `pages/` — screens: LTI views (`ltiAdvView`, `ltiBobcatView`, `deepLinkView`, `cimRequestView`, `namesRolesView`, `groupsView`, `groupSetsView`), proctoring flows, `Dashboards/`, and `Admin/` (`ContentsAdmin/`, `LearningRoutes/`).
    - `errorBoundary.js`.
  - `services/` — API clients for the backend: `contents.js`, `units.js`, `learningRoutes.js`.
  - `common/`, `util/`, `hooks/` — shared helpers and React hooks.
- `public/css/app.css` — global styles; component styles use co-located `*.module.css` (CSS Modules).
- `public/images/` — static assets.
- `public/dist/` — Webpack build output (generated; do not edit by hand).

## Conventions

- **Backend files** use kebab-case (`lti-token-service.js`); **frontend components** use camelCase or PascalCase (`contentCard`, `Modal/index.jsx`).
- Group frontend components as `organisms` (reusable) vs `pages` (routed screens); co-locate `*.module.css` with the component.
- Backend request handling is organized by domain under `app/handlers/`; put data access in `app/db/` and external integrations in `app/clients/`.
- Schema changes: update `db/db.SQL` and add a versioned file under `db/updates/`.
- Generated output (`public/dist/`, `server/lib/`) is built, not authored — edit the corresponding `src`.
