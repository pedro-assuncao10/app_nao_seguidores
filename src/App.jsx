import React, { useState, useEffect } from 'react';

// --- SVGs e Ícones ---
const CheckCircleIcon = () => (
  <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg className="w-12 h-12 text-pink-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-12 h-12 text-yellow-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const LightningIcon = () => (
  <svg className="w-12 h-12 text-purple-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-8 h-8 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-8 h-8 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth="2" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01" />
  </svg>
);

const PuzzleIcon = () => (
  <svg className="w-8 h-8 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
  </svg>
);

export default function App() {
  const [hasPaid, setHasPaid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);

  // EFEITO NOVO: Verifica se o usuário acabou de voltar do Mercado Pago com pagamento aprovado
  useEffect(() => {
    // 1. Verifica se já existe um passe VIP salvo no celular/PC do usuário
    const hasVIPAccess = localStorage.getItem('unfollowTrackerVIP');
    if (hasVIPAccess === 'true') {
      setHasPaid(true);
    }

    const queryParams = new URLSearchParams(window.location.search);
    const status = queryParams.get('status');
    const collectionStatus = queryParams.get('collection_status');
    const paymentId = queryParams.get('payment_id');

    let intervalId;

    if (status === 'success' || status === 'approved' || collectionStatus === 'approved') {
      setHasPaid(true); // Libera o acesso VIP!
      localStorage.setItem('unfollowTrackerVIP', 'true');
      // Limpa a URL para o usuário não ver aqueles códigos do Mercado Pago
      window.history.replaceState(null, '', window.location.pathname);
    } 
    // NOVO: Se voltou rápido demais e está PENDENTE (PIX ou Boleto)
    else if (status === 'pending' && paymentId) {
      console.log("⏳ Pagamento PENDENTE. Iniciando sala de espera...");
      setIsCheckingPayment(true); // Mostra a tela de carregamento

      let tentativas = 0;
      const maxTentativas = 30; // 30 tentativas x 10 segundos = 5 minutos de espera máxima

      // Cria um relógio que checa o servidor a cada 10 segundos (10000 milissegundos)
      intervalId = setInterval(async () => {
        tentativas++;
        
        // TRAVA DE SEGURANÇA: Para de procurar após 5 minutos para não gastar o limite do Netlify
        if (tentativas > maxTentativas) {
          console.log("Tempo limite atingido. Parando de checar.");
          clearInterval(intervalId);
          setIsCheckingPayment(false);
          alert("A confirmação do PIX está demorando mais que o normal. Se você já pagou, não se preocupe! Recarregue esta página daqui a pouco para liberar seu acesso.");
          window.history.replaceState(null, '', window.location.pathname);
          return;
        }

        try {
          console.log(`Checando status no Mercado Pago... (Tentativa ${tentativas} de ${maxTentativas})`);
          const res = await fetch(`/.netlify/functions/check-payment?payment_id=${paymentId}`);
          const data = await res.json();

          if (data.status === 'approved') {
            console.log("✅ AGORA FOI! Pagamento aprovado no servidor!");
            clearInterval(intervalId);
            setIsCheckingPayment(false);
            setHasPaid(true);
            localStorage.setItem('unfollowTrackerVIP', 'true');
            window.history.replaceState(null, '', window.location.pathname);
          } else if (data.status === 'rejected' || data.status === 'cancelled') {
            console.log("❌ Pagamento cancelado/rejeitado no servidor.");
            clearInterval(intervalId);
            setIsCheckingPayment(false);
            alert("O pagamento não foi aprovado ou foi cancelado.");
            window.history.replaceState(null, '', window.location.pathname);
          }
        } catch (err) {
          console.error("Erro ao checar pagamento", err);
        }
      }, 10000); // 10000 = 10 segundos
    } else if (status === 'failure' || status === 'rejected') {
      alert("Ocorreu um problema com o pagamento. Tente novamente.");
      window.history.replaceState(null, '', window.location.pathname);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  // FUNÇÃO REAL: Chama o Backend para gerar o link de pagamento
  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Chama a função que criamos no Netlify
      const response = await fetch('/.netlify/functions/create-preference', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      // Se a função devolveu o link de pagamento, redireciona o usuário para lá
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        alert("Erro ao conectar com o Mercado Pago. Tente novamente.");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão. Verifique sua internet.");
      setIsProcessing(false);
    }
  };

  const faqs = [
    {
      question: "Preciso informar minha senha do Instagram?",
      answer: "NÃO! Sua segurança é nossa prioridade. Nossa tecnologia funciona direto no seu navegador. Você só precisa estar logado na página oficial do Instagram e nós fazemos o resto. Nunca pediremos ou teremos acesso à sua senha."
    },
    {
      question: "Posso usar pelo celular?",
      answer: "Não. Para garantir 100% de segurança e não exigir suas senhas, nossa ferramenta foi desenvolvida exclusivamente para computadores (Windows, Mac ou Linux) utilizando o navegador Google Chrome."
    },
    {
      question: "É seguro? Minha conta pode ser bloqueada?",
      answer: "Sim, é totalmente seguro. Como nossa ferramenta apenas lê as informações públicas diretamente da tela do seu navegador oficial, o Instagram não detecta atividades suspeitas de servidores de terceiros. Seu perfil continua intacto."
    },
    {
      question: "Como vou receber o acesso?",
      answer: "Assim que o pagamento for aprovado pelo Mercado Pago, esta mesma página será atualizada automaticamente liberando o acesso ao material e o passo a passo simplificado para uso imediato."
    }
  ];

  // TELA 1.5: SALA DE ESPERA (Aparece apenas quando está checando o PIX)
  if (isCheckingPayment) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-white font-sans">
        <div className="relative mb-8">
          {/* Círculo pulsante de fundo */}
          <div className="absolute inset-0 bg-pink-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
          {/* Ícone de carregamento principal */}
          <svg className="animate-spin relative h-20 w-20 text-pink-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        
        <h2 className="text-3xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">
          Processando seu PIX...
        </h2>
        
        <div className="bg-slate-800 rounded-2xl p-6 max-w-md border border-slate-700 shadow-2xl">
          <p className="text-slate-300 text-lg mb-6">
            Já recebemos o seu pedido! O banco está confirmando a transação.
          </p>
          <div className="flex items-center justify-center gap-3 text-yellow-400 bg-yellow-400/10 py-4 px-4 rounded-xl border border-yellow-400/20">
            <svg className="w-8 h-8 animate-pulse flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-semibold text-sm text-left leading-tight">
              Importante: Pode levar até 5 minutos. <br/>Não feche e nem saia desta página.
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (hasPaid) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
        <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="font-bold text-xl tracking-tight bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              UnfollowTracker
            </div>
            <div className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full flex items-center">
              <CheckCircleIcon /> Pagamento Aprovado
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 mt-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
              Acesso Liberado! 🎉
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Siga os 3 passos simples abaixo para descobrir agora mesmo a sua lista de pessoas que não te seguem de volta.
            </p>
          </div>

          <div className="space-y-8">
            {/* Passo 1 */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col md:flex-row items-start md:items-center gap-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-pink-500"></div>
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-4 flex-shrink-0 shadow-lg shadow-pink-200">
                <DownloadIcon />
              </div>
              <div className="flex-grow">
                <div className="text-sm font-bold text-pink-500 uppercase tracking-wider mb-1">Passo 1</div>
                <h3 className="text-xl font-bold mb-2">Instale a Ferramenta</h3>
                <p className="text-slate-600 mb-4">
                  Nossa ferramenta é uma extensão segura para o Google Chrome. Clique no botão abaixo para baixar e instalar no seu navegador.
                </p>
                <a 
                  href="https://chromewebstore.google.com/detail/n%C3%A3o-seguidores/ggnclhlkbhihgehcgmnckfgkjjkckbop" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-6 rounded-xl transition-colors inline-flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10zm-1.5-6.5l-4-4 1.414-1.414L10.5 12.672l6.086-6.086L18 8l-7.5 7.5z"/>
                  </svg>
                  Adicionar ao Chrome
                </a>
              </div>
            </div>

            {/* Passo 2 */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col md:flex-row items-start md:items-center gap-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-purple-500"></div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 flex-shrink-0 shadow-lg shadow-purple-200">
                <InstagramIcon />
              </div>
              <div className="flex-grow">
                <div className="text-sm font-bold text-purple-500 uppercase tracking-wider mb-1">Passo 2</div>
                <h3 className="text-xl font-bold mb-2">Acesse sua conta do Instagram</h3>
                <p className="text-slate-600">
                  Abra uma nova aba e acesse o site <strong>oficial</strong> do Instagram (instagram.com) e faça seu login normalmente. <br/>
                  <span className="inline-flex items-center mt-2 text-sm text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                    <LockIcon /> Lembre-se: nós não temos acesso aos seus dados ou senha.
                  </span>
                </p>
              </div>
            </div>

            {/* Passo 3 */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col md:flex-row items-start md:items-center gap-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-yellow-400"></div>
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-4 flex-shrink-0 shadow-lg shadow-orange-200">
                <PuzzleIcon />
              </div>
              <div className="flex-grow">
                <div className="text-sm font-bold text-orange-500 uppercase tracking-wider mb-1">Passo 3</div>
                <h3 className="text-xl font-bold mb-2">Execute a Varredura</h3>
                <p className="text-slate-600">
                  Com o Instagram aberto, clique no ícone de <strong>Quebra-cabeça</strong> no canto superior direito do seu navegador Chrome. Selecione a extensão que você acabou de instalar. A própria ferramenta fará o resto e abrirá uma janela com a sua lista!
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center text-slate-400 text-sm">
            <p>Precisa de ajuda? Entre em contato com nosso suporte.</p>
          </div>
        </main>
      </div>
    );
  }

  // --- Landing Page (Pré-Pagamento) ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Aviso Superior */}
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 text-white text-center py-2 px-4 text-sm font-medium shadow-md">
        ⚡ Vagas limitadas para acesso à ferramenta com valor promocional.
      </div>

      <main>
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-pink-200 bg-pink-50 text-pink-600 font-semibold text-sm">
            Ferramenta Atualizada 2026
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
            Descubra Exatamente Quem <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
               Não Te Segue de Volta
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Pare de fazer papel de fã. Limpe seu perfil com apenas alguns cliques. 
            Uma ferramenta 100% segura e invisível, que gera a lista na hora sem precisar da sua senha.
          </p>

          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 max-w-md mx-auto relative">
            <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg transform rotate-3">
              Oferta Especial
            </div>
            <div className="text-slate-500 line-through mb-1">De R$ 49,90 por apenas</div>
            <div className="text-5xl font-extrabold text-slate-900 mb-6">
              R$ 19,90 <span className="text-lg text-slate-500 font-medium block mt-1">pagamento único</span>
            </div>
            
            <button 
              onClick={handlePayment}
              disabled={isProcessing}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-lg text-white shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
                isProcessing 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-blue-500/30'
              }`}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processando via Mercado Pago...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <LockIcon /> Quero Descobrir Agora
                </span>
              )}
            </button>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
              <LockIcon /> Pagamento 100% Seguro
            </div>
          </div>
        </section>

        {/* Benefícios */}
        <section className="bg-white py-20 border-y border-slate-200">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-16">Por que você precisa dessa ferramenta?</h2>
            
            <div className="grid md:grid-cols-3 gap-10">
              <div className="text-center">
                <div className="flex justify-center"><ShieldCheckIcon /></div>
                <h3 className="text-xl font-bold mb-3">100% Seguro</h3>
                <p className="text-slate-600">
                  Nenhuma senha é solicitada. Tudo acontece no seu próprio computador de forma criptografada.
                </p>
              </div>
              <div className="text-center">
                <div className="flex justify-center"><LightningIcon /></div>
                <h3 className="text-xl font-bold mb-3">Resultado Rápido</h3>
                <p className="text-slate-600">
                  Em questão de segundos a ferramenta varre seus contatos e entrega uma lista limpa de quem não te segue.
                </p>
              </div>
              <div className="text-center">
                <div className="flex justify-center"><EyeOffIcon /></div>
                <h3 className="text-xl font-bold mb-3">Total Privacidade</h3>
                <p className="text-slate-600">
                  Nós não coletamos seus dados, não sabemos quem são seus amigos e respeitamos totalmente sua privacidade.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Como Funciona Simplificado */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Apenas 3 passos para a verdade</h2>
            <div className="space-y-4">
              <div className="flex items-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-lg mr-4 flex-shrink-0">1</div>
                <p className="text-lg font-medium">Realize o pagamento seguro nesta página.</p>
              </div>
              <div className="flex items-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg mr-4 flex-shrink-0">2</div>
                <p className="text-lg font-medium">Receba acesso imediato ao material exclusivo.</p>
              </div>
              <div className="flex items-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center font-bold text-lg mr-4 flex-shrink-0">3</div>
                <p className="text-lg font-medium">Gere sua lista e saiba na hora quem não interage com você.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ - Foco em tirar objeções de segurança */}
        <section className="py-20 bg-white border-y border-slate-200">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Dúvidas Frequentes</h2>
              <p className="text-slate-600">Ainda está com medo? Nós garantimos sua segurança.</p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className={`border ${activeFaq === index ? 'border-pink-500' : 'border-slate-200'} rounded-2xl overflow-hidden transition-colors`}
                >
                  <button 
                    className="w-full text-left px-6 py-4 font-bold text-lg flex justify-between items-center bg-white hover:bg-slate-50"
                    onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  >
                    {faq.question}
                    <span className={`transform transition-transform ${activeFaq === index ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>
                  {activeFaq === index && (
                    <div className="px-6 pb-4 pt-2 text-slate-600 border-t border-slate-100 bg-slate-50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-slate-900 text-center px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Pronto para limpar o seu perfil?
          </h2>
          <p className="text-slate-300 mb-10 max-w-xl mx-auto">
            Não perca tempo verificando um por um. Invista em tecnologia, economize seu tempo e pare de seguir quem não se importa.
          </p>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 px-10 rounded-full shadow-lg shadow-pink-500/30 transform transition hover:-translate-y-1 text-lg"
          >
            Quero minha lista agora
          </button>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-slate-950 py-8 text-center text-slate-500 text-sm">
        <p className="mb-2">Este site não é afiliado ou endossado pelo Instagram ou Meta.</p>
        <p>&copy; 2026 UnfollowTracker. Todos os direitos reservados. Hospedado via Netlify.</p>
      </footer>
    </div>
  );
}