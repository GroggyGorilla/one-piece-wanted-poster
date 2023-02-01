import GraphicObject from './GraphicObject'
import backgroundImageUrl from './images/paper.png'
import { Position, WantedImageInfo } from './types'
import { getScale, loadImage } from './utils'

type EventName = 'imageloaded'

type RenderOffset = {
  left: number
  right: number
  top: number
  bottom: number
}

const DEFAULT_POSITION = { x: 0, y: 0, width: 0, height: 0 }

class Avatar extends GraphicObject {
  #wantedImageInfo?: WantedImageInfo

  filter = 'grayscale(35%) sepia(40%) saturate(80%) contrast(105%)'
  #listeners = new Map<EventName, Array<() => void>>()
  #image: HTMLImageElement | null = null
  #fillPattern: CanvasPattern | null = null
  #transparentPosition: Position = { ...DEFAULT_POSITION }
  #renderPosition: Position = { ...DEFAULT_POSITION }
  #renderOffset: RenderOffset = { left: 0, right: 0, top: 0, bottom: 0 }

  async init(wantedImageInfo: WantedImageInfo) {
    this.#wantedImageInfo = wantedImageInfo

    try {
      const bgImage = await loadImage(backgroundImageUrl)
      this.#fillPattern = this.ctx.createPattern(bgImage, 'repeat')
    } catch (error) {
      console.error(error)
      throw new Error('Failed to create fill pattern.')
    }

    this.#resetPosition()
  }

  async loadImage(url: string | null) {
    if (!url) {
      return
    }

    try {
      this.#image = await loadImage(url)
      this.#resetPosition()
      this.#listeners.get('imageloaded')?.forEach((fn) => fn())
    } catch (error) {
      console.error(error)
      throw new Error('Failed to load avatar image.')
    }
  }

  #resetPosition() {
    if (!this.#wantedImageInfo) {
      return
    }

    const { avatarPosition, boundaryOffset } = this.#wantedImageInfo
    this.x = avatarPosition.x
    this.y = avatarPosition.y
    this.width = avatarPosition.width
    this.height = avatarPosition.height

    this.#renderOffset = { ...boundaryOffset }

    this.#transparentPosition = {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    }

    this.updateRenderPosition()
  }

  scale(scale: number) {
    super.scale(scale)
    this.updateRenderPosition()
  }

  setWantedImageInfo(wantedImageInfo: WantedImageInfo) {
    this.#wantedImageInfo = wantedImageInfo
    this.#renderOffset = { ...wantedImageInfo.boundaryOffset }
    this.#transparentPosition = { ...wantedImageInfo.avatarPosition }
  }

  updateRenderPosition() {
    if (!this.#image) {
      return
    }

    const scale = getScale(
      this.width,
      this.height,
      this.#image.width,
      this.#image.height
    )

    // The size of scaled image may be smaller than avatar area, so here we
    // calculate render position to put the scaled image to the center of avatar area.
    const width = this.#image.width * scale
    const height = this.#image.height * scale

    const x = this.x + (this.width - width) / 2
    const y = this.y + (this.height - height) / 2

    this.#renderPosition = { x, y, width, height }
  }

  on(eventName: EventName, fn: () => void) {
    if (!this.#listeners.has(eventName)) {
      this.#listeners.set(eventName, [])
    }

    this.#listeners.get(eventName)?.push(fn)
  }

  off(eventName: EventName, fn: () => void) {
    const listeners = this.#listeners.get(eventName)
    if (!listeners) {
      return
    }
    const index = listeners.findIndex((f) => f === fn)
    listeners.splice(index, 1)
  }

  render(): void {
    this.ctx.save()
    // render background for the transparent area of avatar
    this.ctx.fillStyle = this.#fillPattern ? this.#fillPattern : 'none'
    this.ctx.fillRect(
      this.#transparentPosition.x,
      this.#transparentPosition.y,
      this.#transparentPosition.width,
      this.#transparentPosition.height
    )

    if (!this.#image) {
      this.ctx.restore()
      return
    }

    const { x, y, width, height } = this.#renderPosition
    this.ctx.filter = this.filter
    this.ctx.drawImage(this.#image, x, y, width, height)

    // Following logic is to clear overflow parts which is outside the boundary of wanted image.
    // Since the wanted image has irregularly transparent edges, clearing overflow parts can prevent
    // avatar to be rendered on transparent area.
    const { left, right, top, bottom } = this.#renderOffset

    // clear left overflow
    x <= left && this.ctx.clearRect(0, y, left, height)
    // clear top overflow
    y <= top && this.ctx.clearRect(x, 0, width, top)
    // claer right overflow
    if (x + width > this.ctx.canvas.domWidth - right) {
      this.ctx.clearRect(this.ctx.canvas.domWidth - right, y, right, height)
    }
    // clear bottom overflow
    if (y + height > this.ctx.canvas.domHeight - bottom) {
      this.ctx.clearRect(x, this.ctx.canvas.domHeight - bottom, width, bottom)
    }

    this.ctx.restore()
  }
}

export default Avatar
