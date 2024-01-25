'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const storyTexts = [
    '二人の探検者は手分けして探索することを決めた。一方が綺麗な部屋へ、もう一方は寂れた部屋へと足を進める。',
    '綺麗な部屋には時間が止まったかのような静寂が漂い、寂れた部屋は過去の栄華を色濃く残す荒廃が存在した。',
    '二つの部屋は異なる物語と未解の謎を秘め、探検者たちはそれぞれの扉を静かに開ける。',
    '綺麗な部屋へ進んだ探検者は整然と保たれた空間で手がかりを求め、寂れた部屋に入った者は壁に投げかけられた自分の影と風の唸りに耳を傾けた。',
    'やがて、彼らが再会する時、それぞれの経験は一つの大きな物語を紡ぎ、洋館の謎を解き明かす鍵となるだろう。二人の旅は、このとき始まりを告げる。',
  ];

  const nextText = () => {
    setCurrentTextIndex((prevIndex) => prevIndex + 1);
  };

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
            if ( hostWhichRoom && guestWhichRoom && hostWhichRoom !== guestWhichRoom) {
              router.push(`/mystery/${hostWhichRoom}/${params.slug}`);
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
      ws.send('hostMysteryClean');
    }
  }

  async function clickMysteryDirty() {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send('hostMysteryDirty');
    }
  }

  async function goMystery() {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send('goMystery');
    }
  }

  return (
    <div
      className="h-screen w-full bg-cover flex justify-center items-center position: relative"
      style={{ backgroundImage: "url('/prologue.png')" }}
    >
      {/* Story Texts */}
      {currentTextIndex < storyTexts.length && (
        <div
          style={{
            position: 'absolute', // This might be changed if needed
            backgroundColor: 'rgba(0, 0, 0, 0.56)',
            color: 'white',
            padding: '20px',
            borderRadius: '10px',
            textAlign: 'center',
            width: '1000px',
            maxHeight: '80vh',
            overflowY: 'auto',
            zIndex: 1000,
          }}
        >
          <p style={{ margin: '10px', height: '20px' }}>{storyTexts[currentTextIndex]}</p>
          <div
            style={{
              position: 'absolute',
              right: '10px',
              bottom: '10px',
              cursor: 'pointer',
              fontSize: '24px',
              animation: 'bounce 1s infinite'
            }}
            onClick={nextText}
          >
            ▼
          </div>
        </div>
      )}

      {/* Buttons */}
      {currentTextIndex >= storyTexts.length && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
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

          {hostWhichRoom && guestWhichRoom && (hostWhichRoom !== guestWhichRoom) && (
            <button onClick={goMystery} className="game-start-host-door" type="button">
              ドアを開ける..
            </button>
          )}
        </div>
      )}
    </div>
  );
}

