import { useEffect, useRef, useState } from "react";

export default function Canvas0({ width = 500, height = 500 }) {
  const zeroPoint = [
    { x: -1, y: -1 },
    { x: -1, y: -1 },
  ];
  let context = null;
  useEffect(() => {
    context = myCanvas.current.getContext("2d");
    const image = new Image();
    image.src =
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Picture_icon_BLACK.svg/1200px-Picture_icon_BLACK.svg.png";
    image.onload = () => {
      context.drawImage(image, 0, 0, 500, 500);
    };
  }, []);
  const [coordinate, setCoordinate] = useState(zeroPoint);
  let point = [];
  const setPoint = (info, event) => {
    if (event === "down") {
      point = [];
    }
    point.push({ x: info.offsetX, y: info.offsetY });
    if (point.length === 2) {
      drawRect(point);
    }
    // setCoordinate(point);
    // if (coordinate.end.x !== -1) console.log(coordinate);
    // drawRect();
  };

  // draw rectangle
  const drawRect = (point, style = {}) => {
    const x = point[0].x;
    const y = point[0].y;
    const w = point[1].x - point[0].x;
    const h = point[1].y - point[0].y;
    console.log(x);
    console.log(y);
    console.log(w);
    console.log(h);
    // const { x, y, w, h } = info;
    const { borderColor = "black", borderWidth = 1 } = style;

    context.beginPath();
    context.strokeStyle = borderColor;
    context.lineWidth = borderWidth;
    context.rect(x, y, w, h);
    context.stroke();
  };

  const myCanvas = useRef();
  myCanvas.onmousedown = function (event) {
    dragOffset.x = event.x - mainLayer.trans.x;
    dragOffset.y = event.y - mainLayer.trans.y;
    mouseDown = true;
  };

  addEventListener("mousedown", (event) => {});
  addEventListener("mouseup", (event) => {});

  onmousedown = (event) => {
    setPoint(event, "down");
  };

  onmouseup = (event) => {
    setPoint(event, "up");
  };

  return <canvas ref={myCanvas} width={500} height={500} />;
}
