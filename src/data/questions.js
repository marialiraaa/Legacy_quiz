export const CATEGORIES = {
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

export const QUIZ_QUESTIONS = [
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

export const BONUS_QUESTIONS = [
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
