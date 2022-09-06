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
          console.log("original", isZooming);
          if (isZooming) {
            z = d3
              .select("#my-svg")
              .append("rect")
              .attr("width", "100%")
              .attr("height", "100%")
              .attr("fill", "transparent")
              .on("mouseup", function () {
                var xy = d3.mouse(this);
                g = d3.select("#my-svg");
                var transform = d3.zoomTransform(g.node());
                var xy1 = transform.invert(xy);
                // click(xy, "end");
                // const point = { ...field };
                // point.end = { x: xy[0], y: xy[1] };
                // setField(point);
                const end = { x: xy[0], y: xy[1] };
                let newField = [...field];
                // newField.push(start);
                console.log(field);
                // newFields.push({ start, end, label: "test" });
                // setFields(newFields);
                // setField({ start, end, label: "test" });
                // console.log(field);
              })
              .on("mousedown", function () {
                var xy = d3.mouse(this);
                g = d3.select("#my-svg");
                var transform = d3.zoomTransform(g.node());
                var xy1 = transform.invert(xy);
                // click(xy, "start");

                // const point = { ...field };
                // point.start = { x: xy[0], y: xy[1] };
                // setField(point);
                const start = { x: xy[0], y: xy[1] };
                let newField = [];
                newField.push(start);
                console.log(xy);
                setField(newField);
                // console.log(
                //   "Mouse:[",
                //   xy[0],
                //   xy[1],
                //   "] Zoomed:[",
                //   xy1[0],
                //   xy1[1],
                //   "]"
                // );
              })
              //   .style("display", isZooming ? "none" : "")
              .attr("id", "redBack");

            setZoom(false);
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
