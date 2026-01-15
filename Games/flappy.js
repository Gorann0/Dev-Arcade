function initFlappy(canvas) {
    const ctx = canvas.getContext('2d');
    window.gameActive = true; 

    const worlds = [
        { bg: "#70c5ce", pipe: "#22c55e", bird: "#facc15", glow: "#22c55e" }, // Lvl 0
        { bg: "#0f172a", pipe: "#00f0f0", bird: "#ff00ff", glow: "#00f0f0" }, // Lvl 1
        { bg: "#2e1065", pipe: "#a000f0", bird: "#00ff00", glow: "#a000f0" }, // Lvl 2
        { bg: "#1e293b", pipe: "#38bdf8", bird: "#fffff", glow: "#38bdf8" }, // Lvl 3
        { bg: "#7f1d1d", pipe: "#ef4444", bird: "#fca5a5", glow: "#ef4444" }, // Lvl 4
        { bg: "#064e3b", pipe: "#34d399", bird: "#fef08a", glow: "#34d399" }  // Lvl 5 (Olho Preto)
    ];

    let birdY, birdX, velocity, score, pipes, frameCount;
    let gravity = 0.25;
    let jump = -4.5;
    let pipeWidth = 52;
    let isGameOver = false;
    let gameStarted = false;

    function resetVariables() {
        birdY = 150; birdX = 50; velocity = 0; score = 0;
        pipes = []; frameCount = 0; isGameOver = false; gameStarted = false;
    }

    function createPipe() {
        let currentLevel = Math.floor(score / 15); 
        let dynamicGap = Math.max(130 - (currentLevel * 10), 90);
        let pipeTopHeight = Math.random() * (canvas.height / 2.5) + 50;
        pipes.push({ x: canvas.width, top: pipeTopHeight, bottom: canvas.height - pipeTopHeight - dynamicGap, passed: false });
    }

    function update() {
        if (!gameStarted || isGameOver) return;
        let currentLevel = Math.floor(score / 15);
        let speed = 2.5 + (currentLevel * 0.3);
        let spawnRate = Math.max(85 - (currentLevel * 5), 55);

        velocity += gravity;
        birdY += velocity;
        pipes.forEach(pipe => { pipe.x -= speed; });

        pipes.forEach(pipe => {
            if (!pipe.passed && birdX > pipe.x + pipeWidth) {
                score++;
                pipe.passed = true;
            }
        });

        if (pipes.length > 0 && pipes[0].x < -pipeWidth) pipes.shift();
        if (frameCount % spawnRate === 0) createPipe();
        if (birdY + 20 > canvas.height || birdY < 0) triggerGameOver();

        const birdPadding = 4; 
        pipes.forEach(pipe => {
            if (birdX + 20 - birdPadding > pipe.x && birdX + birdPadding < pipe.x + pipeWidth) {
                if (birdY + birdPadding < pipe.top || birdY + 20 - birdPadding > canvas.height - pipe.bottom) {
                    triggerGameOver();
                }
            }
        });
        frameCount++;
    }

    function triggerGameOver() {
        if (isGameOver) return; 
        isGameOver = true;
        
        // Salva o recorde usando a função do hub.js
        saveHighScore('flappy', score);

        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "bold 28px Arial";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 40);
        
        ctx.font = "bold 20px Arial";
        ctx.fillText(`SCORE: ${score}`, canvas.width / 2, canvas.height / 2);
        
        ctx.fillStyle = "#facc15";
        ctx.fillText(`BEST: ${getHighScore('flappy')}`, canvas.width / 2, canvas.height / 2 + 35);

        setTimeout(() => { 
            if (document.getElementById('mainCanvas')) resetCurrentGame('flappy'); 
        }, 1300);
    }

    function gameLoop() {
        if (!window.gameActive) return; 
        update();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let currentLevel = Math.floor(score / 15);
        let themeIdx = Math.min(currentLevel, worlds.length - 1);
        let theme = worlds[themeIdx];

        ctx.fillStyle = theme.bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Canos
        ctx.shadowBlur = 15; ctx.shadowColor = theme.glow;
        ctx.fillStyle = theme.pipe;
        pipes.forEach(pipe => {
            ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
            ctx.fillRect(pipe.x, canvas.height - pipe.bottom, pipeWidth, pipe.bottom);
            ctx.strokeStyle = "rgba(255,255,255,0.5)";
            ctx.lineWidth = 2;
            ctx.strokeRect(pipe.x, 0, pipeWidth, pipe.top);
            ctx.strokeRect(pipe.x, canvas.height - pipe.bottom, pipeWidth, pipe.bottom);
        });

        // Pássaro
        ctx.shadowBlur = 10; ctx.shadowColor = theme.bird;
        ctx.fillStyle = theme.bird;
        ctx.fillRect(birdX, birdY, 22, 22);
        
        // Olho do Pássaro (Preto se score >= 75)
        ctx.shadowBlur = 0;
        if (currentLevel === 3 || score >= 75) {
            ctx.fillStyle = "black";
        } else {
            ctx.fillStyle = "white";
        }
        
        ctx.fillRect(birdX + 14, birdY + 4, 5, 5);

        // UI - Score e HighScore
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "bold 35px Arial";
        ctx.fillText(score, canvas.width / 2, 60);
        
        // Exibe o recorde no topo (menor)
        ctx.font = "bold 14px Arial";
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fillText(`BEST: ${getHighScore('flappy')}`, canvas.width / 2, 85);

        if (!gameStarted && !isGameOver) {
            ctx.font = "bold 16px Arial";
            ctx.fillStyle = "white";
            ctx.fillText("Pressione para Iniciar", canvas.width / 2, canvas.height / 2 + 5);
        }
        currentAnimationFrame = requestAnimationFrame(gameLoop);
    }

    const handleInput = () => { if (window.gameActive && !isGameOver) gameStarted = true; velocity = jump; };
    window.addEventListener("keydown", (e) => { if (["Enter", " ", "ArrowUp"].includes(e.key)) handleInput(); });
    canvas.addEventListener("mousedown", handleInput);

    resetVariables();
    gameLoop();
}