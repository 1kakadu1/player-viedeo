import { UiClasses } from "../models/enum";
import { IElementsReturn, IEventsUI, IVideoPlayerElementsCreate, IVideoPlayerUI, IVideoPlayerUIParam, IVolumeClasses } from "../models/video";
import { IVideoUtils } from "../models/video-utils";
import VideoUtils from "./utils";

class VideoPlayerUI implements IVideoPlayerUI {

	protected container: HTMLDivElement | null;
	protected volumeValue: number;
	protected subtitlesList: NodeListOf<HTMLTrackElement> | null;
	protected icons: string;
	protected subtitlesInit?: boolean | undefined;
	protected timeTrackOffset?: number | undefined;
	private storeTime: number;
	private utils: IVideoUtils;
	private unMountList: Array<() => void> = [];

	constructor(videoContainer: HTMLDivElement | null, param: IVideoPlayerUIParam) {
		this.container = videoContainer;
		this.volumeValue = param.volumeValue;
		this.icons = param.icons;
		this.subtitlesList = param.subtitles || null;
		this.controls = this.controls.bind(this);
		this.volume = this.volume.bind(this);
		this.overlayPlay = this.overlayPlay.bind(this);
		this.subtitles = this.subtitles.bind(this);
		//this.videoQuality = this.videoQuality.bind(this);
		this.subtitlesInit = param.subtitlesInit;
		this.timeTrackOffset = param.timeTrackOffset;
		this.storeTime = param.timeStore;
		this.utils = new VideoUtils();
	}

	unMount = (): void => {
		this.unMountList.forEach((item) => {
			item();
		})
	};

	
	protected playbackRate({btn}:{btn:string}, events: IEventsUI): IElementsReturn{

		const speed_list_items_obj: { [key: string]: HTMLDivElement } = {};

		const speed_container_node = document.createElement("div");
		speed_container_node.classList.add("player-btn-pp", 'player-subtitle-container', 'player-speed-container');

		const speed_list = document.createElement("div");
		speed_list.classList.add("subtitle-list","speed-list");
		speed_list.style.display = 'none';


		[0.5,0.75,1,1.5, 1.75 ,2].forEach((item, index)=> {
			const speed_item = document.createElement('div');
			speed_item.classList.add('subtitle-item', "speed-item", item === 1 ? "active":"skip");
			speed_item.dataset.speed = item.toString();
			speed_item.innerText =  item.toString();
			speed_list_items_obj["speed_list_item_" + index] = speed_item;
			speed_list.appendChild(speed_item);
		});

		const speed_btn = document.createElement("button");
		speed_btn.classList.add('btn-cc', 'controls-btn', btn);
		speed_btn.innerText = '>>';
		speed_btn.addEventListener('click', events['speed_btn'], false);
		speed_list.addEventListener('click', events['speed_list'], false);

		speed_container_node.appendChild(speed_list);
		speed_container_node.appendChild(speed_btn);


		return {
			remove: () => {
				speed_btn.removeEventListener('click', events['subtitle_btn'], false);
				speed_list.removeEventListener('click', events['subtitle_list'], false);
				speed_container_node.remove();
			},
			dom_elements: {
				speed_list,
				speed_container_node,
				speed_btn,
				...speed_list_items_obj,
			}
		};
	}
	protected subtitles({
		btn,
		cItem,
		listTrack,
		track,
	}: {
		btn: string;
		cItem: string;
		listTrack: string;
		track: NodeListOf<HTMLTrackElement> | null;
	}, events: IEventsUI): IElementsReturn {
		const trackList = () => {
			const items = [];

			if (track) {
				track.forEach((item) => {
					const subtitles_track_item = document.createElement('div');
					subtitles_track_item.classList.add('subtitle-item', cItem);
					subtitles_track_item.dataset.lang = item.lang;
					subtitles_track_item.innerText = item.label;
					items.push(subtitles_track_item);
				});

				const subtitles_track_item = document.createElement('div');
				subtitles_track_item.classList.add('subtitle-item', cItem, 'active');
				subtitles_track_item.dataset.lang = 'off';
				subtitles_track_item.innerText = 'Off';
				items.push(subtitles_track_item);
			}

			return items;
		};

		const subtitle_container_node = document.createElement("div");
		subtitle_container_node.classList.add("player-btn-pp", 'player-subtitle-container');

		const subtitle_list = document.createElement("div");
		subtitle_list.classList.add("subtitle-list", listTrack);
		subtitle_list.style.display = 'none';

		const subtitle_list_items = trackList();
		const subtitle_list_items_obj: { [key: string]: HTMLDivElement } = {};
		subtitle_list_items.forEach(item => {
			subtitle_list_items_obj["subtitle_list_item_" + item.dataset.lang] = item;
			subtitle_list.appendChild(item);
		});

		const subtitle_btn = document.createElement("button");
		subtitle_btn.classList.add('btn-cc', 'controls-btn', btn);
		subtitle_btn.innerText = 'CC';
		subtitle_btn.addEventListener('click', events['subtitle_btn'], false);
		subtitle_list.addEventListener('click', events['subtitle_list'], false);

		subtitle_container_node.appendChild(subtitle_list);
		subtitle_container_node.appendChild(subtitle_btn);

		return {
			remove: () => {
				subtitle_btn.removeEventListener('click', events['subtitle_btn'], false);
				subtitle_list.removeEventListener('click', events['subtitle_list'], false);
				subtitle_container_node.remove();
			},
			dom_elements: {
				subtitle_list,
				subtitle_container_node,
				subtitle_btn,
				...subtitle_list_items_obj,
			}
		};
	}

	protected volume({ btn, volume, range }: IVolumeClasses, events: IEventsUI) {
		const volume_container_node = document.createElement('div');
		volume_container_node.classList.add("player-btn-pp", "player-volume-container");

		const volume_range_node = document.createElement('div');
		volume_range_node.classList.add("player-volume-range-wrap", range);
		volume_range_node.style.display = "none";

		const volume_range_input = document.createElement('input');
		volume_range_input.type = 'range';
		volume_range_input.classList.add("input-player-range", volume);
		volume_range_input.value = this.volumeValue.toString();
		volume_range_input.name = 'volume';
		volume_range_input.min = '0';
		volume_range_input.max = '100';
		volume_range_input.addEventListener("input", events["volume"], false);

		const volume_range_label = document.createElement('div');
		volume_range_label.classList.add("player-volume-label");
		volume_range_label.innerText = `${this.volumeValue}%`;

		const volume_button = document.createElement('button');
		volume_button.classList.add('controls-btn', btn);
		volume_button.innerHTML = `<img src="${this.icons}/volume.svg" alt="volume">`;
		volume_button.addEventListener("click", events["volume_toggle"], false);

		volume_range_node.appendChild(volume_range_input);
		volume_range_node.appendChild(volume_range_label);

		volume_container_node.appendChild(volume_range_node);
		volume_container_node.appendChild(volume_button);

		return {
			remove: () => {
				volume_button.removeEventListener("click", events["volume_toggle"], false);
				volume_range_input.removeEventListener("input", events["volume"], false);
				volume_container_node.remove();
			},
			dom_elements: {
				volume_container_node,
				volume_range_node,
				volume_button,
				volume_range_label,
				volume_range_input,
			}
		};
	}

	protected fullscreen = (on: string, off: string, events: IEventsUI) => {
		const fullscreen_container_node = document.createElement("div");
		fullscreen_container_node.classList.add("player-btn-pp");
		const fullscreen_on = document.createElement("button");
		fullscreen_on.innerHTML = `<img src="${this.icons}/fullscreen.svg" alt="fullscreen on">`;
		fullscreen_on.classList.add('controls-btn', on);
		const fullscreen_off = document.createElement("button");
		fullscreen_off.innerHTML = `<img src="${this.icons}/fullscreen-off.svg" alt="fullscreen off">`;
		fullscreen_off.classList.add('controls-btn', off);
		fullscreen_off.style.display = "none";
		fullscreen_off.addEventListener("click", events["fullscreen_off"]);
		fullscreen_on.addEventListener("click", events["fullscreen_on"]);

		fullscreen_container_node.append(fullscreen_on, fullscreen_off)

		return {
			remove: () => {
				fullscreen_off.addEventListener("click", events["fullscreen_off"]);
				fullscreen_on.addEventListener("click", events["fullscreen_on"]);
				fullscreen_container_node.remove();
			},
			dom_elements: {
				fullscreen_container_node,
				fullscreen_on,
				fullscreen_off
			}
		};
	};

	protected play(play: string, pause: string, events: IEventsUI) {
		const button_play = document.createElement("button");
		button_play.classList.add('controls-btn', play)
		const image_play = document.createElement("img");
		image_play.src = `${this.icons}/play.svg`;
		image_play.alt = 'play';
		image_play.style.display = 'none';

		const button_pause = document.createElement("button");
		button_pause.classList.add('controls-btn', pause)
		const image_pause = document.createElement("img");
		image_pause.src = `${this.icons}/pause.svg`;
		image_pause.alt = 'pause';

		const buttons_pp_action = document.createElement("div");
		button_pause.classList.add(`player-btn-pp`);

		button_pause.appendChild(image_pause);
		button_play.appendChild(image_play);

		button_play.addEventListener("click", events["button_play"]);
		button_pause.addEventListener("click", events["button_pause"]);

		buttons_pp_action.appendChild(button_play);
		buttons_pp_action.appendChild(button_pause);

		return {
			remove: () => {
				button_play.removeEventListener("click", events["button_play"], false);
				button_pause.removeEventListener("click", events["button_pause"], false);
				buttons_pp_action.remove();
			},
			dom_elements: {
				buttons_pp_action,
				button_pause,
				button_play,
			}
		};

	}

	protected track(container: string, progress: string, buffer: string, time: string, timeFull: string, events: IEventsUI) {
		const track_container_node = document.createElement('div');
		track_container_node.classList.add("player-track-container");

		const track = document.createElement('div');
		track.classList.add("player-track-time");

		const track_time = document.createElement('span');
		track_time.classList.add(time);
		track_time.innerText = '00.00';

		const track_sp = document.createElement('span');
		track_sp.classList.add('player-track-time_sp');
		track_sp.innerText = '/';

		const track_time_full = document.createElement('span');
		track_time_full.classList.add(timeFull);
		track_time_full.innerText = '00.00';

		track.appendChild(track_time);
		track.appendChild(track_sp);
		track.appendChild(track_time_full);
		track_container_node.appendChild(track);

		const track_player = document.createElement('div');
		track_player.classList.add("player-track", container);
		track_player.addEventListener("click", events['track'], false);

		track_container_node.appendChild(track_player);

		const track_buffered = document.createElement('div');
		track_buffered.classList.add("player-buffered");
		const track_buffered_amount = document.createElement('span');
		track_buffered_amount.classList.add("player-buffered-amount", buffer);
		track_buffered.appendChild(track_buffered_amount);
		track_container_node.appendChild(track_buffered);

		const track_progress = document.createElement('div');
		track_progress.classList.add("player-progress");
		const track_progress_amount = document.createElement('span');
		track_progress_amount.classList.add("player-progress-amount", progress);
		track_progress.appendChild(track_progress_amount);
		track_container_node.appendChild(track_progress);

		return {
			remove: () => {
				track_player.removeEventListener("click", events['track'], false);
				track_container_node.remove();
			},
			dom_elements: {
				track_container_node,
				track,
				track_time,
				track_time_full,
				track_buffered_amount,
				track_buffered,
				track_player,
				track_progress,
				track_progress_amount,

			}
		}
	}


	protected doubleTap(events: IEventsUI): IElementsReturn {

		const double_tab_left_node = document.createElement("div");
		double_tab_left_node.classList.add('double-tap-container', UiClasses.doubleTap, UiClasses.doubleTapLeft);
		double_tab_left_node.dataset.tap = "left";
		double_tab_left_node.innerHTML = `
			<div class="double-tap-icon-wrap">
				<img src="${this.icons}/fast-forward.svg" class="rot-180" alt="tap-left"> 
				<div>${this.timeTrackOffset || ""}</div>
	  		</div>
		`;

		const double_tab_right_node = document.createElement("div");
		double_tab_right_node.classList.add('double-tap-container', UiClasses.doubleTap, UiClasses.doubleTapRight);
		double_tab_right_node.dataset.tap = "right";
		double_tab_right_node.innerHTML = `
			<div class="double-tap-icon-wrap">
				<div>${this.timeTrackOffset || ""}</div>
				<img src="${this.icons}/fast-forward.svg" alt="tap-right">  
	  		</div>
		`;

		double_tab_left_node?.addEventListener("touchstart", events["tap_handler"], false);
		double_tab_right_node?.addEventListener("touchstart", events["tap_handler"], false);


		this.container?.append(double_tab_right_node, double_tab_left_node);
		return {
			remove: () => {
				double_tab_left_node?.removeEventListener("touchstart", events["tap_handler"], false);
				double_tab_right_node?.removeEventListener("touchstart", events["tap_handler"], false);
				double_tab_left_node.remove();
				double_tab_right_node.remove();
			},
			dom_elements: {
				double_tab_right_node,
				double_tab_left_node
			}
		};

	}

	overlayPlay(events: IEventsUI): IElementsReturn {
		const overlay_node = document.createElement("div");
		overlay_node.classList.add('overlay-play', UiClasses.videoContainerOverlay);
		const overlay_btn_play = document.createElement("div");
		overlay_btn_play.classList.add('play-icon', UiClasses.videoOverlayBtn)
		overlay_btn_play.addEventListener("click", events["overlay_btn_play"]);
		overlay_node.appendChild(overlay_btn_play);
		this.container?.appendChild(overlay_node);

		return {
			remove: () => {
				overlay_btn_play.removeEventListener("click", events["overlay_btn_play"], false);
				overlay_node.remove();
			},
			dom_elements: {
				overlay_btn_play,
				overlay_node
			}
		};
	}

	storeTimeBtn(events: IEventsUI): IElementsReturn {
		const store_time_node = document.createElement("div");
		store_time_node.classList.add(UiClasses.playToTimeContainer);
		store_time_node.style.display = !this.storeTime ? "none" : "block";
		store_time_node.addEventListener("click", events["store_time_btn"]);
		const store_time_btn = document.createElement("div");
		store_time_btn.classList.add('play-icon', UiClasses.playToTime);
		store_time_btn.innerText = `start ${this.utils.secondsToHms(this.storeTime).time}`;


		store_time_node.appendChild(store_time_btn);
		this.container?.appendChild(store_time_node);

		return {
			remove: () => {
				store_time_node.removeEventListener("click", events["store_time_btn"]);
				store_time_node.remove();
			},
			dom_elements: {
				store_time_node,
				store_time_btn
			}
		};

	}

	controls(container: HTMLDivElement | null, events: IEventsUI): IElementsReturn {
		const actions_pp = this.play(UiClasses.play, UiClasses.pause, events);

		const controls = document.createElement("div");
		controls.classList.add("video-player-controls", 'videoPlayerControls')
		controls.style.display = 'none';

		const playerBtnLeft = document.createElement("div");
		playerBtnLeft.classList.add("player-btn-left");
		playerBtnLeft.appendChild(actions_pp.dom_elements.buttons_pp_action);

		const track = this.track(UiClasses.track, UiClasses.progress, UiClasses.buffer, UiClasses.trackTime, UiClasses.trackTimeFull, events);

		const playerBtnRight = document.createElement("div");
		playerBtnRight.classList.add("player-btn-right");


		controls.appendChild(playerBtnLeft);
		controls.appendChild(track.dom_elements.track_container_node);

		let subtitles_node_elements: { [key: string]: HTMLElement } = {};
		let subtitles_node: IElementsReturn | null = null;

		if (this.subtitlesInit === true) {
			subtitles_node = this.subtitles({ btn: UiClasses.subtitleBtn, cItem: UiClasses.subtitleItem, listTrack: UiClasses.subtitleList, track: this.subtitlesList }, events)
			subtitles_node_elements = { ...subtitles_node.dom_elements };
			playerBtnRight.appendChild(subtitles_node_elements.subtitle_container_node);
		}
		let speed_node_elements: { [key: string]: HTMLElement } = {};
		const speed_node = this.playbackRate({ btn: UiClasses.subtitleBtn }, events)
		speed_node_elements = { ...speed_node.dom_elements };
		playerBtnRight.appendChild(speed_node_elements.speed_container_node);
		

		const fullscreen = this.fullscreen(UiClasses.fullscreen, UiClasses.fullscreenCancel, events)
		playerBtnRight.appendChild(fullscreen.dom_elements.fullscreen_container_node);

		const volume = this.volume({ btn: UiClasses.volume, volume: UiClasses.rangeVolume, range: UiClasses.volumeProgressContainer }, events);
		playerBtnRight.appendChild(volume.dom_elements.volume_container_node);

		controls.appendChild(playerBtnRight);

		container?.appendChild(controls);

		return {
			remove: () => {
				actions_pp.remove();
				track.remove();
				volume.remove();
				fullscreen.remove();
				controls.remove();
				speed_node.remove();
				if (this.subtitlesInit === true && subtitles_node !== null) {
					subtitles_node.remove()
				}
			},
			dom_elements: {
				controls,
				...actions_pp.dom_elements,
				...track.dom_elements,
				...subtitles_node_elements,
				...fullscreen.dom_elements,
				...volume.dom_elements,
				...speed_node_elements,
			}
		};
	}

	createUI = (events: IEventsUI): IVideoPlayerElementsCreate => {
		const elements: { [key: string]: IElementsReturn } = {
			controls: this.controls(this.container, events),
			overlay: this.overlayPlay(events),
			doubleTap: this.doubleTap(events),
			timeStore: this.storeTimeBtn(events)
		};

		Object.keys(elements).forEach(key_element => {
			const value = elements[key_element].remove;
			this.unMountList.push(value);
		})

		return elements;
	};
}

export default VideoPlayerUI;