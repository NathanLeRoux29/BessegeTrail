export interface HealthPayload {
  status: 'ok'
  service: string
}

export function healthPayload(service: string): HealthPayload {
  return { status: 'ok', service }
}
