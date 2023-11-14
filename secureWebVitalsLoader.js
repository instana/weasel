/* eslint-env node */

const fs = require('fs');

module.exports = () => ({
  name: 'secureWebVitalsLoader',
  load(id) {
    if (id.endsWith('web-vitals/dist/web-vitals.js')) {
      const content = fs.readFileSync(id, {encoding: 'utf8'});
      const parts = content.split('export{');
      if (parts.length !== 2) {
        throw new Error('web-vitals module must have changed. Cannot auto-wrap it with try/catch.');
      }
      return `try {${parts[0]}} catch (e) {}export{${parts[1]}`;
    }
  },
});
