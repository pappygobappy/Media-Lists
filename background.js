chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('http://localhost:13080', {
    'bounds': {
      'width': 400,
      'height': 500
    }
  });
});