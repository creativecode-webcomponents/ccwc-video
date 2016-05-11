import CCWCVideo from './ccwc-video.es6';
import Filters from '../node_modules/ccwc-image-utils/src/webgl/filters.es6';
import Shaders from '../node_modules/ccwc-image-utils/src/webgl/shaders.es6';

export default class extends CCWCVideo {
    /**
     * initialize default class properties
     * @private
     */
    setProperties() {
        super.setProperties();

        /**
         * When the texture read (_glReadFlipCorrection) is true, this makes the display go upside down, correct the canvas by inverse scaling in the vertical
         * @type {Boolean}
         * @default false
         */
        this._flipCanvas = false;

        /**
         * use webgl
         * @type {boolean}
         * @private
         */
        this._useWebGL = false;
    };

    onResize() {
        super.onResize();
        if (this._useWebGL && this.webglProperties.renderobj) {
            this.webglProperties.renderobj.textures.width = this.videoScaledWidth;
            this.webglProperties.renderobj.textures.height = this.videoScaledHeight;
            this.canvasctx.viewport(0, 0, this.canvasElement.width, this.canvasElement.height);
        }
    }

    /**
     * on video playing handler
     */
    onPlaying() {
        super.onPlaying();
        if (this._useWebGL) {
            this.webglProperties.renderobj = this.webglProperties.setupHandler.apply(this, [this.webglProperties]);
            var event = new CustomEvent('webglsetup', { detail: { properties: this.webglProperties } });
            this.dispatchEvent(event);
        }
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
                    filtered = this.canvasctx.getImageData(0, 0, this.videoScaledWidth * this.canvasScale, this.videoScaledHeight * this.canvasScale);
                    this.canvasctx.putImageData(this.canvasFilter(filtered), 0, 0, 0, 0, this.videoScaledWidth * this.canvasScale, this.videoScaledHeight * this.canvasScale );
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
                    if (this._useWebGL) {
                        data = Filters.getCanvasPixels(this.webglProperties.renderobj);
                    } else {
                        data = this.canvasctx.getImageData(0, 0, this.videoScaledWidth * this.canvasScale, this.videoScaledHeight * this.canvasScale);
                    }
                } else {
                    // save some CPU cycles if we already did this
                    data = filtered;
                }
                break;
        }

        return data;
    };

    /**
     * setup handler for WebGL Scene
     * @param {Object} props webgl properties
     * @return renderobj
     */
    webglSetupHandler(props) {
        var filter;
        if (props.vertexShader && props.fragmentShader) {
            filter = Filters.createFilterFromShaders(props.vertexShader, props.fragmentShader)
        } else {
            filter = Filters.createFilterFromName(props.filter, props.filterLibrary);
        }

        props.textures.push({
            name: 'video',
            texture: this.videoElement,
            pixelStore: [{ property: 'UNPACK_FLIP_Y_WEBGL', value: this.webglProperties.flipTextureY }],
            index: 0});

        return Filters.createRenderObject({
            gl: this.canvasctx,
            filter: filter,
            textures: props.textures
        });
    };

    /**
     * render handler for WebGL Scene
     * @param renderobj WebGL render properties
     */
    webglRenderHandler(renderobj) {
        Filters.render(renderobj);
    };

    /**
     * parse attributes on element
     * @private
     */
    parseAttributes() {
        super.parseAttributes();
        if (this.hasAttribute('useWebGL')) {
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
        }
    };

    /**
     * element created callback
     * @private
     */
    createdCallback() {
        this.webglProperties = {
            flipTextureY: false,
            filterLibrary: Shaders,
            setupHandler: this.webglSetupHandler,
            renderHandler: this.webglRenderHandler,
            filter: 'passthrough',
            textures: []
        };

        super.createdCallback();
    };
}