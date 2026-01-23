#!/usr/bin/env python3
import os

contracts_config = {
    "pro-baseball-ticketing": {
        "title": "Pro Baseball Ticketing",
        "template": "ticketing"
    },
    "pro-football-ticketing": {
        "title": "Pro Football Ticketing",
        "template": "ticketing"
    },
    "pro-basketball-ticketing": {
        "title": "Pro Basketball Ticketing",
        "template": "ticketing"
    },
    "semiconductor-manufacturing": {
        "title": "Semiconductor Manufacturing",
        "template": "manufacturing"
    },
    "semiconductor-design-process": {
        "title": "Semiconductor Design Process",
        "template": "design"
    },
    "wafer-fabrication-process": {
        "title": "Wafer Fabrication Process",
        "template": "batch"
    },
    "chip-atp-process": {
        "title": "Chip ATP Process",
        "template": "testing"
    },
    "battery-electric-bus-production": {
        "title": "Battery Electric Bus Production",
        "template": "batch"
    },
    "lithium-battery-monitoring": {
        "title": "Lithium Battery Monitoring",
        "template": "batch"
    },
    "humanoid-robot-production": {
        "title": "Humanoid Robot Production",
        "template": "batch"
    },
    "robotics-oem": {
        "title": "Robotics OEM",
        "template": "catalog"
    },
    "robotics-data-sharing": {
        "title": "Robotics Data Sharing",
        "template": "data"
    },
    "robot-deployment-planing-system": {
        "title": "Robot Deployment Planning System",
        "template": "planning"
    },
    "robot-supply-chain-network": {
        "title": "Robot Supply Chain Network",
        "template": "catalog"
    },
    "robot-maintainance-automation": {
        "title": "Robot Maintenance Automation",
        "template": "maintenance"
    },
    "home-battery-storage": {
        "title": "Home Battery Storage",
        "template": "energy"
    },
    "aircraft-assembly-process": {
        "title": "Aircraft Assembly Process",
        "template": "assembly"
    },
    "tokenized-artwork-exchange": {
        "title": "Tokenized Artwork Exchange",
        "template": "artwork"
    },
    "sports-player-ip-mgmt": {
        "title": "Sports Player IP Management",
        "template": "ip"
    },
    "tokenized-sports-club": {
        "title": "Tokenized Sports Club",
        "template": "club"
    },
    "onchain-kyb": {
        "title": "Onchain KYB",
        "template": "kyb"
    },
    "onchain-kyt": {
        "title": "Onchain KYT",
        "template": "kyt"
    },
    "onchain-obs": {
        "title": "Onchain OBS",
        "template": "obs"
    },
    "onchain-kya": {
        "title": "Onchain KYA",
        "template": "kya"
    }
}

base_template = """import {{ useState, useEffect }} from 'react';
import {{ AppConfig, UserSession, showConnect }} from '@stacks/connect';
import {{ StacksMainnet }} from '@stacks/network';
import {{ 
  uintCV, 
  stringAsciiCV,
  principalCV,
  boolCV,
  bufferCV,
  intCV,
  callReadOnlyFunction,
  makeContractCall,
  AnchorMode
}} from '@stacks/transactions';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({{ appConfig }});

export default function Home() {{
  const [mounted, setMounted] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, string>>({{}});
  const [result, setResult] = useState('');

  useEffect(() => {{
    setMounted(true);
    if (userSession.isSignInPending()) {{
      userSession.handlePendingSignIn().then((userData) => {{
        setUserData(userData);
      }});
    }} else if (userSession.isUserSignedIn()) {{
      setUserData(userSession.loadUserData());
    }}
  }}, []);

  const connectWallet = () => {{
    showConnect({{
      appDetails: {{
        name: '{title}',
        icon: 'https://stacks.org/logo.png',
      }},
      redirectTo: '/',
      onFinish: () => {{
        setUserData(userSession.loadUserData());
      }},
      userSession,
    }});
  }};

  const handleInput = (key: string, value: string) => {{
    setFormData(prev => ({{ ...prev, [key]: value }}));
  }};

  const callContract = async (functionName: string, args: any[]) => {{
    const network = new StacksMainnet();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    const txOptions = {{
      network,
      anchorMode: AnchorMode.Any,
      contractAddress,
      contractName,
      functionName,
      functionArgs: args,
      senderKey: userData.profile.stxAddress.mainnet,
      validateWithAbi: true,
    }};

    try {{
      await makeContractCall(txOptions);
      setResult('Transaction submitted successfully');
    }} catch (error) {{
      setResult('Error: ' + error);
    }}
  }};

  const queryContract = async (functionName: string, args: any[]) => {{
    const network = new StacksMainnet();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[0];
    const contractName = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!.split('.')[1];

    try {{
      const result = await callReadOnlyFunction({{
        network,
        contractAddress,
        contractName,
        functionName,
        functionArgs: args,
        senderAddress: contractAddress,
      }});
      setResult(JSON.stringify(result, null, 2));
    }} catch (error) {{
      setResult('Error: ' + error);
    }}
  }};

  if (!mounted) return null;

  return (
    <div style={{{{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}}}>
      <h1>{title}</h1>
      
      {{!userData ? (
        <button onClick={{connectWallet}} style={{{{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', background: '#0066cc', color: 'white', border: 'none', borderRadius: '5px' }}}}>
          Connect Wallet
        </button>
      ) : (
        <div>
          <p style={{{{ padding: '10px', background: '#e8f5e9', borderRadius: '5px', marginBottom: '20px' }}}}>
            Connected: {{userData.profile.stxAddress.mainnet}}
          </p>
          
          <div style={{{{ marginTop: '20px', padding: '20px', border: '2px solid #ddd', borderRadius: '8px', background: 'white' }}}}>
            <h3 style={{{{ marginTop: 0 }}}}>Contract Interface</h3>
            <p style={{{{ color: '#666' }}}}>Configure NEXT_PUBLIC_CONTRACT_ADDRESS in .env.local file</p>
            
            <div style={{{{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}}}>
              <input 
                placeholder="Field 1" 
                value={{formData['field1'] || ''}} 
                onChange={{(e) => handleInput('field1', e.target.value)}}
                style={{{{ padding: '10px', minWidth: '200px', border: '1px solid #ddd', borderRadius: '4px' }}}}
              />
              <input 
                placeholder="Field 2" 
                value={{formData['field2'] || ''}} 
                onChange={{(e) => handleInput('field2', e.target.value)}}
                style={{{{ padding: '10px', minWidth: '200px', border: '1px solid #ddd', borderRadius: '4px' }}}}
              />
              <button 
                onClick={{() => callContract('sample-function', [])}}
                style={{{{ padding: '10px 20px', cursor: 'pointer', background: '#0066cc', color: 'white', border: 'none', borderRadius: '4px' }}}}
              >
                Execute
              </button>
            </div>
          </div>

          {{result && (
            <div style={{{{ marginTop: '20px', padding: '15px', border: '2px solid #ddd', borderRadius: '8px', background: '#f8f9fa' }}}}>
              <h3 style={{{{ marginTop: 0 }}}}>Result</h3>
              <pre style={{{{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: 'white', padding: '15px', borderRadius: '4px', border: '1px solid #ddd' }}}}> {{result}}</pre>
            </div>
          )}}
        </div>
      )}}
    </div>
  );
}}
"""

os.chdir('/Users/unomasanori/Projects/Talent-Rewards/Stacks-rewards/bitto/business-use-cases/frontend')

for contract_name, config in contracts_config.items():
    pages_dir = f"{contract_name}/pages"
    os.makedirs(pages_dir, exist_ok=True)
    
    index_path = f"{pages_dir}/index.tsx"
    with open(index_path, 'w') as f:
        f.write(base_template.format(title=config['title']))
    
    print(f"Created {index_path}")

print(f"\\nCompleted! Created index.tsx for {len(contracts_config)} contracts")
