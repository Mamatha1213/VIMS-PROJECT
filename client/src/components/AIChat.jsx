import { useState } from "react";
import axios from "axios";

function AIChat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const suggestions = [
    {
      icon: "📦",
      text: "Show my products",
    },
    {
      icon: "🏢",
      text: "Show my vendors",
    },
    {
      icon: "📊",
      text: "Give me an inventory summary",
    },
    {
      icon: "⚠️",
      text: "Which products need restocking?",
    },
  ];

  const sendMessage = async (text = message) => {
    const userMessage = text.trim();

    if (!userMessage || loading) return;

    const newUserMessage = {
      role: "user",
      content: userMessage,
    };

    const updatedMessages = [...messages, newUserMessage];

    setMessages(updatedMessages);
    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/ai/chat",
        {
          message: userMessage,
          history: messages.slice(-10),
        }
      );

      const aiMessage = {
        role: "assistant",
        content:
          response.data?.reply ||
          "Sorry, I could not generate a response.",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, something went wrong while connecting to VIMS AI.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="vims-ai-chat">

      {/* AI Header */}
      <div className="vims-ai-header">

        <div className="vims-ai-brand">

          <div className="vims-ai-avatar">
            ✨
          </div>

          <div>
            <h3>VIMS AI Copilot</h3>

            <div className="vims-ai-status">
              <span></span>
              Online & ready to help
            </div>
          </div>

        </div>

        <div className="vims-ai-label">
          AI
        </div>

      </div>


      {/* Chat Area */}
      <div className="vims-ai-body">

        {messages.length === 0 ? (

          <div className="vims-ai-welcome">

            <div className="vims-ai-welcome-icon">
              🤖
            </div>

            <h2>
              Hello! I'm your VIMS AI Copilot
            </h2>

            <p>
              Ask me anything about your products,
              inventory, vendors, stock levels, or VIMS.
            </p>

            {/* Suggestions */}
            <div className="vims-ai-suggestions">

              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(suggestion.text)}
                  className="vims-ai-suggestion"
                >
                  <span>{suggestion.icon}</span>
                  <span>{suggestion.text}</span>
                </button>
              ))}

            </div>

          </div>

        ) : (

          <div className="vims-ai-messages">

            {messages.map((item, index) => (

              <div
                key={index}
                className={
                  item.role === "user"
                    ? "vims-message user-message"
                    : "vims-message ai-message"
                }
              >

                {item.role === "assistant" && (
                  <div className="message-avatar">
                    ✨
                  </div>
                )}

                <div className="message-content">
                  {item.content}
                </div>

              </div>

            ))}

            {loading && (
              <div className="vims-message ai-message">

                <div className="message-avatar">
                  ✨
                </div>

                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

              </div>
            )}

          </div>

        )}

      </div>


      {/* Input */}
      <div className="vims-ai-footer">

        <div className="vims-ai-input-wrapper">

          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask VIMS AI anything about your inventory..."
            rows="1"
          />

          <button
            className="vims-ai-send"
            onClick={() => sendMessage()}
            disabled={!message.trim() || loading}
          >
            ➤
          </button>

        </div>

        <div className="vims-ai-hint">
          Press <strong>Enter</strong> to send
          <span>•</span>
          <strong>Shift + Enter</strong> for a new line
        </div>

      </div>

    </div>
  );
}

export default AIChat;