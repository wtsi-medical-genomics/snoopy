"use strict;"

var RE_EXT = /^.*\.(.*)$/;
var RE_LEFT_SLASH = /^\/+/;
var RE_RIGHT_SLASH = /\/+$/;

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
  server = server.replace(RE_RIGHT_SLASH, '');
  path = path.replace(RE_LEFT_SLASH, '');
  return server + '/' + path;
}

function httpExists(url, credentials) {
  if (typeof(credentials) === 'undefined')
    credentials = false;
  var exists;
  var request = new XMLHttpRequest();
  request.open('GET', url, false);
  request.setRequestHeader('Range', 'bytes=0-1');
  request.withCredentials = credentials;
  request.onload = () => {
    if (request.status >= 200 && request.status < 400) {
      // Success!
      console.log('it exists');
      exists = true;
    } else {
      // We reached our target server, but it returned an error
      console.log('it does not exist');
      exists = false;
    }
  }
  request.send();
  return exists;
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
  arrayStringContains: arrayStringContains,
  combineServerPath: combineServerPath,
  httpExists: httpExists
}