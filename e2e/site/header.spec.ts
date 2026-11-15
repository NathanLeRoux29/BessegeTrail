import { expect, test } from '@playwright/test'
import { expectNoSeriousViolations } from '../axe'

// Header de l'accueil, avec le contenu de démo chargé par l'admin.

test('SOC-01 : le header affiche le logo, le titre, le menu et le bouton d’inscription', async ({ page }) => {
  await page.goto('/')
  const header = page.locator('header.site-header')

  await expect(header.getByRole('link', { name: /Trail de Bessèges/ }).first()).toHaveAttribute('href', '/')
  await expect(header.getByRole('navigation', { name: 'Navigation principale' }).getByRole('link')).toHaveCount(7)
  await expect(header.getByRole('link', { name: /S’inscrire/ })).toBeVisible()
  await expectNoSeriousViolations(page)
})

test.describe('sur mobile (375 px)', () => {
  test.use({ viewport: { width: 375, height: 740 } })

  test('SOC-04 : le menu est replié derrière le bouton « Menu », le bouton d’inscription reste visible', async ({ page }) => {
    await page.goto('/')
    const toggle = page.getByRole('button', { name: 'Menu' })
    const nav = page.getByRole('navigation', { name: 'Navigation principale' })

    await expect(nav).toBeHidden()
    await expect(page.getByRole('link', { name: /S’inscrire/ })).toBeVisible()
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(nav).toBeVisible()
    await expect(nav.getByRole('link').first()).toBeFocused()
    await expectNoSeriousViolations(page)

    await page.keyboard.press('Escape')
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(nav).toBeHidden()
    await expect(toggle).toBeFocused()
  })

  test('SOC-05 : le header reste visible en haut de l’écran pendant le défilement', async ({ page }) => {
    await page.goto('/')
    // Contenu de page assez long pour défiler, quel que soit le contenu publié.
    await page.locator('main').evaluate(main => main.style.setProperty('min-height', '400vh'))
    await page.mouse.wheel(0, 1500)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(1000)

    const box = await page.locator('header.site-header').boundingBox()
    expect(box?.y).toBe(0)
    await expect(page.getByRole('button', { name: 'Menu' })).toBeInViewport()
  })
})
