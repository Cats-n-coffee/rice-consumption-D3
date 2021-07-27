import * as d3 from 'd3';
import 'regenerator-runtime/runtime';

document.addEventListener('DOMContentLoaded', () => {
    const spinnner = document.getElementById('spinner-container');
    setTimeout(() => {
        spinnner.style.display = 'none';
        
    }, 2000)
})

async function draw() {
    // Get the selected year
    d3.select('#years').on('change', function (event) {
        event.preventDefault();
        choropleth(this.value); // Changes the map and legend text with the selected year
    })

    choropleth("2011") // Default year 

    // SVG and container dimensions
    const dimensions = {
        width: 1300,
        height: 1100,
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
                    // Check for matching country names, and add rice data to the properties of the map
                    if (countryInObj.name_long === currentRice.country) {
                        mapData.features[i].properties = {...mapData.features[i].properties, data: currentRice.data};
                        break;
                    }
            }
        }
        return mapData;
    }
   
    // ---------- Elements
    // Draw images
    const svg = d3.select('#chart')
        .append('svg')
        .attr('width', dimensions.width)
        .attr('height', dimensions.height)

    const container = svg.append('g')
        .attr('transform', `translate(${dimensions.margin}, ${dimensions.margin + 15})`)

    // Tooltip
    const tooltip = d3.select('#tooltip');

    // Legend
    const legendGroup = svg.append('g')
        .attr('transform', `translate(${(dimensions.width / 4) * 2.7})`)

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

    // Legend: group for colors and text
    const legendData = legendGroup.append('g')

    // ------------------------ Function to create chart
    async function choropleth(selectedYear) {
        
        // One combined dataset
        const combinedData = await bindData();
 
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

        // Transitions
        const exitTransition = d3.transition().duration(500);
        const updateTransition = exitTransition.transition().duration(500);
        
        // Draw the map 
        container.selectAll('path')
            .data(combinedData.features)
            .join(
                (enter) => enter.append('path')
                    .attr('d', pathGenerator)
                    .attr('stroke', 'black')
                    .on('mousemove', function(event, datum){ 
                        tooltip.style('display', 'block')
                            .style('top', event.clientY - 80 +'px') // Be careful with mousemove event, if tooltip is under the cursor(?), it will NOT display
                            .style('left', event.clientX - 40 + 'px')
        
                        tooltip.select('.tooltip-country span')
                            .text(datum.properties.name_long)
        
                        tooltip.select('.tooltip-quantity span')
                            .text(() => {
                                if (datum.properties.data) {
                                    if (datum.properties.data[selectedYear] === "...") return "No data available";
                                    else return datum.properties.data[selectedYear].toFixed(2) + ' Kg';
                                }
                                else {
                                    return "No data available";
                                } 
                            })
                    })
                    .on('mouseleave', function(event, datum){
                        tooltip.style('display', 'none');
                    }),
                (update) => update.attr('fill', function(d) {
                        if (this.getAttribute("data-color") === "#b3b3b3" || this.getAttribute("data-color") === colorScale(d.properties.data[selectedYear])) {
                            if (d.properties.data) return colorScale(d.properties.data[selectedYear]);
                            else return "#b3b3b3";
                        } 
                        else return 'green'; // On update, if the color is the same as before, we render the same color, otherwise we transition to green first
                    })
                    .on('mousemove', function(event, datum){ 
                        tooltip.style('display', 'block')
                            .style('top', event.clientY - 80 +'px') // Be careful with mousemove event, if tooltip is under the cursor(?), it will NOT display
                            .style('left', event.clientX - 40 + 'px')
        
                        tooltip.select('.tooltip-country span')
                            .text(datum.properties.name_long)
        
                        tooltip.select('.tooltip-quantity span')
                            .text(() => {
                                if (datum.properties.data) {
                                    if (datum.properties.data[selectedYear] === "...") return "No data available";
                                    else return datum.properties.data[selectedYear].toFixed(2) + ' Kg';
                                }
                                else {
                                    return "No data available";
                                } 
                            })
                    })
                    .on('mouseleave', function(event, datum){
                        tooltip.style('display', 'none');
                    }),
                (exit) => exit//.attr('fill', 'green')
                    .transition(exitTransition)
                    .remove()
            )
            .transition(updateTransition)
            .attr('d', pathGenerator)
            .attr('fill', function(d) { // Sets the color attribute, used in the update transition, and set the color itself to the element
                if (d.properties.data) { // 'fill' attribute uses the colorScale on the rice data
                    if (d.properties.data[selectedYear] === "...") {
                        this.setAttribute("data-color", "#b3b3b3")
                        return "#b3b3b3";
                    }
                    else {
                        this.setAttribute("data-color", colorScale(d.properties.data[selectedYear]))
                        return colorScale(d.properties.data[selectedYear]);
                    }
                }
                else {
                    this.setAttribute("data-color", "#b3b3b3")
                    return "#b3b3b3";
                } 
            })
            .attr('stroke', 'black') 
            
        // Legend: All colors rectangles 
        legendData.selectAll('rect')
            .data(colorSchema) // Uses the array of colors 
            .join('rect')
            .attr('x', (d, i) => i * 40)
            .attr('y', 30)
            .attr('width', 40)
            .attr('height', 20)
            .attr('fill', d => d)

        // Legend: get thresholds from colorScale
        let colorThresholds = colorScale.thresholds().map(d => Math.round(d));
        colorThresholds.push(colorThresholds[colorThresholds.length - 1] + 30) // Last number on the legend
        colorThresholds.unshift(1); // First number on the legend

        // Legend: Text(number) for each color (threshold) 
        legendData.selectAll('text')
            .data(colorThresholds)
            .join( 
                (enter) => enter.append('text') // appends the text (thresholds)
                    .attr('x', (d, i) => i * 40 - 5)
                    .attr('y', 65)
                    .text(d => d)
                    .style('font-size', '.8rem')
                    .selection(),
                (update) => update 
                .text(d => d) // Updates with the new text (thresholds) when the year changes
                .selection(),
                (exit) => exit.remove() // Removes elements that are different from previous thresholds 
            ) 
            .attr('x', (d, i) => i * 40 - 5)
            .attr('y', 65)
            .attr('fill', 'black')
            .text(d => d)
            .style('font-size', '.8rem')
    }
}

draw();
