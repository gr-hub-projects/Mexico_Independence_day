(() => {
  'use strict';

  const QUESTIONS = window.TRIVIA_QUESTIONS || [];

  const BOOKING_CONFIG = {
    baseUrl: 'https://www.nexustours.com/en/services/mexico/quintana-roo/cancun/109303',
    // IMPORTANT: Confirm the exact NexusTours checkout handoff parameter before production launch.
    // Keep this in one place so e-commerce can change it without touching the rest of the trivia.
    promoParamName: 'promocode',
    promo10: 'VIVA10',
    promo15: 'VIVA15',
    utm: {
      source: 'qr_mexico_trivia',
      medium: 'interactive',
      campaign: 'viva_mexico_trivia'
    }
  };

  const copy = {
    es: {
      challenge: 'EXPERIENCIA DE TRIVIA · 1 MINUTO',
      welcomeTitle: '¿QUÉ TANTO SABES DE <em>MÉXICO?</em>',
      welcomeSupporting: 'SOLO LOS VERDADEROS EXPERTOS EN MÉXICO LO LOGRAN.',
      start: 'COMENZAR TRIVIA',
      questionsLabel: 'preguntas',
      minuteLabel: 'minuto',
      maxOffLabel: 'máx. off',
      next: 'SIGUIENTE PREGUNTA',
      questionOf: (n, total) => `Pregunta ${n} de ${total}`,
      correct: '¡CORRECTO!',
      notQuite: '¡CASI!',
      correctAnswer: answer => `La respuesta correcta es: ${answer}`,
      correctPositive: '¡Muy bien! Sumas 1 punto.',
      yourScore: 'TU PUNTAJE',
      youUnlocked: 'DESBLOQUEASTE',
      resultTitle: '¡FELICIDADES!',
      resultCopy: 'Has desbloqueado un beneficio especial de NexusTours.',
      resultEyebrow: 'EXPERTO EN MÉXICO',
      bookNow: 'RESERVAR AHORA',
      tryAgain: 'INTENTAR DE NUEVO',
      noPrizeTitle: '¡CASI LO TIENES!',
      noPrizeCopy: 'Responde correctamente al menos 4 preguntas para desbloquear un beneficio especial.',
      noPrizeEyebrow: 'SIGUE EXPLORANDO MÉXICO',
      noPrize: 'AÚN NO',
      benefit10: 'Tu beneficio del 10% está listo para enviarse al flujo de reserva.',
      benefit15: 'Tu beneficio del 15% está listo para enviarse al flujo de reserva.',
      restartConfirm: '¿Quieres reiniciar la trivia? Se perderá tu avance.',
      pts: score => `${score} pt${score === 1 ? '' : 's'}`
    },
    en: {
      challenge: 'ONE-MINUTE TRIVIA EXPERIENCE',
      welcomeTitle: 'THINK YOU KNOW <em>MEXICO?</em>',
      welcomeSupporting: 'ONLY REAL MEXICO EXPERTS MAKE IT.',
      start: 'START TRIVIA',
      questionsLabel: 'questions',
      minuteLabel: 'minute',
      maxOffLabel: 'max off',
      next: 'NEXT QUESTION',
      questionOf: (n, total) => `Question ${n} of ${total}`,
      correct: 'CORRECT!',
      notQuite: 'NOT QUITE!',
      correctAnswer: answer => `The correct answer is: ${answer}`,
      correctPositive: 'Great job! You earned 1 point.',
      yourScore: 'YOUR SCORE',
      youUnlocked: 'YOU UNLOCKED',
      resultTitle: 'CONGRATULATIONS!',
      resultCopy: 'You unlocked a special NexusTours benefit.',
      resultEyebrow: 'MEXICO EXPERT',
      bookNow: 'BOOK NOW',
      tryAgain: 'TRY AGAIN',
      noPrizeTitle: 'SO CLOSE!',
      noPrizeCopy: 'Get at least 4 answers right to unlock a special benefit.',
      noPrizeEyebrow: 'KEEP EXPLORING MEXICO',
      noPrize: 'NOT YET',
      benefit10: 'Your 10% benefit is ready to be sent to the booking flow.',
      benefit15: 'Your 15% benefit is ready to be sent to the booking flow.',
      restartConfirm: 'Restart the trivia? Your progress will be lost.',
      pts: score => `${score} pt${score === 1 ? '' : 's'}`
    }
  };

  const els = {
    welcome: document.getElementById('welcomeScreen'),
    quiz: document.getElementById('quizScreen'),
    result: document.getElementById('resultScreen'),
    start: document.getElementById('startBtn'),
    restart: document.getElementById('restartBtn'),
    progressText: document.getElementById('progressText'),
    progressBar: document.getElementById('progressBar'),
    scoreText: document.getElementById('scoreText'),
    questionImage: document.getElementById('questionImage'),
    fallbackEmoji: document.getElementById('fallbackEmoji'),
    questionNumber: document.getElementById('questionNumber'),
    questionText: document.getElementById('questionText'),
    answers: document.getElementById('answers'),
    feedback: document.getElementById('feedbackPanel'),
    feedbackIcon: document.getElementById('feedbackIcon'),
    feedbackTitle: document.getElementById('feedbackTitle'),
    feedbackMessage: document.getElementById('feedbackMessage'),
    next: document.getElementById('nextBtn'),
    finalScore: document.getElementById('finalScore'),
    discountBlock: document.getElementById('discountBlock'),
    discountValue: document.getElementById('discountValue'),
    resultTitle: document.getElementById('resultTitle'),
    resultCopy: document.getElementById('resultCopy'),
    resultEyebrow: document.getElementById('resultEyebrow'),
    benefitNote: document.getElementById('benefitNote'),
    book: document.getElementById('bookBtn'),
    tryAgain: document.getElementById('tryAgainBtn')
  };

  let lang = (navigator.language || 'es').toLowerCase().startsWith('es') ? 'es' : 'en';
  let current = 0;
  let score = 0;
  let answered = false;
  let awardedPromo = null;

  function track(event, details = {}) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...details });
  }

  function setLanguage(nextLang) {
    lang = nextLang === 'en' ? 'en' : 'es';
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(node => {
      const key = node.dataset.i18n;
      const value = copy[lang][key];
      if (typeof value === 'string') {
        if (key === 'welcomeTitle') node.innerHTML = value;
        else node.textContent = value;
      }
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
      const active = btn.dataset.lang === lang;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });

    if (!els.quiz.classList.contains('hidden')) renderQuestion();
    if (!els.result.classList.contains('hidden')) renderResult();
    localStorage.setItem('nexus-trivia-lang', lang);
  }

  function showScreen(screen) {
    [els.welcome, els.quiz, els.result].forEach(el => el.classList.add('hidden'));
    screen.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function startTrivia() {
    current = 0;
    score = 0;
    answered = false;
    awardedPromo = null;
    showScreen(els.quiz);
    renderQuestion();
    track('trivia_start', { language: lang });
  }

  function renderQuestion() {
    const item = QUESTIONS[current];
    if (!item) return showResults();

    answered = false;
    els.feedback.className = 'feedback-panel hidden';
    els.next.classList.add('hidden');
    els.answers.innerHTML = '';

    els.progressText.textContent = copy[lang].questionOf(current + 1, QUESTIONS.length);
    els.scoreText.textContent = copy[lang].pts(score);
    els.progressBar.style.width = `${((current + 1) / QUESTIONS.length) * 100}%`;
    els.progressBar.parentElement.setAttribute('aria-valuenow', String(current + 1));
    els.questionNumber.textContent = String(current + 1).padStart(2, '0');
    els.questionText.textContent = item.q[lang];

    if (item.image) {
      els.questionImage.src = item.image;
      els.questionImage.alt = item.alt?.[lang] || '';
      els.questionImage.classList.remove('hidden');
      els.fallbackEmoji.classList.add('hidden');
    } else {
      els.questionImage.classList.add('hidden');
      els.fallbackEmoji.textContent = item.emoji || '🇲🇽';
      els.fallbackEmoji.classList.remove('hidden');
    }

    item.options[lang].forEach((label, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'answer-btn';
      button.dataset.letter = ['A', 'B', 'C'][index];
      button.textContent = label;
      button.addEventListener('click', () => chooseAnswer(index, button));
      els.answers.appendChild(button);
    });
  }

  function chooseAnswer(selectedIndex, selectedButton) {
    if (answered) return;
    answered = true;

    const item = QUESTIONS[current];
    const buttons = [...els.answers.querySelectorAll('.answer-btn')];
    const isCorrect = selectedIndex === item.correct;

    buttons.forEach(btn => btn.disabled = true);

    if (isCorrect) {
      score += 1;
      selectedButton.classList.add('correct');
      els.feedback.className = 'feedback-panel correct-feedback';
      els.feedbackIcon.textContent = '✓';
      els.feedbackTitle.textContent = copy[lang].correct;
      els.feedbackMessage.textContent = copy[lang].correctPositive;
    } else {
      selectedButton.classList.add('wrong');
      buttons[item.correct].classList.add('reveal');
      els.feedback.className = 'feedback-panel wrong-feedback';
      els.feedbackIcon.textContent = '×';
      els.feedbackTitle.textContent = copy[lang].notQuite;
      els.feedbackMessage.textContent = copy[lang].correctAnswer(item.options[lang][item.correct]);
    }

    els.scoreText.textContent = copy[lang].pts(score);
    els.next.classList.remove('hidden');
    els.feedback.focus({ preventScroll: true });

    track('trivia_answer', {
      question_number: current + 1,
      correct: isCorrect,
      score,
      language: lang
    });
  }

  function nextQuestion() {
    if (!answered) return;
    if (current >= QUESTIONS.length - 1) return showResults();
    current += 1;
    renderQuestion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function getReward(scoreValue) {
    if (scoreValue >= 6) return { discount: 15, code: BOOKING_CONFIG.promo15 };
    if (scoreValue >= 4) return { discount: 10, code: BOOKING_CONFIG.promo10 };
    return { discount: 0, code: null };
  }

  function showResults() {
    const reward = getReward(score);
    awardedPromo = reward.code;
    showScreen(els.result);
    renderResult();
    track('trivia_complete', { score, discount: reward.discount, language: lang });
  }

  function renderResult() {
    const reward = getReward(score);
    awardedPromo = reward.code;
    els.finalScore.textContent = `${score}/${QUESTIONS.length}`;

    if (reward.discount > 0) {
      els.resultTitle.textContent = copy[lang].resultTitle;
      els.resultCopy.textContent = copy[lang].resultCopy;
      els.resultEyebrow.textContent = copy[lang].resultEyebrow;
      els.discountBlock.classList.remove('hidden');
      els.discountValue.textContent = `${reward.discount}% OFF`;
      els.benefitNote.textContent = reward.discount === 15 ? copy[lang].benefit15 : copy[lang].benefit10;
      els.book.classList.remove('hidden');
      els.tryAgain.classList.add('hidden');
    } else {
      els.resultTitle.textContent = copy[lang].noPrizeTitle;
      els.resultCopy.textContent = copy[lang].noPrizeCopy;
      els.resultEyebrow.textContent = copy[lang].noPrizeEyebrow;
      els.discountBlock.classList.remove('hidden');
      els.discountValue.textContent = copy[lang].noPrize;
      els.benefitNote.textContent = '';
      els.book.classList.add('hidden');
      els.tryAgain.classList.remove('hidden');
    }
  }

  function buildBookingUrl() {
    const url = new URL(BOOKING_CONFIG.baseUrl);
    if (awardedPromo) url.searchParams.set(BOOKING_CONFIG.promoParamName, awardedPromo);
    if (lang === 'es') {
      url.searchParams.set('culture', 'es');
      url.searchParams.set('idioma', 'es');
    }
    url.searchParams.set('utm_source', BOOKING_CONFIG.utm.source);
    url.searchParams.set('utm_medium', BOOKING_CONFIG.utm.medium);
    url.searchParams.set('utm_campaign', BOOKING_CONFIG.utm.campaign);
    url.searchParams.set('utm_content', awardedPromo === BOOKING_CONFIG.promo15 ? 'result_15' : 'result_10');
    return url.toString();
  }

  function bookNow() {
    if (!awardedPromo) return;
    const url = buildBookingUrl();
    track('trivia_book_now', { score, promo: awardedPromo, language: lang });
    window.location.assign(url);
  }

  function restartTrivia(force = false) {
    if (!force && !window.confirm(copy[lang].restartConfirm)) return;
    startTrivia();
  }

  document.querySelectorAll('.lang-btn').forEach(btn => btn.addEventListener('click', () => setLanguage(btn.dataset.lang)));
  els.start.addEventListener('click', startTrivia);
  els.next.addEventListener('click', nextQuestion);
  els.book.addEventListener('click', bookNow);
  els.tryAgain.addEventListener('click', () => restartTrivia(true));
  els.restart.addEventListener('click', () => restartTrivia(false));

  const savedLang = localStorage.getItem('nexus-trivia-lang');
  setLanguage(savedLang || lang);
})();
