import fs from 'fs';
import Fontmin from 'fontmin';
import chineseConv from 'chinese-conv';
import glob from 'glob';

const chineseRegex = /[\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d]/g;

export const TC = 0; // Traditional Chinese
export const SC = 1; // Simplified Chinese

export default class ChineseWebFont {
  constructor() {
    // Traditional/Simplified Chinese
    this._type = TC;
    // Set the files to be extracted
    this._file = {
      src: '',      // source folder to be test
      extension: [] // file extensions to be test
    };
    // Set the font to be converted
    this._font = {
      src: '',        // source file, support: ttf, svg, otf
      fontFamily: '', // font family name
      dest: 'build'   // build destination folder
    };
    // Append additional string
    this._text = '';
  }

  _getChineseText({src, extension}, callback) {
    let chineseText = '';
    glob(`${src}/**/*.@(${extension.join('|')})`, (_, files) => {
      let count = 0;
      files.forEach((file) => {
        fs.readFile(file, 'utf8', (err, data) => {
          count++;
          if (err) console.log(err);
          chineseText += data.match(chineseRegex).join('');
          if (files.length === count) callback(chineseText);
        });
      });
    });
  }

  _outputWebFont({src, fontFamily, dest}, text) {
    const fontmin = new Fontmin()
      .src(src) // src file, support: ttf, svg, otf
      .use(Fontmin.glyph({
        text, // used text
        hinting: false
      }))
      .use(Fontmin.ttf2eot())
      .use(Fontmin.ttf2woff())
      .use(Fontmin.ttf2svg())
      .use(Fontmin.css({
        fontFamily // font family name
      }))
      .dest(dest); // build destination folder

    fontmin.run((err, files) => {
      if (err) throw err;
    });

    const exampleHTML = `<!DOCTYPE html><html><head><title>Fontmin Demo</title><meta charset="utf-8" /><link rel="stylesheet" type="text/css" href="${src.replace(/\.[^/.]+$/, '')}.css"></link><style type="text/css">html { font-family: "${fontFamily}",arial,sans-serif; }</style></head><body><p>${text}</p></body></html>`;
    fs.writeFile(`${dest}/example.html`, exampleHTML, (err) => {
      if (err) throw err;
    });
  }

  _isValid() {
    if (!this._file.src) throw 'Project folder is not set!';
    if (!this._file.extension.length) throw 'Project file extension is not set!';
    if (!this._font.src) throw 'Font file is not set!';
    if (!this._font.fontFamily) throw 'Font family is not set!';
    return true;
  }

  from(settings) {
    // TODO: follow gulp gulp globbing?
    this._file = settings;
    return this;
  }

  font(settings) {
    this._font = {
      ...this._font,
      ...settings
    };
    return this;
  }

  type(type) {
    switch (type) {
      case SC:
        this._type = type;
        break;
      case TC:
      default:
        this._type = TC;
        break;
    }
    return this;
  }

  text(string) {
    this._text += string;
    return this;
  }

  run() {
    if (!this._isValid()) return;

    this._getChineseText(
      this._file,
      (chineseText) => {
        this._outputWebFont(
          this._font,
          chineseConv.sify(chineseText + this._text)
        );
      }
    );
  }
}
