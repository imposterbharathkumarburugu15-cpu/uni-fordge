import { motion } from "framer-motion";
import { useProduct } from "@/hooks/use-forge-store";

interface Callout {
  id: string;
  anchor: { x: number; y: number };
  label: { x: number; y: number; anchor?: "start" | "end" };
  title: string;
  value: string;
  verified: boolean;
}

/**
 * The UNIFORGE product visualization: an engineered brass coupling with
 * traceable attribute callouts. Data is live — callouts read the product's
 * current canonical attributes and flip to verified state on resolution.
 */
export function ProductVisualization({
  productId = "PRD-0101",
  className = "",
}: {
  productId?: string;
  className?: string;
}) {
  const product = useProduct(productId);

  const material = product?.attributes.find((a) => a.key === "MATERIAL");
  const size = product?.attributes.find((a) => a.key === "SIZE");
  const type = product?.attributes.find((a) => a.key === "PRODUCT_TYPE");

  const callouts: Callout[] = [
    {
      id: "material",
      anchor: { x: 254, y: 237 },
      label: { x: 44, y: 76 },
      title: "MATERIAL",
      value: material?.value.toUpperCase() ?? "—",
      verified: material?.verification === "VERIFIED",
    },
    {
      id: "size",
      anchor: { x: 274, y: 253 },
      label: { x: 44, y: 356 },
      title: "SIZE",
      value: size ? `${size.value} ${size.unit ?? ""}`.trim().toUpperCase() : "—",
      verified: size?.verification === "VERIFIED",
    },
    {
      id: "mpn",
      anchor: { x: 404, y: 157 },
      label: { x: 578, y: 64, anchor: "end" },
      title: "MPN",
      value: product?.mpn ?? "—",
      verified: true,
    },
    {
      id: "type",
      anchor: { x: 424, y: 174 },
      label: { x: 578, y: 356, anchor: "end" },
      title: "PRODUCT TYPE",
      value: type?.value.toUpperCase() ?? "—",
      verified: type?.verification === "VERIFIED",
    },
  ];

  return (
    <svg
      viewBox="0 0 620 420"
      className={className}
      role="img"
      aria-label={`${product?.name ?? "Product"} — brass coupling with verified attribute callouts`}
    >
      <defs>
        <linearGradient id="brass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dcc08d" />
          <stop offset="45%" stopColor="#b08d57" />
          <stop offset="100%" stopColor="#6f552e" />
        </linearGradient>
        <linearGradient id="brassEnd" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8a6d3f" />
          <stop offset="100%" stopColor="#4e3a1e" />
        </linearGradient>
        <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="rgba(55,199,234,0.16)" />
          <stop offset="100%" stopColor="rgba(55,199,234,0)" />
        </radialGradient>
        <filter id="drop" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#000" floodOpacity="0.55" />
        </filter>
      </defs>

      {/* ambient glow */}
      <ellipse cx="330" cy="210" rx="170" ry="130" fill="url(#glow)" />

      {/* coupling assembly, rotated for the hero angle */}
      <g transform="rotate(-28 330 210)" filter="url(#drop)">
        {/* left barrel */}
        <rect x="250" y="198" width="39" height="24" fill="url(#brass)" />
        {Array.from({ length: 4 }).map((_, i) => (
          <line
            key={`lt-${i}`}
            x1={254 + i * 8}
            y1="199"
            x2={254 + i * 8}
            y2="221"
            stroke="#5c4523"
            strokeWidth="1"
          />
        ))}
        {/* right barrel */}
        <rect x="371" y="198" width="89" height="24" fill="url(#brass)" />
        {Array.from({ length: 9 }).map((_, i) => (
          <line
            key={`rt-${i}`}
            x1={375 + i * 8}
            y1="199"
            x2={375 + i * 8}
            y2="221"
            stroke="#5c4523"
            strokeWidth="1"
          />
        ))}
        {/* end caps */}
        <rect x="248" y="196" width="5" height="28" rx="1" fill="url(#brassEnd)" />
        <rect x="458" y="196" width="5" height="28" rx="1" fill="url(#brassEnd)" />
        {/* center hex nut */}
        <polygon
          points="330,166 371,188 371,232 330,254 289,232 289,188"
          fill="url(#brass)"
          stroke="#5c4523"
          strokeWidth="1"
        />
        <polygon
          points="330,166 371,188 371,210 330,210 289,210 289,188"
          fill="rgba(255,255,255,0.08)"
        />
        <line x1="289" y1="188" x2="371" y2="188" stroke="#7a5f33" strokeWidth="1" />
        <line x1="289" y1="232" x2="371" y2="232" stroke="#4e3a1e" strokeWidth="1" />
      </g>

      {/* callout lines + labels */}
      {callouts.map((c, i) => {
        const line = (
          <motion.line
            key={`line-${c.id}`}
            x1={c.anchor.x}
            y1={c.anchor.y}
            x2={c.label.x + (c.label.anchor === "end" ? -8 : 8)}
            y2={c.label.y}
            stroke={c.verified ? "rgba(69,193,129,0.55)" : "rgba(217,161,59,0.6)"}
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.22, duration: 0.45 }}
          />
        );
        const dot = (
          <motion.circle
            key={`dot-${c.id}`}
            cx={c.anchor.x}
            cy={c.anchor.y}
            r="3.5"
            fill={c.verified ? "var(--uf-success)" : "var(--uf-warning)"}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.22, duration: 0.2 }}
          />
        );
        const label = (
          <motion.g
            key={`label-${c.id}`}
            initial={{ opacity: 0, x: c.label.anchor === "end" ? 10 : -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.75 + i * 0.22, duration: 0.3 }}
          >
            <rect
              x={c.label.anchor === "end" ? c.label.x - 208 : c.label.x}
              y={c.label.y - 26}
              width="200"
              height="34"
              rx="3"
              fill="rgba(17,20,23,0.92)"
              stroke={c.verified ? "rgba(69,193,129,0.35)" : "rgba(217,161,59,0.4)"}
            />
            <text
              x={c.label.anchor === "end" ? c.label.x - 12 : c.label.x + 12}
              y={c.label.y - 12}
              fill="#6e7882"
              fontSize="9.5"
              fontFamily="IBM Plex Mono, monospace"
              letterSpacing="1.4"
              textAnchor={c.label.anchor}
            >
              {c.title}
            </text>
            <text
              x={c.label.anchor === "end" ? c.label.x - 12 : c.label.x + 12}
              y={c.label.y + 2}
              fill={c.verified ? "#eaedf0" : "#d9a13b"}
              fontSize="12.5"
              fontFamily="IBM Plex Mono, monospace"
              fontWeight="600"
              letterSpacing="0.4"
              textAnchor={c.label.anchor}
            >
              {c.value}
            </text>
            {c.verified ? (
              <path
                d={`M ${c.label.anchor === "end" ? c.label.x - 190 : c.label.x + 188} ${c.label.y - 12} l 3 3 l 6 -7`}
                stroke="#45c181"
                strokeWidth="1.6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : (
              <path
                d={`M ${c.label.anchor === "end" ? c.label.x - 190 : c.label.x + 188} ${c.label.y - 16} l 0 8 M ${c.label.anchor === "end" ? c.label.x - 190 : c.label.x + 188} ${c.label.y - 2} l 0 0.1`}
                stroke="#d9a13b"
                strokeWidth="1.8"
                fill="none"
                strokeLinecap="round"
              />
            )}
          </motion.g>
        );
        return [line, dot, label];
      })}
    </svg>
  );
}
