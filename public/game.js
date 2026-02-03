const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const ws = new WebSocket(`ws://${location.host}`);

let myId = null;
let players = {};

ws.onmessage = e => {
  const data = JSON.parse(e.data);

  if (data.type === "init") {
    myId = data.id;
  }

  if (data.type === "players") {
    players = data.players;
  }
};

// input
const keys = {};
window.onkeydown = e => keys[e.key] = true;
window.onkeyup = e => keys[e.key] = false;

// game loop
setInterval(() => {
  if (!myId) return;

  const me = players[myId];
  if (!me) return;

  if (keys["w"]) me.speed += 0.2;
  if (keys["s"]) me.speed *= 0.95;
  if (keys["a"]) me.angle -= 0.05;
  if (keys["d"]) me.angle += 0.05;

  me.x += Math.cos(me.angle) * me.speed;
  me.y += Math.sin(me.angle) * me.speed;

  ws.send(JSON.stringify({
    type: "state",
    state: me
  }));
}, 50);

// render
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const id in players) {
    const p = players[id];
    ctx.fillStyle = id === myId ? "red" : "white";
    ctx.fillRect(p.x, p.y, 20, 10);
  }

  requestAnimationFrame(draw);
}
draw();
  
