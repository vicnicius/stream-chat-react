// @ts-check
import { useCallback, useContext } from 'react';
import { useUserRole } from './useUserRole';
import { MESSAGE_ACTIONS, getMessageActions } from '../utils';
import { ChannelContext } from '../../../context';

/**
 * @type {(
 *   message: import('stream-chat').MessageResponse | undefined,
 *   messageActions?: Array<string> | boolean,
 *   customChannel?: import('stream-chat').Channel
 * ) => () => string[]}
 */
export const useMessageActions = (
  message,
  messageActions = Object.keys(MESSAGE_ACTIONS),
  customChannel = undefined,
) => {
  const { isMyMessage, isAdmin, isModerator, isOwner } = useUserRole(message);
  const { channel: contextChannel } = useContext(ChannelContext);
  const channel = customChannel || contextChannel;
  const channelConfig = channel?.getConfig && channel.getConfig();
  return useCallback(() => {
    const canEdit = isMyMessage || isModerator || isOwner || isAdmin;
    const canDelete = canEdit;
    if (!message || !messageActions) {
      return [];
    }

    return getMessageActions(messageActions, {
      canDelete,
      canEdit,
      canFlag: !isMyMessage,
      canMute: !isMyMessage && !!channelConfig?.mutes,
    });
  }, [
    message,
    isMyMessage,
    isAdmin,
    isModerator,
    isOwner,
    channelConfig?.mutes,
    messageActions,
  ]);
};
