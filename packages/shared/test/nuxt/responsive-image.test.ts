import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ResponsiveImage } from '#components'

// Photo déclinée en 480, 960 et 1600 px (CNT-19), désignée par sa version 960.
const photo = { src: '/uploads/a1b2c3-960.webp', width: 1600, height: 1067 }

describe('ResponsiveImage', () => {
  afterEach(() => vi.restoreAllMocks())

  it('SOC-12 : une photo est servie en WebP en trois largeurs, avec ses dimensions', async () => {
    const wrapper = await mountSuspended(ResponsiveImage, { props: { ...photo, alt: 'Départ du trail', sizes: '(max-width: 760px) 100vw, 50vw' } })

    const img = wrapper.get('img')
    expect(img.attributes()).toMatchObject({
      src: '/uploads/a1b2c3-960.webp',
      srcset: '/uploads/a1b2c3-480.webp 480w, /uploads/a1b2c3-960.webp 960w, /uploads/a1b2c3-1600.webp 1600w',
      sizes: '(max-width: 760px) 100vw, 50vw',
      width: '1600',
      height: '1067',
      alt: 'Départ du trail',
    })
  })

  it('SOC-12 : une image est chargée en différé par défaut', async () => {
    const wrapper = await mountSuspended(ResponsiveImage, { props: { ...photo, alt: 'Départ du trail' } })

    const img = wrapper.get('img')
    expect(img.attributes()).toMatchObject({ loading: 'lazy', decoding: 'async', sizes: '100vw' })
    expect(img.attributes('fetchpriority')).toBeUndefined()
  })

  it('SOC-12 : l’image prioritaire (bannière) est chargée tout de suite, en priorité haute', async () => {
    const wrapper = await mountSuspended(ResponsiveImage, { props: { ...photo, alt: '', priority: true } })

    const img = wrapper.get('img')
    expect(img.attributes('fetchpriority')).toBe('high')
    expect(img.attributes('loading')).toBeUndefined()
  })

  it('SOC-12 : une image qui n’a pas de variantes (logo SVG) n’a pas de srcset', async () => {
    const wrapper = await mountSuspended(ResponsiveImage, { props: { src: '/uploads/logo.svg', width: 120, height: 40, alt: 'Commune de Bessèges' } })

    expect(wrapper.get('img').attributes('srcset')).toBeUndefined()
    expect(wrapper.get('img').attributes('src')).toBe('/uploads/logo.svg')
  })

  it('SOC-12 : sans dimensions connues, les attributs width et height ne sont pas inventés', async () => {
    const wrapper = await mountSuspended(ResponsiveImage, { props: { ...photo, width: 0, height: 0, alt: 'Départ du trail' } })

    expect(wrapper.get('img').attributes('width')).toBeUndefined()
    expect(wrapper.get('img').attributes('height')).toBeUndefined()
  })

  it('une image sans source n’est pas affichée', async () => {
    const wrapper = await mountSuspended(ResponsiveImage, { props: { ...photo, src: '', alt: 'Départ du trail' } })

    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('SOC-18 : une image décorative a alt=""', async () => {
    const wrapper = await mountSuspended(ResponsiveImage, { props: { ...photo, alt: '' } })

    expect(wrapper.get('img').attributes('alt')).toBe('')
  })

  it('SOC-18 : le texte alternatif est obligatoire, une image ne peut pas l’omettre', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    // @ts-expect-error : alt manquant, refusé aussi par le typage.
    const wrapper = await mountSuspended(ResponsiveImage, { props: { ...photo } })

    expect(warn.mock.calls.flat().join(' ')).toMatch(/Missing required prop: "alt"/)
    expect(wrapper.get('img').attributes('alt')).toBe('')
  })
})
