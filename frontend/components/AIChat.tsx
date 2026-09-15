"use client";

import { useState } from "react";
import { useChat } from "@/hooks/useQueries";
import { Send, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Citation, ChatResponse } from "@/types";

interface AIChatProps {
  documentId: string;
  documentName: string;
}

export function AIChat({ documentId, documentName }: AIChatProps) {
  const [question, setQuestion] = useState("");
  const [conversation, setConversation] = useState<
    { role: "user" | "assistant"; content: string; citations?: Citation[]; grounded?: boolean }[]
  >([]);
  const chatMutation = useChat(documentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || chatMutation.isPending) return;

    const userMessage = question.trim();
    setQuestion("");
    setConversation((prev) => [...prev, { role: "user", content: userMessage }]);

    try {
      const result: ChatResponse = await chatMutation.mutateAsync(userMessage);
      setConversation((prev) => [
        ...prev,
        {
          role: "assistant",
          content: result.answer,
          citations: result.citations,
          grounded: result.grounded,
        },
      ]);
    } catch (error) {
      setConversation((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, an error occurred. Please try again." },
      ]);
    }
  };

  const copyAnswer = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-card-title font-semibold text-primary">AI Legal Assistant</h3>
      </div>
      <p className="text-sm text-text-secondary mb-4">
        Ask questions about <span className="font-medium text-text-primary">{documentName}</span>
      </p>

      <div aria-live="polite" aria-label="Chat conversation" className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-[300px] max-h-[500px]">
        {conversation.length === 0 && (
          <div className="text-center py-12 text-text-muted">
            <p className="text-sm">Ask a question about this document...</p>
            <div className="mt-4 space-y-2">
              {[
                "What is the termination notice period?",
                "Who owns the intellectual property?",
                "What happens if payment is late?",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => setQuestion(q)}
                  className="block w-full text-left px-4 py-2 text-sm text-text-secondary bg-surface-muted rounded-md hover:bg-border transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {conversation.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === "user"
                  ? "bg-primary text-foreground"
                  : "bg-surface-muted text-text-primary"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/30">
                  <p className="text-xs font-medium text-text-muted mb-1">Evidence:</p>
                  {msg.citations.map((citation, j) => (
                    <div key={j} className="text-xs text-text-secondary">
                      <span className="font-medium">
                        Section {citation.section || "N/A"}
                        {citation.page && ` · Page ${citation.page}`}
                      </span>
                      <p className="mt-1 italic">"{citation.text}"</p>
                    </div>
                  ))}
                </div>
              )}

              {msg.role === "assistant" && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => copyAnswer(msg.content)}
                    className="text-xs text-text-muted hover:text-text-primary flex items-center gap-1"
                  >
                    <Copy aria-hidden="true" className="h-3 w-3" />
                    Copy
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {chatMutation.isPending && (
          <div className="flex justify-start">
            <div role="status" aria-label="Waiting for answer" className="bg-surface-muted rounded-lg p-3">
              <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin text-accent" />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <label htmlFor="chat-input" className="sr-only">
          Ask a question about {documentName}
        </label>
        <input
          id="chat-input"
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about this document..."
          className="input-field flex-1"
          disabled={chatMutation.isPending}
        />
        <Button
          type="submit"
          className="btn-primary"
          aria-label="Send question"
          disabled={!question.trim() || chatMutation.isPending}
        >
          <Send aria-hidden="true" className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
