// @ts-check
import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
// Something
import PropTypes from 'prop-types';

import { Channel } from 'stream-chat';
import { smartRender } from '../../utils';
import { ChannelContext, TranslationContext } from '../../context';
import { Message } from '../Message';
import { MessageList } from '../MessageList';
import {
  MessageInput as DefaultMessageInput,
  MessageInputSmall,
} from '../MessageInput';

/**
 * Thread - The Thread renders a parent message with a list of replies. Use the standard message list of the main channel's messages.
 * The thread is only used for the list of replies to a message.
 * Underlying MessageList, MessageInput and Message components can be customized using props:
 * - additionalParentMessageProps
 * - additionalMessageListProps
 * - additionalMessageInputProps
 *
 * @example ../../docs/Thread.md
 * @typedef { import('types').ThreadProps } Props
 * @type {React.FC<Props>}
 */
const Thread = (props) => {
  const { channel: propsChannel, thread: propsThread } = props;
  const { channel: channelChannel, thread: channelThread } = useContext(
    ChannelContext,
  );
  const channel = propsChannel || channelChannel;
  const thread = propsThread || channelThread;
  if (!thread) {
    return null;
  }
  const parentID = thread.id;
  const cid = channel && channel.cid;

  const key = `thread-${parentID}-${cid}`;
  // We use a wrapper to make sure the key variable is set.
  // this ensures that if you switch thread the component is recreated
  return <ThreadInner {...props} key={key} />;
};

Thread.defaultProps = {
  threadHasMore: true,
  threadLoadingMore: true,
  fullWidth: false,
  autoFocus: true,
  MessageInput: DefaultMessageInput,
};

Thread.propTypes = {
  /** Display the thread on 100% width of it's container. Useful for mobile style view */
  fullWidth: PropTypes.bool,
  /** Make input focus on mounting thread */
  autoFocus: PropTypes.bool,
  /** **Available from [channel context](https://getstream.github.io/stream-chat-react/#channel)** */
  channel: PropTypes.instanceOf(Channel).isRequired,
  /** **Available from [channel context](https://getstream.github.io/stream-chat-react/#channel)** */
  Message: /** @type {PropTypes.Validator<React.ComponentType<import('types').MessageUIComponentProps>>} */ (PropTypes.elementType),
  /**
   * **Available from [channel context](https://getstream.github.io/stream-chat-react/#channel)**
   * The thread (the parent [message object](https://getstream.io/chat/docs/#message_format)) */
  thread: /** @type {PropTypes.Validator<import('stream-chat').MessageResponse>} */ (PropTypes.object),
  /**
   * **Available from [channel context](https://getstream.github.io/stream-chat-react/#channel)**
   * The array of immutable messages to render. By default they are provided by parent Channel component */
  threadMessages: PropTypes.array.isRequired,
  /**
   * **Available from [channel context](https://getstream.github.io/stream-chat-react/#channel)**
   *
   * Function which provides next page of thread messages.
   * loadMoreThread is called when infinite scroll wants to load more messages
   * */
  loadMoreThread: PropTypes.func.isRequired,
  /**
   * **Available from [channel context](https://getstream.github.io/stream-chat-react/#channel)**
   * If there are more messages available, set to false when the end of pagination is reached.
   * */
  threadHasMore: PropTypes.bool,
  /**
   * **Available from [channel context](https://getstream.github.io/stream-chat-react/#channel)**
   * If the thread is currently loading more messages. This is helpful to display a loading indicator on threadlist */
  threadLoadingMore: PropTypes.bool,
  /**
   * Additional props for underlying Message component of parent message at the top.
   * Available props - https://getstream.github.io/stream-chat-react/#message
   * */
  additionalParentMessageProps: PropTypes.object,
  /**
   * Additional props for underlying MessageList component.
   * Available props - https://getstream.github.io/stream-chat-react/#messagelist
   * */
  additionalMessageListProps: PropTypes.object,
  /**
   * Additional props for underlying MessageInput component.
   * Available props - https://getstream.github.io/stream-chat-react/#messageinput
   * */
  additionalMessageInputProps: PropTypes.object,
  /** Customized MessageInput component to used within Thread instead of default MessageInput
        Useable as follows:
        ```
        <Thread MessageInput={(props) => <MessageInput parent={props.parent} Input={MessageInputSmall} /> }/>
        ```
    */
  MessageInput: /** @type {PropTypes.Validator<React.ComponentType<import('types').MessageInputProps>>} */ (PropTypes.elementType),
};

/** @type {React.FC<Props>} */
const ThreadInner = (props) => {
  const messageList = useRef();
  const { t } = useContext(TranslationContext);
  const {
    thread: propThread,
    closeThread: propCloseThread,
    loadMoreThread: propLoadMoreThread,
    threadMessages: propThreadMessages,
  } = props;
  const {
    closeThread: channelCloseThread,
    loadMoreThread: channelLoadMoreThread,
    thread: channelThread,
    threadMessages: channelThreadMessages,
    channel: channelChannel,
    client: channelClient,
    channelConfig,
  } = useContext(ChannelContext);
  const threadMessages = propThreadMessages || channelThreadMessages;
  const thread = propThread || channelThread;
  const closeThread = propCloseThread || channelCloseThread;
  const loadMoreThread = propLoadMoreThread || channelLoadMoreThread;
  const channel = props.channel || channelChannel;
  const client = props.client || channelClient;
  useEffect(() => {
    const parentID = thread && thread.id;
    if (parentID && thread?.reply_count && loadMoreThread) {
      loadMoreThread();
    }
  }, [thread, loadMoreThread]);

  const numberOfMessages = useRef(0);
  // Are we adding new items to the list?
  // Capture the scroll position so we can adjust scroll later.

  // @TODO: Check how much of a hack this is and try to optimize
  const isOnBottom = useMemo(() => {
    if (
      messageList.current &&
      ((threadMessages && numberOfMessages.current) ||
        numberOfMessages.current === 0 ||
        numberOfMessages.current < threadMessages.length)
    ) {
      numberOfMessages.current = threadMessages.length;
      return (
        messageList.current.clientHeight + messageList.current.scrollTop ===
        messageList.current.scrollHeight
      );
    }
    return null;
  }, [threadMessages, messageList]);

  const scrollDown = useCallback(() => {
    console.log(
      'I should scroll down',
      messageList.current.scrollTop,
      messageList.current.scrollHeight,
      isOnBottom,
    );
    if (isOnBottom)
      messageList.current.scrollTop = messageList.current.scrollHeight;
  }, [messageList, isOnBottom]);

  useEffect(() => {
    const parentID = thread?.id;
    if (
      parentID &&
      thread?.reply_count &&
      thread.reply_count > 0 &&
      threadMessages?.length === 0 &&
      loadMoreThread
    ) {
      loadMoreThread();
    }

    // If we have a snapshot value, we've just added new items.
    // Adjust scroll so these new items don't push the old ones out of view.
    // (snapshot here is the value returned from getSnapshotBeforeUpdate)
    if (isOnBottom !== null) {
      scrollDown();
      // scroll down after images load again
      setTimeout(scrollDown, 100);
    }
  }, [thread, loadMoreThread, threadMessages, scrollDown, isOnBottom]);

  if (!thread) {
    return null;
  }

  const read = {};
  return (
    <div
      className={`str-chat__thread ${
        props.fullWidth ? 'str-chat__thread--full' : ''
      }`}
    >
      <div className="str-chat__thread-header">
        <div className="str-chat__thread-header-details">
          <strong>{t && t('Thread')}</strong>
          <small>
            {' '}
            {t &&
              t('{{ replyCount }} replies', {
                replyCount: thread.reply_count,
              })}
          </small>
        </div>
        <button
          onClick={(e) => closeThread(e)}
          className="str-chat__square-button"
          data-testid="close-button"
        >
          <svg width="10" height="10" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M9.916 1.027L8.973.084 5 4.058 1.027.084l-.943.943L4.058 5 .084 8.973l.943.943L5 5.942l3.973 3.974.943-.943L5.942 5z"
              fillRule="evenodd"
            />
          </svg>
        </button>
      </div>
      <div className="str-chat__thread-list" ref={messageList}>
        <Message
          message={thread}
          initialMessage
          threadList
          Message={props.Message}
          // TODO: remove the following line in next release, since we already have additionalParentMessageProps now.
          {...props}
          {...props.additionalParentMessageProps}
        />
        <div className="str-chat__thread-start">
          {t && t('Start of a new thread')}
        </div>
        <MessageList
          messages={threadMessages}
          read={read}
          threadList
          loadMore={loadMoreThread}
          hasMore={props.threadHasMore}
          loadingMore={props.threadLoadingMore}
          channelConfig={channelConfig}
          Message={props.Message}
          channel={channel}
          client={client}
          {...props.additionalMessageListProps}
        />
      </div>
      {smartRender(props.MessageInput, {
        Input: MessageInputSmall,
        parent: thread,
        focus: props.autoFocus,
        publishTypingEvent: false,
        ...props.additionalMessageInputProps,
      })}
    </div>
  );
};

ThreadInner.propTypes = {
  /** Channel is passed via the Channel Context */
  channel: PropTypes.object,
  /** the thread (just a message) that we're rendering */
  thread: PropTypes.object,
};

export default React.memo(Thread);
