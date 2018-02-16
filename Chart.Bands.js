/*!
 * Chart.bands.js
 * Version: v0.5.1-rc
 *
 * Copyright 2016 BBC
 * Released under the MIT license
 * https://github.com/BBC/Chart.bands.js/blob/master/LICENSE.md
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
var Chart, helpers, supportedTypes, addLegendColourHelper, isSupported, colourProfile, defaultOptions;

//setup
Chart = require('Chart');
Chart = typeof(Chart) === 'function' ? Chart : window.Chart;
helpers = Chart.helpers;
isSupported = true;
colourProfile = 'borderColor';
baseColor = [];

supportedTypes = {
    'bubble': 'backgroundColor',
    'line': 'borderColor'
};
addLegendColourHelper = {
    'borderColor': 'backgroundColor',
    'backgroundColor': 'borderColor'
};
Chart.Bands = Chart.Bands || {};

defaultOptions = Chart.Bands.defaults = {
    bands: {
        yValue: false,
        bandLine: {
            stroke: 0.01,
            colour: 'rgba(0, 0, 0, 1.000)',
            type: 'solid',
            label: '',
            fontSize: '12',
            fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
            fontStyle: 'normal',
            xPos: 'top',
            yPos: 'left'
        },
        belowThresholdColour: [
            'rgba(0, 255, 0, 1.000)'
        ]
    }
};

function addBandLine (ctx, scale, constraints, options) {
    var yPos = scale.getPixelForValue(options.yValue);
    var bandLine = options.bandLine;
    var dashLength = 8;
    var padding = 0;
    var lineStartPos = constraints.start + padding;
    var lineStopPos = constraints.stop + padding;

    var lineDrawer = bandLine.type === 'dashed' ? drawDashedLine : drawLine;

    lineDrawer(ctx, yPos + (bandLine.stroke / 4), lineStartPos, lineStopPos, bandLine.stroke, bandLine.colour, dashLength);
    if (bandLine.label) {
        addBandLineLabel(ctx, constraints, options.bandLine, dashLength, lineDrawer);
    }
}

function addBandLineLabel(ctx, constraints, bandLine, dashLength, lineDrawer) {
        ctx.font = helpers.fontString(bandLine.fontSize, bandLine.fontStyle, bandLine.fontFamily);
        ctx.fillStyle = bandLine.fontColour || 'black';

        var textLength = ctx.measureText(bandLine.label).width;
        var labelLineLength = 20
        var labelYPos = bandLine.yPos === 'top' ? constraints.top - (bandLine.fontSize * 2) - 8 : constraints.bottom + (bandLine.fontSize * 2) + 8;
        var labelXPos = bandLine.xPos === 'left' ? constraints.start + labelLineLength : constraints.stop - textLength;
        var labelLineYPos = labelYPos - (bandLine.stroke * 0.25);
        var labelLineXPos = labelXPos - 30;

        ctx.fillText(bandLine.label, labelXPos, labelYPos);

        lineDrawer(ctx, labelLineYPos, labelLineXPos, labelLineXPos + labelLineLength, bandLine.stroke, bandLine.colour, dashLength);
}

function drawDashedLine(ctx, y, x0, x1, lineWidth, colour, dashLength) {
    var length = dashLength || 6;

    var dashGapRatio = 0.666;
    var gap = length * dashGapRatio;
    var dashDistance = length + gap;

    for (var dashStart = x0; dashStart < x1; dashStart = dashStart + dashDistance) {
        var dashEnd = dashStart + dashLength;
        drawLine(ctx, y, dashStart, dashEnd, lineWidth, colour);
    }
}

function drawLine (ctx, y, x0, x1, lineWidth, colour) {
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x1, y);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = colour;
    ctx.stroke();
}

function pluginBandOptionsHaveBeenSet (bandOptions) {
    return (typeof bandOptions.belowThresholdColour === 'object' && bandOptions.belowThresholdColour.length > 0 && typeof bandOptions.yValue === 'number');
}

function calculateGradientFill (ctx, scale, height, baseColor, gradientColor, value) {
    var yPos = scale.getPixelForValue(value),
        grd = ctx.createLinearGradient(0, height, 0, 0),
        gradientStop = 1 - (yPos / height);

    try {
        grd.addColorStop(0, gradientColor);
        grd.addColorStop(gradientStop, gradientColor);
        grd.addColorStop(gradientStop, baseColor);
        grd.addColorStop(1.00, baseColor);

        return grd;
    } catch (e) {
        console.warn('ConfigError: Chart.Bands.js had a problem applying one or more colors please check that you have selected valid color strings');
        return baseColor;
    }
}

function isPluginSupported (type) {

    if (!!supportedTypes[type]) {
        colourProfile = supportedTypes[type];
        return;
    }
    console.warn('Warning: The Chart.Bands.js plugin is not supported with chart type ' + type);
    isSupported = false;
}

var BandsPlugin = Chart.PluginBase.extend({
    beforeInit: function (chartInstance) {
        isPluginSupported(chartInstance.config.type);
        // capture the baseColors so we can reapply on resize.
        for (var i = 0; i < chartInstance.chart.config.data.datasets.length; i++) {
            baseColor[i] = chartInstance.chart.config.data.datasets[i][colourProfile];
        }
    },

    afterScaleUpdate: function (chartInstance) {
        var node,
            bandOptions,
            fill;

        if(isSupported === false) { return ; }

        node = chartInstance.chart.ctx.canvas;
        bandOptions = helpers.configMerge(Chart.Bands.defaults.bands, chartInstance.options.bands);
        if (pluginBandOptionsHaveBeenSet(bandOptions)) {
            for (var i = 0; i < chartInstance.chart.config.data.datasets.length; i++) {
                // Don't reapply the fill if it has already been applied (in which case it will no longer be of type String
                if (typeof baseColor[i] === 'string') {
                    fill = calculateGradientFill(
                        node.getContext("2d"),
                        chartInstance.scales['y-axis-0'],
                        chartInstance.chart.height,
                        baseColor[i],
                        bandOptions.belowThresholdColour[i],
                        bandOptions.yValue
                    );
                    chartInstance.chart.config.data.datasets[i][colourProfile] = fill;
                }
            }
        } else {
            console.warn('ConfigError: The Chart.Bands.js config seems incorrect');
        }
    },

    afterDraw: function(chartInstance) {
        var node,
            bandOptions;

        if(isSupported === false) { return ;}

        node = chartInstance.chart.ctx.canvas;
        bandOptions = helpers.configMerge(Chart.Bands.defaults.bands, chartInstance.options.bands);

        if (typeof bandOptions.yValue === 'number') {
            addBandLine(
                node.getContext("2d"),
                chartInstance.scales['y-axis-0'],
                {
                    'top': chartInstance.chartArea.top,
                    'bottom': chartInstance.boxes[2].bottom,
                    'start': chartInstance.chartArea.left,
                    'stop': chartInstance.chartArea.right,
                },
                bandOptions
            );

        } else {
            console.warn('ConfigError: The Chart.Bands.js plugin config requires a yValue');
        }
    }
});

Chart.pluginService.register(new BandsPlugin());


},{"Chart":1}]},{},[2]);
