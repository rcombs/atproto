/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from '@atproto/lexicon'
import { CID } from 'multiformats/cid'
import { $Type, $Typed, is$typed, OmitKey } from '../../../../util'
import { lexicons } from '../../../../lexicons'

export const id = 'chat.bsky.actor.declaration'

export interface Record {
  $type?: 'chat.bsky.actor.declaration' | 'chat.bsky.actor.declaration#main'
  allowIncoming: 'all' | 'none' | 'following' | (string & {})
  [k: string]: unknown
}

export function isRecord(v: unknown): v is $Typed<Record> {
  return is$typed(v, id, 'main')
}

export function validateRecord(v: unknown) {
  return lexicons.validate(`${id}#main`, v) as ValidationResult<Record>
}
