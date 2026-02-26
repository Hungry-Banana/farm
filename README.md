# Farm

A distributed system for managing and monitoring server infrastructure.

## Architecture

Farm consists of three main components:

### Farm Core (Backend)
The backend API service that handles data storage, queries, and serves the REST API. Built with Rust, it provides endpoints for managing servers, virtual machines, and hardware components.

**Location:** `farmcore/`

### Farm View (Frontend)
The web-based user interface for visualizing and interacting with your infrastructure. Built with Next.js and React, it provides dashboards and management tools.

**Location:** `farmview/`

### Farm Manager (Agent)
A lightweight agent that can be deployed on individual servers to collect hardware metrics and send data back to Farm Core. It gathers information about CPUs, GPUs, memory, storage, network, and power consumption.

**Location:** `farmmanager/`

## Setup

### Environment Variables

**Important:** If you are not running Farm in a Kubernetes environment, you must ensure that the required environment variables are properly initialized before starting the services.

Refer to the configuration files in each directory (`farm-core.yaml`, `farm-view.yaml`, etc.) for specific environment variable requirements.

## Getting Started

1. Start Farm Core (backend)
2. Start Farm View (frontend)
3. Deploy Farm Manager agents on your servers to begin collecting servers and vms

## License

See [LICENSE](LICENSE) for details.
