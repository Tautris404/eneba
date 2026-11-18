import infoIcon from '../../assets/images/info.svg';
import { InfoTooltip } from '../../components/ui/InfoTooltip';
import styles from './HomeCatalog.module.css';

export function SectionTitle({ title, info }: { title: string; info?: string }) {
  return (
    <h2 className={styles.heading}>
      {title}
      {info && (
        <InfoTooltip label={`About ${title}`} text={info} gap={26} arrow={10} className={styles.headingInfo}>
          <img src={infoIcon} width="16" height="16" alt="" />
        </InfoTooltip>
      )}
    </h2>
  );
}

export function ShowAllLink({ title, href }: { title: string; href: string }) {
  return (
    <div className={styles.sectionAction}>
      <a className={styles.action} href={href} aria-label={`Show all – ${title}`}>Show all</a>
    </div>
  );
}
