'use strict';

const debug = require('debug')('nightmare:realClick');

module.exports = function realMouse(Nightmare) {
  if (!Nightmare) { Nightmare = require('nightmare'); }

  Nightmare.action(
    'realClick',
    realClickInternal,
    actionOnElementCenter('realClick'));
  Nightmare.action(
    'realMousedown',
    realMousedownInternal,
    actionOnElementCenter('realMousedown'));
  Nightmare.action(
    'realMouseover',
    realMouseoverInternal,
    actionOnElementCenter('realMouseover'));
}

function realMousedownInternal(name, options, parent, window, renderer, done) {
  const LAST_CLICK = Symbol();
  parent.respondTo('realMousedown', function (x, y, done) {
    // check the last click event to see if this is a double-click
    const previous = window[LAST_CLICK] || {};
    const now = Date.now();
    const repeat =
      previous.x === x &&
      previous.y === y &&
      (now - previous.time) < 300;
    let clickCount = repeat ? 2 : 1;
    window[LAST_CLICK] = repeat ? undefined : { x: x, y: y, time: now };

    // DO THE THING!
    window.webContents.sendInputEvent({
      type: 'mousedown',
      x: x,
      y: y,
      clickCount: clickCount
    });
    setTimeout(function () { done(); }, 25);
  });
  done();
}

function realMouseoverInternal(name, options, parent, window, renderer, done) {
  parent.respondTo('realMouseover', function (x, y, done) {
    window.webContents.sendInputEvent({
      // `enter` doesn't directly trigger anything, so use `move`
      type: 'mousemove',
      x: x,
      y: y,
      movementX: 1,
      movementY: 1
    });
    setTimeout(function () { done(); }, 25);
  });
  done();
}

function realClickInternal(name, options, parent, window, renderer, done) {
  const LAST_CLICK = Symbol();
  parent.respondTo('realClick', function (x, y, done) {
    // check the last click event to see if this is a double-click
    const previous = window[LAST_CLICK] || {};
    const now = Date.now();
    const repeat =
      previous.x === x &&
      previous.y === y &&
      (now - previous.time) < 300;
    let clickCount = repeat ? 2 : 1;
    window[LAST_CLICK] = repeat ? undefined : { x: x, y: y, time: now };

    // CLICKITY-CLICK
    window.webContents.sendInputEvent({
      type: 'mousedown',
      x: x,
      y: y,
      clickCount: clickCount
    });
    window.webContents.sendInputEvent({
      type: 'mouseup',
      x: x,
      y: y
    });
    setTimeout(function () { done(); }, 25);
  });
  done();
}

// Utilities
function actionOnElementCenter(actionName) {
  debug("actionOnElementCenter:", actionName);
  return function (point, done) {
    debug("mouse position:", JSON.stringify(point));
    if (typeof point !== 'object') {
      if (done != "function") {
        return;
      }
      return done(new TypeError(`${actionName}: "selector" must be an object`));
    }
    debug(`Finding "${point}"`);
    var child = this.child;
    child.call(actionName, point.x, point.y, done);
  }
}

