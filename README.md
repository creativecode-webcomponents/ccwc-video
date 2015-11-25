CCWC-Video
==========

CCWCVideo plays back video or web camera feeds. Playback is offered on an internal canvas as well. Consumers can draw directly into this canvas, get a copy
of the framedata or even take the canvas context for use on another canvas


Element attributes
------------------

&lt;ccwc-video

- **useCamera** *(boolean)* If present, the component will use your webcam. You must give it an index or ID source via the src attribute or through the API

- **src** *(string or integer)* If present, this will set the source video of your component. If **useCamera** is present, this source can either be an integer or ID to represent your webcam

- **useCanvasForDisplay** *(boolean)* If present, this component will hide the video, and instead show the internal canvas that draws the frames from the vidoe

- **frameDataMode** *(string: "binary", "imagedataurl" (default), or "imagedata"* Setting for the data in the event that occurs when the frame is redrawn.

  - **binary** binary image output

  - **imagedataurl** good for setting the source of an img tag or similar

  - **imagedata** good for applying to another canvas element

- **canvasRefreshInterval** (integer) How often, in milliseconds, the internal canvas is refreshed. Default is 250ms which is a bit choppy To see results, be sure to use with "useCanvasForDisplay". Alternately, use this to drive regular update events

- **canvasScale** (float/number) Scaling of the canvas and scale of image data from the frame update events. 0.5, for example will show content at half size
&gt;

&lt;/ccwc-video&gt;

Element Events
--------------

ccwcvideo.addEventListener(
- **ready** the component is ready. No event detail is provided

- **camerasfound** the component has found webcams. For a camera list, use event.detail.cameras

- **frameupdate** the internal canvas has been updated, a new video frame is available. Event details provided are:

    - *event.detail.framedata* image data for the video frame

    - *event.detail.canvascontext* the 2D context of the internal canvas

    - *event.detail.videoWidth* the real width of the playing video

    - *event.detail.videoHeight* the real height of the playing video

    - *event.detail.videoLeft* the left position of the letterboxed video

    - *event.detail.videoTop* the top position of the letterboxed video

    - *event.detail.width* the width of the component, including letterbox

    - *event.detail.height* the height of the component, including letterbox
 )

Examples & API Documentation
----------------------------

[API Docs](docs)


[Copy Camera Image to a Canvas](/examples/camera-copy-to-canvas.html)

[Find and list Web Cameras](/examples/camera-find-cameras.html)

[Render Camera to Internal Canvas](/examples/camera-render-to-internal-canvas.html)

[Scale Camera Image and Copy to Canvas](/examples/camera-scale-and-copy-to-canvas.html)

[Scale Camera Canvas](/examples/camera-scale-canvas.html)

[Playback for Camera](/examples/camera-simple-playback.html)

[Steal Internal Canvas Context and Render Camera Frame to another Canvas](/examples/camera-steal-internal-canvas.html)

[Apply Chained Filter on Camera](/examples/camera-apply-chained-filter.html)

[Apply Filter on Camera](/examples/camera-apply-filter.html)


[Copy Video Image to a Canvas](/examples/video-copy-to-canvas.html)

[Render Video to Internal Canvas](/examples/video-render-to-internal-canvas.html)

[Scale Video Image and Copy to Canvas](/examples/video-scale-and-copy-to-canvas.html)

[Scale Video Canvas](/examples/video-scale-canvas.html)

[Playback for Video](/examples/video-simple-playback.html)

[Steal Internal Canvas Context and Render Video Frame to another Canvas](/examples/video-steal-internal-canvas.html)

[Apply Chained Filter on Video](/examples/video-apply-chained-filter.html)

[Apply Filter on Video](/examples/video-apply-filter.html)


