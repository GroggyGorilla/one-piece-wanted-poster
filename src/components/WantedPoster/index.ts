import { WARCRIMINAL_POSTER } from '../App/config'
import { ONE_PIECE_WANTED_IMAGE } from './constants'
import cssContent from './style.css?inline'
import { getScale } from './utils'

import type { PosterCanvasElement, PosterRenderingContext2D } from './types'

import Bounty from './Bounty'
import Name from './Name'
import FooterTitle from './FooterTitle'
import FooterText from './FooterText'
import Photo from './Photo'
import PhotoResizer from './PhotoResizer'
import WantedImage from './WantedImage'

const TAG_NAME = 'wanted-poster'
const ATTRIBUTES = [
  'name',
  'bounty',
  'footer-title',
  'footer-text',
  'footer-text-two',
  'footer-text-three',
  'footer-text-four',
  'name-spacing',
  'bounty-spacing',
  'photo-url',
  'filter',
  'shadow'
] as const

type Attributes = typeof ATTRIBUTES
export type WantedPosterAttribute = {
  [key in Attributes[number]]?: string
}

class WantedPoster extends HTMLElement {
  #container: HTMLDivElement
  #canvas: PosterCanvasElement
  #ctx: PosterRenderingContext2D

  #photo: Photo
  #photoResizer: PhotoResizer
  #name: Name
  #bounty: Bounty
  #footerTitle: FooterTitle
  #footerText: FooterText
  #footerText2: FooterText
  #footerText3: FooterText
  #footerText4: FooterText
  #wantedImage: WantedImage
  #status: 'init' | 'loading' | 'success' | 'error'

  #resizeObserver: ResizeObserver
  #resizeTimeout?: number

  constructor() {
    super()
    this.#status = 'init'

    const shadowRoot = this.attachShadow({ mode: 'open' })

    const canvas = document.createElement('canvas') as PosterCanvasElement
    canvas.domWidth = 0
    canvas.domHeight = 0
    const container = document.createElement('div')
    container.className = 'container'

    const style = document.createElement('style')
    style.textContent = cssContent

    shadowRoot.append(style, container)

    const ctx = canvas.getContext('2d') as PosterRenderingContext2D

    this.#container = container
    this.#canvas = canvas
    this.#ctx = ctx

    this.#wantedImage = new WantedImage(ctx, ONE_PIECE_WANTED_IMAGE)
    this.#photo = new Photo(ctx)
    this.#name = new Name(ctx)
    this.#bounty = new Bounty(ctx)
    this.#footerTitle = new FooterTitle(ctx)
    this.#footerText = new FooterText(ctx)
    this.#footerText2 = new FooterText(ctx)
    this.#footerText3 = new FooterText(ctx)
    this.#footerText4 = new FooterText(ctx)
    // this.#footerTitle.align = 'left'
    // this.#footerText.align = 'left'
    this.#photoResizer = new PhotoResizer(ctx, this.#photo)

    this.#resizeObserver = new ResizeObserver(() => {
      clearTimeout(this.#resizeTimeout)
      this.#resizeTimeout = window.setTimeout(() => this.#resize(), 200)
    })
    this.#resizeObserver.observe(container)
  }

  static get observedAttributes(): Attributes {
    return ATTRIBUTES
  }

  async connectedCallback() {
    console.log('[connected]')

    // We need to get correct rect of container to calculate canvas's size,
    // but 'connectedCallback' hook does not mean element is fully parsed, therefor
    // here we wait a event loop cycle to make sure container is parsed.
    await new Promise((resolve) => {
      setTimeout(() => resolve(''))
    })

    this.#status = 'loading'

    const shadow = this.#getShadow()
    const rect = this.#container.getBoundingClientRect()

    try {
      await this.#wantedImage.loadImage()

      const wantedImageInfo = this.#wantedImage.setSize({
        width: rect.width,
        height: rect.height,
        shadowSize: shadow,
        quality: 'half'
      })

      this.#name.setPosition(wantedImageInfo.namePosition)
      this.#bounty.setBountyInfo(
        wantedImageInfo.bountyInfo,
        this.#wantedImage.imageScale
      )
      this.#footerTitle.setPosition(wantedImageInfo.footerTitlePosition)
      this.#footerText.setPosition(wantedImageInfo.footerTextPosition)
      this.#footerText2.setPosition(wantedImageInfo.footerText2Position)
      this.#footerText3.setPosition(wantedImageInfo.footerText3Position)
      this.#footerText4.setPosition(wantedImageInfo.footerText4Position)

      await this.#bounty.loadBellyImage(ONE_PIECE_WANTED_IMAGE.bellyImageUrl)
      await this.#photo.init(
        wantedImageInfo.photoPosition,
        wantedImageInfo.boundaryOffset
      )
      await this.#photo.loadImage(this.getAttribute('photo-url'))
    } catch (e) {
      this.#status = 'error'
      console.error('Failed to init wanted poster.', e)
      return
    }

    this.#name.text = this.getAttribute('name') ?? ''
    this.#bounty.text = this.getAttribute('bounty') ?? ''
    this.#footerTitle.text = this.getAttribute('footer-title') ?? ''
    this.#footerText.text = this.getAttribute('footer-text') ?? ''
    this.#footerText2.text = this.getAttribute('footer-text-two') ?? ''
    this.#footerText3.text = this.getAttribute('footer-text-three') ?? ''
    this.#footerText4.text = this.getAttribute('footer-text-four') ?? ''
    this.#name.spacing = parseInt(this.getAttribute('name-spacing') ?? '0') || 0
    this.#bounty.spacing =
      parseInt(this.getAttribute('bounty-spacing') ?? '0') || 0

    this.#photo.filter = this.getAttribute('filter') ?? ''

    this.#status = 'success'

    this.#render()
    // defer appending canvas here to avoid CLS(Cumulative Layout Shift)
    this.#container.appendChild(this.#canvas)
    this.dispatchEvent(new CustomEvent('WantedPosterLoaded', { bubbles: true }))
  }

  disconnectedCallback() {
    console.log('[disconnected]')
    this.#resizeObserver.disconnect()
  }

  adoptedCallback() {
    console.log('[adopted]')
  }

  async attributeChangedCallback(
    attributeName: Attributes[number],
    _: string,
    newValue: string
  ) {
    if (this.#status !== 'success') {
      return
    }
    switch (attributeName) {
      case 'name':
        this.#name.text = newValue
        break

      case 'bounty':
        this.#bounty.text = newValue
        break
      
      case 'footer-title':
        this.#footerTitle.text = newValue
        break

      case 'footer-text':
        this.#footerText.text = newValue
        break

      case 'footer-text-two':
        this.#footerText2.text = newValue
        break

      case 'footer-text-three':
        this.#footerText3.text = newValue
        break

      case 'footer-text-four':
        this.#footerText4.text = newValue
        break

      case 'name-spacing':
        this.#name.spacing = parseInt(newValue) || 0
        break

      case 'bounty-spacing':
        this.#bounty.spacing = parseInt(newValue) || 0
        break

      case 'photo-url': {
        await this.#photo.loadImage(newValue)
        this.#photoResizer.highlight = WARCRIMINAL_POSTER.photoUrls.includes(
          newValue
        )
          ? false
          : true
        break
      }

      case 'filter': {
        this.#photo.filter = newValue
        break
      }

      case 'shadow': {
        this.#resize()
        break
      }
    }
  }

  #getShadow() {
    const shadowAttr = this.getAttribute('shadow')
    if (!shadowAttr) {
      return 0
    }

    const shadow = Number.parseInt(shadowAttr)
    if (Number.isNaN(shadow)) {
      return 0
    }

    return shadow
  }

  async export() {
    const canvas = document.createElement('canvas') as PosterCanvasElement
    canvas.domWidth = 0
    canvas.domHeight = 0
    canvas.style.display = 'none'

    const ctx = canvas.getContext('2d') as PosterRenderingContext2D

    const shadow = this.#getShadow()
    const wantedImage = new WantedImage(ctx, ONE_PIECE_WANTED_IMAGE)
    const photo = new Photo(ctx)
    const name = new Name(ctx)
    const bounty = new Bounty(ctx)
    const footerTitle = new FooterTitle(ctx)
    const footerText = new FooterText(ctx)
    const footerText2 = new FooterText(ctx)
    const footerText3 = new FooterText(ctx)
    const footerText4 = new FooterText(ctx)

    const image = await wantedImage.loadImage()

    const exportWidth = image.width + shadow * 2
    const exportHeight = image.height + shadow * 2

    const wantedImageInfo = wantedImage.setSize({
      width: exportWidth,
      height: exportHeight,
      shadowSize: shadow,
      quality: 'original'
    })

    await bounty.loadBellyImage(wantedImageInfo.bellyImageUrl)
    name.setPosition(wantedImageInfo.namePosition)
    footerTitle.setPosition(wantedImageInfo.footerTitlePosition)
    footerText.setPosition(wantedImageInfo.footerTextPosition)
    footerText2.setPosition(wantedImageInfo.footerText2Position)
    footerText3.setPosition(wantedImageInfo.footerText3Position)
    footerText4.setPosition(wantedImageInfo.footerText4Position)
    bounty.setBountyInfo(wantedImageInfo.bountyInfo, 1)
    name.text = this.getAttribute('name') ?? ''
    bounty.text = this.getAttribute('bounty') ?? ''
    footerTitle.text = this.getAttribute('footer-title') ?? ''
    footerText.text = this.getAttribute('footer-text') ?? ''
    footerText2.text = this.getAttribute('footer-text-two') ?? ''
    footerText3.text = this.getAttribute('footer-text-three') ?? ''
    footerText4.text = this.getAttribute('footer-text-four') ?? ''
    name.spacing = parseInt(this.getAttribute('name-spacing') ?? '0') || 0
    bounty.spacing = parseInt(this.getAttribute('bounty-spacing') ?? '0') || 0

    await photo.init(
      wantedImageInfo.photoPosition,
      wantedImageInfo.boundaryOffset
    )
    await photo.loadImage(this.getAttribute('photo-url'))

    // sync photo position from current displaying canvas
    const { x, y, width, height, filter } = this.#photo
    photo.x = x / this.#wantedImage.imageScale
    photo.y = y / this.#wantedImage.imageScale
    photo.width = width / this.#wantedImage.imageScale
    photo.height = height / this.#wantedImage.imageScale
    photo.filter = filter

    photo.updateRenderPosition()

    photo.render()
    wantedImage.render()
    bounty.render()
    name.render()
    footerTitle.render()
    footerText.render()
    footerText2.render()
    footerText3.render()
    footerText4.render()

    let url = ''
    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            blob ? resolve(blob) : reject('Failed to create blob object.')
          },
          'image/png',
          1
        )
      })
      url = URL.createObjectURL(blob)
      this.#downloadFile(url, 'wanted-poster.png')
    } catch (e) {
      throw e
    } finally {
      if (url) {
        URL.revokeObjectURL(url)
      }
    }
  }

  #downloadFile(uri: string, fileName: string) {
    let anchor = document.createElement('a')
    anchor.setAttribute('href', uri)
    anchor.setAttribute('download', fileName)
    anchor.style.display = 'none'

    document.body.appendChild(anchor)

    anchor.click()
    anchor.remove()
  }

  #resize() {
    if (this.#status !== 'success') {
      return
    }

    const shadow = this.#getShadow()
    const containerRect = this.#container.getBoundingClientRect()
    const canvasRect = this.#canvas.getBoundingClientRect()

    const resizeScale = getScale(
      containerRect.width,
      containerRect.height,
      canvasRect.width,
      canvasRect.height
    )
    const wantedImageInfo = this.#wantedImage.setSize({
      width: containerRect.width,
      height: containerRect.height,
      shadowSize: shadow,
      quality: 'half'
    })

    this.#name.setPosition(wantedImageInfo.namePosition)
    this.#bounty.setBountyInfo(
      wantedImageInfo.bountyInfo,
      this.#wantedImage.imageScale
    )
    this.#footerTitle.setPosition(wantedImageInfo.footerTitlePosition)
    this.#footerText.setPosition(wantedImageInfo.footerTextPosition)
    this.#footerText2.setPosition(wantedImageInfo.footerText2Position)
    this.#footerText3.setPosition(wantedImageInfo.footerText3Position)
    this.#footerText4.setPosition(wantedImageInfo.footerText4Position)

    this.#photo.setBoundary(
      wantedImageInfo.photoPosition,
      wantedImageInfo.boundaryOffset
    )
    this.#photoResizer.scale(resizeScale)
    this.#photoResizer.borderScale = this.#wantedImage.imageScale
  }

  #render() {
    this.#ctx.clearRect(0, 0, this.#canvas.domWidth, this.#canvas.domHeight)
    this.#photo.render()
    this.#wantedImage.render()
    this.#bounty.render()
    this.#name.render()
    this.#footerTitle.render()
    this.#footerText.render()
    this.#footerText2.render()
    this.#footerText3.render()
    this.#footerText4.render()
    this.#photoResizer.render()

    requestAnimationFrame(this.#render.bind(this))
  }
}

customElements.define(TAG_NAME, WantedPoster)

export default WantedPoster
