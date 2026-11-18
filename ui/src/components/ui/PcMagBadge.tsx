import pcMag from '../../assets/images/pc-mag.svg';
import styles from './PcMagBadge.module.css';

export function PcMagBadge() {
  return (
    <div className={styles.award}>
      <div className={styles.awardBadge}>
        <img src={pcMag} alt="PCMag" width="40" height="40" loading="lazy" />
        <span className={styles.awardText}>Editor's<br />Choice</span>
      </div>
    </div>
  );
}
