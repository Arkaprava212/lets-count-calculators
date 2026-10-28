/* Let's Count - connects each calculator form to the maths in calc.js.
   All wording shown by this script (results, errors, assumptions) lives in the STR object below, in English and Hindi. */
(function () {
  'use strict';
  var C = window.Calc;
  var form = document.querySelector('form[data-calc]');
  if (!C || !form) return;

  var lang = document.documentElement.lang === 'hi' ? 'hi' : 'en';
  var locale = lang === 'hi' ? 'hi-IN' : 'en-IN';
  var kind = form.getAttribute('data-calc');
  var resultEl = document.getElementById('result');
  var initialResult = resultEl.innerHTML;

  /* ---------------- wording ---------------- */
  var STR = {
    en: {
      unit: { km: 'km', mi: 'mi' }, kmh: { km: 'km/h', mi: 'mph' }, per: { km: '/km', mi: '/mi' },
      kg: 'kg', lb: 'lb', min: 'min', result: 'Your result', assumptions: 'Assumptions used',
      fixTitle: 'Please fix the following:',
      errors: {
        missing: 'enter a number (digits only, no negative numbers).',
        invalid_number: 'use digits only, for example 10 or 10.5.',
        time_invalid: 'use digits only for hours, minutes and seconds.',
        time_format: 'seconds must be between 0 and 59.',
        time_missing: 'enter a time longer than zero.',
        distance_range: 'enter a distance between {dmin} and {dmax} {unit}.',
        pace_implausible: 'this distance and time give a pace outside {pmin}–{pmax} {per}, which is very unlikely. Please check for typing mistakes.',
        pace_missing: 'enter a pace in minutes and seconds.',
        pace_range: 'enter a pace between {pmin} and {pmax} {per}.',
        race_distance_range: 'enter a distance between {rmin} and {rmax} {unit}.',
        weight_range: 'enter a weight between {wmin} and {wmax} {wunit}.',
        duration_range: 'enter a time between 1 minute and 24 hours.',
        speed_implausible: 'this distance and time are outside the usual speed range for {activity}. Please check for typing mistakes.',
        current_range: 'enter a weekly distance of at least 1 {unit} and no more than 200 {unit}.',
        goal_range: 'enter a goal between 2 and 200 {unit} per week.',
        goal_not_higher: 'your goal must be higher than your current weekly distance.',
        weeks_range: 'enter a whole number of weeks between 2 and 52.',
        age_range: 'enter your age as a whole number between 10 and 100.',
        resting_range: 'enter a resting heart rate between 30 and 120 beats per minute (and lower than your estimated maximum).'
      },
      activity: { run: 'running', walk: 'walking', cycle: 'cycling' },
      pace: {
        paceLabel: 'Pace', speed: 'Average speed', otherPace: 'Pace in {unit2}', dist: 'Distance', time: 'Finish time',
        splitsTitle: 'Split times (running total at each {unit} mark)', mark: 'Mark', cumulative: 'Time so far', last: 'Finish',
        assume: ['You hold the same pace for the whole distance.', '1 mile = 1.609344 km.', 'Hills, stops, heat and wind are not included.']
      },
      race: {
        title: 'Estimated finish times', race: 'Race', time: 'Estimated time', pace: 'Pace', yours: '(your run)',
        names: { '5k': '5K', '10k': '10K', half: 'Half marathon', marathon: 'Marathon' },
        longReach: 'Your recent run is much shorter or longer than these race distances, so the predictions are less reliable.',
        assume: ['Uses the Riegel formula: new time = your time × (new distance ÷ your distance) ^ 1.06.', 'Assumes you have trained for each distance in a similar way.', 'Heat, hills, nutrition and race-day nerves are not included. Longer races (half and full marathon) usually need specific training, so treat these as a rough guide.']
      },
      cal: {
        big: 'calories burned (estimate)', range: 'A rough range for illustration: {lo}–{hi} kcal.', met: 'Effort level (MET)', speed: 'Average speed', defaultNote: 'You did not enter a distance, so a typical effort level for {activity} was used. Add a distance for a better estimate.',
        assume: ['Calories = MET × body weight (kg) × time (hours).', 'MET values are rounded from the Compendium of Physical Activities for {activity}.', 'The figure includes the energy your body would use at rest anyway.', 'Real values vary with fitness, terrain, wind and body composition. The range shown is illustrative, not a measured error.']
      },
      plan: {
        reached: 'You reach your goal of {goal} {unit} per week in week {w}.', notReached: 'In {weeks} weeks this plan reaches {peak} {unit} per week. At this rate of increase you would need about {needed} weeks to reach {goal} {unit}.',
        week: 'Week', total: 'Weekly total ({unit})', type: 'Week type', long: 'Long run (about, {unit})',
        types: { build: 'Build', recovery: 'Recovery', goal: 'Goal reached', hold: 'Hold at goal' },
        assume: ['Each build week adds up to {rate}% to the previous build week.', 'Every 4th week is a recovery week at 80% of the last build week.', 'The long run is shown as about 30% of the week. Both are common rules of thumb, not proven limits.', 'The plan counts distance only. It does not know your injuries, health or experience.']
      },
      hr: {
        max: 'Estimated maximum heart rate', bpm: 'beats per minute', zone: 'Zone', name: 'Effort', range: 'Heart rate (bpm)', pct: '% used', feel: 'How it feels',
        names: ['Warm-up & recovery', 'Easy (you can chat)', 'Steady', 'Hard', 'Very hard'],
        feels: ['Very light; walking or a gentle jog', 'Comfortable; full sentences are easy', 'Moderate; short sentences', 'Hard; only a few words at a time', 'Maximum; can be held only briefly'],
        pctMax: '% of maximum heart rate', pctRes: '% of heart rate reserve (maximum minus resting)',
        assumeTanaka: 'Maximum heart rate = 208 − 0.7 × age (Tanaka formula).', assumeClassic: 'Maximum heart rate = 220 − age (older, simpler formula).',
        assumeZones: 'Zones are 50–60%, 60–70%, 70–80%, 80–90% and 90–100%.',
        assumeRes: 'With your resting heart rate, zones use the Karvonen method: resting + % × (maximum − resting).',
        assumeNoRes: 'No resting heart rate entered, so zones are simple percentages of the maximum.',
        assumeErr: 'A formula estimate can be 10 beats or more away from your true maximum. A watch or a doctor’s test is more accurate.'
      },
      next: 'Try another calculator:'
    },
    hi: {
      unit: { km: 'किमी', mi: 'मील' }, kmh: { km: 'किमी/घंटा', mi: 'मील/घंटा' }, per: { km: '/किमी', mi: '/मील' },
      kg: 'किग्रा', lb: 'पाउंड', min: 'मिनट', result: 'आपका परिणाम', assumptions: 'उपयोग की गई मान्यताएँ',
      fixTitle: 'कृपया इन्हें ठीक करें:',
      errors: {
        missing: 'एक संख्या डालें (सिर्फ़ अंक, ऋणात्मक संख्या नहीं)।',
        invalid_number: 'सिर्फ़ अंक डालें, जैसे 10 या 10.5।',
        time_invalid: 'घंटे, मिनट और सेकंड में सिर्फ़ अंक डालें।',
        time_format: 'सेकंड 0 से 59 के बीच होने चाहिए।',
        time_missing: 'शून्य से अधिक समय डालें।',
        distance_range: '{dmin} से {dmax} {unit} के बीच की दूरी डालें।',
        pace_implausible: 'इस दूरी और समय से गति {pmin}–{pmax} {per} के बाहर आती है, जो बहुत असंभव है। कृपया टाइपिंग की गलती जाँचें।',
        pace_missing: 'गति मिनट और सेकंड में डालें।',
        pace_range: '{pmin} से {pmax} {per} के बीच की गति डालें।',
        race_distance_range: '{rmin} से {rmax} {unit} के बीच की दूरी डालें।',
        weight_range: '{wmin} से {wmax} {wunit} के बीच वज़न डालें।',
        duration_range: '1 मिनट से 24 घंटे के बीच का समय डालें।',
        speed_implausible: 'यह दूरी और समय {activity} की सामान्य गति सीमा से बाहर हैं। कृपया टाइपिंग की गलती जाँचें।',
        current_range: 'साप्ताहिक दूरी कम से कम 1 {unit} और अधिकतम 200 {unit} डालें।',
        goal_range: 'प्रति सप्ताह 2 से 200 {unit} के बीच लक्ष्य डालें।',
        goal_not_higher: 'आपका लक्ष्य मौजूदा साप्ताहिक दूरी से ज़्यादा होना चाहिए।',
        weeks_range: '2 से 52 के बीच पूर्ण संख्या में सप्ताह डालें।',
        age_range: '10 से 100 के बीच पूर्ण संख्या में अपनी उम्र डालें।',
        resting_range: 'आराम की हृदय गति 30 से 120 धड़कन प्रति मिनट के बीच डालें (और यह अनुमानित अधिकतम से कम हो)।'
      },
      activity: { run: 'दौड़ने', walk: 'पैदल चलने', cycle: 'साइकिल चलाने' },
      pace: {
        paceLabel: 'गति (पेस)', speed: 'औसत रफ़्तार', otherPace: '{unit2} में गति', dist: 'दूरी', time: 'पूरा करने का समय',
        splitsTitle: 'स्प्लिट समय (हर {unit} पर अब तक का कुल समय)', mark: 'पड़ाव', cumulative: 'अब तक का समय', last: 'अंत',
        assume: ['आप पूरी दूरी में एक ही गति बनाए रखते हैं।', '1 मील = 1.609344 किमी।', 'चढ़ाई, रुकना, गर्मी और हवा शामिल नहीं हैं।']
      },
      race: {
        title: 'अनुमानित फिनिश समय', race: 'दौड़', time: 'अनुमानित समय', pace: 'गति', yours: '(आपकी दौड़)',
        names: { '5k': '5K', '10k': '10K', half: 'हाफ मैराथन', marathon: 'मैराथन' },
        longReach: 'आपकी हाल की दौड़ इन दूरियों से बहुत छोटी या बड़ी है, इसलिए अनुमान कम भरोसेमंद हैं।',
        assume: ['रीगेल सूत्र: नया समय = आपका समय × (नई दूरी ÷ आपकी दूरी) ^ 1.06।', 'मान लिया गया है कि आपने हर दूरी के लिए एक जैसी तैयारी की है।', 'गर्मी, चढ़ाई, खान-पान और रेस के दिन की घबराहट शामिल नहीं है। लंबी दौड़ों (हाफ और फुल मैराथन) के लिए विशेष तैयारी चाहिए, इसलिए इसे मोटा मार्गदर्शन मानें।']
      },
      cal: {
        big: 'कैलोरी खर्च (अनुमान)', range: 'उदाहरण के लिए मोटा दायरा: {lo}–{hi} किलोकैलोरी।', met: 'प्रयास स्तर (MET)', speed: 'औसत रफ़्तार', defaultNote: 'आपने दूरी नहीं डाली, इसलिए {activity} का सामान्य प्रयास स्तर लिया गया। बेहतर अनुमान के लिए दूरी जोड़ें।',
        assume: ['कैलोरी = MET × शरीर का वज़न (किग्रा) × समय (घंटे)।', 'MET मान {activity} के लिए "कंपेंडियम ऑफ़ फिज़िकल एक्टिविटीज़" से गोल किए गए हैं।', 'इस आँकड़े में वह ऊर्जा भी शामिल है जो शरीर आराम में भी खर्च करता है।', 'असली मान फिटनेस, रास्ते, हवा और शरीर की बनावट से बदलते हैं। दिखाया गया दायरा उदाहरण है, मापी गई त्रुटि नहीं।']
      },
      plan: {
        reached: 'आप {w}वें सप्ताह में प्रति सप्ताह {goal} {unit} के लक्ष्य तक पहुँचते हैं।', notReached: '{weeks} सप्ताह में यह योजना प्रति सप्ताह {peak} {unit} तक पहुँचती है। इसी बढ़ोतरी की दर से {goal} {unit} तक पहुँचने में लगभग {needed} सप्ताह लगेंगे।',
        week: 'सप्ताह', total: 'साप्ताहिक कुल ({unit})', type: 'सप्ताह का प्रकार', long: 'लंबी दौड़ (लगभग, {unit})',
        types: { build: 'बढ़ोतरी', recovery: 'रिकवरी', goal: 'लक्ष्य पूरा', hold: 'लक्ष्य पर बने रहें' },
        assume: ['हर बढ़ोतरी वाला सप्ताह पिछले बढ़ोतरी वाले सप्ताह से अधिकतम {rate}% ज़्यादा है।', 'हर चौथा सप्ताह रिकवरी का है, जो पिछले बढ़ोतरी वाले सप्ताह का 80% है।', 'लंबी दौड़ सप्ताह का लगभग 30% दिखाई गई है। दोनों आम अंगूठा-नियम हैं, सिद्ध सीमाएँ नहीं।', 'योजना सिर्फ़ दूरी गिनती है। यह आपकी चोट, सेहत या अनुभव नहीं जानती।']
      },
      hr: {
        max: 'अनुमानित अधिकतम हृदय गति', bpm: 'धड़कन प्रति मिनट', zone: 'ज़ोन', name: 'प्रयास', range: 'हृदय गति (धड़कन/मिनट)', pct: 'प्रतिशत', feel: 'कैसा महसूस होता है',
        names: ['वॉर्म-अप और रिकवरी', 'आसान (बात कर सकते हैं)', 'स्थिर गति', 'कठिन', 'बहुत कठिन'],
        feels: ['बहुत हल्का; सैर या धीमी जॉगिंग', 'आरामदायक; पूरे वाक्य आसानी से बोल सकते हैं', 'मध्यम; छोटे वाक्य', 'कठिन; एक बार में कुछ ही शब्द', 'अधिकतम; बस थोड़ी देर टिकता है'],
        pctMax: 'अधिकतम हृदय गति का %', pctRes: 'हृदय गति रिज़र्व का % (अधिकतम − आराम)',
        assumeTanaka: 'अधिकतम हृदय गति = 208 − 0.7 × उम्र (तनाका सूत्र)।', assumeClassic: 'अधिकतम हृदय गति = 220 − उम्र (पुराना, सरल सूत्र)।',
        assumeZones: 'ज़ोन 50–60%, 60–70%, 70–80%, 80–90% और 90–100% हैं।',
        assumeRes: 'आराम की हृदय गति देने पर ज़ोन कार्वोनेन विधि से बनते हैं: आराम + % × (अधिकतम − आराम)।',
        assumeNoRes: 'आराम की हृदय गति नहीं डाली गई, इसलिए ज़ोन अधिकतम के सरल प्रतिशत हैं।',
        assumeErr: 'सूत्र से निकला अनुमान आपकी असली अधिकतम गति से 10 धड़कन या ज़्यादा अलग हो सकता है। घड़ी या डॉक्टर की जाँच अधिक सटीक है।'
      },
      next: 'दूसरा कैलकुलेटर आज़माएँ:'
    }
  };
  var S = STR[lang];

  /* ---------------- helpers ---------------- */
  function nf(n, d) { return new Intl.NumberFormat(locale, { maximumFractionDigits: d === undefined ? 1 : d }).format(n); }
  function el(id) { return document.getElementById(id); }
  function raw(id) { var e = el(id); return e ? e.value.trim() : ''; }
  function sub(tpl, p) { return String(tpl).replace(/\{(\w+)\}/g, function (m, k) { return p && p[k] !== undefined ? p[k] : m; }); }
  function checked(name, fallback) { var r = form.querySelector('input[name="' + name + '"]:checked'); return r ? r.value : fallback; }
  function unit() { return checked('units', 'km'); }
  function wunit() { return checked('wunits', 'kg'); }
  function factor(u) { return u === 'mi' ? C.KM_PER_MI : 1; }
  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage may be blocked */ } }
  function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function pace(sec) { return C.fmtDuration(sec); }

  // Reads a number field. Blank -> NaN (the calculator reports it as missing). Junk text -> recorded error.
  function readNum(id, field, errs) {
    var t = raw(id);
    var n = C.parseNum(t);
    if (t !== '' && isNaN(n)) errs.push({ field: field, code: 'invalid_number' });
    return n;
  }
  function readTime(prefix, errs, field) {
    var r = C.parseHMS(raw(prefix + '-h'), raw(prefix + '-m'), raw(prefix + '-s'));
    if (r.error) { errs.push({ field: field || 'time', code: r.error }); return NaN; }
    return r.seconds;
  }

  function clearMarks() {
    Array.prototype.forEach.call(form.querySelectorAll('[aria-invalid]'), function (e) { e.removeAttribute('aria-invalid'); });
  }

  function showErrors(errors, params) {
    clearMarks();
    var seen = {}, items = [], first = null;
    errors.forEach(function (e) {
      var key = e.field + e.code;
      if (seen[key]) return;
      seen[key] = true;
      var fields = form.querySelectorAll('[data-field="' + e.field + '"]');
      var label = fields.length ? fields[0].getAttribute('data-label') : '';
      Array.prototype.forEach.call(fields, function (f) { f.setAttribute('aria-invalid', 'true'); if (!first) first = f; });
      items.push('<li>' + (label ? '<strong>' + label + ':</strong> ' : '') + sub(S.errors[e.code] || S.errors.missing, params) + '</li>');
    });
    resultEl.innerHTML = '<div class="errors" role="alert"><strong>' + S.fixTitle + '</strong><ul>' + items.join('') + '</ul></div>';
    if (first) first.focus();
  }

  function assumeBox(list) {
    return '<div class="assume"><h3>' + S.assumptions + '</h3><ul>' + list.map(function (a) { return '<li>' + a + '</li>'; }).join('') + '</ul></div>';
  }
  function kv(rows) {
    return '<dl class="kv">' + rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join('') + '</dl>';
  }
  function finish(html) {
    clearMarks();
    resultEl.innerHTML = '<h2>' + S.result + '</h2>' + html;
  }

  /* ---------------- calculators ---------------- */
  var run = {};

  run.pace = function () {
    var u = unit(), f = factor(u), errs = [], mode = el('mode').value;
    var km = readNum('distance', 'distance', errs) * f;
    var seconds = NaN, secPerKm = NaN;
    if (mode === 'time') seconds = readTime('t', errs);
    else {
      var r = C.parseHMS('0', raw('p-m'), raw('p-s'));
      if (r.error) errs.push({ field: 'pace', code: r.error === 'time_missing' ? 'pace_missing' : r.error });
      else secPerKm = r.seconds / f;
    }
    if (errs.length) return { errors: errs };
    var res = mode === 'time' ? C.paceFromTime(km, seconds) : C.timeFromPace(km, secPerKm);
    var P = C.LIMITS.paceSecPerKm;
    res.params = { dmin: nf(C.LIMITS.distanceKm[0] / f, 1), dmax: nf(C.LIMITS.distanceKm[1] / f, 0), unit: S.unit[u], per: S.per[u], pmin: pace(P[0] * f), pmax: pace(P[1] * f) };
    if (res.errors) return res;
    var o = u === 'km' ? 'mi' : 'km';
    var secUnit = u === 'km' ? res.secPerKm : res.secPerMi, secOther = u === 'km' ? res.secPerMi : res.secPerKm;
    var speed = u === 'km' ? res.kmh : res.mph;
    var big = mode === 'time'
      ? '<p class="big">' + pace(secUnit) + ' <small>' + S.per[u] + '</small></p>'
      : '<p class="big">' + C.fmtDuration(res.totalSec) + ' <small>' + S.pace.time + '</small></p>';
    var rows = [[S.pace.dist, nf(res.distanceKm / f, 2) + ' ' + S.unit[u]]];
    if (mode === 'time') rows.push([S.pace.time, C.fmtDuration(res.totalSec)]); else rows.push([S.pace.paceLabel, pace(secUnit) + ' ' + S.per[u]]);
    rows.push([S.pace.speed, nf(speed, 1) + ' ' + S.kmh[u]]);
    rows.push([sub(S.pace.otherPace, { unit2: S.unit[o] }), pace(secOther) + ' ' + S.per[o]]);
    var sp = C.splits(res.distanceKm, res.secPerKm, u);
    var table = '<h3>' + sub(S.pace.splitsTitle, { unit: S.unit[u] }) + '</h3><div class="table-wrap"><table><thead><tr><th>' + S.pace.mark + '</th><th>' + S.pace.cumulative + '</th></tr></thead><tbody>' +
      sp.map(function (r) { return '<tr><td>' + nf(r.mark, 2) + ' ' + S.unit[u] + (r.partial ? ' (' + S.pace.last + ')' : '') + '</td><td>' + C.fmtDuration(r.sec) + '</td></tr>'; }).join('') + '</tbody></table></div>';
    finish(big + kv(rows) + table + assumeBox(S.pace.assume));
    return null;
  };

  run.race = function () {
    var u = unit(), f = factor(u), errs = [];
    var km = readNum('distance', 'distance', errs) * f;
    var seconds = readTime('t', errs);
    if (errs.length) return { errors: errs };
    var res = C.predictRaces(km, seconds);
    var P = C.LIMITS.racePaceSecPerKm, R = C.LIMITS.raceInputKm;
    res.params = { rmin: nf(R[0] / f, 1), rmax: nf(R[1] / f, 0), unit: S.unit[u], per: S.per[u], pmin: pace(P[0] * f), pmax: pace(P[1] * f) };
    if (res.errors) return res;
    var T = S.race;
    var rows = res.races.map(function (r) {
      return '<tr' + (r.isInput ? ' class="hl"' : '') + '><td>' + T.names[r.id] + (r.isInput ? ' ' + T.yours : '') + '</td><td>' + C.fmtDuration(r.sec) + '</td><td>' + pace(r.secPerKm * f) + ' ' + S.per[u] + '</td></tr>';
    }).join('');
    var warn = res.longReach ? '<p class="warn-line">' + T.longReach + '</p>' : '';
    finish('<h3>' + T.title + '</h3><div class="table-wrap"><table><thead><tr><th>' + T.race + '</th><th>' + T.time + '</th><th>' + T.pace + '</th></tr></thead><tbody>' + rows + '</tbody></table></div>' + warn + assumeBox(T.assume));
    return null;
  };

  run.calories = function () {
    var errs = [], wu = wunit();
    var w = readNum('weight', 'weight', errs);
    var kg = wu === 'lb' ? w * 0.45359237 : w;
    var d = readNum('distance', 'distance', errs) * factor(unit());
    var sec = readTime('t', errs);
    var act = el('activity').value;
    if (errs.length) return { errors: errs };
    var res = C.calories(act, kg, sec, d);
    var W = C.LIMITS.weightKg;
    res.params = { wmin: nf(wu === 'lb' ? W[0] / 0.45359237 : W[0], 0), wmax: nf(wu === 'lb' ? W[1] / 0.45359237 : W[1], 0), wunit: S[wu], activity: S.activity[act] };
    if (res.errors) return res;
    var T = S.cal, u = unit();
    var r5 = function (x, s) { return nf(Math.round(x / s) * s, 0); };
    var rows = [[T.met, nf(res.met, 1)]];
    if (res.kmh !== null) rows.push([T.speed, nf(res.kmh / factor(u), 1) + ' ' + S.kmh[u]]);
    var note = res.usedDefault ? '<p class="warn-line">' + sub(T.defaultNote, { activity: S.activity[act] }) + '</p>' : '';
    finish('<p class="big">≈ ' + r5(res.kcal, 5) + ' <small>kcal</small></p><p>' + T.big + '</p><p>' + sub(T.range, { lo: r5(res.low, 10), hi: r5(res.high, 10) }) + '</p>' + kv(rows) + note +
      assumeBox(T.assume.map(function (a) { return sub(a, { activity: S.activity[act] }); })));
    return null;
  };

  run.planner = function () {
    var errs = [], u = unit();
    var cur = readNum('current', 'current', errs), goal = readNum('goal', 'goal', errs), weeks = readNum('weeks', 'weeks', errs);
    if (errs.length) return { errors: errs };
    var rate = parseFloat(el('rate').value) / 100;
    var res = C.trainingPlan(cur, goal, weeks, rate);
    res.params = { unit: S.unit[u] };
    if (res.errors) return res;
    var T = S.plan;
    var msg = res.reachedWeek
      ? sub(T.reached, { goal: nf(goal, 1), unit: S.unit[u], w: res.reachedWeek })
      : sub(T.notReached, { weeks: weeks, peak: nf(res.peak, 1), unit: S.unit[u], goal: nf(goal, 1), needed: res.weeksNeeded || '—' });
    var rows = res.rows.map(function (r) {
      return '<tr><td>' + r.week + '</td><td>' + nf(r.vol, 1) + '</td><td>' + T.types[r.type] + '</td><td>' + nf(r.longRun, 1) + '</td></tr>';
    }).join('');
    finish('<p class="big" style="font-size:22px">' + msg + '</p><div class="table-wrap"><table><thead><tr><th>' + T.week + '</th><th>' + sub(T.total, { unit: S.unit[u] }) + '</th><th>' + T.type + '</th><th>' + sub(T.long, { unit: S.unit[u] }) + '</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      assumeBox(T.assume.map(function (a) { return sub(a, { rate: Math.round(rate * 100) }); })));
    return null;
  };

  run.hr = function () {
    var errs = [];
    var age = readNum('age', 'age', errs), rest = readNum('resting', 'resting', errs);
    if (errs.length) return { errors: errs };
    var method = el('method').value;
    var res = C.hrZones(age, method, rest);
    res.params = {};
    if (res.errors) return res;
    var T = S.hr;
    var colours = ['#93c5fd', '#60a5fa', '#3b82f6', '#1d4ed8', '#1e3a8a'];
    var rows = res.zones.map(function (z, i) {
      return '<tr><td><span class="zone-bar" style="background:' + colours[i] + '"></span>' + z.zone + '</td><td>' + T.names[i] + '</td><td><strong>' + z.lo + '–' + z.hi + '</strong></td><td>' + z.pLo + '–' + z.pHi + '%</td><td>' + T.feels[i] + '</td></tr>';
    }).join('');
    var list = [method === 'classic' ? T.assumeClassic : T.assumeTanaka, T.assumeZones, res.useReserve ? T.assumeRes : T.assumeNoRes, T.assumeErr];
    finish('<p class="big">' + res.maxHr + ' <small>' + T.bpm + '</small></p><p>' + T.max + '</p><div class="table-wrap"><table><thead><tr><th>' + T.zone + '</th><th>' + T.name + '</th><th>' + T.range + '</th><th>' + T.pct + '</th><th>' + T.feel + '</th></tr></thead><tbody>' + rows + '</tbody></table></div>' + assumeBox(list));
    return null;
  };

  /* ---------------- wiring ---------------- */
  function syncUnits() {
    var u = unit(), w = wunit();
    Array.prototype.forEach.call(form.querySelectorAll('[data-unit-text]'), function (n) { n.textContent = S.unit[u]; });
    Array.prototype.forEach.call(form.querySelectorAll('[data-per-text]'), function (n) { n.textContent = S.per[u]; });
    Array.prototype.forEach.call(form.querySelectorAll('[data-weight-text]'), function (n) { n.textContent = S[w]; });
  }
  function syncMode() {
    var m = form.elements.mode ? form.elements.mode.value : null;
    if (!m) return;
    Array.prototype.forEach.call(form.querySelectorAll('[data-show-mode]'), function (n) {
      n.hidden = n.getAttribute('data-show-mode') !== m;
    });
  }
  function resetResult() { clearMarks(); resultEl.innerHTML = initialResult; }

  var saved = load('lb-units');
  if (saved === 'mi' && el('u-mi')) el('u-mi').checked = true;
  syncUnits(); syncMode();

  form.addEventListener('change', function (e) {
    if (e.target.name === 'units') { store('lb-units', e.target.value); syncUnits(); resetResult(); }
    else if (e.target.name === 'wunits') { syncUnits(); }
    else if (e.target.name === 'mode') { syncMode(); resetResult(); }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var out = run[kind]();
    if (out && out.errors) showErrors(out.errors, out.params || {});
  });
  form.addEventListener('reset', function () { setTimeout(function () { syncUnits(); syncMode(); resetResult(); }, 0); });

  Array.prototype.forEach.call(form.querySelectorAll('[data-km]'), function (b) {
    b.addEventListener('click', function () {
      el('distance').value = String(C.round(parseFloat(b.getAttribute('data-km')) / factor(unit()), 3));
    });
  });
  Array.prototype.forEach.call(form.querySelectorAll('[data-example]'), function (b) {
    b.addEventListener('click', function () {
      var vals = JSON.parse(b.getAttribute('data-example'));
      form.reset();
      setTimeout(function () {
        Object.keys(vals).forEach(function (id) { var n = el(id); if (n) n.value = vals[id]; });
        syncUnits(); syncMode();
        if (form.requestSubmit) form.requestSubmit(); else form.dispatchEvent(new Event('submit', { cancelable: true }));
      }, 0);
    });
  });
})();
