use crate::cli::K8sCommands;
use crate::output::output_data;
use std::io::{self, Write};
use std::process::Command;
use serde::{Deserialize, Serialize};
use serde_json::Value;

pub fn handle_k8s_command(cmd: &K8sCommands) -> Result<(), Box<dyn std::error::Error>> {
    match cmd {
        K8sCommands::Pods { namespace, all_namespaces, format } => {
            list_pods(namespace.as_deref(), *all_namespaces, format)?;
        }
        
        K8sCommands::Deployments { namespace, all_namespaces, format } => {
            list_deployments(namespace.as_deref(), *all_namespaces, format)?;
        }
        
        K8sCommands::Services { namespace, all_namespaces, format } => {
            list_services(namespace.as_deref(), *all_namespaces, format)?;
        }
        
        K8sCommands::Nodes { format } => {
            list_nodes(format)?;
        }
        
        K8sCommands::Namespaces { format } => {
            list_namespaces(format)?;
        }
        
        K8sCommands::Apply { file, namespace } => {
            apply_manifest(file, namespace.as_deref())?;
        }
        
        K8sCommands::Delete { resource_type, name, namespace, yes } => {
            delete_resource(resource_type, name, namespace.as_deref(), *yes)?;
        }
        
        K8sCommands::Scale { name, replicas, namespace } => {
            scale_deployment(name, *replicas, namespace.as_deref())?;
        }
        
        K8sCommands::Logs { name, namespace, container, follow, tail } => {
            get_logs(name, namespace.as_deref(), container.as_deref(), *follow, *tail)?;
        }
        
        K8sCommands::Exec { name, namespace, container, command } => {
            exec_in_pod(name, namespace.as_deref(), container.as_deref(), command)?;
        }
        
        K8sCommands::ClusterInfo { format } => {
            cluster_info(format)?;
        }
        
        K8sCommands::Describe { resource_type, name, namespace } => {
            describe_resource(resource_type, name, namespace.as_deref())?;
        }
        
        K8sCommands::Inventory { format } => {
            let inventory = collect_k8s_inventory()?;
            output_data(&inventory, format)?;
        }
        
        K8sCommands::PostInventory { url } => {
            println!("Collecting Kubernetes cluster inventory...");
            let inventory = collect_k8s_inventory()?;
            
            let api_url = format!("{}/api/v1/k8s/inventory", url.trim_end_matches('/'));
            println!("Posting K8s inventory to: {}", api_url);
            
            let client = reqwest::blocking::Client::new();
            let response = client
                .post(&api_url)
                .json(&inventory)
                .send()?;
            
            if response.status().is_success() {
                let result: serde_json::Value = response.json()?;
                println!("✓ Success!");
                println!("{}", serde_json::to_string_pretty(&result)?);
            } else {
                let status = response.status();
                let error_text = response.text()?;
                eprintln!("✗ Error: HTTP {}", status);
                eprintln!("{}", error_text);
                return Err(format!("Failed to post K8s inventory: HTTP {}", status).into());
            }
        }
    }
    Ok(())
}

fn list_pods(namespace: Option<&str>, all_namespaces: bool, format: &str) -> Result<(), Box<dyn std::error::Error>> {
    let mut args = vec!["get", "pods"];
    
    if all_namespaces {
        args.push("--all-namespaces");
    } else if let Some(ns) = namespace {
        args.push("-n");
        args.push(ns);
    } else {
        args.push("--all-namespaces");
    }
    
    match format {
        "json" => args.push("-o=json"),
        "yaml" => args.push("-o=yaml"),
        "wide" => args.push("-o=wide"),
        _ => {} // default table format
    }
    
    execute_kubectl(&args, format)
}

fn list_deployments(namespace: Option<&str>, all_namespaces: bool, format: &str) -> Result<(), Box<dyn std::error::Error>> {
    let mut args = vec!["get", "deployments"];
    
    if all_namespaces {
        args.push("--all-namespaces");
    } else if let Some(ns) = namespace {
        args.push("-n");
        args.push(ns);
    } else {
        args.push("--all-namespaces");
    }
    
    match format {
        "json" => args.push("-o=json"),
        "yaml" => args.push("-o=yaml"),
        "wide" => args.push("-o=wide"),
        _ => {}
    }
    
    execute_kubectl(&args, format)
}

fn list_services(namespace: Option<&str>, all_namespaces: bool, format: &str) -> Result<(), Box<dyn std::error::Error>> {
    let mut args = vec!["get", "services"];
    
    if all_namespaces {
        args.push("--all-namespaces");
    } else if let Some(ns) = namespace {
        args.push("-n");
        args.push(ns);
    } else {
        args.push("--all-namespaces");
    }
    
    match format {
        "json" => args.push("-o=json"),
        "yaml" => args.push("-o=yaml"),
        "wide" => args.push("-o=wide"),
        _ => {}
    }
    
    execute_kubectl(&args, format)
}

fn list_nodes(format: &str) -> Result<(), Box<dyn std::error::Error>> {
    let mut args = vec!["get", "nodes"];
    
    match format {
        "json" => args.push("-o=json"),
        "yaml" => args.push("-o=yaml"),
        "wide" => args.push("-o=wide"),
        _ => {}
    }
    
    execute_kubectl(&args, format)
}

fn list_namespaces(format: &str) -> Result<(), Box<dyn std::error::Error>> {
    let mut args = vec!["get", "namespaces"];
    
    match format {
        "json" => args.push("-o=json"),
        "yaml" => args.push("-o=yaml"),
        _ => {}
    }
    
    execute_kubectl(&args, format)
}

fn apply_manifest(file: &str, namespace: Option<&str>) -> Result<(), Box<dyn std::error::Error>> {
    let mut args = vec!["apply", "-f", file];
    
    if let Some(ns) = namespace {
        args.push("-n");
        args.push(ns);
    }
    
    println!("Applying manifest from: {}", file);
    
    let output = Command::new("kubectl")
        .args(&args)
        .output()?;
    
    if output.status.success() {
        println!("✓ Manifest applied successfully");
        println!("{}", String::from_utf8_lossy(&output.stdout));
    } else {
        let error = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Failed to apply manifest: {}", error).into());
    }
    
    Ok(())
}

fn delete_resource(resource_type: &str, name: &str, namespace: Option<&str>, yes: bool) -> Result<(), Box<dyn std::error::Error>> {
    if !yes {
        print!("Are you sure you want to delete {} '{}'? [y/N]: ", resource_type, name);
        io::stdout().flush()?;
        
        let mut input = String::new();
        io::stdin().read_line(&mut input)?;
        
        if !input.trim().eq_ignore_ascii_case("y") {
            println!("Cancelled.");
            return Ok(());
        }
    }
    
    let mut args = vec!["delete", resource_type, name];
    
    if let Some(ns) = namespace {
        args.push("-n");
        args.push(ns);
    }
    
    println!("Deleting {} '{}'...", resource_type, name);
    
    let output = Command::new("kubectl")
        .args(&args)
        .output()?;
    
    if output.status.success() {
        println!("✓ {} '{}' deleted successfully", resource_type, name);
        println!("{}", String::from_utf8_lossy(&output.stdout));
    } else {
        let error = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Failed to delete resource: {}", error).into());
    }
    
    Ok(())
}

fn scale_deployment(name: &str, replicas: u32, namespace: Option<&str>) -> Result<(), Box<dyn std::error::Error>> {
    let replicas_str = replicas.to_string();
    let mut args = vec!["scale", "deployment", name, "--replicas", &replicas_str];
    
    if let Some(ns) = namespace {
        args.push("-n");
        args.push(ns);
    }
    
    println!("Scaling deployment '{}' to {} replicas...", name, replicas);
    
    let output = Command::new("kubectl")
        .args(&args)
        .output()?;
    
    if output.status.success() {
        println!("✓ Deployment '{}' scaled successfully", name);
        println!("{}", String::from_utf8_lossy(&output.stdout));
    } else {
        let error = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Failed to scale deployment: {}", error).into());
    }
    
    Ok(())
}

fn get_logs(name: &str, namespace: Option<&str>, container: Option<&str>, follow: bool, tail: Option<u32>) -> Result<(), Box<dyn std::error::Error>> {
    let mut args = vec!["logs", name];
    
    if let Some(ns) = namespace {
        args.push("-n");
        args.push(ns);
    }
    
    if let Some(c) = container {
        args.push("-c");
        args.push(c);
    }
    
    if follow {
        args.push("-f");
    }
    
    let tail_str;
    if let Some(t) = tail {
        args.push("--tail");
        tail_str = t.to_string();
        args.push(&tail_str);
    }
    
    println!("Getting logs for pod '{}'...", name);
    
    let output = Command::new("kubectl")
        .args(&args)
        .output()?;
    
    if output.status.success() {
        println!("{}", String::from_utf8_lossy(&output.stdout));
    } else {
        let error = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Failed to get logs: {}", error).into());
    }
    
    Ok(())
}

fn exec_in_pod(name: &str, namespace: Option<&str>, container: Option<&str>, command: &[String]) -> Result<(), Box<dyn std::error::Error>> {
    let mut args = vec!["exec", "-it", name];
    
    if let Some(ns) = namespace {
        args.push("-n");
        args.push(ns);
    }
    
    if let Some(c) = container {
        args.push("-c");
        args.push(c);
    }
    
    args.push("--");
    
    // Convert Vec<String> to Vec<&str>
    let cmd_refs: Vec<&str> = command.iter().map(|s| s.as_str()).collect();
    args.extend(cmd_refs);
    
    println!("Executing command in pod '{}'...", name);
    
    let status = Command::new("kubectl")
        .args(&args)
        .status()?;
    
    if !status.success() {
        return Err("Command execution failed".into());
    }
    
    Ok(())
}

fn cluster_info(format: &str) -> Result<(), Box<dyn std::error::Error>> {
    let args = if format == "json" || format == "yaml" {
        vec!["cluster-info", "dump"]
    } else {
        vec!["cluster-info"]
    };
    
    execute_kubectl(&args, format)
}

fn describe_resource(resource_type: &str, name: &str, namespace: Option<&str>) -> Result<(), Box<dyn std::error::Error>> {
    let mut args = vec!["describe", resource_type, name];
    
    if let Some(ns) = namespace {
        args.push("-n");
        args.push(ns);
    }
    
    println!("Describing {} '{}'...", resource_type, name);
    
    let output = Command::new("kubectl")
        .args(&args)
        .output()?;
    
    if output.status.success() {
        println!("{}", String::from_utf8_lossy(&output.stdout));
    } else {
        let error = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Failed to describe resource: {}", error).into());
    }
    
    Ok(())
}

fn execute_kubectl(args: &[&str], format: &str) -> Result<(), Box<dyn std::error::Error>> {
    let output = Command::new("kubectl")
        .args(args)
        .output()?;
    
    if !output.status.success() {
        let error = String::from_utf8_lossy(&output.stderr);
        return Err(format!("kubectl command failed: {}", error).into());
    }
    
    let stdout = String::from_utf8_lossy(&output.stdout);
    
    // For JSON/YAML, parse and use output_data
    if format == "json" {
        let json_value: serde_json::Value = serde_json::from_str(&stdout)?;
        output_data(&json_value, format)?;
    } else if format == "yaml" {
        // Just print YAML as-is
        println!("{}", stdout);
    } else {
        // Pretty/table format
        println!("{}", stdout);
    }
    
    Ok(())
}

// ===================================================================
// INVENTORY STRUCTURES (Matching Backend Schema)
// ===================================================================

#[derive(Debug, Serialize)]
struct K8sInventory {
    cluster_name: String,
    cluster_version: String,
    api_server: String,
    nodes: Vec<K8sNodeInventory>,
    namespaces: Vec<K8sNamespaceInventory>,
    pods: Option<Vec<K8sPodInventory>>,
    services: Option<Vec<K8sServiceInventory>>,
    workloads: Option<Vec<K8sWorkloadInventory>>,
}

#[derive(Debug, Serialize)]
struct K8sNodeInventory {
    node_name: String,
    node_uid: Option<String>,
    node_type: Option<String>,
    internal_ip: Option<String>,
    external_ip: Option<String>,
    hostname: Option<String>,
    cpu_capacity: Option<i32>,
    memory_capacity_mb: Option<i64>,
    pod_capacity: Option<i32>,
    node_state: Option<String>,
    kubelet_version: Option<String>,
    os_image: Option<String>,
    kernel_version: Option<String>,
    container_runtime_version: Option<String>,
    roles: Option<String>,
    labels: Option<serde_json::Value>,
    taints: Option<serde_json::Value>,
}

#[derive(Debug, Serialize)]
struct K8sNamespaceInventory {
    namespace_name: String,
    namespace_uid: Option<String>,
    namespace_state: Option<String>,
    labels: Option<serde_json::Value>,
    annotations: Option<serde_json::Value>,
}

#[derive(Debug, Serialize)]
struct K8sPodInventory {
    pod_name: String,
    pod_uid: Option<String>,
    namespace: String,
    pod_phase: Option<String>,
    node_name: Option<String>,
    pod_ip: Option<String>,
    host_ip: Option<String>,
    start_time: Option<String>,
    labels: Option<serde_json::Value>,
    annotations: Option<serde_json::Value>,
}

#[derive(Debug, Serialize)]
struct K8sServiceInventory {
    service_name: String,
    service_uid: Option<String>,
    namespace: String,
    service_type: Option<String>,
    cluster_ip: Option<String>,
    external_ip: Option<String>,
    ports: Option<serde_json::Value>,
    selector: Option<serde_json::Value>,
    labels: Option<serde_json::Value>,
}

#[derive(Debug, Serialize)]
struct K8sWorkloadInventory {
    workload_name: String,
    workload_uid: Option<String>,
    namespace: String,
    workload_type: String,
    replicas_desired: Option<i32>,
    replicas_ready: Option<i32>,
    replicas_available: Option<i32>,
    labels: Option<serde_json::Value>,
    selector: Option<serde_json::Value>,
}

// ===================================================================
// INVENTORY COLLECTION
// ===================================================================

fn collect_k8s_inventory() -> Result<K8sInventory, Box<dyn std::error::Error>> {
    println!("Collecting Kubernetes cluster inventory...");
    
    // Get cluster name from current context
    let cluster_name = get_cluster_name().unwrap_or_else(|| "unknown-cluster".to_string());
    
    // Get cluster version
    let cluster_version = get_cluster_version().unwrap_or_else(|| "unknown".to_string());
    
    // Get API server URL
    let api_server = get_api_server_url().unwrap_or_else(|| "unknown".to_string());
    
    // Collect nodes
    println!("  - Collecting nodes...");
    let nodes = collect_nodes()?;
    
    // Collect namespaces
    println!("  - Collecting namespaces...");
    let namespaces = collect_namespaces()?;
    
    // Collect pods
    println!("  - Collecting pods...");
    let pods = collect_pods().ok();
    
    // Collect services
    println!("  - Collecting services...");
    let services = collect_services().ok();
    
    // Collect workloads
    println!("  - Collecting workloads...");
    let workloads = collect_workloads().ok();
    
    println!("✓ Inventory collection complete");
    println!("  Cluster: {}", cluster_name);
    println!("  Version: {}", cluster_version);
    println!("  Nodes: {}", nodes.len());
    println!("  Namespaces: {}", namespaces.len());
    println!("  Pods: {}", pods.as_ref().map(|p| p.len()).unwrap_or(0));
    println!("  Services: {}", services.as_ref().map(|s| s.len()).unwrap_or(0));
    println!("  Workloads: {}", workloads.as_ref().map(|w| w.len()).unwrap_or(0));
    
    Ok(K8sInventory {
        cluster_name,
        cluster_version,
        api_server,
        nodes,
        namespaces,
        pods,
        services,
        workloads,
    })
}

fn get_cluster_name() -> Option<String> {
    let output = Command::new("kubectl")
        .args(["config", "current-context"])
        .output()
        .ok()?;
    
    if output.status.success() {
        Some(String::from_utf8_lossy(&output.stdout).trim().to_string())
    } else {
        None
    }
}

fn get_cluster_version() -> Option<String> {
    let output = Command::new("kubectl")
        .args(["version", "-o", "json", "--short"])
        .output()
        .ok()?;
    
    if !output.status.success() {
        return None;
    }
    
    let json_str = String::from_utf8_lossy(&output.stdout);
    if let Ok(json) = serde_json::from_str::<Value>(&json_str) {
        json["serverVersion"]["gitVersion"]
            .as_str()
            .map(|s| s.to_string())
    } else {
        None
    }
}

fn get_api_server_url() -> Option<String> {
    let output = Command::new("kubectl")
        .args(["cluster-info"])
        .output()
        .ok()?;
    
    if !output.status.success() {
        return None;
    }
    
    let text = String::from_utf8_lossy(&output.stdout);
    for line in text.lines() {
        if line.contains("control plane") || line.contains("master") {
            if let Some(url_start) = line.find("https://") {
                let url_part = &line[url_start..];
                if let Some(url_end) = url_part.find(char::is_whitespace) {
                    return Some(url_part[..url_end].to_string());
                } else {
                    return Some(url_part.to_string());
                }
            }
        }
    }
    None
}

fn collect_nodes() -> Result<Vec<K8sNodeInventory>, Box<dyn std::error::Error>> {
    let output = Command::new("kubectl")
        .args(["get", "nodes", "-o", "json"])
        .output()?;
    
    if !output.status.success() {
        return Ok(Vec::new());
    }
    
    let json_str = String::from_utf8_lossy(&output.stdout);
    let json: Value = serde_json::from_str(&json_str)?;
    
    let mut nodes = Vec::new();
    
    if let Some(items) = json["items"].as_array() {
        for item in items {
            let node_name = item["metadata"]["name"].as_str().unwrap_or("").to_string();
            let node_uid = item["metadata"]["uid"].as_str().map(|s| s.to_string());
            
            // Determine node type based on labels
            let labels = item["metadata"]["labels"].as_object();
            let node_type = labels.and_then(|l| {
                if l.contains_key("node-role.kubernetes.io/control-plane") || l.contains_key("node-role.kubernetes.io/master") {
                    Some("control-plane".to_string())
                } else {
                    Some("worker".to_string())
                }
            });
            
            let roles = labels.map(|l| {
                l.keys()
                    .filter(|k| k.starts_with("node-role.kubernetes.io/"))
                    .map(|k| k.strip_prefix("node-role.kubernetes.io/").unwrap_or(k))
                    .collect::<Vec<_>>()
                    .join(",")
            });
            
            // Get addresses
            let mut internal_ip = None;
            let mut external_ip = None;
            let mut hostname = None;
            
            if let Some(addresses) = item["status"]["addresses"].as_array() {
                for addr in addresses {
                    let addr_type = addr["type"].as_str().unwrap_or("");
                    let address = addr["address"].as_str().map(|s| s.to_string());
                    
                    match addr_type {
                        "InternalIP" => internal_ip = address,
                        "ExternalIP" => external_ip = address,
                        "Hostname" => hostname = address,
                        _ => {}
                    }
                }
            }
            
            // Get capacity
            let cpu_capacity = item["status"]["capacity"]["cpu"]
                .as_str()
                .and_then(|s| s.parse::<i32>().ok());
            
            let memory_capacity_mb = item["status"]["capacity"]["memory"]
                .as_str()
                .and_then(|s| {
                    if s.ends_with("Ki") {
                        s.strip_suffix("Ki")?.parse::<i64>().ok().map(|kb| kb / 1024)
                    } else if s.ends_with("Mi") {
                        s.strip_suffix("Mi")?.parse::<i64>().ok()
                    } else if s.ends_with("Gi") {
                        s.strip_suffix("Gi")?.parse::<i64>().ok().map(|gb| gb * 1024)
                    } else {
                        None
                    }
                });
            
            let pod_capacity = item["status"]["capacity"]["pods"]
                .as_str()
                .and_then(|s| s.parse::<i32>().ok());
            
            // Get node state
            let node_state = item["status"]["conditions"]
                .as_array()
                .and_then(|conditions| {
                    conditions.iter().find(|c| c["type"] == "Ready")
                })
                .and_then(|ready| ready["status"].as_str())
                .map(|s| if s == "True" { "Ready" } else { "NotReady" })
                .map(|s| s.to_string());
            
            // Get node info
            let kubelet_version = item["status"]["nodeInfo"]["kubeletVersion"]
                .as_str()
                .map(|s| s.to_string());
            
            let os_image = item["status"]["nodeInfo"]["osImage"]
                .as_str()
                .map(|s| s.to_string());
            
            let kernel_version = item["status"]["nodeInfo"]["kernelVersion"]
                .as_str()
                .map(|s| s.to_string());
            
            let container_runtime_version = item["status"]["nodeInfo"]["containerRuntimeVersion"]
                .as_str()
                .map(|s| s.to_string());
            
            // Get labels and taints as JSON
            let labels_json = item["metadata"]["labels"].clone();
            let taints_json = item["spec"]["taints"].clone();
            
            nodes.push(K8sNodeInventory {
                node_name,
                node_uid,
                node_type,
                internal_ip,
                external_ip,
                hostname,
                cpu_capacity,
                memory_capacity_mb,
                pod_capacity,
                node_state,
                kubelet_version,
                os_image,
                kernel_version,
                container_runtime_version,
                roles,
                labels: if labels_json.is_null() { None } else { Some(labels_json) },
                taints: if taints_json.is_null() { None } else { Some(taints_json) },
            });
        }
    }
    
    Ok(nodes)
}

fn collect_namespaces() -> Result<Vec<K8sNamespaceInventory>, Box<dyn std::error::Error>> {
    let output = Command::new("kubectl")
        .args(["get", "namespaces", "-o", "json"])
        .output()?;
    
    if !output.status.success() {
        return Ok(Vec::new());
    }
    
    let json_str = String::from_utf8_lossy(&output.stdout);
    let json: Value = serde_json::from_str(&json_str)?;
    
    let mut namespaces = Vec::new();
    
    if let Some(items) = json["items"].as_array() {
        for item in items {
            let namespace_name = item["metadata"]["name"].as_str().unwrap_or("").to_string();
            let namespace_uid = item["metadata"]["uid"].as_str().map(|s| s.to_string());
            let namespace_state = item["status"]["phase"].as_str().map(|s| s.to_string());
            
            let labels_json = item["metadata"]["labels"].clone();
            let annotations_json = item["metadata"]["annotations"].clone();
            
            namespaces.push(K8sNamespaceInventory {
                namespace_name,
                namespace_uid,
                namespace_state,
                labels: if labels_json.is_null() { None } else { Some(labels_json) },
                annotations: if annotations_json.is_null() { None } else { Some(annotations_json) },
            });
        }
    }
    
    Ok(namespaces)
}

fn collect_pods() -> Result<Vec<K8sPodInventory>, Box<dyn std::error::Error>> {
    let output = Command::new("kubectl")
        .args(["get", "pods", "-A", "-o", "json"])
        .output()?;
    
    if !output.status.success() {
        return Ok(Vec::new());
    }
    
    let json_str = String::from_utf8_lossy(&output.stdout);
    let json: Value = serde_json::from_str(&json_str)?;
    
    let mut pods = Vec::new();
    
    if let Some(items) = json["items"].as_array() {
        for item in items {
            let pod_name = item["metadata"]["name"].as_str().unwrap_or("").to_string();
            let pod_uid = item["metadata"]["uid"].as_str().map(|s| s.to_string());
            let namespace = item["metadata"]["namespace"].as_str().unwrap_or("").to_string();
            let pod_phase = item["status"]["phase"].as_str().map(|s| s.to_string());
            let node_name = item["spec"]["nodeName"].as_str().map(|s| s.to_string());
            let pod_ip = item["status"]["podIP"].as_str().map(|s| s.to_string());
            let host_ip = item["status"]["hostIP"].as_str().map(|s| s.to_string());
            let start_time = item["status"]["startTime"].as_str().map(|s| s.to_string());
            
            let labels_json = item["metadata"]["labels"].clone();
            let annotations_json = item["metadata"]["annotations"].clone();
            
            pods.push(K8sPodInventory {
                pod_name,
                pod_uid,
                namespace,
                pod_phase,
                node_name,
                pod_ip,
                host_ip,
                start_time,
                labels: if labels_json.is_null() { None } else { Some(labels_json) },
                annotations: if annotations_json.is_null() { None } else { Some(annotations_json) },
            });
        }
    }
    
    Ok(pods)
}

fn collect_services() -> Result<Vec<K8sServiceInventory>, Box<dyn std::error::Error>> {
    let output = Command::new("kubectl")
        .args(["get", "services", "-A", "-o", "json"])
        .output()?;
    
    if !output.status.success() {
        return Ok(Vec::new());
    }
    
    let json_str = String::from_utf8_lossy(&output.stdout);
    let json: Value = serde_json::from_str(&json_str)?;
    
    let mut services = Vec::new();
    
    if let Some(items) = json["items"].as_array() {
        for item in items {
            let service_name = item["metadata"]["name"].as_str().unwrap_or("").to_string();
            let service_uid = item["metadata"]["uid"].as_str().map(|s| s.to_string());
            let namespace = item["metadata"]["namespace"].as_str().unwrap_or("").to_string();
            let service_type = item["spec"]["type"].as_str().map(|s| s.to_string());
            let cluster_ip = item["spec"]["clusterIP"].as_str().map(|s| s.to_string());
            
            let external_ip = if let Some(lb_ingress) = item["status"]["loadBalancer"]["ingress"].as_array() {
                lb_ingress.first()
                    .and_then(|ing| ing["ip"].as_str())
                    .map(|s| s.to_string())
            } else {
                item["spec"]["externalIPs"]
                    .as_array()
                    .and_then(|ips| ips.first())
                    .and_then(|ip| ip.as_str())
                    .map(|s| s.to_string())
            };
            
            let ports_json = item["spec"]["ports"].clone();
            let selector_json = item["spec"]["selector"].clone();
            let labels_json = item["metadata"]["labels"].clone();
            
            services.push(K8sServiceInventory {
                service_name,
                service_uid,
                namespace,
                service_type,
                cluster_ip,
                external_ip,
                ports: if ports_json.is_null() { None } else { Some(ports_json) },
                selector: if selector_json.is_null() { None } else { Some(selector_json) },
                labels: if labels_json.is_null() { None } else { Some(labels_json) },
            });
        }
    }
    
    Ok(services)
}

fn collect_workloads() -> Result<Vec<K8sWorkloadInventory>, Box<dyn std::error::Error>> {
    let output = Command::new("kubectl")
        .args(["get", "deployments", "-A", "-o", "json"])
        .output()?;
    
    if !output.status.success() {
        return Ok(Vec::new());
    }
    
    let json_str = String::from_utf8_lossy(&output.stdout);
    let json: Value = serde_json::from_str(&json_str)?;
    
    let mut workloads = Vec::new();
    
    if let Some(items) = json["items"].as_array() {
        for item in items {
            let workload_name = item["metadata"]["name"].as_str().unwrap_or("").to_string();
            let workload_uid = item["metadata"]["uid"].as_str().map(|s| s.to_string());
            let namespace = item["metadata"]["namespace"].as_str().unwrap_or("").to_string();
            let workload_type = "Deployment".to_string();
            
            let replicas_desired = item["spec"]["replicas"].as_i64().map(|n| n as i32);
            let replicas_ready = item["status"]["readyReplicas"].as_i64().map(|n| n as i32);
            let replicas_available = item["status"]["availableReplicas"].as_i64().map(|n| n as i32);
            
            let labels_json = item["metadata"]["labels"].clone();
            let selector_json = item["spec"]["selector"].clone();
            
            workloads.push(K8sWorkloadInventory {
                workload_name,
                workload_uid,
                namespace,
                workload_type,
                replicas_desired,
                replicas_ready,
                replicas_available,
                labels: if labels_json.is_null() { None } else { Some(labels_json) },
                selector: if selector_json.is_null() { None } else { Some(selector_json) },
            });
        }
    }
    
    Ok(workloads)
}
