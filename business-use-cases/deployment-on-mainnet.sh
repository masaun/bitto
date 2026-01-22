echo "Generating mainnet low-cost deployment files..."
clarinet deployments generate --mainnet --low-cost

echo "Deploying contracts to mainnet..."
clarinet deployments apply --mainnet