// https://github.com/eggheadio-github/stack-overflow-copy-paste/blob/master/src/slugify.js
export default (text) =>
  text
    .toString()
    .toLowerCase()
    .trim() // Trim whitespaces at start and end of text
    .replace(/\s+/g, '-') // Replace whitespaces with dash (-)
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple dashes/hyphens with single dash (-)
    .replace(/^-+/, '') // Remove dash (-) from start of text
    .replace(/-+$/, '') // Remove dash (-) from end of text
