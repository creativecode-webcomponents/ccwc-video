if (!window.ccwc) { ccwc = {}; }
if (!window.ccwc.image) { ccwc.image = {}; }
if (!window.ccwc.image.webgl) { ccwc.image.webgl = {}; }

ccwc.image.webgl.filter = {
    /**
     * create filter from shaders
     * @param vertexShader
     * @param fragmentShader
     * @returns {{vertexShader: *, fragmentShader: *}}
     */
    createFilterFromShaders: function(vertexShader, fragmentShader) {
        return { vertexShader: vertexShader, fragmentShader: fragmentShader };
    },

    /**
     * create a filter from filter name
     * @param name
     * @param memory space/variable to pull shader from
     */
    createFilterFromName: function(name, shaderloc) {
        if (!shaderloc) {
            shaderloc = ccwc.image.webgl.shaders;
        }
        if (!shaderloc[name]) {
            console.log('Shader ', name, 'not found in ', shaderloc, ' using a passthrough shader instead');
            shaderloc = ccwc.image.webgl.shaders;
            name = 'passthrough';
        }
        var vtx = shaderloc[name].vertex;
        var frg = shaderloc[name].fragment;
        return this.createFilterFromShaders(vtx, frg);
    },

    /**
     * create object for render
     * @param {Object}params
     */
    createRenderObject: function(params) {
        var props = {};

        props.gl = params.gl;
        props.width = props.gl.canvas.width;
        props.height = props.gl.canvas.height;

        if (params.width) { props.width = params.width; }
        if (params.height) { props.height = params.height; }

        props.filter = params.filter;
        props.textures = new ccwc.image.webgl.textures(props.width,props.height);

        props.canvas2DHelper = document.createElement('canvas');
        props.canvas2DHelper.width = props.width;
        props.canvas2DHelper.height = props.height;
        props.canvas2DHelperContext = props.canvas2DHelper.getContext('2d');

        props.uniforms = new ccwc.image.webgl.uniforms();
        props.textures = new ccwc.image.webgl.textures(props.gl, props.width, props.height);

        if (params.textures) {
            for (var c = 0; c < params.textures.length; c++) {
                props.textures.add(params.textures[c].name, params.textures[c].texture, params.textures[c].index, params.textures[c].pixelStore);
            }
        }

        if (params.uniforms) {
            for (var c = 0; c < params.uniforms.length; c++) {
                props.uniforms.add(params.uniforms[c].name, params.uniforms[c].type, params.uniforms[c].values);
            }
        }

        if (params.autorender) {
            return this.render(props);
        }

        return props;
    },

    /**
     * render WebGL filter on current texture
     * @param glprops
     * @param refreshTextureIndices texture refresh indices (optional)
     * @returns {*}
     */
    render: function(glprops) {
        if (!glprops.isInitialized) {
            var vertexShader = glprops.gl.createShader(glprops.gl.VERTEX_SHADER);
            glprops.gl.shaderSource(vertexShader, glprops.filter.vertexShader);
            glprops.gl.compileShader(vertexShader);

            var fragmentShader = glprops.gl.createShader(glprops.gl.FRAGMENT_SHADER);
            glprops.gl.shaderSource(fragmentShader, glprops.filter.fragmentShader);
            glprops.gl.compileShader(fragmentShader);

            glprops.program = glprops.gl.createProgram();
            glprops.gl.attachShader(glprops.program, vertexShader);
            glprops.gl.attachShader(glprops.program, fragmentShader);
            glprops.gl.linkProgram(glprops.program);
            glprops.gl.useProgram(glprops.program);

            var positionLocation = glprops.gl.getAttribLocation(glprops.program, 'a_position');
            var texCoordBuffer = glprops.gl.createBuffer();
            var rectCoordBuffer = glprops.gl.createBuffer();
            var texCoords = new Float32Array([0.0,  0.0, 1.0,  0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0,  1.0]);
            var rectCoords = new Float32Array([0, 0, glprops.textures.width, 0, 0, glprops.textures.height, 0,
                glprops.textures.height, glprops.textures.width, 0, glprops.textures.width, glprops.textures.height]);

            glprops.gl.bindBuffer(glprops.gl.ARRAY_BUFFER, texCoordBuffer);
            glprops.gl.bufferData(glprops.gl.ARRAY_BUFFER, texCoords, glprops.gl.STATIC_DRAW);

            var texCoordLocation = glprops.gl.getAttribLocation(glprops.program, 'a_texCoord');
            glprops.gl.enableVertexAttribArray(texCoordLocation);
            glprops.gl.vertexAttribPointer(texCoordLocation, 2, glprops.gl.FLOAT, false, 0, 0);

            glprops.uniforms.add('u_resolution', ccwc.image.webgl.uniforms.UNIFORM2f, [glprops.gl.canvas.width, glprops.gl.canvas.height]);
            glprops.uniforms.add('f_resolution', ccwc.image.webgl.uniforms.UNIFORM2f, [glprops.gl.canvas.width, glprops.gl.canvas.height]);

            glprops.gl.bindBuffer(glprops.gl.ARRAY_BUFFER, rectCoordBuffer);
            glprops.gl.enableVertexAttribArray(positionLocation);
            glprops.gl.vertexAttribPointer(positionLocation, 2, glprops.gl.FLOAT, false, 0, 0);
            glprops.gl.bufferData(glprops.gl.ARRAY_BUFFER, rectCoords, glprops.gl.STATIC_DRAW);
        }

        glprops.textures.initializeNewTextures(glprops.program);
        glprops.textures.refreshScene();
        glprops.uniforms.updateProgram(glprops.gl, glprops.program);

        glprops.gl.drawArrays(glprops.gl.TRIANGLES, 0, 6);
        glprops.isInitialized = true;

        return glprops;
    },

    /**
     * read pixels from GL context
     * @param glProps
     */
    getCanvasPixels: function(glprops) {
        var glctx = glprops.gl;
        if (!glprops.pixelarray) {
            glprops.pixelarray = new Uint8Array(glctx.canvas.width * glctx.canvas.height * 4);
        }
        glctx.readPixels(0, 0, glctx.canvas.width, glctx.canvas.height, glctx.RGBA, glctx.UNSIGNED_BYTE, glprops.pixelarray);
        var imgData = glprops.canvas2DHelperContext.createImageData(glctx.canvas.width, glctx.canvas.height);
        imgData.data.set(new Uint8ClampedArray(glprops.pixelarray));
        return imgData;
    }
};
ccwc.image.webgl.shaders = {
  "freichen_edge_detection": {
    "fragment": "precision mediump float; uniform sampler2D u_image0; varying vec2 v_texCoord; uniform vec2 f_resolution; vec2 texel = vec2(1.0 / f_resolution.x, 1.0 / f_resolution.y); mat3 G[9];  const mat3 g0 = mat3( 0.3535533845424652, 0, -0.3535533845424652, 0.5, 0, -0.5, 0.3535533845424652, 0, -0.3535533845424652 ); const mat3 g1 = mat3( 0.3535533845424652, 0.5, 0.3535533845424652, 0, 0, 0, -0.3535533845424652, -0.5, -0.3535533845424652 ); const mat3 g2 = mat3( 0, 0.3535533845424652, -0.5, -0.3535533845424652, 0, 0.3535533845424652, 0.5, -0.3535533845424652, 0 ); const mat3 g3 = mat3( 0.5, -0.3535533845424652, 0, -0.3535533845424652, 0, 0.3535533845424652, 0, 0.3535533845424652, -0.5 ); const mat3 g4 = mat3( 0, -0.5, 0, 0.5, 0, 0.5, 0, -0.5, 0 ); const mat3 g5 = mat3( -0.5, 0, 0.5, 0, 0, 0, 0.5, 0, -0.5 ); const mat3 g6 = mat3( 0.1666666716337204, -0.3333333432674408, 0.1666666716337204, -0.3333333432674408, 0.6666666865348816, -0.3333333432674408, 0.1666666716337204, -0.3333333432674408, 0.1666666716337204 ); const mat3 g7 = mat3( -0.3333333432674408, 0.1666666716337204, -0.3333333432674408, 0.1666666716337204, 0.6666666865348816, 0.1666666716337204, -0.3333333432674408, 0.1666666716337204, -0.3333333432674408 ); const mat3 g8 = mat3( 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408 );  void main(void) {      G[0] = g0,     G[1] = g1,     G[2] = g2,     G[3] = g3,     G[4] = g4,     G[5] = g5,     G[6] = g6,     G[7] = g7,     G[8] = g8;      mat3 I;     float cnv[9];     vec3 sampl;      for (float i=0.0; i<3.0; i++) {         for (float j=0.0; j<3.0; j++) {             sampl = texture2D(u_image0, v_texCoord + texel * vec2(i-1.0,j-1.0) ).rgb;             I[int(i)][int(j)] = length(sampl);         }     }      for (int i=0; i<9; i++) {         float dp3 = dot(G[i][0], I[0]) + dot(G[i][1], I[1]) + dot(G[i][2], I[2]);         cnv[i] = dp3 * dp3;     }      float M = (cnv[0] + cnv[1]) + (cnv[2] + cnv[3]);     float S = (cnv[4] + cnv[5]) + (cnv[6] + cnv[7]) + (cnv[8] + M);      gl_FragColor = vec4(vec3(sqrt(M/S)), texture2D( u_image0, v_texCoord ).a ); }",
    "vertex": "attribute vec2 a_position; attribute vec2 a_texCoord; uniform vec2 u_resolution; varying vec2 v_texCoord;  void main() {     vec2 zeroToOne = a_position / u_resolution;     vec2 zeroToTwo = zeroToOne * 2.0;     vec2 clipSpace = zeroToTwo - 1.0;     gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);     v_texCoord = a_texCoord; }"
  },
  "greyscale": {
    "fragment": "precision mediump float; varying vec2 v_texCoord;  uniform sampler2D u_image0;  void main(void) {     vec4 px = texture2D(u_image0, v_texCoord);     float avg = (px.r + px.g + px.b)/3.0;     gl_FragColor = vec4(avg, avg, avg, px.a); }",
    "vertex": "attribute vec2 a_position; attribute vec2 a_texCoord; uniform vec2 u_resolution; varying vec2 v_texCoord;  void main() {     vec2 zeroToOne = a_position / u_resolution;     vec2 zeroToTwo = zeroToOne * 2.0;     vec2 clipSpace = zeroToTwo - 1.0;     gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);     v_texCoord = a_texCoord; }"
  },
  "passthrough": {
    "fragment": "precision mediump float; uniform sampler2D u_image0; varying vec2 v_texCoord;  void main() {     gl_FragColor = texture2D(u_image0, v_texCoord); }",
    "vertex": "attribute vec2 a_position; attribute vec2 a_texCoord; uniform vec2 u_resolution; varying vec2 v_texCoord;  void main() {     vec2 zeroToOne = a_position / u_resolution;     vec2 zeroToTwo = zeroToOne * 2.0;     vec2 clipSpace = zeroToTwo - 1.0;     gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);     v_texCoord = a_texCoord; }"
  },
  "sepia": {
    "fragment": "precision mediump float; varying vec2 v_texCoord;  uniform sampler2D u_image0; uniform vec4 light; uniform vec4 dark; uniform float desat; uniform float toned;  const mat4 coeff = mat4(     0.393, 0.349, 0.272, 1.0,     0.796, 0.686, 0.534, 1.0,     0.189, 0.168, 0.131, 1.0,     0.0, 0.0, 0.0, 1.0 );  void main(void) {     vec4 sourcePixel = texture2D(u_image0, v_texCoord);     gl_FragColor = coeff * sourcePixel; }",
    "vertex": "attribute vec2 a_position; attribute vec2 a_texCoord; uniform vec2 u_resolution; varying vec2 v_texCoord;  void main() {     vec2 zeroToOne = a_position / u_resolution;     vec2 zeroToTwo = zeroToOne * 2.0;     vec2 clipSpace = zeroToTwo - 1.0;     gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);     v_texCoord = a_texCoord; }"
  },
  "sobel_edge_detection": {
    "fragment": "precision mediump float; varying vec2 v_texCoord; uniform sampler2D u_image0; uniform vec2 f_resolution;  void main(void) {     float x = 1.0 / f_resolution.x;     float y = 1.0 / f_resolution.y;     vec4 horizEdge = vec4( 0.0 );     horizEdge -= texture2D( u_image0, vec2( v_texCoord.x - x, v_texCoord.y - y ) ) * 1.0;     horizEdge -= texture2D( u_image0, vec2( v_texCoord.x - x, v_texCoord.y     ) ) * 2.0;     horizEdge -= texture2D( u_image0, vec2( v_texCoord.x - x, v_texCoord.y + y ) ) * 1.0;     horizEdge += texture2D( u_image0, vec2( v_texCoord.x + x, v_texCoord.y - y ) ) * 1.0;     horizEdge += texture2D( u_image0, vec2( v_texCoord.x + x, v_texCoord.y     ) ) * 2.0;     horizEdge += texture2D( u_image0, vec2( v_texCoord.x + x, v_texCoord.y + y ) ) * 1.0;     vec4 vertEdge = vec4( 0.0 );     vertEdge -= texture2D( u_image0, vec2( v_texCoord.x - x, v_texCoord.y - y ) ) * 1.0;     vertEdge -= texture2D( u_image0, vec2( v_texCoord.x    , v_texCoord.y - y ) ) * 2.0;     vertEdge -= texture2D( u_image0, vec2( v_texCoord.x + x, v_texCoord.y - y ) ) * 1.0;     vertEdge += texture2D( u_image0, vec2( v_texCoord.x - x, v_texCoord.y + y ) ) * 1.0;     vertEdge += texture2D( u_image0, vec2( v_texCoord.x    , v_texCoord.y + y ) ) * 2.0;     vertEdge += texture2D( u_image0, vec2( v_texCoord.x + x, v_texCoord.y + y ) ) * 1.0;     vec3 edge = sqrt((horizEdge.rgb * horizEdge.rgb) + (vertEdge.rgb * vertEdge.rgb));      gl_FragColor = vec4( edge, texture2D( u_image0, v_texCoord ).a ); }",
    "vertex": "attribute vec2 a_position; attribute vec2 a_texCoord; uniform vec2 u_resolution; varying vec2 v_texCoord;  void main() {     vec2 zeroToOne = a_position / u_resolution;     vec2 zeroToTwo = zeroToOne * 2.0;     vec2 clipSpace = zeroToTwo - 1.0;     gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);     v_texCoord = a_texCoord; }"
  }
};
if (!window.ccwc) { ccwc = {}; }
if (!window.ccwc.image) { ccwc.image = {}; }
if (!window.ccwc.image) { ccwc.image = {}; }
if (!window.ccwc.image.webgl) { ccwc.image.webgl = {}; }

ccwc.image.webgl.textures = function(gl, width, height) {

    /** internal texture array */
    this._textures = {};

    /** width */
    this.width = width;

    /** height */
    this.height = height;

    /** gl context */
    this.gl = gl;

    /** uninitialized textures */
    this._unitialized = [];

    /** dirty textures (needs updating) */
    this._dirty = [];

    /** texture indices */
    this.textureIndices = [];

    /**
     * add a texture
     * @param {String} name
     * @param {Object} texture
     * @param {Integer} glindex
     * @param {Array} pixelstore
     */
    this.add = function(name, texture, glindex, pixelstore) {
        if (!glindex) {
            glindex = 0;
            while (this.textureIndices.indexOf(glindex) !== -1) {
                glindex ++;
            }
        }

        if (!pixelstore) {
            pixelstore = [];
        }
        this.textureIndices.push(glindex);

        this._textures[name] = {
            name: name,
            glindex: glindex,
            texture: texture,
            gltexture: gl.createTexture(),
            initialized: false,
            pixelStore: pixelstore,
            dirty: true };

        this._unitialized.push(this._textures[name]);
    };

    /**
     * update a uniform
     * @param name name of texture
     * @param texture
     */
    this.update = function(name, texture) {
        if (texture) {
            this._textures[name].texture = texture;
        }
        this._textures[name].dirty = true;
        this._dirty.push(this._textures[name]);
    };

    /**
     * refresh scene with updated textures
     */
    this.refreshScene = function() {
        for (var c = 0; c < this._dirty.length; c++) {
            this.gl.activeTexture(this.gl['TEXTURE' + this._dirty[c].glindex]);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this._dirty[c].gltexture);
            this.gl.texSubImage2D(this.gl.TEXTURE_2D, 0, 0, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this._dirty[c].texture);
        }
        this._dirty = [];
    };

    /**
     * initialize new textures
     * @param program
     */
    this.initializeNewTextures = function(program) {
        if (this._unitialized.length === 0) { return; }
        var gl = this.gl;
        for (var c = 0; c < this._unitialized.length; c++) {
            this._unitialized[c].location = gl.getUniformLocation(program, 'u_image' + this._unitialized[c].glindex);
            gl.uniform1i(this._unitialized[c].location, this._unitialized[c].glindex);
            gl.activeTexture(gl['TEXTURE' + this._unitialized[c].glindex]);
            gl.bindTexture(gl.TEXTURE_2D, this._unitialized[c].gltexture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

            for (var d = 0; d < this._unitialized[c].pixelStore.length; d++) {
                gl.pixelStorei(gl[this._unitialized[c].pixelStore[d].property], this._unitialized[c].pixelStore[d].value);
            }

            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._unitialized[c].texture);

            this._unitialized[c].initialized = true;
            this._unitialized[c].dirty = false;
        }
        this._unitialized = [];
    };
};
if (!window.ccwc) { ccwc = {}; }
if (!window.ccwc.image) { ccwc.image = {}; }
if (!window.ccwc.image) { ccwc.image = {}; }
if (!window.ccwc.image.webgl) { ccwc.image.webgl = {}; }

ccwc.image.webgl.uniforms = function() {
    /**
     * internal mapping of uniforms
     * @type {{}}
     * @private
     */
    this._uniforms = {};

    /**
     * add a uniform
     * @param type type of uniform (1f, 2f, 3f, 4f, 1i, 2i, 3i, 4u
     */
    this.add = function(name, type, values) {
        this._uniforms[name] = { name: name, type: type, values: values, dirty: true };
    };

    /**
     * update a uniform
     * @param type type of uniform (1f, 2f, 3f, 4f, 1i, 2i, 3i, 4u
     */
    this.update = function(name, values) {
        this._uniforms[name].values = values;
        this._uniforms[name].dirty = true;
    };


    /**
     * update uniforms on GL context and program
     * @param gl WebGL context
     * @param program
     */
    this.updateProgram = function(gl, program) {
        for (var c in this._uniforms) {
            if (this._uniforms[c].dirty) {
                var u = gl.getUniformLocation(program, this._uniforms[c].name);
                switch (this._uniforms[c].type) {
                    case '1f':
                        gl.uniform1f(u, this._uniforms[c].values[0]);
                        break;

                    case '2f':
                        gl.uniform2f(u, this._uniforms[c].values[0], this._uniforms[c].values[1]);
                        break;

                    case '3f':
                        gl.uniform3f(u, this._uniforms[c].values[0], this._uniforms[c].values[1], this._uniforms[c].values[2]);
                        break;

                    case '4f':
                        gl.uniform4f(u, this._uniforms[c].values[0], this._uniforms[c].values[1], this._uniforms[c].values[2], this._uniforms[c].values[3]);
                        break;

                    case '1i':
                        gl.uniform1i(u, this._uniforms[c].values[0]);
                        break;

                    case '2i':
                        gl.uniform2i(u, this._uniforms[c].values[0], this._uniforms[c].values[1]);
                        break;

                    case '3i':
                        gl.uniform3i(u, this._.uniforms[c].values[0], this._uniforms[c].values[1], this._uniforms[c].values[2]);
                        break;

                    case '4i':
                        gl.uniformif(u, this._uniforms[c].values[0], this._uniforms[c].values[1], this._uniforms[c].values[2], this._uniforms[c].values[3]);
                        break;
                }
            }
        }
    }

};

ccwc.image.webgl.uniforms.UNIFORM1f = '1f';
ccwc.image.webgl.uniforms.UNIFORM2f = '2f';
ccwc.image.webgl.uniforms.UNIFORM3f = '3f';
ccwc.image.webgl.uniforms.UNIFORM4f = '4f';

ccwc.image.webgl.uniforms.UNIFORM1i = '1i';
ccwc.image.webgl.uniforms.UNIFORM2i = '2i';
ccwc.image.webgl.uniforms.UNIFORM3i = '3i';
ccwc.image.webgl.uniforms.UNIFORM4i = '4i';
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
             * use webgl
             * @type {boolean}
             * @private
             */
            this._useWebGL = false;

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
            this._flipCanvas = false;

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

            if (this._useWebGL) {
                this.webglProperties.renderobj = this.webglProperties.setupHandler.apply(this, [this.webglProperties]);
                var event = new CustomEvent('webglsetup', { detail: { properties: this.webglProperties } });
                this.dispatchEvent(event);
            }
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
                        if (this._useWebGL) {
                            data = ccwc.image.webgl.filter.getCanvasPixels(this.webglProperties.renderobj);
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
        key: 'webglSetupHandler',

        /**
         * setup handler for WebGL Scene
         * @param {Object} props webgl properties
         * @return renderobj
         */
        value: function webglSetupHandler(props) {
            var filter;
            if (props.vertexShader && props.fragmentShader) {
                filter = ccwc.image.webgl.filter.createFilterFromShaders(props.vertexShader, props.fragmentShader);
            } else {
                filter = ccwc.image.webgl.filter.createFilterFromName(props.filter, props.filterLibrary);
            }

            props.textures.push({
                name: 'video',
                texture: document.querySelector('ccwc-video').videoElement,
                pixelStore: [{ property: 'UNPACK_FLIP_Y_WEBGL', value: this.webglProperties.flipTextureY }],
                index: 0 });

            return ccwc.image.webgl.filter.createRenderObject({
                gl: this.canvasctx,
                filter: filter,
                textures: props.textures
            });
        }
    }, {
        key: 'webglRenderHandler',

        /**
         * render handler for WebGL Scene
         * @param renderobj WebGL render properties
         */
        value: function webglRenderHandler(renderobj) {
            ccwc.image.webgl.filter.render(renderobj);
        }
    }, {
        key: 'parseAttributes',

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
            this.webglProperties = {
                flipTextureY: false,
                filterLibrary: ccwc.image.webgl.shaders,
                setupHandler: this.webglSetupHandler,
                renderHandler: this.webglRenderHandler,
                filter: 'passthrough',
                textures: []
            };

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

            if (this._flipCanvas) {
                this.canvasElement.style.transform = 'scale(1, -1)';
            }
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
                    if (!_this3.isPlaying) {
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

    return CCWCVideo;
})(HTMLElement);

CCWCVideo.prototype.owner = (document._currentScript || document.currentScript).ownerDocument;
document.registerElement('ccwc-video', CCWCVideo);
//# sourceMappingURL=ccwc-video.js.map

//# sourceMappingURL=ccwc-glvideo.js.map
