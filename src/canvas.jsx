import React, { useEffect, useState } from "react";
import * as d3 from "d3";

import SVGImage from "./assets/401290.svg";

const D3Image = () => {
  useEffect(() => {
    const svg = d3.select("#my-svg").append("svg");
    svg
      .append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .on("click", click)
      .attr("fill", "white");

    let g = svg
      .append("image")
      .attr("xlink:href", SVGImage)
      .style("background-color", "red")
      .on("click", click())
      //   .attr("x", x)
      //   .attr("y", y)
      .style("width", w + "px")
      .style("height", h + "px")
      //   .on("mousedown", mouseDown(d3.mouse(this)))
      .on("mouseup", mouseUp)
      .on("click", click)
      .on("mousedown", function () {
        console.log("down");
        console.log(d3.mouse(this));
      })
      .on("mouseup", function () {
        // d3.select(this).style("background-color", "steelblue");
        console.log("up");
        console.log(d3.mouse(this));
      });

    var zoom_handler = d3.zoom().on("zoom", zoom_actions);
    function zoom_actions() {
      if (!isZooming) {
        return;
      }

      g.attr("transform", d3.event.transform);
    }
    zoom_handler(g);

    //   .attr("width", 400)
    //   .attr("height", 400)
  });

  //   const [x, setX] = useState(50);
  //   const [y, setY] = useState(50);
  const [w, setW] = useState(window.innerWidth);
  const [isZooming, setZoom] = useState(false);
  const [h, setH] = useState(window.innerHeight);

  return (
    <div className="w-75" style={{ border: "1px solid red" }}>
      <h1>Start</h1>
      <button
        onClick={() => {
          setX(0);
          setY(0);
        }}
      >
        Reset position
      </button>
      <button
        onClick={() => {
          setW(250);
          setH(250);
        }}
      >
        Set 50
      </button>
      <button
        onClick={() => {
          setW(10);
          setH(10);
        }}
      >
        Set 10
      </button>
      <svg height="90vh" width="90vw" id="my-svg"></svg>
    </div>
  );
};
// Toggle children on click.
function click(d) {
  console.log("click");
}

function mouseDown(x) {
  console.log("mouseDown");
  console.log(x);
}

function mouseUp() {
  console.log("mouseUp");
}

export default D3Image;
