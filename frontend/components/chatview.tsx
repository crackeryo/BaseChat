
import { useContractRead } from 'wagmi'
import React, { useEffect, useRef, useState } from 'react';

import styles from './chatview.module.css'
export default function MyChat({currentaddr}: { currentaddr: string }) {
    interface ChatMessage {
        sender: string;
        content: string;
        messageType: number;
      }
    const [chatData, setChatData] = useState<ChatMessage[]>([]);
    
    const basechatABI = [
        {
          "inputs": [],
          "name": "viewLatestMessages",
          "outputs": [
            {
              "components": [
                {
                  "internalType": "address",
                  "name": "sender",
                  "type": "address"
                },
                {
                  "internalType": "string",
                  "name": "content",
                  "type": "string"
                },
                {
                  "internalType": "int256",
                  "name": "messageType",
                  "type": "int256"
                }
              ],
              "internalType": "struct BaseChat.Message[]",
              "name": "",
              "type": "tuple[]"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
      ];
      
      const { data, isError, isLoading } = useContractRead({
        address: '0xf5323e81d2cbe37b81fcf8481560bb3670043c6b',
        abi: basechatABI,
        functionName: 'viewLatestMessages',
        watch: true,
        onSuccess(data: ChatMessage[]) {
          console.log('Success', data)
          setChatData(data);
        },
      })

      const chatContainerRef = useRef<HTMLDivElement | null>(null); 
      const [showJumpButton, setShowJumpButton] = useState(false);

      useEffect(() => {
        scrollToBottom();
        // Add an event listener to show/hide the button based on scroll position
        const handleScroll = () => {
          if (chatContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
            setShowJumpButton(scrollTop + clientHeight < scrollHeight - 50);
          }
        };
        if(chatContainerRef.current!==null) {
          chatContainerRef.current.addEventListener('scroll', handleScroll);
          return () => {
            if(chatContainerRef.current!==null) {
              chatContainerRef.current.removeEventListener('scroll', handleScroll);
            }
          };
        }
      
      }, [chatData]);
    
      // Function to scroll to the bottom of the chat container
      const scrollToBottom = () => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      };
    
      // Function to handle clicking the "Jump to Bottom" button
      const handleJumpToBottomClick = () => {
        scrollToBottom();
      };
      
      const colorPalette = [
        "#262626",
        "#255C99",
        '#7EA3CC',
        "#EAD2AC",
        '#FF8370',
        '#43AA8B',
        "#B6E2D5",
        "#9BB1FF",
        "#DAC4F7",
        "#D6F6DD",
        "#F4989C",
        "#ACECF7",

        // Add more colors as needed
      ];
      
      // Hash function to generate a deterministic number between 0 and 20
      function hashCode(str: string) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          hash = (hash << 5) - hash + str.charCodeAt(i);
        }
        return Math.abs(hash) % 12; // Ensure the result is within the range [0, 19]
      }
      
  return (
    <div>
          <div className={styles.chat_container} ref={chatContainerRef}>
            {chatData.map((message, index) => (

  
                <div key={index} className={`${styles.message} ${styles['type' + Number(message.messageType)]}  ${message.sender === currentaddr ? styles.sent : styles.received}`}>
                        <div className={styles.profile}>
                            <div className={styles.profileCircle} title={message.sender}
                            style={{ backgroundColor: colorPalette[hashCode(message.sender)] }}
                            
                            >
                            {message.sender.slice(2, 6)}
                            </div>
                        </div>
                        <div className={styles.messageContent}>
                            {/* <div className={styles.sender}>{message.sender}</div> */}
                            <div className={styles.content}>{message.content}</div>
                        </div>
                        
                </div>

            ))}

          
            </div>
            
          <button  className={`${styles.jump_button} ${showJumpButton ? styles.jump_button_enabled : styles.jump_buttom_disabled}`} onClick={handleJumpToBottomClick}>
              Jump to Bottom
          </button>
      </div>


  );
}