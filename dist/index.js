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

var _chineseConv = require('chinese-conv');

var _chineseConv2 = _interopRequireDefault(_chineseConv);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var chineseRegex = /[\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d]/g;

var TC = exports.TC = 0; // Traditional Chinese
var SC = exports.SC = 1; // Simplified Chinese

var ChineseWebFont = function () {
  function ChineseWebFont() {
    _classCallCheck(this, ChineseWebFont);

    // Traditional/Simplified Chinese
    this._type = TC;
    // Set the files to be extracted
    this._file = {
      src: '', // source folder to be test
      extension: [] // file extensions to be test
    };
    // Set the font to be converted
    this._font = {
      src: '', // source file, support: ttf, svg, otf
      fontFamily: '', // font family name
      dest: 'build' // build destination folder
    };
    // Append additional string
    this._text = '';
  }

  _createClass(ChineseWebFont, [{
    key: '_getChineseText',
    value: function _getChineseText(_ref, callback) {
      var src = _ref.src;
      var extension = _ref.extension;

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
    key: '_outputWebFont',
    value: function _outputWebFont(_ref2, text) {
      var _this = this;

      var src = _ref2.src;
      var fontFamily = _ref2.fontFamily;
      var dest = _ref2.dest;

      var fontmin = new _fontmin2.default().src(src) // src file, support: ttf, svg, otf
      .use(_fontmin2.default.glyph({
        text: text, // used text
        hinting: false
      })).use(_fontmin2.default.ttf2eot()).use(_fontmin2.default.ttf2woff()).use(_fontmin2.default.ttf2svg()).use(_fontmin2.default.css({
        fontFamily: fontFamily // font family name
      })).dest(dest); // build destination folder

      fontmin.run(function (err, files) {
        if (err) throw err;
        _this._generateExample(src.replace(/\.[^/.]+$/, ''), fontFamily, text, dest);
      });
    }
  }, {
    key: '_generateExample',
    value: function _generateExample(css, fontFamily, text, dest) {
      var exampleHTML = '<!DOCTYPE html><html><head><title>Fontmin Demo</title><meta charset="utf-8" /><link rel="stylesheet" type="text/css" href="' + css + '.css"></link><style type="text/css">html { font-family: "' + fontFamily + '",arial,sans-serif; }</style></head><body><p>' + text + '</p></body></html>';
      _fs2.default.writeFile(dest + '/example.html', exampleHTML, function (err) {
        if (err) throw err;
      });
    }
  }, {
    key: '_isValid',
    value: function _isValid() {
      if (!this._file.src) throw 'Project folder is not set!';
      if (!this._file.extension.length) throw 'Project file extension is not set!';
      if (!this._font.src) throw 'Font file is not set!';
      if (!this._font.fontFamily) throw 'Font family is not set!';
      return true;
    }
  }, {
    key: 'from',
    value: function from(settings) {
      // TODO: follow gulp gulp globbing?
      this._file = settings;
      return this;
    }
  }, {
    key: 'font',
    value: function font(settings) {
      this._font = _extends({}, this._font, settings);
      return this;
    }
  }, {
    key: 'type',
    value: function type(_type) {
      switch (_type) {
        case SC:
          this._type = _type;
          break;
        case TC:
        default:
          this._type = TC;
          break;
      }
      return this;
    }
  }, {
    key: 'text',
    value: function text(string) {
      this._text += string;
      return this;
    }
  }, {
    key: 'run',
    value: function run() {
      var _this2 = this;

      if (!this._isValid()) return;

      this._getChineseText(this._file, function (chineseText) {
        _this2._outputWebFont(_this2._font, _chineseConv2.default.sify(chineseText + _this2._text));
      });
    }
  }]);

  return ChineseWebFont;
}();

exports.default = ChineseWebFont;