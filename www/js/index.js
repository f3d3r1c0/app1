var baseurl_ = "http://webservices-farmadati.dyndns.ws/FarmastampatiMobi/";

var doc = null;           
var list = null;
var tbox = null;

function msgbox(mesg)
{
    $('#popupDialogMessage').html(mesg);
    $('#popupDialog').popup('open');    
}

function dosearch(aic_)
{
    try {

        var vaic = null;

        if (aic_ && aic_.length > 0) {
            if (tbox) tbox.val(aic_);
            vaic = aic_;
        }
        else if (!tbox) {                        
            msgbox('Inserire il codice AIC');
            return;
        }
        else {
            vaic = tbox.val().trim();
        }

        if (!vaic || vaic.length == 0) throw 'Inserire il codice AIC';

        if (vaic.charAt(0).toUpperCase() == 'A') vaic = vaic.substr(1);
        
        var aic = '';

        for (var i = 0; i < vaic.length; i++) {
            if ("0123456789".indexOf(vaic.charAt(i)) >= 0)
                aic += vaic.charAt(i);
            else if (" .-\r\n\t".indexOf(vaic.charAt(i)) < 0) 
                throw 'Il codice AIC inserito non &egrave; corretto.<br/>' 
                    + 'Deve contenere fino a un massimo di 9 caratteri numerici e '
                    + 'pu&ograve; avere come carattere iniziale la lettera A';               
        }

        while (aic.length < 9) {
            aic = '0' + aic; 
        }

        //  
        // visualizzo in caricamento ...
        //
        $('#caricamento').css('display', 'block');

        $('#page0file').load (function() {
            $('#caricamento').css('display', 'none');
        });

        //
        // effettuo la chiamata 
        //
        $.ajax({                    

            //url: 'archive',
            //dataType: 'json',
            //data: '{ "aic": "' + aic + '" }',
            //method: 'post',
            
            //DEBUG HTML
            url: baseurl_ + 'document.json',
            dataType: 'json',
            method: 'get',            
                                
            success: function (data) {

                try {

                    if (!data && data.length <= 0) 
                        throw 'Codice AIC non valido o non trovato (2)';
                    
                    if (data[0].aicFS.length == 0) 
                        throw 'Il foglietto presente nella confezione &egrave; gi&agrave; aggiornato';
                    
                    doc = null;
                    list = data;

                    for (var i = 0; i < list.length; i ++) {    
                        if (list[i].isDefaultLanguage) {
                            doc = list[i];
                            break;
                        }
                    }   

                    if (!doc || doc == null) doc = list[0];

                    // azzero il campo ricerca                    
                    if (tbox) { tbox.val(''); }

                    reload();
                    
                    $.mobile.changePage('#page0', { 
                            allowSamePageTransition: true, 
                            transition: 'slidedown'
                        });


                }
                catch (e1) {                        

                    msgbox(e1);                            

                }

            },

            error: function (data) {   
                
                navigator.notification.beep(1);
                navigator.vibrate(500);        
                msgbox('Codice AIC non valido o non trovato');    
                
            }

        });

        // pulisco la lista di autocompletamento
        $('#autocomplete').html('');        

        /*
        $('#page0file').on("swiperight", function () {                      
            var pageid = $.mobile.activePage.attr('id');
        });

        $('#page0file').on("swipeleft", function () {         
        });                

        $('#page0file').on("swipeup", function () {          
        });

        $('#page0file').on("swipedown", function () {          
        });
        */

        $('#search').on("pageshow", function () {                         
            //if (tbox) {
            //    tbox.focus();
            //}
        });        

    }
    catch(e2) {

        navigator.vibrate(500);        
        navigator.notification.beep(1);
        msgbox(e2);            
        
    }
}

function getpageurl(filename, page)
{            
    var gsoptsD44 = 
        "-sDEVICE=pngalpha -dFirstPage=" + page + 
        " -dLastPage=" + page + 
        " -dMaxBitmap=500000000 -dAlignToPixels=0 -dGridFitTT=0 -dTextAlphaBits=4 -dGraphicsAlphaBits=4 -r120x120"
    
    var gsoptsD14 = 
        "-sDEVICE=pngalpha -dFirstPage=" + page + 
        " -dLastPage=" + page + 
        " -dMaxBitmap=500000000 -dAlignToPixels=0 -dGridFitTT=0 -dTextAlphaBits=1 -dGraphicsAlphaBits=4 -r120x120"

    var gsoptsD11 = 
        "-sDEVICE=pngalpha -dFirstPage=" + page + 
        " -dLastPage=" + page + 
        " -dMaxBitmap=500000000 -dAlignToPixels=0 -dGridFitTT=0 -dTextAlphaBits=1 -dGraphicsAlphaBits=1 -r120x120"

    var timeout = -1;
    var nocache = false; 
    var gsext = 'png';
    var gsopts = gsoptsD44;
    
    return baseurl_ + 'pages/' + filename + '?page=' + page +
            (timeout > 0 ? '&timeout=' + timeout : '') + 
            (nocache ? '&nocache=true' : '') + 
            '&gsext=' + gsext +
            '&gsopts=' + encodeURI(gsopts);                                
}

function reload()
{
    var ic = 0;

    $('img').each(
        function () {
            var id = $(this).attr('id');
            if (id == null) return;
            if (id.indexOf('page') < 0) return;                    
            if (id.indexOf('file') < 0) return;                    
            ic ++;
            if (ic > doc.pagesCount) {
                $(this).css('display', 'none');
                $('#page' + (ic - 1) + 'footer').css('display', 'none');
            }
            else {
                $(this).attr('src', getpageurl (doc.filename, ic));
                $(this).css('display', 'block');                        
                $('#page' + (ic - 1) + 'footer').html('Pagina ' + ic + ' di ' + doc.pagesCount);
                $('#page' + (ic - 1) + 'footer').css('display', 'block');
            }                    
        }
    );          

    for (var k = 0; k < 1; k ++) {

        $('#lang-it' + '-' + k).css('display', 'none');
        $('#lang-de' + '-' + k).css('display', 'none');
        $('#lang-en' + '-' + k).css('display', 'none');        
        $('#lang-fr' + '-' + k).css('display', 'none');
        
        for (var i = 0; i < list.length; i ++) {    
            var lang = list[i].language.toLowerCase();                                
            try {
                $('#lang-' + lang + '-' + k).css('display', 'block');
            }
            catch (e) {}
        }
    }

}


function chlang(lang)
{           
    var i;  

    $('#caricamento').css('display', 'block');

    for (i = 0; i < list.length; i ++) {
        if (list[i].language.toLowerCase() == lang) {
            doc = list[i];                    
            break;
        }
    }

    reload();                       

    if ($.mobile.activePage.attr('id') == 'page0') {
        $("html, body").animate({ scrollTop: 0 }, "slow");     
    }
    else {
        $.mobile.changePage('#page0', 
            { allowSamePageTransition: true, transition: 'slide', reverse: true });                
    }
    
}

function doscan()
{
    // not  initialized cordova.plugins;


var msg = '';
for(var propertyName in cordova) {
   // propertyName is what you want
   // you can get the value like this: myObject[propertyName]
   msg += "- " + propertyName;
   msg += '\n';
}
alert(msg);

    try {

        var scanner = cordova.plugins.barcodeScanner;
        //var scanner = cordova.require("com.phonegap.plugins.barcodescanner.BarcodeScanner");

        scanner.scan(
              function (result) {
                  alert("We got a barcode\n" +
                        "Result: " + result.text + "\n" +
                        "Format: " + result.format + "\n" +
                        "Cancelled: " + result.cancelled);
              }, 
              function (error) {
                  alert("Scanning failed: " + error);
              }  
           );
    }
    catch (e) {
        alert('exception-x: ' + e);
    }
}

function docap()
{
    try {
        var options = { limit: 1 };    
        navigator.device.capture.captureImage(
            function (mediaFiles) {
                try {
                    var i, path, len;
                    for (i = 0, len = mediaFiles.length; i < len; i += 1) {
                        path = mediaFiles[i].fullPath;
                        // do something interesting with the file
                        //navigator.notification.alert('Filepath: ' + path, null, 'Capture Info');
                        dosearch('00011111');
                    }
                }
                catch (e) {
                    navigator.notification.alert('Error code: ' + e, null, 'Capture Loading Error');
                }                
            }, 
            function (error) {                
                navigator.notification.alert('Error code: ' + error.code, null, 'Capture Error');                
            }, 
            options);
    }
    catch (e) {
        navigator.notification.alert('Error code: ' + e, null, 'Capture Error 2');
    }    
}

/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {

    onload: function () {        

        $("#autocomplete").on("filterablebeforefilter", function (e, data) {

            var $ul = $(this),
                $input = $(data.input),
                value = $input.val(),
                html = "";  

            tbox = $(data.input);

            $ul.html("");
            
            if (value && value.length > 2) {
                $ul.html("<li><div class='ui-loader'><span class='ui-icon ui-icon-loading'></span></div></li>");
                $ul.listview("refresh");
                $.ajax({
                    url: baseurl_ + "autocom",
                    dataType: "jsonp",
                    crossDomain: true,
                    data: {
                        q: $input.val()
                    }
                })
                .then(function (response) {
                    $.each(response, function (i, val) {                    
                        html += '<li><a href="javascript:dosearch(\'' + val + '\');">' + val + '</a></li>';
                    });
                    $ul.html(html);
                    $ul.listview("refresh");
                    $ul.trigger("updatelayout");
                });
            }
        });
        
        $('#loading').height = $('#searchButton').height;

        $(document)
            .ajaxStart(function () {                   
                $('#searchButton').hide();
                $('#loading').fadeIn();
            })
            .ajaxStop(function () {                
                $('#loading').hide();
                $('#searchButton').fadeIn();    
            });

        //
        // FIX IOS 9.0.2 bug changing orientation to landscape
        //    
        if (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i)) {
            $(window).on( "orientationchange", function (event) {        
                $('meta[name=viewport]').attr('content', 'initial-scale=1; maximum-scale=1.0; user-scalable=1;');

                var w = $(window).width();
                var h = $(window).height();            
                
                $('#popupAic').css('max-width', w + 'px');
                $('#popupAic').css('max-height', h + 'px');
                $('#popupAic').css('top', '0px');
                $('#popupAic').css('left', '0px');
                
                $('#popupDialog').css('max-width', w + 'px');
                $('#popupDialog').css('max-height', h + 'px');
                $('#popupDialog').css('top', '0px');
                $('#popupDialog').css('left', '0px');            

            });
            document.body.addEventListener('gesturestart', function () {                    
                $('meta[name=viewport]').attr('content', 'initial-scale=1; maximum-scale=3.0; user-scalable=1;');
            }, false);
        }       
        
        // submit alla pressione di invio
        $(document).keydown(function(event){    
            var keycode = (event.keyCode ? event.keyCode : event.which);
            if(keycode == '13') {
                dosearch();
            }    
        });

        $(window).on( "orientationchange", function( event ) {
          //$( "#orientation" ).text( "This device is in " + event.orientation + " mode!" );
           $('img').each(
            function() {
                var id = $(this).attr('id');
                if (id == null) return;
                if (id.indexOf('page') < 0) return;                    
                if (id.indexOf('file') < 0) return;   
                $(this).css('width', $(window.width));            
            });              
        });        
        
        // previene il bookmark della pagina fatto su #page0
        if (window.location.href.indexOf('#page0') >= 0) {
            $('#searchclick').click();
        }

    },

    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        
		app.receivedEvent('deviceready');

        var parentElement = document.getElementById("search");
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');
        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');        

		app.onload();
		
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        
        /*
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
        */

        if (console) { 
            console.log('Received Event: ' + id); 
        }

    }
};
