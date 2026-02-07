-- Create initial server inventory tables and component reference tables
-- Description: Creates the core server inventory schema including component reference tables,
--              server tables, and all related inventory tracking tables.

-- ===================================================================
-- COMPONENT REFERENCE TABLES (Must be created first for foreign keys)
-- ===================================================================

-- CPU Component Types
CREATE TABLE IF NOT EXISTS component_cpu_types (
    component_cpu_id INT PRIMARY KEY AUTO_INCREMENT,
    
    manufacturer VARCHAR(255) NOT NULL,
    model_name VARCHAR(255) NOT NULL,
    num_cores INT,
    num_threads INT,
    capacity_mhz INT,
    
    -- Cache Information
    l1_cache_kb INT,
    l2_cache_kb INT,
    l3_cache_kb INT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_cpu_model (manufacturer, model_name, num_cores, num_threads, capacity_mhz),
    INDEX idx_manufacturer_model (manufacturer, model_name)
);

-- Memory/DIMM Component Types  
CREATE TABLE IF NOT EXISTS component_memory_types (
    component_memory_id INT PRIMARY KEY AUTO_INCREMENT,
    
    manufacturer VARCHAR(255) NOT NULL,
    part_number VARCHAR(255) NOT NULL,
    size_bytes BIGINT NOT NULL,
    mem_type VARCHAR(50) NOT NULL,
    speed_mt_s INT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_memory_part (manufacturer, part_number),
    INDEX idx_memory_specs (mem_type, size_bytes, speed_mt_s)
);

-- Motherboard Component Types
CREATE TABLE IF NOT EXISTS component_motherboard_types (
    component_motherboard_id INT PRIMARY KEY AUTO_INCREMENT,
    
    manufacturer VARCHAR(255) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    version VARCHAR(255),
    bios_version VARCHAR(255),  -- Latest/recommended BIOS version for this motherboard model
    bmc_firmware_version VARCHAR(255),  -- Latest/recommended BMC firmware version for this motherboard model
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_motherboard_model (manufacturer, product_name, version),
    INDEX idx_manufacturer_product (manufacturer, product_name),
    INDEX idx_bios_version (bios_version),
    INDEX idx_bmc_firmware (bmc_firmware_version)
);

-- Disk Component Types
CREATE TABLE IF NOT EXISTS component_disk_types (
    component_disk_id INT PRIMARY KEY AUTO_INCREMENT,
    
    manufacturer VARCHAR(255),
    model VARCHAR(255) NOT NULL,
    size_bytes BIGINT,
    rotational BOOLEAN DEFAULT FALSE,
    bus_type VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_disk_model (manufacturer, model, size_bytes),
    INDEX idx_disk_specs (bus_type, size_bytes, rotational)
);

-- Network Interface Component Types
CREATE TABLE IF NOT EXISTS component_network_types (
    component_network_id INT PRIMARY KEY AUTO_INCREMENT,
    
    vendor_name VARCHAR(255),
    device_name VARCHAR(255) NOT NULL,
    driver VARCHAR(128),
    max_speed_mbps INT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_network_device (vendor_name, device_name, driver),
    INDEX idx_vendor_device (vendor_name, device_name)
);

-- Insert default BMC component type for BMC interfaces
INSERT IGNORE INTO component_network_types (vendor_name, device_name, driver, max_speed_mbps)
VALUES ('BMC', 'Baseboard Management Controller', 'bmc', 100);

-- GPU Component Types
CREATE TABLE IF NOT EXISTS component_gpu_types (
    component_gpu_id INT PRIMARY KEY AUTO_INCREMENT,
    
    vendor VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    vram_mb INT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_gpu_model (vendor, model, vram_mb),
    INDEX idx_vendor_model (vendor, model)
);

-- ===================================================================
-- CORE SERVERS TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS servers (
    server_id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Node Information
    server_name VARCHAR(255) NOT NULL UNIQUE,
    architecture VARCHAR(50) DEFAULT 'x86_64',
    product_name VARCHAR(255),
    manufacturer VARCHAR(255),
    serial_number VARCHAR(255),
    
    -- Chassis Information
    chassis_manufacturer VARCHAR(255),
    chassis_serial_number VARCHAR(255),
    
    -- Motherboard Information
    component_motherboard_id INT,
    motherboard_serial_number VARCHAR(255),
    
    -- BIOS Information
    bios_vendor VARCHAR(255),
    bios_version VARCHAR(255),
    bios_release_date DATE,
    
    -- Management Fields
    server_type ENUM('BAREMETAL', 'HOST', 'STORAGE', 'COMPUTE') DEFAULT 'BAREMETAL',
    status ENUM('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'RMA', 'DECOMMISSIONED') NOT NULL DEFAULT 'INACTIVE',
    state ENUM('NEW', 'ONBOARDING', 'PROVISIONING', 'RUNNING', 'SUSPENDED', 'DEPROVISIONING', 'FAILED') NOT NULL DEFAULT 'NEW',
    stage ENUM('NONE', 'DISCOVERY', 'ALLOCATE_RESOURCES', 'INSTALL_OS', 'CONFIGURE_NETWORK', 'WIPE_DISKS', 'WIPE_NIC_CONFIG', 'RELEASE_IPS', 'FINALIZE') NOT NULL DEFAULT 'NONE',
    environment_type ENUM('PRODUCTION', 'DEVELOPMENT', 'QA', 'STAGING', 'TESTING') DEFAULT 'PRODUCTION',
    
    -- Location Fields
    cluster_id INT DEFAULT 0,
    sub_cluster_id INT DEFAULT 0,
    data_center_id INT DEFAULT 0,
    rack_id INT DEFAULT 0,
    rack_position_id INT DEFAULT 0,
    
    -- Inventory Tracking
    last_inventory_at TIMESTAMP NULL,
    agent_version VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_server_motherboard
        FOREIGN KEY (component_motherboard_id) REFERENCES component_motherboard_types(component_motherboard_id)
        ON DELETE SET NULL,
    
    INDEX idx_server_name (server_name),
    INDEX idx_serial_number (serial_number),
    INDEX idx_status (status),
    INDEX idx_last_inventory (last_inventory_at),
    INDEX idx_component_motherboard (component_motherboard_id)
);

-- ===================================================================
-- CPU INFORMATION (References component_cpu_types)
-- ===================================================================
CREATE TABLE IF NOT EXISTS server_cpus (
    cpu_id INT PRIMARY KEY AUTO_INCREMENT,
    server_id INT NOT NULL,
    component_cpu_id INT NOT NULL,
    
    socket_number INT NOT NULL,
    slot VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_cpu_server
        FOREIGN KEY (server_id) REFERENCES servers(server_id)
        ON DELETE CASCADE,
        
    CONSTRAINT fk_cpu_component
        FOREIGN KEY (component_cpu_id) REFERENCES component_cpu_types(component_cpu_id)
        ON DELETE RESTRICT,
        
    UNIQUE KEY uk_server_socket (server_id, socket_number),
    INDEX idx_component_cpu (component_cpu_id)
);

-- ===================================================================
-- MEMORY/DIMM INFORMATION (References component_memory_types)
-- ===================================================================
CREATE TABLE IF NOT EXISTS server_memory_dimms (
    dimm_id INT PRIMARY KEY AUTO_INCREMENT,
    server_id INT NOT NULL,
    component_memory_id INT NOT NULL,
    
    slot VARCHAR(255) NOT NULL,
    serial_number VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_dimm_server
        FOREIGN KEY (server_id) REFERENCES servers(server_id)
        ON DELETE CASCADE,
        
    CONSTRAINT fk_dimm_component
        FOREIGN KEY (component_memory_id) REFERENCES component_memory_types(component_memory_id)
        ON DELETE RESTRICT,
        
    UNIQUE KEY uk_server_dimm_slot (server_id, slot),
    INDEX idx_component_memory (component_memory_id),
    INDEX idx_serial_number (serial_number)
);

-- ===================================================================
-- DISK/STORAGE INFORMATION (References component_disk_types)
-- ===================================================================
CREATE TABLE IF NOT EXISTS server_disks (
    disk_id INT PRIMARY KEY AUTO_INCREMENT,
    server_id INT NOT NULL,
    component_disk_id INT NOT NULL,
    
    name VARCHAR(100) NOT NULL,
    dev_path VARCHAR(255),
    serial VARCHAR(255),
    firmware_version VARCHAR(255),
    
    -- SMART Information
    smart_health VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_disk_server
        FOREIGN KEY (server_id) REFERENCES servers(server_id)
        ON DELETE CASCADE,
        
    CONSTRAINT fk_disk_component
        FOREIGN KEY (component_disk_id) REFERENCES component_disk_types(component_disk_id)
        ON DELETE RESTRICT,
        
    UNIQUE KEY uk_server_disk_name (server_id, name),
    INDEX idx_component_disk (component_disk_id),
    INDEX idx_serial (serial),
    INDEX idx_smart_health (smart_health)
);

-- ===================================================================
-- NETWORK INTERFACES (References component_network_types)
-- ===================================================================
CREATE TABLE IF NOT EXISTS server_network_interfaces (
    interface_id INT PRIMARY KEY AUTO_INCREMENT,
    server_id INT NOT NULL,
    component_network_id INT NOT NULL,
    
    name VARCHAR(64) NOT NULL,
    mac_address VARCHAR(17),
    ip_address VARCHAR(45), -- Primary IP address for this interface
    mtu INT,
    speed_mbps INT,
    firmware_version VARCHAR(255),
    pci_address VARCHAR(64),
    
    -- Primary interface flag for SSH/main access
    is_primary BOOLEAN DEFAULT FALSE,
    -- Interface type (REGULAR, MANAGEMENT)
    interface_type ENUM('REGULAR', 'MANAGEMENT') DEFAULT 'REGULAR',
    -- Bond/team group identifier for grouped interfaces
    bond_group VARCHAR(64),
    -- Master interface for bonded/teamed setups
    bond_master VARCHAR(64),
    
    -- Switch port connection
    switch_port_id INT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_interface_server
        FOREIGN KEY (server_id) REFERENCES servers(server_id)
        ON DELETE CASCADE,
        
    CONSTRAINT fk_interface_component
        FOREIGN KEY (component_network_id) REFERENCES component_network_types(component_network_id)
        ON DELETE RESTRICT,
        
    -- Note: switch_port_id will reference m002_create_switches.switch_ports(switch_port_id)
    -- Foreign key constraint added after switch tables exist
        
    UNIQUE KEY uk_server_interface_name (server_id, name),
    INDEX idx_component_network (component_network_id),
    INDEX idx_mac_address (mac_address),
    INDEX idx_pci_address (pci_address),
    INDEX idx_is_primary (is_primary),
    INDEX idx_interface_type (interface_type),
    INDEX idx_bond_group (bond_group),
    INDEX idx_bond_master (bond_master),
    INDEX idx_switch_port (switch_port_id)
);

-- ===================================================================
-- BMC INTERFACES (Dedicated table for Baseboard Management Controllers)
-- ===================================================================
CREATE TABLE IF NOT EXISTS server_bmc_interfaces (
    bmc_interface_id INT PRIMARY KEY AUTO_INCREMENT,
    server_id INT NOT NULL DEFAULT 0, -- 0 = unassigned/pre-onboarding BMC
    component_network_id INT NOT NULL,
    
    name VARCHAR(64) NOT NULL DEFAULT 'bmc0',
    mac_address VARCHAR(17),
    ip_address VARCHAR(45), -- BMC IP address
    
    -- BMC Authentication
    username VARCHAR(255),
    password TEXT,
    
    -- BMC-specific information
    firmware_version VARCHAR(255),
    release_date DATE,
    
    -- BMC capabilities
    supports_ipmi BOOLEAN DEFAULT TRUE,
    supports_redfish BOOLEAN DEFAULT FALSE,
    supports_web_interface BOOLEAN DEFAULT TRUE,
    
    -- Connection status
    is_accessible BOOLEAN DEFAULT FALSE,
    last_ping_at TIMESTAMP NULL,
    
    -- Switch port connection (if BMC is connected to a managed switch)
    switch_port_id INT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Note: Foreign key constraint will be added after servers table creation
    -- to allow server_id = 0 for unassigned BMCs
        
    CONSTRAINT fk_bmc_component
        FOREIGN KEY (component_network_id) REFERENCES component_network_types(component_network_id)
        ON DELETE RESTRICT,
        
    -- Note: switch_port_id will reference m002_create_switches.switch_ports(switch_port_id)
    -- Foreign key constraint added after switch tables exist
        
    UNIQUE KEY uk_server_bmc_name (server_id, name),
    INDEX idx_bmc_component_network (component_network_id),
    INDEX idx_bmc_mac_address (mac_address),
    INDEX idx_bmc_ip_address (ip_address),
    INDEX idx_bmc_accessible (is_accessible),
    INDEX idx_bmc_switch_port (switch_port_id)
);

-- Insert a placeholder server record for unassigned BMCs
INSERT IGNORE INTO servers (server_id, server_name, status, state)
VALUES (0, 'UNASSIGNED_BMC_PLACEHOLDER', 'INACTIVE', 'NEW');

-- Add foreign key constraint after placeholder server exists
ALTER TABLE server_bmc_interfaces
ADD CONSTRAINT fk_bmc_server
    FOREIGN KEY (server_id) REFERENCES servers(server_id)
    ON DELETE CASCADE;

-- ===================================================================
-- NETWORK INTERFACE IP ADDRESSES
-- ===================================================================
CREATE TABLE IF NOT EXISTS server_network_addresses (
    address_id INT PRIMARY KEY AUTO_INCREMENT,
    interface_id INT NOT NULL,
    
    family ENUM('inet', 'inet6') NOT NULL,
    address VARCHAR(128) NOT NULL,
    prefix_length INT NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_address_interface
        FOREIGN KEY (interface_id) REFERENCES server_network_interfaces(interface_id)
        ON DELETE CASCADE,
        
    INDEX idx_address (address)
);

-- ===================================================================
-- NETWORK ROUTES
-- ===================================================================
CREATE TABLE IF NOT EXISTS server_network_routes (
    route_id INT PRIMARY KEY AUTO_INCREMENT,
    server_id INT NOT NULL,
    
    destination VARCHAR(128) NOT NULL,
    gateway VARCHAR(128),
    interface_name VARCHAR(64) NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_route_server
        FOREIGN KEY (server_id) REFERENCES servers(server_id)
        ON DELETE CASCADE
);

-- ===================================================================
-- GPU INFORMATION (References component_gpu_types)
-- ===================================================================
CREATE TABLE IF NOT EXISTS server_gpus (
    gpu_id INT PRIMARY KEY AUTO_INCREMENT,
    server_id INT NOT NULL,
    component_gpu_id INT NOT NULL,
    
    pci_address VARCHAR(64),
    driver_version VARCHAR(255),
    uuid VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_gpu_server
        FOREIGN KEY (server_id) REFERENCES servers(server_id)
        ON DELETE CASCADE,
        
    CONSTRAINT fk_gpu_component
        FOREIGN KEY (component_gpu_id) REFERENCES component_gpu_types(component_gpu_id)
        ON DELETE RESTRICT,
        
    INDEX idx_component_gpu (component_gpu_id),
    INDEX idx_uuid (uuid),
    INDEX idx_pci_address (pci_address)
);

-- ===================================================================
-- POWER SUPPLY INFORMATION
-- ===================================================================
CREATE TABLE IF NOT EXISTS server_power_supplies (
    psu_id INT PRIMARY KEY AUTO_INCREMENT,
    server_id INT NOT NULL,
    
    name VARCHAR(255),
    manufacturer VARCHAR(255),
    model VARCHAR(255),
    serial_number VARCHAR(255),
    part_number VARCHAR(255),
    max_power_watts INT,
    efficiency_rating VARCHAR(50),
    status VARCHAR(50),
    input_voltage DECIMAL(6,2),
    input_current DECIMAL(6,2),
    output_voltage DECIMAL(6,2),
    output_current DECIMAL(6,2),
    temperature_c INT,
    fan_speed_rpm INT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_psu_server
        FOREIGN KEY (server_id) REFERENCES servers(server_id)
        ON DELETE CASCADE
);

-- ===================================================================
-- INVENTORY SNAPSHOTS FOR HISTORICAL TRACKING
-- ===================================================================
CREATE TABLE IF NOT EXISTS server_inventory_snapshots (
    snapshot_id INT PRIMARY KEY AUTO_INCREMENT,
    server_id INT NOT NULL,
    
    agent_version VARCHAR(50),
    inventory_data JSON NOT NULL,
    checksum VARCHAR(64) NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_snapshot_server
        FOREIGN KEY (server_id) REFERENCES servers(server_id)
        ON DELETE CASCADE,
        
    INDEX idx_server_created (server_id, created_at),
    INDEX idx_checksum (checksum)
);

-- ===================================================================
-- INVENTORY CHANGES FOR TRACKING DIFFERENCES
-- ===================================================================
CREATE TABLE IF NOT EXISTS server_inventory_changes (
    change_id INT PRIMARY KEY AUTO_INCREMENT,
    server_id INT NOT NULL,
    
    component_type ENUM('cpu', 'memory', 'disk', 'network', 'gpu', 'power', 'bios', 'bmc', 'chassis') NOT NULL,
    component_identifier VARCHAR(255) NOT NULL, -- slot, name, pci_address, etc.
    change_type ENUM('added', 'removed', 'modified') NOT NULL,
    
    old_data JSON,
    new_data JSON,
    
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_change_server
        FOREIGN KEY (server_id) REFERENCES servers(server_id)
        ON DELETE CASCADE,
        
    INDEX idx_server_component (server_id, component_type),
    INDEX idx_change_type (change_type),
    INDEX idx_detected_at (detected_at)
);

-- ===================================================================
-- MISSING COMPONENTS FOR EASY REPORTING
-- ===================================================================
CREATE TABLE IF NOT EXISTS server_missing_components (
    missing_id INT PRIMARY KEY AUTO_INCREMENT,
    server_id INT NOT NULL,
    
    component_type ENUM('cpu', 'memory', 'disk', 'network', 'gpu', 'power') NOT NULL,
    component_identifier VARCHAR(255) NOT NULL,
    last_seen_data JSON NOT NULL,
    
    missing_since TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    
    CONSTRAINT fk_missing_server
        FOREIGN KEY (server_id) REFERENCES servers(server_id)
        ON DELETE CASCADE,
        
    INDEX idx_server_missing (server_id, component_type),
    INDEX idx_missing_since (missing_since),
    INDEX idx_unresolved (resolved_at) -- For finding currently missing components
);

-- ===================================================================
-- SERVER CREDENTIALS
-- ===================================================================
CREATE TABLE IF NOT EXISTS server_credentials (
    credential_id INT PRIMARY KEY AUTO_INCREMENT,
    server_id INT NOT NULL,
    
    credential_type ENUM('OS') NOT NULL DEFAULT 'OS',
    username VARCHAR(255) NOT NULL,
    password TEXT NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_credential_server
        FOREIGN KEY (server_id) REFERENCES servers(server_id)
        ON DELETE CASCADE,
        
    UNIQUE KEY uk_server_credential_type (server_id, credential_type, username)
);