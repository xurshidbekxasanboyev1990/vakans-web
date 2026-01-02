import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

export function AnimatedBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const colors = [
      'rgba(239, 68, 68, 0.15)',   // Qizil
      'rgba(59, 130, 246, 0.15)',  // Ko'k
      'rgba(16, 185, 129, 0.12)',  // Yashil
      'rgba(139, 92, 246, 0.15)',  // Binafsha
      'rgba(245, 158, 11, 0.12)',  // Sariq
    ];

    const newParticles: Particle[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 200 + 100,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Floating gradient blobs */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full blur-3xl animate-float-particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: `radial-gradient(circle, ${particle.color} 0%, transparent 70%)`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      {/* Animated mesh gradient */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-blue-500/5 animate-gradient-shift" />
        <div className="absolute inset-0 bg-gradient-to-tr from-green-500/5 via-transparent to-purple-500/5 animate-gradient-shift-reverse" />
      </div>

      {/* Light rays */}
      <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-blue-500/10 via-transparent to-transparent animate-pulse-slow" />
      <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-purple-500/10 via-transparent to-transparent animate-pulse-slow delay-1000" />
    </div>
  );
}

// Dark mode version
export function AnimatedBackgroundDark() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const colors = [
      'rgba(139, 92, 246, 0.2)',   // Binafsha
      'rgba(59, 130, 246, 0.15)',  // Ko'k
      'rgba(239, 68, 68, 0.12)',   // Qizil
      'rgba(6, 182, 212, 0.15)',   // Cyan
    ];

    const newParticles: Particle[] = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 300 + 150,
      duration: Math.random() * 25 + 20,
      delay: Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Glowing orbs */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full blur-3xl animate-float-particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: `radial-gradient(circle, ${particle.color} 0%, transparent 60%)`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  );
}
