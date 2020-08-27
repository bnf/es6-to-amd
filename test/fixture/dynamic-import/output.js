define(["require", "Foo"], function (require, Bar) {
    "use strict";
    new Promise(function (resolve, reject) {
        require(["foo.js"], function(module) { resolve(typeof module === "object" ? Object.defineProperty(module, "default", {value: module, enumerable: false}) : {default: module}) }, reject)
    }).then(function(foo) {
        console.log(foo);
    });
    new Promise(function (resolve, reject) {
        require(["bar" + ".js"], function(module) { resolve(typeof module === "object" ? Object.defineProperty(module, "default", {value: module, enumerable: false}) : {default: module}) }, reject)
    }).then(function (bar) {
        console.log(bar.default);
    });
    var dynamic = "foobar";
    async function bar() {
        var foo = await new Promise(function (resolve, reject) {
            require([dynamic], function(module) { resolve(typeof module === "object" ? Object.defineProperty(module, "default", {value: module, enumerable: false}) : {default: module}) }, reject)
        });
        console.log(foo);
    }
});
