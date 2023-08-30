import { Browser, PlayerKey } from "../models/enum";
import { IBrowser, IFade } from "../models/video";
import { IVideoUtils } from "../models/video-utils";

class VideoUtils implements IVideoUtils {

	private navigator = window.navigator;
	private event;

	constructor() {
		this.event = new Event(PlayerKey.storeInfo);
	}

	get storeKey() {
		return PlayerKey.storeInfo;
	}

	fadeIn({ el, display = 'block', time = 10, callback }: IFade) {
		el.style.opacity = '0';
		el.style.display = display || 'block';
		(function fade() {
			let val: number = parseFloat(el.style.opacity);
			if ((val += time / 1000) < 1.01) {
				el.style.opacity = val.toString();
				requestAnimationFrame(fade);
			} else {
				if (callback !== undefined) {
					callback();
				}
			}
		})();
	}

	fadeOut({ el, time = 10, callback = undefined }: IFade) {
		el.style.opacity = '1';
		(function fade() {
			const opacity = Number(el.style.opacity) - (time / 1000);
			if (opacity < 0) {
				el.style.display = 'none';
				if (callback !== undefined) {
					callback();
				}
			} else {
				el.style.opacity = opacity.toString();
				requestAnimationFrame(fade);
			}
		})();
	}

	fadeOutIN(
		showClassEl: HTMLElement,
		hideClassEl: HTMLElement,
		time: number,
		param?: {
			callback?: () => void;
			display?: string;
		}
	) {
		const el = hideClassEl;
		const elShow = showClassEl;
		const callback = param?.callback;
		if (el)
			this.fadeOut({
				el,
				time,
				callback: () => {
					if (showClassEl) this.fadeIn({ el: elShow, display: param?.display || 'block', time, callback });
				},
			});
	}

	userAgent = (): IBrowser => {
		let sBrowser = Browser.unknown;
		let cBrowser = 'br-unknown';

		const sUsrAg = this.navigator.userAgent;

		if (sUsrAg.indexOf('Firefox') > -1) {
			sBrowser = Browser.moz;
			cBrowser = 'br-moz';
		} else if (sUsrAg.indexOf('Opera') > -1) {
			sBrowser = Browser.opera;
			cBrowser = 'br-opera';
		} else if (sUsrAg.indexOf('Trident') > -1) {
			sBrowser = Browser.ie;
			cBrowser = 'br-ie';
		} else if (sUsrAg.indexOf('Edge') > -1) {
			sBrowser = Browser.edge;
			cBrowser = 'br-edge';
		} else if (sUsrAg.indexOf('Chrome') > -1) {
			sBrowser = Browser.google;
			cBrowser = 'br-chrome';
		} else if (sUsrAg.indexOf('Safari') > -1) {
			sBrowser = Browser.safari;
			cBrowser = 'br-safari';
		}

		return { browser: sBrowser, class: cBrowser };
	};

	secondsToHms(d: number) {
		d = Number(d);
		const h = Math.floor(d / 3600);
		const m = Math.floor((d % 3600) / 60);
		const s = Math.floor((d % 3600) % 60);
		const zero = (a: number) => {
			return a > 9 ? a : '0' + a;
		};
		return {
			h,
			m,
			s,
			time: `${zero(m)}:${zero(s)}`,
		};
	}

	eventStoreDispatch() {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(this.event as any).detail = localStorage.getItem(PlayerKey.storeInfoPrev)
		window.dispatchEvent(this.event);
	}

	eventChangeStor(callback: (e: unknown) => void) {
		window.addEventListener(PlayerKey.storeInfo, function (e) {
			callback(e);
		}, false);
	}
	eventRemoveStore(callback: (e: unknown) => void) {
		window.removeEventListener(PlayerKey.storeInfo, function (e) {
			callback(e);
		}, false)
	}

}

export default VideoUtils;