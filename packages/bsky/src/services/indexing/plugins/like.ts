import { Selectable, sql } from 'kysely'
import { AtUri } from '@atproto/uri'
import { CID } from 'multiformats/cid'
import * as Like from '../../../lexicon/types/app/bsky/feed/like'
import * as lex from '../../../lexicon/lexicons'
import { DatabaseSchema, DatabaseSchemaType } from '../../../db/database-schema'
import RecordProcessor from '../processor'
import { toSimplifiedISOSafe } from '../util'
import Database from '../../../db'
import { BackgroundQueue } from '../../../background'

const lexId = lex.ids.AppBskyFeedLike
type IndexedLike = Selectable<DatabaseSchemaType['like']>

const insertFn = async (
  db: DatabaseSchema,
  uri: AtUri,
  cid: CID,
  obj: Like.Record,
  timestamp: string,
): Promise<IndexedLike | null> => {
  const inserted = await db
    .insertInto('like')
    .values({
      uri: uri.toString(),
      cid: cid.toString(),
      creator: uri.host,
      subject: obj.subject.uri,
      subjectCid: obj.subject.cid,
      createdAt: toSimplifiedISOSafe(obj.createdAt),
      indexedAt: timestamp,
    })
    .onConflict((oc) => oc.doNothing())
    .returningAll()
    .executeTakeFirst()
  return inserted || null
}

const findDuplicate = async (
  db: DatabaseSchema,
  uri: AtUri,
  obj: Like.Record,
): Promise<AtUri | null> => {
  const found = await db
    .selectFrom('like')
    .where('creator', '=', uri.host)
    .where('subject', '=', obj.subject.uri)
    .selectAll()
    .executeTakeFirst()
  return found ? new AtUri(found.uri) : null
}

const notifsForInsert = (obj: IndexedLike) => {
  const subjectUri = new AtUri(obj.subject)
  return [
    {
      did: subjectUri.host,
      author: obj.creator,
      recordUri: obj.uri,
      recordCid: obj.cid,
      reason: 'like' as const,
      reasonSubject: subjectUri.toString(),
      sortAt: obj.indexedAt,
    },
  ]
}

const deleteFn = async (
  db: DatabaseSchema,
  uri: AtUri,
): Promise<IndexedLike | null> => {
  const deleted = await db
    .deleteFrom('like')
    .where('uri', '=', uri.toString())
    .returningAll()
    .executeTakeFirst()
  return deleted || null
}

const notifsForDelete = (
  deleted: IndexedLike,
  replacedBy: IndexedLike | null,
) => {
  const toDelete = replacedBy ? [] : [deleted.uri]
  return { notifs: [], toDelete }
}

const afterInsert = async (db: DatabaseSchema, inserted: IndexedLike) => {
  const { ref } = db.dynamic
  await db
    .insertInto('post_agg')
    .values({
      uri: inserted.subject,
      likeCount: 1,
    })
    .onConflict((oc) =>
      oc
        .column('uri')
        .doUpdateSet({ likeCount: sql`${ref('post_agg.likeCount')} + 1` }),
    )
    .execute()
}

// posts are never replaced by another post
const afterDelete = async (
  db: DatabaseSchema,
  deleted: IndexedLike,
  replacedBy: IndexedLike | null,
) => {
  const { ref } = db.dynamic
  if (replacedBy) {
    return
  }
  await db
    .updateTable('post_agg')
    .set({
      likeCount: sql`${ref('post_agg.likeCount')} - 1`,
    })
    .where('uri', '=', deleted.subject)
    .execute()
}

export type PluginType = RecordProcessor<Like.Record, IndexedLike>

export const makePlugin = (
  db: Database,
  backgroundQueue: BackgroundQueue,
): PluginType => {
  return new RecordProcessor(db, backgroundQueue, {
    lexId,
    insertFn,
    findDuplicate,
    deleteFn,
    notifsForInsert,
    notifsForDelete,
    afterInsert,
    afterDelete,
  })
}

export default makePlugin
