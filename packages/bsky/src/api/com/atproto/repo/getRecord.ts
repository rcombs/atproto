import { InvalidRequestError } from '@atproto/xrpc-server'
import { AtUri } from '@atproto/syntax'
import { Server } from '../../../../lexicon'
import AppContext from '../../../../context'

export default function (server: Server, ctx: AppContext) {
  server.com.atproto.repo.getRecord({
    auth: ctx.authVerifier.optionalStandardOrRole,
    handler: async ({ req, auth, params }) => {
      const { repo, collection, rkey, cid } = params
      const { viewer, includeTakedowns } = ctx.authVerifier.parseCreds(auth)
      const labelers = ctx.reqLabelers(req)

      const { hydrator } = await ctx.createRequestContent({
        viewer,
        labelers,
      })

      const [did] = await hydrator.actor.getDids([repo])
      if (!did) {
        throw new InvalidRequestError(`Could not find repo: ${repo}`)
      }

      const actors = await hydrator.actor.getActors([did], includeTakedowns)
      if (!actors.get(did)) {
        throw new InvalidRequestError(`Could not find repo: ${repo}`)
      }

      const uri = AtUri.make(did, collection, rkey).toString()
      const result = await hydrator.getRecord(uri, includeTakedowns)

      if (!result || (cid && result.cid !== cid)) {
        throw new InvalidRequestError(`Could not locate record: ${uri}`)
      }

      return {
        encoding: 'application/json' as const,
        body: {
          uri: uri,
          cid: result.cid,
          value: result.record,
        },
      }
    },
  })
}
