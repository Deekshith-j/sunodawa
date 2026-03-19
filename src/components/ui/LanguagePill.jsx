import { motion } from 'framer-motion'

export default function LanguagePill({ language, selected, onClick }) {
  return (
    <motion.button
      className="font-sans text-sm font-medium rounded-full px-4 py-2 min-h-[40px] transition-all"
      style={{
        background: selected ? '#00E5FF' : 'rgba(0,229,255,0.07)',
        color: selected ? '#050B18' : '#00E5FF',
        border: `1px solid ${selected ? '#00E5FF' : 'rgba(0,229,255,0.25)'}`,
        boxShadow: selected ? '0 0 15px rgba(0,229,255,0.5)' : 'none',
      }}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {language}
    </motion.button>
  )
}
