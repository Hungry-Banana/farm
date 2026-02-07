-- Create network switch inventory tables and switching infrastructure schema
-- Description: Creates the complete network switch management schema including switch types,
--              switch inventory, port management, VLAN configuration, and network topology tracking.

-- ===================================================================
-- SWITCH COMPONENT REFERENCE TABLES (Must be created first for foreign keys)
-- ===================================================================

-- ===================================================================
-- CORE SWITCHES TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS switches (
    switch_id INT PRIMARY KEY AUTO_INCREMENT,

    -- Switch Information
    switch_name VARCHAR(255) NOT NULL UNIQUE,
    component_switch_id INT,
    serial_number VARCHAR(255),
    asset_tag VARCHAR(255),
    
    -- Firmware/OS Information
    os_type VARCHAR(100),
    os_version VARCHAR(255),
    bootrom_version VARCHAR(255),
    
    -- Management Interface
    mgmt_ip_address VARCHAR(45),
    mgmt_mac_address VARCHAR(17),
    mgmt_vlan_id INT,
    
    -- Physical Information  
    uptime_seconds BIGINT,
    temperature_celsius INT,
    fan_status VARCHAR(50),
    power_consumption_watts INT,
    
    -- Management Fields
    switch_role ENUM('ACCESS', 'DISTRIBUTION', 'CORE', 'EDGE', 'MANAGEMENT', 'OOB') DEFAULT 'ACCESS',
    status ENUM('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'NEW', 'RMA', 'DECOMMISSIONED') DEFAULT 'NEW',
    environment_type ENUM('PRODUCTION', 'DEVELOPMENT', 'QA', 'STAGING', 'TESTING') DEFAULT 'PRODUCTION',
    
    -- Location Fields
    cluster_id INT DEFAULT 0,
    sub_cluster_id INT DEFAULT 0,
    data_center_id INT DEFAULT 0,
    rack_id INT DEFAULT 0,
    rack_position_id INT DEFAULT 0,
    
    -- Inventory Tracking
    last_poll_at TIMESTAMP NULL,
    poll_interval_seconds INT DEFAULT 300,
    
    -- Authentication Configuration
    auth_method ENUM('LOCAL', 'RADIUS', 'TACACS', 'LDAP', 'CERTIFICATE') DEFAULT 'LOCAL',
    auth_server_ip VARCHAR(45),
    auth_server_port INT,
    auth_shared_secret VARCHAR(255),
    
    -- SNMP Configuration (typically uses dedicated credentials for performance/reliability)
    snmp_community VARCHAR(255),
    snmp_version ENUM('v1', 'v2c', 'v3') DEFAULT 'v2c',
    snmp_auth_protocol ENUM('MD5', 'SHA', 'SHA224', 'SHA256', 'SHA384', 'SHA512'),
    snmp_priv_protocol ENUM('DES', 'AES128', 'AES192', 'AES256'),
    
    -- Service Account (for automation that can't use interactive auth)
    service_username VARCHAR(255),
    service_password TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_switch_component
        FOREIGN KEY (component_switch_id) REFERENCES component_switch_types(component_switch_id)
        ON DELETE SET NULL,

    INDEX idx_switch_name (switch_name),
    INDEX idx_serial_number (serial_number),
    INDEX idx_mgmt_ip (mgmt_ip_address),
    INDEX idx_status (status),
    INDEX idx_switch_role (switch_role),
    INDEX idx_component_switch (component_switch_id)
);

-- ===================================================================
-- SWITCH PORTS
-- ===================================================================
CREATE TABLE IF NOT EXISTS switch_ports (
    switch_port_id INT PRIMARY KEY AUTO_INCREMENT,
    switch_id INT NOT NULL,
    
    -- Port Identification
    name VARCHAR(64) NOT NULL,           -- e.g. 'Gi1/0/1', 'Ethernet1/1'
    port_index INT,                      -- SNMP ifIndex
    port_type ENUM('ETHERNET', 'SFP', 'SFP+', 'QSFP', 'QSFP+', 'QSFP28', 'MANAGEMENT') DEFAULT 'ETHERNET',
    
    -- Port Configuration
    admin_status ENUM('UP', 'DOWN', 'TESTING') DEFAULT 'DOWN',
    oper_status ENUM('UP', 'DOWN', 'TESTING', 'UNKNOWN', 'DORMANT', 'NOTPRESENT', 'LOWERLAYERDOWN') DEFAULT 'DOWN',
    speed_mbps BIGINT,
    duplex ENUM('FULL', 'HALF', 'AUTO', 'UNKNOWN') DEFAULT 'AUTO',
    mtu INT DEFAULT 1500,
    
    -- VLAN Configuration
    access_vlan_id INT,
    native_vlan_id INT,
    port_mode ENUM('ACCESS', 'TRUNK', 'HYBRID') DEFAULT 'ACCESS',
    
    -- Connected Device Information
    connected_device_name VARCHAR(255),
    connected_device_ip VARCHAR(45),
    connected_device_mac VARCHAR(17),
    connected_device_type ENUM('SERVER', 'SWITCH', 'ROUTER', 'OTHER'),
    
    -- Port Statistics (can be updated frequently)
    bytes_in BIGINT DEFAULT 0,
    bytes_out BIGINT DEFAULT 0,
    packets_in BIGINT DEFAULT 0,
    packets_out BIGINT DEFAULT 0,
    errors_in BIGINT DEFAULT 0,
    errors_out BIGINT DEFAULT 0,
    
    -- Physical/Optical Information
    sfp_vendor VARCHAR(255),
    sfp_part_number VARCHAR(255),
    sfp_serial_number VARCHAR(255),
    optical_power_dbm DECIMAL(5,2),
    optical_temperature_c INT,
    
    description VARCHAR(255),
    last_flap_time TIMESTAMP NULL,
    stats_last_updated TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_port_switch
        FOREIGN KEY (switch_id) REFERENCES switches(switch_id)
        ON DELETE CASCADE,
        
    UNIQUE KEY uk_switch_port_name (switch_id, name),
    UNIQUE KEY uk_switch_port_index (switch_id, port_index),
    
    INDEX idx_port_status (admin_status, oper_status),
    INDEX idx_connected_device (connected_device_name, connected_device_type),
    INDEX idx_vlan (access_vlan_id, native_vlan_id),
    INDEX idx_port_type (port_type),
    INDEX idx_speed (speed_mbps)
);

-- ===================================================================
-- SWITCH PORT VLANS (for trunk ports with multiple VLANs)
-- ===================================================================
CREATE TABLE IF NOT EXISTS switch_port_vlans (
    port_vlan_id INT PRIMARY KEY AUTO_INCREMENT,
    switch_port_id INT NOT NULL,
    vlan_id INT NOT NULL,
    vlan_name VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_port_vlan_port
        FOREIGN KEY (switch_port_id) REFERENCES switch_ports(switch_port_id)
        ON DELETE CASCADE,
        
    UNIQUE KEY uk_port_vlan (switch_port_id, vlan_id),
    INDEX idx_vlan_id (vlan_id)
);

-- ===================================================================
-- SWITCH VLANS (Global VLAN database per switch)
-- ===================================================================
CREATE TABLE IF NOT EXISTS switch_vlans (
    vlan_db_id INT PRIMARY KEY AUTO_INCREMENT,
    switch_id INT NOT NULL,
    vlan_id INT NOT NULL,
    vlan_name VARCHAR(255),
    vlan_status ENUM('ACTIVE', 'SUSPEND') DEFAULT 'ACTIVE',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_vlan_switch
        FOREIGN KEY (switch_id) REFERENCES switches(switch_id)
        ON DELETE CASCADE,
        
    UNIQUE KEY uk_switch_vlan (switch_id, vlan_id),
    INDEX idx_vlan_name (vlan_name),
    INDEX idx_vlan_status (vlan_status)
);

-- ===================================================================
-- SWITCH MAC ADDRESS TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS switch_mac_table (
    mac_entry_id INT PRIMARY KEY AUTO_INCREMENT,
    switch_id INT NOT NULL,
    mac_address VARCHAR(17) NOT NULL,
    vlan_id INT NOT NULL,
    port_name VARCHAR(64),
    entry_type ENUM('DYNAMIC', 'STATIC', 'SECURE') DEFAULT 'DYNAMIC',
    
    -- Aging information
    learned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_mac_switch
        FOREIGN KEY (switch_id) REFERENCES switches(switch_id)
        ON DELETE CASCADE,
        
    INDEX idx_mac_address (mac_address),
    INDEX idx_switch_vlan_port (switch_id, vlan_id, port_name),
    INDEX idx_last_seen (last_seen_at)
);

-- ===================================================================
-- SWITCH CREDENTIALS (Simplified for essential cases only)
-- ===================================================================
CREATE TABLE IF NOT EXISTS switch_credentials (
    credential_id INT PRIMARY KEY AUTO_INCREMENT,
    switch_id INT NOT NULL,
    
    -- Only essential credential types for automation/emergency access
    credential_type ENUM('SNMP_V3', 'LOCAL_ADMIN') NOT NULL,
    username VARCHAR(255) NOT NULL,
    password TEXT NOT NULL,
    
    -- Purpose/notes for this credential
    purpose VARCHAR(255), -- e.g., 'monitoring', 'emergency access', 'automation'
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_credential_switch
        FOREIGN KEY (switch_id) REFERENCES switches(switch_id)
        ON DELETE CASCADE,
        
    UNIQUE KEY uk_switch_credential_type (switch_id, credential_type, username)
);

-- ===================================================================
-- SWITCH INVENTORY SNAPSHOTS FOR HISTORICAL TRACKING
-- ===================================================================
CREATE TABLE IF NOT EXISTS switch_inventory_snapshots (
    snapshot_id INT PRIMARY KEY AUTO_INCREMENT,
    switch_id INT NOT NULL,
    
    config_data JSON NOT NULL,
    port_data JSON NOT NULL,
    vlan_data JSON NOT NULL,
    mac_table_data JSON NOT NULL,
    checksum VARCHAR(64) NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_switch_snapshot
        FOREIGN KEY (switch_id) REFERENCES switches(switch_id)
        ON DELETE CASCADE,
        
    INDEX idx_switch_created (switch_id, created_at),
    INDEX idx_checksum (checksum)
);