module.exports = {
  CIRCLE: Math.PI * 2,
  MOBILE: /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent),

  quadrant(x, y, mapSize) {
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