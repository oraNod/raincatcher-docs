var spawn = require('child_process').spawn;
var yargs = require('yargs');
var fs = require('fs');
var path = require('path');
const fse = require('fs-extra')
var ghpages = require('gh-pages');
var moment = require('moment');

var pageRoot = './website';
var ascidocsPath = '../docs/workforce-management-framework/upstream-1';
var docRoot = path.join(__dirname, ascidocsPath).normalize()

yargs.usage('Usage: $0 <command>')
    .command('asciidocs-build',
    'Build asciidocs documentation. Requires: asciidoctor', function(yargs) {
    }, asciidocsHandler)
    .command('apidocs-build', 'Copy documentation folder', function(yargs) {
    }, apiHandler)
    .command('publish', 'Publish website to github pages', function(yargs) {
    }, publishHandler)
    .demandCommand()
    .help()
    .argv;


function apiHandler(argv) {
    return copyApiFiles();
}

function publishHandler(argv) {
    return publishWebsite();
}

function asciidocsHandler(argv) {
    return buildAsciDocs(function(err) {
        if (err) {
            console.log("Failed to build ascidocs page", err);
            return process.exit(1);
        }
        console.log("Created documentation file");
        fse.moveSync(path.join(docRoot, "master.html"), pageRoot + '/docs/index.html',
            { overwrite: true });
        fse.copySync(path.join(docRoot, "/topics/shared/images"), pageRoot + '/docs/images',
            { overwrite: true });
        console.log("Documentation copied to website");
    });
}

function publishWebsite() {
    var options = {
        branch: 'gh-pages',
        remote: 'origin',
        dotfiles: 'true'
    }
    ghpages.publish(pageRoot, options, function(err) {
        if (err) {
            return console.error("Page failed to publish", err);
        }
        console.info("Page published");
    });
}

function copyApiFiles() {
    fse.copySync('./api',  pageRoot + '/api', { overwrite: true });
    console.log("Created api documentation");
};

function buildAsciDocs(cb) {
    var args = ['master.adoc'];
    var process = spawn('asciidoctor', args, { cwd: docRoot });
    process.on('message', function(message) {
        console.info("Asciidocs", message);
    });
    process.on('error', function(message) {
        console.error("Asciidocs", message);
    });
    process.on('close', function(status) {
        if (status === 0) {
            cb && cb();
        } else {
            cb && cb(new Error("Command failed with status " + status));
        }
    });
}
