function initTetris(canvas) {
    const ctx = canvas.getContext('2d');
    window.gameActive = true;

    const ROWS = 20;
    const COLS = 10;
    const BLOCK_SIZE = 24; 

    canvas.width = (COLS + 6) * BLOCK_SIZE;
    canvas.height = ROWS * BLOCK_SIZE;

    let dropCounter = 0;
    let dropInterval = 1000;
    let lastTime = 0;
    let isGameOverHandled = false; 
    

    const PIECES = [
        [ [1, 1, 1, 1] ], [ [1, 1], [1, 1] ], [ [0, 1, 0], [1, 1, 1] ],
        [ [1, 0, 0], [1, 1, 1] ], [ [0, 0, 1], [1, 1, 1] ],
        [ [0, 1, 1], [1, 1, 0] ], [ [1, 1, 0], [0, 1, 1] ]
    ];

    const COLORS = [null, '#00f0f0', '#f0f000', '#a000f0', '#f0a000', '#0000f0', '#00f000', '#f00000'];

    let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    let score = 0;
    let piece = getRandomPiece();
    let nextPiece = getRandomPiece();
    let particles = [];

    function getRandomPiece() {
        const id = Math.floor(Math.random() * (PIECES.length)) + 1;
        const shape = PIECES[id - 1];
        return { x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2), y: 0, shape, id };
    }

    function collide(board, piece) {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x] !== 0 &&
                    (board[y + piece.y] === undefined || board[y + piece.y][x + piece.x] === undefined || board[y + piece.y][x + piece.x] !== 0)) {
                    return true;
                }
            }
        }
        return false;
    }

    function merge(board, piece) {
        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) board[y + piece.y][x + piece.x] = piece.id;
            });
        });
    }

    function clearLines() {
        let linesCleared = 0;
        for (let y = ROWS - 1; y >= 0; y--) {
            if (board[y].every(value => value !== 0)) {
                // GERAR PARTÍCULAS AQUI!
                for (let x = 0; x < COLS; x++) {
                    const colorId = board[y][x];
                    if (colorId !== 0) {
                        // Criamos 5 pequenas partículas para cada bloco que sumiu
                        for (let i = 0; i < 5; i++) {
                            particles.push(createParticle(x * BLOCK_SIZE, y * BLOCK_SIZE, COLORS[colorId]));
                        }
                    }
                }
                
                board.splice(y, 1);
                board.unshift(Array(COLS).fill(0));
                linesCleared++;
                y++; // Rechecar a mesma linha, caso múltiplas sejam limpas
            }
        }
        if (linesCleared > 0) {
            score += linesCleared * 10;
            dropInterval = Math.max(100, 1000 - (score * 2)); 
        }
    }

    // Criar Partículas
    function createParticle(x, y, color) {
        return {
            x: x + BLOCK_SIZE / 2, // Centro do bloco
            y: y + BLOCK_SIZE / 2,
            color: color,
            size: Math.random() * 4 + 2, // Tamanho aleatório de 2 a 6
            speedX: (Math.random() - 0.5) * 8, // Velocidade horizontal aleatória
            speedY: (Math.random() - 0.5) * 8, // Velocidade vertical aleatória
            alpha: 1, // Começa totalmente visível
            gravity: 0.2, // Puxa para baixo gradualmente
            life: 60 // Dura por 60 frames
        };
    }

    function rotate(matrix) {
        return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
    }

    function drop() {
        if (!window.gameActive || isGameOverHandled) return;
        piece.y++;
        if (collide(board, piece)) {
            piece.y--;
            merge(board, piece);
            clearLines();
            piece = nextPiece;
            nextPiece = getRandomPiece();
            if (collide(board, piece)) {
                gameOver();
            }
        }
    }

    function gameOver() {
        if (isGameOverHandled) return;
        isGameOverHandled = true;
        window.gameActive = false; 

        saveHighScore('tetris', score); 

        // Visual do Game Over
        ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "#FF3131";
        ctx.font = "bold 28px Arial";
        ctx.textAlign = "center";
        ctx.fillText("FIM DE JOGO", canvas.width / 2, canvas.height / 2 - 20);
        
        ctx.fillStyle = "white";
        ctx.font = "18px Arial";
        ctx.fillText(`Pontos: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
        
        ctx.fillStyle = "#facc15";
        ctx.fillText(`Melhor: ${getHighScore('tetris')}`, canvas.width / 2, canvas.height / 2 + 50);

        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.font = "14px Arial";
        ctx.fillText("Reiniciando...", canvas.width / 2, canvas.height / 2 + 90);

        setTimeout(() => {
            window.removeEventListener("keydown", handleKeyDown);
            resetCurrentGame('tetris'); 
        }, 2000); 
    }

    function drawBlock(x, y, color, isGhost = false) {
        ctx.save(); // Salva o estado do contexto
        
        if (isGhost) {
            // Estilo da Sombra: Transparente e apenas contorno
            ctx.globalAlpha = 0.3; 
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.strokeRect(x * BLOCK_SIZE + 2, y * BLOCK_SIZE + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
        } else {
            // Estilo do Bloco Real: Sólido com brilho e sombra (Bevel)
            ctx.fillStyle = color;
            ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);

            // Brilho superior (deixa o bloco com aspecto 3D)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, 3); // Topo
            ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, 3, BLOCK_SIZE); // Esquerda

            // Sombra inferior
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(x * BLOCK_SIZE, (y + 1) * BLOCK_SIZE - 3, BLOCK_SIZE, 3); // Base
            ctx.fillRect((x + 1) * BLOCK_SIZE - 3, y * BLOCK_SIZE, 3, BLOCK_SIZE); // Direita
            
            // Contorno fino para separar os blocos
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
        
        ctx.restore(); // Restaura o estado original (reseta o globalAlpha e cores)
    }

    function gameLoop(time = 0) {
        if (!window.gameActive || isGameOverHandled) return; 

        const deltaTime = time - lastTime;
        lastTime = time;
        dropCounter += deltaTime;

        if (dropCounter > dropInterval) {
            drop();
            dropCounter = 0;
        }

        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, COLS * BLOCK_SIZE, ROWS * BLOCK_SIZE);

        board.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) drawBlock(x, y, COLORS[value]);
            });
        });

        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];

            p.x += p.speedX;
            p.y += p.speedY;
            p.speedY += p.gravity; // Aplica gravidade
            p.alpha -= 1 / p.life; // Diminui a transparência

            // Desenha a partícula
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
            ctx.restore();

            // Remove a partícula se ela não for mais visível
            if (p.alpha <= 0 || p.life <= 0) {
                particles.splice(i, 1);
            }
        }

        let ghostY = piece.y;
        // Simula a queda da peça até colidir
        while (!collide(board, { ...piece, y: ghostY + 1 })) {
            ghostY++;
        }

        // Desenha a sombra da peça
        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    drawBlock(piece.x + x, ghostY + y, COLORS[piece.id], true);
                }
            });
        });

        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) drawBlock(piece.x + x, piece.y + y, COLORS[piece.id]);
            });
        });

        // Painel Lateral
        ctx.textAlign = "left";
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 13px Arial';
        ctx.fillText("PRÓXIMO:", (COLS + 0.5) * BLOCK_SIZE, 40);
        
        nextPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) drawBlock(COLS + 1 + x, 3 + y, COLORS[nextPiece.id]);
            });
        });

        ctx.fillStyle = '#facc15';
        ctx.fillText("PONTOS:", (COLS + 0.5) * BLOCK_SIZE, 150);
        ctx.font = 'bold 20px Arial';
        ctx.fillText(score, (COLS + 0.5) * BLOCK_SIZE, 180);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 13px Arial';
        ctx.fillText("RECORDE:", (COLS + 0.5) * BLOCK_SIZE, 230);
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(getHighScore('tetris'), (COLS + 0.5) * BLOCK_SIZE, 260);

        currentAnimationFrame = requestAnimationFrame(gameLoop);
    }

    function handleKeyDown(e) {
        if (!window.gameActive || isGameOverHandled) return;
        
        if (e.key === 'ArrowLeft') {
            piece.x--;
            if (collide(board, piece)) piece.x++;
        } else if (e.key === 'ArrowRight') {
            piece.x++;
            if (collide(board, piece)) piece.x--;
        } else if (e.key === 'ArrowDown') {
            drop();
            dropCounter = 0;
        } else if (e.key === 'ArrowUp') {
            const prevShape = piece.shape;
            piece.shape = rotate(piece.shape);
            if (collide(board, piece)) piece.shape = prevShape;
        }
    }

    window.addEventListener("keydown", handleKeyDown);
    gameLoop();
}