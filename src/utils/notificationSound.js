/**
 * تشغيل صوت إشعار قصير (Web Audio API)
 * المتصفحات تمنع الصوت حتى يحدث تفاعل من المستخدم — استدعِ resumeAudioForNotifications() عند فتح تبويب المحادثات أو أول ضغطة.
 */
let audioContext = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  if (!audioContext) audioContext = new AudioContext();
  return audioContext;
}

/** استدعِها عند فتح المحادثات أو أول ضغطة لتفعيل الصوت لاحقاً */
export function resumeAudioForNotifications() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
}

export function playNotificationSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => playBeep(ctx)).catch(() => {});
      return;
    }
    playBeep(ctx);
  } catch (_) {}
}

function playBeep(ctx) {
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch (_) {}
}
