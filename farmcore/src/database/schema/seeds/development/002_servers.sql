-- Name: Server Inventory Data
-- Description: Loads sample server inventory including physical servers, component installations, authentication credentials, and monitoring data. Creates a realistic development environment with diverse server configurations.
-- Dependencies: 001_component_types
-- Environment: development
-- Server Inventory Seed Data
-- Depends on: component_types

-- ===================================================================
-- SERVERS
-- ===================================================================
INSERT IGNORE INTO servers (
    server_name, architecture, product_name, manufacturer, serial_number,
    chassis_manufacturer, chassis_serial_number,
    server_type, status, environment_type,
    cluster_id, sub_cluster_id, data_center_id, rack_id, rack_position_id,
    last_inventory_at, agent_version
) VALUES 
-- Development Web Server 1
('dev-web-01', 'x86_64', 'PowerEdge R750', 'Dell', 'DW750001', 
 'Dell', 'DW750001C',
 'COMPUTE', 'ACTIVE', 'DEVELOPMENT',
 1, 1, 1, 1, 10,
 '2025-11-28 08:00:00', '1.5.2'),

-- Development Database Server 1
('dev-db-01', 'x86_64', 'PowerEdge R750', 'Dell', 'DW750002', 
 'Dell', 'DW750002C',
 'STORAGE', 'ACTIVE', 'DEVELOPMENT',
 1, 1, 1, 1, 11,
 '2025-11-28 08:30:00', '1.5.2'),

-- Development Storage Server 1
('dev-storage-01', 'x86_64', 'ProLiant DL380 Gen10 Plus', 'HPE', 'HP380001', 
 'HPE', 'HP380001C',
 'STORAGE', 'ACTIVE', 'DEVELOPMENT',
 1, 2, 1, 1, 12,
 '2025-11-28 07:45:00', '1.5.1'),

-- Production Web Server 1
('prod-web-01', 'x86_64', 'X11DPH-T', 'Supermicro', 'SM001WEB', 
 'Supermicro', 'SM001WEBC',
 'COMPUTE', 'ACTIVE', 'PRODUCTION',
 2, 1, 2, 5, 20,
 '2025-11-28 06:00:00', '1.6.0'),

-- Production Database Server 1
('prod-db-01', 'x86_64', 'X11DPH-T', 'Supermicro', 'SM002DB', 
 'Supermicro', 'SM002DBC',
 'STORAGE', 'ACTIVE', 'PRODUCTION',
 2, 1, 2, 5, 21,
 '2025-11-28 06:15:00', '1.6.0'),

-- Maintenance Server
('maint-util-01', 'x86_64', 'WS C621E SAGE', 'ASUS', 'AS001UTIL', 
 'ASUS', 'AS001UTILC',
 'BAREMETAL', 'MAINTENANCE', 'TESTING',
 0, 0, 1, 2, 5,
 '2025-11-27 14:30:00', '1.4.8'),

-- New Server (not yet configured)
('new-srv-01', 'x86_64', 'EPYCD8-2T', 'ASRock Rack', 'AR001NEW', 
 'ASRock Rack', 'AR001NEWC',
 'BAREMETAL', 'NEW', 'STAGING',
 0, 0, 1, 3, 8,
 NULL, NULL);

-- ===================================================================
-- SERVER MOTHERBOARDS
-- ===================================================================
INSERT IGNORE INTO server_motherboards (
    server_id, component_motherboard_id, serial_number,
    bios_vendor, bios_version, bios_release_date
) VALUES 
-- dev-web-01
(1, 2, 'DW750001MB', 'Dell Inc.', 'v2.15.0', '2023-03-15'),
-- dev-db-01
(2, 2, 'DW750002MB', 'Dell Inc.', 'v2.15.0', '2023-03-15'),
-- dev-storage-01
(3, 3, 'HP380001MB', 'HPE', 'U46', '2023-01-20'),
-- prod-web-01
(4, 1, 'SM001WEBMB', 'American Megatrends Inc.', '3.3a', '2022-12-10'),
-- prod-db-01
(5, 1, 'SM002DBMB', 'American Megatrends Inc.', '3.3a', '2022-12-10'),
-- maint-util-01
(6, 4, 'AS001UTILMB', 'American Megatrends Inc.', '3801', '2023-05-01'),
-- new-srv-01
(7, 5, 'AR001NEWMB', 'American Megatrends Inc.', '3.20', '2023-08-15');

-- ===================================================================
-- SERVER CPUS (Example CPU installations)
-- ===================================================================
INSERT IGNORE INTO server_cpus (
    server_id, component_cpu_id, socket_number, slot
) VALUES 
-- dev-web-01 (dual Intel E5-2690 v4)
(1, 1, 0, 'CPU0'),
(1, 1, 1, 'CPU1'),
-- dev-db-01 (dual Intel E5-2680 v4)
(2, 2, 0, 'CPU0'),
(2, 2, 1, 'CPU1'),
-- dev-storage-01 (dual Intel Silver 4214)
(3, 3, 0, 'CPU0'),
(3, 3, 1, 'CPU1'),
-- prod-web-01 (dual AMD EPYC 7702P)
(4, 4, 0, 'CPU0'),
(4, 4, 1, 'CPU1'),
-- prod-db-01 (dual AMD EPYC 7543)
(5, 5, 0, 'CPU0'),
(5, 5, 1, 'CPU1');

-- ===================================================================
-- SERVER MEMORY (Example memory configurations)
-- ===================================================================
INSERT IGNORE INTO server_memory_dimms (
    server_id, component_memory_id, slot, serial_number
) VALUES 
-- dev-web-01 (8x 16GB Samsung DDR4-2133)
(1, 1, 'DIMM0', 'MEM001DEV01'), (1, 1, 'DIMM1', 'MEM002DEV01'), (1, 1, 'DIMM2', 'MEM003DEV01'), (1, 1, 'DIMM3', 'MEM004DEV01'),
(1, 1, 'DIMM4', 'MEM005DEV01'), (1, 1, 'DIMM5', 'MEM006DEV01'), (1, 1, 'DIMM6', 'MEM007DEV01'), (1, 1, 'DIMM7', 'MEM008DEV01'),
-- dev-db-01 (4x 32GB Samsung DDR4-2400)
(2, 2, 'DIMM0', 'MEM001DEV02'), (2, 2, 'DIMM1', 'MEM002DEV02'), (2, 2, 'DIMM2', 'MEM003DEV02'), (2, 2, 'DIMM3', 'MEM004DEV02'),
-- prod-web-01 (8x 32GB SK Hynix DDR4-2933)
(4, 4, 'DIMM0', 'MEM001PROD01'), (4, 4, 'DIMM1', 'MEM002PROD01'), (4, 4, 'DIMM2', 'MEM003PROD01'), (4, 4, 'DIMM3', 'MEM004PROD01'),
(4, 4, 'DIMM4', 'MEM005PROD01'), (4, 4, 'DIMM5', 'MEM006PROD01'), (4, 4, 'DIMM6', 'MEM007PROD01'), (4, 4, 'DIMM7', 'MEM008PROD01');

-- ===================================================================
-- SERVER DISKS (Example storage configurations)
-- ===================================================================
INSERT IGNORE INTO server_disks (
    server_id, component_disk_id, name, dev_path, serial, smart_health
) VALUES 
-- dev-web-01 (2x Samsung 980 PRO NVMe + 2x WD Gold SATA)
(1, 3, 'nvme0', '/dev/nvme0n1', 'NVME001DEV01', 'healthy'),
(1, 3, 'nvme1', '/dev/nvme1n1', 'NVME002DEV01', 'healthy'),
(1, 2, 'sda', '/dev/sda', 'SATA001DEV01', 'healthy'),
(1, 2, 'sdb', '/dev/sdb', 'SATA002DEV01', 'healthy'),
-- dev-db-01 (4x Samsung 870 EVO for storage)
(2, 5, 'sda', '/dev/sda', 'SSD001DEV02', 'healthy'),
(2, 5, 'sdb', '/dev/sdb', 'SSD002DEV02', 'healthy'),
(2, 5, 'sdc', '/dev/sdc', 'SSD003DEV02', 'healthy'),
(2, 5, 'sdd', '/dev/sdd', 'SSD004DEV02', 'warning'),
-- prod-web-01 (2x Intel Optane + 4x Seagate Enterprise)
(4, 4, 'nvme0', '/dev/nvme0n1', 'OPTANE001PROD01', 'healthy'),
(4, 4, 'nvme1', '/dev/nvme1n1', 'OPTANE002PROD01', 'healthy'),
(4, 1, 'sda', '/dev/sda', 'SATA001PROD01', 'healthy'),
(4, 1, 'sdb', '/dev/sdb', 'SATA002PROD01', 'healthy'),
(4, 1, 'sdc', '/dev/sdc', 'SATA003PROD01', 'healthy'),
(4, 1, 'sdd', '/dev/sdd', 'SATA004PROD01', 'healthy');

-- ===================================================================
-- SERVER NETWORK INTERFACES (Regular network interfaces only)
-- ===================================================================
INSERT IGNORE INTO server_network_interfaces (
    server_id, component_network_id, interface_type, name, mac_address, ip_address, speed_mbps, is_primary,
    switch_port_id
) VALUES 
-- dev-web-01 (Intel I350)
(1, 1, 'REGULAR', 'ens3f0', '00:1B:21:C8:F4:10', '192.168.1.10', 1000, true, 1),
(1, 1, 'REGULAR', 'ens3f1', '00:1B:21:C8:F4:11', NULL, 1000, false, NULL),

-- dev-db-01 (Mellanox ConnectX-4)
(2, 4, 'REGULAR', 'enp3s0f0', '0C:42:A1:D6:E8:20', '192.168.1.11', 25000, true, 2),
(2, 4, 'REGULAR', 'enp3s0f1', '0C:42:A1:D6:E8:21', NULL, 25000, false, NULL),

-- dev-storage-01 (Realtek)
(3, 5, 'REGULAR', 'eno1', '14:18:77:BE:92:12', '192.168.1.12', 1000, true, 3),

-- prod-web-01 (Broadcom)
(4, 3, 'REGULAR', 'ens3f0', '48:DF:37:C5:A2:40', '10.0.1.10', 1000, true, 2),
(4, 3, 'REGULAR', 'ens3f1', '48:DF:37:C5:A2:41', NULL, 1000, false, 3),

-- prod-db-01 (Broadcom)
(5, 3, 'REGULAR', 'ens3f0', '48:DF:37:C5:A2:50', '10.0.1.11', 1000, true, 3),

-- maint-util-01 (Intel)
(6, 2, 'REGULAR', 'enp3s0f0', '88:E9:FE:7B:A3:60', '192.168.200.20', 10000, true, NULL),

-- new-srv-01 (Realtek) - not yet configured
(7, 5, 'REGULAR', 'eno1', '70:85:C2:7F:89:20', NULL, 1000, true, NULL);

-- ===================================================================
-- SERVER BMC INTERFACES (Baseboard Management Controllers)
-- ===================================================================
INSERT IGNORE INTO server_bmc_interfaces (
    server_id, component_bmc_id, name, mac_address, ip_address,
    username, password, switch_port_id, firmware_version, release_date
) VALUES 
-- dev-web-01 BMC (Dell iDRAC9)
(1, 2, 'bmc0', '14:18:77:BE:92:10', '192.168.100.10', 'ADMIN', 'BMCDev123!', 1, '6.10.30.00', '2023-02-01'),

-- dev-db-01 BMC (Dell iDRAC9)
(2, 2, 'bmc0', '14:18:77:BE:92:11', '192.168.100.11', 'ADMIN', 'BMCDev123!', 2, '6.10.30.00', '2023-02-01'),

-- dev-storage-01 BMC (HPE iLO 5)
(3, 3, 'bmc0', '94:40:C9:3A:1B:12', '192.168.100.12', 'ADMIN', 'BMCDev123!', 3, '2.78', '2023-01-01'),

-- prod-web-01 BMC (Supermicro ASPEED AST2500)
(4, 1, 'bmc0', '00:25:90:EC:B4:10', '10.0.100.10', 'ADMIN', 'BMCProd789#', 3, '1.73.14', '2022-11-15'),

-- prod-db-01 BMC (Supermicro ASPEED AST2500)
(5, 1, 'bmc0', '00:25:90:EC:B4:11', '10.0.100.11', 'ADMIN', 'BMCProd789#', 4, '1.73.14', '2022-11-15'),

-- maint-util-01 BMC (Generic ASPEED AST2400)
(6, 6, 'bmc0', 'B4:2E:99:A1:C7:10', '192.168.200.10', 'ADMIN', 'BMCMaint999@', NULL, '1.40.05', '2023-04-15'),

-- new-srv-01 BMC (ASRock Rack ASPEED AST2500)
(7, 4, 'bmc0', '70:85:C2:7F:89:10', '192.168.50.10', 'ADMIN', 'BMCDefault000!', NULL, '1.25.02', '2023-07-20');

-- ===================================================================
-- SERVER CREDENTIALS (OS Authentication Only)
-- ===================================================================
INSERT IGNORE INTO server_credentials (
    server_id, credential_type, username, password
) VALUES 
-- Development Environment OS Credentials (1 per server)
(1, 'OS', 'admin', 'DevPass123!'),
(2, 'OS', 'admin', 'DevPass123!'),
(3, 'OS', 'admin', 'DevPass123!'),

-- Production Environment OS Credentials (1 per server)
(4, 'OS', 'admin', 'ProdSecure789#'),
(5, 'OS', 'admin', 'ProdSecure789#'),

-- Maintenance Server OS Credentials (1 per server)
(6, 'OS', 'maintenance', 'MaintPass999@'),

-- New Server Default OS Credentials (1 per server)
(7, 'OS', 'admin', 'NewServer000!');