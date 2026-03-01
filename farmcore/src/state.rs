use sqlx::MySqlPool;
use crate::repositories::{ServerRepository, ComponentRepository, VmRepository, KubernetesRepository};

#[derive(Clone)]
pub struct AppState {
    pool: MySqlPool,
}

impl AppState {
    pub fn new(pool: MySqlPool) -> Self {
        Self { pool }
    }

    pub fn server_repo(&self) -> ServerRepository {
        ServerRepository::new(self.pool.clone())
    }

    pub fn component_repo(&self) -> ComponentRepository {
        ComponentRepository::new(self.pool.clone())
    }

    pub fn vm_repo(&self) -> VmRepository {
        VmRepository::new(self.pool.clone())
    }

    pub fn k8s_repo(&self) -> KubernetesRepository {
        KubernetesRepository::new(self.pool.clone())
    }

    // Method to get the pool directly for cases where we need it
    pub fn pool(&self) -> &MySqlPool {
        &self.pool
    }
}