-- Name: Datacenter Infrastructure Data
-- Description: Loads sample datacenter, rack, and rack position data for development. Creates a realistic datacenter infrastructure with multiple locations, racks, and available rack positions.
-- Dependencies: none
-- Environment: development
-- Datacenter Infrastructure Seed Data

-- ===================================================================
-- DATACENTERS
-- ===================================================================
INSERT IGNORE INTO datacenters (
    data_center_id,
    data_center_name,
    data_center_code,
    description,
    address,
    city,
    state_province,
    country,
    postal_code,
    region,
    latitude,
    longitude,
    provider,
    provider_facility_id,
    tier_level,
    total_floor_space_sqm,
    power_capacity_kw,
    cooling_capacity_kw,
    status,
    facility_manager,
    contact_phone,
    contact_email,
    emergency_contact,
    emergency_phone,
    timezone,
    operating_hours,
    tags,
    metadata
) VALUES 
-- Datacenter 1: San Francisco Development Datacenter
(1, 
 'San Francisco Lab', 
 'SFO-LAB-01',
 'Primary development and testing datacenter located in San Francisco',
 '123 Market Street, Suite 400',
 'San Francisco',
 'California',
 'United States',
 '94105',
 'US-West',
 37.79251900,
 -122.39731900,
 'Equinix',
 'SV1-12345',
 'TIER_III',
 500.00,
 500.00,
 400.00,
 'ACTIVE',
 'John Smith',
 '+1-415-555-0100',
 'jsmith@example.com',
 'Jane Doe',
 '+1-415-555-0199',
 'America/Los_Angeles',
 '24/7',
 '{"environment": "development", "cost_center": "LAB-001"}',
 '{"access_requirements": "badge_and_biometric", "security_level": "high"}'
),

-- Datacenter 2: Dallas Production Datacenter
(2,
 'Dallas Production Center',
 'DFW-PROD-01',
 'Primary production datacenter in Dallas-Fort Worth',
 '2000 Commerce Street',
 'Dallas',
 'Texas',
 'United States',
 '75201',
 'US-Central',
 32.78306000,
 -96.80667000,
 'CyrusOne',
 'DFW-98765',
 'TIER_IV',
 2000.00,
 2500.00,
 2000.00,
 'ACTIVE',
 'Robert Johnson',
 '+1-214-555-0200',
 'rjohnson@example.com',
 'Sarah Williams',
 '+1-214-555-0299',
 'America/Chicago',
 '24/7',
 '{"environment": "production", "cost_center": "PROD-001"}',
 '{"access_requirements": "badge_and_biometric_and_escort", "security_level": "critical"}'
),

-- Datacenter 3: New York Backup Datacenter
(3,
 'New York DR Site',
 'NYC-DR-01',
 'Disaster recovery and backup datacenter in New York',
 '32 Avenue of the Americas',
 'New York',
 'New York',
 'United States',
 '10013',
 'US-East',
 40.71427800,
 -74.00597300,
 'Digital Realty',
 'NYC-DR-543',
 'TIER_III',
 800.00,
 1000.00,
 800.00,
 'ACTIVE',
 'Michael Chen',
 '+1-212-555-0300',
 'mchen@example.com',
 'Emily Rodriguez',
 '+1-212-555-0399',
 'America/New_York',
 '24/7',
 '{"environment": "disaster_recovery", "cost_center": "DR-001"}',
 '{"access_requirements": "badge", "security_level": "medium"}'
);

-- ===================================================================
-- DATACENTER RACKS
-- ===================================================================
INSERT IGNORE INTO datacenter_racks (
    rack_id,
    data_center_id,
    rack_name,
    rack_code,
    description,
    rack_height_u,
    rack_width_mm,
    rack_depth_mm,
    row_name,
    aisle_name,
    room_name,
    floor_level,
    power_capacity_w,
    power_usage_w,
    cooling_type,
    network_zone,
    status,
    total_u_available,
    occupied_u,
    reserved_u,
    free_u,
    access_level,
    tags,
    metadata
) VALUES 
-- SFO Lab Racks
(1, 1, 'SFO-LAB-01-R01', 'R01', 'Development server rack 1', 
 42, 600, 1000, 'A', 'HOT-A1', 'Main Lab', 1, 
 5000, 1500, 'AIR', 'DEV-ZONE-1', 'ACTIVE', 
 42, 15, 5, 22, 'RESTRICTED',
 '{"environment": "development"}',
 '{"pdu_count": 2, "network_drops": 4}'
),

(2, 1, 'SFO-LAB-01-R02', 'R02', 'Development server rack 2',
 42, 600, 1000, 'A', 'HOT-A1', 'Main Lab', 1,
 5000, 800, 'AIR', 'DEV-ZONE-1', 'ACTIVE',
 42, 8, 2, 32, 'RESTRICTED',
 '{"environment": "development"}',
 '{"pdu_count": 2, "network_drops": 4}'
),

(3, 1, 'SFO-LAB-01-R03', 'R03', 'Development storage rack',
 42, 600, 1200, 'B', 'HOT-B1', 'Main Lab', 1,
 8000, 3200, 'HYBRID', 'DEV-ZONE-2', 'ACTIVE',
 42, 20, 0, 22, 'RESTRICTED',
 '{"environment": "development", "purpose": "storage"}',
 '{"pdu_count": 4, "network_drops": 8}'
),

-- Dallas Production Racks
(4, 2, 'DFW-PROD-01-R01', 'R01', 'Production compute rack 1',
 48, 600, 1000, 'C', 'HOT-C1', 'Production Floor 1', 2,
 10000, 4500, 'LIQUID', 'PROD-ZONE-1', 'ACTIVE',
 48, 28, 4, 16, 'HIGH_SECURITY',
 '{"environment": "production", "criticality": "high"}',
 '{"pdu_count": 4, "network_drops": 8, "cooling_manifolds": 2}'
),

(5, 2, 'DFW-PROD-01-R02', 'R02', 'Production compute rack 2',
 48, 600, 1000, 'C', 'HOT-C1', 'Production Floor 1', 2,
 10000, 5200, 'LIQUID', 'PROD-ZONE-1', 'ACTIVE',
 48, 32, 2, 14, 'HIGH_SECURITY',
 '{"environment": "production", "criticality": "high"}',
 '{"pdu_count": 4, "network_drops": 8, "cooling_manifolds": 2}'
),

(6, 2, 'DFW-PROD-01-R03', 'R03', 'Production database rack',
 48, 800, 1200, 'D', 'HOT-D1', 'Production Floor 1', 2,
 15000, 8000, 'HYBRID', 'PROD-ZONE-2', 'ACTIVE',
 48, 36, 0, 12, 'HIGH_SECURITY',
 '{"environment": "production", "criticality": "critical", "purpose": "database"}',
 '{"pdu_count": 6, "network_drops": 12}'
),

-- NYC DR Racks
(7, 3, 'NYC-DR-01-R01', 'R01', 'DR failover rack 1',
 42, 600, 1000, 'E', 'HOT-E1', 'DR Room', 1,
 6000, 1200, 'AIR', 'DR-ZONE-1', 'ACTIVE',
 42, 12, 8, 22, 'RESTRICTED',
 '{"environment": "disaster_recovery"}',
 '{"pdu_count": 2, "network_drops": 4}'
),

(8, 3, 'NYC-DR-01-R02', 'R02', 'DR failover rack 2',
 42, 600, 1000, 'E', 'HOT-E1', 'DR Room', 1,
 6000, 800, 'AIR', 'DR-ZONE-1', 'ACTIVE',
 42, 8, 4, 30, 'RESTRICTED',
 '{"environment": "disaster_recovery"}',
 '{"pdu_count": 2, "network_drops": 4}'
);

-- ===================================================================
-- DATACENTER RACK POSITIONS
-- ===================================================================
-- Generate rack positions for each rack (sample positions)
-- In a real scenario, you would generate all U positions (1-42 or 1-48) for each rack

-- Rack 1 (SFO-LAB-01-R01) - Sample positions
INSERT IGNORE INTO datacenter_rack_positions (rack_id, u_position, u_height, status, reserved_for, device_type, notes) VALUES 
(1, 1, 1, 'OCCUPIED', NULL, 'SERVER', 'PDU mounted at bottom'),
(1, 2, 1, 'OCCUPIED', NULL, 'SERVER', NULL),
(1, 3, 2, 'OCCUPIED', NULL, 'SERVER', 'Dell R750 - 2U server'),
(1, 5, 1, 'AVAILABLE', NULL, NULL, NULL),
(1, 6, 1, 'AVAILABLE', NULL, NULL, NULL),
(1, 7, 1, 'AVAILABLE', NULL, NULL, NULL),
(1, 8, 1, 'AVAILABLE', NULL, NULL, NULL),
(1, 9, 1, 'AVAILABLE', NULL, NULL, NULL),
(1, 10, 1, 'OCCUPIED', NULL, 'SERVER', 'dev-web-01'),
(1, 11, 1, 'OCCUPIED', NULL, 'SERVER', 'dev-db-01'),
(1, 12, 1, 'OCCUPIED', NULL, 'SERVER', 'dev-storage-01'),
(1, 13, 1, 'RESERVED', 'Future expansion', NULL, 'Reserved for Q2 deployment'),
(1, 14, 1, 'RESERVED', 'Future expansion', NULL, 'Reserved for Q2 deployment'),
(1, 15, 1, 'RESERVED', 'Future expansion', NULL, 'Reserved for Q2 deployment'),
(1, 16, 1, 'AVAILABLE', NULL, NULL, NULL),
(1, 17, 1, 'AVAILABLE', NULL, NULL, NULL),
(1, 18, 1, 'AVAILABLE', NULL, NULL, NULL),
(1, 19, 1, 'AVAILABLE', NULL, NULL, NULL),
(1, 20, 1, 'AVAILABLE', NULL, NULL, NULL),
(1, 21, 1, 'OCCUPIED', NULL, 'SWITCH', 'TOR Switch'),
(1, 22, 1, 'OCCUPIED', NULL, 'SWITCH', 'Management Switch'),
(1, 40, 1, 'OCCUPIED', NULL, 'PDU', 'PDU A'),
(1, 41, 1, 'OCCUPIED', NULL, 'PDU', 'PDU B'),
(1, 42, 1, 'BLOCKED', NULL, NULL, 'Cable management');

-- Rack 2 (SFO-LAB-01-R02) - Sample positions
INSERT IGNORE INTO datacenter_rack_positions (rack_id, u_position, u_height, status, reserved_for, device_type, notes) VALUES 
(2, 1, 1, 'AVAILABLE', NULL, NULL, NULL),
(2, 2, 1, 'AVAILABLE', NULL, NULL, NULL),
(2, 3, 1, 'AVAILABLE', NULL, NULL, NULL),
(2, 4, 1, 'AVAILABLE', NULL, NULL, NULL),
(2, 5, 1, 'OCCUPIED', NULL, 'SERVER', 'maint-util-01'),
(2, 6, 1, 'AVAILABLE', NULL, NULL, NULL),
(2, 7, 1, 'AVAILABLE', NULL, NULL, NULL),
(2, 8, 1, 'OCCUPIED', NULL, 'SERVER', 'new-srv-01'),
(2, 9, 1, 'AVAILABLE', NULL, NULL, NULL),
(2, 10, 1, 'AVAILABLE', NULL, NULL, NULL),
(2, 40, 1, 'OCCUPIED', NULL, 'PDU', 'PDU A'),
(2, 41, 1, 'OCCUPIED', NULL, 'PDU', 'PDU B'),
(2, 42, 1, 'BLOCKED', NULL, NULL, 'Cable management');

-- Rack 5 (DFW-PROD-01-R02) - Sample positions (Production)
INSERT IGNORE INTO datacenter_rack_positions (rack_id, u_position, u_height, status, reserved_for, device_type, notes) VALUES 
(5, 1, 1, 'OCCUPIED', NULL, 'UPS', 'Rack UPS'),
(5, 2, 1, 'OCCUPIED', NULL, 'PDU', 'Managed PDU'),
(5, 3, 1, 'AVAILABLE', NULL, NULL, NULL),
(5, 4, 1, 'AVAILABLE', NULL, NULL, NULL),
(5, 5, 1, 'AVAILABLE', NULL, NULL, NULL),
(5, 10, 1, 'AVAILABLE', NULL, NULL, NULL),
(5, 15, 1, 'AVAILABLE', NULL, NULL, NULL),
(5, 20, 1, 'OCCUPIED', NULL, 'SERVER', 'prod-web-01'),
(5, 21, 1, 'OCCUPIED', NULL, 'SERVER', 'prod-db-01'),
(5, 22, 1, 'AVAILABLE', NULL, NULL, NULL),
(5, 23, 1, 'AVAILABLE', NULL, NULL, NULL),
(5, 24, 1, 'AVAILABLE', NULL, NULL, NULL),
(5, 25, 1, 'AVAILABLE', NULL, NULL, NULL),
(5, 30, 1, 'AVAILABLE', NULL, NULL, NULL),
(5, 35, 1, 'AVAILABLE', NULL, NULL, NULL),
(5, 40, 1, 'OCCUPIED', NULL, 'SWITCH', 'Core Switch'),
(5, 41, 1, 'OCCUPIED', NULL, 'SWITCH', 'TOR Switch'),
(5, 45, 1, 'OCCUPIED', NULL, 'PDU', 'PDU A'),
(5, 46, 1, 'OCCUPIED', NULL, 'PDU', 'PDU B'),
(5, 47, 1, 'OCCUPIED', NULL, 'PDU', 'PDU C'),
(5, 48, 1, 'BLOCKED', NULL, NULL, 'Cable management');
