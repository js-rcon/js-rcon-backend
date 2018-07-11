/* eslint-disable no-extend-native */

// Polyfill to globalise String.prototype.replace
String.prototype.replaceAll = function (searchString, replaceString) {
  return this.split(searchString).join(replaceString)
}
