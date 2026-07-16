# File format

## Extension

`.nav`

## Encoding

UTF-8. Use Unix line endings (`\n`) in new files. The formatter normalizes whitespace but does not change encoding.

## Naming

File names are not interpreted by the parser. Use descriptive paths for human navigation and Git review.

## Workspace root

Any directory passed to `nav serve`, `nav build`, or `nav format`. All `.nav` files under the root are loaded recursively.

## Ignored content

- Blank lines
- Lines whose first character is `;` (comments)

## Directive boundaries

A new directive starts at a `YYYY-MM-DD` line with no leading whitespace. Continuation lines are indented with two spaces.

## Formatting conventions

`nav format` and the VS Code extension:

- Two-space indent for metadata, postings, and bodies
- Blank line between directives
- Aligned posting columns

Formatting does not reorder directives or change numeric literals.

## Related

- [Files](../language/files.md)
- [nav format](../cli/format.md)
