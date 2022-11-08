import { describe, it } from 'vitest'
import type { HeadTag } from '@unhead/schema'
import { createHead, getActiveHead, useHead } from 'unhead'
import { renderDOMHead } from '@unhead/dom'
import { useDom } from '../../fixtures'

describe('dom order', () => {
  it('renders in registered order', async () => {
    let firstTagRendered: HeadTag | null = null
    createHead({
      hooks: {
        'dom:renderTag': (ctx) => {
          firstTagRendered = firstTagRendered || ctx.tag
        },
      },
    })

    useHead({
      htmlAttrs: {
        class: 'no-js',
      },
      script: [{ children: 'document.documentElement.classList.remove("no-js")' }],
    })

    const head = getActiveHead()

    const dom = useDom()

    await renderDOMHead(head, { document: dom.window.document })

    expect(firstTagRendered).toMatchInlineSnapshot(`
      {
        "_d": "htmlAttrs",
        "_e": 0,
        "_p": 0,
        "props": {
          "class": "no-js",
        },
        "tag": "htmlAttrs",
      }
    `)
  })
})
