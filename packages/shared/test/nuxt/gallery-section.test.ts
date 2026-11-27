import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { GallerySection } from '#components'
import { contentWith } from '../fixtures'

const block = contentWith()['home.galerie']

function mountGallery(overrides: Partial<typeof block> = {}) {
  return mountSuspended(GallerySection, { props: { block: { ...block, ...overrides }, anchor: 'galerie', background: 'background' } })
}

describe('GallerySection', () => {
  it('ACC-21 : les photos sont en grille, chacune avec son texte alternatif', async () => {
    const wrapper = await mountGallery()

    const images = wrapper.findAll('ul.gallery li img')
    expect(images.map(image => image.attributes('alt'))).toEqual(block.photos.map(photo => photo.alt))
    expect(images.every(image => image.attributes('loading') === 'lazy')).toBe(true)
  })

  it('ACC-22 : chaque miniature est un bouton qui annonce l’agrandissement de sa photo', async () => {
    const wrapper = await mountGallery()

    const first = wrapper.get('ul.gallery button')
    expect(first.attributes('type')).toBe('button')
    expect(first.attributes('aria-label')).toBe(`Agrandir : ${block.photos[0]!.alt}`)
  })

  it('ACC-22 : la visionneuse est une boîte de dialogue nommée, fermée par défaut, avec ses commandes', async () => {
    const wrapper = await mountGallery()

    const dialog = wrapper.get('dialog')
    expect(dialog.attributes('aria-label')).toBe('Visionneuse de photos')
    expect(dialog.attributes('open')).toBeUndefined()
    expect(dialog.findAll('button').map(button => button.text())).toEqual(['Photo précédente', 'Photo suivante', 'Fermer'])
  })

  it('une photo sans fichier n’est pas affichée', async () => {
    const wrapper = await mountGallery({ photos: [...block.photos.slice(0, 2), { src: '', alt: 'Sans fichier', width: 0, height: 0 }] })

    expect(wrapper.findAll('ul.gallery li')).toHaveLength(2)
  })
})
