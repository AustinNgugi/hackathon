import React from 'react';

/**
 * LEDStatus — Visual indicator showing patient condition level.
 * SEAML  → Green  (safe)
 * CAUTION → Yellow (warning)
 * DANGER  → Red    (critical, pulsing)
 */
const LED_CONFIG = {
  SEAML: {
    label: 'SEAML',
    sublabel: 'Patient is Stable',
    color: 'text-success',
    bg: 'bg-success/15',
    border: 'border-success/40',
    dotClass: 'bg-success',
    dotAnimation: '',
    glow: '0 0 20px rgba(34, 197, 94, 0.4)',
  },
  CAUTION: {
    label: 'CAUTION',
    sublabel: 'Warning Signs Detected',
    color: 'text-warning',
    bg: 'bg-warning/15',
    border: 'border-warning/40',
    dotClass: 'bg-warning led-caution',
    dotAnimation: 'led-caution',
    glow: '0 0 20px rgba(234, 179, 8, 0.4)',
  },
  DANGER: {
    label: 'DANGER',
    sublabel: 'Critical — Emergency Response Required',
    color: 'text-danger',
    bg: 'bg-danger/15',
    border: 'border-danger/40',
    dotClass: 'bg-danger',
    dotAnimation: 'led-danger',
    glow: '0 0 30px rgba(239, 68, 68, 0.6)',
  },
};

const LEDStatus = ({ status = 'SEAML', size = 'normal' }) => {
  const cfg = LED_CONFIG[status] || LED_CONFIG.SEAML;
  const isLarge = size === 'large';

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-2xl border ${cfg.bg} ${cfg.border} transition-all duration-500`}
      style={{ boxShadow: cfg.glow }}
    >
      {/* Pulsing LED dot */}
      <div className="relative flex items-center justify-center shrink-0">
        <div
          className={`${isLarge ? 'w-8 h-8' : 'w-5 h-5'} rounded-full ${cfg.dotClass} ${cfg.dotAnimation}`}
        />
        {/* Outer ring for DANGER */}
        {status === 'DANGER' && (
          <div className="absolute inset-0 rounded-full border-2 border-danger led-danger" />
        )}
      </div>

      <div>
        <div className={`font-black tracking-widest ${isLarge ? 'text-2xl' : 'text-lg'} ${cfg.color}`}>
          {cfg.label}
        </div>
        <div className={`text-sm ${cfg.color} opacity-75`}>{cfg.sublabel}</div>
      </div>

      {/* Status badge */}
      <div className="ml-auto">
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${cfg.border} ${cfg.color}`}>
          {status === 'SEAML' ? '● Active' : status === 'CAUTION' ? '⚠ Alert' : '🚨 Critical'}
        </span>
      </div>
    </div>
  );
};

export default LEDStatus;
