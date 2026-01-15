window.currentInterval = null; 
window.currentAnimationFrame = null; 
window.gameActive = false;

const gameInstructions = {
    'snake': [
        { title: 'CONTROLES', list: [['SETAS', 'MOVER COBRA'], ['ESPAÇO', 'PAUSE']] },
        { title: 'OBJETIVO', list: [['COMER', '+ PONTOS'], ['PAREDE', 'GAME OVER']] }
    ],
    'breakout': [
        { title: 'CONTROLES', list: [['SETAS', 'MOVER PADDLE'], ['ENTER', 'LANÇAR BOLA']] },
        { title: 'POWER-UPS', list: [['VERDE', 'BARRA LARGA'], ['CIANO', 'MULTI-BOLA']] }
    ],
    'flappy': [
        { title: 'CONTROLES', list: [['ESPAÇO', 'PULAR / VOAR'], ['CLICK', 'PULAR']] },
        { title: 'DICA', list: [['CANOS', 'EVITAR'], ['ALTURA', 'MANTER']] }
    ],
    'tetris': [
        { title: 'CONTROLES', list: [['SETAS', 'MOVER/GIRAR'], ['BAIXO', 'QUEDA RÁPIDA']] },
        { title: 'DICA', list: [['LINHAS', 'PONTUAR'], ['TOPO', 'GAME OVER']] }
    ],
    'memory': [
        { title: 'CONTROLES', list: [['MOUSE', 'CLICAR CARTAS']] },
        { title: 'REGRAS', list: [['PARES', 'ENCONTRAR'], ['TEMPO', 'LIMITADO']] }
    ]
};

// --- FUNÇÃO DE REINÍCIO SUAVE (Mantém Tela Cheia) ---
function resetCurrentGame(gameType) {
    window.gameActive = false;
    
    // Limpa loops ativos
    if (window.currentInterval) clearInterval(window.currentInterval);
    if (window.currentAnimationFrame) cancelAnimationFrame(window.currentAnimationFrame);

    const oldCanvas = document.getElementById('mainCanvas');
    const domContainer = document.getElementById('dom-game-container');

    // Reseta o Canvas para limpar EventListeners de teclado/mouse
    const newCanvas = oldCanvas.cloneNode(true);
    oldCanvas.parentNode.replaceChild(newCanvas, oldCanvas);

    // Pequeno delay para garantir que o motor anterior parou
    setTimeout(() => {
        window.gameActive = true;
        launchGameLogic(gameType, newCanvas, domContainer);
    }, 50);
}

// --- FUNÇÃO DE CARGA INICIAL (Troca de Jogo) ---
function loadGame(gameType) {
    window.gameActive = false; 

    if (window.currentInterval) clearInterval(window.currentInterval);
    if (window.currentAnimationFrame) cancelAnimationFrame(window.currentAnimationFrame);
    
    const oldCanvas = document.getElementById('mainCanvas');
    const placeholder = document.getElementById('placeholder-text');
    const domContainer = document.getElementById('dom-game-container');

    if (placeholder) placeholder.style.display = "none";

    // Reseta o Canvas e UI
    const newCanvas = oldCanvas.cloneNode(true);
    oldCanvas.parentNode.replaceChild(newCanvas, oldCanvas);
    
    domContainer.innerHTML = "";
    domContainer.style.display = "none";
    newCanvas.style.display = "none";

    updateInstructions(gameType);
    loadStyle(gameType);
    
    setTimeout(() => {
        window.gameActive = true; 
        launchGameLogic(gameType, newCanvas, domContainer);
    }, 50);
}

// Auxiliar para decidir qual init chamar
function launchGameLogic(gameType, canvas, domContainer) {
    if (gameType === 'snake') {
        canvas.style.display = "block";
        canvas.width = 400; canvas.height = 400;
        initSnake(canvas);
    } else if (gameType === 'breakout') {
        canvas.style.display = "block";
        canvas.width = 480; canvas.height = 320;
        initBreakout(canvas);
    } else if (gameType === 'flappy') {
        canvas.style.display = "block";
        canvas.width = 320; canvas.height = 480;
        initFlappy(canvas);
    } else if (gameType === 'tetris') {
        canvas.style.display = "block";
        canvas.width = 300; canvas.height = 600;
        initTetris(canvas);
    } else if (gameType === 'memory') {
        domContainer.style.display = "grid";
        initMemory(domContainer);
    }
}

function updateInstructions(gameType) {
    const container = document.getElementById('instructions-container');
    if (!container) return;
    container.innerHTML = ''; 

    if (gameInstructions[gameType]) {
        gameInstructions[gameType].forEach(info => {
            const card = document.createElement('div');
            card.className = 'instr-card';
            let listItems = info.list.map(item => `<li><span>${item[0]}</span> ${item[1]}</li>`).join('');
            card.innerHTML = `<h3>${info.title}</h3><ul>${listItems}</ul>`;
            container.appendChild(card);
        });
    }
}

function loadStyle(gameName) {
    const oldLink = document.getElementById('dynamic-game-style');
    if (oldLink) oldLink.remove();
    const link = document.createElement('link');
    link.id = 'dynamic-game-style';
    link.rel = 'stylesheet';
    link.href = `games/${gameName}.css`;
    document.head.appendChild(link);
}

// Persistência de Recordes
function saveHighScore(gameName, score) {
    const key = `highScore_${gameName}`;
    const savedScore = localStorage.getItem(key) || 0;
    if (score > savedScore) {
        localStorage.setItem(key, score);
        return true;
    }
    return false;
}

function getHighScore(gameName) {
    return localStorage.getItem(`highScore_${gameName}`) || 0;
}

// Tela Cheia
function toggleFullScreen() {
    const elem = document.getElementById("game-viewport");
    if (!document.fullscreenElement) {
        elem.requestFullscreen?.() || elem.webkitRequestFullscreen?.() || elem.msRequestFullscreen?.();
    } else {
        document.exitFullscreen?.();
    }
}

// Bloqueio de Scroll
window.addEventListener("keydown", function(e) {
    const keysToBlock = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "];
    if (keysToBlock.includes(e.key)) {
        e.preventDefault();
    }
}, false);