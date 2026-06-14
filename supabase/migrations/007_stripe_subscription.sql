-- Migration 007: Stripe subscription fields on businesses

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'trialing',
  ADD COLUMN IF NOT EXISTS subscription_plan text DEFAULT 'pro',
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz DEFAULT NOW() + INTERVAL '14 days',
  ADD COLUMN IF NOT EXISTS current_period_end timestamptz,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean DEFAULT false;
