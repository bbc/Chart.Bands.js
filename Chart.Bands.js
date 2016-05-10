/*!
 * Chart.bands.js
 * http://chartjs.org/
 * Version: 0.0.1
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

// Take the bands namespace of Chart
Chart.Bands = Chart.Bands || {};

// Default options if none are provided
var defaultOptions = Chart.Bands.defaults = {
	bands: {
		y: false,
		colours: []
	},
};

function drawBandLine(scale, value, node, left, right) {
	var ctx = node.getContext("2d"),
		yPos = scale.getPixelForValue(value)

	ctx.beginPath();
	ctx.moveTo(left, yPos);
	ctx.lineTo(right, yPos);
	ctx.lineWidth = 1;
	ctx.stroke();
}

function calculateGradientFill(scale, value, height, node, colours) {
	var ctx = node.getContext("2d"),
		yPos = scale.getPixelForValue(value),
		grd = ctx.createLinearGradient(0, height, 0, 0),
		gradientStop = 1 - (yPos / height);

	grd.addColorStop(0, 'rgba(255, 0, 0, 1.000)');
	grd.addColorStop(gradientStop, 'rgba(255, 0, 0, 0.500)');
	grd.addColorStop(gradientStop, 'rgba(0, 255, 0, 0.500)');
	grd.addColorStop(1.00, 'rgba(0, 255, 0, 1.000)');

	return grd;
}


var BandsPlugin = Chart.PluginBase.extend({
	beforeUpdate: function(chartInstance) {
		var node = chartInstance.chart.ctx.canvas,
			options = chartInstance.options,
			band  = helpers.getValueOrDefault(options.bands ? options.bands : undefined, Chart.Bands.defaults.bands),
			fill;
		
		if (typeof band.colours === 'object' && band.colours.length == 2) {
			fill = calculateGradientFill(chartInstance.scales['y-axis-0'], band.y, chartInstance.chart.height,node, band.colours);
			chartInstance.chart.config.data.datasets[0].borderColor = fill;
		}
		console.log('beforeUpdate');
	},

	beforeRender: function(chartInstance) {
		console.log('beforeRender');		
	},

	afterDraw: function(chartInstance) {
		var node = chartInstance.chart.ctx.canvas,
			options = chartInstance.options,
			band  = helpers.getValueOrDefault(options.bands ? options.bands : undefined, Chart.Bands.defaults.bands);

		if (typeof band.y === 'number') {
			drawBandLine(chartInstance.scales['y-axis-0'], band.y, node, chartInstance.chartArea.left, chartInstance.chartArea.right);
		};
		console.log('afterDraw');

	},

	destroy: function(chartInstance) {
		var node = chartInstance.chart.ctx.canvas;
	}

});

Chart.pluginService.register(new BandsPlugin());
},{"Chart":1}]},{},[2]);
