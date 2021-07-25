# World Rice Consumption by Country

This visualization uses D3.js, HTML, CSS and Vanilla Javascript.

## Datasets

### Rice consumption 
After searching on Google and multiple websites, I finally found a dataset on [this website](https://www.helgilibrary.com/indicators/rice-consumption-per-capita/). All was needed was data for each (or nearly each) country for at least one year.<br>
The free download is an Excel spreadsheet with data from 2011 to 2015 (on the free version, but more seems available). <br>
To parse the spreadsheet, `convert-excel-to-json` package was used. All the unecessary data had to be removed from the spreadsheet in order to parse it properly. The converted data was written to a file, then read and written a second time to format the Json objects and obtain the years inside a `data` property.

### Countries
To make sure the map could be drawn, a GeoJson format was the easiest and only way to go in this case. A repository holding a dataset with this format was suggested during the time of the search. No adjustements were needed on the dataset or the file.

## Drawing the map


## Adding the Rice consumption data

## References

https://observablehq.com/@floledermann/drawing-maps-from-geodata-in-d3
https://raw.githubusercontent.com/AshKyd/geojson-regions/master/countries/50m/all.geojson
https://observablehq.com/@thetylerwolf/day-18-join-enter-update-exit