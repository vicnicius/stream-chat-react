// @ts-check
import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
// @ts-ignore
import { EmojiContext, getStrippedEmojiData } from '../../context';

/** @type {React.FC<import("types").ReactionsListProps>} */
const ReactionsList = ({
  reactions,
  reaction_counts,
  reactionOptions: reactionOptionsProp,
  reverse = false,
  onClick,
}) => {
  const {
    emojiData: fullEmojiData,
    emojiSetDef,
    defaultMinimalEmojis,
    Emoji,
  } = useContext(EmojiContext);
  const emojiData = useMemo(() => getStrippedEmojiData(fullEmojiData), [
    fullEmojiData,
  ]);
  const reactionOptions = reactionOptionsProp || defaultMinimalEmojis;
  const getTotalReactionCount = () =>
    Object.values(reaction_counts || {}).reduce(
      (total, count) => total + count,
      0,
    );

  /** @param {string} type */
  const getOptionForType = (type) =>
    reactionOptions.find((option) => option.id === type);

  const getReactionTypes = () => {
    if (!reactions) return [];
    const allTypes = new Set();
    reactions.forEach(({ type }) => {
      allTypes.add(type);
    });
    return Array.from(allTypes);
  };

  return (
    <div
      data-testid="reaction-list"
      className={`str-chat__reaction-list ${
        reverse ? 'str-chat__reaction-list--reverse' : ''
      }`}
      onClick={onClick}
    >
      <ul>
        {getReactionTypes().map((reactionType) => {
          const emojiDefinition = getOptionForType(reactionType);
          return emojiDefinition ? (
            <li key={emojiDefinition.id}>
              {Emoji && (
                <Emoji
                  // emoji-mart type defs don't support spriteSheet use case
                  // (but implementation does)
                  // @ts-ignore
                  emoji={emojiDefinition}
                  {...emojiSetDef}
                  size={16}
                  data={emojiData}
                />
              )}
              ${' '}
            </li>
          ) : null;
        })}
        <li>
          <span className="str-chat__reaction-list--counter">
            {getTotalReactionCount()}
          </span>
        </li>
      </ul>
    </div>
  );
};

ReactionsList.propTypes = {
  reactions: PropTypes.array,
  /** Object/map of reaction id/type (e.g. 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry') vs count */
  reaction_counts: PropTypes.objectOf(PropTypes.number.isRequired),
  /** Provide a list of reaction options [{id: 'angry', emoji: 'angry'}] */
  reactionOptions: PropTypes.array,
  reverse: PropTypes.bool,
  onClick: PropTypes.func,
};

export default React.memo(ReactionsList);
