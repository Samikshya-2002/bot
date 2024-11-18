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


// import React from "react";

// const MessageParser = ({ children, actions }) => {
//   const parse = (message) => {
//     actions.handleUserMessage(message);
//   };

//   const formatMessage = (message) => {
//     return message.replace(
//       /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})|(\+?\d{1,4}?[-.\s]?\(?\d{1,4}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9})/g,
//       (match) => {
//         return match.includes('@')
//           ? `<a href="mailto:${match}">${match}</a>`
//           : `<a href="tel:${match.replace(/[-.\s]/g, '')}">${match}</a>`;
//       }
//     );
//   };

//   return (
//     <div>
//       {React.Children.map(children, (child) => {
//         return React.cloneElement(child, {
//           parse: parse,
//           actions,
//           dangerouslySetInnerHTML: { __html: formatMessage(child.props.message) }
//         });
//       })}
//     </div>
//   );
// };

// export default MessageParser;
