use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(author, version, about, long_about = None)]
#[command(name = "farm-manager")]
#[command(about = "A CLI tool for managing farm infrastructure")]
pub struct Cli {
    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Subcommand)]
pub enum Commands {
    /// Hardware inventory and monitoring commands
    #[command(subcommand)]
    Hardware(HardwareCommands),
    
    /// Virtual machine management commands
    #[command(subcommand)]
    Vm(VmCommands),
    
    /// Kubernetes cluster management commands
    #[command(subcommand)]
    K8s(K8sCommands),
}

#[derive(Subcommand)]
pub enum HardwareCommands {
    /// Collect full hardware inventory
    Inventory {
        /// Output format (json, yaml, or pretty)
        #[arg(short, long, default_value = "pretty")]
        format: String,
    },
    /// Collect CPU information
    Cpu {
        /// Output format (json, yaml, or pretty)
        #[arg(short, long, default_value = "pretty")]
        format: String,
    },
    /// Collect memory information
    Memory {
        /// Output format (json, yaml, or pretty)
        #[arg(short, long, default_value = "pretty")]
        format: String,
    },
    /// Collect storage/disk information
    Storage {
        /// Output format (json, yaml, or pretty)
        #[arg(short, long, default_value = "pretty")]
        format: String,
    },
    /// Collect network interface information
    Network {
        /// Output format (json, yaml, or pretty)
        #[arg(short, long, default_value = "pretty")]
        format: String,
    },
    /// Collect node information
    Node {
        /// Output format (json, yaml, or pretty)
        #[arg(short, long, default_value = "pretty")]
        format: String,
    },
    /// Collect power supply information
    Power {
        /// Output format (json, yaml, or pretty)
        #[arg(short, long, default_value = "pretty")]
        format: String,
    },
    /// Post inventory data to FarmCore API
    PostInventory {
        /// FarmCore API base URL
        #[arg(short, long, default_value = "http://localhost:6183")]
        url: String,
    },
}

#[derive(Subcommand)]
pub enum VmCommands {
    /// List all virtual machines
    List {
        /// Hypervisor type (kvm, qemu, vmware, virtualbox)
        #[arg(short = 'H', long, default_value = "kvm")]
        hypervisor: String,
        
        /// Output format (json, yaml, or pretty)
        #[arg(short, long, default_value = "pretty")]
        format: String,
    },
    
    /// Start a virtual machine
    Start {
        /// VM name or ID
        #[arg(short, long)]
        name: String,
        
        /// Hypervisor type (kvm, qemu, vmware, virtualbox)
        #[arg(short = 'H', long, default_value = "kvm")]
        hypervisor: String,
    },
    
    /// Stop a virtual machine
    Stop {
        /// VM name or ID
        #[arg(short, long)]
        name: String,
        
        /// Hypervisor type (kvm, qemu, vmware, virtualbox)
        #[arg(short = 'H', long, default_value = "kvm")]
        hypervisor: String,
        
        /// Force shutdown (don't wait for graceful shutdown)
        #[arg(short, long)]
        force: bool,
    },
    
    /// Create a new virtual machine
    Create {
        /// VM name
        #[arg(short, long)]
        name: String,
        
        /// Hypervisor type (kvm, qemu, vmware, virtualbox)
        #[arg(short = 'H', long, default_value = "kvm")]
        hypervisor: String,
        
        /// Number of virtual CPUs
        #[arg(short = 'c', long, default_value = "2")]
        vcpus: u32,
        
        /// Memory in MB
        #[arg(short, long, default_value = "2048")]
        memory: u32,
        
        /// Disk size in GB
        #[arg(short, long, default_value = "20")]
        disk: u32,
        
        /// OS variant (e.g., ubuntu22.04, centos9, win10)
        #[arg(short, long)]
        os_variant: Option<String>,
        
        /// ISO image path for installation
        #[arg(short, long)]
        iso: Option<String>,
        
        /// Network (default, bridge name, or none)
        #[arg(long, default_value = "default")]
        network: String,
    },
    
    /// Delete a virtual machine
    Delete {
        /// VM name or ID
        #[arg(short, long)]
        name: String,
        
        /// Hypervisor type (kvm, qemu, vmware, virtualbox)
        #[arg(short = 'H', long, default_value = "kvm")]
        hypervisor: String,
        
        /// Remove storage volumes
        #[arg(long)]
        remove_storage: bool,
        
        /// Skip confirmation prompt
        #[arg(short = 'y', long)]
        yes: bool,
    },
    
    /// Show VM status and information
    Status {
        /// VM name or ID
        #[arg(short, long)]
        name: String,
        
        /// Hypervisor type (kvm, qemu, vmware, virtualbox)
        #[arg(short = 'H', long, default_value = "kvm")]
        hypervisor: String,
        
        /// Output format (json, yaml, or pretty)
        #[arg(short, long, default_value = "pretty")]
        format: String,
    },
    
    /// Reboot a virtual machine
    Reboot {
        /// VM name or ID
        #[arg(short, long)]
        name: String,
        
        /// Hypervisor type (kvm, qemu, vmware, virtualbox)
        #[arg(short = 'H', long, default_value = "kvm")]
        hypervisor: String,
        
        /// Force reboot
        #[arg(short, long)]
        force: bool,
    },
    
    /// Post VM inventory data to FarmCore API
    PostInventory {
        /// FarmCore API base URL
        #[arg(short, long, default_value = "http://localhost:6183")]
        url: String,
        
        /// Hypervisor type (kvm, qemu, vmware, virtualbox)
        #[arg(short = 'H', long, default_value = "kvm")]
        hypervisor: String,
    },
}

#[derive(Subcommand)]
pub enum K8sCommands {
    /// List pods in namespace
    Pods {
        /// Namespace (default: all namespaces)
        #[arg(short, long)]
        namespace: Option<String>,
        
        /// Show all namespaces
        #[arg(short = 'A', long)]
        all_namespaces: bool,
        
        /// Output format (json, yaml, wide, or pretty)
        #[arg(short, long, default_value = "pretty")]
        format: String,
    },
    
    /// List deployments
    Deployments {
        /// Namespace (default: all namespaces)
        #[arg(short, long)]
        namespace: Option<String>,
        
        /// Show all namespaces
        #[arg(short = 'A', long)]
        all_namespaces: bool,
        
        /// Output format (json, yaml, wide, or pretty)
        #[arg(short, long, default_value = "pretty")]
        format: String,
    },
    
    /// List services
    Services {
        /// Namespace (default: all namespaces)
        #[arg(short, long)]
        namespace: Option<String>,
        
        /// Show all namespaces
        #[arg(short = 'A', long)]
        all_namespaces: bool,
        
        /// Output format (json, yaml, wide, or pretty)
        #[arg(short, long, default_value = "pretty")]
        format: String,
    },
    
    /// List nodes in cluster
    Nodes {
        /// Output format (json, yaml, wide, or pretty)
        #[arg(short, long, default_value = "pretty")]
        format: String,
    },
    
    /// List namespaces
    Namespaces {
        /// Output format (json, yaml, or pretty)
        #[arg(short, long, default_value = "pretty")]
        format: String,
    },
    
    /// Apply a configuration file
    Apply {
        /// Path to YAML/JSON manifest file
        #[arg(short, long)]
        file: String,
        
        /// Namespace to apply to
        #[arg(short, long)]
        namespace: Option<String>,
    },
    
    /// Delete a resource
    Delete {
        /// Resource type (pod, deployment, service, etc.)
        #[arg(short = 't', long)]
        resource_type: String,
        
        /// Resource name
        #[arg(short, long)]
        name: String,
        
        /// Namespace
        #[arg(short = 'N', long)]
        namespace: Option<String>,
        
        /// Skip confirmation prompt
        #[arg(short = 'y', long)]
        yes: bool,
    },
    
    /// Scale a deployment
    Scale {
        /// Deployment name
        #[arg(short, long)]
        name: String,
        
        /// Number of replicas
        #[arg(short, long)]
        replicas: u32,
        
        /// Namespace
        #[arg(short = 'N', long)]
        namespace: Option<String>,
    },
    
    /// Get logs from a pod
    Logs {
        /// Pod name
        #[arg(short, long)]
        name: String,
        
        /// Namespace
        #[arg(short = 'N', long)]
        namespace: Option<String>,
        
        /// Container name (if pod has multiple containers)
        #[arg(short, long)]
        container: Option<String>,
        
        /// Follow log output
        #[arg(short, long)]
        follow: bool,
        
        /// Number of lines to show from end
        #[arg(long)]
        tail: Option<u32>,
    },
    
    /// Execute command in a pod
    Exec {
        /// Pod name
        #[arg(short, long)]
        name: String,
        
        /// Namespace
        #[arg(short = 'N', long)]
        namespace: Option<String>,
        
        /// Container name (if pod has multiple containers)
        #[arg(short, long)]
        container: Option<String>,
        
        /// Command to execute
        #[arg(short = 'C', long, num_args = 1..)]
        command: Vec<String>,
    },
    
    /// Get cluster information
    ClusterInfo {
        /// Output format (json, yaml, or pretty)
        #[arg(short, long, default_value = "pretty")]
        format: String,
    },
    
    /// Describe a resource
    Describe {
        /// Resource type (pod, deployment, service, node, etc.)
        #[arg(short = 't', long)]
        resource_type: String,
        
        /// Resource name
        #[arg(short, long)]
        name: String,
        
        /// Namespace (not applicable for cluster-scoped resources)
        #[arg(short = 'N', long)]
        namespace: Option<String>,
    },
}
