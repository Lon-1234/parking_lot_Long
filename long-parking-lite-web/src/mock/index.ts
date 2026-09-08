import MockAdapter from 'axios-mock-adapter'
import { request } from '@/api/request'
import { registerHandlers } from './handlers'

let mock: MockAdapter | undefined

export function setupMock() {
  if (mock) return mock
  mock = new MockAdapter(request, { delayResponse: Math.floor(200 + Math.random() * 301) })
  registerHandlers(mock)
  return mock
}
