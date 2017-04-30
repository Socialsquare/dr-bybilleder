const assert = require('assert');
const fs = require('fs');
const jsdom = require('jsdom');
const path = require('path');

const CLIENT_BUILD_PATH = path.join(__dirname, 'client', 'build');
assert.ok(fs.existsSync(CLIENT_BUILD_PATH), 'Build the client first');
const CLIENT_INDEX_PATH = path.join(CLIENT_BUILD_PATH, 'index.html');

const INDEX_CONTENT = fs.readFileSync(CLIENT_INDEX_PATH, 'utf-8');

const index = {
  appendMetatags: metatags => {
    const doc = jsdom.jsdom(INDEX_CONTENT);
    // Find the <head> element
    const head = doc.documentElement.querySelector('head');
    // Append all the meta propeties
    Object.keys(metatags).forEach(property => {
      const content = metatags[property];
      const meta = doc.createElement('meta');
      meta.setAttribute('property', property);
      meta.setAttribute('content', content);
      head.appendChild(meta);
    });
    return jsdom.serializeDocument(doc);
  }
};

module.exports = index;
