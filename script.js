// Canvas setup
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Sound effects
const jumpSound = new Audio('https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg');
const overSound = new Audio('https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg');

// Player and game variables
let score = 0, highScore = localStorage.getItem('ultimateHigh') || 0;
let speed = 6, lives = 1, gameOverFlag = false;
const player = { x: 60, y: 270, r: 25, vy:0, gravity:0.7, jump:-14, jumpsLeft:2 };
const obstacles = [], birds = [], coins = [];
let obstacleTimer = 0, birdTimer = 0, coinTimer = 0;

// Draw functions
function drawPlayer(){
  ctx.fillStyle = '#f1c40f';
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r, 0, 2*Math.PI);
  ctx.fill();
  ctx.fillStyle = '#2c3e50';
  ctx.fillRect(player.x-15, player.y-player.r-10, 30, 10);
}
function drawObstacle(o) { ctx.fillStyle='#e74c3c'; ctx.fillRect(o.x,o.y,o.w,o.h); }
function drawBird(b){ ctx.fillStyle='#8e44ad'; ctx.beginPath(); ctx.ellipse(b.x,b.y,15,10,0,0,2*Math.PI); ctx.fill(); }
function drawCoin(c){ ctx.fillStyle='#f39c12'; ctx.beginPath(); ctx.arc(c.x,c.y,8,0,2*Math.PI); ctx.fill(); }
function drawGround(){ ctx.fillStyle='#2ecc71'; ctx.fillRect(0,310,canvas.width,10); }

// Collision detectors
function collide(o){
  const dx = Math.abs(player.x-(o.x+o.w/2));
  const dy = Math.abs(player.y-(o.y+o.h/2));
  return (dx < player.r + o.w/2 && dy < player.r + o.h/2);
}
function coinCollect(c){
  const dx = Math.abs(player.x - c.x);
  const dy = Math.abs(player.y - c.y);
  return (Math.hypot(dx,dy) < player.r + 8);
}

// Reset game
function resetGame(){
  gameOverFlag=false; score=0; speed=6;
  obstacles.length = birds.length = coins.length = 0;
  player.y = 270; player.vy = 0; player.jumpsLeft = 2; lives = 1;
  if(score>highScore){ localStorage.setItem('ultimateHigh', Math.floor(score)); }
  update();
}

// Game Over canvas
function showGameOver(){
  ctx.fillStyle='rgba(0,0,0,0.7)';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='#ecf0f1';
  ctx.font="bold 40px sans-serif";
  ctx.fillText("GAME OVER",310,160);
  ctx.font="20px sans-serif";
  ctx.fillText(`Score: ${Math.floor(score)}`,380,200);
  ctx.fillText(`High Score: ${highScore}`,360,230);
}

// Update loop
function update(){
  if(gameOverFlag){ showGameOver(); overSound.play(); return; }
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Player physics and drawing
  player.vy+=player.gravity;
  player.y+=player.vy;
  if(player.y>270){ player.y=270; player.vy=0; player.jumpsLeft=2; }
  drawGround(); drawPlayer();

  // Spawn logic
  if(++obstacleTimer>90){ obstacles.push({ x:canvas.width, y:290-40, w:30, h:40 }); obstacleTimer=0;}
  if(++birdTimer>200){ birds.push({ x:canvas.width, y:200, w:30, h:20 }); birdTimer=0;}
  if(++coinTimer>130){ coins.push({ x:canvas.width, y:250, w:16, h:16 }); coinTimer=0;}

  // Move and draw obstacles
  obstacles.forEach((o,i)=>{ o.x-=speed; drawObstacle(o);
    if(collide(o)){ gameOverFlag=true; highScore=Math.max(highScore,Math.floor(score)); }
    if(o.x+o.w<0){ obstacles.splice(i,1); score+=5; }
  });
  birds.forEach((b,i)=>{ b.x-=speed+1; drawBird(b);
    if(collide(b)){ gameOverFlag=true; highScore=Math.max(highScore,Math.floor(score)); }
    if(b.x+b.w<0){ birds.splice(i,1); score+=7; }
  });
  coins.forEach((c,i)=>{ c.x-=speed; drawCoin(c);
    if(coinCollect(c)){ coins.splice(i,1); score+=10; }
  });

  // Score & speed
  score+=0.1;
  speed += 0.0008 * score;
  drawCoinsAndScore();

  requestAnimationFrame(update);
}

// Score & coins display
function drawCoinsAndScore(){
  ctx.fillStyle='#ffffff'; ctx.font="20px sans-serif";
  ctx.fillText(`Score: ${Math.floor(score)}`,650,30);
  ctx.fillText(`High: ${highScore}`,650,60);
}

// Jump handler
function jump(){
  if(player.jumpsLeft>0){
    player.vy=player.jump; player.jumpsLeft--; jumpSound.play();
  }
}
document.addEventListener('keydown',e=>{ if(e.code==='Space') jump(); });
canvas.addEventListener('click', jump);

// Start game
update();
