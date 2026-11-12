import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { AppButton } from '#components'

const label = { default: () => 'S’inscrire' }

describe('AppButton', () => {
  it.each(['primary', 'secondary', 'outline'] as const)('THM-03 : la variante %s reçoit sa classe', async (variant) => {
    const button = await mountSuspended(AppButton, { props: { variant }, slots: label })

    expect(button.classes()).toContain(`button--${variant}`)
    expect(button.text()).toBe('S’inscrire')
  })

  it('THM-03 : la variante primaire est celle par défaut', async () => {
    const button = await mountSuspended(AppButton, { slots: label })

    expect(button.classes()).toContain('button--primary')
  })

  it('THM-03 : sans destination, c’est un <button type="button">', async () => {
    const button = await mountSuspended(AppButton, { slots: label })

    expect(button.element.tagName).toBe('BUTTON')
    expect(button.attributes('type')).toBe('button')
  })

  it('THM-03 : avec une destination, c’est un lien', async () => {
    const button = await mountSuspended(AppButton, { props: { to: '/infos-pratiques' }, slots: label })

    expect(button.element.tagName).toBe('A')
    expect(button.attributes('href')).toBe('/infos-pratiques')
  })

  it('THM-03 : une variante inconnue est refusée', () => {
    const { validator } = (AppButton as unknown as { props: { variant: { validator: (value: unknown) => boolean } } }).props.variant

    expect(validator('primary')).toBe(true)
    expect(validator('danger')).toBe(false)
  })
})
