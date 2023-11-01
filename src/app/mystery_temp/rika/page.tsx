'use client'

import { useState } from 'react';

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
        <button onClick={() => playMusic('/misery.m4a')}>
          オルゴール
        </button>
      </div>
    </div>
  );
};

export default IndexPage;
