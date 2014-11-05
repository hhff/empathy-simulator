class Item {
  constructor(attributes) {
    for(var prop in attributes){
      this[prop] = attributes[prop];
    }
  }
};

module.exports = Item;