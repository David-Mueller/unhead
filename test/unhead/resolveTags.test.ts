import { describe, it } from 'vitest'
import { createHead } from 'unhead'
import { basicSchema } from '../fixtures'

describe('resolveTags', () => {
  it('basic resolve tags', async () => {
    const head = createHead()

    head.push(basicSchema)

    const tags = await head.resolveTags()
    expect(tags.length).toBe(5)
    expect(tags).toMatchInlineSnapshot(`
      [
        {
          "_d": "charset",
          "_e": 0,
          "_p": 3,
          "props": {
            "charset": "utf-8",
          },
          "tag": "meta",
        },
        {
          "_d": "htmlAttrs",
          "_e": 0,
          "_p": 0,
          "props": {
            "dir": "ltr",
            "lang": "en",
          },
          "tag": "htmlAttrs",
        },
        {
          "_d": "bodyAttrs",
          "_e": 0,
          "_p": 1,
          "props": {
            "class": "dark",
          },
          "tag": "bodyAttrs",
        },
        {
          "_e": 0,
          "_p": 2,
          "props": {
            "src": "https://cdn.example.com/script.js",
          },
          "tag": "script",
        },
        {
          "_e": 0,
          "_p": 4,
          "props": {
            "href": "https://cdn.example.com/favicon.ico",
            "rel": "icon",
            "type": "image/x-icon",
          },
          "tag": "link",
        },
      ]
    `)
    expect(tags).toMatchInlineSnapshot(`
      [
        {
          "_d": "charset",
          "_e": 0,
          "_p": 3,
          "props": {
            "charset": "utf-8",
          },
          "tag": "meta",
        },
        {
          "_d": "htmlAttrs",
          "_e": 0,
          "_p": 0,
          "props": {
            "dir": "ltr",
            "lang": "en",
          },
          "tag": "htmlAttrs",
        },
        {
          "_d": "bodyAttrs",
          "_e": 0,
          "_p": 1,
          "props": {
            "class": "dark",
          },
          "tag": "bodyAttrs",
        },
        {
          "_e": 0,
          "_p": 2,
          "props": {
            "src": "https://cdn.example.com/script.js",
          },
          "tag": "script",
        },
        {
          "_e": 0,
          "_p": 4,
          "props": {
            "href": "https://cdn.example.com/favicon.ico",
            "rel": "icon",
            "type": "image/x-icon",
          },
          "tag": "link",
        },
      ]
    `, 'old')
  })

  it('basic /w removal', async () => {
    const head = createHead()

    const firstEntry = head.push(basicSchema)

    head.push({
      script: [
        {
          src: 'https://cdn.example.com/script2.js',
        },
      ],
    })

    await firstEntry.dispose()

    const tags = await head.resolveTags()
    expect(tags.length).toBe(1)
    expect(tags).toMatchInlineSnapshot(`
      [
        {
          "_e": 1,
          "_p": 256,
          "props": {
            "src": "https://cdn.example.com/script2.js",
          },
          "tag": "script",
        },
      ]
    `)
  })

  it('basic /w update', async () => {
    const head = createHead()

    const firstEntry = head.push(basicSchema)

    await firstEntry.patch({
      ...basicSchema,
      script: [
        {
          src: 'https://cdn.example.com/script2.js',
        },
      ],
    })

    const tags = await head.resolveTags()
    expect(tags.length).toBe(5)
    expect(tags).toMatchInlineSnapshot(`
      [
        {
          "_d": "charset",
          "_e": 0,
          "_p": 3,
          "props": {
            "charset": "utf-8",
          },
          "tag": "meta",
        },
        {
          "_d": "htmlAttrs",
          "_e": 0,
          "_p": 0,
          "props": {
            "dir": "ltr",
            "lang": "en",
          },
          "tag": "htmlAttrs",
        },
        {
          "_d": "bodyAttrs",
          "_e": 0,
          "_p": 1,
          "props": {
            "class": "dark",
          },
          "tag": "bodyAttrs",
        },
        {
          "_e": 0,
          "_p": 2,
          "props": {
            "src": "https://cdn.example.com/script2.js",
          },
          "tag": "script",
        },
        {
          "_e": 0,
          "_p": 4,
          "props": {
            "href": "https://cdn.example.com/favicon.ico",
            "rel": "icon",
            "type": "image/x-icon",
          },
          "tag": "link",
        },
      ]
    `)
  })

  it('class array merge support', async () => {
    const head = createHead()

    head.push({
      htmlAttrs: {
        class: ['foo', 'bar'],
      },
      bodyAttrs: {
        class: ['foo2', 'bar2'],
      },
    })

    head.push({
      htmlAttrs: {
        class: ['something-new'],
      },
      bodyAttrs: {
        class: 'something-new2',
      },
    })

    const tags = await head.resolveTags()
    expect(tags).toMatchInlineSnapshot(`
      [
        {
          "_d": "htmlAttrs",
          "_e": 0,
          "_p": 0,
          "props": {
            "class": "foo bar something-new",
          },
          "tag": "htmlAttrs",
        },
        {
          "_d": "bodyAttrs",
          "_e": 0,
          "_p": 1,
          "props": {
            "class": "foo2 bar2 something-new2",
          },
          "tag": "bodyAttrs",
        },
      ]
    `)
  })

  it('class object merge support', async () => {
    const head = createHead()

    head.push({
      htmlAttrs: {
        class: {
          foo: true,
          bar: false,
        },
      },
    })

    head.push({
      htmlAttrs: {
        class: {
          bar: true,
        },
      },
    })

    const tags = await head.resolveTags()
    expect(tags).toMatchInlineSnapshot(`
      [
        {
          "_d": "htmlAttrs",
          "_e": 0,
          "_p": 0,
          "props": {
            "class": "foo bar",
          },
          "tag": "htmlAttrs",
        },
      ]
    `)
  })
})
