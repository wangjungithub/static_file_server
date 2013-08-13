#!/usr/bin/env node

/*jslint forin:true sub:true anon:true sloppy:true stupid:true nomen:true node:true continue:true*/

/*
 * Copyright (c) 2012, Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

var fs = require("fs");
var path = require("path");
var nopt = require("nopt");
var express = require("express");
var log4js = require("log4js");

log4js.setGlobalLogLevel("INFO");
var logger = log4js.getLogger("FileServer");

var debug = false;
var serverHost = "localhost";
var serverPort = 10000;
var arrowAddress = "";
var docRoot = "/";
var parsed = nopt();

//setting appRoot
global.appRoot = path.resolve(__dirname, "..");

//help messages
function showHelp() {
    console.info("Static file server\n");
    console.info("Usage: fileserver.js --root=<docRoot>");
}

if (parsed.help) {
    showHelp();
    process.exit(0);
}

if (parsed["debug"]) {
    debug = true;
}

if (parsed["root"]) {
    docRoot = parsed["root"];
    if (docRoot.indexOf("/", docRoot.length - 1) === -1) {
        docRoot = docRoot + "/";
    }
} else {
    docRoot = "/";
}

var app = express();
app.use(express.logger());
app.use(express.cookieParser());
app.use(express.bodyParser());

var mimes = {
    "css": "text/css",
    "js": "text/javascript",
    "htm": "text/html",
    "html": "text/html",
    "ico": "image/vnd.microsoft.icon",
    "jpg": "image/jpeg",
    "gif": "image/gif",
    "png": "image/png",
    "xml": "text/xml"
};

function serveStatic(pathname, req, res) {
    console.log("Serve " + pathname + "\n");
    if (pathname.indexOf("..") > -1) {
        res.writeHead(404);
        res.end("Related path is not allowed", "utf-8");
    }
    fs.readFile(pathname, function (error, content) {
        var tmp,
            ext,
            mime;

        if (error) {
            res.writeHead(404);
            res.end("Error loading file " + pathname + ": " + error, "utf-8");
        } else {
            tmp = pathname.lastIndexOf(".");
            ext = pathname.substring((tmp + 1));
            mime = mimes[ext] || "text/plain";

            res.writeHead(200, {"Content-Type": mime});
            res.end(content);
        }
    });
}


// file server
app.get("/static/*", function (req, res) {
    serveStatic(docRoot + req.params[0], req, res);
});

app.listen(serverPort);
console.log("Server running at: " + "localhost");

process.on("uncaughtException", function (err) {
    console.log("Uncaught exception: " + err);
    process.exit();
});
process.on("SIGINT", function () {
    console.log("sigINT caught");
    process.exit();
});
process.on("exit", function (err) {
    console.log("Good bye!");
});

