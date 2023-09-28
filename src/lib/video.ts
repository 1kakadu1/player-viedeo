
import { Browser, FadeTime, IVideoPlayerDefaultConst, PlayerKey, UiClasses } from "../models/enum";
import { IBrowser, IPlayerStoreTime, IUi, IVideoPlayer, IVideoPlayerElementsCreate, IVideoPlayerUI, IVideoPlayerUIParam } from "../models/video";
import { IVideoUtils } from "../models/video-utils";
import VideoUtils from "./utils";
import VideoPlayerUI from "./video-ui";

class VideoPlayer {
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
	private isSubtitles: boolean = false;
	private isSpeed: boolean = false;
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
	private activeLang: string | 'off' = "off";
	private activeSpeed: number = 1;

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
			const container = this.videoContainer;
			this.timeStore = this.getStoreTime().time;
			this.video?.classList.add(UiClasses.video);

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
			
			if (this.video && this.video.textTracks && this.subtitles && this.subtitles.length > 0) {
				//this.video.playbackRate = 1;
				for (let i = 0; i < this.video.textTracks.length; i++) {
					this.video.textTracks[i].mode = "hidden";
				}
				this.activeLang = this.subtitles[this.subtitles?.length - 1].dataset.lang || "off";
			}

		}


		this._onChangePip = this._onChangePip.bind(this);
		this._onChangeFullScreen = this._onChangeFullScreen.bind(this);
		this._onChangeProgressVideo = this._onChangeProgressVideo.bind(this);
		this._onEventKeywords = this._onEventKeywords.bind(this);
		this._onMouse = this._onMouse.bind(this);
	}

	get videoElement() {
		return this.video;
	}

	get controls_elements() {
		return this.dom_elements['controls'].dom_elements;
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

		const volume_toggle = () => {
			this.isVolume = !this.isVolume;
			const volume = this.controls_elements['volume_range_node'];

			if (this.isVolume) {
				volume &&
					this.utils.fadeIn({
						el: volume,
						display: 'flex',
						time: FadeTime.volume,
					});
			} else {
				volume &&
					this.utils.fadeOut({
						el: volume,
						time: FadeTime.volume,
					});
			}
		}

		const volume = (e: unknown) => {
			if (e instanceof Event) {
				const label = this.controls_elements['volume_range_label'];
				const target = e.target as HTMLInputElement;
				const video = this.video;

				label.textContent = target.value + '%';
				if (video) video.volume = parseInt(target.value) / 100;
			}

		};

		const fullscreen_on = () => {
			if (this.video && this.videoContainer) {
				this.isFullScreen = true;
				const video = this.videoContainer;

				if (video.requestFullscreen) {
					video.requestFullscreen();
				} else if (video.webkitRequestFullscreen) {
					video.webkitRequestFullscreen();
				} else if (video.msRequestFullscreen) {
					video.msRequestFullscreen();
				}
				this.utils.fadeOutIN(this.controls_elements['fullscreen_off'], this.controls_elements['fullscreen_on'], FadeTime.fullscreen, this.controlsUI);
			}
		}
		const fullscreen_off
			= () => {
				if (this.video && this.videoContainer) {
					this.isFullScreen = false;
					if (document.exitFullscreen) {
						document.exitFullscreen();
					} else if (document.webkitExitFullscreen) {
						document.webkitExitFullscreen();
					} else if (document.mozCancelFullScreen) {
						document.mozCancelFullScreen();
					} else if (document.msExitFullscreen) {
						document.msExitFullscreen();
					}
					this.utils.fadeOutIN(this.controls_elements['fullscreen_on'], this.controls_elements['fullscreen_off'], FadeTime.fullscreen,);
				}
			}

		const track = (event: unknown) => {
			if (event instanceof MouseEvent) {
				const track = this.controls_elements['track_player'];
				const posX = event.offsetX;

				if (this.video) {
					if (!this.isPlay) {
						this.utils.fadeOutIN(this.btnPause, this.btnPlay, FadeTime.controls);
					}
					this.isTrack = true;
					this.video.pause();
					this.video.currentTime = (this.video.duration * posX) / track.offsetWidth;
					this.setStoreTime(this.video.currentTime);
					this.video.play();
				}

			}
		}

		const subtitle_list = (event: unknown) => {
			if (event instanceof MouseEvent) {
				const el = event.target as HTMLElement;
				const lang = el.dataset.lang || 'off';
				if (this.activeLang != lang && this.video && this.subtitles) {
					this.controls_elements['subtitle_list'].querySelector(`div[data-lang='${this.activeLang}']`)?.classList.remove("active")
					el.classList.add('active');
					const key_current = Object.values(this.video.textTracks).findIndex((x) => x.language === this.activeLang);
					if (lang === 'off') {
						this.video.textTracks[key_current].mode = 'disabled';
					} else {
						const key = Object.values(this.video.textTracks).findIndex((x) => x.language === lang);
						if (key_current !== -1) this.video.textTracks[key_current].mode = 'disabled';
						this.video.textTracks[key].mode = 'showing';
					}
					this.activeLang = lang;
					this.isSubtitles = false;
					this.utils.fadeOut({ el: this.controls_elements['subtitle_list'], time: FadeTime.subtitle });
				}
			}
		}
		const subtitle_btn = () => {
			const list = this.controls_elements['subtitle_list'];
			this.isSubtitles = !this.isSubtitles;

			if (this.isSubtitles) {
				this.utils.fadeIn({ el: list, time: FadeTime.subtitle });
			} else {
				this.utils.fadeOut({ el: list, time: FadeTime.subtitle });
			}
		}


		const speed_list = (event: unknown) => {
			if (event instanceof MouseEvent) {
				const el = event.target as HTMLElement;
				const speed = el.dataset.speed || '1';
				
				if (this.activeSpeed != Number(speed) && this.video ) {
					this.controls_elements['speed_list'].querySelector(`div[data-speed='${this.activeSpeed}']`)?.classList.remove("active")
					el.classList.add('active');
					this.activeSpeed = Number(speed);
					this.isSpeed = false;
					this.video.playbackRate = this.activeSpeed;
					this.utils.fadeOut({ el: this.controls_elements['speed_list'], time: FadeTime.subtitle });
				}
			}
		}

		const speed_btn = () => {
			const list = this.controls_elements['speed_list'];
			this.isSpeed = !this.isSpeed;

			if (this.isSpeed) {
				this.utils.fadeIn({ el: list, time: FadeTime.subtitle });
			} else {
				this.utils.fadeOut({ el: list, time: FadeTime.subtitle });
			}
		}

		const tap_handler = (event: unknown) => {
			if (event instanceof TouchEvent) {
				const target = event.target as HTMLElement;
				const tap: string | undefined = target.dataset.tap;
				if (tap) {
					if (!this.tapedTwice) {
						this.tapedTwice = true;
						setTimeout(() => { this.tapedTwice = false; }, 300);
						return false;
					}
					event.preventDefault();
					target.classList.add("tap-active");

					setTimeout(() => {
						target.classList.remove("tap-active")
					}, 500);



					if (this.video && this.isPlay && tap === "right") {
						this.video.currentTime += this.timeTrackOffset;
					}

					if (this.video && this.isPlay && tap === "left") {
						this.video.currentTime -= this.timeTrackOffset;
					}
				}

			}


		}

		return {
			overlay_btn_play,
			button_play: play,
			button_pause: pause,
			store_time_btn,
			volume,
			volume_toggle,
			fullscreen_off,
			fullscreen_on,
			track,
			subtitle_btn,
			subtitle_list,
			tap_handler,
			speed_btn,
			speed_list
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
				el: this.dom_elements['timeStore'].dom_elements['store_time_node'],
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
			this.destroyObject['overlay'] = this.dom_elements['overlay']['remove'];
			this.destroyObject['_onChangeProgressVideo'] = this._onChangeProgressVideo();
			this.destroyObject['_onChangePip'] = this._onChangePip();
			this.destroyObject['_onChangeFullScreen'] = this._onChangeFullScreen();
			this.destroyObject['_onEventKeywords'] = this._onEventKeywords();
			this.destroyObject['_onMouse'] = this._onMouse();
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

		this.dom_elements['controls'].remove();
		this.dom_elements['doubleTap'].remove();

		if (callback) {
			callback();
		}
	};

	private _onMouse() {
		const onmousemove = (e: MouseEvent) => {
			if (this.isVideoPlay) {
				this.mX = e.clientX;
				this.mY = e.clientY;
			}
		};

		const onmouseleave = () => {
			this.isMouseHover = false;
		};

		const onmouseenter = () => {
			this.isMouseHover = true;
		};

		if (this.videoContainer) {
			this.videoContainer.addEventListener('mousemove', onmousemove);
			this.videoContainer.addEventListener('mouseleave', onmouseleave);
			this.videoContainer.addEventListener('mouseenter', onmouseenter);
		}

		return () => {
			this.videoContainer?.removeEventListener('mousemove', onmousemove);
			this.videoContainer?.removeEventListener('mouseleave', onmouseleave);
			this.videoContainer?.removeEventListener('mouseenter', onmouseenter);
		};
	}

	private _onChangeFullScreen() {
		const onfullscreenchange = () => {
			if (this.isFullScreen) {
				this.isFullScreen = false;
				this.utils.fadeOutIN(this.controls_elements['fullscreen_off'], this.controls_elements['fullscreen_on'], FadeTime.fullscreen);
			} else {
				this.isFullScreen = true;
				this.utils.fadeOutIN(this.controls_elements['fullscreen_on'], this.controls_elements['fullscreen_off'], FadeTime.fullscreen,);
			}
		};

		if (this.video && this.videoContainer) {
			switch (this.browser.browser) {
				case Browser.moz:
					this.videoContainer.addEventListener('mozfullscreenchange', onfullscreenchange);
					break;
				default:
					this.videoContainer.addEventListener('webkitfullscreenchange', onfullscreenchange);
					this.videoContainer.addEventListener('fullscreenchange', onfullscreenchange);
			}
		}

		return () => {
			switch (this.browser.browser) {
				case Browser.moz:
					this.videoContainer?.removeEventListener('mozfullscreenchange', onfullscreenchange);
					break;
				default:
					this.videoContainer?.removeEventListener('webkitfullscreenchange', onfullscreenchange);
					this.videoContainer?.removeEventListener('fullscreenchange', onfullscreenchange);
			}
		};
	}

	private _onChangePip() {
		const video = this.video as HTMLVideoElement;

		const onEnterpictureinpicture = () => {
			//video.pause();
			//this.utils.fadeOutIN(this.btnPlay, this.btnPause, FadeTime.controls,);
		};

		const onLeavepictureinpicture = () => {
			//video.pause();
			//this.utils.fadeOutIN(this.btnPlay, this.btnPause, FadeTime.controls, this.controlsUI);
		};

		if (document.pictureInPictureEnabled) {
			video.addEventListener('enterpictureinpicture', onEnterpictureinpicture, false);
			video.addEventListener('leavepictureinpicture', onLeavepictureinpicture, false);

			if (this.navigator) {
				this.navigator.mediaSession.setActionHandler('pause', () => {
					video.pause();
					this.utils.fadeOutIN(this.btnPlay, this.btnPause, FadeTime.controls);
				});
				this.navigator.mediaSession.setActionHandler('play', () => {
					video.play();
					this.utils.fadeOutIN(this.btnPause, this.btnPlay, FadeTime.controls);
				});
			}
		}

		return () => {
			video.removeEventListener('enterpictureinpicture', onEnterpictureinpicture, false);
			video.removeEventListener('leavepictureinpicture', onLeavepictureinpicture, false);
		};
	}

	private _onEventKeywords() {
		const keyUp = (event: KeyboardEvent) => {
			if (this.video && this.isMouseHover) {
				switch (event.which) {
					case 32: //space
						if (this.isPlay) {
							this.isPlay = false;
							this.video.pause();
						} else {
							this.isPlay = true;
							this.utils.eventStoreDispatch();
							this.video.play();
						}
						this.setStoreTime(this.video?.currentTime || 0)
						break;
					case 37: // <
						if (this.isPlay) {
							this.video.currentTime -= this.timeTrackOffset;
						}
						break;
					case 39: // >
						if (this.isPlay) {
							this.video.currentTime += this.timeTrackOffset;
						}
						break;
					default:
						return 0;
				}
			}
		};
		if (this.video) document.addEventListener('keyup', keyUp);

		return () => {
			document.removeEventListener('keyup', keyUp);
			this.isMouseHover = false;
		};
	}

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
				if (timeUI) timeUI.textContent = this.utils.secondsToHms(video.currentTime).time;
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

export default VideoPlayer;