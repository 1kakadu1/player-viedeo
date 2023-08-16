import { IBrowser, IFade } from "./video";

export interface IVideoUtils {
    fadeIn: (value: IFade) => void;
    fadeOut: (value: IFade) => void;
    userAgent: () => IBrowser;
    fadeOutIN: (
        showClassEl: HTMLElement,
        hideClassEl: HTMLElement,
        time: number,
        param?: {
            callback?: () => void;
            display?: string;
        }) => void;
    secondsToHms: (d: number) => {
        h: number,
        m: number,
        s: number,
        time: string,
    };
    eventStoreDispatch: () => void;
    eventChangeStor: (callback: (e: unknown) => void) => void;
    eventRemoveStore: (callback: (e: unknown) => void) => void;
}