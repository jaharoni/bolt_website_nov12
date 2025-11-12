import React from 'react';
import { ChatMessage } from '../lib/secureChatService';

interface ConversationBubbleProps {
  message: ChatMessage;
}

const ConversationBubble: React.FC<ConversationBubbleProps> = ({ message }) => {
  return (
    <div
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-3`}
    >
      <div
        className={`max-w-[85%] p-3 rounded-2xl ${
          message.role === 'user'
            ? 'bg-yellow-400/20 border border-yellow-400/30 text-white'
            : 'frost-medium text-white/90'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        {message.timestamp && (
          <p className="text-xs text-white/40 mt-1">
            {new Date(message.timestamp).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default ConversationBubble;
