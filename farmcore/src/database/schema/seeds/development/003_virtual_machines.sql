-- Virtual Machine seed data for development environment
-- Description: Creates sample VMs, disks, network interfaces, snapshots, and migrations

-- ===================================================================
-- VIRTUAL MACHINES
-- ===================================================================
INSERT INTO virtual_machines (
    vm_id, server_id, vm_name, vm_uuid, description,
    hypervisor_type, guest_os_family, guest_os_version, guest_os_architecture,
    vcpu_count, memory_mb, storage_gb,
    vm_state, vm_status,
    config_file_path, boot_order,
    enable_vnc, vnc_port, enable_spice, spice_port, enable_ssh, ssh_port,
    cpu_limit_percent, memory_balloon, io_priority,
    auto_backup_enabled, backup_retention_days, last_backup_at,
    created_by, managed_by,
    started_at, stopped_at
) VALUES
-- KVM VMs on Server 1 (Web Server)
(1, 1, 'web-prod-01', '11111111-1111-1111-1111-111111111111', 'Production web application VM',
 'KVM', 'linux', 'Ubuntu 22.04', 'x86_64',
 4, 8192, 100,
 'running', 'active',
 '/var/lib/libvirt/images/web-prod-01.xml', 'hd,cdrom,network',
 TRUE, 5901, FALSE, NULL, TRUE, 22,
 100, TRUE, 'high',
 TRUE, 7, '2026-02-12 03:00:00',
 'admin', 'devops_team',
 '2026-02-01 08:00:00', NULL),

(2, 1, 'web-prod-02', '11111111-1111-1111-1111-111111111112', 'Production web application VM - replica',
 'KVM', 'linux', 'Ubuntu 22.04', 'x86_64',
 4, 8192, 100,
 'running', 'active',
 '/var/lib/libvirt/images/web-prod-02.xml', 'hd,cdrom,network',
 TRUE, 5902, FALSE, NULL, TRUE, 22,
 100, TRUE, 'high',
 TRUE, 7, '2026-02-12 03:00:00',
 'admin', 'devops_team',
 '2026-02-01 09:00:00', NULL),

(3, 1, 'cache-redis-01', '11111111-1111-1111-1111-111111111113', 'Redis cache server',
 'KVM', 'linux', 'Ubuntu 22.04', 'x86_64',
 2, 4096, 50,
 'running', 'active',
 '/var/lib/libvirt/images/cache-redis-01.xml', 'hd,cdrom,network',
 TRUE, 5903, FALSE, NULL, TRUE, 22,
 100, TRUE, 'high',
 TRUE, 3, '2026-02-11 03:00:00',
 'admin', 'devops_team',
 '2026-02-01 10:00:00', NULL),

-- VMs on Server 2 (Database Server)
(4, 2, 'db-primary-01', '22222222-2222-2222-2222-222222222221', 'Primary PostgreSQL database',
 'KVM', 'linux', 'Ubuntu 22.04', 'x86_64',
 8, 32768, 500,
 'running', 'active',
 '/var/lib/libvirt/images/db-primary-01.xml', 'hd,cdrom,network',
 TRUE, 5904, FALSE, NULL, TRUE, 22,
 100, TRUE, 'high',
 TRUE, 14, '2026-02-12 02:00:00',
 'admin', 'dba_team',
 '2026-01-15 08:00:00', NULL),

(5, 2, 'db-replica-01', '22222222-2222-2222-2222-222222222222', 'PostgreSQL read replica',
 'KVM', 'linux', 'Ubuntu 22.04', 'x86_64',
 8, 32768, 500,
 'running', 'active',
 '/var/lib/libvirt/images/db-replica-01.xml', 'hd,cdrom,network',
 TRUE, 5905, FALSE, NULL, TRUE, 22,
 100, TRUE, 'high',
 TRUE, 7, '2026-02-12 02:00:00',
 'admin', 'dba_team',
 '2026-01-15 09:00:00', NULL),

-- VMs on Server 3 (App Server)
(6, 3, 'app-backend-01', '33333333-3333-3333-3333-333333333331', 'Backend API service',
 'KVM', 'linux', 'Debian 12', 'x86_64',
 4, 16384, 200,
 'running', 'active',
 '/var/lib/libvirt/images/app-backend-01.xml', 'hd,cdrom,network',
 TRUE, 5906, FALSE, NULL, TRUE, 22,
 100, TRUE, 'high',
 TRUE, 7, '2026-02-12 03:00:00',
 'admin', 'devops_team',
 '2026-02-01 08:00:00', NULL),

(7, 3, 'app-worker-01', '33333333-3333-3333-3333-333333333332', 'Background job worker',
 'KVM', 'linux', 'Debian 12', 'x86_64',
 2, 8192, 100,
 'running', 'active',
 '/var/lib/libvirt/images/app-worker-01.xml', 'hd,cdrom,network',
 TRUE, 5907, FALSE, NULL, TRUE, 22,
 100, TRUE, 'normal',
 TRUE, 7, '2026-02-12 03:00:00',
 'admin', 'devops_team',
 '2026-02-01 09:00:00', NULL),

(8, 3, 'app-queue-01', '33333333-3333-3333-3333-333333333333', 'RabbitMQ message queue',
 'KVM', 'linux', 'Ubuntu 22.04', 'x86_64',
 2, 4096, 50,
 'running', 'active',
 '/var/lib/libvirt/images/app-queue-01.xml', 'hd,cdrom,network',
 TRUE, 5908, FALSE, NULL, TRUE, 22,
 100, TRUE, 'high',
 TRUE, 3, '2026-02-11 03:00:00',
 'admin', 'devops_team',
 '2026-02-05 08:00:00', NULL),

-- Stopped/Maintenance VMs
(9, 4, 'test-vm-01', '44444444-4444-4444-4444-444444444441', 'Testing VM - currently stopped',
 'KVM', 'linux', 'Ubuntu 20.04', 'x86_64',
 2, 4096, 50,
 'stopped', 'inactive',
 '/var/lib/libvirt/images/test-vm-01.xml', 'hd,cdrom,network',
 TRUE, 5909, FALSE, NULL, TRUE, 22,
 100, TRUE, 'low',
 FALSE, 7, NULL,
 'admin', 'qa_team',
 '2026-02-10 08:00:00', '2026-02-10 18:00:00'),

(10, 5, 'dev-vm-01', '55555555-5555-5555-5555-555555555551', 'Development environment VM',
 'KVM', 'linux', 'Fedora 39', 'x86_64',
 4, 8192, 100,
 'running', 'active',
 '/var/lib/libvirt/images/dev-vm-01.xml', 'hd,cdrom,network',
 TRUE, 5910, TRUE, 5010, TRUE, 22,
 80, TRUE, 'low',
 FALSE, 3, NULL,
 'developer', 'dev_team',
 '2026-02-12 08:00:00', NULL),

-- Windows VMs
(11, 6, 'win-app-01', '66666666-6666-6666-6666-666666666661', 'Windows Application Server',
 'KVM', 'windows', 'Windows Server 2022', 'x86_64',
 4, 16384, 200,
 'running', 'active',
 '/var/lib/libvirt/images/win-app-01.xml', 'hd,cdrom,network',
 TRUE, 5911, FALSE, NULL, TRUE, 3389,
 100, FALSE, 'high',
 TRUE, 7, '2026-02-12 02:00:00',
 'admin', 'windows_team',
 '2026-01-20 08:00:00', NULL);

-- ===================================================================
-- VM VIRTUAL DISKS
-- ===================================================================
INSERT INTO vm_disks (
    vm_id, disk_name, disk_uuid, description,
    disk_type, disk_format, disk_size_gb, disk_path,
    storage_pool, storage_type,
    is_bootable, is_system_disk, disk_bus, disk_device,
    cache_mode, io_mode, discard_mode,
    snapshot_enabled, backup_enabled
) VALUES
-- web-prod-01 disks
(1, 'vda', '11111111-1111-1111-1111-111111111111', 'System disk',
 'virtio', 'qcow2', 80, '/var/lib/libvirt/images/web-prod-01-vda.qcow2',
 'default', 'file',
 TRUE, TRUE, 'virtio', 'disk',
 'writethrough', 'threads', 'unmap',
 TRUE, TRUE),

(1, 'vdb', '11111111-1111-1111-1111-111111111112', 'Data disk',
 'virtio', 'qcow2', 20, '/var/lib/libvirt/images/web-prod-01-vdb.qcow2',
 'default', 'file',
 FALSE, FALSE, 'virtio', 'disk',
 'writethrough', 'threads', 'unmap',
 TRUE, TRUE),

-- db-primary-01 disks
(4, 'vda', '22222222-2222-2222-2222-222222222221', 'System disk',
 'virtio', 'qcow2', 100, '/var/lib/libvirt/images/db-primary-01-vda.qcow2',
 'default', 'file',
 TRUE, TRUE, 'virtio', 'disk',
 'writeback', 'native', 'unmap',
 TRUE, TRUE),

(4, 'vdb', '22222222-2222-2222-2222-222222222222', 'Database data disk',
 'virtio', 'raw', 400, '/var/lib/libvirt/images/db-primary-01-vdb.raw',
 'database', 'lvm',
 FALSE, FALSE, 'virtio', 'disk',
 'writeback', 'native', 'unmap',
 TRUE, TRUE),

-- app-backend-01 disks
(6, 'vda', '33333333-3333-3333-3333-333333333331', 'System disk',
 'virtio', 'qcow2', 150, '/var/lib/libvirt/images/app-backend-01-vda.qcow2',
 'default', 'file',
 TRUE, TRUE, 'virtio', 'disk',
 'writethrough', 'threads', 'unmap',
 TRUE, TRUE),

(6, 'vdb', '33333333-3333-3333-3333-333333333332', 'Application data',
 'virtio', 'qcow2', 50, '/var/lib/libvirt/images/app-backend-01-vdb.qcow2',
 'default', 'file',
 FALSE, FALSE, 'virtio', 'disk',
 'writethrough', 'threads', 'unmap',
 TRUE, TRUE);

-- ===================================================================
-- VM NETWORK INTERFACES
-- ===================================================================
INSERT INTO vm_network_interfaces (
    vm_id, interface_name, interface_uuid, description,
    mac_address, ip_address, netmask, gateway,
    interface_type, network_bridge, vlan_id,
    driver_type, link_state,
    bandwidth_limit_mbps, packet_filter_enabled,
    is_connected, is_primary
) VALUES
-- web-prod-01 network
(1, 'eth0', '11111111-1111-1111-1111-111111111111', 'Primary network interface',
 '52:54:00:11:11:11', '192.168.1.101', '255.255.255.0', '192.168.1.1',
 'bridge', 'br0', NULL,
 'virtio', 'up',
 1000, FALSE,
 TRUE, TRUE),

-- web-prod-02 network
(2, 'eth0', '11111111-1111-1111-1111-111111111112', 'Primary network interface',
 '52:54:00:11:11:12', '192.168.1.102', '255.255.255.0', '192.168.1.1',
 'bridge', 'br0', NULL,
 'virtio', 'up',
 1000, FALSE,
 TRUE, TRUE),

-- db-primary-01 network
(4, 'eth0', '22222222-2222-2222-2222-222222222221', 'Primary network interface',
 '52:54:00:22:22:21', '192.168.1.201', '255.255.255.0', '192.168.1.1',
 'bridge', 'br0', NULL,
 'virtio', 'up',
 10000, FALSE,
 TRUE, TRUE),

(4, 'eth1', '22222222-2222-2222-2222-222222222222', 'Storage network',
 '52:54:00:22:22:22', '10.0.1.201', '255.255.255.0', '10.0.1.1',
 'bridge', 'br1', 100,
 'virtio', 'up',
 10000, FALSE,
 TRUE, FALSE),

-- app-backend-01 network
(6, 'eth0', '33333333-3333-3333-3333-333333333331', 'Primary network interface',
 '52:54:00:33:33:31', '192.168.1.301', '255.255.255.0', '192.168.1.1',
 'bridge', 'br0', NULL,
 'virtio', 'up',
 1000, FALSE,
 TRUE, TRUE);

-- ===================================================================
-- VM SNAPSHOTS
-- ===================================================================
INSERT INTO vm_snapshots (
    vm_id, snapshot_name, snapshot_uuid, description,
    snapshot_type, include_memory,
    snapshot_state,
    snapshot_path, snapshot_size_bytes,
    parent_snapshot_id,
    vm_state_at_snapshot, created_by,
    expires_at
) VALUES
-- web-prod-01 snapshots
(1, 'pre-update-2026-02-10', '11111111-1111-1111-1111-111111111111', 'Before system update',
 'manual', TRUE,
 'active',
 '/var/lib/libvirt/images/web-prod-01-snap-1.qcow2', 8589934592,
 NULL,
 'running', 'admin',
 '2026-03-10 00:00:00'),

(1, 'nightly-backup-2026-02-12', '11111111-1111-1111-1111-111111111112', 'Automated nightly backup',
 'automatic', FALSE,
 'active',
 '/var/lib/libvirt/images/web-prod-01-snap-2.qcow2', 4294967296,
 1,
 'running', 'backup_system',
 '2026-02-19 00:00:00'),

-- db-primary-01 snapshots
(4, 'pre-migration', '22222222-2222-2222-2222-222222222221', 'Before database migration',
 'migration', TRUE,
 'active',
 '/var/lib/libvirt/images/db-primary-01-snap-1.qcow2', 42949672960,
 NULL,
 'running', 'dba_team',
 '2026-03-15 00:00:00'),

-- app-backend-01 snapshots
(6, 'v2.5.0-deploy', '33333333-3333-3333-3333-333333333331', 'Before v2.5.0 deployment',
 'manual', TRUE,
 'active',
 '/var/lib/libvirt/images/app-backend-01-snap-1.qcow2', 12884901888,
 NULL,
 'running', 'devops_team',
 '2026-03-01 00:00:00');

-- ===================================================================
-- VM RESOURCE USAGE
-- ===================================================================
INSERT INTO vm_resource_usage (
    vm_id,
    cpu_usage_percent, cpu_time_seconds,
    memory_used_mb, memory_available_mb, memory_cached_mb,
    disk_read_bytes, disk_write_bytes, disk_read_iops, disk_write_iops,
    network_rx_bytes, network_tx_bytes, network_rx_packets, network_tx_packets,
    collected_at
) VALUES
-- Recent samples for web-prod-01
(1, 45.2, 3600000, 6144, 8192, 1024, 524288000, 262144000, 150, 80, 1073741824, 536870912, 150000, 120000, '2026-02-13 12:00:00'),
(1, 42.8, 3603600, 6080, 8192, 1088, 524320000, 262180000, 155, 82, 1074741824, 537870912, 151000, 121000, '2026-02-13 12:01:00'),

-- Recent samples for db-primary-01
(4, 68.5, 7200000, 28672, 32768, 3072, 2147483648, 1073741824, 500, 300, 536870912, 268435456, 80000, 60000, '2026-02-13 12:00:00'),
(4, 71.2, 7203600, 29184, 32768, 2560, 2148483648, 1074741824, 510, 305, 537870912, 269435456, 81000, 61000, '2026-02-13 12:01:00'),

-- Recent samples for app-backend-01
(6, 55.8, 5400000, 12288, 16384, 2048, 1073741824, 536870912, 250, 150, 2147483648, 1073741824, 200000, 180000, '2026-02-13 12:00:00'),
(6, 53.4, 5403600, 12032, 16384, 2304, 1074741824, 537870912, 248, 148, 2148483648, 1074741824, 201000, 181000, '2026-02-13 12:01:00');

-- ===================================================================
-- VM CONFIGURATION HISTORY
-- ===================================================================
INSERT INTO vm_configuration_history (
    vm_id, change_type, change_description,
    config_before, config_after,
    changed_by, change_reason
) VALUES
(1, 'created', 'Initial VM creation',
 NULL, '{"vcpu_count": 4, "memory_mb": 8192, "storage_gb": 100}',
 'admin', 'Initial deployment'),

(1, 'modified', 'Increased memory allocation',
 '{"vcpu_count": 4, "memory_mb": 4096, "storage_gb": 100}', '{"vcpu_count": 4, "memory_mb": 8192, "storage_gb": 100}',
 'admin', 'Application requires more memory'),

(4, 'created', 'Database VM creation',
 NULL, '{"vcpu_count": 8, "memory_mb": 32768, "storage_gb": 500}',
 'admin', 'Primary database server'),

(4, 'started', 'VM started',
 '{"vm_state": "stopped"}', '{"vm_state": "running"}',
 'admin', 'Starting database service'),

(6, 'created', 'Backend API VM creation',
 NULL, '{"vcpu_count": 4, "memory_mb": 16384, "storage_gb": 200}',
 'admin', 'API service deployment');

-- ===================================================================
-- VM MIGRATIONS
-- ===================================================================
INSERT INTO vm_migrations (
    vm_id, source_server_id, target_server_id, migration_type,
    migration_state, progress_percent,
    downtime_ms, bandwidth_mbps,
    total_time_seconds, downtime_actual_ms, data_transferred_gb,
    error_message, error_code,
    initiated_by, migration_reason,
    started_at, completed_at
) VALUES
-- Completed migration
(3, 1, 4, 'live',
 'completed', 100.00,
 500, 1000,
 120, 342, 48.5,
 NULL, NULL,
 'admin', 'Load balancing - moving cache to dedicated host',
 '2026-02-10 02:00:00', '2026-02-10 02:02:00'),

-- Recent completed migration
(7, 3, 5, 'live',
 'completed', 100.00,
 300, 1000,
 90, 285, 85.2,
 NULL, NULL,
 'devops_team', 'Moving worker to less loaded host',
 '2026-02-11 03:00:00', '2026-02-11 03:01:30'),

-- In-progress migration
(2, 1, 6, 'live',
 'running', 45.50,
 500, 1000,
 NULL, NULL, NULL,
 NULL, NULL,
 'admin', 'Host maintenance - evacuating VMs',
 '2026-02-13 11:50:00', NULL),

-- Failed migration
(8, 3, 4, 'live',
 'failed', 35.00,
 500, 1000,
 45, NULL, NULL,
 'Network connectivity lost during migration', 'NET_TIMEOUT',
 'admin', 'Attempted load balancing',
 '2026-02-09 14:00:00', '2026-02-09 14:00:45'),

-- Offline migration (completed)
(9, 4, 5, 'offline',
 'completed', 100.00,
 NULL, 500,
 300, NULL, 45.0,
 NULL, NULL,
 'qa_team', 'Moving test VM to development host',
 '2026-02-08 10:00:00', '2026-02-08 10:05:00'),

-- Storage migration
(4, 2, 2, 'storage',
 'completed', 100.00,
 NULL, 5000,
 600, NULL, 480.0,
 NULL, NULL,
 'dba_team', 'Migrating database to faster storage',
 '2026-02-05 01:00:00', '2026-02-05 01:10:00');
