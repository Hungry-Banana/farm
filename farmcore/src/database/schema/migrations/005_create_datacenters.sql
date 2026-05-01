-- Create datacenter infrastructure tables
-- Description: Creates datacenter, rack, and rack position tables for physical infrastructure
--              management with capacity tracking and proper relationships.

-- ===================================================================
-- DATACENTER INFRASTRUCTURE TABLES
-- ===================================================================

-- Datacenters Table
-- Represents physical datacenter locations
CREATE TABLE IF NOT EXISTS datacenters (
    data_center_id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Basic Information
    data_center_name VARCHAR(255) NOT NULL UNIQUE,
    data_center_code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    
    -- Location Information
    address TEXT,
    city VARCHAR(100),
    state_province VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    region VARCHAR(100),
    
    -- Geographic Coordinates
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Provider Information
    provider VARCHAR(255),
    provider_facility_id VARCHAR(100),
    
    -- Facility Details
    tier_level ENUM('TIER_I', 'TIER_II', 'TIER_III', 'TIER_IV', 'UNKNOWN') DEFAULT 'UNKNOWN',
    total_floor_space_sqm DECIMAL(10, 2),
    power_capacity_kw DECIMAL(10, 2),
    cooling_capacity_kw DECIMAL(10, 2),
    
    -- Status and Management
    status ENUM('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'CONSTRUCTION', 'DECOMMISSIONED') NOT NULL DEFAULT 'ACTIVE',
    
    -- Capacity Tracking
    total_racks INT DEFAULT 0,
    occupied_racks INT DEFAULT 0,
    total_servers INT DEFAULT 0,
    
    -- Contact Information
    facility_manager VARCHAR(255),
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    emergency_contact VARCHAR(255),
    emergency_phone VARCHAR(50),
    
    -- Operational Details
    timezone VARCHAR(50),
    operating_hours VARCHAR(100),
    
    -- Metadata
    tags JSON,
    metadata JSON,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_data_center_name (data_center_name),
    INDEX idx_data_center_code (data_center_code),
    INDEX idx_status (status),
    INDEX idx_country (country),
    INDEX idx_region (region)
);

-- Racks Table
-- Represents physical racks within a datacenter
CREATE TABLE IF NOT EXISTS datacenter_racks (
    rack_id INT PRIMARY KEY AUTO_INCREMENT,
    data_center_id INT NOT NULL,
    
    -- Basic Information
    rack_name VARCHAR(255) NOT NULL,
    rack_code VARCHAR(50) NOT NULL,
    description TEXT,
    
    -- Physical Specifications
    rack_height_u INT NOT NULL DEFAULT 42,
    rack_width_mm INT DEFAULT 600,
    rack_depth_mm INT DEFAULT 1000,
    
    -- Location in Datacenter
    row_name VARCHAR(50),
    aisle_name VARCHAR(50),
    room_name VARCHAR(100),
    floor_level INT DEFAULT 1,
    
    -- Power and Cooling
    power_capacity_w INT,
    power_usage_w INT DEFAULT 0,
    cooling_type ENUM('AIR', 'LIQUID', 'HYBRID', 'NONE') DEFAULT 'AIR',
    
    -- Network
    network_zone VARCHAR(100),
    
    -- Status
    status ENUM('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'RESERVED', 'DECOMMISSIONED') NOT NULL DEFAULT 'ACTIVE',
    
    -- Capacity Tracking
    total_u_available INT,
    occupied_u INT DEFAULT 0,
    reserved_u INT DEFAULT 0,
    free_u INT,
    
    -- Access Control
    access_level ENUM('PUBLIC', 'RESTRICTED', 'HIGH_SECURITY') DEFAULT 'RESTRICTED',
    
    -- Metadata
    tags JSON,
    metadata JSON,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (data_center_id) REFERENCES datacenters(data_center_id) ON DELETE CASCADE,
    
    UNIQUE KEY uk_rack (data_center_id, rack_code),
    INDEX idx_rack_name (rack_name),
    INDEX idx_data_center_id (data_center_id),
    INDEX idx_status (status),
    INDEX idx_row_aisle (row_name, aisle_name)
);

-- Rack Positions Table
-- Represents specific U positions within a rack
CREATE TABLE IF NOT EXISTS datacenter_rack_positions (
    rack_position_id INT PRIMARY KEY AUTO_INCREMENT,
    rack_id INT NOT NULL,
    
    -- Position Information
    u_position INT NOT NULL,
    
    -- Status
    status ENUM('AVAILABLE', 'OCCUPIED', 'RESERVED', 'BLOCKED') NOT NULL DEFAULT 'AVAILABLE',
    
    -- Reservation Details
    reserved_for VARCHAR(255),
    reservation_notes TEXT,
    
    -- Current Occupancy
    server_id INT,
    device_type ENUM('SERVER', 'SWITCH', 'STORAGE', 'PDU', 'UPS', 'OTHER'),
    
    -- Metadata
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (rack_id) REFERENCES datacenter_racks(rack_id) ON DELETE CASCADE,
    
    UNIQUE KEY uk_rack_position (rack_id, u_position),
    INDEX idx_rack_id (rack_id),
    INDEX idx_status (status),
    INDEX idx_server_id (server_id)
);
