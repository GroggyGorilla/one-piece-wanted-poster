import Text from './Text'
import { Position } from './types'

class FooterText extends Text {
  // This is scale constant for specific font. It should be revised whenever font changes.
  #fontSizeScale = 1

  setPosition(position: Position) {
    this.x = position.x
    this.y = position.y
    this.width = position.width
    this.height = position.height
    this.fontSize = this.height * this.#fontSizeScale
  }

  beforeRenderText() {
    // The actual height of text may exceed the boundary of name area when text includes
    // characters which is not english alphabet, so here we need to calculate the actual height
    // and scale it before rendering
    this.ctx.font = `600 ${this.fontSize}px 'Vertiky'`
    this.ctx.textAlign = 'left'
    const actualHeight = this.getTextActualHeight(this.formattedText)
    // const scale = this.height / actualHeight
    const offsetY = (actualHeight - this.height) / 2
    // this.ctx.font = `700 ${Math.floor(
    //   this.fontSize * scale
    // )}px 'Scheherazade New', serif`

    const x = this.x + this.width / 2
    const y = this.y + offsetY

    return { x, y, maxWidth: this.width }
  }
}

export default FooterText
