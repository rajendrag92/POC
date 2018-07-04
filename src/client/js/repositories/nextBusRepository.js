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
