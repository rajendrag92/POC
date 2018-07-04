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
