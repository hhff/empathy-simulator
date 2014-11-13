Utils = require('./utils');

class Camera {
  constructor(canvas, resolution, focalLength) {
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

  render(player, map) {
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
  }

  drawSprites(player, map) {

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
  }

  drawSpriteColumn(player, map, column, sprites) {
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

  }

  drawSky(direction, sky, ambient) {
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
  }

  drawColumns(player, map) {
    this.ctx.save();
    for (var column = 0; column < this.resolution; column++) {
      var x = column / this.resolution - 0.5;
      var angle = Math.atan2(x, this.focalLength);
      var ray = map.cast(player, player.direction + angle, this.range);
      this.drawColumn(column, ray, angle, map, player);
    }
    this.ctx.restore();
  }

  drawColumn(column, ray, angle, map, player) {
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
  }

  project(height, angle, distance) {
    var z = distance * Math.cos(angle);
    var wallHeight = this.height * height / z;
    var bottom = this.height / 2 * (1 + 1 / z);
    return {
      top: bottom - wallHeight,
      height: wallHeight
    };
  }

  drawMiniMap(map, player) {
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
  }
};

module.exports = Camera;


