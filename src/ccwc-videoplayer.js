"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CCWCVideoPlayer = (function (_HTMLElement) {
    _inherits(CCWCVideoPlayer, _HTMLElement);

    function CCWCVideoPlayer() {
        _classCallCheck(this, CCWCVideoPlayer);

        _get(Object.getPrototypeOf(CCWCVideoPlayer.prototype), "constructor", this).apply(this, arguments);
    }

    _createClass(CCWCVideoPlayer, [{
        key: "setProperties",
        value: function setProperties() {
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
    }, {
        key: "onResize",
        value: function onResize() {
            // set size properties based on component height
            this.width = this.offsetWidth;
            this.height = this.offsetHeight;

            // set video to component size
            this.videoElement.setAttribute("width", this.width);
            this.videoElement.setAttribute("height", this.height);

            // set canvas to component size
            this.canvasElement.setAttribute("width", this.width);
            this.canvasElement.setAttribute("height", this.height);

            // calculate scale values for real video vs component size
            this.scaleX = this.width / this.videoElement.videoWidth;
            this.scaleY = this.height / this.videoElement.videoHeight;

            // calculate aspect ratio
            this.aspectRatio = this.videoElement.videoWidth / this.videoElement.videoHeight;

            // calculate letterbox borders
            var componentAspectRatio = this.width / this.height;
            if (componentAspectRatio < this.aspectRatio) {
                var newVideoHeight = this.width / this.aspectRatio;
                this.letterBoxTop = this.height - newVideoHeight;
                this.letterBoxLeft = 0;
            } else if (componentAspectRatio > this.aspectRatio) {
                var newVideoWidth = this.height / this.aspectRatio;
                this.letterBoxLeft = this.width - newVideoWidth;
                this.letterBoxTop = 0;
            } else {
                this.letterBoxTop = 0;
                this.letterBoxLeft = 0;
            }
        }
    }, {
        key: "setSource",

        /**
         * get canvas context
         * @method get canvas context for drawing into it
         * @return {object} canvas context
         */
        value: function setSource(src) {
            if (src != "") {
                this.source = src;
                this.videoElement.src = src;
            }
        }
    }, {
        key: "getCanvasContext",

        /**
         * get canvas context
         * @method get canvas context for drawing into it
         * @return {object} canvas context
         */
        value: function getCanvasContext() {
            return this.canvasctx;
        }
    }, {
        key: "getCurrentFrameData",

        /**
         * get image data for current frame
         *
         * @method getCurrentFrameData
         * @param {boolean} data mode (binary or base64)
         * @param {boolean} do not perform redraw (can be wasteful)
         * @return {object} image data
         */
        value: function getCurrentFrameData(mode, noredraw) {
            var data;
            if (!mode) {
                mode = this.frameDataMode;
            }
            if (!noredraw) {
                this.canvasElement.setAttribute('width', this.width);
                this.canvasElement.setAttribute('height', this.height);
                this.canvasctx.drawImage(this.videoElement, 0, 0);
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
                    data = this.canvasctx.getImageData(0, 0, this.width, this.height);
                    break;
            }

            // todo: non-binary mode for assigning data to image elements for example
            return data;
        }
    }, {
        key: "saveCurrentFrameToFile",

        /**
         * save current frame to file
         *
         * @method saveCurrentFrameToFile
         * @param file path
         * @param image type
         */
        value: function saveCurrentFrameToFile(pth) {
            var fs = require('fs');
            if (!fs) {
                throw new Error('This method uses Node.js functionality, and you are not running within Node.js');
            }
            var data = this.getCurrentFrameData().toString('binary');
            fs.writeFileSync(pth, data, 'binary');
        }
    }, {
        key: "parseAttributes",

        /**
         * parse attributes on element
         */
        value: function parseAttributes() {
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
        }
    }, {
        key: "createdCallback",

        // Fires when an instance of the element is created.
        value: function createdCallback() {
            this.setProperties();
            this.parseAttributes();
        }
    }, {
        key: "attachedCallback",

        // Fires when an instance was inserted into the document.
        value: function attachedCallback() {
            var _this = this;

            var template = this.owner.querySelector("template");
            var clone = template.content.cloneNode(true);
            this.root = this.createShadowRoot();
            this.root.appendChild(clone);

            window.addEventListener('HTMLImportsLoaded', function (e) {
                _this.onResize();
            });

            this.videoElement = this.root.querySelector('#vid');
            this.canvasElement = this.root.querySelector('#canvas');
            this.videoElement.onloadedmetadata = function (e) {
                _this.onResize();
            };
            this.setSource(this.source);

            if (this.useCanvasForDisplay) {
                this.videoElement.style.display = 'none';
                this.tick = setInterval(function () {
                    if (_this.width === 0 || _this.height === 0) {
                        return;
                    }
                    _this.canvasctx.drawImage(_this.videoElement, 0, 0);
                    var event = new CustomEvent('frameupdate', { detail: {
                            framedata: _this.getCurrentFrameData(null, true),
                            canvascontext: _this.canvasctx,
                            width: _this.width,
                            height: _this.height } });

                    _this.root.dispatchEvent(event);
                }, this.canvasRefreshInterval);
            } else {
                this.canvasElement.style.display = 'none';
            }
            this.canvasctx = this.canvasElement.getContext("2d");
        }
    }, {
        key: "detachedCallback",

        // Fires when an instance was removed from the document.
        value: function detachedCallback() {}
    }, {
        key: "attributeChangedCallback",

        // Fires when an attribute was added, removed, or updated.
        value: function attributeChangedCallback(attr, oldVal, newVal) {
            console.log(attr, oldVal);
        }
    }]);

    return CCWCVideoPlayer;
})(HTMLElement);

CCWCVideoPlayer.prototype.owner = (document._currentScript || document.currentScript).ownerDocument;
document.registerElement('ccwc-videoplayer', CCWCVideoPlayer);

//# sourceMappingURL=ccwc-videoplayer.js.map