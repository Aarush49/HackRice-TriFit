export const toISODate = (dateStr) => {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return '';
};

export const calculateWeeksAway = (dateStr) => {
  if (!dateStr) return 'Set Race Date';
  try {
    const isoDate = toISODate(dateStr);
    if (!isoDate) return 'Set Race Date';
    const [year, month, day] = isoDate.split('-').map(Number);
    const target = new Date(year, month - 1, day);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Race Week!';
    const weeks = Math.ceil(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'Week' : 'Weeks'} Away`;
  } catch {
    return 'Set Race Date';
  }
};

export const getEventIcon = (raceType = '') => {
  const r = (raceType || '').toLowerCase();
  if (r.includes('marathon')) return 'running';
  if (r.includes('tri') || r.includes('ironman') || r.includes('swim')) return 'swimmer';
  if (r.includes('5k') || r.includes('10k') || r.includes('speed')) return 'stopwatch';
  return 'dumbbell';
};

export const getSportTrainingPlan = (raceType = 'Hyrox Open / Pro', raceDate = 'November 15, 2026') => {
  const r = (raceType || '').toLowerCase();
  if (r.includes('marathon')) {
    return {
      goal: `Prepare for ${raceType} by ${raceDate}`,
      weeks: [
        {
          week_number: 1,
          focus: 'Aerobic Volume & Base Pacing',
          days: [
            { day: 'Monday', workout_type: 'Easy Run', description: '6 km easy recovery pace + 4 x 100m strides' },
            { day: 'Tuesday', workout_type: 'Marathon Pace Tempo', description: '8 km continuous at target marathon pace' },
            { day: 'Wednesday', workout_type: 'Threshold Intervals', description: '5 x 1,000m at Zone 4 with 2m jog recovery' },
            { day: 'Thursday', workout_type: 'Rest', description: 'Active recovery walk & tendon mobility' },
            { day: 'Friday', workout_type: 'Mid-Week Run', description: '10 km steady Zone 2 endurance' },
            { day: 'Saturday', workout_type: 'Strength & Core', description: 'Glute, hip & core stabilization drills' },
            { day: 'Sunday', workout_type: 'Long Run (LSD)', description: '18 km progressive aerobic long run' },
          ],
        },
        {
          week_number: 2,
          focus: 'Lactate Threshold & Pacing Specificity',
          days: [
            { day: 'Monday', workout_type: 'Easy Run', description: '7 km easy aerobic effort' },
            { day: 'Tuesday', workout_type: 'Tempo Intervals', description: '3 x 3 km at half-marathon pace' },
            { day: 'Wednesday', workout_type: 'Zone 2 Base', description: '8 km conversational recovery run' },
            { day: 'Thursday', workout_type: 'Rest', description: 'Sleep & cellular repair protocol' },
            { day: 'Friday', workout_type: 'Hill Repeats', description: '8 x 90s uphill strides for power' },
            { day: 'Saturday', workout_type: 'Cross-Training', description: '45 min low-impact spin or swim' },
            { day: 'Sunday', workout_type: 'Long Run', description: '22 km sustained endurance run' },
          ],
        },
        {
          week_number: 3,
          focus: 'Peak Volume & Glycogen Adaptation',
          days: [
            { day: 'Monday', workout_type: 'Recovery Run', description: '6 km recovery jog' },
            { day: 'Tuesday', workout_type: 'Marathon Pace', description: '12 km with 8 km at goal pace' },
            { day: 'Wednesday', workout_type: 'Speed Intervals', description: '6 x 800m VO2 max repeats' },
            { day: 'Thursday', workout_type: 'Rest', description: 'Foam rolling & hydration focus' },
            { day: 'Friday', workout_type: 'Easy Run', description: '8 km easy with strides' },
            { day: 'Saturday', workout_type: 'Shakeout', description: '5 km relaxed shakeout' },
            { day: 'Sunday', workout_type: 'Peak Long Run', description: '26 km marathon simulation with fueling' },
          ],
        },
        {
          week_number: 4,
          focus: 'Taper & Carbohydrate Loading',
          days: [
            { day: 'Monday', workout_type: 'Rest', description: 'Full rest & hydration' },
            { day: 'Tuesday', workout_type: 'Sharpening Run', description: '6 km with 3 x 1km at race pace' },
            { day: 'Wednesday', workout_type: 'Easy Run', description: '5 km very light jog' },
            { day: 'Thursday', workout_type: 'Rest', description: 'Electrolytes & sleep priority' },
            { day: 'Friday', workout_type: 'Pre-Race Shakeout', description: '3 km easy + 3 strides' },
            { day: 'Saturday', workout_type: 'Rest', description: 'Carb loading & gear check' },
            { day: 'Sunday', workout_type: 'Race Day', description: 'Marathon Target • Pacing strategy executed' },
          ],
        },
      ],
    };
  } else if (r.includes('tri') || r.includes('ironman')) {
    return {
      goal: `Prepare for ${raceType} by ${raceDate}`,
      weeks: [
        {
          week_number: 1,
          focus: 'Multi-Sport Base & Brick Foundations',
          days: [
            { day: 'Monday', workout_type: 'Technique Swim', description: '1,500m stroke mechanics & catch drills' },
            { day: 'Tuesday', workout_type: 'Cadence Aero Bike', description: '60 min high-cadence power intervals' },
            { day: 'Wednesday', workout_type: 'Brick Session', description: '45 min Tempo Bike + 20 min Transition Run' },
            { day: 'Thursday', workout_type: 'Recovery Swim', description: '1,000m pull buoy & mobility reset' },
            { day: 'Friday', workout_type: 'Threshold Run', description: '8 km with 3 x 1 mile repeats' },
            { day: 'Saturday', workout_type: 'Long Endurance Bike', description: '2.5 hours Zone 2 with nutrition practice' },
            { day: 'Sunday', workout_type: 'Long Base Run', description: '14 km sustained pace on soft trails' },
          ],
        },
        {
          week_number: 2,
          focus: 'Threshold Power & Open Water Pacing',
          days: [
            { day: 'Monday', workout_type: 'Endurance Swim', description: '2,000m continuous pacing set' },
            { day: 'Tuesday', workout_type: 'FTP Intervals Bike', description: '75 min with 4 x 8m at Sweet Spot' },
            { day: 'Wednesday', workout_type: 'Tempo Run', description: '10 km progressive pacing' },
            { day: 'Thursday', workout_type: 'Rest', description: 'Full recovery & tissue mobilization' },
            { day: 'Friday', workout_type: 'Brick Session', description: '60 min Bike + 30 min Run at 70.3 pace' },
            { day: 'Saturday', workout_type: 'Long Ride', description: '3 hours Zone 2 aerodynamic position' },
            { day: 'Sunday', workout_type: 'Half Marathon Run', description: '16 km steady aerobic rhythm' },
          ],
        },
        {
          week_number: 3,
          focus: 'Race Simulation & Brick Volume',
          days: [
            { day: 'Monday', workout_type: 'Fast Swim', description: '1,800m with 10 x 100m race pace' },
            { day: 'Tuesday', workout_type: 'Climbing Bike', description: '70 min hilly route low cadence' },
            { day: 'Wednesday', workout_type: 'Brick Simulation', description: '75 min Race Pace Bike + 5 km Run' },
            { day: 'Thursday', workout_type: 'Recovery Swim', description: '1,200m easy drill work' },
            { day: 'Friday', workout_type: 'Pacing Run', description: '8 km with race pace surges' },
            { day: 'Saturday', workout_type: 'Long Ride', description: '80 km Zone 2 aero check' },
            { day: 'Sunday', workout_type: 'Long Run', description: '18 km negative split finish' },
          ],
        },
        {
          week_number: 4,
          focus: 'Taper & Transition Mastery',
          days: [
            { day: 'Monday', workout_type: 'Rest', description: 'Rest & hydration' },
            { day: 'Tuesday', workout_type: 'Taper Swim', description: '1,200m with short accelerations' },
            { day: 'Wednesday', workout_type: 'Taper Spin', description: '40 min easy spin + 3 sprints' },
            { day: 'Thursday', workout_type: 'Taper Run', description: '4 km easy jog with 4 strides' },
            { day: 'Friday', workout_type: 'Rest', description: 'Bike transition setup & electrolytes' },
            { day: 'Saturday', workout_type: 'Mini Shakeout', description: '15m swim + 10m jog' },
            { day: 'Sunday', workout_type: 'Race Day', description: 'Triathlon 70.3 Target Event!' },
          ],
        },
      ],
    };
  } else if (r.includes('5k') || r.includes('10k') || r.includes('speed')) {
    return {
      goal: `Prepare for ${raceType} by ${raceDate}`,
      weeks: [
        {
          week_number: 1,
          focus: 'VO2 Max & Neuromuscular Speed',
          days: [
            { day: 'Monday', workout_type: 'Recovery Run', description: '5 km easy + 5 x 100m accelerations' },
            { day: 'Tuesday', workout_type: 'Track Repeats', description: '6 x 800m at 5k goal pace (90s rest)' },
            { day: 'Wednesday', workout_type: 'VO2 Max Intervals', description: '8 x 400m hard effort with equal jog rest' },
            { day: 'Thursday', workout_type: 'Rest', description: '25 min mobility & core stability' },
            { day: 'Friday', workout_type: 'Threshold Tempo', description: '6 km continuous at 10k race pace' },
            { day: 'Saturday', workout_type: 'Easy Run', description: '7 km relaxed aerobic base' },
            { day: 'Sunday', workout_type: 'Long Run', description: '12 km building finish' },
          ],
        },
        {
          week_number: 2,
          focus: 'Lactate Tolerance & Turnover',
          days: [
            { day: 'Monday', workout_type: 'Easy Run', description: '6 km with strides' },
            { day: 'Tuesday', workout_type: '1km Repeats', description: '5 x 1,000m at 5k pace (2m rest)' },
            { day: 'Wednesday', workout_type: 'Aerobic Recovery', description: '6 km easy conversational pace' },
            { day: 'Thursday', workout_type: 'Rest', description: 'Tendon recovery & sleep' },
            { day: 'Friday', workout_type: 'Tempo Run', description: '7 km threshold pace' },
            { day: 'Saturday', workout_type: 'Speed Play', description: 'Fartlek 8 x 1m on/off' },
            { day: 'Sunday', workout_type: 'Long Run', description: '14 km steady Zone 2' },
          ],
        },
        {
          week_number: 3,
          focus: 'Speed Endurance & Pacing Lock',
          days: [
            { day: 'Monday', workout_type: 'Recovery Run', description: '5 km relaxed' },
            { day: 'Tuesday', workout_type: 'Ladder Track', description: '400m - 800m - 1200m - 800m - 400m' },
            { day: 'Wednesday', workout_type: 'Easy Run', description: '6 km easy' },
            { day: 'Thursday', workout_type: 'Rest', description: 'Mobility drills' },
            { day: 'Friday', workout_type: 'Race Pace Tempo', description: '5 km at exact goal race pace' },
            { day: 'Saturday', workout_type: 'Shakeout', description: '5 km easy' },
            { day: 'Sunday', workout_type: 'Long Run', description: '11 km with fast finish' },
          ],
        },
        {
          week_number: 4,
          focus: 'Taper & Peak Freshness',
          days: [
            { day: 'Monday', workout_type: 'Rest', description: 'Full recovery' },
            { day: 'Tuesday', workout_type: 'Sharpening', description: '4 x 400m fast with 2m rest' },
            { day: 'Wednesday', workout_type: 'Easy Jog', description: '4 km very easy' },
            { day: 'Thursday', workout_type: 'Rest', description: 'Hydration & mental prep' },
            { day: 'Friday', workout_type: 'Pre-Race Strides', description: '3 km jog + 4 strides' },
            { day: 'Saturday', workout_type: 'Rest', description: 'Rest & fueling' },
            { day: 'Sunday', workout_type: 'Race Day', description: '5K / 10K Target PR Effort!' },
          ],
        },
      ],
    };
  } else {
    // Default Hyrox Open / Pro
    return {
      goal: `Prepare for ${raceType} by ${raceDate}`,
      weeks: [
        {
          week_number: 1,
          focus: 'Compromised Running & Stations',
          days: [
            { day: 'Monday', workout_type: 'Sled & Strength', description: '1km Run + 80m Sled Push (125kg) + 400m recovery runs' },
            { day: 'Tuesday', workout_type: 'Zone 2 Base', description: '40 min steady aerobic nasal breathing run' },
            { day: 'Wednesday', workout_type: 'Hyrox Simulation', description: '1km Run + 50m Sled Pull & 80m Burpee Broad Jumps' },
            { day: 'Thursday', workout_type: 'Rest & Mobility', description: 'Hip flexors, ankles & hamstring release' },
            { day: 'Friday', workout_type: 'Erg Intervals', description: '5 x 500m SkiErg & 5 x 500m Row at target race pace' },
            { day: 'Saturday', workout_type: 'Compromised Run', description: '4 x 800m run with 100 Wall Balls (6kg) buy-in' },
            { day: 'Sunday', workout_type: 'Long Aerobic Run', description: '60 min conversational pace endurance run' },
          ],
        },
        {
          week_number: 2,
          focus: 'Lactate Threshold & Heavy Carry Resilience',
          days: [
            { day: 'Monday', workout_type: 'Farmers Carry & Lunges', description: '200m Farmers Carry (2x24kg) + 100m Sandbag Lunges' },
            { day: 'Tuesday', workout_type: 'Tempo Threshold Run', description: '35 min Zone 3/4 sustained running' },
            { day: 'Wednesday', workout_type: 'Station Speedwork', description: '1,000m SkiErg into 80m Sled Push sprint sets' },
            { day: 'Thursday', workout_type: 'Rest', description: 'Cold plunge, hydration & cellular repair' },
            { day: 'Friday', workout_type: 'Compromised Intervals', description: '5 x 1km runs with 20 burpees between intervals' },
            { day: 'Saturday', workout_type: 'Full Hyrox Half-Sim', description: '4 stations back-to-back with 1km runs' },
            { day: 'Sunday', workout_type: 'Zone 2 Recovery', description: '50 min easy recovery jog or cycle' },
          ],
        },
        {
          week_number: 3,
          focus: 'Grip Endurance & Pacing Simulation',
          days: [
            { day: 'Monday', workout_type: 'Sled Heavy Overload', description: 'Sled Push @ 150kg + Sled Pull @ 100kg' },
            { day: 'Tuesday', workout_type: 'Interval Runs', description: '6 x 800m fast with heavy dumbbell holds' },
            { day: 'Wednesday', workout_type: 'Row & Wall Ball Blast', description: '1,000m Row + 100 Wall Balls for time' },
            { day: 'Thursday', workout_type: 'Rest', description: 'Deep tissue foam rolling & electrolytes' },
            { day: 'Friday', workout_type: 'Race Pacing Drill', description: 'Simulate Stations 1-8 at 85% race intensity' },
            { day: 'Saturday', workout_type: 'Sandbag & Lunge Grind', description: '200m Sandbag Lunges (20kg) + 1km recovery runs' },
            { day: 'Sunday', workout_type: 'Long Aerobic Run', description: '65 min Zone 2 aerobic base' },
          ],
        },
        {
          week_number: 4,
          focus: 'Taper & Movement Efficiency',
          days: [
            { day: 'Monday', workout_type: 'Rest', description: 'Rest & central nervous system reset' },
            { day: 'Tuesday', workout_type: 'Sharpening Stations', description: 'Short 250m SkiErg & light sled technique' },
            { day: 'Wednesday', workout_type: 'Easy Jog', description: '25 min relaxed jog + 4 strides' },
            { day: 'Thursday', workout_type: 'Rest', description: 'Carb loading & sleep optimization' },
            { day: 'Friday', workout_type: 'Shakeout Drill', description: '15 min light movement & wall ball form check' },
            { day: 'Saturday', workout_type: 'Rest', description: 'Rest, hydration & race strategy review' },
            { day: 'Sunday', workout_type: 'Race Day', description: 'Hyrox Competition • All stations locked in!' },
          ],
        },
      ],
    };
  }
};

export default getSportTrainingPlan;
