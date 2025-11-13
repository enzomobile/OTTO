document.addEventListener('DOMContentLoaded', function() {
    console.log('Navegação por teclado - Pressione TAB para iniciar');
    
    // Verifica imediatamente se deve iniciar
    let navegacaoAtiva = sessionStorage.getItem('navegacaoTecladoAtiva') === 'true';
    let elementos = [];
    let elementoAtual = 0;
    let styleElement = null;

    // Configuração - Mudei para sessionStorage que é mais rápido
    const CONFIG = {
        teclaAtivacao: 'Tab',
        teclasNavegacao: ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'],
        teclaAcao: 'Enter',
        teclaCancelar: 'Escape',
        delayAtivacao: 50 // Reduzido para ser mais rápido
    };

    function inicializarNavegacao() {
        if (navegacaoAtiva) return;
        
        navegacaoAtiva = true;
        // SALVA IMEDIATAMENTE
        sessionStorage.setItem('navegacaoTecladoAtiva', 'true');
        elementos = encontrarElementosLinkaveis();
        
        if (elementos.length === 0) {
            console.log('Nenhum elemento linkável encontrado!');
            navegacaoAtiva = false;
            sessionStorage.setItem('navegacaoTecladoAtiva', 'false');
            return;
        }
        
        console.log(`Navegação ativada - ${elementos.length} elementos encontrados`);
        elementoAtual = 0;
        
        criarEstiloDestaque();
        aplicarDestaque(elementos[0]);
        
        mostrarFeedbackInicial();
        
        console.log('Use ←→↑↓ para navegar, ENTER para clicar, ESC para sair');
    }

    function encontrarElementosLinkaveis() {
        const elementos = [];
        
        const links = document.querySelectorAll('a[href]');
        links.forEach(link => {
            if (link.offsetWidth > 0 && link.offsetHeight > 0 && 
                link.href && !link.href.includes('javascript:')) {
                elementos.push(link);
            }
        });
        
        const botoes = document.querySelectorAll('button');
        botoes.forEach(botao => {
            if (botao.offsetWidth > 0 && botao.offsetHeight > 0 && !botao.disabled) {
                elementos.push(botao);
            }
        });
        
        const itensMenu = document.querySelectorAll('.menu li, nav li');
        itensMenu.forEach(item => {
            if (item.offsetWidth > 0 && item.offsetHeight > 0) {
                if (item.onclick || item.getAttribute('onclick') || 
                    item.querySelector('a') || item.style.cursor === 'pointer') {
                    elementos.push(item);
                }
            }
        });
        
        const comOnclick = document.querySelectorAll('[onclick]');
        comOnclick.forEach(el => {
            if (el.offsetWidth > 0 && el.offsetHeight > 0 && 
                !elementos.includes(el) && 
                el.tagName !== 'A' && el.tagName !== 'BUTTON') {
                elementos.push(el);
            }
        });
        
        const classesEspecificas = document.querySelectorAll('.botao-navegar, .btn, .botao, .button, .curso-painel button');
        classesEspecificas.forEach(el => {
            if (el.offsetWidth > 0 && el.offsetHeight > 0 && !elementos.includes(el)) {
                elementos.push(el);
            }
        });
        
        return elementos;
    }

    function criarEstiloDestaque() {
        if (styleElement) return;
        
        styleElement = document.createElement('style');
        styleElement.textContent = `
            .destaque-teclado {
                outline: 3px solid #FFFFFF !important;
                outline-offset: 2px !important;
                box-shadow: 0 0 8px rgba(255, 255, 255, 0.6) !important;
                border-radius: 3px !important;
                z-index: 9999 !important;
                position: relative !important;
            }
            
            .feedback-navegacao {
                position: fixed !important;
                top: 20px !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
                background: rgba(0, 0, 0, 0.8) !important;
                color: white !important;
                padding: 10px 16px !important;
                border-radius: 5px !important;
                font-size: 14px !important;
                z-index: 10001 !important;
                text-align: center !important;
            }
            
            .contador-navegacao {
                position: fixed !important;
                bottom: 10px !important;
                right: 10px !important;
                background: rgba(0, 0, 0, 0.7) !important;
                color: white !important;
                padding: 5px 10px !important;
                border-radius: 3px !important;
                font-size: 12px !important;
                z-index: 10000 !important;
            }
        `;
        document.head.appendChild(styleElement);
    }

    function mostrarFeedbackInicial() {
        const feedback = document.createElement('div');
        feedback.className = 'feedback-navegacao';
        feedback.textContent = 'Navegação via teclado ativa - Use ←→↑↓, ENTER para clicar, ESC para sair';
        feedback.id = 'feedback-navegacao';
        document.body.appendChild(feedback);

        setTimeout(() => {
            const elemento = document.getElementById('feedback-navegacao');
            if (elemento) elemento.remove();
        }, 2000);

        atualizarContador();
    }

    function atualizarContador() {
        let contador = document.getElementById('contador-navegacao');
        if (!contador) {
            contador = document.createElement('div');
            contador.className = 'contador-navegacao';
            contador.id = 'contador-navegacao';
            document.body.appendChild(contador);
        }
        contador.textContent = `${elementoAtual + 1}/${elementos.length}`;
    }

    function aplicarDestaque(elemento) {
        removerDestaqueAtual();
        elemento.classList.add('destaque-teclado');
        
        const rect = elemento.getBoundingClientRect();
        if (rect.top < 50 || rect.bottom > window.innerHeight - 50) {
            elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        atualizarContador();
    }

    function removerDestaqueAtual() {
        if (elementos[elementoAtual]) {
            elementos[elementoAtual].classList.remove('destaque-teclado');
        }
    }

    function navegarPara(direcao) {
        if (!navegacaoAtiva || elementos.length === 0) return;
        
        removerDestaqueAtual();
        
        elementoAtual += direcao;
        if (elementoAtual < 0) elementoAtual = elementos.length - 1;
        if (elementoAtual >= elementos.length) elementoAtual = 0;
        
        aplicarDestaque(elementos[elementoAtual]);
        
        console.log(`${elementoAtual + 1}/${elementos.length}: ${elementos[elementoAtual].textContent.trim()}`);
    }

    function clicarElementoAtual() {
        if (!navegacaoAtiva || !elementos[elementoAtual]) return;
        
        const elemento = elementos[elementoAtual];
        console.log('Clicando:', elemento);
        
        // **MUDANÇA CRÍTICA: NÃO DESATIVA PARA LINKS DO MESMO SITE**
        const isLinkMesmoSite = elemento.tagName === 'A' && elemento.href && 
                               elemento.href.includes(window.location.hostname);
        
        // Só desativa se NÃO for um link do mesmo site
        if (!isLinkMesmoSite) {
            // Para links externos ou ações JavaScript, desativa
            sessionStorage.setItem('navegacaoTecladoAtiva', 'false');
        }
        // Se for link do mesmo site, MANTÉM ativo (não faz nada)
        
        elemento.style.transform = 'scale(0.95)';
        setTimeout(() => {
            elemento.style.transform = '';
        }, 200);
        
        // **EXECUTA A AÇÃO IMEDIATAMENTE**
        if (elemento.tagName === 'A' && elemento.href) {
            window.location.href = elemento.href;
        } else if (elemento.tagName === 'BUTTON' || elemento.onclick) {
            elemento.click();
        } else if (elemento.tagName === 'LI') {
            const linkDentro = elemento.querySelector('a');
            if (linkDentro && linkDentro.href) {
                window.location.href = linkDentro.href;
            } else {
                executarAcaoMenu(elemento);
            }
        } else {
            elemento.click();
        }
    }

    function executarAcaoMenu(itemMenu) {
        const texto = itemMenu.textContent.trim().toLowerCase();
        console.log('Executando ação do menu:', texto);
        
        if (texto.includes('home') || texto.includes('início')) {
            window.location.href = '/';
        } else if (texto.includes('perfil')) {
            window.location.href = '/perfil/';
        } else if (texto.includes('fases')) {
            window.location.href = '/fases/';
        } else if (texto.includes('config')) {
            window.location.href = '/config/';
        } else {
            itemMenu.click();
        }
    }

    function desativarNavegacao() {
        if (!navegacaoAtiva) return;
        
        navegacaoAtiva = false;
        sessionStorage.setItem('navegacaoTecladoAtiva', 'false');
        removerDestaqueAtual();
        
        const contador = document.getElementById('contador-navegacao');
        if (contador) contador.remove();
        
        console.log('Navegação por teclado desativada');
    }

    // Event Listener Principal
    document.addEventListener('keydown', function(e) {
        if (e.key === CONFIG.teclaAtivacao && !navegacaoAtiva) {
            e.preventDefault();
            setTimeout(() => inicializarNavegacao(), CONFIG.delayAtivacao);
            return;
        }
        
        if (!navegacaoAtiva) return;
        
        switch(e.key) {
            case 'ArrowDown':
            case 'ArrowRight':
                e.preventDefault();
                navegarPara(1);
                break;
                
            case 'ArrowUp':
            case 'ArrowLeft':
                e.preventDefault();
                navegarPara(-1);
                break;
                
            case 'Enter':
                e.preventDefault();
                clicarElementoAtual();
                break;
                
            case 'Escape':
                e.preventDefault();
                desativarNavegacao();
                break;
                
            case 'Tab':
                e.preventDefault();
                desativarNavegacao();
                break;
        }
    });

    document.addEventListener('mousedown', function() {
        if (navegacaoAtiva) {
            desativarNavegacao();
        }
    });

    document.addEventListener('touchstart', function() {
        if (navegacaoAtiva) {
            desativarNavegacao();
        }
    });

    // **INICIALIZAÇÃO IMEDIATA - SEM DELAY**
    if (navegacaoAtiva) {
        console.log('🔄 Retomando navegação anterior...');
        // Inicia IMEDIATAMENTE sem setTimeout
        elementos = encontrarElementosLinkaveis();
        
        if (elementos.length > 0) {
            criarEstiloDestaque();
            aplicarDestaque(elementos[0]);
            atualizarContador();
            console.log(`${elementos.length} elementos recarregados`);
        } else {
            console.log('Nenhum elemento encontrado ao recarregar');
            sessionStorage.setItem('navegacaoTecladoAtiva', 'false');
            navegacaoAtiva = false;
        }
    }

    console.log('Sistema carregado - Pressione TAB para iniciar navegação por teclado');
});