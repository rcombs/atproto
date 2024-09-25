import { mapDefined } from '@atproto/common'
import { InvalidRequestError } from '@atproto/xrpc-server'
import AppContext from '../../../../context.js'
import { Server } from '../../../../lexicon/index.js'
import {
  OutputSchema,
  QueryParams,
} from '../../../../lexicon/types/app/bsky/graph/getMutes.js'
import {
  HydrationFn,
  PresentationFn,
  SkeletonFn,
  noRules,
} from '../../../../pipeline.js'
import { clearlyBadCursor } from '../../../util.js'

type Skeleton = {
  mutedDids: string[]
  cursor?: string
}

export default function (server: Server, ctx: AppContext) {
  const getMutes = ctx.createPipeline(
    skeleton,
    hydration,
    noRules,
    presentation,
  )

  server.app.bsky.graph.getMutes({
    auth: ctx.authVerifier.standard,
    handler: async ({ params, auth, req }) => {
      const viewer = auth.credentials.iss
      const labelers = ctx.reqLabelers(req)

      return getMutes({ labelers, viewer }, params)
    },
  })
}

const skeleton: SkeletonFn<Skeleton, QueryParams> = async ({ ctx, params }) => {
  if (clearlyBadCursor(params.cursor)) {
    return { mutedDids: [] }
  }

  const actorDid = ctx.hydrateCtx.viewer
  if (!actorDid) throw new InvalidRequestError('An actor is required')

  const { dids, cursor } = await ctx.hydrator.dataplane.getMutes({
    actorDid,
    cursor: params.cursor,
    limit: params.limit,
  })
  return {
    mutedDids: dids,
    cursor: cursor || undefined,
  }
}

const hydration: HydrationFn<Skeleton, QueryParams> = async ({
  ctx,
  skeleton,
}) => {
  return ctx.hydrator.hydrateProfiles(skeleton.mutedDids, ctx.hydrateCtx)
}

const presentation: PresentationFn<Skeleton, QueryParams, OutputSchema> = ({
  ctx,
  skeleton,
  hydration,
}) => {
  const { mutedDids, cursor } = skeleton
  const mutes = mapDefined(mutedDids, (did) => {
    return ctx.views.profile(did, hydration)
  })
  return { mutes, cursor }
}
