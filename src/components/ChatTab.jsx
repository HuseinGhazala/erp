import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, User, Send, Loader2 } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

function formatChatTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatTab({
  currentUserId,
  chatContacts = [],
  chatMessages = [],
  selectedContactId,
  onSelectContact,
  onSendMessage,
  chatLoading,
  sendLoading,
  chatInput,
  setChatInput,
}) {
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, selectedContactId]);

  const selectedContact = chatContacts.find((c) => c.id === selectedContactId);
  const canSend = chatInput?.trim() && selectedContactId && !sendLoading;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={fadeUp}
      className="card card-soft bg-base-100 p-0 overflow-hidden hover-lift flex flex-col min-h-[60vh]"
    >
      <div className="p-4 md:p-6 border-b border-base-200/80">
        <h2 className="text-2xl md:text-3xl font-black text-base-content flex items-center gap-3">
          <MessageCircle className="w-8 h-8 text-primary" />
          المحادثات
        </h2>
        <p className="text-base-content/50 text-sm mt-1">تواصل مع زملائك داخل النظام</p>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* قائمة جهات الاتصال */}
        <div className="w-full md:w-72 shrink-0 border-l border-base-200/80 flex flex-col bg-base-200/30">
          <div className="p-2 border-b border-base-200/60">
            <p className="text-xs font-bold text-base-content/50 uppercase px-2 py-1">الموظفون</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {chatContacts.length === 0 && !chatLoading && (
              <p className="text-base-content/40 text-sm p-4 text-center">لا يوجد موظفون آخرون</p>
            )}
            {chatContacts.map((contact) => (
              <button
                key={contact.id}
                type="button"
                onClick={() => onSelectContact(contact.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-right transition-colors ${
                  selectedContactId === contact.id ? 'bg-primary text-primary-content' : 'hover:bg-base-200 text-base-content'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-base-300 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm truncate flex-1">{contact.full_name || 'بدون اسم'}</span>
              </button>
            ))}
          </div>
        </div>

        {/* منطقة المحادثة */}
        <div className="flex-1 flex flex-col min-w-0">
          {!selectedContactId ? (
            <div className="flex-1 flex items-center justify-center p-8 text-base-content/40">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-3 opacity-50" />
                <p className="font-bold">اختر محادثة من القائمة</p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-3 border-b border-base-200/60 flex items-center gap-3 bg-base-100">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <span className="font-bold text-base-content">{selectedContact?.full_name || 'موظف'}</span>
              </div>

              {chatLoading ? (
                <div className="flex-1 flex items-center justify-center p-8">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.length === 0 && (
                    <p className="text-base-content/40 text-sm text-center py-8">لا توجد رسائل بعد. ابدأ المحادثة.</p>
                  )}
                  {chatMessages.map((msg) => {
                    const isMe = msg.sender_id === currentUserId;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}>
                        <div
                          className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2.5 ${
                            isMe ? 'bg-primary text-primary-content rounded-br-md' : 'bg-base-200 text-base-content rounded-bl-md'
                          }`}
                        >
                          {!isMe && (
                            <p className="text-xs font-bold opacity-80 mb-0.5">{selectedContact?.full_name || 'موظف'}</p>
                          )}
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                          <p className={`text-[10px] mt-1 ${isMe ? 'opacity-80' : 'text-base-content/60'}`}>
                            {formatChatTime(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}

              <div className="p-4 border-t border-base-200/80 bg-base-100">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (canSend) {
                      onSendMessage(chatInput.trim());
                      setChatInput('');
                    }
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="اكتب رسالة..."
                    className="input input-bordered flex-1 rounded-2xl bg-base-200/50"
                    disabled={!selectedContactId || sendLoading}
                  />
                  <button type="submit" className="btn btn-primary rounded-2xl gap-2" disabled={!canSend}>
                    {sendLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    إرسال
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
