var renderer = null,
scene = null,
camera = null,
root = null,
drone = null,droneContainer=null,
group = null,
orbitControls = null;

var objLoader = null, objLoader = null;

var duration = 10;
var currentTime = Date.now();

function loadObj()
{
    if(!objLoader)
        objLoader = new THREE.OBJLoader();

    objLoader.load(
        '../models/Aircraft_obj.obj',

        function(object)
        {
          var texture = new THREE.TextureLoader().load('../images/E-45_tex.jpg');
          var normalMap = new THREE.TextureLoader().load('../images/E-45-nor_1.jpg');
          var specularMap = new THREE.TextureLoader().load('../images/E-45_col_2.jpg');

            object.traverse( function ( child )
            {
                if ( child instanceof THREE.Mesh )
                {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.material.map = texture;
                    child.material.normalMap = normalMap;
                    child.material.specularMap = specularMap;

                }
            } );

            drone = object;
            drone.scale.set(0.7,0.7,0.7);
            drone.rotation.y = -Math.PI * 0.25;
            droneContainer.add(drone);
        },
        function ( xhr ) {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        // called when loading has errors
        function ( error ) {
            console.log( 'An error happened' );
        });
}

function setLightColor(light, r, g, b)
{
    r /= 255;
    g /= 255;
    b /= 255;

    light.color.setRGB(r, g, b);
}

function playAnimations()
{
  droneAnimator = new KF.KeyFrameAnimator;
  droneAnimator.init({
      interps:
          [
            {
              keys:[0,  0.05, .25, 0.30,   0.5, 0.55,  0.75, 0.8, 0.96, 1],

                //keys:[0.05, .30, .55, .80,  1],
                values:[
                        { x : 20, y:0, z: 0 },
                        { x : 19, y:0, z: 5 },

                        { x : 0, y:0, z: 20 },
                        { x : -3, y:0, z: 20 },

                        { x : -20, y:0, z: 0 },
                        { x : -20, y:0, z: -3 },

                        { x : 0, y:0, z: -20 },
                        { x : 3, y:0, z: -20 },

                        { x : 20, y:0, z: 0 },
                        { x : 20, y:0, z: 0 },


                        ],
                target:droneContainer.position
            },
              {
                  keys:[0, 0.05, .2,0.35,   0.45,0.6,  0.7,0.85,  0.9,1],
                  values:[
                          { y : -Math.PI * 0.5},
                          { y : -Math.PI },

                          { y : -Math.PI },
                          { y : -Math.PI * 1.5 },

                          { y : -Math.PI * 1.5 },
                          { y : -Math.PI * 2 },


                          { y : -Math.PI * 2 },
                          { y : -Math.PI * 2.5},

                          { y : -Math.PI * 2.5},
                          { y : -Math.PI * 2.5},


                          ],
                  target: droneContainer.rotation
              },
          ],
      loop: true,
      duration:duration * 1000,

  });
  droneAnimator.start();
}

function run() {
    requestAnimationFrame(function() { run(); });

        // Render the scene
        renderer.render( scene, camera );

        // Spin the cube for next frame
        //animate();
        KF.update();

        // Update the camera controller
        orbitControls.update();
}


var directionalLight = null;
var spotLight = null;
var ambientLight = null;
var mapUrl = "../images/checker_large.gif";

var SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 2048;

function createScene(canvas) {

    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);

    // Turn on shadows
    renderer.shadowMap.enabled = true;
    // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 5000 );
    camera.position.set(-5, 6, 45);
    scene.add(camera);

    // Create a group to hold all the objects
    root = new THREE.Object3D;

    // Add a directional light to show off the object
    directionalLight = new THREE.DirectionalLight( 0xffffff, 1);

    // Create and add all the lights
    directionalLight.position.set(.5, 0, 3);
    root.add(directionalLight);

    spotLight = new THREE.SpotLight (0xffffff);
    spotLight.position.set(2, 8, 15);
    spotLight.target.position.set(-2, 0, -2);
    root.add(spotLight);

    spotLight.castShadow = true;

    spotLight.shadow.camera.near = 1;
    spotLight.shadow. camera.far = 200;
    spotLight.shadow.camera.fov = 45;

    spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

    ambientLight = new THREE.AmbientLight ( 0x888888 );
    root.add(ambientLight);
    droneContainer = new THREE.Object3D;
    root.add(droneContainer);
    // Create the objects
    loadObj();


    // Create a group to hold the objects
    group = new THREE.Object3D;
    root.add(group);

    // Create a texture map
    var map = new THREE.TextureLoader().load(mapUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(8, 8);

    var color = 0xffffff;

    // Put in a ground plane to show off the lighting
    geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:color, map:map, side:THREE.DoubleSide}));

    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -4.02;

    // Add the mesh to our group
    group.add( mesh );
    mesh.castShadow = false;
    mesh.receiveShadow = true;

    // Now add the group to our scene
    scene.add( root );
}
