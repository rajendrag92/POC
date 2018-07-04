'use strict'

var constants = {

    layers :{
        arteries:"arteries",
        freeways:"freeways",
        neighborhoods:"neighborhoods",
        streets:"streets"
    },

    errors:{
        invalidURL:"Invalid url.."
    },

    ajax:{
        post:"post",
        get:"get",
        contentType:"application/json; charset=utf-8",
        header:{
            'Access-Control-Allow-Origin': '*'
        }
    },

    urls:{
        arteriesLazy:"/assets/arteries.json",
        freewaysLazy:"/assets/freeways.json",
        neighborhoodsLazy:"/assets/neighborhoods.json",
        streetsLazy:"/assets/streets.json",
        getNextBusAgencies:"http://webservices.nextbus.com/service/publicJSONFeed?command=agencyList",
        getNextBusAgencyRoutes:"http://webservices.nextbus.com/service/publicJSONFeed?command=routeList&a={0}",
        getNextBusRouteConfig:"http://webservices.nextbus.com/service/publicJSONFeed?command=routeConfig&a={0}&r={1}",
        getRouteVehicleLocations:"http://webservices.nextbus.com/service/publicJSONFeed?command=vehicleLocations&a={0}&r={1}&t={2}",
    },

    events:{
        drawRouteDirections:"draw-route-direction"
    },

    map:{
        width:900,
        height:1000,
        d3:{
            scale:350000,
            center:[-122.433701, 37.767683],
            rotate:[0, 0]
        },
        vehicleUpdateTimeSpan:15000,
        defaultAgency:"sf-muni"
    }
};
///Bind global events on document loads
(function bindGlobalEvents (){

    //Bind events on document ready
    $(document).ready(function(){
        //intialize SVG utlitiy 
        svgUtility.init("div.map-place-holder");

        var _mapBuilder = new MapBuilder(new LazyLoadMapRepository());
        _mapBuilder.init();

        var _nextBusMapBuilder = new NextBusMapBuilder(new NextBusRepository());
        _nextBusMapBuilder.init();
        
    });  
    
}());
'use strict'

var ajaxWrapper = (function(){
    var self = {},
         _defaultStatusCode = {
        //Bad request
        400: _showDialog,
        //Unatuthorized 
        401: _showDialog,
        //Forbidden 
        403: _showDialog,
        //Not Found 
        404: _showDialog,
        //Coflict 
        409: _showDialog,
        //Internal Server Error 
        500: _showDialog,
        //Unavailable 
        503: _showDialog,
        //Connection 
        0: _showDialog,
        //The connection with the server has been reset.
        12031: _showDialog,
    },

    _showDialog= function(){
        $(".alert").alert();
    },
    
    _getCROS= function(params){
        var deferred = $.Deferred();
        if(params.url){

            $.get(params.url,params.data)
            .done(function(data){
                deferred.resolve(data);
            })
            .fail(function(error) {
                deferred.reject(error,this.statusCode); 
            });

        }else{
            throw new Error(constants.errors.invalidURL);
        }


        return deferred;
    },

    _callAjax = function(params){
        var deferred = $.Deferred();

        if(params.url){
            $.ajax({
                async:true,
                url:params.url,
                type: params.type,
                cache:false,
                data:params.data,
                statusCode: _defaultStatusCode,
                contentType:constants.ajax.contentType,
                error: function(error){
                    deferred.reject(error,this.statusCode); 
                },
                success: function(response){
                    deferred.resolve(response);
                }
            });

        }else{
            throw new Error(constants.errors.invalidURL);
        }

        return deferred;
    };

    self.get = function(params){
        return _callAjax({
            url:params.url,
            type:constants.ajax.get,
            data:params.data
        });
    }; 

    self.post = function(params){
        return _callAjax({
            url:params.url,
            type:constants.ajax.post,
            data:params.data
        });
    };

    self.getCROS = function(params){
        return $.get(params.url,)
    };

    return self;
}());
'use strict'
var AuditRepository = function(){
    

    this.AuditLog =function(error){
       
    };
};
'use strict'

///Base Map repository 
var MapRepository = function(){
};

MapRepository.prototype.getArteriesGeoJSON = function(){
};
MapRepository.prototype.getFreeWaysGeoJSON = function(){
};
MapRepository.prototype.getNeighborhoodsGeoJSON = function(){
};
MapRepository.prototype.getStreetsGeoJSON = function(){
};


var LazyLoadMapRepository = function(){
    MapRepository.call(this);

    this.getArteriesGeoJSON = function(){
        return ajaxWrapper.get({
            url:constants.urls.arteriesLazy,
            data:{}
        });
    };

    this.getFreeWaysGeoJSON = function(){
        return ajaxWrapper.get({
            url:constants.urls.freewaysLazy,
            data:{}
        });
    };

    this.getNeighborhoodsGeoJSON = function(){
        return ajaxWrapper.get({
            url:constants.urls.neighborhoodsLazy,
            data:{}
        });
    };

    this.getStreetsGeoJSON = function(){
        return ajaxWrapper.get({
            url:constants.urls.streetsLazy,
            data:{}
        });
    };
};





'use strict'
var NextBusRepository = function(){
    
    this.getAgencies = function(){
        return ajaxWrapper.getCROS({
            url:constants.urls.getNextBusAgencies,
        });
    };

    this.getRoutes = function(agency){
        return ajaxWrapper.getCROS({
            url:constants.urls.getNextBusAgencyRoutes.replace('{0}',agency)
        });
    };

    this.getRouteConfig = function(agency , route){
        return ajaxWrapper.getCROS({
            url:constants.urls.getNextBusRouteConfig.replace('{0}',agency).replace('{1}',route)
        });
    };

    this.getRouteVehicleLocations = function(agency, route, timeSpan ){
        return ajaxWrapper.getCROS({
            url:constants.urls.getRouteVehicleLocations.replace('{0}',agency).replace('{1}',route).replace('{2}',timeSpan)
        });
    };
};  

'use strict'
var svgUtility = (function(){
    var self = {}, 
    _mercatorProjection,
    _geoPath,
    _svg,
    _svgZoom,

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

    zoomMap = function(){
        _svg.selectAll("g")
        .attr("transform", d3.event.transform)

        _svg.selectAll("circle")
        .attr("transform", d3.event.transform)

        _svg.selectAll("text")
        .attr("transform", d3.event.transform)
    },
    
    createMercatorProjection = function(){
        _mercatorProjection =  d3.geoMercator()
        .scale(constants.map.d3.scale)
        .rotate(constants.map.d3.rotate)
        .center(constants.map.d3.center)
        .translate([constants.map.width/2,constants.map.height/2]);

        _geoPath = d3.geoPath().projection(_mercatorProjection);
    };
    
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

    self.getColor = function(){
        return '#' + Math.floor(Math.random()*16777215).toString(16);
    }

    self.init = function(placeHolder){
        addSVGToDOM(placeHolder);
        createMercatorProjection();
    };

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
'use strict'

var MapLayer = function(layer,repo){
    this.name = layer;
    this.repo = repo;
};

var ArteriesLayer = function(repo){
    MapLayer.call(this,constants.layers.arteries,repo);
    
    this.getGeoJson = function(){
        return  this.repo.getArteriesGeoJSON();
    };
};

var FreewaysLayer = function(repo){
    MapLayer.call(this,constants.layers.freeways,repo);
    
    this.getGeoJson = function() {
        return  this.repo.getFreeWaysGeoJSON();
    };
};
var NeighborhoodsLayer = function(repo){
    MapLayer.call(this,constants.layers.neighborhoods,repo);
    
    this.getGeoJson = function() {
        return this.repo.getNeighborhoodsGeoJSON();
    };
};

var StreetsLayer = function(repo){
    MapLayer.call(this,constants.layers.streets,repo);
    
    this.getGeoJson = function() {
        return this.repo.getStreetsGeoJSON();
    }
};

 'use strict'

var MapBuilder = function (repo){
        var _repo = repo,
        _mercatorProjection,
        _nextBusMapBuilder,
        _geoPath,
        _svg,
        _routeLayer,
        _mapLayers = [new ArteriesLayer(_repo),
            new FreewaysLayer(_repo),
            new NeighborhoodsLayer(_repo),
            new StreetsLayer(_repo)],
        
       
        addLayer = function(layer , geoJSON){
            svgUtility.addPath({
                id:layer.name,
                data:geoJSON.features
            });
       },
  
        drawMap = function(){
            _.each(_mapLayers,function(layer){
                layer.getGeoJson().then(function(geoJSON){
                    addLayer(layer, geoJSON);
                }); 
            });
        },

        initNextBusBuilder =function(){
            _nextBusMapBuilder = new NextBusMapBuilder(new NextBusRepository());
            _nextBusMapBuilder.init();
        },
        
        init = function(){
            drawMap();
        };

        return {
            init : init
        }
};


'use strict'

function NextBusMapBuilder (repo){
    var _repo= repo,
    _domSelectors = {},
    _vehicleLocationTimer,
    _houseKeepSelectedRoutes =[],

    selectDomElements = function(){

        _domSelectors = {
            agencyList : $('.agency-list'),
            routeList:$('.route-list')
        };
    },

    createBinding = function(){
        _domSelectors.agencyList.off("change").on("change",function(){
            populateAgencyRouteList(this.value);
        });

        _domSelectors.routeList.off("change").on("change",function(){
             getRouteConfig(_domSelectors.agencyList.val(),this.value);
        });
    },

    populateAgencyRouteList = function(agency){
        $('.route-list option').remove();

        repo.getRoutes(agency).then(function(data){
            
            if(data.route.length){
                _.each(data.route,function(route){
                    var option = document.createElement('option');
                    option.text = route.title;
                    option.value = route.tag;
                    _domSelectors.routeList.append(option);
                });
            }
            else {
                var option = document.createElement('option');
                option.text = data.route.title;
                option.value = data.route.tag;
                _domSelectors.routeList.append(option);
            }
            
            getRouteConfig(_domSelectors.agencyList.val(),
                            _domSelectors.routeList.val())

        });
    }, 

    getRouteConfig = function(agency, route){
     
        _repo.getRouteConfig(agency,route).then(function(data){
            houseKeepSelectedRoute(data);
            drawRouteConfig(data);
            fetchVehicleLocations(data.color);
        });
    },

    houseKeepSelectedRoute = function(routeConfigData){
      var selectedRoute = _.indexOf(_houseKeepSelectedRoutes,function(route){
           return route.name === routeConfigData.route.tag;
       }); 

       if(selectedRoute === -1){
            _houseKeepSelectedRoutes.push({
                name: routeConfigData.route.tag,
                color:"#" + routeConfigData.route.color
            });
       }
    },

    fetchVehicleLocations = function(){

        _.each(_houseKeepSelectedRoutes,function(routeConfig){

            _repo.getRouteVehicleLocations(
                _domSelectors.agencyList.val(),
                _domSelectors.routeList.val(),
                constants.map.vehicleUpdateTimeSpan
            )
            .then(function(data){
                    drawVehicleLocations(data , routeConfig);
                    restVehicleLocationsRefreshTimer();
            });
        });
        
    },

    restVehicleLocationsRefreshTimer = function(){
        clearTimeout(_vehicleLocationTimer);
        _vehicleLocationTimer = setTimeout(fetchVehicleLocations, constants.map.vehicleUpdateTimeSpan);
    },

    drawVehicleLocations =function(data , routeConfig){
       
        var vehicleClass = "vehicle-route-" + _domSelectors.routeList.val();
        var textClass = "vehicle-route-tab-" + _domSelectors.routeList.val();
        
        //remove all vehicle from DOM and draw them so that we will refresh their location every 15 sec
        $("." + vehicleClass).remove();   
        $("." + textClass).remove(); 

        //Clear out Zoom In 
        svgUtility.resetZoom();

        //Draw vehicle again
        _.each(data.vehicle ,function(vehicle){
            var xyPoint = svgUtility.convertLogLatToXYPoints(vehicle.lon,vehicle.lat);
            
            //draw Vehicle as circle
            svgUtility.drawCircle({
                cx: xyPoint[0],
                cy: xyPoint[1],    
                radius : 10,
                color: routeConfig.color,
                id: vehicle.id,
                class:vehicleClass
            });

            //add route tag on circle
            svgUtility.addText({
                x: xyPoint[0],
                y: xyPoint[1],    
                id: vehicle.id,
                class: textClass,
                text : routeConfig.name
            });
        });
    },

    updateVehicleLocations = function(data){
        _.each(vehicle,function(vec){

            if(_.contains(_updatedvehicleLocations,vec)){
                 var findvehicle = _.findWhere(_vehicleLocationTimer,{id:vec.id})   

            }else{
                _updatedvehicleLocations.push(vec);
            }
        });
        

    },

    drawRouteConfig = function(data){
        var routeConfigsPoints = [];
        routeConfigsPoints = convertToViewPortPoints(data.route);

        svgUtility.addGroupLines({
               id:"route_" + data.route.tag,
               class:"route-layer",
               lines: routeConfigsPoints
        });
    },

    convertToViewPortPoints = function(data){
        var points = [];

        _.each(data.path,function(path, index1) {
            var xyPoints = [];
            
            _.each(path.point,function(point,index){
                   
                if(index < path.point.length - 1) {
   
                    xyPoints.push([
                            svgUtility.convertLogLatToXYPoints(path.point[index].lon,path.point[index].lat),
                            svgUtility.convertLogLatToXYPoints(path.point[index + 1].lon,path.point[index + 1].lat)
                        ]);           
                }
            });

            points.push({
                data:xyPoints,
                id:'line_' + index1,
                stroke:3
            });
        });

        return points;
    },

    populateAgencyList = function(){
        repo.getAgencies().then(function(data){
            _.each(data.agency,function(agency){
             var option = document.createElement('option');
                option.text = agency.title;
                option.value = agency.tag;
                _domSelectors.agencyList.append(option);
            });

            //default to San Francisco Muni
            _domSelectors.agencyList.val(constants.map.defaultAgency);

            //pupulate Default RouteList
            populateAgencyRouteList(_domSelectors.agencyList.val());
        });
    },

    init = function(){
        selectDomElements();
        populateAgencyList();
        createBinding();
    };

    return {
        init :init  
    };
};