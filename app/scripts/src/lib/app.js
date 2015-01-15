// Vendor Libs Modernizr, Soundcloud, Firebase

// Add Range Map
Number.prototype.rangeMap = function ( in_min , in_max , out_min , out_max ) {
  number = ( this - in_min ) * ( out_max - out_min ) / ( in_max - in_min ) + out_min;
  if(number < 0){
    number = 0
  }

  if(number > out_max) {
    number = out_max
  }
  return number;
}

// Game Variables
window.GAME_STARTED = false;

window.LIGHTING_ENABLED = false;
window.RAIN_ENABLED = false;
window.FREAKOUT_ENABLED = false;
window.MAP_ENABLED = false;
window.WALL_TEXTURE_ENABLED = true;
window.WHITE_SKYBOX_ENABLED = false;
window.LOG_POSITION = false;
window.GAME_OVER = false;

window.IDLE_TIMER = 1200;


// Import Libraries
Utils = require('./utils');
Player = require('./player');
Map = require('./map');
Controls = require('./controls');
Bitmap = require('./bitmap');
Camera = require('./camera');
EventBus = require('./event-bus');
MessageQueue = require('./message-queue');
GameLoop = require('./gameloop');

// Start the Game Loop
var display = document.getElementById('display');
var player = new Player(30.5, 30.5, Math.PI * 1.25);
window.map = new Map(32);
window.controls = new Controls();
var camera = new Camera(display, Utils.MOBILE ? 160 : 320, 0.8);
var eventBus = new EventBus();
var messageQueue = new MessageQueue();
var loop = new GameLoop();

startGame = function() {
  startScreen.className = "game-started";
  display.className = "game-started";
  window.GAME_STARTED = true;

  messageQueue.pushNotification('You can always learn more empathy', 'system', 500);

  // Load the Map
  var mapImage = new Image();
  var mapData = []

  mapImage.onload = function() {
    var decoder = document.createElement('canvas');
    decoder.width = mapImage.width
    decoder.height = mapImage.height

    if (decoder.height != decoder.width) {
      throw new Error('map.png is not square.  Please use a square image.')
    }

    var context = decoder.getContext('2d');
    context.drawImage(mapImage, 0, 0);
    var imageData = context.getImageData(0, 0, decoder.width, decoder.height);

    for (var i = 0; i < imageData.data.length/4; i++) {
      mapData[i] = imageData.data[(i*4)+3] > 100 ? 1 : 0;
    }

    for (var i = 0; i < mapData.length; i++) {
      map.wallGrid[i] = mapData[i]
    }


    // Pickups
    map.addItem({
      x: 7.5,
      y: 26.5,
      width: 0.8,
      height: 1,
      type: "pickup",
      name: "freakout",
      showOnMap: true,
      texture: new Bitmap('assets/pickup-freakout.png', 1024, 1024)
    });

    map.addItem({
      x: 4.5,
      y: 8,
      width: 0.8,
      height: 1,
      type: "pickup",
      name: "lucid",
      showOnMap: true,
      texture: new Bitmap('assets/pickup-lucid.png', 1024, 1024)
    });

    map.addItem({
      x: 18.5,
      y: 21.5,
      width: 0.8,
      height: 1,
      type: "pickup",
      name: "flashlight",
      showOnMap: true,
      texture: new Bitmap('assets/pickup-flashlight.png', 1024, 1024)
    });

    // Messages
    map.addItem({
      x: 5,
      y: 11.5,
      width: .8,
      height: 1,
      type: "pickup",
      name: "map",
      showOnMap: false,
      texture: new Bitmap('assets/pickup-map.png', 1024, 1024)
    });


    // Art
    map.addItem({
      x: 9.5,
      y: 14.5,
      width: 0.8,
      height: 1,
      type: "art",
      showOnMap: false,
      texture: new Bitmap('assets/art-guru.png', 1024, 1024)
    });

    map.addItem({
      x: 23.5,
      y: 27.5,
      width: 0.8,
      height: 1,
      type: "art",
      showOnMap: false,
      texture: new Bitmap('assets/art-face.gif', 500, 367)
    });

    map.addItem({
      x: 20,
      y: 18,
      width: 0.8,
      height: 1,
      type: "hand",
      showOnMap: false,
      texture: new Bitmap('assets/hand.gif', 500, 500)
    });

    map.addItem({
      x: 21,
      y: 18,
      width: 0.8,
      height: 1,
      type: "hand",
      showOnMap: false,
      texture: new Bitmap('assets/hand.gif', 500, 500)
    });

    map.addItem({
      x: 22,
      y: 18,
      width: 0.8,
      height: 1,
      type: "hand",
      showOnMap: false,
      texture: new Bitmap('assets/hand.gif', 500, 500)
    });

    map.addItem({
      x: 23,
      y: 18,
      width: 0.8,
      height: 1,
      type: "hand",
      showOnMap: false,
      texture: new Bitmap('assets/hand.gif', 500, 500)
    });

    map.addItem({
      x: 24,
      y: 18,
      width: 0.8,
      height: 1,
      type: "hand",
      showOnMap: false,
      texture: new Bitmap('assets/hand.gif', 500, 500)
    });


    map.addItem({
      x: 25,
      y: 18,
      width: 0.8,
      height: 1,
      type: "hand",
      showOnMap: false,
      texture: new Bitmap('assets/hand.gif', 500, 500)
    });


    map.addItem({
      x: 26,
      y: 18,
      width: 0.8,
      height: 1,
      type: "hand",
      showOnMap: false,
      texture: new Bitmap('assets/hand.gif', 500, 500)
    });

    map.addItem({
      x: 27,
      y: 18,
      width: 0.8,
      height: 1,
      type: "hand",
      showOnMap: false,
      texture: new Bitmap('assets/hand.gif', 500, 500)
    });

    map.addItem({
      x: 28,
      y: 18,
      width: 0.8,
      height: 1,
      type: "hand",
      showOnMap: false,
      texture: new Bitmap('assets/hand.gif', 500, 500)
    });

    map.addItem({
      x: 29,
      y: 18,
      width: 0.8,
      height: 1,
      type: "last-hand",
      showOnMap: false,
      texture: new Bitmap('assets/hand.gif', 500, 500)
    });

    // SPRITES

    map.addItem({
      x: 2,
      y: 26.5,
      width: 0.8,
      height: 1,
      texture: new Bitmap('assets/sprite-0.jpg', 150, 225),
      type: "sprite",
      showOnMap: false,
    });

    map.addItem({
      x: 2,
      y: 25.5,
      width: 0.8,
      height: 1,
      texture: new Bitmap('assets/sprite-1.jpg', 150, 225),
      type: "sprite",
      showOnMap: false,
    });

    map.addItem({
      x: 2,
      y: 24.5,
      width: 0.8,
      height: 1,
      texture: new Bitmap('assets/sprite-2.jpg', 150, 225),
      type: "sprite",
      showOnMap: false,
    });

    map.addItem({
      x: 2,
      y: 23.5,
      width: 0.8,
      height: 1,
      texture: new Bitmap('assets/sprite-3.jpg', 150, 225),
      type: "sprite",
      showOnMap: false,
    });

    map.addItem({
      x: 2,
      y: 22.5,
      width: 0.8,
      height: 1,
      texture: new Bitmap('assets/sprite-4.jpg', 150, 225),
      type: "sprite",
      showOnMap: false,
    });

    map.addItem({
      x: 2,
      y: 21.5,
      width: 0.8,
      height: 1,
      texture: new Bitmap('assets/sprite-5.jpg', 150, 225),
      type: "sprite",
      showOnMap: false,
    });

    map.addItem({
      x: 2,
      y: 20.5,
      width: 0.8,
      height: 1,
      texture: new Bitmap('assets/sprite-6.jpg', 150, 225),
      type: "sprite",
      showOnMap: false,
    });

    map.addItem({
      x: 2,
      y: 19.5,
      width: 0.8,
      height: 1,
      texture: new Bitmap('assets/sprite-7.jpg', 150, 225),
      type: "sprite",
      showOnMap: false,
    });

    map.addItem({
      x: 2,
      y: 18.5,
      width: 0.8,
      height: 1,
      texture: new Bitmap('assets/sprite-8.jpg', 150, 225),
      type: "sprite",
      showOnMap: false,
    });

    map.addItem({
      x: 2,
      y: 17.5,
      width: 0.8,
      height: 1,
      texture: new Bitmap('assets/sprite-9.jpg', 150, 225),
      type: "sprite",
      showOnMap: false,
    });



    // Messages
    // map.addItem({
    //   x: 29.5,
    //   y: 26,
    //   width: .8,
    //   height: 1,
    //   type: "message",
    //   texture: new Bitmap('assets/message-welcome.png', 1024, 1024)
    // });


    // Messages
    map.addItem({
      x: 28.5,
      y: 11.5,
      width: .8,
      height: 1,
      type: "message",
      showOnMap: true,
      texture: new Bitmap('assets/empathy-is.png', 1024, 1024)
    });


    // Portals
    map.addItem({
      x: 16,
      y: 28.5,
      width: 0.8,
      height: 1,
      texture: new Bitmap('assets/portal.png', 1024, 1024),
      type: "portal",
      showOnMap: true,
      transition: "city"
    });

    map.addItem({
      x: 15.5,
      y: 16,
      width: 0.8,
      height: 1,
      texture: new Bitmap('assets/portal.png', 1024, 1024),
      type: "portal",
      showOnMap: true,
      transition: "wood"
    });

    map.addItem({
      x: 15.5,
      y: 1.5,
      width: 0.8,
      height: 1,
      texture: new Bitmap('assets/portal.png', 1024, 1024),
      type: "portal",
      showOnMap: true,
      transition: "jungle"
    });

    // Tracks
    // map.addItem({
    //   x: 23.5,
    //   y: 23.5,
    //   width: .8,
    //   height: 1,
    //   texture: new Bitmap('assets/item-helix.png', 1024, 1024),
    //   audio: null,
    //   type: "track",
    //   trackName: "Helix",
    //   showOnMap: true,
    //   playing: true
    // });

    // map.addItem({
    //   x: 8.5,
    //   y: 8.5,
    //   width: .8,
    //   height: 1,
    //   texture: new Bitmap('assets/item-tva.png', 1024, 1024),
    //   audio: null,
    //   type: "track",
    //   trackName: "Tva Fontainer",
    //   showOnMap: true,
    //   playing: false
    // });
  }

  // Load the map.
  mapImage.src = "assets/map.png";
}



var countDown = 100;
var resetCountDown = 100;
var startScreen = document.getElementById("start");
var pauseScreen = document.getElementById("pause");

var display = document.getElementById("display");

loop.start(function frame(seconds) {

  if (window.GAME_STARTED) {

    if (window.controls.present) {
      window.IDLE_TIMER = 1200;
    } else {
      if (window.IDLE_TIMER > 1) {
        window.IDLE_TIMER--;
        console.log(window.IDLE_TIMER);
      } else {
        window.location.reload();
      }
    }

    if (window.GAME_OVER) {
      display.className = "game-over";
    }

    if (controls.bothHands) {
      pauseScreen.className = "game-paused";

      if (controls.doublePinch) {
        pauseScreen.className = "game-paused resetting";

        if (resetCountDown > 0) {
          resetCountDown--;
        } else {
          window.location.reload()
        }

      } else {
        resetCountDown = 100;
      }

    } else {
      pauseScreen.className = "";

      map.update(seconds);
      player.update(controls.states, map, seconds, messageQueue);
      messageQueue.update();
      camera.render(player, map);
    }
  } else {

    if (controls.present) {
      // calibrating
      startScreen.className = "calibrating";

      if(countDown > 0) {
        countDown--;
      } else {
        window.startGame();
      }
      console.log(countDown);

    } else {
      startScreen.className = ""
      countDown = 100;
    }

  }

});

// https://soundcloud.com/esaops

// http://www.html5rocks.com/en/tutorials/webaudio/games/#toc-3d

// Soundcloud Stuff
SC.initialize({
  client_id: "e0db2a99463bf202ff2c9448cb174a4b",
  redirect_uri: "http://planete.siloarts.net",
});


SC.stream("/tracks/159679823", function(sound){
  console.log('Track 1 Ready.');
  window.TRACK_ONE = sound;
});

SC.stream("/tracks/159679816", function(sound){
  console.log('Track 2 Ready.');
  window.TRACK_TWO = sound;
});

SC.stream("/tracks/83743704", function(sound){
  console.log('Ambience Track Ready.');
  window.TRACK_RAIN = sound;
  window.TRACK_RAIN.setVolume(75);
  window.TRACK_RAIN.play();
});

// SC.stream("/tracks/293", {
//   autoPlay: true,
//   ontimedcomments: function(comments){
//     console.log(comments[0].body);
//   }
// });



// Begin LEAP Code
require('./leap');


