import styles from './WaitingRoomDirtyButton.module.css';

function WaitingRoomDirtyButton() {
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

export default WaitingRoomDirtyButton;
