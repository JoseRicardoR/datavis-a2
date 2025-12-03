# DataVis Assignment 2 - Car Data Visualization

A D3.js-based interactive data visualization project showcasing three different chart types for exploring multivariate data.

## Overview

This project provides an interactive dashboard with three synchronized visualizations:

1. **Scatter Plot** - Explore relationships between two attributes selectable from the app.
2. **Radar Chart** - Detailed view of individual rows of the dataset.
3. **Scatter Plot Matrix** - Compare multiple variables simultaneously.

## Features

### Scatter Plot
- Select X and Y axes from available car attributes
- Color-coded by car type
- Hover tooltips display car information
- Click points to view detailed specs in the radar chart
- Dynamic legend with shape symbols for each car type

### Radar Chart
- Displays detailed specifications for selected cars
- Multi-dimensional visualization of car attributes
- Shows all available numeric attributes

### Scatter Plot Matrix
- Pre-selected variables: Cyl, Retail Price, Weight, Horsepower(HP)
- Pairwise comparisons of variables
- Color-coded by car type

## Github page
Follow the link ![https://josericardor.github.io/datavis-a2/] to find the live github page of the project.

## Project Structure

```
datavis-a2/
├── index.html          # Main HTML file with chart containers
├── main.js             # D3.js visualization logic
├── style.css           # CSS styling
├── cars.csv            # Dataset (contains some intentional errors)
├── d3.v5.min.js        # D3.js library
└── README.md           # This file
```

## References
This work was based mostly on the examples provided by:

- [D3.js Course - ObservableHQ](https://observablehq.com/@observablehq/introduction-to-d3-course)
- [D3 Graph Gallery](https://d3-graph-gallery.com/)
- [D3 Documentation](https://d3js.org/)

* The documentation of this code was partly AI generated and corrected by the author