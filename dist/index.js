"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoQuality = void 0;
const fs_1 = __importDefault(require("fs"));
const mime_types_1 = __importDefault(require("mime-types"));
const path_1 = __importDefault(require("path"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const ffmpeg_1 = __importDefault(require("@ffmpeg-installer/ffmpeg"));
const ffprobe_1 = __importDefault(require("@ffprobe-installer/ffprobe"));
class VideoQuality {
    constructor(pathVideo) {
        this.FFMPEG = fluent_ffmpeg_1.default;
        this.TEMP = 'tspace-tmp';
        this.PATH_VIDEO = '';
        this.SKIP_ORIGIN = true;
        this.MAX_QUALITY = '1080p';
        this.MIN_QUALITY = '144p';
        this.PATH_OUTPUTS = [];
        this.QUALITY_LISTS = {
            "144p": { prev: null, next: "240p", },
            "240p": { prev: "144p", next: "360p", },
            "360p": { prev: "240p", next: "480p", },
            "480p": { prev: "360p", next: "720p", },
            "720p": { prev: "480p", next: "1080p", },
            "1080p": { prev: "720p", next: null, }
        };
        this.PATH_VIDEO = path_1.default.join(path_1.default.resolve(), pathVideo);
        this.FFMPEG.setFfmpegPath(ffmpeg_1.default.path);
        this.FFMPEG.setFfprobePath(ffprobe_1.default.path);
        return this._middlewareVideoMp4Only();
    }
    getResolution() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.FFMPEG.ffprobe(this.PATH_VIDEO, (err, metadata) => {
                    if (err)
                        return reject(err);
                    const { streams } = metadata;
                    const width = streams.map(s => s.width).filter(d => d != null)[0];
                    const height = streams.map(s => s.height).filter(d => d != null)[0];
                    return resolve({ width, height });
                });
            });
        });
    }
    getQuality() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.FFMPEG.ffprobe(this.PATH_VIDEO, (err, metadata) => {
                    if (err)
                        return reject(err);
                    const { streams } = metadata;
                    const width = streams.map(s => s.width).filter(d => d != null)[0];
                    const height = streams.map(s => s.height).filter(d => d != null)[0];
                    return resolve(this._covertResolutionToQuality(`${width}x${height}`));
                });
            });
        });
    }
    getDuration() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.FFMPEG.ffprobe(this.PATH_VIDEO, (err, metadata) => {
                    var _a;
                    if (err)
                        return reject(err);
                    const { format } = metadata;
                    return resolve((_a = format === null || format === void 0 ? void 0 : format.duration) !== null && _a !== void 0 ? _a : 0);
                });
            });
        });
    }
    getSizes() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.FFMPEG.ffprobe(this.PATH_VIDEO, (err, metadata) => {
                    var _a;
                    if (err)
                        return reject(err);
                    const { format } = metadata;
                    const bytes = Number((_a = format === null || format === void 0 ? void 0 : format.size) !== null && _a !== void 0 ? _a : 0);
                    const kilobytes = bytes / 1024;
                    const megabytes = kilobytes / 1024;
                    const gigabytes = megabytes / 1024;
                    const terabytes = gigabytes / 1024;
                    return resolve({
                        bytes,
                        kb: kilobytes,
                        mb: megabytes,
                        gb: gigabytes,
                        tb: terabytes,
                    });
                });
            });
        });
    }
    getMetaData() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.FFMPEG.ffprobe(this.PATH_VIDEO, (err, metadata) => {
                    if (err)
                        return reject(err);
                    const { format } = metadata;
                    return resolve(format);
                });
            });
        });
    }
    toImages(timestamps) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const frames = [];
                const frameName = +new Date();
                this.FFMPEG(this.PATH_VIDEO)
                    .on('filenames', (names) => {
                    for (let name of names) {
                        frames.push(name);
                    }
                })
                    .on('end', () => {
                    const images = [];
                    for (let name of frames) {
                        const output = path_1.default.join(path_1.default.resolve(`${this.TEMP}/${name}`));
                        const base64 = fs_1.default.readFileSync(output, { encoding: 'base64' });
                        images.push(base64);
                        fs_1.default.unlinkSync(output);
                    }
                    return resolve(images);
                })
                    .on('error', (err) => {
                    return reject(err);
                })
                    .screenshots({
                    timestamps: timestamps.map((t) => {
                        const timestamp = new Date(0);
                        timestamp.setSeconds(t);
                        return timestamp.toISOString().substr(11, 8);
                    }),
                    folder: this.TEMP,
                    filename: `${frameName}-%i.png`
                });
            });
        });
    }
    renderBase64() {
        return __awaiter(this, void 0, void 0, function* () {
            const currentQuality = yield this.getQuality();
            const quality = Number(currentQuality.replace(/p/g, '')) >= Number(this.MAX_QUALITY.replace(/p/g, ''))
                ? this.MAX_QUALITY
                : currentQuality;
            return yield this._execute(quality, 'base64');
        });
    }
    renderMultipleBase64() {
        return __awaiter(this, void 0, void 0, function* () {
            const getRangeOfQualities = yield this._getRangeOfQuality();
            const promises = [];
            for (const getRangeOfQuality of getRangeOfQualities) {
                promises.push(this._execute(getRangeOfQuality, 'base64'));
            }
            const results = yield Promise.all(promises);
            return results;
        });
    }
    renderStream() {
        return __awaiter(this, void 0, void 0, function* () {
            const currentQuality = yield this.getQuality();
            const quality = Number(currentQuality.replace(/p/g, '')) >= Number(this.MAX_QUALITY.replace(/p/g, ''))
                ? this.MAX_QUALITY
                : currentQuality;
            return yield this._execute(quality, 'stream');
        });
    }
    renderMultipleStream() {
        return __awaiter(this, void 0, void 0, function* () {
            const getRangeOfQualities = yield this._getRangeOfQuality();
            const promises = [];
            for (const getRangeOfQuality of getRangeOfQualities) {
                promises.push(this._execute(getRangeOfQuality, 'stream'));
            }
            return yield Promise.all(promises);
        });
    }
    render(qualities, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = [];
            for (const getRangeOfQuality of qualities) {
                promises.push(this._execute(getRangeOfQuality, type));
            }
            return yield Promise.all(promises);
        });
    }
    maxQuality(max) {
        this.MAX_QUALITY = max;
        return this;
    }
    minQuality(min) {
        this.MIN_QUALITY = min;
        return this;
    }
    skipOrigin() {
        this.SKIP_ORIGIN = false;
        return this;
    }
    remove() {
        for (const output of this.PATH_OUTPUTS) {
            fs_1.default.unlinkSync(output);
        }
        return;
    }
    removeOrigin() {
        fs_1.default.unlinkSync(this.PATH_VIDEO);
        return;
    }
    temp(tmp) {
        this.TEMP = tmp;
    }
    _middlewareVideoMp4Only() {
        if (mime_types_1.default.extension(String(mime_types_1.default.lookup(this.PATH_VIDEO))) === 'mp4')
            return this;
        throw new Error('mime extension must be mp4 only');
    }
    _execute(quality, type) {
        const random = `${Math.floor(Math.random() * +new Date()).toString(36)}_${+new Date()}`;
        const name = `${quality}_${random}.mp4`;
        const output = path_1.default.join(path_1.default.resolve(`${this.TEMP}/${name}`));
        const resolution = this._covertQualityToResolution(String(quality));
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            if (!fs_1.default.existsSync(this.TEMP))
                fs_1.default.mkdirSync(this.TEMP, { recursive: true });
            let totalTime = 1;
            const upload = this.FFMPEG(this.PATH_VIDEO)
                .videoBitrate(this._bestVideoBitRateForResolution(quality))
                .audioBitrate("128k")
                .audioQuality(100)
                .size(resolution)
                .save(output);
            upload.on('codecData', (data) => {
                totalTime = parseInt(data.duration.replace(/:/g, ''));
            });
            upload.on('progress', (progress) => {
                const time = parseInt(progress.timemark.replace(/:/g, ''));
                const percent = (time / totalTime) * 100;
                console.log(`quality : ${quality} => percent % : ${percent.toFixed(2)}`);
            });
            upload.on('end', () => {
                console.log(`processing finished :  ${quality}`);
                this.PATH_OUTPUTS.push(output);
                if (type === 'stream') {
                    const stream = fs_1.default.createReadStream(output);
                    stream.close();
                    return resolve({
                        name,
                        path: output,
                        quality,
                        stream
                    });
                }
                const base64 = fs_1.default.readFileSync(output, { encoding: 'base64' });
                return resolve({
                    name,
                    path: output,
                    quality,
                    base64
                });
            });
            upload.on('error', (err) => {
                console.log('an error occurred: ' + err.message);
                return reject(err);
            });
        }));
    }
    _bestVideoBitRateForResolution(resolution) {
        var _a;
        return (_a = {
            '144p': '210',
            '240p': '310',
            '360p': '410',
            '480p': '510',
            '720p': '1510',
            '1080p': '3010'
        }[resolution]) !== null && _a !== void 0 ? _a : '510';
    }
    _covertQualityToResolution(quality) {
        var _a;
        return (_a = {
            "144p": "256x144",
            "240p": "426x240",
            "360p": "480x360",
            "480p": "854x480",
            "720p": "1280x720",
            "1080p": "1920x1080"
        }[quality]) !== null && _a !== void 0 ? _a : '256x144';
    }
    _covertResolutionToQuality(resolution) {
        var _a;
        return (_a = {
            "256x144": '144p',
            "426x240": '240p',
            "480x360": '360p',
            "854x480": '480p',
            "1280x720": '720p',
            "1920x1080": '1080p'
        }[resolution]) !== null && _a !== void 0 ? _a : '144p';
    }
    _getRangeOfQuality() {
        return __awaiter(this, void 0, void 0, function* () {
            const currentQuality = yield this.getQuality();
            const max = Number(currentQuality.replace(/p/g, '')) >= Number(this.MAX_QUALITY.replace(/p/g, ''))
                ? this.MAX_QUALITY
                : currentQuality;
            const findMin = (min, lists = []) => {
                if (min === this.MIN_QUALITY)
                    return min;
                if (this.QUALITY_LISTS[min].prev == null)
                    return min;
                lists.push(this.QUALITY_LISTS[min].prev);
                findMin(String(this.QUALITY_LISTS[min].prev), lists);
                return lists;
            };
            const min = findMin(max);
            let results = typeof min === 'string' ? [min] : [...min];
            if (this.SKIP_ORIGIN) {
                results = typeof min === 'string' ? [min, max] : [...min, max];
            }
            return Array.from(new Set(results)).sort((a, b) => Number(b.replace(/p/g, '')) - Number(a.replace(/p/g, '')));
        });
    }
}
exports.VideoQuality = VideoQuality;
exports.default = VideoQuality;
