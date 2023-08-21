import './styles/main.sass';
import { VideoPlayer, VideoUtils } from "./video-mini";

interface IStackVideo {
	[key: string]: VideoPlayer
}

const videoStack: IStackVideo = {};
const videoList = document.querySelectorAll(".video-list .player-container");
const utils = new VideoUtils();

videoList.forEach((item) => {

	const videoSubtitles = item.querySelectorAll("video track");
	const itemElement = item as HTMLDivElement
	const videoPlayer = new VideoPlayer({
		videoContainer: `.${itemElement.dataset.name}`,
		iconsFolder: './public/images/icons',
		volumeValue: 30,
		subtitle: !!videoSubtitles.length,
		timeTrackOffset: 2
	});
	videoPlayer.playerInit();
	videoStack[itemElement.dataset.name || "unknown"] = videoPlayer;

});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
utils.eventChangeStor(function (e: any) {
	const info = localStorage.getItem(utils.storeKey);
	if (info && e.detail !== info) {
		//const data = JSON.parse(info)
		//videoStack[data.name].pause();
	}
})