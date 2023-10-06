const regex = {
  /* Matches the name that contains only English alphabets and also accepts apostrophe, dot and hyphen symbol. */
  englishCharacterOnly: /^[A-Za-z\s'.-]*$/,
  /* Matches the name word that fisrt letter must be capitalized whether it come after spacebar and that word must not start with apostrophe, dot and hyphen symbol. */
  capitalFirst: /^(\s*(?:[A-Z][a-z'.-]*)\s*)+$/,
  /* Matches the name word that contains one apostrophe and/or one dot and/or hyphen symbol. */
  containsOneSymbol: /^(?!.*[.].*[.])(?!.*['].*['])(?!.*[-].*[-])[A-Za-z\s]*[.'.\\-]?[A-Za-z\s]*$/,
  /* Matches whitespace at the beginning, in between and more than one, or at the end of a string. */
  specialWhitespace: /^\s|\s\s+|\s$/,
};

export default regex;
