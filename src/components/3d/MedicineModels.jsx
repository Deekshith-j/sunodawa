import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'

export function PillModel({ color = '#00F5FF', position = [0, 0, 0], scale = 1 }) {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
    ref.current.rotation.y += 0.008
  })
  return (
    <group ref={ref} position={position} scale={scale}>
      <RoundedBox args={[0.5, 0.18, 0.18]} radius={0.09} smoothness={8}>
        <meshPhysicalMaterial
          color={color}
          metalness={0.1}
          roughness={0.1}
          transmission={0.6}
          thickness={0.5}
          transparent
          opacity={0.9}
          emissive={color}
          emissiveIntensity={0.15}
        />
      </RoundedBox>
    </group>
  )
}

export function TabletModel({ color = '#00FF88', position = [0, 0, 0], scale = 1 }) {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y += 0.01
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.05
  })
  return (
    <group ref={ref} position={position} scale={scale}>
      <RoundedBox args={[0.32, 0.32, 0.06]} radius={0.06} smoothness={8}>
        <meshPhysicalMaterial
          color={color}
          metalness={0.05}
          roughness={0.15}
          transmission={0.4}
          thickness={0.2}
          transparent
          opacity={0.95}
          emissive={color}
          emissiveIntensity={0.1}
        />
      </RoundedBox>
    </group>
  )
}

export function SyringeModel({ position = [0, 0, 0], scale = 1 }) {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4) * 0.1
    ref.current.rotation.y += 0.006
  })
  return (
    <group ref={ref} position={position} scale={scale}>
      <mesh>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 16]} />
        <meshPhysicalMaterial
          color="#00F5FF"
          transmission={0.8}
          thickness={0.1}
          transparent
          opacity={0.7}
        />
      </mesh>
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.01, 0.03, 0.12, 8]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  )
}
