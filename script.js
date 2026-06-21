document.addEventListener('DOMContentLoaded', () => {
    
    // url dinâmica
    const basePath = window.location.hostname.includes('github.io') ? '/portfolio-pro/' : '/';

    // Gerenciamento de recarregamento / redirecionamento
    const redirectPath = sessionStorage.getItem('redirect_path');
    if (redirectPath) {
        // Limpa memória evitando loops de redirecionamento
        sessionStorage.removeItem('redirect_path');
        // Pega a última palavra após a "/"
        const sectionId = redirectPath.split('/').pop();

        if (sectionId) {
            // Reescreve a Url usando basePath
            history.replaceState(null, null, basePath + sectionId);
            // Procura a seção correspondente scrollando até ela
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                // Delay na página antes de renderizar scroll
                setTimeout(() => {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }, 300);
            }
        }
    }

    // Sistema unificado de âncoras e rolagem suave
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // Impede alteração da URL
            const targetId = link.getAttribute('href'); // Pega o ID
            
            // Botão de voltar ao topo e link vazio
            if (targetId === '#' || link.classList.contains('scroll-top')) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });

                // Se o link fizer parte do menu principal, limpa a URL tirando o '#'
                if (link.closest('.nav-links')) {
                    const cleanRoute = targetId.replace('#', '');
                    history.pushState(null, null, basePath + cleanRoute);
                }
            }

        });
    });

    // Alternador de tema (Dark | Light)
    const themeToggleBtn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme'); // Verifica se já existe um tema salvo no navegador
    
    // Função Auxiliar para trocar ícone e o texto alternativo
    const updateIcon = (tema) => {
        const isDark = tema === 'dark';
            themeToggleBtn.title = isDark ? 'Modo Claro' : 'Modo Escuro';
            themeToggleBtn.setAttribute('aria-label', isDark ? 'Modo Claro' : 'Modo Escuro');
    };

    // Aplica o tema guardado anteriormente se existir
    if (savedTheme) {
        document.documentElement.dataset.theme = savedTheme;
        updateIcon(savedTheme);
    }

    // Ouvinte de clique para alternar tema
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.dataset.theme;
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Aplica o novo tema no HTML, guarda no localStorage e muda o ícone
        document.documentElement.dataset.theme = newTheme;
        localStorage.setItem('theme', newTheme);
        
        // Atualiza os textos de acessibilidade
        updateIcon(newTheme);
    });

    // Validação e envio do formulário de contato
    const form = document.getElementById('form-contato');
    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const mensagemInput = document.getElementById('mensagem');

    const errorNome = document.getElementById('error-nome');
    const errorEmail = document.getElementById('error-email');
    const errorMensagem = document.getElementById('error-mensagem');
    const formSuccess = document.getElementById('form-success');

    let messageTimeout; // Evita sobreposição de temporizadores

    // Função reutilizável para gerenciar feedbacks na tela
    const showFeedback = (mensagem, cor, limparTempo = 0) => {
        clearTimeout(messageTimeout); // Cancela o timer anterior se houver
        formSuccess.style.color = cor;
        formSuccess.textContent = mensagem;

        if (limparTempo > 0) {
            messageTimeout = setTimeout(() => {
                formSuccess.textContent = '';
            }, limparTempo);
        }
    };

    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Impede envio real e testa validação

        const dadosFormulario = {
            name: nomeInput.value.trim(),
            email: emailInput.value.trim(),
            message: mensagemInput.value.trim()
        };

        // Limpa avisos visuais anteriores
        errorNome.textContent = '';
        errorEmail.textContent = '';
        errorMensagem.textContent = '';
        showFeedback('', '');

        let isValid = true;

        // Validação do Nome (Pelo menos 4 caracteres)
        if (dadosFormulario.name.length < 4) {
            errorNome.textContent = 'Insira um nome válido (mínimo 4 caracteres).';
            isValid = false;
        }

        // Validação do E-mail (Expressão regular simples)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(dadosFormulario.email)) {
            errorEmail.textContent = 'Insira um endereço de e-mail válido.';
            isValid = false;
        }

        // Validação da Mensagem (Pelo menos 10 caracteres)
        if (dadosFormulario.message.length < 10) {
            errorMensagem.textContent = 'A mensagem deve conter pelo menos 10 caracteres.';
            isValid = false;
        }

        // Trava a execução se houver erros de Digitação
        if (!isValid) return;

        // Campos validados com sucesso
        showFeedback('Enviando sua mensagem...', 'var(--text-primary)');
        
        try {
            // url server vercel
            const urlProdVercel = ''; // Add url Vercel
            const apiUrl = window.location.hostname.includes('github.io')
                ? `${urlProdVercel}/api/contato`
                : '/api/contato';

            // Dispara o envio em segundo plano para Url
            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosFormulario)
            })
            .then(res => {
                if (!res.ok)
                    throw new Error('Falha no servidor'); // Falha no servidor | Erro na resposta
                
                // Formulário Enviado com Sucesso / Cor verde de sucesso / Temporizador 5 seg clearMessage
                showFeedback('Obrigado! Sua mensagem foi enviada com sucesso.', '#28a745', 5000);
                form.reset(); // Limpa os campos do formulário
            })
            .catch(() => {
                // Falha ao Enviar Formulário / Cor vermelha de erro / Temporizador 10 seg clearMessage
                showFeedback('Ops! Houve um problema ao enviar. Tente novamente mais tarde.', '#dc3545', 10000);
            });

        } catch (erroSincrono) {
            // Erro interno no servidor / Cor vermelha de erro / Temporizador 5 seg clearMessage
            showFeedback(`Erro interno no servidor: ${erroSincrono.message}`, '#dc3545', 5000);
        }
    });
});