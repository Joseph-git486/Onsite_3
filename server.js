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
        this.uMag = (coords.length == 2)? ( (coords[0].x - coords[1].x)**2 + (coords[0].y - coords[1].y)**2):1;
        this.landed = false;
        this.hit = false;
        this.player = player;
        this.sin = (coords[0].yi - coords[1].yf)/ Math.sqrt( (coords[0].xi-coords[1].xf)**2 + (coords[0].yi-coords[1].yf)**2 );
        this.cos = (coords[0].xi - coords[1].xf)/ Math.sqrt( (coords[0].xi-coords[1].xf)**2 + (coords[0].yi-coords[1].yf)**2 )
        this.size = 40;

        this.pos = {x: player.x, y: player.y};
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
            (this.pos.x > player.pos.x - (player.size/2)) && (this.pos.x < player.pos.x + (player.size/2))
            && (this.pos.y > player.pos.y - (player.size/2)) && (this.pos.y < player.pos.y + (player.size/2))
        ){
            return true;
        }
        return false;
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
    let lastTime = Date.now();
    let dt = 0;
    setInterval(()=>{
        dt = Date.now() - lastTime;
        lastTime = Date.now();
        update(dt);
        socket.emit('render',players, arrows);        // all clients need this to see that player render
    },1000/30);
})

arrows = arrows.filter(arrow => (!arrow.hit && !arrow.landed));

function update(dt){
    for(const arrow of arrows){
        arrow.update(dt);
    }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`listening on ${PORT}`));