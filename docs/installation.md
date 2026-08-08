# Installation Guide

## Prerequisites

- Node.js 22 or newer
- pnpm 11.16.0 or newer

## Install

```bash
pnpm install
```

Create local environment values:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

## Run Locally

Web app:

```bash
pnpm dev
```

API:

```bash
pnpm dev:api
```

## Verify

```bash
pnpm lint
pnpm typecheck
pnpm build
```
