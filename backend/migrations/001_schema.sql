-- FuelEU Maritime Schema
-- Based on Regulation (EU) 2023/1805 - routes, ship compliance, bank entries, and pooling

-- =============================================================================
-- ROUTES
-- Tracks voyage/leg data for compliance reporting.
-- GHG intensity in gCO2eq/MJ; fuel consumption in tonnes; distance in NM.
-- =============================================================================
CREATE TABLE routes (
  route_id      VARCHAR(50) PRIMARY KEY,
  vessel_type   VARCHAR(50) NOT NULL,
  fuel_type     VARCHAR(50) NOT NULL,
  year          INTEGER NOT NULL,
  ghg_intensity DECIMAL(12, 4) NOT NULL,
  fuel_consumption DECIMAL(14, 4) NOT NULL,
  distance      DECIMAL(14, 4) NOT NULL,
  total_emissions DECIMAL(18, 4) NOT NULL,
  is_baseline   BOOLEAN DEFAULT false
);

-- =============================================================================
-- SHIP_COMPLIANCE
-- Annual compliance balance per ship. Positive = surplus, negative = deficit.
-- Compliance balance = (GHGIEtarget - GHGIEactual) × fuel energy amounts.
-- =============================================================================
CREATE TABLE ship_compliance (
  id            SERIAL PRIMARY KEY,
  ship_id       VARCHAR(50) NOT NULL,
  year          INTEGER NOT NULL,
  amount_gco2eq DECIMAL(18, 4) NOT NULL,
  UNIQUE (ship_id, year)
);

-- =============================================================================
-- BANK_ENTRIES
-- Banking mechanism: surplus carried forward to future years.
-- Tracks each banked amount with source year for application limits.
-- =============================================================================
CREATE TABLE bank_entries (
  id            SERIAL PRIMARY KEY,
  ship_id       VARCHAR(50) NOT NULL,
  year          INTEGER NOT NULL,
  amount_gco2eq DECIMAL(18, 4) NOT NULL,
  source_year   INTEGER NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bank_entries_ship_year ON bank_entries (ship_id, year);

-- =============================================================================
-- POOLS
-- Pooling mechanism (Article 21): ships combine compliance balances.
-- A pool groups ships for joint compliance in a given year.
-- =============================================================================
CREATE TABLE pools (
  id            SERIAL PRIMARY KEY,
  pool_name     VARCHAR(100) NOT NULL,
  year          INTEGER NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pool_members (
  pool_id       INTEGER NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  ship_id       VARCHAR(50) NOT NULL,
  PRIMARY KEY (pool_id, ship_id)
);

-- =============================================================================
-- SEED ROUTES (5 routes for assignment)
-- Using routeIds r1–r5; vessel types, fuels, years, and GHG intensities per spec.
-- =============================================================================
INSERT INTO routes (route_id, vessel_type, fuel_type, year, ghg_intensity, fuel_consumption, distance, total_emissions, is_baseline) VALUES
('r1', 'container', 'VLSFO', 2025, 85.00, 100.00, 1000.00, 348500000.00, true),
('r2', 'bulk', 'LNG', 2025, 90.50, 150.00, 1200.00, 556575000.00, false),
('r3', 'passenger', 'VLSFO', 2024, 88.00, 80.00, 800.00, 288640000.00, false),
('r4', 'container', 'VLSFO', 2025, 92.00, 120.00, 1100.00, 452640000.00, false),
('r5', 'bulk', 'methanol', 2025, 78.00, 90.00, 950.00, 287820000.00, false);
