/*
* The main require configuration for paigow.
*
* Taken from <http://requirejs.org/docs/api.html#config>
*
*/
requirejs.config({
    baseUrl: "js",
    paths: {
        'backbone': "lib/backbone-1.1.1.min",
        'bootstrap': "//netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min",
        'jquery': "//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min",
        'underscore': "lib/underscore-1.6.0.min"
    },
    shim: {
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'bootstrap': {
            deps: ['jquery']
        },
        'underscore': {
            exports: '_'
        }
    }
});

define(['pgapp'], function(PGApp) {
    var dummyApp = new PGApp();
});
