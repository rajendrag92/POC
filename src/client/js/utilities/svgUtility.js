'use strict'
var svgUtility = (function(){
    var self = {}, 
    _mercatorProjection,
    _geoPath,
    _svg,
    _svgZoom,

    //This method is used to add SVG element to DOM 
    addSVGToDOM = function(placeHolder){
        _svgZoom = d3.zoom().on("zoom",zoomMap);

        _svg = d3.select( placeHolder )
                .append( "svg" )
                .attr( "width", constants.map.width )
                .attr( "height", constants.map.height )
                .call(_svgZoom);


        _svg.append("rect")
            .attr("width", constants.map.width + 50)
            .attr("height", constants.map.height + 50)
            .style("fill", "none")
            .style("pointer-events", "all")
    },

    //Define ZOOM function for SVG
    zoomMap = function(){
        _svg.selectAll("g")
        .attr("transform", d3.event.transform)

        _svg.selectAll("circle")
        .attr("transform", d3.event.transform)

        _svg.selectAll("text")
        .attr("transform", d3.event.transform)
    },
    
    //This method creats projection used to draw map
    createMercatorProjection = function(){
        _mercatorProjection =  d3.geoMercator()
        .scale(constants.map.d3.scale)
        .rotate(constants.map.d3.rotate)
        .center(constants.map.d3.center)
        .translate([constants.map.width/2,constants.map.height/2]);

        _geoPath = d3.geoPath().projection(_mercatorProjection);
    };
    
    //This method used to reset ZOOM scale to default 
    self.resetZoom = function(){
        _svgZoom.transform(
            _svg.selectAll("g"),d3.zoomIdentity.scale(1)
        );

        _svgZoom.transform(
            _svg.selectAll("circle"),d3.zoomIdentity.scale(1)
        );

        _svgZoom.transform(
            _svg.selectAll("text"),d3.zoomIdentity.scale(1)
        );
    
    };

    //This method generate random HEX color code 
    self.getColor = function(){
        return '#' + Math.floor(Math.random()*16777215).toString(16);
    }

    self.init = function(placeHolder){
        addSVGToDOM(placeHolder);
        createMercatorProjection();
    };

    //This method is used to add group path
    self.addPath = function(params){
        _svg.append( "g" )
            .attr( "id", params.id)
            .selectAll( "path" )
            .data(params.data)
            .enter()
            .append( "path" )
            .style("stroke", self.getColor())
            .attr( "d", _geoPath );
    };

    //This method is used to add group line 
    self.addGroupLines = function(params){
        var svgGroup = _svg.append("g")
                            .attr('id',params.id || "")
                            .attr('class', params.class || "");

        _.each(params.lines,function(line){

            var line = svgGroup.selectAll(".line_" + line.id)
                    .data(line.data)
                    .enter()
                    .append("line")
                    .attr("class", "line_" + line.id)
                    .attr('stroke', self.getColor())
                    .attr('stroke-width', line.stroke)
                    .attr("x1", function(data) {
                        return data[0][0];
                    })
                    .attr("y1", function(data) {
                        return data[0][1];
                    })
                    .attr("x2", function(data) {
                        return data[1][0];
                    })
                    .attr("y2", function(data) {
                        return data[1][1];
                    });
                   
        })
    };

    //this method converts longitude, langitutde to X,Y point
    self.convertLogLatToXYPoints = function(longitude, latitude){
        return _mercatorProjection([longitude, latitude]);
    };

    self.drawCircle = function(params){
        
        _svg.append("circle")
        .attr("cx",params.cx)
        .attr("cy",params.cy)
        .attr("r",params.radius)
        .attr("id",params.id)
        .attr("class",params.class)
        .style("fill",params.color)
        .text(params.text)
        ;

    };

    self.addText = function(params){
        _svg.append("text")
        .attr("x",params.x)
        .attr("y",params.y)
        .attr("id",params.id)
        .attr("font-family", "sans-serif")
        .attr("font-size", "20px")
        .attr("fill", "white")
        .attr("class",params.class)
        .text(params.text);
    };

    return self;
}());