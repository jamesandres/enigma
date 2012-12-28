// var App = Ember.Application.create();

// App.ApplicationController = Ember.Controller.extend();
// App.ApplicationView = Ember.View.extend({
//   templateName: 'application'
// });

// App.Router = Ember.Router.extend({
//   root: Ember.Route.extend({
//     index: Ember.Route.extend({
//       route: '/'
//     })
//   })
// })

// App.initialize();

/**
 * The enigma?
 */
function Enigma() {
  this.init();
}

Enigma.prototype.init = function (rotorSettings) {
  this.initRotors(rotorSettings);
};

Enigma.prototype.initRotors = function (rotorSettings) {
  var ciphers = [
      // ABCDEFGHIJKLMNOPQRSTUVWXYZ
        'EKMFLGDQVZNTOWYHXUSPAIBRCJ', // 1930, Enigma I (L)
        'AJDKSIRUXBLHWTMCQGZNPYFVOE', // 1930, Enigma I (M)
        'BDFHJLCPRTXVZNYEIWGAKMUSQO', // 1930, Enigma I (R)
        // 'ESOVPZJAYQUIRHXLNFTGKDCMWB', // DEC 1938, M3 Army
        // 'VZBRGITYUPSDNHLXAWMJQOFECK', // DEC 1938, M3 Army
        // 'JPGVOUMFYQBENHZRDKASXLICTW', // 1939, M3 & M4 Naval (FEB 1942)
        // 'NZJHGRCXMYSWBOUFAIVLPEKQDT', // 1939, M3 & M4 Naval (FEB 1942)
        // 'FKQHTLXOCBJSPDZRAMEWNIUYGV'  // 1939, M3 & M4 Naval (FEB 1942)
      ],
      cipher, rotor, prevRotor;

  rotorSettings = rotorSettings || [];

  // Stack the rotors in reverse, this corresponds to how the actual machine's
  // electrical pathway went from R -> M -> L -> REFLECTOR -> L -> M -> R
  for (var i = ciphers.length - 1; i >= 0; i--) {
    cipher = ciphers[i];
    rotor  = new Rotor(cipher, rotorSettings[i] || 0);

    rotor.i = i; // DEBUG

    if (i == ciphers.length - 1) {
      this.firstRotor = rotor;
    }

    if (prevRotor) {
      prevRotor.next = rotor;
      rotor.prev     = prevRotor;
    }

    prevRotor = rotor;
  };

  //                          ABCDEFGHIJKLMNOPQRSTUVWXYZ
  rotor.next = new Reflector('YRUHQSLDPXNGOKMIEBFZCWVJAT');
  rotor.next.prev = rotor;
};

Enigma.prototype.setRotorSettings = function (rotorSettings) {
  var i = 0, rotor = this.firstRotor;

  rotorSettings = rotorSettings || [];

  while (rotor) {
    rotor.setting = rotorSettings[i] || 0;

    rotor = rotor.next;
    i++;
  }
};

Enigma.prototype.encipher = function(string) {
  var chr, val, result = [];

  string = string.toUpperCase().replace(/[^A-Z]/g, '').split('');

  for (var i = 0, len = string.length; i < len; i++) {
    chr = string[i];
    // console.log(chr, 'START enciphering chr'); // DEBUG

    result.push(this.firstRotor.encipher(chr));

    this.firstRotor.rotate();
  };

  return result.join('');
}


/**
 * A rotor.
 */
function Rotor(cipher, setting) {
  this.init(cipher, setting);
}

Rotor.prototype.init = function (cipher, setting) {
  this.setting = setting;
  this.cipher  = cipher.split('');

  this.next = null;
  this.prev = null;
};

Rotor.prototype.rotate = function () {
  this.setting = (this.setting + 1) % 26;

  if (this.setting == 0 && this.next) {
    this.next.rotate();
  }
};

Rotor.prototype.encipher = function (chr, dir) {
  var encipheredChr;

  dir = typeof dir === 'boolean' ? dir : true;

  if (dir) { // Forward
    encipheredChr = this.cipher[(chr.charCodeAt(0) - 65 + this.setting) % 26] || 0;
    // console.log([dir ? '>>' : '<<', chr + ' -> ' + encipheredChr], 'Rotor #' + this.i); // DEBUG
    if (this.next) {
      return this.next.encipher(encipheredChr, dir);
    }
  } else {  // Reverse
    var pos = this.cipher.indexOf(chr) - this.setting;
    pos = pos < 0 ? pos + 26 : pos;
    encipheredChr = String.fromCharCode(pos % 26 + 65) || 0;
    // console.log([dir ? '>>' : '<<', chr + ' -> ' + encipheredChr], 'Rotor #' + this.i); // DEBUG
    if (this.prev) {
      return this.prev.encipher(encipheredChr, dir);
    }
  }

  return encipheredChr;
};

Rotor.prototype.chrPos = function (chr) {
  return ;
}

/**
 * The reflector at the end of the rotor set
 */
function Reflector(cipher) {
  this.cipher  = cipher.split('');

  this.prev = null;
}

Reflector.prototype.rotate = function () {
  // Spins freely, no action taken
};

Reflector.prototype.encipher = function (chr) {
  var mappedChr = this.cipher[(chr.charCodeAt(0) - 65) % 26];
  // console.log(['||', chr + ' -> ' + mappedChr], 'Reflector'); // DEBUG
  return this.prev.encipher(mappedChr, false);
};
