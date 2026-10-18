# Legacy Quiz — Aplicação React sobre Memória e Legado Digital

Aplicação interativa desenvolvida com **React** baseada no protocolo de pesquisa científica e nos protótipos de alta fidelidade do projeto **Legacy Quiz**.

---

## 🌟 Visão Geral e Fidelidade aos Protótipos

A aplicação foi integralmente estruturada respeitando o roteiro de interação (`RoteirodeInteraçãojogogo.pdf`) e os layouts do Figma disponíveis na pasta `prototipo/`:

| Tela / Etapa | Frame de Referência | Descrição da Experiência |
| :--- | :--- | :--- |
| **Página Inicial (Landing)** | `Frame 227.png` | Faixa em arco com título cyber `LEGACY QUIZ`, chamada *"SEUS DADOS TEM UM FUTURO. VOCÊ SABE QUAL?"*, os 3 pilares (*Descubra*, *Reflita*, *Conheça*), vortex púrpura com mascote e ícones de redes sociais, e o botão `VAMOS JOGAR!`. |
| **Aviso de Conteúdo** | `Frame 228.png` | Aviso ético sobre a natureza sensível dos tópicos (morte, perda e finitude digital) com opção de prosseguir ou sair com acolhimento. |
| **Identificação do Jogador** | `Frame 226.png` + `Frame 225.png` | Entrada do *nickname* e modal de confirmação estilizado com botões `Cancelar` (vermelho) e `Confirmar` (verde). |
| **Vídeos Reflexivos (1 e 2)**| `Frame 229.png` | Player de vídeo imersivo com miniatura da cena reflexiva, pausa para reflexão e validação de continuidade da sessão. |
| **Quiz Principal (21 Questões)** | `Frame 219.png`, `Frame 222.png`, `Frame 223.png` | - **Pergunta**: Faixa curva no topo, tag temática do eixo e ilustração central.<br>- **3 Alternativas**: Cards em glassmorphism `A`, `B` e `C`.<br>- **Feedback Imediato**: Se correto, *"Boa! Resposta correta."* com mascote vitorioso; se incorreto, *"Opa! Resposta incorreta."* com destaque visual e mascote encorajador.<br>- **Card Complemento**: Caixa explicativa com 💡 detalhando o conceito pedagógico.<br>- **Barra de Progresso**: Indicador com contador `1/21` e navegação `Retornar` / `Próxima`. |
| **Transição para Bônus** | `Frame 236.png` | Tela de transição com a caixa dourada de presente flutuante anunciando as perguntas reflexivas. |
| **Perguntas Bônus (1 e 2)** | `Frame 235.png` e `Frame 233.png` | Questões de autorreflexão sobre a biografia digital e gestão póstuma com as ilustrações da porta iluminada e da finitude. |

| **Tela de Conclusão** | `Frame 245.png` | Brasão de louros com polegar, estatísticas completas de acertos, botões `JOGAR NOVAMENTE`, `VER RESPOSTAS` e exportação dos dados. |
| **Gabarito / Ver Respostas** | *Recurso Adicional* | Modal para rever todas as 21 questões com filtros (Todas, Acertos, Erros) e leitura de todos os complementos pedagógicos. |

---

## 🎨 Identidade Visual e Recursos

- **Paleta de Cores**:
  - Azul Noturno / Marinho do Cabeçalho: `#1c2a5e` / `#162044`
  - Gradiente Cyber Logo: Rosa `#ec4899`, Violeta `#8b5cf6`, Ciano `#06b6d4`
  - Verde Sucesso / Botão Jogar: `#22c55e` / `#16a34a`
  - Vermelho Atenção: `#ef4444` / `#dc2626`
  - Fundo: Gradiente ultra-clean `#eef2f7` a `#d8e2ef` com iluminação ambiente suave.
- **Tipografia**: Outfit, Plus Jakarta Sans e Press Start 2P (Google Fonts).
- **Efeitos de Áudio Sintetizados**: Motor Web Audio API nativo (bips suaves, acorde de acerto, tom descendente de erro e fanfarra triunfal), com botão de silenciar (Mute/Unmute).
- **Exportação de Dados da Pesquisa**: Download de arquivo estruturado `.json` com todas as respostas do participante, carimbos de data/hora e avaliação.

---

## 🚀 Como Executar a Aplicação

### Opção 1: Execução Imediata (Sem instalação prévia)
Basta abrir o arquivo `index.html` em qualquer navegador moderno (Chrome, Safari, Firefox, Edge) ou pelo terminal macOS:
```bash
open index.html
```
*A aplicação possui suporte offline completo e inicia instantaneamente.*

### Opção 2: Servidor Local Python (Recomendado para rede local / totens)
```bash
python3 -m http.server 8000
```
Em seguida, acesse no navegador: [http://localhost:8000](http://localhost:8000).

### Opção 3: Modo Desenvolvedor com Vite / NPM (React Modular)
Se você tiver Node.js instalado:
```bash
npm install
npm run dev
```

---

## 📁 Estrutura do Projeto

```
quiz_legado/
├── assets/                     # Imagens e recortes de alta resolução dos protótipos
│   ├── frame-219.png           # Frame original da questão 1
│   ├── frame-222.png           # Frame original de acerto com mascote
│   ├── frame-223.png           # Frame original de erro com mascote
│   ├── frame-225.png           # Frame original do modal de nickname
│   ├── frame-226.png           # Frame original da tela de nickname
│   ├── frame-227.png           # Frame original da landing page
│   ├── frame-228.png           # Frame original do aviso de conteúdo
│   ├── frame-229.png           # Frame original do vídeo
│   ├── frame-233.png           # Frame original bônus 2
│   ├── frame-235.png           # Frame original bônus 1
│   ├── frame-236.png           # Frame original transição bônus
│   ├── frame-244.png           # Frame original transição final
│   ├── frame-245.png           # Frame original tela de agradecimento
│   ├── mascot-celebrate.png    # Mascote vitorioso recortado
│   ├── mascot-thumbs.png       # Mascote encorajador recortado
│   ├── mascot-standing.png     # Mascote da etapa final
│   ├── illustration-q1.png     # Ilustração da questão 1
│   ├── illustration-door.png   # Ilustração bônus da porta iluminada
│   ├── illustration-reaper.png # Ilustração bônus da finitude
│   ├── illustration-gift.png   # Ilustração da caixa dourada
│   ├── video-screen.png        # Miniatura cinematográfica do vídeo
│   └── laurel-badge.png        # Brasão dourado de louros
├── src/                        # Código fonte modular em React
│   ├── data/
│   │   ├── questions.js        # Banco das 21 questões + 2 bônus + eixos temáticos
│   │   └── tcle.js             # Termo de Consentimento Livre e Esclarecido
│   ├── hooks/
│   │   └── useAudio.js         # Hook de efeitos sonoros sintetizados via Web Audio API
│   ├── styles/
│   │   └── index.css           # Design system completo, glassmorphism e animações
│   ├── components/
│   │   ├── TopRibbon.jsx       # Faixa em arco superior azul marinho
│   │   ├── LandingScreen.jsx   # Tela inicial (Frame 227)
│   │   ├── ContentWarning.jsx  # Aviso de conteúdo sensível (Frame 228)
│   │   ├── NicknameScreen.jsx  # Tela e modal de confirmação de nickname (Frames 226/225)
│   │   ├── VideoScreen.jsx     # Interface de exibição de vídeos reflexivos (Frame 229)
│   │   ├── QuizQuestion.jsx    # Questões com feedback imediato e complemento (Frames 219/222/223)
│   │   ├── BonusIntro.jsx      # Transição para questões bônus (Frame 236)
│   │   ├── BonusQuestion.jsx   # Perguntas bônus de autorreflexão (Frames 235/233)

│   │   ├── CompletionScreen.jsx# Tela final de agradecimento e louros (Frame 245)
│   │   ├── ReviewModal.jsx     # Revisão completa com gabarito e complementos pedagógicos
│   │   ├── ConsentModal.jsx    # Modal de consulta do TCLE
│   │   └── ExitSurveyModal.jsx # Modal para justificativa opcional de desistência
│   ├── App.jsx                 # Componente raiz, máquina de estados e roteamento
│   └── main.jsx                # Ponto de entrada React 18
├── vendor/
│   └── react-offline.js        # Motor React 18 compatível para execução offline
├── app.js                      # Pacote React autônomo executável diretamente no navegador
├── index.html                  # Arquivo HTML principal pronto para uso
├── package.json                # Configuração npm para desenvolvimento React
├── vite.config.js              # Configuração Vite
└── roteiro_extraido.txt        # Transcrição integral das 6 páginas do protocolo científico
```
