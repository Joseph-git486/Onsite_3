const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));



const floor = 1000;
let arrows1 = [];
let arrows2 = [];

class Arrow {
    constructor(player, coords,floor){    // coords = [{xi,yi},[xf,yf]]
        this.uMag = (coords.length == 2)? ( (coords[0].x - coords[1].x)**2 + (coords[0].y - coords[1].y)**2):1;
        this.landed = false;
        this.hit = false;
        this.player = player;
        this.sin = (coords[0].yi - coords[1].yf)/ Math.sqrt( (coords[0].xi-coords[1].xf)**2 + (coords[0].yi-coords[1].yf)**2 );
        this.cos = (coords[0].xi - coords[1].xf)/ Math.sqrt( (coords[0].xi-coords[1].xf)**2 + (coords[0].yi-coords[1].yf)**2 )
        this.size = 40;

        this.pos = createVector(player.x, player.y);
        this.vel = createVector( this.uMag*this.cos, this.uMag*this.sin );
        this.acc = createVector(0,-10);
    }
    
    update(){
        this.vel.add(this.acc);
        this.pos.add(this.vel);
    }

    hits(player) {
        if( this.pos.y < floor){
            this.landed = true;
        }
        if(
            this.pos.x > player.pos.x - (player.size/2) &&
            this.pos.x < player.pos.x + (player.size/2) &&

            this.pos.y > player.pos.y - (player.size/2)&&
            this.pos.y < player.pos.y + (player.size/2)
        ){
            return true;
        }
        return false;
    }

    render(){
        if(this.landed){
            ctx.fillStyle = 'red';
            ctx.fillRect(this.pos.x-this.size/2, this.pos.y-this.size/2, this.size, this.size);

        }
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.pos.x-this.size/2, this.pos.y-this.size/2, this.size, this.size);
    }
}


class Player{
    constructor(color){
        this.health = 100;
        this.coords = {x:30, y:960};
        this.size = 60;
        this.color = color;
    }

    render(){
        ctx.fillStyle = player.color;
        ctx.fillRect(this.coords.x-this.size/2, this.coords.y-this.size/2, this.size, this.size);
    }
}

io.on('connection', (socket)=>{
    const spawnCoords = {x:50, y:800};
    socket.emit('spawn',spawnCoords);
    socket.on('shoot', (coords)=>{
        const arrow = new Arrow(player,coords,floor);
        arrows1.push(arrow);
    })

})

arrows1 = arrows1.filter(arrow => (!arrow.hit && !arrow.landed));
arrows2 = arrows2.filter(arrow => (!arrow.hit && !arrow.landed));
for(const arrow of arrows1){
    arrow.update();
    arrow.render();
}
for(const arrow of arrows2){
    arrow.update();
    arrow.render();
}


const player1 = new Player('green');
const player2 = new Player('blue');
let currentPlayer = player1;