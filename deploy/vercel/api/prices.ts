import { handlePriceProxyRequest } from '@navor/adapters'

export const config = {
  runtime: 'edge',
}

export default async function handler(request: Request) {
  return handlePriceProxyRequest(request)
}
