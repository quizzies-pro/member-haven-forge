import { useEffect, useState, useRef } from "react";
import { MessageCircle, X, ArrowLeft, Send, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

interface Thread {
  lessonId: string;
  lessonTitle: string;
  courseId: string;
  lastMessage: string;
  lastDate: string;
  hasUnread: boolean;
  messages: Tables<"lesson_messages">[];
}

const SupportChatBubble = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const totalUnread = threads.filter((t) => t.hasUnread).length;

  const fetchThreads = async () => {
    if (!user) return;
    setLoading(true);

    // Get all messages for this student
    const { data: allMessages } = await supabase
      .from("lesson_messages")
      .select("*")
      .eq("student_id", user.id)
      .order("created_at", { ascending: true });

    if (!allMessages || allMessages.length === 0) {
      setThreads([]);
      setLoading(false);
      return;
    }

    // Group by lesson_id
    const grouped: Record<string, Tables<"lesson_messages">[]> = {};
    for (const msg of allMessages) {
      if (!grouped[msg.lesson_id]) grouped[msg.lesson_id] = [];
      grouped[msg.lesson_id].push(msg);
    }

    // Fetch lesson titles
    const lessonIds = Object.keys(grouped);
    const { data: lessons } = await supabase
      .from("lessons")
      .select("id, title")
      .in("id", lessonIds);

    const lessonMap = new Map(lessons?.map((l) => [l.id, l.title]) || []);

    const threadList: Thread[] = lessonIds.map((lessonId) => {
      const msgs = grouped[lessonId];
      const last = msgs[msgs.length - 1];
      // Has unread = last message is from admin and is_read === false
      const hasUnread = last.sender_type === "admin" && !last.is_read;

      return {
        lessonId,
        lessonTitle: lessonMap.get(lessonId) || "Aula",
        courseId: last.course_id,
        lastMessage: last.message,
        lastDate: last.created_at,
        hasUnread,
        messages: msgs,
      };
    });

    // Sort by most recent message
    threadList.sort((a, b) => new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime());

    setThreads(threadList);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchThreads();
  }, [user]);

  useEffect(() => {
    if (open && user) fetchThreads();
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages]);

  // Mark messages as read when opening a thread
  const openThread = async (thread: Thread) => {
    setActiveThread(thread);

    if (thread.hasUnread && user) {
      // Mark all admin messages in this thread as read
      const unreadIds = thread.messages
        .filter((m) => m.sender_type === "admin" && !m.is_read)
        .map((m) => m.id);

      if (unreadIds.length > 0) {
        await supabase
          .from("lesson_messages")
          .update({ is_read: true })
          .in("id", unreadIds);

        // Update local state
        setThreads((prev) =>
          prev.map((t) =>
            t.lessonId === thread.lessonId
              ? { ...t, hasUnread: false, messages: t.messages.map((m) => ({ ...m, is_read: true })) }
              : t
          )
        );
        setActiveThread((prev) =>
          prev ? { ...prev, hasUnread: false, messages: prev.messages.map((m) => ({ ...m, is_read: true })) } : null
        );
      }
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !user || !activeThread || sending) return;
    setSending(true);

    const { data, error } = await supabase
      .from("lesson_messages")
      .insert({
        student_id: user.id,
        lesson_id: activeThread.lessonId,
        course_id: activeThread.courseId,
        message: newMessage.trim(),
        sender_type: "student",
      })
      .select()
      .single();

    if (!error && data) {
      setNewMessage("");
      const updatedMessages = [...activeThread.messages, data];
      setActiveThread((prev) => prev ? { ...prev, messages: updatedMessages, lastMessage: data.message, lastDate: data.created_at } : null);
      setThreads((prev) =>
        prev.map((t) =>
          t.lessonId === activeThread.lessonId
            ? { ...t, messages: updatedMessages, lastMessage: data.message, lastDate: data.created_at }
            : t
        )
      );
    }
    setSending(false);
  };

  if (!user) return null;

  return (
    <>
      {/* Floating bubble */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
        {!open && totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {totalUnread}
          </span>
        )}
      </button>

      {/* Chat popup */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[520px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
            {activeThread && (
              <button onClick={() => setActiveThread(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft size={18} />
              </button>
            )}
            <h3 className="text-sm font-bold text-foreground flex-1 truncate">
              {activeThread ? activeThread.lessonTitle : "Suporte — Suas dúvidas"}
            </h3>
            {activeThread && (
              <button
                onClick={() => navigate(`/aula/${activeThread.lessonId}`)}
                className="text-xs text-primary hover:underline flex-shrink-0"
              >
                Ir para aula
              </button>
            )}
          </div>

          {/* Content */}
          {!activeThread ? (
            /* Thread list */
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : threads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <MessageCircle size={32} className="text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">Nenhuma conversa ainda.</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Envie uma dúvida em qualquer aula para iniciar.</p>
                </div>
              ) : (
                threads.map((thread) => (
                  <button
                    key={thread.lessonId}
                    onClick={() => openThread(thread)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-left border-b border-border/50 last:border-0"
                  >
                    {/* Unread dot */}
                    <div className="flex-shrink-0 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: thread.hasUnread ? "hsl(var(--primary))" : "transparent" }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{thread.lessonTitle}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{thread.lastMessage}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(thread.lastDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                      </span>
                      <ChevronRight size={14} className="text-muted-foreground" />
                    </div>
                  </button>
                ))
              )}
            </div>
          ) : (
            /* Messages view */
            <>
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {activeThread.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`text-sm p-3 rounded-xl max-w-[85%] ${
                      msg.sender_type === "student"
                        ? "bg-secondary/50 text-foreground ml-auto"
                        : "bg-primary/10 text-foreground mr-auto border border-primary/20"
                    }`}
                  >
                    <p className="text-[10px] text-muted-foreground mb-1">
                      {msg.sender_type === "student" ? "Você" : "Professor"} · {new Date(msg.created_at).toLocaleDateString("pt-BR")}
                    </p>
                    <p className="leading-relaxed">{msg.message}</p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="flex items-center gap-2 px-4 py-3 border-t border-border">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Escreva sua mensagem..."
                  className="flex-1 bg-transparent text-foreground text-sm py-2 px-3 rounded-lg border border-border focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !newMessage.trim()}
                  className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default SupportChatBubble;
