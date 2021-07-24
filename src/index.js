import * as d3 from 'd3';
import { color } from 'd3';
import 'regenerator-runtime/runtime';

async function draw() {
    // Get the selected year
    d3.select('#years').on('change', function (event) {
        event.preventDefault();
        choropleth(this.value);
    })

    choropleth("2011")
    // SVG and container dimensions
    const dimensions = {
        width: 1300,
        height: 1200,
        margin: 20
    }

    dimensions.containerWidth = dimensions.width - dimensions.margin * 2;
    dimensions.containerHeight = dimensions.height - dimensions.margin * 2;

    // Bind the 2 datasets
    async function bindData(){
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
   
    // Draw images
    const svg = d3.select('#chart')
        .append('svg')
        .attr('width', dimensions.width)
        .attr('height', dimensions.height)

    const container = svg.append('g')
        .attr('transform', `translate(${dimensions.margin}, ${dimensions.margin + 15})`)

    // Tooltip
    const tooltip = d3.select('#tooltip');


    // ------------------------ Function to create chart
    async function choropleth(selectedYear) {
        console.log(selectedYear)
        
        // One combined dataset
    const combinedData = await bindData();
        console.log(combinedData)
        // Accessor
        const yearAccessor = d => {
            return d.properties.data ? d.properties.data[selectedYear] : null;
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

        const pathGenerator = d3.geoPath().projection(mapProjection)
        
        // Draw the map 
        container.selectAll('path')
            .data(combinedData.features)
            .join('path')
            .attr('d', pathGenerator)
            .attr('fill', d => {
                //console.log('country', d.properties.name_long, 'data', d.properties.data)
                if (d.properties.data) {
                    if (d.properties.data[selectedYear] === "...") return "#b3b3b3";
                    else return colorScale(d.properties.data[selectedYear]);
                }
                else {
                    return "#b3b3b3";
                } 
            })
            .attr('stroke', 'black')
            .on('mousemove', function(event, datum){
                tooltip.style('display', 'block')
                    .style('top', event.layerY + 130 +'px')
                    .style('left', event.layerX + 'px')

                tooltip.select('.tooltip-country span')
                    .text(datum.properties.name_long)

                tooltip.select('.tooltip-quantity span')
                    .text(() => {
                        if (datum.properties.data) {
                            if (datum.properties.data[selectedYear] === "...") return "No data available";
                            else return datum.properties.data[selectedYear] + ' Kg';
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

        // ----- Legend
        const legendGroup = svg.append('g')
            .attr('transform', `translate(${(dimensions.width / 4) * 2.5})`)

        // Legend: Grey rectangle and text    
        const legendNoData = legendGroup.append('g')
            legendNoData.append('rect')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', 40)
                .attr('height', 20)
                .attr('fill', '#b3b3b3')
            legendNoData.append('text')
                .attr('x', 50)
                .attr('y', 15)
                .attr('fill', 'black')
                .text('No data available')
                .style('font-size', '.8rem')
        
        // Legend: All colors rectangles and text
        const legendData = legendGroup.append('g')
            legendData.selectAll('rect')
                .data(colorSchema)
                .join('rect')
                .attr('x', (d, i) => i * 40)
                .attr('y', 30)
                .attr('width', 40)
                .attr('height', 20)
                .attr('fill', d => d)

        // Legend: get thresholds from colorScale
        const colorThresholds = colorScale.thresholds().map(d => Math.round(d));
        colorThresholds.push(colorThresholds[colorThresholds.length - 1] + 30)
        colorThresholds.unshift(1);
            legendData.selectAll('text')
            .remove()
                .data(colorThresholds)
                .join('text')
                .attr('x', (d, i) => i * 40 - 5)
                .attr('y', 65)
                .attr('fill', 'black')
                .text(d => d)
                .style('font-size', '.8rem')
    }
}

draw();
