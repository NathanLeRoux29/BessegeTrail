import { expect, test } from '@playwright/test'
import { expectNoSeriousViolations } from '../axe'

test('DEP-06 : l’accueil du site s’affiche depuis l’image, sans violation d’accessibilité', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('h1')).toHaveCount(1)
  await expectNoSeriousViolations(page)
})

test('ACC-02 / ACC-03 : les sections de l’accueil ont leur ancre, un titre h2 et des fonds alternés', async ({ page }) => {
  await page.goto('/')
  const sections = page.locator('main section.page-section')

  await expect(sections).toHaveCount(6)
  expect(await sections.evaluateAll(all => all.map(section => section.id)))
    .toEqual(['presentation', 'epreuves', 'galerie', 'benevoles', 'partenaires', 'contact'])
  for (const section of await sections.all()) {
    await expect(section.locator('h2')).toHaveCount(1)
  }
  const backgrounds = await sections.evaluateAll(all => all.map(section => getComputedStyle(section).backgroundColor))
  expect(new Set(backgrounds).size).toBe(2)
  expect(backgrounds.every((color, index) => index === 0 || color !== backgrounds[index - 1])).toBe(true)
})

test.describe('sans JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('ACC-08 : le compte à rebours (ou le texte d’après le départ) est rendu par le serveur', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('.hero-countdown')).toContainText(/Départ dans|Merci/)
  })
})
