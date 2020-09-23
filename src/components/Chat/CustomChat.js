// @ts-check
import React from 'react';
import PropTypes from 'prop-types';
// @ts-ignore
import DefaultEmojiPicker from 'emoji-mart/dist-modern/components/picker/nimble-picker';
// @ts-ignore
import DefaultEmoji from 'emoji-mart/dist-modern/components/emoji/nimble-emoji';
import { ChatContext, EmojiContext, TranslationContext } from '../../context';
import {
  commonEmoji,
  defaultMinimalEmojis,
  emojiSetDef,
} from '../../context/EmojiContext';
import { useChat } from './hooks/useChat';

/**
 * CustomChat - This component is a replacement for the Chat component. The only difference between both is
 * that the CustomChat component does not come with a default set of emojis, allowing for a custom set of emoji
 * related components
 *
 * @example ../../docs/CustomChat.md
 * @typedef {import('stream-chat').Channel | undefined} ChannelState
 * @type {React.FC<import('types').CustomChatProps>}>}
 */
const CustomChat = ({
  client,
  theme = 'messaging light',
  i18nInstance,
  initialNavOpen = true,
  children,
  emojiData,
  EmojiPicker = DefaultEmojiPicker,
  Emoji = DefaultEmoji,
}) => {
  const emojiConfig = {
    emojiData,
    EmojiPicker,
    Emoji,
    defaultMinimalEmojis,
    commonEmoji,
    emojiSetDef,
  };
  const {
    setActiveChannel,
    navOpen,
    mutes,
    channel,
    openMobileNav,
    closeMobileNav,
    translators,
  } = useChat({ client, initialNavOpen, i18nInstance });

  if (!translators.t) return null;

  return (
    <ChatContext.Provider
      value={{
        client,
        theme,
        channel,
        mutes,
        navOpen,
        setActiveChannel,
        openMobileNav,
        closeMobileNav,
      }}
    >
      <TranslationContext.Provider value={translators}>
        <EmojiContext.Provider value={emojiConfig}>
          {children}
        </EmojiContext.Provider>
      </TranslationContext.Provider>
    </ChatContext.Provider>
  );
};

CustomChat.propTypes = {
  /** The StreamChat client object */
  client: /** @type {PropTypes.Validator<import('stream-chat').StreamChat>} */ (PropTypes
    .object.isRequired),
  /**
   *
   * Theme could be used for custom styling of the components.
   *
   * You can override the classes used in our components under parent theme class.
   *
   * e.g. If you want to build a theme where background of message is black
   *
   * ```
   *  <Chat client={client} theme={demo}>
   *    <Channel>
   *      <MessageList />
   *    </Channel>
   *  </Chat>
   * ```
   *
   * ```scss
   *  .demo.str-chat {
   *    .str-chat__message-simple {
   *      &-text-inner {
   *        background-color: black;
   *      }
   *    }
   *  }
   * ```
   *
   * Built in available themes:
   *
   *  - `messaging light`
   *  - `messaging dark`
   *  - `team light`
   *  - `team dark`
   *  - `commerce light`
   *  - `commerce dark`
   *  - `livestream light`
   *  - `livestream dark`
   */
  theme: PropTypes.string,
  /** navOpen initial status */
  initialNavOpen: PropTypes.bool,
};

export default CustomChat;
