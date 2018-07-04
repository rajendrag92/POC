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