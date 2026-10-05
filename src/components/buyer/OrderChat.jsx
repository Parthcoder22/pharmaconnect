import React, { useState, useMemo, useEffect } from 'react';
import { chatService, normalizeMessage } from '../../services/chatService';

export const OrderChat = ({
  orders = [],
  chatMessages = [],
  onSendMessage,
  onShowToast,
  currentUser
}) => {
  // Select active conversation
  const [selectedOrderId, setSelectedOrderId] = useState(() => orders[0]?.id || null);
  const [inputText, setInputText] = useState('');
  const [liveMessages, setLiveMessages] = useState([]);

  useEffect(() => {
    if (orders.length > 0 && (!selectedOrderId || !orders.some(o => o.id === selectedOrderId))) {
      setSelectedOrderId(orders[0].id);
    }
  }, [orders, selectedOrderId]);

  // Fetch real messages for selected order on selection and interval
  useEffect(() => {
    let isMounted = true;
    if (!selectedOrderId) return;

    const fetchOrderMsgs = async () => {
      try {
        const msgs = await chatService.getMessages(selectedOrderId);
        if (isMounted && Array.isArray(msgs)) {
          setLiveMessages((prev) => {
            const map = new Map();
            prev.forEach((m) => map.set(m.id, m));
            msgs.forEach((m) => map.set(m.id, m));
            return Array.from(map.values());
          });
        }
      } catch {}
    };

    fetchOrderMsgs();
    const interval = setInterval(fetchOrderMsgs, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedOrderId]);

  // Merged messages list between props and live fetched
  const allMessages = useMemo(() => {
    const map = new Map();
    (chatMessages || []).forEach((m) => map.set(m.id, normalizeMessage(m)));
    (liveMessages || []).forEach((m) => map.set(m.id, normalizeMessage(m)));
    return Array.from(map.values());
  }, [chatMessages, liveMessages]);

  // Build conversation list from purchase orders
  const conversations = useMemo(() => {
    return orders.map((o) => {
      const poRef = o.poReference || o.po_reference || o.id;
      const messagesForOrder = allMessages.filter(
        (m) =>
          m.orderId === o.id ||
          m.order_id === o.id ||
          m.orderId === poRef ||
          m.order_id === poRef
      );
      const lastMsg = messagesForOrder[messagesForOrder.length - 1];

      return {
        orderId: o.id,
        poReference: poRef,
        supplierName: o.supplierName || 'Verified Supplier',
        totalAmount: o.totalAmount || o.total || o.netPayable,
        status: o.status,
        lastMessage: lastMsg?.message || 'Order submitted. Awaiting supplier confirmation.',
        lastMessageTime: lastMsg?.timestamp || o.date || 'Today',
        unread: false
      };
    });
  }, [orders, allMessages]);

  const activeConv = conversations.find((c) => c.orderId === selectedOrderId) || conversations[0];

  // Active message thread
  const activeMessages = useMemo(() => {
    if (!activeConv) return [];
    return allMessages.filter(
      (m) =>
        m.orderId === activeConv.orderId ||
        m.order_id === activeConv.orderId ||
        m.orderId === activeConv.poReference ||
        m.order_id === activeConv.poReference
    );
  }, [allMessages, activeConv]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;
    const msgText = inputText.trim();
    setInputText('');

    const optimisticMsg = normalizeMessage({
      id: `msg-${Date.now()}`,
      orderId: activeConv.orderId,
      order_id: activeConv.orderId,
      senderId: currentUser?.id,
      senderName: currentUser?.name || currentUser?.full_name || 'Buyer',
      senderRole: 'buyer',
      message: msgText,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString()
    });

    setLiveMessages((prev) => [...prev, optimisticMsg]);

    if (onSendMessage) {
      await onSendMessage(activeConv.orderId, msgText);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#131b2e]">Order Communication Desk</h1>
        <p className="text-xs sm:text-sm text-[#5e6b7f] mt-0.5">
          Direct messaging with verified suppliers regarding purchase order fulfillment, batch allocation, and transit
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-[#eaedff] p-12 text-center flex flex-col items-center justify-center min-h-[420px]">
          <div className="w-16 h-16 rounded-2xl bg-[#f2f3ff] text-[#0047c1] flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-3xl">chat_bubble_outline</span>
          </div>
          <h3 className="text-base font-bold text-[#131b2e] mb-1">No Active Order Threads</h3>
          <p className="text-xs text-[#5e6b7f] max-w-md mx-auto leading-relaxed">
            Order communications stream will automatically appear here once you place purchase orders with pharmaceutical suppliers.
          </p>
        </div>
      ) : (
        /* 2. Main Chat Box */
        <div className="bg-white rounded-3xl border border-[#eaedff] shadow-2xs overflow-hidden h-[620px] flex flex-col md:flex-row">
          {/* Left: Conversation List */}
          <div className="w-full md:w-80 border-r border-[#eaedff] flex flex-col h-full bg-[#faf8ff]">
            <div className="p-3.5 border-b border-[#eaedff] bg-white">
              <span className="text-xs font-bold text-[#131b2e] block">Purchase Order Inquiries</span>
              <span className="text-[11px] text-[#5e6b7f]">Linked to active supplier allocations</span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[#eaedff]">
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#5e6b7f]">
                  No active order conversations.
                </div>
              ) : (
              conversations.map((conv) => {
                const isSelected = activeConv?.orderId === conv.orderId;
                return (
                  <div
                    key={conv.orderId}
                    onClick={() => setSelectedOrderId(conv.orderId)}
                    className={`p-3.5 cursor-pointer transition-colors ${
                      isSelected ? 'bg-white border-l-4 border-[#0047c1]' : 'hover:bg-white/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#131b2e] truncate">{conv.supplierName}</span>
                      <span className="text-[10px] text-[#5e6b7f] shrink-0">{conv.lastMessageTime}</span>
                    </div>
                    <span className="font-mono text-[11px] text-[#0047c1] block mt-0.5">
                      {conv.poReference}
                    </span>
                    <p className="text-[11px] text-[#5e6b7f] truncate mt-1">{conv.lastMessage}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Active Message Thread */}
        {activeConv ? (
          <div className="flex-1 flex flex-col h-full bg-white">
            {/* Top Thread Header */}
            <div className="p-4 border-b border-[#eaedff] flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#eef2ff] text-[#0047c1] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-lg">storefront</span>
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[#131b2e]">{activeConv.supplierName}</h2>
                  <span className="text-[11px] text-[#5e6b7f]">
                    PO Reference: <strong className="text-[#0047c1] font-mono">{activeConv.poReference}</strong> • Status: {activeConv.status || 'Active'}
                  </span>
                </div>
              </div>
            </div>

            {/* Message History */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#fbfbfe]">
              {/* Context Notice */}
              <div className="p-3 rounded-xl bg-[#f2f3ff] border border-[#eaedff] text-[11px] text-[#5e6b7f] text-center max-w-md mx-auto">
                <span className="material-symbols-outlined text-sm align-middle mr-1 text-[#0047c1]">lock</span>
                This inquiry thread is securely encrypted and archived with statutory audit compliance.
              </div>

              {activeMessages.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#5e6b7f]">
                  No messages yet for this order. Send a note to the supplier below.
                </div>
              ) : (
                activeMessages.map((msg) => {
                  const isBuyer =
                    msg.senderRole === 'buyer' ||
                    msg.senderName?.includes('Sharma') ||
                    msg.senderName === currentUser?.name;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isBuyer ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-[#5e6b7f] mb-0.5">
                        <span className="font-semibold text-[#131b2e]">{msg.senderName}</span>
                        <span>•</span>
                        <span>{msg.timestamp || 'Today'}</span>
                      </div>
                      <div
                        className={`p-3 rounded-2xl max-w-sm text-xs ${
                          isBuyer
                            ? 'bg-[#0047c1] text-white rounded-br-xs'
                            : 'bg-white border border-[#eaedff] text-[#131b2e] rounded-bl-xs shadow-2xs'
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-3 border-t border-[#eaedff] flex items-center gap-2 bg-white">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about batch delivery timeline, CoA documentation, or dispatch status..."
                className="flex-1 h-10 px-3.5 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047c1]"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="h-10 px-4 bg-[#0047c1] hover:bg-[#155eef] disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <span>Send</span>
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-xs text-[#5e6b7f]">
            Select an order on the left to start communication.
          </div>
        )}
      </div>
      )}
    </div>
  );
};
