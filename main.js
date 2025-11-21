//References
//https://observablehq.com/@observablehq/introduction-to-d3-course-lesson-2?collection=@observablehq/introduction-to-d3-course
//https://d3-graph-gallery.com/graph/scatter_tooltip.html
//https://d3-graph-gallery.com/graph/custom_theme.html
//https://d3js.org/d3-shape/symbol#symbolDiamond
//https://d3-graph-gallery.com/graph/custom_legend.html
//https://d3js.org/d3-selection/joining



// Waiting until document has loaded
window.onload = () => {
  // set the dimensions and margins of the graph
  var margin = { top: 10, right: 30, bottom: 30, left: 60 },
    width = 600 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;


  // append the svg object to the body of the page
  var svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("border", "1px dotted #000");


  d3.csv("cars.csv").then(data => {
    // Convert strings to numbers
    data = data.filter(d => d.x !== null && d.y !== null);

    console.log("Loaded CSV data:", data);

    var headers = d3.keys(data[0]).filter(x => x !== "Type" && x !== "Name")
    console.log("Headers", headers)

    // add the options to the button
    d3.selectAll(".selectList")
      .selectAll('headers')
      .data(headers)
      .enter()
      .append('option')
      .text(function (d) { return d; }) // text showed in the menu
      .attr("value", function (d) { return d; }) // corresponding value returned by the button
      .attr("selected", d => d === "Retail Price" ? true : null);


    //Primero hacemos todos los append al svg, y luego los attributos cambiaran segun el data seleccionado

    // Type will be used for ordinal scale
    const carTypes = Array.from(new Set(data.map((d) => d.Type)));
    console.log("Set of Types for the color scales", carTypes)

    // color ordinal Scale
    const colorScale = d3.scaleOrdinal()
      .domain(carTypes)
      .range(["#d11141", "#00b159", "#00aedb", "#f37735", "#ffc425"])

    // Shape ordinal scale (just for the sake of testing)
    const shapeScale = d3.scaleOrdinal()
      .domain(carTypes)
      .range([d3.symbolCircle, d3.symbolTriangle, d3.symbolSquare, d3.symbolCross, d3.symbolStar])

    // axises
    var xaxis = svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)

    var yaxis = svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)

    var xlabel = svg.append("text")
      .attr("class", "x label")

    var ylabel = svg.append("text")
      .attr("class", "y label")

    //tootltip
    var tooltip = d3.select("#chart")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "10px")


    svg.selectAll("legenddots")
      .data(carTypes)
      .enter()
      .append("path")
      .attr("class", "legenddots")
      .attr("d", d3.symbol()
        .size(60)
        .type(function (d) { return shapeScale(d) })
      )
      .attr("transform", function (d, i) { return `translate(${width - 3},${(i * 15 + margin.top)})` })
      .style("fill", function (d) { return colorScale(d) })
      .style("opacity", 0.8)
    

    // Add one dot in the legend for each name.
    svg.selectAll("legendlabels")
      .data(carTypes)
      .enter()
      .append("text")
      .attr("size", 120)
      .attr("x", width + 15)
      .attr("y", function (d, i) { return i * 15 + margin.top }) // 100 is where the first dot appears. 25 is the distance between dots
      .text(function (d) { return d })
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")

    updateScatter("Retail Price", "Retail Price")


    function updateScatter(xCol, yCol) {

      let filtered = data.map(d => ({
        name: d["Name"],
        x: +d[xCol],
        y: +d[yCol],
        color: d["Type"]
      }));


      // --- Create Scales ---
      // x Scale
      const xScale = d3.scaleLinear()
        .domain([0, d3.max(filtered, d => d.x)])
        .range([margin.left, width - margin.right])
        .nice();

      // y Scale
      const yScale = d3.scaleLinear()
        .domain([0, d3.max(filtered, d => d.y)])
        .range([height - margin.bottom, margin.top])
        .nice();

      // --- X Axis ---
      xaxis
        .transition()
        .duration(200)
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).tickSize(-height + margin.top + margin.bottom).ticks(10));

      xlabel
        .transition()
        .duration(200)
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + 1)   // slightly below the axis
        .text(xCol);

      // --- Y Axis ---
      yaxis
        .transition()
        .duration(200)
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale).tickSize(-width + margin.left + margin.right).ticks(10));

      ylabel
        .transition()
        .duration(200)
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 15)
        .text(yCol);

      svg.selectAll(".tick line").attr("stroke", "#EBEBEB")

      // --- Draw Points ---
      svg.selectAll(".scatterpoints")
        .data(filtered)
        .join("path")
        .attr("class", "scatterpoints")
        .attr("d", d3.symbol()
          .size(120)
          .type(function (d) { return shapeScale(d.color) })
        )
        .attr("transform", d => `translate(${xScale(d.x)},${yScale(d.y)})`)
        .style("fill", function (d) { return colorScale(d.color) })
        .style("opacity", 0.8)
        // When mouse enters a point
        .on("mouseover", function () {
          tooltip
            .style("opacity", 1)
        })
        // When mouse moves, reposition tooltip
        .on("mousemove", function (d) {
          tooltip
            .html(`<b>${d.name}<br></b> ${xCol}: ${d.x}<br> ${yCol}: ${d.y}<br> Type: ${d.color}`)
            .style("left", (d3.mouse(this)[0] + 10 + xScale(d.x)) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
            .style("top", (d3.mouse(this)[1] - 10 + yScale(d.y)) + "px")
        })
        // When mouse leaves
        .on("mouseleave", function () {
          tooltip
            .transition()
            .duration(200)
            .style("opacity", 0)
        })

    }

    // When the button is changed, run the updateChart function
    d3.selectAll(".selectList").on("change", function (d) {
      // recover the option that has been chosen
      var selectedOptionX = d3.select("#selectListX").property("value")
      var selectedOptionY = d3.select("#selectListY").property("value")
      // run the updateChart function with this selected option
      updateScatter(selectedOptionX, selectedOptionY)
    })

  }).catch(error => {
    console.error("Error loading CSV:", error);
  });
};
