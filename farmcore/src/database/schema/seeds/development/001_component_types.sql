-- Name: Component Type Specifications
-- Description: Loads reference data for all hardware component types including CPUs, memory, disks, GPUs, motherboards, network cards, and power supplies. These are the foundational component specifications that servers and switches reference.
-- Dependencies: none
-- Environment: development
-- Component Reference Tables Seed Data
-- These must be loaded first due to foreign key dependencies

-- ===================================================================
-- CPU COMPONENT TYPES
-- ===================================================================
INSERT IGNORE INTO component_cpu_types (
    manufacturer, model_name, num_cores, num_threads, 
    capacity_mhz, l1_cache_kb, l2_cache_kb, l3_cache_kb
) VALUES 
('Intel', 'Xeon E5-2690 v4', 14, 28, 3500, 32, 256, 35840),
('Intel', 'Xeon E5-2680 v4', 14, 28, 3300, 32, 256, 35840),
('Intel', 'Xeon Silver 4214', 12, 24, 3200, 32, 1024, 16896),
('AMD', 'EPYC 7702P', 64, 128, 3350, 64, 512, 262144),
('AMD', 'EPYC 7543', 32, 64, 3700, 64, 512, 262144);

-- ===================================================================
-- MEMORY COMPONENT TYPES
-- ===================================================================
INSERT IGNORE INTO component_memory_types (
    manufacturer, part_number, size_bytes, mem_type, speed_mt_s
) VALUES 
('Samsung', 'M393A2K43CB2-CTD', 17179869184, 'DDR4', 2666),
('Samsung', 'M393A4K40CB2-CTD', 34359738368, 'DDR4', 2666),
('Micron', 'MTA18ASF2G72PDZ-2G6E1', 17179869184, 'DDR4', 2666),
('Kingston', 'KSM26RD4/32MEI', 34359738368, 'DDR4', 2666),
('Crucial', 'CT32G4RFD424A-2666', 34359738368, 'DDR4', 2666);

-- ===================================================================
-- DISK COMPONENT TYPES
-- ===================================================================
INSERT IGNORE INTO component_disk_types (
    manufacturer, model, size_bytes, rotational, bus_type
) VALUES 
('Seagate', 'ST2000NX0253', 2000398934016, TRUE, 'SATA'),
('Western Digital', 'WD2003FZEX', 2000398934016, TRUE, 'SATA'),
('Samsung', '980 PRO', 1000204886016, FALSE, 'NVMe'),
('Intel', 'SSD DC S4510', 960197124096, FALSE, 'SATA'),
('Crucial', 'MX500', 1000204886016, FALSE, 'SATA');

-- ===================================================================
-- NETWORK COMPONENT TYPES  
-- ===================================================================
INSERT IGNORE INTO component_network_types (
    vendor_name, device_name, driver, max_speed_mbps
) VALUES 
('Intel', 'I350 Gigabit Network Connection', 'igb', 1000),
('Intel', 'X710 for 10GbE SFP+', 'i40e', 10000),
('Broadcom', 'NetXtreme BCM5720 2-port Gigabit Ethernet', 'tg3', 1000),
('Mellanox', 'ConnectX-4 Lx EN', 'mlx5_core', 25000),
('Realtek', 'RTL8111/8168/8411 PCI Express Gigabit Ethernet', 'r8169', 1000);

-- ===================================================================
-- GPU COMPONENT TYPES
-- ===================================================================
INSERT IGNORE INTO component_gpu_types (
    vendor, model, vram_mb
) VALUES 
('NVIDIA', 'GeForce RTX 3080', 10240),
('NVIDIA', 'Tesla V100', 32768),
('NVIDIA', 'Quadro RTX 5000', 16384),
('AMD', 'Radeon Pro W6800', 32768),
('Intel', 'Arc A770', 16384);

-- ===================================================================
-- MOTHERBOARD COMPONENT TYPES
-- ===================================================================
INSERT IGNORE INTO component_motherboard_types (
    manufacturer, product_name, version, bios_version, bmc_firmware_version
) VALUES 
('Supermicro', 'X11DPH-T', '1.01', '3.4', '1.73.14'),
('Dell', 'PowerEdge R640', 'A00', '2.14.0', '4.40.40.40'),
('HPE', 'ProLiant DL380 Gen10', 'A01', 'U30', '2.78'),
('ASRock Rack', 'X11SPH-nCTF', '1.02', '2.3a', '01.43.02'),
('ASUS', 'Pro WS X570-ACE', '1.0', '4021', 'N/A');

-- ===================================================================
-- SWITCH COMPONENT TYPES
-- ===================================================================
INSERT IGNORE INTO component_switch_types (
    vendor, model, series, total_ports, max_power_watts, form_factor, rack_units,
    gigabit_ports, ten_gig_ports, twenty_five_gig_ports, forty_gig_ports, hundred_gig_ports,
    supports_snmp, supports_ssh, supports_telnet, supports_web_ui
) VALUES 
('Cisco', '2960X-24TS-L', '2960-X', 24, 370, '1U', 1.0, 24, 0, 0, 0, 0, TRUE, TRUE, TRUE, TRUE),
('Cisco', '3850-48T-S', '3850', 48, 435, '1U', 1.0, 48, 0, 0, 0, 0, TRUE, TRUE, TRUE, TRUE),
('Arista', '7050SX-64', '7050SX', 64, 300, '1U', 1.0, 0, 48, 0, 4, 0, TRUE, TRUE, FALSE, TRUE),
('Juniper', 'EX2300-24T', 'EX2300', 24, 40, '1U', 1.0, 24, 0, 0, 0, 0, TRUE, TRUE, TRUE, TRUE),
('HPE', 'Aruba 6300M 48G', '6300M', 48, 290, '1U', 1.0, 48, 0, 0, 0, 0, TRUE, TRUE, FALSE, TRUE);