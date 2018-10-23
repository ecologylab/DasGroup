const miscHelpers = {}

miscHelpers.uniq = (a) => {

  return Array.from(new Set(a));
}

miscHelpers.uniqId = (a) => {
  a = a.map(a => a.toString() )
  return Array.from(new Set(a));
}

module.exports = miscHelpers;
