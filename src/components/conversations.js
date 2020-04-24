/* eslint-disable import/no-webpack-loader-syntax, import/no-unresolved */
import personIcon from '!raw-loader!../images/person.svg'
import hashIcon from '!raw-loader!../images/hash.svg'
import lockIcon from '!raw-loader!../images/lock.svg'
import multiIcon from '!raw-loader!../images/multi.svg'
/* eslint-enable import/no-webpack-loader-syntax, import/no-unresolved */
import 'accessible-autocomplete/dist/accessible-autocomplete.min.css'
import { h, Component } from 'preact'
import cx from 'classnames'
import groupConversation from '../lib/group-conversation'
import AccessibleAutocomplete from 'accessible-autocomplete/preact'
import styles from './conversations.css'

const USE_AUTOCOMPLETE_ON_CONVERSATIONS_OVER = 20

const conversationTypes = {
  PRIVATE: 'private',
  IM: 'im',
  MPIM: 'mpim',
  CHANNEL: 'channel'
}

const conversationType = (c) => {
  if (groupConversation.public(c)) return conversationTypes.CHANNEL
  if (groupConversation.private(c)) return conversationTypes.PRIVATE
  if (groupConversation.im(c)) return conversationTypes.IM
  if (groupConversation.mpim(c)) return conversationTypes.MPIM
  console.error(`Could not group conversation ${JSON.stringify(c)}`)
  return conversationTypes.CHANNEL
}

const conversationName = (c) => (c && c.display_name) || ''
const conversationCount = (c) =>
  conversationType(c) === conversationTypes.MPIM
    ? (conversationName(c).match(/\s/g) || []).length + 1
    : 0

const conversationDisplay = (conversation) => {
  if (!conversation) return ''
  if (typeof conversation === 'string') return conversation

  const type = conversationType(conversation)
  const count = conversationCount(conversation)
  const name = conversationName(conversation) + (count ? ` (${count})` : '')
  const { className, icon } = {
    [conversationTypes.CHANNEL]: {
      className: styles.conversationChannel,
      icon: hashIcon
    },
    [conversationTypes.PRIVATE]: {
      className: styles.conversationPrivate,
      icon: lockIcon
    },
    [conversationTypes.IM]: {
      className: styles.conversationIm,
      icon: personIcon
    },
    [conversationTypes.MPIM]: {
      className: styles.conversationMpim,
      icon: multiIcon
    }
  }[type]

  return `<span class="${cx(styles.conversation, className)}">
    <span class="${cx(styles.conversationIcon)}">${icon}</span>
    <span class="${cx(styles.conversationName)}">${name}</span>
  </span>`
}

const conversationPlainText = (conversation) => {
  if (!conversation) return ''
  const prefix =
    {
      [conversationTypes.CHANNEL]: '#',
      [conversationTypes.PRIVATE]: '🔒 ',
      [conversationTypes.IM]: '👤 ',
      [conversationTypes.MPIM]: `👥 `
    }[conversationType(conversation)] || ''
  const count = conversationCount(conversation)
  const suffix = count ? ` (${conversationCount(conversation)})` : ''

  return `${prefix}${conversationName(conversation)}${suffix}`
}

const Option = ({ conversation, selected }) => (
  <option
    key={conversation.id}
    value={conversation.id}
    selected={conversation.id === selected}
  >
    {conversationPlainText(conversation)}
  </option>
)

const Optgroup = ({ conversations, name, ...props }) => (
  <optgroup
    label={
      {
        channels: 'Channels',
        people: 'Direct Messages'
      }[name]
    }
  >
    {conversations.map((c) => (
      <Option key={c.id} conversation={c} {...props} />
    ))}
  </optgroup>
)

class Autocomplete extends Component {
  constructor(props) {
    super(props)
    this.state = {
      initialSelected: props.selected
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.initialSelected && nextProps.selected) {
      this.setState({ initialSelected: nextProps.selected })
    }
  }

  getSource = (query, populate) => {
    const { conversations } = this.props
    const { initialSelected } = this.state

    // display_name is already lowercase
    query = query.toLowerCase()

    const [filtered, other] = conversations.reduce(
      (acc, c) => {
        acc[conversationName(c).includes(query) ? 0 : 1].push(c)
        return acc
      },
      [[], []]
    )

    // If the query matches exactly and it matches the initially selected item
    // then display all the items (with the mathced one first). This helps signal
    // that the input is an autocomplete. Without this then on first click it would
    // only show the one default item
    const exact =
      filtered.length === 1 &&
      conversationName(filtered[0]) === query &&
      filtered[0].id === initialSelected

    populate(exact ? [...filtered, ...other] : filtered)
  }

  render({ conversations, onChange, selected, templates }) {
    const selectedConversation = conversations.find((c) => c.id === selected)
    return (
      <div class={cx(styles.autocomplete, styles.input)}>
        <AccessibleAutocomplete
          id="autocomplete"
          autoselect={true}
          showAllValues={true}
          confirmOnBlur={true}
          dropdownArrow={() => ''}
          onConfirm={(c) => onChange(c ? c.id : null)}
          defaultValue={templates.inputValue(selectedConversation)}
          source={this.getSource}
          templates={templates}
        />
      </div>
    )
  }
}

const Select = ({ onChange, groups, selected }) => (
  <select
    class={cx(styles.select, styles.input)}
    onChange={(e) => onChange(e.target.value)}
  >
    {groups.length === 1
      ? groups[0].list.map((c) => (
          <Option key={c.id} conversation={c} selected={selected} />
        ))
      : groups.map((group) => (
          <Optgroup
            key={group.name}
            name={group.name}
            conversations={group.list}
            selected={selected}
          />
        ))}
  </select>
)

export default ({ onChange, selected, fetching, error, conversations }) => {
  const hasConversations = conversations && conversations.all.length
  const noSelect = error || fetching || !hasConversations
  const autocomplete =
    hasConversations &&
    conversations.all.length > USE_AUTOCOMPLETE_ON_CONVERSATIONS_OVER
  const select = hasConversations && !autocomplete

  return (
    <div
      class={cx(styles.container, styles.slackBackground, {
        [styles.noSelect]: noSelect,
        [styles.error]: error,
        [styles.fetching]: fetching,
        [styles.empty]: !error && !fetching && !hasConversations,
        // Put the dropdown caret on autocompletes too since we use showAllValues
        [styles.hasSelect]: select || autocomplete
      })}
    >
      {noSelect ? (
        error ? (
          'Error loading conversations'
        ) : fetching ? (
          'Loading conversations'
        ) : !hasConversations ? (
          'No conversations'
        ) : (
          ''
        )
      ) : autocomplete ? (
        <Autocomplete
          conversations={conversations.all}
          onChange={onChange}
          selected={selected}
          // This needs to guard against undefined and always return a string
          // to not error when used with accessible-autocomplete's templates
          templates={{
            suggestion: (c) => conversationDisplay(c),
            inputValue: (c) => conversationName(c)
          }}
        />
      ) : select ? (
        <Select
          selected={selected}
          groups={conversations.groups}
          onChange={onChange}
        />
      ) : null}
    </div>
  )
}
