'use client';
import React from 'react';
import Link from 'next/link';

export default function Home() {

  return (
    <div
      className="h-screen w-full bg-cover"
      style={{ backgroundImage: "url('/credits.png')" }}
    >
      <div className="thanks-message">
        Thank You For Playing!!
      </div>
      <div className="absolute bottom-20 left-20 text-xl">
        <p className="end_title">True End: 少女の正体</p>
      </div>
      <div className="true_title">ヒント:JOIN ROOMに「MISERY」と入力すると...？</div>
      {/* トップページへのリンク */}
      <Link href="/"
        className="end-button text-white">
        TOPページに戻る
      </Link>
    </div>
  );
}


