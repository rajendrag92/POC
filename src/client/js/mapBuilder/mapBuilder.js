 'use strict'

var MapBuilder = function (repo){
        var _repo = repo,
        _mercatorProjection,
        _nextBusMapBuilder,
        _geoPath,
        _svg,
        _routeLayer,
        //add list of layers required to draw SF map
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

        init = function(){
            drawMap();
        };

        return {
            init : init
        }
};

