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
                    <div className={styles.character}>心臓の弱い方は注意してください。</div>
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
            router.push(`/prologue/host/${params.slug}`);
          }
        };

        return () => {
          websocket.close();
        };
      }
    }

    checkRoomExists();
  }, [params.slug]);

  async function goPrologue() {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send('goPrologue');
    }
  }
  async function goMysteryClean() {
    router.push(`/mystery/clean/${params.slug}`);
  }

  async function goMysteryDirty() {
    router.push(`/mystery/dirty/${params.slug}`);
  }

  return (
    <div
      className="h-screen w-full bg-cover"
      style={{ backgroundImage: "url('/Central.png')" }}
    >
    <button className="my-button">
  <WaitingRoomButton></WaitingRoomButton> 
</button>


      {readyToPrologue &&
        <button onClick={goPrologue}
                className="game-start">
          GAME START
        </button>
      }
      <p className="code">CODE: {params.slug}</p>
    </div>
  );
}


