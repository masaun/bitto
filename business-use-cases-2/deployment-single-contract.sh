#!/bin/bash

# Script to deploy a single contract
# Usage: sh deploy-single-contract.sh <contract-name>
#
# Example: sh deploy-single-contract.sh decentralized-telecom-network-v2

CONTRACT_NAME=$1

if [ -z "$CONTRACT_NAME" ]; then
    echo "Usage: sh deploy-single-contract.sh <contract-name>"
    exit 1
fi

echo "=========================================="
echo "Single Contract Deployment Script"
echo "=========================================="
echo "Contract: $CONTRACT_NAME"
echo ""

# Load environment variables
source .env

# Backup original Clarinet.toml
echo "Backing up Clarinet.toml..."
cp Clarinet.toml Clarinet.toml.backup

# Create a temporary Clarinet.toml with only the specified contract
echo "Creating temporary Clarinet.toml with only $CONTRACT_NAME..."

# Extract the project metadata and settings
head -n 10 Clarinet.toml > Clarinet.toml.temp

# Add the specific contract configuration
echo "" >> Clarinet.toml.temp
echo "[contracts.$CONTRACT_NAME]" >> Clarinet.toml.temp
echo "path = \"contracts/${CONTRACT_NAME}.clar\"" >> Clarinet.toml.temp
echo "clarity_version = 3" >> Clarinet.toml.temp
echo "epoch = \"latest\"" >> Clarinet.toml.temp

# Replace the Clarinet.toml temporarily
mv Clarinet.toml.temp Clarinet.toml

echo "Generating deployment plan for $CONTRACT_NAME..."
clarinet deployments generate --mainnet --low-cost

echo ""
echo "Deploying $CONTRACT_NAME to mainnet..."
clarinet deployments apply --mainnet

# Restore original Clarinet.toml
echo ""
echo "Restoring original Clarinet.toml..."
mv Clarinet.toml.backup Clarinet.toml

echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
