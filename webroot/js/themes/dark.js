import { setDarkNav } from './darkNavbar.js'

const rootCss = document.querySelector(':root')

export function setDark(chooseSet) {
  rootCss.style.setProperty('--background', '#0b0b0b')
  rootCss.style.setProperty('--font', '#e9e9e6')
  rootCss.style.setProperty('--desc', '#8a8a87')
  rootCss.style.setProperty('--dim', '#0b0b0b')
  rootCss.style.setProperty('--icon', '#494949')
  rootCss.style.setProperty('--icon-bc', '#262626')
  rootCss.style.setProperty('--desktop-navbar', '#0b0b0b')
  rootCss.style.setProperty('--button-enabled', '#535353')
  rootCss.style.setProperty('--icon-filter', 'invert(1)')
  rootCss.style.setProperty('--desktop-navicon', '#3a3a3a')
  rootCss.style.setProperty('--button', 'var(--background)')

  if (chooseSet) setData('dark')
  setDarkNav()
}

function setData(mode) {
  localStorage.setItem('/ReZygisk/theme', mode)

  return mode
}