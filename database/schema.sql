-- ============================================================
-- TransitOps — Complete MySQL Database Schema
-- Version: 1.0.0
-- Created: 2026-07-12
-- Engine: MySQL 8.0+
-- ============================================================

-- ============================================================
-- 1. DATABASE CREATION
-- ============================================================

CREATE DATABASE IF NOT EXISTS transit_ops
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE transit_ops;

-- ============================================================
-- 2. DROP EXISTING TABLES (in reverse dependency order)
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS fuel_logs;
DROP TABLE IF EXISTS maintenance_logs;
DROP TABLE IF EXISTS trips;
DROP TABLE IF EXISTS drivers;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS regions;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 3. TABLE: roles
-- ============================================================

CREATE TABLE roles (
  id          INT           NOT NULL AUTO_INCREMENT,
  name        ENUM('ADMIN', 'MANAGER', 'DISPATCHER', 'VIEWER')
                            NOT NULL,
  description VARCHAR(255)  NOT NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uk_roles_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. TABLE: users
-- ============================================================

CREATE TABLE users (
  id            INT           NOT NULL AUTO_INCREMENT,
  role_id       INT           NOT NULL,
  first_name    VARCHAR(100)  NOT NULL,
  last_name     VARCHAR(100)  NOT NULL,
  email         VARCHAR(255)  NOT NULL,
  password      VARCHAR(255)  NOT NULL,
  phone         VARCHAR(20)   DEFAULT NULL,
  is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
  last_login_at DATETIME      DEFAULT NULL,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uk_users_email (email),
  INDEX idx_users_role (role_id),
  INDEX idx_users_active (is_active),

  CONSTRAINT fk_users_role
    FOREIGN KEY (role_id)
    REFERENCES roles (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. TABLE: regions
-- ============================================================

CREATE TABLE regions (
  id          INT           NOT NULL AUTO_INCREMENT,
  name        VARCHAR(255)  NOT NULL,
  code        VARCHAR(10)   NOT NULL,
  state       VARCHAR(100)  DEFAULT NULL,
  country     VARCHAR(100)  NOT NULL DEFAULT 'India',
  is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uk_regions_name (name),
  UNIQUE KEY uk_regions_code (code),
  INDEX idx_regions_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. TABLE: vehicles
-- ============================================================

CREATE TABLE vehicles (
  id                    INT             NOT NULL AUTO_INCREMENT,
  registration_number   VARCHAR(20)     NOT NULL,
  make                  VARCHAR(100)    NOT NULL,
  model                 VARCHAR(100)    NOT NULL,
  year                  INT             NOT NULL,
  type                  ENUM('TRUCK', 'VAN', 'BUS', 'CAR', 'TRAILER')
                                        NOT NULL,
  capacity_kg           DECIMAL(10,2)   NOT NULL,
  fuel_type             ENUM('DIESEL', 'PETROL', 'CNG', 'ELECTRIC')
                                        NOT NULL,
  status                ENUM('AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED')
                                        NOT NULL DEFAULT 'AVAILABLE',
  mileage               DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
  insurance_expiry      DATE            DEFAULT NULL,
  last_service_date     DATE            DEFAULT NULL,
  created_at            DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uk_vehicles_registration (registration_number),
  INDEX idx_vehicles_status (status),
  INDEX idx_vehicles_type (type),
  INDEX idx_vehicles_fuel_type (fuel_type),

  CONSTRAINT chk_vehicles_year
    CHECK (year >= 1990 AND year <= 2100),
  CONSTRAINT chk_vehicles_capacity
    CHECK (capacity_kg > 0),
  CONSTRAINT chk_vehicles_mileage
    CHECK (mileage >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. TABLE: drivers
-- ============================================================

CREATE TABLE drivers (
  id                INT             NOT NULL AUTO_INCREMENT,
  first_name        VARCHAR(100)    NOT NULL,
  last_name         VARCHAR(100)    NOT NULL,
  email             VARCHAR(255)    NOT NULL,
  phone             VARCHAR(20)     NOT NULL,
  license_number    VARCHAR(50)     NOT NULL,
  license_expiry    DATE            NOT NULL,
  license_type      ENUM('A', 'B', 'C', 'D', 'E')
                                    NOT NULL,
  status            ENUM('AVAILABLE', 'ON_TRIP', 'ON_LEAVE', 'SUSPENDED')
                                    NOT NULL DEFAULT 'AVAILABLE',
  date_of_birth     DATE            NOT NULL,
  hire_date         DATE            NOT NULL,
  address           TEXT            DEFAULT NULL,
  emergency_contact VARCHAR(20)     DEFAULT NULL,
  created_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uk_drivers_license (license_number),
  UNIQUE KEY uk_drivers_email (email),
  INDEX idx_drivers_status (status),
  INDEX idx_drivers_license_expiry (license_expiry)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. TABLE: trips
-- ============================================================

CREATE TABLE trips (
  id                      INT             NOT NULL AUTO_INCREMENT,
  trip_number             VARCHAR(20)     NOT NULL,
  vehicle_id              INT             NOT NULL,
  driver_id               INT             NOT NULL,
  dispatched_by_id        INT             NOT NULL,
  origin_region_id        INT             NOT NULL,
  destination_region_id   INT             NOT NULL,
  status                  ENUM('SCHEDULED', 'DISPATCHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')
                                          NOT NULL DEFAULT 'SCHEDULED',
  cargo_description       VARCHAR(500)    DEFAULT NULL,
  cargo_weight_kg         DECIMAL(10,2)   DEFAULT NULL,
  distance_km             DECIMAL(10,2)   DEFAULT NULL,
  scheduled_departure     DATETIME        NOT NULL,
  scheduled_arrival       DATETIME        NOT NULL,
  actual_departure        DATETIME        DEFAULT NULL,
  actual_arrival          DATETIME        DEFAULT NULL,
  notes                   TEXT            DEFAULT NULL,
  created_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uk_trips_number (trip_number),
  INDEX idx_trips_status (status),
  INDEX idx_trips_vehicle (vehicle_id),
  INDEX idx_trips_driver (driver_id),
  INDEX idx_trips_dispatched_by (dispatched_by_id),
  INDEX idx_trips_origin (origin_region_id),
  INDEX idx_trips_destination (destination_region_id),
  INDEX idx_trips_scheduled_dates (scheduled_departure, scheduled_arrival),
  INDEX idx_trips_status_dates (status, scheduled_departure),

  CONSTRAINT fk_trips_vehicle
    FOREIGN KEY (vehicle_id)
    REFERENCES vehicles (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  CONSTRAINT fk_trips_driver
    FOREIGN KEY (driver_id)
    REFERENCES drivers (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  CONSTRAINT fk_trips_dispatched_by
    FOREIGN KEY (dispatched_by_id)
    REFERENCES users (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  CONSTRAINT fk_trips_origin_region
    FOREIGN KEY (origin_region_id)
    REFERENCES regions (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  CONSTRAINT fk_trips_destination_region
    FOREIGN KEY (destination_region_id)
    REFERENCES regions (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  CONSTRAINT chk_trips_cargo_weight
    CHECK (cargo_weight_kg IS NULL OR cargo_weight_kg >= 0),
  CONSTRAINT chk_trips_distance
    CHECK (distance_km IS NULL OR distance_km >= 0),
  CONSTRAINT chk_trips_schedule
    CHECK (scheduled_arrival > scheduled_departure)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. TABLE: maintenance_logs
-- ============================================================

CREATE TABLE maintenance_logs (
  id              INT             NOT NULL AUTO_INCREMENT,
  vehicle_id      INT             NOT NULL,
  reported_by_id  INT             NOT NULL,
  type            ENUM('PREVENTIVE', 'CORRECTIVE', 'EMERGENCY')
                                  NOT NULL,
  description     TEXT            NOT NULL,
  status          ENUM('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')
                                  NOT NULL DEFAULT 'OPEN',
  cost            DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
  start_date      DATE            NOT NULL,
  end_date        DATE            DEFAULT NULL,
  vendor_name     VARCHAR(255)    DEFAULT NULL,
  notes           TEXT            DEFAULT NULL,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_maintenance_vehicle (vehicle_id),
  INDEX idx_maintenance_status (status),
  INDEX idx_maintenance_type (type),
  INDEX idx_maintenance_dates (start_date, end_date),
  INDEX idx_maintenance_reported_by (reported_by_id),

  CONSTRAINT fk_maintenance_vehicle
    FOREIGN KEY (vehicle_id)
    REFERENCES vehicles (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT fk_maintenance_reported_by
    FOREIGN KEY (reported_by_id)
    REFERENCES users (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  CONSTRAINT chk_maintenance_cost
    CHECK (cost >= 0),
  CONSTRAINT chk_maintenance_dates
    CHECK (end_date IS NULL OR end_date >= start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. TABLE: fuel_logs
-- ============================================================

CREATE TABLE fuel_logs (
  id                INT             NOT NULL AUTO_INCREMENT,
  vehicle_id        INT             NOT NULL,
  driver_id         INT             NOT NULL,
  recorded_by_id    INT             NOT NULL,
  fuel_date         DATE            NOT NULL,
  fuel_type         ENUM('DIESEL', 'PETROL', 'CNG', 'ELECTRIC')
                                    NOT NULL,
  quantity          DECIMAL(10,2)   NOT NULL,
  price_per_unit    DECIMAL(10,2)   NOT NULL,
  total_cost        DECIMAL(12,2)   NOT NULL,
  odometer_reading  DECIMAL(12,2)   NOT NULL,
  station           VARCHAR(255)    DEFAULT NULL,
  notes             TEXT            DEFAULT NULL,
  created_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_fuel_vehicle (vehicle_id),
  INDEX idx_fuel_driver (driver_id),
  INDEX idx_fuel_date (fuel_date),
  INDEX idx_fuel_recorded_by (recorded_by_id),
  INDEX idx_fuel_vehicle_date (vehicle_id, fuel_date),

  CONSTRAINT fk_fuel_vehicle
    FOREIGN KEY (vehicle_id)
    REFERENCES vehicles (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT fk_fuel_driver
    FOREIGN KEY (driver_id)
    REFERENCES drivers (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  CONSTRAINT fk_fuel_recorded_by
    FOREIGN KEY (recorded_by_id)
    REFERENCES users (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  CONSTRAINT chk_fuel_quantity
    CHECK (quantity > 0),
  CONSTRAINT chk_fuel_price
    CHECK (price_per_unit > 0),
  CONSTRAINT chk_fuel_total_cost
    CHECK (total_cost > 0),
  CONSTRAINT chk_fuel_odometer
    CHECK (odometer_reading >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 11. TABLE: expenses
-- ============================================================

CREATE TABLE expenses (
  id              INT             NOT NULL AUTO_INCREMENT,
  vehicle_id      INT             DEFAULT NULL,
  trip_id         INT             DEFAULT NULL,
  recorded_by_id  INT             NOT NULL,
  category        ENUM('FUEL', 'MAINTENANCE', 'INSURANCE', 'TOLLS', 'FINES', 'SALARY', 'MISCELLANEOUS')
                                  NOT NULL,
  amount          DECIMAL(12,2)   NOT NULL,
  description     VARCHAR(500)    NOT NULL,
  expense_date    DATE            NOT NULL,
  receipt_url     VARCHAR(500)    DEFAULT NULL,
  notes           TEXT            DEFAULT NULL,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_expenses_vehicle (vehicle_id),
  INDEX idx_expenses_trip (trip_id),
  INDEX idx_expenses_category (category),
  INDEX idx_expenses_date (expense_date),
  INDEX idx_expenses_recorded_by (recorded_by_id),
  INDEX idx_expenses_category_date (category, expense_date),

  CONSTRAINT fk_expenses_vehicle
    FOREIGN KEY (vehicle_id)
    REFERENCES vehicles (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  CONSTRAINT fk_expenses_trip
    FOREIGN KEY (trip_id)
    REFERENCES trips (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  CONSTRAINT fk_expenses_recorded_by
    FOREIGN KEY (recorded_by_id)
    REFERENCES users (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  CONSTRAINT chk_expenses_amount
    CHECK (amount > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 12. VIEWS
-- ============================================================

-- View: Fleet Overview — Current status of all vehicles
CREATE OR REPLACE VIEW vw_fleet_overview AS
SELECT
  v.id,
  v.registration_number,
  v.make,
  v.model,
  v.year,
  v.type,
  v.capacity_kg,
  v.fuel_type,
  v.status,
  v.mileage,
  v.insurance_expiry,
  v.last_service_date,
  COUNT(DISTINCT t.id) AS total_trips,
  COALESCE(SUM(CASE WHEN t.status = 'COMPLETED' THEN 1 ELSE 0 END), 0) AS completed_trips,
  COALESCE(SUM(CASE WHEN t.status = 'CANCELLED' THEN 1 ELSE 0 END), 0) AS cancelled_trips,
  (SELECT COUNT(*) FROM maintenance_logs ml WHERE ml.vehicle_id = v.id) AS total_maintenance,
  (SELECT COALESCE(SUM(ml.cost), 0) FROM maintenance_logs ml WHERE ml.vehicle_id = v.id) AS total_maintenance_cost,
  (SELECT COALESCE(SUM(fl.total_cost), 0) FROM fuel_logs fl WHERE fl.vehicle_id = v.id) AS total_fuel_cost
FROM vehicles v
LEFT JOIN trips t ON t.vehicle_id = v.id
GROUP BY v.id;

-- View: Driver Performance — Stats per driver
CREATE OR REPLACE VIEW vw_driver_performance AS
SELECT
  d.id,
  d.first_name,
  d.last_name,
  d.license_number,
  d.license_expiry,
  d.status,
  COUNT(DISTINCT t.id) AS total_trips,
  COALESCE(SUM(CASE WHEN t.status = 'COMPLETED' THEN 1 ELSE 0 END), 0) AS completed_trips,
  COALESCE(SUM(CASE WHEN t.status = 'CANCELLED' THEN 1 ELSE 0 END), 0) AS cancelled_trips,
  COALESCE(SUM(CASE WHEN t.status = 'COMPLETED' THEN t.distance_km ELSE 0 END), 0) AS total_distance_km,
  COALESCE(SUM(fl.total_cost), 0) AS total_fuel_cost
FROM drivers d
LEFT JOIN trips t ON t.driver_id = d.id
LEFT JOIN fuel_logs fl ON fl.driver_id = d.id
GROUP BY d.id;

-- View: Monthly Expense Summary
CREATE OR REPLACE VIEW vw_monthly_expenses AS
SELECT
  YEAR(e.expense_date) AS expense_year,
  MONTH(e.expense_date) AS expense_month,
  e.category,
  COUNT(*) AS total_entries,
  SUM(e.amount) AS total_amount,
  AVG(e.amount) AS avg_amount,
  MIN(e.amount) AS min_amount,
  MAX(e.amount) AS max_amount
FROM expenses e
GROUP BY
  YEAR(e.expense_date),
  MONTH(e.expense_date),
  e.category
ORDER BY expense_year DESC, expense_month DESC;

-- View: Trip Summary — Enriched trip data with names
CREATE OR REPLACE VIEW vw_trip_summary AS
SELECT
  t.id,
  t.trip_number,
  t.status,
  t.cargo_description,
  t.cargo_weight_kg,
  t.distance_km,
  t.scheduled_departure,
  t.scheduled_arrival,
  t.actual_departure,
  t.actual_arrival,
  t.notes,
  t.created_at,
  v.registration_number AS vehicle_registration,
  v.make AS vehicle_make,
  v.model AS vehicle_model,
  v.type AS vehicle_type,
  v.capacity_kg AS vehicle_capacity_kg,
  CONCAT(d.first_name, ' ', d.last_name) AS driver_name,
  d.license_number AS driver_license,
  d.phone AS driver_phone,
  CONCAT(u.first_name, ' ', u.last_name) AS dispatched_by_name,
  r_origin.name AS origin_region,
  r_origin.code AS origin_code,
  r_dest.name AS destination_region,
  r_dest.code AS destination_code
FROM trips t
INNER JOIN vehicles v ON v.id = t.vehicle_id
INNER JOIN drivers d ON d.id = t.driver_id
INNER JOIN users u ON u.id = t.dispatched_by_id
INNER JOIN regions r_origin ON r_origin.id = t.origin_region_id
INNER JOIN regions r_dest ON r_dest.id = t.destination_region_id;

-- View: Dashboard KPIs
CREATE OR REPLACE VIEW vw_dashboard_kpis AS
SELECT
  (SELECT COUNT(*) FROM vehicles WHERE status != 'RETIRED') AS total_active_vehicles,
  (SELECT COUNT(*) FROM vehicles WHERE status = 'AVAILABLE') AS available_vehicles,
  (SELECT COUNT(*) FROM vehicles WHERE status = 'ON_TRIP') AS vehicles_on_trip,
  (SELECT COUNT(*) FROM vehicles WHERE status = 'IN_SHOP') AS vehicles_in_shop,
  (SELECT COUNT(*) FROM drivers) AS total_drivers,
  (SELECT COUNT(*) FROM drivers WHERE status = 'AVAILABLE') AS available_drivers,
  (SELECT COUNT(*) FROM drivers WHERE status = 'ON_TRIP') AS drivers_on_trip,
  (SELECT COUNT(*) FROM trips) AS total_trips,
  (SELECT COUNT(*) FROM trips WHERE status = 'COMPLETED') AS completed_trips,
  (SELECT COUNT(*) FROM trips WHERE status IN ('SCHEDULED', 'DISPATCHED', 'IN_PROGRESS')) AS active_trips,
  (SELECT COALESCE(SUM(cost), 0) FROM maintenance_logs) AS total_maintenance_cost,
  (SELECT COALESCE(SUM(total_cost), 0) FROM fuel_logs) AS total_fuel_cost,
  (SELECT COALESCE(SUM(amount), 0) FROM expenses) AS total_expenses,
  (SELECT COALESCE(SUM(distance_km), 0) FROM trips WHERE status = 'COMPLETED') AS total_distance_km;

-- ============================================================
-- 13. TRIGGERS
-- ============================================================

-- Trigger: Auto-set vehicle to IN_SHOP when maintenance is created
DELIMITER //

CREATE TRIGGER trg_maintenance_after_insert
AFTER INSERT ON maintenance_logs
FOR EACH ROW
BEGIN
  IF NEW.status IN ('OPEN', 'IN_PROGRESS') THEN
    UPDATE vehicles
    SET status = 'IN_SHOP'
    WHERE id = NEW.vehicle_id
      AND status != 'RETIRED';
  END IF;
END //

-- Trigger: Restore vehicle status when maintenance is completed or cancelled
CREATE TRIGGER trg_maintenance_after_update
AFTER UPDATE ON maintenance_logs
FOR EACH ROW
BEGIN
  -- When maintenance is completed or cancelled, check if vehicle has other open maintenance
  IF NEW.status IN ('COMPLETED', 'CANCELLED') AND OLD.status IN ('OPEN', 'IN_PROGRESS') THEN
    -- Only restore if no other active maintenance exists for this vehicle
    IF NOT EXISTS (
      SELECT 1 FROM maintenance_logs
      WHERE vehicle_id = NEW.vehicle_id
        AND id != NEW.id
        AND status IN ('OPEN', 'IN_PROGRESS')
    ) THEN
      UPDATE vehicles
      SET status = 'AVAILABLE'
      WHERE id = NEW.vehicle_id
        AND status = 'IN_SHOP';
    END IF;
  END IF;
END //

DELIMITER ;

-- ============================================================
-- 14. STORED PROCEDURES
-- ============================================================

DELIMITER //

-- Procedure: Dispatch a trip (sets vehicle + driver to ON_TRIP)
CREATE PROCEDURE sp_dispatch_trip(
  IN p_trip_id INT,
  OUT p_success BOOLEAN,
  OUT p_message VARCHAR(255)
)
BEGIN
  DECLARE v_trip_status VARCHAR(20);
  DECLARE v_vehicle_id INT;
  DECLARE v_driver_id INT;
  DECLARE v_vehicle_status VARCHAR(20);
  DECLARE v_driver_status VARCHAR(20);
  DECLARE v_driver_license_expiry DATE;
  DECLARE v_cargo_weight DECIMAL(10,2);
  DECLARE v_vehicle_capacity DECIMAL(10,2);

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SET p_success = FALSE;
    SET p_message = 'Database error occurred during dispatch';
  END;

  START TRANSACTION;

  -- Fetch trip details
  SELECT status, vehicle_id, driver_id, cargo_weight_kg
  INTO v_trip_status, v_vehicle_id, v_driver_id, v_cargo_weight
  FROM trips WHERE id = p_trip_id FOR UPDATE;

  IF v_trip_status IS NULL THEN
    SET p_success = FALSE;
    SET p_message = 'Trip not found';
    ROLLBACK;
  ELSEIF v_trip_status != 'SCHEDULED' THEN
    SET p_success = FALSE;
    SET p_message = CONCAT('Trip cannot be dispatched from status: ', v_trip_status);
    ROLLBACK;
  ELSE
    -- Check vehicle
    SELECT status, capacity_kg INTO v_vehicle_status, v_vehicle_capacity
    FROM vehicles WHERE id = v_vehicle_id FOR UPDATE;

    IF v_vehicle_status != 'AVAILABLE' THEN
      SET p_success = FALSE;
      SET p_message = CONCAT('Vehicle is not available. Current status: ', v_vehicle_status);
      ROLLBACK;
    ELSE
      -- Check driver
      SELECT status, license_expiry INTO v_driver_status, v_driver_license_expiry
      FROM drivers WHERE id = v_driver_id FOR UPDATE;

      IF v_driver_status != 'AVAILABLE' THEN
        SET p_success = FALSE;
        SET p_message = CONCAT('Driver is not available. Current status: ', v_driver_status);
        ROLLBACK;
      ELSEIF v_driver_license_expiry < CURDATE() THEN
        SET p_success = FALSE;
        SET p_message = 'Driver license has expired';
        ROLLBACK;
      ELSEIF v_cargo_weight IS NOT NULL AND v_cargo_weight > v_vehicle_capacity THEN
        SET p_success = FALSE;
        SET p_message = CONCAT('Cargo weight (', v_cargo_weight, ' kg) exceeds vehicle capacity (', v_vehicle_capacity, ' kg)');
        ROLLBACK;
      ELSE
        -- All checks passed — dispatch
        UPDATE trips
        SET status = 'DISPATCHED',
            actual_departure = NOW()
        WHERE id = p_trip_id;

        UPDATE vehicles SET status = 'ON_TRIP' WHERE id = v_vehicle_id;
        UPDATE drivers SET status = 'ON_TRIP' WHERE id = v_driver_id;

        SET p_success = TRUE;
        SET p_message = 'Trip dispatched successfully';
        COMMIT;
      END IF;
    END IF;
  END IF;
END //

-- Procedure: Complete a trip (restores vehicle + driver to AVAILABLE)
CREATE PROCEDURE sp_complete_trip(
  IN p_trip_id INT,
  IN p_actual_distance_km DECIMAL(10,2),
  OUT p_success BOOLEAN,
  OUT p_message VARCHAR(255)
)
BEGIN
  DECLARE v_trip_status VARCHAR(20);
  DECLARE v_vehicle_id INT;
  DECLARE v_driver_id INT;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SET p_success = FALSE;
    SET p_message = 'Database error occurred during completion';
  END;

  START TRANSACTION;

  SELECT status, vehicle_id, driver_id
  INTO v_trip_status, v_vehicle_id, v_driver_id
  FROM trips WHERE id = p_trip_id FOR UPDATE;

  IF v_trip_status IS NULL THEN
    SET p_success = FALSE;
    SET p_message = 'Trip not found';
    ROLLBACK;
  ELSEIF v_trip_status NOT IN ('DISPATCHED', 'IN_PROGRESS') THEN
    SET p_success = FALSE;
    SET p_message = CONCAT('Trip cannot be completed from status: ', v_trip_status);
    ROLLBACK;
  ELSE
    UPDATE trips
    SET status = 'COMPLETED',
        actual_arrival = NOW(),
        distance_km = COALESCE(p_actual_distance_km, distance_km)
    WHERE id = p_trip_id;

    UPDATE vehicles SET status = 'AVAILABLE' WHERE id = v_vehicle_id;
    UPDATE drivers SET status = 'AVAILABLE' WHERE id = v_driver_id;

    -- Update vehicle mileage
    IF p_actual_distance_km IS NOT NULL THEN
      UPDATE vehicles
      SET mileage = mileage + p_actual_distance_km
      WHERE id = v_vehicle_id;
    END IF;

    SET p_success = TRUE;
    SET p_message = 'Trip completed successfully';
    COMMIT;
  END IF;
END //

-- Procedure: Cancel a trip (restores vehicle + driver statuses)
CREATE PROCEDURE sp_cancel_trip(
  IN p_trip_id INT,
  IN p_cancellation_reason TEXT,
  OUT p_success BOOLEAN,
  OUT p_message VARCHAR(255)
)
BEGIN
  DECLARE v_trip_status VARCHAR(20);
  DECLARE v_vehicle_id INT;
  DECLARE v_driver_id INT;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SET p_success = FALSE;
    SET p_message = 'Database error occurred during cancellation';
  END;

  START TRANSACTION;

  SELECT status, vehicle_id, driver_id
  INTO v_trip_status, v_vehicle_id, v_driver_id
  FROM trips WHERE id = p_trip_id FOR UPDATE;

  IF v_trip_status IS NULL THEN
    SET p_success = FALSE;
    SET p_message = 'Trip not found';
    ROLLBACK;
  ELSEIF v_trip_status IN ('COMPLETED', 'CANCELLED') THEN
    SET p_success = FALSE;
    SET p_message = CONCAT('Trip cannot be cancelled from status: ', v_trip_status);
    ROLLBACK;
  ELSE
    UPDATE trips
    SET status = 'CANCELLED',
        notes = CASE
          WHEN notes IS NULL THEN CONCAT('Cancelled: ', COALESCE(p_cancellation_reason, 'No reason provided'))
          ELSE CONCAT(notes, '\nCancelled: ', COALESCE(p_cancellation_reason, 'No reason provided'))
        END
    WHERE id = p_trip_id;

    -- Restore statuses only if they were changed during dispatch
    IF v_trip_status IN ('DISPATCHED', 'IN_PROGRESS') THEN
      UPDATE vehicles SET status = 'AVAILABLE' WHERE id = v_vehicle_id AND status = 'ON_TRIP';
      UPDATE drivers SET status = 'AVAILABLE' WHERE id = v_driver_id AND status = 'ON_TRIP';
    END IF;

    SET p_success = TRUE;
    SET p_message = 'Trip cancelled successfully';
    COMMIT;
  END IF;
END //

-- Procedure: Get fleet utilization percentage
CREATE PROCEDURE sp_fleet_utilization(
  OUT p_utilization_pct DECIMAL(5,2),
  OUT p_total_active INT,
  OUT p_in_use INT
)
BEGIN
  SELECT
    COUNT(*) INTO p_total_active
  FROM vehicles
  WHERE status != 'RETIRED';

  SELECT
    COUNT(*) INTO p_in_use
  FROM vehicles
  WHERE status = 'ON_TRIP';

  IF p_total_active > 0 THEN
    SET p_utilization_pct = (p_in_use / p_total_active) * 100;
  ELSE
    SET p_utilization_pct = 0;
  END IF;
END //

DELIMITER ;

-- ============================================================
-- 15. VERIFICATION QUERY
-- ============================================================

-- Run this to verify all tables were created
SELECT
  TABLE_NAME,
  TABLE_ROWS,
  ENGINE,
  TABLE_COLLATION
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'transit_ops'
ORDER BY TABLE_NAME;
