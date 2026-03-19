export default function ScanReticle({ isScanning }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {/* Outer scanning ring */}
      <div className="relative flex items-center justify-center" style={{ width: 260, height: 260 }}>
        {/* Rotating dashed ring */}
        {isScanning && (
          <svg
            className="absolute inset-0 scan-ring"
            width="260"
            height="260"
            viewBox="0 0 260 260"
          >
            <circle
              cx="130"
              cy="130"
              r="124"
              fill="none"
              stroke="#00E5FF"
              strokeWidth="2"
              strokeDasharray="20 10"
              opacity="0.6"
            />
          </svg>
        )}

        {/* Static ring */}
        <svg
          className="absolute inset-0"
          width="260"
          height="260"
          viewBox="0 0 260 260"
        >
          <circle
            cx="130"
            cy="130"
            r="124"
            fill="none"
            stroke="rgba(0,229,255,0.15)"
            strokeWidth="1"
          />
        </svg>

        {/* Corner brackets */}
        {[0, 1, 2, 3].map((corner) => {
          const x = corner % 2 === 0 ? 20 : 220
          const y = corner < 2 ? 20 : 220
          const rotation = corner * 90
          return (
            <svg
              key={corner}
              className="absolute"
              width="40"
              height="40"
              viewBox="0 0 40 40"
              style={{
                left: x - 20,
                top: y - 20,
                transform: `rotate(${rotation}deg)`,
                filter: 'drop-shadow(0 0 6px #00E5FF)',
              }}
            >
              <path
                d="M2 20 L2 2 L20 2"
                fill="none"
                stroke="#00E5FF"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )
        })}

        {/* Center crosshair */}
        <div className="flex items-center justify-center" style={{ width: 20, height: 20 }}>
          <div className="w-px h-4 bg-cyan-accent opacity-50 absolute" />
          <div className="h-px w-4 bg-cyan-accent opacity-50 absolute" />
        </div>
      </div>
    </div>
  )
}
