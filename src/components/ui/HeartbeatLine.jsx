// HeartbeatLine — animated ECG-style decorative line
export default function HeartbeatLine({ color = '#00F5FF', opacity = 0.3 }) {
  return (
    <div style={{ width: '100%', overflow: 'hidden', height: 32 }}>
      <svg
        viewBox="0 0 400 32"
        preserveAspectRatio="none"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <polyline
          points="0,16 40,16 55,4 65,28 75,16 90,16 110,16 125,2 133,16 150,16 165,16 175,8 183,24 190,16 210,16 240,16 255,4 265,28 275,16 290,16 310,16 325,2 333,16 350,16 365,16 375,8 383,24 390,16 400,16"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 1000,
            strokeDashoffset: 0,
            animation: 'ecgDraw 3s linear infinite',
            opacity,
          }}
        />
      </svg>
    </div>
  )
}
