"use strict;"

var Promise = require('es6-promise').Promise;

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

function getPrefix(connection) {
  switch (connection.get('type')) {
    case 'HTTP':
      return connection.get('location') + '/';
    case 'SSHBridge':
      return connection.get('localHTTPServer') + '/' + '?user=' + connection.get('username') + '&server=' + connection.get('remoteSSHServer') + '&path=';
    default:
      throw 'Connection type not recognized: ' + connection.get('type');
  }
}

function getURL(path, connection) {
  // console.log(connection)
  // console.log(path)
  return getPrefix(connection) + path;
}

// function getRequiresCredentials(settings, connection) {
//   switch (connection) {
//     case 'remoteHTTP':
//       return settings.servers.remoteHTTP.requiresCredentials;
//     case 'localHTTP':
//     case 'SSHBridge':
//       return false;
//   }
// }

function httpGet(path, connection) {

  return new Promise((resolve, reject) => {
    console.log(path);
    console.log(connection);
    if (typeof(path) === 'undefined')
      reject('No path provided');
    if (typeof(connection) === 'undefined')
      reject('Invalid remote connection parameters provided');
    var url = getURL(path, connection);
    var request = new XMLHttpRequest();
    request.open('GET', url);
    request.withCredentials = connection.requiresCredentials || false;
    
    request.onload = () => {
      if (request.status >= 200 && request.status < 400) {
        resolve(request.responseText);
      } else {
        // We reached our target server, but it returned an error
        reject('The path: ' + path + ' does not match with connection: ' + JSON.stringify(connection))
      }
    }

    // Handle network errors
    request.onerror = () => {
      reject("Network Error");
    };

    request.send();
  });
}

function localTextGet(file) {
  return new Promise((resolve, reject) => {
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      resolve(reader.result);
    }
    reader.onerror = () => {
      reject(reader.error);
    }
  });
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
    return this.ID;
}

module.exports = {
  getName: getName,
  getExtension: getExtension,
  UID: UID,
  arrayStringContains: arrayStringContains,
  combineServerPath: combineServerPath,
  httpExists: httpExists,
  getURL: getURL,
  // getRequiresCredentials: getRequiresCredentials,
  httpGet: httpGet,
  localTextGet: localTextGet
}