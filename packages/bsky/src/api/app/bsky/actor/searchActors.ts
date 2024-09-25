import { mapDefined } from '@atproto/common'

import AppContext from '../../../../context.js'
import { parseString } from '../../../../hydration/util.js'
import { Server } from '../../../../lexicon/index.js'
import {
  OutputSchema,
  QueryParams,
} from '../../../../lexicon/types/app/bsky/actor/searchActors.js'
import {
  HydrationFn,
  PresentationFn,
  RulesFn,
  SkeletonFn,
} from '../../../../pipeline.js'

type Skeleton = {
  dids: string[]
  hitsTotal?: number
  cursor?: string
}

export default function (server: Server, ctx: AppContext) {
  const searchActors = ctx.createPipeline(
    skeleton,
    hydration,
    noBlocks,
    presentation,
  )

  server.app.bsky.actor.searchActors({
    auth: ctx.authVerifier.standardOptional,
    handler: async ({ auth, params, req }) => {
      const { viewer, includeTakedowns } = ctx.authVerifier.parseCreds(auth)
      const labelers = ctx.reqLabelers(req)

      return searchActors({ viewer, labelers, includeTakedowns }, params)
    },
  })
}

const skeleton: SkeletonFn<Skeleton, QueryParams> = async ({ ctx, params }) => {
  const term = params.q ?? params.term ?? ''

  // @TODO
  // add hits total

  if (ctx.searchAgent) {
    // @NOTE cursors won't change on appview swap
    const { data: res } =
      await ctx.searchAgent.app.bsky.unspecced.searchActorsSkeleton({
        q: term,
        cursor: params.cursor,
        limit: params.limit,
        viewer: ctx.hydrateCtx.viewer ?? undefined,
      })
    return {
      dids: res.actors.map(({ did }) => did),
      cursor: parseString(res.cursor),
    }
  }

  const res = await ctx.dataplane.searchActors({
    term,
    limit: params.limit,
    cursor: params.cursor,
  })
  return {
    dids: res.dids,
    cursor: parseString(res.cursor),
  }
}

const hydration: HydrationFn<Skeleton, QueryParams> = async ({
  ctx,
  skeleton,
}) => {
  return ctx.hydrator.hydrateProfiles(skeleton.dids, ctx.hydrateCtx)
}

const noBlocks: RulesFn<Skeleton, QueryParams> = ({
  ctx,
  skeleton,
  hydration,
}) => {
  skeleton.dids = skeleton.dids.filter(
    (did) => !ctx.views.viewerBlockExists(did, hydration),
  )
  return skeleton
}

const presentation: PresentationFn<Skeleton, QueryParams, OutputSchema> = ({
  ctx,
  skeleton,
  hydration,
}) => {
  const actors = mapDefined(skeleton.dids, (did) =>
    ctx.views.profile(did, hydration),
  )
  return {
    actors,
    cursor: skeleton.cursor,
  }
}
