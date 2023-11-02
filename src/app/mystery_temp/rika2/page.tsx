'use client'

import { useState } from 'react';

const IndexPage = () => {
  const [showPasswordButtons, setShowPasswordButtons] = useState(false);
  const [clickSequence, setClickSequence] = useState<string[]>([]); // 現在のクリック順を格納するステート
  const correctSequence = ['7', '3', '*', '5', '7']; // 正しいクリック順

  const playMusic = (file: string) => {
    const audio = new Audio(file);
    audio.play();
  };

  const handleButtonClick = (key: string) => {
    playMusic(`/sound${key}.m4a`);
    setClickSequence(prev => [...prev, key]);

    // 6回以上クリックされた場合、最初のクリックを取り除く
    if (clickSequence.length >= 5) {
      setClickSequence(prev => prev.slice(1));
    }
  };

  const isUnlocked = JSON.stringify(clickSequence) === JSON.stringify(correctSequence);

  const styles = {
    container: {
      position: 'relative', // 追加: relative positioning
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh'
    },
    background: {
      position: 'absolute', // 位置を絶対位置に設定
      top: 0,               // 以下の4行で画面全体をカバー
      right: 0,
      bottom: 0,
      left: 0,
      backgroundImage: "url('/passwordbox.png')",
      backgroundSize: 'cover',
      zIndex: 1, // 他のコンテンツの下に表示
    },
    content: {
      zIndex: 100, // 背景より上に表示
      textAlign: 'center',
      color: 'white'
    },
    passwordButtons: {
      marginTop: '20px',
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '10px',
      color: 'white'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.background}></div>
      <div style={styles.content}>
        {/* 「箱の鍵が開いた」が表示された場合、「箱を開ける」というボタンを表示しないように変更 */}
        {!isUnlocked && (
          <button onClick={() => setShowPasswordButtons(!showPasswordButtons)}>
            箱を開ける
          </button>
        )}

        {showPasswordButtons && (
          <div style={styles.passwordButtons}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '＃'].map((key) => (
              <button
                key={key}
                onClick={() => handleButtonClick(key)}
              >
                {key}
              </button>
            ))}
          </div>
        )}
        {isUnlocked && <div>箱の鍵が開いた。中から銃がでてきた。</div>}
      </div>
    </div>
  );
}

export default IndexPage;
