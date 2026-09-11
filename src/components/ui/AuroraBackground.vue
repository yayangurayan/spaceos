<template>
  <div class="aurora-container" :class="variant">
    <!-- Animated mesh gradient blobs -->
    <div class="aurora-blob blob-1"></div>
    <div class="aurora-blob blob-2"></div>
    <div class="aurora-blob blob-3"></div>
    <div class="aurora-blob blob-4"></div>

    <!-- Noise texture overlay for organic feel -->
    <div class="aurora-noise"></div>

    <!-- Radial vignette -->
    <div class="aurora-vignette"></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  /** Visual variant */
  variant?: 'default' | 'auth' | 'warm' | 'couple' | 'subtle'
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
})
</script>

<style scoped>
.aurora-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

/* ============================
   Noise Texture Overlay
   ============================ */
.aurora-noise {
  position: absolute;
  inset: -50%;
  width: 200%;
  height: 200%;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.03;
  mix-blend-mode: overlay;
}

/* ============================
   Vignette
   ============================ */
.aurora-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 40%, rgba(11, 15, 25, 0.5) 100%);
}

/* ============================
   Aurora Blobs
   ============================ */
.aurora-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  will-change: transform, opacity;
  mix-blend-mode: screen;
}

/* ============================
   DEFAULT VARIANT (Cyan/Blue/Indigo)
   ============================ */
.default .blob-1 {
  width: 500px; height: 500px;
  top: -15%; right: -10%;
  background: radial-gradient(circle, hsla(190, 90%, 50%, 0.20) 0%, transparent 70%);
  animation: auroraMove1 16s ease-in-out infinite;
}
.default .blob-2 {
  width: 450px; height: 450px;
  bottom: -10%; left: -8%;
  background: radial-gradient(circle, hsla(240, 70%, 50%, 0.15) 0%, transparent 70%);
  animation: auroraMove2 20s ease-in-out infinite;
}
.default .blob-3 {
  width: 350px; height: 350px;
  top: 40%; left: 30%;
  background: radial-gradient(circle, hsla(210, 80%, 60%, 0.12) 0%, transparent 70%);
  animation: auroraMove3 14s ease-in-out infinite;
}
.default .blob-4 {
  width: 280px; height: 280px;
  top: 15%; right: 25%;
  background: radial-gradient(circle, hsla(170, 70%, 55%, 0.10) 0%, transparent 70%);
  animation: auroraMove4 18s ease-in-out infinite;
}

/* ============================
   AUTH VARIANT (More vivid for login/register)
   ============================ */
.auth .blob-1 {
  width: 600px; height: 600px;
  top: -20%; right: -15%;
  background: radial-gradient(circle, hsla(190, 95%, 50%, 0.25) 0%, transparent 70%);
  animation: auroraMove1 14s ease-in-out infinite;
}
.auth .blob-2 {
  width: 550px; height: 550px;
  bottom: -15%; left: -12%;
  background: radial-gradient(circle, hsla(250, 75%, 55%, 0.20) 0%, transparent 70%);
  animation: auroraMove2 18s ease-in-out infinite;
}
.auth .blob-3 {
  width: 400px; height: 400px;
  top: 35%; left: 25%;
  background: radial-gradient(circle, hsla(220, 85%, 60%, 0.18) 0%, transparent 70%);
  animation: auroraMove3 12s ease-in-out infinite;
}
.auth .blob-4 {
  width: 350px; height: 350px;
  bottom: 20%; right: 15%;
  background: radial-gradient(circle, hsla(280, 60%, 55%, 0.12) 0%, transparent 70%);
  animation: auroraMove4 16s ease-in-out infinite;
}

/* ============================
   COUPLE VARIANT (Pink/Rose/Warm)
   ============================ */
.couple .blob-1 {
  width: 500px; height: 500px;
  top: -15%; right: -10%;
  background: radial-gradient(circle, hsla(340, 80%, 55%, 0.20) 0%, transparent 70%);
  animation: auroraMove1 15s ease-in-out infinite;
}
.couple .blob-2 {
  width: 450px; height: 450px;
  bottom: -10%; left: -8%;
  background: radial-gradient(circle, hsla(310, 70%, 50%, 0.15) 0%, transparent 70%);
  animation: auroraMove2 19s ease-in-out infinite;
}
.couple .blob-3 {
  width: 380px; height: 380px;
  top: 40%; left: 35%;
  background: radial-gradient(circle, hsla(350, 75%, 60%, 0.12) 0%, transparent 70%);
  animation: auroraMove3 13s ease-in-out infinite;
}
.couple .blob-4 {
  width: 300px; height: 300px;
  top: 10%; left: 10%;
  background: radial-gradient(circle, hsla(20, 70%, 55%, 0.10) 0%, transparent 70%);
  animation: auroraMove4 17s ease-in-out infinite;
}

/* ============================
   SUBTLE VARIANT (For main app area)
   ============================ */
.subtle .blob-1 {
  width: 600px; height: 600px;
  top: -20%; right: -15%;
  background: radial-gradient(circle, hsla(200, 80%, 50%, 0.06) 0%, transparent 70%);
  animation: auroraMove1 20s ease-in-out infinite;
}
.subtle .blob-2 {
  width: 500px; height: 500px;
  bottom: -15%; left: -12%;
  background: radial-gradient(circle, hsla(250, 60%, 50%, 0.05) 0%, transparent 70%);
  animation: auroraMove2 25s ease-in-out infinite;
}
.subtle .blob-3 {
  width: 400px; height: 400px;
  top: 50%; left: 40%;
  background: radial-gradient(circle, hsla(180, 70%, 50%, 0.04) 0%, transparent 70%);
  animation: auroraMove3 18s ease-in-out infinite;
}
.subtle .blob-4 {
  width: 350px; height: 350px;
  top: 20%; right: 30%;
  background: radial-gradient(circle, hsla(220, 60%, 55%, 0.04) 0%, transparent 70%);
  animation: auroraMove4 22s ease-in-out infinite;
}

/* ============================
   Aurora Movement Keyframes
   ============================ */
@keyframes auroraMove1 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }
  25% { transform: translate(-40px, 30px) scale(1.1); opacity: 0.8; }
  50% { transform: translate(20px, -50px) scale(0.95); opacity: 1; }
  75% { transform: translate(40px, 20px) scale(1.05); opacity: 0.85; }
}

@keyframes auroraMove2 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }
  25% { transform: translate(50px, -30px) scale(1.08); opacity: 0.85; }
  50% { transform: translate(-30px, 40px) scale(0.92); opacity: 1; }
  75% { transform: translate(-50px, -20px) scale(1.03); opacity: 0.9; }
}

@keyframes auroraMove3 {
  0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 0.8; }
  33% { transform: translate(60px, 40px) scale(1.15) rotate(2deg); opacity: 1; }
  66% { transform: translate(-40px, -30px) scale(0.9) rotate(-1deg); opacity: 0.7; }
}

@keyframes auroraMove4 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.7; }
  30% { transform: translate(-30px, -40px) scale(1.12); opacity: 1; }
  60% { transform: translate(40px, 30px) scale(0.88); opacity: 0.6; }
}
</style>
