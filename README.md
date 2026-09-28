# HerbChain

HerbChain is a full-stack traceability platform for Ayurvedic and medicinal herbs. It lets supply-chain participants register herb batches, record each stage of the journey, generate a QR-verification link, and inspect an auditable product history.

The current application is a working prototype: the React client reads and writes live data through the FastAPI service. Blockchain, IPFS, and Gemini integrations are optional and can be configured when their credentials are available.

## Features

- Account registration, mandatory onboarding flow (roles & KYC), JWT login, and session restoration
- Batch creation with herb identity, quantity, and collection origin
- Supply-chain progression: collection, processing, testing, shipment, and retail
- Dashboard driven by live batch records
- Public batch verification through a batch ID or QR-code URL
- Image upload flow for AI-assisted plant analysis
- English/Hindi user interface support

## Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│ React + TypeScript + Vite client                             │
│ Dashboard · batches · verification · authentication · AI UI │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP / JSON  (/api)
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ FastAPI service                                              │
│ Auth · onboarding · batch API · public verification · AI/IPFS│
└───────────┬──────────────────────┬──────────────────────────┘
            │                      │
            ▼                      ▼
  In-process batch store       Optional integrations
  Mock Mongo user store        MongoDB · Web3 · Gemini · Pinata
```

### Project layout

```text
frontend/                  React application
  src/contexts/            Authentication and batch state
  src/lib/api.ts           HTTP client and API contracts
  src/pages/               Route-level UI (including Onboarding)
  src/components/          Reusable interface components
backend/                   FastAPI application
  app/routers/             Auth (including KYC onboarding), batches, verification, AI, IPFS routes
  app/services/            Batch store, Gemini, and Pinata services
  app/middleware/          JWT authentication
  contracts/HerbChain.sol  Solidity supply-chain contract
```

## Prerequisites

- Node.js 18 or later
- npm 9 or later
- Python 3.10 or later

For optional production integrations, also prepare MongoDB, an EVM-compatible RPC endpoint, a deployed `HerbChain` contract, Google Gemini credentials, and Pinata credentials.

## Local setup

### 1. Start the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows PowerShell: .\\venv\\Scripts\\Activate.ps1
python -m pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`, with interactive OpenAPI documentation at `http://localhost:8000/docs`.

### 2. Start the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:3000`). The Vite development server proxies `/api` requests to the backend at port 8000.

### 3. Use the application

1. Register an account at `/register`.
2. Complete the onboarding and KYC form when prompted.
3. Once completed, you will be directed to the dashboard.
4. Create a batch from **Batches → Create Batch**.
5. Add events as the batch moves through its stages.
6. Open `/verify/<batch-id>` or scan the generated QR code to verify the public record.

## API overview

| Area | Endpoint | Purpose |
| --- | --- | --- |
| Auth | `POST /api/auth/register` | Create an account |
| Auth | `POST /api/auth/login` | Obtain a bearer token |
| Auth | `GET /api/auth/me` | Retrieve the current user |
| Auth | `POST /api/auth/onboarding` | Submit role and KYC details |
| Batches | `GET /api/batches` | List live batches |
| Batches | `POST /api/batches` | Create a batch (authenticated) |
| Batches | `GET /api/batches/{batch_id}` | Retrieve one batch |
| Batches | `POST /api/batches/{batch_id}/events` | Record the next event (authenticated) |
| Verify | `GET /api/verify/{batch_id}` | Public batch verification |
| AI | `POST /api/ai/analyze` | Analyze an uploaded image |
| IPFS | `POST /api/ipfs/upload` | Upload a file to Pinata/IPFS |

Authenticated calls use `Authorization: Bearer <token>`.

## Configuration

Copy `backend/.env.example` to `backend/.env` and set values appropriate to the environment.

| Variable | Description |
| --- | --- |
| `SECRET_KEY` | Strong random value used to sign JWTs |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Login token lifetime |
| `MONGODB_URL`, `DATABASE_NAME` | MongoDB connection settings |
| `RPC_URL`, `CONTRACT_ADDRESS`, `PRIVATE_KEY` | Blockchain write configuration |
| `GEMINI_API_KEY` | Enables real plant-image analysis |
| `PINATA_API_KEY`, `PINATA_SECRET_API_KEY` | Enables real IPFS uploads |

For a separately hosted API, set `VITE_API_URL` during the frontend build, for example:

```bash
VITE_API_URL=https://api.example.com/api npm run build
```

## Testing and quality checks

Run the frontend production build and type check:

```bash
cd frontend
npm run build
```

Run frontend linting:

```bash
cd frontend
npm run lint
```

Validate backend Python syntax:

```bash
cd ..
python -m py_compile $(find backend -name '*.py')
```

For a quick manual API smoke test, use the Swagger UI at `/docs`: register an account, log in, authorize with the returned token, create a batch, then call the verification endpoint.

## Deployment

### Backend

Deploy the `backend/` directory as an ASGI service. A typical production command is:

```bash
uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
```

Set production secrets through the hosting provider rather than committing `.env`. Restrict CORS origins in `backend/main.py` to the deployed frontend URL, terminate TLS at a trusted proxy or platform, and run behind a process manager suitable for the host.

### Frontend

Build static assets with:

```bash
cd frontend
VITE_API_URL=https://api.example.com/api npm run build
```

Deploy `frontend/dist/` to any static host. Configure SPA fallback so unknown client routes return `index.html`.

## Current prototype limits

- Batch records are stored in memory and reset when the backend restarts.
- User records use a mock Mongo-compatible client by default.
- The Solidity contract is included but requires compilation, deployment, ABI configuration, and RPC credentials before on-chain writes are enabled.
- Without a Gemini key, the AI endpoint returns a clearly marked placeholder assessment; without Pinata credentials, IPFS uploads return a mock hash.

The recommended next production milestone is replacing the temporary stores with MongoDB repositories, then enabling deployed-contract transactions and durable media storage.

## License

No license has been declared yet. Add one before distributing or accepting external contributions.
