// Copyright 2013 Google Inc. All Rights Reserved.
// You may study, modify, and use this example for any purpose.
// Note that this example is provided "as is", WITHOUT WARRANTY
// of any kind either expressed or implied.

var adsManager;
var adsLoader;
var adDisplayContainer;
var adContainer;
var intervalTimer;
var playButton;
var videoContent;

function init()
{
    if (!areAdsEnabled()) return;

    videoContent = document.getElementById('contentElement');
    adContainer = document.getElementById('adContainer');
    //playButton = document.getElementById('playButton');
    //playButton.addEventListener('click', playAds);

    setUpIMA();
}


function areAdsEnabled() {
    var test = document.createElement('div');
    test.innerHTML = '&nbsp;';
    test.className = 'adsbox';
    document.body.appendChild(test);
    var adsEnabled;
    var isEnabled = function () {
        var enabled = true;
        if (test.offsetHeight === 0) {
            enabled = false;
        }
        test.parentNode.removeChild(test);
        return enabled;
    };
    window.setTimeout(adsEnabled = isEnabled(), 100);
    return adsEnabled;
};


function setUpIMA()
{
    // Create the ad display container.
    createAdDisplayContainer();
    // Create ads loader.
    adsLoader = new google.ima.AdsLoader(adDisplayContainer);
    // Listen and respond to ads loaded and error events.
    adsLoader.addEventListener(
        google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
        onAdsManagerLoaded,
        false);
    adsLoader.addEventListener(
        google.ima.AdErrorEvent.Type.AD_ERROR,
        onAdError,
        false);

    // Request video ads.
    var adsRequest = new google.ima.AdsRequest();
    adsRequest.adTagUrl = 'https://googleads.g.doubleclick.net/pagead/ads?client=ca-games-pub-4405534753933673&slotname=6577324225&ad_type=video_image&description_url=http%3A%2F%2Fmycutegames.com%2FGames%2FPrincess%2FCinderellas-Dream-Engagement-play.html&videoad_start_delay=15000';
    
    // Specify the linear and nonlinear slot sizes. This helps the SDK to
    // select the correct creative if multiple are returned.
    adsRequest.linearAdSlotWidth = 640;
    adsRequest.linearAdSlotHeight = 400;

    adsRequest.nonLinearAdSlotWidth = 640;
    adsRequest.nonLinearAdSlotHeight = 150;

    adsLoader.requestAds(adsRequest);
}


function createAdDisplayContainer()
{
    // We assume the adContainer is the DOM id of the element that will house
    // the ads.
    adDisplayContainer = new google.ima.AdDisplayContainer(
        document.getElementById('adContainer'), videoContent);
}

function playAds()
{
    // Request video ads.
    var adsRequest = new google.ima.AdsRequest();
    adsRequest.adTagUrl = 'https://googleads.g.doubleclick.net/pagead/ads?client=ca-games-pub-4405534753933673&slotname=6577324225&ad_type=video_image&description_url=http%3A%2F%2Fmycutegames.com%2FGames%2FPrincess%2FCinderellas-Dream-Engagement-play.html&videoad_start_delay=15000';
    
    // Specify the linear and nonlinear slot sizes. This helps the SDK to
    // select the correct creative if multiple are returned.
    adsRequest.linearAdSlotWidth = 640;
    adsRequest.linearAdSlotHeight = 400;

    adsRequest.nonLinearAdSlotWidth = 640;
    adsRequest.nonLinearAdSlotHeight = 150;

    adsLoader.requestAds(adsRequest);
	
	// Initialize the container. Must be done via a user action on mobile devices.

    adContainer.style.display = 'none';
    videoContent.style.display = 'none';

    videoContent.load();
    adDisplayContainer.initialize();

    try
    {
        var width = window.innerWidth - 5;
        var height = window.innerHeight - 5;

        // Initialize the ads manager. Ad rules playlist will start at this time.
        adsManager.init(width, height, google.ima.ViewMode.NORMAL);
        // Call play to start showing the ad. Single video and overlay ads will
        // start at this time; the call will be ignored for ad rules.
        adsManager.start();
    }
    catch (adError)
    {
        // An error may be thrown if there was a problem with the VAST response.
        videoContent.play();
    }
}

function onAdsManagerLoaded(adsManagerLoadedEvent)
{
    // Get the ads manager.
    var adsRenderingSettings = new google.ima.AdsRenderingSettings();
    adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
    // videoContent should be set to the content video element.
    adsManager = adsManagerLoadedEvent.getAdsManager(
        videoContent, adsRenderingSettings);

    // Add listeners to the required events.
    adsManager.addEventListener(
        google.ima.AdErrorEvent.Type.AD_ERROR,
        onAdError);
    adsManager.addEventListener(
        google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
        onContentPauseRequested);
    adsManager.addEventListener(
        google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
        onContentResumeRequested);
    adsManager.addEventListener(
        google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
        onAdEvent);

    // Listen to any additional events, if necessary.
    adsManager.addEventListener(
        google.ima.AdEvent.Type.LOADED,
        onAdEvent);
    adsManager.addEventListener(
        google.ima.AdEvent.Type.STARTED,
        onAdEvent);
    adsManager.addEventListener(
        google.ima.AdEvent.Type.COMPLETE,
        onAdEvent);
    adsManager.addEventListener(
        google.ima.AdEvent.Type.SKIPPED,
        onAdEvent);
    adsManager.addEventListener(
        google.ima.AdEvent.Type.USER_CLOSE,
        onAdEvent);
}

function onAdEvent(adEvent)
{
    // Retrieve the ad from the event. Some events (e.g. ALL_ADS_COMPLETED)
    // don't have ad object associated.

    var ad = adEvent.getAd();

    console.log(adEvent.type, adEvent);

    switch (adEvent.type)
    {
        case google.ima.AdEvent.Type.LOADED:

        // This is the first event sent for an ad - it is possible to
        // determine whether the ad is a video ad or an overlay.
        if (!ad.isLinear())
        {
            // Position AdDisplayContainer correctly for overlay.
            // Use ad.width and ad.height.
            adContainer.style.display = 'block';
            videoContent.style.display = 'block';

	    if (musicOn)
        {
            music.pause();
        }

            videoContent.play();
        }
        break;

    case google.ima.AdEvent.Type.STARTED:

        // This event indicates the ad has started - the video player
        // can adjust the UI, for example display a pause button and
        // remaining time.
        if (ad.isLinear())
        {
            // For a linear ad, a timer can be started to poll for
            // the remaining time.
            intervalTimer = setInterval(
                function()
                {
                    var remainingTime = adsManager.getRemainingTime();
                },
            300); // every 300ms
        }

        adContainer.style.display = 'block';
        videoContent.style.display = 'block';

        if (musicOn)
        {
            music.pause();
        }

        break;

    case google.ima.AdEvent.Type.COMPLETE:

        // This event indicates the ad has finished - the video player
        // can perform appropriate UI actions, such as removing the timer for
        // remaining time detection.
        if (ad.isLinear())
        {
            clearInterval(intervalTimer);
        }

        adContainer.style.display = 'none';
        videoContent.style.display = 'none';

        if (musicOn)
        {
            music.resume();
        }

        break;

    case google.ima.AdEvent.Type.SKIPPED:

        adContainer.style.display = 'none';
        videoContent.style.display = 'none';

        if (musicOn)
        {
            music.resume();
        }

        console.log('Ad skiped');

        break;

    case google.ima.AdEvent.Type.USER_CLOSE:

        adContainer.style.display = 'none';
        videoContent.style.display = 'none';

        if (musicOn)
        {
            music.resume();
        }

        console.log('Ad closed');

        break;
    }
}

function onAdError(adErrorEvent)
{
    // Handle the error logging.
    console.log(adErrorEvent.getError());
    adsManager.destroy();

    if (musicOn)
    {
        music.resume();
    }

    adContainer.style.display = 'none';
    videoContent.style.display = 'none';
}

function onContentPauseRequested()
{
    videoContent.pause();
    // This function is where you should setup UI for showing ads (e.g.
    // display ad timer countdown, disable seeking etc.)
    // setupUIForAds();

    adContainer.style.display = 'block';
    videoContent.style.display = 'block';

    if (musicOn)
    {
        music.pause();
    }
}

function onContentResumeRequested()
{
    videoContent.play();
    // This function is where you should ensure that your UI is ready
    // to play content. It is the responsibility of the Publisher to
    // implement this function when necessary.
    // setupUIForContent();

    adContainer.style.display = 'none';
    videoContent.style.display = 'none';

    if (musicOn)
    {
        music.resume();
    }
}

// Wire UI element references and UI event listeners.
init();
