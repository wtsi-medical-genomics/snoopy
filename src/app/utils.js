"use strict;"

var RE_EXT = /^.*\.(.*)$/;
var RE_LEFT_SLASH = /\/(.*)/;
var RE_RIGHT_SLASH = /(.*)\//;

function getExtension(f) {
    f = typeof(f) === 'string' ? f : f.name;
    var m = f.match(RE_EXT);
    return m ? m[1].toLowerCase() : null;
}

function getName(f) {
  if (typeof(f) !== 'string')
      f = f.name;
  var parts = f.split('/');
  return parts[parts.length - 1];
}

function arrayStringContains(el, arr) {
  console.log(el);
  console.log(typeof(el));
  if (typeof(el) === 'undefined' || el === null || el.length === 0)
    return false;
  el = el.toLowerCase();
  for (var i=0; i<arr.length; ++i) {
    console.log(i)
    if (el === arr[i].toLowerCase())
      return true;
  }
}

function combineServerPath(server, path) {
  server = server.match(RE_LEFT_SLASH)[1];
  path = path.match(RE_RIGHT_SLASH)[1];
  return server + '/' + path;
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
  UID: UID,
  arrayStringContains: arrayStringContains
}