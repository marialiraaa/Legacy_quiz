// === LEGACY QUIZ - STANDALONE REACT APPLICATION ===
// Compatible with both standard React 18 and standalone environments

(function () {
  const { useState, useMemo, useRef, useCallback, useEffect, createElement: h } = window.React;

  // === DATA: CATEGORIES & QUESTIONS ===
  const CATEGORIES = {
    BASIC_CONCEPTS: {
      id: "basic_concepts",
      name: "Conceitos Básicos de Mundo Digital",
      badge: "Mundo Digital",
      icon: "🌐",
      color: "#3b82f6"
    },
    IMPORTANCE: {
      id: "importance",
      name: "Legado Digital: Importância",
      badge: "Importância",
      icon: "⭐",
      color: "#8b5cf6"
    },
    DIGITAL_DATA: {
      id: "digital_data",
      name: "Dados Digitais",
      badge: "Dados & Memória",
      icon: "💾",
      color: "#06b6d4"
    },
    MANAGEMENT: {
      id: "management",
      name: "Gerenciamento de Legado Digital",
      badge: "Gerenciamento",
      icon: "🔐",
      color: "#10b981"
    },
    DIGITAL_ACCOUNTS: {
      id: "digital_accounts",
      name: "Contas Digitais",
      badge: "Contas & Redes",
      icon: "👤",
      color: "#f59e0b"
    },
    ASSET_DESTINATION: {
      id: "asset_destination",
      name: "Destinação de Bens",
      badge: "Destinação",
      icon: "📜",
      color: "#ec4899"
    }
  };

  const QUIZ_QUESTIONS = [
    {
      id: 1,
      category: "BASIC_CONCEPTS",
      question: "1. O que é uma conta online?",
      image: "assets/illustration-q1.png",
      options: [
        { id: "A", text: "Um perfil criado para acessar e utilizar serviços digitais, como e-mail, aplicativos ou redes sociais." },
        { id: "B", text: "Um dispositivo utilizado para acessar a internet." },
        { id: "C", text: "Um tipo de conexão de internet." }
      ],
      correctAnswer: "A",
      complement: "As contas digitais permitem acessar diferentes serviços online e costumam reunir informações pessoais, mensagens, fotos e outros dados importantes, que podem fazer parte do legado digital de uma pessoa."
    },
    {
      id: 2,
      category: "BASIC_CONCEPTS",
      question: "2. Qual destes exemplos é um conteúdo digital?",
      image: "img/pergunta2.png",
      options: [
        { id: "A", text: "Um celular." },
        { id: "B", text: "Uma conta de e-mail." },
        { id: "C", text: "Um computador." }
      ],
      correctAnswer: "B",
      complement: "Enquanto celulares e computadores são aparelhos físicos de acesso (hardware), contas de e-mail, fotos, documentos e mensagens representam o conteúdo e os dados que existem e circulam no ambiente digital."
    },
    {
      id: 3,
      category: "BASIC_CONCEPTS",
      question: "3. Qual destes exemplos pode fazer parte de uma identidade digital?",
      image: "img/pergunta3.png",
      options: [
        { id: "A", text: "As informações, publicações e interações realizadas em ambientes online." },
        { id: "B", text: "Apenas os dados cadastrados em redes sociais." },
        { id: "C", text: "Apenas os conteúdos compartilhados publicamente." }
      ],
      correctAnswer: "A",
      complement: "A identidade digital é composta pelo conjunto integrado de dados, postagens, históricos e interações que constroem a representação de uma pessoa no ambiente virtual."
    },
    {
      id: 4,
      category: "BASIC_CONCEPTS",
      question: "4. Uma prática que ajuda a proteger a privacidade digital é:",
      image: "img/pergunta4.png",
      options: [
        { id: "A", text: "Confiar que as plataformas digitais protegerão automaticamente todos os seus dados." },
        { id: "B", text: "Utilizar as mesmas informações de acesso em diferentes plataformas." },
        { id: "C", text: "Revisar as configurações de privacidade e controlar o compartilhamento de dados." }
      ],
      correctAnswer: "C",
      complement: "Revisar periodicamente quem pode visualizar seus dados, controlar permissões de aplicativos e habilitar recursos de segurança como autenticação em dois fatores são fundamentais para proteger sua privacidade."
    },
    {
      id: 5,
      category: "IMPORTANCE",
      question: "5. O que é formado pelo legado digital?",
      image: "img/pergunta5.png",
      options: [
        { id: "A", text: "Apenas arquivos armazenados em serviços de nuvem." },
        { id: "B", text: "Tudo que é acumulado e armazenado digitalmente por uma pessoa ao longo da vida." },
        { id: "C", text: "Apenas mensagens de texto." }
      ],
      correctAnswer: "B",
      complement: "O legado digital reúne o patrimônio existencial, documental e afetivo deixado nos ambientes digitais: fotos, vídeos, mensagens, contas bancárias online, perfis sociais e registros afetivos acumulados ao longo dos anos."
    },
    {
      id: 6,
      category: "IMPORTANCE",
      question: "6. Qual dos exemplos abaixo pode fazer parte do legado digital de uma pessoa?",
      image: "img/pergunta6.png",
      options: [
        { id: "A", text: "Fotos, vídeos, mensagens, contas online e outros dados acumulados por uma pessoa." },
        { id: "B", text: "Somente publicações feitas em redes sociais." },
        { id: "C", text: "Apenas criptomoedas." }
      ],
      correctAnswer: "A",
      complement: "O legado digital é multifacetado: engloba tanto elementos de grande valor emocional e afetivo (fotos de família, conversas) quanto bens com valor econômico, patrimonial e documental."
    },
    {
      id: 7,
      category: "IMPORTANCE",
      question: "7. Quem deve se preocupar com o legado digital?",
      image: "img/pergunta7.png",
      options: [
        { id: "A", text: "Somente pessoas que possuem muitos seguidores na internet." },
        { id: "B", text: "Apenas usuários que armazenam documentos importantes." },
        { id: "C", text: "Qualquer pessoa que utilize serviços, contas ou plataformas digitais." }
      ],
      correctAnswer: "C",
      complement: "Não é necessário ser figura pública. Qualquer usuário com smartphone ou contas ativas deixa rastros e bens que podem necessitar de gestão e gerar impacto emocional e prático para seus entes queridos."
    },
    {
      id: 8,
      category: "IMPORTANCE",
      question: "8. Por que é importante pensar no legado digital?",
      image: "img/pergunta8.png",
      options: [
        { id: "A", text: "Para definir como informações, contas e conteúdos digitais poderão ser gerenciados no futuro." },
        { id: "B", text: "Para evitar que empresas utilizem qualquer dado pessoal após a morte." },
        { id: "C", text: "Para impedir que registros digitais sejam modificados ao longo do tempo." }
      ],
      correctAnswer: "A",
      complement: "Pensar no legado digital confere autonomia e tranquilidade: garante que suas vontades sejam respeitadas sobre o que deve ser preservado ou excluído, poupando familiares de desgastes e incertezas."
    },
    {
      id: 9,
      category: "DIGITAL_DATA",
      question: "9. Por que uma conta de e-mail pode ser considerada parte do legado digital de uma pessoa?",
      image: "img/pergunta9.png",
      options: [
        { id: "A", text: "Porque serve apenas para receber propagandas." },
        { id: "B", text: "Porque pode reunir registros de atividades, mensagens e informações importantes ao longo da vida." },
        { id: "C", text: "Porque possuem informações de contato." }
      ],
      correctAnswer: "B",
      complement: "O e-mail frequentemente atua como a chave mestra de toda a existência digital: nele convergem contratos, notas fiscais, comunicações confidenciais e links para recuperação de senhas de outros serviços."
    },
    {
      id: 10,
      category: "DIGITAL_DATA",
      question: "10. Qual é uma possível consequência de compartilhar mensagens em ambientes digitais?",
      image: "img/pergunta10.png",
      options: [
        { id: "A", text: "Essas mensagens podem permanecer registradas e influenciar a forma como a pessoa é lembrada." },
        { id: "B", text: "Elas desaparecem automaticamente após sua morte." },
        { id: "C", text: "As mensagens deixam de existir quando o usuário encerra a conta." }
      ],
      correctAnswer: "A",
      complement: "A comunicação digital tem alta persistência no tempo. O conteúdo que compartilhamos constrói nossa memória póstuma e influencia como amigos e familiares se recordarão de nossas conversas."
    },
    {
      id: 11,
      category: "DIGITAL_DATA",
      question: "11. Por que fotos e vídeos digitais podem ter valor para familiares e amigos no futuro?",
      image: "img/pergunta11.png",
      options: [
        { id: "A", text: "Porque podem preservar memórias, experiências e aspectos da história de uma pessoa." },
        { id: "B", text: "Porque ficam armazenados no celular." },
        { id: "C", text: "Porque nunca podem ser apagados." }
      ],
      correctAnswer: "A",
      complement: "Imagens e registros audiovisuais têm imenso valor afetivo: são testemunhos visuais de momentos partilhados, essenciais para a elaboração do luto e para a transmissão da memória entre gerações."
    },
    {
      id: 12,
      category: "DIGITAL_DATA",
      question: "12. O que pode ocorrer com fotos armazenadas em serviços de nuvem após a morte do proprietário da conta?",
      image: "img/pergunta12.png",
      options: [
        { id: "A", text: "Elas podem continuar disponíveis ou ser acessadas conforme as configurações da conta e as políticas do serviço." },
        { id: "B", text: "Elas são obrigatoriamente excluídas imediatamente." },
        { id: "C", text: "Tornam-se públicas para todos." }
      ],
      correctAnswer: "A",
      complement: "Cada provedor de nuvem (Google Fotos, iCloud, OneDrive) possui termos de serviço próprios. Sem planejamento prévio, fotos podem continuar em servidores ou ser excluídas por inatividade prolongada."
    },
    {
      id: 13,
      category: "MANAGEMENT",
      question: "13. Qual é a forma de cuidar do seu legado digital?",
      image: "img/pergunta13.png",
      options: [
        { id: "A", text: "Apenas guarde senhas em um local seguro." },
        { id: "B", text: "Definir o que acontecerá com contas, arquivos e conteúdos digitais no futuro." },
        { id: "C", text: "Ignorar o assunto, pois ninguém terá acesso aos seus conteúdos no futuro." }
      ],
      correctAnswer: "B",
      complement: "Cuidar do legado envolve inventariar contas, escolher guardiões de confiança e deixar instruções claras sobre quais dados devem ser guardados, entregues a pessoas queridas ou excluídos."
    },
    {
      id: 14,
      category: "MANAGEMENT",
      question: "14. Qual ação pode ajudar a preservar suas vontades sobre seus conteúdos digitais?",
      image: "img/pergunta14.png",
      options: [
        { id: "A", text: "Não fazer nada e deixar que a família resolva tudo." },
        { id: "B", text: "Registrar orientações sobre o destino de contas e informações digitais." },
        { id: "C", text: "Apagar todas as contas antes de falecer." }
      ],
      correctAnswer: "B",
      complement: "Registrar orientações (em um testamento, diretiva digital ou ferramenta de legado da própria plataforma) fornece um mapa claro de conduta para os familiares, evitando conflitos e dúvidas."
    },
    {
      id: 15,
      category: "MANAGEMENT",
      question: "15. Por que alguém pode optar por deixar mensagens digitais para serem acessadas no futuro?",
      image: "img/pergunta15.png",
      options: [
        { id: "A", text: "Para transmitir lembranças, orientações ou mensagens significativas a outras pessoas." },
        { id: "B", text: "Para aumentar o espaço de armazenamento." },
        { id: "C", text: "Para criar novas contas automaticamente." }
      ],
      correctAnswer: "A",
      complement: "Mensagens programadas para marcos futuros ou bilhetes póstumos funcionam como atos de amor e carinho, acolhendo aqueles que continuam em sua jornada com palavras de afeto e lembrança."
    },
    {
      id: 16,
      category: "MANAGEMENT",
      question: "16. Qual é a possível finalidade de uma mensagem póstuma digital?",
      image: "img/pergunta16.png",
      options: [
        { id: "A", text: "Compartilhar, após a morte, uma mensagem que havia sido previamente preparada." },
        { id: "B", text: "Transferir automaticamente contas para outras pessoas." },
        { id: "C", text: "Impedir o acesso a qualquer informação digital após a morte." }
      ],
      correctAnswer: "A",
      complement: "Mensagens póstumas podem transmitir palavras de conforto, confissões, ensinamentos de vida ou instruções práticas importantes para que os entes queridos encontrem amparo."
    },
    {
      id: 17,
      category: "DIGITAL_ACCOUNTS",
      question: "17. O que acontece com um perfil no Facebook após a morte do usuário?",
      image: "img/pergunta17.png",
      options: [
        { id: "A", text: "Ele deve permanecer público permanentemente." },
        { id: "B", text: "O perfil pode ser transformado em memorial ou excluído." },
        { id: "C", text: "Não existe esse recurso." }
      ],
      correctAnswer: "B",
      complement: "O Facebook possui o recurso de perfil memorializado ('Em memória de'), onde homenagens podem ser prestadas e um contato herdeiro pré-definido pode fixar um tributo ou gerenciar solicitações."
    },
    {
      id: 18,
      category: "DIGITAL_ACCOUNTS",
      question: "18. Por que algumas plataformas permitem indicar uma pessoa de confiança para gerenciar uma conta após a morte?",
      image: "img/pergunta18.png",
      options: [
        { id: "A", text: "Para garantir que conteúdos e informações digitais possam ser administrados conforme a vontade do usuário." },
        { id: "B", text: "Para aumentar o número de acessos à conta." },
        { id: "C", text: "Para manter a conta ativa indefinidamente." }
      ],
      correctAnswer: "A",
      complement: "Plataformas como Google (Gerenciador de Contas Inativas) e Apple (Contato de Legado) criaram esses recursos para que a privacidade seja mantida, delegando acesso apenas a quem o titular autorizou formalmente."
    },
    {
      id: 19,
      category: "DIGITAL_ACCOUNTS",
      question: "19. Qual pode ser uma consequência de não planejar o acesso às contas digitais?",
      image: "img/pergunta19.png",
      options: [
        { id: "A", text: "Arquivos, mensagens e informações importantes podem se tornar inacessíveis para familiares ou pessoas autorizadas." },
        { id: "B", text: "Todas as contas serão automaticamente transferidas para os parentes mais próximos." },
        { id: "C", text: "Os serviços digitais compartilharão as senhas com a família." }
      ],
      correctAnswer: "A",
      complement: "Em virtude da criptografia e das políticas de termos de serviço, as empresas não compartilham senhas com parentes. Sem planejamento, fotos e documentos podem ser perdidos para sempre."
    },
    {
      id: 20,
      category: "DIGITAL_ACCOUNTS",
      question: "20. O que acontece com as contas online após o falecimento?",
      image: "img/pergunta20.png",
      options: [
        { id: "A", text: "São excluídas automaticamente em 30 dias." },
        { id: "B", text: "Permanecem ativas indefinidamente em todos os casos." },
        { id: "C", text: "Dependendo do serviço, podem ser gerenciadas por uma pessoa previamente designada." }
      ],
      correctAnswer: "C",
      complement: "Cada serviço adota regras próprias: alguns permitem indicar um herdeiro digital ou contato de legado, enquanto outros excluem a conta por inatividade ou exigem ordem judicial."
    },
    {
      id: 21,
      category: "DIGITAL_ACCOUNTS",
      question: "21. O que pode acontecer se ninguém souber como acessar as contas digitais de uma pessoa falecida?",
      image: "img/pergunta21.png",
      options: [
        { id: "A", text: "Informações importantes podem ficar inacessíveis." },
        { id: "B", text: "Todas as contas são transferidas automaticamente para a família." },
        { id: "C", text: "Nada acontece." }
      ],
      correctAnswer: "A",
      complement: "Sem orientações prévias ou contatos de legado configurados, familiares frequentemente não conseguem acessar fotos, contas financeiras e documentos relevantes guardados na nuvem."
    },
    {
      id: 22,
      category: "DIGITAL_ACCOUNTS",
      question: "22. Por que é importante considerar quem poderá acessar seus arquivos e contas digitais no futuro?",
      image: "img/pergunta22.png",
      options: [
        { id: "A", text: "Porque informações com valor afetivo, financeiro ou documental podem precisar ser recuperadas por pessoas autorizadas." },
        { id: "B", text: "Porque todas as plataformas exigem essa definição ao criar uma conta." },
        { id: "C", text: "Porque as contas digitais deixam de existir automaticamente após um período de inatividade." }
      ],
      correctAnswer: "A",
      complement: "Definir com antecedência quem pode acessar o patrimônio digital previne a perda irremediável de memórias afetivas valiosas e evita complicações burocráticas ou disputas judiciais."
    },
    {
      id: 23,
      category: "ASSET_DESTINATION",
      question: "23. Quem pode enfrentar dificuldades quando não há planejamento sobre o legado digital de uma pessoa?",
      image: "img/pergunta23.png",
      options: [
        { id: "A", text: "Apenas empresas responsáveis pelas plataformas digitais." },
        { id: "B", text: "Familiares, amigos ou pessoas responsáveis por administrar os bens digitais." },
        { id: "C", text: "Somente pessoas que possuíam acesso às senhas das contas." }
      ],
      correctAnswer: "B",
      complement: "Familiares e inventariantes costumam enfrentar processos judiciais desgastantes, pedidos negados por big techs e insegurança jurídica na tentativa de preservar a memória do falecido."
    },
    {
      id: 24,
      category: "ASSET_DESTINATION",
      question: "24. O que pode acontecer com os bens digitais de uma pessoa após seu falecimento?",
      image: "img/pergunta24.png",
      options: [
        { id: "A", text: "Todos os conteúdos digitais são automaticamente transferidos para os herdeiros." },
        { id: "B", text: "Eles podem exigir decisões de familiares ou representantes sobre sua preservação, acesso ou exclusão." },
        { id: "C", text: "Todas as contas e arquivos digitais são excluídos imediatamente após a confirmação do falecimento." }
      ],
      correctAnswer: "B",
      complement: "O destino dos bens digitais varia amplamente entre serviços. Decisões deliberadas tomadas em vida trazem clareza para que familiares saibam exatamente o que preservar e o que encerrar."
    }
  ];

  const BONUS_QUESTIONS = [
    {
      id: "bonus_1",
      title: "Pergunta Bônus 1 (Pergunta 25)",
      question: "Se as pessoas conhecessem você apenas pelos conteúdos que deixou na internet, o que elas provavelmente aprenderiam sobre sua vida?",
      image: "img/pergunta25.png",
      options: [
        { id: "A", text: "Aspectos importantes da minha história, valores e experiências." },
        { id: "B", text: "Apenas parte de quem eu sou, pois muitas coisas importantes não estão registradas digitalmente." },
        { id: "C", text: "Não sei dizer, nunca parei para refletir sobre isso." }
      ],
      reflection: "Esta reflexão destaca como a nossa pegada digital muitas vezes é apenas um recorte da nossa complexidade humana. O que escolhemos registrar ou omitir molda como as futuras gerações compreenderão a nossa história."
    },
    {
      id: "bonus_2",
      title: "Pergunta Bônus 2 (Pergunta 26)",
      question: "Se você não pudesse mais acessar suas contas digitais amanhã, suas pessoas de confiança saberiam como encontrar ou administrar os conteúdos que considera importantes?",
      image: "img/pergunta25.png",
      options: [
        { id: "A", text: "Sim, já deixei orientações ou formas de acesso." },
        { id: "B", text: "Talvez encontrassem algumas informações, mas não tudo." },
        { id: "C", text: "Não, nunca pensei sobre o que aconteceria com meus conteúdos digitais." }
      ],
      reflection: "A vulnerabilidade digital é real: conversar abertamente com pessoas queridas sobre senhas mestras, contatos de legado e desejos póstumos é um ato de cuidado e responsabilidade com quem amamos."
    }
  ];

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

    const [dropoutData, setDropoutData] = useState(null);
    const [muted, setMuted] = useState(false);
    const [showExitModal, setShowExitModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);

    const toggleAudio = () => {
      soundEngine.setMuted(!muted);
      setMuted(!muted);
    };

    const score = useMemo(() => {
      return Object.values(userAnswers).filter(a => a.isCorrect).length;
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
      setCurrentScreen('LANDING');
    };

    return h('div', { className: 'app-wrapper' },
      // Header Ribbon (hidden on LANDING since Frame 227 already has the header embedded)
      currentScreen !== 'LANDING' && h('header', { className: 'header-arch-container' },
        h('div', { className: 'header-arch' },
          h('h2', null, headerTitle)
        ),
        h('div', { className: 'header-controls' },
          nickname && h('div', {
            className: 'header-nickname-badge',
            title: `Jogador: ${nickname}`
          },
            h('span', null, '👤'),
            h('span', { style: { color: '#64748b', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em' } }, 'Jogador:'),
            h('span', { style: { color: '#10a429', fontWeight: 800 } }, nickname)
          ),
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
          nickname: nickname,
          onAnswer: (qId, opt, isCorrect) => {
            setUserAnswers(prev => ({ ...prev, [qId]: { selectedOpt: opt, isCorrect } }));
          },
          onNext: () => {
            if (currentQuestionIdx < QUIZ_QUESTIONS.length - 1) {
              setCurrentQuestionIdx(i => i + 1);
            } else {
              setCurrentScreen('BONUS_INTRO');
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
          total: QUIZ_QUESTIONS.length,
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
        h('img', {
          src: 'assets/frame-227.png',
          alt: 'Legacy Quiz - Seus dados têm um futuro. Você sabe qual?',
          className: 'landing-bg-image'
        }),
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

  function QuizQuestionScreen({ question, currentIdx, total, savedAns, onAnswer, onNext, onPrev, sound, nickname, onExit }) {
    const [selectedOpt, setSelectedOpt] = useState(savedAns ? savedAns.selectedOpt : null);
    const isAnswered = selectedOpt !== null;
    const isCorrect = selectedOpt === question.correctAnswer;
    const categoryInfo = CATEGORIES[question.category] || CATEGORIES.BASIC_CONCEPTS;

    useEffect(() => {
      setSelectedOpt(savedAns ? savedAns.selectedOpt : null);
    }, [question.id, savedAns]);

    const handleSelect = (optId) => {
      if (isAnswered) return;
      setSelectedOpt(optId);
      const right = optId === question.correctAnswer;
      if (right) sound.playCorrect();
      else sound.playIncorrect();
      onAnswer(question.id, optId, right);
    };

    function LightbulbIcon() {
      return h('svg', {
        width: 24,
        height: 24,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: '#ffffff',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        style: { flexShrink: 0 }
      },
        h('line', { x1: 12, y1: 1, x2: 12, y2: 3 }),
        h('line', { x1: 4.22, y1: 4.22, x2: 5.64, y2: 5.64 }),
        h('line', { x1: 1, y1: 12, x2: 3, y2: 12 }),
        h('line', { x1: 21, y1: 12, x2: 23, y2: 12 }),
        h('line', { x1: 18.36, y1: 5.64, x2: 19.78, y2: 4.22 }),
        h('path', { d: 'M9 18h6' }),
        h('path', { d: 'M10 22h4' }),
        h('path', { d: 'M15.09 14c.18-.98.65-1.74 1.41-2.5A6 6 0 1 0 7.5 11.5c.76.76 1.23 1.52 1.41 2.5h6.18z' })
      );
    }

    function renderFeedbackView({
      headlineText,
      isCorrect,
      options,
      correctAnswer,
      selectedAnswer,
      complementText,
      complementTitle,
      currentIndex,
      totalQuestions,
      onPrev,
      onNext,
      canPrev,
      canNext,
      prevLabel,
      nextLabel
    }) {
      const defaultHeadline = isCorrect ? 'Boa! Resposta correta.' : 'Opa! Resposta incorreta.';
      const displayHeadline = headlineText || defaultHeadline;

      return h('div', { className: 'screen-content feedback-screen-wrapper' },
        h('div', { className: 'quiz-feedback-container' },
          h('div', { className: `feedback-headline ${isCorrect ? 'correct' : 'incorrect'}` }, displayHeadline),
          h('div', { className: 'feedback-options-stack' },
            options.map(opt => {
              const isRight = opt.id === correctAnswer;
              const isUser = opt.id === selectedAnswer;
              let stateClass = 'state-neutral';
              if (isRight) stateClass = 'state-correct';
              else if (isUser) stateClass = 'state-incorrect';

              const hasAttachedComp = isRight && Boolean(complementText);

              return h('div', { key: opt.id, className: 'feedback-option-group' },
                h('div', {
                  className: `feedback-option-btn ${stateClass} ${hasAttachedComp ? 'has-attached-complement' : ''}`
                },
                  h('div', { className: 'feedback-option-badge' }, opt.id),
                  h('div', { className: 'feedback-option-body' }, opt.text)
                ),
                hasAttachedComp && h('div', { className: 'feedback-complement-card' },
                  h('div', { className: 'feedback-complement-header' },
                    LightbulbIcon(),
                    h('span', null, complementTitle || 'Complemento:')
                  ),
                  h('div', { className: 'feedback-complement-body' }, complementText)
                )
              );
            })
          ),
          h('div', { className: 'feedback-footer-container' },
            h('div', { className: 'feedback-progress-wrapper' },
              h('div', { className: 'feedback-progress-track' },
                h('div', {
                  className: 'feedback-progress-fill',
                  style: { width: `${Math.max(4, Math.round(((currentIndex + 1) / totalQuestions) * 100))}%` }
                })
              ),
              h('div', { className: 'feedback-progress-counter' }, `${currentIndex + 1}/${totalQuestions}`)
            ),
            h('div', { className: 'feedback-nav-buttons' },
              h('button', {
                type: 'button',
                className: 'feedback-nav-btn',
                onClick: onPrev,
                disabled: !canPrev,
                style: { opacity: canPrev ? 1 : 0.45, cursor: canPrev ? 'pointer' : 'not-allowed' }
              }, prevLabel || 'Retornar'),
              h('button', {
                type: 'button',
                className: 'feedback-nav-btn',
                onClick: onNext,
                disabled: !canNext,
                style: { opacity: canNext ? 1 : 0.45, cursor: canNext ? 'pointer' : 'not-allowed' }
              }, nextLabel || 'Próxima →')
            )
          )
        )
      );
    }

    if (isAnswered) {
      return renderFeedbackView({
        isCorrect,
        options: question.options,
        correctAnswer: question.correctAnswer,
        selectedAnswer: selectedOpt,
        complementText: question.complement,
        currentIndex: currentIdx,
        totalQuestions: total,
        onPrev: () => { sound.playClick(); (onExit || onPrev)(); },
        onNext: () => { sound.playClick(); onNext(); },
        canPrev: true,
        canNext: true,
        prevLabel: 'Sair do Jogo',
        nextLabel: 'Próxima →'
      });
    }

    return h('div', { className: 'screen-content' },
      h('div', {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: 860,
          margin: '0 auto 10px',
          width: '100%',
          padding: '0 6px',
          flexWrap: 'wrap',
          gap: 8
        }
      },
        h('div', { className: 'category-pill', style: { borderLeft: `4px solid ${categoryInfo.color}` } },
          h('span', null, categoryInfo.icon),
          h('span', null, categoryInfo.name)
        ),
        nickname && h('div', { className: 'quiz-player-tag' },
          h('span', { style: { fontSize: '0.9rem' } }, '🎮'),
          h('span', { style: { color: '#475569', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em' } }, 'Jogador:'),
          h('span', { style: { color: '#10a429', fontWeight: 800 } }, nickname)
        )
      ),
      h('div', { className: 'quiz-unanswered-container' },
        question.image ? h('div', { className: 'question-illustration-box' },
          h('img', {
            src: question.image,
            alt: 'Ilustração da pergunta',
            className: 'question-illustration-img',
            onError: (e) => { e.currentTarget.src = 'assets/frame-219.png'; }
          })
        ) : h('div', { className: 'question-placeholder-box' },
          h('span', { style: { fontSize: '3.5rem' } }, question.icon || categoryInfo.icon),
          h('p', { style: { marginTop: 8, color: '#64748b', fontWeight: 600 } },
            'Reflita sobre os aspectos conceituais desta questão'
          )
        ),
        h('div', { className: 'options-row' },
          question.options.map(opt => h('button', {
            key: opt.id,
            type: 'button',
            className: 'option-card',
            onClick: () => { sound.playClick(); handleSelect(opt.id); },
            style: { width: '100%' }
          },
            h('div', { className: 'option-badge' }, opt.id),
            h('div', { className: 'option-text' }, opt.text)
          ))
        )
      ),
      h('div', { className: 'quiz-footer' },
        h('div', { className: 'feedback-progress-wrapper', style: { maxWidth: 860, margin: '0 auto', width: '100%' } },
          h('div', { className: 'feedback-progress-track' },
            h('div', { className: 'feedback-progress-fill', style: { width: `${Math.max(4, Math.round(((currentIdx + 1) / total) * 100))}%` } })
          ),
          h('div', { className: 'feedback-progress-counter' }, `${currentIdx + 1}/${total}`)
        ),
        h('div', { className: 'nav-buttons-row' },
          h('button', {
            type: 'button',
            className: 'feedback-nav-btn btn-exit-game',
            onClick: () => { sound.playClick(); (onExit || onPrev)(); },
            title: 'Sair do Jogo'
          },
            h('span', null, '🚪'),
            h('span', null, 'Sair do Jogo')
          )
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
    const [selected, setSelected] = useState(savedAns || null);

    useEffect(() => {
      setSelected(savedAns || null);
    }, [bonusData.id, savedAns]);

    const handleSelect = (optId) => {
      if (selected) return;
      setSelected(optId);
      sound.playClick();
      sound.playCorrect();
      onAnswer(bonusData.id, optId);
      setTimeout(() => {
        onNext();
      }, 280);
    };

    return h('div', { className: 'screen-content' },
      h('div', { style: { display: 'flex', justifyContent: 'center', marginBottom: 12 } },
        h('div', { className: 'category-pill', style: { background: '#fef3c7', color: '#92400e', borderLeft: '4px solid #f59e0b' } },
          h('span', null, '✨'),
          h('span', null, bonusData.title)
        )
      ),
      h('div', { className: 'quiz-unanswered-container' },
        bonusData.image && h('div', { className: 'question-illustration-box', style: { borderColor: '#818cf8', maxWidth: 720 } },
          h('img', {
            src: bonusData.image,
            alt: 'Ilustração Bônus',
            className: 'question-illustration-img',
            onError: (e) => { e.currentTarget.src = currentIdx === 0 ? 'assets/frame-235.png' : 'assets/frame-233.png'; }
          })
        ),
        h('div', { className: 'options-row', style: { marginTop: 16 } },
          bonusData.options.map(opt => {
            const isSelected = selected === opt.id;
            return h('button', {
              key: opt.id,
              type: 'button',
              className: `option-card ${isSelected ? 'selected' : ''}`,
              onClick: () => handleSelect(opt.id),
              disabled: selected !== null,
              style: { width: '100%' }
            },
              h('div', { className: 'option-badge' }, opt.id),
              h('div', { className: 'option-text' }, opt.text)
            );
          })
        )
      ),
      h('div', { className: 'quiz-footer' },
        h('div', { className: 'feedback-progress-wrapper', style: { maxWidth: 860, margin: '0 auto', width: '100%' } },
          h('div', { className: 'feedback-progress-track' },
            h('div', { className: 'feedback-progress-fill', style: { width: `${Math.max(4, Math.round(((currentIdx + 1) / total) * 100))}%` } })
          ),
          h('div', { className: 'feedback-progress-counter' }, `Bônus ${currentIdx + 1}/${total}`)
        ),
        h('div', { className: 'nav-buttons-row' },
          h('button', {
            type: 'button',
            className: 'feedback-nav-btn btn-exit-game',
            onClick: () => { sound.playClick(); (onExit || onPrev)(); },
            title: 'Sair do Jogo'
          },
            h('span', null, '🚪'),
            h('span', null, 'Sair do Jogo')
          )
        )
      )
    );
  }


  function CompletionScreen({ score, total, nickname, onPlayAgain, onReview, onExport, sound }) {
    const pct = Math.round((score / total) * 100);

    return h('div', { className: 'screen-content' },
      h('div', { className: 'card-surface thankyou-card' },
        h('h2', { className: 'thankyou-title' }, 'OBRIGADO POR PARTICIPAR!'),
        h('p', { className: 'thankyou-subtitle' },
          nickname ? `Parabéns, ${nickname}! ` : '',
          'Agradecemos o seu tempo e esforço ao completar o nosso quiz.'
        ),
        h('div', { className: 'laurel-container' },
          h('img', {
            src: 'assets/laurel-badge.png',
            alt: 'Brasão de Conclusão',
            className: 'laurel-img',
            onError: (e) => { e.currentTarget.src = 'assets/frame-245.png'; }
          })
        ),
        h('div', { className: 'score-stats-grid' },
          h('div', { className: 'score-stat-box' },
            h('div', { className: 'score-number' }, `${score} / ${total}`),
            h('div', { className: 'score-label' }, 'Acertos no Quiz')
          ),
          h('div', { className: 'score-stat-box' },
            h('div', { className: 'score-number', style: { color: pct >= 70 ? '#16a34a' : '#2563eb' } }, `${pct}%`),
            h('div', { className: 'score-label' }, 'Aproveitamento')
          ),
          h('div', { className: 'score-stat-box' },
            h('div', { className: 'score-number', style: { color: '#8b5cf6' } }, '🏅'),
            h('div', { className: 'score-label' },
              pct >= 80 ? 'Mestre em Legado' : pct >= 50 ? 'Consciente Digital' : 'Explorador Inicial'
            )
          )
        ),
        h('div', { style: { display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', marginTop: 10 } },
          h('button', { className: 'btn-outline-dark', style: { minWidth: 220 }, onClick: () => { sound.playClick(); onPlayAgain(); } }, 'JOGAR NOVAMENTE'),
          h('button', { className: 'btn-outline-dark', style: { minWidth: 220 }, onClick: () => { sound.playClick(); onReview(); } }, 'VER RESPOSTAS')
        ),
        h('div', { style: { display: 'flex', gap: 12, marginTop: 4 } },
          h('button', {
            className: 'btn-primary-blue',
            style: { fontSize: '0.88rem', padding: '10px 20px', background: '#334155' },
            onClick: () => { sound.playClick(); onExport(); }
          }, '💾 Exportar Dados da Pesquisa (.JSON)')
        ),
        h('p', { className: 'thankyou-footer-text' },
          'Esperamos que tenha se divertido e refletido sobre a importância de seus ativos digitais.'
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

    function FeltBadIcon() {
      return h('svg', { width: 68, height: 68, viewBox: '0 0 72 72', fill: 'none' },
        h('circle', { cx: 36, cy: 36, r: 32, fill: '#FBB03B' }),
        h('ellipse', { cx: 26, cy: 33, rx: 6.5, ry: 8, fill: '#1E293B' }),
        h('circle', { cx: 28, cy: 30, r: 2.8, fill: '#FFFFFF' }),
        h('circle', { cx: 24.5, cy: 36, r: 1.4, fill: '#FFFFFF' }),
        h('ellipse', { cx: 46, cy: 33, rx: 6.5, ry: 8, fill: '#1E293B' }),
        h('circle', { cx: 48, cy: 30, r: 2.8, fill: '#FFFFFF' }),
        h('circle', { cx: 44.5, cy: 36, r: 1.4, fill: '#FFFFFF' }),
        h('path', { d: 'M21 21C24 23 29 25 31 25', stroke: '#1E293B', strokeWidth: 2.5, strokeLinecap: 'round' }),
        h('path', { d: 'M51 21C48 23 43 25 41 25', stroke: '#1E293B', strokeWidth: 2.5, strokeLinecap: 'round' }),
        h('path', { d: 'M30 50C33 46 39 46 42 50', stroke: '#1E293B', strokeWidth: 3, strokeLinecap: 'round' })
      );
    }

    function DislikedTopicIcon() {
      return h('svg', { width: 68, height: 68, viewBox: '0 0 72 72', fill: 'none' },
        h('circle', { cx: 36, cy: 36, r: 32, fill: '#2980B9' }),
        h('ellipse', { cx: 25, cy: 34, rx: 6.5, ry: 6.5, fill: '#1E293B' }),
        h('circle', { cx: 22, cy: 34, r: 2.2, fill: '#FFFFFF' }),
        h('path', { d: 'M18 29H32', stroke: '#2980B9', strokeWidth: 4, strokeLinecap: 'round' }),
        h('path', { d: 'M18 27C21 27 28 27 31 29', stroke: '#0F172A', strokeWidth: 2.5, strokeLinecap: 'round' }),
        h('ellipse', { cx: 47, cy: 34, rx: 6.5, ry: 6.5, fill: '#1E293B' }),
        h('circle', { cx: 44, cy: 34, r: 2.2, fill: '#FFFFFF' }),
        h('path', { d: 'M40 29H54', stroke: '#2980B9', strokeWidth: 4, strokeLinecap: 'round' }),
        h('path', { d: 'M54 27C51 27 44 27 41 29', stroke: '#0F172A', strokeWidth: 2.5, strokeLinecap: 'round' }),
        h('path', { d: 'M28 50L44 46', stroke: '#0F172A', strokeWidth: 3, strokeLinecap: 'round' })
      );
    }

    function HeavyTopicIcon() {
      return h('svg', { width: 68, height: 68, viewBox: '0 0 72 72', fill: 'none' },
        h('circle', { cx: 36, cy: 36, r: 32, fill: '#8E44AD' }),
        h('ellipse', { cx: 26, cy: 36, rx: 5, ry: 5.5, fill: '#1E293B' }),
        h('circle', { cx: 27.5, cy: 34.5, r: 1.8, fill: '#FFFFFF' }),
        h('ellipse', { cx: 46, cy: 36, rx: 5, ry: 5.5, fill: '#1E293B' }),
        h('circle', { cx: 47.5, cy: 34.5, r: 1.8, fill: '#FFFFFF' }),
        h('path', { d: 'M21 26C24 24 29 27 31 29', stroke: '#0F172A', strokeWidth: 2.5, strokeLinecap: 'round' }),
        h('path', { d: 'M51 26C48 24 43 27 41 29', stroke: '#0F172A', strokeWidth: 2.5, strokeLinecap: 'round' }),
        h('path', { d: 'M27 49C30 46 33 50 36 47C39 44 42 49 45 47', stroke: '#0F172A', strokeWidth: 2.8, strokeLinecap: 'round' }),
        h('path', { d: 'M54 20C55 23 57 24 57 26C57 27.6 55.6 29 54 29C52.4 29 51 27.6 51 26C51 24 53 23 54 20Z', fill: '#7DD3FC' })
      );
    }

    function NeutralFaceIcon() {
      return h('svg', { width: 68, height: 68, viewBox: '0 0 72 72', fill: 'none' },
        h('circle', { cx: 36, cy: 36, r: 32, fill: '#95A5A6' }),
        h('circle', { cx: 26, cy: 34, r: 4.5, fill: '#1E293B' }),
        h('circle', { cx: 46, cy: 34, r: 4.5, fill: '#1E293B' }),
        h('line', { x1: 26, y1: 48, x2: 46, y2: 48, stroke: '#1E293B', strokeWidth: 3.2, strokeLinecap: 'round' })
      );
    }

    const options = [
      { id: 'felt_bad', label: 'Me senti mal', emoji: '🥺', icon: FeltBadIcon },
      { id: 'disliked_topic', label: 'Não gostei do assunto', emoji: '😒', icon: DislikedTopicIcon },
      { id: 'heavy_topic', label: 'Achei um tema pesado', emoji: '😰', icon: HeavyTopicIcon },
      { id: 'no_comment', label: 'Nada a declarar', emoji: '😐', icon: NeutralFaceIcon }
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
            return h('div', { key: opt.id, className: 'emotion-card-wrapper' },
              h('button', {
                type: 'button',
                role: 'radio',
                'aria-checked': isSelected,
                className: `emotion-card-btn ${isSelected ? 'selected' : ''}`,
                onClick: () => handleSelect(opt.id),
                title: `${opt.emoji} ${opt.label}`
              }, h(opt.icon)),
              h('span', { className: `emotion-card-label ${isSelected ? 'selected' : ''}` }, opt.label)
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
