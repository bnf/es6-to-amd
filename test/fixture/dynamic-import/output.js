define(["require", "Foo"], function (require, Bar) {
    "use strict";
    new Promise(function (resolve) {
        require(["foo.js"], resolve)
    }).then(function(foo) {
        console.log(foo);
    });
});
