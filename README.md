# Test Technique - Simulateur de Prêt

## Démarrage de l'application

```bash
docker compose up --build
```

L'application est accessible sur : `http://localhost:3000`

## Exécution des tests

D'abord démarrer l'application avec `docker compose up --build`

ensuite

```bash
npm install
npm run test:e2e
```

## Technologies utilisées

- Next.js 14
- React
- TypeScript
- shadcn/ui
- Playwright (Tests E2E)
- Docker
- Tailwind CSS
