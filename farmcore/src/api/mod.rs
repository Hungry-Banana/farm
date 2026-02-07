pub mod v1;
pub mod responses;
pub mod documentation;
pub mod query_parser;

use actix_web::web;

pub fn configure_api_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api")
            .configure(v1::configure_v1_routes)
    );
}