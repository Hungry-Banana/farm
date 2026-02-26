pub mod hardware;
pub mod vm;
pub mod k8s;

pub use hardware::handle_hardware_command;
pub use vm::handle_vm_command;
pub use k8s::handle_k8s_command;