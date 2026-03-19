import { motion } from 'framer-motion'

export default function CyanButton({ children, onClick, className = '', variant = 'solid', disabled = false, size = 'md' }) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  if (variant === 'ghost') {
    return (
      <motion.button
        className={`btn-ghost font-semibold font-sans flex items-center justify-center gap-2 ${sizeClasses[size]} ${className}`}
        onClick={onClick}
        disabled={disabled}
        whileTap={{ scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        {children}
      </motion.button>
    )
  }

  return (
    <motion.button
      className={`btn-cyan font-bold font-sans flex items-center justify-center gap-2 ${sizeClasses[size]} ${className} ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {children}
    </motion.button>
  )
}
