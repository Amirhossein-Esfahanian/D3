import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import plusSvg from "./assets/plus.svg";
import closeSvg from "./assets/close.svg";
import checkSvg from "./assets/check.svg";
import resizeSvg from "./assets/resize.svg";

export default function Canvas2() {
  // let [dragAction, setDragAction] = useState("move");
  let counter = 0;
  let dragAction = "move";
  let target = null;
  function mousemove(d) {
    let idSelector = null;
    if (target === null) {
      idSelector = `#select${counter - 1}`;
    } else {
      idSelector = `#select${target}`;
    }
    const select = d3.select("#my-svg").select(idSelector);

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

  return (
    <>
      <h1>Header</h1>
      <p>{dragAction}</p>
      <button
        onClick={() => {
          const svg = d3.select("#my-svg");

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
              parent.on("mousemove", null);
            })
            //parent mouse down start drawing field
            .on("mousedown", function () {
              dragAction = "move";
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
                        // .append("image")
                        // .attr("xlink:href", resizeSvg)
                        // .style("width", 15 + "px")
                        // .style("height", 15 + "px")
                        // .attr("x", mu[0] - 15)
                        // .attr("y", mu[1] - 15);
                        .append("circle")
                        .attr("r", 5)
                        .attr("id", "resizeHandle" + counter)
                        .classed("item" + counter, "select")
                        .attr("cx", mu[0])
                        .attr("cy", mu[1])

                        .on("mouseover", function () {
                          dragAction = "resize";
                          // d3.select(parentSelector).on("mousedown", null);
                          // d3.select(parentSelector).on("mouseup", null);
                          // d3.select(parentSelector).on("click", null);
                          // d3.select(parentSelector).on("mousemove", null);
                        })
                        .on("mouseleave", function () {
                          // setDragAction("move");
                          // d3.select(parentSelector).on("mousemove", mousemove);
                          // d3.select(idSelector).on("mousemove", mousemove);
                        });
                    })
                    .classed("item" + counter, "select")

                    .style("height", 25 + "px")
                    .attr("x", mu[0])
                    .attr("y", mu[1]);
                  // newSelect
                  //   .append("image")
                  //   .style("background-color", "red")
                  //   .attr("xlink:href", plusSvg)
                  //   .classed("item" + counter, "select")
                  //   // .attr("cx", function (d) {
                  //   //   return d.x;
                  //   // })
                  //   // .attr("cy", function (d) {
                  //   //   return d.y;
                  //   // })
                  //   .style("width", 25 + "px")
                  //   .style("height", 25 + "px")
                  //   .attr("x", m[0])
                  //   .attr("id", "move")
                  //   .attr("y", m[1]);

                  var drag_handler = d3
                    .drag()
                    .on("drag", () =>
                      drag(parentSelector, idSelector, resizeSelector)
                    );
                  var resize_handler = d3.drag().on("drag", function (d) {
                    console.log(resizeSelector);
                    // const itemToDrag = d3
                    //   .select("#my-svg")
                    //   .select(parentSelector);
                    // //need to calculate center of shape
                    // const fieldToDrag = d3.select("#my-svg").select(idSelector);
                    // console.log(d3.event);
                    // // console.log(d3.event.x, d3.event.y);
                    // itemToDrag
                    //   .attr(
                    //     "x",
                    //     (itemToDrag.x =
                    //       d3.event.x -
                    //       itemToDrag.node().getBBox().x -
                    //       fieldToDrag.node().getBBox().width / 2)
                    //   )
                    //   .attr(
                    //     "y",
                    //     (itemToDrag.y =
                    //       d3.event.y -
                    //       itemToDrag.node().getBBox().y -
                    //       fieldToDrag.node().getBBox().height / 2)
                    //   );
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
