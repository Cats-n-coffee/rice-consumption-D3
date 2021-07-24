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
           }
        }
       return mapData;
    }
    
    // Dataset and accessor
    const combinedData = await bindData();
    console.log(combinedData)
    const yearAccessor = d => {
        return d.properties.data ? d.properties.data["2011"] : null;
    };

    // Create the color scale
    const colorSchema = ["#ffefe8", "#ffcfba", "#fcb190", "#ff9a6e", "#fc8956", "#fc7a42", "#fc5d17", "#bf3e06", "#912e03", "#611e01"];
    const colorScale = d3.scaleQuantize()
        .domain(d3.extent(combinedData.features, yearAccessor))
        .range(colorSchema)
    
    // Map projection
    const mapProjection = d3.geoMercator().fitExtent([ 
            [dimensions.margin, dimensions.margin],
            [dimensions.width - dimensions.margin, dimensions.height - dimensions.margin]
        ],
        combinedData)// Ensures the GeoJson will cover the available space

    //const projectedMap = projection(mapData)
    const pathGenerator = d3.geoPath().projection(mapProjection)

    // Tooltip
    const tooltip = d3.select('#tooltip');

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
        .attr('fill', d => {
            //console.log('country', d.properties.name_long, 'data', d.properties.data)
            if (d.properties.data) {
                if (d.properties.data["2011"] === "...") return "#b3b3b3";
                else return colorScale(d.properties.data["2011"]);
            }
            else {
                return "#b3b3b3";
            } 
        })
        .attr('stroke', 'black')
        .on('mouseenter', function(event, datum){
            tooltip.style('display', 'block')
                .style('top', event.layerY + 'px')
                .style('left', event.layerX + 'px')

            tooltip.select('.tooltip-country span')
                .text(datum.properties.name_long)

            tooltip.select('.tooltip-quantity span')
                .text(() => {
                    if (datum.properties.data) {
                        if (datum.properties.data["2011"] === "...") return "No data available";
                        else return datum.properties.data["2011"] + ' Kg';
                    }
                    else {
                        return "No data available";
                    } 
                })
//console.log(event)
        })
        .on('mouseleave', function(event, datum){
            tooltip.style('display', 'none');
        })
    
}

draw();
