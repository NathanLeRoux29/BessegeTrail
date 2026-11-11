export interface HealthPayload {
  status: 'ok'
  service: string
  version: string
}

export function healthPayload(service: string, version: string): HealthPayload {
  return { status: 'ok', service, version }
}
