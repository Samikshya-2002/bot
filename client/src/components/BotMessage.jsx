import React from 'react';
import DOMPurify from 'dompurify';

const BotMessage = ({ message }) => {
  const sanitizedMessage = DOMPurify.sanitize(message);

  return (
    <div
      className="react-chatbot-kit-chat-bot-message"
      dangerouslySetInnerHTML={{ __html: sanitizedMessage }}
    />
  );
};

export default BotMessage;
