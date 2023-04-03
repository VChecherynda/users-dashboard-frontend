import { useEffect, useState } from 'react';
import { FaUser } from 'react-icons/fa';

import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';

interface Message {
    userName: string;
    message: string;
}

export default function Chat() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [userName, setUserName] = useState('');
    const [userNameTyping, setUserNameTyping] = useState('');
    const [isJoined, setIsJoined] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        const newSocket = io('http://localhost:3000');

        setSocket(newSocket);
        return () => {
            newSocket.close()
        };
    }, []);

    useEffect(() => {
        if(socket === null) {
            return;
        };

        socket.emit('findAllMessages',{}, (response: Message[]) => {
            setMessages(response);
        })
  
        socket.on('message', (message: Message) => {
            setMessages((messages) => [...messages, message]);
        });

        socket.on('typing', ({isTyping, userName }) => {
            setIsTyping(isTyping);
            setUserNameTyping(userName);
        });

    },[socket])

    const join = () => {
        if(socket === null) {
            return;
        }

        socket.emit('join', { userName }, (userNames: string[]) => {
            setIsJoined(true);
        })
    }

    const sendMessage = () => {
        if(socket === null) {
            return;
        }

        socket.emit('createMessage', { userName, message });
        setMessage('');
    }

    const typing = (isTyping: boolean) => {
        if(socket === null) {
            return;
        }

        socket.emit('typing', { userName, isTyping })
    }
 
    return  (
        <div>
            {isJoined ? (
                <>
                    <div>
                        {messages.map((messageData, index) => (
                            <div key={index}>
                              <><FaUser /> {messageData.userName}: {messageData.message}</>
                            </div>
                        ))}
                        {isTyping ? `${userNameTyping}: ...` :  null}
                    </div>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onFocus={() => typing(true)}
                        onBlur={() => typing(false)}
                        placeholder="Enter message..."
                    />
                    <br />
                    <button
                        onClick={sendMessage}
                    >
                        Send Message
                    </button>
                </>
            ) : (
                <>
                    <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Enter user name..."
                    />
                    <br />
                    <button
                        onClick={join}
                    >
                        Add user name
                    </button>
                </>
            )}
        </div>
    );
}