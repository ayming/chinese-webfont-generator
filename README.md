# Chinese Webfont Generator

Webfont converter for Chinese characters in project

## NOTE

- Only support ttf
- Still working on it! Download at your own risk...

## Install

```sh
$ npm install --save chinese-webfont-generator
```

## Usage

```js
import ChineseWebFont, { SC } from 'chinese-webfont-generator'

new ChineseWebFont()
  .type(SC)
  .from({
    src: 'src/locales',
    extension: ['json']
  })
  .font({
    src: 'fonts/big.ttf',
    fontFamily: 'small',
    dist: 'src/fonts/small'
  })
  .text('，。、')
  .run()
```

## API

### new ChineseWebFont()

Creates a new `ChineseWebFont` instance.

### .type(flag)

flag: `TC|SC`

Convert text to Traditional or Simplified Chinese since many fonts can support either one.

### .from(file)

file.src: source folder to be test
file.extension: file extensions to be test

Set the source files of text. Please note that only Chinese characters will be extracted.

### .font(settings)

settings.src: source file, support: ttf, svg, otf
settings.fontFamily: font family name
settings.dist: build destination folder

Set the font to be converted.

### .text(string)

string: additional text to be appended

Since only Chinese characters will be extracted, you may also want punctuation or any text which is not included in source files.

### .run()

Convert the necessary text into webfont.

## TODO

- Support multiple files (like gulp globbing?)
- Add flag for appending numbers and English letters

## From 0.0.7 to 0.1.0

- renamed `dest` to `dist` in `from` settings
