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

    // svg
    //   .append("rect")
    //   .attr("width", "100%")
    //   .attr("height", "100%")
    //   .attr("fill", "red")
    //   //   .style("display", isZooming ? "none" : "")

    //   //   .attr("display", isZooming ? "none" : "")
    //   .on("click", function () {
    //     svg.remove(this);
    //   });
    //   .attr("width", 400)
    //   .attr("height", 400)
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
    //   if (!isZooming) {
    //     return;
    //   }

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
                  .attr("height", 0)
                  .attr("width", 0)
                  .style("id", "select");
                z.on("mousemove", mousemove);
              })
              .on("mouseup", function mouseup() {
                z.on("mousemove", null);
              })
              .attr("id", "redBack");

            setZoom(false);

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
          // .on("mouseup", mouseUp)
          // .on("click", click);
          // .on("mousedown", function () {
          //   var xy = d3.mouse(this);

          //   var transform = d3.zoomTransform(g.node());
          //   var xy1 = transform.invert(xy);

          //   console.log(
          //     "Mouse:[",
          //     xy[0],
          //     xy[1],
          //     "] Zoomed:[",
          //     xy1[0],
          //     xy1[1],
          //     "]"
          //   );
          // });

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
