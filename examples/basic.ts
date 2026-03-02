import { readFileSync } from 'node:fs';
import { WhooopperClient, FileTokenStore } from '../dist/index.js';

// Load .env
for (const line of readFileSync('.env', 'utf-8').split('\n')) {
  const match = line.match(/^\s*([^#=]+?)\s*=\s*(.*?)\s*$/);
  if (match && match[2]) process.env[match[1]] = match[2];
}

const clientId = process.env.WHOOP_CLIENT_ID;
const clientSecret = process.env.WHOOP_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error('Set WHOOP_CLIENT_ID and WHOOP_CLIENT_SECRET env vars');
  process.exit(1);
}

const client = WhooopperClient.withOAuth(
  {
    clientId,
    clientSecret,
    redirectUri: 'http://localhost:3000/callback',
    scopes: [
      'offline',
      'read:profile',
      'read:body_measurement',
      'read:cycles',
      'read:recovery',
      'read:sleep',
      'read:workout',
    ],
  },
  { tokenStore: new FileTokenStore('./.whoop-tokens.json') },
);

console.log('Authenticating… (browser will open)');
await client.authenticate();
console.log('Authenticated!\n');

async function tryCall<T>(label: string, fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (e: any) {
    console.log(`[${label}] FAILED: ${e.constructor.name} — ${e.message}`);
    return null;
  }
}

// Profile
const profile = await tryCall('Profile', () => client.user.getProfile());
if (profile) {
  console.log(`Profile: ${profile.first_name} ${profile.last_name} (${profile.email})`);
}

// Body measurement
const body = await tryCall('Body', () => client.user.getBodyMeasurement());
if (body) {
  console.log(`Body: ${body.height_meter}m, ${body.weight_kilogram}kg, max HR ${body.max_heart_rate}`);
}

// Recent cycles
const cycles = await tryCall('Cycles', () => client.cycle.list({ limit: 5 }));
if (cycles) {
  console.log(`\nLast ${cycles.records.length} cycles:`);
  for (const c of cycles.records) {
    const score = c.score
      ? `strain=${c.score.strain.toFixed(1)}, ${c.score.kilojoule.toFixed(0)} kJ`
      : c.score_state;
    console.log(`  ${c.id} | ${c.start} → ${c.end ?? 'ongoing'} | ${score}`);
  }
}

// Recent recovery
const recoveries = await tryCall('Recovery', () => client.recovery.list({ limit: 5 }));
if (recoveries) {
  console.log(`\nLast ${recoveries.records.length} recoveries:`);
  for (const r of recoveries.records) {
    const score = r.score
      ? `${r.score.recovery_score}% recovery, HRV=${r.score.hrv_rmssd_milli.toFixed(1)}ms, RHR=${r.score.resting_heart_rate}`
      : r.score_state;
    console.log(`  cycle=${r.cycle_id} | ${score}`);
  }
}

// Recent sleep
const sleeps = await tryCall('Sleep', () => client.sleep.list({ limit: 3 }));
if (sleeps) {
  console.log(`\nLast ${sleeps.records.length} sleeps:`);
  for (const s of sleeps.records) {
    const score = s.score
      ? `${s.score.sleep_performance_percentage}% perf, ${s.score.sleep_efficiency_percentage.toFixed(1)}% eff, resp=${s.score.respiratory_rate.toFixed(1)}`
      : s.score_state;
    console.log(`  ${s.id} | ${s.nap ? 'NAP' : 'SLEEP'} | ${s.start} → ${s.end} | ${score}`);
  }
}

// Recent workouts
const workouts = await tryCall('Workouts', () => client.workout.list({ limit: 5 }));
if (workouts) {
  console.log(`\nLast ${workouts.records.length} workouts:`);
  for (const w of workouts.records) {
    const score = w.score
      ? `strain=${w.score.strain.toFixed(1)}, ${w.score.kilojoule.toFixed(0)} kJ, avg HR=${w.score.average_heart_rate}`
      : w.score_state;
    console.log(`  ${w.id} | ${w.sport_name} | ${w.start} → ${w.end} | ${score}`);
  }
}

console.log('\nDone! Tokens saved to .whoop-tokens.json for next run.');
