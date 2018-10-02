# Chart.Bands.js

A plugin for Chart.js >= 2.1.3 thats allows banding on a chart

Sometimes when displaying information on a line chart you want to differentiate between values above and below a threshold in a dataset.

For example if showing Fahrenheit tempratures over time you may want to draw attention to values above and below freezing.

This plugin allows you to do that easily and primarily supports line charts, while it also allows for use on bubble charts your mileage may vary dependant on the data

[Preview it in use here](http://codepen.io/Tarqwyn/pen/QNzNVg)

## Configuration

To configure the bands plugin, you can simply add new config options to your chart config.

```javascript
{
	// Container for pan options
    bands: {
        yValue: 10   ,                // The threshold value on the yAxis (default is false)
        bandLine: { 	              // The display properties of the threshold line
            stroke: 0.01, 
            colour: 'rgba(0, 0, 0, 1.000)',
            type: 'solid',            // 'solid' or 'dashed'
            label: '',                 
            fontSize: '12',
            fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
            fontStyle: 'normal'
        },
        belowThresholdColour: [      // An array of the colors that describes the below threshold colour to use the above threshold color is inherited from the dataset
            'rgba(0, 255, 0, 1.000)'
        ]
    }
}
```

## To-do Items
The following features still need to be done:


* To allow more than one band 
* To improve legends when a Band is displayed *Default legends can be a little misleading*

## Installation

To download a zip, go to the Chart.Bands.js on Github

## License

Chart.Band.js is available under the [MIT license](http://opensource.org/licenses/MIT).
