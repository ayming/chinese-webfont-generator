'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SC = exports.TC = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _fontmin = require('fontmin');

var _fontmin2 = _interopRequireDefault(_fontmin);

var _chineseConv2 = require('chinese-conv');

var _chineseConv3 = _interopRequireDefault(_chineseConv2);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// eslint-disable-next-line max-len
var chineseRegex = /[\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d]/g;

var TC = exports.TC = 0; // Traditional Chinese
var SC = exports.SC = 1; // Simplified Chinese

var ChineseWebFont = function () {
  function ChineseWebFont() {
    _classCallCheck(this, ChineseWebFont);

    // Convert Traditional/Simplified Chinese
    this._type = null;
    // Set the files to be extracted
    this._file = {
      src: '', // source folder to be test
      extension: [] // file extensions to be test

      // Set the font to be converted
    };this._font = {
      src: '', // source file, support: ttf, svg, otf
      fontFamily: '', // font family name
      dist: 'build' // build destination folder

      // Append additional string
    };this._text = '';
  }

  _createClass(ChineseWebFont, [{
    key: '_getChineseText',
    value: function _getChineseText(_ref, callback) {
      var src = _ref.src,
          extension = _ref.extension;

      var chineseText = '';
      (0, _glob2.default)(src + '/**/*.@(' + extension.join('|') + ')', function (_, files) {
        var count = 0;
        files.forEach(function (file) {
          _fs2.default.readFile(file, 'utf8', function (err, data) {
            count++;
            if (err) console.log(err);
            chineseText += (data.match(chineseRegex) || []).join('');
            if (files.length === count) callback(chineseText);
          });
        });
      });
    }
  }, {
    key: '_chineseConv',
    value: function _chineseConv(type, text) {
      switch (type) {
        case TC:
          return _chineseConv3.default.tify(text);
        case SC:
          return _chineseConv3.default.sify(text);
        default:
          return text;
      }
    }
  }, {
    key: '_outputWebFont',
    value: function _outputWebFont(_ref2, text) {
      var _this = this;

      var src = _ref2.src,
          fontFamily = _ref2.fontFamily,
          dist = _ref2.dist;

      var fontmin = new _fontmin2.default().src(src) // src file, support: ttf, svg, otf
      .use(_fontmin2.default.glyph({
        text: text, // used text
        hinting: false
      })).use(_fontmin2.default.ttf2eot()).use(_fontmin2.default.ttf2woff()).use(_fontmin2.default.ttf2svg()).use(_fontmin2.default.css({
        // font family name
        fontFamily: fontFamily
      })).dest(dist); // build destination folder

      fontmin.run(function (err, files) {
        if (err) throw err;
        _this._generateExample({
          fontFamily: fontFamily,
          text: text,
          dist: dist,
          css: src.replace(/^.*\/([^/.|/]+)\..*$/, '$1.css')
        });
      });
    }
  }, {
    key: '_generateExample',
    value: function _generateExample(_ref3) {
      var css = _ref3.css,
          fontFamily = _ref3.fontFamily,
          text = _ref3.text,
          dist = _ref3.dist;

      var exampleHTML = '\n<!DOCTYPE html>\n<html>\n  <head>\n    <title>Fontmin Demo</title>\n    <meta charset="utf-8" />\n    <link rel="stylesheet" type="text/css" href="' + css + '"></link>\n    <style type="text/css">\n    html {\n      font-family: "' + fontFamily + '",arial,sans-serif;\n    }\n    </style>\n  </head>\n  <body>\n    <p>' + text + '</p>\n  </body>\n</html>\n    ';
      _fs2.default.writeFile(dist + '/example.html', exampleHTML.trim(), function (err) {
        if (err) throw err;
      });
    }
  }, {
    key: '_isValid',
    value: function _isValid() {
      if (!this._file.src) throw new Error('Project folder is not set!');
      if (!this._file.extension.length) throw new Error('Project file extension is not set!');
      if (!this._font.src) throw new Error('Font file is not set!');
      if (!this._font.fontFamily) throw new Error('Font family is not set!');
      return true;
    }

    /**
     * Set the files to be extracted
     * @param {object} settings - file settings
     * @param {string} settings.src - source folder to be test
     * @param {string} settings.extension - file extensions to be test
     */

  }, {
    key: 'from',
    value: function from(settings) {
      // TODO: follow gulp gulp globbing?
      this._file = settings;
      return this;
    }

    /**
     * Set the font to be converted
     * @param {object} settings - font settings
     * @param {string} settings.src - source file, support: ttf, svg, otf
     * @param {string} settings.fontFamily - font family name
     * @param {string} settings.dist - build destination folder
     */

  }, {
    key: 'font',
    value: function font(settings) {
      this._font = _extends({}, this._font, settings);
      return this;
    }

    /**
     * Convert text to Traditional or Simplified Chinese
     * since many fonts can support either one
     * @param {TYPE=} type - TC / SC
     */

  }, {
    key: 'type',
    value: function type(_type) {
      switch (_type) {
        case SC:
          this._type = _type;
          break;
        case TC:
          this._type = TC;
          break;
        default:
          this._type = null;
          break;
      }
      return this;
    }

    /**
     * Add any text you want such as punctuation
     * @param {string} string - additional text to be appended
     */

  }, {
    key: 'text',
    value: function text(string) {
      this._text += string;
      return this;
    }

    /**
     * Execute script
     */

  }, {
    key: 'run',
    value: function run() {
      var _this2 = this;

      if (!this._isValid()) return;

      this._getChineseText(this._file, function (chineseText) {
        _this2._outputWebFont(_this2._font, _this2._chineseConv(_this2._type, chineseText + _this2._text));
      });
    }
  }]);

  return ChineseWebFont;
}();

ChineseWebFont.TC = TC;
ChineseWebFont.SC = SC;
exports.default = ChineseWebFont;
