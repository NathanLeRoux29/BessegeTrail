import { expect, type Page } from '@playwright/test'

// Thème du layer partagé, identique sur le site et l'admin (spec 04).
export async function expectSharedTheme(page: Page) {
  const requests: string[] = []
  page.on('request', request => requests.push(request.url()))

  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)

  // THM-05 : les jetons du layer sont chargés.
  const primary = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--color-primary'))
  expect(primary.trim().toUpperCase()).toBe('#F5700F')

  // THM-04 : deux familles, servies par le site, affichées en « swap ».
  const fonts = await page.evaluate(() => [...document.fonts].filter(font => font.status === 'loaded').map(font => ({ family: font.family.replaceAll('"', ''), display: font.display })))
  expect(new Set(fonts.map(font => font.family))).toEqual(new Set(['Barlow Condensed', 'Inter Variable']))
  for (const font of fonts) expect(font.display).toBe('swap')

  // SOC-13 : aucune requête vers un autre domaine (Google Fonts, CDN…).
  const origin = new URL(page.url()).origin
  expect(requests.filter(url => !url.startsWith('data:') && new URL(url).origin !== origin)).toEqual([])
}
