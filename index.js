'use strict';
var config = require('./config'),
  fse = require('co-fs-plus'),
  exec = require('co-exec'),
  co = require('co'),
  schedule = require('node-schedule'),
  koa = require('koa'),
  bodyParser = require('koa-body'),
  Router = require('koa-router'),
  log4js = require('log4js');

// Logger config
log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file(config.logs), 'blog-fetcher');
var logger = log4js.getLogger('blog-fetcher');

// Initialized stats
var stats = {
  hook: {
    latest: null,
    count: 0
  },
  schedule: {
    latest: null,
    count: 0
  },
  check: {
    latest: null,
    count: 0
  }
};

// Creates folder if it doesn't already exist
// Checks if it's a git repo, if it's not it'll try cloning the one in the config
function* repositoryInitialize(config) {
  var result;
  logger.info('Starting repo initialization');

  try {
    logger.info('START mkdirp');
    result = yield fse.mkdirp(config.path);
    logger.info('RESULT mkdirp:', result);
  } catch (err) {
    logger.fatal('ERROR mkdirp:\n', err);
    throw err;
  }

  try {
    logger.info('START checking git repo');
    result = yield exec('git rev-parse --is-inside-work-tree', {
      cwd: config.path
    });
    logger.info('RESULT checking git repo:', (result || '').replace(/(\r\n|\r|\n)$/, ''));
  } catch (err) {
    logger.warn('WARNING repo doesn\'t exist');
    try {
      logger.info('START git clone ' + config.repository);
      var result = yield exec('git clone ' + config.repository + ' .', {
        cwd: config.path
      });
      logger.info('RESULT git clone:', (result || '').replace(/(\r\n|\r|\n)$/, ''));
    } catch (err) {
      logger.fatal('ERROR git clone:\n', err);
      throw err;
    }
  }
  logger.info('Finished repo initialization');
}

// Does git pull on the repo
function* repositoryUpdate(config) {
  var result;
  logger.info('Starting repo update');

  try {
    logger.info('START git pull');
    result = yield exec('git pull', {
      cwd: config.path
    });
    logger.info('RESULT git pull:', (result || '').replace(/(\r\n|\r|\n)$/, ''));
  } catch (err) {
    logger.error('ERROR git pull:\n', err);
    throw err;
  }
  logger.info('Finished repo update');
}

// Initializes repo and checks for updates
co(function* coInitialization() {
  yield repositoryInitialize(config);

  // Check for updates using cron
  // Runs immediately on startup
  schedule.scheduleJob(config.cron, function scheduledJob() {
    co(function* coScheduledJob() {
      stats.schedule.latest = (new Date()).toJSON();
      stats.schedule.count++;
      logger.info('Running scheduled job', stats.schedule.latest);
      yield repositoryUpdate(config);
    })();
  });

})();

// GitHub Hooks
var webhook = new Router();

// Stats
webhook.get(config.hook, function* getHook(next) {
  stats.check.latest = (new Date()).toJSON();
  stats.check.count++;
  this.body = {
    uptime: process.uptime(),
    stats: stats
  };
  yield next;
});

// Hook
webhook.post(config.hook, bodyParser(), function* postHook() {
  // TODO: add SECRET support
  this.status = 200;
  stats.hook.latest = (new Date()).toJSON();
  stats.hook.count++;
  logger.info('Webhook received:\n', this.request.body);
  logger.info('Running webhook update', stats.hook.latest);
  yield repositoryUpdate(config);
});

// Koa app that handles hooks
var app = koa();
app.use(webhook.middleware());
app.listen(config.port);
logger.info('Listening on port', config.port, 'for webhook');
