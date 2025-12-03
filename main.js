// -------------------------------------------------------
// REFERENCES:
// -------------------------------------------------------
// For D3JS in general:
//https://observablehq.com/@observablehq/introduction-to-d3-course?collection=@observablehq/introduction-to-d3-course
//https://d3js.org/d3-selection/joining

// For the Scatter Plot:
//https://observablehq.com/@observablehq/introduction-to-d3-course-lesson-2?collection=@observablehq/introduction-to-d3-course
//https://d3-graph-gallery.com/graph/scatter_tooltip.html
//https://d3-graph-gallery.com/graph/custom_theme.html
//https://d3js.org/d3-shape/symbol#symbolDiamond
//https://d3-graph-gallery.com/graph/custom_legend.html

// For the radar/spyder plot
//https://stackoverflow.com/questions/67463864/javascript-d3-plotting-radar-graph

// For the scatter plot Matrix
//https://observablehq.com/@d3/splom/2?collection=@d3/d3-scale

// Waiting until document has loaded
window.onload = () => {
  // Set the dimensions and margins of the graph
  var margin = { top: 10, right: 30, bottom: 30, left: 60 },
    width = 600 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;


  // -------------------------------------------------------
  // SCATER CHART
  // -------------------------------------------------------

  // Append the SVG object to the chart container
  var svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  // Load CSV data
  d3.csv("cars.csv").then(data => {

    console.log("Loaded CSV data:", data);

    // Extract numeric headers (exclude Type and Name)
    var headers = d3.keys(data[0]).filter(x => x !== "Type" && x !== "Name")
    console.log("Headers", headers)

    // Add options to the select dropdowns
    d3.selectAll(".selectList")
      .selectAll('headers')
      .data(headers)
      .enter()
      .append('option')
      .text(function (d) { return d; }) // Text displayed in the menu
      .attr("value", function (d) { return d; }) // Corresponding value returned by the button
      .attr("selected", d => d === "Retail Price" ? true : null); // Set default selection

    // Extract unique car types for color and shape encoding
    const carTypes = Array.from(new Set(data.map((d) => d.Type)));
    console.log("Set of Types for the color scales", carTypes)

    // Create ordinal color scale for car types
    const colorScale = d3.scaleOrdinal()
      .domain(carTypes)
      .range(["#d11141", "#00b159", "#00aedb", "#f37735", "#ffc425"])

    // Create ordinal shape scale for car types
    const shapeScale = d3.scaleOrdinal()
      .domain(carTypes)
      .range([d3.symbolCircle, d3.symbolTriangle, d3.symbolSquare, d3.symbolCross, d3.symbolStar])

    // Initialize X and Y axes
    var xaxis = svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)

    var yaxis = svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)

    // Initialize axis labels
    var xlabel = svg.append("text")
      .attr("class", "x label")

    var ylabel = svg.append("text")
      .attr("class", "y label")

    // Create tooltip div
    var tooltip = d3.select("#chart")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "10px")

    // Add legend symbols (dots) for each car type
    svg.selectAll("legenddots")
      .data(carTypes)
      .enter()
      .append("path")
      .attr("class", "legenddots")
      .attr("d", d3.symbol()
        .size(60)
        .type(function (d) { return shapeScale(d) })
      )
      .attr("transform", function (d, i) { return `translate(${width - 3},${(i * 20 + margin.top)})` })
      .style("fill", function (d) { return colorScale(d) })
      .style("opacity", 0.8)

    // Add legend labels for each car type
    svg.selectAll("legendlabels")
      .data(carTypes)
      .enter()
      .append("text")
      .attr("size", 120)
      .attr("x", width + 15)
      .attr("y", function (d, i) { return i * 20 + margin.top }) // margin.top is where the first dot appears. 20 is the distance between dots
      .text(function (d) { return d })
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")

    // Variable to track selected data point index
    var selected_data_index = 0;

    // Initial scatter plot render
    updateScatter("Horsepower(HP)", "Retail Price")

    // Function to update scatter plot based on selected X and Y variables
    function updateScatter(xCol, yCol) {

      // create a subdataset with the values selected by user
      var filtered = data.map(d => ({
        name: d["Name"],
        x: +d[xCol],
        y: +d[yCol],
        color: d["Type"]
      }));

      // Create linear scale for X axis
      const xScale = d3.scaleLinear()
        .domain([0, d3.max(filtered, d => d.x)])
        .range([margin.left, width - margin.right])
        .nice();

      // Create linear scale for Y axis
      const yScale = d3.scaleLinear()
        .domain([0, d3.max(filtered, d => d.y)])
        .range([height - margin.bottom, margin.top])
        .nice();

      // Update X axis with transition
      xaxis
        .transition()
        .duration(200)
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).tickSize(-height + margin.top + margin.bottom).ticks(10));

      // Update X axis label
      xlabel
        .transition()
        .duration(200)
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + 1)
        .text(xCol);

      // Update Y axis with transition
      yaxis
        .transition()
        .duration(200)
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale).tickSize(-width + margin.left + margin.right).ticks(10));

      // Update Y axis label
      ylabel
        .transition()
        .duration(200)
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 15)
        .text(yCol);

      // Style axis grid lines
      svg.selectAll(".tick line").attr("stroke", "#EBEBEB")

      // Bind data and draw scatter plot points using symbols
      svg.selectAll(".scatterpoints")
        .data(filtered)
        .join("path")
        .attr("class", "scatterpoints")
        .attr("d", d3.symbol()
          .size(120)
          .type(function (d) { return shapeScale(d.color) })
        )
        .attr("transform", d => `translate(${xScale(d.x)},${yScale(d.y)})`) // the position of each point is related with normaliye x and y
        .style("fill", function (d) { return colorScale(d.color) })
        .style("opacity", 0.8)
        // Show tooltip on mouse over
        .on("mouseover", function () {
          tooltip.style("opacity", 1)
        })
        // Update tooltip position and content on mouse move
        .on("mousemove", function (d) {
          tooltip
            .html(`<b>${d.name}<br></b> ${xCol}: ${d.x}<br> ${yCol}: ${d.y}<br> Type: ${d.color}`)
            .style("left", (d3.mouse(this)[0] + 10 + xScale(d.x)) + "px") // slightly move the tooltip so it does not block the point or mouse
            .style("top", (d3.mouse(this)[1] - 10 + yScale(d.y)) + "px")
        })
        // Hide tooltip on mouse leave
        .on("mouseleave", function () {
          tooltip
            .transition()
            .duration(200)
            .style("opacity", 0)
        })
        // Update radar chart when point is clicked
        .on("click", function (f) {
          // Find index of clicked car in data array
          selected_data_index = data.map((d, i) => d["Name"] === f.name ? i : -1).filter(i => i !== -1)[0];
          // some casual prints for confirmation
          console.log(f.name);
          console.log(selected_data_index);
          updateStarPlot(selected_data_index);
        })
    }

    // Listen for changes in select dropdowns and update scatter plot
    d3.selectAll(".selectList").on("change", function (d) {
      // Get selected X and Y variables
      var selectedOptionX = d3.select("#selectListX").property("value")
      var selectedOptionY = d3.select("#selectListY").property("value")
      // Update scatter plot with new variables
      updateScatter(selectedOptionX, selectedOptionY)
    })

    // -------------------------------------------------------
    // RADAR/SPIDER CHART INITIALIZATION
    // -------------------------------------------------------

    // Set radar chart dimensions
    const radius = width * 0.25;
    const center = { x: (width + margin.left + margin.right) * 0.60, y: (height + margin.top + margin.bottom) * 0.35 };

    // Create SVG for radar chart
    var svg_radar = d3.select("#radar_chart")
      .append("svg")
      .attr("width", (width + margin.left + margin.right))
      .attr("height", (height + margin.top + margin.bottom) * 0.7);

    // Create radial scale for radar chart
    const radialScale = d3.scaleLinear()
      .domain([0, radius])
      .range([radius, 0])

    // Draw concentric circles (grid lines)
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

    // Draw radial axes (lines) and labels for each attribute
    for (let index = 0; index < headers.length; index++) {
      // angle is defined by dividing the circle on the amount of attributes
      // and getting the degrees 
      const angle = index * Math.PI * 2 / headers.length;
      const x = center.x + radius * Math.sin(angle);
      const y = center.y + radius * -Math.cos(angle);
      // Position text anchor based on angle, so the left and right side labels
      // dont block the graph
      const radial_anchor_rotation = angle > 3.15 ? "end" : "start";
      const y_shift = angle > 3.15 ? 10 : 0;

      // Draw radial line
      svg_radar.append('line')
        .attr('x1', center.x)
        .attr('y1', center.y)
        .attr('x2', x)
        .attr('y2', y)
        .style('stroke', '#000');

      // Add attribute label
      svg_radar.append('text')
        .text(headers[index])
        .attr('text-anchor', radial_anchor_rotation)
        .attr('x', x)
        .attr('y', y)
    }

    // Create background rectangle for legend/data display
    svg_radar.append("g")
      .attr("class", "table_description")
      .attr("transform", `translate( ${margin.top}, ${margin.top})`)
      .append("rect")
      .attr("width", 160)
      .attr("height", 160)
      .attr("opacity", 0.6)
      .attr("rx", 5)
      .style("fill", "white")
      .style("fill-opacity", 0.5)
      .style("stroke", "#8e8e8eff")
      .style("stroke-width", 1);

    // Render radar chart for first data point
    updateStarPlot(10);

    // Function to update radar/spider chart for selected data point
    function updateStarPlot(selected_data_index) {

      console.log("Data from csv", data[selected_data_index]);

      // Create data structure for radar chart with normalized values
      var data_radi = {
        values: []
      };

      // Process each attribute in the selected row
      for (let key in data[selected_data_index]) {
        if (key === "Name") {
          data_radi.name = data[selected_data_index][key];
        }
        else if (key === "Type") {
          data_radi.type = data[selected_data_index][key];
        }
        else {
          // Normalize value to radius scale (0 to 1)
          // This is necessary because some attributes scales are way bigger than others
          var maxValue = d3.max(data, d => +d[key]);
          var minValue = 0;
          var value_normalized = (data[selected_data_index][key] - minValue) / (maxValue - minValue);
          data_radi.values.push(radius * value_normalized);
        }
      }
      // Set color based on car type
      data_radi.color = colorScale(data_radi.type);

      // Build path string for radar polygon
      // basically we calculate the points on the radial plot one by one and
      // connected them with a path after that
      path_radial = '';
      for (let i = 0; i < data_radi.values.length; i++) {
        const r = radius - radialScale(data_radi.values[i]); // radius proportional to data value normalize
        const angle = i * Math.PI * 2 / data_radi.values.length; // degree according to index
        const x = center.x + r * Math.sin(angle); // for the path the point x and y are calculated
        const y = center.y + r * -Math.cos(angle);
        path_radial += `${i > 0 ? 'L' : 'M'} ${x},${y} `;
      }
      path_radial += 'Z'; // Close path 

      // Draw or update radar polygon
      let path = svg_radar.selectAll(".path")
        .data([data_radi]);

      path.enter()
        .append("path")
        .attr("class", "path")
        .merge(path)
        .transition()
        .duration(200)
        .attr('d', path_radial)
        .style('stroke', data_radi.color)
        .style('stroke-width', 3)
        .style('stroke-opacity', 0.6)
        .style('fill', data_radi.color)
        .style('fill-opacity', 0.3)

      console.log(data_radi)

      // Create legend text with attribute values
      let legend_text = headers.map((h, i) => `${h}: ${data_radi.values[i].toFixed(2)}`);

      // Update or create legend entries
      let starlegend = svg_radar
        .selectAll(".starlegend")
        .data(legend_text)
        .join(
          enter => enter.append("text")
            .attr("class", "starlegend")
            .attr("x", 2 + margin.top)
            .attr("y", (d, i) => i * 12 + 2 * margin.top)
            .text(d => d)
            .style("font-size", "12px")
            .attr("text-anchor", "start")
            .attr("fill", "#585858ff")
            .style("alignment-baseline", "middle"),
          update => update
            .text(d => d)
            .style("font-size", "12px"),
          exit => exit.remove()
        )
    };

    // -------------------------------------------------------
    // SCATTER PLOT MATRIX INITIALIZATION
    // -------------------------------------------------------

    // Transform data for scatter plot matrix (keep three attributes columns and type)
    var matrix_data = data.map(d => ({
      "Type": d["Type"],
      "Cyl": +d["Cyl"],
      "Retail Price": +d["Retail Price"],
      "Weight": +d["Weight"],
      "Horsepower(HP)": +d["Horsepower(HP)"]
    }));

    // Extract column names (exclude Type)
    var columns = d3.keys(matrix_data[0]).filter(x => x !== "Type" && x !== "Name")

    console.log("Scatter Matrix Data", matrix_data);

    // Set dimensions for scatter plot matrix
    const width_matrix = 2 * width + (margin.left + margin.right);
    const height_matrix = width_matrix;
    const padding = 40;
    const size = (width_matrix - (columns.length + 1) * padding) / columns.length + padding;

    // Create SVG for scatter plot matrix
    const svg_matrix = d3.select("#scatter_matrix_chart")
      .append("svg")
      .attr("width", width_matrix)
      .attr("height", height_matrix)
      .attr("viewBox", [-padding, -padding/2, width_matrix, height_matrix]);

    // Create horizontal scales (one for each column)
    const x_matrix = columns.map(c => d3.scaleLinear()
      .domain(d3.extent(matrix_data, d => d[c]))
      .rangeRound([padding / 2, size - padding / 2]))

    // Create vertical scales (one for each row)
    const y_matrix = x_matrix.map(x_matrix => x_matrix.copy().range([size - padding / 2, padding / 2]));

    // Define horizontal axis generator
    const axisx = d3.axisBottom()
      .ticks(5)
      .tickSize(size * columns.length);
    
    // Function to render horizontal axes:
    // instead of creating the axes directly we define a function that will render for us the axes
    // for the given data. This will be the same for other elements on the matrix
    const xAxis = g => g.selectAll("g").data(x_matrix).join("g")
      .attr("transform", (d, i) => `translate(${i * size},0)`)
      .each(function (d) { return d3.select(this).call(axisx.scale(d)); })
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").attr("stroke", "#ddd"));

    // Define vertical axis generator
    const axisy = d3.axisLeft()
      .ticks(6)
      .tickSize(-size * columns.length);
    
    // Function to render vertical axes
    const yAxis = g => g.selectAll("g").data(y_matrix).join("g")
      .attr("transform", (d, i) => `translate(0,${i * size})`)
      .each(function (d) { return d3.select(this).call(axisy.scale(d)); })
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").attr("stroke", "#ddd"));

    // Add CSS styling for hidden circles
    svg_matrix.append("style")
      .text(`circle.hidden { fill: #000; fill-opacity: 1; r: 1px; }`);

    // Render axes
    svg_matrix.append("g")
      .call(xAxis);

    svg_matrix.append("g")
      .call(yAxis);

    // Create grid cells for each scatter plot
    const cell = svg_matrix.append("g")
      .selectAll("g")
      .data(d3.cross(d3.range(columns.length), d3.range(columns.length)))
      .join("g")
      .attr("transform", ([i, j]) => `translate(${i * size},${j * size})`);

    // Draw borders around each cell
    cell.append("rect")
      .attr("fill", "none")
      .attr("stroke", "#aaa")
      .attr("x", padding / 2 + 0.5)
      .attr("y", padding / 2 + 0.5)
      .attr("width", size - padding)
      .attr("height", size - padding);

    // Plot circles in each cell
    cell.each(function ([i, j]) {
      d3.select(this).selectAll("circle")
        .data(matrix_data.filter(d => !isNaN(d[columns[i]]) && !isNaN(d[columns[j]])))
        .join("circle")
        .attr("cx", d => x_matrix[i](d[columns[i]]))
        .attr("cy", d => y_matrix[j](d[columns[j]]));
    });

    // Style circles with color and size
    const circle = cell.selectAll("circle")
      .attr("r", 3.5)
      .attr("fill-opacity", 0.7)
      .style("fill", function (d) { return colorScale(d["Type"]) })

    // Add column headers
    svg_matrix.append("g")
      .style("font", "bold 10px sans-serif")
      .style("pointer-events", "none")
      .selectAll("text")
      .data(columns)
      .join("text")
      .attr("transform", (d, i) => `translate(${i * size},${i * size})`)
      .attr("x", padding)
      .attr("y", padding)
      .attr("dy", ".71em")
      .text(d => d);

    // Add legend labels for car types
    svg_matrix.selectAll("legendlabels")
      .data(carTypes)
      .enter()
      .append("text")
      .attr("size", 120)
      .attr("x", function (d, i) { return (i) * 100 + margin.left })
      .attr("y", 0)
      .text(function (d) { return d })
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")

    // Add legend circles for car types
    svg_matrix.selectAll("legenddots")
      .data(carTypes)
      .enter()
      .append("circle")
      .attr("class", "legenddots")
      .attr("cx", function (d, i) { return i * 100 + margin.left - 10})
      .attr("cy", 0)
      .style("fill", function (d) { return colorScale(d) })
      .attr("r", 5)
      .attr("fill-opacity", 10)

  }).catch(error => {
    console.error("Error loading CSV:", error);
  });
};
