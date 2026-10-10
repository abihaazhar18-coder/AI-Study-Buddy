/* Tiny in-browser test runner for StudyMate AI. */
(function () {
  'use strict';
  var tests = [], log = document.getElementById('log');
  function test(name, fn) { tests.push({ name: name, fn: fn }); }
  function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }
  function eq(a, b, msg) { if (a !== b) throw new Error((msg || 'not equal') + ': expected ' + JSON.stringify(b) + ', got ' + JSON.stringify(a)); }

  var TEXT = 'Photosynthesis is the process by which green plants use sunlight to make glucose from carbon dioxide and water. ' +
    'Chlorophyll is the green pigment in chloroplasts that absorbs light energy. Chloroplasts are organelles found in plant cells where photosynthesis takes place. ' +
    'The light-dependent reactions occur in the thylakoid membranes and produce ATP and NADPH. The Calvin cycle refers to the light-independent reactions that fix carbon dioxide into glucose. ' +
    'Oxygen is released as a by-product when water molecules are split. Stomata are tiny pores on the leaf surface that allow carbon dioxide to enter. ' +
    'The rate of photosynthesis depends on light intensity, carbon dioxide concentration and temperature. Glucose produced by photosynthesis is stored as starch. ' +
    'Gravity pulls objects with an acceleration of about 9.8 metres per second squared.';

  function define(C, win) {
    test('splitSentences splits on terminators, keeps decimals', function () {
      var s = C.splitSentences('Hello world. Is it 9.8 m/s? Yes! ok');
      eq(s.length, 3, 'sentence count'); eq(s[1], 'Is it 9.8 m/s?');
      eq(C.splitSentences('').length, 0, 'empty');
    });
    test('extractKeywords ranks frequent non-stopwords', function () {
      var k = C.extractKeywords(TEXT, 5);
      eq(k.length, 5); assert(k.indexOf('the') < 0, 'no stopwords');
      assert(k.indexOf('photosynthesis') >= 0 || k.indexOf('carbon') >= 0, 'expected a topical keyword: ' + k);
    });
    test('findDefinitions detects is/are/refers to patterns', function () {
      var d = C.findDefinitions(TEXT), terms = d.map(function (x) { return x.term; });
      assert(terms.indexOf('Photosynthesis') >= 0, 'Photosynthesis: ' + terms);
      assert(terms.indexOf('Chlorophyll') >= 0, 'Chlorophyll');
      assert(terms.indexOf('Calvin cycle') >= 0, 'Calvin cycle (refers to)');
      eq(C.findDefinitions('It is raining today again.').length, 0, 'pronoun subject ignored');
    });
    test('summary length is bounded', function () {
      eq(C.summarize(TEXT, 3).length, 3); eq(C.summarize('One sentence only here.', 3).length, 1);
      var n = C.generateNotes(TEXT, 'Bio');
      assert(n.summary.length >= 1 && n.summary.length <= 3, 'notes summary 1..3');
      assert(n.keyConcepts.length > 0 && n.bullets.length > 0, 'concepts and bullets');
      assert(n.markdown.indexOf('# Bio') === 0 && n.markdown.indexOf('## Definitions') > 0, 'markdown sections');
    });
    test('mdToHtml escapes user HTML (XSS)', function () {
      var h = C.mdToHtml('# <img src=x onerror=alert(1)>\n- **bold** <script>');
      assert(h.indexOf('<img') < 0 && h.indexOf('<script') < 0, 'escaped: ' + h);
      assert(h.indexOf('<strong>bold</strong>') >= 0, 'bold rendered');
      eq(C.escapeHtml('<a href="x">\'&'), '&lt;a href=&quot;x&quot;&gt;&#39;&amp;');
    });
    test('generateQuiz: count, answer in options, unique options', function () {
      var q = C.generateQuiz(TEXT, 5);
      eq(q.length, 5, 'question count');
      q.forEach(function (x) {
        assert(x.options.indexOf(x.answer) >= 0, 'answer in options: ' + x.prompt);
        eq(new Set(x.options).size, x.options.length, 'unique options');
        if (x.type === 'mcq') { eq(x.options.length, 4, 'mcq has 4 options'); assert(x.prompt.indexOf('_____') >= 0, 'cloze blank'); }
        else eq(x.options.join(), 'True,False');
      });
      assert(q.some(function (x) { return x.type === 'tf'; }) && q.some(function (x) { return x.type === 'mcq'; }), 'mix of types');
      eq(JSON.stringify(C.generateQuiz(TEXT, 5)), JSON.stringify(q), 'deterministic');
    });
    test('gradeQuiz scores answers', function () {
      var q = C.generateQuiz(TEXT, 4), ans = {};
      ans[q[0].id] = q[0].answer; ans[q[1].id] = q[1].answer; ans[q[2].id] = '__wrong__';
      var r = C.gradeQuiz(q, ans);
      eq(r.correct, 2); eq(r.total, 4); eq(r.percent, 50);
      eq(r.results[3].given, null, 'unanswered is null'); eq(r.results[2].correct, false);
    });
    test('planner: no sessions on/after exam, hours/day respected, review day before exam', function () {
      var subs = [{ id: 'a', name: 'A', examDate: '2026-03-05' }, { id: 'b', name: 'B', examDate: '2026-03-10' }, { id: 'c', name: 'Past', examDate: '2026-02-01' }];
      var p = C.generatePlan({ subjects: subs, startDate: '2026-03-01', hoursPerDay: 3, scores: { a: 90, b: 30 } });
      assert(p.length > 0, 'has sessions');
      p.forEach(function (s) { var sub = subs.filter(function (x) { return x.id === s.subjectId; })[0]; assert(s.date < sub.examDate, 'session before exam: ' + s.id); });
      assert(!p.some(function (s) { return s.subjectId === 'c'; }), 'past exams skipped');
      var perDay = {}; p.forEach(function (s) { perDay[s.date] = (perDay[s.date] || 0) + s.minutes; });
      Object.keys(perDay).forEach(function (d) { assert(perDay[d] <= 180, 'over budget on ' + d + ': ' + perDay[d]); });
      ['a', 'b'].forEach(function (id) {
        var sub = subs.filter(function (x) { return x.id === id; })[0];
        var r = p.filter(function (s) { return s.subjectId === id && s.date === C.addDays(sub.examDate, -1); })[0];
        assert(r && r.type === 'review', 'review day for ' + id);
      });
      eq(C.generatePlan({ subjects: [], startDate: '2026-03-01', hoursPerDay: 2 }).length, 0, 'empty plan');
    });
    test('planner: weaker subject gets more time', function () {
      var subs = [{ id: 'a', name: 'A', examDate: '2026-03-20' }, { id: 'b', name: 'B', examDate: '2026-03-20' }];
      var p = C.generatePlan({ subjects: subs, startDate: '2026-03-01', hoursPerDay: 4, scores: { a: 95, b: 20 } });
      var sum = function (id) { return p.filter(function (s) { return s.subjectId === id; }).reduce(function (t, s) { return t + s.minutes; }, 0); };
      assert(sum('b') > sum('a'), 'b=' + sum('b') + ' a=' + sum('a'));
    });
    test('flashcards SM-2: intervals, ease and due dates', function () {
      var t = '2026-03-01', c = C.createCard('Q', 'A', 's', t);
      assert(C.isDue(c, t), 'new card due today'); eq(c.ease, 2.5);
      var g1 = C.reviewCard(c, 'good', t); eq(g1.interval, 1); eq(g1.due, '2026-03-02'); assert(!C.isDue(g1, t), 'not due after review');
      var g2 = C.reviewCard(g1, 'good', '2026-03-02'); eq(g2.interval, 6); eq(g2.due, '2026-03-08');
      var g3 = C.reviewCard(g2, 'good', '2026-03-08'); eq(g3.interval, 15);
      var a = C.reviewCard(g3, 'again', '2026-03-23'); eq(a.reps, 0); eq(a.interval, 1); eq(a.ease, 2.3);
      var e = C.reviewCard(c, 'easy', t); eq(e.interval, 4); eq(e.ease, 2.65);
      var low = c; for (var i = 0; i < 10; i++) low = C.reviewCard(low, 'again', t); eq(low.ease, 1.3, 'ease floor');
      eq(c.interval, 0, 'original card not mutated');
    });
    test('cardsFromNotes builds definition and cloze cards', function () {
      var n = C.generateNotes(TEXT, 'Bio'), cards = C.cardsFromNotes(n, TEXT, 's1', '2026-03-01');
      assert(cards.length >= n.definitions.length + 1, 'count ' + cards.length);
      assert(cards.some(function (c) { return c.front === 'Photosynthesis'; }), 'definition card');
      assert(cards.some(function (c) { return c.front.indexOf('_____') >= 0; }), 'cloze card');
      assert(cards.every(function (c) { return c.subjectId === 's1' && c.due === '2026-03-01'; }), 'fields');
    });
    test('storage: round trip, corrupt data falls back to defaults', function () {
      var mem = C.memoryStorage(), st = C.createStore(mem, 'k'), s = C.defaultState();
      s.subjects.push({ id: 'x', name: 'X', examDate: '2026-05-01' }); st.save(s);
      eq(st.load().subjects[0].name, 'X');
      mem.setItem('k', '{not json'); eq(st.load().subjects.length, 0, 'corrupt -> default');
      st.clear(); eq(mem.getItem('k'), null);
    });
    test('computeStats aggregates dashboard numbers', function () {
      var s = C.defaultState();
      s.subjects = [{ id: 'a', name: 'A', examDate: '2026-03-04' }, { id: 'b', name: 'B', examDate: '2026-01-01' }];
      s.attempts = [{ subjectId: 'a', percent: 40 }, { subjectId: 'a', percent: 80 }];
      s.plan.sessions = [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }]; s.plan.done = { '1': true };
      s.cards = [C.createCard('q', 'a', 'a', '2026-03-01'), C.createCard('q', 'a', 'a', '2026-03-09')];
      var r = C.computeStats(s, '2026-03-01');
      eq(r.subjects, 2); eq(r.upcoming.length, 1); eq(r.upcoming[0].daysLeft, 3); eq(r.avgScore, 60); eq(r.planPct, 25); eq(r.cardsDue, 1);
    });
    test('offline is default; API errors and bad JSON fall back offline', async function () {
      var r0 = await C.aiNotes(TEXT, 'T', { apiBase: '', apiKey: '' });
      eq(r0.provider, 'offline'); assert(r0.notes.summary.length > 0);
      var api = { apiBase: 'https://example.invalid/v1', apiKey: 'k', model: 'm' };
      var failing = function () { return Promise.reject(new Error('network down')); };
      var r1 = await C.aiNotes(TEXT, 'T', api, failing); eq(r1.provider, 'offline'); assert(/network/.test(r1.error));
      var badJson = function () { return Promise.resolve({ ok: true, json: function () { return { choices: [{ message: { content: 'not json' } }] }; } }); };
      var r2 = await C.aiQuiz(TEXT, 5, api, badJson); eq(r2.provider, 'offline'); eq(r2.questions.length, 5);
      var good = function (url, opts) {
        assert(/\/chat\/completions$/.test(url) && opts.headers.Authorization === 'Bearer k', 'request shape');
        return Promise.resolve({ ok: true, json: function () { return { choices: [{ message: { content: JSON.stringify({ questions: [{ type: 'mcq', prompt: 'p', options: ['a', 'b', 'c', 'd'], answer: 'b', explanation: 'e' }] }) } }] }; } });
      };
      var r3 = await C.aiQuiz(TEXT, 5, api, good); eq(r3.provider, 'api'); eq(r3.questions[0].id, 'q0');
    });
    test('UI smoke: demo data, all tabs render, quiz flow, no JS errors', async function () {
      var d = win.document, S = win.StudyApp;
      win.confirm = function () { return true; }; win.alert = function () {};
      d.querySelector('[data-action="reset"]').click();
      d.querySelector('[data-action="demo"]').click();
      eq(S.getState().subjects.length, 3, 'demo subjects');
      assert(S.getState().plan.sessions.length > 0 && S.getState().cards.length > 0 && S.getState().attempts.length === 2, 'demo plan/cards/attempts');
      ['subjects', 'notes', 'flashcards', 'quiz', 'planner', 'settings', 'dashboard'].forEach(function (t) {
        d.getElementById('tab-' + t).click();
        assert(!d.getElementById('panel-' + t).hidden && d.getElementById('panel-' + t).innerHTML.length > 50, 'tab renders: ' + t);
      });
      d.getElementById('tab-quiz').click();
      d.querySelector('[data-form="quiz-gen"] button[type=submit]').click();
      await new Promise(function (r) { setTimeout(r, 50); });
      var radios = d.querySelectorAll('[data-form="quiz-submit"] input[type=radio]');
      assert(radios.length >= 10, 'quiz rendered: ' + radios.length); radios[0].checked = true;
      d.querySelector('[data-form="quiz-submit"] button[type=submit]').click();
      eq(S.getState().attempts.length, 3, 'attempt saved');
      assert(/Score:/.test(d.getElementById('panel-quiz').textContent), 'score shown');
      d.getElementById('tab-flashcards').click(); d.querySelector('[data-action="practice-start"]').click();
      d.querySelector('[data-action="card-flip"]').click(); d.querySelector('[data-action="card-rate"][data-rating="good"]').click();
      assert(S.getState().cards.some(function (c) { return c.reps === 1; }), 'card reviewed');
      eq(d.getElementById('errors').textContent, '', 'app #errors empty');
      eq(win.__errors.length, 0, 'no runtime errors');
    });
  }

  async function run() {
    var frame = document.getElementById('app'), win, C;
    try { win = frame.contentWindow; C = win.StudyCore; } catch (e) { C = null; }
    if (!C) { document.getElementById('result').textContent = 'FAIL could not access StudyCore in iframe (open with --allow-file-access-from-files or via a local server)'; return; }
    define(C, win);
    var failures = [];
    for (var i = 0; i < tests.length; i++) {
      var t = tests[i], li = document.createElement('li');
      try { await t.fn(); li.className = 'pass'; li.textContent = 'PASS ' + t.name; }
      catch (e) { failures.push(t.name + ': ' + e.message); li.className = 'fail'; li.textContent = 'FAIL ' + t.name + ' — ' + e.message; }
      log.appendChild(li);
    }
    document.getElementById('result').textContent = failures.length
      ? 'FAIL ' + (tests.length - failures.length) + '/' + tests.length + '\n' + failures.join('\n')
      : 'PASS ' + tests.length + '/' + tests.length;
  }
  var started = false;
  function start() { if (!started) { started = true; run(); } }
  document.getElementById('app').addEventListener('load', start);
  try { if (document.getElementById('app').contentWindow.StudyApp) start(); } catch (e) { /* not loaded yet or blocked; load handler reports */ }
})();
