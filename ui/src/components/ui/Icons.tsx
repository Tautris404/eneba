import styles from './Icons.module.css';

export function CartIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.7499H5.386C5.1498 12.75 4.9212 12.6664 4.74067 12.5139C4.5602 12.3615 4.43953 12.1502 4.4 11.9173L2.642 1.58395C2.60233 1.35119 2.4816 1.13996 2.30113 0.987686C2.12067 0.835406 1.89213 0.7519 1.656 0.751953H1" />
      <path d="M10.75 14.75C10.8881 14.75 11 14.6381 11 14.5C11 14.3619 10.8881 14.25 10.75 14.25" />
      <path d="M10.75 14.75C10.6119 14.75 10.5 14.6381 10.5 14.5C10.5 14.3619 10.6119 14.25 10.75 14.25" />
      <path d="M5.75 14.75C5.88807 14.75 6 14.6381 6 14.5C6 14.3619 5.88807 14.25 5.75 14.25" />
      <path d="M5.75 14.75C5.61193 14.75 5.5 14.6381 5.5 14.5C5.5 14.3619 5.61193 14.25 5.75 14.25" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.03141 9.75007H12.0787C12.5247 9.75001 12.9578 9.60094 13.3093 9.32647C13.6608 9.05207 13.9105 8.66801 14.0187 8.23541L14.9854 4.36873C15.0038 4.29499 15.0052 4.21802 14.9895 4.14366C14.9737 4.0693 14.9412 3.99952 14.8944 3.93961C14.8476 3.87971 14.7878 3.83126 14.7194 3.79795C14.6511 3.76465 14.5761 3.74736 14.5001 3.7474H3.01075" />
    </svg>
  );
}

export function AccountIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 25" fill="currentColor" fillRule="evenodd" clipRule="evenodd" aria-hidden="true">
      <path d="M11.667 1.75a5.417 5.417 0 1 0 0 10.834 5.417 5.417 0 0 0 0-10.834Zm-2.77 2.647a3.917 3.917 0 1 1 5.54 5.54 3.917 3.917 0 0 1-5.54-5.54ZM6.07 16.902A7.917 7.917 0 0 1 19.583 22.5a.75.75 0 0 0 1.5 0 9.417 9.417 0 1 0-18.833 0 .75.75 0 0 0 1.5 0c0-2.1.834-4.113 2.319-5.598Z" />
    </svg>
  );
}

export function MenuIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.25 18.003L21.75 18.003" />
      <path d="M2.25 12.003L21.75 12.003" />
      <path d="M2.25 6.003L21.75 6.003" />
    </svg>
  );
}

export function DrawerCloseIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 15 15" fill="currentColor" fillOpacity="0.87" fillRule="evenodd" clipRule="evenodd" aria-hidden="true">
      <path d="M14.0815 1.58146C14.2645 1.3984 14.2645 1.1016 14.0815 0.918544C13.8984 0.735485 13.6016 0.735485 13.4185 0.918544L7.5 6.83709L1.58146 0.918544C1.3984 0.735485 1.1016 0.735485 0.918544 0.918544C0.735485 1.1016 0.735485 1.3984 0.918544 1.58146L6.83709 7.5L0.918544 13.4185C0.735485 13.6016 0.735485 13.8984 0.918544 14.0815C1.1016 14.2645 1.3984 14.2645 1.58146 14.0815L7.5 8.16291L13.4185 14.0815C13.6016 14.2645 13.8984 14.2645 14.0815 14.0815C14.2645 13.8984 14.2645 13.6016 14.0815 13.4185L8.16291 7.5L14.0815 1.58146Z" />
    </svg>
  );
}

export function CloseIcon({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 14 14" width={size} height={size} aria-hidden="true">
      <path fill="currentColor" fillRule="evenodd" d="M14 1.67L12.59.31 7 5.69 1.41.31 0 1.67l5.59 5.37L0 12.42l1.41 1.36L7 8.4l5.59 5.38L14 12.42 8.41 7.04z" />
    </svg>
  );
}

export function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M11.655 3.29049C11.9513 2.9982 11.9547 2.52095 11.6625 2.22453C11.3703 1.9281 10.8933 1.92476 10.597 2.21705L1.22442 11.4633C1.08084 11.6049 1 11.7983 1 12C1 12.2017 1.08084 12.3951 1.22442 12.5367L10.597 21.783C10.8933 22.0752 11.3703 22.0719 11.6625 21.7755C11.9547 21.4791 11.9513 21.0018 11.655 20.7095L3.59054 12.7538H22.2457C22.6618 12.7538 22.9991 12.4163 22.9991 12C22.9991 11.5837 22.6618 11.2462 22.2457 11.2462H3.59057L11.655 3.29049Z" />
    </svg>
  );
}

export function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
      <path fill="currentColor" d="M11.76 4.6a.79.79 0 0 0-.58-.24H7.64V.82A.79.79 0 0 0 7.4.24.79.79 0 0 0 6.82 0H5.18a.79.79 0 0 0-.58.24.79.79 0 0 0-.24.58v3.54H.82a.79.79 0 0 0-.58.24.79.79 0 0 0-.24.58v1.64c0 .23.08.42.24.58.16.16.35.24.58.24h3.54v3.54c0 .23.08.42.24.58.16.16.35.24.58.24h1.64c.23 0 .42-.08.58-.24a.79.79 0 0 0 .24-.58V7.64h3.54c.23 0 .42-.08.58-.24a.79.79 0 0 0 .24-.58V5.18a.79.79 0 0 0-.24-.58z" />
    </svg>
  );
}

type ChevronRightIconProps = {
  className?: string;
  width?: number;
  height?: number;
};

export function ChevronRightIcon({ className, width = 9, height = 15 }: ChevronRightIconProps) {
  return (
    <svg className={className} width={width} height={height} viewBox="0 0 9 15" aria-hidden="true">
      <path fill="currentColor" d="M.65.64c-.2.2-.2.51 0 .7L7.24 7.5.65 13.66c-.2.19-.2.5 0 .7.21.19.55.19.75 0l6.95-6.5c.1-.1.15-.22.15-.35a.49.49 0 0 0-.15-.35L1.4.66A.54.54 0 0 0 .65.64z" />
    </svg>
  );
}

export function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 17L22.7499 22.75" />
      <path d="M1 10.25C1 12.7033 1.97455 15.056 3.70926 16.7907C5.44397 18.5254 7.79675 19.5 10.25 19.5C12.7033 19.5 15.056 18.5254 16.7907 16.7907C18.5254 15.056 19.5 12.7033 19.5 10.25C19.5 7.79675 18.5254 5.44397 16.7907 3.70926C15.056 1.97455 12.7033 1 10.25 1C7.79675 1 5.44397 1.97455 3.70926 3.70926C1.97455 5.44397 1 7.79675 1 10.25Z" />
    </svg>
  );
}

export function GhostIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="45" height="89" viewBox="0 0 45 89" aria-hidden="true">
      <text x="15" y="21" fill="#19cea0" fontSize="30" fontWeight="700">?</text>
      <path
        fill="currentColor"
        transform="translate(0 31)"
        d="M22.4586576,3.58865586e-05 C10.0512108,0.0224655711 0,10.1576244 0,22.6569626 L0,54.2239116 C0,55.9060247 2.01964686,56.748384 3.20085847,55.5590443 L7.50001875,51.1039198 L13.6741556,57.4469893 C14.4065068,58.1843369 15.5936807,58.1843369 16.3259194,57.4469893 L22.4999438,51.1039198 L28.6740806,57.4469893 C29.4063193,58.1843369 30.5934932,58.1843369 31.3257319,57.4469893 L37.4999813,51.1039198 L41.7991415,55.558931 C42.9802406,56.7482707 45,55.9059114 45,54.2237983 L45,22.8510134 C44.9998875,10.3666283 34.8565422,-0.0222805168 22.4586576,3.58865586e-05 Z M13.5,30 C10.4671407,30 8,27.5328593 8,24.5 C8,21.4671407 10.4672507,19 13.5,19 C16.5327493,19 19,21.4672507 19,24.5 C19,27.5327493 16.5328593,30 13.5,30 Z M31.5,30 C28.4671407,30 26,27.5328593 26,24.5 C26,21.4671407 28.4672507,19 31.5,19 C34.5327493,19 37,21.4672507 37,24.5 C37,27.5327493 34.5328593,30 31.5,30 Z"
      />
    </svg>
  );
}
