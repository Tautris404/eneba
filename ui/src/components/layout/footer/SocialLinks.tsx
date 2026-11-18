import discord from '../../../assets/images/social/discord.svg';
import facebook from '../../../assets/images/social/facebook.svg';
import instagram from '../../../assets/images/social/instagram.svg';
import reddit from '../../../assets/images/social/reddit.svg';
import x from '../../../assets/images/social/x.svg';
import styles from './Footer.module.css';

const socialLinks = [
  { name: 'Facebook', href: 'https://www.facebook.com/enebaglobal/', icon: facebook },
  { name: 'X', href: 'https://x.com/eneba_games', icon: x },
  { name: 'Instagram', href: 'https://www.instagram.com/enebagames/', icon: instagram },
  { name: 'Discord', href: 'https://discord.gg/enebagames', icon: discord },
  { name: 'Reddit', href: 'https://www.reddit.com/r/Enebagames/', icon: reddit },
];

export function SocialLinks() {
  return (
    <ul className={styles.socialLinks}>
      {socialLinks.map((link) => (
        <li key={link.name}>
          <a href={link.href} aria-label={link.name} title={link.name} target="_blank" rel="noopener noreferrer">
            <img src={link.icon} alt="" width="20" height="20" loading="lazy" />
          </a>
        </li>
      ))}
    </ul>
  );
}
