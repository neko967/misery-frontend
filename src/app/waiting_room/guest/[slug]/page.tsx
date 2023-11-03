'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'
import styles from '../../components/WaitingRoomButton.module.css';

function WaitingRoomButton() {
  return (
      <main className={styles.container}>
          <div className={styles.section}>
              <div className={styles.text}>
                  <div className={styles.character}>⚠️注意!</div>
                  <div className={styles.character}>このアプリはビックリするような表現が含まれます。</div>
              </div>
          </div>
      </main>
  );
}
export default function Home({ params }: { params: { slug: string } }) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const router = useRouter();
  const [readyToPrologue, setReadyToPrologue] = useState(false);

  useEffect(() => {
    async function checkRoomExists() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_HTTP_URL}/api/room-exists/${params.slug}`);
      const data = await res.json();

      if (!data.exists) {
        router.push('/');
      } else {
        const websocketUrl = `${process.env.NEXT_PUBLIC_BACKEND_WEBSOCKET_URL}/${params.slug}`;
        const websocket = new WebSocket(websocketUrl);
        setWs(websocket);

        websocket.onmessage = (event) => {
          if (event.data == "readyToPrologue") {
            setReadyToPrologue(true);
          }
          if (event.data == "goPrologue") {
            router.push(`/prologue/guest/${params.slug}`);
          }
        };

        return () => {
          websocket.close();
        };
      }
    }

    
   

    checkRoomExists();
  }, [params.slug]);

  async function clickReady() {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send('readyToPrologue');
    }
  }

  return (
    <div
      className="h-screen w-full bg-cover"
      style={{ backgroundImage: "url('/Central.png')" }}
    >
       <button className="my-button" >
  <WaitingRoomButton></WaitingRoomButton> 
  
</button>
      <button onClick={clickReady}
              className="game-start">
        準備OK?
      </button>
      <p className="code">CODE: {params.slug}</p>
    </div>
  );
}


