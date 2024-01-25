import { mapDefined } from '@atproto/common'
import { Server } from '../../../../lexicon'
import AppContext from '../../../../context'
import { parseString } from '../../../../hydration/util'
import { clearlyBadCursor } from '../../../util'

// THIS IS A TEMPORARY UNSPECCED ROUTE
// @TODO currently mirrors getSuggestedFeeds and ignores the "query" param.
// In the future may take into consideration popularity via likes w/ its own dataplane endpoint.
export default function (server: Server, ctx: AppContext) {
  server.app.bsky.unspecced.getPopularFeedGenerators({
    auth: ctx.authVerifier.standardOptional,
    handler: async ({ auth, params }) => {
      const viewer = auth.credentials.iss

      if (clearlyBadCursor(params.cursor)) {
        return {
          encoding: 'application/json',
          body: { feeds: [] },
        }
      }

      const suggestedRes = await ctx.dataplane.getSuggestedFeeds({
        actorDid: viewer ?? undefined,
        limit: params.limit,
        cursor: params.cursor,
      })
      const uris = suggestedRes.uris
      const hydration = await ctx.hydrator.hydrateFeedGens(uris, viewer)
      const feedViews = mapDefined(uris, (uri) =>
        ctx.views.feedGenerator(uri, hydration),
      )

      return {
        encoding: 'application/json',
        body: {
          feeds: feedViews,
          cursor: parseString(suggestedRes.cursor),
        },
      }
    },
  })
}
