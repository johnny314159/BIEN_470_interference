import React, { useRef, useEffect } from "react";
import { select, hierarchy, tree, linkHorizontal } from "d3";
import useResizeObserver from "./useResizeObserver";


function TreeChart({ data }) {

  const svgRef = useRef();
  const wrapperRef = useRef();
  const dimensions = useResizeObserver(wrapperRef);

  // check if a string is upper case
  const isUpperCase = str => str === str.toUpperCase();

  // check if a value is positive or negative
  const isPositive = number => number > 0;


  // will be called initially and on every data change
  useEffect(() => {
    const svg = select(svgRef.current);
    if (!dimensions) return;

    const root = hierarchy(data);
    const treeLayout = tree().size([4*dimensions.height, 0.9*dimensions.width]);
    treeLayout(root);

    const linkGenerator = linkHorizontal()
                              .x(node => node.y)
                              .y(node => node.x);


      // render links
      svg
        .selectAll(".link")
        .data(root.links())
        .join("path")
        .attr("class", "link")
        .attr("d", linkGenerator)
        .attr("fill", "none")
        .attr("stroke", d =>
                {if((d.target.data.branch_score === "null")) {return "black"}
                else if(d.target.data.branch_score > 0) {return "#C35D57"}
                else {return "#57bdc3"}
              })
        .attr("stroke-dasharray", d => (d.target.data.branch_score === "null") ? 5 : 0)
        .attr("stroke-width",  4)
        .attr("opacity", d => (Math.abs(parseFloat(d.target.data.branch_score)) < 0.25) ? 0.25 : Math.abs(parseFloat(d.target.data.branch_score)));
        

      // render nodes
      svg
        .selectAll(".node")
        .data(root.descendants())
        .join(enter => enter.append("circle").attr("opacity", 1))
        .attr("class", "node")
        .attr("cx", node => node.y)
        .attr("cy", node => node.x)
        .attr("stroke", "black")
        .attr("fill", node => (node.data.node_score < 0.5) ? "transparent" : "black")
        .attr("r", node => (node.data.node_score > 1) ? 0 : 4);


      // render labels
      svg
        .selectAll(".label")
        .data(root.descendants())
        .join(enter => enter.append("text").attr("opacity", 1))
        .attr("class", "label")
        .attr("x", node => node.children ? -5 + node.y: 5 + node.y)
        .attr("y", node => node.x)
        .attr("dy", "0.32em")
        .attr("text-anchor", node => node.children ? 'end': 'start')
        .attr("font-size", 12)
        .text(node => isUpperCase(node.data.name) ? '' : node.data.name)


      var colors =	[ ["Positive contribution", "#C35D57"], ["Negative contribution", "#57bdc3"] ];

      // Adding the legend
      var legend = svg.append("svg")
        .attr("class", "legend")
        .attr("height", 100)
        .attr("width", 100)
        .attr('transform', 'translate(20,50)');


      var legendRect = legend.selectAll('rect').data(colors);

      legendRect.enter()
        .append("rect")
        .attr("x", 10)
        .attr("width", 10)
        .attr("height", 10)
        .attr("y", function(d, i) {
            return i * 20;
        })
        .style("fill", function(d) {
            return d[1];
        });

      var legendText = legend.selectAll('text').data(colors);

      legendText.enter()
        .append("text")
        .attr("x", 25)
        .attr("y", function(d, i) {
            return i * 20 + 10;
        })
        .text(function(d) {
            return d[0];
        });


}, [data, dimensions]);

  return (
    <div ref={wrapperRef} >
      <svg ref={svgRef} ></svg>
    </div>
  );
}

export default TreeChart;
