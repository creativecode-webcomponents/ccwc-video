class CCWCVideoPlayer extends HTMLElement {
    setProperties() {
        /**
         * video source file or stream
         * @attribute source
         * @type string
         */
        this.source = "";

        /**
         * what type of data comes back with frame data event
         * @attribute frameDataMode
         * @type String
         * @default imagedataurl
         */
        this.frameDataMode = 'imagedataurl';

        /**
         * determines whether to use the canvas element for display instead of the video element
         * @attribute useCanvasForDisplay
         * @type boolean
         * @default false
         */
        this.useCanvasForDisplay = false;

        /**
         * refresh interval when using the canvas for display
         * @attribute canvasRefreshInterval
         * @type int
         * @default 250 ms
         */
        this.canvasRefreshInterval = 250;

        /**
         * width of component
         * @attribute width
         * @type int
         * @default 0
         */
        this.width = 0;

        /**
         * height of component
         * @attribute height
         * @type int
         * @default 0
         */
        this.height = 0;

        /**
         * left offset for letterbox of video
         * @attribute letterBoxLeft
         * @type int
         * @default 0
         */
        this.letterBoxLeft = 0;

        /**
         * top offset for letterbox of video
         * @attribute letterBoxTop
         * @type int
         * @default 0
         */
        this.letterBoxTop = 0;

        /**
         * aspect ratio of video
         * @attribute aspectRatio
         * @type float
         * @default 0
         */
        this.aspectRatio = 0;

        /**
         * horizontal scale of video compared to original format
         * @attribute scaleX
         * @type float
         * @default 0
         */
        this.scaleX = 0;

        /**
         * vertical scale of video compared to original format
         * @attribute scaleY
         * @type float
         * @default 0
         */
        this.scaleY = 0;
    }

    /**
     * update canvas dimensions when resized
     *
     * @method: onResize
     */
    onResize() {
        // set size properties based on component height
        this.width = this.offsetWidth;
        this.height = this.offsetHeight;

        // set video/canvas to component size
        this.videoElement.setAttribute("width", this.width);
        this.videoElement.setAttribute("height", this.height);
        this.canvasElement.setAttribute("width", this.width);
        this.canvasElement.setAttribute("height", this.height);

        // calculate scale values for real video vs component size
        this.scaleX = this.width / this.videoElement.videoWidth;
        this.scaleY = this.height / this.videoElement.videoHeight;

        // calculate aspect ratio
        this.aspectRatio = this.videoElement.videoWidth / this.videoElement.videoHeight;
        this.videoScaledWidth = this.width;
        this.videoScaledHeight = this.height;

        // calculate letterbox borders
        var componentAspectRatio = this.width/this.height;
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
    };


    /**
     * get canvas context
     * @method get canvas context for drawing into it
     * @return {object} canvas context
     */
    setSource(src) {
        if (src != "") {
            this.source = src;
            this.videoElement.src = src;
        }
    };

    /**
     * get canvas context
     * @method get canvas context for drawing into it
     * @return {object} canvas context
     */
    getCanvasContext() {
        return this.canvasctx;
    };

    /**
     * get image data for current frame
     *
     * @method getCurrentFrameData
     * @param {boolean} data mode (binary or base64)
     * @param {boolean} do not perform redraw (can be wasteful)
     * @return {object} image data
     */
    getCurrentFrameData(mode, noredraw) {
        var data;
        if (!mode) {
            mode = this.frameDataMode;
        }
        if (!noredraw) {
            this.canvasElement.setAttribute('width', this.width);
            this.canvasElement.setAttribute('height', this.height);
            this.canvasctx.drawImage(this.videoElement,
                this.letterBoxLeft, this.letterBoxTop, this.videoScaledWidth, this.videoScaledHeight,
                this.letterBoxLeft, this.letterBoxTop, this.videoScaledWidth, this.videoScaledHeight);
        }

        switch (mode) {
            case 'binary':
                var base64Data = data.replace('data:image/png;base64', "");
                var binaryData = new Buffer(base64Data, 'base64');
                data = binaryData;
                break;

            case 'imagedataurl':
                data = this.canvasElement.toDataURL("image/png");
                break;

            case 'imagedata':
                data = this.canvasctx.getImageData(this.letterBoxLeft, this.letterBoxTop, this.videoScaledWidth, this.videoScaledHeight);
                break;
        }

        // todo: non-binary mode for assigning data to image elements for example
        return data;
    };

    /**
     * save current frame to file
     *
     * @method saveCurrentFrameToFile
     * @param file path
     * @param image type
     */
    saveCurrentFrameToFile(pth) {
        var fs = require('fs');
        if (!fs) {
            throw new Error('This method uses Node.js functionality, and you are not running within Node.js');
        }
        var data = this.getCurrentFrameData().toString('binary');
        fs.writeFileSync(pth, data, 'binary');
    };

    /**
     * parse attributes on element
     */
    parseAttributes() {
        if (this.hasAttribute('src')) {
            this.source = this.getAttribute('src');
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
    };

    // Fires when an instance of the element is created.
    createdCallback() {
        this.setProperties();
        this.parseAttributes();
    };

    // Fires when an instance was inserted into the document.
    attachedCallback() {
        let template = this.owner.querySelector("template");
        let clone = template.content.cloneNode(true);
        this.root = this.createShadowRoot();
        this.root.appendChild(clone);

        window.addEventListener('HTMLImportsLoaded', e => {
            this.onResize();
        });

        this.videoElement = this.root.querySelector('#vid');
        this.canvasElement = this.root.querySelector('#canvas');
        this.videoElement.onloadedmetadata = e => {
            this.onResize();
        };
        this.setSource(this.source);

        if (this.useCanvasForDisplay) {
            this.videoElement.style.display = 'none';
            this.tick = setInterval(() => {
                if (this.width === 0 || this.height === 0) { return; }
                this.canvasctx.drawImage(this.videoElement, this.letterBoxLeft, this.letterBoxTop, this.videoScaledWidth, this.videoScaledHeight);
                var event = new CustomEvent('frameupdate', { detail: {
                    framedata: this.getCurrentFrameData(null, true),
                    canvascontext: this.canvasctx,
                    videoWidth: this.videoScaledWidth,
                    videoHeight: this.videoScaledHeight,
                    videoLeft: this.letterBoxLeft,
                    videoTop: this.letterBoxTop,
                    width: this.width,
                    height: this.height }});

                this.root.dispatchEvent(event);
            }, this.canvasRefreshInterval);
        } else {
            this.canvasElement.style.display = 'none';
        }
        this.canvasctx = this.canvasElement.getContext("2d");
    };

    // Fires when an instance was removed from the document.
    detachedCallback() {};


    // Fires when an attribute was added, removed, or updated.
    attributeChangedCallback(attr, oldVal, newVal) {
        console.log(attr, oldVal)
    };

}

CCWCVideoPlayer.prototype.owner = (document._currentScript || document.currentScript).ownerDocument;
document.registerElement('ccwc-videoplayer', CCWCVideoPlayer);