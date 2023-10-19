'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Player({ params }: {
  params: { slug: string },
}) {
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
        const websocket = new WebSocket(`ws://127.0.0.1:8000/ws/${params.slug}`);
        /*元はこうだったけどよく分からんので一旦直書き
        const websocket = new WebSocket(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}/${params.slug}`);*/
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
      <h1>player Room {params.slug}</h1>
      <button onClick={sendMessage}>例のアレボタン</button>
      <div>Received message: {message}</div>
    </div>
  );
}
