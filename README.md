## Clone starter

To get started, you should run command:

```shell script
git clone #
```
[Demo](#)

## Install dependencies

After clone project, you should install dependencies:

```shell script
yarn install
```

## Development

For development, you can use the command that runs webpack dev server:

```shell script
yarn run serve
```

## Build 

For build your application, run command:

```shell script
yarn run build
```
## Include
Connect the script and styles. Prepare images for the control panel (you can take them from public)

Initializing vanilla js (browser):
```
<script src="./video_mini.js"></script>
<script>
    const { VideoPlayer } = window['video_mini'];
    const video = new VideoPlayer({
    videoContainer: '.player-container',
    iconsFolder: './assets/images/icons',
    volumeValue: 50,
    subtitle: true,
    timeTrackOffset: 2,
    videoPlayerUI: function(videoContainer, param){
        return new MyPlayerUI(videoContainer,{...param})
    }
    });

    video.playerInit();
</script>
```
Initializing multiple videos:
```
import {  VideoPlayer, VideoUtils} from './video_mini';

const videoStack = {};
const videoList = document.querySelectorAll(".video-list .player-container");
const utils = new VideoUtils();

videoList.forEach((item)=>{

  const videoSubtitles = item.querySelectorAll("video track"); 
  const videoPlayer = new VideoPlayer({
    videoContainer: `.${item.dataset.name}`,
    iconsFolder: './assets/images/icons',
    volumeValue: 1,
    subtitle: !!videoSubtitles.length,
    timeTrackOffset: 2
  });

  videoPlayer.playerInit();
  videoStack[(item as HTMLDivElement).dataset.name || "unknown"]= videoPlayer;

});
// Pause a video if another video is running
utils.eventChangeStor(function(e){
  const info = localStorage.getItem(utils.storeKey);
  if(info && e.detail !== info){
    const data = JSON.parse(info)
    videoStack[data.name].pause();
  }
})
```
The video wrappers must contain the date attribute:
```
<div class="video-player-wrap player-container" data-name="video-name">
```
To enable subtitles, you need to specify them in the track tag
```
    <video
        .....
        <track kind="subtitles" src="/public/text/v1.en.vtt" srclang="en" lang="en" label="English">
    </video>
```

Information about the current video is located in localstorage by the key: <b>player-info</b>
### Constructor (VideoPlayer class):
| Params          | Description                                                               |
| --------------- | ------------------------------------------------------------------------- |
| videoContainer  | The class of the container where the video is placed                      |
| iconsFolder     | Link to icons for the ui                                                  |
| volumeValue     | Initial volume value (default: 0)                                         |
| subtitle        | Whether to include subtitles (default: false)                             |
| timeTrackOffset | Fast forward and rewind for n seconds (default: 3)                        |
| videoPlayerUI   | creating a custom ui instead of the standard one (doesn't work correctly  |
| storeTimeOffset | Refresh interval for starting the video from a certain point (default: 4) |

### Public functions (VideoPlayer class):

| Function          | Description                             |
| ----------------- | --------------------------------------- |
| playerInit        | init player and create UI               |
| play              | play video                              |
| playTo            | play video to time                      |
| stop              | stop video                              |
| pause             | pause video                             |
| onDestroy         | remove events and UI                    |
| controls          | get controls element                    |
| controls_elements | get all UI elements                     |
| isVideoPlay       | check is play video (return true/false) |
| videoElement      | get video element                       |
| overlay           | get overlay element                     |
| btnPause/ btnPlay | get button elements                     |

### Utils functions (VideoUtils class):

| Function           | Description                                                               |
| ------------------ | ------------------------------------------------------------------------- |
| fadeOutIn          | hide old element and show new                                             |
| userAgent          | get browser name                                                          |
| fadeIn             | show element ({ el, display = 'block', time = 10, callback = undefined }) |
| fadeOut            | hide element ({ el, time = 10, callback = undefined })                    |
| secondsToHms       | convert time                                                              |
| eventStoreDispatch | dispatch event change to store                                            |
| eventChangeStor    | create event listener                                                     |
| eventRemoveStore   | remove event listener                                                     |
| storeKey           | return key localstore                                                     |


## UI classes
There is a Ui Classes, which stores the basic names of style classes

## Problems

Doesn't always stop when using picture-in-picture in Firefox. The position of the subtitles on Firefox is displayed incorrectly.