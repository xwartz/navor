import { readFile } from 'node:fs/promises'
import { expect, test } from 'vitest'

const readerToolbarPath = new URL(
  '../../packages/reader-ui/src/components/ReaderToolbar.tsx',
  import.meta.url,
)

test('facet menus use controlled state outside a clipping scroll container', async () => {
  const source = await readFile(readerToolbarPath, 'utf8')

  expect(source).toContain(
    'const [openFacet, setOpenFacet] = useState<keyof ReaderFilters | null>(null)',
  )
  expect(source).toContain('isOpen={openFacet === facet.key}')
  expect(source).toContain('onOpenChange={(open) => setOpenFacet(open ? facet.key : null)}')
  expect(source).toContain('aria-expanded={isOpen}')
  expect(source).toContain('control-btn')
  expect(source).toContain('font-semibold leading-none')
  expect(source).not.toContain(
    'inline-flex h-3 w-3 items-center justify-center text-xs leading-none',
  )
  expect(source).toContain('max-w-[10rem] leading-none truncate')
  expect(source).not.toContain('-translate-y-px text-sm leading-none')
  expect(source).toContain('max-w-full flex-wrap items-center gap-2')
  expect(source).not.toContain('max-w-full items-center gap-2 overflow-x-auto')
  expect(source).not.toContain('<details className="group relative shrink-0">')
})

test('uses entity names instead of raw subject symbols in subject filters', async () => {
  const source = await readFile(readerToolbarPath, 'utf8')

  expect(source).toContain("import { useEntityLabel } from '../EntityLabelContext'")
  expect(source).toContain("useEntityLabel(facet.key === 'subject' ? value : null)")
  expect(source).toContain("useEntityLabel(facet.key === 'subject' ? option : null)")
  expect(source).toContain('const label = entity?.title ?? compactValue(option)')
})

test('aligns page-scoped controls with the Reader content column', async () => {
  const source = await readFile(readerToolbarPath, 'utf8')

  expect(source).toContain('mx-auto flex w-full max-w-[96rem] min-w-0 flex-wrap items-center gap-2')
})

test('closes an open facet when a pointer event lands outside the toolbar', async () => {
  const source = await readFile(readerToolbarPath, 'utf8')

  expect(source).toContain('const toolbarRef = useRef<HTMLElement>(null)')
  expect(source).toContain(
    "document.addEventListener('pointerdown', closeFacetOnOutsidePointerDown, true)",
  )
  expect(source).toContain(
    "document.removeEventListener('pointerdown', closeFacetOnOutsidePointerDown, true)",
  )
  expect(source).toContain('ref={toolbarRef}')
})
