export const getWorkoutTags = (workout_type) => {
  const wtype = (workout_type || '').toLowerCase();
  if (wtype.includes('rest') || wtype.includes('recovery')) {
    return [
      { text: 'Cellular Repair', bg: '#f1f5f9', color: '#475569' },
      { text: 'Hydration & Sleep', bg: '#f1f5f9', color: '#475569' }
    ];
  } else if (wtype.includes('tempo') || wtype.includes('threshold')) {
    return [
      { text: 'Lactate Threshold', bg: '#fff7ed', color: '#c2410c' },
      { text: 'Zone 3/4 Sustained', bg: '#ffedd5', color: '#ea580c' },
      { text: 'Jim Cues 🦫', bg: '#f0fdfa', color: '#0d9488' }
    ];
  } else if (wtype.includes('run') || wtype.includes('jog')) {
    return [
      { text: 'Zone 2 Aerobic Base', bg: '#f0fdfa', color: '#0f766e' },
      { text: 'Tendon Adaptations', bg: '#ccfbf1', color: '#0d9488' },
      { text: 'Jim Cues 🦫', bg: '#f0fdfa', color: '#0d9488' }
    ];
  } else if (wtype.includes('swim')) {
    return [
      { text: 'VO2 & Stroke Efficiency', bg: '#e0f2fe', color: '#0284c7' },
      { text: 'Zero Impact Cardio', bg: '#f0f9ff', color: '#0369a1' }
    ];
  } else if (wtype.includes('bike') || wtype.includes('cycle')) {
    return [
      { text: 'Power Threshold (FTP)', bg: '#fff7ed', color: '#ea580c' },
      { text: 'RPM Cadence', bg: '#ffdbca', color: '#9a3412' }
    ];
  } else if (wtype.includes('strength') || wtype.includes('gym') || wtype.includes('hyrox') || wtype.includes('sled')) {
    return [
      { text: 'Power Endurance', bg: '#f3e8ff', color: '#7e22ce' },
      { text: 'Grip & Core Strength', bg: '#ede9fe', color: '#6b21a8' },
      { text: 'Jim Cues 🦫', bg: '#f0fdfa', color: '#0d9488' }
    ];
  } else {
    return [
      { text: 'Aerobic Base', bg: '#f0fdfa', color: '#0f766e' },
      { text: 'Form & Recovery', bg: '#e0f2fe', color: '#0369a1' }
    ];
  }
};
