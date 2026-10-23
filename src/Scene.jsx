// Animated Kerala backwater background: sun, clouds, hills, swaying palms, waves, boat.
const Palm = ({ x, s = 1, d = 0 }) => (
  <g transform={`translate(${x} 560) scale(${s})`}><g className="sway" style={{ animationDelay: `${d}s` }}>
    <path d="M0 0 Q18 -90 6 -190" stroke="#8d5a2b" strokeWidth="14" fill="none" strokeLinecap="round" />
    {[-70, -35, 0, 35, 70].map((r) => <ellipse key={r} cx="6" cy="-215" rx="70" ry="13" fill="#1fa66a" transform={`rotate(${r} 6 -190) translate(40 0) rotate(${r < 0 ? 0 : 0})`} />)}
    <circle cx="0" cy="-185" r="9" fill="#6b4423" /><circle cx="14" cy="-182" r="9" fill="#6b4423" />
  </g></g>)
export default function Scene() {
  return (
    <svg className="scene" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7bdff2" /><stop offset=".7" stopColor="#fff1c9" /></linearGradient>
        <linearGradient id="wt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#12b5cb" /><stop offset="1" stopColor="#0a7ea4" /></linearGradient></defs>
      <rect width="1200" height="700" fill="url(#sk)" />
      <g className="spin" style={{ transformOrigin: '980px 130px' }}><circle cx="980" cy="130" r="95" fill="#ffd166" opacity=".35" />
        {Array.from({ length: 12 }).map((_, i) => <rect key={i} x="975" y="0" width="10" height="40" rx="5" fill="#ffb703" transform={`rotate(${i * 30} 980 130)`} />)}</g>
      <circle cx="980" cy="130" r="62" fill="#ffb703" />
      {[[120, 110, 1], [520, 70, .7], [760, 180, .85]].map(([x, y, s], i) => <g key={i} className="cloud" style={{ animationDuration: `${60 + i * 25}s`, animationDelay: `-${i * 20}s` }}><g transform={`translate(${x} ${y}) scale(${s})`}><ellipse cx="0" cy="0" rx="70" ry="26" fill="#fff" /><ellipse cx="-30" cy="-18" rx="34" ry="26" fill="#fff" /><ellipse cx="22" cy="-24" rx="40" ry="30" fill="#fff" /></g></g>)}
      <path d="M0 470 Q200 380 420 450 T820 440 T1200 430 V600 H0Z" fill="#6ee7a8" />
      <path d="M0 520 Q300 450 600 510 T1200 490 V620 H0Z" fill="#2fbf71" />
      <Palm x={90} s={1.1} /><Palm x={230} s={.8} d={.6} /><Palm x={1110} s={1.15} d={.3} />
      <rect y="560" width="1200" height="140" fill="url(#wt)" />
      <g className="boat"><path d="M470 585 Q560 640 700 585Z" fill="#e63946" /><rect x="580" y="520" width="6" height="65" fill="#6b4423" /><path d="M586 522 L650 575 H586Z" fill="#ffb703" /></g>
      <g className="wave1" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".6"><path d="M-100 620 q25 -18 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0" /></g>
      <g className="wave2" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".4"><path d="M-100 665 q25 -16 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0" /></g>
    </svg>)
}
