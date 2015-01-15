class Controls {
  constructor() {
    this.codes  = { 37: 'left', 39: 'right', 38: 'forward', 40: 'backward' };
    this.states = { 'left': false, 'right': false, 'forward': false, 'backward': false };
    this.present = false;
    this.bothHands = false;
    this.doublePinch = false;

    document.addEventListener('keydown', this.onKey.bind(this, 1), false);
    document.addEventListener('keyup', this.onKey.bind(this, false), false);

    document.addEventListener('handStream', this.updateHand.bind(this));
  }

  updateHand(e) {
    var handState = e.detail;

    this.bothHands = handState.bothHands;
    this.doublePinch = handState.doublePinch;


    if (handState.present) {
      this.present = true;
      this.states.left = Math.max(handState.x.rangeMap(-30, -200, 0, 1), handState.angle.rangeMap(-15, -120, 0, 1), handState.roll.rangeMap(20, 200, 0, 1));
      this.states.right = Math.max(handState.x.rangeMap(30, 200, 0, 1), handState.angle.rangeMap(15, 120, 0, 1), handState.roll.rangeMap(-20, -200, 0, 1));

      if (handState.pitch < 65) {
        this.states.forward = handState.grip.rangeMap(0.6, 1.2, 0, 1);
        this.states.backward = false;
      } else {
        this.states.backward = handState.grip.rangeMap(0.6, 1.2, 0, 1);
        this.states.forward = false;
      }
      // this.states.forward = handState.grip.rangeMap(0.6, 1.2, 0, 1);
      // this.states.backward = handState.pitch.rangeMap(0, 120, 0, 1);

    } else {
      this.states.left = false;
      this.states.right = false;
      this.states.forward = false;
      this.states.backward = false;
    }
  }

  onKey(val, e) {
    var state = this.codes[e.keyCode];
    if (typeof state === 'undefined') return;
    this.states[state] = val;
    e.preventDefault && e.preventDefault();
    e.stopPropagation && e.stopPropagation();
  }
};

module.exports = Controls;