Utils = require('./utils');

class Player {

  constructor(x, y, direction) {
    this.x = x;
    this.y = y;
    this.direction = direction;
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

  update(controls, map, seconds) {
    if (controls.left) this.rotate(-Math.PI * seconds);
    if (controls.right) this.rotate(Math.PI * seconds);
    if (controls.forward) this.walk(3 * seconds, map);
    if (controls.backward) this.walk(-3 * seconds, map);

    for (var i = 0; i < map.items.length; i++) {
      var item = map.items[i];

      var distX = item.x - this.x;
      var distY = item.y - this.y;
      var distanceFromPlayer = Math.sqrt( Math.pow( distX, 2) + Math.pow( distY, 2) );


      // For "Track" Items only
      if (item.track) {
        var track;
        if(item.track == 1){
          track = window.TRACK_ONE;
        } else if(item.track == 2){
          track = window.TRACK_TWO;
        }

        if (track){
          track.setVolume(distanceFromPlayer.rangeMap(0, 38, 100, 0));

          if(distanceFromPlayer < 0.1 && !track.playState) {
            track.play();
            console.log('track started');
          }
        }

      }

      // For Regular Items
      if(distanceFromPlayer < 0.1) {
        console.log('collision')
        // TODO - Trigger Something.
        // map.removeItem(i);
      }
    }

    if (window.LOG_POSITION) {
      console.log("postion:" + this.x +" "+ this.y)
    }
  }
};

module.exports = Player;