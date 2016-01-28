(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.CCWCGLVideo = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {
    uniforms: {
        UNIFORM1f: '1f',
        UNIFORM2f: '2f',
        UNIFORM3f: '3f',
        UNIFORM4f: '4f',

        UNIFORM1i: '1i',
        UNIFORM2i: '2i',
        UNIFORM3i: '3i',
        UNIFORM4i: '4i'
    }
};

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _constants = require('./constants.es6');

var _constants2 = _interopRequireDefault(_constants);

var _shaders = require('./shaders.es6');

var _shaders2 = _interopRequireDefault(_shaders);

var _filters = require('./filters.es6');

var _filters2 = _interopRequireDefault(_filters);

var _textures = require('./textures.es6');

var _textures2 = _interopRequireDefault(_textures);

var _uniforms = require('./uniforms.es6');

var _uniforms2 = _interopRequireDefault(_uniforms);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
    /**
     * create filter from shaders
     * @param vertexShader
     * @param fragmentShader
     * @returns {{vertexShader: *, fragmentShader: *}}
     */

    createFilterFromShaders: function createFilterFromShaders(vertexShader, fragmentShader) {
        return { vertexShader: vertexShader, fragmentShader: fragmentShader };
    },

    /**
     * create a filter from filter name
     * @param name
     * @param memory space/variable to pull shader from
     */
    createFilterFromName: function createFilterFromName(name, shaderloc) {
        if (!shaderloc) {
            shaderloc = _shaders2.default;
        }
        if (!shaderloc[name]) {
            console.log('Shader ', name, 'not found in ', shaderloc, ' using a passthrough shader instead');
            shaderloc = _shaders2.default;
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
    createRenderObject: function createRenderObject(params) {
        var props = {};

        props.gl = params.gl;
        props.width = props.gl.canvas.width;
        props.height = props.gl.canvas.height;

        if (params.width) {
            props.width = params.width;
        }
        if (params.height) {
            props.height = params.height;
        }

        props.filter = params.filter;
        props.textures = new _textures2.default(props.width, props.height);

        props.canvas2DHelper = document.createElement('canvas');
        props.canvas2DHelper.width = props.width;
        props.canvas2DHelper.height = props.height;
        props.canvas2DHelperContext = props.canvas2DHelper.getContext('2d');

        props.uniforms = new _uniforms2.default();
        props.textures = new _textures2.default(props.gl, props.width, props.height);

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
    render: function render(glprops) {
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
            var texCoords = new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0]);
            var rectCoords = new Float32Array([0, 0, glprops.textures.width, 0, 0, glprops.textures.height, 0, glprops.textures.height, glprops.textures.width, 0, glprops.textures.width, glprops.textures.height]);

            glprops.gl.bindBuffer(glprops.gl.ARRAY_BUFFER, texCoordBuffer);
            glprops.gl.bufferData(glprops.gl.ARRAY_BUFFER, texCoords, glprops.gl.STATIC_DRAW);

            var texCoordLocation = glprops.gl.getAttribLocation(glprops.program, 'a_texCoord');
            glprops.gl.enableVertexAttribArray(texCoordLocation);
            glprops.gl.vertexAttribPointer(texCoordLocation, 2, glprops.gl.FLOAT, false, 0, 0);

            glprops.uniforms.add('u_resolution', _constants2.default.uniforms.UNIFORM2f, [glprops.gl.canvas.width, glprops.gl.canvas.height]);
            glprops.uniforms.add('f_resolution', _constants2.default.uniforms.UNIFORM2f, [glprops.gl.canvas.width, glprops.gl.canvas.height]);

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
    getCanvasPixels: function getCanvasPixels(glprops) {
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

},{"./constants.es6":1,"./filters.es6":2,"./shaders.es6":3,"./textures.es6":4,"./uniforms.es6":5}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
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

},{}],4:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
    /**
     * c-tor
     * @param gl
     * @param width
     * @param height
     */

    function _class(gl, width, height) {
        _classCallCheck(this, _class);

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
    }

    /**
     * add a texture
     * @param {String} name
     * @param {Object} texture
     * @param {Integer} glindex
     * @param {Array} pixelstore
     */

    _createClass(_class, [{
        key: 'add',
        value: function add(name, texture, glindex, pixelstore) {
            if (!glindex) {
                glindex = 0;
                while (this.textureIndices.indexOf(glindex) !== -1) {
                    glindex++;
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
                gltexture: this.gl.createTexture(),
                initialized: false,
                pixelStore: pixelstore,
                dirty: true };

            this._unitialized.push(this._textures[name]);
        }
    }, {
        key: 'update',

        /**
         * update a uniform
         * @param name name of texture
         * @param texture
         */
        value: function update(name, texture) {
            if (texture) {
                this._textures[name].texture = texture;
            }
            this._textures[name].dirty = true;
            this._dirty.push(this._textures[name]);
        }
    }, {
        key: 'refreshScene',

        /**
         * refresh scene with updated textures
         */
        value: function refreshScene() {
            for (var c = 0; c < this._dirty.length; c++) {
                this.gl.activeTexture(this.gl['TEXTURE' + this._dirty[c].glindex]);
                this.gl.bindTexture(this.gl.TEXTURE_2D, this._dirty[c].gltexture);
                this.gl.texSubImage2D(this.gl.TEXTURE_2D, 0, 0, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this._dirty[c].texture);
            }
            this._dirty = [];
        }
    }, {
        key: 'initializeNewTextures',

        /**
         * initialize new textures
         * @param program
         */
        value: function initializeNewTextures(program) {
            if (this._unitialized.length === 0) {
                return;
            }
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
        }
    }]);

    return _class;
}();

exports.default = _class;

},{}],5:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
    /**
     * c-tor
     */

    function _class() {
        _classCallCheck(this, _class);

        /**
         * internal mapping of uniforms
         * @type {{}}
         * @private
         */
        this._uniforms = {};
    }

    /**
     * add a uniform
     * @param type type of uniform (1f, 2f, 3f, 4f, 1i, 2i, 3i, 4u
     */

    _createClass(_class, [{
        key: 'add',
        value: function add(name, type, values) {
            this._uniforms[name] = { name: name, type: type, values: values, dirty: true };
        }
    }, {
        key: 'update',

        /**
         * update a uniform
         * @param type type of uniform (1f, 2f, 3f, 4f, 1i, 2i, 3i, 4u
         */
        value: function update(name, values) {
            this._uniforms[name].values = values;
            this._uniforms[name].dirty = true;
        }
    }, {
        key: 'updateProgram',

        /**
         * update uniforms on GL context and program
         * @param gl WebGL context
         * @param program
         */
        value: function updateProgram(gl, program) {
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
    }]);

    return _class;
}();

exports.default = _class;

},{}],6:[function(require,module,exports){
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

var _get = function get(object, property, receiver) {
    if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);if (parent === null) {
            return undefined;
        } else {
            return get(parent, property, receiver);
        }
    } else if ("value" in desc) {
        return desc.value;
    } else {
        var getter = desc.get;if (getter === undefined) {
            return undefined;
        }return getter.call(receiver);
    }
};

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _ccwcVideo = require('./ccwc-video.es6');

var _ccwcVideo2 = _interopRequireDefault(_ccwcVideo);

var _filters = require('../node_modules/ccwc-image-utils/src/webgl/filters.es6');

var _filters2 = _interopRequireDefault(_filters);

var _shaders = require('../node_modules/ccwc-image-utils/src/webgl/shaders.es6');

var _shaders2 = _interopRequireDefault(_shaders);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

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

var _class = function (_CCWCVideo) {
    _inherits(_class, _CCWCVideo);

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
            _get(Object.getPrototypeOf(_class.prototype), 'setProperties', this).call(this);

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
        }
    }, {
        key: 'onPlaying',

        /**
         * on video playing handler
         */
        value: function onPlaying() {
            _get(Object.getPrototypeOf(_class.prototype), 'onPlaying', this).call(this);
            if (this._useWebGL) {
                this.webglProperties.renderobj = this.webglProperties.setupHandler.apply(this, [this.webglProperties]);
                var event = new CustomEvent('webglsetup', { detail: { properties: this.webglProperties } });
                this.dispatchEvent(event);
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
                        if (this._useWebGL) {
                            data = _filters2.default.getCanvasPixels(this.webglProperties.renderobj);
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
        key: 'webglSetupHandler',

        /**
         * setup handler for WebGL Scene
         * @param {Object} props webgl properties
         * @return renderobj
         */
        value: function webglSetupHandler(props) {
            var filter;
            if (props.vertexShader && props.fragmentShader) {
                filter = _filters2.default.createFilterFromShaders(props.vertexShader, props.fragmentShader);
            } else {
                filter = _filters2.default.createFilterFromName(props.filter, props.filterLibrary);
            }

            props.textures.push({
                name: 'video',
                texture: this.videoElement,
                pixelStore: [{ property: 'UNPACK_FLIP_Y_WEBGL', value: this.webglProperties.flipTextureY }],
                index: 0 });

            return _filters2.default.createRenderObject({
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
            _filters2.default.render(renderobj);
        }
    }, {
        key: 'parseAttributes',

        /**
         * parse attributes on element
         * @private
         */
        value: function parseAttributes() {
            _get(Object.getPrototypeOf(_class.prototype), 'parseAttributes', this).call(this);
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
                filterLibrary: _shaders2.default,
                setupHandler: this.webglSetupHandler,
                renderHandler: this.webglRenderHandler,
                filter: 'passthrough',
                textures: []
            };

            _get(Object.getPrototypeOf(_class.prototype), 'createdCallback', this).call(this);
        }
    }]);

    return _class;
}(_ccwcVideo2.default);

exports.default = _class;

},{"../node_modules/ccwc-image-utils/src/webgl/filters.es6":2,"../node_modules/ccwc-image-utils/src/webgl/shaders.es6":3,"./ccwc-video.es6":7}],7:[function(require,module,exports){
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

},{}]},{},[6])(6)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLlxcY2N3Yy1pbWFnZS11dGlsc1xcc3JjXFx3ZWJnbFxcY29uc3RhbnRzLmVzNiIsIi4uXFxjY3djLWltYWdlLXV0aWxzXFxzcmNcXHdlYmdsXFxmaWx0ZXJzLmVzNiIsIi4uXFxjY3djLWltYWdlLXV0aWxzXFxzcmNcXHdlYmdsXFxzaGFkZXJzLmVzNiIsIi4uXFxjY3djLWltYWdlLXV0aWxzXFxzcmNcXHdlYmdsXFx0ZXh0dXJlcy5lczYiLCIuLlxcY2N3Yy1pbWFnZS11dGlsc1xcc3JjXFx3ZWJnbFxcdW5pZm9ybXMuZXM2Iiwic3JjXFxjY3djLWdsdmlkZW8uZXM2Iiwic3JjXFxjY3djLXZpZGVvLmVzNiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O2tCQ0FlO0FBQ1gsY0FBVTtBQUNOLG1CQUFXLElBQVg7QUFDQSxtQkFBVyxJQUFYO0FBQ0EsbUJBQVcsSUFBWDtBQUNBLG1CQUFXLElBQVg7O0FBRUEsbUJBQVcsSUFBWDtBQUNBLG1CQUFXLElBQVg7QUFDQSxtQkFBVyxJQUFYO0FBQ0EsbUJBQVcsSUFBWDtLQVRKOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztrQkNLVzs7Ozs7Ozs7QUFPWCw4REFBd0IsY0FBYyxnQkFBZ0I7QUFDbEQsZUFBTyxFQUFFLGNBQWMsWUFBZCxFQUE0QixnQkFBZ0IsY0FBaEIsRUFBckMsQ0FEa0Q7S0FQM0M7Ozs7Ozs7QUFnQlgsd0RBQXFCLE1BQU0sV0FBVztBQUNsQyxZQUFJLENBQUMsU0FBRCxFQUFZO0FBQ1osMENBRFk7U0FBaEI7QUFHQSxZQUFJLENBQUMsVUFBVSxJQUFWLENBQUQsRUFBa0I7QUFDbEIsb0JBQVEsR0FBUixDQUFZLFNBQVosRUFBdUIsSUFBdkIsRUFBNkIsZUFBN0IsRUFBOEMsU0FBOUMsRUFBeUQscUNBQXpELEVBRGtCO0FBRWxCLDBDQUZrQjtBQUds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O0VBN1NGIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImV4cG9ydCBkZWZhdWx0IHtcclxuICAgIHVuaWZvcm1zOiB7XHJcbiAgICAgICAgVU5JRk9STTFmOiAnMWYnLFxyXG4gICAgICAgIFVOSUZPUk0yZjogJzJmJyxcclxuICAgICAgICBVTklGT1JNM2Y6ICczZicsXHJcbiAgICAgICAgVU5JRk9STTRmOiAnNGYnLFxyXG5cclxuICAgICAgICBVTklGT1JNMWk6ICcxaScsXHJcbiAgICAgICAgVU5JRk9STTJpOiAnMmknLFxyXG4gICAgICAgIFVOSUZPUk0zaTogJzNpJyxcclxuICAgICAgICBVTklGT1JNNGk6ICc0aSdcclxuICAgIH1cclxufSIsImltcG9ydCBDb25zdGFudHMgZnJvbSAnLi9jb25zdGFudHMuZXM2JztcclxuaW1wb3J0IFNoYWRlcnMgZnJvbSAnLi9zaGFkZXJzLmVzNic7XHJcbmltcG9ydCBGaWx0ZXJzIGZyb20gJy4vZmlsdGVycy5lczYnO1xyXG5pbXBvcnQgVGV4dHVyZXMgZnJvbSAnLi90ZXh0dXJlcy5lczYnO1xyXG5pbXBvcnQgVW5pZm9ybXMgZnJvbSAnLi91bmlmb3Jtcy5lczYnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gICAgLyoqXHJcbiAgICAgKiBjcmVhdGUgZmlsdGVyIGZyb20gc2hhZGVyc1xyXG4gICAgICogQHBhcmFtIHZlcnRleFNoYWRlclxyXG4gICAgICogQHBhcmFtIGZyYWdtZW50U2hhZGVyXHJcbiAgICAgKiBAcmV0dXJucyB7e3ZlcnRleFNoYWRlcjogKiwgZnJhZ21lbnRTaGFkZXI6ICp9fVxyXG4gICAgICovXHJcbiAgICBjcmVhdGVGaWx0ZXJGcm9tU2hhZGVycyh2ZXJ0ZXhTaGFkZXIsIGZyYWdtZW50U2hhZGVyKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgdmVydGV4U2hhZGVyOiB2ZXJ0ZXhTaGFkZXIsIGZyYWdtZW50U2hhZGVyOiBmcmFnbWVudFNoYWRlciB9O1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIGNyZWF0ZSBhIGZpbHRlciBmcm9tIGZpbHRlciBuYW1lXHJcbiAgICAgKiBAcGFyYW0gbmFtZVxyXG4gICAgICogQHBhcmFtIG1lbW9yeSBzcGFjZS92YXJpYWJsZSB0byBwdWxsIHNoYWRlciBmcm9tXHJcbiAgICAgKi9cclxuICAgIGNyZWF0ZUZpbHRlckZyb21OYW1lKG5hbWUsIHNoYWRlcmxvYykge1xyXG4gICAgICAgIGlmICghc2hhZGVybG9jKSB7XHJcbiAgICAgICAgICAgIHNoYWRlcmxvYyA9IFNoYWRlcnM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghc2hhZGVybG9jW25hbWVdKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTaGFkZXIgJywgbmFtZSwgJ25vdCBmb3VuZCBpbiAnLCBzaGFkZXJsb2MsICcgdXNpbmcgYSBwYXNzdGhyb3VnaCBzaGFkZXIgaW5zdGVhZCcpO1xyXG4gICAgICAgICAgICBzaGFkZXJsb2MgPSBTaGFkZXJzO1xyXG4gICAgICAgICAgICBuYW1lID0gJ3Bhc3N0aHJvdWdoJztcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHZ0eCA9IHNoYWRlcmxvY1tuYW1lXS52ZXJ0ZXg7XHJcbiAgICAgICAgdmFyIGZyZyA9IHNoYWRlcmxvY1tuYW1lXS5mcmFnbWVudDtcclxuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVGaWx0ZXJGcm9tU2hhZGVycyh2dHgsIGZyZyk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY3JlYXRlIG9iamVjdCBmb3IgcmVuZGVyXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH1wYXJhbXNcclxuICAgICAqL1xyXG4gICAgY3JlYXRlUmVuZGVyT2JqZWN0KHBhcmFtcykge1xyXG4gICAgICAgIHZhciBwcm9wcyA9IHt9O1xyXG5cclxuICAgICAgICBwcm9wcy5nbCA9IHBhcmFtcy5nbDtcclxuICAgICAgICBwcm9wcy53aWR0aCA9IHByb3BzLmdsLmNhbnZhcy53aWR0aDtcclxuICAgICAgICBwcm9wcy5oZWlnaHQgPSBwcm9wcy5nbC5jYW52YXMuaGVpZ2h0O1xyXG5cclxuICAgICAgICBpZiAocGFyYW1zLndpZHRoKSB7IHByb3BzLndpZHRoID0gcGFyYW1zLndpZHRoOyB9XHJcbiAgICAgICAgaWYgKHBhcmFtcy5oZWlnaHQpIHsgcHJvcHMuaGVpZ2h0ID0gcGFyYW1zLmhlaWdodDsgfVxyXG5cclxuICAgICAgICBwcm9wcy5maWx0ZXIgPSBwYXJhbXMuZmlsdGVyO1xyXG4gICAgICAgIHByb3BzLnRleHR1cmVzID0gbmV3IFRleHR1cmVzKHByb3BzLndpZHRoLHByb3BzLmhlaWdodCk7XHJcblxyXG4gICAgICAgIHByb3BzLmNhbnZhczJESGVscGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgICAgICAgcHJvcHMuY2FudmFzMkRIZWxwZXIud2lkdGggPSBwcm9wcy53aWR0aDtcclxuICAgICAgICBwcm9wcy5jYW52YXMyREhlbHBlci5oZWlnaHQgPSBwcm9wcy5oZWlnaHQ7XHJcbiAgICAgICAgcHJvcHMuY2FudmFzMkRIZWxwZXJDb250ZXh0ID0gcHJvcHMuY2FudmFzMkRIZWxwZXIuZ2V0Q29udGV4dCgnMmQnKTtcclxuXHJcbiAgICAgICAgcHJvcHMudW5pZm9ybXMgPSBuZXcgVW5pZm9ybXMoKTtcclxuICAgICAgICBwcm9wcy50ZXh0dXJlcyA9IG5ldyBUZXh0dXJlcyhwcm9wcy5nbCwgcHJvcHMud2lkdGgsIHByb3BzLmhlaWdodCk7XHJcblxyXG4gICAgICAgIGlmIChwYXJhbXMudGV4dHVyZXMpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgYyA9IDA7IGMgPCBwYXJhbXMudGV4dHVyZXMubGVuZ3RoOyBjKyspIHtcclxuICAgICAgICAgICAgICAgIHByb3BzLnRleHR1cmVzLmFkZChwYXJhbXMudGV4dHVyZXNbY10ubmFtZSwgcGFyYW1zLnRleHR1cmVzW2NdLnRleHR1cmUsIHBhcmFtcy50ZXh0dXJlc1tjXS5pbmRleCwgcGFyYW1zLnRleHR1cmVzW2NdLnBpeGVsU3RvcmUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocGFyYW1zLnVuaWZvcm1zKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGMgPSAwOyBjIDwgcGFyYW1zLnVuaWZvcm1zLmxlbmd0aDsgYysrKSB7XHJcbiAgICAgICAgICAgICAgICBwcm9wcy51bmlmb3Jtcy5hZGQocGFyYW1zLnVuaWZvcm1zW2NdLm5hbWUsIHBhcmFtcy51bmlmb3Jtc1tjXS50eXBlLCBwYXJhbXMudW5pZm9ybXNbY10udmFsdWVzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHBhcmFtcy5hdXRvcmVuZGVyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlbmRlcihwcm9wcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcHJvcHM7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmVuZGVyIFdlYkdMIGZpbHRlciBvbiBjdXJyZW50IHRleHR1cmVcclxuICAgICAqIEBwYXJhbSBnbHByb3BzXHJcbiAgICAgKiBAcGFyYW0gcmVmcmVzaFRleHR1cmVJbmRpY2VzIHRleHR1cmUgcmVmcmVzaCBpbmRpY2VzIChvcHRpb25hbClcclxuICAgICAqIEByZXR1cm5zIHsqfVxyXG4gICAgICovXHJcbiAgICByZW5kZXIoZ2xwcm9wcykge1xyXG4gICAgICAgIGlmICghZ2xwcm9wcy5pc0luaXRpYWxpemVkKSB7XHJcbiAgICAgICAgICAgIHZhciB2ZXJ0ZXhTaGFkZXIgPSBnbHByb3BzLmdsLmNyZWF0ZVNoYWRlcihnbHByb3BzLmdsLlZFUlRFWF9TSEFERVIpO1xyXG4gICAgICAgICAgICBnbHByb3BzLmdsLnNoYWRlclNvdXJjZSh2ZXJ0ZXhTaGFkZXIsIGdscHJvcHMuZmlsdGVyLnZlcnRleFNoYWRlcik7XHJcbiAgICAgICAgICAgIGdscHJvcHMuZ2wuY29tcGlsZVNoYWRlcih2ZXJ0ZXhTaGFkZXIpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGZyYWdtZW50U2hhZGVyID0gZ2xwcm9wcy5nbC5jcmVhdGVTaGFkZXIoZ2xwcm9wcy5nbC5GUkFHTUVOVF9TSEFERVIpO1xyXG4gICAgICAgICAgICBnbHByb3BzLmdsLnNoYWRlclNvdXJjZShmcmFnbWVudFNoYWRlciwgZ2xwcm9wcy5maWx0ZXIuZnJhZ21lbnRTaGFkZXIpO1xyXG4gICAgICAgICAgICBnbHByb3BzLmdsLmNvbXBpbGVTaGFkZXIoZnJhZ21lbnRTaGFkZXIpO1xyXG5cclxuICAgICAgICAgICAgZ2xwcm9wcy5wcm9ncmFtID0gZ2xwcm9wcy5nbC5jcmVhdGVQcm9ncmFtKCk7XHJcbiAgICAgICAgICAgIGdscHJvcHMuZ2wuYXR0YWNoU2hhZGVyKGdscHJvcHMucHJvZ3JhbSwgdmVydGV4U2hhZGVyKTtcclxuICAgICAgICAgICAgZ2xwcm9wcy5nbC5hdHRhY2hTaGFkZXIoZ2xwcm9wcy5wcm9ncmFtLCBmcmFnbWVudFNoYWRlcik7XHJcbiAgICAgICAgICAgIGdscHJvcHMuZ2wubGlua1Byb2dyYW0oZ2xwcm9wcy5wcm9ncmFtKTtcclxuICAgICAgICAgICAgZ2xwcm9wcy5nbC51c2VQcm9ncmFtKGdscHJvcHMucHJvZ3JhbSk7XHJcblxyXG4gICAgICAgICAgICB2YXIgcG9zaXRpb25Mb2NhdGlvbiA9IGdscHJvcHMuZ2wuZ2V0QXR0cmliTG9jYXRpb24oZ2xwcm9wcy5wcm9ncmFtLCAnYV9wb3NpdGlvbicpO1xyXG4gICAgICAgICAgICB2YXIgdGV4Q29vcmRCdWZmZXIgPSBnbHByb3BzLmdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG4gICAgICAgICAgICB2YXIgcmVjdENvb3JkQnVmZmVyID0gZ2xwcm9wcy5nbC5jcmVhdGVCdWZmZXIoKTtcclxuICAgICAgICAgICAgdmFyIHRleENvb3JkcyA9IG5ldyBGbG9hdDMyQXJyYXkoWzAuMCwgIDAuMCwgMS4wLCAgMC4wLCAwLjAsICAxLjAsIDAuMCwgIDEuMCwgMS4wLCAgMC4wLCAxLjAsICAxLjBdKTtcclxuICAgICAgICAgICAgdmFyIHJlY3RDb29yZHMgPSBuZXcgRmxvYXQzMkFycmF5KFswLCAwLCBnbHByb3BzLnRleHR1cmVzLndpZHRoLCAwLCAwLCBnbHByb3BzLnRleHR1cmVzLmhlaWdodCwgMCxcclxuICAgICAgICAgICAgICAgIGdscHJvcHMudGV4dHVyZXMuaGVpZ2h0LCBnbHByb3BzLnRleHR1cmVzLndpZHRoLCAwLCBnbHByb3BzLnRleHR1cmVzLndpZHRoLCBnbHByb3BzLnRleHR1cmVzLmhlaWdodF0pO1xyXG5cclxuICAgICAgICAgICAgZ2xwcm9wcy5nbC5iaW5kQnVmZmVyKGdscHJvcHMuZ2wuQVJSQVlfQlVGRkVSLCB0ZXhDb29yZEJ1ZmZlcik7XHJcbiAgICAgICAgICAgIGdscHJvcHMuZ2wuYnVmZmVyRGF0YShnbHByb3BzLmdsLkFSUkFZX0JVRkZFUiwgdGV4Q29vcmRzLCBnbHByb3BzLmdsLlNUQVRJQ19EUkFXKTtcclxuXHJcbiAgICAgICAgICAgIHZhciB0ZXhDb29yZExvY2F0aW9uID0gZ2xwcm9wcy5nbC5nZXRBdHRyaWJMb2NhdGlvbihnbHByb3BzLnByb2dyYW0sICdhX3RleENvb3JkJyk7XHJcbiAgICAgICAgICAgIGdscHJvcHMuZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkodGV4Q29vcmRMb2NhdGlvbik7XHJcbiAgICAgICAgICAgIGdscHJvcHMuZ2wudmVydGV4QXR0cmliUG9pbnRlcih0ZXhDb29yZExvY2F0aW9uLCAyLCBnbHByb3BzLmdsLkZMT0FULCBmYWxzZSwgMCwgMCk7XHJcblxyXG4gICAgICAgICAgICBnbHByb3BzLnVuaWZvcm1zLmFkZCgndV9yZXNvbHV0aW9uJywgQ29uc3RhbnRzLnVuaWZvcm1zLlVOSUZPUk0yZiwgW2dscHJvcHMuZ2wuY2FudmFzLndpZHRoLCBnbHByb3BzLmdsLmNhbnZhcy5oZWlnaHRdKTtcclxuICAgICAgICAgICAgZ2xwcm9wcy51bmlmb3Jtcy5hZGQoJ2ZfcmVzb2x1dGlvbicsIENvbnN0YW50cy51bmlmb3Jtcy5VTklGT1JNMmYsIFtnbHByb3BzLmdsLmNhbnZhcy53aWR0aCwgZ2xwcm9wcy5nbC5jYW52YXMuaGVpZ2h0XSk7XHJcblxyXG4gICAgICAgICAgICBnbHByb3BzLmdsLmJpbmRCdWZmZXIoZ2xwcm9wcy5nbC5BUlJBWV9CVUZGRVIsIHJlY3RDb29yZEJ1ZmZlcik7XHJcbiAgICAgICAgICAgIGdscHJvcHMuZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkocG9zaXRpb25Mb2NhdGlvbik7XHJcbiAgICAgICAgICAgIGdscHJvcHMuZ2wudmVydGV4QXR0cmliUG9pbnRlcihwb3NpdGlvbkxvY2F0aW9uLCAyLCBnbHByb3BzLmdsLkZMT0FULCBmYWxzZSwgMCwgMCk7XHJcbiAgICAgICAgICAgIGdscHJvcHMuZ2wuYnVmZmVyRGF0YShnbHByb3BzLmdsLkFSUkFZX0JVRkZFUiwgcmVjdENvb3JkcywgZ2xwcm9wcy5nbC5TVEFUSUNfRFJBVyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnbHByb3BzLnRleHR1cmVzLmluaXRpYWxpemVOZXdUZXh0dXJlcyhnbHByb3BzLnByb2dyYW0pO1xyXG4gICAgICAgIGdscHJvcHMudGV4dHVyZXMucmVmcmVzaFNjZW5lKCk7XHJcbiAgICAgICAgZ2xwcm9wcy51bmlmb3Jtcy51cGRhdGVQcm9ncmFtKGdscHJvcHMuZ2wsIGdscHJvcHMucHJvZ3JhbSk7XHJcblxyXG4gICAgICAgIGdscHJvcHMuZ2wuZHJhd0FycmF5cyhnbHByb3BzLmdsLlRSSUFOR0xFUywgMCwgNik7XHJcbiAgICAgICAgZ2xwcm9wcy5pc0luaXRpYWxpemVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdscHJvcHM7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmVhZCBwaXhlbHMgZnJvbSBHTCBjb250ZXh0XHJcbiAgICAgKiBAcGFyYW0gZ2xQcm9wc1xyXG4gICAgICovXHJcbiAgICBnZXRDYW52YXNQaXhlbHMoZ2xwcm9wcykge1xyXG4gICAgICAgIHZhciBnbGN0eCA9IGdscHJvcHMuZ2w7XHJcbiAgICAgICAgaWYgKCFnbHByb3BzLnBpeGVsYXJyYXkpIHtcclxuICAgICAgICAgICAgZ2xwcm9wcy5waXhlbGFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoZ2xjdHguY2FudmFzLndpZHRoICogZ2xjdHguY2FudmFzLmhlaWdodCAqIDQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBnbGN0eC5yZWFkUGl4ZWxzKDAsIDAsIGdsY3R4LmNhbnZhcy53aWR0aCwgZ2xjdHguY2FudmFzLmhlaWdodCwgZ2xjdHguUkdCQSwgZ2xjdHguVU5TSUdORURfQllURSwgZ2xwcm9wcy5waXhlbGFycmF5KTtcclxuICAgICAgICB2YXIgaW1nRGF0YSA9IGdscHJvcHMuY2FudmFzMkRIZWxwZXJDb250ZXh0LmNyZWF0ZUltYWdlRGF0YShnbGN0eC5jYW52YXMud2lkdGgsIGdsY3R4LmNhbnZhcy5oZWlnaHQpO1xyXG4gICAgICAgIGltZ0RhdGEuZGF0YS5zZXQobmV3IFVpbnQ4Q2xhbXBlZEFycmF5KGdscHJvcHMucGl4ZWxhcnJheSkpO1xyXG4gICAgICAgIHJldHVybiBpbWdEYXRhO1xyXG4gICAgfVxyXG59OyIsImV4cG9ydCBkZWZhdWx0IHtcbiAgXCJmcmVpY2hlbl9lZGdlX2RldGVjdGlvblwiOiB7XG4gICAgXCJmcmFnbWVudFwiOiBcInByZWNpc2lvbiBtZWRpdW1wIGZsb2F0OyB1bmlmb3JtIHNhbXBsZXIyRCB1X2ltYWdlMDsgdmFyeWluZyB2ZWMyIHZfdGV4Q29vcmQ7IHVuaWZvcm0gdmVjMiBmX3Jlc29sdXRpb247IHZlYzIgdGV4ZWwgPSB2ZWMyKDEuMCAvIGZfcmVzb2x1dGlvbi54LCAxLjAgLyBmX3Jlc29sdXRpb24ueSk7IG1hdDMgR1s5XTsgIGNvbnN0IG1hdDMgZzAgPSBtYXQzKCAwLjM1MzU1MzM4NDU0MjQ2NTIsIDAsIC0wLjM1MzU1MzM4NDU0MjQ2NTIsIDAuNSwgMCwgLTAuNSwgMC4zNTM1NTMzODQ1NDI0NjUyLCAwLCAtMC4zNTM1NTMzODQ1NDI0NjUyICk7IGNvbnN0IG1hdDMgZzEgPSBtYXQzKCAwLjM1MzU1MzM4NDU0MjQ2NTIsIDAuNSwgMC4zNTM1NTMzODQ1NDI0NjUyLCAwLCAwLCAwLCAtMC4zNTM1NTMzODQ1NDI0NjUyLCAtMC41LCAtMC4zNTM1NTMzODQ1NDI0NjUyICk7IGNvbnN0IG1hdDMgZzIgPSBtYXQzKCAwLCAwLjM1MzU1MzM4NDU0MjQ2NTIsIC0wLjUsIC0wLjM1MzU1MzM4NDU0MjQ2NTIsIDAsIDAuMzUzNTUzMzg0NTQyNDY1MiwgMC41LCAtMC4zNTM1NTMzODQ1NDI0NjUyLCAwICk7IGNvbnN0IG1hdDMgZzMgPSBtYXQzKCAwLjUsIC0wLjM1MzU1MzM4NDU0MjQ2NTIsIDAsIC0wLjM1MzU1MzM4NDU0MjQ2NTIsIDAsIDAuMzUzNTUzMzg0NTQyNDY1MiwgMCwgMC4zNTM1NTMzODQ1NDI0NjUyLCAtMC41ICk7IGNvbnN0IG1hdDMgZzQgPSBtYXQzKCAwLCAtMC41LCAwLCAwLjUsIDAsIDAuNSwgMCwgLTAuNSwgMCApOyBjb25zdCBtYXQzIGc1ID0gbWF0MyggLTAuNSwgMCwgMC41LCAwLCAwLCAwLCAwLjUsIDAsIC0wLjUgKTsgY29uc3QgbWF0MyBnNiA9IG1hdDMoIDAuMTY2NjY2NjcxNjMzNzIwNCwgLTAuMzMzMzMzMzQzMjY3NDQwOCwgMC4xNjY2NjY2NzE2MzM3MjA0LCAtMC4zMzMzMzMzNDMyNjc0NDA4LCAwLjY2NjY2NjY4NjUzNDg4MTYsIC0wLjMzMzMzMzM0MzI2NzQ0MDgsIDAuMTY2NjY2NjcxNjMzNzIwNCwgLTAuMzMzMzMzMzQzMjY3NDQwOCwgMC4xNjY2NjY2NzE2MzM3MjA0ICk7IGNvbnN0IG1hdDMgZzcgPSBtYXQzKCAtMC4zMzMzMzMzNDMyNjc0NDA4LCAwLjE2NjY2NjY3MTYzMzcyMDQsIC0wLjMzMzMzMzM0MzI2NzQ0MDgsIDAuMTY2NjY2NjcxNjMzNzIwNCwgMC42NjY2NjY2ODY1MzQ4ODE2LCAwLjE2NjY2NjY3MTYzMzcyMDQsIC0wLjMzMzMzMzM0MzI2NzQ0MDgsIDAuMTY2NjY2NjcxNjMzNzIwNCwgLTAuMzMzMzMzMzQzMjY3NDQwOCApOyBjb25zdCBtYXQzIGc4ID0gbWF0MyggMC4zMzMzMzMzNDMyNjc0NDA4LCAwLjMzMzMzMzM0MzI2NzQ0MDgsIDAuMzMzMzMzMzQzMjY3NDQwOCwgMC4zMzMzMzMzNDMyNjc0NDA4LCAwLjMzMzMzMzM0MzI2NzQ0MDgsIDAuMzMzMzMzMzQzMjY3NDQwOCwgMC4zMzMzMzMzNDMyNjc0NDA4LCAwLjMzMzMzMzM0MzI2NzQ0MDgsIDAuMzMzMzMzMzQzMjY3NDQwOCApOyAgdm9pZCBtYWluKHZvaWQpIHsgICAgICBHWzBdID0gZzAsICAgICBHWzFdID0gZzEsICAgICBHWzJdID0gZzIsICAgICBHWzNdID0gZzMsICAgICBHWzRdID0gZzQsICAgICBHWzVdID0gZzUsICAgICBHWzZdID0gZzYsICAgICBHWzddID0gZzcsICAgICBHWzhdID0gZzg7ICAgICAgbWF0MyBJOyAgICAgZmxvYXQgY252WzldOyAgICAgdmVjMyBzYW1wbDsgICAgICBmb3IgKGZsb2F0IGk9MC4wOyBpPDMuMDsgaSsrKSB7ICAgICAgICAgZm9yIChmbG9hdCBqPTAuMDsgajwzLjA7IGorKykgeyAgICAgICAgICAgICBzYW1wbCA9IHRleHR1cmUyRCh1X2ltYWdlMCwgdl90ZXhDb29yZCArIHRleGVsICogdmVjMihpLTEuMCxqLTEuMCkgKS5yZ2I7ICAgICAgICAgICAgIElbaW50KGkpXVtpbnQoaildID0gbGVuZ3RoKHNhbXBsKTsgICAgICAgICB9ICAgICB9ICAgICAgZm9yIChpbnQgaT0wOyBpPDk7IGkrKykgeyAgICAgICAgIGZsb2F0IGRwMyA9IGRvdChHW2ldWzBdLCBJWzBdKSArIGRvdChHW2ldWzFdLCBJWzFdKSArIGRvdChHW2ldWzJdLCBJWzJdKTsgICAgICAgICBjbnZbaV0gPSBkcDMgKiBkcDM7ICAgICB9ICAgICAgZmxvYXQgTSA9IChjbnZbMF0gKyBjbnZbMV0pICsgKGNudlsyXSArIGNudlszXSk7ICAgICBmbG9hdCBTID0gKGNudls0XSArIGNudls1XSkgKyAoY252WzZdICsgY252WzddKSArIChjbnZbOF0gKyBNKTsgICAgICBnbF9GcmFnQ29sb3IgPSB2ZWM0KHZlYzMoc3FydChNL1MpKSwgdGV4dHVyZTJEKCB1X2ltYWdlMCwgdl90ZXhDb29yZCApLmEgKTsgfVwiLFxuICAgIFwidmVydGV4XCI6IFwiYXR0cmlidXRlIHZlYzIgYV9wb3NpdGlvbjsgYXR0cmlidXRlIHZlYzIgYV90ZXhDb29yZDsgdW5pZm9ybSB2ZWMyIHVfcmVzb2x1dGlvbjsgdmFyeWluZyB2ZWMyIHZfdGV4Q29vcmQ7ICB2b2lkIG1haW4oKSB7ICAgICB2ZWMyIHplcm9Ub09uZSA9IGFfcG9zaXRpb24gLyB1X3Jlc29sdXRpb247ICAgICB2ZWMyIHplcm9Ub1R3byA9IHplcm9Ub09uZSAqIDIuMDsgICAgIHZlYzIgY2xpcFNwYWNlID0gemVyb1RvVHdvIC0gMS4wOyAgICAgZ2xfUG9zaXRpb24gPSB2ZWM0KGNsaXBTcGFjZSAqIHZlYzIoMSwgLTEpLCAwLCAxKTsgICAgIHZfdGV4Q29vcmQgPSBhX3RleENvb3JkOyB9XCJcbiAgfSxcbiAgXCJncmV5c2NhbGVcIjoge1xuICAgIFwiZnJhZ21lbnRcIjogXCJwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDsgdmFyeWluZyB2ZWMyIHZfdGV4Q29vcmQ7ICB1bmlmb3JtIHNhbXBsZXIyRCB1X2ltYWdlMDsgIHZvaWQgbWFpbih2b2lkKSB7ICAgICB2ZWM0IHB4ID0gdGV4dHVyZTJEKHVfaW1hZ2UwLCB2X3RleENvb3JkKTsgICAgIGZsb2F0IGF2ZyA9IChweC5yICsgcHguZyArIHB4LmIpLzMuMDsgICAgIGdsX0ZyYWdDb2xvciA9IHZlYzQoYXZnLCBhdmcsIGF2ZywgcHguYSk7IH1cIixcbiAgICBcInZlcnRleFwiOiBcImF0dHJpYnV0ZSB2ZWMyIGFfcG9zaXRpb247IGF0dHJpYnV0ZSB2ZWMyIGFfdGV4Q29vcmQ7IHVuaWZvcm0gdmVjMiB1X3Jlc29sdXRpb247IHZhcnlpbmcgdmVjMiB2X3RleENvb3JkOyAgdm9pZCBtYWluKCkgeyAgICAgdmVjMiB6ZXJvVG9PbmUgPSBhX3Bvc2l0aW9uIC8gdV9yZXNvbHV0aW9uOyAgICAgdmVjMiB6ZXJvVG9Ud28gPSB6ZXJvVG9PbmUgKiAyLjA7ICAgICB2ZWMyIGNsaXBTcGFjZSA9IHplcm9Ub1R3byAtIDEuMDsgICAgIGdsX1Bvc2l0aW9uID0gdmVjNChjbGlwU3BhY2UgKiB2ZWMyKDEsIC0xKSwgMCwgMSk7ICAgICB2X3RleENvb3JkID0gYV90ZXhDb29yZDsgfVwiXG4gIH0sXG4gIFwicGFzc3Rocm91Z2hcIjoge1xuICAgIFwiZnJhZ21lbnRcIjogXCJwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDsgdW5pZm9ybSBzYW1wbGVyMkQgdV9pbWFnZTA7IHZhcnlpbmcgdmVjMiB2X3RleENvb3JkOyAgdm9pZCBtYWluKCkgeyAgICAgZ2xfRnJhZ0NvbG9yID0gdGV4dHVyZTJEKHVfaW1hZ2UwLCB2X3RleENvb3JkKTsgfVwiLFxuICAgIFwidmVydGV4XCI6IFwiYXR0cmlidXRlIHZlYzIgYV9wb3NpdGlvbjsgYXR0cmlidXRlIHZlYzIgYV90ZXhDb29yZDsgdW5pZm9ybSB2ZWMyIHVfcmVzb2x1dGlvbjsgdmFyeWluZyB2ZWMyIHZfdGV4Q29vcmQ7ICB2b2lkIG1haW4oKSB7ICAgICB2ZWMyIHplcm9Ub09uZSA9IGFfcG9zaXRpb24gLyB1X3Jlc29sdXRpb247ICAgICB2ZWMyIHplcm9Ub1R3byA9IHplcm9Ub09uZSAqIDIuMDsgICAgIHZlYzIgY2xpcFNwYWNlID0gemVyb1RvVHdvIC0gMS4wOyAgICAgZ2xfUG9zaXRpb24gPSB2ZWM0KGNsaXBTcGFjZSAqIHZlYzIoMSwgLTEpLCAwLCAxKTsgICAgIHZfdGV4Q29vcmQgPSBhX3RleENvb3JkOyB9XCJcbiAgfSxcbiAgXCJzZXBpYVwiOiB7XG4gICAgXCJmcmFnbWVudFwiOiBcInByZWNpc2lvbiBtZWRpdW1wIGZsb2F0OyB2YXJ5aW5nIHZlYzIgdl90ZXhDb29yZDsgIHVuaWZvcm0gc2FtcGxlcjJEIHVfaW1hZ2UwOyB1bmlmb3JtIHZlYzQgbGlnaHQ7IHVuaWZvcm0gdmVjNCBkYXJrOyB1bmlmb3JtIGZsb2F0IGRlc2F0OyB1bmlmb3JtIGZsb2F0IHRvbmVkOyAgY29uc3QgbWF0NCBjb2VmZiA9IG1hdDQoICAgICAwLjM5MywgMC4zNDksIDAuMjcyLCAxLjAsICAgICAwLjc5NiwgMC42ODYsIDAuNTM0LCAxLjAsICAgICAwLjE4OSwgMC4xNjgsIDAuMTMxLCAxLjAsICAgICAwLjAsIDAuMCwgMC4wLCAxLjAgKTsgIHZvaWQgbWFpbih2b2lkKSB7ICAgICB2ZWM0IHNvdXJjZVBpeGVsID0gdGV4dHVyZTJEKHVfaW1hZ2UwLCB2X3RleENvb3JkKTsgICAgIGdsX0ZyYWdDb2xvciA9IGNvZWZmICogc291cmNlUGl4ZWw7IH1cIixcbiAgICBcInZlcnRleFwiOiBcImF0dHJpYnV0ZSB2ZWMyIGFfcG9zaXRpb247IGF0dHJpYnV0ZSB2ZWMyIGFfdGV4Q29vcmQ7IHVuaWZvcm0gdmVjMiB1X3Jlc29sdXRpb247IHZhcnlpbmcgdmVjMiB2X3RleENvb3JkOyAgdm9pZCBtYWluKCkgeyAgICAgdmVjMiB6ZXJvVG9PbmUgPSBhX3Bvc2l0aW9uIC8gdV9yZXNvbHV0aW9uOyAgICAgdmVjMiB6ZXJvVG9Ud28gPSB6ZXJvVG9PbmUgKiAyLjA7ICAgICB2ZWMyIGNsaXBTcGFjZSA9IHplcm9Ub1R3byAtIDEuMDsgICAgIGdsX1Bvc2l0aW9uID0gdmVjNChjbGlwU3BhY2UgKiB2ZWMyKDEsIC0xKSwgMCwgMSk7ICAgICB2X3RleENvb3JkID0gYV90ZXhDb29yZDsgfVwiXG4gIH0sXG4gIFwic29iZWxfZWRnZV9kZXRlY3Rpb25cIjoge1xuICAgIFwiZnJhZ21lbnRcIjogXCJwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDsgdmFyeWluZyB2ZWMyIHZfdGV4Q29vcmQ7IHVuaWZvcm0gc2FtcGxlcjJEIHVfaW1hZ2UwOyB1bmlmb3JtIHZlYzIgZl9yZXNvbHV0aW9uOyAgdm9pZCBtYWluKHZvaWQpIHsgICAgIGZsb2F0IHggPSAxLjAgLyBmX3Jlc29sdXRpb24ueDsgICAgIGZsb2F0IHkgPSAxLjAgLyBmX3Jlc29sdXRpb24ueTsgICAgIHZlYzQgaG9yaXpFZGdlID0gdmVjNCggMC4wICk7ICAgICBob3JpekVkZ2UgLT0gdGV4dHVyZTJEKCB1X2ltYWdlMCwgdmVjMiggdl90ZXhDb29yZC54IC0geCwgdl90ZXhDb29yZC55IC0geSApICkgKiAxLjA7ICAgICBob3JpekVkZ2UgLT0gdGV4dHVyZTJEKCB1X2ltYWdlMCwgdmVjMiggdl90ZXhDb29yZC54IC0geCwgdl90ZXhDb29yZC55ICAgICApICkgKiAyLjA7ICAgICBob3JpekVkZ2UgLT0gdGV4dHVyZTJEKCB1X2ltYWdlMCwgdmVjMiggdl90ZXhDb29yZC54IC0geCwgdl90ZXhDb29yZC55ICsgeSApICkgKiAxLjA7ICAgICBob3JpekVkZ2UgKz0gdGV4dHVyZTJEKCB1X2ltYWdlMCwgdmVjMiggdl90ZXhDb29yZC54ICsgeCwgdl90ZXhDb29yZC55IC0geSApICkgKiAxLjA7ICAgICBob3JpekVkZ2UgKz0gdGV4dHVyZTJEKCB1X2ltYWdlMCwgdmVjMiggdl90ZXhDb29yZC54ICsgeCwgdl90ZXhDb29yZC55ICAgICApICkgKiAyLjA7ICAgICBob3JpekVkZ2UgKz0gdGV4dHVyZTJEKCB1X2ltYWdlMCwgdmVjMiggdl90ZXhDb29yZC54ICsgeCwgdl90ZXhDb29yZC55ICsgeSApICkgKiAxLjA7ICAgICB2ZWM0IHZlcnRFZGdlID0gdmVjNCggMC4wICk7ICAgICB2ZXJ0RWRnZSAtPSB0ZXh0dXJlMkQoIHVfaW1hZ2UwLCB2ZWMyKCB2X3RleENvb3JkLnggLSB4LCB2X3RleENvb3JkLnkgLSB5ICkgKSAqIDEuMDsgICAgIHZlcnRFZGdlIC09IHRleHR1cmUyRCggdV9pbWFnZTAsIHZlYzIoIHZfdGV4Q29vcmQueCAgICAsIHZfdGV4Q29vcmQueSAtIHkgKSApICogMi4wOyAgICAgdmVydEVkZ2UgLT0gdGV4dHVyZTJEKCB1X2ltYWdlMCwgdmVjMiggdl90ZXhDb29yZC54ICsgeCwgdl90ZXhDb29yZC55IC0geSApICkgKiAxLjA7ICAgICB2ZXJ0RWRnZSArPSB0ZXh0dXJlMkQoIHVfaW1hZ2UwLCB2ZWMyKCB2X3RleENvb3JkLnggLSB4LCB2X3RleENvb3JkLnkgKyB5ICkgKSAqIDEuMDsgICAgIHZlcnRFZGdlICs9IHRleHR1cmUyRCggdV9pbWFnZTAsIHZlYzIoIHZfdGV4Q29vcmQueCAgICAsIHZfdGV4Q29vcmQueSArIHkgKSApICogMi4wOyAgICAgdmVydEVkZ2UgKz0gdGV4dHVyZTJEKCB1X2ltYWdlMCwgdmVjMiggdl90ZXhDb29yZC54ICsgeCwgdl90ZXhDb29yZC55ICsgeSApICkgKiAxLjA7ICAgICB2ZWMzIGVkZ2UgPSBzcXJ0KChob3JpekVkZ2UucmdiICogaG9yaXpFZGdlLnJnYikgKyAodmVydEVkZ2UucmdiICogdmVydEVkZ2UucmdiKSk7ICAgICAgZ2xfRnJhZ0NvbG9yID0gdmVjNCggZWRnZSwgdGV4dHVyZTJEKCB1X2ltYWdlMCwgdl90ZXhDb29yZCApLmEgKTsgfVwiLFxuICAgIFwidmVydGV4XCI6IFwiYXR0cmlidXRlIHZlYzIgYV9wb3NpdGlvbjsgYXR0cmlidXRlIHZlYzIgYV90ZXhDb29yZDsgdW5pZm9ybSB2ZWMyIHVfcmVzb2x1dGlvbjsgdmFyeWluZyB2ZWMyIHZfdGV4Q29vcmQ7ICB2b2lkIG1haW4oKSB7ICAgICB2ZWMyIHplcm9Ub09uZSA9IGFfcG9zaXRpb24gLyB1X3Jlc29sdXRpb247ICAgICB2ZWMyIHplcm9Ub1R3byA9IHplcm9Ub09uZSAqIDIuMDsgICAgIHZlYzIgY2xpcFNwYWNlID0gemVyb1RvVHdvIC0gMS4wOyAgICAgZ2xfUG9zaXRpb24gPSB2ZWM0KGNsaXBTcGFjZSAqIHZlYzIoMSwgLTEpLCAwLCAxKTsgICAgIHZfdGV4Q29vcmQgPSBhX3RleENvb3JkOyB9XCJcbiAgfVxufSIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIHtcclxuICAgIC8qKlxyXG4gICAgICogYy10b3JcclxuICAgICAqIEBwYXJhbSBnbFxyXG4gICAgICogQHBhcmFtIHdpZHRoXHJcbiAgICAgKiBAcGFyYW0gaGVpZ2h0XHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGdsLCB3aWR0aCwgaGVpZ2h0KSB7XHJcbiAgICAgICAgLyoqIGludGVybmFsIHRleHR1cmUgYXJyYXkgKi9cclxuICAgICAgICB0aGlzLl90ZXh0dXJlcyA9IHt9O1xyXG5cclxuICAgICAgICAvKiogd2lkdGggKi9cclxuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XHJcblxyXG4gICAgICAgIC8qKiBoZWlnaHQgKi9cclxuICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcclxuXHJcbiAgICAgICAgLyoqIGdsIGNvbnRleHQgKi9cclxuICAgICAgICB0aGlzLmdsID0gZ2w7XHJcblxyXG4gICAgICAgIC8qKiB1bmluaXRpYWxpemVkIHRleHR1cmVzICovXHJcbiAgICAgICAgdGhpcy5fdW5pdGlhbGl6ZWQgPSBbXTtcclxuXHJcbiAgICAgICAgLyoqIGRpcnR5IHRleHR1cmVzIChuZWVkcyB1cGRhdGluZykgKi9cclxuICAgICAgICB0aGlzLl9kaXJ0eSA9IFtdO1xyXG5cclxuICAgICAgICAvKiogdGV4dHVyZSBpbmRpY2VzICovXHJcbiAgICAgICAgdGhpcy50ZXh0dXJlSW5kaWNlcyA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYWRkIGEgdGV4dHVyZVxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSB0ZXh0dXJlXHJcbiAgICAgKiBAcGFyYW0ge0ludGVnZXJ9IGdsaW5kZXhcclxuICAgICAqIEBwYXJhbSB7QXJyYXl9IHBpeGVsc3RvcmVcclxuICAgICAqL1xyXG4gICAgYWRkKG5hbWUsIHRleHR1cmUsIGdsaW5kZXgsIHBpeGVsc3RvcmUpIHtcclxuICAgICAgICBpZiAoIWdsaW5kZXgpIHtcclxuICAgICAgICAgICAgZ2xpbmRleCA9IDA7XHJcbiAgICAgICAgICAgIHdoaWxlICh0aGlzLnRleHR1cmVJbmRpY2VzLmluZGV4T2YoZ2xpbmRleCkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICBnbGluZGV4ICsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXBpeGVsc3RvcmUpIHtcclxuICAgICAgICAgICAgcGl4ZWxzdG9yZSA9IFtdO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnRleHR1cmVJbmRpY2VzLnB1c2goZ2xpbmRleCk7XHJcblxyXG4gICAgICAgIHRoaXMuX3RleHR1cmVzW25hbWVdID0ge1xyXG4gICAgICAgICAgICBuYW1lOiBuYW1lLFxyXG4gICAgICAgICAgICBnbGluZGV4OiBnbGluZGV4LFxyXG4gICAgICAgICAgICB0ZXh0dXJlOiB0ZXh0dXJlLFxyXG4gICAgICAgICAgICBnbHRleHR1cmU6IHRoaXMuZ2wuY3JlYXRlVGV4dHVyZSgpLFxyXG4gICAgICAgICAgICBpbml0aWFsaXplZDogZmFsc2UsXHJcbiAgICAgICAgICAgIHBpeGVsU3RvcmU6IHBpeGVsc3RvcmUsXHJcbiAgICAgICAgICAgIGRpcnR5OiB0cnVlIH07XHJcblxyXG4gICAgICAgIHRoaXMuX3VuaXRpYWxpemVkLnB1c2godGhpcy5fdGV4dHVyZXNbbmFtZV0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIHVwZGF0ZSBhIHVuaWZvcm1cclxuICAgICAqIEBwYXJhbSBuYW1lIG5hbWUgb2YgdGV4dHVyZVxyXG4gICAgICogQHBhcmFtIHRleHR1cmVcclxuICAgICAqL1xyXG4gICAgdXBkYXRlKG5hbWUsIHRleHR1cmUpIHtcclxuICAgICAgICBpZiAodGV4dHVyZSkge1xyXG4gICAgICAgICAgICB0aGlzLl90ZXh0dXJlc1tuYW1lXS50ZXh0dXJlID0gdGV4dHVyZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fdGV4dHVyZXNbbmFtZV0uZGlydHkgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuX2RpcnR5LnB1c2godGhpcy5fdGV4dHVyZXNbbmFtZV0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIHJlZnJlc2ggc2NlbmUgd2l0aCB1cGRhdGVkIHRleHR1cmVzXHJcbiAgICAgKi9cclxuICAgIHJlZnJlc2hTY2VuZSgpIHtcclxuICAgICAgICBmb3IgKHZhciBjID0gMDsgYyA8IHRoaXMuX2RpcnR5Lmxlbmd0aDsgYysrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2wuYWN0aXZlVGV4dHVyZSh0aGlzLmdsWydURVhUVVJFJyArIHRoaXMuX2RpcnR5W2NdLmdsaW5kZXhdKTtcclxuICAgICAgICAgICAgdGhpcy5nbC5iaW5kVGV4dHVyZSh0aGlzLmdsLlRFWFRVUkVfMkQsIHRoaXMuX2RpcnR5W2NdLmdsdGV4dHVyZSk7XHJcbiAgICAgICAgICAgIHRoaXMuZ2wudGV4U3ViSW1hZ2UyRCh0aGlzLmdsLlRFWFRVUkVfMkQsIDAsIDAsIDAsIHRoaXMuZ2wuUkdCQSwgdGhpcy5nbC5VTlNJR05FRF9CWVRFLCB0aGlzLl9kaXJ0eVtjXS50ZXh0dXJlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fZGlydHkgPSBbXTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBpbml0aWFsaXplIG5ldyB0ZXh0dXJlc1xyXG4gICAgICogQHBhcmFtIHByb2dyYW1cclxuICAgICAqL1xyXG4gICAgaW5pdGlhbGl6ZU5ld1RleHR1cmVzKHByb2dyYW0pIHtcclxuICAgICAgICBpZiAodGhpcy5fdW5pdGlhbGl6ZWQubGVuZ3RoID09PSAwKSB7IHJldHVybjsgfVxyXG4gICAgICAgIHZhciBnbCA9IHRoaXMuZ2w7XHJcbiAgICAgICAgZm9yICh2YXIgYyA9IDA7IGMgPCB0aGlzLl91bml0aWFsaXplZC5sZW5ndGg7IGMrKykge1xyXG4gICAgICAgICAgICB0aGlzLl91bml0aWFsaXplZFtjXS5sb2NhdGlvbiA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtLCAndV9pbWFnZScgKyB0aGlzLl91bml0aWFsaXplZFtjXS5nbGluZGV4KTtcclxuICAgICAgICAgICAgZ2wudW5pZm9ybTFpKHRoaXMuX3VuaXRpYWxpemVkW2NdLmxvY2F0aW9uLCB0aGlzLl91bml0aWFsaXplZFtjXS5nbGluZGV4KTtcclxuICAgICAgICAgICAgZ2wuYWN0aXZlVGV4dHVyZShnbFsnVEVYVFVSRScgKyB0aGlzLl91bml0aWFsaXplZFtjXS5nbGluZGV4XSk7XHJcbiAgICAgICAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRoaXMuX3VuaXRpYWxpemVkW2NdLmdsdGV4dHVyZSk7XHJcbiAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1MsIGdsLkNMQU1QX1RPX0VER0UpO1xyXG4gICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9ULCBnbC5DTEFNUF9UT19FREdFKTtcclxuICAgICAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIGdsLk5FQVJFU1QpO1xyXG4gICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKHZhciBkID0gMDsgZCA8IHRoaXMuX3VuaXRpYWxpemVkW2NdLnBpeGVsU3RvcmUubGVuZ3RoOyBkKyspIHtcclxuICAgICAgICAgICAgICAgIGdsLnBpeGVsU3RvcmVpKGdsW3RoaXMuX3VuaXRpYWxpemVkW2NdLnBpeGVsU3RvcmVbZF0ucHJvcGVydHldLCB0aGlzLl91bml0aWFsaXplZFtjXS5waXhlbFN0b3JlW2RdLnZhbHVlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZ2wudGV4SW1hZ2UyRChnbC5URVhUVVJFXzJELCAwLCBnbC5SR0JBLCBnbC5SR0JBLCBnbC5VTlNJR05FRF9CWVRFLCB0aGlzLl91bml0aWFsaXplZFtjXS50ZXh0dXJlKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX3VuaXRpYWxpemVkW2NdLmluaXRpYWxpemVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5fdW5pdGlhbGl6ZWRbY10uZGlydHkgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fdW5pdGlhbGl6ZWQgPSBbXTtcclxuICAgIH07XHJcbn0iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyB7XHJcbiAgICAvKipcclxuICAgICAqIGMtdG9yXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGludGVybmFsIG1hcHBpbmcgb2YgdW5pZm9ybXNcclxuICAgICAgICAgKiBAdHlwZSB7e319XHJcbiAgICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLl91bmlmb3JtcyA9IHt9O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYWRkIGEgdW5pZm9ybVxyXG4gICAgICogQHBhcmFtIHR5cGUgdHlwZSBvZiB1bmlmb3JtICgxZiwgMmYsIDNmLCA0ZiwgMWksIDJpLCAzaSwgNHVcclxuICAgICAqL1xyXG4gICAgYWRkKG5hbWUsIHR5cGUsIHZhbHVlcykge1xyXG4gICAgICAgIHRoaXMuX3VuaWZvcm1zW25hbWVdID0geyBuYW1lOiBuYW1lLCB0eXBlOiB0eXBlLCB2YWx1ZXM6IHZhbHVlcywgZGlydHk6IHRydWUgfTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB1cGRhdGUgYSB1bmlmb3JtXHJcbiAgICAgKiBAcGFyYW0gdHlwZSB0eXBlIG9mIHVuaWZvcm0gKDFmLCAyZiwgM2YsIDRmLCAxaSwgMmksIDNpLCA0dVxyXG4gICAgICovXHJcbiAgICB1cGRhdGUobmFtZSwgdmFsdWVzKSB7XHJcbiAgICAgICAgdGhpcy5fdW5pZm9ybXNbbmFtZV0udmFsdWVzID0gdmFsdWVzO1xyXG4gICAgICAgIHRoaXMuX3VuaWZvcm1zW25hbWVdLmRpcnR5ID0gdHJ1ZTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogdXBkYXRlIHVuaWZvcm1zIG9uIEdMIGNvbnRleHQgYW5kIHByb2dyYW1cclxuICAgICAqIEBwYXJhbSBnbCBXZWJHTCBjb250ZXh0XHJcbiAgICAgKiBAcGFyYW0gcHJvZ3JhbVxyXG4gICAgICovXHJcbiAgICB1cGRhdGVQcm9ncmFtKGdsLCBwcm9ncmFtKSB7XHJcbiAgICAgICAgZm9yICh2YXIgYyBpbiB0aGlzLl91bmlmb3Jtcykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fdW5pZm9ybXNbY10uZGlydHkpIHtcclxuICAgICAgICAgICAgICAgIHZhciB1ID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByb2dyYW0sIHRoaXMuX3VuaWZvcm1zW2NdLm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLl91bmlmb3Jtc1tjXS50eXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnMWYnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBnbC51bmlmb3JtMWYodSwgdGhpcy5fdW5pZm9ybXNbY10udmFsdWVzWzBdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJzJmJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ2wudW5pZm9ybTJmKHUsIHRoaXMuX3VuaWZvcm1zW2NdLnZhbHVlc1swXSwgdGhpcy5fdW5pZm9ybXNbY10udmFsdWVzWzFdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJzNmJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ2wudW5pZm9ybTNmKHUsIHRoaXMuX3VuaWZvcm1zW2NdLnZhbHVlc1swXSwgdGhpcy5fdW5pZm9ybXNbY10udmFsdWVzWzFdLCB0aGlzLl91bmlmb3Jtc1tjXS52YWx1ZXNbMl0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnNGYnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBnbC51bmlmb3JtNGYodSwgdGhpcy5fdW5pZm9ybXNbY10udmFsdWVzWzBdLCB0aGlzLl91bmlmb3Jtc1tjXS52YWx1ZXNbMV0sIHRoaXMuX3VuaWZvcm1zW2NdLnZhbHVlc1syXSwgdGhpcy5fdW5pZm9ybXNbY10udmFsdWVzWzNdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJzFpJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ2wudW5pZm9ybTFpKHUsIHRoaXMuX3VuaWZvcm1zW2NdLnZhbHVlc1swXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjYXNlICcyaSc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsLnVuaWZvcm0yaSh1LCB0aGlzLl91bmlmb3Jtc1tjXS52YWx1ZXNbMF0sIHRoaXMuX3VuaWZvcm1zW2NdLnZhbHVlc1sxXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjYXNlICczaSc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsLnVuaWZvcm0zaSh1LCB0aGlzLl8udW5pZm9ybXNbY10udmFsdWVzWzBdLCB0aGlzLl91bmlmb3Jtc1tjXS52YWx1ZXNbMV0sIHRoaXMuX3VuaWZvcm1zW2NdLnZhbHVlc1syXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjYXNlICc0aSc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsLnVuaWZvcm1pZih1LCB0aGlzLl91bmlmb3Jtc1tjXS52YWx1ZXNbMF0sIHRoaXMuX3VuaWZvcm1zW2NdLnZhbHVlc1sxXSwgdGhpcy5fdW5pZm9ybXNbY10udmFsdWVzWzJdLCB0aGlzLl91bmlmb3Jtc1tjXS52YWx1ZXNbM10pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImltcG9ydCBDQ1dDVmlkZW8gZnJvbSAnLi9jY3djLXZpZGVvLmVzNic7XHJcbmltcG9ydCBGaWx0ZXJzIGZyb20gJy4uL25vZGVfbW9kdWxlcy9jY3djLWltYWdlLXV0aWxzL3NyYy93ZWJnbC9maWx0ZXJzLmVzNic7XHJcbmltcG9ydCBTaGFkZXJzIGZyb20gJy4uL25vZGVfbW9kdWxlcy9jY3djLWltYWdlLXV0aWxzL3NyYy93ZWJnbC9zaGFkZXJzLmVzNic7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBleHRlbmRzIENDV0NWaWRlbyB7XHJcbiAgICAvKipcclxuICAgICAqIGluaXRpYWxpemUgZGVmYXVsdCBjbGFzcyBwcm9wZXJ0aWVzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBzZXRQcm9wZXJ0aWVzKCkge1xyXG4gICAgICAgIHN1cGVyLnNldFByb3BlcnRpZXMoKTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogV2hlbiB0aGUgdGV4dHVyZSByZWFkIChfZ2xSZWFkRmxpcENvcnJlY3Rpb24pIGlzIHRydWUsIHRoaXMgbWFrZXMgdGhlIGRpc3BsYXkgZ28gdXBzaWRlIGRvd24sIGNvcnJlY3QgdGhlIGNhbnZhcyBieSBpbnZlcnNlIHNjYWxpbmcgaW4gdGhlIHZlcnRpY2FsXHJcbiAgICAgICAgICogQHR5cGUge0Jvb2xlYW59XHJcbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLl9mbGlwQ2FudmFzID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIHVzZSB3ZWJnbFxyXG4gICAgICAgICAqIEB0eXBlIHtib29sZWFufVxyXG4gICAgICAgICAqIEBwcml2YXRlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5fdXNlV2ViR0wgPSBmYWxzZTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBvbiB2aWRlbyBwbGF5aW5nIGhhbmRsZXJcclxuICAgICAqL1xyXG4gICAgb25QbGF5aW5nKCkge1xyXG4gICAgICAgIHN1cGVyLm9uUGxheWluZygpO1xyXG4gICAgICAgIGlmICh0aGlzLl91c2VXZWJHTCkge1xyXG4gICAgICAgICAgICB0aGlzLndlYmdsUHJvcGVydGllcy5yZW5kZXJvYmogPSB0aGlzLndlYmdsUHJvcGVydGllcy5zZXR1cEhhbmRsZXIuYXBwbHkodGhpcywgW3RoaXMud2ViZ2xQcm9wZXJ0aWVzXSk7XHJcbiAgICAgICAgICAgIHZhciBldmVudCA9IG5ldyBDdXN0b21FdmVudCgnd2ViZ2xzZXR1cCcsIHsgZGV0YWlsOiB7IHByb3BlcnRpZXM6IHRoaXMud2ViZ2xQcm9wZXJ0aWVzIH0gfSk7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChldmVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIGdldCBpbWFnZSBkYXRhIGZvciBjdXJyZW50IGZyYW1lXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IG1vZGUgZGF0YSBtb2RlIChiaW5hcnkgb3IgYmFzZTY0KVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBub3JlZHJhdyBkbyBub3QgcGVyZm9ybSByZWRyYXcgKGNhbiBiZSB3YXN0ZWZ1bClcclxuICAgICAqIEByZXR1cm4ge29iamVjdH0gaW1hZ2UgZGF0YVxyXG4gICAgICovXHJcbiAgICBnZXRDdXJyZW50RnJhbWVEYXRhKG1vZGUsIG5vcmVkcmF3KSB7XHJcbiAgICAgICAgdmFyIGRhdGEsIGZpbHRlcmVkO1xyXG4gICAgICAgIGlmICghbW9kZSkge1xyXG4gICAgICAgICAgICBtb2RlID0gdGhpcy5mcmFtZURhdGFNb2RlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIW5vcmVkcmF3KSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl91c2VXZWJHTCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy53ZWJnbFByb3BlcnRpZXMucmVuZGVyb2JqLnRleHR1cmVzLnVwZGF0ZSgndmlkZW8nKTtcclxuICAgICAgICAgICAgICAgIHRoaXMud2ViZ2xQcm9wZXJ0aWVzLnJlbmRlckhhbmRsZXIodGhpcy53ZWJnbFByb3BlcnRpZXMucmVuZGVyb2JqKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzY3R4LmRyYXdJbWFnZShcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnZpZGVvRWxlbWVudCwgMCwgMCxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnZpZGVvU2NhbGVkV2lkdGggKiB0aGlzLmNhbnZhc1NjYWxlLFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmlkZW9TY2FsZWRIZWlnaHQgKiB0aGlzLmNhbnZhc1NjYWxlKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jYW52YXNGaWx0ZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJlZCA9IHRoaXMuY2FudmFzY3R4LmdldEltYWdlRGF0YSgwLCAwLCB0aGlzLnZpZGVvU2NhbGVkV2lkdGggKiB0aGlzLmNhbnZhc1NjYWxlLCB0aGlzLnZpZGVvU2NhbGVkSGVpZ2h0ICogdGhpcy5jYW52YXNTY2FsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jYW52YXNjdHgucHV0SW1hZ2VEYXRhKHRoaXMuY2FudmFzRmlsdGVyKGZpbHRlcmVkKSwgMCwgMCwgMCwgMCwgdGhpcy52aWRlb1NjYWxlZFdpZHRoICogdGhpcy5jYW52YXNTY2FsZSwgdGhpcy52aWRlb1NjYWxlZEhlaWdodCAqIHRoaXMuY2FudmFzU2NhbGUgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN3aXRjaCAobW9kZSkge1xyXG4gICAgICAgICAgICAvKmNhc2UgJ2JpbmFyeSc6XHJcbiAgICAgICAgICAgICAgICB2YXIgYmFzZTY0RGF0YSA9IGRhdGEucmVwbGFjZSgnZGF0YTppbWFnZS9wbmc7YmFzZTY0JywgJycpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGJpbmFyeURhdGEgPSBuZXcgQnVmZmVyKGJhc2U2NERhdGEsICdiYXNlNjQnKTtcclxuICAgICAgICAgICAgICAgIGRhdGEgPSBiaW5hcnlEYXRhO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7Ki9cclxuXHJcbiAgICAgICAgICAgIGNhc2UgJ2ltYWdlZGF0YXVybCc6XHJcbiAgICAgICAgICAgICAgICBkYXRhID0gdGhpcy5jYW52YXNFbGVtZW50LnRvRGF0YVVSTCgnaW1hZ2UvcG5nJyk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgIGNhc2UgJ2ltYWdlZGF0YSc6XHJcbiAgICAgICAgICAgICAgICBpZiAoIWZpbHRlcmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX3VzZVdlYkdMKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEgPSBGaWx0ZXJzLmdldENhbnZhc1BpeGVscyh0aGlzLndlYmdsUHJvcGVydGllcy5yZW5kZXJvYmopO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEgPSB0aGlzLmNhbnZhc2N0eC5nZXRJbWFnZURhdGEoMCwgMCwgdGhpcy52aWRlb1NjYWxlZFdpZHRoICogdGhpcy5jYW52YXNTY2FsZSwgdGhpcy52aWRlb1NjYWxlZEhlaWdodCAqIHRoaXMuY2FudmFzU2NhbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gc2F2ZSBzb21lIENQVSBjeWNsZXMgaWYgd2UgYWxyZWFkeSBkaWQgdGhpc1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGEgPSBmaWx0ZXJlZDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2V0dXAgaGFuZGxlciBmb3IgV2ViR0wgU2NlbmVcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwcm9wcyB3ZWJnbCBwcm9wZXJ0aWVzXHJcbiAgICAgKiBAcmV0dXJuIHJlbmRlcm9ialxyXG4gICAgICovXHJcbiAgICB3ZWJnbFNldHVwSGFuZGxlcihwcm9wcykge1xyXG4gICAgICAgIHZhciBmaWx0ZXI7XHJcbiAgICAgICAgaWYgKHByb3BzLnZlcnRleFNoYWRlciAmJiBwcm9wcy5mcmFnbWVudFNoYWRlcikge1xyXG4gICAgICAgICAgICBmaWx0ZXIgPSBGaWx0ZXJzLmNyZWF0ZUZpbHRlckZyb21TaGFkZXJzKHByb3BzLnZlcnRleFNoYWRlciwgcHJvcHMuZnJhZ21lbnRTaGFkZXIpXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZmlsdGVyID0gRmlsdGVycy5jcmVhdGVGaWx0ZXJGcm9tTmFtZShwcm9wcy5maWx0ZXIsIHByb3BzLmZpbHRlckxpYnJhcnkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJvcHMudGV4dHVyZXMucHVzaCh7XHJcbiAgICAgICAgICAgIG5hbWU6ICd2aWRlbycsXHJcbiAgICAgICAgICAgIHRleHR1cmU6IHRoaXMudmlkZW9FbGVtZW50LFxyXG4gICAgICAgICAgICBwaXhlbFN0b3JlOiBbeyBwcm9wZXJ0eTogJ1VOUEFDS19GTElQX1lfV0VCR0wnLCB2YWx1ZTogdGhpcy53ZWJnbFByb3BlcnRpZXMuZmxpcFRleHR1cmVZIH1dLFxyXG4gICAgICAgICAgICBpbmRleDogMH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gRmlsdGVycy5jcmVhdGVSZW5kZXJPYmplY3Qoe1xyXG4gICAgICAgICAgICBnbDogdGhpcy5jYW52YXNjdHgsXHJcbiAgICAgICAgICAgIGZpbHRlcjogZmlsdGVyLFxyXG4gICAgICAgICAgICB0ZXh0dXJlczogcHJvcHMudGV4dHVyZXNcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZW5kZXIgaGFuZGxlciBmb3IgV2ViR0wgU2NlbmVcclxuICAgICAqIEBwYXJhbSByZW5kZXJvYmogV2ViR0wgcmVuZGVyIHByb3BlcnRpZXNcclxuICAgICAqL1xyXG4gICAgd2ViZ2xSZW5kZXJIYW5kbGVyKHJlbmRlcm9iaikge1xyXG4gICAgICAgIEZpbHRlcnMucmVuZGVyKHJlbmRlcm9iaik7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogcGFyc2UgYXR0cmlidXRlcyBvbiBlbGVtZW50XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBwYXJzZUF0dHJpYnV0ZXMoKSB7XHJcbiAgICAgICAgc3VwZXIucGFyc2VBdHRyaWJ1dGVzKCk7XHJcbiAgICAgICAgaWYgKHRoaXMuaGFzQXR0cmlidXRlKCd1c2VXZWJHTCcpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3VzZVdlYkdMID0gdHJ1ZTtcclxuICAgICAgICAgICAgdmFyIHByb3BzID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ3VzZVdlYkdMJyk7XHJcbiAgICAgICAgICAgIGlmIChwcm9wcykge1xyXG4gICAgICAgICAgICAgICAgcHJvcHMgPSBKU09OLnBhcnNlKHByb3BzKTtcclxuICAgICAgICAgICAgICAgIGlmIChwcm9wcy5mbGlwVGV4dHVyZVkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLndlYmdsUHJvcGVydGllcy5mbGlwVGV4dHVyZVkgPSBwcm9wcy5mbGlwVGV4dHVyZVk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAocHJvcHMuZmlsdGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy53ZWJnbFByb3BlcnRpZXMuZmlsdGVyID0gcHJvcHMuZmlsdGVyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5oYXNBdHRyaWJ1dGUoJ2ZsaXBDYW52YXMnKSkge1xyXG4gICAgICAgICAgICB0aGlzLl9mbGlwQ2FudmFzID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogZWxlbWVudCBjcmVhdGVkIGNhbGxiYWNrXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBjcmVhdGVkQ2FsbGJhY2soKSB7XHJcbiAgICAgICAgdGhpcy53ZWJnbFByb3BlcnRpZXMgPSB7XHJcbiAgICAgICAgICAgIGZsaXBUZXh0dXJlWTogZmFsc2UsXHJcbiAgICAgICAgICAgIGZpbHRlckxpYnJhcnk6IFNoYWRlcnMsXHJcbiAgICAgICAgICAgIHNldHVwSGFuZGxlcjogdGhpcy53ZWJnbFNldHVwSGFuZGxlcixcclxuICAgICAgICAgICAgcmVuZGVySGFuZGxlcjogdGhpcy53ZWJnbFJlbmRlckhhbmRsZXIsXHJcbiAgICAgICAgICAgIGZpbHRlcjogJ3Bhc3N0aHJvdWdoJyxcclxuICAgICAgICAgICAgdGV4dHVyZXM6IFtdXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc3VwZXIuY3JlYXRlZENhbGxiYWNrKCk7XHJcbiAgICB9O1xyXG59IiwiLyoqXHJcbiAqIENDV0NWaWRlbyBzdXBwb3J0cyBib3RoIHZpZGVvIGZpbGVzIGFuZCBjYW1lcmEgZmVlZHNcclxuICogQmxpdCB5b3VyIHZpZGVvIHRvIGEgY2FudmFzLCBnZXQgZnJhbWUgZGF0YSwgc2NhbGUgdGhlIGZyYW1lL2NhbnZhcyBvdXRwdXQsIGFuZCByZW5kZXIgdmlkZW8gdG8gYW4gZXh0ZXJuYWwgY2FudmFzIG9mIHlvdXIgY2hvb3NpbmdcclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogaW5pdGlhbGl6ZSBkZWZhdWx0IGNsYXNzIHByb3BlcnRpZXNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHNldFByb3BlcnRpZXMoKSB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogdmlkZW8gc291cmNlIGZpbGUgb3Igc3RyZWFtXHJcbiAgICAgICAgICogQHR5cGUge3N0cmluZ31cclxuICAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuX3NvdXJjZSA9ICcnO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiB1c2Ugd2ViZ2xcclxuICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cclxuICAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIC8vdGhpcy5fdXNlV2ViR0wgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogdXNlIGNhbWVyYVxyXG4gICAgICAgICAqIEB0eXBlIHtib29sZWFufVxyXG4gICAgICAgICAqIEBwcml2YXRlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5fdXNlQ2FtZXJhID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGlzIGNvbXBvbmVudCByZWFkeVxyXG4gICAgICAgICAqIEB0eXBlIHtib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuaXNSZWFkeSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBpcyB2aWRlbyBwbGF5aW5nXHJcbiAgICAgICAgICogQHR5cGUge2Jvb2xlYW59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5pc1BsYXlpbmcgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogd2lkdGggb2Ygc2NhbGVkIHZpZGVvXHJcbiAgICAgICAgICogQHR5cGUge2ludH1cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnZpZGVvU2NhbGVkV2lkdGggPSAwO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiB3aWR0aCBvZiBzY2FsZWQgdmlkZW9cclxuICAgICAgICAgKiBAdHlwZSB7aW50fVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMudmlkZW9TY2FsZWRXaWR0aCA9IDA7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGhlaWdodCBvZiBzY2FsZWQgdmlkZW9cclxuICAgICAgICAgKiBAdHlwZSB7aW50fVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMudmlkZW9TY2FsZWRIZWlnaHQgPSAwO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiB3aGF0IHR5cGUgb2YgZGF0YSBjb21lcyBiYWNrIHdpdGggZnJhbWUgZGF0YSBldmVudFxyXG4gICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XHJcbiAgICAgICAgICogQGRlZmF1bHQgaW1hZ2VkYXRhdXJsXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5mcmFtZURhdGFNb2RlID0gJ25vbmUnO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBkZXRlcm1pbmVzIHdoZXRoZXIgdG8gdXNlIHRoZSBjYW52YXMgZWxlbWVudCBmb3IgZGlzcGxheSBpbnN0ZWFkIG9mIHRoZSB2aWRlbyBlbGVtZW50XHJcbiAgICAgICAgICogQHR5cGUge2Jvb2xlYW59XHJcbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnVzZUNhbnZhc0ZvckRpc3BsYXkgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogY2FudmFzIGZpbHRlciBmdW5jdGlvbiAobWFuaXB1bGF0ZSBwaXhlbHMpXHJcbiAgICAgICAgICogQHR5cGUge21ldGhvZH1cclxuICAgICAgICAgKiBAZGVmYXVsdCAwIG1zXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5jYW52YXNGaWx0ZXIgPSBudWxsO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBXaGVuIHRoZSB0ZXh0dXJlIHJlYWQgKF9nbFJlYWRGbGlwQ29ycmVjdGlvbikgaXMgdHJ1ZSwgdGhpcyBtYWtlcyB0aGUgZGlzcGxheSBnbyB1cHNpZGUgZG93biwgY29ycmVjdCB0aGUgY2FudmFzIGJ5IGludmVyc2Ugc2NhbGluZyBpbiB0aGUgdmVydGljYWxcclxuICAgICAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cclxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIC8vdGhpcy5fZmxpcENhbnZhcyA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiByZWZyZXNoIGludGVydmFsIHdoZW4gdXNpbmcgdGhlIGNhbnZhcyBmb3IgZGlzcGxheVxyXG4gICAgICAgICAqIEB0eXBlIHtpbnR9XHJcbiAgICAgICAgICogQGRlZmF1bHQgMCBtc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuY2FudmFzUmVmcmVzaEludGVydmFsID0gMDtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogdmlkZW8gZWxlbWVudFxyXG4gICAgICAgICAqIEB0eXBlIHtIVE1MRWxlbWVudH1cclxuICAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMudmlkZW9FbGVtZW50ID0gbnVsbDtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogY2FtZXJhIHNvdXJjZXMgbGlzdFxyXG4gICAgICAgICAqIEB0eXBlIHtBcnJheX1cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmNhbWVyYVNvdXJjZXMgPSBbXTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogY2FudmFzIGVsZW1lbnRcclxuICAgICAgICAgKiBAdHlwZSB7Q2FudmFzfVxyXG4gICAgICAgICAqIEBwcml2YXRlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5jYW52YXNFbGVtZW50ID0gbnVsbDtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogY29tcG9uZW50IHNoYWRvdyByb290XHJcbiAgICAgICAgICogQHR5cGUge1NoYWRvd1Jvb3R9XHJcbiAgICAgICAgICogQHByaXZhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLnJvb3QgPSBudWxsO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBpbnRlcnZhbCB0aW1lciB0byBkcmF3IGZyYW1lIHJlZHJhd3NcclxuICAgICAgICAgKiBAdHlwZSB7aW50fVxyXG4gICAgICAgICAqIEBwcml2YXRlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy50aWNrID0gbnVsbDtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogY2FudmFzIGNvbnRleHRcclxuICAgICAgICAgKiBAdHlwZSB7Q2FudmFzQ29udGV4dH1cclxuICAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuY2FudmFzY3R4ID0gbnVsbDtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogaGFzIHRoZSBjYW52YXMgY29udGV4dCBiZWVuIG92ZXJyaWRkZW4gZnJvbSB0aGUgb3V0c2lkZT9cclxuICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cclxuICAgICAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuX2NhbnZhc092ZXJyaWRlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIHdpZHRoIG9mIGNvbXBvbmVudFxyXG4gICAgICAgICAqIEB0eXBlIHtpbnR9XHJcbiAgICAgICAgICogQGRlZmF1bHQgMFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMud2lkdGggPSAwO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBoZWlnaHQgb2YgY29tcG9uZW50XHJcbiAgICAgICAgICogQHR5cGUge2ludH1cclxuICAgICAgICAgKiBAZGVmYXVsdCAwXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSAwO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBsZWZ0IG9mZnNldCBmb3IgbGV0dGVyYm94IG9mIHZpZGVvXHJcbiAgICAgICAgICogQHR5cGUge2ludH1cclxuICAgICAgICAgKiBAZGVmYXVsdCAwXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5sZXR0ZXJCb3hMZWZ0ID0gMDtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogdG9wIG9mZnNldCBmb3IgbGV0dGVyYm94IG9mIHZpZGVvXHJcbiAgICAgICAgICogQHR5cGUge2ludH1cclxuICAgICAgICAgKiBAZGVmYXVsdCAwXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5sZXR0ZXJCb3hUb3AgPSAwO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBhc3BlY3QgcmF0aW8gb2YgdmlkZW9cclxuICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuYXNwZWN0UmF0aW8gPSAwO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiByZW5kZXIgc2NhbGUgZm9yIGNhbnZhcyBmcmFtZSBkYXRhXHJcbiAgICAgICAgICogYmVzdCB1c2VkIHdoZW4gZ3JhYmJpbmcgZnJhbWUgZGF0YSBhdCBhIGRpZmZlcmVudCBzaXplIHRoYW4gdGhlIHNob3duIHZpZGVvXHJcbiAgICAgICAgICogQGF0dHJpYnV0ZSBjYW52YXNTY2FsZVxyXG4gICAgICAgICAqIEB0eXBlIHtmbG9hdH1cclxuICAgICAgICAgKiBAZGVmYXVsdCAxLjBcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmNhbnZhc1NjYWxlID0gMS4wO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogb24gdmlkZW8gcGxheWluZyBoYW5kbGVyXHJcbiAgICAgKi9cclxuICAgIG9uUGxheWluZygpIHtcclxuICAgICAgICB0aGlzLmlzUGxheWluZyA9IHRydWU7XHJcbiAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KCd2aWRlb3BsYXlpbmcnLCB7XHJcbiAgICAgICAgICAgIGRldGFpbDoge1xyXG4gICAgICAgICAgICAgICAgc291cmNlOiB0aGlzLnNvdXJjZSxcclxuICAgICAgICAgICAgICAgIHZpZGVvRWxlbWVudDogdGhpcy52aWRlb0VsZW1lbnQsXHJcbiAgICAgICAgICAgICAgICB2aWRlb1dpZHRoOiB0aGlzLnZpZGVvU2NhbGVkV2lkdGgsXHJcbiAgICAgICAgICAgICAgICB2aWRlb0hlaWdodDogdGhpcy52aWRlb1NjYWxlZEhlaWdodCxcclxuICAgICAgICAgICAgICAgIHdpZHRoOiB0aGlzLndpZHRoLFxyXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLmhlaWdodCB9IH0pO1xyXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChldmVudCk7XHJcblxyXG4gICAgICAgIHRoaXMuY2FudmFzRWxlbWVudC53aWR0aCA9IHRoaXMudmlkZW9TY2FsZWRXaWR0aCAqIHRoaXMuY2FudmFzU2NhbGU7XHJcbiAgICAgICAgdGhpcy5jYW52YXNFbGVtZW50LmhlaWdodCA9IHRoaXMudmlkZW9TY2FsZWRIZWlnaHQgKiB0aGlzLmNhbnZhc1NjYWxlO1xyXG5cclxuICAgICAgICB2YXIgY3R4c3RyaW5nID0gdGhpcy5fdXNlV2ViR0wgPyAnd2ViZ2wnIDogJzJkJztcclxuICAgICAgICBpZiAoIXRoaXMuX2NhbnZhc092ZXJyaWRlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2FudmFzY3R4ID0gdGhpcy5jYW52YXNFbGVtZW50LmdldENvbnRleHQoY3R4c3RyaW5nKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qaWYgKHRoaXMuX3VzZVdlYkdMKSB7XHJcbiAgICAgICAgICAgIHRoaXMud2ViZ2xQcm9wZXJ0aWVzLnJlbmRlcm9iaiA9IHRoaXMud2ViZ2xQcm9wZXJ0aWVzLnNldHVwSGFuZGxlci5hcHBseSh0aGlzLCBbdGhpcy53ZWJnbFByb3BlcnRpZXNdKTtcclxuICAgICAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KCd3ZWJnbHNldHVwJywgeyBkZXRhaWw6IHsgcHJvcGVydGllczogdGhpcy53ZWJnbFByb3BlcnRpZXMgfSB9KTtcclxuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcclxuXHJcbiAgICAgICAgfSovXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB1cGRhdGUgY2FudmFzIGRpbWVuc2lvbnMgd2hlbiByZXNpemVkXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBvblJlc2l6ZSgpIHtcclxuICAgICAgICAvLyBzZXQgc2l6ZSBwcm9wZXJ0aWVzIGJhc2VkIG9uIGNvbXBvbmVudCBoZWlnaHRcclxuICAgICAgICB0aGlzLndpZHRoID0gdGhpcy5vZmZzZXRXaWR0aDtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IHRoaXMub2Zmc2V0SGVpZ2h0O1xyXG5cclxuICAgICAgICAvLyBjYWxjdWxhdGUgYXNwZWN0IHJhdGlvXHJcbiAgICAgICAgdGhpcy5hc3BlY3RSYXRpbyA9IHRoaXMudmlkZW9FbGVtZW50LnZpZGVvV2lkdGggLyB0aGlzLnZpZGVvRWxlbWVudC52aWRlb0hlaWdodDtcclxuICAgICAgICB0aGlzLnZpZGVvU2NhbGVkV2lkdGggPSB0aGlzLndpZHRoO1xyXG4gICAgICAgIHRoaXMudmlkZW9TY2FsZWRIZWlnaHQgPSB0aGlzLmhlaWdodDtcclxuXHJcbiAgICAgICAgLy8gY2FsY3VsYXRlIGxldHRlcmJveCBib3JkZXJzXHJcbiAgICAgICAgdmFyIGNvbXBvbmVudEFzcGVjdFJhdGlvID0gdGhpcy53aWR0aC90aGlzLmhlaWdodDtcclxuICAgICAgICBpZiAoY29tcG9uZW50QXNwZWN0UmF0aW8gPCB0aGlzLmFzcGVjdFJhdGlvKSB7XHJcbiAgICAgICAgICAgIHRoaXMudmlkZW9TY2FsZWRIZWlnaHQgPSB0aGlzLndpZHRoIC8gdGhpcy5hc3BlY3RSYXRpbztcclxuICAgICAgICAgICAgdGhpcy5sZXR0ZXJCb3hUb3AgPSB0aGlzLmhlaWdodC8yIC0gdGhpcy52aWRlb1NjYWxlZEhlaWdodC8yO1xyXG4gICAgICAgICAgICB0aGlzLmxldHRlckJveExlZnQgPSAwO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29tcG9uZW50QXNwZWN0UmF0aW8gPiB0aGlzLmFzcGVjdFJhdGlvKSB7XHJcbiAgICAgICAgICAgIHRoaXMudmlkZW9TY2FsZWRXaWR0aCA9IHRoaXMuaGVpZ2h0ICogdGhpcy5hc3BlY3RSYXRpbztcclxuICAgICAgICAgICAgdGhpcy5sZXR0ZXJCb3hMZWZ0ID0gdGhpcy53aWR0aC8yIC0gdGhpcy52aWRlb1NjYWxlZFdpZHRoLzI7XHJcbiAgICAgICAgICAgIHRoaXMubGV0dGVyQm94VG9wID0gMDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmxldHRlckJveFRvcCA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMubGV0dGVyQm94TGVmdCA9IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBzZXQgdmlkZW8vY2FudmFzIHRvIGNvbXBvbmVudCBzaXplXHJcbiAgICAgICAgdGhpcy52aWRlb0VsZW1lbnQuc2V0QXR0cmlidXRlKCd3aWR0aCcsIHRoaXMudmlkZW9TY2FsZWRXaWR0aCk7XHJcbiAgICAgICAgdGhpcy52aWRlb0VsZW1lbnQuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCB0aGlzLnZpZGVvU2NhbGVkSGVpZ2h0KTtcclxuICAgICAgICB0aGlzLmNhbnZhc0VsZW1lbnQuc2V0QXR0cmlidXRlKCd3aWR0aCcsIHRoaXMudmlkZW9TY2FsZWRXaWR0aCk7XHJcbiAgICAgICAgdGhpcy5jYW52YXNFbGVtZW50LnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgdGhpcy52aWRlb1NjYWxlZEhlaWdodCk7XHJcbiAgICAgICAgdGhpcy52aWRlb0VsZW1lbnQuc3R5bGUudG9wID0gdGhpcy5sZXR0ZXJCb3hUb3AgKyAncHgnO1xyXG4gICAgICAgIHRoaXMudmlkZW9FbGVtZW50LnN0eWxlLmxlZnQgPSB0aGlzLmxldHRlckJveExlZnQgKyAncHgnO1xyXG4gICAgICAgIHRoaXMuY2FudmFzRWxlbWVudC5zdHlsZS50b3AgPSB0aGlzLmxldHRlckJveFRvcCArICdweCc7XHJcbiAgICAgICAgdGhpcy5jYW52YXNFbGVtZW50LnN0eWxlLmxlZnQgPSB0aGlzLmxldHRlckJveExlZnQgKyAncHgnO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzZXQgdmlkZW8gc291cmNlXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZyB8IGludH0gc3JjIHZpZGVvIHNvdXJjZSB1cmlcclxuICAgICAqL1xyXG4gICAgc2V0IHNvdXJjZShzcmMpIHtcclxuICAgICAgICBpZiAoIXNyYykgeyByZXR1cm47IH1cclxuICAgICAgICB0aGlzLl9zb3VyY2UgPSBzcmM7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl91c2VDYW1lcmEgJiYgdGhpcy5jYW1lcmFTb3VyY2VzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlZnJlc2hDYW1lcmFTb3VyY2VzKCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl91c2VDYW1lcmEgfHwgcGFyc2VJbnQoc3JjKSA9PT0gc3JjKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0Q2FtZXJhU291cmNlQnlJbmRleChzcmMpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fdXNlQ2FtZXJhKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0Q2FtZXJhU291cmNlQnlJRChzcmMpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMudmlkZW9FbGVtZW50LnNyYyA9IHNyYztcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogZ2V0IHZpZGVvIHNvdXJjZVxyXG4gICAgICogQHJldHVybiB7c3RyaW5nIHwgaW50fSBzcmMgdmlkZW8gc291cmNlIHVyaVxyXG4gICAgICovXHJcbiAgICBnZXQgc291cmNlKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zb3VyY2U7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogZ2V0IGNhbnZhcyBjb250ZXh0IGZvciBkcmF3aW5nIGludG8gaXRcclxuICAgICAqIEByZXR1cm4ge29iamVjdH0gY29udGV4dCBjYW52YXMgY29udGV4dFxyXG4gICAgICovXHJcbiAgICBnZXQgY2FudmFzQ29udGV4dCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jYW52YXNjdHg7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogZ2V0IGNhbnZhcyBjb250ZXh0IGZvciBkcmF3aW5nIGludG8gaXRcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb250ZXh0IGNhbnZhcyBjb250ZXh0XHJcbiAgICAgKi9cclxuICAgIHNldCBjYW52YXNDb250ZXh0KGNvbnRleHQpIHtcclxuICAgICAgICB0aGlzLmNhbnZhc2N0eCA9IGNvbnRleHQ7XHJcbiAgICAgICAgdGhpcy5fY2FudmFzT3ZlcnJpZGUgPSB0cnVlO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIGdldCBpbWFnZSBkYXRhIGZvciBjdXJyZW50IGZyYW1lXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IG1vZGUgZGF0YSBtb2RlIChiaW5hcnkgb3IgYmFzZTY0KVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBub3JlZHJhdyBkbyBub3QgcGVyZm9ybSByZWRyYXcgKGNhbiBiZSB3YXN0ZWZ1bClcclxuICAgICAqIEByZXR1cm4ge29iamVjdH0gaW1hZ2UgZGF0YVxyXG4gICAgICovXHJcbiAgICBnZXRDdXJyZW50RnJhbWVEYXRhKG1vZGUsIG5vcmVkcmF3KSB7XHJcbiAgICAgICAgdmFyIGRhdGEsIGZpbHRlcmVkO1xyXG4gICAgICAgIGlmICghbW9kZSkge1xyXG4gICAgICAgICAgICBtb2RlID0gdGhpcy5mcmFtZURhdGFNb2RlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIW5vcmVkcmF3KSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl91c2VXZWJHTCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy53ZWJnbFByb3BlcnRpZXMucmVuZGVyb2JqLnRleHR1cmVzLnVwZGF0ZSgndmlkZW8nKTtcclxuICAgICAgICAgICAgICAgIHRoaXMud2ViZ2xQcm9wZXJ0aWVzLnJlbmRlckhhbmRsZXIodGhpcy53ZWJnbFByb3BlcnRpZXMucmVuZGVyb2JqKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzY3R4LmRyYXdJbWFnZShcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnZpZGVvRWxlbWVudCwgMCwgMCxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnZpZGVvU2NhbGVkV2lkdGggKiB0aGlzLmNhbnZhc1NjYWxlLFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmlkZW9TY2FsZWRIZWlnaHQgKiB0aGlzLmNhbnZhc1NjYWxlKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jYW52YXNGaWx0ZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJlZCA9IHRoaXMuY2FudmFzY3R4LmdldEltYWdlRGF0YSgwLCAwLCB0aGlzLnZpZGVvU2NhbGVkV2lkdGggKiB0aGlzLmNhbnZhc1NjYWxlLCB0aGlzLnZpZGVvU2NhbGVkSGVpZ2h0ICogdGhpcy5jYW52YXNTY2FsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jYW52YXNjdHgucHV0SW1hZ2VEYXRhKHRoaXMuY2FudmFzRmlsdGVyKGZpbHRlcmVkKSwgMCwgMCwgMCwgMCwgdGhpcy52aWRlb1NjYWxlZFdpZHRoICogdGhpcy5jYW52YXNTY2FsZSwgdGhpcy52aWRlb1NjYWxlZEhlaWdodCAqIHRoaXMuY2FudmFzU2NhbGUgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN3aXRjaCAobW9kZSkge1xyXG4gICAgICAgICAgICAvKmNhc2UgJ2JpbmFyeSc6XHJcbiAgICAgICAgICAgICAgICB2YXIgYmFzZTY0RGF0YSA9IGRhdGEucmVwbGFjZSgnZGF0YTppbWFnZS9wbmc7YmFzZTY0JywgJycpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGJpbmFyeURhdGEgPSBuZXcgQnVmZmVyKGJhc2U2NERhdGEsICdiYXNlNjQnKTtcclxuICAgICAgICAgICAgICAgIGRhdGEgPSBiaW5hcnlEYXRhO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7Ki9cclxuXHJcbiAgICAgICAgICAgIGNhc2UgJ2ltYWdlZGF0YXVybCc6XHJcbiAgICAgICAgICAgICAgICBkYXRhID0gdGhpcy5jYW52YXNFbGVtZW50LnRvRGF0YVVSTCgnaW1hZ2UvcG5nJyk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgIGNhc2UgJ2ltYWdlZGF0YSc6XHJcbiAgICAgICAgICAgICAgICBpZiAoIWZpbHRlcmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9pZiAodGhpcy5fdXNlV2ViR0wpIHtcclxuICAgICAgICAgICAgICAgICAgICAgIC8vICBkYXRhID0gY2N3Yy5pbWFnZS53ZWJnbC5maWx0ZXIuZ2V0Q2FudmFzUGl4ZWxzKHRoaXMud2ViZ2xQcm9wZXJ0aWVzLnJlbmRlcm9iaik7XHJcbiAgICAgICAgICAgICAgICAgICAgLy99IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhID0gdGhpcy5jYW52YXNjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIHRoaXMudmlkZW9TY2FsZWRXaWR0aCAqIHRoaXMuY2FudmFzU2NhbGUsIHRoaXMudmlkZW9TY2FsZWRIZWlnaHQgKiB0aGlzLmNhbnZhc1NjYWxlKTtcclxuICAgICAgICAgICAgICAgICAgICAvL31cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gc2F2ZSBzb21lIENQVSBjeWNsZXMgaWYgd2UgYWxyZWFkeSBkaWQgdGhpc1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGEgPSBmaWx0ZXJlZDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2V0IGNhbWVyYSBzb3VyY2UgYnkgaW5kZXhcclxuICAgICAqIEBwYXJhbSB7aW50fSBpbmRleFxyXG4gICAgICovXHJcbiAgICBzZXRDYW1lcmFTb3VyY2VCeUluZGV4KGluZGV4KSB7XHJcbiAgICAgICAgaWYgKCFpbmRleCB8fCBpbmRleCA+PSB0aGlzLmNhbWVyYVNvdXJjZXMubGVuZ3RoKSB7IGNvbnNvbGUubG9nKFwiVmlkZW8gU291cmNlIEluZGV4IGRvZXMgbm90IGV4aXN0XCIpOyByZXR1cm47IH1cclxuICAgICAgICB0aGlzLnNldENhbWVyYVNvdXJjZUJ5SUQodGhpcy5jYW1lcmFTb3VyY2VzW2luZGV4XS5pZCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2V0IGNhbWVyYSBzb3VyY2UgYnkgaWRcclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBpZFxyXG4gICAgICovXHJcbiAgICBzZXRDYW1lcmFTb3VyY2VCeUlEKGlkKSB7XHJcbiAgICAgICAgbmF2aWdhdG9yLndlYmtpdEdldFVzZXJNZWRpYShcclxuICAgICAgICAgICAgeyB2aWRlbzoge29wdGlvbmFsOiBbe3NvdXJjZUlkOiBpZCB9XX19LFxyXG4gICAgICAgICAgICB0aGlzLm9uQ2FtZXJhU3RyZWFtLmJpbmQodGhpcyksXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uKCkge31cclxuICAgICAgICApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIHJlZnJlc2ggY2FtZXJhIHNvdXJjZXNcclxuICAgICAqL1xyXG4gICAgcmVmcmVzaENhbWVyYVNvdXJjZXMoKSB7XHJcbiAgICAgICAgdGhpcy5jYW1lcmFTb3VyY2VzID0gW107XHJcbiAgICAgICAgTWVkaWFTdHJlYW1UcmFjay5nZXRTb3VyY2VzKCBzb3VyY2VzID0+IHtcclxuICAgICAgICAgICAgdGhpcy5vbkNhbWVyYVNvdXJjZXMoc291cmNlcyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogb24gY2FtZXJhIHZpZGVvIHNvdXJjZSBzdHJlYW1cclxuICAgICAqIEBwYXJhbSBzdHJlYW1cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIG9uQ2FtZXJhU3RyZWFtKHN0cmVhbSkge1xyXG4gICAgICAgIHRoaXMudmlkZW9FbGVtZW50LnNyYyA9IFVSTC5jcmVhdGVPYmplY3RVUkwoc3RyZWFtKTtcclxuICAgICAgICB0aGlzLnZpZGVvRWxlbWVudC5vbmxvYWRlZG1ldGFkYXRhID0gZSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMub25SZXNpemUoKTtcclxuICAgICAgICB9O1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIG9uIGNhbWVyYSBzb3VyY2VzIGNhbGxiYWNrXHJcbiAgICAgKiBAcGFyYW0ge2FycmF5fSBzb3VyY2VzIGZvdW5kXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBvbkNhbWVyYVNvdXJjZXMoc291cmNlcykge1xyXG4gICAgICAgIHZhciBzdG9yYWdlSW5kZXggPSAwO1xyXG4gICAgICAgIGZvciAodmFyIGk9MDsgaSA8IHNvdXJjZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKHNvdXJjZXNbaV0ua2luZCA9PSAndmlkZW8nKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbGFiZWwgPSBzb3VyY2VzW2ldLmxhYmVsO1xyXG4gICAgICAgICAgICAgICAgaWYgKGxhYmVsID09IFwiXCIpIHsgbGFiZWwgPSBcInZpZGVvIFwiICsgTnVtYmVyKHN0b3JhZ2VJbmRleCsxKTsgfVxyXG4gICAgICAgICAgICAgICAgc291cmNlc1tzdG9yYWdlSW5kZXhdID0gc291cmNlc1tpXS5pZDtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2FtZXJhU291cmNlcy5wdXNoKHsgbGFiZWw6IGxhYmVsLCBpZDogc291cmNlc1tpXS5pZCB9KTtcclxuICAgICAgICAgICAgICAgIHN0b3JhZ2VJbmRleCsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgZXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQoJ2NhbWVyYXNmb3VuZCcsIHsgZGV0YWlsOiB7IGNhbWVyYXM6IHRoaXMuY2FtZXJhU291cmNlcyB9IH0pO1xyXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChldmVudCk7XHJcbiAgICAgICAgaWYgKHRoaXMuX3NvdXJjZSkgeyB0aGlzLnNvdXJjZSA9IHRoaXMuX3NvdXJjZTsgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIHNldHVwIGhhbmRsZXIgZm9yIFdlYkdMIFNjZW5lXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcHJvcHMgd2ViZ2wgcHJvcGVydGllc1xyXG4gICAgICogQHJldHVybiByZW5kZXJvYmpcclxuICAgICAqL1xyXG4gICAgLyp3ZWJnbFNldHVwSGFuZGxlcihwcm9wcykge1xyXG4gICAgICAgIHZhciBmaWx0ZXI7XHJcbiAgICAgICAgaWYgKHByb3BzLnZlcnRleFNoYWRlciAmJiBwcm9wcy5mcmFnbWVudFNoYWRlcikge1xyXG4gICAgICAgICAgICBmaWx0ZXIgPSBjY3djLmltYWdlLndlYmdsLmZpbHRlci5jcmVhdGVGaWx0ZXJGcm9tU2hhZGVycyhwcm9wcy52ZXJ0ZXhTaGFkZXIsIHByb3BzLmZyYWdtZW50U2hhZGVyKVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZpbHRlciA9IGNjd2MuaW1hZ2Uud2ViZ2wuZmlsdGVyLmNyZWF0ZUZpbHRlckZyb21OYW1lKHByb3BzLmZpbHRlciwgcHJvcHMuZmlsdGVyTGlicmFyeSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcm9wcy50ZXh0dXJlcy5wdXNoKHtcclxuICAgICAgICAgICAgbmFtZTogJ3ZpZGVvJyxcclxuICAgICAgICAgICAgdGV4dHVyZTogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignY2N3Yy12aWRlbycpLnZpZGVvRWxlbWVudCxcclxuICAgICAgICAgICAgcGl4ZWxTdG9yZTogW3sgcHJvcGVydHk6ICdVTlBBQ0tfRkxJUF9ZX1dFQkdMJywgdmFsdWU6IHRoaXMud2ViZ2xQcm9wZXJ0aWVzLmZsaXBUZXh0dXJlWSB9XSxcclxuICAgICAgICAgICAgaW5kZXg6IDB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGNjd2MuaW1hZ2Uud2ViZ2wuZmlsdGVyLmNyZWF0ZVJlbmRlck9iamVjdCh7XHJcbiAgICAgICAgICAgIGdsOiB0aGlzLmNhbnZhc2N0eCxcclxuICAgICAgICAgICAgZmlsdGVyOiBmaWx0ZXIsXHJcbiAgICAgICAgICAgIHRleHR1cmVzOiBwcm9wcy50ZXh0dXJlc1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTsqL1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmVuZGVyIGhhbmRsZXIgZm9yIFdlYkdMIFNjZW5lXHJcbiAgICAgKiBAcGFyYW0gcmVuZGVyb2JqIFdlYkdMIHJlbmRlciBwcm9wZXJ0aWVzXHJcbiAgICAgKi9cclxuICAgIC8qd2ViZ2xSZW5kZXJIYW5kbGVyKHJlbmRlcm9iaikge1xyXG4gICAgICAgIGNjd2MuaW1hZ2Uud2ViZ2wuZmlsdGVyLnJlbmRlcihyZW5kZXJvYmopO1xyXG4gICAgfTsqL1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogcGFyc2UgYXR0cmlidXRlcyBvbiBlbGVtZW50XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBwYXJzZUF0dHJpYnV0ZXMoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaGFzQXR0cmlidXRlKCd1c2VDYW1lcmEnKSB8fCB0aGlzLmhhc0F0dHJpYnV0ZSgndXNlY2FtZXJhJykpIHtcclxuICAgICAgICAgICAgdGhpcy5fdXNlQ2FtZXJhID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl91c2VDYW1lcmEgPSBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmhhc0F0dHJpYnV0ZSgnc3JjJykpIHtcclxuICAgICAgICAgICAgdGhpcy5fc291cmNlID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ3NyYycpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaGFzQXR0cmlidXRlKCd1c2VDYW52YXNGb3JEaXNwbGF5JykpIHtcclxuICAgICAgICAgICAgdGhpcy51c2VDYW52YXNGb3JEaXNwbGF5ID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnVzZUNhbnZhc0ZvckRpc3BsYXkgPSBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmhhc0F0dHJpYnV0ZSgnZnJhbWVEYXRhTW9kZScpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZnJhbWVEYXRhTW9kZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCdmcmFtZURhdGFNb2RlJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5oYXNBdHRyaWJ1dGUoJ2NhbnZhc1JlZnJlc2hJbnRlcnZhbCcpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2FudmFzUmVmcmVzaEludGVydmFsID0gcGFyc2VJbnQodGhpcy5nZXRBdHRyaWJ1dGUoJ2NhbnZhc1JlZnJlc2hJbnRlcnZhbCcpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmhhc0F0dHJpYnV0ZSgnY2FudmFzU2NhbGUnKSkge1xyXG4gICAgICAgICAgICB0aGlzLmNhbnZhc1NjYWxlID0gcGFyc2VGbG9hdCh0aGlzLmdldEF0dHJpYnV0ZSgnY2FudmFzU2NhbGUnKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKmlmICh0aGlzLmhhc0F0dHJpYnV0ZSgndXNlV2ViR0wnKSkge1xyXG4gICAgICAgICAgICB0aGlzLl91c2VXZWJHTCA9IHRydWU7XHJcbiAgICAgICAgICAgIHZhciBwcm9wcyA9IHRoaXMuZ2V0QXR0cmlidXRlKCd1c2VXZWJHTCcpO1xyXG4gICAgICAgICAgICBpZiAocHJvcHMpIHtcclxuICAgICAgICAgICAgICAgIHByb3BzID0gSlNPTi5wYXJzZShwcm9wcyk7XHJcbiAgICAgICAgICAgICAgICBpZiAocHJvcHMuZmxpcFRleHR1cmVZKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy53ZWJnbFByb3BlcnRpZXMuZmxpcFRleHR1cmVZID0gcHJvcHMuZmxpcFRleHR1cmVZO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHByb3BzLmZpbHRlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMud2ViZ2xQcm9wZXJ0aWVzLmZpbHRlciA9IHByb3BzLmZpbHRlcjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaGFzQXR0cmlidXRlKCdmbGlwQ2FudmFzJykpIHtcclxuICAgICAgICAgICAgdGhpcy5fZmxpcENhbnZhcyA9IHRydWU7XHJcbiAgICAgICAgfSovXHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNhbnZhc1JlZnJlc2hJbnRlcnZhbCA9PT0gMCAmJiB0aGlzLnVzZUNhbnZhc0ZvckRpc3BsYXkpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1dhcm5pbmc6IFVzaW5nIGNhbnZhcyBmb3IgZGlzcGxheSwgYnV0IHRoZSBjYW52YXMgcmVmcmVzaCBpbnRlcnZhbCBpcyBub3Qgc2V0IG9yIHNldCB0byAwLiBTZXR0aW5nIHJlZnJlc2ggaW50ZXJ2YWwgdG8gMjUwbXMuJyk7XHJcbiAgICAgICAgICAgIHRoaXMuY2FudmFzUmVmcmVzaEludGVydmFsID0gMjUwO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBlbGVtZW50IGNyZWF0ZWQgY2FsbGJhY2tcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIGNyZWF0ZWRDYWxsYmFjaygpIHtcclxuICAgICAgICAvKnRoaXMud2ViZ2xQcm9wZXJ0aWVzID0ge1xyXG4gICAgICAgICAgICBmbGlwVGV4dHVyZVk6IGZhbHNlLFxyXG4gICAgICAgICAgICBmaWx0ZXJMaWJyYXJ5OiBjY3djLmltYWdlLndlYmdsLnNoYWRlcnMsXHJcbiAgICAgICAgICAgIHNldHVwSGFuZGxlcjogdGhpcy53ZWJnbFNldHVwSGFuZGxlcixcclxuICAgICAgICAgICAgcmVuZGVySGFuZGxlcjogdGhpcy53ZWJnbFJlbmRlckhhbmRsZXIsXHJcbiAgICAgICAgICAgIGZpbHRlcjogJ3Bhc3N0aHJvdWdoJyxcclxuICAgICAgICAgICAgdGV4dHVyZXM6IFtdXHJcbiAgICAgICAgfTsqL1xyXG5cclxuICAgICAgICB0aGlzLnNldFByb3BlcnRpZXMoKTtcclxuICAgICAgICB0aGlzLnBhcnNlQXR0cmlidXRlcygpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIGVsZW1lbnQgYXR0YWNoZWQgY2FsbGJhY2tcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIGF0dGFjaGVkQ2FsbGJhY2soKSB7XHJcbiAgICAgICAgbGV0IHRlbXBsYXRlID0gdGhpcy5vd25lci5xdWVyeVNlbGVjdG9yKFwidGVtcGxhdGVcIik7XHJcbiAgICAgICAgbGV0IGNsb25lID0gdGVtcGxhdGUuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICAgICAgdGhpcy5yb290ID0gdGhpcy5jcmVhdGVTaGFkb3dSb290KCk7XHJcbiAgICAgICAgdGhpcy5yb290LmFwcGVuZENoaWxkKGNsb25lKTtcclxuXHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ0hUTUxJbXBvcnRzTG9hZGVkJywgZSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMub25SZXNpemUoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy52aWRlb0VsZW1lbnQgPSB0aGlzLnJvb3QucXVlcnlTZWxlY3RvcignI3ZpZCcpO1xyXG4gICAgICAgIHRoaXMudmlkZW9FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3BsYXknLCBlID0+IHRoaXMub25QbGF5aW5nKGUpKTtcclxuICAgICAgICB0aGlzLmNhbnZhc0VsZW1lbnQgPSB0aGlzLnJvb3QucXVlcnlTZWxlY3RvcignI2NhbnZhcycpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5fZmxpcENhbnZhcykge1xyXG4gICAgICAgICAgICB0aGlzLmNhbnZhc0VsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gJ3NjYWxlKDEsIC0xKSc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudmlkZW9FbGVtZW50Lm9ubG9hZGVkbWV0YWRhdGEgPSBlID0+IHtcclxuICAgICAgICAgICAgdGhpcy5vblJlc2l6ZSgpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuc291cmNlID0gdGhpcy5fc291cmNlO1xyXG4gICAgICAgIGlmICh0aGlzLnVzZUNhbnZhc0ZvckRpc3BsYXkpIHtcclxuICAgICAgICAgICAgdGhpcy52aWRlb0VsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmNhbnZhc0VsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNhbnZhc1JlZnJlc2hJbnRlcnZhbCA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy50aWNrID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMud2lkdGggPT09IDAgfHwgdGhpcy5oZWlnaHQgPT09IDApIHsgcmV0dXJuOyB9XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuaXNQbGF5aW5nKSB7IHJldHVybjsgfVxyXG4gICAgICAgICAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KCdmcmFtZXVwZGF0ZScsIHsgZGV0YWlsOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZnJhbWVkYXRhOiB0aGlzLmdldEN1cnJlbnRGcmFtZURhdGEoKSxcclxuICAgICAgICAgICAgICAgICAgICBjYW52YXNjb250ZXh0OiB0aGlzLmNhbnZhc2N0eCxcclxuICAgICAgICAgICAgICAgICAgICB2aWRlb1dpZHRoOiB0aGlzLnZpZGVvU2NhbGVkV2lkdGggKiB0aGlzLmNhbnZhc1NjYWxlLFxyXG4gICAgICAgICAgICAgICAgICAgIHZpZGVvSGVpZ2h0OiB0aGlzLnZpZGVvU2NhbGVkSGVpZ2h0ICogdGhpcy5jYW52YXNTY2FsZSxcclxuICAgICAgICAgICAgICAgICAgICB2aWRlb0xlZnQ6IHRoaXMubGV0dGVyQm94TGVmdCAqIHRoaXMuY2FudmFzU2NhbGUsXHJcbiAgICAgICAgICAgICAgICAgICAgdmlkZW9Ub3A6IHRoaXMubGV0dGVyQm94VG9wICogdGhpcy5jYW52YXNTY2FsZSxcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogdGhpcy53aWR0aCAqIHRoaXMuY2FudmFzU2NhbGUsXHJcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLmhlaWdodCAqIHRoaXMuY2FudmFzU2NhbGUgfX0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChldmVudCk7XHJcbiAgICAgICAgICAgIH0sIHRoaXMuY2FudmFzUmVmcmVzaEludGVydmFsKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuaXNSZWFkeSA9IHRydWU7XHJcbiAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KCdyZWFkeScpO1xyXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChldmVudCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogZWxlbWVudCBkZXRhY2hlZCBjYWxsYmFja1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgZGV0YWNoZWRDYWxsYmFjaygpIHt9O1xyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIGF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFja1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBhdHRyIGF0dHJpYnV0ZSBjaGFuZ2VkXHJcbiAgICAgKiBAcGFyYW0geyp9IG9sZFZhbCBvbGQgdmFsdWVcclxuICAgICAqIEBwYXJhbSB7Kn0gbmV3VmFsIG5ldyB2YWx1ZVxyXG4gICAgICovXHJcbiAgICBhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2soYXR0ciwgb2xkVmFsLCBuZXdWYWwpIHt9O1xyXG59Il19
