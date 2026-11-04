import { setLightNav } from './lightNavbar.js'

const rootCss = document.querySelector(':root')


export function setLight(chooseSet) {
  rootCss.style.setProperty('--background', '#f6f6f4')
  rootCss.style.setProperty('--font', '#121212')
  rootCss.style.setProperty('--desc', '#66665f')
  rootCss.style.setProperty('--dim', '#f6f6f4')
  rootCss.style.setProperty('--icon', '#acacac')
  rootCss.style.setProperty('--desktop-navbar', '#f6f6f4')
  rootCss.style.setProperty('--icon-filter', 'invert(0.3)')
  rootCss.style.setProperty('--desktop-navicon', '#eeeeee')
  rootCss.style.setProperty('--button-enabled', '#eeeeee')
  rootCss.style.setProperty('--icon-bc', '#d6d6d1')
  rootCss.style.setProperty('--button', '#b3b3b3')

  if (chooseSet) setData('light')

  setLightNav()
}

function setData(mode) {
  localStorage.setItem('/ReZygisk/theme', mode)

  return mode
}
