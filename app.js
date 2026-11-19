// === LEGACY QUIZ - STANDALONE REACT APPLICATION ===
// Compatible with both standard React 18 and standalone environments

(function () {
  const { useState, useMemo, useRef, useCallback, useEffect, createElement: h } = window.React;

  // === DATA: CATEGORIES & QUESTIONS ===
  const CATEGORIES = {
    BLOCO_A: {
      id: "bloco_a",
      name: "Bloco A: Conceito e Importância",
      badge: "Bloco A • Conceito",
      icon: "🌐",
      color: "#3b82f6"
    },
    BLOCO_B: {
      id: "bloco_b",
      name: "Bloco B: Privacidade e Memória",
      badge: "Bloco B • Privacidade",
      icon: "🔐",
      color: "#10b981"
    },
    BLOCO_C: {
      id: "bloco_c",
      name: "Bloco C: Plataformas na Prática",
      badge: "Bloco C • Plataformas",
      icon: "📱",
      color: "#f59e0b"
    },
    BLOCO_D: {
      id: "bloco_d",
      name: "Bloco D: Sua Reflexão",
      badge: "Bloco D • Reflexão",
      icon: "✨",
      color: "#8b5cf6"
    }
  };

  const CATEGORY_NAME_TO_KEY = {
    "Bloco A: Conceito e Importância": "BLOCO_A",
    "Bloco B: Privacidade e Memória": "BLOCO_B",
    "Bloco C: Plataformas na Prática": "BLOCO_C",
    "Bloco D: Sua Reflexão": "BLOCO_D"
  };

  const quizQuestions = [
    // BLOCO A: CONCEITO E IMPORTÂNCIA
    {
      id: 1,
      tipo: "conhecimento",
      categoria: "Bloco A: Conceito e Importância",
      pergunta: "O que compõe a identidade digital de uma pessoa?",
      imagem: "img/image 11.png",
      alternativas: [
        { id: "A", texto: "Os dados oficiais cadastrados exclusivamente em sites governamentais.", correta: false },
        { id: "B", texto: "As informações, publicações, curtidas e interações registradas online.", correta: true },
        { id: "C", texto: "O histórico de compras e transações bancárias feitas pela internet.", correta: false }
      ],
      feedback: "Sua identidade digital vai além de cadastros formais: ela é construída diariamente por tudo o que você posta, comenta, compartilha e salva na rede."
    },
    {
      id: 2,
      tipo: "conhecimento",
      categoria: "Bloco A: Conceito e Importância",
      pergunta: "O que forma o legado digital de alguém?",
      imagem: "img/image 2.png",
      alternativas: [
        { id: "A", texto: "O conjunto de fotos, vídeos, mensagens, contas e arquivos acumulados online ao longo da vida.", correta: true },
        { id: "B", texto: "Os aparelhos eletrônicos físicos, como celulares e notebooks, deixados pela pessoa.", correta: false },
        { id: "C", texto: "Os bens que possuem valor financeiro direto, como saldos digitais e criptomoedas.", correta: false }
      ],
      feedback: "O legado digital engloba tanto bens com valor econômico quanto registros afetivos e sociais (fotos, chats, perfis e documentos na nuvem) que permanecem após a morte."
    },
    {
      id: 3,
      tipo: "conhecimento",
      categoria: "Bloco A: Conceito e Importância",
      pergunta: "Quem deve se preocupar com o próprio legado digital?",
      imagem: "img/telefonia.png",
      alternativas: [
        { id: "A", texto: "Criadores de conteúdo e influenciadores com grande alcance nas redes.", correta: false },
        { id: "B", texto: "Profissionais que guardam contratos e documentos financeiros na nuvem.", correta: false },
        { id: "C", texto: "Qualquer pessoa que utilize contas, aplicativos ou serviços digitais.", correta: true }
      ],
      feedback: "Mesmo quem tem poucos seguidores acumula anos de fotos, e-mails e contas vinculadas. Por isso, o planejamento digital diz respeito a todo usuário conectado."
    },
    {
      id: 4,
      tipo: "conhecimento",
      categoria: "Bloco A: Conceito e Importância",
      pergunta: "Por que é importante pensar no legado digital ainda em vida?",
      imagem: "img/02 elvis ing.png",
      alternativas: [
        { id: "A", texto: "Para garantir que todas as redes sociais continuem publicando conteúdos automaticamente.", correta: false },
        { id: "B", texto: "Para decidir como contas, memórias e dados serão gerenciados ou encerrados no futuro.", correta: true },
        { id: "C", texto: "Para impedir que empresas de tecnologia façam atualizações nos aplicativos usados.", correta: false }
      ],
      feedback: "Planejar evita que memórias importantes se percam para sempre ou que dados privados fiquem expostos sem que ninguém saiba o que você gostaria que fosse feito."
    },

    // BLOCO B: PRIVACIDADE E MEMÓRIA
    {
      id: 5,
      tipo: "conhecimento",
      categoria: "Bloco B: Privacidade e Memória",
      pergunta: "Qual é uma consequência de compartilhar mensagens e mídias em ambientes digitais?",
      imagem: "img/04 oracao.jpg",
      alternativas: [
        { id: "A", texto: "Esses registros podem permanecer acessíveis e influenciar como você será lembrado.", correta: true },
        { id: "B", texto: "Todas as conversas privadas são apagadas automaticamente quando a conta fica inativa.", correta: false },
        { id: "C", texto: "Os arquivos enviados deixam de existir assim que o aplicativo é desinstalado do celular.", correta: false }
      ],
      feedback: "Diferente de uma conversa presencial, o que vai para a nuvem ou para o chat de outras pessoas pode durar anos — moldando sua memória digital e exigindo cuidado com a privacidade."
    },
    {
      id: 6,
      tipo: "conhecimento",
      categoria: "Bloco B: Privacidade e Memória",
      pergunta: "O que acontece com fotos salvas na nuvem após a morte do titular da conta?",
      imagem: "img/image 43.png",
      alternativas: [
        { id: "A", texto: "São excluídas imediatamente assim que o celular fica sem conexão com a internet.", correta: false },
        { id: "B", texto: "Tornam-se públicas automaticamente para que amigos possam baixar.", correta: false },
        { id: "C", texto: "Elas permanecem armazenadas ou são encerradas conforme as configurações prévias e regras do serviço.", correta: true }
      ],
      feedback: "Cada plataforma tem uma política própria. Sem uma configuração prévia, a família pode ter muita dificuldade — ou até precisar de autorização judicial — para recuperar fotos de família."
    },
    {
      id: 7,
      tipo: "conhecimento",
      categoria: "Bloco B: Privacidade e Memória",
      pergunta: "Qual atitude ajuda a garantir que suas vontades digitais sejam respeitadas no futuro?",
      imagem: "img/01 fantasmas.jpg",
      alternativas: [
        { id: "A", texto: "Deixar todas as redes sociais abertas sem senha no aparelho principal.", correta: false },
        { id: "B", texto: "Configurar ferramentas de legado nas plataformas e deixar orientações claras a alguém de confiança.", correta: true },
        { id: "C", texto: "Confiar que os provedores de e-mail entrarão em contato com seus familiares.", correta: false }
      ],
      feedback: "As plataformas não sabem o que aconteceu com o usuário a menos que sejam avisadas ou que você já tenha configurado um contato de confiança previamente."
    },
    {
      id: 8,
      tipo: "conhecimento",
      categoria: "Bloco B: Privacidade e Memória",
      pergunta: "Qual é a finalidade de uma mensagem póstuma digital?",
      imagem: "img/ceudex 1.png",
      alternativas: [
        { id: "A", texto: "Transferir automaticamente a titularidade bancária para outra pessoa.", correta: false },
        { id: "B", texto: "Manter o perfil ativo respondendo mensagens como se o usuário estivesse online.", correta: false },
        { id: "C", texto: "Entregar, no futuro, uma despedida, lembrança ou orientação preparada previamente.", correta: true }
      ],
      feedback: "Alguns serviços digitais permitem agendar mensagens ou liberar arquivos específicos para entes queridos após um período de inatividade comprovada."
    },

    // BLOCO C: PLATAFORMAS NA PRÁTICA
    {
      id: 9,
      tipo: "conhecimento",
      categoria: "Bloco C: Plataformas na Prática",
      pergunta: "O que acontece com um perfil no Facebook ou Instagram após o falecimento do usuário?",
      imagem: "img/MemorialDigital2.png",
      alternativas: [
        { id: "A", texto: "Pode ser transformado em memorial (com a tag 'Em memória') ou excluído mediante solicitação.", correta: true },
        { id: "B", texto: "Continua aparecendo normalmente nas sugestões de amizade e lembretes de aniversário.", correta: false },
        { id: "C", texto: "É bloqueado permanentemente sem possibilidade de exclusão pela família.", correta: false }
      ],
      feedback: "A Meta permite transformar contas em memoriais (congelando o perfil para homenagens) ou removê-las permanentemente quando familiares enviam a documentação necessária."
    },
    {
      id: 10,
      tipo: "conhecimento",
      categoria: "Bloco C: Plataformas na Prática",
      pergunta: "O que permite a ferramenta 'Gerenciador de Contas Inativas' do Google?",
      imagem: "img/Lapide Twitter.png",
      alternativas: [
        { id: "A", texto: "Aumentar gratuitamente o espaço de armazenamento do Google Drive e do Gmail.", correta: false },
        { id: "B", texto: "Escolher quem receberá acesso a dados (como Fotos e Drive) ou mandar apagar tudo após um tempo sem uso.", correta: true },
        { id: "C", texto: "Compartilhar sua senha em tempo real com até dez contatos de emergência.", correta: false }
      ],
      feedback: "Pouca gente conhece, mas o Google tem essa função nativa! Você define um prazo (ex: 3 meses sem login) e decide se quer avisar contatos de confiança ou excluir a conta."
    },
    {
      id: 11,
      tipo: "conhecimento",
      categoria: "Bloco C: Plataformas na Prática",
      pergunta: "Qual é o principal risco de não planejar o acesso às contas digitais?",
      imagem: "img/myspace.png",
      alternativas: [
        { id: "A", texto: "As senhas serem divulgadas automaticamente para os contatos da agenda.", correta: false },
        { id: "B", texto: "Os aplicativos cobrarem multas mensais por falta de movimentação.", correta: false },
        { id: "C", texto: "Arquivos afetivos, documentos e contas importantes ficarem inacessíveis para a família.", correta: true }
      ],
      feedback: "Por questões de privacidade e termos de uso, as empresas não entregam senhas a familiares sem autorização prévia, o que pode trancar lembranças e registros importantes."
    },
    {
      id: 12,
      tipo: "conhecimento",
      categoria: "Bloco C: Plataformas na Prática",
      pergunta: "O que pode ocorrer com os bens digitais de uma pessoa após sua morte?",
      imagem: "img/cross-01.png",
      alternativas: [
        { id: "A", texto: "Podem exigir decisões de familiares ou herdeiros sobre preservação, acesso ou exclusão.", correta: true },
        { id: "B", texto: "São transferidos de forma automática e imediata para o nome dos parentes próximos.", correta: false },
        { id: "C", texto: "Passam a pertencer ao domínio público e podem ser baixados por qualquer usuário.", correta: false }
      ],
      feedback: "A legislação e os contratos das plataformas ainda geram muitos debates. Por isso, deixar suas preferências registradas evita conflitos e dúvidas para quem fica."
    },

    // BLOCO D: SUA REFLEXÃO (SEM CERTO OU ERRADO)
    {
      id: 13,
      tipo: "reflexao",
      categoria: "Bloco D: Sua Reflexão",
      pergunta: "Se alguém conhecesse você apenas pelo que está salvo nas suas contas hoje, o que descobriria?",
      imagem: "img/05 bots.jpg",
      alternativas: [
        { id: "A", texto: "Apenas um recorte superficial, pois guardo o mais importante fora da internet.", correta: null },
        { id: "B", texto: "Boa parte da minha história, gostos, fotos e momentos marcantes.", correta: null },
        { id: "C", texto: "Uma mistura de coisas úteis com arquivos e conversas que eu preferiria apagar.", correta: null }
      ],
      feedback: "Reflexão registrada! Essa pergunta mostra como nossos rastros digitais contam uma história sobre nós — e por que vale a pena fazer uma 'faxina' ou curadoria digital de tempos em tempos."
    },
    {
      id: 14,
      tipo: "reflexao",
      categoria: "Bloco D: Sua Reflexão",
      pergunta: "Se você não pudesse acessar suas contas amanhã, o que gostaria que fosse feito com seus dados?",
      imagem: "img/novasoracoes.png",
      alternativas: [
        { id: "A", texto: "Preferiria que todas as minhas contas e conversas fossem excluídas permanentemente.", correta: null },
        { id: "B", texto: "Nunca tinha parado para pensar nisso, mas agora vejo que preciso me organizar.", correta: null },
        { id: "C", texto: "Gostaria que fotos e lembranças fossem entregues a alguém de confiança, e o resto apagado.", correta: null }
      ],
      feedback: "Não existe escolha certa aqui — o importante é que a decisão seja sua! Na próxima tela, você verá dicas rápidas de como configurar isso hoje mesmo no Google e nas redes sociais."
    }
  ];

  const QUIZ_QUESTIONS = quizQuestions.map((q) => {
    const categoryKey = CATEGORY_NAME_TO_KEY[q.categoria] || "BLOCO_A";
    const correctOpt = q.alternativas.find((a) => a.correta === true);
    return {
      ...q,
      image: q.imagem || q.image,
      category: categoryKey,
      question: `${q.id}. ${q.pergunta}`,
      options: q.alternativas.map((a) => ({ ...a, text: a.texto })),
      correctAnswer: q.tipo === "conhecimento" ? (correctOpt ? correctOpt.id : null) : null,
      complement: q.feedback
    };
  });

  const BONUS_QUESTIONS = QUIZ_QUESTIONS.filter((q) => q.tipo === "reflexao").map((q, idx) => ({
    ...q,
    id: `bonus_${idx + 1}`,
    title: `${q.categoria} (Questão ${q.id})`,
    reflection: q.feedback
  }));

  // === AUDIO SYNTHESIZER ===
  function createAudio() {
    let muted = false;
    let audioCtx = null;

    function getCtx() {
      if (!audioCtx) {
        const AudioCtor = window.AudioContext || window.webkitAudioContext;
        if (AudioCtor) audioCtx = new AudioCtor();
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      return audioCtx;
    }

    return {
      getMuted: () => muted,
      setMuted: (val) => { muted = val; },
      playClick: () => {
        if (muted) return;
        try {
          const ctx = getCtx();
          if (!ctx) return;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.05);
        } catch (e) {}
      },
      playCorrect: () => {
        if (muted) return;
        try {
          const ctx = getCtx();
          if (!ctx) return;
          const now = ctx.currentTime;
          [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);
            gain.gain.setValueAtTime(0.15, now + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.25);
          });
        } catch (e) {}
      },
      playIncorrect: () => {
        if (muted) return;
        try {
          const ctx = getCtx();
          if (!ctx) return;
          const now = ctx.currentTime;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(260, now);
          osc.frequency.exponentialRampToValueAtTime(180, now + 0.25);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.25);
        } catch (e) {}
      },
      playFanfare: () => {
        if (muted) return;
        try {
          const ctx = getCtx();
          if (!ctx) return;
          const now = ctx.currentTime;
          [
            { f: 523.25, t: 0, d: 0.15 },
            { f: 659.25, t: 0.15, d: 0.15 },
            { f: 783.99, t: 0.3, d: 0.2 },
            { f: 1046.5, t: 0.5, d: 0.5 }
          ].forEach(({ f, t, d }) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, now + t);
            gain.gain.setValueAtTime(0.18, now + t);
            gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + t);
            osc.stop(now + t + d);
          });
        } catch (e) {}
      }
    };
  }

  const soundEngine = createAudio();

  // === MAIN REACT APPLICATION COMPONENT ===
  function App() {
    const [currentScreen, setCurrentScreen] = useState('LANDING');
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [currentBonusIdx, setCurrentBonusIdx] = useState(0);
    const [nickname, setNickname] = useState('');
    const [consentRecord, setConsentRecord] = useState(null);
    const [userAnswers, setUserAnswers] = useState({});
    const [bonusAnswers, setBonusAnswers] = useState({});
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);

    const [dropoutData, setDropoutData] = useState(null);
    const [muted, setMuted] = useState(false);
    const [showExitModal, setShowExitModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);

    const toggleAudio = () => {
      soundEngine.setMuted(!muted);
      setMuted(!muted);
    };

    const totalKnowledgeQuestions = useMemo(() => {
      const count = QUIZ_QUESTIONS.filter(q => q.tipo === 'conhecimento').length;
      return count > 0 ? count : QUIZ_QUESTIONS.length;
    }, []);

    const score = useMemo(() => {
      return Object.values(userAnswers).filter(a => a.tipo !== 'reflexao' && a.isCorrect === true).length;
    }, [userAnswers]);

    const totalQuizDurationSeconds = useMemo(() => {
      const sum = Object.values(userAnswers).reduce(
        (acc, a) => acc + (Number(a.timeSpentSeconds) || 0),
        0
      );
      return Number(sum.toFixed(2));
    }, [userAnswers]);

    // Header dynamic title
    const headerTitle = useMemo(() => {
      switch (currentScreen) {
        case 'LANDING': return 'LEGACY QUIZ';
        case 'CONTENT_WARNING': return 'AVISO DE CONTEÚDO';
        case 'NICKNAME': return 'IDENTIFICAÇÃO DO JOGADOR';
        case 'QUIZ': return QUIZ_QUESTIONS[currentQuestionIdx]?.question || 'LEGACY QUIZ';
        case 'EXIT_FEEDBACK': return 'FEEDBACK DE DESISTÊNCIA';
        case 'BONUS_INTRO': return 'ESTÁ PRONTO(A) PARA AS PERGUNTAS BÔNUS';
        case 'BONUS_QUESTIONS': return BONUS_QUESTIONS[currentBonusIdx]?.question || 'PERGUNTA BÔNUS';

        case 'COMPLETION': return 'OBRIGADO POR PARTICIPAR!';
        default: return 'LEGACY QUIZ';
      }
    }, [currentScreen, currentQuestionIdx, currentBonusIdx]);

    const handleExport = () => {
      const data = {
        nickname,
        consent: consentRecord,
        dropout: dropoutData,
        score: { correct: score, total: QUIZ_QUESTIONS.length, pct: Math.round((score / QUIZ_QUESTIONS.length) * 100) },
        answers: userAnswers,

        exportedAt: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quiz_legado_${nickname || 'participante'}_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    };

    const restartGame = () => {
      setUserAnswers({});

      setConsentRecord(null);
      setDropoutData(null);
      setCurrentQuestionIdx(0);
      setCurrentBonusIdx(0);
      setStreak(0);
      setMaxStreak(0);
      setCurrentScreen('LANDING');
    };

    return h('div', { className: 'app-wrapper' },
      // Header Ribbon (hidden on LANDING since Frame 227 already has the header embedded)
      currentScreen !== 'LANDING' && h('header', { className: 'header-arch-container' },
        h('div', { className: 'header-arch' },
          h('h2', null, headerTitle)
        ),
        h('div', { className: 'header-controls' },
          h('button', {
            className: 'icon-btn',
            title: muted ? 'Ativar Áudio' : 'Silenciar Áudio',
            onClick: toggleAudio
          }, muted ? '🔇' : '🔊')
        )
      ),

      // Screen router
      h('main', { style: { flex: 1, display: 'flex', flexDirection: 'column' } },
        currentScreen === 'LANDING' && h(LandingScreen, {
          onStart: () => setCurrentScreen('CONTENT_WARNING'),
          sound: soundEngine,
          muted,
          toggleAudio
        }),
        currentScreen === 'CONTENT_WARNING' && h(ContentWarningScreen, {
          onContinue: () => setCurrentScreen('NICKNAME'),
          onExit: () => setShowExitModal(true),
          sound: soundEngine
        }),
        currentScreen === 'NICKNAME' && h(NicknameScreen, {
          onConfirm: (name, consentData) => {
            setNickname(name);
            setConsentRecord(consentData);
            setCurrentScreen('QUIZ');
          },
          onBack: () => setCurrentScreen('CONTENT_WARNING'),
          sound: soundEngine
        }),
        currentScreen === 'QUIZ' && h(QuizQuestionScreen, {
          question: QUIZ_QUESTIONS[currentQuestionIdx],
          currentIdx: currentQuestionIdx,
          total: QUIZ_QUESTIONS.length,
          savedAns: userAnswers[QUIZ_QUESTIONS[currentQuestionIdx].id],
          streak,
          nickname: nickname,
          onAnswer: (qId, opt, isCorrect, meta = {}) => {
            const qObj = QUIZ_QUESTIONS.find(q => q.id === qId);
            const tipo = qObj?.tipo || 'conhecimento';
            const isReflexao = tipo === 'reflexao';
            if (isReflexao || Boolean(isCorrect) === true) {
              const nextStreak = streak + 1;
              setStreak(nextStreak);
              setMaxStreak(m => Math.max(m, nextStreak));
            } else {
              setStreak(0);
            }
            setUserAnswers(prev => ({
              ...prev,
              [qId]: {
                questionId: meta.questionId || `q${qId}`,
                selectedOption: opt,
                timeSpentSeconds: meta.timeSpentSeconds || 0,
                startedAt: meta.startedAt || new Date().toISOString(),
                answeredAt: meta.answeredAt || new Date().toISOString(),
                selectedOpt: opt,
                tipo,
                isCorrect: isReflexao ? null : Boolean(isCorrect)
              }
            }));
          },
          onNext: () => {
            if (currentQuestionIdx < QUIZ_QUESTIONS.length - 1) {
              setCurrentQuestionIdx(i => i + 1);
            } else {
              soundEngine.playFanfare();
              setCurrentScreen('COMPLETION');
            }
          },
          onExit: () => setShowExitModal(true),
          sound: soundEngine
        }),
        currentScreen === 'EXIT_FEEDBACK' && h(ExitFeedbackScreen, {
          onConfirmExit: (reason) => {
            setDropoutData({
              reasonId: reason.id,
              reasonLabel: reason.label,
              screenAtExit: `QUIZ_Q${currentQuestionIdx + 1}`,
              timestamp: new Date().toISOString()
            });
          },
          onResumeGame: () => setCurrentScreen('QUIZ'),
          onReturnHome: restartGame,
          sound: soundEngine
        }),
        currentScreen === 'BONUS_INTRO' && h(BonusIntroScreen, {
          onNext: () => setCurrentScreen('BONUS_QUESTIONS'),
          onBack: () => {
            setCurrentQuestionIdx(QUIZ_QUESTIONS.length - 1);
            setCurrentScreen('QUIZ');
          },
          sound: soundEngine
        }),
        currentScreen === 'BONUS_QUESTIONS' && h(BonusQuestionScreen, {
          key: BONUS_QUESTIONS[currentBonusIdx].id,
          bonusData: BONUS_QUESTIONS[currentBonusIdx],
          currentIdx: currentBonusIdx,
          total: BONUS_QUESTIONS.length,
          savedAns: bonusAnswers[BONUS_QUESTIONS[currentBonusIdx].id],
          onAnswer: (bId, opt) => {
            setBonusAnswers(prev => ({ ...prev, [bId]: opt }));
          },
          onNext: () => {
            if (currentBonusIdx < BONUS_QUESTIONS.length - 1) {
              setCurrentBonusIdx(i => i + 1);
            } else {
              soundEngine.playFanfare();
              setCurrentScreen('COMPLETION');
            }
          },
          onPrev: () => {
            if (currentBonusIdx > 0) setCurrentBonusIdx(i => i - 1);
            else setCurrentScreen('BONUS_INTRO');
          },
          onExit: () => setShowExitModal(true),
          sound: soundEngine
        }),
        currentScreen === 'COMPLETION' && h(CompletionScreen, {
          score,
          total: totalKnowledgeQuestions,
          maxStreak,
          nickname,
          onPlayAgain: restartGame,
          onReview: () => setShowReviewModal(true),
          onExport: handleExport,
          sound: soundEngine
        })
      ),

      // Modals
      showExitModal && h(ExitModal, {
        onClose: () => setShowExitModal(false),
        onConfirmExit: () => {
          setShowExitModal(false);
          setCurrentScreen('EXIT_FEEDBACK');
        },
        sound: soundEngine
      }),
      showReviewModal && h(ReviewModal, {
        questions: QUIZ_QUESTIONS,
        userAnswers,
        onClose: () => setShowReviewModal(false),
        sound: soundEngine
      })
    );
  }

  // === SUB-COMPONENTS ===

  function LandingScreen({ onStart, sound, muted, toggleAudio, onShowTCLE }) {
    return h('div', { className: 'landing-exact-container' },
      h('div', { className: 'landing-stage' },
        h('picture', { className: 'landing-picture' },
          h('source', {
            media: '(max-width: 768px)',
            srcSet: 'assets/frame-227-mobile.jpg'
          }),
          h('img', {
            src: 'assets/frame-227.png',
            alt: 'Legacy Quiz - Seus dados têm um futuro. Você sabe qual?',
            className: 'landing-bg-image'
          })
        ),
        h('div', { className: 'landing-floating-controls' },
          h('button', {
            className: 'icon-btn-floating',
            title: 'Termo de Consentimento Livre e Esclarecido (TCLE)',
            onClick: () => { sound.playClick(); onShowTCLE(); },
            'aria-label': 'Ver Termo de Consentimento'
          }, '📋'),
          h('button', {
            className: 'icon-btn-floating',
            title: muted ? 'Ativar Áudio' : 'Silenciar Áudio',
            onClick: () => { toggleAudio(); },
            'aria-label': 'Alternar áudio'
          }, muted ? '🔇' : '🔊')
        ),
        h('button', {
          className: 'landing-btn-hotspot',
          onClick: () => { sound.playClick(); onStart(); },
          title: 'Clique para iniciar o quiz!',
          'aria-label': 'Vamos Jogar! Iniciar o quiz'
        },
          h('span', { className: 'hotspot-glow' })
        )
      )
    );
  }

  function ContentWarningScreen({ onContinue, onExit, sound }) {
    return h('div', { className: 'screen-content' },
      h('div', { className: 'card-surface warning-box' },
        h('h2', { className: 'warning-lead' },
          'A próxima tela contempla temas relacionados a morte, perda e legado'
        ),
        h('p', { className: 'warning-desc' },
          'Estes elementos podem ser emocionalmente sensíveis para alguns jogadores. Recomenda-se uma reflexão prévia antes de continuar.'
        ),
        h('h3', { className: 'warning-question' },
          'Deseja continuar jogando?'
        ),
        h('div', { className: 'warning-actions' },
          h('button', {
            className: 'btn-primary-blue',
            onClick: () => { sound.playClick(); onContinue(); }
          }, 'SIM, DESEJO CONTINUAR'),
          h('button', {
            className: 'btn-outline-dark',
            onClick: () => { sound.playClick(); onExit(); }
          }, 'NÃO, DESEJO SAIR')
        )
      )
    );
  }

  function NicknameScreen({ onConfirm, onBack, sound }) {
    const [scrolledEnd, setScrolledEnd] = useState(false);
    const [scrollPct, setScrollPct] = useState(0);
    const [consentChecked, setConsentChecked] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);
    const [sigDataUrl, setSigDataUrl] = useState(null);
    const [pointsCount, setPointsCount] = useState(0);

    const [nickname, setNickname] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [err, setErr] = useState('');

    const scrollRef = useRef(null);
    const canvasRef = useRef(null);
    const isDrawingRef = useRef(false);

    // Canvas setup
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = '#1e2952';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }, []);

    const getPos = (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      if (e.touches && e.touches.length > 0) {
        return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
      }
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const startDraw = (e) => {
      if (!consentChecked) return;
      if (e.cancelable) e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const { x, y } = getPos(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
      isDrawingRef.current = true;
    };

    const draw = (e) => {
      if (!isDrawingRef.current || !consentChecked) return;
      if (e.cancelable) e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const { x, y } = getPos(e);
      ctx.lineTo(x, y);
      ctx.stroke();

      setPointsCount(prev => {
        const next = prev + 1;
        if (next >= 15 && !hasSignature) {
          setHasSignature(true);
          setSigDataUrl(canvas.toDataURL('image/png'));
        }
        return next;
      });
    };

    const stopDraw = () => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;
      const canvas = canvasRef.current;
      if (canvas && pointsCount >= 15) {
        setSigDataUrl(canvas.toDataURL('image/png'));
      }
    };

    const clearSignature = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      setHasSignature(false);
      setSigDataUrl(null);
      setPointsCount(0);
    };

    const onScroll = () => {
      const el = scrollRef.current;
      if (!el) return;
      const diff = el.scrollHeight - el.clientHeight;
      if (diff <= 0) {
        setScrollPct(100);
        setScrolledEnd(true);
        return;
      }
      const pct = Math.min(100, Math.round((el.scrollTop / diff) * 100));
      setScrollPct(pct);
      if (pct >= 90 && !scrolledEnd) setScrolledEnd(true);
    };

    const isUnlocked = scrolledEnd && consentChecked && hasSignature;
    const isValid = isUnlocked && nickname.trim().length > 0;

    const onSubmit = (e) => {
      e.preventDefault();
      if (!isUnlocked) {
        setErr('Cumpra as etapas de leitura, concordância e assinatura antes de continuar.');
        return;
      }
      if (!nickname.trim()) {
        setErr('Digite seu apelido para iniciar o jogo.');
        return;
      }
      setErr('');
      sound.playClick();
      setShowModal(true);
    };

    const confirmFinal = () => {
      sound.playClick();
      const consentPayload = {
        acceptedAt: new Date().toISOString(),
        caae: '94717525.4.0000.5690',
        signatureDataUrl: sigDataUrl
      };
      onConfirm(nickname.trim(), consentPayload);
    };

    return h('div', { className: 'screen-content tcle-nickname-screen' },
      h('div', { style: { maxWidth: 920, width: '100%', margin: '0 auto 16px auto' } },
        h('button', {
          className: 'feedback-nav-btn',
          style: { padding: '8px 20px', fontSize: '0.95rem' },
          onClick: () => { sound.playClick(); onBack(); }
        }, '← Voltar')
      ),
      h('div', { className: 'tcle-card-container' },
        h('div', { className: 'tcle-header-banner' },
          h('div', { className: 'tcle-badge' }, 'UFMT • Instituto de Computação • Projeto DAVI'),
          h('h2', { className: 'tcle-title' }, 'Termo de Consentimento Livre e Esclarecido (TCLE)'),
          h('p', { className: 'tcle-subtitle' },
            'Pesquisa: ', h('strong', null, 'Legacy Quiz: Um Jogo Para Refletir Sobre Legado Digital'), ' | CAAE: ', h('strong', null, '94717525.4.0000.5690')
          )
        ),

        // Highlights
        h('div', { className: 'tcle-highlights-grid' },
          [
            { icon: '🎯', t: 'Objetivo do Estudo', d: 'Promover reflexões sobre bens digitais e herança digital através do jogo.' },
            { icon: '⏱️', t: 'Atividade e Duração', d: 'Quiz no computador da pesquisadora com duração média estimada de 15 minutos.' },
            { icon: '🛡️', t: 'Voluntariedade', d: 'Participação 100% voluntária e gratuita, podendo desistir a qualquer momento.' },
            { icon: '🔐', t: 'Sigilo Absoluto', d: 'Nenhum dado pessoal sensível é coletado e registros serão deletados pós-estudo.' }
          ].map((item, idx) => h('div', { key: idx, className: 'tcle-highlight-pill' },
            h('span', { className: 'tcle-highlight-icon' }, item.icon),
            h('div', null, h('strong', null, `${item.t}: `), item.d)
          ))
        ),

        // STEP 1: Reader
        h('div', { className: 'tcle-step-box' },
          h('div', { className: 'tcle-step-header' },
            h('span', { className: 'tcle-step-number' }, 'Etapa 1 de 3'),
            h('span', { className: 'tcle-step-title' }, 'Leitura do Termo Completo'),
            h('span', { className: `tcle-scroll-badge ${scrolledEnd ? 'done' : 'pending'}` },
              scrolledEnd ? '✓ Leitura Concluída' : `Role até o final (${scrollPct}%)`
            )
          ),
          h('div', { ref: scrollRef, className: 'tcle-scroll-viewport', onScroll },
            h('section', { className: 'tcle-section-block' },
              h('h4', { className: 'tcle-section-title' }, '1. Convite e Contextualização'),
              h('div', { className: 'tcle-section-content' }, 'Você está sendo convidado(a) para participar, como voluntário(a), do projeto de pesquisa intitulado "Legacy Quiz: Um Jogo Para Refletir Sobre Legado Digital", parte do projeto DAVI (Dados Além da Vida) do Instituto de Computação da Universidade Federal de Mato Grosso (UFMT).')
            ),
            h('section', { className: 'tcle-section-block' },
              h('h4', { className: 'tcle-section-title' }, '2. Objetivos da Pesquisa'),
              h('div', { className: 'tcle-section-content' }, 'Investigar o uso do Legacy Quiz como ferramenta multimídia para promover reflexões sobre bens digitais e sua destinação após a morte, ampliando o conhecimento sobre herança digital.')
            ),
            h('section', { className: 'tcle-section-block' },
              h('h4', { className: 'tcle-section-title' }, '3. Procedimentos e Voluntariedade'),
              h('div', { className: 'tcle-section-content' }, 'A participação ocorrerá através do Legacy Quiz no computador da pesquisadora. As perguntas têm resposta opcional. Sua participação não é obrigatória e você pode desistir a qualquer momento sem penalidades nem prejuízos.')
            ),
            h('section', { className: 'tcle-section-block' },
              h('h4', { className: 'tcle-section-title' }, '4. Riscos, Benefícios e Sigilo'),
              h('div', { className: 'tcle-section-content' }, 'Pode ocorrer leve desconforto emocional por lidar com finitude e memória. A pesquisadora oferecerá suporte integral constante. Não serão coletados dados sensíveis ou identificáveis. Os dados brutos serão deletados ao término da pesquisa.')
            ),
            h('section', { className: 'tcle-section-block' },
              h('h4', { className: 'tcle-section-title' }, '5. Contato do Comitê de Ética em Pesquisa (CEP/UFMT)'),
              h('div', { className: 'tcle-section-content' }, 'CEP/Humanidades/UFMT • Coordenadora: Paola Biasoli Alves • E-mail: cephumanidades.propesq@ufmt.br • WhatsApp: (65) 99243-8072 • Atendimento: 08h-12h e 14h-18h.')
            ),
            h('div', { className: 'tcle-end-marker' },
              h('span', null, 'Fim do documento oficial • Obrigado pela leitura atenta.')
            )
          )
        ),

        // STEP 2: Checkbox
        h('div', { className: `tcle-step-box ${!scrolledEnd ? 'is-locked' : ''}` },
          h('div', { className: 'tcle-step-header' },
            h('span', { className: 'tcle-step-number' }, 'Etapa 2 de 3'),
            h('span', { className: 'tcle-step-title' }, 'Declaração de Concordância')
          ),
          h('label', { className: `tcle-checkbox-label ${!scrolledEnd ? 'disabled' : ''}` },
            h('input', {
              type: 'checkbox',
              className: 'tcle-checkbox-input',
              checked: consentChecked,
              disabled: !scrolledEnd,
              onChange: e => { setConsentChecked(e.target.checked); if (err) setErr(''); }
            }),
            h('span', { className: 'tcle-checkbox-text' },
              'Declaro que li e compreendi as informações acima. Sei que minha participação é voluntária e posso desistir a qualquer momento sem penalidades. Concordo voluntariamente em participar da pesquisa, autorizando o uso dos dados anonimizados para fins acadêmicos.'
            )
          )
        ),

        // STEP 3: Signature
        h('div', { className: `tcle-step-box ${!consentChecked ? 'is-locked' : ''}` },
          h('div', { className: 'tcle-step-header' },
            h('span', { className: 'tcle-step-number' }, 'Etapa 3 de 3'),
            h('span', { className: 'tcle-step-title' }, 'Assinatura Manual Digital')
          ),
          h('div', { className: `signature-component-wrapper ${!consentChecked ? 'is-disabled' : ''}` },
            h('div', { className: 'signature-header-row' },
              h('label', { className: 'signature-label' }, '✍️ Assinatura Manual do Participante:'),
              h('button', {
                type: 'button',
                className: 'btn-clear-signature',
                onClick: clearSignature,
                disabled: !consentChecked || !hasSignature
              }, '🗑️ Limpar Assinatura')
            ),
            h('div', { className: 'signature-canvas-container' },
              h('canvas', {
                ref: canvasRef,
                className: 'signature-canvas-element',
                onMouseDown: startDraw,
                onMouseMove: draw,
                onMouseUp: stopDraw,
                onMouseLeave: stopDraw,
                onTouchStart: startDraw,
                onTouchMove: draw,
                onTouchEnd: stopDraw
              }),
              h('div', { className: 'signature-guideline' },
                h('span', null, 'Assine com o mouse ou toque do dedo acima desta linha')
              ),
              h('div', { className: `signature-status-badge ${hasSignature ? 'signed' : 'waiting'}` },
                hasSignature ? '✓ Assinatura Registrada' : 'Aguardando Assinatura'
              )
            )
          )
        ),

        // FINAL GATE: Identification
        h('div', { className: `tcle-identification-panel ${!isUnlocked ? 'locked' : 'unlocked'}` },
          h('div', { className: 'tcle-identification-header' },
            h('span', { className: 'id-icon' }, isUnlocked ? '🔓' : '🔒'),
            h('div', null,
              h('h3', { className: 'id-title' }, 'Identificação do Jogador'),
              h('p', { className: 'id-description' },
                isUnlocked
                  ? 'Consentimento aceito com sucesso! Agora escolha o seu apelido de jogador para iniciar o quiz.'
                  : 'Cumpra as 3 etapas do TCLE acima para desbloquear este campo e iniciar o jogo.'
              )
            )
          ),
          h('form', { onSubmit, className: 'tcle-nickname-form' },
            h('div', { className: 'input-group-wrapper' },
              h('input', {
                type: 'text',
                className: 'tcle-input-nickname',
                placeholder: isUnlocked ? 'Digite seu apelido (nickname)...' : 'Bloqueado até o aceite do TCLE...',
                value: nickname,
                maxLength: 24,
                disabled: !isUnlocked,
                onChange: e => { setNickname(e.target.value); if (err) setErr(''); }
              }),
              err && h('p', { className: 'tcle-error-text' }, `⚠️ ${err}`)
            ),
            h('button', {
              type: 'submit',
              className: 'feedback-nav-btn tcle-submit-btn',
              disabled: !isValid
            }, 'Confirmar & Iniciar Jogo →')
          )
        )
      ),

      // Confirmation modal Frame 225
      showModal && h('div', { className: 'modal-overlay' },
        h('div', { className: 'modal-content' },
          h('div', { className: 'modal-header-tab' }, 'Confirme seu Nickname'),
          h('div', { className: 'modal-body' },
            h('label', { className: 'modal-label' }, 'Nickname escolhido:'),
            h('div', { className: 'modal-input-display' }, nickname.trim()),
            h('div', {
              style: { marginTop: 12, fontSize: '0.88rem', color: '#166534', background: '#dcfce7', padding: '10px 14px', borderRadius: 12, fontWeight: 600 }
            }, '✓ TCLE assinado digitalmente e registrado nesta sessão.'),
            h('div', { className: 'modal-actions', style: { marginTop: 18 } },
              h('button', {
                type: 'button',
                className: 'btn-red',
                onClick: () => { sound.playClick(); setShowModal(false); }
              }, 'Cancelar'),
              h('button', {
                type: 'button',
                className: 'btn-green',
                onClick: confirmFinal
              }, 'Confirmar & Jogar')
            )
          )
        )
      )
    );
  }

  function VideoScreen({ videoNum, onNext, onBack, onExit, sound }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const isV1 = videoNum === 1;

    return h('div', { className: 'screen-content' },
      h('div', { className: 'video-card-container' },
        h('div', { className: 'video-player-wrapper' },
          h('img', {
            src: 'assets/video-screen.png',
            alt: 'Cena do Vídeo Reflexivo',
            className: 'video-poster-img',
            onError: (e) => { e.currentTarget.src = 'assets/frame-229.png'; }
          }),
          h('div', {
            className: 'video-play-overlay',
            onClick: () => { sound.playClick(); setIsPlaying(!isPlaying); }
          },
            h('div', { className: 'play-circle-icon' },
              isPlaying
                ? h('span', { style: { fontSize: '2rem', color: '#1c2a5e' } }, '⏸')
                : h('svg', { viewBox: '0 0 24 24', style: { width: 38, height: 38, fill: '#1c2a5e', marginLeft: 6 } },
                    h('path', { d: 'M8 5v14l11-7z' })
                  )
            )
          )
        ),
        h('div', { className: 'video-reflective-prompt' },
          h('h3', { style: { fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: 8 } },
            isV1 ? 'Vídeo 1: Introdução Reflexiva sobre Memória e Legado' : 'Vídeo 2: Fundamentação Conceitual do Legado Digital'
          ),
          h('p', { style: { color: '#475569', marginBottom: 10 } },
            isV1
              ? 'Uma pausa sensível sobre a finitude e as marcas de afeto que deixamos nas redes.'
              : 'Conheça as diretrizes de contas digitais, direitos sucessórios e contatos de herança.'
          ),
          h('div', { style: { background: '#f8fafc', padding: '12px 16px', borderRadius: 12, borderLeft: '4px solid #6366f1' } },
            h('p', { style: { fontWeight: 600, color: '#334155' } },
              isV1
                ? '💡 Ao assistir a esta reflexão, você deseja prosseguir na sessão do quiz?'
                : '💡 Aprofunde-se nas questões a seguir para avaliar seus conhecimentos.'
            )
          )
        ),
        h('div', { className: 'nav-buttons-row' },
          h('button', { className: 'btn-outline-dark', onClick: () => { sound.playClick(); onBack(); } }, 'Retornar'),
          isV1
            ? h('div', { style: { display: 'flex', gap: 12 } },
                h('button', {
                  className: 'btn-outline-dark',
                  style: { borderColor: '#ef4444', color: '#dc2626' },
                  onClick: () => { sound.playClick(); onExit(); }
                }, 'Não desejo prosseguir'),
                h('button', {
                  className: 'btn-primary-blue',
                  onClick: () => { sound.playClick(); onNext(); }
                }, 'Sim, Prosseguir →')
              )
            : h('button', {
                className: 'btn-primary-blue',
                onClick: () => { sound.playClick(); onNext(); }
              }, 'Iniciar o Quiz →')
        )
      )
    );
  }

  function QuizQuestionScreen({ question, currentIdx, total, savedAns, streak = 0, onAnswer, onNext, onPrev, sound, nickname, onExit }) {
    const [selectedOption, setSelectedOption] = useState(savedAns ? savedAns.selectedOpt : null);
    const [isConfirmed, setIsConfirmed] = useState(Boolean(savedAns && savedAns.selectedOpt));
    const startTimeRef = useRef(Date.now());

    const questionType = question.tipo || (question.correctAnswer ? 'conhecimento' : 'reflexao');
    const isReflection = questionType === 'reflexao';
    const isCorrect = !isReflection && selectedOption === question.correctAnswer;
    const isLastQuestion = currentIdx === total - 1;
    const categoryInfo = CATEGORIES[question.category] || CATEGORIES.BASIC_CONCEPTS;
    const feedbackText = question.feedback || question.complement || question.reflection || '';
    const progressPct = Math.max(5, Math.round(((currentIdx + 1) / total) * 100));

    useEffect(() => {
      setSelectedOption(savedAns ? savedAns.selectedOpt : null);
      setIsConfirmed(Boolean(savedAns && savedAns.selectedOpt));
      startTimeRef.current = Date.now();
    }, [question.id, currentIdx, savedAns]);

    const handleSelectOption = (optId) => {
      if (isConfirmed) return;
      sound.playClick();
      setSelectedOption(optId);
    };

    const handleConfirmAnswer = () => {
      if (isConfirmed || !selectedOption) return;
      const startTime = startTimeRef.current;
      const endTime = Date.now();
      const timeSpentSeconds = Number(((endTime - startTime) / 1000).toFixed(2));
      setIsConfirmed(true);

      if (isReflection) {
        sound.playCorrect();
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(30);
      } else {
        const right = selectedOption === question.correctAnswer;
        if (right) {
          sound.playCorrect();
          if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
        } else {
          sound.playIncorrect();
          if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([40, 40, 40]);
        }
      }

      onAnswer(question.id, selectedOption, isReflection ? true : selectedOption === question.correctAnswer, {
        questionId: `q${question.id}`,
        selectedOption,
        timeSpentSeconds,
        startedAt: new Date(startTime).toISOString(),
        answeredAt: new Date(endTime).toISOString()
      });
    };

    return h('div', { className: 'screen-content gamified-quiz-screen' },
      h('div', { className: 'gamified-quiz-card' },
        h('div', { className: 'gamified-top-header' },
          h('div', { className: 'gamified-meta-row' },
            h('div', { className: 'category-pill gamified-category-pill', style: { borderLeft: `4px solid ${categoryInfo.color}` } },
              h('span', null, categoryInfo.icon),
              h('span', null, categoryInfo.name)
            ),
            h('div', { className: 'gamified-meta-right' },
              streak >= 2 && h('div', {
                key: `streak-${streak}`,
                className: 'streak-badge-pill',
                title: `Sequência de Consciência: ${streak} seguidas!`
              },
                h('span', { className: 'streak-flame-icon' }, '🔥'),
                h('span', null, `${streak} seguidas!`)
              ),
              h('div', { className: 'gamified-counter-badge' },
                'Pergunta ', h('strong', null, currentIdx + 1), ' de ', h('strong', null, total)
              )
            )
          ),
          h('div', { className: 'gamified-progress-track' },
            h('div', { className: 'gamified-progress-fill', style: { width: `${progressPct}%` } })
          )
        ),
        h('div', {
          key: question.id,
          className: `gamified-question-stage slide-in-fade ${isConfirmed ? 'is-confirmed-stage' : ''}`
        },
          (question.imagem || question.image) && h('div', { className: 'gamified-illustration-box' },
            h('img', {
              src: question.imagem || question.image,
              alt: `Ilustração da pergunta ${question.id}`,
              className: 'gamified-illustration-img'
            })
          ),
          h('div', { className: 'options-row gamified-options-list' },
            question.options.map(opt => {
              const isSelected = selectedOption === opt.id;
              const isRightOption = !isReflection && opt.id === question.correctAnswer;
              let stateClass = '';
              let statusIcon = null;

              if (!isConfirmed) {
                if (isSelected) {
                  stateClass = 'selected';
                  statusIcon = '✓';
                }
              } else if (isReflection) {
                if (isSelected) {
                  stateClass = 'confirmed-reflection';
                  statusIcon = '💬';
                } else {
                  stateClass = 'confirmed-dimmed';
                }
              } else {
                if (isRightOption) {
                  stateClass = 'confirmed-correct';
                  statusIcon = '✓';
                } else if (isSelected && !isRightOption) {
                  stateClass = 'confirmed-wrong';
                  statusIcon = '✕';
                } else {
                  stateClass = 'confirmed-dimmed';
                }
              }

              return h('button', {
                key: opt.id,
                type: 'button',
                className: `option-card gamified-option-card ${stateClass}`,
                onClick: () => handleSelectOption(opt.id),
                disabled: isConfirmed,
                'aria-pressed': isSelected
              },
                h('div', { className: 'option-badge gamified-option-badge' }, opt.id),
                h('div', { className: 'option-text gamified-option-text' }, opt.text),
                h('div', { className: `option-status-icon ${statusIcon ? 'visible' : ''}` }, statusIcon)
              );
            })
          ),
          isConfirmed && feedbackText && h('div', {
            className: `gamified-feedback-balloon slide-up-fade ${isReflection ? 'tone-reflection' : isCorrect ? 'tone-correct' : 'tone-wrong'}`
          },
            h('div', { className: 'gamified-feedback-header' },
              h('span', { className: 'gamified-feedback-icon' }, isReflection ? '✨' : isCorrect ? '🎉' : '💡'),
              h('span', { className: 'gamified-feedback-title' },
                isReflection ? 'Reflexão Registrada' : isCorrect ? 'Boa! Resposta correta.' : 'Opa! Veja a explicação:'
              ),
              isReflection && streak >= 2 && h('span', { className: 'gamified-streak-bonus-note' },
                `🔥 Bônus de reflexão! Sequência mantida (${streak} seguidas)`
              )
            ),
            h('p', { className: 'gamified-feedback-text' }, feedbackText)
          )
        ),
        h('div', { className: 'gamified-action-bar' },
          h('button', {
            type: 'button',
            className: 'gamified-btn-exit',
            onClick: () => { sound.playClick(); (onExit || onPrev)(); },
            title: 'Sair do Jogo'
          }, '🚪 Sair'),
          !isConfirmed
            ? h('button', {
                type: 'button',
                className: 'btn-confirm-answer gamified-btn-primary',
                disabled: selectedOption === null,
                onClick: handleConfirmAnswer
              }, 'Confirmar Resposta')
            : h('button', {
                type: 'button',
                className: 'btn-next-question gamified-btn-primary',
                onClick: () => { sound.playClick(); onNext(); }
              }, isLastQuestion ? 'Ver Resultado →' : 'Próxima Pergunta →')
        )
      )
    );
  }

  function BonusIntroScreen({ onNext, onBack, sound }) {
    return h('div', { className: 'screen-content' },
      h('div', { className: 'card-surface bonus-intro-card' },
        h('div', { className: 'gift-box-glow' },
          h('img', {
            src: 'assets/illustration-gift.png',
            alt: 'Caixa de Presente Dourada',
            className: 'gift-box-img',
            onError: (e) => { e.currentTarget.src = 'assets/frame-236.png'; }
          })
        ),
        h('p', { style: { fontSize: '1.25rem', color: '#334155', fontWeight: 600, maxWidth: 600, lineHeight: 1.5 } },
          'Parabéns por completar as etapas conceituais! Agora preparamos duas perguntas especiais de reflexão pessoal sobre você e suas memórias.'
        ),
        h('div', { className: 'nav-buttons-row', style: { marginTop: 10 } },
          h('button', { className: 'btn-outline-dark', onClick: () => { sound.playClick(); onBack(); } }, 'Retornar'),
          h('button', { className: 'btn-primary-blue', onClick: () => { sound.playClick(); onNext(); } }, 'Próxima →')
        )
      )
    );
  }

  function BonusQuestionScreen({ bonusData, currentIdx, total, savedAns, onAnswer, onNext, onPrev, sound, onExit }) {
    const [selectedOption, setSelectedOption] = useState(savedAns || null);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const isLastBonus = currentIdx === total - 1;
    const feedbackText = bonusData.feedback || bonusData.reflection || 'Obrigado por compartilhar sua reflexão sobre seu legado digital.';
    const progressPct = Math.max(10, Math.round(((currentIdx + 1) / total) * 100));

    useEffect(() => {
      setSelectedOption(savedAns || null);
      setIsConfirmed(false);
    }, [bonusData.id, currentIdx, savedAns]);

    const handleSelectOption = (optId) => {
      if (isConfirmed) return;
      sound.playClick();
      setSelectedOption(optId);
    };

    const handleConfirmBonus = () => {
      if (isConfirmed || !selectedOption) return;
      setIsConfirmed(true);
      sound.playClick();
      sound.playCorrect();
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(30);
      onAnswer(bonusData.id, selectedOption);
    };

    return h('div', { className: 'screen-content gamified-quiz-screen' },
      h('div', { className: 'gamified-quiz-card' },
        h('div', { className: 'gamified-top-header' },
          h('div', { className: 'gamified-meta-row' },
            h('div', { className: 'category-pill gamified-category-pill', style: { background: '#f5f3ff', color: '#6d28d9', borderLeft: '4px solid #8b5cf6' } },
              h('span', null, '✨'),
              h('span', null, bonusData.title || 'Reflexão Pessoal')
            ),
            h('div', { className: 'gamified-counter-badge' },
              'Reflexão ', h('strong', null, currentIdx + 1), ' de ', h('strong', null, total)
            )
          ),
          h('div', { className: 'gamified-progress-track' },
            h('div', { className: 'gamified-progress-fill reflection-fill', style: { width: `${progressPct}%` } })
          )
        ),
        h('div', { key: bonusData.id, className: 'gamified-question-stage slide-in-fade' },
          h('div', { className: 'options-row gamified-options-list' },
            bonusData.options.map(opt => {
              const isSelected = selectedOption === opt.id;
              let stateClass = '';
              let statusIcon = null;

              if (!isConfirmed) {
                if (isSelected) {
                  stateClass = 'selected';
                  statusIcon = '✓';
                }
              } else {
                if (isSelected) {
                  stateClass = 'confirmed-reflection';
                  statusIcon = '💬';
                } else {
                  stateClass = 'confirmed-dimmed';
                }
              }

              return h('button', {
                key: opt.id,
                type: 'button',
                className: `option-card gamified-option-card ${stateClass}`,
                onClick: () => handleSelectOption(opt.id),
                disabled: isConfirmed,
                'aria-pressed': isSelected
              },
                h('div', { className: 'option-badge gamified-option-badge' }, opt.id),
                h('div', { className: 'option-text gamified-option-text' }, opt.text),
                h('div', { className: `option-status-icon ${statusIcon ? 'visible' : ''}` }, statusIcon)
              );
            })
          ),
          isConfirmed && feedbackText && h('div', { className: 'gamified-feedback-balloon slide-up-fade tone-reflection' },
            h('div', { className: 'gamified-feedback-header' },
              h('span', { className: 'gamified-feedback-icon' }, '💬'),
              h('span', { className: 'gamified-feedback-title' }, 'Reflexão Registrada')
            ),
            h('p', { className: 'gamified-feedback-text' }, feedbackText)
          )
        ),
        h('div', { className: 'gamified-action-bar' },
          h('button', {
            type: 'button',
            className: 'gamified-btn-exit',
            onClick: () => { sound.playClick(); (onExit || onPrev)(); },
            title: 'Sair do Jogo'
          }, '🚪 Sair'),
          !isConfirmed
            ? h('button', {
                type: 'button',
                className: 'btn-confirm-answer gamified-btn-primary',
                disabled: selectedOption === null,
                onClick: handleConfirmBonus
              }, 'Confirmar Resposta')
            : h('button', {
                type: 'button',
                className: 'btn-next-question gamified-btn-primary',
                onClick: () => { sound.playClick(); onNext(); }
              }, isLastBonus ? 'Ver Resultado 🏆' : 'Próxima Pergunta →')
        )
      )
    );
  }


  function CompletionScreen({ score = 0, total = 12, maxStreak = 0, nickname, onPlayAgain, onReview, onExport, sound }) {
    const canvasRef = useRef(null);
    const patente = score >= 9
      ? {
          tier: 'gold',
          medalEmoji: '🥇',
          badgeIcon: '👑',
          tierLabel: 'Medalha de Ouro',
          title: 'Guardião do Legado Digital',
          message: 'Excelente! Você domina as boas práticas e sabe como proteger sua história online!'
        }
      : score >= 5
      ? {
          tier: 'silver',
          medalEmoji: '🥈',
          badgeIcon: '🛡️',
          tierLabel: 'Medalha de Prata',
          title: 'Navegador Consciente',
          message: 'Você já manda bem nos cuidados digitais e agora conhece ferramentas importantes para o futuro!'
        }
      : {
          tier: 'bronze',
          medalEmoji: '🥉',
          badgeIcon: '🧭',
          tierLabel: 'Medalha de Bronze',
          title: 'Explorador do Legado Digital',
          message: 'Você deu o primeiro passo para entender como cuidar das suas memórias e contas online!'
        };

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let animId;
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const hWin = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = hWin * dpr;
      ctx.scale(dpr, dpr);

      const colors = ['#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#eab308'];
      const particles = Array.from({ length: 65 }, () => ({
        x: Math.random() * w,
        y: Math.random() * -hWin * 0.6 - 10,
        w: Math.random() * 8 + 5,
        h: Math.random() * 5 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vy: Math.random() * 2.4 + 1.4,
        vx: (Math.random() - 0.5) * 1.8,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.12,
        opacity: 1
      }));

      const startTime = performance.now();
      const durationMs = 4200;

      const render = (now) => {
        const elapsed = now - startTime;
        ctx.clearRect(0, 0, w, hWin);
        let active = 0;
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.angle += p.spin;
          if (elapsed > durationMs * 0.65) {
            p.opacity = Math.max(0, 1 - (elapsed - durationMs * 0.65) / (durationMs * 0.35));
          }
          if (p.y < hWin + 20 && p.opacity > 0.02) {
            active += 1;
            ctx.save();
            ctx.globalAlpha = p.opacity;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
          }
        });
        if (elapsed < durationMs && active > 0) {
          animId = requestAnimationFrame(render);
        } else {
          ctx.clearRect(0, 0, w, hWin);
        }
      };

      animId = requestAnimationFrame(render);
      return () => {
        if (animId) cancelAnimationFrame(animId);
      };
    }, []);

    return h('div', { className: 'screen-content celebration-screen-wrapper' },
      h('canvas', { ref: canvasRef, className: 'celebration-confetti-canvas', 'aria-hidden': 'true' }),
      h('div', { className: 'celebration-container' },
        h('div', { className: `celebration-hero-card tier-${patente.tier}` },
          h('div', { className: 'celebration-kicker' }, '🎉 JORNADA CONCLUÍDA • PROJETO DAVI'),
          h('h2', { className: 'celebration-greeting' },
            nickname ? `Parabéns pela jornada, ${nickname}!` : 'Parabéns pela jornada!'
          ),
          h('div', { className: 'celebration-medal-wrapper medal-pop-anim' },
            h('div', { className: `celebration-medal-circle tier-${patente.tier}` },
              h('span', { className: 'celebration-medal-icon' }, patente.badgeIcon),
              h('span', { className: 'celebration-medal-sub' }, patente.medalEmoji)
            ),
            h('span', { className: `celebration-tier-pill tier-${patente.tier}` },
              `${patente.tierLabel} • Patente Desbloqueada`
            )
          ),
          h('h3', { className: 'celebration-rank-title' }, patente.title),
          h('p', { className: 'celebration-rank-message' }, patente.message),
          h('div', { className: 'celebration-stats-row' },
            h('div', { className: 'celebration-mini-card' },
              h('div', { className: 'celebration-mini-label' }, 'Acertos de Conhecimento'),
              h('div', { className: 'celebration-mini-value' },
                h('span', { className: 'celebration-mini-icon' }, '🎯'),
                h('strong', null, `${score} de ${total}`)
              )
            ),
            h('div', { className: 'celebration-mini-card streak-highlight' },
              h('div', { className: 'celebration-mini-label' }, 'Maior Sequência de Consciência'),
              h('div', { className: 'celebration-mini-value' },
                h('span', { className: 'celebration-mini-icon' }, '🔥'),
                h('strong', null, `${maxStreak} ${maxStreak === 1 ? 'questão' : 'seguidas'}`)
              )
            )
          ),
          h('div', { className: 'celebration-reflection-note' },
            h('span', null, '✨'),
            h('span', null, 'Suas respostas nas perguntas de reflexão pessoal (Bloco D) foram registradas com sucesso!')
          )
        ),
        h('div', { className: 'celebration-kickstart-card' },
          h('div', { className: 'kickstart-header' },
            h('span', { className: 'kickstart-header-icon' }, '🚀'),
            h('div', null,
              h('h4', { className: 'kickstart-title' }, 'Seu Pontapé Inicial'),
              h('p', { className: 'kickstart-subtitle' }, '3 passos rápidos para organizar e proteger seu legado digital hoje mesmo:')
            )
          ),
          h('div', { className: 'kickstart-tips-list' },
            h('a', {
              href: 'https://myaccount.google.com/inactive',
              target: '_blank',
              rel: 'noopener noreferrer',
              className: 'kickstart-tip-item kickstart-tip-link',
              onClick: () => sound.playClick()
            },
              h('span', { className: 'kickstart-tip-badge' }, '1'),
              h('div', { className: 'kickstart-tip-content' },
                h('strong', null, 'Gerenciador de Contas Inativas do Google ↗'),
                h('span', null, 'Defina contatos de confiança para receberem fotos/arquivos ou programe a exclusão após inatividade.')
              )
            ),
            h('div', { className: 'kickstart-tip-item' },
              h('span', { className: 'kickstart-tip-badge' }, '2'),
              h('div', { className: 'kickstart-tip-content' },
                h('strong', null, 'Memorial no Instagram e Facebook (Meta)'),
                h('span', null, 'Em Central de Contas → Dados pessoais → Propriedade e controle, escolha entre transformar o perfil em memorial ou excluir.')
              )
            ),
            h('div', { className: 'kickstart-tip-item' },
              h('span', { className: 'kickstart-tip-badge' }, '3'),
              h('div', { className: 'kickstart-tip-content' },
                h('strong', null, 'Contato de Legado & Pessoa de Confiança'),
                h('span', null, 'Adicione um Contato de Legado no seu celular (iOS/Android) e converse com alguém próximo sobre suas vontades digitais.')
              )
            )
          )
        ),
        h('div', { className: 'celebration-actions-footer' },
          h('button', {
            type: 'button',
            className: 'celebration-btn-primary',
            onClick: () => { sound.playClick(); onReview(); }
          }, '📋 Revisar Gabarito & Continuar Pesquisa (Davi) →'),
          h('div', { className: 'celebration-secondary-btns' },
            h('button', {
              type: 'button',
              className: 'celebration-btn-secondary',
              onClick: () => { sound.playClick(); onPlayAgain(); }
            }, '🔄 Refazer o Quiz')
          )
        )
      )
    );
  }

  function TCLEModal({ onClose }) {
    return h('div', { className: 'modal-overlay', onClick: onClose },
      h('div', { className: 'modal-content', style: { maxWidth: 680 }, onClick: e => e.stopPropagation() },
        h('div', { className: 'modal-header-tab' }, 'Termo de Consentimento Livre e Esclarecido (TCLE)'),
        h('div', { className: 'modal-body', style: { maxHeight: '70vh', overflowY: 'auto' } },
          h('h3', { style: { fontSize: '1.2rem', color: '#1c2a5e', fontWeight: 800 } },
            'Estudo sobre Percepção e Sensibilização sobre Legado Digital'
          ),
          h('p', { style: { fontSize: '0.92rem', color: '#64748b' } },
            'Público-Alvo: Indivíduos adultos (18 a 50 anos) em ambientes socioculturais e acadêmicos.'
          ),
          h('div', { style: { background: '#f8fafc', padding: 14, borderRadius: 12, border: '1px solid #e2e8f0' } },
            h('strong', { style: { color: '#0f172a' } }, 'Objetivos da Investigação:'),
            h('ul', { style: { paddingLeft: 18, color: '#334155', fontSize: '0.92rem', marginTop: 6 } },
              h('li', null, 'Investigar o nível de conscientização dos cidadãos sobre ativos e memórias digitais.'),
              h('li', null, 'Analisar o impacto de estímulos audiovisuais e jogos interativos no aprendizado reflexivo.'),
              h('li', null, 'Colher percepções qualitativas de usabilidade e relevância pedagógica.')
            )
          ),
          h('div', { style: { background: '#fef3c7', padding: 14, borderRadius: 12, border: '1px solid #fde68a' } },
            h('strong', { style: { color: '#92400e' } }, 'Natureza Sensível & Privacidade:'),
            h('p', { style: { color: '#78350f', fontSize: '0.9rem', marginTop: 4 } },
              'A participação é 100% voluntária, sendo facultada a interrupção a qualquer instante sem penalidades. Os dados são anonimizados.'
            )
          ),
          h('div', { className: 'modal-actions', style: { marginTop: 14 } },
            h('button', { className: 'btn-primary-blue', style: { width: '100%', justifyContent: 'center' }, onClick: onClose }, 'Entendi e Concordo')
          )
        )
      )
    );
  }

  function ExitModal({ onClose, onConfirmExit, sound }) {
    return h('div', { className: 'modal-overlay', onClick: onClose, role: 'dialog' },
      h('div', { className: 'modal-content exit-confirm-modal', onClick: e => e.stopPropagation() },
        h('div', { className: 'modal-header-tab', style: { background: '#dc2626' } }, 'Interromper Partida'),
        h('div', { className: 'modal-body', style: { textAlign: 'center', padding: '24px 20px 20px' } },
          h('div', { style: { fontSize: '3rem', marginBottom: 8 } }, '🚪'),
          h('h3', { style: { fontSize: '1.4rem', fontWeight: 800, color: '#1e2952', margin: '0 0 10px' } },
            'Tem certeza de que deseja sair?'
          ),
          h('p', { style: { fontSize: '0.96rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 24px', maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' } },
            'Sua participação é voluntária e você pode encerrar a qualquer momento. Se confirmar, você poderá nos contar rapidamente o motivo antes de finalizar.'
          ),
          h('div', { className: 'modal-actions', style: { display: 'flex', gap: 14, justifyContent: 'center' } },
            h('button', {
              type: 'button',
              className: 'btn-outline-dark',
              style: { flex: 1, padding: '12px 18px', fontWeight: 700 },
              onClick: () => { sound && sound.playClick(); onClose(); }
            }, 'Cancelar'),
            h('button', {
              type: 'button',
              className: 'btn-red',
              style: { flex: 1, padding: '12px 18px', fontWeight: 700 },
              onClick: () => { sound && sound.playClick(); onConfirmExit(); }
            }, 'Confirmar Saída')
          )
        )
      )
    );
  }

  function ExitFeedbackScreen({ onConfirmExit, onResumeGame, onReturnHome, sound }) {
    const [selectedId, setSelectedId] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);

    const options = [
      { id: 'felt_bad', label: 'Me senti mal', emoji: '🥺', color: '#ef6c00', bg: '#fff3e0' },
      { id: 'disliked_topic', label: 'Não gostei do assunto', emoji: '😒', color: '#3b82f6', bg: '#eff6ff' },
      { id: 'heavy_topic', label: 'Achei um tema pesado', emoji: '😰', color: '#c62828', bg: '#ffebee' },
      { id: 'no_comment', label: 'Nada a declarar', emoji: '😐', color: '#f57f17', bg: '#fffde7' }
    ];

    const handleSelect = (id) => {
      sound && sound.playClick();
      setSelectedId(id);
    };

    const handleConfirm = () => {
      if (!selectedId) return;
      sound && sound.playClick();
      const chosen = options.find(o => o.id === selectedId);
      onConfirmExit && onConfirmExit(chosen);
      setIsCompleted(true);
    };

    if (isCompleted) {
      return h('div', { className: 'screen-content', style: { display: 'flex', alignItems: 'center', justifyContent: 'center' } },
        h('div', { className: 'card-surface exit-feedback-card', style: { textAlign: 'center', maxWidth: 640, padding: '36px 28px' } },
          h('div', { style: { fontSize: '3.5rem', marginBottom: 12 } }, '🤝'),
          h('h2', { style: { fontSize: '1.6rem', color: '#1e2952', fontWeight: 800, margin: '0 0 12px' } },
            'Participação Encerrada'
          ),
          h('p', { style: { fontSize: '1.05rem', color: '#475569', lineHeight: 1.6, margin: '0 0 24px' } },
            'Seu motivo foi registrado de forma anônima. Agradecemos sinceramente pela sua atenção e respeito pelo projeto de pesquisa Legacy Quiz / DAVI (UFMT).'
          ),
          h('div', {
            style: {
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: '14px 18px',
              fontSize: '0.88rem',
              color: '#64748b',
              marginBottom: 28,
              textAlign: 'left'
            }
          }, 'ℹ️ Conforme o Termo de Consentimento Livre e Esclarecido (TCLE), sua recusa ou desistência não acarreta nenhuma penalidade ou prejuízo financeiro.'),
          h('button', {
            type: 'button',
            className: 'feedback-nav-btn',
            style: { minWidth: 220, margin: '0 auto' },
            onClick: () => { sound && sound.playClick(); onReturnHome && onReturnHome(); }
          }, 'Voltar ao Início')
        )
      );
    }

    return h('div', { className: 'screen-content' },
      h('div', { className: 'card-surface exit-feedback-card' },
        h('h2', { className: 'exit-feedback-title' }, 'Por que você deseja sair?'),
        h('p', { className: 'exit-feedback-subtitle' },
          'Sua resposta é anônima e nos ajuda a compreender a sensibilidade dos temas abordados no quiz.'
        ),
        h('div', { className: 'emotion-cards-row', role: 'radiogroup' },
          options.map(opt => {
            const isSelected = selectedId === opt.id;
            const hasSelection = Boolean(selectedId);
            return h('div', { key: opt.id, className: 'emotion-card-wrapper' },
              h('button', {
                type: 'button',
                role: 'radio',
                'aria-checked': isSelected,
                className: `emotion-card-btn ${isSelected ? 'selected' : ''} ${hasSelection && !isSelected ? 'dimmed' : ''}`,
                style: {
                  borderColor: isSelected ? opt.color : undefined,
                  backgroundColor: isSelected ? opt.bg : undefined
                },
                onClick: () => handleSelect(opt.id),
                title: `${opt.emoji} ${opt.label}`
              }, h('span', { className: 'exit-emotion-emoji', role: 'img', 'aria-label': opt.label }, opt.emoji)),
              h('span', {
                className: `emotion-card-label ${isSelected ? 'selected' : ''}`,
                style: { color: isSelected ? opt.color : undefined }
              }, opt.label)
            );
          })
        ),
        h('div', { className: 'exit-feedback-actions' },
          onResumeGame && h('button', {
            type: 'button',
            className: 'feedback-nav-btn exit-cancel-btn',
            onClick: () => { sound && sound.playClick(); onResumeGame(); }
          }, 'Continuar Jogando'),
          h('button', {
            type: 'button',
            className: 'feedback-nav-btn exit-submit-btn',
            disabled: !selectedId,
            onClick: handleConfirm
          }, 'Confirmar e Sair →')
        )
      )
    );
  }

  function ReviewModal({ questions, userAnswers, onClose, sound }) {
    const [filter, setFilter] = useState('ALL');
    const filtered = questions.filter(q => {
      const isRight = userAnswers[q.id]?.isCorrect;
      if (filter === 'CORRECT') return isRight;
      if (filter === 'INCORRECT') return !isRight;
      return true;
    });

    return h('div', { className: 'modal-overlay', onClick: onClose },
      h('div', { className: 'review-modal-box', onClick: e => e.stopPropagation() },
        h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 } },
          h('div', null,
            h('h2', { style: { fontSize: '1.45rem', fontWeight: 800, color: '#1c2a5e' } }, 'Revisão das Perguntas e Gabarito'),
            h('p', { style: { color: '#64748b', fontSize: '0.9rem' } }, 'Consulte suas escolhas e os complementos pedagógicos')
          ),
          h('button', { className: 'icon-btn', onClick: () => { sound.playClick(); onClose(); } }, '✕')
        ),
        h('div', { style: { display: 'flex', gap: 10, marginBottom: 16 } },
          [
            { id: 'ALL', label: 'Todas as Questões' },
            { id: 'CORRECT', label: '✓ Apenas Acertos' },
            { id: 'INCORRECT', label: '✕ Apenas Erros' }
          ].map(tab => h('button', {
            key: tab.id,
            onClick: () => { sound.playClick(); setFilter(tab.id); },
            style: {
              padding: '6px 14px',
              borderRadius: 18,
              border: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: filter === tab.id ? '#1c2a5e' : '#e2e8f0',
              color: filter === tab.id ? '#fff' : '#475569'
            }
          }, tab.label))
        ),
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: 20 } },
          filtered.map(q => {
            const ans = userAnswers[q.id];
            const isRight = ans?.isCorrect;
            const chosenId = ans?.selectedOpt;

            return h('div', {
              key: q.id,
              style: {
                background: '#f8fafc',
                padding: '20px',
                borderRadius: 16,
                border: isRight ? '2px solid #bbf7d0' : '2px solid #fecaca'
              }
            },
              h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 14 } },
                h('span', { className: 'review-q-header', style: { fontSize: '1.1rem', fontWeight: 800, color: '#1e2952' } }, q.question),
                h('span', {
                  style: {
                    padding: '6px 14px',
                    borderRadius: 12,
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    background: isRight ? '#dcfce7' : '#fee2e2',
                    color: isRight ? '#166534' : '#991b1b',
                    whiteSpace: 'nowrap'
                  }
                }, isRight ? '✓ Acertou' : '✕ Errou')
              ),
              h('div', { className: 'feedback-options-stack' },
                q.options.map(opt => {
                  const correct = opt.id === q.correctAnswer;
                  const picked = opt.id === chosenId;
                  let stateClass = 'state-neutral';
                  if (correct) stateClass = 'state-correct';
                  else if (picked && !correct) stateClass = 'state-incorrect';

                  const hasAttachedComp = correct && Boolean(q.complement);

                  return h('div', { key: opt.id, className: 'feedback-option-group' },
                    h('div', {
                      className: `feedback-option-btn ${stateClass} ${hasAttachedComp ? 'has-attached-complement' : ''}`
                    },
                      h('div', { className: 'feedback-option-badge' }, opt.id),
                      h('div', { className: 'feedback-option-body' },
                        h('span', null, opt.text),
                        picked && !correct && h('span', {
                          style: { marginLeft: 'auto', fontWeight: 700, fontSize: '0.85rem', color: '#ff0b0b' }
                        }, '(Sua Escolha)'),
                        picked && correct && h('span', {
                          style: { marginLeft: 'auto', fontWeight: 700, fontSize: '0.85rem', color: '#4ade80' }
                        }, '(Sua Escolha Correta)')
                      )
                    ),
                    hasAttachedComp && h('div', { className: 'feedback-complement-card' },
                      h('div', { className: 'feedback-complement-header' },
                        LightbulbIcon(),
                        h('span', null, 'Complemento:')
                      ),
                      h('div', { className: 'feedback-complement-body' }, q.complement)
                    )
                  );
                })
              )
            );
          })
        ),
        h('div', { style: { textAlign: 'center', marginTop: 24 } },
          h('button', { type: 'button', className: 'feedback-nav-btn', onClick: onClose }, 'Fechar Revisão')
        )
      )
    );
  }

  // Mount Application
  window.addEventListener('DOMContentLoaded', () => {
    const rootEl = document.getElementById('root');
    if (rootEl && window.ReactDOM && window.ReactDOM.createRoot) {
      const root = window.ReactDOM.createRoot(rootEl);
      root.render(h(App));
    }
  });

})();
