import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { makeContractCall, uintCV, bufferCVFromString, PostConditionMode, AnchorMode, callReadOnlyFunction } from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';

const CONTRACT_ADDRESS = process.env.AUTOMATED_ANNUAL_REPORTING_FOR_FARMERS_CONTRACT_ADDRESS || '';
const CONTRACT_NAME = 'automated-annual-reporting-for-farmers';
const NETWORK = new StacksMainnet();

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

let userData: any = null;

document.getElementById('connectBtn')?.addEventListener('click', () => {
  showConnect({
    appDetails: { name: 'AutomatedAnnualReportingForFarmers', icon: window.location.origin + '/logo.png' },
    redirectTo: '/',
    onFinish: () => { userData = userSession.loadUserData(); updateUserInfo(); },
    userSession,
  });
});

function updateUserInfo() {
  const userInfo = document.getElementById('userInfo');
  if (userData && userInfo) userInfo.innerHTML = '<p>Connected: ' + userData.profile.stxAddress.mainnet + '</p>';
}

document.getElementById('registerBtn')?.addEventListener('click', async () => {
  const dataHashInput = document.getElementById('dataHash') as HTMLInputElement;
  const resultDiv = document.getElementById('registerResult');
  if (!userData || !resultDiv) return;
  try {
    const dataHash = dataHashInput.value.startsWith('0x') ? dataHashInput.value.slice(2) : dataHashInput.value;
    const txOptions = {
      contractAddress: CONTRACT_ADDRESS.split('.')[0],
      contractName: CONTRACT_ADDRESS.split('.')[1] || CONTRACT_NAME,
      functionName: 'register-entry',
      functionArgs: [bufferCVFromString(dataHash)],
      network: NETWORK,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: any) => { resultDiv.innerHTML = '<p>Transaction: ' + data.txId + '</p>'; },
    };
    await makeContractCall(txOptions);
  } catch (error) {
    resultDiv.innerHTML = '<p>Error: ' + error + '</p>';
  }
});

document.getElementById('getEntryBtn')?.addEventListener('click', async () => {
  const entryIdInput = document.getElementById('entryId') as HTMLInputElement;
  const resultDiv = document.getElementById('getEntryResult');
  if (!resultDiv) return;
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS.split('.')[0],
      contractName: CONTRACT_ADDRESS.split('.')[1] || CONTRACT_NAME,
      functionName: 'get-entry',
      functionArgs: [uintCV(parseInt(entryIdInput.value))],
      network: NETWORK,
      senderAddress: userData?.profile.stxAddress.mainnet || CONTRACT_ADDRESS.split('.')[0],
    });
    resultDiv.innerHTML = '<pre>' + JSON.stringify(result, null, 2) + '</pre>';
  } catch (error) {
    resultDiv.innerHTML = '<p>Error: ' + error + '</p>';
  }
});