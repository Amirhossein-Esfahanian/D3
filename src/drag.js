import * as d3 from "d3";

function dragstarted(event, d) {
  d3.select(this).raise().attr("stroke", "black");
}

function dragged(event, d = d3.mouse(this)) {
  console.log(event);
  console.log(d);

  d3.select(this)
    .attr("cx", (dd.x = event.x))
    .attr("cy", (dd.y = event.y));
}

function dragended(event, d = d3.mouse(this)) {
  d3.select(this).attr("stroke", null);
}

export default d3
  .drag()
  .on("start", dragstarted)
  .on("drag", dragged)
  .on("end", dragended);
