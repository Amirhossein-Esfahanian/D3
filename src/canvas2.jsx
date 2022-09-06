import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import SVGImage from "./assets/401290.svg";

export default function canvas2() {
  useEffect(() => {
    var svg = d3
      .select("body")
      .append("svg")
      .attr("width", 500)
      .attr("height", 300)
      .attr("fill", "#eee");

    var g = svg.append("g").attr("transform", "translate(50,50)");

    var rect = g
      .append("rect")
      .attr("width", 400)
      .attr("height", 200)
      .attr("fill", "#eee");

    var x = d3.scaleLinear().domain([0, 400]).range([0, 400]);
    var y = d3.scaleLinear().domain([0, 200]).range([0, 200]);

    var axisX = d3.axisTop().scale(x).tickSize(-200);
    var axisY = d3.axisLeft().scale(y).tickSize(-400);

    var gX = g.append("g").call(axisX);
    var gY = g.append("g").call(axisY);

    var zoom = d3.zoom().scaleExtent([1, 8]).on("zoom", zoomed);

    rect.call(zoom);

    rect.on("click", function () {
      var xy = d3.mouse(this);

      var transform = d3.zoomTransform(rect.node());
      var xy1 = transform.invert(xy);

      console.log("Mouse:[", xy[0], xy[1], "] Zoomed:[", xy1[0], xy1[1], "]");
    });

    function zoomed() {
      gX.call(axisX.scale(d3.event.transform.rescaleX(x)));
      gY.call(axisY.scale(d3.event.transform.rescaleY(y)));
    }
  });

  return <div>canvas2</div>;
}
