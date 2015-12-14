/**
 * CCWCVideo supports both video files and camera feeds
 * Blit your video to a canvas, get frame data, scale the frame/canvas output, and render video to an external canvas of your choosing
 */
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CCWCVideo = (function (_HTMLElement) {
    _inherits(CCWCVideo, _HTMLElement);

    function CCWCVideo() {
        _classCallCheck(this, CCWCVideo);

        _get(Object.getPrototypeOf(CCWCVideo.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(CCWCVideo, [{
        key: 'setProperties',

        /**
         * initialize default class properties
         * @private
         */
        value: function setProperties() {
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
             * width of scaled video
             * @type {int}
             */
            this.videoScaledWidth = 0;

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
            this.canvasFilter = null;

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
        }

        /**
         * on video playing handler
         */
    }, {
        key: 'onPlaying',
        value: function onPlaying() {
            var event = new CustomEvent('videoplaying', {
                detail: {
                    source: this.source,
                    videoElement: this.videoElement,
                    videoWidth: this.videoScaledWidth,
                    videoHeight: this.videoScaledHeight,
                    width: this.width,
                    height: this.height } });
            this.dispatchEvent(event);
        }

        /**
         * update canvas dimensions when resized
         * @private
         */
    }, {
        key: 'onResize',
        value: function onResize() {
            // set size properties based on component height
            this.width = this.offsetWidth;
            this.height = this.offsetHeight;

            // set video/canvas to component size
            this.videoElement.setAttribute('width', this.width);
            this.videoElement.setAttribute('height', this.height);
            this.canvasElement.setAttribute('width', this.width);
            this.canvasElement.setAttribute('height', this.height);

            // calculate aspect ratio
            this.aspectRatio = this.videoElement.videoWidth / this.videoElement.videoHeight;
            this.videoScaledWidth = this.width;
            this.videoScaledHeight = this.height;

            // calculate letterbox borders
            var componentAspectRatio = this.width / this.height;
            if (componentAspectRatio < this.aspectRatio) {
                this.videoScaledHeight = this.width / this.aspectRatio;
                this.letterBoxTop = this.height / 2 - this.videoScaledHeight / 2;
                this.letterBoxLeft = 0;
            } else if (componentAspectRatio > this.aspectRatio) {
                this.videoScaledWidth = this.height * this.aspectRatio;
                this.letterBoxLeft = this.width / 2 - this.videoScaledWidth / 2;
                this.letterBoxTop = 0;
            } else {
                this.letterBoxTop = 0;
                this.letterBoxLeft = 0;
            }
        }
    }, {
        key: 'getCurrentFrameData',

        /**
         * get image data for current frame
         * @param {boolean} mode data mode (binary or base64)
         * @param {boolean} noredraw do not perform redraw (can be wasteful)
         * @return {object} image data
         */
        value: function getCurrentFrameData(mode, noredraw) {
            var data;
            if (!mode) {
                mode = this.frameDataMode;
            }
            if (!noredraw) {
                this.canvasctx.canvas.width = this.width * this.canvasScale;
                this.canvasctx.canvas.height = this.height * this.canvasScale;
                this.canvasctx.drawImage(this.videoElement, this.letterBoxLeft, this.letterBoxTop, this.videoScaledWidth * this.canvasScale, this.videoScaledHeight * this.canvasScale);
            }

            var filtered;
            if (this.canvasFilter) {
                filtered = this.canvasctx.getImageData(this.letterBoxLeft, this.letterBoxTop, this.videoScaledWidth * this.canvasScale, this.videoScaledHeight * this.canvasScale);
                this.canvasctx.putImageData(this.canvasFilter(filtered), this.letterBoxLeft, this.letterBoxTop, 0, 0, this.videoScaledWidth * this.canvasScale, this.videoScaledHeight * this.canvasScale);
            }

            switch (mode) {
                case 'binary':
                    var base64Data = data.replace('data:image/png;base64', '');
                    var binaryData = new Buffer(base64Data, 'base64');
                    data = binaryData;
                    break;

                case 'imagedataurl':
                    data = this.canvasElement.toDataURL('image/png');
                    break;

                case 'imagedata':
                    if (!filtered) {
                        data = this.canvasctx.getImageData(this.letterBoxLeft, this.letterBoxTop, this.videoScaledWidth * this.canvasScale, this.videoScaledHeight * this.canvasScale);
                    } else {
                        // save some CPU cycles if we already did this
                        data = filtered;
                    }
                    break;
            }

            return data;
        }
    }, {
        key: 'setCameraSourceByIndex',

        /**
         * set camera source by index
         * @param {int} index
         */
        value: function setCameraSourceByIndex(index) {
            if (!index || index >= this.cameraSources.length) {
                console.log("Video Source Index does not exist");return;
            }
            this.setCameraSourceByID(this.cameraSources[index].id);
        }
    }, {
        key: 'setCameraSourceByID',

        /**
         * set camera source by id
         * @param {String} id
         */
        value: function setCameraSourceByID(id) {
            navigator.webkitGetUserMedia({ video: { optional: [{ sourceId: id }] } }, this.onCameraStream.bind(this), function () {});
        }
    }, {
        key: 'refreshCameraSources',

        /**
         * refresh camera sources
         */
        value: function refreshCameraSources() {
            var _this = this;

            this.cameraSources = [];
            MediaStreamTrack.getSources(function (sources) {
                _this.onCameraSources(sources);
            });
        }
    }, {
        key: 'onCameraStream',

        /**
         * on camera video source stream
         * @param stream
         * @private
         */
        value: function onCameraStream(stream) {
            var _this2 = this;

            this.videoElement.src = URL.createObjectURL(stream);
            this.videoElement.onloadedmetadata = function (e) {
                _this2.onResize();
            };
        }
    }, {
        key: 'onCameraSources',

        /**
         * on camera sources callback
         * @param {array} sources found
         * @private
         */
        value: function onCameraSources(sources) {
            var storageIndex = 0;
            for (var i = 0; i < sources.length; i++) {
                if (sources[i].kind == 'video') {
                    var label = sources[i].label;
                    if (label == "") {
                        label = "video " + Number(storageIndex + 1);
                    }
                    sources[storageIndex] = sources[i].id;
                    this.cameraSources.push({ label: label, id: sources[i].id });
                    storageIndex++;
                }
            }

            var event = new CustomEvent('camerasfound', { detail: { cameras: this.cameraSources } });
            this.dispatchEvent(event);
            if (this._source) {
                this.source = this._source;
            }
        }
    }, {
        key: 'saveCurrentFrameToFile',

        /**
         * save current frame to file
         * @param {String} path file path
         */
        value: function saveCurrentFrameToFile(path) {
            var fs = require('fs');
            if (!fs) {
                throw new Error('This method uses Node.js functionality, and you are not running within Node.js');
            }
            var data = this.getCurrentFrameData().toString('binary');
            fs.writeFileSync(path, data, 'binary');
        }
    }, {
        key: 'parseAttributes',

        /**
         * parse attributes on element
         * @private
         */
        value: function parseAttributes() {
            if (this.hasAttribute('useCamera')) {
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

            if (this.canvasRefreshInterval === 0 && this.useCanvasForDisplay) {
                console.log('Warning: Using canvas for display, but the canvas refresh interval is not set or set to 0. Setting refresh interval to 250ms.');
                this.canvasRefreshInterval = 250;
            }
        }
    }, {
        key: 'createdCallback',

        /**
         * element created callback
         * @private
         */
        value: function createdCallback() {
            this.setProperties();
            this.parseAttributes();
        }
    }, {
        key: 'attachedCallback',

        /**
         * element attached callback
         * @private
         */
        value: function attachedCallback() {
            var _this3 = this;

            var template = this.owner.querySelector("template");
            var clone = template.content.cloneNode(true);
            this.root = this.createShadowRoot();
            this.root.appendChild(clone);

            window.addEventListener('HTMLImportsLoaded', function (e) {
                _this3.onResize();
            });

            this.videoElement = this.root.querySelector('#vid');
            this.videoElement.addEventListener('play', function (e) {
                return _this3.onPlaying(e);
            });
            this.canvasElement = this.root.querySelector('#canvas');
            this.videoElement.onloadedmetadata = function (e) {
                _this3.onResize();
            };

            this.source = this._source;
            if (this.useCanvasForDisplay) {
                this.videoElement.style.display = 'none';
            } else {
                this.canvasElement.style.display = 'none';
            }

            if (this.canvasRefreshInterval > 0) {
                this.tick = setInterval(function () {
                    if (_this3.width === 0 || _this3.height === 0) {
                        return;
                    }
                    var event = new CustomEvent('frameupdate', { detail: {
                            framedata: _this3.getCurrentFrameData(),
                            canvascontext: _this3.canvasctx,
                            videoWidth: _this3.videoScaledWidth * _this3.canvasScale,
                            videoHeight: _this3.videoScaledHeight * _this3.canvasScale,
                            videoLeft: _this3.letterBoxLeft * _this3.canvasScale,
                            videoTop: _this3.letterBoxTop * _this3.canvasScale,
                            width: _this3.width * _this3.canvasScale,
                            height: _this3.height * _this3.canvasScale } });

                    _this3.dispatchEvent(event);
                }, this.canvasRefreshInterval);
            }
            this.canvasctx = this.canvasElement.getContext('2d');

            this.isReady = true;
            var event = new CustomEvent('ready');
            this.dispatchEvent(event);
        }
    }, {
        key: 'detachedCallback',

        /**
         * element detached callback
         * @private
         */
        value: function detachedCallback() {}
    }, {
        key: 'attributeChangedCallback',

        /**
         * attributeChangedCallback
         * @private
         * @param {String} attr attribute changed
         * @param {*} oldVal old value
         * @param {*} newVal new value
         */
        value: function attributeChangedCallback(attr, oldVal, newVal) {}
    }, {
        key: 'source',

        /**
         * set video source
         * @param {string | int} src video source uri
         */
        set: function set(src) {
            if (!src) {
                return;
            }
            this._source = src;

            if (this._useCamera && this.cameraSources.length === 0) {
                this.refreshCameraSources();
                return;
            }

            if (this._useCamera || parseInt(src) === src) {
                this.setCameraSourceByIndex(src);
            } else if (this._useCamera) {
                this.setCameraSourceByID(src);
            } else {
                this.videoElement.src = src;
            }
        },

        /**
         * get video source
         * @return {string | int} src video source uri
         */
        get: function get() {
            return this._source;
        }
    }, {
        key: 'canvasContext',

        /**
         * get canvas context for drawing into it
         * @return {object} context canvas context
         */
        get: function get() {
            return this.canvasctx;
        },

        /**
         * get canvas context for drawing into it
         * @param {object} context canvas context
         */
        set: function set(context) {
            this.canvasctx = context;
        }
    }]);

    return CCWCVideo;
})(HTMLElement);

CCWCVideo.prototype.owner = (document._currentScript || document.currentScript).ownerDocument;
document.registerElement('ccwc-video', CCWCVideo);
//# sourceMappingURL=ccwc-video.js.map
