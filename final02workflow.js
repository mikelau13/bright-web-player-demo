var myPlayer;
// works: tribute, edmovieguide, winnipegmovies, frontrowcenter
// doesn't work: showtimes, enprimeur, tributemovies
var serverSite = 'tribute';
var serverUrl = 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x360&iu=/26924457/' + serverSite + '&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&url=[referrer_url]&description_url=[description_url]&correlator=[timestamp];alias=showtimes_player;size=480x360;key=action/adventure;kvmovieid=137928;kvmovietitle=sonic-the-hedgehog;kvclipid=25671;kvcliptitle=sonic-the-hedgehog-trailer-2;kvmature=0;kvlength=long;misc=1583163897301;aduho=-300';
$('span#lblSite').text(serverSite);
/*
  The bc player has to be initialized and then the Ad url is passed using the ima3 method. This is still for the VOD asset. 
  See: https://support.brightcove.com/advertising-ima3-plugin#Implement_using_code
*/
var player = bc('vjs_video_3');
player.ima3({
  serverUrl: serverUrl
});

player.ready(function() {
  
  myPlayer = this;
  /* We force autoplay and then we listen for player events */
  myPlayer.play();

  /* Listen for ads-ad-started, we really do anything when this is triggered */
  myPlayer.on('ads-ad-started',function( evt ){
    console.log('ads-ad-started event passed to event handler', evt); 
  });

  /*
    Listens for ads-ad-ended event. This means all the ads were displayed. 
    We pause the player, then we dispose the player and then we add the new player for live
    calling the addPlayer Method. 
  */
   myPlayer.on('ads-ad-ended',function( evt ){    
    console.log('ads-ad-ended event passed to event handler', evt);    
    myPlayer.pause();
    myPlayer.dispose();
    addPlayer();
  });
   /*
    Listens for progress events. This means the "dummy" VOD will start playing. As we don't really want this to occour, we: 
    pause the player, then we dispose the player and then we add the new player for live
    calling the addPlayer Method. 
  */
   myPlayer.on('progress',function( evt ){    
    console.log('progress event passed to event handler', evt);    
    myPlayer.pause();
    myPlayer.dispose();
    addPlayer();
  });

    /*
    Listens for ima3-ad-error. If the IMA CSAI plugin fails, we: 
    pause the player, then we dispose the player and then we add the new player for live
    calling the addPlayer Method. 
  */

   myPlayer.on('ima3-ad-error',function( evt ){    
    console.log('ima3-ad-error  event passed to event handler', evt);    
    myPlayer.pause();
    myPlayer.dispose();
    addPlayer();
  });

});

/*set a couple of variables, 
  1) playerHTML will include the player embedcode
  2) playerData will include specific information about the live embed:
    a) accountId - The account where the live job lives in 
    b) playerId - a Player that has SSAI enabled on VideoCloud
    c) videoId - The video id for the live event 
    d) dataAdConfig - This is a token that is created on your side and is specific for the live job id and the ad configuration
      - Here some documentation the ad configuration: https://support.brightcove.com/live-api-server-side-ad-insertion-ssai
      - The ad configuration has to have the following information, which is not publicly documented: 
        "ad_configuration_client_sdk_enabled": true,
            "client_options": {
                "client_only_tracking": false,
                "show_ad_remaining_time": true,
                "show_ad_break_remaining_time": true,
                "show_number_of_remaining_ads": true
            }
      - For the token creation, you need to execute the following API call: 
      https://docs.brightcove.com/live-api/v1/doc/index.html#operation/CreatePlaybackToken

*/
var playerHTML,
  // +++ Set the data for the player +++
  playerData = {
    accountId: "6057949425001",
    playerId: "OKoBlfau",
    videoId: "1650009287581049525",
    dataAdConfig:"live.SUS9OaAR2dZ-cVrAhHQydXUdb2JduFslyAAMeHeHNUZiagcDxQq5vnSgGJv5Lz5JGzVs1qp9LZvlcGexEUGdNK16tExjS31xwpkc" 
  };

// +++ Build the player and place in HTML DOM +++
function addPlayer() {
  // Dynamically build the player video element
  playerHTML =
    '<video-js id="myPlayerIDLive" data-video-id="' +
    playerData.videoId +
    '"  data-account="' +
    playerData.accountId +
    '" autoplay= true"' +
    '"  data-ad-config-id="' +
    // playerData.dataAdConfig +
    // '" data-player="' +
    playerData.playerId +
    '" data-embed="default" class="video-js" controls></video-js>';
  // Inject the player code into the DOM
  document.getElementById("placeHolder").innerHTML = playerHTML;
  // Add and execute the player script tag
  var s = document.createElement("script");
  s.src =
    "https://players.brightcove.net/" +
    playerData.accountId +
    "/" +
    playerData.playerId +
    "_default/index.min.js";
  // Add the script tag to the document
  document.body.appendChild(s);

  var scriptLive = document.createElement("script");

  /*
    You also need to pass the player the playlist_ssaiM.m3u8, you can build this url 
    replacing 61f4343d2b754ed393c61bfa12036bea with the live job id and 5a8af19dbb4a4b399699ddd048f3f7b1
    with the ad configuration id you want to use. It has to be consistent with the id the playback token was build. 
  */
  scriptLive.textContent = "videojs.getPlayer('myPlayerIDLive').ready(function() {" +
           " var myPlayerLive = this;" +
           " myPlayerLive.src({" +
           "    type: 'application/x-mpegURL',"+
           "    src: 'https://bcovlive-a.akamaihd.net/273d52b159174b968711acc365ece58b/us-west-2/6057949425001/5a8af19dbb4a4b399699ddd048f3f7b1/playlist_ssaiM.m3u8'"+
           "  }); "+
           " });";
           

  document.body.appendChild(scriptLive);

  
}

// +++ Initialize the player and start the video +++
function callback() {

  videojs.getPlayer('myPlayerIDLive').on('loadedmetadata',function(){
  
      var myPlayerLive = this;

      //console.log("hello");
      myPlayerLive.play();
  });
}