import Web3 from 'web3';

const getWeb3 = () =>
  new Promise((resolve, reject) => {
    window.addEventListener('load', async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          await window.ethereum.enable(); // Request account access
          resolve(web3);
        } catch (error) {
          reject(error);
        }
      } else if (window.web3) { // Legacy dapp browsers...
        const web3 = window.web3;
        console.log('Injected web3 detected.');
        resolve(web3);
      } else { // Fallback to localhost; use dev console port by default...
        const provider = new Web3.providers.HttpProvider('http://127.0.0.1:9545');
        const web3 = new Web3(provider);
        console.log('No web3 instance injected, using Local web3.');
        resolve(web3);
      }
    });
  });

export default getWeb3;
