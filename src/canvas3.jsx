import React, { useEffect, useState } from "react";
import * as d3 from "d3";

export default function Canvas3() {
  useEffect(() => {
    // const svg = d3.select("#my-svg");
    const svg = d3.select("#my-svg").append("svg");
  });

  //   d3.select('#rectangle').on('click', function(){ new Rectangle(); });

  return (
    <div>
      Canvas3
      <button
        onClick={function () {
          alert("new");
        }}
        id="rectangle"
      >
        Rectangle
      </button>
      <svg height="90vh" width="90vw" id="my-svg"></svg>
    </div>
  );
}
