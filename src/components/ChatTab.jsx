import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, User, Send, Loader2, Users, Plus } from 'lucide-react';

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
  chatGroups = [],
  chatGroupMessages = [],
  selectedChatGroupId,
  onSelectChatGroup,
  chatGroupMembersMap = {},
  chatGroupLoading,
  sendChatGroupLoading,
  onSendChatGroupMessage,
  showCreateGroupModal,
  setShowCreateGroupModal,
  createGroupName,
  setCreateGroupName,
  createGroupSelectedIds = [],
  setCreateGroupSelectedIds,
  createGroupLoading,
  onCreateChatGroup,
  unreadDirect = {},
  unreadGroups = {},
}) {
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, chatGroupMessages, selectedContactId, selectedChatGroupId]);

  const selectedContact = chatContacts.find((c) => c.id === selectedContactId);
  const selectedGroup = chatGroups.find((g) => g.id === selectedChatGroupId);
  const groupMembers = selectedChatGroupId ? (chatGroupMembersMap[selectedChatGroupId] || []) : [];
  const senderNameMap = Object.fromEntries(groupMembers.map((m) => [m.id, m.full_name]));

  const isDirect = !!selectedContactId;
  const isGroup = !!selectedChatGroupId;
  const canSendDirect = chatInput?.trim() && selectedContactId && !sendLoading;
  const canSendGroup = chatInput?.trim() && selectedChatGroupId && !sendChatGroupLoading;

  const handleSelectContact = (id) => {
    onSelectContact?.(id);
    onSelectChatGroup?.(null);
  };
  const handleSelectGroup = (id) => {
    onSelectChatGroup?.(id);
    onSelectContact?.(null);
  };

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!createGroupName?.trim()) return;
    onCreateChatGroup?.(createGroupName.trim(), createGroupSelectedIds);
  };

  const toggleCreateGroupMember = (id) => {
    setCreateGroupSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

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
        <p className="text-base-content/50 text-sm mt-1">تواصل مع زملائك والمجموعات داخل النظام</p>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* قائمة جهات الاتصال والمجموعات */}
        <div className="w-full md:w-72 shrink-0 border-l border-base-200/80 flex flex-col bg-base-200/30">
          <div className="p-2 border-b border-base-200/60">
            <p className="text-xs font-bold text-base-content/50 uppercase px-2 py-1">الموظفون</p>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto p-2">
            {chatContacts.length === 0 && !chatLoading && (
              <p className="text-base-content/40 text-sm p-4 text-center">لا يوجد موظفون آخرون</p>
            )}
            {chatContacts.map((contact) => {
              const unread = unreadDirect[contact.id] || 0;
              return (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => handleSelectContact(contact.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-right transition-colors relative ${
                    selectedContactId === contact.id ? 'bg-primary text-primary-content' : 'hover:bg-base-200 text-base-content'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-base-300 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-sm truncate flex-1">{contact.full_name || 'بدون اسم'}</span>
                  {unread > 0 && (
                    <span className="badge badge-sm badge-error min-w-[1.25rem] h-5 px-1">
                      {unread > 99 ? '99+' : unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-2 border-t border-base-200/60">
            <div className="flex items-center justify-between px-2 py-1">
              <p className="text-xs font-bold text-base-content/50 uppercase">المجموعات</p>
              <button
                type="button"
                onClick={() => setShowCreateGroupModal?.(true)}
                className="btn btn-ghost btn-xs gap-1 text-primary"
              >
                <Plus className="w-4 h-4" />
                إنشاء مجموعة
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto p-2">
            {chatGroups.length === 0 && (
              <p className="text-base-content/40 text-sm p-4 text-center">لا توجد مجموعات. أنشئ مجموعة للبدء.</p>
            )}
            {chatGroups.map((group) => {
              const unread = unreadGroups[group.id] || 0;
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => handleSelectGroup(group.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-right transition-colors ${
                    selectedChatGroupId === group.id ? 'bg-primary text-primary-content' : 'hover:bg-base-200 text-base-content'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-base-300 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-sm truncate flex-1">{group.name || 'مجموعة'}</span>
                  {unread > 0 && (
                    <span className="badge badge-sm badge-error min-w-[1.25rem] h-5 px-1">
                      {unread > 99 ? '99+' : unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* منطقة المحادثة */}
        <div className="flex-1 flex flex-col min-w-0">
          {!selectedContactId && !selectedChatGroupId ? (
            <div className="flex-1 flex items-center justify-center p-8 text-base-content/40">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-3 opacity-50" />
                <p className="font-bold">اختر محادثة أو مجموعة من القائمة</p>
              </div>
            </div>
          ) : (
            <>
              {/* رأس المحادثة */}
              <div className="p-3 border-b border-base-200/60 flex items-center gap-3 bg-base-100">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  {isGroup ? <Users className="w-5 h-5 text-primary" /> : <User className="w-5 h-5 text-primary" />}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-base-content block truncate">
                    {isGroup ? (selectedGroup?.name || 'مجموعة') : (selectedContact?.full_name || 'موظف')}
                  </span>
                  {isGroup && groupMembers.length > 0 && (
                    <p className="text-xs text-base-content/60 truncate">
                      {groupMembers.map((m) => m.full_name).join('، ')}
                    </p>
                  )}
                </div>
              </div>

              {isDirect && (
                <>
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
                </>
              )}

              {isGroup && (
                <>
                  {chatGroupLoading ? (
                    <div className="flex-1 flex items-center justify-center p-8">
                      <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {chatGroupMessages.length === 0 && (
                        <p className="text-base-content/40 text-sm text-center py-8">لا توجد رسائل في المجموعة بعد.</p>
                      )}
                      {chatGroupMessages.map((msg) => {
                        const isMe = msg.sender_id === currentUserId;
                        const senderName = senderNameMap[msg.sender_id] || 'موظف';
                        return (
                          <div key={msg.id} className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}>
                            <div
                              className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2.5 ${
                                isMe ? 'bg-primary text-primary-content rounded-br-md' : 'bg-base-200 text-base-content rounded-bl-md'
                              }`}
                            >
                              {!isMe && <p className="text-xs font-bold opacity-80 mb-0.5">{senderName}</p>}
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
                </>
              )}

              <div className="p-4 border-t border-base-200/80 bg-base-100">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (isDirect && canSendDirect) {
                      onSendMessage(chatInput.trim());
                      setChatInput('');
                    }
                    if (isGroup && canSendGroup) {
                      onSendChatGroupMessage(chatInput.trim());
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
                    disabled={(!selectedContactId && !selectedChatGroupId) || sendLoading || sendChatGroupLoading}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary rounded-2xl gap-2"
                    disabled={!(canSendDirect || canSendGroup)}
                  >
                    {(sendLoading || sendChatGroupLoading) ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                    إرسال
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      {/* نافذة إنشاء مجموعة */}
      {showCreateGroupModal && (
        <dialog open className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg">إنشاء مجموعة جديدة</h3>
            <form onSubmit={handleCreateGroup} className="mt-4 space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">اسم المجموعة</span>
                </label>
                <input
                  type="text"
                  value={createGroupName}
                  onChange={(e) => setCreateGroupName(e.target.value)}
                  placeholder="مثال: فريق المبيعات"
                  className="input input-bordered w-full"
                  autoFocus
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">إضافة أعضاء</span>
                </label>
                <div className="max-h-48 overflow-y-auto border border-base-200 rounded-xl p-2 space-y-1">
                  {chatContacts.length === 0 && (
                    <p className="text-base-content/50 text-sm p-2">لا يوجد موظفون لإضافتهم</p>
                  )}
                  {chatContacts.map((c) => (
                    <label key={c.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={createGroupSelectedIds.includes(c.id)}
                        onChange={() => toggleCreateGroupMember(c.id)}
                        className="checkbox checkbox-sm checkbox-primary"
                      />
                      <span className="text-sm font-medium">{c.full_name || 'بدون اسم'}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="modal-action">
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreateGroupModal(false)}>
                  إلغاء
                </button>
                <button type="submit" className="btn btn-primary" disabled={!createGroupName?.trim() || createGroupLoading}>
                  {createGroupLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  إنشاء المجموعة
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop" onClick={() => setShowCreateGroupModal(false)}>
            <button type="button">إغلاق</button>
          </form>
        </dialog>
      )}
    </motion.div>
  );
}
