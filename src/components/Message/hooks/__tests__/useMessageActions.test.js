import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import {
  getTestClientWithUser,
  generateChannel,
  generateMessage,
  generateUser,
} from 'mock-builders';
import { ChannelContext } from '../../../../context';
import { useMessageActions } from '../useMessageActions';
import { MESSAGE_ACTIONS } from '../../utils';

const defaultChannel = generateChannel();
const alice = generateUser({ name: 'alice' });
async function renderUseMessageActions(
  message = generateMessage(),
  channel = undefined,
  messageActions = undefined,
) {
  const client = await getTestClientWithUser(alice);
  const wrapper = ({ children }) => (
    <ChannelContext.Provider
      value={{
        channel: defaultChannel,
        client,
      }}
    >
      {children}
    </ChannelContext.Provider>
  );
  const { result } = renderHook(
    () => useMessageActions(message, messageActions, channel),
    { wrapper },
  );
  return result.current;
}

describe('useMessageActions hook', () => {
  it('should return a function', async () => {
    const handleActions = await renderUseMessageActions();
    expect(typeof handleActions).toBe('function');
  });

  it('should return an empty list if message is not defined', async () => {
    const handleActions = await renderUseMessageActions(null);
    const result = handleActions();
    expect(result).toStrictEqual([]);
  });

  it('should return edit in the list of actions, when message is from the current user and available in the channel', async () => {
    const message = generateMessage({ user: alice });
    const handleActions = await renderUseMessageActions(message);
    const result = handleActions();
    expect(result).toContain(MESSAGE_ACTIONS.edit);
  });

  it('should return mute in the list of actions, when channel has mutes enabled', async () => {
    const message = generateMessage();
    const channel = generateChannel();
    channel.getConfig = () => ({ mutes: true });
    const handleActions = await renderUseMessageActions(message, channel);
    const result = handleActions();
    expect(result).toContain(MESSAGE_ACTIONS.mute);
  });

  it('should return a list of the available actions for the user', async () => {
    const message = generateMessage();
    const messageActions = ['flag'];
    const handleActions = await renderUseMessageActions(
      message,
      messageActions,
    );
    const result = handleActions();
    expect(result).toStrictEqual(messageActions);
  });
});
