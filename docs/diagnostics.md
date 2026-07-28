# Diagnostics

Navor diagnostics expose a stable code alongside human-readable text. Use the code in issue reports, automated checks, documentation, and editor integrations. Text may become clearer over time without changing the code.

| Code | Family | Meaning |
| --- | --- | --- |
| `NAV001` | parser | A top-level directive line is malformed. |
| `NAV002` | parser | A posting line is malformed. |
| `NAV003` | parser | An indented line does not belong to a directive. |
| `NAV004` | parser | A body line is missing its two-space indentation. |
| `NAV005` | parser | A Markdown body is missing its closing `  ---` delimiter. |
| `NAV006` | parser | The directive name is not part of the Navor language. |
| `NAV010` | workspace | `navor.config.json` could not be read. |
| `NAV100` | semantics | A source fact violates a reference or transaction rule. |
| `NAV200` | allocation | An allocation relationship or target is inconsistent. |
| `NAV300` | portfolio | A transaction cannot be applied safely to derived holdings. |
| `NAV400` | plan | A plan range is internally inconsistent. |
| `NAV500` | knowledge | A research or thesis review condition needs attention. |
| `NAV900` | fallback | A diagnostic has not yet been assigned a more specific family. |

`nav check` prints the code before the message. The Reader shows the same code next to the diagnostic, so a repository can be discussed consistently across command line, UI, and editor workflows.
