// CSS prefixing
const CSS_PREFIXES = {
  'transform': ['-webkit-transform', '-ms-transform']
};

const generatePrefixes = attributes => {
  const result = {};
  // Loop through the attributes
  Object.keys(attributes).forEach(key => {
    const value = attributes[key];
    // Add the original value to the result
    result[key] = value;
    // If prefixes exists
    if(key in CSS_PREFIXES) {
      const prefixes = CSS_PREFIXES[key];
      // Add values for each prefix to the attributes
      prefixes.forEach(prefix => {
        result[prefix] = value;
      });
    }
  });
  return result;
};

export const generateStyle = attributes => {
  const prefixedAttributes = generatePrefixes(attributes);
  return Object.keys(prefixedAttributes).map(key => {
    const value = prefixedAttributes[key];
    return key + ':' + value + ';';
  }).join('');
};


// Helper functions
export const fullscreen = {
  is: () => {
    const fullscreenElement = document.fullscreenElement ||
                              document.webkitFullscreenElement ||
                              document.mozFullScreenElement ||
                              document.msFullscreenElement;
    return !!fullscreenElement;
  },
  request: e => {
    const req = e.requestFullscreen ||
                e.msRequestFullscreen ||
                e.mozRequestFullScreen ||
                e.webkitRequestFullscreen;
    if(req) {
      req.call(e);
    }
  },
  exit: () => {
    if (document.exitFullscreen) {
    	document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
    	document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
    	document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
    	document.msExitFullscreen();
    }
  },
  addListener: listener => {
    document.addEventListener('fullscreenchange', listener);
    document.addEventListener('webkitfullscreenchange', listener);
    document.addEventListener('mozfullscreenchange', listener);
    document.addEventListener('MSFullscreenChange', listener);
  },
  removeListener: listener => {
    document.removeEventListener('fullscreenchange', listener);
    document.removeEventListener('webkitfullscreenchange', listener);
    document.removeEventListener('mozfullscreenchange', listener);
    document.removeEventListener('MSFullscreenChange', listener);
  }
};
