import { describe, expect, it } from 'vitest'
import { healthPayload } from '../server/utils/health'

describe('healthPayload', () => {
  it('indique que le service fonctionne et donne son nom', () => {
    expect(healthPayload('site')).toEqual({ status: 'ok', service: 'site' })
  })
})
