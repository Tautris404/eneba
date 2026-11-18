export function AddedCartIcon() {
  return (
    <svg viewBox="0 0 24 24" strokeWidth="1.5" width="84" height="84" aria-hidden="true">
      <path d="M 18.524 5.068 L 14.589 10.318 C 14.218 10.813 13.496 10.864 13.058 10.427 L 11.024 8.393" fill="none" stroke="#00CF9F" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 15.75 20.968 C 15.75 19.525 17.313 18.623 18.563 19.344 C 19.143 19.679 19.5 20.298 19.5 20.968 C 19.5 22.411 17.938 23.313 16.688 22.592 C 16.107 22.257 15.75 21.638 15.75 20.968 Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" transform="matrix(-1, 0, 0, -1, 35.25, 41.936001)" />
      <path d="M 8.25 20.968 C 8.25 19.525 9.812 18.623 11.062 19.344 C 11.643 19.679 12 20.298 12 20.968 C 12 22.411 10.437 23.313 9.187 22.592 C 8.607 22.257 8.25 21.638 8.25 20.968 Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" transform="matrix(-1, 0, 0, -1, 20.25, 41.936001)" />
      <path d="M 0.75 10.156 L 3.079 2.269 C 3.254 1.612 3.849 1.156 4.529 1.156 L 15.347 1.156 C 16.028 1.154 16.624 1.611 16.8 2.269 L 20.038 14.423 C 20.3 15.408 21.193 16.093 22.212 16.093 L 23.25 16.093" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" transform="matrix(-1, 0, 0, -1, 24, 17.248995)" />
    </svg>
  );
}

export function EmptyCartIcon({ color = '#b3aac9' }: { color?: string }) {
  return (
    <svg viewBox="0 0 15 15" width="40" height="40" aria-hidden="true">
      <path fill={color} fillRule="nonzero" d="M7.5 0a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15zm1.56 11.62c-.39.16-.7.27-.92.35-.23.08-.5.12-.8.12a1.6 1.6 0 0 1-1.1-.34 1.1 1.1 0 0 1-.38-.87 3.15 3.15 0 0 1 .12-.9l.48-1.7.11-.47c.03-.15.04-.28.04-.4 0-.22-.04-.37-.13-.46-.1-.08-.26-.12-.52-.12-.12 0-.25.01-.38.05L5.24 7l.13-.52c.32-.13.62-.24.9-.33.3-.1.57-.14.83-.14.46 0 .82.11 1.07.34.25.22.38.51.38.87a5.08 5.08 0 0 1-.12.9l-.48 1.7a4.81 4.81 0 0 0-.16.87c0 .23.05.38.16.46.1.09.27.13.52.13a2.26 2.26 0 0 0 .72-.17l-.13.52zm-.08-6.9c-.23.2-.5.3-.81.3-.32 0-.59-.1-.82-.3a1 1 0 0 1-.33-.76 1 1 0 0 1 .33-.76c.23-.21.5-.32.82-.32.31 0 .58.1.8.32a1 1 0 0 1 .34.76 1 1 0 0 1-.33.76z" />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" strokeWidth="1.5" width="16" height="16" aria-hidden="true">
      <g>
        <line x1="1" y1="5" x2="23" y2="5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.25,1H9.75a1.5,1.5,0,0,0-1.5,1.5V5h7.5V2.5A1.5,1.5,0,0,0,14.25,1Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="9.75" y1="17.75" x2="9.75" y2="10.25" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="14.25" y1="17.75" x2="14.25" y2="10.25" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18.86,21.62A1.49,1.49,0,0,1,17.37,23H6.63a1.49,1.49,0,0,1-1.49-1.38L3.75,5h16.5Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export function DigitalProductIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" width="14" height="14" aria-hidden="true">
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M9 9.00004C9.00011 8.45007 9.15139 7.91071 9.43732 7.44091C9.72325 6.97111 10.1328 6.58895 10.6213 6.33619C11.1097 6.08344 11.6583 5.96982 12.2069 6.00776C12.7556 6.04569 13.2833 6.23372 13.7323 6.55129C14.1813 6.86886 14.5344 7.30375 14.7529 7.80843C14.9715 8.31311 15.0471 8.86816 14.9715 9.41291C14.8959 9.95766 14.6721 10.4712 14.3244 10.8973C13.9767 11.3234 13.5185 11.6457 13 11.829C12.7074 11.9325 12.4541 12.1241 12.275 12.3775C12.0959 12.631 11.9998 12.9337 12 13.244V14.25" />
      <path stroke="currentColor" d="M12 18C11.7929 18 11.625 17.8321 11.625 17.625C11.625 17.4179 11.7929 17.25 12 17.25" />
      <path stroke="currentColor" d="M12 18C12.2071 18 12.375 17.8321 12.375 17.625C12.375 17.4179 12.2071 17.25 12 17.25" />
      <path stroke="currentColor" strokeMiterlimit="10" d="M12 23.25C18.2132 23.25 23.25 18.2132 23.25 12C23.25 5.7868 18.2132 0.75 12 0.75C5.7868 0.75 0.75 5.7868 0.75 12C0.75 18.2132 5.7868 23.25 12 23.25Z" />
    </svg>
  );
}
