/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from '@atproto/lexicon'
import { CID } from 'multiformats/cid'
import { $Type, $Typed, is$typed, OmitKey } from '../../../../util'
import { lexicons } from '../../../../lexicons'

export const id = 'tools.ozone.setting.defs'

export interface Option {
  $type?: 'tools.ozone.setting.defs#option'
  key: string
  did: string
  value: { [_ in string]: unknown }
  description?: string
  createdAt?: string
  updatedAt?: string
  managerRole?:
    | 'tools.ozone.team.defs#roleModerator'
    | 'tools.ozone.team.defs#roleTriage'
    | 'tools.ozone.team.defs#roleAdmin'
    | (string & {})
  scope: 'instance' | 'personal' | (string & {})
  createdBy: string
  lastUpdatedBy: string
}

export function isOption(v: unknown): v is $Typed<Option> {
  return is$typed(v, id, 'option')
}

export function validateOption(v: unknown) {
  return lexicons.validate(`${id}#option`, v) as ValidationResult<Option>
}
