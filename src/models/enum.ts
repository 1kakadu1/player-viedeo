export enum IVideoPlayerDefaultConst {
    volume = 100,
    timeTrackOffset = 3,
}
export enum Browser {
    moz = 'Mozilla Firefox',
    opera = 'Opera',
    ie = 'Microsoft Internet Explorer',
    edge = 'Microsoft Edge',
    google = 'Google Chrome or Chromium',
    safari = 'Apple Safari',
    unknown = 'unknown',
}
export enum PlayerKey {
    storeInfo = 'player-info',
    dataset = 'name',
    storeInfoPrev = 'player-info-prev',
}

export enum UiClasses {
    play = 'videoPlay',
    stop = 'videoStop',
    pause = 'videoPause',
    start = 'videoStart',
    fullscreen = 'videoFullscreen',
    fullscreenCancel = 'videoFullscreenCancel',
    buffer = 'playerBufferedAmount',
    progress = 'playerProgressAmount',
    track = 'playerTrack',
    volume = 'videoVolume',
    rangeVolume = 'videoVolumeRange',
    labelValue = 'player-volume-label',
    volumeProgressContainer = 'playerVolumeContainer',
    videoPlayerControls = 'videoPlayerControls',
    videoContainerOverlay = 'overlayVideoContainer',
    videoOverlayBtn = 'overlayVideoBtn',
    trackTime = 'palyertrackTime',
    trackTimeFull = 'palyertrackTimeFull',
    subtitleBtn = 'playerSubtitleBtn',
    subtitleItem = 'playerSubtitleItem',
    subtitleList = 'palyersubtitleList',
    video = 'playerVideo',
    doubleTap = 'doubleTap',
    doubleTapLeft = 'doubleTapLeft',
    doubleTapRight = 'doubleTapRight',
    playToTime = 'playToTimeBtn',
    playToTimeContainer = 'playToTimeContainer',
}

export enum FadeTime {
    fullscreen = 30,
    controls = 25,
    volume = 20,
    subtitle = 60,
}
