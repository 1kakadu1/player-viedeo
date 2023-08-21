declare global {
    interface Document {
        mozCancelFullScreen?: () => Promise<void>;
        msExitFullscreen?: () => Promise<void>;
        webkitExitFullscreen?: () => Promise<void>;
        mozFullScreenElement?: Element;
        msFullscreenElement?: Element;
        webkitFullscreenElement?: Element;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment 
        //pictureInPictureEnabled: any;
    }

    interface HTMLDivElement {
        mozRequestFullScreen(): Promise<void>;
        webkitRequestFullscreen(): Promise<void>;
        mozRequestFullScreen(): Promise<void>;
        msRequestFullscreen(): Promise<void>;
    }
}

export interface IElementsReturn {
    remove: () => void;
    class?: string;
    ui?: string[];
    dom_elements: { [key: string]: HTMLElement }
}

export interface IUi {
    [key: string]: HTMLElement | null;
}

export interface IVideoPlayerElementsCreate {
    [key: string]: IElementsReturn;
}

export interface IVideoPlayerUI {
    unMount: () => void;
    controls: (container: HTMLDivElement | null, events: IEventsUI) => IElementsReturn;
    createUI: (events: IEventsUI) => IVideoPlayerElementsCreate;
    overlayPlay: (events: IEventsUI) => IElementsReturn;
    storeTimeBtn: (events: IEventsUI) => IElementsReturn;
}

export interface IFactoryEvent {
    [key: string]: (event: MouseEvent, el: HTMLElement) => void;
}

export interface IFade {
    el: HTMLElement;
    display?: string;
    time?: number;
    callback?: () => void;
}

export interface IVolumeClasses {
    btn: string;
    volume: string;
    range: string;
}
export interface IVideoPlayerUIParam {
    volumeValue: number;
    icons: string;
    subtitles?: NodeListOf<HTMLTrackElement> | null;
    subtitlesInit?: boolean | undefined;
    timeTrackOffset?: number | undefined;
    timeStore: number;
}

export interface IBrowser {
    browser: string;
    class: string;
}

export interface IPlayerStoreTime {
    name: string;
    time: number;
}
export interface IVideoPlayer {
    videoContainer: string;
    iconsFolder: string;
    subtitle?: boolean;
    volumeValue?: number;
    timeTrackOffset?: number;
    videoPlayerUI?: (videoContainer: HTMLDivElement | null, param: IVideoPlayerUIParam) => IVideoPlayerUI;
    storeTimeOffset?: number;
}


export interface IEventsUI {
    [key: string]: (e: unknown) => void
}