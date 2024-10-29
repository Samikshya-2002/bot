import React from "react";
const MessageParser = ({ children, actions }) => {
  const parse = (message) => {
    // Send the user's message to the backend via the handleUserMessage function
    actions.handleUserMessage(message);
  };

  return (
    <div>
    {/* /* React.cloneElement(children, {
    parse: parse, */ }
    {React.Children.map(children, (child) => {
        return React.cloneElement(child, {
          parse: parse,
          actions,
        });
      })}
  {/* }); */}
  </div>
);
};

export default MessageParser;
