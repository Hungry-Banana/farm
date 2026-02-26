#!/bin/bash

# Farm Manager Build Script
# This script builds the manager tool for multiple architectures

set -e

# Default values
BUILD_ALL=false
BUILD_X86=false
BUILD_ARM64=false
INSTALL=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --all)
            BUILD_ALL=true
            shift
            ;;
        --x86|--x86_64)
            BUILD_X86=true
            shift
            ;;
        --arm64|--aarch64)
            BUILD_ARM64=true
            shift
            ;;
        --install)
            INSTALL=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --all                Build for all supported architectures"
            echo "  --x86, --x86_64      Build for x86_64"
            echo "  --arm64, --aarch64   Build for aarch64"
            echo "  --install            Install the native binary to /usr/local/bin"
            echo "  -h, --help           Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                   # Build for current architecture"
            echo "  $0 --all            # Build for all architectures"
            echo "  $0 --x86 --arm64    # Build for specific architectures"
            echo "  $0 --install        # Build and install native binary"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# If no specific architecture flags, build for current architecture
if [ "$BUILD_ALL" = false ] && [ "$BUILD_X86" = false ] && [ "$BUILD_ARM64" = false ]; then
    echo "🔧 Building Farm Manager for current architecture..."
    cargo build --release
    echo "✅ Build completed successfully!"
    echo "📦 Binary location: target/release/farm-manager"
else
    # Check if cross is installed for cross-compilation
    if ! command -v cross &> /dev/null && ([ "$BUILD_ALL" = true ] || [ "$BUILD_X86" = true ] || [ "$BUILD_ARM64" = true ]); then
        echo "⚠️  Cross-compilation requires 'cross' tool. Installing..."
        cargo install cross --git https://github.com/cross-rs/cross
    fi

    if [ "$BUILD_ALL" = true ]; then
        BUILD_X86=true
        BUILD_ARM64=true
    fi

    # Build for x86_64
    if [ "$BUILD_X86" = true ]; then
        echo "🔧 Building for x86_64..."
        if [[ $(uname -m) == "x86_64" ]]; then
            cargo build --release --target x86_64-unknown-linux-gnu
        else
            cross build --release --target x86_64-unknown-linux-gnu
        fi
        echo "✅ x86_64 build completed!"
        echo "📦 Binary location: target/x86_64-unknown-linux-gnu/release/farm-manager"
    fi

    # Build for aarch64
    if [ "$BUILD_ARM64" = true ]; then
        echo "🔧 Building for aarch64..."
        if [[ $(uname -m) == "aarch64" ]]; then
            cargo build --release --target aarch64-unknown-linux-gnu
        else
            cross build --release --target aarch64-unknown-linux-gnu
        fi
        echo "✅ aarch64 build completed!"
        echo "📦 Binary location: target/aarch64-unknown-linux-gnu/release/farm-manager"
    fi
fi

# Install if requested (only for native architecture)
if [ "$INSTALL" = true ]; then
    if [ -f "target/release/farm-manager" ]; then
        echo "📥 Installing farm-manager to /usr/local/bin..."
        sudo cp target/release/farm-manager /usr/local/bin/
        sudo chmod +x /usr/local/bin/farm-manager
        echo "✅ Installation completed! You can now run 'farm-manager' from anywhere."
    else
        echo "⚠️  Native binary not found. Build without architecture flags first, then install."
        exit 1
    fi
fi

echo ""
echo "🚀 Usage examples:"
echo "  ./target/release/farm-manager                    # Run manager collection"
echo "  ./target/release/farm-manager > server.json     # Save to file"
echo "  ./target/release/farm-manager | jq .hostname    # Extract hostname"
echo ""