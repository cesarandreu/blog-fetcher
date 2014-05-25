'use strict';

var path = require('path');
module.exports = {
  repository: process.env.REPOSITORY||'git://github.com/cesarandreu/blog.git',
  logs: path.resolve((process.env.LOG_DIR||process.env.HOME), (process.env.LOG_FILE||'blog-fetcher.log')),
  path: path.resolve((process.env.BLOG_DIR||process.env.HOME), (process.env.BLOG_FOLDER||'blog')),
  hook: process.env.HOOK || '/webhook',
  port: process.env.HOOK_PORT || 12000,
  cron: process.env.FETCHER_CRON||'0 * * * *'
};
