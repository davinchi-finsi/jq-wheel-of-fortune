/*! jqWheelOfFortune | (c) Davinchi | https://gitlab.com/davinchi/games/jq-wheel-of-fortune */
( function (factory) {
    if (typeof define === "function" && define.amd) {

        // AMD. Register as an anonymous module.
        define([
            "jquery",
            "../widget"
        ], factory);
    } else {

        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    $.widget(
        "ui.jqWheelOfFortune", {
            NAMESPACE: "jqWheelOfFortune",
            QUERY_HEADER: "[data-jq-wof-header]",
            options: {
                classes: {//css classes for elements

                }
            },
            /**
             * @constructor
             * @private
             */
            _create: function () {
                this._getElements();
            },
            _getElements:function(){

            }
        }
    );
    return $.ui.jqWheelOfFortune;
}) );