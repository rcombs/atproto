/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from '@atproto/lexicon'
import { CID } from 'multiformats/cid'
import { $Type, is$typed } from '../../../../util'
import { lexicons } from '../../../../lexicons'

export const id = 'tools.ozone.signature.defs'

export interface SigDetail {
  property: string
  value: string
  [k: string]: unknown
}

export function isSigDetail(v: unknown): v is SigDetail & {
  $type: $Type<'tools.ozone.signature.defs', 'sigDetail'>
} {
  return is$typed(v, id, 'sigDetail')
}

export function validateSigDetail(v: unknown) {
  return lexicons.validate(`${id}#sigDetail`, v) as ValidationResult<SigDetail>
}
