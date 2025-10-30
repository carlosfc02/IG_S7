import * as THREE from "three";
import { FlyControls } from "three/examples/jsm/controls/FlyControls";

let scene, renderer;
let camera;
let info;
let grid;
let estrella,
  Planetas = [],
  Lunas = [];
let t0 = 0;
let accglobal = 0.001;
let timestamp;
let flyControls;
let isPaused = false;
let playerSphere;

let currentViewIndex = 0;
const VIEWS = [
  {
    name: "Vista 1: Jugador (W/A/S/D)",
    position: new THREE.Vector3(-25, 0, 2),
    rotation: new THREE.Euler(Math.PI / 2, 0, 0),
    controls: true, // FlyControls activo
  },
  {
    name: "Vista 2: Latetal (Fija)",
    position: new THREE.Vector3(0, 50, 0),
    lookAt: new THREE.Vector3(0, 0, 0),
    controls: false,
  },
  {
    name: "Vista 3: Superior Fija",
    position: new THREE.Vector3(0, 0, 50),
    lookAt: new THREE.Vector3(0, 0, 0),
    controls: false,
  },
];

init();
animationLoop();

function init() {
  info = document.createElement("div");
  info.style.position = "absolute";
  info.style.top = "30px";
  info.style.width = "100%";
  info.style.textAlign = "center";
  info.style.color = "#fff";
  info.style.fontWeight = "bold";
  info.style.backgroundColor = "transparent";
  info.style.zIndex = "1";
  info.style.fontFamily = "Monospace";
  info.innerHTML = "Sistema solar";
  document.body.appendChild(info);

  document.addEventListener("keydown", (event) => {
    if (event.code === "Space" || event.key === " ") {
      isPaused = !isPaused;
      return;
    }

    const step = 0.0001;
    if (event.key === "t" || event.key === "T") {
      accglobal = Math.max(0.0001, accglobal - step);
    } else if (event.key === "g" || event.key === "G") {
      accglobal += step;
    }

    const viewKey = parseInt(event.key);
    if (!isNaN(viewKey) && viewKey >= 1 && viewKey <= VIEWS.length) {
      switchView(viewKey - 1);
    }
  });

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.copy(VIEWS[0].position);
  camera.rotation.copy(VIEWS[0].rotation);
  camera.up.set(0, 1, 0);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  flyControls = new FlyControls(camera, renderer.domElement);
  flyControls.dragToLook = true;
  flyControls.movementSpeed = 0.001;
  flyControls.rollSpeed = 0.001;

  const sunLight = new THREE.PointLight(0xffffff, 2, 500);
  sunLight.position.set(0, 0, 0);
  scene.add(sunLight);
  renderer.shadowMap.enabled = true;
  sunLight.castShadow = true;

  const Lamb = new THREE.AmbientLight(0xffffff, 0.05);
  scene.add(Lamb);

  grid = new THREE.GridHelper(20, 40);
  grid.geometry.rotateX(Math.PI / 2);
  grid.position.set(0, 0, 0.05);
  const tx_sun = new THREE.TextureLoader().load("src/2k_sun.jpg");
  const tx_mercury = new THREE.TextureLoader().load("src/2k_mercury.jpg");
  const tx_venus = new THREE.TextureLoader().load("src/2k_venus_surface.jpg");
  const tx_mars = new THREE.TextureLoader().load("src/2k_mars.jpg");
  const tx1 = new THREE.TextureLoader().load("src/earthmap1k.jpg");
  const txb1 = new THREE.TextureLoader().load("src/earthbump1k.jpg");
  const txspec1 = new THREE.TextureLoader().load("src/earthspec1k.jpg");
  const tx2 = new THREE.TextureLoader().load("src/earthcloudmap.jpg");

  const tx_carlos = new THREE.TextureLoader().load("src/carlos_recorte.JPG");
  const milkyway = new THREE.TextureLoader().load("src/milkyway.png");
  const moon = new THREE.TextureLoader().load("src/2k_moon.jpg");
  const moon_2 = new THREE.TextureLoader().load("src/moon_2.jpg");
  const moon_3 = new THREE.TextureLoader().load("src/moon_3.jpg");
  const moon_4 = new THREE.TextureLoader().load("src/moon_4.jpg");
  const moon_5 = new THREE.TextureLoader().load("src/moon_5.jpg");
  const moon_6 = new THREE.TextureLoader().load("src/moon_6.jpg");
  const dirt = new THREE.TextureLoader().load("src/dirt.jpg");

  Estrella(3, 0xffffff, tx_sun);
  Planeta(0.5, 4.0, 1.0, 0xffffff, 1.0, 1.15, tx_mercury);
  Planeta(0.8, 7, -1.2, 0xffffff, 1.0, 1.15, tx_venus);
  Planeta(0.4, 10, -1.2, 0xffffff, 1.0, 1.2, tx_mars);
  Planeta(1.5, 18, 0.6, 0xffffff, 1.0, 1.15, tx1, txb1, undefined, undefined);

  Luna(Planetas[0], 0.3, 0.9, -3.5, 0xffffff, 0.0, moon_2);
  Luna(Planetas[0], 0.04, 0.7, 1.5, 0xffffff, Math.PI / 2, moon_3);
  Luna(Planetas[1], 0.2, 1.5, 1.5, 0xffffff, 0.0, dirt);
  Luna(Planetas[1], 0.15, 1.5, 1.5, 0xffffff, 0.0), moon_4;
  Luna(Planetas[3], 0.5, 2.5, 1.5, 0xffffff, Math.PI / 2, moon_5);
  Luna(Planetas[2], 0.21, 1.5, 1.5, 0xffffff, 0.0, moon_6);
  Luna(Planetas[3], 0.3, 2, 1.5, 0xffffff, 0.0, moon);

  createSky(500, milkyway);
  createPlayerSphere(0.5, 0xffffff, tx_carlos);
  playerSphere.position.copy(camera.position);

  t0 = Date.now();
}

function animationLoop() {
  requestAnimationFrame(animationLoop);
  let t1 = new Date();
  let secs = (t1 - t0) / 1000;
  flyControls.update(1 * secs);

  if (!isPaused) {
    playerSphere.position.copy(camera.position);
    playerSphere.translateZ(-0.5);

    timestamp = (Date.now() - t0) * accglobal;

    for (let object of Planetas) {
      object.position.x =
        Math.cos(timestamp * object.userData.speed) *
        object.userData.f1 *
        object.userData.dist;
      object.position.y =
        Math.sin(timestamp * object.userData.speed) *
        object.userData.f2 *
        object.userData.dist;
    }

    for (let object of Lunas) {
      object.position.x =
        Math.cos(timestamp * object.userData.speed) * object.userData.dist;
      object.position.y =
        Math.sin(timestamp * object.userData.speed) * object.userData.dist;
    }
  }

  if (playerSphere) {
    playerSphere.visible = VIEWS[currentViewIndex].controls;
  }

  const x = camera.position.x.toFixed(2);
  const y = camera.position.y.toFixed(2);
  const z = camera.position.z.toFixed(2);

  const viewName = VIEWS[currentViewIndex].name;
  info.innerHTML = `${viewName} | Posición (X, Y, Z): (${x}, ${y}, ${z})`;

  renderer.render(scene, camera);
}

function switchView(index) {
  currentViewIndex = index;
  const view = VIEWS[index];

  camera.position.copy(view.position);

  if (view.lookAt) {
    camera.up.set(0, 1, 0);
    camera.lookAt(view.lookAt);
  } else {
    camera.rotation.copy(view.rotation);
    camera.up.set(0, 1, 0);
  }

  flyControls.enabled = view.controls;

  if (!view.controls) {
    flyControls.update(0);
  }
}

function Estrella(
  rad,
  col,
  texture = undefined,
  texbump = undefined,
  texspec = undefined,
  texalpha = undefined,
  sombra = false
) {
  let geometry = new THREE.SphereGeometry(rad, 100, 100);
  let mat = new THREE.MeshBasicMaterial({ color: col });
  geometry.rotateX(Math.PI / 2); //Textura
  if (texture != undefined) {
    mat.map = texture;
  }

  if (texbump != undefined) {
    mat.bumpMap = texbump;
    mat.bumpScale = 0.1;
  }

  if (texspec != undefined) {
    mat.specularMap = texspec;
    mat.specular = new THREE.Color("orange");
  }

  if (texalpha != undefined) {
    mat.alphaMap = texalpha;
    mat.transparent = true;
    mat.side = THREE.DoubleSide;
    mat.opacity = 1.0;
  }
  estrella = new THREE.Mesh(geometry, mat);
  scene.add(estrella);
}

function Planeta(
  radio,
  dist,
  vel,
  col,
  f1,
  f2,
  texture = undefined,
  texbump = undefined,
  texspec = undefined,
  texalpha = undefined
) {
  let geom = new THREE.SphereBufferGeometry(radio, 100, 100);
  let mat = new THREE.MeshPhongMaterial({ color: col });
  geom.rotateX(Math.PI / 2);
  if (texture != undefined) {
    mat.map = texture;
  }

  if (texbump != undefined) {
    mat.bumpMap = texbump;
    mat.bumpScale = 0.1;
  }

  if (texspec != undefined) {
    mat.specularMap = texspec;
    mat.specular = new THREE.Color("orange");
  }

  if (texalpha != undefined) {
    mat.alphaMap = texalpha;
    mat.transparent = true;
    mat.side = THREE.DoubleSide;
    mat.opacity = 1.0;
  }

  let planeta = new THREE.Mesh(geom, mat);
  planeta.castShadow = true;
  planeta.userData.dist = dist;
  planeta.userData.speed = vel;
  planeta.userData.f1 = f1;
  planeta.userData.f2 = f2;

  Planetas.push(planeta);
  scene.add(planeta);

  let curve = new THREE.EllipseCurve(0, 0, dist * f1, dist * f2);
  let points = curve.getPoints(50);
  let geome = new THREE.BufferGeometry().setFromPoints(points);
  let mate = new THREE.LineBasicMaterial({ color: 0xffffff });
  let orbita = new THREE.Line(geome, mate);
  scene.add(orbita);
}

function Luna(planeta, radio, dist, vel, col, angle, texture = undefined) {
  var pivote = new THREE.Object3D();
  pivote.rotation.x = angle;
  planeta.add(pivote);
  var geom = new THREE.SphereGeometry(radio, 100, 100);
  var mat = new THREE.MeshPhongMaterial({ color: col });
  geom.rotateX(Math.PI / 2);
  if (texture != undefined) {
    mat.map = texture;
  }
  var luna = new THREE.Mesh(geom, mat);
  luna.userData.dist = dist;
  luna.userData.speed = vel;

  Lunas.push(luna);
  pivote.add(luna);
}

function createPlayerSphere(radius, color, texture) {
  const geometry = new THREE.SphereGeometry(radius, 100, 100);
  geometry.rotateX(Math.PI / 2);
  const material = new THREE.MeshBasicMaterial({ color: color, map: texture });
  playerSphere = new THREE.Mesh(geometry, material);
  scene.add(playerSphere);
}

function createSky(radius, texture) {
  const geometry = new THREE.SphereGeometry(radius, 100, 100);
  const color = 0x555555;
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.BackSide,
    color: color,
  });

  geometry.rotateX(Math.PI / 2);

  const sky = new THREE.Mesh(geometry, material);
  sky.position.set(0, 0, 0);
  scene.add(sky);
}
