// TextEffect.js
import React, { useEffect, useRef } from 'react';
import styles from './TextEffect.module.scss';

function TextEffect() {
  const textRef = useRef(null);

  useEffect(() => {
    if (textRef.current) {
      const target = textRef.current;
      const options = { rootMargin: "0px 0px -25% 0px" };

      // アニメーションを適用する関数
      function applyAnimation(className) {
        const elements = document.getElementsByClassName(className);
        for (let element of elements) {
          let text = element.innerText;
          let newText = '';
          for (let char of text) {
            newText += `<span class='${className}-char'>${char}</span>`;
          }
          element.innerHTML = newText;
        }
      }

      // IntersectionObserverの設定
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("sl-txtNz--active");
          } else {
            entry.target.classList.remove("sl-txtNz--active");
          }
        });
      }, options);

      applyAnimation("sl-txtNz");
      observer.observe(target);
    }
  }, []);

  return (
    <main className={styles.container}>
      <section className={styles.section}>
        <p ref={textRef} className={`${styles.text} sl-txtNz`} data-color="dark" data-type="normal">
          <br />
        </p>
      </section>
      
      {/* 他のセクションも同様に追加 */}
    </main>
  );
}

export default TextEffect;



