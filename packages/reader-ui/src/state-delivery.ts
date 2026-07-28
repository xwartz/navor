export const READER_STATE_SOURCE_ATTRIBUTE = 'data-navor-source'
export const READER_STATE_PATH = './navor-data.json'

export function readerStateSourceFromDocument(document: Document) {
  return document
    .querySelector(`[${READER_STATE_SOURCE_ATTRIBUTE}]`)
    ?.getAttribute(READER_STATE_SOURCE_ATTRIBUTE)
}

export function readerStateDeliveryTag(source = READER_STATE_PATH) {
  return `<script type="application/json" ${READER_STATE_SOURCE_ATTRIBUTE}="${source}"></script>`
}

export function isReaderStateRequest(url: string | undefined) {
  return url === '/navor-data.json'
}
