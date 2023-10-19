'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Dealer({ params }: { params: { slug: string } }) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function checkRoomExists() {
      const res = await fetch(`http://127.0.0.1:8000/api/room-exists/${params.slug}`);
      const data = await res.json();

      if (!data.exists) {
        router.push('/waiting_room');
      } else {
        const currentHost = window.location.host; // 例: localhost:3000
        const wsHost = currentHost.replace('3000', '8000');
        const websocketUrl = `ws://${wsHost}/ws/${params.slug}`;
        const websocket = new WebSocket(websocketUrl);
        setWs(websocket);

        websocket.onmessage = (event) => {
          setMessage(event.data);
        };

        return () => {
          websocket.close();
        };
      }
    }

    checkRoomExists();
  }, [params.slug]);

  const sendMessage = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send('horror');
    }
  };

  return (
    <div>
      <h1>Dealer Room {params.slug}</h1>
      <button onClick={sendMessage}>あのボタン</button>
      <div>Received message: {message}</div>
    </div>
  );
}
