# blog-fetcher

### What is this?

App that listens to github webhooks and runs a job on a cron to maintain a git repository updated

### Commands

* `npm start` - run app in production mode
* `npm run dev` - run app in development mode

### Environment Variables

* `LOG_DIR` - directory where logs will be saved, defaults to `HOME`
* `LOG_FILE` - filename for log files, defaults to `blog-fetcher.log`
* `BLOG_DIR` - directory where blog folder is expected to be found, defaults to `HOME`
* `BLOG_FOLDER` - folder inside of `BLOG_DIR` containing blog files, defaults to `./blog`
* `HOOK` - endpoint for github webhooks to use, defaults to `/webhook`
* `HOOK_PORT` - port on which to run server to listen for github webhooks, defaults to `12000`
* `REPOSITORY` - repository to clone, defaults to `git://github.com/cesarandreu/blog.git`
* `FETCHER_CRON` - cron to use for manual fetching, defaults to `0 * * * *`

### How to use

Run `npm start`, go to the github repo's settings, then go to `Webhooks & Services` and `Add webhook`

### Hook endpoint

POSTing to the `HOOK` endpoint will cause it to try and update the repository. Doing a GET will show you some stats.
