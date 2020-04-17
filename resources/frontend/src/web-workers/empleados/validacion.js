var document = { 'createElementNS': function() { return {} } };
var window = this;
importScripts(
    '../../../scripts/pdfmake.min.js',
    '../../../scripts/vfs_fonts.js',
    '../../../scripts/moment.min.js'
);
//importScripts('../logos.js');

(function() {
    'use strict';

    onmessage = function(evt) {
        let data = JSON.parse(evt.data);
        console.log(data);
        //pdf(data);
        //fechas();
    };
});