// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: green; icon-glyph: battery-half;
//
// iOS 桌面组件脚本 @「小件件」
// 开发说明：请从 Widget 类开始编写，注释请勿修改
// https://x.im3x.cn
//

// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能
if (typeof require === 'undefined') require = importModule
const { Base } = require('./「小件件」开发环境')

// @组件代码开始
class Widget extends Base {
  /**
   * 传递给组件的参数，可以是桌面 Parameter 数据，也可以是外部如 URLScheme 等传递的数据
   * @param {string} arg 自定义参数
   */
  constructor(arg) {
    super(arg)
    this.name = '人生电量'

    this.registerAction('设置', this.actionSettings)
    // this.registerAction("透明背景", this.actionSettings3)
    // this.BG_FILE = this.getBackgroundImage()
    // if (this.BG_FILE) this.registerAction("移除背景", this.actionSettings4)
  }

  /**
   * 渲染函数，函数名固定
   * 可以根据 this.widgetFamily 来判断小组件尺寸，以返回不同大小的内容
   */
  async render() {
    if (!this.settings || !this.settings['name'] || !this.settings['api']) {
      return await this.renderConfigure()
    }
    switch (this.widgetFamily) {
      case 'large':
        return await this.renderLarge()
      case 'medium':
        return await this.renderMedium()
      default:
        return await this.renderSmall()
    }
  }

  /**
   * 手工绘制电量图标
   * @param {int} num 0-100 电量
   */
  async renderBattery(stack, num = 100, size = 'small') {
    const SIZES = {
      small: {
        width: 40,
        height: 20,
        borderWidth: 3,
        cornerRadius: 3,
        rightWidth: 2,
        rightHeight: 8,
        spacer: 3,
      },
      medium: {
        width: 80,
        height: 40,
        borderWidth: 5,
        cornerRadius: 10,
        rightWidth: 5,
        rightHeight: 15,
        spacer: 5,
      },
      large: {},
    }

    const SIZE = SIZES[size]

    // 电池颜色
    let color = new Color('#CCCCCC', 1)
    if (num >= 80) {
      color = Color.green()
    } else if (num <= 40) {
      color = Color.red()
    } else if (num <= 60) {
      color = Color.yellow()
    }

    const box = stack.addStack()
    box.centerAlignContent()
    const boxLeft = box.addStack()
    boxLeft.size = new Size(SIZE['width'], SIZE['height'])
    boxLeft.borderColor = new Color('#CCCCCC', 0.8)
    boxLeft.borderWidth = SIZE['borderWidth']
    boxLeft.cornerRadius = SIZE['cornerRadius']

    // 中间电量
    // 根据电量，计算电量矩形的长（总长80-边距10）
    // 算法：70/100 * 电量
    const BATTERY_WIDTH = parseInt(((SIZE['width'] - SIZE['spacer'] * 2) / 100) * num)
    boxLeft.addSpacer(SIZE['spacer'])
    boxLeft.setPadding(SIZE['spacer'], 0, SIZE['spacer'], 0)
    const boxCenter = boxLeft.addStack()
    boxCenter.backgroundColor = color
    boxCenter.size = new Size(BATTERY_WIDTH, SIZE['height'] - SIZE['spacer'] * 2)
    boxCenter.cornerRadius = SIZE['cornerRadius'] / 2

    boxLeft.addSpacer(SIZE['width'] - SIZE['spacer'] * 2 - BATTERY_WIDTH + SIZE['spacer'])

    box.addSpacer(2)

    const boxRight = box.addStack()
    boxRight.backgroundColor = new Color('#CCCCCC', 0.8)
    boxRight.cornerRadius = 5
    boxRight.size = new Size(SIZE['rightWidth'], SIZE['rightHeight'])

    return box
  }

  // 提示配置
  async renderConfigure() {
    const w = new ListWidget()
    w.addText('请点击组件进行设置')
    w.url = this.actionUrl('settings')
    return w
  }

  // 获取电量值
  async getInfo() {
    let data = {level: 0, status: ''}
    try {
      const req = new Request(`${this.settings['api']}/battery/query`)
      req.headers = {
        'Content-Type': 'application/json; charset=utf-8',
      }
      req.timeoutInterval = 10
      req.method = 'POST'
      req.body = JSON.stringify({ data: {}, timestamp: new Date().getTime() })

      const res = await req.loadJSON()
      console.log(res)
      data.level = res.data.level.replace('%', '')
      data.status = res.data.status.replace('放电中', '').replace('充电中', '~')
    } catch (e) {
      console.error(e)
    }

    return data
  }

  /**
   * 渲染小尺寸组件
   */
  async renderSmall() {
    let w = new ListWidget()
    w.addSpacer()
    // 名称
    // await this.renderHeader(w, null, this.name)
    const title = w.addText(this.settings['name'])
    title.centerAlignText()
    title.font = Font.systemFont(18)
    w.addSpacer()
    const { status, level } = await this.getInfo()

    const battery = w.addStack()
    battery.addSpacer()
    await this.renderBattery(battery, level)
    battery.addSpacer()
    w.addSpacer()

    const num = w.addText(`${status || ''}${level} %`)
    num.centerAlignText()
    num.font = Font.systemFont(24)
    w.addSpacer()

    const nowText = w.addText(
      ['刷新于', [new Date().getHours(), new Date().getMinutes()].map(i => String(i).padStart(2, '0')).join(':')]
        .filter(i => i !== null)
        .join(' ')
    )
    nowText.font = Font.boldSystemFont(10)
    // nowText.textColor = Color.dynamic(Color.black(), Color.white())
    nowText.centerAlignText()
    nowText.textOpacity = 0.25

    w.addSpacer()

    // // 生日
    // w.addSpacer()
    // const _date = new DateFormatter()
    // _date.dateFormat = "yyyy/MM/dd"
    // const date = w.addText(this.settings['name'] + ' @ ' + _date.string(new Date(this.settings['date'])))
    // date.font = Font.lightSystemFont(10)
    // date.textOpacity = 0.8
    // date.centerAlignText()

    // if (this.BG_FILE) {
    //   w.backgroundImage = this.BG_FILE
    //   num.textColor = date.textColor = Color.white()
    // }

    w.url = this.actionUrl('settings')

    return w
  }
  /**
   * 渲染中尺寸组件
   */
  async renderMedium() {
    return await this.renderSmall()
  }
  /**
   * 渲染大尺寸组件
   */
  async renderLarge() {
    return await this.renderMedium()
  }

  /**
   * 获取数据函数，函数名可不固定
   */
  async getData() {
    return false
  }

  /**
   * 自定义注册点击事件，用 actionUrl 生成一个触发链接，点击后会执行下方对应的 action
   * @param {string} url 打开的链接
   */
  async actionOpenUrl(url) {
    Safari.openInApp(url, false)
  }

  async actionSettings() {
    const a = new Alert()
    a.title = '设置'
    a.message = '配置'

    const menus = ['输入名称', '设置接口']
    ;[
      {
        name: 'name',
        text: '输入名称',
      },
      {
        name: 'api',
        text: '设置接口',
      },
    ].map(item => {
      a.addAction((this.settings[item.name] ? '✅ ' : '❌ ') + item.text)
    })

    a.addCancelAction('关闭设置')
    const id = await a.presentSheet()
    if (id === -1) return
    await this['actionSettings' + id]()
  }

  // 设置名称
  async actionSettings0() {
    const a = new Alert()
    a.title = '输入名称'
    a.message = '请输入名称'
    a.addTextField('名称', this.settings['name'])
    a.addAction('确定')
    a.addCancelAction('取消')

    const id = await a.presentAlert()
    if (id === -1) return await this.actionSettings()
    const n = a.textFieldValue(0)
    if (!n) return await this.actionSettings0()

    this.settings['name'] = n
    this.saveSettings()

    return await this.actionSettings()
  }

  // 设置接口
  async actionSettings1() {
    const a = new Alert()
    a.title = '设置接口'
    a.message = '请设置接口'
    a.addTextField('接口', this.settings['api'])
    a.addAction('确定')
    a.addCancelAction('取消')

    const id = await a.presentAlert()
    if (id === -1) return await this.actionSettings()
    const n = a.textFieldValue(0)
    if (!n) return await this.actionSettings1()

    this.settings['api'] = n
    this.saveSettings()

    return await this.actionSettings()
    // const dp = new DatePicker()
    // if (this.settings['date']) {
    //   dp.initialDate = new Date(this.settings['date'])
    // }
    // let date
    // try {
    //   date = await dp.pickDate()
    // } catch (e) {
    //   return await this.actionSettings()
    // }
    // this.settings['date'] = date
    // this.saveSettings()

    // return await this.actionSettings()
  }

  // // 选择性别
  // async actionSettings2 () {
  //   const a = new Alert()
  //   a.title = "选择性别"
  //   a.message = "性别可用于预计寿命"
  //   const genders = ['男', '女']
  //   genders.map(n => {
  //     a.addAction((this.settings['gender'] === n ? '✅ ' : '') + n)
  //   })
  //   a.addCancelAction('取消选择')
  //   const i = await a.presentSheet()
  //   if (i !== -1) {
  //     this.settings['gender'] = genders[i]
  //     this.saveSettings()
  //   }
  //   return await this.actionSettings()
  // }

  // // 透明背景
  // async actionSettings3 () {

  //   const img = await this.getWidgetScreenShot()
  //   if (!img) return
  //   this.setBackgroundImage(img)
  // }

  // 移除背景
  async actionSettings4() {
    this.setBackgroundImage(null)
  }
}
// @组件代码结束

const { Testing } = require('./「小件件」开发环境')
await Testing(Widget)
