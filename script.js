const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const jumpSound = new Audio('https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg');
const overSound = new Audio('https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg');

let score = 0, highScore = localStorage.getItem('ultimateHigh') || 0;
let speed = 5, gameOverFlag = false;
let obstacleTimer = 0, coinTimer = 0;
let stars = 0, jumps = 0;

const player = {
  x: 80,
  y: 310,
  vy: 0,
  gravity: 0.7,
  jump: -15,
  jumpsLeft: 2,
  legStep: 0
};

const obstacles = [], coins = [];

function drawPlayer() {
  const size = 60;
  const legOffset = player.legStep % 20 < 10 ? 10 : -10;
  
  // Body
  ctx.fillStyle = '#00b894';
  ctx.beginPath();
  ctx.arc(player.x, player.y - size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();

  // Face details (eyes)
  ctx.fillStyle = '#2d3436';
  ctx.beginPath();
  ctx.arc(player.x + size * 0.15, player.y - size * 0.6, 6, 0, Math.PI * 2);
  ctx.arc(player.x + size * 0.35, player.y - size * 0.6, 6, 0, Math.PI * 2);
  ctx.fill();

  // Legs
  ctx.strokeStyle = '#2d3436';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(player.x - size * 0.2, player.y);
  ctx.lineTo(player.x - size * 0.2 + legOffset, player.y + size * 0.3);
  ctx.moveTo(player.x + size * 0.2, player.y);
  ctx.lineTo(player.x + size * 0.2 - legOffset, player.y + size * 0.3);
  ctx.stroke();
}

function drawObstacle(o) {
  ctx.fillStyle = '#d63031';
  ctx.fillRect(o.x, o.y, o.w, o.h);
}

function drawCoin(c) {
  ctx.fillStyle = '#ffeaa7';
  ctx.beginPath();
  ctx.arc(c.x, c.y, 12, 0, 2 * Math.PI);
  ctx.fill();
}

function drawGround() {
  ctx.fillStyle = '#0984e3';
  ctx.fillRect(0, 350, canvas.width, 20);
}

function drawHUD() {
  ctx.fillStyle = '#2d3436';
  ctx.font = '20px Arial';
  ctx.fillText(`Stars: ${stars}`, 20, 30);
  ctx.fillText(`Jumps: ${jumps}`, 20, 60);
  ctx.fillText(`Score: ${Math.floor(score)}`, 800, 30);
  ctx.fillText(`High: ${highScore}`, 800, 60);
}

function collide(o) {
  const dx = Math.abs(player.x - (o.x + o.w / 2));
  const dy = Math.abs(player.y - (o.y + o.h / 2));
  return dx < 30 + o.w / 2 && dy < 30 + o.h / 2;
}

function coinCollect(c) {
  const dx = player.x - c.x;
  const dy = player.y - c.y;
  return Math.hypot(dx, dy) < 30 + 12;
}

function reset() {
  gameOverFlag = false;
  score = 0;
  speed = 5;
  obstacles.length = coins.length = 0;
  player.y = 310;
  player.vy = 0;
  player.jumpsLeft = 2;
  player.legStep = 0;
  stars = jumps = 0;
  animate();
}

function showGameOver() {
  ctx.fillStyle = 'rgba(0,0,0,0.8)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#dfe6e9';
  ctx.font = 'bold 48px Arial';
  ctx.fillText('GAME OVER', canvas.width / 2 - 150, canvas.height / 2 - 40);
  ctx.font = '24px Arial';
  ctx.fillText(`Score: ${Math.floor(score)}`, canvas.width / 2 - 70, canvas.height / 2);
  ctx.fillText(`High Score: ${highScore}`, canvas.width / 2 - 90, canvas.height / 2 + 40);

  // Replay button
  const btnW = 200, btnH = 50;
  const btnX = canvas.width / 2 - btnW / 2;
  const btnY = canvas.height / 2 + 80;
  ctx.fillStyle = '#00b894';
  ctx.fillRect(btnX, btnY, btnW, btnH);
  ctx.fillStyle = '#ffffff';
  ctx.font = '28px Arial';
  ctx.fillText('REPLAY', canvas.width / 2 - 45, btnY + 34);

  canvas.addEventListener('click', handleReplay, { once: true });
}

function handleReplay(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const btnX = canvas.width / 2 - 100;
  const btnY = canvas.height / 2 + 80;
  if (x >= btnX && x <= btnX + 200 && y >= btnY && y <= btnY + 50) reset();
}

function animate() {
  if (gameOverFlag) return showGameOver();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  player.vy += player.gravity;
  player.y += player.vy;
  if (player.y > 310) {
    player.y = 310;
    player.vy = 0;
    player.jumpsLeft = 2;
  }

  player.legStep++;

  drawGround();
  drawPlayer();

  obstacleTimer++;
  coinTimer++;
  
  if (obstacleTimer > 90) {
    const h = Math.random() * 100 + 40;
    const w = Math.random() * 80 + 40;
    obstacles.push({ x: canvas.width, y: 370 - h, w, h });
    obstacleTimer = 0;
  }
  if (coinTimer > 140) {
    coins.push({ x: canvas.width, y: Math.random() * 150 + 180 });
    coinTimer = 0;
  }

  obstacles.forEach((o, i) => {
    o.x -= speed;
    drawObstacle(o);
    if (collide(o)) gameOver();
    if (o.x + o.w < 0) { obstacles.splice(i, 1); score += 5; }
  });

  coins.forEach((c, i) => {
    c.x -= speed;
    drawCoin(c);
    if (coinCollect(c)) { coins.splice(i, 1); stars++; score += 10; }
  });

  score += 0.1;
  speed += 0.0003 * score;

  drawHUD();
  requestAnimationFrame(animate);
}

function jump() {
  if (player.jumpsLeft > 0) {
    player.vy = player.jump;
    player.jumpsLeft--;
    jumps++;
    jumpSound.play();
  }
}

function gameOver() {
  gameOverFlag = true;
  highScore = Math.max(highScore, Math.floor(score));
  localStorage.setItem('ultimateHigh', highScore);
  overSound.play();
}

document.addEventListener('keydown', e => { if (e.code === 'Space') jump(); });
canvas.addEventListener('click', jump);

animate();
