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