export const urlMaxLength = 255;

export const initiatorTypes = {
  'other': 0,

  'img': 1,
  // IMAGE element inside a SVG
  'image': 1,

  'link': 2,
  'script': 3,
  'css': 4,

  'xmlhttprequest': 5,
  'fetch': 5,
  'beacon': 5,

  'html': 6,
  'navigation': 6
};

export const cachingTypes = {
  unknown: 0,
  cached: 1,
  validated: 2,
  fullLoad: 3
};
