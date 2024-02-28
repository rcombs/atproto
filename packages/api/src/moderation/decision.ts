import { AppBskyGraphDefs } from '../client/index'
import {
  BLOCK_BEHAVIOR,
  MUTE_BEHAVIOR,
  HIDE_BEHAVIOR,
  NOOP_BEHAVIOR,
  Label,
  LabelPreference,
  ModerationCause,
  ModerationOpts,
  LabelDefinition,
  LabelTarget,
  ModerationBehavior,
} from './types'
import { ModerationUI } from './ui'
import { LABELS } from './const/labels'

enum ModerationBehaviorSeverity {
  High,
  Medium,
  Low,
}

export class ModerationDecision {
  did = ''
  isMe = false
  causes: ModerationCause[] = []

  constructor() {}

  static merge(
    ...decisions: (ModerationDecision | undefined)[]
  ): ModerationDecision {
    const firmDecisions: ModerationDecision[] = decisions.filter(
      (v) => !!v,
    ) as ModerationDecision[]
    const decision = new ModerationDecision()
    if (firmDecisions[0]) {
      decision.did = firmDecisions[0].did
      decision.isMe = firmDecisions[0].isMe
    }
    decision.causes = firmDecisions.flatMap((d) => d.causes)
    return decision
  }

  get blocked() {
    return !!this.blockCause
  }

  get muted() {
    return !!this.muteCause
  }

  get blockCause() {
    return this.causes.find(
      (cause) =>
        cause.type === 'blocking' ||
        cause.type === 'blocked-by' ||
        cause.type === 'block-other',
    )
  }

  get muteCause() {
    return this.causes.find((cause) => cause.type === 'muted')
  }

  get labelCauses() {
    return this.causes.filter((cause) => cause.type === 'label')
  }

  ui(context: keyof ModerationBehavior): ModerationUI {
    const ui = new ModerationUI()
    if (this.isMe) {
      return ui
    }
    for (const cause of this.causes) {
      if (
        cause.type === 'blocking' ||
        cause.type === 'blocked-by' ||
        cause.type === 'block-other'
      ) {
        if (context === 'profileList' || context === 'contentList') {
          ui.filters.push(cause)
        }
        if (BLOCK_BEHAVIOR[context] === 'blur') {
          ui.noOverride = true
          ui.blurs.push(cause)
        } else if (BLOCK_BEHAVIOR[context] === 'alert') {
          ui.alerts.push(cause)
        } else if (BLOCK_BEHAVIOR[context] === 'inform') {
          ui.informs.push(cause)
        }
      } else if (cause.type === 'muted') {
        if (context === 'profileList' || context === 'contentList') {
          ui.filters.push(cause)
        }
        if (MUTE_BEHAVIOR[context] === 'blur') {
          ui.blurs.push(cause)
        } else if (MUTE_BEHAVIOR[context] === 'alert') {
          ui.alerts.push(cause)
        } else if (MUTE_BEHAVIOR[context] === 'inform') {
          ui.informs.push(cause)
        }
      } else if (cause.type === 'hidden') {
        if (context === 'profileList' || context === 'contentList') {
          ui.filters.push(cause)
        }
        if (HIDE_BEHAVIOR[context] === 'blur') {
          ui.blurs.push(cause)
        } else if (HIDE_BEHAVIOR[context] === 'alert') {
          ui.alerts.push(cause)
        } else if (HIDE_BEHAVIOR[context] === 'inform') {
          ui.informs.push(cause)
        }
      } else if (cause.type === 'label') {
        if (context === 'profileList' || context === 'contentList') {
          if (cause.setting === 'hide') {
            ui.filters.push(cause)
          }
        }
        if (cause.behavior[context] === 'blur') {
          ui.blurs.push(cause)
          if (cause.noOverride) {
            ui.noOverride = true
          }
        } else if (cause.behavior[context] === 'alert') {
          ui.alerts.push(cause)
        } else if (cause.behavior[context] === 'inform') {
          ui.informs.push(cause)
        }
      }
    }

    ui.filters.sort(sortByPriority)
    ui.blurs.sort(sortByPriority)

    return ui
  }

  setDid(did: string) {
    this.did = did
  }

  setIsMe(isMe: boolean) {
    this.isMe = isMe
  }

  addHidden(hidden: boolean) {
    if (hidden) {
      this.causes.push({
        type: 'hidden',
        source: { type: 'user' },
        priority: 6,
      })
    }
  }

  addBlocking(blocking: string | undefined) {
    if (blocking) {
      this.causes.push({
        type: 'blocking',
        source: { type: 'user' },
        priority: 3,
      })
    }
  }

  addBlockingByList(
    blockingByList: AppBskyGraphDefs.ListViewBasic | undefined,
  ) {
    if (blockingByList) {
      this.causes.push({
        type: 'blocking',
        source: { type: 'list', list: blockingByList },
        priority: 3,
      })
    }
  }

  addBlockedBy(blockedBy: boolean | undefined) {
    if (blockedBy) {
      this.causes.push({
        type: 'blocked-by',
        source: { type: 'user' },
        priority: 4,
      })
    }
  }

  addBlockOther(blockOther: boolean | undefined) {
    if (blockOther) {
      this.causes.push({
        type: 'block-other',
        source: { type: 'user' },
        priority: 4,
      })
    }
  }

  addLabel(target: LabelTarget, label: Label, opts: ModerationOpts) {
    // look up the label definition
    const labelDef = LABELS[label.val] as LabelDefinition
    if (!labelDef) {
      // ignore labels we don't understand
      return
    }

    // look up the label preference
    const isSelf = label.src === this.did
    const labeler = isSelf
      ? undefined
      : opts.mods.find((s) => s.did === label.src)

    if (!isSelf && !labeler) {
      return // skip labelers not configured by the user
    }
    if (isSelf && labelDef.flags.includes('no-self')) {
      return // skip self-labels that arent supported
    }

    // establish the label preference for interpretation
    let labelPref: LabelPreference = 'ignore'
    if (!labelDef.configurable) {
      labelPref = labelDef.defaultSetting || 'hide'
    } else if (labelDef.flags.includes('adult') && !opts.adultContentEnabled) {
      labelPref = 'hide'
    } else if (labeler?.labels[labelDef.identifier]) {
      labelPref = labeler?.labels[labelDef.identifier]
    } else if (opts.labels[labelDef.identifier]) {
      labelPref = opts.labels[labelDef.identifier]
    }

    // ignore labels the user has asked to ignore
    if (labelPref === 'ignore') {
      return
    }

    // ignore 'unauthed' labels when the user is authed
    if (labelDef.flags.includes('unauthed') && !!opts.userDid) {
      return
    }

    // establish the priority of the label
    let priority: 1 | 2 | 5 | 7 | 8
    const severity = measureModerationBehaviorSeverity(
      labelDef.behaviors[target],
    )
    if (
      labelDef.flags.includes('no-override') ||
      (labelDef.flags.includes('adult') && !opts.adultContentEnabled)
    ) {
      priority = 1
    } else if (labelPref === 'hide') {
      priority = 2
    } else if (severity === ModerationBehaviorSeverity.High) {
      // blurring profile view or content view
      priority = 5
    } else if (severity === ModerationBehaviorSeverity.Medium) {
      // blurring content list or content media
      priority = 7
    } else {
      // blurring avatar, adding alerts
      priority = 8
    }

    let noOverride = false
    if (labelDef.flags.includes('no-override')) {
      noOverride = true
    } else if (labelDef.flags.includes('adult') && !opts.adultContentEnabled) {
      noOverride = true
    }

    this.causes.push({
      type: 'label',
      source:
        isSelf || !labeler
          ? { type: 'user' }
          : { type: 'labeler', did: labeler.did },
      label,
      labelDef,
      setting: labelPref,
      behavior: labelDef.behaviors[target] || NOOP_BEHAVIOR,
      noOverride,
      priority,
    })
  }

  addMuted(muted: boolean | undefined) {
    if (muted) {
      this.causes.push({
        type: 'muted',
        source: { type: 'user' },
        priority: 6,
      })
    }
  }

  addMutedByList(mutedByList: AppBskyGraphDefs.ListViewBasic | undefined) {
    if (mutedByList) {
      this.causes.push({
        type: 'muted',
        source: { type: 'list', list: mutedByList },
        priority: 6,
      })
    }
  }
}

function measureModerationBehaviorSeverity(
  beh: ModerationBehavior | undefined,
): ModerationBehaviorSeverity {
  if (!beh) {
    return ModerationBehaviorSeverity.Low
  }
  if (beh.profileView === 'blur' || beh.contentView === 'blur') {
    return ModerationBehaviorSeverity.High
  }
  if (beh.contentList === 'blur' || beh.contentMedia === 'blur') {
    return ModerationBehaviorSeverity.Medium
  }
  return ModerationBehaviorSeverity.Low
}

function sortByPriority(a: ModerationCause, b: ModerationCause) {
  return a.priority - b.priority
}
