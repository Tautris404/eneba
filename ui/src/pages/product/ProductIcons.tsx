type IconProps = { className?: string };

export function GlobeIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="35" height="35" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="11" />
        <path d="M1 12h22M12 1c2.8 3 4.3 6.7 4.3 11S14.8 20 12 23C9.2 20 7.7 16.3 7.7 12S9.2 4 12 1z" />
        <path d="M2.6 6.5h18.8M2.6 17.5h18.8" />
      </g>
    </svg>
  );
}

export function KeyIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 42 41.99" width="35" height="35" aria-hidden="true">
      <ellipse cx="2.46" cy="2.95" rx="2.46" ry="2.95" fill="currentColor" transform="translate(27.52 8.85)" />
      <path fill="currentColor" d="M41.55 13.6a23.93 23.93 0 00-5.16-8.1A23.38 23.38 0 0028.33.42a6.6 6.6 0 00-7 1.49L14.9 8.33a6.57 6.57 0 00-1.37 7.28c.34.76.7 1.5 1.1 2.22L.48 31.97A1.64 1.64 0 000 33.13v7.22A1.64 1.64 0 001.64 42h7.22a1.64 1.64 0 001.64-1.64V37.4h2.95a1.64 1.64 0 001.64-1.65V32.8h2.96a1.64 1.64 0 100-3.28h-4.6a1.64 1.64 0 00-1.64 1.64v2.95H8.86a1.64 1.64 0 00-1.64 1.65v2.95H3.28v-4.9l14.55-14.55a1.64 1.64 0 00.24-2.01 26.55 26.55 0 01-1.55-2.98 3.27 3.27 0 01.69-3.62l6.44-6.4a3.31 3.31 0 013.5-.75 20.09 20.09 0 016.92 4.32 20.64 20.64 0 014.42 6.99 3.26 3.26 0 01-.73 3.5l-6.52 6.49a3.3 3.3 0 01-3.61.7 21.3 21.3 0 01-2.96-1.51 1.64 1.64 0 00-1.71 2.8 24.59 24.59 0 003.4 1.74 6.58 6.58 0 007.2-1.4l6.51-6.5a6.54 6.54 0 001.48-7.02z" />
    </svg>
  );
}

export function RefundIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 26 26" width="35" height="35" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 15.399v9.6M1 23.399h17.599a3.2 3.2 0 0 0-3.2-3.2h-4a3.2 3.2 0 0 0-3.2-3.2H1M7.4 20.198h4M19.508 4.978h-2.315a1.483 1.483 0 0 0-1.525 1.44 1.44 1.44 0 0 0 .96 1.334l2.346.896a1.44 1.44 0 0 1 .96 1.333 1.483 1.483 0 0 1-1.525 1.44h-2.314M17.8 4.979V3.667M17.8 12.733V11.42" />
        <path d="M10.6 8.2a7.2 7.2 0 1 0 14.4 0 7.2 7.2 0 0 0-14.4 0Z" />
      </g>
    </svg>
  );
}

export function AddToCartIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" width="18" height="18" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 12.75H5.386a1 1 0 0 1-.986-.833L2.642 1.584A1 1 0 0 0 1.656.752H1" />
        <path d="M10.75 14.75a.25.25 0 0 0 0-.5M10.75 14.75a.25.25 0 0 1 0-.5M5.75 14.75a.25.25 0 0 0 0-.5M5.75 14.75a.25.25 0 0 1 0-.5" />
        <path d="M4.031 9.75h8.048a2 2 0 0 0 1.94-1.515l.967-3.866a.5.5 0 0 0-.486-.622H3.011" />
      </g>
    </svg>
  );
}

export function DialogCloseIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path fill="currentColor" d="M18.3 5.7a1 1 0 0 0-1.4 0L12 10.6 7.1 5.7a1 1 0 0 0-1.4 1.4l4.9 4.9-4.9 4.9a1 1 0 1 0 1.4 1.4l4.9-4.9 4.9 4.9a1 1 0 0 0 1.4-1.4L13.4 12l4.9-4.9a1 1 0 0 0 0-1.4z" />
    </svg>
  );
}

export function CountrySearchIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path fill="currentColor" d="M6.8 0a6.8 6.8 0 0 1 5.4 10.9l3.5 3.5a.9.9 0 0 1-1.3 1.3l-3.5-3.5A6.8 6.8 0 1 1 6.8 0zm0 1.8a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" />
    </svg>
  );
}
