'use strict';

export default function($el, selector) {
  while ($el) {
    // @see https://www.caniuse.com/#search=matches
    const res = (
      $el.matches || $el.webkitMatchesSelector || $el.msMatchesSelector || $el.oMatchesSelector  || $el.mozMatchesSelector
    ).call($el, selector);

    if (res) {
      return $el;
    }

    $el = $el.parentElement || $el.parentNode;
    if ($el == null) {
      break;
    }

    const tagName = $el.tagName.toLowerCase();
    if (tagName === 'body' || tagName === 'html') {
      break;
    }
  }

  return null;
}