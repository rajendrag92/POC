'use strict'

function NextBusMapBuilder (repo){
    var _repo= repo,
    _domSelectors = {},
    _vehicleLocationTimer,
    _houseKeepSelectedRoutes =[],

    //Select DOM elements on run time and store them to object
    selectDomElements = function(){

        _domSelectors = {
            agencyList : $('.agency-list'),
            routeList:$('.route-list')
        };
    },

    createBinding = function(){
        //Bind change event to agency list drop down and populate rote list
        _domSelectors.agencyList.off("change").on("change",function(){
            populateAgencyRouteList(this.value);
        });

        //Bind change event to route list drop down and on selection update route on map
        _domSelectors.routeList.off("change").on("change",function(){
             getRouteConfig(_domSelectors.agencyList.val(),this.value);
        });
    },

    populateAgencyRouteList = function(agency){
        $('.route-list option').remove();

        repo.getRoutes(agency).then(function(data){
            
            //If route length is undefinded then populated route list with default option
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

    //This method stores all selected Routes from Route list drop down, 
    //so when vehicle refresh timer gets call then it update for all previpous selected 
    //routes stored in housekeeping
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

        //Fetch for each selected routes in session
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

    //This method reset Vehicle location refresh timer on Route drop down selection change event
    restVehicleLocationsRefreshTimer = function(){
        clearTimeout(_vehicleLocationTimer);
        _vehicleLocationTimer = setTimeout(fetchVehicleLocations, constants.map.vehicleUpdateTimeSpan);
    },

    drawVehicleLocations =function(data , routeConfig){
       
        //Define custom class for vehicle and text elements
        var vehicleClass = "vehicle-route-" + _domSelectors.routeList.val();
        var textClass = "vehicle-route-tab-" + _domSelectors.routeList.val();
        
        //To refresh vehicle location,first remove all circle and Text elements and 
        // draw them again based on selected route 
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

    //This method is used to draw the selected route on map
    drawRouteConfig = function(data){
        var routeConfigsPoints = [];
        routeConfigsPoints = convertToViewPortPoints(data.route);

        svgUtility.addGroupLines({
               id:"route_" + data.route.tag,
               class:"route-layer",
               lines: routeConfigsPoints
        });
    },

    //This method converts route  longitude, lattitude  to X,Y corrdinates  
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