use crate::cli::VmCommands;
use crate::output::output_data;
use serde::{Deserialize, Serialize};
use std::io::{self, Write};
use std::process::Command;

#[derive(Debug, Serialize, Deserialize)]
struct VmInfo {
    name: String,
    state: String,
    id: Option<String>,
    uuid: Option<String>,
}

pub fn handle_vm_command(cmd: &VmCommands) -> Result<(), Box<dyn std::error::Error>> {
    match cmd {
        VmCommands::List { hypervisor, format } => {
            list_vms(hypervisor, format)?;
        }
        
        VmCommands::Start { name, hypervisor } => {
            start_vm(name, hypervisor)?;
        }
        
        VmCommands::Stop { name, hypervisor, force } => {
            stop_vm(name, hypervisor, *force)?;
        }
        
        VmCommands::Create { 
            name, 
            hypervisor, 
            vcpus, 
            memory, 
            disk, 
            os_variant, 
            iso, 
            network 
        } => {
            create_vm(name, hypervisor, *vcpus, *memory, *disk, os_variant.as_deref(), iso.as_deref(), network)?;
        }
        
        VmCommands::Delete { name, hypervisor, remove_storage, yes } => {
            delete_vm(name, hypervisor, *remove_storage, *yes)?;
        }
        
        VmCommands::Status { name, hypervisor, format } => {
            vm_status(name, hypervisor, format)?;
        }
        
        VmCommands::Reboot { name, hypervisor, force } => {
            reboot_vm(name, hypervisor, *force)?;
        }
    }
    Ok(())
}

fn list_vms(hypervisor: &str, format: &str) -> Result<(), Box<dyn std::error::Error>> {
    match hypervisor {
        "kvm" | "qemu" => {
            println!("Listing VMs via virsh...");
            let output = Command::new("virsh")
                .args(&["list", "--all"])
                .output()?;
            
            if !output.status.success() {
                return Err(format!("virsh command failed: {}", String::from_utf8_lossy(&output.stderr)).into());
            }
            
            let stdout = String::from_utf8_lossy(&output.stdout);
            
            if format == "pretty" {
                println!("{}", stdout);
            } else {
                // Parse and format as JSON/YAML
                let vms = parse_virsh_list(&stdout)?;
                output_data(&vms, format)?;
            }
        }
        
        "virtualbox" => {
            println!("Listing VMs via VBoxManage...");
            let output = Command::new("VBoxManage")
                .args(&["list", "vms", "--long"])
                .output()?;
            
            if !output.status.success() {
                return Err(format!("VBoxManage command failed: {}", String::from_utf8_lossy(&output.stderr)).into());
            }
            
            println!("{}", String::from_utf8_lossy(&output.stdout));
        }
        
        _ => {
            return Err(format!("Unsupported hypervisor: {}", hypervisor).into());
        }
    }
    
    Ok(())
}

fn start_vm(name: &str, hypervisor: &str) -> Result<(), Box<dyn std::error::Error>> {
    match hypervisor {
        "kvm" | "qemu" => {
            println!("Starting VM '{}' via virsh...", name);
            let output = Command::new("virsh")
                .args(&["start", name])
                .output()?;
            
            if output.status.success() {
                println!("✓ VM '{}' started successfully", name);
            } else {
                let error = String::from_utf8_lossy(&output.stderr);
                return Err(format!("Failed to start VM: {}", error).into());
            }
        }
        
        "virtualbox" => {
            println!("Starting VM '{}' via VBoxManage...", name);
            let output = Command::new("VBoxManage")
                .args(&["startvm", name, "--type", "headless"])
                .output()?;
            
            if output.status.success() {
                println!("✓ VM '{}' started successfully", name);
            } else {
                let error = String::from_utf8_lossy(&output.stderr);
                return Err(format!("Failed to start VM: {}", error).into());
            }
        }
        
        _ => {
            return Err(format!("Unsupported hypervisor: {}", hypervisor).into());
        }
    }
    
    Ok(())
}

fn stop_vm(name: &str, hypervisor: &str, force: bool) -> Result<(), Box<dyn std::error::Error>> {
    match hypervisor {
        "kvm" | "qemu" => {
            let action = if force { "destroy" } else { "shutdown" };
            println!("{} VM '{}' via virsh...", if force { "Forcing stop of" } else { "Shutting down" }, name);
            
            let output = Command::new("virsh")
                .args(&[action, name])
                .output()?;
            
            if output.status.success() {
                println!("✓ VM '{}' {} successfully", name, if force { "stopped" } else { "shutdown initiated" });
            } else {
                let error = String::from_utf8_lossy(&output.stderr);
                return Err(format!("Failed to stop VM: {}", error).into());
            }
        }
        
        "virtualbox" => {
            let action_type = if force { "poweroff" } else { "acpipowerbutton" };
            println!("{} VM '{}' via VBoxManage...", if force { "Forcing stop of" } else { "Shutting down" }, name);
            
            let output = Command::new("VBoxManage")
                .args(&["controlvm", name, action_type])
                .output()?;
            
            if output.status.success() {
                println!("✓ VM '{}' {} successfully", name, if force { "stopped" } else { "shutdown initiated" });
            } else {
                let error = String::from_utf8_lossy(&output.stderr);
                return Err(format!("Failed to stop VM: {}", error).into());
            }
        }
        
        _ => {
            return Err(format!("Unsupported hypervisor: {}", hypervisor).into());
        }
    }
    
    Ok(())
}

fn create_vm(
    name: &str,
    hypervisor: &str,
    vcpus: u32,
    memory: u32,
    disk: u32,
    os_variant: Option<&str>,
    iso: Option<&str>,
    network: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    match hypervisor {
        "kvm" | "qemu" => {
            println!("Creating VM '{}' via virt-install...", name);
            
            let mut args = vec![
                "--name".to_string(),
                name.to_string(),
                "--vcpus".to_string(),
                vcpus.to_string(),
                "--memory".to_string(),
                memory.to_string(),
                "--disk".to_string(),
                format!("size={}", disk),
            ];
            
            // Add OS variant if provided
            if let Some(os) = os_variant {
                args.push("--os-variant".to_string());
                args.push(os.to_string());
            }
            
            // Add ISO if provided
            if let Some(iso_path) = iso {
                args.push("--cdrom".to_string());
                args.push(iso_path.to_string());
            } else {
                args.push("--pxe".to_string());
            }
            
            // Add network
            if network != "none" {
                args.push("--network".to_string());
                if network == "default" {
                    args.push("network=default".to_string());
                } else {
                    args.push(format!("bridge={}", network));
                }
            }
            
            // Graphics and console
            args.push("--graphics".to_string());
            args.push("vnc,listen=0.0.0.0".to_string());
            args.push("--noautoconsole".to_string());
            
            let output = Command::new("virt-install")
                .args(&args)
                .output()?;
            
            if output.status.success() {
                println!("✓ VM '{}' created successfully", name);
                println!("{}", String::from_utf8_lossy(&output.stdout));
            } else {
                let error = String::from_utf8_lossy(&output.stderr);
                return Err(format!("Failed to create VM: {}", error).into());
            }
        }
        
        "virtualbox" => {
            println!("Creating VM '{}' via VBoxManage...", name);
            
            // Create the VM
            let output = Command::new("VBoxManage")
                .args(&["createvm", "--name", name, "--ostype", os_variant.unwrap_or("Linux_64"), "--register"])
                .output()?;
            
            if !output.status.success() {
                let error = String::from_utf8_lossy(&output.stderr);
                return Err(format!("Failed to create VM: {}", error).into());
            }
            
            // Configure VM
            Command::new("VBoxManage")
                .args(&["modifyvm", name, "--cpus", &vcpus.to_string(), "--memory", &memory.to_string()])
                .output()?;
            
            // Create disk
            let disk_path = format!("/var/lib/virtualbox/{}.vdi", name);
            Command::new("VBoxManage")
                .args(&["createhd", "--filename", &disk_path, "--size", &(disk * 1024).to_string()])
                .output()?;
            
            // Attach disk
            Command::new("VBoxManage")
                .args(&["storagectl", name, "--name", "SATA", "--add", "sata", "--controller", "IntelAhci"])
                .output()?;
                
            Command::new("VBoxManage")
                .args(&["storageattach", name, "--storagectl", "SATA", "--port", "0", "--device", "0", "--type", "hdd", "--medium", &disk_path])
                .output()?;
            
            println!("✓ VM '{}' created successfully", name);
        }
        
        _ => {
            return Err(format!("Unsupported hypervisor: {}", hypervisor).into());
        }
    }
    
    Ok(())
}

fn delete_vm(name: &str, hypervisor: &str, remove_storage: bool, yes: bool) -> Result<(), Box<dyn std::error::Error>> {
    if !yes {
        print!("Are you sure you want to delete VM '{}'? [y/N]: ", name);
        io::stdout().flush()?;
        
        let mut input = String::new();
        io::stdin().read_line(&mut input)?;
        
        if !input.trim().eq_ignore_ascii_case("y") {
            println!("Cancelled.");
            return Ok(());
        }
    }
    
    match hypervisor {
        "kvm" | "qemu" => {
            println!("Deleting VM '{}' via virsh...", name);
            
            // Stop VM if running
            let _ = Command::new("virsh")
                .args(&["destroy", name])
                .output();
            
            // Undefine with optional storage removal
            let mut args = vec!["undefine", name];
            if remove_storage {
                args.push("--remove-all-storage");
            }
            
            let output = Command::new("virsh")
                .args(&args)
                .output()?;
            
            if output.status.success() {
                println!("✓ VM '{}' deleted successfully", name);
            } else {
                let error = String::from_utf8_lossy(&output.stderr);
                return Err(format!("Failed to delete VM: {}", error).into());
            }
        }
        
        "virtualbox" => {
            println!("Deleting VM '{}' via VBoxManage...", name);
            
            // Stop VM if running
            let _ = Command::new("VBoxManage")
                .args(&["controlvm", name, "poweroff"])
                .output();
            
            // Wait a moment
            std::thread::sleep(std::time::Duration::from_secs(1));
            
            // Unregister and delete
            let mut args = vec!["unregistervm", name];
            if remove_storage {
                args.push("--delete");
            }
            
            let output = Command::new("VBoxManage")
                .args(&args)
                .output()?;
            
            if output.status.success() {
                println!("✓ VM '{}' deleted successfully", name);
            } else {
                let error = String::from_utf8_lossy(&output.stderr);
                return Err(format!("Failed to delete VM: {}", error).into());
            }
        }
        
        _ => {
            return Err(format!("Unsupported hypervisor: {}", hypervisor).into());
        }
    }
    
    Ok(())
}

fn vm_status(name: &str, hypervisor: &str, format: &str) -> Result<(), Box<dyn std::error::Error>> {
    match hypervisor {
        "kvm" | "qemu" => {
            println!("Getting status for VM '{}'...", name);
            let output = Command::new("virsh")
                .args(&["dominfo", name])
                .output()?;
            
            if !output.status.success() {
                return Err(format!("virsh command failed: {}", String::from_utf8_lossy(&output.stderr)).into());
            }
            
            let stdout = String::from_utf8_lossy(&output.stdout);
            
            if format == "pretty" {
                println!("{}", stdout);
            } else {
                // Parse and format as JSON/YAML
                let info = parse_virsh_dominfo(&stdout)?;
                output_data(&info, format)?;
            }
        }
        
        "virtualbox" => {
            println!("Getting status for VM '{}'...", name);
            let output = Command::new("VBoxManage")
                .args(&["showvminfo", name])
                .output()?;
            
            if !output.status.success() {
                return Err(format!("VBoxManage command failed: {}", String::from_utf8_lossy(&output.stderr)).into());
            }
            
            println!("{}", String::from_utf8_lossy(&output.stdout));
        }
        
        _ => {
            return Err(format!("Unsupported hypervisor: {}", hypervisor).into());
        }
    }
    
    Ok(())
}

fn reboot_vm(name: &str, hypervisor: &str, force: bool) -> Result<(), Box<dyn std::error::Error>> {
    match hypervisor {
        "kvm" | "qemu" => {
            let action = if force { "reset" } else { "reboot" };
            println!("{} VM '{}'...", if force { "Resetting" } else { "Rebooting" }, name);
            
            let output = Command::new("virsh")
                .args(&[action, name])
                .output()?;
            
            if output.status.success() {
                println!("✓ VM '{}' {} successfully", name, if force { "reset" } else { "reboot initiated" });
            } else {
                let error = String::from_utf8_lossy(&output.stderr);
                return Err(format!("Failed to reboot VM: {}", error).into());
            }
        }
        
        "virtualbox" => {
            let action_type = if force { "reset" } else { "acpireboot" };
            println!("{} VM '{}'...", if force { "Resetting" } else { "Rebooting" }, name);
            
            let output = Command::new("VBoxManage")
                .args(&["controlvm", name, action_type])
                .output()?;
            
            if output.status.success() {
                println!("✓ VM '{}' {} successfully", name, if force { "reset" } else { "reboot initiated" });
            } else {
                let error = String::from_utf8_lossy(&output.stderr);
                return Err(format!("Failed to reboot VM: {}", error).into());
            }
        }
        
        _ => {
            return Err(format!("Unsupported hypervisor: {}", hypervisor).into());
        }
    }
    
    Ok(())
}

// Helper function to parse virsh list output
fn parse_virsh_list(output: &str) -> Result<Vec<VmInfo>, Box<dyn std::error::Error>> {
    let mut vms = Vec::new();
    
    for line in output.lines().skip(2) { // Skip header lines
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() >= 3 {
            vms.push(VmInfo {
                id: Some(parts[0].to_string()),
                name: parts[1].to_string(),
                state: parts[2..].join(" "),
                uuid: None,
            });
        }
    }
    
    Ok(vms)
}

// Helper function to parse virsh dominfo output
fn parse_virsh_dominfo(output: &str) -> Result<serde_json::Value, Box<dyn std::error::Error>> {
    let mut info = serde_json::Map::new();
    
    for line in output.lines() {
        if let Some(pos) = line.find(':') {
            let key = line[..pos].trim().to_lowercase().replace(' ', "_");
            let value = line[pos + 1..].trim();
            info.insert(key, serde_json::Value::String(value.to_string()));
        }
    }
    
    Ok(serde_json::Value::Object(info))
}
