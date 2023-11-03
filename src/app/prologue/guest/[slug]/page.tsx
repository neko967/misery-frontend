'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GlitchEffect from '../../components/GlitchEffect';
import TextEffect from '../../components/TextEffect';
import styles from '../../components/WaitingRoomButton.module.css';
import DirtyButtonStyles from '../../components/WaitingRoomDirtyButton.module.css';
function WaitingRoomButton() {
  return (
      <main className={styles.container}>
          <div className={styles.section}>
              <div className={styles.text}>
                  <div className={styles.character}>綺麗な</div>
                  <div className={styles.character}>部屋に入る？</div>
              </div>
          </div>
      </main>
  );
}
function WaitingRoomDirtyButton() {
  return (
      <main className={DirtyButtonStyles.container}>
          <div className={DirtyButtonStyles.section}>
              <div className={DirtyButtonStyles.text}>
                  <div className={DirtyButtonStyles.character}>寂れた</div>
                  <div className={DirtyButtonStyles.character}>部屋に入る？</div>
              </div>
          </div>
      </main>
  );
}

type RoomState = 'clean' | 'dirty';

export default function Home({ params }: { params: { slug: string } }) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const router = useRouter();
  const [hostWhichRoom, setHostWhichRoom] = useState<RoomState>();
  const [guestWhichRoom, setGuestWhichRoom] = useState<RoomState>();

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
          if (event.data == "goMystery") {
            if (guestWhichRoom == 'clean') {
              router.push(`/mystery/clean/${params.slug}`);
            } else if (guestWhichRoom == 'dirty') {
              router.push(`/mystery/dirty/${params.slug}`);
            }
          } else if (event.data == "hostMysteryClean") {
            setHostWhichRoom('clean');
          } else if (event.data == "hostMysteryDirty") {
            setHostWhichRoom('dirty');
          } else if (event.data == "guestMysteryClean") {
            setGuestWhichRoom('clean');
          } else if (event.data == "guestMysteryDirty") {
            setGuestWhichRoom('dirty');
          }
        };

        return () => {
          websocket.close();
        };
      }
    }

    checkRoomExists();
  }, [params.slug, hostWhichRoom, guestWhichRoom]);

  async function clickMysteryClean() {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send('guestMysteryClean');
    }
  }

  async function clickMysteryDirty() {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send('guestMysteryDirty');
    }
  }

  
  return (
    <div
      className="h-screen w-full bg-cover"
      style={{ backgroundImage: "url('/background.png')" }}
    >
      <GlitchEffect />
  
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-50 p-10 rounded-lg shadow-lg">
        <TextEffect>ここに特殊効果のテキスト</TextEffect>
      </div>
    
      <button className="clean-my-button" onClick={clickMysteryClean} type="button">
        <WaitingRoomButton />
        {hostWhichRoom === 'clean' && <span className="indicator-item indicator-start badge badge-secondary"></span>}
        {guestWhichRoom === 'clean' && <span className="indicator-item badge badge-primary"></span>}
      </button>
    
      <button className="dirty-my-button" onClick={clickMysteryDirty} type="button">
        <WaitingRoomDirtyButton />
        {hostWhichRoom === 'dirty' && <span className="indicator-item indicator-start badge badge-secondary"></span>}
        {guestWhichRoom === 'dirty' && <span className="indicator-item badge badge-primary"></span>}
      </button>
    
    
    </div>
  );
      }

