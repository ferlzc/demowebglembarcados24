import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

let renderer, scene, camera, stats, controls;
let sphere, length1;

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

document.addEventListener("DOMContentLoaded", function() {
    init();
});

function init() {
    camera = new THREE.PerspectiveCamera( 45, WIDTH / HEIGHT, 1, 10000 );
    camera.position.z = 300;

    scene = new THREE.Scene();

    const radius = 100, segments = 68, rings = 38;

    let sphereGeometry = new THREE.SphereGeometry( radius, segments, rings );
    let boxGeometry = new THREE.BoxGeometry( 0.8 * radius, 0.8 * radius, 0.8 * radius, 10, 10, 10 );

    // Remoção de atributos para mesclar geometrias
    sphereGeometry.deleteAttribute( 'normal' );
    sphereGeometry.deleteAttribute( 'uv' );

    boxGeometry.deleteAttribute( 'normal' );
    boxGeometry.deleteAttribute( 'uv' );

    // Mesclando geometrias
    sphereGeometry = BufferGeometryUtils.mergeVertices( sphereGeometry );
    boxGeometry = BufferGeometryUtils.mergeVertices( boxGeometry );

    // Combinando geometrias mescladas
    const combinedGeometry = BufferGeometryUtils.mergeGeometries( [ sphereGeometry, boxGeometry ] );
    const positionAttribute = combinedGeometry.getAttribute( 'position' );

    // Arrays para armazenar cores e tamanhos
    const colors = [];
    const sizes = [];

    const color = new THREE.Color();
    const vertex = new THREE.Vector3();

    length1 = sphereGeometry.getAttribute( 'position' ).count;

    // Configuração de cores e tamanhos com base na posição
    for ( let i = 0, l = positionAttribute.count; i < l; i ++ ) {
        vertex.fromBufferAttribute( positionAttribute, i );

        if ( i < length1 ) {
            color.setHSL( 0, 0, ( vertex.y + radius ) / ( 4 * radius ) + 0.7 ); // Ajuste de cor para esfera
        } else {
            color.setHSL( 0.57, 0.75, 0.25 + vertex.y / ( 2 * radius ) ); // Ajuste de cor para caixa
        }

        color.toArray( colors, i * 3 );
        sizes[ i ] = i < length1 ? 10 : 40; // Tamanho baseado na posição
    }

    // Configuração da geometria final
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute( 'position', positionAttribute );
    geometry.setAttribute( 'size', new THREE.Float32BufferAttribute( sizes, 1 ) );
    geometry.setAttribute( 'ca', new THREE.Float32BufferAttribute( colors, 3 ) );

    // Configuração do material com textura
    const texture = new THREE.TextureLoader().load( 'textures/sprites/disc.png' );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    const material = new THREE.ShaderMaterial( {
        uniforms: {
            color: { value: new THREE.Color( 0xffffff ) },
            pointTexture: { value: texture }
        },
        vertexShader: document.getElementById( 'vertexshader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
        transparent: true
    });

    // Criação do objeto de pontos
    sphere = new THREE.Points( geometry, material );
    scene.add( sphere );

    // Configuração do renderizador
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( WIDTH, HEIGHT );
    document.body.appendChild( renderer.domElement );

    // Configuração dos controles orbitais
    controls = new OrbitControls( camera, renderer.domElement );
    controls.enableDamping = true; // Ativa a inércia
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false; // Desativa pan pelo espaço da tela

    // Configurações adicionais dos controles
    controls.enableZoom = true;
    controls.minDistance = 0;
    controls.maxDistance = 1000;
    controls.minPolarAngle = 1; // Ângulo mínimo de inclinação
    controls.maxPolarAngle = Math.PI / 3; // Ângulo máximo de inclinação

    // Adiciona estatísticas de performance
    stats = new Stats();
    document.body.appendChild( stats.dom );

    // Atualização do tamanho da janela
    window.addEventListener( 'resize', onWindowResize );

    // Início do loop de animação
    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
    requestAnimationFrame( animate );

    sphere.rotation.y += 0.01; // Animação básica de rotação

    // Atualiza os controles orbitais
    controls.update();

    // Renderiza a cena
    renderer.render( scene, camera );

    // Atualiza as estatísticas
    stats.update();
}
