import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import svgForm from "./assets/grid.svg";

export default function Canvas3() {
  let z = undefined;
  let form = undefined;
  let svg = undefined;
  let dragItem = undefined;
  const zeroState = [
    { x: null, y: null },
    { x: null, y: null },
  ];

  useEffect(() => {}, []);

  const [w, setW] = useState(window.innerWidth);
  const [isZooming, setZoom] = useState(true);
  const [h, setH] = useState(window.innerHeight);

  const zoom_actions = () => {
    form.attr("transform", d3.event.transform);
  };

  var zoom = d3
    .zoom()
    .scaleExtent([1 / 4, 8])
    .on("zoom", function () {
      d3.select("#new-g").attr("transform", d3.event.transform);
    });

  function dragged(d) {
    d3.select(this)
      .attr("x", (d.x = d3.event.x))
      .attr("y", (d.y = d3.event.y));
  }
  function center() {
    return d3.zoomIdentity.scale(0.5);
  }
  return (
    <div>
      Canvas3
      <button
        onClick={function () {
          if (isZooming) {
            z = d3
              .select("#my-svg")
              .append("rect")
              .attr("width", "100%")
              .attr("height", "100%")
              .attr("fill", "transparent")
              .attr("id", "zoomCover");

            setZoom(false);
          } else {
            d3.select("#my-svg").select("#zoomCover").remove();
            setZoom(true);
          }
        }}
      >
        {isZooming ? "Disable Zoom" : "Enable Zoom"}
      </button>
      <button
        onClick={() => {
          svg = d3.select("#my-svg").append("g").attr("id", "root-g");
          svg
            .append("rect")
            .attr("width", "100%")
            .attr("height", "100%")

            .attr("fill", "white");
          const newG = svg.append("g").attr("id", "new-g");
          form = newG
            .append("image")
            .attr("xlink:href", svgForm)
            .attr("id", "form")
            .style("width", w + "px")
            .style("height", h + "px")
            .on("click", function () {
              console.log(d3.mouse(this));
            });

          const field = newG
            .append("rect")
            .attr("id", "field")
            .attr("x", 100)
            .attr("y", 100)
            .call(
              d3.drag().on("drag", function (d) {
                d3.select(this).attr("x", d3.event.x).attr("y", d3.event.y);
              })
            )
            .attr("width", 100)
            .attr("height", 100);

          // field
          // .call(
          //   d3.drag().on("drag", function (d) {
          //     d3.select(this).attr("x", d3.event.x).attr("y", d3.event.y);
          //   })
          // );
          var zoom_handler = d3
            .zoom()
            .scaleExtent([1 / 2, 8])
            .on("zoom", zoom_actions);
          // zoom_handler(form);
          svg.call(zoom);
        }}
      >
        Load Image
      </button>
      <svg height="90vh" width="90vw" id="my-svg"></svg>
    </div>
  );
}
