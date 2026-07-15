import { handlePriceProxyRequest } from '@navor/adapters'

export default {
  async fetch(request: Request): Promise<Response> {
    return handlePriceProxyRequest(request)
  },
}
