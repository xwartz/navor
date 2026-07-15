import { handlePriceProxyRequest } from '@navor/adapters'

export const onRequestPost = async ({ request }: { request: Request }) => {
  return handlePriceProxyRequest(request)
}
