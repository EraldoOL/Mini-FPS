const socket = io();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("gameCanvas") });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const myPlayer = new THREE.Mesh(geometry, material);
scene.add(myPlayer);

camera.position.z = 5;

const players = {};

socket.on("init", data => {
  Object.entries(data.players).forEach(([id, pos]) => {
    if (id !== data.id) {
      const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0xff0000 }));
      scene.add(mesh);
      players[id] = mesh;
    }
  });
});

socket.on("newPlayer", ({ id, data }) => {
  const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0xff0000 }));
  scene.add(mesh);
  players[id] = mesh;
});

socket.on("updatePlayer", ({ id, data }) => {
  if (players[id]) {
    players[id].position.set(data.x, data.y, data.z);
  }
});

socket.on("removePlayer", id => {
  scene.remove(players[id]);
  delete players[id];
});

let posX = 0;

function animate() {
  requestAnimationFrame(animate);
  myPlayer.position.x = posX;
  socket.emit("update", { x: posX, y: 0, z: 0 });
  renderer.render(scene, camera);
}

document.getElementById("btnLeft").onclick = () => posX -= 0.1;
document.getElementById("btnRight").onclick = () => posX += 0.1;

animate();