import React, {useState, useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import './css/SimpleLegend.css';

/* stuff to work on: size, scent the legend, interactive, slider  */
// Function to measure the displayed size of the text
function measureText(pText, pFontSize, pStyle) {
    var lDiv = document.createElement('div');

    document.body.appendChild(lDiv);

    // Set the passed in font size style
    lDiv.style.fontSize = "" + pFontSize + "px";

    lDiv.style.position = "absolute";
    lDiv.style.left = -1000;
    lDiv.style.top = -1000;

    // Set the passed in styles
    if (pStyle != null) {
        for(let p in pStyle){
          lDiv.style[p] = pStyle[p];
        }
    }
    lDiv.innerHTML = pText;
    var lResult = {
        width: lDiv.clientWidth,
        height: lDiv.clientHeight
    };
    document.body.removeChild(lDiv);
    lDiv = null;
    return lResult;
}

 // * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
 // Simple legend
 // * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
 export default function SimpleLegend({
   id,
   title, // The title of the legend (Set to None for no title)
   colors_dict, // A dictionary of colors and labels
   location,
   orientation, // The orientation of the legend (horizontal or vertical)
   shape, // The shape of the legend (circle or rect)
   titleTextColor, // The color of the title text
   titleRectColor, // The color behind the title (None for clear!)
   legendTextColor, // The color of the legend text
   legendRectColor, // The color behind the legend (None for clear!)
   setProps,
 })
 {
   /* . . . . . . . . . . . . . . . . . . . . . */
   // State variables and refs
   /* . . . . . . . . . . . . . . . . . . . . . */
   const [titleState, setTitle] = useState(title);
   const [titleTextColorState, setTitleTextColor] = useState(titleTextColor);
   const [titleRectColorState, setTitleRectColor] = useState(titleRectColor);
   const [locationState, setLocation] = useState(location);
   const [colorsDictState, setColorsDict] = useState(colors_dict);
   const [shapeState, setShape] = useState(shape);
   const [orientationState, setOrientation] = useState(orientation);
   const [legendTextColorState, setLegendTextColor] = useState(legendTextColor);
   const [legendRectColorState, setLegendRectColor] = useState(legendRectColor);

   // Sizing variables - change if wanted
   const padding = 2.5;
   const shapeW = 15, shapeH = 15;

   // info for legend formulation
   const [marginState, setMargin] = useState(25);
   const [widthState, setWidth] = useState(100);
   const [heightState, setHeight] = useState(50);
   const [maxTextWidthState, setMaxTextWidth] = useState(padding+shapeW+padding);
   const [svg, setSVG] = useState(null);

   // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
   // State AND Ref vars
   // This is helpful to see the current state of the data without
   // being updated everytime data is changed, and to share data between
   // mousing the component
   // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
   // Set the state of is mounted
   const isMountedRef = useRef(false);
   var [isMountedState, _setIsMounted] = useState(false);
   const setIsMounted = () => {
     isMountedRef.current = true;
     _setIsMounted(true);
   };
   const setIsNotMounted = () => {
     isMountedRef.current = false;
     _setIsMounted(false);
   };

   // Just refs
   const divRef = useRef(); // The emcompassing div
   const svgRef = useRef(); // The svg DOM
   const titleRectRef = useRef(); // The background rect
   const titleRef = useRef(); // The title DOM
   const legendGroupRef = useRef(); // The group for the legend
   const legendRectRef = useRef(); // The rect behind the legend
   const legendRef = useRef(); // The legend groups
   const UID = useRef(Date.now()); // A UUID for multiple components

   /*******************************************/
   // Prop effects
   /*******************************************/
   // *** Title *** //
   useEffect( () => {
     setTitle(title);
   },[title]);

   // *** Title Text Color *** //
   useEffect( () => {
     console.log("set txt color");
     if(titleTextColor)
       setTitleTextColor(titleTextColor);
   },[titleTextColor]);

   // *** Title Rect Color *** //
   useEffect( () => {
     console.log("set rect color");
     if(titleRectColor)
       setTitleRectColor(titleRectColor);
   },[titleRectColor]);

   // *** Location *** //
   useEffect( () => {
     if(location){
       setLocation(location);
     }
   },[location]);

   // *** Legend Text Color *** //
   useEffect( () => {
     if(legendTextColor)
       setLegendTextColor(legendTextColor);
   },[legendTextColor]);

   // *** Legend Rect Color *** //
   useEffect( () => {
     if(legendRectColor)
       setLegendRectColor(legendRectColor);
   },[legendRectColor]);

   // add this to have sequential colors
   // *** Colors data dict *** //
   useEffect( () => {
     if(colors_dict){
       for(let c in colors_dict){
         // If we have a list of colors, convert to rgb
         let col = colors_dict[c]['color'];
         if(Array.isArray(col)){
           colors_dict[c]['color'] =  d3.rgb(col[0], col[1], col[2]).toString();
         }
         else{
           colors_dict[c]['color'] = col;
         }
       }
       setColorsDict(colors_dict);
     }
   },[colors_dict])

   // *** Shape *** //
   useEffect( () => {
     if(shape){
       // If we are passed a shape that is not circle or rectangle
       if(!(shape=="circle" || shape=="rectangle" || shape=="line" || shape=="rating" || shape=="diamond" || shape=="cross" || shape=="star" || shape=="triangleup" || shape=="triangledown" || shape=="test")){
         console.log("Error! yOUR WRONG SHAPE IS", shape);
         setShape("rectangle");
       }
       else
        setShape(shape);
     }
   },[shape])

   // *** Orientation *** //
   useEffect( () => {
     if(orientation){
       // If we are passed anything besides horizontal or vertical, set to vertical
       if (!(orientation == "horizontal" || orientation == "vertical")){
         console.log("Error! Uknown orientation:", orientation);
         setOrientation("vertical");
       }
       else{
         setOrientation(orientation);
      }
     }
   },[orientation])

   /*******************************************/
   // State effects
   // Use mounted state if we want things to run
   // right after the component is mounted. This
   // lets us deal with things passed in when
   // the component is initialized.
   /*******************************************/

   // *** Title State *** //
   useEffect(() => {

     // Set the title in the DOM
     if(isMountedState){

       if (titleState !== null){
         // Add the title element
         d3.select(titleRef.current)
          .text(titleState)
          .attr("x", padding)
          .attr("y", padding);

          // Get the height of the title and set the margin
          let textSize = measureText(titleState, 12, {"font-family": "Arial, Helvetica, sans-serif"})['height'];
          setMargin(textSize+padding);
        }
        // Else, we have no title
        else{
          // Reduce the margins to 0
          setMargin(0);
        }
     }
   },[isMountedState, titleState])

   // *** Title Color State *** //
   useEffect(() => {
     console.log("update color", titleRectColorState, titleTextColorState);
      // Set the title rect color  in the DOM
     if(isMountedState){
       if (titleRectColorState !== null){
         // Color the title background rect
         d3.select(titleRectRef.current)
           .attr("fill",  titleRectColorState)
           .attr("opacity", 1);
        }
        else{
          // Make the title Rect opaque
          d3.select(titleRectRef.current)
            .attr("opacity", 0);
        }

        // Set the title text color
        if (titleTextColorState !== null){
          // Color the title text
          d3.select(titleRef.current)
            .attr("fill", titleTextColorState);
        }

     }
   },[isMountedState, titleTextColorState, titleRectColorState])

   // *** Legend Color State *** //
   useEffect(() => {

     // Set the legend rect color  in the DOM
     if(isMountedState){
       if (legendRectColorState !== null){
         // Color the legend background rect
         d3.select(legendRectRef.current)
           .attr("fill",  legendRectColorState)
           .attr("opacity", 1);
        }
        else{
          // Make the legend Rect opaque
          d3.select(legendRectRef.current)
            .attr("opacity", 0);
        }

        // Set the legend text color
        if (legendTextColorState !== null){
          // Color the legend text
          d3.select(legendRef.current)
            .attr("fill", legendTextColorState);
        }
     }
   },[isMountedState, legendTextColorState, legendRectColorState])

   // *** Set the SVG size and locations of the title, and legend *** //
   useEffect(() => {

     if(isMountedState){
       // Update the location of the DIV
       if(locationState)
          d3.select(divRef.current).style("right", locationState['right']+"px")
                                   .style("bottom", locationState['bottom']+"px");

       // Set the width and height of the svg
       setSVG(d3.select(svgRef.current).attr("width", widthState)
                                       .attr("height", heightState)
                                     );

       // Update the title rect
       d3.select(titleRectRef.current).attr("width", widthState)
                                      .attr("height", heightState)
                                      .attr("rx", 7);
       // Update the title position
       d3.select(titleRef.current)
         .attr("x", widthState/2)
         .attr("y", marginState-padding);

      // Translate the legend to padding and down, if we have a title
      d3.select(legendGroupRef.current)
        .attr("transform", "translate(" + padding + "," + (padding+marginState) + ")");

       // Update the legend background rect
       d3.select(legendRectRef.current).attr("width", widthState-padding*2)
                                       .attr("height", heightState-(padding*2)-marginState)
                                       .attr("x", 0)
                                       .attr("y", 0)
                                       .attr("rx", 5);
     }
   },[isMountedState, widthState, heightState, marginState, locationState])

   // ** Symbols ** //
   var diamond = d3.symbol().type(d3.symbolDiamond).size(40);
   var cross = d3.symbol().type(d3.symbolCross).size(40);
   var star = d3.symbol().type(d3.symbolStar).size(40);
   var triangleup = d3.symbol().type(d3.symbolTriangle).size(40);
   var triangledown = d3.symbol().type(d3.symbolTriangle).size(40);
   let linearSize = d3.scaleLinear().domain([0,10]).range([2,10])
   var colorScale = d3.scaleLinear()
   .domain([0,	10,	15,	20, 25, 100])
   .range(['#E28672', '#EC93AB', '#CEB1DE', '#95D3F0', '#77EDD9', '#A9FCAA']);
  
   // *** Update the width and height based on data and title, etc *** //
   useEffect(() => {
     if(isMountedState){

       // The height and width of the svg
       let svgWidth = widthState, svgHeight = heightState;

       // *** Get the longest width of an element in the legend
       // If we have a title, get the length of the displayed title
       let titleWidth = 0;
       if(titleState !== null)
         titleWidth = measureText(titleState, 12, {"font-family": "Arial, Helvetica, sans-serif"})['width']+padding*2;

       // If we have the color data, update the size
       if(colorsDictState){

         // Get the length of the longest displayed element
         let elementWidth = 0;
         for(let c in colorsDictState){
           // Find the max length of an element, with shape and padding
           let textSize = measureText(colorsDictState[c]['label'], 12, {"font-family": "Arial, Helvetica, sans-serif"})['width'];
           let len = padding + shapeW + padding + textSize + padding;
           elementWidth = Math.max(len, elementWidth);
         }
         // If we are vertical, make sure our legend title will fit.
         if(orientationState == "vertical")
            elementWidth = Math.max(elementWidth, titleWidth);

         // Save the max element size
         setMaxTextWidth(elementWidth);

         // *** Find the collective W/H for the whole svg
         let numEls = colorsDictState.length;
         let sidesPadding = padding*2; // Padding between svg and rects
         let elsPadding = padding*(numEls-2); // Padding between legend elements
         if(orientationState == 'vertical'){
           svgWidth = sidesPadding + elementWidth;
           svgHeight = sidesPadding*2 + marginState + (shapeH*numEls) + elsPadding;
         }
         else{
           svgWidth = (elementWidth*numEls);
           svgHeight = sidesPadding*2 + marginState + shapeH;
         }
       }
       setWidth(svgWidth);
       setHeight(svgHeight);
     }
   },[isMountedState, marginState, titleState, orientationState, colorsDictState])
   
   // *** Create the legend with colors and labels *** //
   useEffect(() => {

     if(isMountedState && svg && colorsDictState && shapeState && orientationState){
       // Change the x and y incrementors based on orientation
       let xInc=0, yInc=0;
       if(orientation == "vertical"){
          xInc = 0;
          yInc = shapeH+padding;
       }
       else if(orientation == "horizontal"){
         xInc = padding + shapeW + maxTextWidthState;
       }

       // create a tooltip


       // Append rects or circles based on shape state
       if(shapeState == "rectangle"){
         d3.select(legendRef.current)
          .selectAll("g")
          .data(colorsDictState)
          .join(
            function(enter){
              return enter.append("g")
                .attr("transform", function(d, i){return "translate("+(padding+i*xInc)+","+ padding +")"})
                .insert("rect")
                .attr("x", function(d, i){return i*xInc;})
                .attr("y", function(d, i){return i*yInc; })
                .attr("width", shapeW)
                .attr("height", shapeH)
                .attr("fill", function(d){ return d["color"]})
                .select(function() { return this.parentNode; })
                .insert("text")
                .attr("class", "simple-text")
                .attr("x", function(d, i){return padding+shapeW+i*xInc;})
                .attr("y", function(d, i){return i*yInc+shapeH/2; })
                .text(function(d){return d["label"];});
                
            },
            function(update){
              return update.select("text")
                           .text(function(d){ return d["label"];})
                           .select(function() { return this.parentNode; })
                           .select("circle")
                           .attr("fill", function(d){ return d["color"]});
            },
            function(exit){
              return exit.remove();
            }
          )
      }
       else if(shapeState == "circle"){
        d3.select(legendRef.current)
         .selectAll("g")
         .data(colorsDictState)
         .join(
           function(enter){
             return enter
               .append("g")
               .attr("transform", function(d, i){return "translate("+(padding+i*xInc)+","+ padding +")"})
               .insert("circle")
               .attr("cx", function(d, i){return i*xInc+shapeW/2;})
               .attr("cy", function(d, i){return i*yInc+shapeW/2; })
               .attr("r", shapeW/2)
               .attr("fill", function(d){ return d["color"]})
               .select(function() { return this.parentNode; })
               //.append("text")
               .insert("text")
               .attr("class", "simple-text")
               .attr("x", function(d, i){return padding+shapeW+i*xInc;})
               .attr("y", function(d, i){return i*yInc+shapeH/2; })
               .attr("fill","black")
               .text(function(d){ return d["label"];})
           },
           function(update){
             return update.select("text")
                          .text(function(d){ return d["label"];})
                          .select(function() { return this.parentNode; })
                          .select("circle")
                          .attr("fill", function(d){ return d["color"]});
           },
           function(exit){
             return exit.remove();
           }
         )
       }
       else if(shapeState == 'line'){
         d3.select(legendRef.current)
          .selectAll("g")
          .data(colorsDictState)
          .join(
            function(enter){
              return enter.append("g")
                .attr("transform", function(d, i){return "translate("+(padding+i*xInc)+","+ padding +")"})
                .insert("rect")
                .attr("x", function(d, i){return i*xInc;})
                .attr("y", function(d, i){return i*yInc+shapeH/2-1.5; })
                .attr("width", shapeW)
                .attr("height", 3)
                .attr("fill", function(d){ return d["color"]})
                .select(function() { return this.parentNode; })
                .insert("text")
                .attr("class", "simple-text")
                .attr("x", function(d, i){return padding+shapeW+i*xInc;})
                .attr("y", function(d, i){return i*yInc+shapeH/2; })
                .text(function(d){return d["label"];});
            },
            function(update){
              return update.select("text")
                           .text(function(d){return d["label"];})
                           .select(function() { return this.parentNode; })
                           .select("circle")
                           .attr("fill", function(d){ return d["color"]});
            },
            function(exit){
              return exit.remove();
            }
          )
       }
       else if(shapeState == 'diamond'){
        d3.select(legendRef.current)
         .selectAll("g")
         .data(colorsDictState)
         .join(
           function(enter){
             return enter.append("g")
               .insert("path")
               .attr('d', diamond)
               .attr("transform", function(d, i){return "translate("+(padding+i*xInc+6)+","+ (padding+i*yInc+5.5) +")"})
               .attr("x", function(d, i){return i*xInc;})
               .attr("y", function(d, i){return i*yInc+shapeH; })
               .attr("width", shapeW)
               .attr("height", 3)
               .attr("fill", function(d){ return d["color"]})
               .select(function() { return this.parentNode; })
               .insert("text")
               .attr("class", "simple-text")
               .attr("x", function(d, i){return padding+shapeW+i*xInc;})
               .attr("y", function(d, i){return i*yInc+shapeH/2; })
               .text(function(d){return d["label"];});
           },
           function(update){
             return update.select("text")
                          .text(function(d){return d["label"];})
                          .select(function() { return this.parentNode; })
                          .select("circle")
                          .attr("fill", function(d){ return d["color"]});
           },
           function(exit){
             return exit.remove();
           }
         )
      }
      else if(shapeState == 'cross'){
        d3.select(legendRef.current)
         .selectAll("g")
         .data(colorsDictState)
         .join(
           function(enter){
             return enter.append("g")
               .insert("path")
               .attr('d', cross)
               .attr("transform", function(d, i){return "translate("+(padding+i*xInc+6)+","+ (padding+i*yInc+5.5) +")"})
               .attr("x", function(d, i){return i*xInc;})
               .attr("y", function(d, i){return i*yInc+shapeH; })
               .attr("width", shapeW)
               .attr("height", 3)
               .attr("fill", function(d){ return d["color"]})
               .select(function() { return this.parentNode; })
               .insert("text")
               .attr("class", "simple-text")
               .attr("x", function(d, i){return padding+shapeW+i*xInc;})
               .attr("y", function(d, i){return i*yInc+shapeH/2; })
               .text(function(d){return d["label"];});
           },
           function(update){
             return update.select("text")
                          .text(function(d){return d["label"];})
                          .select(function() { return this.parentNode; })
                          .select("circle")
                          .attr("fill", function(d){ return d["color"]});
           },
           function(exit){
             return exit.remove();
           }
         )
      }
      else if(shapeState == 'star'){
        d3.select(legendRef.current)
         .selectAll("g")
         .data(colorsDictState)
         .join(
           function(enter){
             return enter.append("g")
               .insert("path")
               .attr('d', star)
               .attr("transform", function(d, i){return "translate("+(padding+i*xInc+6)+","+ (padding+i*yInc+5.5) +")"})
               .attr("x", function(d, i){return i*xInc;})
               .attr("y", function(d, i){return i*yInc+shapeH; })
               .attr("width", shapeW)
               .attr("height", 3)
               .attr("fill", function(d){ return d["color"]})
               .select(function() { return this.parentNode; })
               .insert("text")
               .attr("class", "simple-text")
               .attr("x", function(d, i){return padding+shapeW+i*xInc;})
               .attr("y", function(d, i){return i*yInc+shapeH/2; })
               .text(function(d){return d["label"];});
           },
           function(update){
             return update.select("text")
                          .text(function(d){return d["label"];})
                          .select(function() { return this.parentNode; })
                          .select("circle")
                          .attr("fill", function(d){ return d["color"]});
           },
           function(exit){
             return exit.remove();
           }
         )
      }
      else if(shapeState == 'rating'){
        d3.select(legendRef.current)
         .selectAll("g")
         .data(colorsDictState)
         .join(
           function(enter){
             return enter.append("g")
             .attr("transform", function(d, i){return "translate("+(padding+i*xInc)+","+ padding +")"})
             .insert("rect")
             .style("fill", colorScale)
             .attr("x", function(d, i){return i*xInc;})
             .attr("y", function(d, i){return i*yInc; })
             .attr("width", shapeW)
             .attr("height", shapeH)
             .attr("fill", function(d){ return d["color"]})
             .select(function() { return this.parentNode; })
             .insert("text")
             .attr("class", "simple-text")
             .attr("x", function(d, i){return padding+shapeW+i*xInc;})
             .attr("y", function(d, i){return i*yInc+shapeH/2; })
             .text(function(d){return d["label"];});
           },
           function(update){
             return update.select("text")
                          .text(function(d){return d["label"];})
                          .select(function() { return this.parentNode; })
                          .select("circle")
                          .attr("fill", function(d){ return d["color"]});
           },
           function(exit){
             return exit.remove();
           }
         )
      }
      
      else if(shapeState == 'test'){
        d3.select(legendRef.current)
         .selectAll("g")
         .data(colorsDictState)
         .join(
           function(enter){
             return enter.append("g")
               .insert("image")
               //.attr("x", function(d, i){return i*xInc;})
               //.attr("y", function(d, i){return i*yInc+shapeH; })
               .attr("xlink:href", "https://github.com/favicon.ico")
               .attr("transform", function(d, i){return "translate("+(padding+i*xInc+2)+","+ (padding+i*yInc) +")"})
               //.attr("width", shapeW)
               .attr("height", 9)
               .attr("fill", function(d){ return d["color"]})
               .select(function() { return this.parentNode; })
               .insert("text")
               .attr("class", "simple-text")
               .attr("x", function(d, i){return padding+shapeW+i*xInc;})
               .attr("y", function(d, i){return i*yInc+shapeH/2; })
               .text(function(d){return d["label"];});
           },
           function(update){
             return update.select("text")
                          .text(function(d){return d["label"];})
                          .select(function() { return this.parentNode; })
                          .select("circle")
                          .attr("fill", function(d){ return d["color"]});
           },
           function(exit){
             return exit.remove();
           }
         )
      }
      else if(shapeState == 'triangleup'){
        d3.select(legendRef.current)
         .selectAll("g")
         .data(colorsDictState)
         .join(
           function(enter){
             return enter.append("g")
               .insert("path")
               .attr('d', triangleup)
               .attr("transform", function(d, i){return "translate("+(padding+i*xInc+6)+","+ (padding+i*yInc+6) +")"})
               .attr("x", function(d, i){return i*xInc;})
               .attr("y", function(d, i){return i*yInc+shapeH; })
               .attr("width", shapeW)
               .attr("height", 3)
               .attr("fill", function(d){ return d["color"]})
               .select(function() { return this.parentNode; })
               .insert("text")
               .attr("class", "simple-text")
               .attr("x", function(d, i){return padding+shapeW+i*xInc;})
               .attr("y", function(d, i){return i*yInc+shapeH/2; })

               .text(function(d){return d["label"];});
           },
           function(update){
             return update.select("text")
                          .text(function(d){return d["label"];})
                          .select(function() { return this.parentNode; })
                          .select("circle")
                          .attr("fill", function(d){ return d["color"]});
           },
           function(exit){
             return exit.remove();
           }
         )
      }
      else if(shapeState == 'triangledown'){
        d3.select(legendRef.current)
         .selectAll("g")
         .data(colorsDictState)
         .join(
           function(enter){
             return enter.append("g")
               .insert("path")
               .attr('d', triangledown)
               .attr("transform", function(d, i){return "translate("+(padding+i*xInc+6)+","+ (padding+i*yInc+5) +") rotate(180)"})
               .attr("x", function(d, i){return i*xInc;})
               .attr("y", function(d, i){return i*yInc+shapeH; })
               .attr("width", shapeW)
               .attr("height", 3)
               .attr("fill", function(d){ return d["color"]})
               .select(function() { return this.parentNode; })
               .insert("text")
               .attr("class", "simple-text")
               .attr("x", function(d, i){return padding+shapeW+i*xInc;})
               .attr("y", function(d, i){return i*yInc+shapeH/2; })
               .text(function(d){return d["label"];});
           },
           function(update){
             return update.select("text")
                          .text(function(d){return d["label"];})
                          .select(function() { return this.parentNode; })
                          .select("circle")
                          .attr("fill", function(d){ return d["color"]});
           },
           function(exit){
             return exit.remove();
           }
         )
      }
     }
   },[isMountedState, svg, marginState, colorsDictState, shapeState, orientationState])

   /*********************************************/
   // On Mount Effect
   // This is called once after the first render.
   // Put all initialization code here that
   // does NOT rely on any state.
   /*********************************************/
   useEffect(() => {

     // Set the is mounted ref and state
     setIsMounted();

     // If the svgRef exists
     if(svgRef.current){
       // Set the svg
       setSVG(d3.select(svgRef.current).attr('class','skeleton-svg'));

       // Unmounts component
       return () => {setIsNotMounted()}
     }
   },[])

   /*******************************************/
   // Return the rendered component
   /*******************************************/
   return (
     <div id={id} ref={divRef} className="simple-legend">
      <svg ref={svgRef} id={"simple-svg-"+UID.current}>
        <rect ref={titleRectRef} id={"simple-title-rect-"+UID.current}/>
        <text ref={titleRef} className="simple-title" id={"simple-title-text-"+UID.current}/>
        <g ref={legendGroupRef} id={"simple-legend-group-"+UID.current}>
          <rect ref={legendRectRef} id={"simple-legend-rect-"+UID.current} />
          <g ref={legendRef} id={"simple-legend-"+UID.current} />
        </g>
      </svg>
    </div>
   );
 }

SimpleLegend.defaultProps = {
  title: "Legend Title",
  titleTextColor: "Blue",
  titleRectColor: "Bisque",
  shape: "rectangle",
  orientation: "vertical",
  legendTextColor: "Black",
  legendRectColor: "Snow",
  location: {right:100, bottom:300},
};

SimpleLegend.propTypes = {
    /**
     * The ID used to identify this component in Dash callbacks.
     */
     id: PropTypes.string,

    /**
     * The title of the component. Set to None if no title is wanted
     */
     title: PropTypes.string,

     /**
      * The color of the title text.
      */
     titleTextColor: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),

     /**
      * The color of the title rectangle. Set to None for no legend rect.
      */
     titleRectColor: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),

     /**
      * The location of the legend
      */
     location: PropTypes.shape({right: PropTypes.number, bottom: PropTypes.number}),

    /**
     * A dictionary of colors and labels
     */
     colors_dict: PropTypes.array,

    /**
     * Orientation
     * Either horizontal or vertical (default).
     */
     orientation: PropTypes.string,

    /**
     * The shape of the legend
     * Either circle or rect (default).
     */
     shape: PropTypes.string,

     /**
      * The color of the legend text.
      */
     legendTextColor: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),

     /**
      * The color of the legend rectangle. Set to None for no legend rect.
      */
     legendRectColor: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),


    /**
     * Dash-assigned callback that should be called to report property changes
     * to Dash, to make them available for callbacks.
     */
     setProps: PropTypes.func
};
