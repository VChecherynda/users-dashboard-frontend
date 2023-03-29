import { useEffect, useState } from 'react';
import { FaUser } from 'react-icons/fa';
import ScrollToBottom from 'react-scroll-to-bottom';

import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';

interface Message {
    username: string;
    message: string;
}

export default function Chat() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [userName, setUserName] = useState('');
    const [room, setRoom] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        const newSocket = io();
        setSocket(newSocket);
        return () => {
            newSocket.close()
        };
    }, []);

    useEffect(() => {
        if(socket === null) {
            return;
        };

        socket.on('history', (messages: Message[]) => {
            setMessages(messages)
        });

        socket.on('message', (message: Message) => {
            setMessages((messages) => [...messages, message])
        });

    },[socket])

    const joinRoom = () => {
        if(socket === null) {
            return;
        }

        socket.emit('joinRoom', { userName, room })
    }

    const sendMessage = () => {
        if(socket === null) {
            return;
        }

        socket.emit('message', { userName, room, message });
        setMessage('');
    }



    return  (
        <div>
            <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Enter username..." />
            <br />
            <input type="text" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="Enter room name..." />
            <br />
            <button onClick={joinRoom}>Join Room</button>
            <div>
                <ScrollToBottom>
                    {messages.map((message, index) => (
                        <div key={index}>
                        <FaUser /> {message.username}: {message.message}
                        </div>
                    ))}
                </ScrollToBottom>
            </div>
            <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Enter message..."/>
            <br />
            <button onClick={sendMessage}>Send Message</button>
        </div>
    );
}