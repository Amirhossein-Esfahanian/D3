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

  // const [preFields, setPreFields] = useState([]);
  const [item, addItem] = useState();
  const [fields, setFields] = useState([]);
  const [isZooming, setZoom] = useState(true);
  const [w, setW] = useState(window.innerWidth);
  const [h, setH] = useState(window.innerHeight);

  //update fields list based on changes
  useEffect(() => {
    //not trigger on start
    if (!item) {
      return;
    }

    //add without check if theres no field
    const newItems = [...fields];
    if (newItems.length === 0) {
      setFields((current) => [...current, item]);
      return;
    }
    // check for duplicates
    const duplicate = newItems.filter((x) => x.id === item.id);
    if (duplicate.length === 0) {
      setFields((current) => [...current, item]);
    } else {
      //if its editing :
      const newFields = [...newItems];
      let editItem = newFields.find((x) => x.id === item.id);
      editItem.width = item.width;
      editItem.height = item.height;
      if (item.x) {
        editItem.x = item.x;
        editItem.y = item.y;
      }

      setFields(newFields);
    }
  }, [item]);

  async function saveField(item) {
    const { id } = item;
    const { x, y, width, height } = item.getBBox();
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
      const field = { id, title, x, y, width, height };
      addItem(field);
      // setFields((current) => [...current, field]);

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
      m = d3.mouse(d3.select("#my-svg").select(parentSelector).node());
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
    // console.log("this item", fieldToDrag.node().id);

    // console.log(editingField);
  }

  function getProperty(parentSelector, idSelector) {
    const deltaX = d3.select("#my-svg").select(parentSelector).attr("x");
    const deltaY = d3.select("#my-svg").select(parentSelector).attr("y");
    // const parent = d3.select("#my-svg").select(parentSelector).node();
    const field = d3.select("#my-svg").select(idSelector).node();

    const x = parseInt(field.getBBox().x) + parseInt(deltaX);
    const y = parseInt(field.getBBox().y) + parseInt(deltaY);

    const newField = {
      id: field.id,
      title: "",
      x,
      y,
      width: field.getBBox().width,
      height: field.getBBox().height,
    };

    addItem(newField);

    // setFields((current) => [...current, newField]);

    // console.log(parent);
    // console.log(field);
  }
  var zoom = d3
    .zoom()
    .scaleExtent([1 / 4, 8])
    .on("zoom", function () {
      d3.select("#form-g").attr("transform", d3.event.transform);
    });

  return (
    <>
      <div>
        <button
          className="btn btn-warning m-2"
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

            svg.call(zoom);
          }}
        >
          Load Image
        </button>
        <button
          className="btn btn-success m-2"
          // disabled={!isZooming}
          onClick={function () {
            if (isZooming) {
              if (d3.select("#my-svg").select("#zoomCover").size() !== 0) {
                console.log("display true");
                d3.select("#my-svg")
                  .select("#zoomCover")
                  .classed("hide", false);
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
                        const title = saveField(
                          d3.select(idSelector).node()
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

                        //add resize handler

                        d3.select(parentSelector)

                          .append("circle")
                          .attr("r", 5)
                          .attr("id", "resizeHandle" + counter)
                          .classed("item" + counter, "select")
                          .attr("cx", boardProp.x + boardProp.width)
                          .attr("cy", boardProp.y + boardProp.height)
                          // //call drag
                          .call(
                            d3
                              .drag()
                              .on("start", function () {
                                dragAction = "resize";
                                d3.select(this).classed("resizing", true);
                              })
                              .on("end", function () {
                                // console.log(this.id.match(/\d/g).join("") - 1);
                                getProperty(parentSelector, idSelector);

                                // need to get rect id and set properties in state
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
                                drag(
                                  parentSelector,
                                  idSelector,
                                  resizeSelector
                                );
                              })
                          );
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
                            getProperty(parentSelector, idSelector);

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
                      .attr("id", "select" + counter);
                    // .on("mousemove", mousemove)

                    const field = d3
                      .select("#my-svg")
                      .select("#root-g")
                      .select("#form-g")
                      .select("#elements-g")
                      .select(idSelector);
                    const board = d3.select("#my-svg").select("#zoomCover");
                    board.on("mousemove", mousemove);

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
      </div>
      <div className="row">
        <div className="col-md-4">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Id</th>
                <th scope="col">Title</th>
                <th scope="col">X</th>
                <th scope="col">Y</th>
                <th scope="col">Width</th>
                <th scope="col">Height</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((x) => (
                <tr key={x.title}>
                  <td>{x.id}</td>
                  <td>{x.title}</td>
                  <td>{x.x}</td>
                  <td>{x.y}</td>
                  <td>{x.width}</td>
                  <td>{x.height}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="col-md-8">
          <svg height="90vh" width="90vw" id="my-svg"></svg>
        </div>
      </div>
    </>
  );
}
