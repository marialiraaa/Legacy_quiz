export const CATEGORIES = {
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

export function getCategoryInfo(categoriaOrKey) {
  if (!categoriaOrKey) return CATEGORIES.BLOCO_A;
  if (CATEGORIES[categoriaOrKey]) return CATEGORIES[categoriaOrKey];
  const mappedKey = CATEGORY_NAME_TO_KEY[categoriaOrKey];
  if (mappedKey && CATEGORIES[mappedKey]) return CATEGORIES[mappedKey];
  return {
    id: String(categoriaOrKey).toLowerCase().replace(/\s+/g, "_"),
    name: String(categoriaOrKey),
    badge: String(categoriaOrKey),
    icon: "✨",
    color: "#3b82f6"
  };
}

export const quizQuestions = [
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

// Exporta QUIZ_QUESTIONS normalizado para compatibilidade com todos os módulos do sistema
export const QUIZ_QUESTIONS = quizQuestions.map((q) => {
  const categoryKey = CATEGORY_NAME_TO_KEY[q.categoria] || "BLOCO_A";
  const correctOpt = q.alternativas.find((a) => a.correta === true);
  const normalizedOptions = q.alternativas.map((a) => ({
    ...a,
    text: a.texto
  }));

  return {
    ...q,
    image: q.imagem || q.image,
    category: categoryKey,
    question: `${q.id}. ${q.pergunta}`,
    options: normalizedOptions,
    correctAnswer: q.tipo === "conhecimento" ? (correctOpt?.id || null) : null,
    complement: q.feedback
  };
});

// Perguntas reflexivas (Bloco D) também mapeadas em BONUS_QUESTIONS para relatórios analíticos
export const BONUS_QUESTIONS = QUIZ_QUESTIONS.filter((q) => q.tipo === "reflexao").map(
  (q, idx) => ({
    ...q,
    id: `bonus_${idx + 1}`,
    questionIdNumeric: q.id,
    title: `${q.categoria} (Questão ${q.id})`,
    reflection: q.feedback
  })
);
