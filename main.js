//References
//https://observablehq.com/@observablehq/introduction-to-d3-course-lesson-2?collection=@observablehq/introduction-to-d3-course
//https://observablehq.com/@observablehq/introduction-to-d3-course?collection=@observablehq/introduction-to-d3-course
//https://d3-graph-gallery.com/graph/scatter_tooltip.html
//https://d3-graph-gallery.com/graph/custom_theme.html
//https://d3js.org/d3-shape/symbol#symbolDiamond
//https://d3-graph-gallery.com/graph/custom_legend.html
//https://d3js.org/d3-selection/joining
//https://stackoverflow.com/questions/67463864/javascript-d3-plotting-radar-graph
//https://observablehq.com/@d3/splom/2?collection=@d3/d3-scale


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
    .attr("height", height + margin.top + margin.bottom);


  d3.csv("cars.csv").then(data => {
    // Convert strings to numbers
    data = data.filter(d => d["Dealer Cost"] !== null && d["Horsepower(HP)"] !== null);

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

    var selected_data_index = 0;

    updateScatter("Retail Price", "Retail Price")


    function updateScatter(xCol, yCol) {

      var filtered = data.map(d => ({
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
        .on("click", function (f) {
          //selected_data = data.filter(d => d["Name"] === f.name); 
          //selected_data_index = data.filter((d) => d["Name"] === f.name); 

          selected_data_index = data.map((d, i) => d["Name"] === f.name ? i : -1).filter(i => i !== -1)[0];

          console.log(f.name);
          console.log(selected_data_index);
          updateStarPlot(selected_data_index);
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


    //-----------------------------------------------------------------------------


    const radius = width * 0.25;
    const center = { x: (width + margin.left + margin.right) * 0.5 + 15, y: (height + margin.top + margin.bottom) * 0.35 };

    var svg_radar = d3.select("#radar_chart")
      .append("svg")
      .attr("width", (width + margin.left + margin.right))
      .attr("height", (height + margin.top + margin.bottom) * 0.7);

    const radialScale = d3.scaleLinear()
      .domain([0, radius])
      .range([radius, 0])

    let val;
    for (val = 0; val <= radius; val += radius / 5) {
      const r = radialScale(val);
      svg_radar.append('circle')
        .attr('cx', center.x)
        .attr('cy', center.y)
        .attr('r', r)
        .style('stroke', '#aaa')
        .style('fill', 'none');
    }

    for (let index = 0; index < headers.length; index++) {
      const angle = index * Math.PI * 2 / headers.length;
      const x = center.x + radius * Math.sin(angle);
      const y = center.y + radius * -Math.cos(angle);
      //despues de la mitad del circulo, pi
      const radial_anchor_rotation = angle > 3.15 ? "end" : "start";
      const y_shift = angle > 3.15 ? 10 : 0;

      svg_radar.append('line')
        .attr('x1', center.x)
        .attr('y1', center.y)
        .attr('x2', x)
        .attr('y2', y)
        .style('stroke', '#000');

      svg_radar.append('text')
        .text(headers[index])
        .attr('text-anchor', radial_anchor_rotation)
        .attr('x', x)
        .attr('y', y)
    }

    //First renderization

    updateStarPlot(10);


    function updateStarPlot(selected_data_index) {

      console.log("Data from csv", data[selected_data_index]);

      var data_radi = {
        values: []
      };

      for (let key in data[selected_data_index]) {
        if (key === "Name") {
          data_radi.name = data[selected_data_index][key];
        }
        else if (key === "Type") {
          data_radi.type = data[selected_data_index][key];
        }
        else {
          var maxValue = d3.max(data, d => +d[key]);
          var minValue = 0;
          var value_normalized = (data[selected_data_index][key] - minValue) / (maxValue - minValue);
          //console.log(key, maxValue,minValue,data[0][key], value_normalized);
          data_radi.values.push(radius * value_normalized);
        }
      }
      data_radi.color = colorScale(data_radi.type);
      //console.log("Star data from the csv normalized",data_radi);

      path_radial = '';
      for (let i = 0; i < data_radi.values.length; i++) {
        const r = radius - radialScale(data_radi.values[i]);
        const angle = i * Math.PI * 2 / data_radi.values.length;
        const x = center.x + r * Math.sin(angle);
        const y = center.y + r * -Math.cos(angle);
        path_radial += `${i > 0 ? 'L' : 'M'} ${x},${y} `;
      }
      path_radial += 'Z';

      // Select the path (if it exists) or append it
      let path = svg_radar.selectAll(".path")   // select existing path(s)
        .data([data_radi]);                   // bind data as array (single element)

      path.enter()
        .append("path")
        .attr("class", "path")
        .merge(path)
        .transition()
        .duration(200)
        .attr("class", "path")
        .attr('d', path_radial)
        .style('stroke', data_radi.color)
        .style('stroke-width', 3)
        .style('stroke-opacity', 0.6)
        .style('fill', data_radi.color)
        .style('fill-opacity', 0.3)

    };

  }).catch(error => {
    console.error("Error loading CSV:", error);
  });
};
