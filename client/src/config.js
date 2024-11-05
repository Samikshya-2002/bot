import { createChatBotMessage } from "react-chatbot-kit";
import BotMessage from "./components/BotMessage";

const botName = "QU";

const config = {
  initialMessages: [createChatBotMessage(`Hi! I'm ${botName}`)],
  botName: botName,

  customComponents: {
    botMessage: BotMessage,
},
  // customStyles: {
  //   botMessageBox: {
  //     backgroundColor: "#376B7E",
  //   },
  //   chatButton: {
  //     backgroundColor: "#5ccc9d",
  //     // #5ccc9d
  //   },
  // },
};

export default config;
