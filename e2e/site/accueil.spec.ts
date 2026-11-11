import { expect, test } from '@playwright/test'
import { expectNoSeriousViolations } from '../axe'

test('DEP-06 : l’accueil du site s’affiche depuis l’image, sans violation d’accessibilité', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('h1')).toHaveCount(1)
  await expectNoSeriousViolations(page)
})
