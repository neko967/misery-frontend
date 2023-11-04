'use client'

const IndexPage = () => {
  const playMusic = (file: string) => {
    const audio = new Audio(file);
    audio.play();
  };

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
      backgroundImage: "url('/musicbox.png')",
      backgroundSize: 'cover',
      zIndex: 1, // 他のコンテンツの下に表示
    },
    content: {
      zIndex: 100, // 背景より上に表示
      textAlign: 'center',
      color: 'white'
    },
    musicButton: {
      fontSize: '1.5rem',   // フォントサイズを大きくする
      cursor: 'pointer',    // カーソルをポインターにする
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.background}></div>
      <div style={styles.content}>
        <button
          className="btn btn-neutral"
          style={styles.musicButton} // ここに新しいスタイルを適用
          onClick={() => playMusic('/misery.m4a')}>
          オルゴールを鳴らす
        </button>
      </div>
    </div>
  );
};

export default IndexPage;
