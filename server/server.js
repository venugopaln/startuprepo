var loopback = require('loopback');
var boot = require('loopback-boot');

var AutoUpdater = require('auto-updater');

var autoupdater = new AutoUpdater({
 pathToJson: '',
 autoupdate: true,
 checkgit: true,
 jsonhost: 'raw.githubusercontent.com',
 contenthost: 'codeload.github.com',
 progressDebounce: 0,
 devmode: true
});

// State the events 
autoupdater.on('git-clone', function() {
  console.log("You have a clone of the repository. Use 'git pull' to be up-to-date");
});
autoupdater.on('check.up-to-date', function(v) {
  console.info("You have the latest version: " + v);
});
autoupdater.on('check.out-dated', function(v_old, v) {
  console.warn("Your version is outdated. " + v_old + " of " + v);
  autoupdater.fire('download-update'); // If autoupdate: false, you'll have to do this manually. 
  // Maybe ask if the'd like to download the update. 
});
autoupdater.on('update.downloaded', function() {
  console.log("Update downloaded and ready for install");
  //autoupdater.fire('extract'); // If autoupdate: false, you'll have to do this manually. 
});
autoupdater.on('update.not-installed', function() {
  console.log("The Update was already in your folder! It's read for install");
  //autoupdater.fire('extract'); // If autoupdate: false, you'll have to do this manually. 
});
autoupdater.on('update.extracted', function() {
  console.log("Update extracted successfully!");
  console.warn("RESTART THE APP!");
});
autoupdater.on('download.start', function(name) {
  console.log("Starting downloading: " + name);
});
autoupdater.on('download.progress', function(name, perc) {
  process.stdout.write("Downloading " + perc + "% \033[0G");
});
autoupdater.on('download.end', function(name) {
  console.log("Downloaded " + name);
});
autoupdater.on('download.error', function(err) {
  console.error("Error when downloading: " + err);
});
autoupdater.on('end', function() {
  console.log("The app is ready to function");
});
autoupdater.on('error', function(name, e) {
  console.error(name, e);
});

// Start checking 
autoupdater.fire('check');

var app = module.exports = loopback();

app.start = function() {
	/*app.datasources['lb_demo_ds'].autoupdate(['Customer'], function(err) {
		if(err != undefined && err != null){
			console.log(err);
		}else{
			console.log('success');
		}
	});*/
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) {
	  throw err;
  }

  // start the server if `$ node server.js`
  if (require.main === module) {
    app.start();
  }
});