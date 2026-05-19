# Bar Trivia

Self-contained bar trivia app. Runs on the GM's laptop; players join via WiFi.

## First-time setup

```bash
./scripts/setup.sh   # downloads PocketBase binary
cd frontend && npm install && cd ..
```

## Run

```bash
./scripts/dev.sh
```

Open http://localhost:5173 — first visit redirects to /setup to create the admin account.
Players connect to `http://<your-local-ip>:5173` on their phones.
