# Job Application Tracker

> 🚧 **In development**

A web and desktop application to organize a job search in one place: track every application through each stage,
keep notes and contacts, set follow-up reminders and see the whole pipeline at a glance.

## Planned features

- **Applications board** — move each application through stages (to apply, applied, interview, offer, rejected)
- **Company & contact notes** — recruiters, interviewers and everything learned along the way
- **Follow-up reminders** — never miss a thank-you email or a check-in
- **Documents** — keep track of which résumé and cover letter went where
- **Dashboard** — response rates and where applications stall
- **Bilingual** — English and French

## Tech stack

| Layer    | Technology                                          |
| -------- | --------------------------------------------------- |
| Frontend | Angular 22, TypeScript                              |
| Backend  | ASP.NET Core (.NET 10), EF Core                     |
| Database | PostgreSQL                                          |
| Desktop  | Tauri 2 — installers for Windows, macOS and Linux   |
| CI/CD    | GitHub Actions                                      |

The API and database are hosted; the same Angular app runs in the browser and inside the Tauri desktop shell.

## Project layout

| Folder     | Contents                                                     |
| ---------- | ------------------------------------------------------------ |
| `api/`     | .NET 10 Web API (`src/JobTracker.Api`) and tests             |
| `client/`  | Angular app                                                  |
| `desktop/` | Tauri shell that packages the Angular build as installers    |

## Getting started

Prerequisites: .NET 10 SDK, Node 24, Rust (stable) and Docker.

```bash
# 1. Database
docker compose up -d db

# 2. API — applies migrations on startup in Development, listens on http://localhost:5223
dotnet run --project api/src/JobTracker.Api

# 3. Web client — http://localhost:4200
npm --prefix client install
npm --prefix client start

# 4. Desktop app (starts the Angular dev server itself)
npm --prefix desktop install
npm --prefix desktop run dev
```

Migrations: `dotnet tool restore` then `dotnet ef migrations add <Name> --project src/JobTracker.Api --output-dir Data/Migrations` from `api/`.

## Desktop installers

Push a `v*` tag (for example `v0.1.0`) and the **Release desktop installers** workflow builds the
Windows, macOS and Linux installers and attaches them to a draft GitHub release.
Before the first release, set the hosted API URL in `client/src/environments/environment.ts`
and in the `connect-src` CSP in `desktop/src-tauri/tauri.conf.json`.

## Branches

- `main` — stable releases
- `develop` — integration branch; features are merged here first

## License

[MIT](LICENSE) © 2026 Asaréel Dadiouari
