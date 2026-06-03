# Retail Forecast AI Portfolio Case Study

## Problem

Small retail businesses often track stock manually or through simple spreadsheets.
That makes it hard to see which products are trending, which items are close to
stockout, and how much inventory should be ordered before demand spikes.

## Solution

Retail Forecast AI is a full-stack demand forecasting dashboard. It combines
product management, sales history, inventory status, and machine learning
predictions in a single SaaS-style web app.

## Main Features

- Product CRUD with category, SKU, price, current stock, and minimum stock.
- Daily sales records with automatic revenue calculation.
- Dashboard summaries for total products, monthly sales, low stock products, and
  high stockout risk products.
- Sales trend visualization.
- Product-level forecast generation with clear risk explanations.
- Supabase Auth with protected user-specific data.

## AI/ML Implementation

The ML workflow lives in the `ml` folder. It generates synthetic retail data,
trains a Ridge Regression model with scikit-learn, evaluates the model, and
exports a JSON artifact. The production app loads that artifact in Node.js and
calculates demand with coefficients and intercept values.

The model predicts `predicted_sales_next_7_days` from recent sales windows,
average daily sales, stock levels, price, day of week, and month. Stockout risk
uses a transparent business rule:

- High risk when predicted 7-day demand is greater than or equal to current stock.
- Medium risk when predicted demand is at least 70% of current stock.
- Low risk otherwise.

## Full-Stack Architecture

- Next.js App Router renders the landing page, auth pages, and dashboard routes.
- Route Handlers expose product, sales, and forecast APIs.
- Supabase Auth manages users.
- Supabase PostgreSQL stores products, sales records, and forecasts.
- Row Level Security ensures users only access their own records.
- Vercel hosts the frontend and serverless API routes.
- Python is used for training only; deployment does not require a Python server.

## Database Design

The schema includes:

- `profiles`
- `products`
- `sales_records`
- `forecasts`

Each business table has a `user_id` reference to `auth.users(id)`, with RLS
policies limiting select, insert, update, and delete access to the owner.

## Screenshots

Add screenshots after deployment:

- Landing page
- Dashboard overview
- Product management
- Sales recording
- Forecast detail

## What I Learned

- How to design a Vercel-friendly ML architecture without a separate Python API.
- How to connect Supabase Auth, Row Level Security, and Next.js Route Handlers.
- How to export a transparent regression model into JSON for production inference.
- How to present ML results with business-oriented explanations.

## Future Improvements

- Add CSV import for products and sales history.
- Add multi-store support.
- Add model retraining from real user data.
- Add forecast confidence bands and seasonality analysis.
- Add notification emails for high-risk stockouts.
