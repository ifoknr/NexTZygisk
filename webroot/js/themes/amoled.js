import { setDarkNav } from './darkNavbar.js'

const rootCss = document.querySelector(':root')

export function setAmoled(chooseSet) {
  rootCss.style.setProperty('--background', '#000000')
  rootCss.style.setProperty('--font', '#e9e9e6')
  rootCss.style.setProperty('--desc', '#8a8a87')
  rootCss.style.setProperty('--dim', '#000000')
  rootCss.style.setProperty('--icon', '#292929ff')
  rootCss.style.setProperty('--icon-bc', '#262626')
  rootCss.style.setProperty('--desktop-navbar', '#000000')
  rootCss.style.setProperty('--desktop-navicon', '#242424ff')
  rootCss.style.setProperty('--icon-filter', 'invert(1)')
  rootCss.style.setProperty('--button', 'var(--background)')

  if (chooseSet) setData('amoled')
  setDarkNav()
}

function setData(mode) {
  localStorage.setItem('/ReZygisk/theme', mode)

  return mode
}