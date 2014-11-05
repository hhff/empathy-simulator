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
GameLoop = require('./gameloop');

// Start the Game Loop
var display = document.getElementById('display');
var player = new Player(30.5, 30.5, Math.PI * 1.25);
var map = new Map(32);
var controls = new Controls();
var camera = new Camera(display, Utils.MOBILE ? 160 : 320, 0.8);
var eventBus = new EventBus();
var loop = new GameLoop();

loop.start(function frame(seconds) {
  map.update(seconds);
  player.update(controls.states, map, seconds);
  camera.render(player, map);
});


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

  map.addItem({
    x: 28,
    y: 25,
    width: .5,
    height: .25,
    texture: new Bitmap('assets/item-technoboredom.png', 500, 250)
  });

  map.addItem({
    x: 12,
    y: 9,
    width: .5,
    height: .25,
    texture: new Bitmap('assets/item-disconnect.png', 500, 250)
  });

  map.addItem({
    x: 11,
    y: 9,
    width: .5,
    height: .367,
    texture: new Bitmap('assets/art-face.gif', 500, 367)
  });

  map.addItem({
    x: 30,
    y: 30,
    width: .35,
    height: .8,
    texture: new Bitmap('assets/item-helix.png', 350, 800),
    track: 1,
    playing: true
  });

  map.addItem({
    x: 1,
    y: 1,
    width: .35,
    height: .8,
    texture: new Bitmap('assets/item-tva.png', 350, 800),
    track: 2,
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


// http://www.html5rocks.com/en/tutorials/webaudio/games/#toc-3d

// Soundcloud Stuff
SC.initialize({
  client_id: "e0db2a99463bf202ff2c9448cb174a4b",
  redirect_uri: "http://planete.siloarts.net",
});


SC.stream("/tracks/159679823", function(sound){
  console.log('Track 1 Ready.');
  window.TRACK_ONE = sound;
  window.TRACK_ONE.play();
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



