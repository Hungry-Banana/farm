-- Name: Expanded Server Inventory Data (100 Additional Servers)
-- Description: Adds 100 servers (IDs 8-107) with complete component coverage:
--              CPU, memory, disks, GPUs, network interfaces, BMC, motherboard, and credentials.
--              Servers span all clusters, sub-clusters, datacenters, and environments.
-- Dependencies: 001_component_types, 002_servers, 005_datacenters, 006_server_clusters
-- Environment: development

-- Component reference IDs (from 001_component_types.sql):
--   CPUs:         1=Intel E5-2690v4, 2=Intel E5-2680v4, 3=Intel Silver 4214, 4=AMD EPYC 7702P, 5=AMD EPYC 7543
--   Memory:       1=Samsung 16GB DDR4, 2=Samsung 32GB DDR4, 3=Micron 16GB DDR4, 4=Kingston 32GB DDR4, 5=Crucial 32GB DDR4
--   Disks:        1=Seagate 2TB HDD, 2=WD 2TB HDD, 3=Samsung 980 PRO 1TB NVMe, 4=Intel SSD S4510 960GB, 5=Crucial MX500 1TB
--   Networks:     1=Intel I350 1G, 2=Intel X710 10G, 3=Broadcom BCM5720 1G, 4=Mellanox CX-4 25G, 5=Realtek RTL8111 1G
--   GPUs:         1=RTX 3080 10GB, 2=Tesla V100 32GB, 3=Quadro RTX 5000, 4=Radeon Pro W6800, 5=Intel Arc A770
--   Motherboards: 1=Supermicro X11DPH-T, 2=Dell PowerEdge R640, 3=HPE DL380 Gen10, 4=ASRock X11SPH, 5=ASUS WS X570
--   BMCs:         1=Supermicro ASPEED AST2500, 2=Dell iDRAC9, 3=HPE iLO5, 4=ASRock ASPEED AST2500, 5=Lenovo XCC, 6=Generic AST2400
--   Clusters:     1=DEV, 2=PROD, 3=DR, 4=QA, 5=STAGING
--   Sub-clusters: 1=Dev Compute,2=Dev Storage,3=Dev Mgmt,4=Prod Web,5=Prod API,6=Prod DB Primary,7=Prod DB Replica,
--                 8=DR Standby Compute,9=DR DB Standby,10=QA Functional,11=QA Perf,12=Staging App,13=Staging DB,14=Dev GPU
--   Datacenters:  1=SFO-LAB, 2=DFW-PROD, 3=NYC-DR
--   Racks:        1-3=SFO, 4-6=DFW, 7-8=NYC

-- ===================================================================
-- SERVERS (IDs 8-107)
-- ===================================================================
INSERT IGNORE INTO servers (
    server_name, architecture, product_name, manufacturer, serial_number,
    chassis_manufacturer, chassis_serial_number,
    server_type, status, environment_type,
    cluster_id, sub_cluster_id, data_center_id, rack_id, rack_position_id,
    last_inventory_at, agent_version
) VALUES
-- --- DEV COMPUTE (cluster=1, sub=1, dc=1) ---
('dev-compute-01','x86_64','PowerEdge R750','Dell','DEV-C001','Dell','DEV-C001C','COMPUTE','ACTIVE','DEVELOPMENT',1,1,1,1,1,'2025-11-28 08:00:00','1.5.2'),
('dev-compute-02','x86_64','PowerEdge R750','Dell','DEV-C002','Dell','DEV-C002C','COMPUTE','ACTIVE','DEVELOPMENT',1,1,1,1,2,'2025-11-28 08:01:00','1.5.2'),
('dev-compute-03','x86_64','PowerEdge R750','Dell','DEV-C003','Dell','DEV-C003C','COMPUTE','ACTIVE','DEVELOPMENT',1,1,1,1,3,'2025-11-28 08:02:00','1.5.2'),
('dev-compute-04','x86_64','PowerEdge R750','Dell','DEV-C004','Dell','DEV-C004C','COMPUTE','ACTIVE','DEVELOPMENT',1,1,1,1,4,'2025-11-28 08:03:00','1.5.2'),
('dev-compute-05','x86_64','PowerEdge R750','Dell','DEV-C005','Dell','DEV-C005C','COMPUTE','ACTIVE','DEVELOPMENT',1,1,1,1,5,'2025-11-28 08:04:00','1.5.2'),
('dev-compute-06','x86_64','PowerEdge R750','Dell','DEV-C006','Dell','DEV-C006C','COMPUTE','ACTIVE','DEVELOPMENT',1,1,1,1,6,'2025-11-28 08:05:00','1.5.2'),
('dev-compute-07','x86_64','PowerEdge R750','Dell','DEV-C007','Dell','DEV-C007C','COMPUTE','ACTIVE','DEVELOPMENT',1,1,1,1,7,'2025-11-28 08:06:00','1.5.2'),
('dev-compute-08','x86_64','PowerEdge R750','Dell','DEV-C008','Dell','DEV-C008C','COMPUTE','ACTIVE','DEVELOPMENT',1,1,1,1,8,'2025-11-28 08:07:00','1.5.2'),
('dev-compute-09','x86_64','PowerEdge R750','Dell','DEV-C009','Dell','DEV-C009C','COMPUTE','ACTIVE','DEVELOPMENT',1,1,1,1,9,'2025-11-28 08:08:00','1.5.2'),
('dev-compute-10','x86_64','PowerEdge R750','Dell','DEV-C010','Dell','DEV-C010C','COMPUTE','ACTIVE','DEVELOPMENT',1,1,1,1,13,'2025-11-28 08:09:00','1.5.2'),

-- --- DEV STORAGE (cluster=1, sub=2, dc=1) ---
('dev-storage-02','x86_64','ProLiant DL380 Gen10 Plus','HPE','DEV-S002','HPE','DEV-S002C','STORAGE','ACTIVE','DEVELOPMENT',1,2,1,3,1,'2025-11-28 08:10:00','1.5.1'),
('dev-storage-03','x86_64','ProLiant DL380 Gen10 Plus','HPE','DEV-S003','HPE','DEV-S003C','STORAGE','ACTIVE','DEVELOPMENT',1,2,1,3,2,'2025-11-28 08:11:00','1.5.1'),
('dev-storage-04','x86_64','ProLiant DL380 Gen10 Plus','HPE','DEV-S004','HPE','DEV-S004C','STORAGE','ACTIVE','DEVELOPMENT',1,2,1,3,3,'2025-11-28 08:12:00','1.5.1'),
('dev-storage-05','x86_64','ProLiant DL380 Gen10 Plus','HPE','DEV-S005','HPE','DEV-S005C','STORAGE','ACTIVE','DEVELOPMENT',1,2,1,3,4,'2025-11-28 08:13:00','1.5.1'),
('dev-storage-06','x86_64','ProLiant DL380 Gen10 Plus','HPE','DEV-S006','HPE','DEV-S006C','STORAGE','ACTIVE','DEVELOPMENT',1,2,1,3,5,'2025-11-28 08:14:00','1.5.1'),

-- --- DEV GPU COMPUTE (cluster=1, sub=14, dc=1) ---
('dev-gpu-01','x86_64','EPYCD8-2T','ASRock Rack','DEV-G001','ASRock Rack','DEV-G001C','COMPUTE','ACTIVE','DEVELOPMENT',1,14,1,2,1,'2025-11-28 08:15:00','1.5.2'),
('dev-gpu-02','x86_64','EPYCD8-2T','ASRock Rack','DEV-G002','ASRock Rack','DEV-G002C','COMPUTE','ACTIVE','DEVELOPMENT',1,14,1,2,2,'2025-11-28 08:16:00','1.5.2'),
('dev-gpu-03','x86_64','EPYCD8-2T','ASRock Rack','DEV-G003','ASRock Rack','DEV-G003C','COMPUTE','ACTIVE','DEVELOPMENT',1,14,1,2,3,'2025-11-28 08:17:00','1.5.2'),
('dev-gpu-04','x86_64','EPYCD8-2T','ASRock Rack','DEV-G004','ASRock Rack','DEV-G004C','COMPUTE','ACTIVE','DEVELOPMENT',1,14,1,2,4,'2025-11-28 08:18:00','1.5.2'),
('dev-gpu-05','x86_64','EPYCD8-2T','ASRock Rack','DEV-G005','ASRock Rack','DEV-G005C','COMPUTE','ACTIVE','DEVELOPMENT',1,14,1,2,6,'2025-11-28 08:19:00','1.5.2'),

-- --- PROD WEB FRONTEND (cluster=2, sub=4, dc=2) ---
('prod-web-02','x86_64','X11DPH-T','Supermicro','PROD-W002','Supermicro','PROD-W002C','COMPUTE','ACTIVE','PRODUCTION',2,4,2,5,22,'2025-11-28 06:00:00','1.6.0'),
('prod-web-03','x86_64','X11DPH-T','Supermicro','PROD-W003','Supermicro','PROD-W003C','COMPUTE','ACTIVE','PRODUCTION',2,4,2,5,23,'2025-11-28 06:01:00','1.6.0'),
('prod-web-04','x86_64','X11DPH-T','Supermicro','PROD-W004','Supermicro','PROD-W004C','COMPUTE','ACTIVE','PRODUCTION',2,4,2,5,24,'2025-11-28 06:02:00','1.6.0'),
('prod-web-05','x86_64','X11DPH-T','Supermicro','PROD-W005','Supermicro','PROD-W005C','COMPUTE','ACTIVE','PRODUCTION',2,4,2,5,25,'2025-11-28 06:03:00','1.6.0'),
('prod-web-06','x86_64','X11DPH-T','Supermicro','PROD-W006','Supermicro','PROD-W006C','COMPUTE','ACTIVE','PRODUCTION',2,4,2,5,26,'2025-11-28 06:04:00','1.6.0'),
('prod-web-07','x86_64','X11DPH-T','Supermicro','PROD-W007','Supermicro','PROD-W007C','COMPUTE','ACTIVE','PRODUCTION',2,4,2,5,27,'2025-11-28 06:05:00','1.6.0'),
('prod-web-08','x86_64','X11DPH-T','Supermicro','PROD-W008','Supermicro','PROD-W008C','COMPUTE','ACTIVE','PRODUCTION',2,4,2,5,28,'2025-11-28 06:06:00','1.6.0'),
('prod-web-09','x86_64','X11DPH-T','Supermicro','PROD-W009','Supermicro','PROD-W009C','COMPUTE','ACTIVE','PRODUCTION',2,4,2,5,29,'2025-11-28 06:07:00','1.6.0'),
('prod-web-10','x86_64','X11DPH-T','Supermicro','PROD-W010','Supermicro','PROD-W010C','COMPUTE','ACTIVE','PRODUCTION',2,4,2,5,30,'2025-11-28 06:08:00','1.6.0'),

-- --- PROD API BACKEND (cluster=2, sub=5, dc=2) ---
('prod-api-01','x86_64','X11DPH-T','Supermicro','PROD-A001','Supermicro','PROD-A001C','COMPUTE','ACTIVE','PRODUCTION',2,5,2,4,1,'2025-11-28 06:10:00','1.6.0'),
('prod-api-02','x86_64','X11DPH-T','Supermicro','PROD-A002','Supermicro','PROD-A002C','COMPUTE','ACTIVE','PRODUCTION',2,5,2,4,2,'2025-11-28 06:11:00','1.6.0'),
('prod-api-03','x86_64','X11DPH-T','Supermicro','PROD-A003','Supermicro','PROD-A003C','COMPUTE','ACTIVE','PRODUCTION',2,5,2,4,3,'2025-11-28 06:12:00','1.6.0'),
('prod-api-04','x86_64','X11DPH-T','Supermicro','PROD-A004','Supermicro','PROD-A004C','COMPUTE','ACTIVE','PRODUCTION',2,5,2,4,4,'2025-11-28 06:13:00','1.6.0'),
('prod-api-05','x86_64','X11DPH-T','Supermicro','PROD-A005','Supermicro','PROD-A005C','COMPUTE','ACTIVE','PRODUCTION',2,5,2,4,5,'2025-11-28 06:14:00','1.6.0'),
('prod-api-06','x86_64','X11DPH-T','Supermicro','PROD-A006','Supermicro','PROD-A006C','COMPUTE','ACTIVE','PRODUCTION',2,5,2,4,6,'2025-11-28 06:15:00','1.6.0'),
('prod-api-07','x86_64','X11DPH-T','Supermicro','PROD-A007','Supermicro','PROD-A007C','COMPUTE','ACTIVE','PRODUCTION',2,5,2,4,7,'2025-11-28 06:16:00','1.6.0'),
('prod-api-08','x86_64','X11DPH-T','Supermicro','PROD-A008','Supermicro','PROD-A008C','COMPUTE','ACTIVE','PRODUCTION',2,5,2,4,8,'2025-11-28 06:17:00','1.6.0'),

-- --- PROD DB PRIMARY (cluster=2, sub=6, dc=2) ---
('prod-db-02','x86_64','X11DPH-T','Supermicro','PROD-D002','Supermicro','PROD-D002C','STORAGE','ACTIVE','PRODUCTION',2,6,2,6,1,'2025-11-28 06:20:00','1.6.0'),
('prod-db-03','x86_64','X11DPH-T','Supermicro','PROD-D003','Supermicro','PROD-D003C','STORAGE','ACTIVE','PRODUCTION',2,6,2,6,2,'2025-11-28 06:21:00','1.6.0'),
('prod-db-04','x86_64','X11DPH-T','Supermicro','PROD-D004','Supermicro','PROD-D004C','STORAGE','ACTIVE','PRODUCTION',2,6,2,6,3,'2025-11-28 06:22:00','1.6.0'),
('prod-db-05','x86_64','X11DPH-T','Supermicro','PROD-D005','Supermicro','PROD-D005C','STORAGE','ACTIVE','PRODUCTION',2,6,2,6,4,'2025-11-28 06:23:00','1.6.0'),

-- --- PROD DB REPLICA (cluster=2, sub=7, dc=2) ---
('prod-dbreplica-01','x86_64','X11DPH-T','Supermicro','PROD-DR001','Supermicro','PROD-DR001C','STORAGE','ACTIVE','PRODUCTION',2,7,2,6,5,'2025-11-28 06:30:00','1.6.0'),
('prod-dbreplica-02','x86_64','X11DPH-T','Supermicro','PROD-DR002','Supermicro','PROD-DR002C','STORAGE','ACTIVE','PRODUCTION',2,7,2,6,6,'2025-11-28 06:31:00','1.6.0'),
('prod-dbreplica-03','x86_64','X11DPH-T','Supermicro','PROD-DR003','Supermicro','PROD-DR003C','STORAGE','ACTIVE','PRODUCTION',2,7,2,6,7,'2025-11-28 06:32:00','1.6.0'),

-- --- DR STANDBY COMPUTE (cluster=3, sub=8, dc=3) ---
('dr-compute-01','x86_64','PowerEdge R640','Dell','DR-C001','Dell','DR-C001C','COMPUTE','ACTIVE','PRODUCTION',3,8,3,7,1,'2025-11-28 07:00:00','1.6.0'),
('dr-compute-02','x86_64','PowerEdge R640','Dell','DR-C002','Dell','DR-C002C','COMPUTE','ACTIVE','PRODUCTION',3,8,3,7,2,'2025-11-28 07:01:00','1.6.0'),
('dr-compute-03','x86_64','PowerEdge R640','Dell','DR-C003','Dell','DR-C003C','COMPUTE','ACTIVE','PRODUCTION',3,8,3,7,3,'2025-11-28 07:02:00','1.6.0'),
('dr-compute-04','x86_64','PowerEdge R640','Dell','DR-C004','Dell','DR-C004C','COMPUTE','ACTIVE','PRODUCTION',3,8,3,7,4,'2025-11-28 07:03:00','1.6.0'),
('dr-compute-05','x86_64','PowerEdge R640','Dell','DR-C005','Dell','DR-C005C','COMPUTE','ACTIVE','PRODUCTION',3,8,3,7,5,'2025-11-28 07:04:00','1.6.0'),
('dr-compute-06','x86_64','PowerEdge R640','Dell','DR-C006','Dell','DR-C006C','COMPUTE','ACTIVE','PRODUCTION',3,8,3,7,6,'2025-11-28 07:05:00','1.6.0'),
('dr-compute-07','x86_64','PowerEdge R640','Dell','DR-C007','Dell','DR-C007C','COMPUTE','ACTIVE','PRODUCTION',3,8,3,7,7,'2025-11-28 07:06:00','1.6.0'),

-- --- DR DB STANDBY (cluster=3, sub=9, dc=3) ---
('dr-db-01','x86_64','PowerEdge R640','Dell','DR-D001','Dell','DR-D001C','STORAGE','ACTIVE','PRODUCTION',3,9,3,8,1,'2025-11-28 07:10:00','1.6.0'),
('dr-db-02','x86_64','PowerEdge R640','Dell','DR-D002','Dell','DR-D002C','STORAGE','ACTIVE','PRODUCTION',3,9,3,8,2,'2025-11-28 07:11:00','1.6.0'),
('dr-db-03','x86_64','PowerEdge R640','Dell','DR-D003','Dell','DR-D003C','STORAGE','ACTIVE','PRODUCTION',3,9,3,8,3,'2025-11-28 07:12:00','1.6.0'),
('dr-db-04','x86_64','PowerEdge R640','Dell','DR-D004','Dell','DR-D004C','STORAGE','ACTIVE','PRODUCTION',3,9,3,8,4,'2025-11-28 07:13:00','1.6.0'),
('dr-db-05','x86_64','PowerEdge R640','Dell','DR-D005','Dell','DR-D005C','STORAGE','ACTIVE','PRODUCTION',3,9,3,8,5,'2025-11-28 07:14:00','1.6.0'),

-- --- QA FUNCTIONAL TESTING (cluster=4, sub=10, dc=1) ---
('qa-func-01','x86_64','WS C621E SAGE','ASUS','QA-F001','ASUS','QA-F001C','COMPUTE','ACTIVE','QA',4,10,1,2,7,'2025-11-28 09:00:00','1.5.2'),
('qa-func-02','x86_64','WS C621E SAGE','ASUS','QA-F002','ASUS','QA-F002C','COMPUTE','ACTIVE','QA',4,10,1,2,8,'2025-11-28 09:01:00','1.5.2'),
('qa-func-03','x86_64','WS C621E SAGE','ASUS','QA-F003','ASUS','QA-F003C','COMPUTE','ACTIVE','QA',4,10,1,2,9,'2025-11-28 09:02:00','1.5.2'),
('qa-func-04','x86_64','WS C621E SAGE','ASUS','QA-F004','ASUS','QA-F004C','COMPUTE','ACTIVE','QA',4,10,1,2,10,'2025-11-28 09:03:00','1.5.2'),
('qa-func-05','x86_64','WS C621E SAGE','ASUS','QA-F005','ASUS','QA-F005C','COMPUTE','ACTIVE','QA',4,10,1,2,11,'2025-11-28 09:04:00','1.5.2'),
('qa-func-06','x86_64','WS C621E SAGE','ASUS','QA-F006','ASUS','QA-F006C','COMPUTE','ACTIVE','QA',4,10,1,2,12,'2025-11-28 09:05:00','1.5.2'),

-- --- QA PERFORMANCE TESTING (cluster=4, sub=11, dc=1) ---
('qa-perf-01','x86_64','WS C621E SAGE','ASUS','QA-P001','ASUS','QA-P001C','COMPUTE','ACTIVE','QA',4,11,1,3,6,'2025-11-28 09:10:00','1.5.2'),
('qa-perf-02','x86_64','WS C621E SAGE','ASUS','QA-P002','ASUS','QA-P002C','COMPUTE','ACTIVE','QA',4,11,1,3,7,'2025-11-28 09:11:00','1.5.2'),
('qa-perf-03','x86_64','WS C621E SAGE','ASUS','QA-P003','ASUS','QA-P003C','COMPUTE','ACTIVE','QA',4,11,1,3,8,'2025-11-28 09:12:00','1.5.2'),
('qa-perf-04','x86_64','WS C621E SAGE','ASUS','QA-P004','ASUS','QA-P004C','COMPUTE','ACTIVE','QA',4,11,1,3,9,'2025-11-28 09:13:00','1.5.2'),

-- --- STAGING APPLICATION (cluster=5, sub=12, dc=2) ---
('stage-app-01','x86_64','X11DPH-T','Supermicro','STG-A001','Supermicro','STG-A001C','COMPUTE','ACTIVE','STAGING',5,12,2,4,9,'2025-11-28 10:00:00','1.5.9'),
('stage-app-02','x86_64','X11DPH-T','Supermicro','STG-A002','Supermicro','STG-A002C','COMPUTE','ACTIVE','STAGING',5,12,2,4,10,'2025-11-28 10:01:00','1.5.9'),
('stage-app-03','x86_64','X11DPH-T','Supermicro','STG-A003','Supermicro','STG-A003C','COMPUTE','ACTIVE','STAGING',5,12,2,4,11,'2025-11-28 10:02:00','1.5.9'),
('stage-app-04','x86_64','X11DPH-T','Supermicro','STG-A004','Supermicro','STG-A004C','COMPUTE','ACTIVE','STAGING',5,12,2,4,12,'2025-11-28 10:03:00','1.5.9'),
('stage-app-05','x86_64','X11DPH-T','Supermicro','STG-A005','Supermicro','STG-A005C','COMPUTE','ACTIVE','STAGING',5,12,2,4,13,'2025-11-28 10:04:00','1.5.9'),
('stage-app-06','x86_64','X11DPH-T','Supermicro','STG-A006','Supermicro','STG-A006C','COMPUTE','ACTIVE','STAGING',5,12,2,4,14,'2025-11-28 10:05:00','1.5.9'),

-- --- STAGING DATABASE (cluster=5, sub=13, dc=2) ---
('stage-db-01','x86_64','X11DPH-T','Supermicro','STG-D001','Supermicro','STG-D001C','STORAGE','ACTIVE','STAGING',5,13,2,6,8,'2025-11-28 10:10:00','1.5.9'),
('stage-db-02','x86_64','X11DPH-T','Supermicro','STG-D002','Supermicro','STG-D002C','STORAGE','ACTIVE','STAGING',5,13,2,6,9,'2025-11-28 10:11:00','1.5.9'),
('stage-db-03','x86_64','X11DPH-T','Supermicro','STG-D003','Supermicro','STG-D003C','STORAGE','ACTIVE','STAGING',5,13,2,6,10,'2025-11-28 10:12:00','1.5.9'),

-- --- ADDITIONAL PROD WEB (cluster=2, sub=4, dc=2) ---
('prod-web-11','x86_64','X11DPH-T','Supermicro','PROD-W011','Supermicro','PROD-W011C','COMPUTE','ACTIVE','PRODUCTION',2,4,2,5,31,'2025-11-28 06:09:00','1.6.0'),
('prod-web-12','x86_64','X11DPH-T','Supermicro','PROD-W012','Supermicro','PROD-W012C','COMPUTE','ACTIVE','PRODUCTION',2,4,2,5,32,'2025-11-28 06:10:00','1.6.0'),
('prod-web-13','x86_64','X11DPH-T','Supermicro','PROD-W013','Supermicro','PROD-W013C','COMPUTE','ACTIVE','PRODUCTION',2,4,2,4,15,'2025-11-28 06:11:00','1.6.0'),
('prod-web-14','x86_64','X11DPH-T','Supermicro','PROD-W014','Supermicro','PROD-W014C','COMPUTE','ACTIVE','PRODUCTION',2,4,2,4,16,'2025-11-28 06:12:00','1.6.0'),
('prod-web-15','x86_64','X11DPH-T','Supermicro','PROD-W015','Supermicro','PROD-W015C','COMPUTE','ACTIVE','PRODUCTION',2,4,2,4,17,'2025-11-28 06:13:00','1.6.0'),

-- --- ADDITIONAL PROD API (cluster=2, sub=5, dc=2) ---
('prod-api-09','x86_64','X11DPH-T','Supermicro','PROD-A009','Supermicro','PROD-A009C','COMPUTE','ACTIVE','PRODUCTION',2,5,2,4,18,'2025-11-28 06:18:00','1.6.0'),
('prod-api-10','x86_64','X11DPH-T','Supermicro','PROD-A010','Supermicro','PROD-A010C','COMPUTE','ACTIVE','PRODUCTION',2,5,2,4,19,'2025-11-28 06:19:00','1.6.0'),
('prod-api-11','x86_64','X11DPH-T','Supermicro','PROD-A011','Supermicro','PROD-A011C','COMPUTE','ACTIVE','PRODUCTION',2,5,2,4,20,'2025-11-28 06:20:00','1.6.0'),
('prod-api-12','x86_64','X11DPH-T','Supermicro','PROD-A012','Supermicro','PROD-A012C','COMPUTE','ACTIVE','PRODUCTION',2,5,2,4,21,'2025-11-28 06:21:00','1.6.0'),

-- --- ADDITIONAL DR COMPUTE (cluster=3, sub=8, dc=3) ---
('dr-compute-08','x86_64','PowerEdge R640','Dell','DR-C008','Dell','DR-C008C','COMPUTE','ACTIVE','PRODUCTION',3,8,3,7,8,'2025-11-28 07:07:00','1.6.0'),
('dr-compute-09','x86_64','PowerEdge R640','Dell','DR-C009','Dell','DR-C009C','COMPUTE','ACTIVE','PRODUCTION',3,8,3,7,9,'2025-11-28 07:08:00','1.6.0'),
('dr-compute-10','x86_64','PowerEdge R640','Dell','DR-C010','Dell','DR-C010C','COMPUTE','ACTIVE','PRODUCTION',3,8,3,7,10,'2025-11-28 07:09:00','1.6.0'),

-- --- ADDITIONAL DEV MANAGEMENT (cluster=1, sub=3, dc=1) ---
('dev-mgmt-01','x86_64','ProLiant DL380 Gen10 Plus','HPE','DEV-M001','HPE','DEV-M001C','BAREMETAL','ACTIVE','DEVELOPMENT',1,3,1,1,14,'2025-11-28 08:20:00','1.5.0'),
('dev-mgmt-02','x86_64','ProLiant DL380 Gen10 Plus','HPE','DEV-M002','HPE','DEV-M002C','BAREMETAL','ACTIVE','DEVELOPMENT',1,3,1,1,15,'2025-11-28 08:21:00','1.5.0'),
('dev-mgmt-03','x86_64','ProLiant DL380 Gen10 Plus','HPE','DEV-M003','HPE','DEV-M003C','BAREMETAL','ACTIVE','DEVELOPMENT',1,3,1,1,16,'2025-11-28 08:22:00','1.5.0'),

-- --- MAINTENANCE / STAGING SERVERS (no cluster, dc=1 or dc=2) ---
('maint-net-01','x86_64','X11SPH-nCTF','ASRock Rack','MNT-N001','ASRock Rack','MNT-N001C','BAREMETAL','MAINTENANCE','TESTING',0,0,1,2,13,'2025-11-27 14:00:00','1.4.8'),
('maint-net-02','x86_64','X11SPH-nCTF','ASRock Rack','MNT-N002','ASRock Rack','MNT-N002C','BAREMETAL','MAINTENANCE','TESTING',0,0,1,2,14,'2025-11-27 14:10:00','1.4.8'),
('maint-bm-01','x86_64','X11SPH-nCTF','ASRock Rack','MNT-B001','ASRock Rack','MNT-B001C','BAREMETAL','MAINTENANCE','TESTING',0,0,2,4,22,'2025-11-27 13:00:00','1.4.8');

-- ===================================================================
-- SERVER MOTHERBOARDS (one per server, IDs 8-107)
-- Mapping: Dell=mb_id 2, HPE=mb_id 3, Supermicro=mb_id 1,
--          ASUS=mb_id 5, ASRock=mb_id 4
-- ===================================================================
INSERT IGNORE INTO server_motherboards (server_id, component_motherboard_id, serial_number, bios_vendor, bios_version, bios_release_date)
SELECT s.server_id,
    CASE s.manufacturer
        WHEN 'Dell'        THEN 2
        WHEN 'HPE'         THEN 3
        WHEN 'Supermicro'  THEN 1
        WHEN 'ASUS'        THEN 5
        WHEN 'ASRock Rack' THEN 4
        ELSE 2
    END,
    CONCAT(s.serial_number, 'MB'),
    CASE s.manufacturer
        WHEN 'Dell'        THEN 'Dell Inc.'
        WHEN 'HPE'         THEN 'HPE'
        WHEN 'Supermicro'  THEN 'American Megatrends Inc.'
        WHEN 'ASUS'        THEN 'American Megatrends Inc.'
        WHEN 'ASRock Rack' THEN 'American Megatrends Inc.'
        ELSE 'American Megatrends Inc.'
    END,
    CASE s.manufacturer
        WHEN 'Dell'        THEN 'v2.15.0'
        WHEN 'HPE'         THEN 'U46'
        WHEN 'Supermicro'  THEN '3.3a'
        WHEN 'ASUS'        THEN '3801'
        WHEN 'ASRock Rack' THEN '3.20'
        ELSE '2.0'
    END,
    CASE s.manufacturer
        WHEN 'Dell'        THEN '2023-03-15'
        WHEN 'HPE'         THEN '2023-01-20'
        WHEN 'Supermicro'  THEN '2022-12-10'
        WHEN 'ASUS'        THEN '2023-05-01'
        WHEN 'ASRock Rack' THEN '2023-08-15'
        ELSE '2023-01-01'
    END
FROM servers s
WHERE s.server_id BETWEEN 8 AND 107;

-- ===================================================================
-- SERVER CPUS (dual socket configs per server)
-- CPU selection:
--   Dell compute/storage -> cpu_id 1 (Intel E5-2690v4)
--   Dell DR servers      -> cpu_id 2 (Intel E5-2680v4)
--   HPE servers          -> cpu_id 3 (Intel Silver 4214)
--   Supermicro PROD/STG  -> cpu_id 4 (AMD EPYC 7702P)
--   ASUS QA servers      -> cpu_id 5 (AMD EPYC 7543)
--   ASRock Dev/GPU       -> cpu_id 5 (AMD EPYC 7543)
--   ASRock Maint         -> cpu_id 4 (AMD EPYC 7702P)
-- ===================================================================
INSERT IGNORE INTO server_cpus (server_id, component_cpu_id, socket_number, slot)
SELECT s.server_id,
    CASE
        WHEN s.manufacturer = 'Dell'        AND s.cluster_id IN (1)  THEN 1
        WHEN s.manufacturer = 'Dell'        AND s.cluster_id IN (3)  THEN 2
        WHEN s.manufacturer = 'Dell'        AND s.cluster_id = 0     THEN 1
        WHEN s.manufacturer = 'HPE'                                   THEN 3
        WHEN s.manufacturer = 'Supermicro'                            THEN 4
        WHEN s.manufacturer = 'ASUS'                                  THEN 5
        WHEN s.manufacturer = 'ASRock Rack' AND s.sub_cluster_id = 14 THEN 5
        WHEN s.manufacturer = 'ASRock Rack'                           THEN 4
        ELSE 1
    END,
    0, 'CPU0'
FROM servers s
WHERE s.server_id BETWEEN 8 AND 107;

INSERT IGNORE INTO server_cpus (server_id, component_cpu_id, socket_number, slot)
SELECT s.server_id,
    CASE
        WHEN s.manufacturer = 'Dell'        AND s.cluster_id IN (1)  THEN 1
        WHEN s.manufacturer = 'Dell'        AND s.cluster_id IN (3)  THEN 2
        WHEN s.manufacturer = 'Dell'        AND s.cluster_id = 0     THEN 1
        WHEN s.manufacturer = 'HPE'                                   THEN 3
        WHEN s.manufacturer = 'Supermicro'                            THEN 4
        WHEN s.manufacturer = 'ASUS'                                  THEN 5
        WHEN s.manufacturer = 'ASRock Rack' AND s.sub_cluster_id = 14 THEN 5
        WHEN s.manufacturer = 'ASRock Rack'                           THEN 4
        ELSE 1
    END,
    1, 'CPU1'
FROM servers s
WHERE s.server_id BETWEEN 8 AND 107;

-- ===================================================================
-- SERVER MEMORY (8 DIMMs per server)
-- Memory selection:
--   Dell/PROD/STG   -> memory_id 4 (Kingston 32GB)
--   Dell/DEV/DR     -> memory_id 1 (Samsung 16GB)
--   HPE             -> memory_id 3 (Micron 16GB)
--   Supermicro PROD -> memory_id 2 (Samsung 32GB)  
--   Supermicro STG  -> memory_id 5 (Crucial 32GB)
--   ASUS/ASRock     -> memory_id 4 (Kingston 32GB)
-- ===================================================================
INSERT IGNORE INTO server_memory_dimms (server_id, component_memory_id, slot, serial_number)
SELECT s.server_id,
    CASE
        WHEN s.manufacturer = 'Dell'       AND s.cluster_id IN (1)      THEN 1
        WHEN s.manufacturer = 'Dell'       AND s.cluster_id = 0         THEN 1
        WHEN s.manufacturer = 'Dell'       AND s.cluster_id IN (2,3)    THEN 4
        WHEN s.manufacturer = 'HPE'                                      THEN 3
        WHEN s.manufacturer = 'Supermicro' AND s.cluster_id = 2         THEN 2
        WHEN s.manufacturer = 'Supermicro' AND s.cluster_id = 5         THEN 5
        WHEN s.manufacturer IN ('ASUS','ASRock Rack')                    THEN 4
        ELSE 1
    END,
    d.slot,
    CONCAT('MEM-', LPAD(s.server_id, 3, '0'), '-', d.slot)
FROM servers s
JOIN (
    SELECT 'DIMM0' AS slot UNION ALL SELECT 'DIMM1' UNION ALL SELECT 'DIMM2' UNION ALL SELECT 'DIMM3'
    UNION ALL SELECT 'DIMM4' UNION ALL SELECT 'DIMM5' UNION ALL SELECT 'DIMM6' UNION ALL SELECT 'DIMM7'
) d ON TRUE
WHERE s.server_id BETWEEN 8 AND 107;

-- ===================================================================
-- SERVER DISKS
-- All servers get: 2x NVMe OS drives + 2x additional data drives
-- Compute: 2x Samsung 980 PRO NVMe + 2x Intel SSD S4510
-- Storage: 2x Samsung 980 PRO NVMe + 4x Seagate HDD
-- GPU:     2x Samsung 980 PRO NVMe + 2x Crucial MX500
-- Mgmt/Maint: 2x Intel SSD S4510 + 2x Seagate HDD
-- ===================================================================
INSERT IGNORE INTO server_disks (server_id, component_disk_id, name, dev_path, serial, smart_health)
SELECT s.server_id,
    3,  -- Samsung 980 PRO NVMe
    'nvme0', '/dev/nvme0n1',
    CONCAT('NVME0-', LPAD(s.server_id, 3, '0')),
    'healthy'
FROM servers s WHERE s.server_id BETWEEN 8 AND 107;

INSERT IGNORE INTO server_disks (server_id, component_disk_id, name, dev_path, serial, smart_health)
SELECT s.server_id,
    3,  -- Samsung 980 PRO NVMe
    'nvme1', '/dev/nvme1n1',
    CONCAT('NVME1-', LPAD(s.server_id, 3, '0')),
    'healthy'
FROM servers s WHERE s.server_id BETWEEN 8 AND 107;

-- Data disk A (SDA) - type varies by role
INSERT IGNORE INTO server_disks (server_id, component_disk_id, name, dev_path, serial, smart_health)
SELECT s.server_id,
    CASE
        WHEN s.server_type = 'STORAGE'                       THEN 1  -- Seagate HDD
        WHEN s.server_type = 'COMPUTE' AND s.sub_cluster_id = 14 THEN 5  -- Crucial SSD (GPU servers)
        WHEN s.server_type = 'COMPUTE'                       THEN 4  -- Intel SSD
        WHEN s.server_type = 'BAREMETAL'                     THEN 1  -- Seagate HDD
        ELSE 4
    END,
    'sda', '/dev/sda',
    CONCAT('SDA-', LPAD(s.server_id, 3, '0')),
    'healthy'
FROM servers s WHERE s.server_id BETWEEN 8 AND 107;

-- Data disk B (SDB)
INSERT IGNORE INTO server_disks (server_id, component_disk_id, name, dev_path, serial, smart_health)
SELECT s.server_id,
    CASE
        WHEN s.server_type = 'STORAGE'                       THEN 1  -- Seagate HDD
        WHEN s.server_type = 'COMPUTE' AND s.sub_cluster_id = 14 THEN 5  -- Crucial SSD (GPU servers)
        WHEN s.server_type = 'COMPUTE'                       THEN 4  -- Intel SSD
        WHEN s.server_type = 'BAREMETAL'                     THEN 1  -- Seagate HDD
        ELSE 4
    END,
    'sdb', '/dev/sdb',
    CONCAT('SDB-', LPAD(s.server_id, 3, '0')),
    'healthy'
FROM servers s WHERE s.server_id BETWEEN 8 AND 107;

-- Extra HDD for storage servers (SDC, SDD)
INSERT IGNORE INTO server_disks (server_id, component_disk_id, name, dev_path, serial, smart_health)
SELECT s.server_id, 1, 'sdc', '/dev/sdc', CONCAT('SDC-', LPAD(s.server_id, 3, '0')), 'healthy'
FROM servers s WHERE s.server_id BETWEEN 8 AND 107 AND s.server_type = 'STORAGE';

INSERT IGNORE INTO server_disks (server_id, component_disk_id, name, dev_path, serial, smart_health)
SELECT s.server_id, 2, 'sdd', '/dev/sdd', CONCAT('SDD-', LPAD(s.server_id, 3, '0')), 'healthy'
FROM servers s WHERE s.server_id BETWEEN 8 AND 107 AND s.server_type = 'STORAGE';

-- ===================================================================
-- SERVER GPUS
-- GPU servers (sub_cluster_id=14 = dev-gpu-*): 2x Tesla V100 each
-- Production compute (cluster_id=2, server_type=COMPUTE): 1x RTX 3080
-- DR compute: 1x Quadro RTX 5000
-- All others: no GPU (omitted)
-- ===================================================================
INSERT IGNORE INTO server_gpus (server_id, component_gpu_id, pci_address, driver_version, uuid)
SELECT s.server_id,
    2,  -- Tesla V100 32GB
    CONCAT('0000:', LPAD(HEX(s.server_id * 2), 2, '0'), ':00.0'),
    '525.105.17',
    CONCAT('GPU-V100-', LPAD(s.server_id, 3, '0'), '-0')
FROM servers s
WHERE s.server_id BETWEEN 8 AND 107 AND s.sub_cluster_id = 14;

INSERT IGNORE INTO server_gpus (server_id, component_gpu_id, pci_address, driver_version, uuid)
SELECT s.server_id,
    2,  -- Tesla V100 32GB (second GPU)
    CONCAT('0000:', LPAD(HEX(s.server_id * 2 + 1), 2, '0'), ':00.0'),
    '525.105.17',
    CONCAT('GPU-V100-', LPAD(s.server_id, 3, '0'), '-1')
FROM servers s
WHERE s.server_id BETWEEN 8 AND 107 AND s.sub_cluster_id = 14;

INSERT IGNORE INTO server_gpus (server_id, component_gpu_id, pci_address, driver_version, uuid)
SELECT s.server_id,
    1,  -- RTX 3080 10GB
    CONCAT('0000:', LPAD(HEX(s.server_id), 2, '0'), ':00.0'),
    '525.105.17',
    CONCAT('GPU-RTX3080-', LPAD(s.server_id, 3, '0'))
FROM servers s
WHERE s.server_id BETWEEN 8 AND 107
  AND s.cluster_id = 2
  AND s.server_type = 'COMPUTE';

INSERT IGNORE INTO server_gpus (server_id, component_gpu_id, pci_address, driver_version, uuid)
SELECT s.server_id,
    3,  -- Quadro RTX 5000 16GB
    CONCAT('0000:', LPAD(HEX(s.server_id), 2, '0'), ':00.0'),
    '525.105.17',
    CONCAT('GPU-QRTX5K-', LPAD(s.server_id, 3, '0'))
FROM servers s
WHERE s.server_id BETWEEN 8 AND 107 AND s.cluster_id = 3;

-- ===================================================================
-- SERVER NETWORK INTERFACES (primary interface per server)
-- Network card selection:
--   Supermicro PROD   -> Mellanox CX-4 25G (nic_id=4)
--   Dell compute/dev  -> Intel I350 1G (nic_id=1)
--   Dell DR           -> Intel X710 10G (nic_id=2)
--   HPE               -> Broadcom BCM5720 (nic_id=3)
--   ASUS/ASRock       -> Mellanox CX-4 25G (nic_id=4)
-- IP scheme: dev=192.168.1.x, prod=10.0.1.x, dr=10.10.1.x, qa=192.168.2.x, stage=10.0.2.x
-- MACs are deterministically generated from server_id
-- ===================================================================
INSERT IGNORE INTO server_network_interfaces (
    server_id, component_network_id, interface_type, name, mac_address, ip_address, speed_mbps, is_primary, switch_port_id
)
SELECT s.server_id,
    CASE
        WHEN s.manufacturer = 'Supermicro'                           THEN 4
        WHEN s.manufacturer = 'Dell'   AND s.cluster_id IN (1,0)    THEN 1
        WHEN s.manufacturer = 'Dell'   AND s.cluster_id IN (2)      THEN 2
        WHEN s.manufacturer = 'Dell'   AND s.cluster_id IN (3)      THEN 2
        WHEN s.manufacturer = 'HPE'                                  THEN 3
        WHEN s.manufacturer IN ('ASUS','ASRock Rack')                THEN 4
        ELSE 1
    END,
    'REGULAR',
    'ens3f0',
    CONCAT(
        LPAD(HEX(MOD(s.server_id, 256)), 2, '0'), ':',
        LPAD(HEX(MOD(s.server_id * 3, 256)), 2, '0'), ':',
        LPAD(HEX(MOD(s.server_id * 7, 256)), 2, '0'), ':',
        LPAD(HEX(MOD(s.server_id * 11, 256)), 2, '0'), ':',
        LPAD(HEX(MOD(s.server_id * 13, 256)), 2, '0'), ':',
        LPAD(HEX(MOD(s.server_id * 17, 256)), 2, '0')
    ),
    CASE
        WHEN s.environment_type = 'DEVELOPMENT'               THEN CONCAT('192.168.1.', s.server_id)
        WHEN s.environment_type = 'PRODUCTION' AND s.cluster_id = 2 THEN CONCAT('10.0.1.', s.server_id)
        WHEN s.environment_type = 'PRODUCTION' AND s.cluster_id = 3 THEN CONCAT('10.10.1.', s.server_id)
        WHEN s.environment_type = 'QA'                        THEN CONCAT('192.168.2.', s.server_id)
        WHEN s.environment_type = 'STAGING'                   THEN CONCAT('10.0.2.', s.server_id)
        WHEN s.environment_type = 'TESTING'                   THEN CONCAT('192.168.200.', s.server_id)
        ELSE NULL
    END,
    CASE
        WHEN s.manufacturer = 'Supermicro'                           THEN 25000
        WHEN s.manufacturer = 'Dell'   AND s.cluster_id IN (1,0)    THEN 1000
        WHEN s.manufacturer = 'Dell'   AND s.cluster_id IN (2,3)    THEN 10000
        WHEN s.manufacturer = 'HPE'                                  THEN 1000
        WHEN s.manufacturer IN ('ASUS','ASRock Rack')                THEN 25000
        ELSE 1000
    END,
    TRUE,
    NULL
FROM servers s
WHERE s.server_id BETWEEN 8 AND 107;

-- Secondary NIC for production/staging servers
INSERT IGNORE INTO server_network_interfaces (
    server_id, component_network_id, interface_type, name, mac_address, ip_address, speed_mbps, is_primary, switch_port_id
)
SELECT s.server_id,
    CASE
        WHEN s.manufacturer = 'Supermicro'    THEN 4
        WHEN s.manufacturer = 'Dell'          THEN 2
        WHEN s.manufacturer = 'HPE'           THEN 3
        ELSE 4
    END,
    'REGULAR',
    'ens3f1',
    CONCAT(
        LPAD(HEX(MOD(s.server_id + 128, 256)), 2, '0'), ':',
        LPAD(HEX(MOD(s.server_id * 3 + 1, 256)), 2, '0'), ':',
        LPAD(HEX(MOD(s.server_id * 7 + 1, 256)), 2, '0'), ':',
        LPAD(HEX(MOD(s.server_id * 11 + 1, 256)), 2, '0'), ':',
        LPAD(HEX(MOD(s.server_id * 13 + 1, 256)), 2, '0'), ':',
        LPAD(HEX(MOD(s.server_id * 17 + 1, 256)), 2, '0')
    ),
    NULL,
    CASE
        WHEN s.manufacturer = 'Supermicro'    THEN 25000
        WHEN s.manufacturer = 'Dell'          THEN 10000
        WHEN s.manufacturer = 'HPE'           THEN 1000
        ELSE 25000
    END,
    FALSE,
    NULL
FROM servers s
WHERE s.server_id BETWEEN 8 AND 107
  AND s.environment_type IN ('PRODUCTION', 'STAGING', 'QA');

-- ===================================================================
-- SERVER BMC INTERFACES
-- BMC selection mirrors motherboard/manufacturer:
--   Dell       -> iDRAC9 (bmc_id=2)
--   HPE        -> iLO5 (bmc_id=3)
--   Supermicro -> ASPEED AST2500 (bmc_id=1)
--   ASUS       -> Generic AST2400 (bmc_id=6)
--   ASRock     -> ASPEED AST2500 (bmc_id=4)
-- BMC IPs: separate management network per environment
-- ===================================================================
INSERT IGNORE INTO server_bmc_interfaces (
    server_id, component_bmc_id, name, mac_address, ip_address,
    username, password, switch_port_id, firmware_version, release_date
)
SELECT s.server_id,
    CASE s.manufacturer
        WHEN 'Dell'        THEN 2
        WHEN 'HPE'         THEN 3
        WHEN 'Supermicro'  THEN 1
        WHEN 'ASUS'        THEN 6
        WHEN 'ASRock Rack' THEN 4
        ELSE 6
    END,
    'bmc0',
    CONCAT(
        'A0:',
        LPAD(HEX(MOD(s.server_id, 256)), 2, '0'), ':',
        LPAD(HEX(MOD(s.server_id * 5, 256)), 2, '0'), ':',
        LPAD(HEX(MOD(s.server_id * 9, 256)), 2, '0'), ':',
        LPAD(HEX(MOD(s.server_id * 19, 256)), 2, '0'), ':',
        LPAD(HEX(MOD(s.server_id * 23, 256)), 2, '0')
    ),
    CASE
        WHEN s.environment_type = 'DEVELOPMENT'  THEN CONCAT('192.168.100.', s.server_id)
        WHEN s.environment_type = 'PRODUCTION'   THEN CONCAT('10.0.100.', s.server_id)
        WHEN s.environment_type = 'QA'           THEN CONCAT('192.168.110.', s.server_id)
        WHEN s.environment_type = 'STAGING'      THEN CONCAT('10.0.110.', s.server_id)
        WHEN s.environment_type = 'TESTING'      THEN CONCAT('192.168.200.', s.server_id)
        ELSE CONCAT('10.10.100.', s.server_id)
    END,
    'ADMIN',
    CASE
        WHEN s.environment_type = 'DEVELOPMENT'  THEN 'BMCDev123!'
        WHEN s.environment_type = 'PRODUCTION'   THEN 'BMCProd789#'
        WHEN s.environment_type = 'QA'           THEN 'BMCQa456$'
        WHEN s.environment_type = 'STAGING'      THEN 'BMCStage312%'
        WHEN s.environment_type = 'TESTING'      THEN 'BMCMaint999@'
        ELSE 'BMCDefault000!'
    END,
    NULL,
    CASE s.manufacturer
        WHEN 'Dell'        THEN '6.10.30.00'
        WHEN 'HPE'         THEN '2.78'
        WHEN 'Supermicro'  THEN '1.73.14'
        WHEN 'ASUS'        THEN '1.40.05'
        WHEN 'ASRock Rack' THEN '1.25.02'
        ELSE '1.40.05'
    END,
    CASE s.manufacturer
        WHEN 'Dell'        THEN '2023-02-01'
        WHEN 'HPE'         THEN '2023-01-01'
        WHEN 'Supermicro'  THEN '2022-11-15'
        WHEN 'ASUS'        THEN '2023-04-15'
        WHEN 'ASRock Rack' THEN '2023-07-20'
        ELSE '2023-01-01'
    END
FROM servers s
WHERE s.server_id BETWEEN 8 AND 107;

-- ===================================================================
-- SERVER CREDENTIALS (OS authentication)
-- ===================================================================
INSERT IGNORE INTO server_credentials (server_id, credential_type, username, password)
SELECT s.server_id,
    'OS',
    CASE
        WHEN s.environment_type = 'TESTING' THEN 'maintenance'
        ELSE 'admin'
    END,
    CASE
        WHEN s.environment_type = 'DEVELOPMENT' THEN 'DevPass123!'
        WHEN s.environment_type = 'PRODUCTION'  THEN 'ProdSecure789#'
        WHEN s.environment_type = 'QA'          THEN 'QaPass456$'
        WHEN s.environment_type = 'STAGING'     THEN 'StagePass312%'
        WHEN s.environment_type = 'TESTING'     THEN 'MaintPass999@'
        ELSE 'DefaultPass000!'
    END
FROM servers s
WHERE s.server_id BETWEEN 8 AND 107;
