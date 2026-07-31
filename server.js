const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const floor = 580;
let arrows = [];
const players = {};

class Arrow {
    constructor(player, coords,floor){    // coords = [{xi,yi},[xf,yf]]
        this.uMag = (coords.length == 2)? Math.sqrt( (coords[0].xi - coords[1].xf)**2 + (coords[0].yi - coords[1].yf)**2):1;
        this.landed = false;
        this.hit = false;
        this.player = player;
        this.sin = (coords[0].yi - coords[1].yf)/ Math.sqrt( (coords[0].xi-coords[1].xf)**2 + (coords[0].yi-coords[1].yf)**2 );
        this.cos = (coords[0].xi - coords[1].xf)/ Math.sqrt( (coords[0].xi-coords[1].xf)**2 + (coords[0].yi-coords[1].yf)**2 )
        this.size = 40;
        this.score = 0;

        this.pos = {x: player.coords.x, y: player.coords.y};
        this.vel = {vx: this.uMag*this.cos, vy: this.uMag*this.sin };
        this.acc = {ax: 0,ay: +10};   // downward direction --> y increases
    }
    
    update(dt){
        this.vel.vy += this.acc.ay*dt;
        this.pos.x += this.vel.vx*dt;
        this.pos.y += this.vel.vy*dt;
    }

    hits(player) {
        if( this.pos.y < floor){
            this.landed = true;
        }
        if(
            (this.pos.x > player.coords.x - (player.size/2)) && (this.pos.x < player.coords.x + (player.size/2))
            && (this.pos.y > player.coords.y - (player.size/2)) && (this.pos.y < player.coords.y + (player.size/2))
        ){
            this.hit = true;
            player.health -= 25;
            this.score += 10;
        }
    }
}

io.on('connection', (socket)=>{
    const player = {health:100,coords:{},size:60,color:'green'};
    player.coords = {x:50, y:800};
    players[socket.id] = player;

    socket.on('shoot', (coords)=>{
        const arrow = new Arrow(player,coords,floor);
        arrows.push(arrow);
    })
})

let lastTime = Date.now();
let dt = 0;
setInterval(()=>{
    dt = (Date.now() - lastTime)/1000;
    lastTime = Date.now();
    update(dt);
    io.emit('render',players, arrows);        // all clients need this to see that player render
},1000/30);

function update(dt){
    arrows = arrows.filter(arrow => (!arrow.hit && !arrow.landed));
    for(const arrow of arrows){
        for(const player of Object.values(players)){
            arrow.hits(player);
            if(player.health <= 0){
                delete players.player;
            }
        }
        arrow.update(dt);
    }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`listening on ${PORT}`));