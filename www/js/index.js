/*
 *  JQuery Mobile API Guide:
 *      @see http://demos.jquerymobile.com/1.0rc2/docs/api/events.html
 *      @see http://demos.jquerymobile.com/1.4.5/icons/       
 *
 */
//var baseurl_ = "";
var baseurl_ = "http://webservices-farmadati.dyndns.ws/FarmastampatiMobi/";

var doc = null;           
var list = null;
var tbox = null;

var tbox_init_retry = 0;
var disable_enter = false;

function msgbox(mesg) {
    disable_enter = true;
    $("html, body").animate({ scrollTop: 0 }, 400);
    $('#popupDialogMessage').html(mesg);
    resizePopups();    
    $('#popupDialogClick').click(); 
}

function restore_enter() {
    disable_enter = false;
}

function dosearch(aic_)
{
    try {

        var vaic = null;

        //
        // begin fix 20/10/15:
        //

        // problema riscontrato:
        //
        //  1) Si e' rilevato che a digitando per la prima volta la casella di input
        //     con autocompletament tbox possa essere non inizializzato.
        //  2) Viene anche usato questo controllo per verificare che il browser 
        //     supporti xcorrettamente questa funzione, altrimenti si viene rediretti
        //     alla pagina noscript.html.
        
        if (tbox_init_retry > 2) {
            if (console) console.log ('failure initializing autocomplete textbox, redirecting to noscript.html');
            //document.location.href = "noscript.html"
        }

        if (!tbox && !aic_) {
            throw "Inserire il codice AIC";
            //TODO: codice morto il meccanismo di 
            //      rilevamento non funziona correttamente 
            tbox_init_retry++;
            setTimeout("dosearch()", 400);
            return;
        }

        tbox_init_retry = 0;

        //
        // end fix
        //

        if (aic_ && aic_.length > 0) {
            if (tbox) tbox.val(aic_);
            vaic = aic_;
        }        
        else {
            vaic = tbox.val().trim();
        }
        
        if (!vaic || vaic.length == 0) throw 'Inserire il codice AIC';  

        if (vaic.charAt(0).toUpperCase() == 'A') vaic = vaic.substr(1);
        
        var aic = '';

        for (var i = 0; i < vaic.length; i++) {
            if ("0123456789".indexOf(vaic.charAt(i)) >= 0) {
                aic += vaic.charAt(i);
            }
            else if (" .-\r\n\t".indexOf(vaic.charAt(i)) < 0) {                
                throw 'Il codice AIC inserito non &egrave; corretto.<br/>' 
                    + 'Deve contenere fino a un massimo di 9 caratteri numerici e '
                    + 'pu&ograve; avere come carattere iniziale la lettera A';               
            }
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
        // server call 
        //

        $.ajax({                    

            url: baseurl_ + 'archive',
            dataType: 'json',
            data: '{ "aic": "' + aic + '" }',
            method: 'post',
                                
            success: function (data) {

                try {

                    if (!data && data.length <= 0) 
                        throw 'Codice AIC non valido o non trovato.';
                    
                    if (!data[0].foglioVisualizzabile) 
                        throw 'Il foglio presente nella confezione &egrave; aggiornato';

                    if (data[0].foglioNonFornitoDalProduttore) 
                        throw 'Foglio non reso disponibile dal produttore';
                    
                    doc = null;
                    list = data;

                    for (var i = 0; i < list.length; i ++) {    
                        if (list[i].isDefaultLanguage) {
                            doc = list[i];
                            break;
                        }
                    }   

                    if (!doc || doc == null) doc = list[0];

                    reload();                    
                    
                    $.mobile.changePage('#page0', { 
                            allowSamePageTransition: true, 
                            transition: 'slidedown'
                    });


                }
                catch (e1) {                        

                    msgbox(e1);                            

                }

                $('#caricamento').css('display', 'none');

            },

            error: function (data) {   

                $('#caricamento').css('display', 'none');
                msgbox('Codice AIC non valido o non trovato');
                navigator.notification.beep();
                navigator.notification.vibrate(500);       

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

    }
    catch(e2) {
            

        msgbox(e2);     
        navigator.notification.beep();
        navigator.notification.vibrate(500);
       
        
    }   

    if (tbox) { tbox.val(''); }

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
    //
    // Inizializzazione Foglietto 
    //
    var ht = '';
    for (var k = 1; k <= doc.pagesCount; k ++) {
        ht += '<div class="pagebreak" style="box-shadow: 10px 10px 5px #888888; width: 100%;">';
        ht += '<img style="width: 100%;" src="' + getpageurl (doc.filename, k) +'" id="page' + k + 'file" />';
        ht += '<span data-role="footer" class="ui-btn-text">' + 'Pagina ' + k + ' di ' + doc.pagesCount + '</span>';
        ht += '</div>'; 
    }

    $('#foglietto').html(ht);

    //
    // Inizializzzazione language panel
    //
    $('#lang-it-0').css('display', 'none');
    $('#lang-de-0').css('display', 'none');
    $('#lang-en-0').css('display', 'none');        
    $('#lang-fr-0').css('display', 'none');

    for (var i = 0; i < list.length; i ++) {    
        var lang = list[i].language.toLowerCase();                                
        try {
            $('#lang-' + lang + '-0').css('display', 'block');                
        }
        catch (e) {}
    }

}


function chlang(lang)
{           
    var i;  

    if (lang == doc.language.toLowerCase()) return;

    $('#caricamento').css('display', 'block');

    for (i = 0; i < list.length; i ++) {
        if (list[i].language.toLowerCase() == lang) {
            doc = list[i];                    
            break;
        }
    }

    reload();                       

    if ($.mobile.activePage.attr('id') == 'page0') {
        $("html, body").animate({ scrollTop: 0 }, 500);     
    }
    else {
        $.mobile.changePage('#page0', 
            { allowSamePageTransition: true, transition: 'slide', reverse: true });                
    }
    
}


function resizePopups()
{
    var offset = 50;

    var w = $(window).width();
    var h = $(window).height();    

    w -= offset; 

    $('#popupDialog').width(w);

    var pw = $('#popupDialog').width();
    var ph = $('#popupDialog').height();

    var l = 0;    
    var t = 0;
    
    $('#popupDialog') //.css('max-width', w + 'px')
        .css('max-height', h + 'px')
        .css('left', l + 'px')
        .css('top', t + 'px');
}


var pageView = '';
var enablePageView = true;

function scrollDetection()
{   
    var $window = $(window);
    var scrollTop = $window.scrollTop();         
    
    if (enablePageView && $.mobile.activePage.attr('id') == 'page0') {        
            
        pageView = '';
        
        var pp = '';

        $('img').each(

            function() {
            {
                if (pageView.length > 0) return;

                var id = $(this).attr('id');
                if (id == null) return;
                if (id.indexOf('page') < 0) return;                    
                if (id.indexOf('file') < 0) return;                         
        
                var y0 = $(this).offset().top;                
                var y1 = $(this).offset().top + $(this).height();

                if (y0 <= scrollTop && y1 > scrollTop) {
                    pp = '#' + id;
                }
                else if (y0 > scrollTop && y1 > scrollTop) {
                    if (y0 - scrollTop >  ($(window).height() / 2)) {
                        pageView = pp;
                    }
                    else {
                        pageView = '#' + id;
                    }
                }
            }
        });
        
        //if (console) console.log('visible ...::: ' + pageView);               
    }    

    setTimeout (scrollDetection, 1000);
}

function printpdf()
{
    $('#navigbar').hide();

    //workaround for Internet Explorer    
    setTimeout(function(){
        window.print(); 
        $('#navigbar').show();       
    }, 800);    

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// funzioni di prova phonegap
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////

function doscan()
{
    // not  initialized cordova.plugins;

    /*
    var msg = '';
    for(var propertyName in cordova) {
       // propertyName is what you want
       // you can get the value like this: myObject[propertyName]
       msg += "- " + propertyName;
       msg += '\n';
    }
    alert(msg);
    */

    try {

        var scanner = cordova.require("com.phonegap.plugins.barcodescanner.BarcodeScanner");
        //var scanner = cordova.require("phonegap-plugin-barcodescanner");

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

                        //
                        //
                        // TODO insert socket webservice here !!! 
                        //
                        //


                        dosearch('A022019032');
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

function dogeo() {

    //  onSuccess Callback
    //  This method accepts a Position object, which contains the
    //  current GPS coordinates
    // 

    // api example no more than 2500 invocation x 24h, 10 x sec
    // https://maps.googleapis.com/maps/api/geocode/json?address=8+via+sanfrancesco+piacenza                        

    navigator.geolocation.getCurrentPosition(
        function(position) {
            alert('Latitude: '          + position.coords.latitude          + '\n' +
                  'Longitude: '         + position.coords.longitude         + '\n' +
                  'Altitude: '          + position.coords.altitude          + '\n' +
                  'Accuracy: '          + position.coords.accuracy          + '\n' +
                  'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
                  'Heading: '           + position.coords.heading           + '\n' +
                  'Speed: '             + position.coords.speed             + '\n' +
                  'Timestamp: '         + position.timestamp                + '\n');
        },
        function (error) {
            alert('code: '    + error.code    + '\n' +
                  'message: ' + error.message + '\n');
        } 
    );

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// funzioni di prova phonegap
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////

//
// Phonegap app module
//

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
