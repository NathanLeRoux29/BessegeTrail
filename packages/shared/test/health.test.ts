import { describe, expect, it } from 'vitest'
import { healthPayload } from '../server/utils/health'

describe('healthPayload', () => {
  it('indique que le service fonctionne et donne son nom', () => {
    expect(healthPayload('site', '0.1.0')).toEqual({ status: 'ok', service: 'site', version: '0.1.0' })
  })

  it('DEP-13 : donne la version déployée', () => {
    expect(healthPayload('admin', '0.2.0-rc.1').version).toBe('0.2.0-rc.1')
  })
})
