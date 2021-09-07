# World Rice Consumption by Country

This visualization uses D3.js, HTML, CSS and Vanilla Javascript to preview World Rice Consumption for each year from 2011 to 2015.

## Datasets

### Rice consumption 
After searching on Google and multiple websites, the most accessible dataset was found on [this website](https://www.helgilibrary.com/indicators/rice-consumption-per-capita/). All was needed was data for each (or nearly each) country for at least one year.<br>
The free download is an Excel spreadsheet with data from 2011 to 2015 (on the free version, but more seems available). <br>
To parse the spreadsheet, `convert-excel-to-json` package was used. All the unecessary data had to be removed from the spreadsheet in order to parse it properly. The converted data was written to a file, then read and written a second time to format the Json objects and obtain the years inside a `data` property.

### Countries
To make sure the map could be drawn, a GeoJson format was the easiest and only way to go in this case. A repository holding a dataset with this format was suggested during the time of the search. No adjustements were needed on the dataset or the file.

### Binding the datasets

Before drawing anything on the screen, we needed to combine the two datasets together. Using a nested `for` loop, add the `data` property from the Rice dataset to the `properties` of the Countries.

## Drawing the map

Following the steps and explanations form [this article](https://observablehq.com/@floledermann/drawing-maps-from-geodata-in-d3), made it really easy. <br>
In the countries dataset, the `features` property contains an array of objects (one object for each country), that in turns contains properties used to draw the map. In the `geometry` property, we can see the `type` and `coordinates` used to draw the map. <br>
In order to draw the map with **geographic coordinates**, we need to create a **map projection** (from [D3.js docs](https://github.com/d3/d3-geo#projections) *"Projections transform spherical polygonal geometry to planar polygonal geometry."*).<br>
`geoMercator` from D3 was used, and `fitExtent()` applied in order for the map to take the available space. D3's `projection()` takes coordinates and return them in *x, y* form. 
To render a set of coordinates from our dataset, we use a **path generator**, which will transform the geometry of a GeoJson object into an SVG `path` value. We can then pass this value to the `d` attribute of the `path` element. <br>
To draw the entire map, we need to `join` the data before using the path generator on the `d` attribute.

## Adding the Rice consumption data

The Rice data is needed only for the `fill` attribute when drawing the map, to display the data inside the tooltip and for the legend. <br>
Because different years can be selected, the function to draw the map and change the year/data dynamically is inside the main `draw` function and takes the selected year as a parameter (using closure). <br>
All the 'parent' DOM elements have to be kept outside of this `choropleth` function to prevent any duplicates of these elements on the screen. 

## References

https://observablehq.com/@floledermann/drawing-maps-from-geodata-in-d3 <br>
https://raw.githubusercontent.com/AshKyd/geojson-regions/master/countries/50m/all.geojson <br>
https://observablehq.com/@thetylerwolf/day-18-join-enter-update-exit