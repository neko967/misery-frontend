'use client';

import React, { useState, useEffect } from 'react';

const styles = {
  container: {
    position: 'relative', // 追加: relative positioning
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
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
    color: 'white',
    fontSize: '1.75rem', // テキストサイズを大きくする
  },
  passwordButtons: {
    background: 'rgba(0, 0, 0, 0.5)', // 薄い黒い透けている背景
    marginTop: '20px',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '30px',
    color: 'white',
  },
  unlockButton: {
    border: 'none',
    cursor: 'pointer',
    textAlign: 'center',
    fontSize: '1.25rem', // テキストサイズを大きくする
  },
  textWindow: {
    background: 'rgba(0, 0, 0, 0.5)', // 薄い黒い透けている背景
    padding: '50px',
    borderRadius: '10px',
    position: 'absolute',
    bottom: '40%',
    left: '30%',
    right: '30%',
    textAlign: 'center',
    fontSize: '1.25rem', // テキストサイズを大きくする
  },
  passwordDisplay: {
    marginTop: '10px',
    fontSize: '3rem',
    color: 'yellow',
  },
  openButton: {
    padding: '15px 30px', // ボタンのパディングを増やす
    fontSize: '1.5rem',  // フォントサイズを大きくする
    border: 'none',       // ボーダーを非表示にする場合
    cursor: 'pointer',    // カーソルをポインターにする
  },
};

const PasswordButton = ({ value, onClick }) => (
  <button
    className="btn btn-square"
    onClick={() => onClick(value)}
  >
    {value}
  </button>
);

const PasswordDisplay = ({ password }) => (
  <div style={styles.passwordDisplay}>{password}</div>
);

const ErrorMessage = ({ showError }) => (
  showError && <div style={{ color: 'red' }}>パスワードが違います</div>
);

const IndexPage: React.FC = () => {
  const [showPasswordButtons, setShowPasswordButtons] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [passwordAttempted, setPasswordAttempted] = useState<boolean>(false);
  const correctSequence: string = '7305*7'; // 正しいパスワード
  const [showError, setShowError] = useState<boolean>(false);

  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => {
        setShowError(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showError]);

  const playMusic = (file: string): void => {
    const audio = new Audio(file);
    audio.play();
  };

  const handleButtonClick = (key: string): void => {
    if (password.length < 6) {
      playMusic(`/sound${key}.m4a`);
      setPassword((prev: string) => prev + key); // パスワードに文字を追加
    }
  };

  const checkPassword = (): void => {
    setPasswordAttempted(true); // パスワードの試行状態を true に設定
    if (password === correctSequence) {
      // パスワードが正しい場合
      setShowPasswordButtons(false);
      setShowError(false); // エラーメッセージが表示されていれば消去
    } else {
      setShowError(true); // エラーを表示
    }
  };

  const handleRetry = (): void => {
    setPassword(''); // パスワードをリセット
    setPasswordAttempted(false); // 試行状態をリセット
    setShowPasswordButtons(true); // ボタンを再表示
  };

  // パスワードの変更をハンドルする
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setPassword(event.target.value);
  };

  // パスワードの送信をハンドルする
  const handleSubmit = (): void => {
    checkPassword();
  };

  // 箱が開いたかどうかの状態は、passwordAttempted とパスワードが正しいかで判断する
  const isUnlocked: boolean = passwordAttempted && password === correctSequence;
  const passwordKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '＃'];

  return (
    <div style={styles.container}>
      <div style={styles.background}></div>
      <div style={styles.content}>
        {!showPasswordButtons && !passwordAttempted && (
          <button
            className="btn btn-neutral"
            style={styles.openButton} // スタイルを適用
            onClick={() => setShowPasswordButtons(true)}>箱を開ける</button>
        )}

        {showPasswordButtons && (
        <>
          <div style={styles.passwordButtons}>
            {passwordKeys.map((key) => (
              <PasswordButton key={key} value={key} onClick={handleButtonClick} />
            ))}
          </div>
          <div style={{ marginTop: '30px' , marginBottom: '40px'}}>
            <PasswordDisplay password={password} />
            {/* passwordAttempted が false の場合のみ「確認」ボタンを表示 */}
            {!passwordAttempted && (
              <button
                className="btn btn-neutral"
                style={styles.unlockButton} onClick={handleSubmit}>
                確認
              </button>
              )}
              <ErrorMessage showError={showError} />
            </div>
          </>
        )}

        {isUnlocked && <div>箱の鍵が開いた。中から銃が出てきた。</div>}

        {passwordAttempted && !isUnlocked && (
          <div>
            <button onClick={handleRetry}>もう一度入力する</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IndexPage;

