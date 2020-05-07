// D3-Challenge
console.log("In javascript app.js")
// Define chart area
var svgWidth = 900;
var svgHeight = 500;

//Define margins.
var margin = {
  top: 20,
  right: 90,
  bottom: 70,
  left: 100
};

// chart areas except for margins
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// start svg container and shift margins over by utilizing transform
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

 


// Read data from data.csv
//d3.csv("../Web-d3js-html5/assets/data/data.csv", function(err, brfssdata)
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// start Xaxis and Yaxis
var chosenXaxis = "poverty";
var chosenYaxis = "obesity";

// functions with Xaxis and Yaxis
function xScale(data, chosenXaxis) {
    var xLinScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d[chosenXaxis]))
        .range([0, width])
        .nice(); // labels max tick
    return xLinScale;
};

function yScale(data, chosenYaxis) {
    var yLinScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d[chosenYaxis]))
        .range([height, 0])
        .nice(); // labels max tick
    return yLinScale;
};

// functions updated and Xaxis rendered
function renderXaxis(newXscale, xAxis) {
    var bottomAxis = d3.axisBottom(newXscale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
};
// functions updated and Yaxis rendered
function renderYaxis(newYscale, yAxis) {
    var leftAxis = d3.axisLeft(newYscale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
};

// function to update circles
function renderCircles(circlesGroup, newXscale, newYscale, chosenXaxis, chosenYaxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXscale(d[chosenXaxis]))
        .attr("cy", d => newYscale(d[chosenYaxis]));
    return circlesGroup;   
};

// function to update state labels
function renderStates(stateGroup, newXscale, newYscale, chosenXaxis, chosenYaxis) {
    stateGroup.transition()
        .duration(1000)
        .attr("x", d => newXscale(d[chosenXaxis]))
        .attr("y", d => newYscale(d[chosenYaxis]));
    return stateGroup;
};

// updateToolTip and chosenXaxis, chosenYaxis, circlesGroup are enabled
function updateToolTip(chosenXaxis, chosenYaxis, circlesGroup) {
    var xLabel;
    if (chosenXaxis === "poverty") {xLabel = "In Poverty (%)";}
    else if (chosenXaxis === "age") {xLabel = "Age (Median)";}
    else {xLabel = "Household Income (Median)";}

    var yLabel;
    if (chosenYaxis === "obesity") {yLabel = "Obese (%)";}
    else if (chosenYaxis === "smokes") {yLabel = "Smokes (%)";}
    else {yLabel = "Lacks Healthcare (%)";}

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80,-60])
        .html(function(d) {
            return `<strong>${d.state}</strong><br>${xLabel}: ${d[chosenXaxis]}<br>${yLabel}: ${d[chosenYaxis]}`
        });
    
    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(d) {
        toolTip.show(d);})
        .on("mouseout", function(d) {
        toolTip.hide(d);});
    return circlesGroup;
};

// have d3.csv read functions and updates
d3.csv("assets/data/data.csv").then(function(data, err) {
    if (err) throw err;
    console.log(data);

    // have d3 determine the functions and numbers as integers
    data.forEach(function(d) {
        d.poverty = +d.poverty;
        d.age = +d.age;
        d.income = +d.income;
        d.obesity = +d.obesity;
        d.smokes = +d.smokes;
        d.healthcare = +d.healthcare;
    });

    // Scale the xScale and yScale data
    var xLinScale = xScale(data, chosenXaxis);
    var yLinScale = yScale(data, chosenYaxis);

    var bottomAxis = d3.axisBottom(xLinScale);
    var leftAxis = d3.axisLeft(yLinScale);

    // build plot axes
    var xAxis = chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    var yAxis = chartGroup.append("g")
        .call(leftAxis);

    var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .classed("stateCircle", true)
        .attr("cx", d => xLinScale(d[chosenXaxis]))
        .attr("cy", d => yLinScale(d[chosenYaxis]))
        .attr("r", 15);

    var stateGroup = chartGroup.selectAll("null")
            .data(data)
            .enter()
            .append("text")
            .text(d => d.abbr)
            .attr("class", "stateText")
            .attr("x", d => xLinScale(d[chosenXaxis]))
            .attr("y", d => yLinScale(d[chosenYaxis]) + 5);

    // x axis labels
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width/2}, ${height + 20})`);

    var povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 15)
        .attr("value", "poverty") 
        .classed("aText", true)
        .classed("active", true)
        .classed("inactive", false)
        .text("Poverty (%)");
        
    var ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 35)
        .attr("value", "age") 
        .classed("aText", true)
        .classed("active", false)
        .classed("inactive", true)
        .text("Age (Median)");        

    var incomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 55)
        .attr("value", "income") 
        .classed("aText", true)
        .classed("active", false)
        .classed("inactive", true)
        .text("Household Income (Median)");

    // y axis labels
    var yLabelsGroup = chartGroup.append("g");

    var obesityLabel = yLabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - (margin.left - 20))
        .attr("x", 0 - (height/2))
        .attr("value", "obesity") 
        .classed("aText", true)
        .classed("active", true)
        .classed("inactive", false)
        .text("Obesity (%)");

    var smokesLabel = yLabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - (margin.left - 40))
        .attr("x", 0 - (height/2))
        .attr("value", "smokes") 
        .classed("aText", true)
        .classed("active", false)
        .classed("inactive", true)
        .text("Smokes (%)");

    var healthcareLabel = yLabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - (margin.left - 60))
        .attr("x", 0 - (height/2))
        .attr("value", "healthcare") // event listener grabs value
        .classed("aText", true)
        .classed("active", false)
        .classed("inactive", true)
        .text("Lacks Healthcare (%)");

    var circlesGroup = updateToolTip(chosenXaxis, chosenYaxis, circlesGroup);

    // list the event listeners within xLabelsGroup and yLabelsGroup
    // xLabelsGroup.selectAll("text") are on click event as a function
    xLabelsGroup.selectAll("text")
    .on("click", function() {
        var value = d3.select(this).attr("value");
        if (value !== chosenXaxis) {
            chosenXaxis = value;
            xLinScale = xScale(data, chosenXaxis);
            xAxis = renderXaxis(xLinScale, xAxis);
            stateGroup = renderStates(stateGroup, xLinScale, yLinScale, chosenXaxis, chosenYaxis);
            circlesGroup = renderCircles(circlesGroup, xLinScale, yLinScale, chosenXaxis, chosenYaxis);
            circlesGroup = updateToolTip(chosenXaxis, chosenYaxis, circlesGroup);

            // change the chosenXaxis indicator
            if (chosenXaxis === "poverty") {
                povertyLabel.classed("active", true).classed("inactive", false);
                ageLabel.classed("active", false).classed("inactive", true);
                incomeLabel.classed("active", false).classed("inactive", true);}
            else if (chosenXaxis === "age") {
                povertyLabel.classed("active", false).classed("inactive", true);
                ageLabel.classed("active", true).classed("inactive", false);
                incomeLabel.classed("active", false).classed("inactive", true);}
            else {povertyLabel.classed("active", false).classed("inactive", true);
                ageLabel.classed("active", false).classed("inactive", true);
                incomeLabel.classed("active", true).classed("inactive", false);};
        }
    });

    // yLabelsGroup.selectAll("text") are on click event as a function
    yLabelsGroup.selectAll("text")
        .on("click", function() {
            var value = d3.select(this).attr("value");
            if (value !== chosenYaxis) {
                chosenYaxis = value;
                yLinScale = yScale(data, chosenYaxis);
                yAxis = renderYaxis(yLinScale, yAxis);
                stateGroup = renderStates(stateGroup, xLinScale, yLinScale, chosenXaxis, chosenYaxis);
                circlesGroup = renderCircles(circlesGroup, xLinScale, yLinScale, chosenXaxis, chosenYaxis);
                circlesGroup = updateToolTip(chosenXaxis, chosenYaxis, circlesGroup);

                // changes chosen y axis indicator
                if (chosenYaxis === "obesity") {
                    obesityLabel.classed("active", true).classed("inactive", false);
                    smokesLabel.classed("active", false).classed("inactive", true);
                    healthcareLabel.classed("active", false).classed("inactive", true);}
                else if (chosenYaxis === "smokes") {
                    obesityLabel.classed("active", false).classed("inactive", true);
                    smokesLabel.classed("active", true).classed("inactive", false);
                    healthcareLabel.classed("active", false).classed("inactive", true);}
                else {obesityLabel.classed("active", false).classed("inactive", true);
                    smokesLabel.classed("active", false).classed("inactive", true);
                    healthcareLabel.classed("active", true).classed("inactive", false);};
            }
        });
        
    }).catch(function(error) {
        console.log(error);
});