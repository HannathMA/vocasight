// Elephant teacher: walks in, flaps ears, swings trunk, talks with microphone.
export default function Elephant({ talking, cheer, size = 260 }) {
  return (
    <div className={`ele ${cheer ? 'cheer' : ''}`} style={{ width: size }}>
      <svg viewBox="0 0 260 290" role="img" aria-label="Elephant teacher">
        <ellipse cx="130" cy="280" rx="80" ry="9" fill="#0003" />
        <g className="legs" fill="#7fb2e8"><rect x="78" y="228" width="40" height="50" rx="18" /><rect x="142" y="228" width="40" height="50" rx="18" /></g>
        <ellipse cx="130" cy="215" rx="68" ry="55" fill="#8ec5fc" />
        <path d="M82 195 Q130 235 178 195 L170 180 Q130 205 90 180Z" fill="#ffb703" />
        <g className="earL"><ellipse cx="48" cy="120" rx="40" ry="50" fill="#6fa8f0" /><ellipse cx="52" cy="122" rx="24" ry="34" fill="#ffb3c7" /></g>
        <g className="earR"><ellipse cx="212" cy="120" rx="40" ry="50" fill="#6fa8f0" /><ellipse cx="208" cy="122" rx="24" ry="34" fill="#ffb3c7" /></g>
        <circle cx="130" cy="115" r="70" fill="#8ec5fc" />
        <g className="trunk"><path d="M130 130 Q128 205 168 205 Q190 203 188 178" stroke="#8ec5fc" strokeWidth="34" fill="none" strokeLinecap="round" /><path d="M130 150 Q132 195 160 198" stroke="#6fa8f0" strokeWidth="4" fill="none" strokeLinecap="round" opacity=".6" /></g>
        <g fill="none" stroke="#f72585" strokeWidth="5"><circle cx="102" cy="108" r="19" /><circle cx="158" cy="108" r="19" /><path d="M121 108h18" /></g>
        <g className="eyes" fill="#1d2b64"><circle cx="102" cy="108" r="7" /><circle cx="158" cy="108" r="7" /><circle cx="105" cy="105" r="2.5" fill="#fff" /><circle cx="161" cy="105" r="2.5" fill="#fff" /></g>
        <circle cx="78" cy="138" r="10" fill="#ff8fa3" opacity=".6" /><circle cx="182" cy="138" r="10" fill="#ff8fa3" opacity=".6" />
        <ellipse className={talking ? 'mouth talk' : 'mouth'} cx="96" cy="160" rx="15" ry="10" fill="#c1121f" />
        <g><polygon points="130,36 70,58 130,80 190,58" fill="#1d2b64" /><rect x="100" y="60" width="60" height="16" fill="#1d2b64" /><path d="M186 58 V88" stroke="#ffb703" strokeWidth="4" /><circle cx="186" cy="92" r="6" fill="#ffb703" /></g>

        {/* Handheld / Studio Microphone for Tutor */}
        <g transform="translate(195, 145) rotate(-15)">
          <rect x="2" y="16" width="7" height="32" rx="3.5" fill="#1e293b" />
          <rect x="1" y="44" width="9" height="5" rx="2" fill="#475569" />
          <rect x="-1" y="2" width="13" height="17" rx="6" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" />
          <line x1="-1" y1="8" x2="12" y2="8" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="-1" y1="13" x2="12" y2="13" stroke="#e2e8f0" strokeWidth="1" />
          <circle cx="5.5" cy="22" r="2.5" fill={talking ? '#ef4444' : '#10b981'} className={talking ? 'animate-ping' : ''} />
          {talking && (
            <g className="animate-pulse">
              <path d="M 16 4 Q 22 10 16 18" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 21 0 Q 28 10 21 23" fill="none" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}
        </g>
      </svg>
    </div>
  )
}
