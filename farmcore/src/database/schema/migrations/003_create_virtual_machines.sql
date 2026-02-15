-- Create virtual machine management tables
-- Description: Creates VM management schema including virtual machines, their resources,
--              network interfaces, disks, and snapshots, all linked to host servers.

-- ===================================================================
-- VIRTUAL MACHINES TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS virtual_machines (
    vm_id INT PRIMARY KEY AUTO_INCREMENT,
    server_id INT NOT NULL, -- Host server where VM is running
    
    -- VM Identity
    vm_name VARCHAR(255) NOT NULL,
    vm_uuid VARCHAR(36) UNIQUE,
    description TEXT,
    
    -- VM Configuration
    hypervisor_type ENUM('KVM', 'VMware', 'VirtualBox', 'Hyper-V', 'Xen', 'QEMU') NOT NULL DEFAULT 'KVM',
    guest_os_family VARCHAR(100), -- linux, windows, freebsd, etc.
    guest_os_version VARCHAR(100), -- Ubuntu 22.04, Windows Server 2022, etc.
    guest_os_architecture VARCHAR(20) DEFAULT 'x86_64',
    
    -- Resource Allocation
    vcpu_count INT NOT NULL DEFAULT 1,
    memory_mb INT NOT NULL DEFAULT 1024,
    storage_gb INT DEFAULT 0, -- Total storage allocation
    
    -- VM State
    vm_state ENUM('running', 'stopped', 'paused', 'suspended', 'crashed', 'unknown') NOT NULL DEFAULT 'stopped',
    vm_status ENUM('active', 'inactive', 'maintenance', 'migrating', 'backup', 'error') NOT NULL DEFAULT 'inactive',
    
    -- Hypervisor Configuration
    config_file_path VARCHAR(512), -- Path to VM config file (libvirt XML, VMX, etc.)
    boot_order VARCHAR(100) DEFAULT 'hd,cdrom,network', -- Boot device priority
    
    -- VM Features
    enable_vnc BOOLEAN DEFAULT TRUE,
    vnc_port INT,
    enable_spice BOOLEAN DEFAULT FALSE,
    spice_port INT,
    enable_ssh BOOLEAN DEFAULT TRUE,
    ssh_port INT DEFAULT 22,
    
    -- Performance Settings
    cpu_limit_percent INT DEFAULT 100, -- CPU usage limit
    memory_balloon BOOLEAN DEFAULT TRUE, -- Memory ballooning enabled
    io_priority ENUM('low', 'normal', 'high') DEFAULT 'normal',
    
    -- Backup Settings
    auto_backup_enabled BOOLEAN DEFAULT FALSE,
    backup_retention_days INT DEFAULT 7,
    last_backup_at TIMESTAMP NULL,
    
    -- VM Lifecycle
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    started_at TIMESTAMP NULL,
    stopped_at TIMESTAMP NULL,
    
    -- VM Management
    created_by VARCHAR(100), -- User who created the VM
    managed_by VARCHAR(100), -- Current VM administrator
    
    CONSTRAINT fk_vm_server
        FOREIGN KEY (server_id) REFERENCES servers(server_id)
        ON DELETE CASCADE,
    
    UNIQUE KEY uk_server_vm_name (server_id, vm_name),
    INDEX idx_vm_name (vm_name),
    INDEX idx_vm_uuid (vm_uuid),
    INDEX idx_vm_state (vm_state),
    INDEX idx_vm_status (vm_status),
    INDEX idx_hypervisor_type (hypervisor_type),
    INDEX idx_guest_os (guest_os_family, guest_os_version),
    INDEX idx_created_by (created_by),
    INDEX idx_managed_by (managed_by)
);

-- ===================================================================
-- VM VIRTUAL DISKS
-- ===================================================================
CREATE TABLE IF NOT EXISTS vm_disks (
    vm_disk_id INT PRIMARY KEY AUTO_INCREMENT,
    vm_id INT NOT NULL,
    
    -- Disk Identity
    disk_name VARCHAR(255) NOT NULL, -- vda, sda, disk0, etc.
    disk_uuid VARCHAR(36),
    description TEXT,
    
    -- Disk Configuration
    disk_type ENUM('ide', 'scsi', 'virtio', 'sata', 'nvme') DEFAULT 'virtio',
    disk_format ENUM('raw', 'qcow2', 'vmdk', 'vhd', 'vhdx', 'vdi') DEFAULT 'qcow2',
    disk_size_gb INT NOT NULL,
    disk_path VARCHAR(512) NOT NULL, -- Path to disk file on host
    
    -- Storage Backend
    storage_pool VARCHAR(255), -- Storage pool name (libvirt, etc.)
    storage_type ENUM('file', 'block', 'lvm', 'iscsi', 'ceph', 'rbd', 'nfs', 'zfs', 'glusterfs') DEFAULT 'file',
    
    -- Disk Properties
    is_bootable BOOLEAN DEFAULT FALSE,
    is_system_disk BOOLEAN DEFAULT FALSE,
    disk_bus VARCHAR(50), -- virtio, ide, scsi
    disk_device VARCHAR(50) DEFAULT 'disk', -- disk, cdrom, floppy
    
    -- Performance Settings
    cache_mode ENUM('none', 'writethrough', 'writeback', 'unsafe', 'directsync') DEFAULT 'writethrough',
    io_mode ENUM('threads', 'native') DEFAULT 'threads',
    discard_mode ENUM('ignore', 'unmap') DEFAULT 'ignore',
    
    -- Backup Settings
    snapshot_enabled BOOLEAN DEFAULT TRUE,
    backup_enabled BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_vm_disk_vm
        FOREIGN KEY (vm_id) REFERENCES virtual_machines(vm_id)
        ON DELETE CASCADE,
    
    UNIQUE KEY uk_vm_disk_name (vm_id, disk_name),
    INDEX idx_vm_disk_uuid (disk_uuid),
    INDEX idx_disk_type (disk_type),
    INDEX idx_disk_format (disk_format),
    INDEX idx_storage_pool (storage_pool),
    INDEX idx_is_bootable (is_bootable),
    INDEX idx_is_system_disk (is_system_disk)
);

-- ===================================================================
-- VM VIRTUAL NETWORK INTERFACES
-- ===================================================================
CREATE TABLE IF NOT EXISTS vm_network_interfaces (
    vm_interface_id INT PRIMARY KEY AUTO_INCREMENT,
    vm_id INT NOT NULL,
    
    -- Interface Identity
    interface_name VARCHAR(100) NOT NULL, -- eth0, ens3, etc.
    interface_uuid VARCHAR(36),
    description TEXT,
    
    -- Network Configuration
    mac_address VARCHAR(17), -- VM's MAC address
    ip_address VARCHAR(45), -- VM's IP address
    netmask VARCHAR(45),
    gateway VARCHAR(45),
    
    -- Interface Type
    interface_type ENUM('bridge', 'nat', 'host-only', 'internal', 'external') DEFAULT 'bridge',
    network_bridge VARCHAR(100), -- Host bridge name (br0, virbr0, etc.)
    vlan_id INT,
    
    -- Driver and Model
    driver_type ENUM('virtio', 'e1000', 'e1000e', 'rtl8139', 'vmxnet3') DEFAULT 'virtio',
    link_state ENUM('up', 'down') DEFAULT 'down',
    
    -- Traffic Control
    bandwidth_limit_mbps INT, -- Bandwidth limit in Mbps
    packet_filter_enabled BOOLEAN DEFAULT FALSE,
    
    -- Interface Status
    is_connected BOOLEAN DEFAULT TRUE,
    is_primary BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_vm_interface_vm
        FOREIGN KEY (vm_id) REFERENCES virtual_machines(vm_id)
        ON DELETE CASCADE,
    
    UNIQUE KEY uk_vm_interface_name (vm_id, interface_name),
    INDEX idx_vm_interface_uuid (interface_uuid),
    INDEX idx_mac_address (mac_address),
    INDEX idx_ip_address (ip_address),
    INDEX idx_interface_type (interface_type),
    INDEX idx_network_bridge (network_bridge),
    INDEX idx_vlan_id (vlan_id),
    INDEX idx_is_primary (is_primary)
);

-- ===================================================================
-- VM SNAPSHOTS
-- ===================================================================
CREATE TABLE IF NOT EXISTS vm_snapshots (
    snapshot_id INT PRIMARY KEY AUTO_INCREMENT,
    vm_id INT NOT NULL,
    
    -- Snapshot Identity
    snapshot_name VARCHAR(255) NOT NULL,
    snapshot_uuid VARCHAR(36),
    description TEXT,
    
    -- Snapshot Type
    snapshot_type ENUM('manual', 'automatic', 'backup', 'migration') DEFAULT 'manual',
    include_memory BOOLEAN DEFAULT TRUE, -- Include RAM state in snapshot
    
    -- Snapshot State
    snapshot_state ENUM('creating', 'active', 'reverting', 'deleting', 'error') DEFAULT 'creating',
    
    -- File Information
    snapshot_path VARCHAR(512), -- Path to snapshot file
    snapshot_size_bytes BIGINT, -- Snapshot file size
    
    -- Parent Snapshot
    parent_snapshot_id INT NULL, -- Reference to parent snapshot for incremental snapshots
    
    -- Metadata
    vm_state_at_snapshot ENUM('running', 'stopped', 'paused') NOT NULL,
    created_by VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL, -- When to auto-delete this snapshot
    
    CONSTRAINT fk_vm_snapshot_vm
        FOREIGN KEY (vm_id) REFERENCES virtual_machines(vm_id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_vm_snapshot_parent
        FOREIGN KEY (parent_snapshot_id) REFERENCES vm_snapshots(snapshot_id)
        ON DELETE SET NULL,
    
    UNIQUE KEY uk_vm_snapshot_name (vm_id, snapshot_name),
    INDEX idx_vm_snapshot_uuid (snapshot_uuid),
    INDEX idx_snapshot_type (snapshot_type),
    INDEX idx_snapshot_state (snapshot_state),
    INDEX idx_created_by (created_by),
    INDEX idx_expires_at (expires_at),
    INDEX idx_parent_snapshot (parent_snapshot_id)
);

-- ===================================================================
-- VM RESOURCE USAGE TRACKING
-- ===================================================================
CREATE TABLE IF NOT EXISTS vm_resource_usage (
    usage_id INT PRIMARY KEY AUTO_INCREMENT,
    vm_id INT NOT NULL,
    
    -- CPU Usage
    cpu_usage_percent DECIMAL(5,2), -- Current CPU usage percentage
    cpu_time_seconds BIGINT, -- Total CPU time used
    
    -- Memory Usage
    memory_used_mb INT,
    memory_available_mb INT,
    memory_cached_mb INT,
    
    -- Disk I/O
    disk_read_bytes BIGINT,
    disk_write_bytes BIGINT,
    disk_read_iops INT,
    disk_write_iops INT,
    
    -- Network I/O
    network_rx_bytes BIGINT,
    network_tx_bytes BIGINT,
    network_rx_packets INT,
    network_tx_packets INT,
    
    -- Timestamp
    collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_vm_usage_vm
        FOREIGN KEY (vm_id) REFERENCES virtual_machines(vm_id)
        ON DELETE CASCADE,
    
    INDEX idx_vm_collected (vm_id, collected_at),
    INDEX idx_collected_at (collected_at)
);

-- ===================================================================
-- VM CONFIGURATION HISTORY
-- ===================================================================
CREATE TABLE IF NOT EXISTS vm_configuration_history (
    config_id INT PRIMARY KEY AUTO_INCREMENT,
    vm_id INT NOT NULL,
    
    -- Configuration Change
    change_type ENUM('created', 'started', 'stopped', 'paused', 'resumed', 'migrated', 'modified', 'deleted') NOT NULL,
    change_description TEXT,
    
    -- Configuration Data
    config_before JSON, -- VM configuration before change
    config_after JSON, -- VM configuration after change
    
    -- Change Context
    changed_by VARCHAR(100),
    change_reason VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_vm_config_vm
        FOREIGN KEY (vm_id) REFERENCES virtual_machines(vm_id)
        ON DELETE CASCADE,
    
    INDEX idx_vm_change_type (vm_id, change_type),
    INDEX idx_changed_by (changed_by),
    INDEX idx_created_at (created_at)
);

-- ===================================================================
-- VM MIGRATIONS
-- ===================================================================
CREATE TABLE IF NOT EXISTS vm_migrations (
    migration_id INT PRIMARY KEY AUTO_INCREMENT,
    vm_id INT NOT NULL,
    
    -- Migration Details
    source_server_id INT NOT NULL, -- Source host server
    target_server_id INT NOT NULL, -- Target host server
    migration_type ENUM('live', 'offline', 'storage') DEFAULT 'offline',
    
    -- Migration State
    migration_state ENUM('initiated', 'preparing', 'running', 'completed', 'failed', 'cancelled') DEFAULT 'initiated',
    progress_percent DECIMAL(5,2) DEFAULT 0.00,
    
    -- Migration Settings
    downtime_ms INT, -- Acceptable downtime in milliseconds for live migration
    bandwidth_mbps INT, -- Migration bandwidth limit
    
    -- Migration Results
    total_time_seconds INT,
    downtime_actual_ms INT,
    data_transferred_gb DECIMAL(10,2),
    
    -- Error Information
    error_message TEXT,
    error_code VARCHAR(50),
    
    -- Migration Context
    initiated_by VARCHAR(100),
    migration_reason VARCHAR(255),
    
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    CONSTRAINT fk_vm_migration_vm
        FOREIGN KEY (vm_id) REFERENCES virtual_machines(vm_id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_vm_migration_source
        FOREIGN KEY (source_server_id) REFERENCES servers(server_id)
        ON DELETE RESTRICT,
    
    CONSTRAINT fk_vm_migration_target
        FOREIGN KEY (target_server_id) REFERENCES servers(server_id)
        ON DELETE RESTRICT,
    
    INDEX idx_vm_migration_state (migration_state),
    INDEX idx_source_server (source_server_id),
    INDEX idx_target_server (target_server_id),
    INDEX idx_initiated_by (initiated_by),
    INDEX idx_started_at (started_at)
);