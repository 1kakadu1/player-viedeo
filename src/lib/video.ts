import { FadeTime, IVideoPlayerDefaultConst, PlayerKey, UiClasses } from "../models/enum";
import { IBrowser, IPlayerStoreTime, IUi, IVideoPlayer, IVideoPlayerElementsCreate, IVideoPlayerUI, IVideoPlayerUIParam } from "../models/video";
import { IVideoUtils } from "../models/video-utils";
import { VideoUtils } from "./utils";
import { VideoPlayerUI } from "./video-ui";

export class VideoPlayer {
	private video: HTMLVideoElement | null;
	private videoContainer: HTMLDivElement | null;
	private controlsUI!: IUi;
	private isPlay: boolean = false;
	private isFullScreen: boolean = false;
	private isVolume: boolean = false;
	private navigator = window.navigator;
	private volumeValue: number;
	private iconsFolder: string;
	private subtitles: NodeListOf<HTMLTrackElement> | null;
	private subtitlesIndex: number = -1;
	private isSubtitles: boolean = false;
	private isTrack: boolean = false;
	private ui?: IVideoPlayerUI;
	private timeTrackOffset: number;
	private isMouseHover: boolean = false;
	private destroyObject: { [key: string]: () => void } = {};
	private tapedTwice = false;
	private browser: IBrowser = { browser: "", class: "" }
	private name?: string | undefined;
	private timeStore: number = 0;
	private timeStoreOffset: number;
	private mX: number = 0;
	private mY: number = 0;
	private utils: IVideoUtils;
	private dom_elements: IVideoPlayerElementsCreate = {};


	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	constructor({ videoContainer, iconsFolder, volumeValue, subtitle, timeTrackOffset: timeTrackOffset, videoPlayerUI, storeTimeOffset }: IVideoPlayer) {
		this.videoContainer = document.querySelector(videoContainer);
		this.video = this.videoContainer?.querySelector('video') || null;
		this.volumeValue = volumeValue || IVideoPlayerDefaultConst.volume;
		this.iconsFolder = iconsFolder;
		this.timeTrackOffset = timeTrackOffset || IVideoPlayerDefaultConst.timeTrackOffset;
		this.subtitles = this.video?.querySelectorAll('track') || null;
		this.name = this.video?.dataset.name || this.videoContainer?.dataset.name;
		this.timeStoreOffset = storeTimeOffset || 4;
		this.utils = new VideoUtils();

		if (!this.checkError() && this.videoContainer) {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const container = this.videoContainer;
			this.timeStore = this.getStoreTime().time;
			this.video?.classList.add(UiClasses.video);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const uiParam: IVideoPlayerUIParam = {
				volumeValue: this.volumeValue,
				icons: this.iconsFolder,
				subtitles: this.subtitles,
				subtitlesInit: subtitle,
				timeTrackOffset: this.timeTrackOffset,
				timeStore: this.timeStore
			}
			this._events = this._events.bind(this);
			this.ui = videoPlayerUI ? videoPlayerUI(container, uiParam) : new VideoPlayerUI(container, uiParam);
			this.browser = this.utils.userAgent();
			container.classList.add(this.browser.class);
			this.dom_elements = this.ui.createUI({ ...this._events() });

			if (this.video && this.video.textTracks) {
				for (let i = 0; i < this.video.textTracks.length; i++) {
					this.video.textTracks[i].mode = "hidden";
				}
			}

		}


		// this._onChangePip = this._onChangePip.bind(this);
		// this._onChangeFullScreen = this._onChangeFullScreen.bind(this);
		this._onChangeProgressVideo = this._onChangeProgressVideo.bind(this);
		// this._onChangeVolume = this._onChangeVolume.bind(this);
		// this._onEventKeywords = this._onEventKeywords.bind(this);
		// this._onMouse = this._onMouse.bind(this);
		// this._onTouch = this._onTouch.bind(this);
	}

	get videoElement() {
		return this.video;
	}

	get controls() {
		return this.dom_elements['controls'].dom_elements['controls'];
	}

	get isVideoPlay() {
		return this.isPlay;
	}

	get btnPause() {
		return this.dom_elements['controls'].dom_elements['button_pause'];
	}

	get btnPlay() {
		return this.dom_elements['controls'].dom_elements['button_play'];
	}

	get overlay() {
		return this.dom_elements['overlay'].dom_elements as { overlay_btn_play: HTMLDivElement, overlay_node: HTMLDialogElement };
	}

	private removeStoreTime = () => {
		localStorage.removeItem(PlayerKey.storeInfo);
		localStorage.removeItem(PlayerKey.storeInfoPrev);
		this.timeStore = 0;
	}


	private getStoreTime = (): IPlayerStoreTime => {
		const store = localStorage.getItem(PlayerKey.storeInfo);

		if (store) {
			const parse = JSON.parse(store);

			if (this.name === parse.name) {
				return parse;
			}
		}

		return {
			name: this.name || "",
			time: 0
		}
	}

	checkError = (): boolean => {
		if (!this.video) {
			console.error('video selector not found', this.video);
			return true;
		}

		if (!this.videoContainer) {
			console.error('video container selector not found', this.videoContainer);
			return true;
		}

		if (!this.iconsFolder) {
			console.error('not found url to icon field', this.iconsFolder);
			return true;
		}

		if (!this.name) {
			console.error('not found data-name to container', this.name);
			return true;
		}

		return false;
	};


	private _events() {
		const overlay_btn_play = () => {
			this.utils.eventStoreDispatch();
			this.video?.play();
			this.setStoreTime(this.video?.currentTime || 0);
		}

		const play = () => {
			this.play();
		}

		const pause = () => {
			this.pause();
		}

		const store_time_btn = () => {
			this.playTo(this.timeStore);
		}

		return {
			overlay_btn_play,
			button_play: play,
			button_pause: pause,
			store_time_btn
		}

	}

	play = () => {
		this.isPlay = true;
		this.utils.fadeOutIN(this.btnPause, this.btnPlay, FadeTime.controls);
		this.video?.play();
		this.setStoreTime(this.video?.currentTime || 0);
	}

	playTo = (time: number) => {
		if (this.video) {
			this.isPlay = true;
			this.video.currentTime = time;
			this.utils.fadeOutIN(this.btnPause, this.btnPlay, FadeTime.controls);
			this.utils.fadeOut({
				el: this.dom_elements['controls'].dom_elements['store_time_node'],
				time: FadeTime.controls
			})
			this.video.play();
			if (time !== this.timeStore)
				this.setStoreTime(time);
		}

	}

	pause = () => {
		this.isPlay = false;
		this.video?.pause();
		this.setStoreTime(this.video?.currentTime || 0);
	}

	stop = () => {
		this.isPlay = false;
		if (this.video) {
			this.video.pause();
			this.video.currentTime = 0;
			this.removeStoreTime();
		}
	}

	playerInit = (callback?: (params?: unknown) => void) => {
		if (!this.checkError() && this.video) {
			console.log(this.dom_elements);
			this.destroyObject['overlay'] = this.dom_elements['overlay']['remove'];
			this.destroyObject['_onChangeProgressVideo'] = this._onChangeProgressVideo();
			console.log(this.dom_elements);
			//this.destroyObject['_onClickControls'] = this._onClickControls();
			// this.unMountObject['_onChangePip'] = this._onChangePip();
			// this.unMountObject['_onChangeFullScreen'] = this._onChangeFullScreen();
			// this.unMountObject['_onChangeVolume'] = this._onChangeVolume();
			// this.unMountObject['_onEventKeywords'] = this._onEventKeywords();
			// this.unMountObject['_onMouse'] = this._onMouse();
			// this.unMountObject['_onTouch'] = this._onTouch();

			this.video.volume = this.volumeValue / 100;

			if (callback) {
				callback();
			}
		}
	}

	onDestroy = (callback?: (params?: unknown) => void): void => {
		for (const key in this.destroyObject) {
			this.destroyObject[key]();
		}

		if (callback) {
			callback();
		}
	};

	private _onChangeProgressVideo() {
		const video = this.video as HTMLVideoElement;

		const videoEnd = () => {
			this.isPlay = false;
			video.pause();
			video.currentTime = 0;
			this.removeStoreTime();
			this.utils.fadeOutIN(this.overlay.overlay_node, this.controls, 40, {
				callback: () => {
					this.utils.fadeOutIN(this.btnPlay, this.btnPause, 0);
				},
				display: 'flex',
			});
		};

		const videoStart = () => {
			this.isPlay = true;
			this.utils.fadeOutIN(this.btnPause, this.btnPlay, FadeTime.controls, this.controlsUI);
			this.utils.fadeOut({
				el: this.dom_elements["timeStore"].dom_elements["store_time_node"],
				time: FadeTime.controls
			});
			if (!this.isTrack) {
				this.utils.fadeOutIN(this.controls, this.overlay.overlay_node, 40, { display: 'flex' })
			}
			this.isTrack = false;
		};

		const timeupdate = () => {
			const duration = video.duration;
			if (duration > 0) {
				const progressUI = this.dom_elements['controls'].dom_elements['track_progress_amount'];
				const timeUI = this.dom_elements['controls'].dom_elements['track_time'];
				if (progressUI) progressUI.style.width = (video.currentTime / duration) * 100 + '%';
				if (timeUI) timeUI.innerText = this.utils.secondsToHms(video.currentTime).time;
				if (video.currentTime > this.timeStore + this.timeStoreOffset) this.setStoreTime(video.currentTime)
			}
		};

		const progress = () => {
			const duration = video.duration;
			if (duration > 0) {
				for (let i = 0; i < video.buffered.length; i++) {
					if (video.buffered.start(video.buffered.length - 1 - i) < video.currentTime) {
						const bufferUI = this.dom_elements['controls'].dom_elements['track_buffered_amount'];
						if (bufferUI) bufferUI.style.width = (video.buffered.end(video.buffered.length - 1 - i) / duration) * 100 + '%';
						break;
					}
				}
			}
		};

		const loadedmetadata = () => {
			const timeFullUI = this.dom_elements['controls'].dom_elements['track_time_full'];
			if (timeFullUI) timeFullUI.innerText = this.utils.secondsToHms(video.duration).time;
		};

		const videoPause = () => {
			if (!this.isTrack) {
				this.utils.fadeOutIN(this.overlay.overlay_node, this.controls, 40, {
					callback: () => {
						this.utils.fadeOutIN(this.btnPlay, this.btnPause, 0, this.controlsUI);
					},
					display: 'flex',
				});
			}
		};

		if (this.video) {
			video.addEventListener('progress', progress, false);
			video.addEventListener('timeupdate', timeupdate, false);
			video.addEventListener('ended', videoEnd, false);
			video.addEventListener('play', videoStart, false);
			video.addEventListener('pause', videoPause, false);
			video.addEventListener('loadedmetadata', loadedmetadata, false);
		}

		return () => {
			video.removeEventListener('ended', videoEnd, false);
			video.removeEventListener('progress', progress, false);
			video.removeEventListener('timeupdate', timeupdate, false);
			video.removeEventListener('play', videoStart, false);
			video.removeEventListener('pause', videoPause, false);
			video.addEventListener('loadedmetadata', loadedmetadata, false);
		};
	}

	private setStoreTime = (time: number) => {
		this.timeStore = time;
		localStorage.setItem(PlayerKey.storeInfoPrev, localStorage.getItem(PlayerKey.storeInfo) || "not found");
		localStorage.setItem(PlayerKey.storeInfo, JSON.stringify({ name: this.name, time }));
	}

}