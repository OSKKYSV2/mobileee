// Ionic výchozí nastavení + Angular parser pro šablony (správně formátuje @if / @for).
const ionic = require('@ionic/prettier-config');

module.exports = {
  ...ionic,
  overrides: [...ionic.overrides, { files: '*.html', options: { parser: 'angular' } }],
};
