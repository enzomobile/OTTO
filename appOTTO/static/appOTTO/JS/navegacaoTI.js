document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Navegação por teclado - Elementos linkáveis');
    
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
    
    const elementos = encontrarElementosLinkaveis();
    console.log(`✅ ${elementos.length} elementos linkáveis encontrados:`);
    elementos.forEach((el, i) => {
        console.log(`${i + 1}. ${el.tagName} - "${el.textContent.trim()}"`);
    });
    
    if (elementos.length === 0) {
        console.log('Nenhum elemento linkável encontrado!');
        return;
    }
    
    let elementoAtual = 0;
    
    const style = document.createElement('style');
    style.textContent = `
        .destaque-teclado {
            outline: 3px solid #FFFFFF !important;
            outline-offset: 2px !important;
            box-shadow: 0 0 8px rgba(255, 255, 255, 0.6) !important;
            border-radius: 3px !important;
            z-index: 9999 !important;
            position: relative !important;
        }
    `;
    document.head.appendChild(style);

    aplicarDestaque(elementos[0]);

    document.addEventListener('keydown', function(e) {
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
                removerDestaqueAtual();
                break;
        }
    });
    
    function navegarPara(direcao) {
        removerDestaqueAtual();
        
        elementoAtual += direcao;
        if (elementoAtual < 0) elementoAtual = elementos.length - 1;
        if (elementoAtual >= elementos.length) elementoAtual = 0;
        
        aplicarDestaque(elementos[elementoAtual]);
        
        console.log(`${elementoAtual + 1}/${elementos.length}: ${elementos[elementoAtual].textContent.trim()}`);
    }
    
    function aplicarDestaque(elemento) {
        elemento.classList.add('destaque-teclado');
        
        // Rolagem suave se necessário
        const rect = elemento.getBoundingClientRect();
        if (rect.top < 50 || rect.bottom > window.innerHeight - 50) {
            elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    function removerDestaqueAtual() {
        elementos[elementoAtual].classList.remove('destaque-teclado');
    }
    
    function clicarElementoAtual() {
        const elemento = elementos[elementoAtual];
        console.log('Clicando:', elemento);
        
        // Feedback visual
        elemento.style.transform = 'scale(0.95)';
        setTimeout(() => {
            elemento.style.transform = '';
        }, 200);
        
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
        console.log('📋 Executando ação do menu:', texto);
        
        if (texto.includes('home') || texto.includes('início')) {
            window.location.href = '/';
        } else if (texto.includes('perfil')) {
            alert('Página do Perfil em desenvolvimento');
        } else if (texto.includes('fases')) {
            window.location.href = '/fases/';
        } else if (texto.includes('config')) {
            window.location.href = '/config/';
        } else {
            itemMenu.click();
        }
    }
    
    console.log(' Navegação ativa! Use ←→↑↓ para navegar, ENTER para clicar');
});