
# BaseChat

On-Chain Chat Room built with ERC-4337 account abstraction 

## Set Up

To run the code you will need: 

-  Web3Auth (https://web3auth.io/) client ID token.
- Stackup  (https://app.stackup.sh/) RPC URL
- Alchemy (https://www.alchemy.com/) RPC URL  
- Node v.18 or above

### Configuration



1.  Open the `frontend/src/pages/index.tsx` file 

2.  Filling in the corresponding client ID & RPC URL

```bash
  const web3AuthClientId=[Token ID]
  const rpcUrl =[RPC URL]
  const pmUrl= [Paymaster URL]
  const alchemy_provider=[Alchemy RPC]
```

3. Install Dependencies

```bash
npm install
```
4. Start Up the webpage


```bash
npm run dev
```

Then you should see the website up & running! 

## Troubleshoot

Stackup comes with rate limit. If you encounter 429 error, you might have used up your free credit and need to upgrade to 
paid plan or switch to  a new account. 

## Final Words

If you find this repository helpful in getting started in ERC4337.

Please vote for BaseChat in https://prop.house/base/based-accounts

## Demo Link

https://chat-4337.vercel.app 