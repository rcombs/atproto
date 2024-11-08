/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from '@atproto/lexicon'
import { CID } from 'multiformats/cid'
import { $Type, $Typed, is$typed, OmitKey } from '../../../../util'
import { lexicons } from '../../../../lexicons'

export const id = 'com.atproto.label.defs'

/** Metadata tag on an atproto resource (eg, repo or record). */
export interface Label {
  $type?: 'com.atproto.label.defs#label'
  /** The AT Protocol version of the label object. */
  ver?: number
  /** DID of the actor who created this label. */
  src: string
  /** AT URI of the record, repository (account), or other resource that this label applies to. */
  uri: string
  /** Optionally, CID specifying the specific version of 'uri' resource this label applies to. */
  cid?: string
  /** The short string name of the value or type of this label. */
  val: string
  /** If true, this is a negation label, overwriting a previous label. */
  neg?: boolean
  /** Timestamp when this label was created. */
  cts: string
  /** Timestamp at which this label expires (no longer applies). */
  exp?: string
  /** Signature of dag-cbor encoded label. */
  sig?: Uint8Array
}

export function isLabel(v: unknown): v is $Typed<Label> {
  return is$typed(v, id, 'label')
}

export function validateLabel(v: unknown) {
  return lexicons.validate(`${id}#label`, v) as ValidationResult<Label>
}

/** Metadata tags on an atproto record, published by the author within the record. */
export interface SelfLabels {
  $type?: 'com.atproto.label.defs#selfLabels'
  values: SelfLabel[]
}

export function isSelfLabels(v: unknown): v is $Typed<SelfLabels> {
  return is$typed(v, id, 'selfLabels')
}

export function validateSelfLabels(v: unknown) {
  return lexicons.validate(
    `${id}#selfLabels`,
    v,
  ) as ValidationResult<SelfLabels>
}

/** Metadata tag on an atproto record, published by the author within the record. Note that schemas should use #selfLabels, not #selfLabel. */
export interface SelfLabel {
  $type?: 'com.atproto.label.defs#selfLabel'
  /** The short string name of the value or type of this label. */
  val: string
}

export function isSelfLabel(v: unknown): v is $Typed<SelfLabel> {
  return is$typed(v, id, 'selfLabel')
}

export function validateSelfLabel(v: unknown) {
  return lexicons.validate(`${id}#selfLabel`, v) as ValidationResult<SelfLabel>
}

/** Declares a label value and its expected interpretations and behaviors. */
export interface LabelValueDefinition {
  $type?: 'com.atproto.label.defs#labelValueDefinition'
  /** The value of the label being defined. Must only include lowercase ascii and the '-' character ([a-z-]+). */
  identifier: string
  /** How should a client visually convey this label? 'inform' means neutral and informational; 'alert' means negative and warning; 'none' means show nothing. */
  severity: 'inform' | 'alert' | 'none' | (string & {})
  /** What should this label hide in the UI, if applied? 'content' hides all of the target; 'media' hides the images/video/audio; 'none' hides nothing. */
  blurs: 'content' | 'media' | 'none' | (string & {})
  /** The default setting for this label. */
  defaultSetting: 'ignore' | 'warn' | 'hide' | (string & {})
  /** Does the user need to have adult content enabled in order to configure this label? */
  adultOnly?: boolean
  locales: LabelValueDefinitionStrings[]
}

export function isLabelValueDefinition(
  v: unknown,
): v is $Typed<LabelValueDefinition> {
  return is$typed(v, id, 'labelValueDefinition')
}

export function validateLabelValueDefinition(v: unknown) {
  return lexicons.validate(
    `${id}#labelValueDefinition`,
    v,
  ) as ValidationResult<LabelValueDefinition>
}

/** Strings which describe the label in the UI, localized into a specific language. */
export interface LabelValueDefinitionStrings {
  $type?: 'com.atproto.label.defs#labelValueDefinitionStrings'
  /** The code of the language these strings are written in. */
  lang: string
  /** A short human-readable name for the label. */
  name: string
  /** A longer description of what the label means and why it might be applied. */
  description: string
}

export function isLabelValueDefinitionStrings(
  v: unknown,
): v is $Typed<LabelValueDefinitionStrings> {
  return is$typed(v, id, 'labelValueDefinitionStrings')
}

export function validateLabelValueDefinitionStrings(v: unknown) {
  return lexicons.validate(
    `${id}#labelValueDefinitionStrings`,
    v,
  ) as ValidationResult<LabelValueDefinitionStrings>
}

export type LabelValue =
  | '!hide'
  | '!no-promote'
  | '!warn'
  | '!no-unauthenticated'
  | 'dmca-violation'
  | 'doxxing'
  | 'porn'
  | 'sexual'
  | 'nudity'
  | 'nsfl'
  | 'gore'
  | (string & {})
