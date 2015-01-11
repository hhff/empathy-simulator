// Vendor Libs Modernizr, Soundcloud, Firebase

// Game Variables
window.LIGHTING_ENABLED = false;
window.RAIN_ENABLED = false;
window.FREAKOUT_ENABLED = false;
window.MAP_ENABLED = true;
window.WALL_TEXTURE_ENABLED = true;
window.WHITE_SKYBOX_ENABLED = false;
window.LOG_POSITION = false;

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
var map = new Map(32);
var controls = new Controls();
var camera = new Camera(display, Utils.MOBILE ? 160 : 320, 0.8);
var eventBus = new EventBus();
var messageQueue = new MessageQueue();
var loop = new GameLoop();

loop.start(function frame(seconds) {
  map.update(seconds);
  player.update(controls.states, map, seconds, messageQueue);
  messageQueue.update();
  camera.render(player, map);
});

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

  // map.addItem({
  //   x: 15,
  //   y: 14,
  //   width: .35,
  //   height: .8,
  //   texture: new Bitmap('assets/item-flashlight.png', 350, 800)
  // });


  // Flash Light
  // Map

  // Abilities:
    // Learn Empathy
    // Disconnect

  // Pickups
  map.addItem({
    x: 11.5,
    y: 25.5,
    width: 0.8,
    height: 1,
    type: "pickup",
    name: "freakout",
    texture: new Bitmap('assets/pickup-freakout.png', 1024, 1024)
  });

  map.addItem({
    x: 11.5,
    y: 11.5,
    width: 0.8,
    height: 1,
    type: "pickup",
    name: "lucid",
    texture: new Bitmap('assets/pickup-lucid.png', 1024, 1024)
  });

  map.addItem({
    x: 3,
    y: 30.5,
    width: 0.8,
    height: 1,
    type: "pickup",
    name: "flashlight",
    texture: new Bitmap('assets/pickup-flashlight.png', 1024, 1024)
  });

  // Art
  map.addItem({
    x: 3,
    y: 28,
    width: 0.8,
    height: 1,
    type: "art",
    texture: new Bitmap('assets/art-guru.png', 1024, 1024)
  });

  // Messages
  map.addItem({
    x: 29.5,
    y: 26,
    width: .8,
    height: 1,
    type: "message",
    texture: new Bitmap('assets/message-welcome.png', 1024, 1024)
  });


  // Portals
  map.addItem({
    x: 16,
    y: 30.5,
    width: 0.8,
    height: 1,
    texture: new Bitmap('assets/portal.png', 1024, 1024),
    type: "portal",
    transition: "city"
  });

  map.addItem({
    x: 15.5,
    y: 16,
    width: 0.8,
    height: 1,
    texture: new Bitmap('assets/portal.png', 1024, 1024),
    type: "portal",
    transition: "wood"
  });

  // Tracks
  map.addItem({
    x: 23.5,
    y: 23.5,
    width: .8,
    height: 1,
    texture: new Bitmap('assets/item-helix.png', 1024, 1024),
    audio: null,
    type: "track",
    trackName: "Helix",
    playing: true
  });

  map.addItem({
    x: 8.5,
    y: 8.5,
    width: .8,
    height: 1,
    texture: new Bitmap('assets/item-tva.png', 1024, 1024),
    audio: null,
    type: "track",
    trackName: "Tva Fontainer",
    playing: false
  });

  eventBus.trigger('gameLoaded');
}


// Add Range Map
Number.prototype.rangeMap = function ( in_min , in_max , out_min , out_max ) {
  number = ( this - in_min ) * ( out_max - out_min ) / ( in_max - in_min ) + out_min;
  if(number < 0){
    number = 0
  }
  return number;
}


var gameLoaded = function() {
  console.log('gameHasLoaded');
}

eventBus.on('gameLoaded', window, gameLoaded);

// Load the map.
mapImage.src = "assets/map.png";





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



