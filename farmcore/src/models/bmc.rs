use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum PowerState {
    On,
    Off,
    PoweringOn,
    PoweringOff,
    Unknown,
}

impl From<String> for PowerState {
    fn from(s: String) -> Self {
        match s.as_str() {
            "On" => PowerState::On,
            "Off" => PowerState::Off,
            "PoweringOn" => PowerState::PoweringOn,
            "PoweringOff" => PowerState::PoweringOff,
            _ => PowerState::Unknown,
        }
    }
}

impl From<&str> for PowerState {
    fn from(s: &str) -> Self {
        PowerState::from(s.to_string())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemInfo {
    #[serde(rename = "Id")]
    pub id: String,
    
    #[serde(rename = "Name")]
    pub name: String,
    
    #[serde(rename = "PowerState")]
    pub power_state: String,
    
    #[serde(rename = "Status")]
    pub status: Option<Status>,
    
    #[serde(rename = "Manufacturer")]
    pub manufacturer: Option<String>,
    
    #[serde(rename = "Model")]
    pub model: Option<String>,
    
    #[serde(rename = "SerialNumber")]
    pub serial_number: Option<String>,
    
    #[serde(rename = "BiosVersion")]
    pub bios_version: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Status {
    #[serde(rename = "State")]
    pub state: Option<String>,
    
    #[serde(rename = "Health")]
    pub health: Option<String>,
}
