-- Name: Network Switch Inventory Data
-- Description: Loads sample network switch inventory including core, distribution, access, and OOB
--              management switches across all three datacenters. Includes port configurations
--              and VLAN databases reflecting realistic datacenter network topology.
-- Dependencies: 005_datacenters, 006_server_clusters
-- Environment: development

-- ===================================================================
-- SWITCHES
-- ===================================================================
-- Network topology overview:
--   SFO (Dev):   sfo-core-sw-01  →  sfo-access-sw-01  (compute access)
--                                →  sfo-oob-sw-01      (OOB management)
--   DFW (Prod):  dfw-core-sw-01  →  dfw-dist-sw-01    →  dfw-access-sw-01
--                                →  dfw-oob-sw-01      (OOB management)
--   NYC (DR):    nyc-core-sw-01  (standalone core / WAN endpoint)
--
-- Switches are intentionally placed in the leaf racks with the servers they serve.
-- switch_id values: 1-8 assigned below

INSERT IGNORE INTO switches (
    switch_id,
    switch_name,
    component_switch_id,
    serial_number,
    asset_tag,
    os_type,
    os_version,
    bootrom_version,
    mgmt_ip_address,
    mgmt_mac_address,
    mgmt_vlan_id,
    uptime_seconds,
    temperature_celsius,
    fan_status,
    power_consumption_watts,
    switch_role,
    status,
    environment_type,
    cluster_id,
    sub_cluster_id,
    data_center_id,
    rack_id,
    rack_position_id,
    poll_interval_seconds,
    auth_method,
    snmp_version,
    last_poll_at
) VALUES

-- ---------------------------------------------------------------
-- SFO Dev: Core switch
-- ---------------------------------------------------------------
(1,
 'sfo-core-sw-01',
 NULL,
 'CTS100001',
 'AT-SFO-SW-001',
 'NX-OS',
 '10.3(5)M',
 '8.7.3',
 '10.1.0.1',
 '00:1A:2B:0C:01:01',
 10,
 7862400,   -- ~91 days
 38,
 'OK',
 450,
 'CORE',
 'ACTIVE',
 'DEVELOPMENT',
 1, 0, 1, 1, 1,
 60,
 'LOCAL',
 'v2c',
 '2026-04-25 00:00:00'
),

-- ---------------------------------------------------------------
-- SFO Dev: Access switch (compute tier)
-- ---------------------------------------------------------------
(2,
 'sfo-access-sw-01',
 NULL,
 'CTS100002',
 'AT-SFO-SW-002',
 'EOS',
 '4.31.2F',
 '2.10.0',
 '10.1.0.2',
 '00:1A:2B:0C:02:01',
 10,
 5356800,   -- ~62 days
 34,
 'OK',
 120,
 'ACCESS',
 'ACTIVE',
 'DEVELOPMENT',
 1, 1, 1, 1, 2,
 300,
 'LOCAL',
 'v2c',
 '2026-04-25 00:00:00'
),

-- ---------------------------------------------------------------
-- SFO Dev: OOB / management switch
-- ---------------------------------------------------------------
(3,
 'sfo-oob-sw-01',
 NULL,
 'CTS100003',
 'AT-SFO-SW-003',
 'IOS',
 '15.2(7)E3',
 '12.1(3r)T2',
 '10.1.0.3',
 '00:1A:2B:0C:03:01',
 100,
 12873600,  -- ~149 days
 31,
 'OK',
 80,
 'OOB',
 'ACTIVE',
 'DEVELOPMENT',
 1, 0, 1, 2, 1,
 300,
 'LOCAL',
 'v2c',
 '2026-04-25 00:00:00'
),

-- ---------------------------------------------------------------
-- DFW Prod: Core switch
-- ---------------------------------------------------------------
(4,
 'dfw-core-sw-01',
 NULL,
 'CTS200001',
 'AT-DFW-SW-001',
 'NX-OS',
 '10.3(5)M',
 '8.7.3',
 '10.2.0.1',
 '00:1A:2B:0C:04:01',
 10,
 15724800,  -- ~182 days
 42,
 'OK',
 680,
 'CORE',
 'ACTIVE',
 'PRODUCTION',
 2, 0, 2, 4, 1,
 60,
 'TACACS',
 'v3',
 '2026-04-25 00:00:00'
),

-- ---------------------------------------------------------------
-- DFW Prod: Distribution switch
-- ---------------------------------------------------------------
(5,
 'dfw-dist-sw-01',
 NULL,
 'CTS200002',
 'AT-DFW-SW-002',
 'NX-OS',
 '10.3(5)M',
 '8.7.3',
 '10.2.0.2',
 '00:1A:2B:0C:05:01',
 10,
 15638400,  -- ~181 days
 39,
 'OK',
 380,
 'DISTRIBUTION',
 'ACTIVE',
 'PRODUCTION',
 2, 0, 2, 5, 1,
 60,
 'TACACS',
 'v3',
 '2026-04-25 00:00:00'
),

-- ---------------------------------------------------------------
-- DFW Prod: Access switch (compute tier)
-- ---------------------------------------------------------------
(6,
 'dfw-access-sw-01',
 NULL,
 'CTS200003',
 'AT-DFW-SW-003',
 'EOS',
 '4.31.2F',
 '2.10.0',
 '10.2.0.3',
 '00:1A:2B:0C:06:01',
 10,
 14515200,  -- ~168 days
 36,
 'OK',
 200,
 'ACCESS',
 'ACTIVE',
 'PRODUCTION',
 2, 4, 2, 5, 2,
 300,
 'TACACS',
 'v3',
 '2026-04-25 00:00:00'
),

-- ---------------------------------------------------------------
-- DFW Prod: OOB / management switch
-- ---------------------------------------------------------------
(7,
 'dfw-oob-sw-01',
 NULL,
 'CTS200004',
 'AT-DFW-SW-004',
 'IOS',
 '15.2(7)E3',
 '12.1(3r)T2',
 '10.2.0.4',
 '00:1A:2B:0C:07:01',
 100,
 14515200,  -- ~168 days
 30,
 'OK',
 95,
 'OOB',
 'ACTIVE',
 'PRODUCTION',
 2, 0, 2, 6, 1,
 300,
 'TACACS',
 'v2c',
 '2026-04-25 00:00:00'
),

-- ---------------------------------------------------------------
-- NYC DR: Core switch
-- ---------------------------------------------------------------
(8,
 'nyc-core-sw-01',
 NULL,
 'CTS300001',
 'AT-NYC-SW-001',
 'NX-OS',
 '10.3(4)M',
 '8.7.2',
 '10.3.0.1',
 '00:1A:2B:0C:08:01',
 10,
 9331200,   -- ~108 days
 40,
 'OK',
 520,
 'CORE',
 'ACTIVE',
 'PRODUCTION',
 3, 0, 3, 7, 1,
 120,
 'TACACS',
 'v3',
 '2026-04-25 00:00:00'
);

-- ===================================================================
-- SWITCH PORTS
-- ===================================================================
-- Port naming conventions:
--   Te1/0/x  = 10GbE SFP+
--   Fo1/0/x  = 40GbE QSFP+
--   Hu1/0/x  = 100GbE QSFP28
--   Gi1/0/x  = 1GbE copper
--   Ma1/0    = Dedicated management port

INSERT IGNORE INTO switch_ports (
    switch_id,
    name,
    port_index,
    port_type,
    admin_status,
    oper_status,
    speed_mbps,
    duplex,
    mtu,
    access_vlan_id,
    native_vlan_id,
    port_mode,
    connected_device_name,
    connected_device_ip,
    connected_device_mac,
    connected_device_type,
    bytes_in,
    bytes_out,
    description
) VALUES

-- ---------------------------------------------------------------
-- sfo-core-sw-01 (switch_id=1) ports
-- ---------------------------------------------------------------
-- Uplink to DFW core (WAN)
(1, 'Te1/0/1', 1, 'SFP+', 'UP', 'UP', 10000, 'FULL', 9216,
 NULL, 1, 'TRUNK',
 'dfw-core-sw-01', '10.2.0.1', '00:1A:2B:0C:04:01', 'SWITCH',
 8842563210, 7123456789,
 'Uplink to DFW-PROD core (inter-site WAN)'),

-- Downlink to sfo-access-sw-01
(1, 'Te1/0/2', 2, 'SFP+', 'UP', 'UP', 10000, 'FULL', 9216,
 NULL, 1, 'TRUNK',
 'sfo-access-sw-01', '10.1.0.2', '00:1A:2B:0C:02:01', 'SWITCH',
 2341876543, 3123456789,
 'Downlink to sfo-access-sw-01 (compute tier)'),

-- Downlink to sfo-oob-sw-01
(1, 'Te1/0/3', 3, 'SFP+', 'UP', 'UP', 10000, 'FULL', 9216,
 NULL, 100, 'TRUNK',
 'sfo-oob-sw-01', '10.1.0.3', '00:1A:2B:0C:03:01', 'SWITCH',
 451234567, 389012345,
 'Downlink to sfo-oob-sw-01 (OOB management)'),

-- Unused SFP+ slot
(1, 'Te1/0/4', 4, 'SFP+', 'DOWN', 'DOWN', NULL, 'AUTO', 9216,
 NULL, NULL, 'ACCESS',
 NULL, NULL, NULL, NULL,
 0, 0,
 'Reserved — spare SFP+ slot'),

-- ---------------------------------------------------------------
-- sfo-access-sw-01 (switch_id=2) ports
-- ---------------------------------------------------------------
-- Uplink to core
(2, 'Te1/0/1', 1, 'SFP+', 'UP', 'UP', 10000, 'FULL', 9216,
 NULL, 1, 'TRUNK',
 'sfo-core-sw-01', '10.1.0.1', '00:1A:2B:0C:01:01', 'SWITCH',
 3123456789, 2341876543,
 'Uplink to sfo-core-sw-01'),

-- dev-web-01 server port
(2, 'Gi1/0/1', 2, 'ETHERNET', 'UP', 'UP', 1000, 'FULL', 1500,
 30, NULL, 'ACCESS',
 'dev-web-01', '10.1.10.11', 'AA:BB:CC:01:01:01', 'SERVER',
 987654321, 1234567890,
 'dev-web-01 — primary NIC'),

-- dev-db-01 server port
(2, 'Gi1/0/2', 3, 'ETHERNET', 'UP', 'UP', 1000, 'FULL', 1500,
 30, NULL, 'ACCESS',
 'dev-db-01', '10.1.10.12', 'AA:BB:CC:01:02:01', 'SERVER',
 2345678901, 876543210,
 'dev-db-01 — primary NIC'),

-- dev-storage-01 server port
(2, 'Gi1/0/3', 4, 'ETHERNET', 'UP', 'UP', 1000, 'FULL', 9000,
 40, NULL, 'ACCESS',
 'dev-storage-01', '10.1.10.13', 'AA:BB:CC:01:03:01', 'SERVER',
 8765432109, 4321098765,
 'dev-storage-01 — storage NIC (jumbo MTU)'),

-- Spare port
(2, 'Gi1/0/4', 5, 'ETHERNET', 'DOWN', 'DOWN', NULL, 'AUTO', 1500,
 30, NULL, 'ACCESS',
 NULL, NULL, NULL, NULL,
 0, 0,
 'Spare — unallocated'),

-- ---------------------------------------------------------------
-- sfo-oob-sw-01 (switch_id=3) ports
-- ---------------------------------------------------------------
-- Uplink to core
(3, 'Gi0/1', 1, 'ETHERNET', 'UP', 'UP', 1000, 'FULL', 1500,
 NULL, 100, 'TRUNK',
 'sfo-core-sw-01', '10.1.0.1', '00:1A:2B:0C:01:01', 'SWITCH',
 123456789, 98765432,
 'Uplink to sfo-core-sw-01 (OOB segment)'),

-- dev-web-01 BMC
(3, 'Gi1/0/1', 2, 'ETHERNET', 'UP', 'UP', 1000, 'FULL', 1500,
 100, NULL, 'ACCESS',
 'dev-web-01-bmc', '10.1.100.11', 'AA:BB:CC:FF:01:01', 'SERVER',
 45678901, 23456789,
 'dev-web-01 BMC / iDRAC'),

-- dev-db-01 BMC
(3, 'Gi1/0/2', 3, 'ETHERNET', 'UP', 'UP', 1000, 'FULL', 1500,
 100, NULL, 'ACCESS',
 'dev-db-01-bmc', '10.1.100.12', 'AA:BB:CC:FF:02:01', 'SERVER',
 34567890, 12345678,
 'dev-db-01 BMC / iDRAC'),

-- ---------------------------------------------------------------
-- dfw-core-sw-01 (switch_id=4) ports
-- ---------------------------------------------------------------
-- WAN uplink to SFO core
(4, 'Hu1/0/1', 1, 'QSFP28', 'UP', 'UP', 100000, 'FULL', 9216,
 NULL, 1, 'TRUNK',
 'sfo-core-sw-01', '10.1.0.1', '00:1A:2B:0C:01:01', 'SWITCH',
 45678901234, 38901234567,
 'Uplink to SFO dev core (inter-site 100G)'),

-- Downlink to dfw-dist-sw-01
(4, 'Te1/0/1', 2, 'SFP+', 'UP', 'UP', 10000, 'FULL', 9216,
 NULL, 1, 'TRUNK',
 'dfw-dist-sw-01', '10.2.0.2', '00:1A:2B:0C:05:01', 'SWITCH',
 12345678901, 9876543210,
 'Downlink to dfw-dist-sw-01'),

-- Downlink to dfw-oob-sw-01
(4, 'Te1/0/2', 3, 'SFP+', 'UP', 'UP', 10000, 'FULL', 9216,
 NULL, 100, 'TRUNK',
 'dfw-oob-sw-01', '10.2.0.4', '00:1A:2B:0C:07:01', 'SWITCH',
 2345678901, 1987654321,
 'Downlink to dfw-oob-sw-01 (OOB segment)'),

-- WAN link to NYC DR core
(4, 'Te1/0/3', 4, 'SFP+', 'UP', 'UP', 10000, 'FULL', 9216,
 NULL, 1, 'TRUNK',
 'nyc-core-sw-01', '10.3.0.1', '00:1A:2B:0C:08:01', 'SWITCH',
 6789012345, 5432109876,
 'WAN link to NYC DR core'),

-- ---------------------------------------------------------------
-- dfw-dist-sw-01 (switch_id=5) ports
-- ---------------------------------------------------------------
-- Uplink to core
(5, 'Te1/0/1', 1, 'SFP+', 'UP', 'UP', 10000, 'FULL', 9216,
 NULL, 1, 'TRUNK',
 'dfw-core-sw-01', '10.2.0.1', '00:1A:2B:0C:04:01', 'SWITCH',
 9876543210, 12345678901,
 'Uplink to dfw-core-sw-01'),

-- Downlink to dfw-access-sw-01
(5, 'Te1/0/2', 2, 'SFP+', 'UP', 'UP', 10000, 'FULL', 9216,
 NULL, 1, 'TRUNK',
 'dfw-access-sw-01', '10.2.0.3', '00:1A:2B:0C:06:01', 'SWITCH',
 7654321098, 6543210987,
 'Downlink to dfw-access-sw-01'),

-- ---------------------------------------------------------------
-- dfw-access-sw-01 (switch_id=6) ports
-- ---------------------------------------------------------------
-- Uplink to distribution
(6, 'Te1/0/1', 1, 'SFP+', 'UP', 'UP', 10000, 'FULL', 9216,
 NULL, 1, 'TRUNK',
 'dfw-dist-sw-01', '10.2.0.2', '00:1A:2B:0C:05:01', 'SWITCH',
 6543210987, 7654321098,
 'Uplink to dfw-dist-sw-01'),

-- prod-web-01 server port
(6, 'Gi1/0/1', 2, 'ETHERNET', 'UP', 'UP', 1000, 'FULL', 1500,
 20, NULL, 'ACCESS',
 'prod-web-01', '10.2.10.11', 'BB:CC:DD:02:01:01', 'SERVER',
 5432109876, 4321098765,
 'prod-web-01 — primary NIC'),

-- prod-db-01 server port
(6, 'Gi1/0/2', 3, 'ETHERNET', 'UP', 'UP', 1000, 'FULL', 9000,
 20, NULL, 'ACCESS',
 'prod-db-01', '10.2.10.12', 'BB:CC:DD:02:02:01', 'SERVER',
 9876543210, 8765432109,
 'prod-db-01 — primary NIC (jumbo MTU for replication)'),

-- Second NIC for prod-db-01 (dedicated storage path)
(6, 'Gi1/0/3', 4, 'ETHERNET', 'UP', 'UP', 1000, 'FULL', 9000,
 40, NULL, 'ACCESS',
 'prod-db-01', '10.2.40.12', 'BB:CC:DD:02:02:02', 'SERVER',
 12345678901, 10987654321,
 'prod-db-01 — storage NIC (VLAN 40, iSCSI)'),

-- Spare
(6, 'Gi1/0/4', 5, 'ETHERNET', 'DOWN', 'DOWN', NULL, 'AUTO', 1500,
 20, NULL, 'ACCESS',
 NULL, NULL, NULL, NULL,
 0, 0,
 'Spare — pre-provisioned for next prod server'),

-- ---------------------------------------------------------------
-- dfw-oob-sw-01 (switch_id=7) ports
-- ---------------------------------------------------------------
-- Uplink to core
(7, 'Gi0/1', 1, 'ETHERNET', 'UP', 'UP', 1000, 'FULL', 1500,
 NULL, 100, 'TRUNK',
 'dfw-core-sw-01', '10.2.0.1', '00:1A:2B:0C:04:01', 'SWITCH',
 456789012, 345678901,
 'Uplink to dfw-core-sw-01 (OOB segment)'),

-- prod-web-01 BMC
(7, 'Gi1/0/1', 2, 'ETHERNET', 'UP', 'UP', 1000, 'FULL', 1500,
 100, NULL, 'ACCESS',
 'prod-web-01-bmc', '10.2.100.11', 'BB:CC:DD:FF:01:01', 'SERVER',
 234567890, 123456789,
 'prod-web-01 BMC / iDRAC'),

-- prod-db-01 BMC
(7, 'Gi1/0/2', 3, 'ETHERNET', 'UP', 'UP', 1000, 'FULL', 1500,
 100, NULL, 'ACCESS',
 'prod-db-01-bmc', '10.2.100.12', 'BB:CC:DD:FF:02:01', 'SERVER',
 345678901, 234567890,
 'prod-db-01 BMC / iDRAC'),

-- ---------------------------------------------------------------
-- nyc-core-sw-01 (switch_id=8) ports
-- ---------------------------------------------------------------
-- WAN uplink to DFW core
(8, 'Te1/0/1', 1, 'SFP+', 'UP', 'UP', 10000, 'FULL', 9216,
 NULL, 1, 'TRUNK',
 'dfw-core-sw-01', '10.2.0.1', '00:1A:2B:0C:04:01', 'SWITCH',
 5432109876, 6789012345,
 'WAN uplink to DFW prod core'),

-- Local access switch downlink (placeholder — no DR access switch in seed)
(8, 'Te1/0/2', 2, 'SFP+', 'DOWN', 'DOWN', NULL, 'AUTO', 9216,
 NULL, 1, 'TRUNK',
 NULL, NULL, NULL, NULL,
 0, 0,
 'Reserved for DR access switch (not yet deployed)'),

-- Management port
(8, 'Ma1/0', 3, 'MANAGEMENT', 'UP', 'UP', 1000, 'FULL', 1500,
 10, NULL, 'ACCESS',
 NULL, '10.3.0.1', NULL, NULL,
 5678901, 4567890,
 'Dedicated out-of-band management port');

-- ===================================================================
-- SWITCH VLANS
-- ===================================================================
-- VLAN scheme (consistent across all switches):
--   VLAN  1  : Default / untagged
--   VLAN 10  : Server Management (IPMI/BMC reachability)
--   VLAN 20  : Production data plane
--   VLAN 30  : Development data plane
--   VLAN 40  : Storage / iSCSI (jumbo MTU)
--   VLAN 100 : OOB / Out-of-band management

INSERT IGNORE INTO switch_vlans (switch_id, vlan_id, vlan_name, vlan_status) VALUES

-- sfo-core-sw-01 (switch_id=1)
(1,  1, 'Default',            'ACTIVE'),
(1, 10, 'Server-MGMT',        'ACTIVE'),
(1, 30, 'Dev-Data',           'ACTIVE'),
(1, 40, 'Storage',            'ACTIVE'),
(1, 100,'OOB-MGMT',           'ACTIVE'),

-- sfo-access-sw-01 (switch_id=2)
(2, 10, 'Server-MGMT',        'ACTIVE'),
(2, 30, 'Dev-Data',           'ACTIVE'),
(2, 40, 'Storage',            'ACTIVE'),

-- sfo-oob-sw-01 (switch_id=3)
(3, 10, 'Server-MGMT',        'ACTIVE'),
(3, 100,'OOB-MGMT',           'ACTIVE'),

-- dfw-core-sw-01 (switch_id=4)
(4,  1, 'Default',            'ACTIVE'),
(4, 10, 'Server-MGMT',        'ACTIVE'),
(4, 20, 'Prod-Data',          'ACTIVE'),
(4, 40, 'Storage',            'ACTIVE'),
(4, 100,'OOB-MGMT',           'ACTIVE'),

-- dfw-dist-sw-01 (switch_id=5)
(5, 10, 'Server-MGMT',        'ACTIVE'),
(5, 20, 'Prod-Data',          'ACTIVE'),
(5, 40, 'Storage',            'ACTIVE'),

-- dfw-access-sw-01 (switch_id=6)
(6, 20, 'Prod-Data',          'ACTIVE'),
(6, 40, 'Storage',            'ACTIVE'),

-- dfw-oob-sw-01 (switch_id=7)
(7, 10, 'Server-MGMT',        'ACTIVE'),
(7, 100,'OOB-MGMT',           'ACTIVE'),

-- nyc-core-sw-01 (switch_id=8)
(8,  1, 'Default',            'ACTIVE'),
(8, 10, 'Server-MGMT',        'ACTIVE'),
(8, 20, 'Prod-Data',          'ACTIVE'),
(8, 40, 'Storage',            'ACTIVE'),
(8, 100,'OOB-MGMT',           'SUSPEND'); -- OOB not yet provisioned at DR site
