window.LEAPscene = null
window.LEAPrenderer = null
window.LEAPcamera = null

var initLEAPScene = function(element) {
  // Scene
  window.LEAPscene = new THREE.Scene();

  // Renderer
  window.LEAPrenderer = new THREE.WebGLRenderer({alpha: true});
  // LEAPrenderer.setClearColor(0x000000, 1);
  LEAPrenderer.setSize(window.innerWidth, window.innerHeight);

  // Add to DOM
  element.appendChild(LEAPrenderer.domElement);

  // Lighting
  LEAPscene.add(new THREE.AmbientLight(0x888888));
  pointLight = new THREE.PointLight(0xFFffff);
  pointLight.position = new THREE.Vector3(-20, 10, 0);
  pointLight.lookAt(new THREE.Vector3(0, 0, 0));
  LEAPscene.add(pointLight);

  // Camera
  window.LEAPcamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
  LEAPcamera.position.fromArray([0,800,400]);
  LEAPcamera.lookAt(new THREE.Vector3(0, 0, 0));

  // Add camera to Scene
  LEAPscene.add(LEAPcamera);

  // Render Scene
  LEAPrenderer.render(LEAPscene, LEAPcamera);
}

initLEAPScene(document.body);

// LEAP Controller

var LEAPcontroller = new Leap.Controller();

LEAPcontroller.use('handHold')
  .use('transform', {
    position: new THREE.Vector3(0,0,0)
  })
  .use('handEntry')
  .use('screenPosition')
  .use('riggedHand', {
    parent: LEAPscene,
    renderer: LEAPrenderer,
    camera: LEAPcamera,
    scale: 1,
    positionScale: 1,
    offset: new THREE.Vector3(0, 0, 300),

    renderFn: function() { LEAPrenderer.render(LEAPscene, LEAPcamera); },

    materialOptions: {
      // Drug mode
      wireframe: false
    },

    boneColors: function(boneMesh, leapHand) {
      if ((boneMesh.name.indexOf('Finger_0') == 0) || (boneMesh.name.indexOf('Finger_1') == 0)) {
        return {
          hue: 0.6,
          saturation: leapHand.pinchStrength
        }
      }
    },
    checkWebGL: true
  })
  .connect()


LEAPcontroller.on('riggedHand.meshAdded', function(handMesh, leapHand) {
  handMesh.material.opacity = 1;
});

LEAPcontroller.on('frame', function(frame) {

  var handState = {};
  handState.present = false;

  handState.bothHands = false;
  handState.doublePinch = false;

  if (frame.hands.length > 1) {
    handState.bothHands = true;

    if ((frame.hands[0].pinchStrength > 0.5) && (frame.hands[1].pinchStrength > 0.5)) {
      handState.doublePinch = true;
    }

  } else if (frame.hands.length > 0) {

    handState.present = true;

    var hand = frame.hands[0];

    // Grab Strength
    var grabStrength = hand.grabStrength
    if (grabStrength > 0.8) {
      handState.fist = true;
    } else {
      handState.fist = false;
    }

    handState.grip = hand.grabStrength;

    handState.angle = hand.yaw() * 180 / Math.PI;
    handState.x = hand.palmPosition[0];
    handState.roll = hand.roll() * 180 / Math.PI;
    handState.pitch = hand.pitch() * 180 / Math.PI;

  }

  var event = new CustomEvent('handStream', {'detail': handState});
  document.dispatchEvent(event);

});




