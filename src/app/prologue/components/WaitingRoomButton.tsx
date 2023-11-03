import styles from './WaitingRoomButton.module.css';

function WaitingRoomButton() {
    return (
        <main className={styles.container}>
            <div className={styles.section}>
                <div className={styles.text}>
                    <div className={styles.character}></div>
                    <div className={styles.character}></div>
                </div>
            </div>
        </main>
    );
}

export default WaitingRoomButton;
