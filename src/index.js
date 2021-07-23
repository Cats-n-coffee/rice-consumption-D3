import * as d3 from 'd3';
import 'regenerator-runtime/runtime';

async function draw() {
    // Fetch data
    const mapData = await d3.json('https://raw.githubusercontent.com/AshKyd/geojson-regions/master/countries/50m/all.geojson');
    const riceData = await d3.json('rice.json');
    console.log(mapData)
    console.log(riceData)

    // SVG and container dimensions
    const dimensions = {
        width: 1300,
        height: 1200,
        margin: 20
    }

    dimensions.containerWidth = dimensions.width - dimensions.margin * 2;
    dimensions.containerHeight = dimensions.height - dimensions.margin * 2;

    // Map projection
    const mapProjection = d3.geoMercator().fitExtent([ 
            [dimensions.margin, dimensions.margin],
            [dimensions.width - dimensions.margin, dimensions.height - dimensions.margin]
        ],
        mapData)// Ensures the GeoJson will cover the available space

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
        .data(mapData.features)
        .join('path')
        .attr('d', pathGenerator)
        .attr('fill', 'none')
        .attr('stroke', 'black')

    
}

draw();
