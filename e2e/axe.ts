import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

// Contrôle d'accessibilité de chaque page : aucune violation sérieuse ou critique.
export async function expectNoSeriousViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page }).analyze()
  const serious = violations.filter(violation => violation.impact === 'serious' || violation.impact === 'critical')

  expect(serious.map(violation => `${violation.id} : ${violation.help}`)).toEqual([])
}
