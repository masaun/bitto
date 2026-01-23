import os
import json

base_path = "/Users/unomasanori/Projects/Talent-Rewards/Stacks-rewards/bitto/business-use-cases"

contracts = [
    ("pro-football-ticketing", 3004, ["create-game", "purchase-ticket", "use-ticket", "transfer-ticket"], ["get-game-info", "get-ticket-info"]),
    ("pro-basketball-ticketing", 3005, ["create-game", "purchase-ticket", "use-ticket", "transfer-ticket"], ["get-game-info", "get-ticket-info"]),
    ("semiconductor-manufacturing", 3006, ["register-manufacturer", "start-chip-production", "update-production-stage", "complete-production", "transfer-chip"], ["get-chip-info", "get-manufacturer-chips"]),
    ("semiconductor-design-process", 3007, ["register-designer", "start-design", "update-milestone", "complete-design"], ["get-design-info", "get-designer-designs"]),
    ("wafer-fabrication-process", 3008, ["start-wafer-batch", "update-process-step", "complete-batch"], ["get-batch-info"]),
    ("chip-atp-process", 3009, ["start-test-process", "record-test-result", "complete-testing"], ["get-test-info"]),
    ("battery-electric-bus-production", 3010, ["start-bus-assembly", "update-assembly-stage", "complete-bus"], ["get-bus-info"]),
    ("lithium-battery-monitoring", 3011, ["register-battery-line", "start-cell-production", "record-quality-check", "complete-cell"], ["get-cell-info", "get-line-stats"]),
    ("humanoid-robot-production", 3012, ["start-robot-batch", "update-assembly-stage", "quality-check", "complete-batch"], ["get-batch-info"]),
    ("robotics-oem", 3013, ["register-component", "create-order", "fulfill-order"], ["get-component-info", "get-order-info"]),
    ("robotics-data-sharing", 3014, ["register-robot", "share-process-data", "grant-access", "revoke-access"], ["get-robot-data", "check-access"]),
    ("robot-deployment-planing-system", 3015, ["create-deployment-plan", "assign-robot", "update-status", "complete-deployment"], ["get-plan-info", "get-robot-assignment"]),
    ("robot-supply-chain-network", 3016, ["register-supplier", "create-part", "create-supply-order", "fulfill-order"], ["get-part-info", "get-order-info"]),
    ("robot-maintainance-automation", 3017, ["schedule-maintenance", "record-maintenance", "update-status"], ["get-maintenance-info", "get-robot-history"]),
    ("home-battery-storage", 3018, ["register-battery", "record-charge-cycle", "update-capacity", "get-battery-health"], ["get-battery-info", "get-cycle-history"]),
    ("aircraft-assembly-process", 3019, ["start-aircraft-assembly", "update-assembly-stage", "install-component", "complete-aircraft"], ["get-aircraft-info", "get-assembly-progress"]),
    ("tokenized-artwork-exchange", 3020, ["register-artwork", "create-listing", "purchase-artwork", "transfer-artwork"], ["get-artwork-info", "get-listing-info"]),
    ("sports-player-ip-mgmt", 3021, ["register-player-ip", "create-license", "transfer-license", "revoke-license"], ["get-ip-info", "get-license-info"]),
    ("tokenized-sports-club", 3022, ["initialize-club", "mint-tokens", "transfer-tokens", "create-proposal", "vote-on-proposal"], ["get-club-info", "get-token-balance", "get-proposal-info"]),
    ("onchain-kyb", 3023, ["submit-business-verification", "approve-verification", "reject-verification", "update-status"], ["get-verification-status", "is-business-verified"]),
    ("onchain-kyt", 3024, ["register-transaction", "flag-transaction", "update-risk-score", "whitelist-address"], ["get-transaction-info", "get-risk-score", "is-whitelisted"]),
    ("onchain-obs", 3025, ["add-sanctioned-address", "remove-sanctioned-address", "check-sanction"], ["is-sanctioned", "get-sanction-info"]),
    ("onchain-kya", 3026, ["register-address", "verify-address", "update-verification", "revoke-verification"], ["get-address-info", "is-address-verified"])
]

for contract_name, port, write_funcs, read_funcs in contracts:
    frontend_dir = os.path.join(base_path, "frontend", contract_name)
    os.makedirs(os.path.join(frontend_dir, "pages"), exist_ok=True)
    
    package_json = {
        "name": f"{contract_name}-frontend",
        "version": "0.1.0",
        "private": True,
        "scripts": {
            "dev": f"next dev -p {port}",
            "build": "next build",
            "start": f"next start -p {port}"
        },
        "dependencies": {
            "@stacks/connect": "^7.8.2",
            "@stacks/transactions": "^6.13.0",
            "@stacks/network": "^6.13.0",
            "next": "14.1.0",
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
            "typescript": "^5.3.3",
            "@types/react": "^18.2.48",
            "@types/node": "^20.11.5",
            "@types/react-dom": "^18.2.18"
        }
    }
    
    with open(os.path.join(frontend_dir, "package.json"), "w") as f:
        json.dump(package_json, f, indent=2)
    
    with open(os.path.join(frontend_dir, ".env.local"), "w") as f:
        f.write("NEXT_PUBLIC_CONTRACT_ADDRESS=\nNEXT_PUBLIC_NETWORK=mainnet\n")
    
    with open(os.path.join(frontend_dir, ".gitignore"), "w") as f:
        f.write(".next\nnode_modules\n.env\n.env.local\n.env.production\n.env.development\nout\ndist\nbuild\n")
    
    tsconfig = {
        "compilerOptions": {
            "target": "es5",
            "lib": ["dom", "dom.iterable", "esnext"],
            "allowJs": True,
            "skipLibCheck": True,
            "strict": True,
            "forceConsistentCasingInFileNames": True,
            "noEmit": True,
            "esModuleInterop": True,
            "module": "esnext",
            "moduleResolution": "bundler",
            "resolveJsonModule": True,
            "isolatedModules": True,
            "jsx": "preserve",
            "incremental": True,
            "paths": {
                "@/*": ["./*"]
            }
        },
        "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
        "exclude": ["node_modules"]
    }
    
    with open(os.path.join(frontend_dir, "tsconfig.json"), "w") as f:
        json.dump(tsconfig, f, indent=2)
    
    with open(os.path.join(frontend_dir, "next.config.js"), "w") as f:
        f.write("module.exports = {\n  reactStrictMode: true,\n}\n")
    
    print(f"Created frontend structure for {contract_name}")

print("All frontends created successfully!")
