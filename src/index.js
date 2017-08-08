import fs from 'fs'
import Fontmin from 'fontmin'
import chineseConv from 'chinese-conv'
import glob from 'glob'

// eslint-disable-next-line max-len
const chineseRegex = /[\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d]/g

export const TC = 0 // Traditional Chinese
export const SC = 1 // Simplified Chinese

class ChineseWebFont {
  static TC = TC
  static SC = SC

  constructor() {
    // Convert Traditional/Simplified Chinese
    this._type = null
    // Set the files to be extracted
    this._file = {
      src: '',      // source folder to be test
      extension: [] // file extensions to be test
    }
    // Set the font to be converted
    this._font = {
      src: '',        // source file, support: ttf, svg, otf
      fontFamily: '', // font family name
      dist: 'build'   // build destination folder
    }
    // Append additional string
    this._text = ''
  }

  _getChineseText({ src, extension }, callback) {
    let chineseText = ''
    glob(`${src}/**/*.@(${extension.join('|')})`, (_, files) => {
      let count = 0
      files.forEach((file) => {
        fs.readFile(file, 'utf8', (err, data) => {
          count++
          if (err) console.log(err)
          chineseText += (data.match(chineseRegex) || []).join('')
          if (files.length === count) callback(chineseText)
        })
      })
    })
  }

  _chineseConv(type, text) {
    switch (type) {
      case TC: return chineseConv.tify(text)
      case SC: return chineseConv.sify(text)
      default: return text
    }
  }

  _outputWebFont({ src, fontFamily, dist }, text) {
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
        // font family name
        fontFamily
      }))
      .dest(dist) // build destination folder

    fontmin.run((err, files) => {
      if (err) throw err
      this._generateExample({
        fontFamily,
        text,
        dist,
        css: src.replace(/^.*\/([^/.|/]+)\..*$/, '$1.css')
      })
    })
  }

  _generateExample({ css, fontFamily, text, dist }) {
    const exampleHTML = `
<!DOCTYPE html>
<html>
  <head>
    <title>Fontmin Demo</title>
    <meta charset="utf-8" />
    <link rel="stylesheet" type="text/css" href="${css}"></link>
    <style type="text/css">
    html {
      font-family: "${fontFamily}",arial,sans-serif;
    }
    </style>
  </head>
  <body>
    <p>${text}</p>
  </body>
</html>
    `
    fs.writeFile(`${dist}/example.html`, exampleHTML.trim(), (err) => {
      if (err) throw err
    })
  }

  _isValid() {
    if (!this._file.src) throw new Error('Project folder is not set!')
    if (!this._file.extension.length) throw new Error('Project file extension is not set!')
    if (!this._font.src) throw new Error('Font file is not set!')
    if (!this._font.fontFamily) throw new Error('Font family is not set!')
    return true
  }

  /**
   * Set the files to be extracted
   * @param {object} settings - file settings
   * @param {string} settings.src - source folder to be test
   * @param {string} settings.extension - file extensions to be test
   */
  from(settings) {
    // TODO: follow gulp gulp globbing?
    this._file = settings
    return this
  }

  /**
   * Set the font to be converted
   * @param {object} settings - font settings
   * @param {string} settings.src - source file, support: ttf, svg, otf
   * @param {string} settings.fontFamily - font family name
   * @param {string} settings.dist - build destination folder
   */
  font(settings) {
    this._font = {
      ...this._font,
      ...settings
    }
    return this
  }

  /**
   * Convert text to Traditional or Simplified Chinese
   * since many fonts can support either one
   * @param {TYPE=} type - TC / SC
   */
  type(type) {
    switch (type) {
      case SC:
        this._type = type
        break
      case TC:
        this._type = TC
        break
      default:
        this._type = null
        break
    }
    return this
  }

  /**
   * Add any text you want such as punctuation
   * @param {string} string - additional text to be appended
   */
  text(string) {
    this._text += string
    return this
  }

  /**
   * Execute script
   */
  run() {
    if (!this._isValid()) return

    this._getChineseText(this._file, (chineseText) => {
      this._outputWebFont(
        this._font,
        this._chineseConv(this._type, chineseText + this._text)
      )
    })
  }
}

export default ChineseWebFont
