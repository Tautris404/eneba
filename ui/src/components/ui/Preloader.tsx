import styles from './Preloader.module.css';

type PreloaderProps = {
  size?: 'sm' | 'md' | 'lg';
  color?: 'white' | 'black' | 'primary';
  label?: string;
  centered?: boolean;
};

export function Preloader({ size = 'md', color = 'white', label, centered = false }: PreloaderProps) {
  const className = [styles.preloader, centered ? styles.centered : styles.inline, styles[size], styles[color]].join(' ');

  return (
    <span className={className} aria-hidden={label ? undefined : true}>
      <svg className={styles.spinner} viewBox="0 0 32 32" aria-hidden="true">
        <path
          fill="currentColor"
          d="M16 32c-4.27 0-8.3-1.66-11.31-4.69A15.96 15.96 0 0 1 2.46 7.48a16.06 16.06 0 0 1 6.38-5.8l1.35 2.69A13.04 13.04 0 0 0 3 16c0 7.17 5.83 13 13 13a13.01 13.01 0 0 0 5.81-24.63l1.35-2.68A16.05 16.05 0 0 1 32 16c0 4.27-1.66 8.3-4.69 11.31S20.27 32 16 32z"
        />
      </svg>
      {label && <span className={styles.label}>{label}</span>}
    </span>
  );
}
