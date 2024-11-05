import React, { useState } from "react";
import axios from "axios";
import "./index.css"; // Importing index.css file for styles
import questions from "./questions";
import { FaComments, FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";
import { BiBot } from "react-icons/bi";
import DOMPurify from "dompurify";

const ActionProvider = ({ createChatBotMessage, setState, children }) => {
  const [showChat, setShowChat] = useState(false);
  const [showMainContainer, setShowMainContainer] = useState(false); // for the main container (FAQs)
  const [isLoading, setIsLoading] = useState(false); // Track loading state

  // Function to handle sending a message to the backend
  const handleUserMessage = async (message) => {
    try {
      setIsLoading(true); // Set loading to true when sending message

      // Send the user's message to the backend API
      // const response = await axios.post("http://localhost:5000/chat", {
      //   query: message,
      // });
      const response = await axios.post(`https://bot-y21c.onrender.com/chat`, {
        query: message,
      });
      console.log("Full response from backend:", response);

      // Extract the bot's reply from the backend response
      const botReply = response.data.reply || response.data.response; // Supports both OpenAI & GroqCloud
      console.log("bot reply", botReply);

      // Convert object reply to string if necessary
      const reply =
        typeof botReply === "object"
          ? JSON.stringify(botReply, null, 2)
          : botReply;

          // Sanitize the reply
       const sanitizedReply = DOMPurify.sanitize(reply);
       console.log("sanitize reply", sanitizedReply);

      // Add the bot's reply to the chat
      setState((prev) => ({
        ...prev,
        messages: [
          ...prev.messages.filter((msg) => !msg.loading), // Ensure any loading message is removed
          createChatBotMessage(reply), // Add the actual bot reply
          // createChatBotMessage(sanitizedReply),
        ],
      }));

      setIsLoading(false); // Set loading to false after receiving response
    } catch (error) {
      console.error("Error sending message:", error);

      // Handle the error case by sending an error message from the bot
      const errorMessage = createChatBotMessage("Sorry, there was an error.");
      setState((prev) => ({
        ...prev,
        messages: prev.messages.filter((msg) => !msg.loading) // Ensure loading message is removed
          .concat(errorMessage), // Add the error message
      }));

      setIsLoading(false); // Stop loading
    }
  };

  // Function to handle question clicks
  const handleQuestionClick = (question) => {
    setShowChat(true);

    // Simulate a user-sent message by adding it to the chat history
    setState((prev) => ({
      ...prev,
      messages: [
        ...prev.messages,
        {
          message: question,
          type: "user",
          id: Date.now(),
        },
      ],
    }));

    handleUserMessage(question); // Send the question to the bot
  };

  // Function to handle start conversation click
  const handleStartConversation = () => {
    setShowChat(true); // Show the chatbot interface
  };

  // Open the main container with fade-in effect
  const handleOpenMainContainer = () => {
    setShowMainContainer(!showMainContainer);
    setShowChat(false); // Hide chat when FAQ is opened
  };

  return (
    <>
      {showMainContainer ? (
        <>
          {showChat ? (
            <>
              {React.Children.map(children, (child) => {
                return React.cloneElement(child, {
                  actions: {
                    handleUserMessage,
                  },
                });
              })}
              {/* Conditionally show loading indicator */}
              {isLoading && (
                <div className="loading-message">
                {/*<span>Loading...</span>*/}
                </div>
              )}
            </>
          ) : (
            <div className="main-container slide-in">
              <div className="upper-container">
                <div className="text-fields">
                  <div className="hello-wave">
                    <span>Hello</span> 👋
                  </div>
                  <div style={{ color: "white", fontWeight: 600, fontSize: "25px" }}>
                    Welcome to QU
                  </div>
                  <div style={{ color: "white", fontWeight: 400, fontSize: "20px" }}>
                    Your Virtual Assistant
                  </div>
                </div>
              </div>

              <div className="lower-container">
                <div className="contents">
                  <div className="bot-logo">
                    <BiBot size={40} color="white" />
                  </div>
                  <div className="faq">
                    <span>FAQs</span>
                    <div className="circle">?</div>
                  </div>
                  <div className="questions">
                    {questions.map((question, index) => (
                      <div
                        key={index}
                        className="indi-quest"
                        onClick={() => handleQuestionClick(question)}
                      >
                        <div className="circle"></div>
                        <span>{question}</span>
                      </div>
                    ))}
                  </div>
                  <button className="start-convo" onClick={handleStartConversation}>
                    <div className="convo">Start a conversation</div>
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className={`icon-container ${showChat ? "active" : ""}`}>
            <div className="chat-icon" onClick={handleOpenMainContainer}>
              {showMainContainer ? <FaTimes size={10} /> : <FaComments size={50} />}
            </div>
          </div>
        </>
      ) : (
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: 20 }}
          transition={{
            type: "spring",
            stiffness: 60,
            damping: 55,
            mass: 2.5,
            duration: 5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          <button className="open-icon" onClick={handleOpenMainContainer}>
            <FaComments size={50} />
          </button>
        </motion.div>
      )}
    </>
  );
};

export default ActionProvider;
