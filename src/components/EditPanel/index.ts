import store, { addListener, removeListener, reset } from '../../store'
import cssContent from './style.css?inline'
import templateContent from './template.html?raw'

const TAG_NAME = 'edit-panel'

const template = document.createElement('template')
template.innerHTML = templateContent

class EditPanel extends HTMLElement {
  #nameInput: HTMLInputElement
  #bountyInput: HTMLInputElement
  #footerTitleInput: HTMLInputElement
  #footerTextInput: HTMLInputElement
  #footerText2Input: HTMLInputElement
  #footerText3Input: HTMLInputElement
  #footerText4Input: HTMLInputElement

  #nameSpacingSlider: HTMLInputElement
  #bountySpacingSlider: HTMLInputElement
  #shadowSlider: HTMLInputElement
  #blurSlider: HTMLInputElement
  #brightnessSlider: HTMLInputElement
  #contrastSlider: HTMLInputElement
  #grayscaleSlider: HTMLInputElement
  #hueRotateSlider: HTMLInputElement
  #saturateSlider: HTMLInputElement
  #sepiaSlider: HTMLInputElement

  #closeButton: HTMLButtonElement
  #resetButton: HTMLButtonElement

  #pointerdownListener: (e: PointerEvent) => void
  #storeListener: Parameters<typeof addListener>[1]

  constructor() {
    super()

    const shadowRoot = this.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.textContent = cssContent

    shadowRoot.append(style, template.content.cloneNode(true))

    this.#nameInput = shadowRoot.querySelector<HTMLInputElement>('#nameInput')!
    this.#bountyInput =
      shadowRoot.querySelector<HTMLInputElement>('#bountyInput')!
    this.#footerTitleInput = shadowRoot.querySelector<HTMLInputElement>('#footerTitleInput')!
    this.#footerTextInput = shadowRoot.querySelector<HTMLInputElement>('#footerTextInput')!
    this.#footerText2Input = shadowRoot.querySelector<HTMLInputElement>('#footerText2Input')!
    this.#footerText3Input = shadowRoot.querySelector<HTMLInputElement>('#footerText3Input')!
    this.#footerText4Input = shadowRoot.querySelector<HTMLInputElement>('#footerText4Input')!

    this.#nameSpacingSlider =
      shadowRoot.querySelector<HTMLInputElement>('#nameSpacingSlider')!
    this.#bountySpacingSlider = shadowRoot.querySelector<HTMLInputElement>(
      '#bountySpacingSlider'
    )!
    this.#shadowSlider =
      shadowRoot.querySelector<HTMLInputElement>('#shadowSlider')!
    this.#blurSlider =
      shadowRoot.querySelector<HTMLInputElement>('#blurSlider')!
    this.#brightnessSlider =
      shadowRoot.querySelector<HTMLInputElement>('#brightnessSlider')!
    this.#contrastSlider =
      shadowRoot.querySelector<HTMLInputElement>('#contrastSlider')!
    this.#grayscaleSlider =
      shadowRoot.querySelector<HTMLInputElement>('#grayscaleSlider')!
    this.#hueRotateSlider =
      shadowRoot.querySelector<HTMLInputElement>('#hueRotateSlider')!
    this.#saturateSlider =
      shadowRoot.querySelector<HTMLInputElement>('#saturateSlider')!
    this.#sepiaSlider =
      shadowRoot.querySelector<HTMLInputElement>('#sepiaSlider')!

    this.#closeButton =
      shadowRoot.querySelector<HTMLButtonElement>('#closeButton')!
    this.#resetButton =
      shadowRoot.querySelector<HTMLButtonElement>('#resetButton')!

    this.#storeListener = (key, value) => {
      value = value.toString()
      switch (key) {
        case 'name':
          this.#nameInput.value = value
          break
        case 'bounty':
          this.#bountyInput.value = value
          break
        case 'footerTitle':
          this.#footerTitleInput.value = value
          break
        case 'footerText':
          this.#footerTextInput.value = value
          break
        case 'footerText2':
          this.#footerText2Input.value = value
          break
        case 'footerText3':
          this.#footerText3Input.value = value
          break
        case 'footerText4':
          this.#footerText4Input.value = value
          break
        case 'nameSpacing':
          this.#nameSpacingSlider.value = value
          break
        case 'bountySpacing':
          this.#bountySpacingSlider.value = value
          break
        case 'shadow':
          this.#shadowSlider.value = value
          break
        case 'blur':
          this.#blurSlider.value = value
          break
        case 'brightness':
          this.#brightnessSlider.value = value
          break
        case 'contrast':
          this.#contrastSlider.value = value
          break
        case 'grayscale':
          this.#grayscaleSlider.value = value
          break
        case 'hueRotate':
          this.#hueRotateSlider.value = value
          break
        case 'saturate':
          this.#saturateSlider.value = value
          break
        case 'sepia':
          this.#sepiaSlider.value = value
          break
      }
    }

    // close when user click outside of edit-panel
    this.#pointerdownListener = (e: PointerEvent) => {
      if (e.target instanceof Node && this.contains(e.target)) {
        return
      }
      this.classList.contains('open') && this.toggle()
    }
  }

  toggle() {
    this.classList.toggle('open')
  }

  connectedCallback() {
    window.addEventListener('pointerdown', this.#pointerdownListener)

    addListener('name', this.#storeListener)
    addListener('bounty', this.#storeListener)
    addListener('footerTitle', this.#storeListener)
    addListener('footerText', this.#storeListener)
    addListener('footerText2', this.#storeListener)
    addListener('footerText3', this.#storeListener)
    addListener('footerText4', this.#storeListener)
    addListener('nameSpacing', this.#storeListener)
    addListener('bountySpacing', this.#storeListener)
    addListener('shadow', this.#storeListener)
    addListener('blur', this.#storeListener)
    addListener('saturate', this.#storeListener)
    addListener('contrast', this.#storeListener)
    addListener('grayscale', this.#storeListener)
    addListener('hueRotate', this.#storeListener)
    addListener('hueRotate', this.#storeListener)
    addListener('sepia', this.#storeListener)

    this.#nameInput.value = store.name
    this.#bountyInput.value = store.bounty.toString()

    this.#footerTitleInput.value = store.footerTitle
    this.#footerTextInput.value = store.footerText
    this.#footerText2Input.value = store.footerText2
    this.#footerText3Input.value = store.footerText3
    this.#footerText4Input.value = store.footerText4

    this.#nameSpacingSlider.value = store.nameSpacing.toString()
    this.#bountySpacingSlider.value = store.bountySpacing.toString()
    this.#shadowSlider.value = store.shadow.toString()
    this.#blurSlider.value = store.blur.toString()
    this.#brightnessSlider.value = store.brightness.toString()
    this.#contrastSlider.value = store.contrast.toString()
    this.#grayscaleSlider.value = store.grayscale.toString()
    this.#hueRotateSlider.value = store.hueRotate.toString()
    this.#saturateSlider.value = store.saturate.toString()
    this.#sepiaSlider.value = store.sepia.toString()

    this.#nameInput.addEventListener(
      'input',
      () => (store.name = this.#nameInput.value)
    )
    this.#bountyInput.addEventListener(
      'input',
      () => (store.bounty = this.#bountyInput.value)
    )
    
    this.#footerTitleInput.addEventListener(
      'input',
      () => (store.footerTitle = this.#footerTitleInput.value)
    )
    this.#footerTextInput.addEventListener(
      'input',
      () => (store.footerText = this.#footerTextInput.value)
    )
    this.#footerText2Input.addEventListener(
      'input',
      () => (store.footerText2 = this.#footerText2Input.value)
    )
    this.#footerText3Input.addEventListener(
      'input',
      () => (store.footerText3 = this.#footerText3Input.value)
    )
    this.#footerText4Input.addEventListener(
      'input',
      () => (store.footerText4 = this.#footerText4Input.value)
    )

    this.#nameSpacingSlider.addEventListener(
      'input',
      () => (store.nameSpacing = parseInt(this.#nameSpacingSlider.value))
    )
    this.#bountySpacingSlider.addEventListener(
      'input',
      () => (store.bountySpacing = parseInt(this.#bountySpacingSlider.value))
    )
    this.#shadowSlider.addEventListener(
      'input',
      () => (store.shadow = parseInt(this.#shadowSlider.value))
    )
    this.#blurSlider.addEventListener(
      'input',
      () => (store.blur = parseInt(this.#blurSlider.value))
    )
    this.#brightnessSlider.addEventListener(
      'input',
      () => (store.brightness = parseInt(this.#brightnessSlider.value))
    )
    this.#contrastSlider.addEventListener(
      'input',
      () => (store.contrast = parseInt(this.#contrastSlider.value))
    )
    this.#grayscaleSlider.addEventListener(
      'input',
      () => (store.grayscale = parseInt(this.#grayscaleSlider.value))
    )
    this.#hueRotateSlider.addEventListener(
      'input',
      () => (store.hueRotate = parseInt(this.#hueRotateSlider.value))
    )
    this.#saturateSlider.addEventListener(
      'input',
      () => (store.saturate = parseInt(this.#saturateSlider.value))
    )
    this.#sepiaSlider.addEventListener(
      'input',
      () => (store.sepia = parseInt(this.#sepiaSlider.value))
    )

    this.#closeButton.addEventListener('click', () => this.toggle())
    this.#resetButton.addEventListener('click', () =>
      reset({ photoUrl: store.photoUrl })
    )
  }

  disconnectedCallback() {
    window.removeEventListener('pointerdown', this.#pointerdownListener)
    removeListener('name', this.#storeListener)
    removeListener('bounty', this.#storeListener)
    removeListener('footerTitle', this.#storeListener)
    removeListener('footerText', this.#storeListener)
    removeListener('footerText2', this.#storeListener)
    removeListener('footerText3', this.#storeListener)
    removeListener('footerText4', this.#storeListener)
    removeListener('shadow', this.#storeListener)
    removeListener('blur', this.#storeListener)
    removeListener('saturate', this.#storeListener)
    removeListener('contrast', this.#storeListener)
    removeListener('grayscale', this.#storeListener)
    removeListener('hueRotate', this.#storeListener)
    removeListener('hueRotate', this.#storeListener)
    removeListener('sepia', this.#storeListener)
  }
}

customElements.define(TAG_NAME, EditPanel)

export default EditPanel
