import React from 'react';
// import DOMPurify from 'dompurify';

const BotMessage = ({ message }) => {
//   const sanitizedMessage = DOMPurify.sanitize(message);

  return (
    <div
      className="bot-message"
      dangerouslySetInnerHTML={{ __html: message }}
    />
  );
};

export default BotMessage;
