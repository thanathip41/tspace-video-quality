# tspace-video-quality

[![NPM version](https://img.shields.io/npm/v/tspace-video-quality.svg)](https://www.npmjs.com)
[![NPM downloads](https://img.shields.io/npm/dm/tspace-video-quality.svg)](https://www.npmjs.com)

Covert video quality

## Install

Install with [npm](https://www.npmjs.com/):

```sh
npm install tspace-video-quality --save

```
## Basic Usage
- [RenderQuality](#render-quality)
  - [Base64](#base64)
  - [Stream](#stream)
  - [Images](#images)
- [MetaData](#meta-data)
    - [Quality](#quality)
    - [Resolution](#resolution)
    - [Duration](#duration)
    - [Sizes](#sizes)
- [Quality](#quality)

## Render Quality
```js
import { VideoQuality, QualityRenderBase64, QualityRenderStream } from 'tspace-video-quality'

const videoQuality = new VideoQuality('<your-path-video.mp4>')
const results = await videoQuality
.temp('<your-path-temp-video>')
.maxQuality('720p')
.minQuality('480p')
.renderMultipleBase64()

// 
const results = await videoQuality
.temp('<your-path-temp-video>')
.maxQuality('360p')
.minQuality('144p')
.renderMultipleStream()

cosnole.log(results)

```

## Base64
```js
const videoQuality = new VideoQuality('<your-path-video.mp4>')
const base64Results = await videoQuality.temp('<your-path-temp-video>').render(['720p','480p','360p'],'base64') as QualityRenderBase64
console.log(base64Results)

videoQuality.remove() // remove tmp video when finished
videoQuality.removeOrigin() // remove tmp video origin when finished
```

## Stream
```js
const videoQuality = new VideoQuality('<your-path-video.mp4>')

const streamResults = await videoQuality.temp('<your-path-temp-video>').render(['720p','480p'],'stream') as QualityRenderStream
videoQuality.remove() // remove tmp video when finished
videoQuality.removeOrigin() // remove tmp video origin when finished

```
## Images
```js
const videoQuality = new VideoQuality('<your-path-video.mp4>')
const images = await videoQuality.temp('<your-path-temp-video>').toImages([1,5,10,20]) // timestamp
videoQuality.removeOrigin() 
console.log(images)
```

## Meta Data
```js
const meta = await new VideoQuality('<your-path-video.mp4>').getMetaData()
console.log(meta)
```
## Quality
```js
const quality = await new VideoQuality('<your-path-video.mp4>').getQuality()
console.log(quality)
```

## Resolution
```js
const resolution = await new VideoQuality('<your-path-video.mp4>').getResolution()
console.log(resolution)
```

## Duration
```js
const duration = await new VideoQuality('<your-path-video.mp4>').getDuration()
console.log(duration)
```

## Sizes
```js
const sizes = await new VideoQuality('<your-path-video.mp4>').getSizes()
console.log(sizes)
```
