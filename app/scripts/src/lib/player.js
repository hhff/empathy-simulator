Utils = require('./utils');

class Player {

  constructor(x, y, direction) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.hasFlashlight = false;
    this.paces = 0;
  }

  rotate(angle) {
    this.direction = (this.direction + angle + Utils.CIRCLE) % (Utils.CIRCLE);
  }

  walk(distance, map) {
    var dx = Math.cos(this.direction) * distance;
    var dy = Math.sin(this.direction) * distance;
    if (map.get(this.x + dx, this.y) <= 0) this.x += dx;
    if (map.get(this.x, this.y + dy) <= 0) this.y += dy;
    this.paces += distance;
  }

  update(controls, map, seconds, messageQueue) {
    if (controls.left) this.rotate(-Math.PI * seconds * controls.left);
    if (controls.right) this.rotate(Math.PI * seconds * controls.right);
    if (controls.forward) this.walk(3 * seconds * controls.forward, map);
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
      if(distanceFromPlayer < 0.8) {
        // Portals
        if (item.type == "portal") {
          switch(item.transition) {
            case "city":
              if(map.addWallAt(17, 28)){
                messageQueue.pushNotification("It is raining in the city;", 'system', 300);
              }
              break;
            case "wood":
              if(map.addWallAt(15, 17)){
                messageQueue.pushNotification("The sky here is relaxing;", 'system', 300);
              }
              break;
            case "jungle":
              if(map.addWallAt(13, 1)){
                messageQueue.pushNotification("You need to concentrate now;", 'system', 300);
              }
          }
        }

        // Pickups
        if (item.type == "pickup") {
          switch(item.name) {
            case "flashlight":
              this.hasFlashlight = true;
              map.removeItem(i);
              if(map.addWallAt(20, 21)){
                messageQueue.pushNotification("You have found a flashlight;", 'system', 300);
              }
              break;
            case "map":
              window.MAP_ENABLED = true;
              map.removeItem(i);
              if(map.addWallAt(3, 11)){
                messageQueue.pushNotification("You have found a map;", 'system', 300);
              }
              break;
            case "freakout":
              window.FREAKOUT_ENABLED = true;
              messageQueue.pushNotification("You are feeling nautious.", 'system', 300);

              map.removeItem(i);
              map.addWallAt(5, 26)

              window.setTimeout(function(){
                messageQueue.pushNotification("You are feeling better now.", 'system', 300);
                window.FREAKOUT_ENABLED = false;
              }, 24000)
              break;

            case "lucid":
              // window.WALL_TEXTURE_ENABLED = false;
              window.WHITE_SKYBOX_ENABLED = true;

              messageQueue.pushNotification("Your thoughts are very clear.", 'system', 300);

              map.removeItem(i);

              window.setTimeout(function(){
                messageQueue.pushNotification("Your senses have dulled.", 'system', 300);
                // window.WALL_TEXTURE_ENABLED = true;
                window.WHITE_SKYBOX_ENABLED = false;
              }, 15000)
              break;
          }
        }

        // Messages
        if (item.type == "message") {
          map.removeItem(i);
          map.addWallAt(28,13)
          window.GAME_OVER = true;
        }

        if (item.type == "hand") {
          map.removeItem(i);
        }

        if (item.type == "last-hand") {
          map.removeItem(i);
          map.removeWallAt(17, 22)
          map.removeWallAt(18, 22)
          map.addWallAt(19,21)
          messageQueue.pushNotification('You came here for no reason;', 'system', 300);
          messageQueue.pushNotification('This was a waste of your time;', 'system', 300);
        }

        if (item.type == "sprite") {
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
  }
};

module.exports = Player;