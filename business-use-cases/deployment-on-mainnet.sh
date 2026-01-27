echo "Generating mainnet low-cost deployment files..."
clarinet deployments generate --mainnet --high-cost

echo "Deploying contracts to mainnet..."
clarinet deployments apply --mainnet