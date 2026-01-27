#!/usr/bin/env python3
import os
from pathlib import Path

base_dir = Path(__file__).parent

common_env = '''STACKS_NETWORK=mainnet
DEPLOYER="SP1V95DB4JK47QVPJBXCEN6MT35JK84CQ4CWS15DQ"
USER_1="SP1V95DB4JK47QVPJBXCEN6MT35JK84CQ4CWS15DQ"
SENDER_PRIVATE_KEY="nominee rail bounce admit first put perfect affair leopard staff insect roast balance laugh fox merry panda tiger glue drama coast october mystery sweet"'''

created_count = 0

for dir_path in sorted(base_dir.iterdir()):
    if not dir_path.is_dir():
        continue
    
    dirname = dir_path.name
    
    if dirname == 'asset-based-lending':
        print(f'Skipping {dirname} (already configured)')
        continue
    
    ts_file = dir_path / f'{dirname}_batch-call_with-no-event-fetching.ts'
    if not ts_file.exists():
        print(f'Skipping {dirname} (no TypeScript file found)')
        continue
    
    print(f'Creating files for {dirname}...')
    
    # Create .sh file
    sh_content = f'''echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the {dirname}.clar ..."
npx tsx {dirname}_batch-call_with-no-event-fetching.ts 
'''
    sh_file = dir_path / f'{dirname}.sh'
    sh_file.write_text(sh_content)
    os.chmod(sh_file, 0o755)
    
    # Convert dirname to UPPER_CASE for contract address variable
    contract_var = dirname.upper().replace('-', '_')
    
    # Create .env file
    env_content = f'''{common_env}
{contract_var}_CONTRACT_ADDRESS=SP1V95DB4JK47QVPJBXCEN6MT35JK84CQ4CWS15DQ.{dirname}
'''
    env_file = dir_path / '.env'
    env_file.write_text(env_content)
    
    print(f'  ✓ Created {dirname}.sh')
    print(f'  ✓ Created .env')
    created_count += 1

print(f'\nAll done! Created files for {created_count} contracts.')
