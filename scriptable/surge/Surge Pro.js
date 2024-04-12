// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: mars-double;
const isDark = Device.isUsingDarkAppearance()

let bg
try {
  const fm = FileManager.iCloud()
  const dir = fm.documentsDirectory()
  const path = fm.joinPath(dir, isDark ? '/surge/surge-dark.png' : '/surge/surge-light.png')
  console.log(path)
  bg = fm.readImage(path)
} catch (e) {
  console.error(e)
  const i = new Request(
    isDark
      ? 'https://raw.githubusercontent.com/xream/scripts/main/scriptable/surge/surge-dark.png'
      : 'https://raw.githubusercontent.com/xream/scripts/main/scriptable/surge/surge-light.png'
  )
  bg = await i.loadImage()
}

const widget = createWidget(bg)
if (config.runsInWidget) {
  Script.setWidget(widget)
  Script.complete()
} else {
  widget.presentLarge()
}

function createWidget(bg) {
  const w = new ListWidget()
  w.backgroundImage = bg
  return w
}
