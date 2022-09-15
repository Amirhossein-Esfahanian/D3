import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import svgForm from "./assets/grid.svg";

export default function Canvas3() {
  let z = undefined;
  let form = undefined;
  let svg = undefined;
  let dragItem = undefined;
  let counter = 0;
  let dragAction = "move";
  let target = null;

  const [w, setW] = useState(window.innerWidth);
  const [isZooming, setZoom] = useState(true);
  const [h, setH] = useState(window.innerHeight);

  function mousemove(d) {
    let idSelector = null;
    let parentSelector = null;
    if (target === null) {
      idSelector = `#select${counter - 1}`;
      parentSelector = `#selectParent${counter - 1}`;
    } else {
      idSelector = `#select${target}`;
    }
    const select = d3
      .select("#my-svg")
      .select("#root-g")
      .select(parentSelector)
      .select(idSelector);

    var m = d3.mouse(this);

    select
      .attr("width", Math.max(0, m[0] - +select.node().getBBox().x))
      .attr("height", Math.max(0, m[1] - +select.node().getBBox().y));
  }
  function drag(parentSelector, idSelector, resizeSelector) {
    const itemToDrag = d3.select("#my-svg").select(parentSelector);
    const front = d3.select("#my-svg").select("#front").node();
    //get mouse position based on background
    var m = d3.mouse(front);

    // get resize circle
    const resizeHandle = d3
      .select("#my-svg")
      .select(parentSelector)
      .select(resizeSelector);

    const fieldToDrag = d3.select("#my-svg").select(idSelector);
    if (dragAction === "move") {
      //need to calculate center of shape
      itemToDrag
        .attr(
          "x",
          (itemToDrag.x =
            d3.event.x -
            itemToDrag.node().getBBox().x -
            fieldToDrag.node().getBBox().width / 2)
        )
        .attr(
          "y",
          (itemToDrag.y =
            d3.event.y -
            itemToDrag.node().getBBox().y -
            fieldToDrag.node().getBBox().height / 2)
        );
    } else {
      //set class to change color
      d3.select("#my-svg").selectAll("rect").classed("resizing", false);
      fieldToDrag.classed("resizing", true);
      //move resize circle
      resizeHandle.attr("cx", m[0]).attr("cy", m[1]);
      // select text and set to center
      const text = d3.select("#my-svg").select(parentSelector).select("text");
      text.attr(
        "y",
        itemToDrag.node().getBBox().y + itemToDrag.node().getBBox().height / 2
      );

      // set width and height of rectangle based on circle
      const x = resizeHandle.attr("cx");
      const y = resizeHandle.attr("cy");
      const fx = fieldToDrag.attr("x");
      const fy = fieldToDrag.attr("y");
      if (x - fx < 10) {
        fieldToDrag.attr("width", 10);
      } else if (y - fy < 10) {
        fieldToDrag.attr("height", 10);
      } else {
        fieldToDrag.attr("width", x - fx).attr("height", y - fy);
      }
    }
  }
  const zoom_actions = () => {
    form.attr("transform", d3.event.transform);
  };

  var zoom = d3
    .zoom()
    .scaleExtent([1 / 4, 8])
    .on("zoom", function () {
      d3.select("#form-g").attr("transform", d3.event.transform);
    });

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
          const newG = svg.append("g").attr("id", "form-g");

          form = newG
            .append("image")
            .attr("xlink:href", svgForm)
            .attr("id", "form")

            .style("width", w + "px")
            .style("height", h + "px")

            .on("click", function () {
              console.log(d3.mouse(this));
            });
          const elements = newG.append("g").attr("id", "elements-g");

          elements
            .append("rect")
            .attr("width", "50%")
            .attr("height", "90%")
            .on("mousemove", mousemove)
            .on("mouseup", function () {
              const parent = d3.select("#my-svg").select("#front");
              parent.on("mousemove", null);
            })
            //parent mouse down start drawing field
            .on("mousedown", function () {
              dragAction = "move";
              d3.select("#my-svg")
                .select("#root-g")
                .selectAll("rect")
                .classed("resizing", false);
              var m = d3.mouse(this);
              const idSelector = `#select${counter}`;
              const parentSelector = `#selectParent${counter}`;
              const classSelector = `.item${counter + 1}`;
              const resizeSelector = `#resizeHandle${counter + 1}`;

              //append field
              const newSelect = svg
                .append("svg")
                .attr("id", "selectParent" + counter);

              newSelect
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

                  newSelect
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

                  newSelect
                    .append("image")
                    .attr("xlink:href", checkSvg)
                    .style("width", 25 + "px")
                    .on("click", function () {
                      d3.select(idSelector).classed("item", "select");
                      d3.select(idSelector).on("mousedown", null);
                      d3.select(idSelector).on("mouseup", null);
                      alert("try to save");
                      d3.selectAll(classSelector).style("display", "none");
                      const parent = d3.select(parentSelector);
                      const parentPosition = parent.node().getBBox();
                      parent
                        .append("text")
                        .style("fill", "black")
                        .style("font-size", "14px")
                        .attr("dy", ".35em")
                        .attr("x", parentPosition.x + 3)
                        //set text center vertically
                        .attr("y", parentPosition.y + parentPosition.height / 2)
                        .style("style", "label")
                        .text("Helllo");

                      newSelect

                        .append("circle")
                        .attr("r", 5)
                        .attr("id", "resizeHandle" + counter)
                        .classed("item" + counter, "select")
                        .attr("cx", mu[0])
                        .attr("cy", mu[1])

                        .on("mouseover", function () {
                          dragAction = "resize";
                        })
                        .on("mouseleave", function () {});
                    })
                    .classed("item" + counter, "select")

                    .style("height", 25 + "px")
                    .attr("x", mu[0])
                    .attr("y", mu[1]);

                  var drag_handler = d3
                    .drag()
                    .on("drag", () =>
                      drag(parentSelector, idSelector, resizeSelector)
                    );
                  var resize_handler = d3.drag().on("drag", function (d) {
                    console.log(resizeSelector);
                  });

                  //choose drag what to start dragging
                  resize_handler(
                    d3
                      .select("#my-svg")
                      .select(parentSelector)
                      .select(resizeSelector)
                  );
                  drag_handler(d3.select("#my-svg").select(parentSelector));
                  const field = d3.select("#my-svg").select(idSelector);
                  const parent = d3.select("#my-svg").select("#front");
                  field.on("mousemove", null);
                  parent.on("mousemove", null);
                });

              const field = d3.select("#my-svg").select(idSelector);
              const parent = d3.select("#my-svg").select("#front");
              parent.on("mousemove", mousemove);
              field.on("mousemove", mousemove);
              counter++;
            })
            .attr("fill", "red")
            .attr("id", "drawer");

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

          svg.call(zoom);
        }}
      >
        Load Image
      </button>
      <svg height="90vh" width="90vw" id="my-svg"></svg>
    </div>
  );
}
