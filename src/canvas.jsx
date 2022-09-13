import React, { useEffect, useState } from "react";
import * as d3 from "d3";

import SVGImage from "./assets/grid.svg";

const Canvas = () => {
  let g = undefined;
  let z = undefined;
  let svg = undefined;
  const zeroState = [
    { x: null, y: null },
    { x: null, y: null },
  ];
  useEffect(() => {
    svg = d3.select("#my-svg").append("svg");

    svg
      .append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .on("click", click)
      .attr("fill", "white");
  }, []);

  //   const [x, setX] = useState(50);
  //   const [y, setY] = useState(50);
  const [w, setW] = useState(window.innerWidth);
  const [isZooming, setZoom] = useState(true);
  const [h, setH] = useState(window.innerHeight);
  const [fields, setFields] = useState([]);
  const [field, setField] = useState(zeroState);
  //   useEffect(() => {
  //     console.log(fields);
  //   }, [fields]);
  const zoom_actions = () => {
    g.attr("transform", d3.event.transform);
  };
  return (
    <div className="w-75" style={{ border: "1px solid red" }}>
      <h1>Start</h1>
      <button
        onClick={() => {
          if (isZooming) {
            z = d3
              .select("#my-svg")
              .append("rect")
              .attr("width", "100%")
              .attr("height", "100%")
              .attr("fill", "transparent")
              // .style("background-color", "red")
              // .style("opacity", "0.2")
              .on("mousedown", function () {
                var m = d3.mouse(this);

                const rect = z
                  .append("rect")
                  .attr("x", m[0])
                  .attr("y", m[1])
                  .attr("fill", "red")
                  .attr("height", 0)
                  .attr("width", 0)
                  .style("id", "select");
                z.on("mousemove", mousemove);
              })
              .on("mouseup", function mouseup() {
                z.on("mousemove", null);
              })
              .attr("id", "redBack");

            function mousemove(d) {
              var m = d3.mouse(this);
              var cross = d3.select("#select");
              cross
                .attr("width", Math.max(0, m[0] - +cross.attr("x")))
                .attr("height", Math.max(0, m[1] - +cross.attr("y")));
            }
          } else {
            d3.select("#my-svg").select("#redBack").remove();
            setZoom(true);
          }
        }}
      >
        {isZooming ? "Disable Zoom" : "Enable Zoom"}
      </button>
      <button
        onClick={() => {
          g = svg
            .append("image")
            .attr("id", "form")
            .attr("xlink:href", SVGImage)
            .style("background-color", "red")

            .style("width", w + "px")
            .style("height", h + "px");

          var zoom_handler = d3.zoom().on("zoom", zoom_actions);
          zoom_handler(g);
        }}
      >
        Load Image
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
function click(point, type) {
  //     const dot = {};
  //   if (type === "start") {
  //             point.append("start",point)
  //   } else {
  //     end = point;
  //     console.log(start, end);
  //   }
  //   console.log(d);
}

function mouseDown(x) {
  console.log("mouseDown");
  console.log(x);
}

function mouseUp() {
  console.log("mouseUp");
}

export default Canvas;
