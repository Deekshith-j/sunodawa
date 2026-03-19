export default function DosageDisplay({ dosage, frequency }) {
  return (
    <div className="flex flex-col items-center py-6 gap-2">
      <div
        className="font-orbitron font-bold text-5xl text-glow"
        style={{ color: '#00E5FF', letterSpacing: '0.04em' }}
      >
        {dosage}
      </div>
      <div className="font-sans text-text-secondary text-base font-medium tracking-wide">
        {frequency}
      </div>
    </div>
  )
}
