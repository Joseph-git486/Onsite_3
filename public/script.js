const socket = io();
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d"); 
const rect = canvas.getBoundingClientRect(); 
const walls = [{x:0,y:0, width:20, height: 600, color: 'grey'}, {x:0, y:0, width:1000, height: 20, color: 'grey'}, 
    {x:0, y:580, width: 1000, height: 20, color: 'grey'},{x:980, y:0, width: 20, height: 800, color: 'grey' }];
let lastPlayers = {};
let lastArrows = [];

window.addEventListener('mousedown', e=>{
    coords.push({ xi: e.clientX - rect.left, yi:e.clientY - rect.top});
})

window.addEventListener('mouseup', e=>{
    socket.emit('shoot',{ xf: e.clientX - rect.left, yf:e.clientY - rect.top})
})

function renderPlayer(players){
  for(const player of Object.values(players)){
      ctx.fillStyle = player.color;
      ctx.fillRect(player.coords.x-player.size/2, player.coords.y-player.size/2, player.size, player.size);
  }
}
function renderWalls(){
    for(const wall of walls){
    ctx.fillStyle = wall.color;
    ctx.fillRect(wall.x,wall.y, wall.width, wall.height);
    }
}

function renderArrow(arrows){
  for(const arrow of arrows){
    if(arrow.landed){
      ctx.fillStyle = 'red';
      ctx.fillRect(arrow.pos.x-arrow.size/2, arrow.pos.y-arrow.size/2, arrow.size, arrow.size);
    }
    ctx.fillStyle = 'blue';
    ctx.fillRect(arrow.pos.x-arrow.size/2, arrow.pos.y-arrow.size/2, arrow.size, arrow.size);
  }
}

function render(players, arrows){
  renderPlayer(players);
  renderWalls();
  renderArrow(arrows);
}
socket.on('render',(players, arrows)=>{
  lastPlayers = players;      
  lastArrows = arrows;
})

function gameloop(currentTime){
  render(lastPlayers,lastArrows);
  requestAnimationFrame(gameloop);
}
requestAnimationFrame(gameloop);