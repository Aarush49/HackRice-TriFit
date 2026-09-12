/**
 * Shared biological age calculation.
 * Both AthleteProfileModal and ProgressDashboardScreen import this
 * so they always show the same bio age number.
 *
 * @param {object} userProfile - the userProfile state from App.js
 * @returns {{ biologicalAge: number, bioAgeAdj: number, bioAgeTagText: string, bioAgeTagColor: string, bioAgeTagBg: string }}
 */
export function computeBioAge(userProfile = {}) {
  const chronoAge = parseInt(userProfile?.age, 10) || 25;
  const fitnessLevel = userProfile?.fitness_level || '';
  const trainingDays = parseInt(userProfile?.training_days, 10) || 4;

  let adj = 0;
  if (fitnessLevel.includes('race-trained') || fitnessLevel.includes('Already')) adj -= 5;
  else if (fitnessLevel.includes('regularly') || fitnessLevel.includes('regular')) adj -= 3;
  else if (fitnessLevel.includes('occasionally') || fitnessLevel.includes('Train occ')) adj -= 1;
  else if (fitnessLevel.includes('New') || fitnessLevel.includes('new')) adj += 2;

  if (trainingDays >= 6) adj -= 3;
  else if (trainingDays >= 4) adj -= 2;
  else if (trainingDays >= 3) adj -= 1;
  else adj += 1;

  const biologicalAge = Math.max(15, chronoAge + adj);

  const bioAgeTagText =
    adj < 0
      ? `${Math.abs(adj)} yrs younger`
      : adj > 0
      ? `${adj} yrs older`
      : 'Same as chrono age';

  const bioAgeTagColor =
    adj < -2 ? '#16a34a' : adj < 0 ? '#0d9488' : adj > 2 ? '#dc2626' : '#b45309';

  const bioAgeTagBg = adj < 0 ? '#f0fdf4' : adj > 0 ? '#fef2f2' : '#fef3c7';

  return { biologicalAge, bioAgeAdj: adj, bioAgeTagText, bioAgeTagColor, bioAgeTagBg };
}
