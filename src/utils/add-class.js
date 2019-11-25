'use strict';

export function addClass(el, c) {
  if (hasClass(el, c)) {
    return;
  }
  if (el.classList) {
    el.classList.add(c);
  } else {
    el.className += ' ' + c;
  }
}

export function hasClass(el, c) {
  return new RegExp('(\\s|^)' + c + '(\\s|$)').test(el.className);
}

export function removeClass(el, c) {
  if (el.classList) {
    el.classList.remove(c);
  } else {
    el.className = el.className.replace(new RegExp('\\b' + c + '\\b'), '');
  }
}