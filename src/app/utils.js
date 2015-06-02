"use strict;"

function getExtension(f) {
    f = typeof(f) === 'string' ? f : f.name;
    var re_ext = /^.*\.(.*)$/;
    var m = f.match(re_ext);
    return m ? m[1].toLowerCase() : null;
}

function getName(f) {
  if (typeof(f) !== 'string')
      f = f.name;
  var parts = f.split('/');
  return parts[parts.length - 1];
}

// class UID {
//   constructor() {
//     this.ID = 0
//   }

//   next() {
//     this.ID++;
//     console.log(this.ID);
//     return this.ID;
//   }
// }

function UID() {
    this.ID = 0;
}

UID.prototype.next = function() {
    this.ID++;
    console.log(this.ID);
    return this.ID;
}

module.exports = {
  getName: getName,
  getExtension: getExtension,
  UID: UID
}