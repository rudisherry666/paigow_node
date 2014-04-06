/*
*
* @class PGBrowserUtils
*
* This file returns a bunch of utils good in the browser.
*/

// A defer that's already resolved so we don't have to keep creating it.
// Resolve it with something that identifies it as ours in case some
// coding error things it's something else.
var utilsResolvedDefer = $.Deferred();
utilsResolvedDefer.resolve("PGBrowserUtils resolved defer");

define([], function() {
    return {
        // From http://stackoverflow.com/questions/15191058/css-rotation-cross-browser-with-jquery-animate
        animateRotate: function($element, angleBegin, angleEnd) {
            var defer = $.Deferred();

            // we use a pseudo object for the animation
            // (starts from `0` to `angle`), you can name it as you want
            $({deg: angleBegin}).animate({deg: angleEnd}, {
                duration: 800,
                step: function(now) {
                    // in the step-callback (that is fired each step of the animation),
                    // you can use the `now` paramter which contains the current
                    // animation-position (`0` up to `angle`)
                    $element.css({
                        transform: 'rotate(' + now + 'deg)'
                    });
                },
                complete: function() {
                    defer.resolve();
                }
            });

            return defer.promise();
        },

        resolvedDefer: utilsResolvedDefer.promise()
    };
});

