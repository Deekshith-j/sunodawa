import { motion, AnimatePresence } from 'framer-motion'

export default function VoiceWaveform({ isPlaying, barCount = 24, color = '#00F5FF', height = 40 }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 3, height: height + 8, overflow: 'hidden',
    }}>
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.div
          key={i}
          style={{
            width: 3,
            borderRadius: 2,
            background: color,
            height: isPlaying ? undefined : 4,
            flexShrink: 0,
          }}
          animate={isPlaying ? {
            scaleY: [0.15, 0.4 + Math.random() * 0.6, 0.2, 0.8 + Math.random() * 0.2, 0.15],
            height: height,
          } : {
            scaleY: 0.2,
            height: 4,
          }}
          transition={isPlaying ? {
            duration: 0.6 + (i % 5) * 0.12,
            repeat: Infinity,
            repeatType: 'mirror',
            delay: i * 0.04,
            ease: 'easeInOut',
          } : { duration: 0.3 }}
        />
      ))}
    </div>
  )
}
