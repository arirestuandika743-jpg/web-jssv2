'use client';

/**
 * JSS Original Light Background
 */
export function CinematicBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Layer 1 — Deep Background */}
      <div className="absolute inset-0 bg-[#FFFFFF]" />

      {/* Layer 2 — Atmospheric Gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 30%, #F5F5F5 60%, #FFFFFF 100%)',
        }}
      />

      {/* Layer 3 — Ambient JSS Soft Yellow Glow */}
      <div
        className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(245,185,0,0.04) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      <div
        className="absolute bottom-[-15%] right-[-5%] w-[50%] h-[50%] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(245,185,0,0.03) 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
      />
    </div>
  );
}
