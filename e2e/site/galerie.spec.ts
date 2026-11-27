import { expect, test } from '@playwright/test'
import { expectNoSeriousViolations } from '../axe'

// Visionneuse de la galerie de l'accueil, avec les 6 photos de démo.

test('ACC-22 : la visionneuse s’ouvre au clic, se navigue au clavier, piège le focus et le rend à la miniature', async ({ page }) => {
  await page.goto('/')
  const thumbnails = page.locator('#galerie ul.gallery button')
  const dialog = page.getByRole('dialog', { name: 'Visionneuse de photos' })
  const caption = dialog.locator('figcaption .caption')
  const alts = await page.locator('#galerie ul.gallery img').evaluateAll(images => images.map(image => image.getAttribute('alt')))

  await thumbnails.nth(1).click()
  await expect(dialog).toBeVisible()
  await expect(dialog.locator('img')).toHaveAttribute('alt', alts[1]!)
  await expect(caption).toHaveText(`${alts[1]} (2/6)`)
  await expectNoSeriousViolations(page)

  await page.keyboard.press('ArrowRight')
  await expect(caption).toHaveText(`${alts[2]} (3/6)`)
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('ArrowLeft')
  await expect(caption).toHaveText(`${alts[0]} (1/6)`)
  await page.keyboard.press('ArrowLeft')
  await expect(caption).toHaveText(`${alts[5]} (6/6)`)

  for (let step = 0; step < 5; step++) {
    await page.keyboard.press('Tab')
    expect(await dialog.evaluate(element => element.contains(document.activeElement))).toBe(true)
  }

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(thumbnails.nth(1)).toBeFocused()
})

test('ACC-22 : le bouton Fermer ferme la visionneuse et rend le focus à la miniature', async ({ page }) => {
  await page.goto('/')
  const thumbnail = page.locator('#galerie ul.gallery button').first()

  await thumbnail.click()
  await page.getByRole('button', { name: 'Fermer' }).click()

  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(thumbnail).toBeFocused()
})
