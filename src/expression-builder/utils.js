const isEqual = require('lodash.isequal');

/**
 * incrementCharacter takes a String character and increments it's value by 1
 *
 * @param  {String} char    Single string character
 *
 * @return {String}         Incremented string character
 */
const incrementCharacter = char => String.fromCharCode(char.charCodeAt(0) + 1);

/**
 * getMapKeyFromValue takes in a value and a javascript Map data structure
 * and loops through the map's entries until it finds the first value
 * in the map that matches the given value and returns the key that is
 * associated with it
 *
 * @param  {any} val    The value whose key we want to pull out of the given map
 *
 * @param  {Map} map    A Map to search
 *
 * @return {any}        The key that matches the given value or undefined if not found
 */
const getMapKeyFromValue = (val, map) => {
    for (let [k, v] of map.entries()) {
        if (isEqual(v, val)) return k;
    }
};

module.exports = { incrementCharacter, getMapKeyFromValue };
