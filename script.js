const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// sounds
const jumpSound = new Audio('https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg');
const overSound = new Audio('https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg');

let score = 0,
    highScore = localStorage.getItem('ultimateHigh') || 0,
    speed = 6,
    gameOverFlag = false,
    obstacleTimer = 0,
    birdTimer = 0,
    coinTimer = 0;

const player = { x: 60, y: 270, vy: 0, gravity: 0.7, jump: -14, jumpsLeft: 2 };
const obstacles = [], birds = [], coins = [];

function drawPlayer() {
  ctx.font = '40px serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('🏃‍♂️', player.x - 20, player.y - 10);
}

function drawObstacle(o) {
  ctx.fillStyle = '#e74c3c';
  ctx.fillRect(o.x, o.y, o.w, o.h);
}

function drawBird(b) {
  ctx.fillStyle = '#8e44ad';
  ctx.beginPath();
  ctx.ellipse(b.x, b.y, 15, 10, 0, 0, 2 * Math.PI);
  ctx.fill();
}

function drawCoin(c) {
  ctx.fillStyle = '#f1c40f';
  ctx.beginPath();
  ctx.arc(c.x, c.y, 8, 0, 2 * Math.PI);
  ctx.fill();
}

function drawGround() {
  ctx.fillStyle = '#2ecc71';
  ctx.fillRect(0, 310, canvas.width, 10);
}

function collide(o) {
  return (player.x > o.x - 30 && player.x < o.x + o.w && player.y > o.y - 30);
}

function coinCollect(c) {
  const dx = Math.abs(player.x - c.x);
  const dy = Math.abs(player.y - c.y);
  return Math.hypot(dx, dy) < 30;
}

function reset() {
  gameOverFlag = false;
  score = 0;
  speed = 6;
  obstacles.length = birds.length = coins.length = 0;
  player.y = 270;
  player.vy = 0;
  player.jumpsLeft = 2;
  animate();
}

function showGameOver() {
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ecf0f1';
  ctx.font = 'bold 40px sans-serif';
  ctx.fillText('GAME OVER', 300, 160);
  ctx.font = '20px sans-serif';
  ctx.fillText(`Score: ${Math.floor(score)}`, 380, 200);
  ctx.fillText(`High Score: ${highScore}`, 360, 230);

  ctx.fillStyle = '#27ae60';
  ctx.fillRect(350, 250, 200, 40);
  ctx.fillStyle = '#fff';
  ctx.fillText('🔁 Replay', 395, 278);

  canvas.addEventListener('click', handleReplay, { once: true });
}

function handleReplay(e) {
  const { offsetX: x, offsetY: y } = e;
  if (x >= 350 && x <= 550 && y >= 250 && y <= 290) reset();
}

function animate() {
  if (gameOverFlag) return showGameOver();

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  player.vy += player.gravity;
  player.y += player.vy;
  if (player.y > 270) {
    player.y = 270;
    player.vy = 0;
    player.jumpsLeft = 2;
  }

  drawGround();
  drawPlayer();

  obstacleTimer++;
  birdTimer++;
  coinTimer++;
  if (obstacleTimer > 90) {
    obstacles.push({ x: canvas.width, y: 290 - 40, w: 30, h: 40 });
    obstacleTimer = 0;
  }
  if (birdTimer > 200) {
    birds.push({ x: canvas.width, y: 200, w: 30, h: 20 });
    birdTimer = 0;
  }
  if (coinTimer > 130) {
    coins.push({ x: canvas.width, y: 250, w: 16, h: 16 });
    coinTimer = 0;
  }

  // draw and move obstacles
  obstacles.forEach((o, i) => {
    o.x -= speed;
    drawObstacle(o);
    if (collide(o)) gameOver();
    if (o.x + o.w < 0) { obstacles.splice(i, 1); score += 5; }
  });

  birds.forEach((b, i) => {
    b.x -= speed + 0.5;
    drawBird(b);
    if (collide(b)) gameOver();
    if (b.x + b.w < 0) { birds.splice(i, 1); score += 7; }
  });

  coins.forEach((c, i) => {
    c.x -= speed;
    drawCoin(c);
    if (coinCollect(c)) { coins.splice(i, 1); score += 10; }
  });

  score += 0.08;
  speed += 0.0005 * score; // slower acceleration

  ctx.fillStyle = '#fff';
  ctx.font = '20px sans-serif';
  ctx.fillText(`Score: ${Math.floor(score)}`, 650, 30);
  ctx.fillText(`High: ${highScore}`, 650, 60);

  requestAnimationFrame(animate);
}

function jump() {
  if (player.jumpsLeft > 0) {
    player.vy = player.jump;
    player.jumpsLeft--;
    jumpSound.play();
  }
}
function gameOver() {
  gameOverFlag = true;
  highScore = Math.max(highScore, Math.floor(score));
  localStorage.setItem('ultimateHigh', highScore);
  overSound.play();
}

document.addEventListener('keydown', e => e.code === 'Space' && jump());
canvas.addEventListener('click', jump);

animate();
