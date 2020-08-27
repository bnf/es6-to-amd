define(["require"], function (require) {
    "use strict";

    Promise.all([
        new Promise(function (resolve, reject) {
            require(["foo.js"], function(module) { resolve(typeof module === "object" ? Object.defineProperty(module, "default", {value: module, enumerable: false}) : {default: module}) }, reject)
        }),
        new Promise(function (resolve, reject) {
            require(["bar.js"], function(module) { resolve(typeof module === "object" ? Object.defineProperty(module, "default", {value: module, enumerable: false}) : {default: module}) }, reject)
        })
    ]).then(values => {
        console.log(values);
    });

    new Promise(function (resolve, reject) {
        require(["foo.js"], function(module) { resolve(typeof module === "object" ? Object.defineProperty(module, "default", {value: module, enumerable: false}) : {default: module}) }, reject)
    }).then(() => {
        return new Promise(function (resolve, reject) {
            require(["bar.js"], function(module) { resolve(typeof module === "object" ? Object.defineProperty(module, "default", {value: module, enumerable: false}) : {default: module}) }, reject)
        });
    });
});

