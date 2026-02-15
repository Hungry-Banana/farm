pub mod root;
pub mod servers;
pub mod components;
pub mod migrations;
pub mod vms;

use actix_web::web;

pub fn configure_v1_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/v1")
            .configure(root::configure_health_routes)
            .configure(servers::configure_server_routes)
            .configure(components::configure_component_routes)
            .configure(migrations::configure_migration_routes)
            .configure(vms::configure_vm_routes)
    );
}