# Retail Forecast AI

Retail Forecast AI is a full-stack machine learning portfolio project for small
retail businesses. It helps owners track products, record daily sales, monitor
inventory levels, and forecast short-term product demand.

Tagline: "Predict demand. Prevent stockouts. Manage smarter."

## Features

- Professional SaaS landing page and responsive dashboard.
- Supabase Auth login/register with protected dashboard routes.
- Product CRUD scoped to each logged-in user.
- Daily sales entry with revenue calculated from product price and quantity.
- Dashboard cards for products, monthly sales, low stock, and high stockout risk.
- Sales trend chart, recent predictions, and stock status table.
- Forecast generation endpoint that calculates recent sales features, runs Node.js
  inference from a JSON ML artifact, saves the result, and explains the risk.
- Python ML pipeline with synthetic dataset generation, scikit-learn training,
  evaluation, and artifact export.

## Tech Stack

- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS
- Backend: Next.js Route Handlers running on Node.js
- Database: Supabase PostgreSQL
- Authentication: Supabase Auth
- Machine learning: Python, pandas, scikit-learn Ridge Regression
- Production inference: TypeScript utility reading `src/ml-artifacts/demand_model.json`
- Deployment: Vercel

## Architecture

The app is designed for Vercel. Python is used only during training and artifact
generation. Production requests do not require a Python server. When a user clicks
Generate Forecast, the Next.js API route fetches the product and sales history
from Supabase, derives model features, calls `predictDemand.ts`, and stores the
forecast in the `forecasts` table.

## Supabase Setup

1. Create a Supabase project.
2. Open the SQL editor and run `supabase/schema.sql`.
3. Copy your project URL and anon key into `.env.local`.
4. Enable email/password auth in Supabase Auth settings.

Required environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`SUPABASE_SERVICE_ROLE_KEY` is included for deployment readiness, but the current
MVP uses user-scoped Supabase clients and Row Level Security for app operations.
Do not commit real secrets.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, register a user, add products, record sales, and
generate forecasts.

## ML Training

```bash
cd ml
pip install -r requirements.txt
python generate_dataset.py
python train_model.py
python evaluate_model.py
```

`train_model.py` exports the model coefficients, intercept, feature names,
metrics, and timestamp to `src/ml-artifacts/demand_model.json`.

## Vercel Deployment

1. Push this repository to GitHub.
2. Import the project in Vercel.
3. Add the environment variables from `.env.example`.
4. Deploy the app.
5. Set `NEXT_PUBLIC_APP_URL` to the deployed Vercel URL or custom domain.

This project is prepared to be deployed under a future subdomain of frikhii.my.id
using Vercel Custom Domains.

## Notes

This is not NEXA Campus. It is a standalone portfolio application focused on
machine learning plus full-stack development.
