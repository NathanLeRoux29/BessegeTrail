import { test } from '@playwright/test'
import { expectSharedTheme } from '../theme'

test('THM-04 / THM-05 / SOC-13 : le thème partagé est chargé, polices comprises, sans requête externe (site)', async ({ page }) => {
  await expectSharedTheme(page)
})
