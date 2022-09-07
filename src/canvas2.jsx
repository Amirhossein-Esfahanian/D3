import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import plusSvg from "./assets/plus.svg";
import closeSvg from "./assets/close.svg";
import checkSvg from "./assets/check.svg";

export default function Canvas2() {
  const [isDrawing, setIsDrawing] = useState("up");
  let counter = 0;

  var dragHandler = d3.drag().on("drag", function () {
    d3.select(this).attr("x", d3.event.x).attr("y", d3.event.y);
  });

  function mousemove(d) {
    console.log(counter);
    const idSelector = `#select${counter - 1}`;

    var m = d3.mouse(this);
    const select = d3.select("#my-svg").select(idSelector);

    select
      .attr("width", Math.max(0, m[0] - +select.attr("x")))
      .attr("height", Math.max(0, m[1] - +select.attr("y")));
  }
  return (
    <>
      <h1>Header</h1>
      <p>{isDrawing}</p>
      <button
        onClick={() => {
          const svg = d3.select("#my-svg").append("svg");

          //add back svg
          svg
            .append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", "red")
            .attr("id", "back");

          //add front svg
          let front = svg
            .append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", "cyan")
            .attr("id", "front")
            .on("mousemove", mousemove)
            .on("mouseup", function () {
              const parent = d3.select("#my-svg").select("#front");
              const zeroChild = d3.select("#my-svg").selectAll(".select");
              console.log(zeroChild);
              parent.on("mousemove", null);
            })
            //parent mouse down start drawing field
            .on("mousedown", function () {
              var m = d3.mouse(this);
              const idSelector = `#select${counter}`;
              const classSelector = `.item${counter + 1}`;
              //append field
              const z = svg;

              svg
                .append("rect")
                .attr("x", m[0])
                .attr("y", m[1])
                .attr("height", 0)
                .attr("width", 0)
                .attr("fill", "green")
                .attr("border", 1)
                .attr("href", "#pointer")
                // .classed("item", "select")
                .attr("id", "select" + counter)
                .on("mousemove", mousemove)
                .on("mousedown", function () {
                  const field = d3.select("#my-svg").select(idSelector);
                  //   field.on("mousemove", mousemove);
                })
                .on("mouseup", function () {
                  var mu = d3.mouse(this);

                  svg
                    .append("image")
                    .attr("xlink:href", closeSvg)
                    .style("width", 25 + "px")
                    .style("background-color", "red")
                    .style("height", 25 + "px")
                    .classed("item" + counter, "select")

                    .attr("x", mu[0])
                    .attr("y", m[1])
                    .on("click", function () {
                      //id and class number is not same so have to select separately
                      d3.select(idSelector).remove();
                      d3.selectAll(classSelector).remove();
                    });

                  svg
                    .append("image")
                    .attr("xlink:href", checkSvg)
                    .style("background-color", "red")
                    .style("width", 25 + "px")
                    .on("click", function () {
                      d3.select(idSelector).classed("item", "select");
                      d3.select(idSelector).on("mousedown", null);
                      d3.select(idSelector).on("mouseup", null);

                      alert("try to save");
                      d3.selectAll(classSelector).style("display", "none");
                    })
                    .classed("item" + counter, "select")

                    .style("height", 25 + "px")
                    .attr("x", mu[0])
                    .attr("y", mu[1]);
                  svg
                    .append("image")
                    .style("background-color", "red")
                    .attr("xlink:href", plusSvg)
                    .classed("item" + counter, "select")

                    .style("width", 25 + "px")
                    .style("height", 25 + "px")
                    .attr("x", m[0])
                    .attr("y", m[1]);

                  const field = d3.select("#my-svg").select(idSelector);
                  const parent = d3.select("#my-svg").select("#front");
                  field.on("mousemove", null);
                  parent.on("mousemove", null);
                });
              dragHandler(svg.selectAll("use"));

              const field = d3.select("#my-svg").select(idSelector);
              const parent = d3.select("#my-svg").select("#front");
              parent.on("mousemove", mousemove);
              field.on("mousemove", mousemove);
              counter++;
            });
        }}
      >
        Add Background
      </button>
      <button
        onClick={() => {
          d3.select("rect.item");
        }}
      >
        Test
      </button>
      <button
        onClick={() => {
          const back = d3.select("#my-svg").select("#back");
          back.attr("fill", "blue");
        }}
      >
        Blue
      </button>
      <button
        onClick={() => {
          const back = d3.select("#my-svg").select("#back");
          back.attr("fill", "green");
        }}
      >
        Green
      </button>
      <svg height="90vh" width="90vw" id="my-svg"></svg>
    </>
  );
}
