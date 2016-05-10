// To Do - Are baselines even useful with anything other than a Line chart?? Andy??

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

// To Do - The line needs to be configurable (colour, weight) - We should pass the entire object in to here
function drawBandLine(scale, value, node, left, right) {
    var ctx = node.getContext("2d"),
        yPos = scale.getPixelForValue(value)

    ctx.beginPath();
    ctx.moveTo(left, yPos);
    ctx.lineTo(right, yPos);
    ctx.lineWidth = 1;
    ctx.stroke();
}

// To Do - Should take the baseColor and apply the gradient colour.
function calculateGradientFill(scale, value, height, node, colours) {
    var ctx = node.getContext("2d"), // Maybe ctx should be the argument
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
        
        // To Do - So this should loop through all DataSets
        // To do throw a meaningful error
        if (typeof band.colours === 'object' && band.colours.length == 2) {
            fill = calculateGradientFill(chartInstance.scales['y-axis-0'], band.y, chartInstance.chart.height,node, band.colours);
            chartInstance.chart.config.data.datasets[0].borderColor = fill;
        }
    },

    // We should only have one baseline otherwise its not a baseline
    afterDraw: function(chartInstance) {
        var node = chartInstance.chart.ctx.canvas,
            options = chartInstance.options,
            band  = helpers.getValueOrDefault(options.bands ? options.bands : undefined, Chart.Bands.defaults.bands);

        // To do throw a meaningful error
        if (typeof band.y === 'number') {
            drawBandLine(chartInstance.scales['y-axis-0'], band.y, node, chartInstance.chartArea.left, chartInstance.chartArea.right);
        };

    },

    // Do I need??
    destroy: function(chartInstance) {
        var node = chartInstance.chart.ctx.canvas;
    }

});

Chart.pluginService.register(new BandsPlugin());