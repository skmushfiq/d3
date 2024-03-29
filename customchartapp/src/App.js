import React from 'react';
import logo from './logo.svg';
import './App.css';
import * as d3 from 'd3'

class ChartApp extends React.Component {
  constructor(props) {
    super(props)
		
  }
  
  componentDidMount() {
	  this.generateD3Chart()
  }
  
  generateD3Chart(){
	let data=null;
	var svg=this.svg;
	
    var margin = {top: 20, right: 20, bottom: 110, left: 40},
    margin2 = {top: 430, right: 20, bottom: 30, left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    height2 = +svg.attr("height") - margin2.top - margin2.bottom;

	const bisectValue = d3.bisector(d => d.category).left;
	const xdomain = d3.scaleLinear().range([0, width]),
		summaryxDomain = d3.scaleLinear().range([0, width]),
		ydomain = d3.scaleLinear().range([height, 0]),
		summaryyDomain = d3.scaleLinear().range([height2, 0]);

	const xAxis = d3.axisBottom(xdomain),
		xAxis2 = d3.axisBottom(summaryxDomain),
		yAxis = d3.axisLeft(ydomain);

	const brush = d3.brushX()
		.extent([[0, 0], [width, height2]])
		.on("brush end", brushed);

	const zoom = d3.zoom()
		.scaleExtent([1, Infinity])
		.translateExtent([[0, 0], [width, height]])
		.extent([[0, 0], [width, height]])
		.on("zoom", zoomed);

	const area = d3.line()

		//.curve(d3.curveMonotoneX)
		.x(function(d) { return xdomain(d.category); })
		//.y0(height)
		.y(function(d) { return ydomain(d.value); });

	const area2 = d3.line()
		//.curve(d3.curveMonotoneX)
		.x(function(d) { return summaryxDomain(d.category); })
		//.y0(height2)
		.y(function(d) { return summaryyDomain(d.value); });

	svg.append("defs").append("clipPath")
		.attr("id", "clip")
	  .append("rect")
		.attr("width", width)
		.attr("height", height);

	const focus = svg.append("g")
		.attr("class", "focus")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	const context = svg.append("g")
		.attr("class", "context")
		.attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");
	// load json data 
	d3.json("data.json", function(error, jdata) {
	  if (error) throw error;
		data = prepareData(jdata)
	  xdomain.domain([d3.min(data, function(d) { return d.category; })-1,d3.max(data, function(d) { return d.category; })+1]);
	  ydomain.domain([0, 100]);
	  summaryxDomain.domain(xdomain.domain());
	  summaryyDomain.domain(ydomain.domain());
	focus.append('line')
		  .classed('crosshairx', true).attr('stroke','gray');
	focus.append('text')
		  .classed('crosshairlabel', true);

		focus.append('line')
		  .classed('crosshairy', true).attr('stroke','gray');
	  focus.append("path")
		  .datum(data)
		  .attr("class", "area")
		  .attr("d", area)
		  .attr("stroke", "steelblue")
		  .attr("stroke-width", 1.5);
		  
	focus.selectAll(".dot")
		.data(data)
	  .enter().append("circle") // Uses the enter().append() method
		.attr("class", "dot") // Assign a class for styling
		.attr("cx", function(d, i) { return xdomain(d.category) })
		.attr("cy", function(d) { return ydomain(d.value) })
		.attr("r", 5)
		.attr("fill","blue")
		  .on("mouseover", function(a, b, c) { 
				console.log(a) 
				//this.attr('class', 'focus')
			})
		  .on("mouseout", function() {  })
	  focus.append("g")
		  .attr("class", "axis axis--x")
		  .attr("transform", "translate(0," + height + ")")
		  .call(xAxis);
		
	  focus.append("g")
		  .attr("class", "axis axis--y")
		  
		  .call(yAxis);

	  context.append("path")
		  .datum(data)
		  .attr("class", "area")
		  .attr("d", area2)
		  .attr("stroke", "steelblue")
		  .attr("stroke-width", 1.5);


	  context.append("g")
		  .attr("class", "brush")
		  .call(brush)
		  .call(brush.move, xdomain.range());

	  svg.append("rect")
		  .attr("class", "zoom")
		  .attr("width", width)
		  .attr("height", height)
		  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
		  .call(zoom);
		  d3.select('.zoom').on('mousemove', mousemove)
		  .on('mouseout', hidecrosshair)
	});



		// handle the mouse out event and hide the crosshair and label
		function hidecrosshair(){
			  focus.select('line.crosshairx')
			  .style('display','none')
			  
			  focus.select('line.crosshairy')
			  .style('display','none')
			  focus.select('.crosshairlabel').style('display','none')

		}

		//handle the mouse movement of the chart and draw crosshair line and label
		function mousemove() {
			focus.select('.crosshairlabel').style('display','block')
			focus.select('line.crosshairx').style('display','block')
			focus.select('line.crosshairy').style('display','block')

		  const x0 = xdomain.invert(d3.mouse(this)[0]);
		  const i = bisectValue(data, x0, 1);
		   const d0 = data[i - 1];
		  const d1 = data[i];
		  if(d1){
		 
		  const d = x0 - d0.category > d1.category - x0 ? d1 : d0;
		  const label = focus.select('.crosshairlabel');
		  label.text(d.user)
		  label.attr('x',(xdomain(d.category)+210)>width?(xdomain(d.category)-200):xdomain(d.category)+10)
		  label.attr('y',ydomain(d.value)-20)
		  
		  focus.select('line.crosshairx')
			.attr('x1', 0)
			.attr('x2', xdomain(d3.max(data, function(d){return d.category })))
			.attr('y1', ydomain(d.value))
			.attr('y2', ydomain(d.value));

		  focus.select('line.crosshairy')
			.attr('x1', xdomain(d.category))
			.attr('x2', xdomain(d.category))
			.attr('y1', ydomain(0))
			.attr('y2', ydomain(100));
		  }

		}

		// handle the summary zoom and filter and redraw the chart
		function brushed() {
		  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
		  var s = d3.event.selection || summaryxDomain.range();
		  xdomain.domain(s.map(summaryxDomain.invert, summaryxDomain));
		  focus.select(".area").attr("d", area);
		  focus.selectAll(".dot")
			.attr("cx", function(d, i) { return xdomain(d.category) })
			.attr("cy", function(d) { return ydomain(d.value) })
		  focus.select(".axis--x").call(xAxis);
		  svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
			  .scale(width / (s[1] - s[0]))
			  .translate(-s[0], 0));
		}



		// handle the zoom and redraw the chart
		function zoomed() {
		  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
		  var t = d3.event.transform;
		  xdomain.domain(t.rescaleX(summaryxDomain).domain());
		  focus.select(".area").attr("d", area);
		  focus.selectAll(".dot")
			.attr("cx", function(d, i) { return xdomain(d.category) })
			.attr("cy", function(d) { return ydomain(d.value) })
		  focus.select(".axis--x").call(xAxis);
		  context.select(".brush").call(brush.move, xdomain.range().map(t.invertX, t));
		}



		// process data to merge categories and calculate percentage
		function prepareData(d) {
		d.sort((a,b)=> a.category-b.category)
			const totalvalue = d3.sum(d, function(d){
				return d.value;
			})
			console.log(totalvalue);
			window['data']=d;
			const newData=[];
			d.forEach((item)=>{
				let newItem =  newData.find(it=> it.category==item.category);
				if(!newItem) {
					newItem=item;
					newData.push(newItem);
				}
				else{
					newItem.value += item.value;
					newItem.user+=',' + item.user;
				}
				newItem.value=newItem.value/totalvalue*100;
				//console.log(item.value)
			})
			
			console.log(newData);
		  return newData;
		}


  }
	
	render() {
		return (
		
		  <div className="chartContainer">
		  <h3 >Percent Value vs Category</h3>
		   <svg width="960" height="500"
			ref={handle => (this.svg = d3.select(handle))}>
		  </svg>
			
		  </div>
		)
	}
}

export default ChartApp;