import appStoreBadge from '../../assets/images/app-store.svg';
import googlePlayBadge from '../../assets/images/google-play.svg';

export function AppDownloadLinks() {
  return (
    <>
      <a href="https://play.google.com/store/apps/details?id=com.eneba.app" target="_blank" rel="noopener noreferrer">
        <img src={googlePlayBadge} alt="Get it on Google Play" width="136" height="40" loading="lazy" />
      </a>
      <a href="https://apps.apple.com/app/apple-store/id1564406362" target="_blank" rel="noopener noreferrer">
        <img src={appStoreBadge} alt="Download on the App Store" width="135" height="40" loading="lazy" />
      </a>
    </>
  );
}
