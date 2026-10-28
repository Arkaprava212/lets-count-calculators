/* Let's Count - calculator maths.
   Plain functions only: no page code in here, so they are easy to test (see tests.html). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Calc = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var KM_PER_MI = 1.609344;

  // Sensible limits. Anything outside these is treated as a probable typing mistake.
  var LIMITS = {
    distanceKm: [0.1, 300],
    paceSecPerKm: [60, 1200],      // 1:00 to 20:00 per km
    raceInputKm: [1.5, 50],
    racePaceSecPerKm: [150, 1200], // 2:30 to 20:00 per km
    weightKg: [20, 250],
    durationSec: [60, 86400],
    speedKmh: { run: [3, 25], walk: [1, 9], cycle: [4, 60] },
    weeklyStart: [1, 200],
    weeklyGoal: [2, 200],
    weeks: [2, 52],
    age: [10, 100],
    restingHr: [30, 120]
  };

  /* ---------- parsing and formatting ---------- */

  // Returns a number, or NaN when blank or not a plain non-negative number.
  function parseNum(v) {
    if (v === null || v === undefined) return NaN;
    var s = String(v).replace(/\s/g, '');
    if (s === '') return NaN;
    if (s.indexOf(',') > -1) {
      if (s.indexOf('.') > -1 || s.split(',').length > 2) return NaN;
      s = s.replace(',', '.');
    }
    if (!/^(\d+\.?\d*|\.\d+)$/.test(s)) return NaN;
    return parseFloat(s);
  }

  // Blank counts as 0. Returns {seconds} or {error}.
  function parseHMS(h, m, s) {
    var parts = [h, m, s].map(function (x) {
      return String(x === null || x === undefined ? '' : x).trim() === '' ? 0 : parseNum(x);
    });
    if (parts.some(isNaN)) return { error: 'time_invalid' };
    if (parts[2] >= 60) return { error: 'time_format' };
    var total = parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (total <= 0) return { error: 'time_missing' };
    return { seconds: total };
  }

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  // 3725 -> "1:02:05"; 125 -> "2:05"
  function fmtDuration(totalSec) {
    var t = Math.round(totalSec);
    var h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
    return h > 0 ? h + ':' + pad2(m) + ':' + pad2(s) : m + ':' + pad2(s);
  }

  function round(x, d) { var f = Math.pow(10, d || 0); return Math.round(x * f) / f; }

  /* ---------- 1. Pace ---------- */

  function paceFromTime(distanceKm, seconds) {
    if (isNaN(distanceKm)) return { errors: [{ field: 'distance', code: 'missing' }] };
    if (distanceKm < LIMITS.distanceKm[0] || distanceKm > LIMITS.distanceKm[1])
      return { errors: [{ field: 'distance', code: 'distance_range' }] };
    var secPerKm = seconds / distanceKm;
    if (secPerKm < LIMITS.paceSecPerKm[0] || secPerKm > LIMITS.paceSecPerKm[1])
      return { errors: [{ field: 'time', code: 'pace_implausible' }] };
    return pacePack(distanceKm, secPerKm);
  }

  function timeFromPace(distanceKm, secPerKm) {
    var errors = [];
    if (isNaN(distanceKm)) errors.push({ field: 'distance', code: 'missing' });
    else if (distanceKm < LIMITS.distanceKm[0] || distanceKm > LIMITS.distanceKm[1])
      errors.push({ field: 'distance', code: 'distance_range' });
    if (isNaN(secPerKm)) errors.push({ field: 'pace', code: 'pace_missing' });
    else if (secPerKm < LIMITS.paceSecPerKm[0] || secPerKm > LIMITS.paceSecPerKm[1])
      errors.push({ field: 'pace', code: 'pace_range' });
    if (errors.length) return { errors: errors };
    return pacePack(distanceKm, secPerKm);
  }

  function pacePack(distanceKm, secPerKm) {
    return {
      distanceKm: distanceKm,
      totalSec: distanceKm * secPerKm,
      secPerKm: secPerKm,
      secPerMi: secPerKm * KM_PER_MI,
      kmh: 3600 / secPerKm,
      mph: 3600 / (secPerKm * KM_PER_MI)
    };
  }

  // Split table at whole km / mile marks, then a final partial split. Max 60 rows.
  function splits(distanceKm, secPerKm, unit) {
    var perUnitKm = unit === 'mi' ? KM_PER_MI : 1;
    var dist = distanceKm / perUnitKm;
    var rows = [], n = Math.floor(dist + 1e-9);
    for (var i = 1; i <= n && rows.length < 60; i++) {
      rows.push({ mark: i, sec: i * perUnitKm * secPerKm });
    }
    var rest = dist - n;
    if (rest > 0.005 && rows.length < 60) rows.push({ mark: round(dist, 2), sec: distanceKm * secPerKm, partial: true });
    return rows;
  }

  /* ---------- 2. Race time predictor (Riegel, exponent 1.06) ---------- */

  var RACES = [
    { id: '5k', km: 5 },
    { id: '10k', km: 10 },
    { id: 'half', km: 21.0975 },
    { id: 'marathon', km: 42.195 }
  ];

  function predictRaces(distanceKm, seconds) {
    var errors = [];
    if (isNaN(distanceKm)) errors.push({ field: 'distance', code: 'missing' });
    else if (distanceKm < LIMITS.raceInputKm[0] || distanceKm > LIMITS.raceInputKm[1])
      errors.push({ field: 'distance', code: 'race_distance_range' });
    if (errors.length) return { errors: errors };
    var secPerKm = seconds / distanceKm;
    if (secPerKm < LIMITS.racePaceSecPerKm[0] || secPerKm > LIMITS.racePaceSecPerKm[1])
      return { errors: [{ field: 'time', code: 'pace_implausible' }] };
    var out = RACES.map(function (r) {
      var t = seconds * Math.pow(r.km / distanceKm, 1.06);
      return { id: r.id, km: r.km, sec: t, secPerKm: t / r.km, isInput: Math.abs(r.km - distanceKm) < 0.01 };
    });
    return { inputKm: distanceKm, inputSec: seconds, races: out, longReach: distanceKm < 3 || distanceKm > 25 };
  }

  /* ---------- 3. Calories (MET method) ---------- */

  // [speed km/h, MET] - values rounded from the Compendium of Physical Activities.
  var RUN_MET = [[6.4, 6.0], [8.0, 8.3], [9.7, 9.8], [10.8, 10.5], [11.3, 11.0], [12.1, 11.5],
                 [12.9, 11.8], [13.8, 12.3], [14.5, 12.8], [16.1, 14.5]];
  var WALK_MET = [[3.2, 2.8], [4.0, 3.0], [4.8, 3.5], [5.6, 4.3], [6.4, 5.0], [7.2, 7.0], [8.0, 8.3]];
  // [upper speed limit (exclusive), MET] - steps for cycling.
  var CYCLE_MET = [[16, 4.0], [19.3, 6.8], [22.5, 8.0], [25.7, 10.0], [32.2, 12.0], [Infinity, 15.8]];
  var DEFAULT_MET = { run: 9.8, walk: 3.5, cycle: 8.0 };

  function interpolate(table, x) {
    if (x <= table[0][0]) return table[0][1];
    for (var i = 1; i < table.length; i++) {
      if (x <= table[i][0]) {
        var a = table[i - 1], b = table[i];
        return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]);
      }
    }
    return table[table.length - 1][1];
  }

  function metFor(activity, kmh) {
    if (activity === 'run') return interpolate(RUN_MET, kmh);
    if (activity === 'walk') return interpolate(WALK_MET, kmh);
    for (var i = 0; i < CYCLE_MET.length; i++) if (kmh < CYCLE_MET[i][0]) return CYCLE_MET[i][1];
    return 15.8;
  }

  // distanceKm may be NaN (not given): then a typical MET for the activity is used.
  function calories(activity, weightKg, durationSec, distanceKm) {
    var errors = [];
    if (!LIMITS.speedKmh[activity]) errors.push({ field: 'activity', code: 'missing' });
    if (isNaN(weightKg)) errors.push({ field: 'weight', code: 'missing' });
    else if (weightKg < LIMITS.weightKg[0] || weightKg > LIMITS.weightKg[1]) errors.push({ field: 'weight', code: 'weight_range' });
    if (durationSec < LIMITS.durationSec[0] || durationSec > LIMITS.durationSec[1]) errors.push({ field: 'time', code: 'duration_range' });
    var kmh = null;
    if (!isNaN(distanceKm) && !errors.length) {
      kmh = distanceKm / (durationSec / 3600);
      var lim = LIMITS.speedKmh[activity];
      if (kmh < lim[0] || kmh > lim[1]) errors.push({ field: 'distance', code: 'speed_implausible' });
    }
    if (errors.length) return { errors: errors };
    var met = kmh === null ? DEFAULT_MET[activity] : metFor(activity, kmh);
    var kcal = met * weightKg * (durationSec / 3600);
    return { kcal: kcal, met: met, kmh: kmh, usedDefault: kmh === null, low: kcal * 0.8, high: kcal * 1.2 };
  }

  /* ---------- 4. Weekly training planner ---------- */

  // Build weeks grow by `rate`; every 4th week is a recovery week at 80% of the last build week.
  function simulatePlan(current, goal, weeks, rate) {
    var rows = [], build = current;
    for (var w = 1; w <= weeks; w++) {
      var type, vol;
      if (w === 1) { type = 'build'; vol = current; }
      else if (w % 4 === 0) { type = 'recovery'; vol = build * 0.8; }
      else if (build >= goal - 1e-9) { type = 'hold'; vol = goal; build = goal; }
      else { build = Math.min(goal, build * (1 + rate)); type = build >= goal - 1e-9 ? 'goal' : 'build'; vol = build; }
      rows.push({ week: w, vol: vol, type: type, longRun: vol * 0.3 });
    }
    return rows;
  }

  function trainingPlan(current, goal, weeks, rate) {
    var errors = [];
    if (isNaN(current)) errors.push({ field: 'current', code: 'missing' });
    else if (current < LIMITS.weeklyStart[0] || current > LIMITS.weeklyStart[1]) errors.push({ field: 'current', code: 'current_range' });
    if (isNaN(goal)) errors.push({ field: 'goal', code: 'missing' });
    else if (goal < LIMITS.weeklyGoal[0] || goal > LIMITS.weeklyGoal[1]) errors.push({ field: 'goal', code: 'goal_range' });
    else if (!isNaN(current) && goal <= current) errors.push({ field: 'goal', code: 'goal_not_higher' });
    if (isNaN(weeks)) errors.push({ field: 'weeks', code: 'missing' });
    else if (weeks !== Math.floor(weeks) || weeks < LIMITS.weeks[0] || weeks > LIMITS.weeks[1]) errors.push({ field: 'weeks', code: 'weeks_range' });
    if (errors.length) return { errors: errors };
    var rows = simulatePlan(current, goal, weeks, rate);
    var reached = rows.filter(function (r) { return r.type === 'goal' || r.type === 'hold'; })[0];
    var needed = null;
    if (!reached) {
      var long = simulatePlan(current, goal, 520, rate);
      for (var i = 0; i < long.length; i++) if (long[i].type === 'goal') { needed = long[i].week; break; }
    }
    var peak = rows.reduce(function (m, r) { return r.type === 'recovery' ? m : Math.max(m, r.vol); }, 0);
    return { rows: rows, reachedWeek: reached ? reached.week : null, weeksNeeded: needed, peak: peak };
  }

  /* ---------- 5. Heart-rate zones ---------- */

  var ZONES = [[0.5, 0.6], [0.6, 0.7], [0.7, 0.8], [0.8, 0.9], [0.9, 1.0]];

  // method: 'tanaka' (208 - 0.7 x age) or 'classic' (220 - age). resting may be NaN (not given).
  function hrZones(age, method, resting) {
    var errors = [];
    if (isNaN(age)) errors.push({ field: 'age', code: 'missing' });
    else if (age < LIMITS.age[0] || age > LIMITS.age[1] || age !== Math.floor(age)) errors.push({ field: 'age', code: 'age_range' });
    if (errors.length) return { errors: errors };
    var maxHr = method === 'classic' ? 220 - age : 208 - 0.7 * age;
    maxHr = Math.round(maxHr);
    var useReserve = !isNaN(resting);
    if (useReserve && (resting < LIMITS.restingHr[0] || resting > LIMITS.restingHr[1] || resting > maxHr * 0.75))
      return { errors: [{ field: 'resting', code: 'resting_range' }] };
    var zones = ZONES.map(function (z, i) {
      var f = function (p) { return Math.round(useReserve ? resting + p * (maxHr - resting) : p * maxHr); };
      return { zone: i + 1, pLo: z[0] * 100, pHi: z[1] * 100, lo: f(z[0]), hi: f(z[1]) };
    });
    return { maxHr: maxHr, useReserve: useReserve, resting: useReserve ? resting : null, zones: zones, method: method };
  }

  return {
    KM_PER_MI: KM_PER_MI, LIMITS: LIMITS, RACES: RACES,
    parseNum: parseNum, parseHMS: parseHMS, fmtDuration: fmtDuration, round: round,
    paceFromTime: paceFromTime, timeFromPace: timeFromPace, splits: splits,
    predictRaces: predictRaces, calories: calories, metFor: metFor,
    trainingPlan: trainingPlan, hrZones: hrZones
  };
}));
