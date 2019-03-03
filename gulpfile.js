const { src, dest, watch, lastRun, series, parallel } = require('gulp')
const axe = require('axe-core')
const through = require('through2')
const WebDriver = require('selenium-webdriver')
const fileURL = require('file-url')
const AxeBuilder = require('axe-webdriverjs')
const reporter = require('./lib/reporter.js')
require('chromedriver')


const axeTest = (done) => {
  const driver = new WebDriver.Builder().forBrowser('chrome').build();

  const bufferStream = (chunk, enc, callback) => {
    if(chunk.isNull()) {
      done();
    };
    if(chunk.isStream()) {
      driver.quit();
      done();
    }

    new Promise( resolve => {
      driver
        .get(fileURL(chunk.path))
        .then( () => {
          new AxeBuilder(driver)
            .analyze((err, results) => {
              if(err) {
                resolve(undefined)
                return;
              }
              results.url = chunk.path.replace(__dirname, '');
              resolve(results);
            });
        })
    })
    .then( results => {
      reporter(results, 0);
    })
  }
  const createResults = (cb) => {
    const dest = '';
    driver.quit();
    cb();
  }

  return through.obj(bufferStream, createResults)
}

const a11y = (done) => {
  return src('source/**/*.html')
    .pipe(axeTest(done))
}

exports.a11y = a11y;