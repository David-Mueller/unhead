import type { Head, HeadEntry, HeadTag } from '@unhead/schema'
import { TagConfigKeys, ValidHeadTags, asArray } from '..'

export async function normaliseTag<T extends HeadTag>(tagName: T['tag'], input: any): Promise<T | T[]> {
  const tag = { tag: tagName, props: {} } as T
  if (tagName === 'title' || tagName === 'titleTemplate') {
    tag.children = input instanceof Promise ? await input : input
    return tag
  }

  tag.props = await normaliseProps({ ...input })

  ;(['children', 'innerHtml', 'innerHTML'])
    .forEach((key: string) => {
      if (typeof tag.props[key] !== 'undefined') {
        tag.children = tag.props[key]
        // support objects as children
        if (typeof tag.children === 'object')
          tag.children = JSON.stringify(tag.children)

        delete tag.props[key]
      }
    })

  Object.keys(tag.props)
    .filter(k => TagConfigKeys.includes(k))
    .forEach((k) => {
      // @ts-expect-error untyped
      tag[k] = tag.props[k]
      delete tag.props[k]
    })

  if (tag.props.class) {
    tag.props.class = normaliseClassProp(tag.props.class)
  }

  // allow meta to be resolved into multiple tags if an array is provided on content
  if (tag.props.content && Array.isArray(tag.props.content))
    return tag.props.content.map(v => ({ ...tag, props: { ...tag.props, content: v } } as T))

  return tag
}

export function normaliseClassProp(v: Record<string, string | Array<string>> | Array<string> | string) {
  if (typeof v === 'object' && !Array.isArray(v)) {
    v = Object.keys(v)
      .filter(k => v[k])
  }
  // finally, check we don't have spaces, we may need to split again
  return (Array.isArray(v) ? v.join(' ') : v)
    .split(' ')
    .filter(c => c.trim())
    .filter(Boolean)
    .join(' ')
}

export async function normaliseProps<T extends HeadTag['props']>(props: T): Promise<T> {
  // handle boolean props, see https://html.spec.whatwg.org/#boolean-attributes
  for (const k of Object.keys(props)) {
    // data keys get special treatment, we opt for more verbose syntax
    const isDataKey = k.startsWith('data-')
    // first resolve any promises
    if (props[k] instanceof Promise) {
      // @ts-expect-error untyped
      props[k] = await props[k]
    }
    if (String(props[k]) === 'true') {
      // @ts-expect-error untyped
      props[k] = isDataKey? 'true' : ''
    }
    else if (String(props[k]) === 'false') {
      if (isDataKey) {
        // @ts-expect-error untyped
        props[k] = 'false'
      } else {
        delete props[k]
      }
    }
  }
  return props
}

// support 1024 tag ids per entry (includes updates)
export const TagEntityBits = 10

export async function normaliseEntryTags<T extends {} = Head>(e: HeadEntry<T>): Promise<HeadTag[]> {
  const tagPromises: Promise<HeadTag | HeadTag[]>[] = []
  Object.entries(e.resolvedInput || e.input)
    .filter(([k, v]) => typeof v !== 'undefined' && ValidHeadTags.includes(k))
    .forEach(([k, value]) => {
      const v = asArray(value)
      tagPromises.push(...v.map(props => normaliseTag(k as keyof Head, props)).flat())
    })
  return (await Promise.all(tagPromises))
    .flat()
    .map((t: HeadTag, i) => {
      t._e = e._i
      t._p = (e._i << TagEntityBits) + i
      return t
    }) as unknown as HeadTag[]
}
