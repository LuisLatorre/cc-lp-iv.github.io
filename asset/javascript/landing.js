// https://www.youtube.com/watch?v=j7TzxxX1EJk
/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

/**
 * Loaders
 */
const loadingBarElement = document.querySelector('.loading-bar')
const bodyElement = document.querySelector('body')
const loadingManager = new THREE.LoadingManager(
    () => {
        window.setTimeout(() => {
            gsap.to(overlayMaterial.uniforms.uAlpha, {
                duration: 3,
                value: 0,
                delay: 1
            })
            gsap.to(overlayMaterial.uniforms.uAlpha, {
                duration: 3,
                value: 0,
                delay: 1
            })

            loadingBarElement.classList.add('ended')
            bodyElement.classList.add('loaded')
            loadingBarElement.style.transform = ''

        }, 500)
    },
    (itemUrl, itemsLoaded, itemsTotal) => {
        console.log(itemUrl, itemsLoaded, itemsTotal)
        const progressRatio = itemsLoaded / itemsTotal
        loadingBarElement.style.transform = `scaleX(${progressRatio})`
        console.log(progressRatio)
    },
    () => {

    }
)
const gltfLoader = new THREE.GLTFLoader(loadingManager)

/**
 *  Textures
 */
const textureLoader = new THREE.TextureLoader()
const alphaShadow = textureLoader.load('');

// Scene
const scene = new THREE.Scene()

const sphereShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 1.5),
    new THREE.MeshBasicMaterial({
        transparent: true,
        color: 0x000000,
        opacity: 0.5,
        alphaMap: alphaShadow
    })
)

sphereShadow.rotation.x = -Math.PI * 0.5

sphereShadow.position.y = -1
sphereShadow.position.x = 1.5;

scene.add(sphereShadow)

/**
 * Overlay
 */
const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)
const overlayMaterial = new THREE.ShaderMaterial({
    vertexShader: `
        void main() {
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uAlpha;
        void main() {
            // gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
            // gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        }
    `,
    uniforms: {
        uAlpha: {
            value: 1.0
        }
    },
    transparent: true
})
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
scene.add(overlay)


/**
 * GLTF Model
 */
let anuncio = null

gltfLoader.load(
    './asset/billboard/Pantalla_12x6.glb',
    (gltf) => {
        console.log(gltf);

        anuncio = gltf.scene

        anuncio.position.x = 1.5
        anuncio.rotation.x = -0.1
        anuncio.rotation.y = -2.1
        
        const radius = 0.0090
        anuncio.scale.set(radius*1.5, radius, radius*1.5)

        scene.add(anuncio)
    },
    (progress) => {
        console.log(progress);
    },
    (error) => {
        console.error(error);
    }
)

/**
 * Light
 */
const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
directionalLight.position.set(0, 5, 5)
directionalLight.castShadow = true
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

/**
 * Scroll
 */
let scrollY = window.scrollY
let currentSection = 0

const transformanuncio = [{
        rotationZ: 0,
        rotationY: -2.2,
        positionX: 1.5
    },
    {
        rotationZ: -0.1,
        rotationY: 4.55,
        positionX: -1.5
    },
    {
        rotationZ: 0,
        rotationY: -2.2,
        positionX: 1.5
    },
    {
        rotationZ: -0.1,
        rotationY: 4.55,
        positionX: -1.5
    },
    {
        rotationZ: 0,
        rotationY: -2.2,
        positionX: 1.5
    },
    {
        rotationZ: 0,
        rotationY: -2,
        positionX: 0
    },
    {
        rotationZ: 0,
        rotationY: 0,
        positionX: 0
    }
]

// Definiciones de la segunda Funciones de Animación
const isMobile = () => window.innerWidth < 768;
let mobileAnimationExecuted = false;

//"Rotación Sutil en Eje X o Z"
const animateAnuncioOnMobile = () => {
    if (!anuncio || !sphereShadow || mobileAnimationExecuted) return;

    anuncio.position.set(0, 0.5, 0);
    sphereShadow.position.set(anuncio.position.x, -1, anuncio.position.z);

    // Cancela cualquier animación previa
    gsap.killTweensOf(anuncio.rotation);
    gsap.killTweensOf(sphereShadow.position);

    // Anima la rotación sutil en el eje Z
    gsap.to(anuncio.rotation, {
        z: "+=0.05", // Rotar sutilmente en Z
        repeat: -1, // Repetir indefinidamente
        yoyo: true, // Volver a la posición original antes de repetir
        duration: 2,
        ease: "sine.inOut"
    });

    mobileAnimationExecuted = true; // Asegura que la animación se ejecute una sola vez
};


window.addEventListener('resize', debounce(() => {
    // Verifica si el tamaño de la ventana corresponde a un dispositivo móvil
    if (isMobile()) {
        if (!mobileAnimationExecuted) {
            animateAnuncioOnMobile();
        }
    } else {
        // Si no es móvil, restablece la animación ejecutada para permitir que se ejecute de nuevo si se cambia a móvil
        mobileAnimationExecuted = false;
    }
    // También maneja la actualización de la cámara y el renderizador para la nueva dimensión de la ventana
    onWindowResize();
}, 250));

window.addEventListener('scroll', () => {
    // Si la pantalla es móvil, no hacer nada en el evento de scroll
    if (isMobile()) return;

    scrollY = window.scrollY;
    const newSection = Math.round(scrollY / sizes.height);

    if (newSection != currentSection) {
        currentSection = newSection;

        if (anuncio) {
            // Ejecuta animaciones para no móviles
            gsap.to(
                anuncio.rotation, {
                    duration: 1.5,
                    ease: 'power2.inOut',
                    z: transformanuncio[currentSection].rotationZ,
                    y: transformanuncio[currentSection].rotationY
                }
            );
            gsap.to(
                anuncio.position, {
                    duration: 1.5,
                    ease: 'power2.inOut',
                    x: transformanuncio[currentSection].positionX,
                }
            );
            gsap.to(
                sphereShadow.position, {
                    duration: 1.5,
                    ease: 'power2.inOut',
                    x: transformanuncio[currentSection].positionX - 0.2
                }
            );
        }
    }
});


// Debounce function para optimizar el rendimiento durante el evento de resize
function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}


/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 1000)
camera.position.z = 5

scene.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let lastElapsedTime = 0

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - lastElapsedTime
    lastElapsedTime = elapsedTime

    if (!!anuncio) {
        //anuncio.position.y = Math.sin(elapsedTime * .5) * .1 - 0.1
        anuncio.position.y = Math.sin(elapsedTime * .1) * 0.1 - 1
        sphereShadow.material.opacity = (1 - Math.abs(anuncio.position.y)) * 0.3
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

/**
 * On Reload
 */
window.onbeforeunload = function () {
    window.scrollTo(0, 0);
}
function onWindowResize() {
    // Ajustar las proporciones de la cámara
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Actualizar el tamaño del renderizador
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Ajustar cualquier otro elemento que necesite responder al cambio de tamaño
}

// Escuchar el evento de redimensionamiento y ejecutar la función definida
window.addEventListener('resize', onWindowResize, false);
