import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I am PharmaBridge AI Assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chatHistory } = trpc.chat.getChatHistory.useQuery({});

  const sendMessageMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: (response) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response.content,
          timestamp: new Date(),
        },
      ]);
      setIsLoading(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send message");
      setIsLoading(false);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    sendMessageMutation.mutate({
      content: inputValue,
    });
  };

  const handleClearChat = () => {
    if (confirm("Clear chat history?")) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "Hello! I am PharmaBridge AI Assistant. How can I help you today?",
          timestamp: new Date(),
        },
      ]);
      toast.success("Chat cleared");
    }
  };

  return (
    <div className="min-h-screen bg-scandinavian-bg section-spacing">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-scandinavian-text-primary mb-2">
              AI Chat Support
            </h1>
            <p className="text-scandinavian-text-secondary">
              Ask questions about our products
            </p>
          </div>
          <Button
            onClick={handleClearChat}
            className="btn-scandinavian-secondary"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>

        <Card className="scandinavian-card h-[600px] flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-scandinavian-blue text-white"
                      : "bg-scandinavian-bg-secondary border border-scandinavian-border text-scandinavian-text-primary"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <Streamdown>{message.content}</Streamdown>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                  <p className="text-xs mt-2 opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-scandinavian-bg-secondary border border-scandinavian-border text-scandinavian-text-primary px-4 py-3 rounded-lg flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Typing...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-scandinavian-border p-4">
            <div className="flex gap-2">
              <Input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your message..."
                className="input-scandinavian flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="btn-scandinavian"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
