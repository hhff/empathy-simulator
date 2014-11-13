var $__Object$defineProperties = Object.defineProperties;

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
  var Bitmap = function() {
    "use strict";

    function Bitmap(src, width, height) {
      this.image = new Image();
      this.image.src = src;
      this.width = width;
      this.height = height;
    }

    return Bitmap;
  }();

  module.exports = Bitmap;
},{}],2:[function(require,module,exports){
  Utils = require('./utils');

  var Camera = function() {
    "use strict";

    function Camera(canvas, resolution, focalLength) {
      this.ctx = canvas.getContext('2d');
      this.width = canvas.width = window.innerWidth * 0.5;
      this.height = canvas.height = window.innerHeight * 0.5;
      this.resolution = resolution;
      this.spacing = this.width / resolution;
      this.focalLength = focalLength || 0.8;
      this.fov = Math.PI * .4;
      this.range = Utils.MOBILE ? 8 : 14;
      this.lightRange = 1.75;
      this.maxLightRange = 8;
      this.scale = (this.width + this.height) / 1200;
    }

    $__Object$defineProperties(Camera.prototype, {
      render: {
        value: function(player, map) {
          if(player.hasFlashlight && this.lightRange != 8) {
            this.lightRange += 0.2;
          }

          var currentQuadrant = Utils.quadrant(player.x, player.y, map.size);
          var skybox = map['skybox'+currentQuadrant];

          if(window.WHITE_SKYBOX_ENABLED){
            skybox = map.whiteSkybox;
          }

          if(!window.FREAKOUT_ENABLED) {
            this.drawSky(player.direction, skybox, map.light);
          }

          this.drawColumns(player, map);

          this.ctx.save();
          this.drawSprites(player,map);
          this.ctx.restore();


          if(window.MAP_ENABLED) {
            this.drawMiniMap(map, player);
          }
          // this.drawWeapon(player.weapon, player.paces);
        },

        enumerable: false,
        writable: true
      },

      drawSprites: {
        value: function(player, map) {

          var screenWidth = this.width;
          var screenHeight = this.height;
          var resolution = this.resolution;
          var screenRatio = screenWidth / this.fov;
          var camera = this;
          var ctx = this.ctx;

          var sprites = Array.prototype.slice.call(map.items)

          sprites = sprites.map(function(sprite){

            var distX = sprite.x - player.x;
            var distY = sprite.y - player.y;
            var width = sprite.width * screenWidth / sprite.distanceFromPlayer;
            var height = sprite.height * screenHeight /  sprite.distanceFromPlayer;
            var angleToPlayer = Math.atan2(distY,distX);
            var angleRelativeToPlayerView = player.direction - angleToPlayer;
            var top = (screenHeight / 2) * (1 + 1 / sprite.distanceFromPlayer) - height;

            if(angleRelativeToPlayerView >= Utils.CIRCLE / 2){
              angleRelativeToPlayerView -= Utils.CIRCLE;
            }

            var cameraXOffset = ( camera.width / 2 ) - (screenRatio * angleRelativeToPlayerView);
            var numColumns = width / screenWidth * resolution;
            var firstColumn = Math.floor( (cameraXOffset - width/2 ) / screenWidth * resolution);

            sprite.distanceFromPlayer = Math.sqrt( Math.pow( distX, 2) + Math.pow( distY, 2) );

            sprite.render = {
              width: width,
              height: height,
              angleToPlayer: angleRelativeToPlayerView,
              cameraXOffset: cameraXOffset,
              distanceFromPlayer: sprite.distanceFromPlayer,
              numColumns: numColumns,
              firstColumn: firstColumn,
              top: top
            };

            return sprite;
          })
          // Sort sprites by distance?

          camera.ctx.save();
          for (var column = 0; column < this.resolution; column++) {
            this.drawSpriteColumn(player, map, column, sprites);
          }
          camera.ctx.restore();
        },

        enumerable: false,
        writable: true
      },

      drawSpriteColumn: {
        value: function(player, map, column, sprites) {
          var ctx = this.ctx;
          var left = Math.floor(column * this.spacing);
          var width = Math.ceil(this.spacing);
          var angle = this.fov * (column / this.resolution - 0.5);
          var columnWidth = this.width / this.resolution;
          var sprite;
          var spriteIsInColumn;
          var textureX;

          for(var i = 0; i < sprites.length; i++){
            sprite = sprites[i];
            spriteIsInColumn =  left > sprite.render.cameraXOffset - ( sprite.render.width / 2 ) && left < sprite.render.cameraXOffset + ( sprite.render.width / 2 );

            if(spriteIsInColumn) {

              textureX = Math.floor( sprite.texture.width / sprite.render.numColumns * ( column - sprite.render.firstColumn ) );
              ctx.fillStyle = 'black';
              ctx.globalAlpha = 1;

              var brightness = Math.max(sprite.distanceFromPlayer / this.lightRange - map.light, 0) * 100;
              sprite.texture.image.style.webkitFilter = 'brightness(' + brightness + '%)';
              sprite.texture.image.style.filter = 'brightness(' + brightness  + '%)';
              ctx.drawImage(sprite.texture.image, textureX, 0, 1, sprite.texture.height, left, sprite.render.top, width, sprite.render.height);
            }
          }

        },

        enumerable: false,
        writable: true
      },

      drawSky: {
        value: function(direction, sky, ambient) {
          var width = sky.width * (this.height / sky.height) * 2;
          var left = (direction / Utils.CIRCLE) * -width;

          this.ctx.save();
          this.ctx.drawImage(sky.image, left, 0, width, this.height);
          if (left < width - this.width) {
            this.ctx.drawImage(sky.image, left + width, 0, width, this.height);
          }
          if (ambient > 0) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.globalAlpha = ambient * 0.1;
            this.ctx.fillRect(0, this.height * 0.5, this.width, this.height * 0.5);
          }
          this.ctx.restore();
        },

        enumerable: false,
        writable: true
      },

      drawColumns: {
        value: function(player, map) {
          this.ctx.save();
          for (var column = 0; column < this.resolution; column++) {
            var x = column / this.resolution - 0.5;
            var angle = Math.atan2(x, this.focalLength);
            var ray = map.cast(player, player.direction + angle, this.range);
            this.drawColumn(column, ray, angle, map, player);
          }
          this.ctx.restore();
        },

        enumerable: false,
        writable: true
      },

      drawColumn: {
        value: function(column, ray, angle, map, player) {
          var ctx = this.ctx;

          var currentQuadrant = Utils.quadrant(player.x, player.y, map.size);
          var texture = map['wallTexture'+currentQuadrant];

          var left = Math.floor(column * this.spacing);
          var width = Math.ceil(this.spacing);
          var hit = -1;

          while (++hit < ray.length && ray[hit].height <= 0);

          for (var s = ray.length - 1; s >= 0; s--) {
            var step = ray[s];

            var rainDrops = Math.pow(Math.random(), 3) * s;
            var rain = (rainDrops > 0) && this.project(0.1, angle, step.distance);

            if (s === hit) {
              var textureX = Math.floor(texture.width * step.offset);
              var wall = this.project(step.height, angle, step.distance);

              ctx.globalAlpha = 1;

              if(window.WALL_TEXTURE_ENABLED) {
                ctx.drawImage(texture.image, textureX, 0, 1, texture.height, left, wall.top, width, wall.height);
              }

              ctx.fillStyle = '#000000';
              ctx.globalAlpha = Math.max((step.distance + step.shading) / this.lightRange - map.light, 0);
              ctx.fillRect(left, wall.top, width, wall.height);
            }

            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = 0.15;

            if(window.RAIN_ENABLED) {
              while (--rainDrops > 0) ctx.fillRect(left, Math.random() * rain.top, 1, rain.height);
            }
          }
        },

        enumerable: false,
        writable: true
      },

      project: {
        value: function(height, angle, distance) {
          var z = distance * Math.cos(angle);
          var wallHeight = this.height * height / z;
          var bottom = this.height / 2 * (1 + 1 / z);
          return {
            top: bottom - wallHeight,
            height: wallHeight
          };
        },

        enumerable: false,
        writable: true
      },

      drawMiniMap: {
        value: function(map, player) {
          var ctx = this.ctx;
          var mapWidth = this.width * 0.25;
          var mapHeight = mapWidth;
          var x = this.width - mapWidth - 20;
          var y = 20;
          var blockWidth = mapWidth / map.size;
          var blockHeight = mapHeight / map.size;
          var playerX = player.x / map.size * mapWidth;
          var playerY = player.y / map.size * mapWidth;
          var origFillStyle = ctx.fillStyle;
          var wallIndex;
          var triangleX = x + playerX;
          var triangleY = y + playerY;

          // Draw Map
          ctx.save();
          ctx.globalAlpha = .3;
          ctx.fillRect(x, y, mapWidth, mapHeight);
          ctx.globalAlpha = .4;
          ctx.fillStyle = '#ffffff';

          for (var row = 0; row < map.size; row++) {
            for (var col = 0; col < map.size; col++) {
              wallIndex = row * map.size + col;
              if (map.wallGrid[wallIndex]) {
                ctx.fillRect(x + (blockWidth * col), y + (blockHeight * row), blockWidth, blockHeight);
              }
            }
          }

          // Draw Items on Map
          ctx.save();
          for (var i = 0; i < map.items.length; i++){
            if(map.items[i]){
              ctx.fillStyle = map.items[i].color || 'blue';
              ctx.globalAlpha = .8;
              ctx.fillRect(x + (blockWidth * map.items[i].x) + blockWidth * .25, y + (blockHeight * map.items[i].y) + blockWidth * .25, blockWidth * .5, blockHeight * .5);
            }
          }

          // Draw Player
          ctx.restore();

          ctx.globalAlpha = 1;
          ctx.fillStyle = '#FF0000';
          ctx.moveTo(triangleX,triangleY);
          ctx.translate(triangleX,triangleY);

          ctx.rotate(player.direction - Math.PI * .5);
          ctx.beginPath();
          ctx.lineTo(-2, -3); // bottom left of triangle
          ctx.lineTo(0, 2); // tip of triangle
          ctx.lineTo(2,-3); // bottom right of triangle
          ctx.fill();

          ctx.restore();
        },

        enumerable: false,
        writable: true
      }
    });

    return Camera;
  }();

  module.exports = Camera;
},{"./utils":11}],3:[function(require,module,exports){
  var Controls = function() {
    "use strict";

    function Controls() {
      this.codes  = { 37: 'left', 39: 'right', 38: 'forward', 40: 'backward' };
      this.states = { 'left': false, 'right': false, 'forward': false, 'backward': false };
      document.addEventListener('keydown', this.onKey.bind(this, true), false);
      document.addEventListener('keyup', this.onKey.bind(this, false), false);
    }

    $__Object$defineProperties(Controls.prototype, {
      onKey: {
        value: function(val, e) {
          var state = this.codes[e.keyCode];
          if (typeof state === 'undefined') return;
          this.states[state] = val;
          e.preventDefault && e.preventDefault();
          e.stopPropagation && e.stopPropagation();
        },

        enumerable: false,
        writable: true
      }
    });

    return Controls;
  }();

  module.exports = Controls;
},{}],4:[function(require,module,exports){
  var EventBus = function() {
    "use strict";

    function EventBus(src, width, height) {
      this.stack = new Array();
    }

    $__Object$defineProperties(EventBus.prototype, {
      trigger: {
        value: function(eventName) {
          for(var i = 0; i < this.stack.length; i++) {
            var item = this.stack[i];
            if(item.eventName == eventName) {
              item.callback.apply(item.context);
            }
          }
        },

        enumerable: false,
        writable: true
      },

      on: {
        value: function(eventName, context, callback) {
          this.stack.push({
            eventName: eventName,
            context: context,
            callback: callback
          })
        },

        enumerable: false,
        writable: true
      }
    });

    return EventBus;
  }();

  module.exports = EventBus;
},{}],5:[function(require,module,exports){
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




},{"./bitmap":1,"./camera":2,"./controls":3,"./event-bus":4,"./gameloop":6,"./map":8,"./message-queue":9,"./player":10,"./utils":11}],6:[function(require,module,exports){
  var GameLoop = function() {
    "use strict";

    function GameLoop() {
      this.frame = this.frame.bind(this);
      this.lastTime = 0;
      this.callback = function() {};
    }

    $__Object$defineProperties(GameLoop.prototype, {
      start: {
        value: function(callback) {
          this.callback = callback;
          requestAnimationFrame(this.frame);
        },

        enumerable: false,
        writable: true
      },

      frame: {
        value: function(time) {
          var seconds = (time - this.lastTime) / 1000;
          this.lastTime = time;
          if (seconds < 0.2) this.callback(seconds);
          requestAnimationFrame(this.frame);
        },

        enumerable: false,
        writable: true
      }
    });

    return GameLoop;
  }();

  module.exports = GameLoop;
},{}],7:[function(require,module,exports){
  var Item = function() {
    "use strict";

    function Item(attributes) {
      for(var prop in attributes){
        this[prop] = attributes[prop];
      }
    }

    return Item;
  }();

  module.exports = Item;
},{}],8:[function(require,module,exports){
  Bitmap = require('./bitmap');
  Item = require('./item');

  var Map = function() {
    "use strict";

    function Map(size) {
      this.size = size;
      this.wallGrid = new Uint8Array(size * size);

      this.whiteSkybox = new Bitmap('assets/skybox-white.jpg', 2844, 914);
      this.skybox0 = new Bitmap('assets/skybox.jpg', 2844, 914);
      this.skybox1 = new Bitmap('assets/skybox-tiles.jpg', 2844, 914);
      this.skybox2 = new Bitmap('assets/skybox-city.jpg', 2844, 914);
      this.skybox3 = new Bitmap('assets/skybox.jpg', 2844, 914);

      // Ideas

      // PNG Walls look cool
      // Neon Everything

      this.wallTexture0 = new Bitmap('assets/wall_texture_wood.jpg', 1024, 1024);
      this.wallTexture1 = new Bitmap('assets/wall_texture_tile.jpg', 1024, 1024);
      this.wallTexture2 = new Bitmap('assets/wall_texture_brick.jpg', 1024, 1024);
      this.wallTexture3 = new Bitmap('assets/wall_texture_stone.jpg', 1024, 1024);

      this.light = 0;
      this.items = new Array();
    }

    $__Object$defineProperties(Map.prototype, {
      get: {
        value: function(x, y) {
          x = Math.floor(x);
          y = Math.floor(y);
          if (x < 0 || x > this.size - 1 || y < 0 || y > this.size - 1) return -1;
          return this.wallGrid[y * this.size + x];
        },

        enumerable: false,
        writable: true
      },

      randomize: {
        value: function() {
          for (var i = 0; i < this.size * this.size; i++) {
            this.wallGrid[i] = Math.random() < 0.3 ? 1 : 0;
          }
        },

        enumerable: false,
        writable: true
      },

      addWallAt: {
        value: function(x, y) {
          var gridIndex = (y * this.size) + x

          if(this.wallGrid[gridIndex] == 0) {
            this.wallGrid[gridIndex] = 1
            return true
          }else{
            console.log('there is a wall there already')
            return false
          }
        },

        enumerable: false,
        writable: true
      },

      removeWallAt: {
        value: function(x, y) {
          var gridIndex = (y * this.size) + x

          if(this.wallGrid[gridIndex] == 1) {
            this.wallGrid[gridIndex] = 0
            return true
          }else{
            console.log('there is no wall to remove')
            return false
          }
        },

        enumerable: false,
        writable: true
      },

      addItem: {
        value: function(x, y, texture) {
          this.items.push(new Item(x, y, texture));
        },

        enumerable: false,
        writable: true
      },

      removeItem: {
        value: function(index) {
          this.items.splice(index, 1);
        },

        enumerable: false,
        writable: true
      },

      cast: {
        value: function(point, angle, range) {
          var self = this;
          var sin = Math.sin(angle);
          var cos = Math.cos(angle);
          var noWall = { length2: Infinity };

          return ray({ x: point.x, y: point.y, height: 0, distance: 0 });

          function ray(origin) {
            var stepX = step(sin, cos, origin.x, origin.y);
            var stepY = step(cos, sin, origin.y, origin.x, true);
            var nextStep = stepX.length2 < stepY.length2
              ? inspect(stepX, 1, 0, origin.distance, stepX.y)
              : inspect(stepY, 0, 1, origin.distance, stepY.x);

            if (nextStep.distance > range) return [origin];
            return [origin].concat(ray(nextStep));
          }

          function step(rise, run, x, y, inverted) {
            if (run === 0) return noWall;
            var dx = run > 0 ? Math.floor(x + 1) - x : Math.ceil(x - 1) - x;
            var dy = dx * (rise / run);
            return {
              x: inverted ? y + dy : x + dx,
              y: inverted ? x + dx : y + dy,
              length2: dx * dx + dy * dy
            };
          }

          function inspect(step, shiftX, shiftY, distance, offset) {
            var dx = cos < 0 ? shiftX : 0;
            var dy = sin < 0 ? shiftY : 0;
            step.height = self.get(step.x - dx, step.y - dy);
            step.distance = distance + Math.sqrt(step.length2);
            if (shiftX) step.shading = cos < 0 ? 2 : 0;
            else step.shading = sin < 0 ? 2 : 1;
            step.offset = offset - Math.floor(offset);
            return step;
          }
        },

        enumerable: false,
        writable: true
      },

      update: {
        value: function(seconds) {
          if(window.LIGHTNING_ENABLED) {
            if (this.light > 0) this.light = Math.max(this.light - 10 * seconds, 0);
            else if (Math.random() * 5 < seconds) this.light = 2;
          }
        },

        enumerable: false,
        writable: true
      }
    });

    return Map;
  }();

  module.exports = Map;
},{"./bitmap":1,"./item":7}],9:[function(require,module,exports){
  var MessageQueue = function() {
    "use strict";

    function MessageQueue() {
      this.messages = {
                        system: []
                      };
    }

    $__Object$defineProperties(MessageQueue.prototype, {
      pushNotification: {
        value: function(message, type, timer) {
          this.messages[type].push({message: message, timeRemaining: timer});
        },

        enumerable: false,
        writable: true
      },

      update: {
        value: function() {
          for (var queueName in this.messages) {
            this.buildDOM(queueName, this.messages[queueName]);
          }
        },

        enumerable: false,
        writable: true
      },

      buildDOM: {
        value: function(queueName, queue) {
          var container = document.getElementById(queueName+"-messages");

          while (container.hasChildNodes()){
            container.removeChild(container.lastChild);
          }

          for (var index in queue) {
            var messageData = queue[index];
            var text = messageData['message'];
            var message = document.createElement("div");
            message.textContent = text
            container.appendChild(message);
            messageData['timeRemaining']--

            if (messageData['timeRemaining'] <= 0){
              queue.splice(index, 1);
            }
          }
        },

        enumerable: false,
        writable: true
      }
    });

    return MessageQueue;
  }();

  module.exports = MessageQueue;
},{}],10:[function(require,module,exports){
  Utils = require('./utils');

  var Player = function() {
    "use strict";

    function Player(x, y, direction) {
      this.x = x;
      this.y = y;
      this.direction = direction;
      this.hasFlashlight = false;
      this.paces = 0;
    }

    $__Object$defineProperties(Player.prototype, {
      rotate: {
        value: function(angle) {
          this.direction = (this.direction + angle + Utils.CIRCLE) % (Utils.CIRCLE);
        },

        enumerable: false,
        writable: true
      },

      walk: {
        value: function(distance, map) {
          var dx = Math.cos(this.direction) * distance;
          var dy = Math.sin(this.direction) * distance;
          if (map.get(this.x + dx, this.y) <= 0) this.x += dx;
          if (map.get(this.x, this.y + dy) <= 0) this.y += dy;
          this.paces += distance;
        },

        enumerable: false,
        writable: true
      },

      update: {
        value: function(controls, map, seconds, messageQueue) {
          if (controls.left) this.rotate(-Math.PI * seconds);
          if (controls.right) this.rotate(Math.PI * seconds);
          if (controls.forward) this.walk(3 * seconds, map);
          if (controls.backward) this.walk(-3 * seconds, map);

          if(Utils.quadrant(this.x, this.y, map.size) == 2) {
            window.RAIN_ENABLED = true
          }else {
            window.RAIN_ENABLED = false
          }


          for (var i = 0; i < map.items.length; i++) {
            var item = map.items[i];

            var distX = item.x - this.x;
            var distY = item.y - this.y;
            var distanceFromPlayer = Math.sqrt( Math.pow( distX, 2) + Math.pow( distY, 2) );

            // @@@ ITEMS @@@ //


            // HANDLE NON COLLISION CALS HERE

            if (item.type == "track") {

              switch(item.trackName) {
                case "Helix":
                  item.audio = window.TRACK_ONE;
                  break;
                case "Tva Fontainer":
                  item.audio = window.TRACK_TWO;
                  break;

              }
              if (item.audio) {
                item.audio.setVolume(distanceFromPlayer.rangeMap(0, 17, 100, 0));
              }
            }



            // ON COLISION
            if(distanceFromPlayer < 0.2) {
              // Portals
              if (item.type == "portal") {
                switch(item.transition) {
                  case "city":
                    if(map.addWallAt(17, 30)){
                      messageQueue.pushNotification("It is raining in the city", 'system', 300);
                    }
                    break;
                  case "wood":
                    console.log("wood!")
                    break;
                }
              }

              // Pickups
              if (item.type == "pickup") {
                switch(item.name) {
                  case "flashlight":
                    this.hasFlashlight = true;
                    map.removeItem(i);
                    messageQueue.pushNotification("You have found a flashlight;", 'system', 300);
                    break;
                  case "map":
                    console.log("MAP!")
                    break;
                  case "freakout":
                    window.FREAKOUT_ENABLED = true;
                    messageQueue.pushNotification("You are feeling nautious.", 'system', 300);

                    map.removeItem(i);

                    window.setTimeout(function(){
                      messageQueue.pushNotification("You are feeling better now.", 'system', 300);
                      window.FREAKOUT_ENABLED = false;
                    }, 24000)
                    break;

                  case "lucid":
                    window.WALL_TEXTURE_ENABLED = false;
                    window.WHITE_SKYBOX_ENABLED = true;

                    messageQueue.pushNotification("Your thoughts are very clear.", 'system', 300);

                    map.removeItem(i);

                    window.setTimeout(function(){
                      messageQueue.pushNotification("Your senses have dulled.", 'system', 300);
                      window.WALL_TEXTURE_ENABLED = true;
                      window.WHITE_SKYBOX_ENABLED = false;
                    }, 15000)
                    break;
                }
              }

              // Messages
              if (item.type == "message") {
                map.removeItem(i);
              }

              // Tracks
              if (item.type == "track") {
                if(!item.audio.playState) {
                  item.audio.play();
                  messageQueue.pushNotification(item.trackName+" Has started playing", 'system', 300);

                  if (map.removeWallAt(22, 21)) {
                    map.addWallAt(28, 21);
                    messageQueue.pushNotification('A door has been opened;', 'system', 300);
                  }
                }
              }
            }

          }

          if (window.LOG_POSITION) {
            console.log("postion:" + this.x +" "+ this.y)
          }
        },

        enumerable: false,
        writable: true
      }
    });

    return Player;
  }();

  module.exports = Player;
},{"./utils":11}],11:[function(require,module,exports){
module.exports = {
  CIRCLE: Math.PI * 2,
  MOBILE: /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent),

  quadrant: function quadrant(x, y, mapSize) {
    var xDif = (x / mapSize);
    var yDif = (y / mapSize);

    if(xDif >= 0.5 ) {
      if( yDif >= 0.5 )
        return 3;
      else
        return 1;
    }
    else {
      if( yDif >= 0.5 )
        return 2;
      else
        return 0;
    }
  }

};
},{}]},{},[5]);