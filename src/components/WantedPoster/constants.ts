import bellySignImageUrl from './images/belly.png'
import wantedImageUrl from './images/one-piece-wanted.png'
import { WantedImageInfo } from './types'

export const ONE_PIECE_WANTED_IMAGE: WantedImageInfo = {
  imageUrl: wantedImageUrl,
  bellyImageUrl: bellySignImageUrl,
  photoPosition: { x: 74, y: 252, width: 638, height: 484 },
  namePosition: { x: 87, y: 826, width: 586, height: 114 },
  footerTitlePosition: { x: -110, y: 1042, width: 390, height: 24 },
  footerTextPosition: { x: -110, y: 1070, width: 390, height: 18 },
  footerText2Position: { x: -110, y: 1090, width: 390, height: 18 },
  footerText3Position: { x: -110, y: 1110, width: 390, height: 18 },
  footerText4Position: { x: -110, y: 1130, width: 390, height: 18 },
  bountyInfo: {
    x: 82,
    y: 958,
    width: 592,
    height: 85,
    bellyMarginRight: 18,
    fontSize: 70
  },
  boundaryOffset: {
    left: 10,
    right: 10,
    top: 10,
    bottom: 10
  }
}
