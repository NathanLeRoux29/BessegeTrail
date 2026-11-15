import { expect, test, type Page } from '@playwright/test'
import { expectNoSeriousViolations } from '../axe'
import { publicPages } from './pages'

// Socle d'accessibilité et de responsive (spec 01), vérifié sur chaque page publique.

// Liens et boutons visibles de moins de 44 × 44 px. Un lien au fil d'une phrase
// en est exempté (WCAG 2.5.8).
function smallTargets(page: Page) {
  return page.evaluate(() => [...document.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, summary')]
    .filter(element => element.checkVisibility() && !element.closest('p'))
    .map((element) => {
      const { width, height } = element.getBoundingClientRect()
      return { target: `${element.tagName.toLowerCase()} « ${element.textContent.trim()} »`, width: Math.round(width), height: Math.round(height) }
    })
    .filter(({ width, height }) => width < 44 || height < 44))
}

for (const path of publicPages) {
  test.describe(`page ${path}`, () => {
    test('SOC-15 : aucune violation axe-core sérieuse ou critique', async ({ page }) => {
      await page.goto(path)

      await expectNoSeriousViolations(page)
    })

    for (const width of [320, 768, 1920]) {
      test(`SOC-10 : aucun défilement horizontal à ${width} px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 })
        await page.goto(path)

        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
        expect(overflow).toBe(0)
      })
    }

    test('SOC-11 : les zones cliquables mesurent au moins 44 × 44 px sur mobile, menu fermé puis ouvert', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 740 })
      await page.goto(path)

      expect(await smallTargets(page)).toEqual([])

      await page.getByRole('button', { name: 'Menu' }).click()
      expect(await smallTargets(page)).toEqual([])
    })

    test('SOC-16 : « Aller au contenu » est le premier élément focusable et mène au contenu', async ({ page }) => {
      await page.goto(path)

      await page.keyboard.press('Tab')
      const skipLink = page.getByRole('link', { name: 'Aller au contenu' })
      await expect(skipLink).toBeFocused()
      await expect(skipLink).toBeInViewport()

      await page.keyboard.press('Enter')
      await expect(page.locator('main#contenu')).toBeFocused()
    })

    test('SOC-17 : un seul h1 et aucun niveau de titre sauté', async ({ page }) => {
      await page.goto(path)

      const levels = await page.locator('h1, h2, h3, h4, h5, h6').evaluateAll(headings => headings.map(heading => Number(heading.tagName[1])))
      expect(levels.filter(level => level === 1)).toHaveLength(1)
      const skipped = levels.filter((level, index) => index > 0 && level > levels[index - 1]! + 1)
      expect(skipped, `niveaux : ${levels.join(', ')}`).toEqual([])
    })

    test('SOC-19 : chaque élément atteint au clavier a un contour de focus visible', async ({ page }) => {
      await page.goto(path)

      const focused: string[] = []
      for (let step = 0; step < 100; step++) {
        await page.keyboard.press('Tab')
        const state = await page.evaluate(() => {
          const element = document.activeElement as HTMLElement | null
          if (!element || element === document.body) return null
          const style = getComputedStyle(element)
          return {
            target: `${element.tagName.toLowerCase()} « ${element.textContent.trim()} »`,
            visible: style.outlineStyle !== 'none' && Number.parseFloat(style.outlineWidth) >= 2,
          }
        })
        if (!state || focused.includes(state.target)) break
        focused.push(state.target)
        expect(state.visible, state.target).toBe(true)
      }
      expect(focused.length).toBeGreaterThan(0)
    })

    test.describe('avec prefers-reduced-motion', () => {
      test.use({ reducedMotion: 'reduce' })

      test('SOC-20 : aucune animation ni transition ne tourne', async ({ page }) => {
        await page.goto(path)

        // Éléments dont une transition ou une animation a une durée non nulle.
        const moving = await page.evaluate(() => [...document.querySelectorAll('*')]
          .filter((element) => {
            const style = getComputedStyle(element)
            return `${style.transitionDuration}, ${style.animationDuration}`.split(', ')
              .some(duration => Number.parseFloat(duration) > 0)
          })
          .map(element => `${element.tagName.toLowerCase()}.${element.getAttribute('class')}`))
        expect(moving).toEqual([])
      })
    })
  })
}
