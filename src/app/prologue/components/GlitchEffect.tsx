import styles from './GlitchEffect.module.scss';

function GlitchEffect () {
    return (
        <div>
            <div 
              className={styles.glitch} 
              style={{ backgroundImage: "url('/prologue.png')" }}
            >
                <div className={styles.channel + " " + styles.r}></div>
                <div className={styles.channel + " " + styles.g}></div>
                <div className={styles.channel + " " + styles.b}></div>
            </div>
        </div>
    );
};

export default GlitchEffect;
