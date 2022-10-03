import React, { Fragment, useEffect, useState } from "react";
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
  let elements = undefined;
  let dragItem = undefined;
  let svg = undefined;
  let dragAction = "move";
  let target = null;
  let shiftHeld = false;
  let ctrlHeld = false;

  // const [preFields, setPreFields] = useState([]);
  const [item, addItem] = useState();
  const [itemToRemove, removeItem] = useState();
  const [fields, setFields] = useState([]);
  const [isZooming, setZoom] = useState(true);
  // const [shiftHeld, setShiftHeld] = useState(false);
  // const [ctrlHeld, setCtrlHeld] = useState(false);

  function downHandler({ key }) {
    if (key === "Shift") {
      // setShiftHeld(true);
      shiftHeld = true;
    }
    if (key === "Control") {
      ctrlHeld = true;
      // setCtrlHeld(true);
    }
  }

  function upHandler({ key }) {
    if (key === "Shift") {
      shiftHeld = false;
      // setShiftHeld(false);
    }
    if (key === "Control") {
      ctrlHeld = false;
      // setCtrlHeld(false);
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);
    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, []);

  //update fields list based on changes
  useEffect(() => {
    //not trigger on start
    if (!item && !itemToRemove) {
      return;
    }

    const newItems = [...fields];
    const itemNumber = item.id.match(/\d/g).join("");
    if (itemToRemove) {
      //remove item mode
      const idSelector = `select${itemToRemove}`;
      const newFields = [...newItems];
      let index = newFields.findIndex((x) => x.id === idSelector);
      newFields.splice(index, 1);
      setFields(newFields);
      removeItem(undefined);
      return;
    }
    //add without check if theres no field
    // const newItems = [...fields];
    if (newItems.length === 0) {
      setFields((current) => [...current, item]);
      addItem(undefined);
      return;
    }
    // check for duplicates
    const duplicate = newItems.filter((x) => x.id === item.id);
    if (duplicate.length === 0) {
      let repeatedTitle = newItems.find((x) => x.title === item.title);

      // console.log()
      if (repeatedTitle) {
        Swal.fire({
          title: item.title,
          text: "This field already exist",
          icon: "warning",
          showDenyButton: true,
          confirmButtonText: "Try New Title",
          denyButtonText: `Delete Field`,
        }).then(function (result) {
          if (result.isConfirmed) {
            editField(itemNumber);
          } else if (result.isDenied) {
            const parentSelector = `#selectParent${itemNumber}`;
            d3.select(parentSelector).remove();
          }
        });
        return;
      } else {
        setFields((current) => [...current, item]);
        return;
      }
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

      //editing title
      if (item.title) {
        let repeatedTitle = newFields.find((x) => x.title === item.title);
        if (repeatedTitle) {
          Swal.fire({
            title: item.title,
            text: "This field already exist",
            icon: "warning",
            confirmButtonText: "Try New Title",
          }).then(function () {
            editField(itemNumber);
          });
          return;
        } else {
          editItem.title = item.title;
        }
      }
      addItem(undefined);
      setFields(newFields);
    }
  }, [item, itemToRemove]);

  // all implementation related to field after drawing done
  function mouseUp() {
    const parent = d3.select("#my-svg").select("#zoomCover");
    const counter = d3.select("#my-svg").select("#form-g").attr("counter");
    parent.on("mousemove", null);
    const idSelector = `#select${counter}`;
    const parentSelector = `#selectParent${counter}`;
    const classSelector = `.item${counter}`;
    const textSelector = `#text${counter}`;
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

        d3.select("#my-svg").select(idSelector).remove();
        d3.selectAll(classSelector).remove();
      });

    //exit draw mode
    d3.select("#my-svg").select("#zoomCover").classed("hide", true);
    setZoom(true);
    //add save btn to the field
    d3.select("#my-svg")
      .select(idSelector)
      .classed("drawing", false)
      .classed("isDrawn", true)
      .on("mouseenter", function () {
        d3.select("#my-svg").select(idSelector).classed("hover", true);
        d3.select(textSelector).classed("hover", true);
        d3.select("#table").select(idSelector).classed("tableHover", true);
      })
      .on("mouseleave", function () {
        d3.select("#my-svg").select(idSelector).classed("hover", false);
        d3.select(textSelector).classed("hover", false);
        d3.select("#table").select(idSelector).classed("tableHover", false);
      });
    board
      .append("image")
      .attr("xlink:href", checkSvg)
      .style("width", 25 + "px")
      .on("click", function () {
        const title = saveField(
          d3.select("#my-svg").select(idSelector).node()
        ).then((title) => {
          d3.select(parentSelector)
            .append("text")
            .style("fill", "none")
            .style("font-size", "14px")
            .attr("dy", ".35em")
            .attr("id", "text" + counter)
            .attr("x", boardProp.x + 3)

            //set text center vertically
            .attr("y", boardProp.y + boardProp.height / 2)
            .text(title)
            .style("style", "label");
        });
        d3.select("#my-svg")
          .select(idSelector)
          .classed("item", "select")
          .classed("saved", true);
        d3.selectAll(classSelector).remove();

        //add resize handler

        drawHandler(counter);
      })
      .classed("item" + counter, "select")
      .style("height", 25 + "px")
      .attr("x", boardProp.x + boardProp.width)
      .attr("y", boardProp.y + boardProp.height);
    // setCounter(counter + 1);

    // counter++;
  }

  function editField(counter) {
    const idSelector = `#select${counter}`;
    const parentSelector = `#selectParent${counter}`;
    const board = d3
      .select("#my-svg")
      .select("#root-g")
      .select("#form-g")
      .select("#elements-g")
      .select(parentSelector);
    const boardProp = board.node().getBBox();
    const item = d3.select("#my-svg").select(idSelector).node();
    saveField(item).then((title) => {
      d3.select(parentSelector).selectAll("text").remove();
      d3.select(parentSelector)
        .append("text")
        .style("fill", "none")
        .style("font-size", "14px")
        .attr("dy", ".35em")
        .attr("id", "text" + counter)
        .attr("x", boardProp.x + 3)

        //set text center vertically
        .attr("y", boardProp.y + boardProp.height / 2)
        .text(title)
        .style("style", "label");
    });
  }

  function deleteField(counter) {
    //delete field with parent
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        removeItem(counter);
        // const idSelector = `select${counter}`;
        // const newItems = [...fields];
        // const remainedFields = newItems.filter((x) => x.id !== idSelector);
        // console.log(newItems);

        const parentSelector = `#selectParent${counter}`;
        const item = d3.select("#my-svg").select(parentSelector);
        item.remove();

        Swal.fire({
          icon: "error",
          title: "Field Deleted",
          showConfirmButton: false,
          timer: 1400,
        });
      }
    });
  }
  // dialog to choos action on element click
  function elementActions(counter) {
    Swal.fire({
      title: "What to do with this field?",
      text: counter,
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Edit Title",
      denyButtonText: `Delete Field`,
    }).then(async (result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        editField(counter);
      } else if (result.isDenied) {
        deleteField(counter);
      }
    });
  }
  function mouseDown() {
    const counter = d3.select("#my-svg").select("#form-g").attr("counter");

    dragAction = "move";
    d3.select("#my-svg").select("#root-g").selectAll("rect");

    var m = d3.mouse(
      d3.select("#my-svg").select("#root-g").select("#form").node()
    );
    // var m = d3.mouse(this);

    const idSelector = `#select${counter}`;
    const parentSelector = `#selectParent${counter}`;
    const classSelector = `.item${counter}`;
    const resizeSelector = `#resizeHandle${counter}`;

    const elements = d3
      .select("#my-svg")
      .select("#root-g")
      .select("#form-g")
      .select("#elements-g");
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
      .attr("fill", "lightblue")
      .classed("drawing", true)
      .attr("href", "#pointer")
      .on("click", () => elementActions(counter))

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
          .on("drag", () => drag(counter, null))
      )
      .attr("id", "select" + counter);

    const board = d3.select("#my-svg").select("#zoomCover");
    board.on("mousemove", mousemove);
  }

  // save drawn field in state
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
  //use this to draw fields after mouse down
  function mousemove(d) {
    const counter = d3.select("#my-svg").select("#form-g").attr("counter");

    let idSelector = null;
    let parentSelector = null;
    if (target === null) {
      idSelector = `#select${counter}`;
      parentSelector = `#selectParent${counter}`;
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

  //use attr as counter for naming and accessing elements
  function addCounter() {
    const counter = d3.select("#my-svg").select("#form-g").attr("counter");
    d3.select("#my-svg")
      .select("#form-g")
      .attr("counter", parseInt(counter) + 1);
  }
  // load saved fields
  function trySaved() {
    addCounter();
    // counter++;
    const counter = d3.select("#my-svg").select("#form-g").attr("counter");

    // setCounter(counter + 1);

    const idSelector = `#select${counter}`;
    const parentSelector = `#selectParent${counter}`;
    const classSelector = `.item${counter}`;
    const resizeSelector = `#resizeHandle${counter}`;

    // create parent for field
    const elements = d3
      .select("#my-svg")
      .select("#root-g")
      .select("#form-g")
      .select("#elements-g");

    const newField = elements
      .append("svg")
      .attr("id", "selectParent" + counter);

    //load field
    const field = newField
      .append("rect")
      .attr("x", 50)
      .attr("y", 100)
      .attr("height", 50)
      .attr("width", 40)
      // .attr("fill", "green")
      // .classed("drawing", true)
      .attr("href", "#pointer")
      .on("click", () => elementActions(counter))

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
          .on("drag", () => drag(counter, null))
      )
      .classed("item", "select")
      .attr("id", "select" + counter);
    field
      .classed("drawing", false)
      .classed("isDrawn", true)
      .classed("saved", true);
    drawHandler(counter);

    //load label
    const boardProp = newField.node().getBBox();

    newField
      .append("text")
      .style("fill", "black")
      .style("font-size", "14px")
      .attr("dy", ".35em")
      .attr("x", boardProp.x + 3)
      .attr("id", "text" + counter)

      //set text center vertically
      .attr("y", boardProp.y + boardProp.height / 2)
      .text("Hekkoooo")
      .style("style", "label");
    // counter++;
  }

  // return elementIds base on counter
  function getElementsId(counter) {
    const id = `#select${counter}`;
    const parent = `#selectParent${counter}`;
    const className = `.item${counter}`;
    const resizeClass = `.resize${counter}`;
    const resizeT = `#resizeHandleT${counter}`;
    const resizeB = `#resizeHandleB${counter}`;
    const resizeL = `#resizeHandleL${counter}`;
    const resizeR = `#resizeHandleR${counter}`;
    const resizeTL = `#resizeHandleTL${counter}`;
    const resizeTR = `#resizeHandleTR${counter}`;
    const resizeBL = `#resizeHandleBL${counter}`;
    const resizeBR = `#resizeHandleBR${counter}`;

    return {
      idSelector: id,
      parentSelector: parent,
      classSelector: className,
      resizeSelector: {
        all: resizeClass,
        T: resizeT,
        B: resizeB,
        L: resizeL,
        R: resizeR,
        TL: resizeTL,
        TR: resizeTR,
        BL: resizeBL,
        BR: resizeBR,
      },
    };
  }

  // handle dragging item or resize handlers
  function drag(counter, handler) {
    const selectors = getElementsId(counter);
    const itemToDrag = d3.select("#my-svg").select(selectors.parentSelector);
    //get mouse position based on background
    var m = d3.mouse(
      d3.select("#my-svg").select("#root-g").select("#form").node()
    );

    // get resize handle
    const resizeHandle = d3
      .select("#my-svg")
      .select(selectors.parentSelector)
      .select(selectors.resizeSelector[handler]);

    const fieldToDrag = d3.select("#my-svg").select(selectors.idSelector);
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
      m = d3.mouse(
        d3.select("#my-svg").select(selectors.parentSelector).node()
      );
      //set class to change color
      // d3.select("#my-svg").selectAll("rect").classed("resizing", false);
      fieldToDrag.classed("resizing", true);
      //move resize circle

      resizeHandle.attr("x", m[0]).attr("y", m[1]);
      const handleX = resizeHandle.attr("x");
      const handleY = resizeHandle.attr("y");
      const fieldX = fieldToDrag.attr("x");
      const fieldY = fieldToDrag.attr("y");
      const fieldW = fieldToDrag.attr("width");
      const fieldH = fieldToDrag.attr("height");
      const { dx, dy } = d3.event;

      // select text and set to center
      const text = d3
        .select("#my-svg")
        .select(selectors.parentSelector)
        .select("text");
      // console.log(itemToDrag.node().getBBox().y);
      // console.log(fieldY);
      if (fieldH > 14 && handler !== "R" && handler !== "L") {
        text.attr("y", itemToDrag.node().getBBox().y + fieldH / 2);
      }
      text.attr("x", fieldX);
      // set width and height of rectangle based on handler
      // let x,
      //   y,
      //   fx,
      //   fy = null;

      switch (handler) {
        case "BR":
          if (handleX - fieldX < 10) {
            fieldToDrag.attr("width", 10);
            resizeHandle.attr("x", fieldX + 10);
          } else if (handleY - fieldY < 10) {
            fieldToDrag.attr("height", 10);
            resizeHandle.attr("y", fieldY + 10);
          } else {
            fieldToDrag
              .attr("width", handleX - fieldX + 1.5)
              .attr("height", handleY - fieldY + 1.5);
          }
          break;
        case "BL":
          fieldToDrag.attr("x", handleX);
          if (parseInt(fieldW) - dx > 10) {
            fieldToDrag.attr("width", parseInt(fieldW) - dx);
          }
          if (handleY - fieldY + 1.5 > 10) {
            fieldToDrag.attr("height", handleY - fieldY + 1.5);
          }
          break;
        case "TL":
          if (fieldW > 10) {
            fieldToDrag.attr("x", handleX).attr("width", parseInt(fieldW) - dx);
          } else {
            fieldToDrag.attr("width", 11);
          }
          if (fieldH > 10) {
            fieldToDrag
              .attr("y", handleY)
              .attr("height", parseInt(fieldH) - dy);
          } else {
            fieldToDrag.attr("height", 11);
          }

          break;
        case "TR":
          if (fieldW > 10) {
            fieldToDrag.attr("width", handleX - fieldX + 1.5);
          } else {
            fieldToDrag.attr("width", 11);
          }
          if (fieldH > 10) {
            fieldToDrag
              .attr("y", handleY)
              .attr("height", parseInt(fieldH) - dy);
          } else {
            fieldToDrag.attr("height", 11);
          }

          break;
        case "L":
          if (fieldW < 10) {
            fieldToDrag.attr("width", 11);
          } else {
            fieldToDrag.attr("x", handleX).attr("width", parseInt(fieldW) - dx);
            resizeHandle.attr("y", fieldY);
            // .attr("height", handleY - fieldY + 1.5);
          }
          break;
        case "R":
          if (handleX - fieldX < 10) {
            fieldToDrag.attr("width", 11);
            resizeHandle.attr("y", fieldY);
            resizeHandle.attr("x", fieldX + fieldW);
          } else {
            fieldToDrag.attr("width", handleX - fieldX + 1.5);
            resizeHandle.attr("y", fieldY);
          }
          break;
        case "T":
          console.log(fieldH);
          if (fieldH < 10 && dy > 0) {
            fieldToDrag.attr("Height", 11);
          } else {
            // (parseInt(fieldH) - dy)
            if (parseInt(fieldH) - dy >= 8) {
              fieldToDrag
                .attr("y", handleY)
                .attr("height", parseInt(fieldH) - dy);
              resizeHandle.attr("x", fieldX);
            }
            // .attr("height", handleY - fieldY + 1.5);
          }
          break;
        case "B":
          if (handleY - fieldY < 10) {
            fieldToDrag.attr("Height", 10);
            resizeHandle.attr("x", fieldX);
            resizeHandle.attr("y", fieldY + fieldH);
          } else {
            fieldToDrag
              // .attr("width", handleX - fieldX + 1.5)
              .attr("height", handleY - fieldY + 1.5);
            resizeHandle.attr("x", fieldX);
          }
          break;

        default:
          break;
      }
    }
    // console.log("this item", fieldToDrag.node().id);

    // console.log(editingField);
  }
  //add resize handlers to all side and corners
  function drawHandler(counter) {
    // const parentSelector = `#selectParent${counter}`;
    const { idSelector, parentSelector, resizeSelector } =
      getElementsId(counter);
    const newField = d3.select("#my-svg").select(parentSelector);
    const boardProp = newField.select(idSelector).node().getBBox();
    let side = null;
    //load resize handle
    // left side
    newField
      .append("rect")
      .attr("x", boardProp.x - 3)
      .style("cursor", "ew-resize")

      .style("fill", "black")
      .attr("y", boardProp.y)
      .attr("width", 3)
      .attr("id", "resizeHandleL" + counter)
      .classed("item" + counter, "select")
      .classed("resize" + counter, true)
      .attr("height", boardProp.height)
      .call(
        d3
          .drag()
          .on("start", function () {
            d3.select(this).classed("resize" + counter, false);
            d3.select("#my-svg").selectAll(resizeSelector.all).remove();
            dragAction = "resize";
            side = "L";
          })
          .on("end", function () {
            d3.select(this).remove();
            drawHandler(counter);
            getProperty(parentSelector, idSelector);

            // need to get rect id and set properties in state
            dragAction = "move";
            d3.select("#my-svg");

            d3.select("#my-svg")
              .selectAll("rect")
              .classed("resizing", false)
              .classed("moving", false);
          })
          .on("drag", () => {
            drag(
              counter,
              // parentSelector,
              // idSelector,
              // `#resizeHandle${side}${counter}`,
              side
            );
          })
      );
    // top left corner
    newField
      .append("rect")
      .attr("x", boardProp.x - 3)
      .style("fill", "black")
      .style("cursor", "nwse-resize")
      .attr("y", boardProp.y - 3)
      .attr("width", 3)
      .classed("resize" + counter, true)
      .classed("resize" + counter, true)
      .attr("id", "resizeHandleTL" + counter)
      .classed("item" + counter, "select")
      .call(
        d3
          .drag()
          .on("start", function () {
            d3.select(this).classed("resize" + counter, false);
            d3.select("#my-svg").selectAll(resizeSelector.all).remove();
            dragAction = "resize";
            side = "TL";
          })
          .on("end", function () {
            d3.select(this).remove();
            drawHandler(counter);
            getProperty(parentSelector, idSelector);

            // need to get rect id and set properties in state
            dragAction = "move";

            d3.select("#my-svg")
              .selectAll("rect")
              .classed("resizing", false)
              .classed("moving", false);
          })
          .on("drag", () => {
            drag(
              counter,
              // parentSelector,
              // idSelector,
              // `#resizeHandle${side}${counter}`,
              side
            );
          })
      )
      .attr("height", 3);

    // top side
    newField
      .append("rect")
      .attr("x", boardProp.x)
      .style("cursor", "n-resize")

      .style("fill", "black")

      .attr("y", boardProp.y - 3)
      .attr("width", boardProp.width)
      .attr("id", "resizeHandleT" + counter)
      .classed("resize" + counter, true)
      .classed("item" + counter, "select")
      .attr("height", 3)
      .call(
        d3
          .drag()
          .on("start", function () {
            d3.select(this).classed("resize" + counter, false);
            d3.select("#my-svg").selectAll(resizeSelector.all).remove();
            dragAction = "resize";
            side = "T";
          })
          .on("end", function () {
            d3.select(this).remove();
            drawHandler(counter);
            getProperty(parentSelector, idSelector);

            // need to get rect id and set properties in state
            dragAction = "move";

            d3.select("#my-svg")
              .selectAll("rect")
              .classed("resizing", false)
              .classed("moving", false);
          })
          .on("drag", () => {
            drag(
              counter,
              // parentSelector,
              // idSelector,
              // `#resizeHandle${side}${counter}`,
              side
            );
          })
      );
    // top right corner
    newField
      .append("rect")
      .attr("x", boardProp.x + boardProp.width)
      .attr("y", boardProp.y - 3)
      .style("cursor", "ne-resize")

      .style("fill", "black")
      .attr("id", "resizeHandleTR" + counter)
      .classed("resize" + counter, true)
      .classed("item" + counter, "select")
      .attr("width", 3)
      .attr("height", 3)
      .call(
        d3
          .drag()
          .on("start", function () {
            d3.select(this).classed("resize" + counter, false);
            d3.select("#my-svg").selectAll(resizeSelector.all).remove();
            dragAction = "resize";
            side = "TR";
          })
          .on("end", function () {
            d3.select(this).remove();
            drawHandler(counter);
            getProperty(parentSelector, idSelector);

            // need to get rect id and set properties in state
            dragAction = "move";

            d3.select("#my-svg")
              .selectAll("rect")
              .classed("resizing", false)
              .classed("moving", false);
          })
          .on("drag", () => {
            drag(
              counter,
              // parentSelector,
              // idSelector,
              // `#resizeHandle${side}${counter}`,
              side
            );
          })
      );

    // right side
    newField
      .append("rect")
      .attr("x", boardProp.x + boardProp.width)
      .attr("y", boardProp.y)
      .style("cursor", "ew-resize")

      .style("fill", "black")
      .attr("width", 3)
      .attr("id", "resizeHandleR" + counter)
      .classed("resize" + counter, true)
      .classed("item" + counter, "select")
      .attr("height", boardProp.height)
      .call(
        d3
          .drag()
          .on("start", function () {
            d3.select(this).classed("resize" + counter, false);
            d3.select("#my-svg").selectAll(resizeSelector.all).remove();
            dragAction = "resize";
            side = "R";
          })
          .on("end", function () {
            d3.select(this).remove();
            drawHandler(counter);
            getProperty(parentSelector, idSelector);

            // need to get rect id and set properties in state
            dragAction = "move";

            d3.select("#my-svg")
              .selectAll("rect")
              .classed("resizing", false)
              .classed("moving", false);
          })
          .on("drag", () => {
            drag(
              counter,
              // parentSelector,
              // idSelector,
              // `#resizeHandle${side}${counter}`,
              side
            );
          })
      );
    // bottom side
    newField
      .append("rect")
      .attr("x", boardProp.x)
      .attr("y", boardProp.y + boardProp.height)
      .style("cursor", "ns-resize")
      .style("fill", "black")
      .attr("height", 3)
      .attr("id", "resizeHandleB" + counter)
      .classed("resize" + counter, true)
      .classed("item" + counter, "select")
      .attr("width", boardProp.width)
      .call(
        d3
          .drag()
          .on("start", function () {
            d3.select(this).classed("resize" + counter, false);
            d3.select("#my-svg").selectAll(resizeSelector.all).remove();
            dragAction = "resize";
            side = "B";
          })
          .on("end", function () {
            d3.select(this).remove();
            drawHandler(counter);
            getProperty(parentSelector, idSelector);

            // need to get rect id and set properties in state
            dragAction = "move";

            d3.select("#my-svg")
              .selectAll("rect")
              .classed("resizing", false)
              .classed("moving", false);
          })
          .on("drag", () => {
            drag(
              counter,
              // parentSelector,
              // idSelector,
              // `#resizeHandle${side}${counter}`,
              side
            );
          })
      );
    //bottom right side
    newField
      .append("rect")
      .attr("x", boardProp.x + boardProp.width)
      .attr("y", boardProp.y + boardProp.height)
      .style("cursor", "nw-resize")

      .style("fill", "black")
      .attr("width", 3)
      .attr("height", 3)
      .classed("resize" + counter, true)
      .attr("id", "resizeHandleBR" + counter)
      .classed("item" + counter, "select")

      //call drag
      .call(
        d3
          .drag()
          .on("start", function () {
            d3.select(this).classed("resize" + counter, false);
            d3.select("#my-svg").selectAll(resizeSelector.all).remove();
            dragAction = "resize";
            side = "BR";
          })
          .on("end", function () {
            d3.select(this).remove();
            drawHandler(counter);
            getProperty(parentSelector, idSelector);

            // need to get rect id and set properties in state
            dragAction = "move";

            d3.select("#my-svg")
              .selectAll("rect")
              .classed("resizing", false)
              .classed("moving", false);
          })
          .on("drag", () => {
            drag(
              counter,
              // parentSelector,
              // idSelector,
              // `#resizeHandle${side}${counter}`,
              side
            );
          })
      );
    // bottom left side
    newField
      .append("rect")
      .attr("x", boardProp.x - 3)
      .attr("y", boardProp.y + boardProp.height)
      .style("cursor", "ne-resize")

      .style("fill", "black")
      .attr("height", 3)
      .classed("resize" + counter, true)
      .attr("id", "resizeHandleBL" + counter)
      .classed("item" + counter, "select")
      .attr("width", 3)
      //call drag
      .call(
        d3
          .drag()
          .on("start", function () {
            d3.select(this).classed("resize" + counter, false);
            d3.select("#my-svg").selectAll(resizeSelector.all).remove();
            dragAction = "resize";
            side = "BL";
          })
          .on("end", function () {
            d3.select(this).remove();
            drawHandler(counter);
            getProperty(parentSelector, idSelector);

            // need to get rect id and set properties in state
            dragAction = "move";

            d3.select("#my-svg")
              .selectAll("rect")
              .classed("resizing", false)
              .classed("moving", false);
          })
          .on("drag", () => {
            drag(
              counter,
              // parentSelector,
              // idSelector,
              // `#resizeHandle${side}${counter}`,
              side
            );
          })
      );
  }

  // get coordinates and text and map them to filed item in order to add state
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
      if (shiftHeld) {
        console.log(shiftHeld);
      }
      d3.select("#form-g").attr("transform", d3.event.transform);
    });

  return (
    <>
      <div className="row vh-100">
        <div className="col-md-3 bg-secondary">
          {/* <h6>{counter}</h6> */}
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
                newG.attr("counter", 0);
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
                  } else {
                    console.log("create new");

                    // setCounter(counter + 1);

                    // one of counters not adding
                    z = d3
                      .select("#my-svg")
                      .append("rect")
                      .attr("width", "100%")
                      .attr("height", "100%")
                      .attr("fill", "transparent")
                      .attr("id", "zoomCover")
                      .on("mousemove", mousemove)
                      .on("mouseup", mouseUp)
                      //parent mouse down start drawing field
                      .on("mousedown", mouseDown);
                    setZoom(false);
                  }
                  addCounter();
                } else {
                  d3.select("#my-svg")
                    .select("#zoomCover")
                    .classed("hide", true);
                  setZoom(true);
                }
              }}
            >
              {isZooming ? "Add New Field" : "Cancel"}
            </button>

            <button className="btn btn-primary" onClick={() => trySaved()}>
              Try Saved
            </button>
          </div>
          <table className="table table-striped bg-white ms-2">
            <thead className="bg-dark text-white">
              <tr>
                <th scope="col">Id</th>
                <th scope="col">Title</th>
                <th scope="col"></th>
                {/* <th scope="col">X</th>
                <th scope="col">Y</th>
                <th scope="col">Width</th>
                <th scope="col">Height</th> */}
              </tr>
            </thead>
            <tbody id="table">
              {fields.map((x) => (
                // hover and leave highlight the field
                <tr
                  id={x.id}
                  onMouseEnter={() => {
                    d3.select("#my-svg")
                      .select(`#${x.id}`)
                      .classed("hover", true);
                  }}
                  onMouseLeave={() => {
                    d3.select("#my-svg")
                      .select(`#${x.id}`)
                      .classed("hover", false);
                  }}
                  key={x.title}
                >
                  <td>{x.id}</td>
                  <td>{x.title}</td>
                  <td>
                    <button
                      onClick={() => editField(x.id.match(/\d/g).join(""))}
                      className="mx-1 btn btn-sm btn-warning"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteField(x.id.match(/\d/g).join(""))}
                      className="mx-1  btn btn-sm btn-danger"
                    >
                      Delete
                    </button>
                  </td>
                  {/* <td>{x.x}</td>
                  <td>{x.y}</td>
                  <td>{x.width}</td>
                  <td>{x.height}</td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="col-md-9 canvas">
          <svg height="90vh" width="90vw" id="my-svg"></svg>
        </div>
      </div>
    </>
  );
}
