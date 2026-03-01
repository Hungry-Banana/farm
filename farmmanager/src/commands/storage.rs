use crate::cli::HardwareCommands;
use crate::hardware::{collect_disks, types::DiskInfo};
use crate::output::output_data;
use std::process::Command;
use std::io::{self, Write};
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct PrimaryDiskInfo {
    pub name: String,
    pub dev_path: String,
    pub model: Option<String>,
    pub serial: Option<String>,
    pub size_bytes: Option<u64>,
    pub rotational: Option<bool>,
    pub bus_type: Option<String>,
    pub reason: String,
}

#[derive(Debug, Serialize)]
pub struct RaidCreationResult {
    pub success: bool,
    pub raid_device: String,
    pub message: String,
}

/// Get the primary disk based on size, speed, and device number
pub fn get_primary_disk() -> Option<PrimaryDiskInfo> {
    let disks = collect_disks();
    
    if disks.is_empty() {
        return None;
    }
    
    // Filter out invalid/non-physical disks
    let valid_disks: Vec<&DiskInfo> = disks.iter().filter(|disk| {
        // Must have a valid size > 0
        let has_valid_size = disk.size_bytes.unwrap_or(0) > 0;
        
        // Filter out common non-physical device identifiers
        let is_valid_model = if let Some(model) = &disk.model {
            let model_lower = model.to_lowercase();
            !model_lower.contains("massstorageclass") 
                && !model_lower.contains("flash drive")
                && !model_lower.contains("card reader")
        } else {
            true // If no model, allow it through
        };
        
        has_valid_size && is_valid_model
    }).collect();
    
    if valid_disks.is_empty() {
        return None;
    }
    
    // First, try to find the smallest, slowest drive
    // Priority: rotational HDD < SSD < NVMe
    // Within same type, smallest capacity wins
    // Within same capacity, lowest device number wins
    
    let mut best_disk: Option<&DiskInfo> = None;
    let mut best_reason = String::new();
    
    for disk in &valid_disks {
        if best_disk.is_none() {
            best_disk = Some(disk);
            best_reason = "First disk found".to_string();
            continue;
        }
        
        let current_best = best_disk.unwrap();
        
        // Compare by speed (rotational > non-rotational for "slowest")
        let current_rotational = current_best.rotational.unwrap_or(false);
        let disk_rotational = disk.rotational.unwrap_or(false);
        
        if disk_rotational && !current_rotational {
            // Rotational is slower, prefer it
            best_disk = Some(disk);
            best_reason = "Rotational HDD (slowest)".to_string();
            continue;
        } else if !disk_rotational && current_rotational {
            // Current is already rotational, keep it
            continue;
        }
        
        // If both are same type (both rotational or both not), compare size
        let current_size = current_best.size_bytes.unwrap_or(u64::MAX);
        let disk_size = disk.size_bytes.unwrap_or(u64::MAX);
        
        if disk_size < current_size {
            best_disk = Some(disk);
            best_reason = "Smallest capacity".to_string();
            continue;
        } else if disk_size > current_size {
            continue;
        }
        
        // If same size, compare device names (lowest number wins)
        if compare_device_names(&disk.name, &current_best.name) {
            best_disk = Some(disk);
            best_reason = "Lowest device number".to_string();
        }
    }
    
    best_disk.map(|disk| PrimaryDiskInfo {
        name: disk.name.clone(),
        dev_path: disk.dev_path.clone(),
        model: disk.model.clone(),
        serial: disk.serial.clone(),
        size_bytes: disk.size_bytes,
        rotational: disk.rotational,
        bus_type: disk.bus_type.clone(),
        reason: best_reason,
    })
}

/// Compare device names to determine which is "lower"
/// e.g., sda < sdb, nvme0 < nvme1, nvme0n1 < nvme1n1
fn compare_device_names(name1: &str, name2: &str) -> bool {
    // Extract the numeric parts for comparison
    let num1 = extract_device_number(name1);
    let num2 = extract_device_number(name2);
    
    // Compare by base name first (sda vs nvme, etc)
    let base1 = name1.chars().take_while(|c| !c.is_ascii_digit()).collect::<String>();
    let base2 = name2.chars().take_while(|c| !c.is_ascii_digit()).collect::<String>();
    
    if base1 != base2 {
        return base1 < base2;
    }
    
    // Same base, compare numbers
    num1 < num2
}

/// Extract the first number from a device name
fn extract_device_number(name: &str) -> u32 {
    let mut num_str = String::new();
    for c in name.chars() {
        if c.is_ascii_digit() {
            num_str.push(c);
        } else if !num_str.is_empty() {
            break;
        }
    }
    num_str.parse::<u32>().unwrap_or(0)
}

/// Create a software RAID array using mdadm
pub fn create_raid(
    level: &str,
    devices: &[String],
    name: &str,
    spares: Option<&Vec<String>>,
    skip_confirmation: bool,
) -> Result<RaidCreationResult, Box<dyn std::error::Error>> {
    // Validate RAID level
    let valid_levels = ["0", "1", "5", "6", "10"];
    if !valid_levels.contains(&level) {
        return Ok(RaidCreationResult {
            success: false,
            raid_device: String::new(),
            message: format!("Invalid RAID level: {}. Valid levels are: 0, 1, 5, 6, 10", level),
        });
    }
    
    // Validate minimum number of devices for each RAID level
    let min_devices = match level {
        "0" => 2,
        "1" => 2,
        "5" => 3,
        "6" => 4,
        "10" => 4,
        _ => 2,
    };
    
    if devices.len() < min_devices {
        return Ok(RaidCreationResult {
            success: false,
            raid_device: String::new(),
            message: format!("RAID {} requires at least {} devices, got {}", level, min_devices, devices.len()),
        });
    }
    
    // Check if mdadm is installed
    let mdadm_check = Command::new("which")
        .arg("mdadm")
        .output()?;
    
    if !mdadm_check.status.success() {
        return Ok(RaidCreationResult {
            success: false,
            raid_device: String::new(),
            message: "mdadm is not installed. Please install mdadm to create RAID arrays.".to_string(),
        });
    }
    
    let raid_device = format!("/dev/{}", name);
    
    // Confirmation prompt
    if !skip_confirmation {
        println!("\n⚠️  WARNING: Creating RAID array will DESTROY all data on the following devices:");
        for device in devices {
            println!("  - {}", device);
        }
        if let Some(spare_devs) = spares {
            if !spare_devs.is_empty() {
                println!("\nSpare devices:");
                for device in spare_devs {
                    println!("  - {}", device);
                }
            }
        }
        println!("\nRAID Configuration:");
        println!("  Level: RAID {}", level);
        println!("  Array: {}", raid_device);
        println!("  Devices: {}", devices.len());
        
        print!("\nType 'yes' to continue: ");
        io::stdout().flush()?;
        
        let mut input = String::new();
        io::stdin().read_line(&mut input)?;
        
        if input.trim().to_lowercase() != "yes" {
            return Ok(RaidCreationResult {
                success: false,
                raid_device: String::new(),
                message: "Operation cancelled by user".to_string(),
            });
        }
    }
    
    // Build mdadm command
    let mut args = vec![
        "--create".to_string(),
        raid_device.clone(),
        "--level".to_string(),
        level.to_string(),
        "--raid-devices".to_string(),
        devices.len().to_string(),
    ];
    
    // Add spare devices if specified
    if let Some(spare_devs) = spares {
        if !spare_devs.is_empty() {
            args.push("--spare-devices".to_string());
            args.push(spare_devs.len().to_string());
        }
    }
    
    // Add device paths
    for device in devices {
        args.push(device.clone());
    }
    
    // Add spare device paths
    if let Some(spare_devs) = spares {
        for device in spare_devs {
            args.push(device.clone());
        }
    }
    
    println!("\nCreating RAID array...");
    println!("Command: mdadm {}", args.join(" "));
    
    // Execute mdadm command
    let output = Command::new("mdadm")
        .args(&args)
        .output()?;
    
    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout);
        Ok(RaidCreationResult {
            success: true,
            raid_device: raid_device.clone(),
            message: format!("Successfully created RAID {} array at {}\n{}", level, raid_device, stdout),
        })
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        let stdout = String::from_utf8_lossy(&output.stdout);
        Ok(RaidCreationResult {
            success: false,
            raid_device: raid_device.clone(),
            message: format!("Failed to create RAID array:\nstdout: {}\nstderr: {}", stdout, stderr),
        })
    }
}

/// Handle hardware storage commands
pub fn handle_storage_command(cmd: &HardwareCommands) -> Result<(), Box<dyn std::error::Error>> {
    match cmd {
        HardwareCommands::PrimaryDisk { format } => {
            match get_primary_disk() {
                Some(disk) => {
                    output_data(&disk, format)?;
                }
                None => {
                    eprintln!("No disks found on this system");
                    return Err("No disks found".into());
                }
            }
        }
        HardwareCommands::CreateRaid { level, devices, name, spares, yes } => {
            let result = create_raid(
                level,
                devices,
                name,
                spares.as_ref(),
                *yes,
            )?;
            
            if result.success {
                println!("✓ {}", result.message);
            } else {
                eprintln!("✗ {}", result.message);
                return Err(result.message.into());
            }
        }
        _ => {
            return Err("Unsupported storage command".into());
        }
    }
    Ok(())
}
