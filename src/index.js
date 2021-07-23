import * as d3 from 'd3';
import 'regenerator-runtime/runtime';

async function draw() {
    // SVG and container dimensions
    const dimensions = {
        width: 1300,
        height: 1200,
        margin: 20
    }

    dimensions.containerWidth = dimensions.width - dimensions.margin * 2;
    dimensions.containerHeight = dimensions.height - dimensions.margin * 2;

    // Bind the 2 datasets
    const bindData = async function(){
        // Fetch the data
        const riceData = await d3.json('rice.json');
       const mapData = await d3.json('https://raw.githubusercontent.com/AshKyd/geojson-regions/master/countries/50m/all.geojson'); 

       for (let j = 0; j < riceData.length; j += 1) {
           let currentRice = riceData[j];
           for (let i = 0; i < mapData.features.length; i += 1) {
                var countryInObj = mapData.features[i].properties;

                if (countryInObj.name_long === currentRice.country) {
                    mapData.features[i].properties = {...mapData.features[i].properties, data: currentRice.data};
                    break;
                }
                // else if (countryInObj.name_long !== currentRice.country) {
                //     mapData.features[i].properties = {...mapData.features[i].properties, data: null};
                //     break;
                // } 
           }
        }
       return mapData;
    }
    
    const combinedData = await bindData();
    console.log(combinedData)

    console.log(d3.schemeOranges[8])
    // Map projection
    const mapProjection = d3.geoMercator().fitExtent([ 
            [dimensions.margin, dimensions.margin],
            [dimensions.width - dimensions.margin, dimensions.height - dimensions.margin]
        ],
        combinedData)// Ensures the GeoJson will cover the available space

    //const projectedMap = projection(mapData)
    const pathGenerator = d3.geoPath().projection(mapProjection)

    // Draw images
    const svg = d3.select('#chart')
        .append('svg')
        .attr('width', dimensions.width)
        .attr('height', dimensions.height)

    const container = svg.append('g')
        .attr('transform', `translate(${dimensions.margin}, ${dimensions.margin})`)
    
    container.selectAll('path')
        .data(combinedData.features)
        .join('path')
        .attr('d', pathGenerator)
        .attr('fill', 'none')
        .attr('stroke', 'black')

    
}

draw();
