import { showConnect } from '@stacks/connect';
const projectId = process.env.WALLET_CONNECT_PROJECT_ID;
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.createElement('button');
  btn.textContent = 'Connect Wallet';
  btn.onclick = async () => {
    await showConnect({
      appDetails: { name: 'Native Meta TX' },
      walletConnectProjectId: projectId
    });
  };
  document.getElementById('root').appendChild(btn);
});
