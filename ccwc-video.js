/**
 * CCWCVideo supports both video files and camera feeds
 * Blit your video to a canvas, get frame data, scale the frame/canvas output, and render video to an external canvas of your choosing
 */
export default class CCWCVideo extends HTMLElement {

    static get ON_VIDEO_PLAYING() { return 'videoplaying'; }
    static get ON_FRAME_UPDATE() { return 'frameupdate'; }
    static get ON_READY() { return 'ready'; }

    /**
     * initialize default class properties
     * @private
     */
    constructor() {
        super();
        /**
         * video source file or stream
         * @type {string}
         * @private
         */
        this._source = '';

        /**
         * use camera
         * @type {boolean}
         * @private
         */
        this._useCamera = false;

        /**
         * is component ready
         * @type {boolean}
         */
        this.isReady = false;

        /**
         * is video playing
         * @type {boolean}
         */
        this.isPlaying = false;

        /**
         * width of scaled video
         * @type {int}
         */
        this.videoScaledWidth = 0;

        /**
         * height of scaled video
         * @type {int}
         */
        this.videoScaledHeight = 0;

        /**
         * how the video is scaled
         * @type {string}
         * @default letterbox
         */
        this.videoScaleMode = 'contain';

        /**
         * what type of data comes back with frame data event
         * @type {string}
         * @default imagedataurl
         */
        this.frameDataMode = 'none';

        /**
         * determines whether to use the canvas element for display instead of the video element
         * @type {boolean}
         * @default false
         */
        this.useCanvasForDisplay = false;

        /**
         * canvas filter function (manipulate pixels)
         * @type {method}
         * @default 0 ms
         */
        this.canvasFilter = this.canvasFilter ? this.canvasFilter : null;

        /**
         * refresh interval when using the canvas for display
         * @type {int}
         * @default 0 ms
         */
        this.canvasRefreshInterval = 0;

        /**
         * video element
         * @type {HTMLElement}
         * @private
         */
        this.videoElement = null;

        /**
         * camera sources list
         * @type {Array}
         */
        this.cameraSources = [];

        /**
         * canvas element
         * @type {Canvas}
         * @private
         */
        this.canvasElement = null;

        /**
         * component shadow root
         * @type {ShadowRoot}
         * @private
         */
        this.root = null;

        /**
         * interval timer to draw frame redraws
         * @type {int}
         * @private
         */
        this.tick = null;

        /**
         * canvas context
         * @type {CanvasContext}
         * @private
         */
        this.canvasctx = null;

        /**
         * has the canvas context been overridden from the outside?
         * @type {boolean}
         * @private
         */
        this._canvasOverride = false;

        /**
         * width of component
         * @type {int}
         * @default 0
         */
        this.width = 0;

        /**
         * height of component
         * @type {int}
         * @default 0
         */
        this.height = 0;

        /**
         * left offset for letterbox of video
         * @type {int}
         * @default 0
         */
        this.letterBoxLeft = 0;

        /**
         * top offset for letterbox of video
         * @type {int}
         * @default 0
         */
        this.letterBoxTop = 0;

        /**
         * aspect ratio of video
         * @type {number}
         */
        this.aspectRatio = 0;

        /**
         * render scale for canvas frame data
         * best used when grabbing frame data at a different size than the shown video
         * @attribute canvasScale
         * @type {float}
         * @default 1.0
         */
        this.canvasScale = 1.0;

        /**
         * visible area bounding box
         * whether letterboxed or cropped, will report visible video area
         * does not include positioning in element, so if letterboxing, x and y will be reported as 0
         * @type {{x: number, y: number, width: number, height: number}}
         */
        this.visibleVideoRect = { x: 0, y: 0, width: 0, height: 0 };

        this.template = `
                <style>
                    ccwc-video {
                        display: inline-block;
                        background-color: black;
                        position: relative;
                        overflow: hidden;
                    }
                    
                    ccwc-video > canvas {
                        position: absolute;
                    }
                    
                    ccwc-video > video {
                        position: absolute;
                    }
                </style>

                <video autoplay="true"></video>
                <canvas></canvas>`;
    }

    /**
     * on video playing handler
     */
    onPlaying() {
        this.isPlaying = true;
        var event = new CustomEvent(CCWCVideo.ON_VIDEO_PLAYING, {
            detail: {
                source: this.source,
                videoElement: this.videoElement,
                videoWidth: this.videoScaledWidth,
                videoHeight: this.videoScaledHeight,
                width: this.width,
                height: this.height } });
        this.dispatchEvent(event);

        this.canvasElement.width = this.videoScaledWidth * this.canvasScale;
        this.canvasElement.height = this.videoScaledHeight * this.canvasScale;

        var ctxstring = this._useWebGL ? 'webgl' : '2d';
        if (!this._canvasOverride) {
            this.canvasctx = this.canvasElement.getContext(ctxstring);
        }
    }

    /**
     * update canvas dimensions when resized
     * @private
     */
    onResize() {
        if (this.offsetWidth === 0 || this.offsetHeight === 0) {
            return;
        }
        // set size properties based on component height
        this.width = this.offsetWidth;
        this.height = this.offsetHeight;

        if (this.videoElement.videoWidth > 0 && this.videoElement.videoHeight > 0) {
            this.aspectRatio = this.videoElement.videoWidth / this.videoElement.videoHeight;
        }

        this.videoScaledWidth = this.width;
        this.videoScaledHeight = this.height;
        var componentAspectRatio = this.width/this.height;

        if (this.videoScaleMode === 'contain') {
            // calculate letterbox borders
            if (componentAspectRatio < this.aspectRatio) {
                this.videoScaledHeight = this.width / this.aspectRatio;
                this.letterBoxTop = this.height/2 - this.videoScaledHeight/2;
                this.letterBoxLeft = 0;
            } else if (componentAspectRatio > this.aspectRatio) {
                this.videoScaledWidth = this.height * this.aspectRatio;
                this.letterBoxLeft = this.width/2 - this.videoScaledWidth/2;
                this.letterBoxTop = 0;
            } else {
                this.letterBoxTop = 0;
                this.letterBoxLeft = 0;
            }

            this.visibleVideoRect.x = 0;
            this.visibleVideoRect.y = 0;
            this.visibleVideoRect.width = this.videoScaledWidth;
            this.visibleVideoRect.height = this.videoScaledHeight;

        } else if (this.videoScaleMode === 'cover') {
            if (componentAspectRatio > this.aspectRatio) {
                this.videoScaledWidth = this.width;
                this.videoScaledHeight = this.width / this.aspectRatio;
                this.letterBoxLeft = 0;
                this.letterBoxTop = -(this.videoScaledHeight/2 - this.height/2);
            } else {
                this.videoScaledHeight = this.height;
                this.videoScaledWidth = this.height * this.aspectRatio;
                this.letterBoxTop = 0;
                this.letterBoxLeft = -(this.videoScaledWidth/2 - this.width/2);
            }

            this.visibleVideoRect.x = -(this.letterBoxLeft);
            this.visibleVideoRect.y = -(this.letterBoxTop);
            this.visibleVideoRect.width = this.videoScaledWidth - (this.visibleVideoRect.x *2);
            this.visibleVideoRect.height = this.videoScaledHeight - (this.visibleVideoRect.y *2);
        }

        // set video/canvas to component size
        this.videoElement.setAttribute('width', this.videoScaledWidth);
        this.videoElement.setAttribute('height', this.videoScaledHeight);
        this.canvasElement.setAttribute('width', this.videoScaledWidth);
        this.canvasElement.setAttribute('height', this.videoScaledHeight);
        this.videoElement.style.top = this.letterBoxTop + 'px';
        this.videoElement.style.left = this.letterBoxLeft + 'px';
        this.canvasElement.style.top = this.letterBoxTop + 'px';
        this.canvasElement.style.left = this.letterBoxLeft + 'px';
    };

    /**
     * set video source
     * @param {string | int} src video source uri
     */
    set source(src) {
        if (this._useCamera) {
            navigator.mediaDevices.getUserMedia({ audio: false, video: true }).then( stream => this.onCameraStream(stream));
        } else {
            this.videoElement.src = src;
            this._source = src;

        }

        /*if (this._useCamera && this.cameraSources.length === 0) {
            this.refreshCameraSources();
            return;
        }

        if (this._useCamera || parseInt(src) === src) {
            this.setCameraSourceByIndex(src);
        } else if (this._useCamera) {
            this.setCameraSourceByID(src);
        } else {
            this.videoElement.src = src;
        }*/
    };

    /**
     * get video source
     * @return {string | int} src video source uri
     */
    get source() {
        return this._source;
    };

    /**
     * get canvas context for drawing into it
     * @return {object} context canvas context
     */
    get canvasContext() {
        return this.canvasctx;
    };

    /**
     * get canvas context for drawing into it
     * @param {object} context canvas context
     */
    set canvasContext(context) {
        this.canvasctx = context;
        this._canvasOverride = true;
    };

    /**
     * get image data for current frame
     * @param {boolean} mode data mode (binary or base64)
     * @param {boolean} noredraw do not perform redraw (can be wasteful)
     * @return {object} image data
     */
    getCurrentFrameData(mode, noredraw) {
        var data, filtered;
        if (!mode) {
            mode = this.frameDataMode;
        }
        if (!noredraw) {
            if (this._useWebGL) {
                this.webglProperties.renderobj.textures.update('video');
                this.webglProperties.renderHandler(this.webglProperties.renderobj);
            } else {
                this.canvasctx.drawImage(
                    this.videoElement, 0, 0,
                    this.videoScaledWidth * this.canvasScale,
                    this.videoScaledHeight * this.canvasScale);

                if (this.canvasFilter) {
                    filtered = this.canvasctx.getImageData(
                        this.visibleVideoRect.x * this.canvasScale,
                        this.visibleVideoRect.y * this.canvasScale,
                        this.visibleVideoRect.width * this.canvasScale,
                        this.visibleVideoRect.height * this.canvasScale);

                    this.canvasctx.putImageData(this.canvasFilter(filtered),
                        0, 0, 0, 0,
                        this.visibleVideoRect.width * this.canvasScale,
                        this.visibleVideoRect.height * this.canvasScale );
                }
            }

        }

        switch (mode) {
            /*case 'binary':
                var base64Data = data.replace('data:image/png;base64', '');
                var binaryData = new Buffer(base64Data, 'base64');
                data = binaryData;
                break;*/

            case 'imagedataurl':
                data = this.canvasElement.toDataURL('image/png');
                break;

            case 'imagedata':
                if (!filtered) {
                    data = this.canvasctx.getImageData(
                        this.visibleVideoRect.x * this.canvasScale,
                        this.visibleVideoRect.y * this.canvasScale,
                        this.visibleVideoRect.width * this.canvasScale,
                        this.visibleVideoRect.height * this.canvasScale);
                } else {
                    // save some CPU cycles if we already did this
                    data = filtered;
                }
                break;
        }

        return data;
    };

    /**
     * set camera source by index
     * @param {int} index
     */
    /*setCameraSourceByIndex(index) {
        if (!index || index >= this.cameraSources.length) { console.log("Video Source Index does not exist"); return; }
        this.setCameraSourceByID(this.cameraSources[index].id);
    };*/

    /**
     * set camera source by id
     * @param {String} id
     */
    /*setCameraSourceByID(id) {
        navigator.webkitGetUserMedia(
            { video: {optional: [{sourceId: id }]}},
            this.onCameraStream.bind(this),
            function() {}
        );
    };*/

    /**
     * refresh camera sources
     */
    /*refreshCameraSources() {
        this.cameraSources = [];
        MediaDevices.enumerateDevices()( sources => {
            this.onCameraSources(sources);
        });
    };*/

    /**
     * on camera video source stream
     * @param stream
     * @private
     */
    onCameraStream(stream) {
        this.videoElement.src = URL.createObjectURL(stream);
        this.videoElement.onloadedmetadata = e => {
            this.onResize();
        };
    };

    /**
     * on camera sources callback
     * @param {array} sources found
     * @private
     */
    /*onCameraSources(sources) {
        var storageIndex = 0;
        for (var i=0; i < sources.length; i++) {
            if (sources[i].kind == 'video') {
                var label = sources[i].label;
                if (label == "") { label = "video " + Number(storageIndex+1); }
                sources[storageIndex] = sources[i].id;
                this.cameraSources.push({ label: label, id: sources[i].id });
                storageIndex++;
            }
        }

        var event = new CustomEvent('camerasfound', { detail: { cameras: this.cameraSources } });
        this.dispatchEvent(event);
        if (this._source) { this.source = this._source; }
    };*/

    /**
     * parse attributes on element
     * @private
     */
    parseAttributes() {
        if (this.hasAttribute('useCamera') || this.hasAttribute('usecamera')) {
            this._useCamera = true;
        } else {
            this._useCamera = false;
        }

        if (this.hasAttribute('src')) {
            this._source = this.getAttribute('src');
        }

        if (this.hasAttribute('useCanvasForDisplay')) {
            this.useCanvasForDisplay = true;
        } else {
            this.useCanvasForDisplay = false;
        }

        if (this.hasAttribute('frameDataMode')) {
            this.frameDataMode = this.getAttribute('frameDataMode');
        }

        if (this.hasAttribute('canvasRefreshInterval')) {
            this.canvasRefreshInterval = parseInt(this.getAttribute('canvasRefreshInterval'));
        }

        if (this.hasAttribute('canvasScale')) {
            this.canvasScale = parseFloat(this.getAttribute('canvasScale'));
        }

        if (this.hasAttribute('videoScaleMode')) {
            this.videoScaleMode = this.getAttribute('videoScaleMode');
        }

        if (this.canvasRefreshInterval === 0 && this.useCanvasForDisplay) {
            console.log('Warning: Using canvas for display, but the canvas refresh interval is not set or set to 0. Setting refresh interval to 250ms.');
            this.canvasRefreshInterval = 250;
        }

        if (this.hasAttribute('backgroundColor')) {
            this.style.backgroundColor = this.getAttribute('backgroundColor');
        }
    };

    /**
     * element attached callback
     * @private
     */
    connectedCallback() {
        this.parseAttributes();
        this.innerHTML = this.template;
        this.root = this;

        window.addEventListener('resize', e => { this.onResize(); });

        this.videoElement = this.root.querySelector('video');
        this.videoElement.addEventListener('play', e => this.onPlaying(e));
        this.canvasElement = this.root.querySelector('canvas');

        if (this._flipCanvas) {
            this.canvasElement.style.transform = 'scale(1, -1)';
        }
        this.videoElement.onloadedmetadata = e => {
            this.onResize();
        };

        this.source = this._source;
        if (this.useCanvasForDisplay) {
            this.videoElement.style.display = 'none';
        } else {
            this.canvasElement.style.display = 'none';
        }

        if (this.canvasRefreshInterval > 0) {
            this.tick = setInterval(() => {
                if (this.width === 0 || this.height === 0) { return; }
                if (!this.isPlaying) { return; }
                var event = new CustomEvent(CCWCVideo.ON_FRAME_UPDATE, { detail: {
                    framedata: this.getCurrentFrameData(),
                    canvascontext: this.canvasctx,
                    visibleVideoRect: this.visibleVideoRect,
                    videoWidth: this.videoScaledWidth * this.canvasScale,
                    videoHeight: this.videoScaledHeight * this.canvasScale,
                    videoLeft: this.letterBoxLeft * this.canvasScale,
                    videoTop: this.letterBoxTop * this.canvasScale,
                    width: this.width * this.canvasScale,
                    height: this.height * this.canvasScale }});

                this.dispatchEvent(event);
            }, this.canvasRefreshInterval);
        }

        this.isReady = true;
        var event = new CustomEvent(CCWCVideo.ON_READY);
        this.dispatchEvent(event);
    };

    disconnectedCallback() {}
    attributeChangedCallback(attributeName, oldValue, newValue, namespace) {}
    adoptedCallback(oldDocument, newDocument) {}
}

if (!customElements.get('ccwc-video')) {
    customElements.define('ccwc-video', CCWCVideo);
}
