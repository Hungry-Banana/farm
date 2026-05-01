-- Move u_height from datacenter_rack_positions to servers.
-- A server knows its own physical size; rack positions are just slots.

ALTER TABLE servers
    ADD COLUMN u_height INT NOT NULL DEFAULT 1
        COMMENT 'Physical height of the server in rack units (U)';

ALTER TABLE datacenter_rack_positions
    DROP COLUMN u_height;

-- Fix status inconsistency: positions that have a server pointing at them should be OCCUPIED.
-- This handles seed data where servers.rack_position_id was set but the position row
-- still had status='AVAILABLE'.
UPDATE datacenter_rack_positions p
INNER JOIN servers s ON s.rack_position_id = p.rack_position_id
SET p.status = 'OCCUPIED',
    p.device_type = COALESCE(p.device_type, 'SERVER')
WHERE p.status IN ('AVAILABLE', 'RESERVED');
