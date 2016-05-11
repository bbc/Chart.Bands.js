/*!
 * Chart.bands.js
 * http://chartjs.org/
 * Version: v0.1.0
 *
 * Copyright 2016 BBC
 * Released under the MIT license
 * https://github.com/BBC/Chart.bands.js/blob/master/LICENSE.md
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
// Get the chart variable
var Chart = require('Chart');
Chart = typeof(Chart) === 'function' ? Chart : window.Chart;
var helpers = Chart.helpers;
var supportedTypes = {
    'bubble': true,
    'line': true
};
var isSupported = true;

// Take the bands namespace of Chart
Chart.Bands = Chart.Bands || {};

// Default options if none are provided
var defaultOptions = Chart.Bands.defaults = {
    bands: {
        yValue: false,
        bandLine: {
            stroke: 0.01,
            colour: 'rgba(0, 0, 0, 1.000)',
            type: 'solid'
        },
        baseColorGradientColor: [
            'rgba(0, 255, 0, 1.000)'
        ]
    }
};
function addBandLine(ctx, scale, constraints ,options) {
    var yPos = scale.getPixelForValue(options.yValue),
        bandLine    = helpers.getValueOrDefault(options.bandLine ? options.bandLine : undefined, Chart.Bands.defaults.bands.bandLine);
    
    if (bandLine.type == 'dashed') {
        for (var i = constraints.start; i < constraints.stop; i = i + 6) {
            drawBandLine(ctx, yPos, i, i + 4, bandLine.stroke, bandLine.colour);
        };
    } else {
        drawBandLine(ctx, yPos, constraints.start, constraints.stop, bandLine.stroke, bandLine.colour);
    }
    // To Do - weord bug lets do some research
    addBandLineLabel(ctx, bandLine.label);
}

function drawBandLine(ctx, yPos, start, stop, stroke, colour) {
    ctx.beginPath();
    ctx.moveTo(start, yPos);
    ctx.lineTo(stop, yPos);
    ctx.lineWidth = stroke;
    ctx.strokeStyle = colour;
    ctx.stroke();
}

function addBandLineLabel(ctx, label) {

    if(label != undefined) {
          console.log('draw label');
          ctx.font = "48px serif";
          ctx.fillText(label, 0, 0);
    }
}

function calculateGradientFill(ctx, scale, height, borderColor, gradientColor, value) {
    var yPos = scale.getPixelForValue(value),
        grd = ctx.createLinearGradient(0, height, 0, 0),
        gradientStop = 1 - (yPos / height);

    grd.addColorStop(0, borderColor);
    grd.addColorStop(gradientStop, borderColor);
    grd.addColorStop(gradientStop, gradientColor);
    grd.addColorStop(1.00, gradientColor);

    return grd;
}

function isPluginSupported(type) {
    
    if (!!supportedTypes[type]) {
        return;
    }
    console.warn('The Chart.Bands.js plugin is not supported with chart type ' + type);
    isSupported = false
    
}

var BandsPlugin = Chart.PluginBase.extend({
    beforeInit: function (chartInstance) {
        isPluginSupported(chartInstance.config.type);
    },

    afterScaleUpdate: function(chartInstance) {
        var node    = chartInstance.chart.ctx.canvas,
            options = chartInstance.options,
            band    = helpers.getValueOrDefault(options.bands ? options.bands : undefined, Chart.Bands.defaults.bands),
            borderColor,
            fill;

   
        
        if (typeof band.baseColorGradientColor === 'object' && band.baseColorGradientColor.length > 0 && typeof band.yValue === 'number') {

            if(isSupported == false) { return ;}

            for (var i = 0; i < chartInstance.chart.config.data.datasets.length; i++) {
                borderColor = chartInstance.chart.config.data.datasets[i].borderColor;
                fill = calculateGradientFill(
                                        node.getContext("2d"),
                                        chartInstance.scales['y-axis-0'],
                                        chartInstance.chart.height,
                                        borderColor,
                                        band.baseColorGradientColor[i],
                                        band.yValue
                                    );
                chartInstance.chart.config.data.datasets[i].borderColor = fill;
            };
        } else {
            console.warn('ConfigError: The Chart.Bands.js config seems incorrect');
        }
    },

    afterDraw: function(chartInstance) {
        var node        = chartInstance.chart.ctx.canvas,
            options     = chartInstance.options,
            bandOptions = helpers.getValueOrDefault(options.bands ? options.bands : undefined, Chart.Bands.defaults.bands);

        if(isSupported == false) { return ;}

        if (typeof bandOptions.yValue === 'number') {
            addBandLine(
                node.getContext("2d"),
                chartInstance.scales['y-axis-0'],
                {
                    'start': chartInstance.chartArea.left,
                    'stop': chartInstance.chartArea.right
                },
                bandOptions
            );
        } else {
            console.warn('ConfigError: The Chart.Bands.js plugin config requires a yValue');
        }
    },


});

Chart.pluginService.register(new BandsPlugin());
},{"Chart":1}]},{},[2]);
