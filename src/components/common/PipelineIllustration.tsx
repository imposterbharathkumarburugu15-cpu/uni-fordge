import { motion } from "framer-motion";

const CHECKLIST = [
  "MANUFACTURER",
  "BRAND",
  "MPN",
  "INTERNAL CODES",
  "GTIN / UPC",
  "DISCONTINUED / OBSOLETE",
  "SOURCE → VERIFIED",
] as const;

const TAGS = [
  { label: "catalogue.xlsx", y: 178 },
  { label: "datasheet.pdf", y: 252 },
  { label: "spec_10492.pdf", y: 326 },
  { label: "pricebook.csv", y: 400 },
  { label: "material_guide.pdf", y: 474 },
] as const;

/**
 * Landing hero illustration: messy supplier documents stream through the
 * UNIFORGE forge (brass fitting) and emerge as verified attribute truth.
 */
export function PipelineIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 560 640"
      className={className}
      role="img"
      aria-label="Messy supplier data flowing through the UniForge engine into verified product truth"
    >
      <defs>
        <linearGradient id="stream" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(55,199,234,0)" />
          <stop offset="35%" stopColor="rgba(55,199,234,0.85)" />
          <stop offset="65%" stopColor="rgba(55,199,234,0.85)" />
          <stop offset="100%" stopColor="rgba(55,199,234,0)" />
        </linearGradient>
        <linearGradient id="brassV" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6f552e" />
          <stop offset="50%" stopColor="#dcc08d" />
          <stop offset="100%" stopColor="#6f552e" />
        </linearGradient>
        <radialGradient id="streamGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="rgba(55,199,234,0.14)" />
          <stop offset="100%" stopColor="rgba(55,199,234,0)" />
        </radialGradient>
      </defs>

      {/* energy stream */}
      <ellipse cx="300" cy="300" rx="70" ry="250" fill="url(#streamGlow)" />
      <motion.rect
        x="298.5"
        y="30"
        width="3"
        height="580"
        rx="1.5"
        fill="url(#stream)"
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        style={{ transformOrigin: "300px 30px" }}
      />

      {/* brass fitting (vertical coupling) */}
      <g transform="translate(300 300)">
        <rect x="-8" y="-120" width="16" height="42" fill="url(#brassV)" />
        <rect x="-8" y="78" width="16" height="42" fill="url(#brassV)" />
        {Array.from({ length: 10 }).map((_, i) => (
          <line
            key={`t${i}`}
            x1="-6"
            y1={-100 + i * 8}
            x2="6"
            y2={-100 + i * 8}
            stroke="#5c4523"
            strokeWidth="1"
          />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <line
            key={`b${i}`}
            x1="-6"
            y1={100 + i * 8}
            x2="6"
            y2={100 + i * 8}
            stroke="#5c4523"
            strokeWidth="1"
          />
        ))}
        <polygon
          points="-46,0 -22,-38 22,-38 46,0 22,38 -22,38"
          fill="url(#brassV)"
          stroke="#4e3a1e"
          strokeWidth="1"
        />
        <polygon
          points="-46,0 -22,-38 22,-38 22,0 -22,0"
          fill="rgba(255,255,255,0.08)"
        />
        <rect x="-52" y="-124" width="104" height="248" rx="52" fill="none" stroke="rgba(220,192,141,0.22)" strokeWidth="1" />
      </g>

      {/* left chamber with floating document tags */}
      <motion.g
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <rect x="52" y="120" width="132" height="400" rx="10" fill="rgba(55,199,234,0.03)" stroke="rgba(55,199,234,0.22)" />
        <rect x="52" y="120" width="132" height="24" rx="10" fill="rgba(55,199,234,0.06)" />
        <text x="118" y="136" fill="#6e7882" fontSize="9" fontFamily="IBM Plex Mono, monospace" letterSpacing="1.6" textAnchor="middle">
          INTAKE
        </text>
        {TAGS.map((tag, i) => (
          <motion.g
            key={tag.label}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4.2, repeat: Infinity, delay: i * 0.7, ease: "easeInOut" }}
          >
            <rect x={62 + (i % 2) * 22} y={tag.y} width="104" height="22" rx="3" fill="#111417" stroke="rgba(55,199,234,0.3)" />
            <text
              x={114 + (i % 2) * 22}
              y={tag.y + 14}
              fill="#a6afb7"
              fontSize="9.5"
              fontFamily="IBM Plex Mono, monospace"
              textAnchor="middle"
            >
              {tag.label}
            </text>
          </motion.g>
        ))}
        {Array.from({ length: 9 }).map((_, i) => (
          <motion.circle
            key={`p${i}`}
            cx={30 + ((i * 37) % 46)}
            cy={150 + ((i * 83) % 380)}
            r="2"
            fill="rgba(55,199,234,0.4)"
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 3 + i, repeat: Infinity }}
          />
        ))}
      </motion.g>

      {/* verification checklist */}
      {CHECKLIST.map((label, i) => {
        const y = 120 + i * 62;
        return (
          <motion.g
            key={label}
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + i * 0.14, duration: 0.35 }}
          >
            <line
              x1="312"
              y1={y}
              x2="352"
              y2={y}
              stroke="rgba(55,199,234,0.4)"
              strokeWidth="1"
            />
            <circle cx="357" cy={y} r="2.5" fill="#37c7ea" />
            <text
              x="372"
              y={y + 4}
              fill="#c6cdd3"
              fontSize="10.5"
              fontFamily="IBM Plex Mono, monospace"
              letterSpacing="0.8"
            >
              {label}
            </text>
            <path
              d={`M 530 ${y - 6} l 4 4 l 7 -8`}
              stroke="#45c181"
              strokeWidth="1.6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.g>
        );
      })}

      {/* labels */}
      <text x="20" y="52" fill="#6e7882" fontSize="9.5" fontFamily="IBM Plex Mono, monospace" letterSpacing="1.8">
        SUPPLIER DATA
      </text>
      <text x="420" y="52" fill="#6e7882" fontSize="9.5" fontFamily="IBM Plex Mono, monospace" letterSpacing="1.8" textAnchor="end">
        VERIFIED TRUTH
      </text>
      <text x="300" y="610" fill="rgba(55,199,234,0.75)" fontSize="9.5" fontFamily="IBM Plex Mono, monospace" letterSpacing="1.8" textAnchor="middle">
        UNIFORGE ENGINE
      </text>
    </svg>
  );
}
