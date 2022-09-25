import React, { useEffect, useState } from "react";
import Swal from "sweetalert2/dist/sweetalert2.js";
import * as d3 from "d3";
import svgForm from "./assets/401290.svg";
import plusSvg from "./assets/plus.svg";
import closeSvg from "./assets/close.svg";
import checkSvg from "./assets/check.svg";
import resizeSvg from "./assets/resize.svg";

export default function Canvas3() {
  let z = undefined;
  let form = undefined;
  let svg = undefined;
  let elements = undefined;
  let dragItem = undefined;
  let counter = 0;
  let dragAction = "move";
  let target = null;

  const [fields, setFields] = useState([]);
  const [isZooming, setZoom] = useState(true);
  const [w, setW] = useState(window.innerWidth);
  const [h, setH] = useState(window.innerHeight);
  async function saveField({ x, y, width, height }) {
    const { value: title } = await Swal.fire({
      text: "Enter Field Title",
      input: "text",
      // inputLabel: "Title",
      inputValue: null,
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "You need to write something!";
        }
      },
    });
    if (title) {
      const field = { title, x, y, width, height };
      // const newFields = [...fields];
      // newFields.push(field);
      // console.log(newFields);
      setFields((current) => [...current, field]);

      Swal.fire({
        // position: 'top-end',
        icon: "success",
        title: "New field has been saved",
        showConfirmButton: false,
        timer: 1500,
      });
      return title;
    }
  }
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

    //check if drawing started or not
    if (select.size() !== 0) {
      //select mouse position based on form object
      var m = d3.mouse(
        d3.select("#my-svg").select("#root-g").select("#form").node()
      );

      select
        .attr("width", Math.max(0, m[0] - +select.node().getBBox().x))
        .attr("height", Math.max(0, m[1] - +select.node().getBBox().y));
    }
  }
  // function drag(parentSelector, idSelector) {
  //   console.log(parentSelector);
  //   console.log(idSelector);
  // }
  function drag(parentSelector, idSelector, resizeSelector) {
    const itemToDrag = d3.select("#my-svg").select(parentSelector);
    // const front = d3.select("#my-svg").select("#root-g").select("#form").node();

    //get mouse position based on background
    var m = d3.mouse(
      d3.select("#my-svg").select("#root-g").select("#form").node()
    );

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
            m[0] -
            itemToDrag.node().getBBox().x -
            fieldToDrag.node().getBBox().width / 2)
        )
        .attr(
          "y",
          (itemToDrag.y =
            m[1] -
            itemToDrag.node().getBBox().y -
            fieldToDrag.node().getBBox().height / 2)
        );
    } else {
      //set class to change color
      // d3.select("#my-svg").selectAll("rect").classed("resizing", false);
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
  var zoom = d3
    .zoom()
    .scaleExtent([1 / 4, 8])
    .on("zoom", function () {
      d3.select("#form-g").attr("transform", d3.event.transform);
    });

  return (
    <>
      Canvas3
      <button
        // disabled={!isZooming}
        onClick={function () {
          if (isZooming) {
            if (d3.select("#my-svg").select("#zoomCover").size() !== 0) {
              console.log("display true");
              d3.select("#my-svg").select("#zoomCover").classed("hide", false);
              setZoom(false);

              // .style("display", "true");
            } else {
              console.log("create new");

              z = d3
                .select("#my-svg")
                .append("rect")
                .attr("width", "100%")
                .attr("height", "100%")
                .attr("fill", "transparent")
                .attr("id", "zoomCover")
                .on("mousemove", mousemove)
                .on("mouseup", function () {
                  const parent = d3.select("#my-svg").select("#zoomCover");
                  parent.on("mousemove", null);
                  const idSelector = `#select${counter - 1}`;
                  const parentSelector = `#selectParent${counter - 1}`;
                  const classSelector = `.item${counter}`;
                  const resizeSelector = `#resizeHandle${counter}`;

                  const board = d3
                    .select("#my-svg")
                    .select("#root-g")
                    .select("#form-g")
                    .select("#elements-g")
                    .select(parentSelector);
                  const boardProp = board.node().getBBox();
                  //add clear btn to the field
                  const del = board
                    .append("image")
                    .attr("xlink:href", closeSvg)
                    .style("width", 25 + "px")
                    .style("height", 25 + "px")
                    .classed("item" + counter, "select")

                    .attr("x", boardProp.x + boardProp.width)
                    .attr("y", boardProp.y)
                    .on("click", function () {
                      //id and class number is not same so have to select separately

                      d3.select(idSelector).remove();
                      d3.selectAll(classSelector).remove();
                    });

                  //exit draw mode
                  d3.select("#my-svg")
                    .select("#zoomCover")
                    .classed("hide", true);
                  setZoom(true);
                  //add save btn to the field
                  board
                    .append("image")
                    .attr("xlink:href", checkSvg)
                    .style("width", 25 + "px")
                    .on("click", function () {
                      // z.on("mousedown", null);
                      // z.on("mouseup", null);
                      const title = saveField(
                        d3.select(idSelector).node().getBBox()
                      ).then((title) => {
                        d3.select(parentSelector)
                          .append("text")
                          .style("fill", "black")
                          .style("font-size", "14px")
                          .attr("dy", ".35em")
                          .attr("x", boardProp.x + 3)
                          //set text center vertically
                          .attr("y", boardProp.y + boardProp.height / 2)
                          .text(title)
                          .style("style", "label");
                      });
                      d3.select(idSelector).classed("item", "select");
                      d3.selectAll(classSelector).remove();

                      // // const parent = d3.select(parentSelector);
                      // // const parentPosition = parent.node().getBBox();

                      // //add resize handler

                      d3.select(parentSelector)

                        .append("circle")
                        .attr("r", 10)
                        .attr("id", "resizeHandle" + counter)
                        .classed("item" + counter, "select")
                        .attr("cx", boardProp.x + boardProp.width)
                        .attr("cy", boardProp.y + boardProp.height)
                        // //call drag
                        .call(
                          d3
                            .drag()
                            .on("start", function () {
                              d3.select(this).classed("resizing", true);
                            })
                            .on("end", function () {
                              dragAction = "move";
                              d3.select("#my-svg")
                                .selectAll("circle")
                                .classed("resizing", false)
                                .classed("moving", false);
                              d3.select("#my-svg")
                                .selectAll("rect")
                                .classed("resizing", false)
                                .classed("moving", false);
                            })
                            .on("drag", () => {
                              drag(parentSelector, idSelector, resizeSelector);
                            })
                        )
                        .on("mouseleave", function () {
                          // dragAction = "move";
                        })
                        .on("mouseover", function () {
                          dragAction = "resize";
                        });
                    })
                    .classed("item" + counter, "select")
                    .style("height", 25 + "px")
                    .attr("x", boardProp.x + boardProp.width)
                    .attr("y", boardProp.y + boardProp.height);

                  // counter++;
                })
                //parent mouse down start drawing field
                .on("mousedown", function () {
                  dragAction = "move";
                  d3.select("#my-svg").select("#root-g").selectAll("rect");

                  var m = d3.mouse(
                    d3
                      .select("#my-svg")
                      .select("#root-g")
                      .select("#form")
                      .node()
                  );
                  // var m = d3.mouse(this);

                  const idSelector = `#select${counter}`;
                  const parentSelector = `#selectParent${counter}`;
                  const classSelector = `.item${counter + 1}`;
                  const resizeSelector = `#resizeHandle${counter + 1}`;

                  //append field
                  const newField = elements
                    .append("svg")

                    // .call(
                    //   d3
                    //     .drag()
                    //     .on("drag", () =>
                    //       drag(parentSelector, idSelector, resizeSelector)
                    //     )
                    // )
                    // .call(
                    //   d3.drag().on("drag",

                    //   function (d) {
                    //     // const fieldToDrag = d3.select("#my-svg").select(idSelector);
                    //     // const parentSelector = `#selectParent${this.id
                    //     //   .match(/\d/g)
                    //     //   .join("")}`;
                    //     var m = d3.mouse(this);

                    //     d3.select(this).attr("x", m[0]).attr("y", m[1]);
                    //   })
                    // )
                    // .call(
                    //   d3.drag().on("drag", function (d) {
                    //     d3.select(this)
                    //       .attr("x", d3.event.x)
                    //       .attr("y", d3.event.y);
                    //   })
                    // )
                    .attr("id", "selectParent" + counter);

                  newField
                    .append("rect")
                    .attr("x", m[0])
                    .attr("y", m[1])
                    .attr("height", 0)
                    .attr("width", 0)
                    .attr("fill", "green")
                    .attr("border", 1)
                    .attr("href", "#pointer")

                    //call drag
                    .call(
                      d3
                        .drag()
                        .on("start", function () {
                          d3.select(this).classed("moving", true);
                        })
                        .on("end", function () {
                          d3.select("#my-svg")
                            .selectAll("rect")
                            .classed("resizing", false)
                            .classed("moving", false);
                        })
                        .on("drag", () =>
                          drag(parentSelector, idSelector, resizeSelector)
                        )
                    )
                    // .classed("item", "select")
                    .attr("id", "select" + counter)
                    // .on("mousemove", mousemove)

                    .on("mousedown", function () {
                      const field = d3.select("#my-svg").select(idSelector);

                      //   field.on("mousemove", mousemove);
                    })
                    .on("mouseup", function () {
                      var mu = d3.mouse(this);

                      newField
                        .append("image")
                        .attr("xlink:href", closeSvg)
                        .style("width", 25 + "px")
                        .style("height", 25 + "px")
                        .classed("item" + counter, "select")

                        .attr("x", mu[0])
                        .attr("y", m[1])
                        .on("click", function () {
                          //id and class number is not same so have to select separately
                          d3.select(idSelector).remove();
                          d3.selectAll(classSelector).remove();
                        });

                      newField
                        .append("image")
                        .attr("xlink:href", checkSvg)
                        .style("width", 25 + "px")
                        .on("click", function () {
                          console.log("item", d3.select(idSelector));
                          // d3.select(idSelector).classed("item", "select");
                          // d3.select(idSelector).on("mousedown", null);
                          // d3.select(idSelector).on("mouseup", null);
                          // alert("try to save");
                          // d3.selectAll(classSelector).style("display", "none");
                          // const parent = d3.select(parentSelector);
                          // const parentPosition = parent.node().getBBox();
                          // parent
                          //   .append("text")
                          //   .style("fill", "black")
                          //   .style("font-size", "14px")
                          //   .attr("dy", ".35em")
                          //   .attr("x", parentPosition.x + 3)
                          //   //set text center vertically
                          //   .attr(
                          //     "y",
                          //     parentPosition.y + parentPosition.height / 2
                          //   )
                          //   .style("style", "label")
                          //   .text("Helllo");

                          // newSelect

                          //   .append("circle")
                          //   .attr("r", 5)
                          //   .attr("id", "resizeHandle" + counter)
                          //   .classed("item" + counter, "select")
                          //   .attr("cx", mu[0])
                          //   .attr("cy", mu[1])

                          //   .on("mouseover", function () {
                          //     dragAction = "resize";
                          //   })
                          //   .on("mouseleave", function () {});
                        })
                        .classed("item" + counter, "select")

                        .style("height", 25 + "px")
                        .attr("x", mu[0])
                        .attr("y", mu[1]);

                      // var drag_handler = d3.drag().on("drag", () => {
                      //   drag(parentSelector, idSelector, resizeSelector);
                      // });
                      // // .on("start", function () {
                      // //   alert("dddd");
                      // // });

                      // drag_handler(
                      //   d3
                      //     .select("#my-svg")

                      //     .select(parentSelector)
                      // );
                      const field = d3
                        .select("#my-svg")
                        .select("#root-g")
                        .select("#form-g")
                        .select("#elements-g")
                        .select(idSelector);
                      const parent = d3.select("#my-svg").select("#zoomCover");
                      // const field = d3.select("#my-svg").select(idSelector);
                      // const parent = d3.select("#my-svg").select("#front");
                      d3.select("#my-svg")
                        .select("#zoomCover")
                        .classed("hide", true);
                      // .style("display", "none");

                      // d3.select("#my-svg").select("#zoomCover").remove();
                      field.on("mousemove", null);
                      parent.on("mousemove", null);
                      setZoom(true);
                    });

                  const field = d3
                    .select("#my-svg")
                    .select("#root-g")
                    .select("#form-g")
                    .select("#elements-g")
                    .select(idSelector);
                  const board = d3.select("#my-svg").select("#zoomCover");
                  // const field = d3.select("#my-svg").select(idSelector);
                  // const parent = d3.select("#my-svg").select("#front");
                  board.on("mousemove", mousemove);
                  // field.on("mousemove", mousemove);
                  // alert("done");

                  counter++;
                });
              setZoom(false);
            }
          } else {
            d3.select("#my-svg").select("#zoomCover").classed("hide", true);
            setZoom(true);
          }
        }}
      >
        {isZooming ? "Add New Field" : "Cancel"}
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

            // .style("width", w + "px")
            // .style("height", h + "px")

            .on("click", function () {
              dragAction = "move";
            });
          elements = newG.append("g").attr("id", "elements-g");

          // elements
          //   .append("rect")
          //   .attr("width", "50%")
          //   .attr("height", "90%")

          //   .attr("fill", "red")
          //   .attr("id", "drawer");

          // const field = newG
          //   .append("rect")
          //   .attr("id", "field")
          //   .attr("x", 100)
          //   .attr("y", 100)
          //   .call(
          //     d3.drag().on("drag", function (d) {
          //       d3.select(this).attr("x", d3.event.x).attr("y", d3.event.y);
          //     })
          //   )
          //   .attr("width", 100)
          //   .attr("height", 100);

          svg.call(zoom);
        }}
      >
        Load Image
      </button>
      <button
        onClick={async () => {
          const { value: title } = await Swal.fire({
            text: "Enter Field Title",
            input: "text",
            // inputLabel: "Title",
            inputValue: null,
            showCancelButton: true,
            inputValidator: (value) => {
              if (!value) {
                return "You need to write something!";
              }
            },
          });

          if (title) {
            Swal.fire(`Your IP address is ${ipAddress}`);
          }
        }}
      >
        {" "}
        Counter
      </button>
      <svg height="90vh" width="90vw" id="my-svg"></svg>
    </>
  );
}
