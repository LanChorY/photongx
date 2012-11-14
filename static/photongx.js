// proper column size
$('.item').css('max-width', ($(document).width()/3)-8 + 'px');
$('.item img').css('width', ($(document).width()/3)-8 + 'px');

var $container = $('.items');
$(window).smartresize(function(){
    $('.item').css('max-width', ($(document).width()/3)-8 + 'px');
    $('.item img').css('width', ($(document).width()/3)-8 + 'px');
    $container.isotope({
        resizable: false, // disable normal resizing
        animationEngine: 'css' // Must use css, or no animation at all

    });
});


var currentimage = 0;

$.fn.preload = function() {
    this.each(function(){
        // Check if url starts with /
        if (this[0] == '/') {
            //console.log(String(this));
            $('<img>')[0].src = this;
        }
    });
}

$(function(){
    
    $container.imagesLoaded(function( $images, $proper, $broken ) {
        $container.isotope({
            resizable: false, // disable normal resizing
            animationEngine: 'css' // Must use css, or no animation at all

        });
    });
    
    $('.lb').click(function(e) {
        // Show spinner
        $('#spinner').removeClass('hidden');
        
        //prevent default action (hyperlink)
        e.preventDefault();
        
        //Get clicked link href
        var image_href = $(this).attr("href");

        // Save the current image
        currentimage = parseInt($(this).attr('id').split('-')[1]);
        
        
        /*  
        If the lightbox window HTML already exists in document, 
        change the img src to to match the href of whatever link was clicked
        
        If the lightbox window HTML doesn't exists, create it and insert it.
        (This will only happen the first time around)
        */
        
        if ($('#lightbox').length > 0) { // #lightbox exists

            setLBimage(image_href);
            

        } else { //#lightbox does not exist - create and insert (runs 1st time only)
            
            //create HTML markup for lightbox window
            var lightbox = 
            '<div id="lightbox" class="hidden">' +
                '<p>' +
                '<a id="play" href="#"><i class="icon-play"></i></a>' +
                '<a id="goFS" href="#"><i class="icon-fullscreen"></i></a>' +
                '<a id="hideLB" href="#"><i class="icon-remove"></i></a></p>' +
                '<a href="#prev" id="prev"><div><i class="icon-chevron-left"></i></div></a>' +
                    '<div id="content">' + //insert clicked link's href into img src
                        '<img src="' + image_href +'" />' +
                    '</div>' +  
                '<a href="#next" id="next"><div><i class="icon-chevron-right"></i></div></a>' +
            '</div>';
                
            //insert lightbox HTML into page
            $('body').append(lightbox);
            // Run the set here to, to trigger click
            setLBimage(image_href);
        }


        // Handle clicks on the next link
        $('#next').bind('click', function(e) {
            navigateImage(currentimage + 1);
            return false;
        });
        // Handle clicks on the prev link
        $('#prev').bind('click', function(e) {
            navigateImage(currentimage - 1);
            return false;
        });

        // Handle clicks on the fs link
        $('#goFS').bind('click', function(e) {
            goFS();
            return false;
        });

        // Handle clicks on the play link
        $('#play').bind('click', function(e) {
            if($('#play i').hasClass('icon-play')) {
                $('#play i').removeClass('icon-play').addClass('icon-pause');
                play();
            }else {
                $('#play i').removeClass('icon-pause').addClass('icon-play');
                pause();
            }
            return false;
        });

        // Handle all clicks in lb-mode
        $('#lightbox').bind('click', function(e) {
            var target = $(e.target);
            var id = target.attr('id');
            if ('id' == 'goFS') {
                goFS();
            }
            hideLB();
            return false;
        });

        showLB();

    });
    var setLBimage = function(image_href) {
        //place href as img src value
        $('#content').html('<img src="' + image_href + '" />');
        // Count the viewing
        $.getJSON('/photongx/api/img/click/', { 'img':image_href}, function(data) {
            //console.log(data);
        });
        // FIXME scrollto
    };
    var showLB = function() {
        $('#content').imagesLoaded(function( $images, $proper, $broken ) {
            // effects for background
            $('.items').addClass('backgrounded');
            //show lightbox window - you could use .show('fast') for a transition
            $('#lightbox').removeClass('hidden').show();
            // We are loaded, so hide the spinner
            $('.spinner').addClass('hidden');
        });
    };
        
    var hideLB = function() {
        // effects for background
        $('.items').removeClass('backgrounded');
        //$('#lightbox').hide();
        $('#lightbox').hide();
    };
    
    //Click anywhere on the page to get rid of lightbox window
   // $('#lightbox').live('click', hideLB);  //must use live, as the lightbox element is inserted into the DOM
    //
    
    var goFS = function() {
        console.log('Going Fullscreen');
        var elem = document.getElementById('lightbox');

        if (elem.requestFullScreen) {
            elem.requestFullScreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullScreen) {
            elem.webkitRequestFullScreen();
        }
    }
    
    var slideshowtimer;

    // Slideshow
    var play = function() {
        var interval = 3000;
        slideshowtimer = setInterval(function(){ $('#next').click(); }, interval);
    }
    // Slideshow
    var pause = function() {
        window.clearInterval(slideshowtimer);
    }

    // Function responsible for swapping the current lightbox image
    // it wraps on start and end, and preloads 3 images in the current 
    // scrolling direction
    var navigateImage = function(c) {
      console.log('C', c);
          // we are at the start, figure out the amount of items and
          // go to the end
          c = $('.item').length-1;
      }else if (c >= ($('.item').length -1)) {
          c = 1; // Lua starts at 1 :)
       }
      var image_href = $('#image-'+c).attr('href');
      setLBimage(image_href);
      var cone = c+1, ctwo = c+2 , cthree = c+3;
      // We are going backwards
      if (c - currentimage) {
          cone = c-1, ctwo = c-2, cthree = c-3;
      }
      $([
          $('#image-'+String(parseInt(cone))).attr('href'),
          $('#image-'+String(parseInt(ctwo))).attr('href'),
          $('#image-'+String(parseInt(cthree))).attr('href')
      ]).preload();

      currentimage = c;
    }



    $(document).keydown(function(e){
      if (e.keyCode == 27) { 
          hideLB();
          return false;
      }
      else if (e.keyCode == 37 || e.keyCode == 39) {
          var c;
          if (e.keyCode == 37) {
              c = currentimage - 1;
          }
          else if (e.keyCode == 39) {
              c = currentimage + 1;
          }
          navigateImage(c);
          return false;
      }
      else if (e.keyCode == 70) {
          goFS();
      }
    });

});
