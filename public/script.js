const socket = io();

class Player{
    constructor(color){
        this.health = 100;
        this.coords = {};
        this.size = 60;
        this.color = color;
    }

    render(){
        ctx.fillStyle = this.color;
        ctx.fillRect(this.coords.x-this.size/2, this.coords.y-this.size/2, this.size, this.size);
    }
}
const player1 = new Player('green');

socket.on('spawn',(spawnCoords)=>{
    player1.coords = spawnCoords;
})
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d"); 
const rect = canvas.getBoundingClientRect(); 

const coords = [];
window.addEventListener('mousedown', e=>{
    coords.push({ xi: e.clientX - rect.left, yi:e.clientY - rect.top});
})

window.addEventListener('mouseup', e=>{
    coords.push({ xf: e.clientX - rect.left, yf:e.clientY - rect.top});
    socket.emit('shoot',coords)
})

player1.render();

function renderPlayer(player){
    ctx.fillStyle = player.color;
    ctx.fillRect(player.coords.x-player.size/2, player.coords.y-player.size/2, player.size, player.size);
}
function renderWalls(){
    for(const wall of walls){
    ctx.fillStyle = wall.color;
    ctx.fillRect(wall.x,wall.y, wall.width, wall.height);
    }
}

const walls = [{x:0,y:0, width:20, height: 600, color: 'grey'}, {x:0, y:0, width:1000, height: 20, color: 'grey'}, 
    {x:0, y:580, width: 1000, height: 20, color: 'grey'},{x:980, y:0, width: 20, height: 800, color: 'grey' }];


renderWalls();
//renderPlayer(player1);