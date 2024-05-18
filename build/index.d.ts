/// <reference types="node" />
import { ReadStream } from 'fs';
declare class VideoQuality {
    private FFMPEG;
    private TEMP;
    private PATH_VIDEO;
    private SKIP_ORIGIN;
    private MAX_QUALITY;
    private MIN_QUALITY;
    private PATH_OUTPUTS;
    private QUALITY_LISTS;
    constructor(pathVideo: string);
    getResolution(): Promise<{
        width: number;
        height: number;
    }>;
    getQuality(): Promise<string>;
    getDuration(): Promise<number>;
    getSizes(): Promise<Sizes>;
    getMetaData(): Promise<Record<string, any>>;
    toImages(timestamps: number[]): Promise<string[]>;
    renderBase64(): Promise<QualityRenderBase64>;
    renderMultipleBase64(): Promise<QualityRenderBase64[]>;
    renderStream(): Promise<QualityRenderStream>;
    renderMultipleStream(): Promise<QualityRenderStream[]>;
    render(qualities: Quality[], type: 'base64' | 'stream'): Promise<(QualityRenderBase64 | QualityRenderStream)[]>;
    maxQuality(max: Quality): this;
    minQuality(min: Quality): this;
    skipOrigin(): this;
    remove(): void;
    removeOrigin(): void;
    temp(tmp: string): void;
    private _middlewareVideoMp4Only;
    private _execute;
    private _bestVideoBitRateForResolution;
    private _covertQualityToResolution;
    private _covertResolutionToQuality;
    private _getRangeOfQuality;
}
export type Quality = '1080p' | '720p' | "480p" | "360p" | "240p" | "144p";
export interface QualityRenderBase64 {
    quality: string;
    name: string;
    path: string;
    base64: string;
}
export interface QualityRenderStream {
    quality: string;
    name: string;
    path: string;
    stream: ReadStream;
}
export interface Sizes {
    bytes: number;
    kb: number;
    mb: number;
    gb: number;
    tb: number;
}
export { VideoQuality };
export default VideoQuality;
