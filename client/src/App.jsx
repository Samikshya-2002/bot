// import { useState } from "react";
// import Chatbot from "react-chatbot-kit";
// import "react-chatbot-kit/build/main.css";
// import "./App.css";
// import Test from "./components/Test";
// import config from "./config";
// import MessageParser from "./MessageParser";
// import ActionProvider from "./ActionProvider";

// function App() {
//   return (
//     <>
//       <h1 className="text-red-500">hiii</h1>
//       <Test />
//       <div className="fixed bottom-6 right-6 w-80 ">
//         <Chatbot
//           config={config}
//           messageParser={MessageParser}
//           actionProvider={ActionProvider}
//         />
//       </div>
//     </>
//   );
// }

// export default App;

import { useState } from "react";
import Chatbot from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css";
// import "./App.css";
import "./index.css";
import Test from "./components/Test";
import config from "./config";
import MessageParser from "./MessageParser";
import ActionProvider from "./ActionProvider";

function App() {
  
  return (
    <>
      {/* <h1 className="text-red-500">hiii</h1>
      <Test /> */}
      <div className="fixed bottom-6 right-6 w-80 ">
        <Chatbot
          config={config}
          messageParser={MessageParser}
          actionProvider={(props) => (
            <ActionProvider
              {...props}
            />
          )}
        />
      </div>
    </>
  );
}

export default App;
