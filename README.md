# 🪐 Simulación del Sistema Solar Interactivo (Three.js)

Este proyecto es una simulación interactiva del sistema solar desarrollada con **Three.js** (JavaScript WebGL). Permite la visualización de órbitas, lunas, una esfera de "jugador" y múltiples vistas de cámara controlables.

---

## Autor
[![GitHub](https://img.shields.io/badge/GitHub-Carlos%20Falcón-red?style=flat-square&logo=github)](https://github.com/carlosfc02)

---

## ✨ Características Principales

* **Renderizado 3D:** Uso de `THREE.WebGLRenderer` para dibujar la escena.
* **Movimiento Controlado:** Implementación de **`FlyControls`** para la navegación en primera persona.
* **Iluminación:** El Sol (`Estrella`) actúa como fuente de luz principal (`PointLight`) con soporte para sombras.
* **Controles de Usuario:** Pausa de la simulación y ajuste dinámico de la velocidad de órbita.
* **Múltiples Vistas:** Cambio rápido entre vistas de cámara predefinidas (Jugador, General, Superior).
* **Fondo de Cielo:** Implementación de un "Skydome" con textura invertida (`THREE.BackSide`) para simular el espacio.
* **Jugador:** Una esfera que se mueve con la cámara en la vista de control y se congela al pausar.

---

## 🕹️ Controles de Usuario

| Tecla | Función | Descripción |
| :--- | :--- | :--- |
| **Espacio** | Pausa/Reanuda | Congela o reanuda el movimiento de las órbitas y la esfera del jugador. |
| **T / G** | Velocidad de Órbita | **T** (Disminuye) / **G** (Aumenta) la velocidad a la que giran los planetas (`accglobal`). |
| **1 / 2 / 3** | Cambiar Vista | Alterna entre las cámaras predefinidas. |
| **W/A/S/D | Control de vuelo en la vista de jugador.
| **Flechas** | Mover Cámara.
| **Mouse Drag** | Rotar Vista | Permite cambiar la dirección de la cámara (solo si `FlyControls` está activo). |

---

## 🗺️ Vistas de Cámara (Teclas 1, 2, 3)

La simulación permite alternar entre tres configuraciones de cámara. La variable `flyControls.enabled` se ajusta automáticamente, permitiendo el control del movimiento solo en la **Vista 1**.

| Tecla | Nombre | Posición | Controles de Vuelo |
| :--- | :--- | :--- | :--- |
| **1** | `Vista 1: Jugador` | Personalizada, con la esfera del jugador siguiéndole. | **Activos** (`true`) |
| **2** | `Vista 2: Lateral (Fija)` | Fija, lateral al plano de órbita, mirando al Sol. | Inactivos (`false`) |
| **3** | `Vista 3: Superior Fija` | Fija, sobre el plano de órbita, mirando al Sol. | Inactivos (`false`) |

---

## 🧩 Estructura del Código

El código se organiza en las siguientes partes funcionales:

### 1. Inicialización y Bucle Principal

* **`init()`:** Configura la escena, la cámara (estableciendo la vista inicial), el renderizador, los `FlyControls` y el **detector de eventos de teclado** para la pausa, velocidad de órbita, y cambio de vistas.
* **`animationLoop()`:** El corazón de la simulación.
    * **Controla la pausa (`isPaused`)** para congelar las órbitas.
    * **Actualiza el jugador:** `playerSphere` copia la posición de la cámara solo si la simulación está activa (o al pausar, permitiendo moverse para verlo).
    * **Actualiza `flyControls.update(1 * secs)`:** Se ejecuta **siempre** para que la cámara pueda moverse libremente en la vista de jugador, incluso si la simulación está en pausa.
    * **`if (playerSphere) { playerSphere.visible = VIEWS[currentViewIndex].controls; }`:** Muestra la esfera del jugador solo cuando el control de vuelo está activo.

### 2. Funciones de Creación de Objetos

* **`Estrella(...)`:** Crea el Sol. Utiliza **`THREE.MeshBasicMaterial`** para brillar sin depender de la iluminación externa.
* **`Planeta(...)`:** Crea los planetas. Utiliza **`THREE.MeshPhongMaterial`** (sensible a la luz) y una **geometría rotada** para el mapeo correcto de la textura. Dibuja la órbita con `THREE.EllipseCurve`.
* **`Luna(...)`:** Crea lunas, que orbitan alrededor de sus respectivos planetas anfitriones.
* **`createSky(...)`:** Crea el fondo esférico. La clave es **`side: THREE.BackSide`** en el material para que la textura se renderice en el interior de la esfera.
* **`createPlayerSphere(...)`:** Crea la esfera del jugador, utilizando **`THREE.MeshBasicMaterial`** con textura.
* **`switchView(index)`:** Función que implementa la lógica para mover la cámara a la posición predefinida y alterna el estado de `flyControls.enabled`.