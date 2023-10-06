const regex = {
  /* Matches the name that contains only English alphabets and also accepts apostrophe symbol and dot symbol. */
  englishCharacterOnly: /^[A-Za-z\s'.]*$/,
  /* Matches the name word that fisrt letter must be capitalized whether it come after spacebar and that word must not start with apostrophe symbol and dot symbol. */
  capitalFirst: /^(\s*(?:[A-Z][a-z'.]*)\s*)+$/,
  /* Matches the name word that contains one apostrophe symbol and/or one dot symbol. */
  containsOneSymbol: /^(?!.*[.].*[.])[A-Za-z\s]*[.']?[A-Za-z\s]*$/,
  /* Matches whitespace at the beginning, in between and more than one, or at the end of a string. */
  specialWhitespace: /^\s|\s\s+|\s$/,
};

export default regex;
