export function isPaletteShortcut(
  event: Pick<KeyboardEvent, 'key' | 'metaKey' | 'ctrlKey' | 'altKey' | 'shiftKey'>,
) {
  return (
    !event.altKey &&
    !event.shiftKey &&
    (event.metaKey || event.ctrlKey) &&
    event.key.toLowerCase() === 'k'
  )
}

export function isSearchShortcut(
  event: Pick<KeyboardEvent, 'key' | 'metaKey' | 'ctrlKey' | 'altKey' | 'shiftKey'>,
  isEditing: boolean,
) {
  return (
    event.key === '/' &&
    !event.altKey &&
    !event.shiftKey &&
    (event.metaKey || event.ctrlKey || !isEditing)
  )
}
