'use strict'

//This is wrapper class over JQuery Ajax class, which handles centerlized audit, error logs etc...
//TODO: Need to implement audit Repository for error and activities logs
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
    
    ///This JQuery get method by default handles CROS 
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

    //Call normal Ajax 
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