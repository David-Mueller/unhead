import { defineHeadPlugin } from 'unhead'
import { resolveUnrefHeadInput } from './utils'

export const VueReactiveInputPlugin = () => {
  return defineHeadPlugin({
    hooks: {
      'entries:resolve': function (ctx) {
        for (const entry of ctx.entries)
          entry.input = resolveUnrefHeadInput(entry.input)
      },
    },
  })
}
