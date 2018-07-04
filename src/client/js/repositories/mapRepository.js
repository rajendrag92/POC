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




