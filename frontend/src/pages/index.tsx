import { CHAIN_NAMESPACES, SafeEventEmitterProvider } from "@web3auth/base";
import { Web3Auth } from "@web3auth/modal";
import {
  getAddress,
  JsonRpcProvider,
  parseEther,
  toQuantity,
  Wallet,
} from "ethers";
import { useEffect, useState } from "react";
import { Client, Presets } from "userop";
import { ethers } from "ethers";

import { publicProvider } from 'wagmi/providers/public'
import { WagmiConfig, createConfig, configureChains } from 'wagmi'
import { baseGoerli } from 'wagmi/chains'
import MyChat from "../../components/chatview";
import styles from './index.module.css'
import Footer from "../../components/footer";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [baseGoerli],
  [publicProvider()],
)
const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
})

const entryPoint = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
 const simpleAccountFactory = "0x9406Cc6185a346906296840746125a0E44976454";

const pmContext = {
  type: "payg",
};
export default function Home() {
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [account, setAccount] = useState<Presets.Builder.SimpleAccount | null>(
    null
  );
  const [myaddress,setAddress]=useState('');
  const [balance,setBalance]=useState(0)
  const [idToken, setIdToken] = useState<string | null>(null);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [events, setEvents] = useState<string[]>([
    `Transactions will be displayed here`,
  ]);
  const [loading, setLoading] = useState(false);
  const [connected,setConnected]=useState(false);
  const [text, setText] = useState('');
  const [messageType, setMessageType] = useState(0);
  // const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
  // const pmUrl = process.env.NEXT_PUBLIC_PAYMASTER_URL;
  // const web3AuthClientId = process.env.NEXT_PUBLIC_WEB3_AUTH_CLIENT_ID;
  const web3AuthClientId=[TODO]
  const rpcUrl =[TODO]
  const pmUrl= [TODO Paymaster URL]
  const alchemy_provider=[TODO]
  
  
  if (!web3AuthClientId) {
    throw new Error("WEB3AUTH_CLIENT_ID is undefined");
  }

  if (!rpcUrl) {
    throw new Error("RPC_URL is undefined");
  }

  if (!pmUrl) {
    throw new Error("PAYMASTER_RPC_URL is undefined");
  }

  



  const paymaster = true
    ? Presets.Middleware.verifyingPaymaster(pmUrl, pmContext)
    : undefined;
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const provider = new JsonRpcProvider(rpcUrl);
        const network = await provider.getNetwork();
        const chainId = network.chainId;
        const web3auth = new Web3Auth({
          clientId: web3AuthClientId,
          web3AuthNetwork: "testnet",
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: toQuantity(chainId),
            rpcTarget: rpcUrl,
          },
        });

        await web3auth.initModal();

        setWeb3auth(web3auth);
        setAuthorized(web3auth);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const createAccount = async (privateKey: string) => {
    return await Presets.Builder.SimpleAccount.init(
      new Wallet(privateKey) as any,
      rpcUrl,
      entryPoint,
      simpleAccountFactory,
      paymaster
    );
  };

  const getPrivateKey = async (provider: SafeEventEmitterProvider) => {
    return (await provider.request({
      method: "private_key",
    })) as string;
  };

  const setAuthorized = async (w3auth: Web3Auth) => {
    if (!w3auth.provider) {
      throw new Error("web3authprovider not initialized yet");
    }
    if (!w3auth.connected) {
      console.log("not connected")
      // throw new Error("web3authprovider not connected yet");
      setConnected(false);
    }
    else{
      

      const authenticateUser = await w3auth.authenticateUser();

      const privateKey = await getPrivateKey(w3auth.provider);
      const acc = await createAccount(privateKey);
      setIdToken(authenticateUser.idToken);
      setAccount(acc);
      setPrivateKey(privateKey);
      setConnected(true);
      const provider= new JsonRpcProvider(alchemy_provider);
      const balance = await provider.getBalance(acc.getSender());
      setBalance(Number(balance));
      setAddress(acc.getSender());
    }
  };

  const login = async () => {
    if (!web3auth) {
      throw new Error("web3auth not initialized yet");
    }
    const web3authProvider = await web3auth.connect();
    if (!web3authProvider) {
      throw new Error("web3authprovider not initialized yet");
    }

    setAuthorized(web3auth);
  };

  const logout = async () => {
    if (!web3auth) {
      throw new Error("web3auth not initialized yet");
    }
    await web3auth.logout();
    setAccount(null);
    setIdToken(null);
    setPrivateKey(null);
    setConnected(false);
    setBalance(0);
    setAddress('');
  };

  const addEvent = (newEvent: string) => {
    setEvents((prevEvents) => [...prevEvents, newEvent]);
  };




  const sendTransaction = async (message: string,  message_type: number) => {
    setEvents([]);
    if (!account) {
      throw new Error("Account not initialized");
    }
    addEvent("Sending transaction...");

    const client = await Client.init(rpcUrl, entryPoint);
    const provider = new JsonRpcProvider(rpcUrl);

    const target = getAddress("0xf5323e81d2cbe37b81fcf8481560bb3670043c6b");
    const partialContractABI = [
      "function sendMessage(string memory _content, int _messageType) public payable",
    ];
    
    const erc20 = new ethers.Contract(target, partialContractABI, provider);

    var amount="0"
    if(message_type>0){
      amount="0.0001"
    }
    const value = parseEther(amount);
    try{
      const res = await client.sendUserOperation(
        account.execute(target, value,erc20.interface.encodeFunctionData("sendMessage", [message, message_type])),
        {
          onBuild: async (op) => {
            // addEvent(`Signed UserOperation 123123: `);
            // addEvent(JSON.stringify(op, null, 2) as any);
            console.log("Signed UserOperation:", op);
          },
        }
      );
      addEvent(`UserOpHash: ${res.userOpHash}`);

      addEvent("Waiting for transaction...");
      const ev = await res.wait();
      setEvents([]);
      addEvent(`Transaction hash: ${ev?.transactionHash ?? null}`);
      setText('');
    }
    catch{
      addEvent("Error Sending Transaction");
      addEvent("Please check if you have sufficient fund");
    }
  };

  const handleTextChange = (e: { target: { value: string ; }; }) => {
    // Trim the input to a maximum of 100 characters
    const trimmedText = e.target.value.slice(0, 100);
    setText(trimmedText);
  };

  if (loading) {
    return <p>loading...</p>;
  }
  return (
    <main
      className={styles.outer_container}
    >

        <div className={styles.inner_container}>
          {idToken ? (
            <div>
             <div className={styles.top_block}>
              <div className={styles.header}>
                <h1 className={styles.card_title}>Base Chat</h1>
                <div className={styles.visa}>
                    <img src="base_icon.png" alt="Base Icon" className={styles.baseIcon} />
                    <span className={styles.visaText}>Base <br/>Georli</span> 
                 </div>
              </div>
              <div className={styles.card}>
                <div className={styles.cardContent}>
                  <div className={styles.accountNumber}>{account?.getSender()}</div>
                 
                </div>
                
              </div>   
              <div className={styles.card_footer}>
              <div className={styles.balance}>
                  <div>Balance</div> 
                  <div>{(balance / 1000000000000000000).toFixed(6)} ETH</div>
              </div>
              <button type="button" onClick={logout} className={styles.logout}>
                Logout
              </button>
              </div>   
            </div>

                <WagmiConfig config={config}>
                  <MyChat currentaddr={myaddress}></MyChat>
                </WagmiConfig>
                <div>
                <div className={styles.lower_container}>
                  <div className={styles.input_group}>
                      
                        <select
                              className={styles.select_menu}
                              value={messageType}
                              onChange={(e) => setMessageType(Number(e.target.value))}
                            >
                              <option className={styles.option0} value="0">Select Standard Text(Free)</option>
                              <option className={styles.option1} value="1">Bold Text (0.0001 ETH)</option>
                              <option className={styles.option2} value="2">Colorful Text(0.0001 ETH)</option>
                              <option className={styles.option3} value="3">Large Text (0.0001 ETH)</option>
                              {/* Add more options as needed */}
                            </select>
                      <div className={styles.send_group}>
                            
                      <input
                            className={styles.input_text}
                            type="text"
                            placeholder="Your Message (Max 100 Char)"
                            value={text}
                            onChange={handleTextChange}
                          />
                            <button className={styles.send_button} onClick={() =>sendTransaction(text, messageType)} disabled={text.length === 0}>
                              Send 
                            </button>
                      </div>
                  </div>
                  <div className={styles.transaction_display}>
                    {events.map((event, index) => (
                      <div key={index} className={styles.event}>
                        {event}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
             
            </div>
          ) : (
            <div className={styles.login_wrapper}>
                <img src="basechat_icon.png" alt="Base Icon" className={styles.baseChatIcon} />
              <h1 className={styles.title}> Base Chat </h1>
              <button
                type="button"
                onClick={login}
                className={styles.login}
              >
                Login with Google
              </button>
              <div className={styles.reminder}>Please Use Social Login instead of Wallet <br/> Allow Pop-Up Window to Login</div>
            </div>
          )}
        </div>
          <Footer></Footer>
    </main>
  );
}
