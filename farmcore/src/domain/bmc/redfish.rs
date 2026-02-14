use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::time::Duration;
use crate::models::bmc::{PowerState, SystemInfo};

#[derive(Debug, Clone)]
pub struct RedfishClient {
    base_url: String,
    username: String,
    password: String,
    client: Client,
}

#[derive(Debug, thiserror::Error)]
pub enum RedfishError {
    #[error("Connection error: {0}")]
    Connection(String),
    
    #[error("Authentication failed")]
    Authentication,
    
    #[error("Invalid response: {0}")]
    InvalidResponse(String),
    
    #[error("HTTP error: {0}")]
    Http(#[from] reqwest::Error),
    
    #[error("JSON parsing error: {0}")]
    Json(#[from] serde_json::Error),
    
    #[error("Operation not supported")]
    NotSupported,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct ResetAction {
    #[serde(rename = "ResetType")]
    reset_type: String,
}

impl RedfishClient {
    pub fn new(host: &str, username: &str, password: &str) -> Result<Self, RedfishError> {
        let base_url = if host.starts_with("http://") || host.starts_with("https://") {
            host.to_string()
        } else {
            format!("https://{}", host)
        };
        
        let client = Client::builder()
            .timeout(Duration::from_secs(10)) // Reduced from 30s to 10s for faster error responses
            .connect_timeout(Duration::from_secs(5)) // Connection timeout of 5s
            .danger_accept_invalid_certs(true) // BMCs often have self-signed certs
            .build()
            .map_err(|e| RedfishError::Connection(e.to_string()))?;
        
        Ok(Self {
            base_url,
            username: username.to_string(),
            password: password.to_string(),
            client,
        })
    }
    
    /// Test connection to Redfish endpoint
    pub async fn test_connection(&self) -> Result<bool, RedfishError> {
        let url = format!("{}/redfish/v1", self.base_url);
        let response = self.client
            .get(&url)
            .basic_auth(&self.username, Some(&self.password))
            .send()
            .await?;
        
        Ok(response.status().is_success())
    }
    
    /// Get system information
    pub async fn get_system_info(&self, system_id: Option<&str>) -> Result<SystemInfo, RedfishError> {
        let system_id = system_id.unwrap_or("System.Embedded.1");
        let url = format!("{}/redfish/v1/Systems/{}", self.base_url, system_id);
        
        let response = self.client
            .get(&url)
            .basic_auth(&self.username, Some(&self.password))
            .send()
            .await?;
        
        if !response.status().is_success() {
            return Err(RedfishError::InvalidResponse(
                format!("HTTP {}: {}", response.status(), response.text().await?)
            ));
        }
        
        let system_info: SystemInfo = response.json().await?;
        Ok(system_info)
    }
    
    /// Get current power state
    pub async fn get_power_state(&self, system_id: Option<&str>) -> Result<PowerState, RedfishError> {
        let system_info = self.get_system_info(system_id).await?;
        Ok(PowerState::from(system_info.power_state))
    }
    
    /// Set power state (On, ForceOff, GracefulShutdown, ForceRestart, GracefulRestart, etc.)
    pub async fn set_power_state(
        &self,
        reset_type: &str,
        system_id: Option<&str>,
    ) -> Result<(), RedfishError> {
        let system_id = system_id.unwrap_or("System.Embedded.1");
        let url = format!(
            "{}/redfish/v1/Systems/{}/Actions/ComputerSystem.Reset",
            self.base_url, system_id
        );
        
        let reset_action = ResetAction {
            reset_type: reset_type.to_string(),
        };
        
        let response = self.client
            .post(&url)
            .basic_auth(&self.username, Some(&self.password))
            .json(&reset_action)
            .send()
            .await?;
        
        if !response.status().is_success() {
            return Err(RedfishError::InvalidResponse(
                format!("HTTP {}: {}", response.status(), response.text().await?)
            ));
        }
        
        Ok(())
    }
    
    /// Power on the system
    pub async fn power_on(&self, system_id: Option<&str>) -> Result<(), RedfishError> {
        self.set_power_state("On", system_id).await
    }
    
    /// Gracefully power off the system
    pub async fn power_off(&self, system_id: Option<&str>) -> Result<(), RedfishError> {
        self.set_power_state("GracefulShutdown", system_id).await
    }
    
    /// Force power off the system
    pub async fn force_power_off(&self, system_id: Option<&str>) -> Result<(), RedfishError> {
        self.set_power_state("ForceOff", system_id).await
    }
    
    /// Reboot the system
    pub async fn reboot(&self, system_id: Option<&str>) -> Result<(), RedfishError> {
        self.set_power_state("GracefulRestart", system_id).await
    }
    
    /// Force reboot the system
    pub async fn force_reboot(&self, system_id: Option<&str>) -> Result<(), RedfishError> {
        self.set_power_state("ForceRestart", system_id).await
    }
}