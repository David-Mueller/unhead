import type { ActiveHeadEntry } from '@unhead/schema'
import { ref, watchEffect } from 'vue'
import { unpackMeta } from '@unhead/shared'
import { resolveUnrefHeadInput } from '../utils'
import type { UseHeadOptions, UseSeoMetaInput } from '../types'
import { useHead } from './useHead'

export function useSeoMeta(input: UseSeoMetaInput, options?: UseHeadOptions): ActiveHeadEntry<any> | void {
  const headInput: any = ref({})
  watchEffect(() => {
    const resolvedMeta = resolveUnrefHeadInput(input)
    const { title, titleTemplate, ...meta } = resolvedMeta
    // need to unref data so we can unpack it properly
    headInput.value = {
      title,
      titleTemplate,
      meta: unpackMeta(meta),
    }
  })
  return useHead(headInput, options)
}
