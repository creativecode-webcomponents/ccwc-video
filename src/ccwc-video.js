(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.CCWCVideo = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
        }
    }return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
}();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
    }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

/**
 * CCWCVideo supports both video files and camera feeds
 * Blit your video to a canvas, get frame data, scale the frame/canvas output, and render video to an external canvas of your choosing
 */

var _class = function (_HTMLElement) {
    _inherits(_class, _HTMLElement);

    function _class() {
        _classCallCheck(this, _class);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(_class).apply(this, arguments));
    }

    _createClass(_class, [{
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
             * use webgl
             * @type {boolean}
             * @private
             */
            //this._useWebGL = false;

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
             * When the texture read (_glReadFlipCorrection) is true, this makes the display go upside down, correct the canvas by inverse scaling in the vertical
             * @type {Boolean}
             * @default false
             */
            //this._flipCanvas = false;

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
        }

        /**
         * on video playing handler
         */

    }, {
        key: 'onPlaying',
        value: function onPlaying() {
            this.isPlaying = true;
            var event = new CustomEvent('videoplaying', {
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

            /*if (this._useWebGL) {
                this.webglProperties.renderobj = this.webglProperties.setupHandler.apply(this, [this.webglProperties]);
                var event = new CustomEvent('webglsetup', { detail: { properties: this.webglProperties } });
                this.dispatchEvent(event);
              }*/
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

            // set video/canvas to component size
            this.videoElement.setAttribute('width', this.videoScaledWidth);
            this.videoElement.setAttribute('height', this.videoScaledHeight);
            this.canvasElement.setAttribute('width', this.videoScaledWidth);
            this.canvasElement.setAttribute('height', this.videoScaledHeight);
            this.videoElement.style.top = this.letterBoxTop + 'px';
            this.videoElement.style.left = this.letterBoxLeft + 'px';
            this.canvasElement.style.top = this.letterBoxTop + 'px';
            this.canvasElement.style.left = this.letterBoxLeft + 'px';
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
            var data, filtered;
            if (!mode) {
                mode = this.frameDataMode;
            }
            if (!noredraw) {
                if (this._useWebGL) {
                    this.webglProperties.renderobj.textures.update('video');
                    this.webglProperties.renderHandler(this.webglProperties.renderobj);
                } else {
                    this.canvasctx.drawImage(this.videoElement, 0, 0, this.videoScaledWidth * this.canvasScale, this.videoScaledHeight * this.canvasScale);

                    if (this.canvasFilter) {
                        filtered = this.canvasctx.getImageData(0, 0, this.videoScaledWidth * this.canvasScale, this.videoScaledHeight * this.canvasScale);
                        this.canvasctx.putImageData(this.canvasFilter(filtered), 0, 0, 0, 0, this.videoScaledWidth * this.canvasScale, this.videoScaledHeight * this.canvasScale);
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
                        //if (this._useWebGL) {
                        //  data = ccwc.image.webgl.filter.getCanvasPixels(this.webglProperties.renderobj);
                        //} else {
                        data = this.canvasctx.getImageData(0, 0, this.videoScaledWidth * this.canvasScale, this.videoScaledHeight * this.canvasScale);
                        //}
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
            var _this2 = this;

            this.cameraSources = [];
            MediaStreamTrack.getSources(function (sources) {
                _this2.onCameraSources(sources);
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
            var _this3 = this;

            this.videoElement.src = URL.createObjectURL(stream);
            this.videoElement.onloadedmetadata = function (e) {
                _this3.onResize();
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
         * setup handler for WebGL Scene
         * @param {Object} props webgl properties
         * @return renderobj
         */
        /*webglSetupHandler(props) {
            var filter;
            if (props.vertexShader && props.fragmentShader) {
                filter = ccwc.image.webgl.filter.createFilterFromShaders(props.vertexShader, props.fragmentShader)
            } else {
                filter = ccwc.image.webgl.filter.createFilterFromName(props.filter, props.filterLibrary);
            }
              props.textures.push({
                name: 'video',
                texture: document.querySelector('ccwc-video').videoElement,
                pixelStore: [{ property: 'UNPACK_FLIP_Y_WEBGL', value: this.webglProperties.flipTextureY }],
                index: 0});
              return ccwc.image.webgl.filter.createRenderObject({
                gl: this.canvasctx,
                filter: filter,
                textures: props.textures
            });
        };*/

        /**
         * render handler for WebGL Scene
         * @param renderobj WebGL render properties
         */
        /*webglRenderHandler(renderobj) {
            ccwc.image.webgl.filter.render(renderobj);
        };*/

        /**
         * parse attributes on element
         * @private
         */
        value: function parseAttributes() {
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

            /*if (this.hasAttribute('useWebGL')) {
                this._useWebGL = true;
                var props = this.getAttribute('useWebGL');
                if (props) {
                    props = JSON.parse(props);
                    if (props.flipTextureY) {
                        this.webglProperties.flipTextureY = props.flipTextureY;
                    }
                    if (props.filter) {
                        this.webglProperties.filter = props.filter;
                    }
                }
            }
              if (this.hasAttribute('flipCanvas')) {
                this._flipCanvas = true;
            }*/

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
            /*this.webglProperties = {
                flipTextureY: false,
                filterLibrary: ccwc.image.webgl.shaders,
                setupHandler: this.webglSetupHandler,
                renderHandler: this.webglRenderHandler,
                filter: 'passthrough',
                textures: []
            };*/

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
            var _this4 = this;

            var template = this.owner.querySelector("template");
            var clone = template.content.cloneNode(true);
            this.root = this.createShadowRoot();
            this.root.appendChild(clone);

            window.addEventListener('HTMLImportsLoaded', function (e) {
                _this4.onResize();
            });

            this.videoElement = this.root.querySelector('#vid');
            this.videoElement.addEventListener('play', function (e) {
                return _this4.onPlaying(e);
            });
            this.canvasElement = this.root.querySelector('#canvas');

            if (this._flipCanvas) {
                this.canvasElement.style.transform = 'scale(1, -1)';
            }
            this.videoElement.onloadedmetadata = function (e) {
                _this4.onResize();
            };

            this.source = this._source;
            if (this.useCanvasForDisplay) {
                this.videoElement.style.display = 'none';
            } else {
                this.canvasElement.style.display = 'none';
            }

            if (this.canvasRefreshInterval > 0) {
                this.tick = setInterval(function () {
                    if (_this4.width === 0 || _this4.height === 0) {
                        return;
                    }
                    if (!_this4.isPlaying) {
                        return;
                    }
                    var event = new CustomEvent('frameupdate', { detail: {
                            framedata: _this4.getCurrentFrameData(),
                            canvascontext: _this4.canvasctx,
                            videoWidth: _this4.videoScaledWidth * _this4.canvasScale,
                            videoHeight: _this4.videoScaledHeight * _this4.canvasScale,
                            videoLeft: _this4.letterBoxLeft * _this4.canvasScale,
                            videoTop: _this4.letterBoxTop * _this4.canvasScale,
                            width: _this4.width * _this4.canvasScale,
                            height: _this4.height * _this4.canvasScale } });

                    _this4.dispatchEvent(event);
                }, this.canvasRefreshInterval);
            }

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
            this._canvasOverride = true;
        }
    }]);

    return _class;
}(HTMLElement);

exports.default = _class;

},{"fs":1}]},{},[2])(2)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9saWIvX2VtcHR5LmpzIiwic3JjXFxjY3djLXZpZGVvLmVzNiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztpQkNnQlEsQUFBSyxVQU5PLEFBTVosQUFBZTs7Ozs7Ozs7Ozs7Ozs7QUFOSCxBQU1aLGdCQWNBLENBQUEsQUFBSyxhQXBCTyxBQW9CWixBQUFrQjs7Ozs7O2dCQU1sQixDQUFBLEFBQUssVUExQk8sQUEwQlosQUFBZTs7Ozs7O2dCQU1mLENBQUEsQUFBSyxZQWhDTyxBQWdDWixBQUFpQjs7Ozs7O2dCQU1qQixDQUFBLEFBQUssbUJBdENPLEFBc0NaLEFBQXdCOzs7Ozs7Z0JBTXhCLENBQUEsQUFBSyxtQkE1Q08sQUE0Q1osQUFBd0I7Ozs7OztnQkFNeEIsQ0FBQSxBQUFLLG9CQWxETyxBQWtEWixBQUF5Qjs7Ozs7OztnQkFPekIsQ0FBQSxBQUFLLGdCQXpETyxBQXlEWixBQUFxQjs7Ozs7OztnQkFPckIsQ0FBQSxBQUFLLHNCQWhFTyxBQWdFWixBQUEyQjs7Ozs7OztnQkFPM0IsQ0FBQSxBQUFLLGVBdkVPLEFBdUVaLEFBQW9COzs7Ozs7Ozs7Ozs7OztnQkFjcEIsQ0FBQSxBQUFLLHdCQXJGTyxBQXFGWixBQUE2Qjs7Ozs7OztnQkFPN0IsQ0FBQSxBQUFLLGVBNUZPLEFBNEZaLEFBQW9COzs7Ozs7Z0JBTXBCLENBQUEsQUFBSyxnQkFsR08sQUFrR1osQUFBcUI7Ozs7Ozs7Z0JBT3JCLENBQUEsQUFBSyxnQkF6R08sQUF5R1osQUFBcUI7Ozs7Ozs7Z0JBT3JCLENBQUEsQUFBSyxPQWhITyxBQWdIWixBQUFZOzs7Ozs7O2dCQU9aLENBQUEsQUFBSyxPQXZITyxB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LEFBQ3hCO3FCQUFBLEFBQUssb0JBREYsQUFBcUIsQUFDeEIsQUFBeUI7YUFEdEIsTUFFQSxBQUNIO3FCQUFBLEFBQUssYUFBTCxBQUFrQixNQUhmLEFBRUEsQUFDSCxBQUF3Qjs7Ozs7Ozs7NEJBUW5CLEFBQ1Q7bUJBQU8sS0FERSxBQUNGLEFBQUs7Ozs7Ozs7Ozs0QkFPSSxBQUNoQjttQkFBTyxLQURTLEFBQ1QsQUFBSzs7Ozs7OzswQkFPRSxTQUFTLEFBQ3ZCO2lCQUFBLEFBQUssWUFEa0IsQUFDdkIsQUFBaUIsQUFDakI7aUJBQUEsQUFBSyxrQkFGa0IsQUFFdkIsQUFBdUI7Ozs7O0VBN1NGIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIiIsIi8qKlxyXG4gKiBDQ1dDVmlkZW8gc3VwcG9ydHMgYm90aCB2aWRlbyBmaWxlcyBhbmQgY2FtZXJhIGZlZWRzXHJcbiAqIEJsaXQgeW91ciB2aWRlbyB0byBhIGNhbnZhcywgZ2V0IGZyYW1lIGRhdGEsIHNjYWxlIHRoZSBmcmFtZS9jYW52YXMgb3V0cHV0LCBhbmQgcmVuZGVyIHZpZGVvIHRvIGFuIGV4dGVybmFsIGNhbnZhcyBvZiB5b3VyIGNob29zaW5nXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBleHRlbmRzIEhUTUxFbGVtZW50IHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIGluaXRpYWxpemUgZGVmYXVsdCBjbGFzcyBwcm9wZXJ0aWVzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBzZXRQcm9wZXJ0aWVzKCkge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIHZpZGVvIHNvdXJjZSBmaWxlIG9yIHN0cmVhbVxyXG4gICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XHJcbiAgICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLl9zb3VyY2UgPSAnJztcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogdXNlIHdlYmdsXHJcbiAgICAgICAgICogQHR5cGUge2Jvb2xlYW59XHJcbiAgICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICAvL3RoaXMuX3VzZVdlYkdMID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIHVzZSBjYW1lcmFcclxuICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cclxuICAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuX3VzZUNhbWVyYSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBpcyBjb21wb25lbnQgcmVhZHlcclxuICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmlzUmVhZHkgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogaXMgdmlkZW8gcGxheWluZ1xyXG4gICAgICAgICAqIEB0eXBlIHtib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuaXNQbGF5aW5nID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIHdpZHRoIG9mIHNjYWxlZCB2aWRlb1xyXG4gICAgICAgICAqIEB0eXBlIHtpbnR9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy52aWRlb1NjYWxlZFdpZHRoID0gMDtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogd2lkdGggb2Ygc2NhbGVkIHZpZGVvXHJcbiAgICAgICAgICogQHR5cGUge2ludH1cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnZpZGVvU2NhbGVkV2lkdGggPSAwO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBoZWlnaHQgb2Ygc2NhbGVkIHZpZGVvXHJcbiAgICAgICAgICogQHR5cGUge2ludH1cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnZpZGVvU2NhbGVkSGVpZ2h0ID0gMDtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogd2hhdCB0eXBlIG9mIGRhdGEgY29tZXMgYmFjayB3aXRoIGZyYW1lIGRhdGEgZXZlbnRcclxuICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxyXG4gICAgICAgICAqIEBkZWZhdWx0IGltYWdlZGF0YXVybFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuZnJhbWVEYXRhTW9kZSA9ICdub25lJztcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogZGV0ZXJtaW5lcyB3aGV0aGVyIHRvIHVzZSB0aGUgY2FudmFzIGVsZW1lbnQgZm9yIGRpc3BsYXkgaW5zdGVhZCBvZiB0aGUgdmlkZW8gZWxlbWVudFxyXG4gICAgICAgICAqIEB0eXBlIHtib29sZWFufVxyXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy51c2VDYW52YXNGb3JEaXNwbGF5ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGNhbnZhcyBmaWx0ZXIgZnVuY3Rpb24gKG1hbmlwdWxhdGUgcGl4ZWxzKVxyXG4gICAgICAgICAqIEB0eXBlIHttZXRob2R9XHJcbiAgICAgICAgICogQGRlZmF1bHQgMCBtc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuY2FudmFzRmlsdGVyID0gbnVsbDtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogV2hlbiB0aGUgdGV4dHVyZSByZWFkIChfZ2xSZWFkRmxpcENvcnJlY3Rpb24pIGlzIHRydWUsIHRoaXMgbWFrZXMgdGhlIGRpc3BsYXkgZ28gdXBzaWRlIGRvd24sIGNvcnJlY3QgdGhlIGNhbnZhcyBieSBpbnZlcnNlIHNjYWxpbmcgaW4gdGhlIHZlcnRpY2FsXHJcbiAgICAgICAgICogQHR5cGUge0Jvb2xlYW59XHJcbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcclxuICAgICAgICAgKi9cclxuICAgICAgICAvL3RoaXMuX2ZsaXBDYW52YXMgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogcmVmcmVzaCBpbnRlcnZhbCB3aGVuIHVzaW5nIHRoZSBjYW52YXMgZm9yIGRpc3BsYXlcclxuICAgICAgICAgKiBAdHlwZSB7aW50fVxyXG4gICAgICAgICAqIEBkZWZhdWx0IDAgbXNcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmNhbnZhc1JlZnJlc2hJbnRlcnZhbCA9IDA7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIHZpZGVvIGVsZW1lbnRcclxuICAgICAgICAgKiBAdHlwZSB7SFRNTEVsZW1lbnR9XHJcbiAgICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnZpZGVvRWxlbWVudCA9IG51bGw7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGNhbWVyYSBzb3VyY2VzIGxpc3RcclxuICAgICAgICAgKiBAdHlwZSB7QXJyYXl9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5jYW1lcmFTb3VyY2VzID0gW107XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGNhbnZhcyBlbGVtZW50XHJcbiAgICAgICAgICogQHR5cGUge0NhbnZhc31cclxuICAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuY2FudmFzRWxlbWVudCA9IG51bGw7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGNvbXBvbmVudCBzaGFkb3cgcm9vdFxyXG4gICAgICAgICAqIEB0eXBlIHtTaGFkb3dSb290fVxyXG4gICAgICAgICAqIEBwcml2YXRlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5yb290ID0gbnVsbDtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogaW50ZXJ2YWwgdGltZXIgdG8gZHJhdyBmcmFtZSByZWRyYXdzXHJcbiAgICAgICAgICogQHR5cGUge2ludH1cclxuICAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMudGljayA9IG51bGw7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGNhbnZhcyBjb250ZXh0XHJcbiAgICAgICAgICogQHR5cGUge0NhbnZhc0NvbnRleHR9XHJcbiAgICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmNhbnZhc2N0eCA9IG51bGw7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGhhcyB0aGUgY2FudmFzIGNvbnRleHQgYmVlbiBvdmVycmlkZGVuIGZyb20gdGhlIG91dHNpZGU/XHJcbiAgICAgICAgICogQHR5cGUge2Jvb2xlYW59XHJcbiAgICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLl9jYW52YXNPdmVycmlkZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiB3aWR0aCBvZiBjb21wb25lbnRcclxuICAgICAgICAgKiBAdHlwZSB7aW50fVxyXG4gICAgICAgICAqIEBkZWZhdWx0IDBcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLndpZHRoID0gMDtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogaGVpZ2h0IG9mIGNvbXBvbmVudFxyXG4gICAgICAgICAqIEB0eXBlIHtpbnR9XHJcbiAgICAgICAgICogQGRlZmF1bHQgMFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gMDtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogbGVmdCBvZmZzZXQgZm9yIGxldHRlcmJveCBvZiB2aWRlb1xyXG4gICAgICAgICAqIEB0eXBlIHtpbnR9XHJcbiAgICAgICAgICogQGRlZmF1bHQgMFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMubGV0dGVyQm94TGVmdCA9IDA7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIHRvcCBvZmZzZXQgZm9yIGxldHRlcmJveCBvZiB2aWRlb1xyXG4gICAgICAgICAqIEB0eXBlIHtpbnR9XHJcbiAgICAgICAgICogQGRlZmF1bHQgMFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMubGV0dGVyQm94VG9wID0gMDtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogYXNwZWN0IHJhdGlvIG9mIHZpZGVvXHJcbiAgICAgICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmFzcGVjdFJhdGlvID0gMDtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogcmVuZGVyIHNjYWxlIGZvciBjYW52YXMgZnJhbWUgZGF0YVxyXG4gICAgICAgICAqIGJlc3QgdXNlZCB3aGVuIGdyYWJiaW5nIGZyYW1lIGRhdGEgYXQgYSBkaWZmZXJlbnQgc2l6ZSB0aGFuIHRoZSBzaG93biB2aWRlb1xyXG4gICAgICAgICAqIEBhdHRyaWJ1dGUgY2FudmFzU2NhbGVcclxuICAgICAgICAgKiBAdHlwZSB7ZmxvYXR9XHJcbiAgICAgICAgICogQGRlZmF1bHQgMS4wXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5jYW52YXNTY2FsZSA9IDEuMDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIG9uIHZpZGVvIHBsYXlpbmcgaGFuZGxlclxyXG4gICAgICovXHJcbiAgICBvblBsYXlpbmcoKSB7XHJcbiAgICAgICAgdGhpcy5pc1BsYXlpbmcgPSB0cnVlO1xyXG4gICAgICAgIHZhciBldmVudCA9IG5ldyBDdXN0b21FdmVudCgndmlkZW9wbGF5aW5nJywge1xyXG4gICAgICAgICAgICBkZXRhaWw6IHtcclxuICAgICAgICAgICAgICAgIHNvdXJjZTogdGhpcy5zb3VyY2UsXHJcbiAgICAgICAgICAgICAgICB2aWRlb0VsZW1lbnQ6IHRoaXMudmlkZW9FbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgdmlkZW9XaWR0aDogdGhpcy52aWRlb1NjYWxlZFdpZHRoLFxyXG4gICAgICAgICAgICAgICAgdmlkZW9IZWlnaHQ6IHRoaXMudmlkZW9TY2FsZWRIZWlnaHQsXHJcbiAgICAgICAgICAgICAgICB3aWR0aDogdGhpcy53aWR0aCxcclxuICAgICAgICAgICAgICAgIGhlaWdodDogdGhpcy5oZWlnaHQgfSB9KTtcclxuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xyXG5cclxuICAgICAgICB0aGlzLmNhbnZhc0VsZW1lbnQud2lkdGggPSB0aGlzLnZpZGVvU2NhbGVkV2lkdGggKiB0aGlzLmNhbnZhc1NjYWxlO1xyXG4gICAgICAgIHRoaXMuY2FudmFzRWxlbWVudC5oZWlnaHQgPSB0aGlzLnZpZGVvU2NhbGVkSGVpZ2h0ICogdGhpcy5jYW52YXNTY2FsZTtcclxuXHJcbiAgICAgICAgdmFyIGN0eHN0cmluZyA9IHRoaXMuX3VzZVdlYkdMID8gJ3dlYmdsJyA6ICcyZCc7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9jYW52YXNPdmVycmlkZSkge1xyXG4gICAgICAgICAgICB0aGlzLmNhbnZhc2N0eCA9IHRoaXMuY2FudmFzRWxlbWVudC5nZXRDb250ZXh0KGN0eHN0cmluZyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKmlmICh0aGlzLl91c2VXZWJHTCkge1xyXG4gICAgICAgICAgICB0aGlzLndlYmdsUHJvcGVydGllcy5yZW5kZXJvYmogPSB0aGlzLndlYmdsUHJvcGVydGllcy5zZXR1cEhhbmRsZXIuYXBwbHkodGhpcywgW3RoaXMud2ViZ2xQcm9wZXJ0aWVzXSk7XHJcbiAgICAgICAgICAgIHZhciBldmVudCA9IG5ldyBDdXN0b21FdmVudCgnd2ViZ2xzZXR1cCcsIHsgZGV0YWlsOiB7IHByb3BlcnRpZXM6IHRoaXMud2ViZ2xQcm9wZXJ0aWVzIH0gfSk7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChldmVudCk7XHJcblxyXG4gICAgICAgIH0qL1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogdXBkYXRlIGNhbnZhcyBkaW1lbnNpb25zIHdoZW4gcmVzaXplZFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgb25SZXNpemUoKSB7XHJcbiAgICAgICAgLy8gc2V0IHNpemUgcHJvcGVydGllcyBiYXNlZCBvbiBjb21wb25lbnQgaGVpZ2h0XHJcbiAgICAgICAgdGhpcy53aWR0aCA9IHRoaXMub2Zmc2V0V2lkdGg7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSB0aGlzLm9mZnNldEhlaWdodDtcclxuXHJcbiAgICAgICAgLy8gY2FsY3VsYXRlIGFzcGVjdCByYXRpb1xyXG4gICAgICAgIHRoaXMuYXNwZWN0UmF0aW8gPSB0aGlzLnZpZGVvRWxlbWVudC52aWRlb1dpZHRoIC8gdGhpcy52aWRlb0VsZW1lbnQudmlkZW9IZWlnaHQ7XHJcbiAgICAgICAgdGhpcy52aWRlb1NjYWxlZFdpZHRoID0gdGhpcy53aWR0aDtcclxuICAgICAgICB0aGlzLnZpZGVvU2NhbGVkSGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XHJcblxyXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBsZXR0ZXJib3ggYm9yZGVyc1xyXG4gICAgICAgIHZhciBjb21wb25lbnRBc3BlY3RSYXRpbyA9IHRoaXMud2lkdGgvdGhpcy5oZWlnaHQ7XHJcbiAgICAgICAgaWYgKGNvbXBvbmVudEFzcGVjdFJhdGlvIDwgdGhpcy5hc3BlY3RSYXRpbykge1xyXG4gICAgICAgICAgICB0aGlzLnZpZGVvU2NhbGVkSGVpZ2h0ID0gdGhpcy53aWR0aCAvIHRoaXMuYXNwZWN0UmF0aW87XHJcbiAgICAgICAgICAgIHRoaXMubGV0dGVyQm94VG9wID0gdGhpcy5oZWlnaHQvMiAtIHRoaXMudmlkZW9TY2FsZWRIZWlnaHQvMjtcclxuICAgICAgICAgICAgdGhpcy5sZXR0ZXJCb3hMZWZ0ID0gMDtcclxuICAgICAgICB9IGVsc2UgaWYgKGNvbXBvbmVudEFzcGVjdFJhdGlvID4gdGhpcy5hc3BlY3RSYXRpbykge1xyXG4gICAgICAgICAgICB0aGlzLnZpZGVvU2NhbGVkV2lkdGggPSB0aGlzLmhlaWdodCAqIHRoaXMuYXNwZWN0UmF0aW87XHJcbiAgICAgICAgICAgIHRoaXMubGV0dGVyQm94TGVmdCA9IHRoaXMud2lkdGgvMiAtIHRoaXMudmlkZW9TY2FsZWRXaWR0aC8yO1xyXG4gICAgICAgICAgICB0aGlzLmxldHRlckJveFRvcCA9IDA7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5sZXR0ZXJCb3hUb3AgPSAwO1xyXG4gICAgICAgICAgICB0aGlzLmxldHRlckJveExlZnQgPSAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gc2V0IHZpZGVvL2NhbnZhcyB0byBjb21wb25lbnQgc2l6ZVxyXG4gICAgICAgIHRoaXMudmlkZW9FbGVtZW50LnNldEF0dHJpYnV0ZSgnd2lkdGgnLCB0aGlzLnZpZGVvU2NhbGVkV2lkdGgpO1xyXG4gICAgICAgIHRoaXMudmlkZW9FbGVtZW50LnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgdGhpcy52aWRlb1NjYWxlZEhlaWdodCk7XHJcbiAgICAgICAgdGhpcy5jYW52YXNFbGVtZW50LnNldEF0dHJpYnV0ZSgnd2lkdGgnLCB0aGlzLnZpZGVvU2NhbGVkV2lkdGgpO1xyXG4gICAgICAgIHRoaXMuY2FudmFzRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIHRoaXMudmlkZW9TY2FsZWRIZWlnaHQpO1xyXG4gICAgICAgIHRoaXMudmlkZW9FbGVtZW50LnN0eWxlLnRvcCA9IHRoaXMubGV0dGVyQm94VG9wICsgJ3B4JztcclxuICAgICAgICB0aGlzLnZpZGVvRWxlbWVudC5zdHlsZS5sZWZ0ID0gdGhpcy5sZXR0ZXJCb3hMZWZ0ICsgJ3B4JztcclxuICAgICAgICB0aGlzLmNhbnZhc0VsZW1lbnQuc3R5bGUudG9wID0gdGhpcy5sZXR0ZXJCb3hUb3AgKyAncHgnO1xyXG4gICAgICAgIHRoaXMuY2FudmFzRWxlbWVudC5zdHlsZS5sZWZ0ID0gdGhpcy5sZXR0ZXJCb3hMZWZ0ICsgJ3B4JztcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2V0IHZpZGVvIHNvdXJjZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmcgfCBpbnR9IHNyYyB2aWRlbyBzb3VyY2UgdXJpXHJcbiAgICAgKi9cclxuICAgIHNldCBzb3VyY2Uoc3JjKSB7XHJcbiAgICAgICAgaWYgKCFzcmMpIHsgcmV0dXJuOyB9XHJcbiAgICAgICAgdGhpcy5fc291cmNlID0gc3JjO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5fdXNlQ2FtZXJhICYmIHRoaXMuY2FtZXJhU291cmNlcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgdGhpcy5yZWZyZXNoQ2FtZXJhU291cmNlcygpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5fdXNlQ2FtZXJhIHx8IHBhcnNlSW50KHNyYykgPT09IHNyYykge1xyXG4gICAgICAgICAgICB0aGlzLnNldENhbWVyYVNvdXJjZUJ5SW5kZXgoc3JjKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX3VzZUNhbWVyYSkge1xyXG4gICAgICAgICAgICB0aGlzLnNldENhbWVyYVNvdXJjZUJ5SUQoc3JjKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnZpZGVvRWxlbWVudC5zcmMgPSBzcmM7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIGdldCB2aWRlbyBzb3VyY2VcclxuICAgICAqIEByZXR1cm4ge3N0cmluZyB8IGludH0gc3JjIHZpZGVvIHNvdXJjZSB1cmlcclxuICAgICAqL1xyXG4gICAgZ2V0IHNvdXJjZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc291cmNlO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIGdldCBjYW52YXMgY29udGV4dCBmb3IgZHJhd2luZyBpbnRvIGl0XHJcbiAgICAgKiBAcmV0dXJuIHtvYmplY3R9IGNvbnRleHQgY2FudmFzIGNvbnRleHRcclxuICAgICAqL1xyXG4gICAgZ2V0IGNhbnZhc0NvbnRleHQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FudmFzY3R4O1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIGdldCBjYW52YXMgY29udGV4dCBmb3IgZHJhd2luZyBpbnRvIGl0XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gY29udGV4dCBjYW52YXMgY29udGV4dFxyXG4gICAgICovXHJcbiAgICBzZXQgY2FudmFzQ29udGV4dChjb250ZXh0KSB7XHJcbiAgICAgICAgdGhpcy5jYW52YXNjdHggPSBjb250ZXh0O1xyXG4gICAgICAgIHRoaXMuX2NhbnZhc092ZXJyaWRlID0gdHJ1ZTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBnZXQgaW1hZ2UgZGF0YSBmb3IgY3VycmVudCBmcmFtZVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBtb2RlIGRhdGEgbW9kZSAoYmluYXJ5IG9yIGJhc2U2NClcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gbm9yZWRyYXcgZG8gbm90IHBlcmZvcm0gcmVkcmF3IChjYW4gYmUgd2FzdGVmdWwpXHJcbiAgICAgKiBAcmV0dXJuIHtvYmplY3R9IGltYWdlIGRhdGFcclxuICAgICAqL1xyXG4gICAgZ2V0Q3VycmVudEZyYW1lRGF0YShtb2RlLCBub3JlZHJhdykge1xyXG4gICAgICAgIHZhciBkYXRhLCBmaWx0ZXJlZDtcclxuICAgICAgICBpZiAoIW1vZGUpIHtcclxuICAgICAgICAgICAgbW9kZSA9IHRoaXMuZnJhbWVEYXRhTW9kZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFub3JlZHJhdykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fdXNlV2ViR0wpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMud2ViZ2xQcm9wZXJ0aWVzLnJlbmRlcm9iai50ZXh0dXJlcy51cGRhdGUoJ3ZpZGVvJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLndlYmdsUHJvcGVydGllcy5yZW5kZXJIYW5kbGVyKHRoaXMud2ViZ2xQcm9wZXJ0aWVzLnJlbmRlcm9iaik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc2N0eC5kcmF3SW1hZ2UoXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52aWRlb0VsZW1lbnQsIDAsIDAsXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52aWRlb1NjYWxlZFdpZHRoICogdGhpcy5jYW52YXNTY2FsZSxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnZpZGVvU2NhbGVkSGVpZ2h0ICogdGhpcy5jYW52YXNTY2FsZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY2FudmFzRmlsdGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyZWQgPSB0aGlzLmNhbnZhc2N0eC5nZXRJbWFnZURhdGEoMCwgMCwgdGhpcy52aWRlb1NjYWxlZFdpZHRoICogdGhpcy5jYW52YXNTY2FsZSwgdGhpcy52aWRlb1NjYWxlZEhlaWdodCAqIHRoaXMuY2FudmFzU2NhbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzY3R4LnB1dEltYWdlRGF0YSh0aGlzLmNhbnZhc0ZpbHRlcihmaWx0ZXJlZCksIDAsIDAsIDAsIDAsIHRoaXMudmlkZW9TY2FsZWRXaWR0aCAqIHRoaXMuY2FudmFzU2NhbGUsIHRoaXMudmlkZW9TY2FsZWRIZWlnaHQgKiB0aGlzLmNhbnZhc1NjYWxlICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzd2l0Y2ggKG1vZGUpIHtcclxuICAgICAgICAgICAgLypjYXNlICdiaW5hcnknOlxyXG4gICAgICAgICAgICAgICAgdmFyIGJhc2U2NERhdGEgPSBkYXRhLnJlcGxhY2UoJ2RhdGE6aW1hZ2UvcG5nO2Jhc2U2NCcsICcnKTtcclxuICAgICAgICAgICAgICAgIHZhciBiaW5hcnlEYXRhID0gbmV3IEJ1ZmZlcihiYXNlNjREYXRhLCAnYmFzZTY0Jyk7XHJcbiAgICAgICAgICAgICAgICBkYXRhID0gYmluYXJ5RGF0YTtcclxuICAgICAgICAgICAgICAgIGJyZWFrOyovXHJcblxyXG4gICAgICAgICAgICBjYXNlICdpbWFnZWRhdGF1cmwnOlxyXG4gICAgICAgICAgICAgICAgZGF0YSA9IHRoaXMuY2FudmFzRWxlbWVudC50b0RhdGFVUkwoJ2ltYWdlL3BuZycpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICBjYXNlICdpbWFnZWRhdGEnOlxyXG4gICAgICAgICAgICAgICAgaWYgKCFmaWx0ZXJlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vaWYgKHRoaXMuX3VzZVdlYkdMKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAvLyAgZGF0YSA9IGNjd2MuaW1hZ2Uud2ViZ2wuZmlsdGVyLmdldENhbnZhc1BpeGVscyh0aGlzLndlYmdsUHJvcGVydGllcy5yZW5kZXJvYmopO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YSA9IHRoaXMuY2FudmFzY3R4LmdldEltYWdlRGF0YSgwLCAwLCB0aGlzLnZpZGVvU2NhbGVkV2lkdGggKiB0aGlzLmNhbnZhc1NjYWxlLCB0aGlzLnZpZGVvU2NhbGVkSGVpZ2h0ICogdGhpcy5jYW52YXNTY2FsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy99XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHNhdmUgc29tZSBDUFUgY3ljbGVzIGlmIHdlIGFscmVhZHkgZGlkIHRoaXNcclxuICAgICAgICAgICAgICAgICAgICBkYXRhID0gZmlsdGVyZWQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIHNldCBjYW1lcmEgc291cmNlIGJ5IGluZGV4XHJcbiAgICAgKiBAcGFyYW0ge2ludH0gaW5kZXhcclxuICAgICAqL1xyXG4gICAgc2V0Q2FtZXJhU291cmNlQnlJbmRleChpbmRleCkge1xyXG4gICAgICAgIGlmICghaW5kZXggfHwgaW5kZXggPj0gdGhpcy5jYW1lcmFTb3VyY2VzLmxlbmd0aCkgeyBjb25zb2xlLmxvZyhcIlZpZGVvIFNvdXJjZSBJbmRleCBkb2VzIG5vdCBleGlzdFwiKTsgcmV0dXJuOyB9XHJcbiAgICAgICAgdGhpcy5zZXRDYW1lcmFTb3VyY2VCeUlEKHRoaXMuY2FtZXJhU291cmNlc1tpbmRleF0uaWQpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIHNldCBjYW1lcmEgc291cmNlIGJ5IGlkXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gaWRcclxuICAgICAqL1xyXG4gICAgc2V0Q2FtZXJhU291cmNlQnlJRChpZCkge1xyXG4gICAgICAgIG5hdmlnYXRvci53ZWJraXRHZXRVc2VyTWVkaWEoXHJcbiAgICAgICAgICAgIHsgdmlkZW86IHtvcHRpb25hbDogW3tzb3VyY2VJZDogaWQgfV19fSxcclxuICAgICAgICAgICAgdGhpcy5vbkNhbWVyYVN0cmVhbS5iaW5kKHRoaXMpLFxyXG4gICAgICAgICAgICBmdW5jdGlvbigpIHt9XHJcbiAgICAgICAgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZWZyZXNoIGNhbWVyYSBzb3VyY2VzXHJcbiAgICAgKi9cclxuICAgIHJlZnJlc2hDYW1lcmFTb3VyY2VzKCkge1xyXG4gICAgICAgIHRoaXMuY2FtZXJhU291cmNlcyA9IFtdO1xyXG4gICAgICAgIE1lZGlhU3RyZWFtVHJhY2suZ2V0U291cmNlcyggc291cmNlcyA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMub25DYW1lcmFTb3VyY2VzKHNvdXJjZXMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIG9uIGNhbWVyYSB2aWRlbyBzb3VyY2Ugc3RyZWFtXHJcbiAgICAgKiBAcGFyYW0gc3RyZWFtXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBvbkNhbWVyYVN0cmVhbShzdHJlYW0pIHtcclxuICAgICAgICB0aGlzLnZpZGVvRWxlbWVudC5zcmMgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKHN0cmVhbSk7XHJcbiAgICAgICAgdGhpcy52aWRlb0VsZW1lbnQub25sb2FkZWRtZXRhZGF0YSA9IGUgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm9uUmVzaXplKCk7XHJcbiAgICAgICAgfTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBvbiBjYW1lcmEgc291cmNlcyBjYWxsYmFja1xyXG4gICAgICogQHBhcmFtIHthcnJheX0gc291cmNlcyBmb3VuZFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgb25DYW1lcmFTb3VyY2VzKHNvdXJjZXMpIHtcclxuICAgICAgICB2YXIgc3RvcmFnZUluZGV4ID0gMDtcclxuICAgICAgICBmb3IgKHZhciBpPTA7IGkgPCBzb3VyY2VzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChzb3VyY2VzW2ldLmtpbmQgPT0gJ3ZpZGVvJykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGxhYmVsID0gc291cmNlc1tpXS5sYWJlbDtcclxuICAgICAgICAgICAgICAgIGlmIChsYWJlbCA9PSBcIlwiKSB7IGxhYmVsID0gXCJ2aWRlbyBcIiArIE51bWJlcihzdG9yYWdlSW5kZXgrMSk7IH1cclxuICAgICAgICAgICAgICAgIHNvdXJjZXNbc3RvcmFnZUluZGV4XSA9IHNvdXJjZXNbaV0uaWQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbWVyYVNvdXJjZXMucHVzaCh7IGxhYmVsOiBsYWJlbCwgaWQ6IHNvdXJjZXNbaV0uaWQgfSk7XHJcbiAgICAgICAgICAgICAgICBzdG9yYWdlSW5kZXgrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KCdjYW1lcmFzZm91bmQnLCB7IGRldGFpbDogeyBjYW1lcmFzOiB0aGlzLmNhbWVyYVNvdXJjZXMgfSB9KTtcclxuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgIGlmICh0aGlzLl9zb3VyY2UpIHsgdGhpcy5zb3VyY2UgPSB0aGlzLl9zb3VyY2U7IH1cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzYXZlIGN1cnJlbnQgZnJhbWUgdG8gZmlsZVxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGggZmlsZSBwYXRoXHJcbiAgICAgKi9cclxuICAgIHNhdmVDdXJyZW50RnJhbWVUb0ZpbGUocGF0aCkge1xyXG4gICAgICAgIHZhciBmcyA9IHJlcXVpcmUoJ2ZzJyk7XHJcbiAgICAgICAgaWYgKCFmcykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoaXMgbWV0aG9kIHVzZXMgTm9kZS5qcyBmdW5jdGlvbmFsaXR5LCBhbmQgeW91IGFyZSBub3QgcnVubmluZyB3aXRoaW4gTm9kZS5qcycpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgZGF0YSA9IHRoaXMuZ2V0Q3VycmVudEZyYW1lRGF0YSgpLnRvU3RyaW5nKCdiaW5hcnknKTtcclxuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKHBhdGgsIGRhdGEsICdiaW5hcnknKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzZXR1cCBoYW5kbGVyIGZvciBXZWJHTCBTY2VuZVxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHByb3BzIHdlYmdsIHByb3BlcnRpZXNcclxuICAgICAqIEByZXR1cm4gcmVuZGVyb2JqXHJcbiAgICAgKi9cclxuICAgIC8qd2ViZ2xTZXR1cEhhbmRsZXIocHJvcHMpIHtcclxuICAgICAgICB2YXIgZmlsdGVyO1xyXG4gICAgICAgIGlmIChwcm9wcy52ZXJ0ZXhTaGFkZXIgJiYgcHJvcHMuZnJhZ21lbnRTaGFkZXIpIHtcclxuICAgICAgICAgICAgZmlsdGVyID0gY2N3Yy5pbWFnZS53ZWJnbC5maWx0ZXIuY3JlYXRlRmlsdGVyRnJvbVNoYWRlcnMocHJvcHMudmVydGV4U2hhZGVyLCBwcm9wcy5mcmFnbWVudFNoYWRlcilcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmaWx0ZXIgPSBjY3djLmltYWdlLndlYmdsLmZpbHRlci5jcmVhdGVGaWx0ZXJGcm9tTmFtZShwcm9wcy5maWx0ZXIsIHByb3BzLmZpbHRlckxpYnJhcnkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJvcHMudGV4dHVyZXMucHVzaCh7XHJcbiAgICAgICAgICAgIG5hbWU6ICd2aWRlbycsXHJcbiAgICAgICAgICAgIHRleHR1cmU6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2Njd2MtdmlkZW8nKS52aWRlb0VsZW1lbnQsXHJcbiAgICAgICAgICAgIHBpeGVsU3RvcmU6IFt7IHByb3BlcnR5OiAnVU5QQUNLX0ZMSVBfWV9XRUJHTCcsIHZhbHVlOiB0aGlzLndlYmdsUHJvcGVydGllcy5mbGlwVGV4dHVyZVkgfV0sXHJcbiAgICAgICAgICAgIGluZGV4OiAwfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBjY3djLmltYWdlLndlYmdsLmZpbHRlci5jcmVhdGVSZW5kZXJPYmplY3Qoe1xyXG4gICAgICAgICAgICBnbDogdGhpcy5jYW52YXNjdHgsXHJcbiAgICAgICAgICAgIGZpbHRlcjogZmlsdGVyLFxyXG4gICAgICAgICAgICB0ZXh0dXJlczogcHJvcHMudGV4dHVyZXNcclxuICAgICAgICB9KTtcclxuICAgIH07Ki9cclxuXHJcbiAgICAvKipcclxuICAgICAqIHJlbmRlciBoYW5kbGVyIGZvciBXZWJHTCBTY2VuZVxyXG4gICAgICogQHBhcmFtIHJlbmRlcm9iaiBXZWJHTCByZW5kZXIgcHJvcGVydGllc1xyXG4gICAgICovXHJcbiAgICAvKndlYmdsUmVuZGVySGFuZGxlcihyZW5kZXJvYmopIHtcclxuICAgICAgICBjY3djLmltYWdlLndlYmdsLmZpbHRlci5yZW5kZXIocmVuZGVyb2JqKTtcclxuICAgIH07Ki9cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBhcnNlIGF0dHJpYnV0ZXMgb24gZWxlbWVudFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgcGFyc2VBdHRyaWJ1dGVzKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmhhc0F0dHJpYnV0ZSgndXNlQ2FtZXJhJykgfHwgdGhpcy5oYXNBdHRyaWJ1dGUoJ3VzZWNhbWVyYScpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3VzZUNhbWVyYSA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fdXNlQ2FtZXJhID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5oYXNBdHRyaWJ1dGUoJ3NyYycpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCdzcmMnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmhhc0F0dHJpYnV0ZSgndXNlQ2FudmFzRm9yRGlzcGxheScpKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXNlQ2FudmFzRm9yRGlzcGxheSA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy51c2VDYW52YXNGb3JEaXNwbGF5ID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5oYXNBdHRyaWJ1dGUoJ2ZyYW1lRGF0YU1vZGUnKSkge1xyXG4gICAgICAgICAgICB0aGlzLmZyYW1lRGF0YU1vZGUgPSB0aGlzLmdldEF0dHJpYnV0ZSgnZnJhbWVEYXRhTW9kZScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaGFzQXR0cmlidXRlKCdjYW52YXNSZWZyZXNoSW50ZXJ2YWwnKSkge1xyXG4gICAgICAgICAgICB0aGlzLmNhbnZhc1JlZnJlc2hJbnRlcnZhbCA9IHBhcnNlSW50KHRoaXMuZ2V0QXR0cmlidXRlKCdjYW52YXNSZWZyZXNoSW50ZXJ2YWwnKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5oYXNBdHRyaWJ1dGUoJ2NhbnZhc1NjYWxlJykpIHtcclxuICAgICAgICAgICAgdGhpcy5jYW52YXNTY2FsZSA9IHBhcnNlRmxvYXQodGhpcy5nZXRBdHRyaWJ1dGUoJ2NhbnZhc1NjYWxlJykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyppZiAodGhpcy5oYXNBdHRyaWJ1dGUoJ3VzZVdlYkdMJykpIHtcclxuICAgICAgICAgICAgdGhpcy5fdXNlV2ViR0wgPSB0cnVlO1xyXG4gICAgICAgICAgICB2YXIgcHJvcHMgPSB0aGlzLmdldEF0dHJpYnV0ZSgndXNlV2ViR0wnKTtcclxuICAgICAgICAgICAgaWYgKHByb3BzKSB7XHJcbiAgICAgICAgICAgICAgICBwcm9wcyA9IEpTT04ucGFyc2UocHJvcHMpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHByb3BzLmZsaXBUZXh0dXJlWSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMud2ViZ2xQcm9wZXJ0aWVzLmZsaXBUZXh0dXJlWSA9IHByb3BzLmZsaXBUZXh0dXJlWTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChwcm9wcy5maWx0ZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLndlYmdsUHJvcGVydGllcy5maWx0ZXIgPSBwcm9wcy5maWx0ZXI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmhhc0F0dHJpYnV0ZSgnZmxpcENhbnZhcycpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZsaXBDYW52YXMgPSB0cnVlO1xyXG4gICAgICAgIH0qL1xyXG5cclxuICAgICAgICBpZiAodGhpcy5jYW52YXNSZWZyZXNoSW50ZXJ2YWwgPT09IDAgJiYgdGhpcy51c2VDYW52YXNGb3JEaXNwbGF5KSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdXYXJuaW5nOiBVc2luZyBjYW52YXMgZm9yIGRpc3BsYXksIGJ1dCB0aGUgY2FudmFzIHJlZnJlc2ggaW50ZXJ2YWwgaXMgbm90IHNldCBvciBzZXQgdG8gMC4gU2V0dGluZyByZWZyZXNoIGludGVydmFsIHRvIDI1MG1zLicpO1xyXG4gICAgICAgICAgICB0aGlzLmNhbnZhc1JlZnJlc2hJbnRlcnZhbCA9IDI1MDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogZWxlbWVudCBjcmVhdGVkIGNhbGxiYWNrXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBjcmVhdGVkQ2FsbGJhY2soKSB7XHJcbiAgICAgICAgLyp0aGlzLndlYmdsUHJvcGVydGllcyA9IHtcclxuICAgICAgICAgICAgZmxpcFRleHR1cmVZOiBmYWxzZSxcclxuICAgICAgICAgICAgZmlsdGVyTGlicmFyeTogY2N3Yy5pbWFnZS53ZWJnbC5zaGFkZXJzLFxyXG4gICAgICAgICAgICBzZXR1cEhhbmRsZXI6IHRoaXMud2ViZ2xTZXR1cEhhbmRsZXIsXHJcbiAgICAgICAgICAgIHJlbmRlckhhbmRsZXI6IHRoaXMud2ViZ2xSZW5kZXJIYW5kbGVyLFxyXG4gICAgICAgICAgICBmaWx0ZXI6ICdwYXNzdGhyb3VnaCcsXHJcbiAgICAgICAgICAgIHRleHR1cmVzOiBbXVxyXG4gICAgICAgIH07Ki9cclxuXHJcbiAgICAgICAgdGhpcy5zZXRQcm9wZXJ0aWVzKCk7XHJcbiAgICAgICAgdGhpcy5wYXJzZUF0dHJpYnV0ZXMoKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBlbGVtZW50IGF0dGFjaGVkIGNhbGxiYWNrXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBhdHRhY2hlZENhbGxiYWNrKCkge1xyXG4gICAgICAgIGxldCB0ZW1wbGF0ZSA9IHRoaXMub3duZXIucXVlcnlTZWxlY3RvcihcInRlbXBsYXRlXCIpO1xyXG4gICAgICAgIGxldCBjbG9uZSA9IHRlbXBsYXRlLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgICAgIHRoaXMucm9vdCA9IHRoaXMuY3JlYXRlU2hhZG93Um9vdCgpO1xyXG4gICAgICAgIHRoaXMucm9vdC5hcHBlbmRDaGlsZChjbG9uZSk7XHJcblxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdIVE1MSW1wb3J0c0xvYWRlZCcsIGUgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm9uUmVzaXplKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMudmlkZW9FbGVtZW50ID0gdGhpcy5yb290LnF1ZXJ5U2VsZWN0b3IoJyN2aWQnKTtcclxuICAgICAgICB0aGlzLnZpZGVvRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdwbGF5JywgZSA9PiB0aGlzLm9uUGxheWluZyhlKSk7XHJcbiAgICAgICAgdGhpcy5jYW52YXNFbGVtZW50ID0gdGhpcy5yb290LnF1ZXJ5U2VsZWN0b3IoJyNjYW52YXMnKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX2ZsaXBDYW52YXMpIHtcclxuICAgICAgICAgICAgdGhpcy5jYW52YXNFbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9ICdzY2FsZSgxLCAtMSknO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnZpZGVvRWxlbWVudC5vbmxvYWRlZG1ldGFkYXRhID0gZSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMub25SZXNpemUoKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnNvdXJjZSA9IHRoaXMuX3NvdXJjZTtcclxuICAgICAgICBpZiAodGhpcy51c2VDYW52YXNGb3JEaXNwbGF5KSB7XHJcbiAgICAgICAgICAgIHRoaXMudmlkZW9FbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5jYW52YXNFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5jYW52YXNSZWZyZXNoSW50ZXJ2YWwgPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMudGljayA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLndpZHRoID09PSAwIHx8IHRoaXMuaGVpZ2h0ID09PSAwKSB7IHJldHVybjsgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmlzUGxheWluZykgeyByZXR1cm47IH1cclxuICAgICAgICAgICAgICAgIHZhciBldmVudCA9IG5ldyBDdXN0b21FdmVudCgnZnJhbWV1cGRhdGUnLCB7IGRldGFpbDoge1xyXG4gICAgICAgICAgICAgICAgICAgIGZyYW1lZGF0YTogdGhpcy5nZXRDdXJyZW50RnJhbWVEYXRhKCksXHJcbiAgICAgICAgICAgICAgICAgICAgY2FudmFzY29udGV4dDogdGhpcy5jYW52YXNjdHgsXHJcbiAgICAgICAgICAgICAgICAgICAgdmlkZW9XaWR0aDogdGhpcy52aWRlb1NjYWxlZFdpZHRoICogdGhpcy5jYW52YXNTY2FsZSxcclxuICAgICAgICAgICAgICAgICAgICB2aWRlb0hlaWdodDogdGhpcy52aWRlb1NjYWxlZEhlaWdodCAqIHRoaXMuY2FudmFzU2NhbGUsXHJcbiAgICAgICAgICAgICAgICAgICAgdmlkZW9MZWZ0OiB0aGlzLmxldHRlckJveExlZnQgKiB0aGlzLmNhbnZhc1NjYWxlLFxyXG4gICAgICAgICAgICAgICAgICAgIHZpZGVvVG9wOiB0aGlzLmxldHRlckJveFRvcCAqIHRoaXMuY2FudmFzU2NhbGUsXHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHRoaXMud2lkdGggKiB0aGlzLmNhbnZhc1NjYWxlLFxyXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogdGhpcy5oZWlnaHQgKiB0aGlzLmNhbnZhc1NjYWxlIH19KTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgICAgICB9LCB0aGlzLmNhbnZhc1JlZnJlc2hJbnRlcnZhbCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmlzUmVhZHkgPSB0cnVlO1xyXG4gICAgICAgIHZhciBldmVudCA9IG5ldyBDdXN0b21FdmVudCgncmVhZHknKTtcclxuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIGVsZW1lbnQgZGV0YWNoZWQgY2FsbGJhY2tcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIGRldGFjaGVkQ2FsbGJhY2soKSB7fTtcclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2tcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gYXR0ciBhdHRyaWJ1dGUgY2hhbmdlZFxyXG4gICAgICogQHBhcmFtIHsqfSBvbGRWYWwgb2xkIHZhbHVlXHJcbiAgICAgKiBAcGFyYW0geyp9IG5ld1ZhbCBuZXcgdmFsdWVcclxuICAgICAqL1xyXG4gICAgYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrKGF0dHIsIG9sZFZhbCwgbmV3VmFsKSB7fTtcclxufSJdfQ==
