'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();

  function TwitterIcon() {
    return (
      <svg viewBox="0 0 24 24" width="24" height="24">
        <g>
          <path d="M14.258 10.152L23.176 0h-2.113l-7.747 8.813L7.133 0H0l9.352 13.328L0 23.973h2.113l8.176-9.309 6.531 9.309h7.133zm-2.895 3.293l-.949-1.328L2.875 1.56h3.246l6.086 8.523.945 1.328 7.91 11.078h-3.246zm0 0" fill="#FFF" />
        </g>
      </svg>
    );
  }

  return (
    <div
      className="h-screen w-full bg-cover"
      style={{ backgroundImage: "url('/credits.png')" }}
    >
      <div className="thanks-message">
        Thank You For Playing!!
      </div>
     
      {/* Twitterリンク */}
      <div className="true_title">ヒント:JOIN ROOMに"MISERY"と入力すると...？</div>
           

      <div className="absolute bottom-20 left-20 text-xl">
        <p className="end_title">True End: 少女の正体</p>
      </div>
      {/* トップページへのリンク */}
      <Link href="/"
        className="end-button">
        TOPページに戻る
      </Link>
    </div>
  );
}


