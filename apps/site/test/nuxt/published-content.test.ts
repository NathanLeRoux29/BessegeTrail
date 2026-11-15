import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { usePublishedContent } from '~/composables/usePublishedContent'

registerEndpoint('/api/content', () => ({ 'home.contact': { visible: true, title: 'Écrivez-nous', text: '' } }))

describe('usePublishedContent', () => {
  it('CNT-08 : les pages lisent le contenu publié servi par /api/content', async () => {
    const { data } = await usePublishedContent()

    expect(data.value?.['home.contact'].title).toBe('Écrivez-nous')
  })
})
