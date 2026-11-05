-- King Fish ERP global foundation
-- Safe to run on an existing PostgreSQL database.

ALTER TABLE organizations ADD COLUMN IF NOT EXISTS country_code text NOT NULL DEFAULT 'EG';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS default_currency text NOT NULL DEFAULT 'EGP';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS default_locale text NOT NULL DEFAULT 'ar';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS default_time_zone text NOT NULL DEFAULT 'Africa/Cairo';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS fiscal_year_start_month integer NOT NULL DEFAULT 1;

ALTER TABLE branches ADD COLUMN IF NOT EXISTS country_code text NOT NULL DEFAULT 'EG';
ALTER TABLE branches ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'EGP';
ALTER TABLE branches ADD COLUMN IF NOT EXISTS time_zone text NOT NULL DEFAULT 'Africa/Cairo';
ALTER TABLE branches ADD COLUMN IF NOT EXISTS locale text NOT NULL DEFAULT 'ar';

CREATE TABLE IF NOT EXISTS currencies (
  id serial PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  symbol text NOT NULL,
  decimal_places integer NOT NULL DEFAULT 2,
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS tax_rates (
  id serial PRIMARY KEY,
  org_id integer NOT NULL REFERENCES organizations(id),
  country_code text NOT NULL,
  name text NOT NULL,
  rate double precision NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp NOT NULL DEFAULT now(),
  CONSTRAINT tax_rates_org_country_name_unique UNIQUE (org_id, country_code, name)
);

INSERT INTO currencies (code, name, symbol) VALUES
  ('USD', 'US Dollar', '$'),
  ('EUR', 'Euro', '€'),
  ('EGP', 'Egyptian Pound', 'ج.م'),
  ('GBP', 'Pound Sterling', '£'),
  ('AED', 'UAE Dirham', 'د.إ'),
  ('SAR', 'Saudi Riyal', 'ر.س')
ON CONFLICT (code) DO NOTHING;
