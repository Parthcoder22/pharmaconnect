import React, { useState, useMemo, useEffect } from 'react';
import { chatService, normalizeMessage } from '../services/chatService';

export const OrderChat = ({
  orders = [],
  chatMessages = [],
  onSendMessage,
  onShowToast
}) => {
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

  const currentOrder = orders.find((o) => o.id === selectedOrderId) || orders[0] || null;
  const orderMessages = currentOrder
    ? allMessages.filter(
        (m) =>
          m.orderId === currentOrder.id ||
          m.order_id === currentOrder.id ||
          m.orderId === currentOrder.poReference ||
          m.order_id === currentOrder.poReference ||
          m.orderId === currentOrder.po_reference ||
          m.order_id === currentOrder.po_reference
      )
    : [];

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedOrderId) return;
    const msgText = inputText.trim();
    setInputText('');

    const optimisticMsg = normalizeMessage({
      id: `msg-${Date.now()}`,
      orderId: selectedOrderId,
      order_id: selectedOrderId,
      senderName: 'Supplier Representative',
      senderRole: 'supplier',
      message: msgText,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString()
    });

    setLiveMessages((prev) => [...prev, optimisticMsg]);

    if (onSendMessage) {
      await onSendMessage(selectedOrderId, msgText);
    }
    onShowToast?.('Message dispatched into order communications stream', 'send');
  };

  return (
    <div className="flex flex-col w-full bg-[#faf8ff] pb-16">
      <div className="p-4 sm:p-8 max-w-[1540px] mx-auto w-full space-y-6">
        {/* Banner */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#eaedff] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#131b2e]">
              Order Chat &amp; Communications
            </h1>
            <p className="text-xs sm:text-sm text-[#5e6b7f] mt-0.5">
              Direct messaging with hospital and retail pharmacy buyers regarding order fulfillment and dispatch
            </p>
          </div>
        </div>

        {/* Chat Workspace Split */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-[#eaedff] p-12 text-center flex flex-col items-center justify-center min-h-[420px]">
            <div className="w-16 h-16 rounded-2xl bg-[#f2f3ff] text-[#0047c1] flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl">chat_bubble_outline</span>
            </div>
            <h3 className="text-base font-bold text-[#131b2e] mb-1">No Active Order Threads</h3>
            <p className="text-xs text-[#5e6b7f] max-w-md mx-auto leading-relaxed">
              Order communications stream will automatically appear here once buyers place purchase orders for your formulations.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-3xl shadow-sm border border-[#eaedff] overflow-hidden min-h-[600px]">
            {/* Left Orders Sidebar */}
            <div className="lg:col-span-4 border-r border-[#eaedff] bg-[#f2f3ff]/40 p-4 space-y-2">
              <span className="text-[10px] font-bold uppercase text-[#434655] px-2 font-mono">
                Active Order Threads
              </span>

            <div className="space-y-1.5">
              {orders.map((po) => {
                const isSelected = po.id === selectedOrderId;
                return (
                  <button
                    key={po.id}
                    onClick={() => setSelectedOrderId(po.id)}
                    className={`w-full text-left p-3.5 rounded-2xl transition-all border ${
                      isSelected
                        ? 'bg-white shadow-sm border-[#0047c1]/30 ring-1 ring-[#0047c1]/20'
                        : 'bg-white/60 hover:bg-white border-[#eaedff]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-[#0047c1]">{po.poReference}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#80f3dd]/40 text-[#006f61] font-bold uppercase">
                        {po.status}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-[#131b2e] truncate mt-1">{po.buyerName}</div>
                    <div className="text-[11px] text-[#434655] truncate mt-0.5">
                      {po.items?.[0]?.medicineName || 'Pharmaceutical Supplies'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Message Box */}
          <div className="lg:col-span-8 flex flex-col justify-between h-[600px]">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-[#f2f3ff] border-b border-[#eaedff] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#131b2e]">{currentOrder?.poReference}</span>
                  <span className="font-mono text-xs text-[#434655]">({currentOrder?.buyerName})</span>
                </div>
                <div className="text-[11px] text-[#5e6b7f]">
                  Order Status: <strong className="text-[#0047c1] uppercase font-mono">{currentOrder?.status}</strong>
                </div>
              </div>

              <span className="font-mono text-xs font-bold text-[#0047c1]">
                ₹ {currentOrder?.netPayable?.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
              <div className="text-center">
                <span className="bg-[#eaedff] text-[#434655] px-3 py-1 rounded-full text-[10px] font-mono font-bold">
                  Order communication started for {currentOrder?.poReference}
                </span>
              </div>

              {orderMessages.length === 0 ? (
                <div className="py-16 text-center text-[#737687]">
                  <span className="material-symbols-outlined text-4xl text-[#c3c6d8] block mb-1">
                    chat_bubble_outline
                  </span>
                  <span>No messages recorded yet for this order. Post a message below.</span>
                </div>
              ) : (
                orderMessages.map((msg) => {
                  const isSupplier = msg.senderRole === 'supplier';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[80%] ${isSupplier ? 'ml-auto items-end' : 'items-start'}`}
                    >
                      <div
                        className={`p-3.5 rounded-2xl ${
                          isSupplier
                            ? 'bg-[#155eef] text-white rounded-tr-none'
                            : 'bg-[#f2f3ff] text-[#131b2e] rounded-tl-none border border-[#eaedff]'
                        }`}
                      >
                        {msg.message}
                      </div>
                      <span className="font-mono text-[10px] text-[#434655] mt-1">
                        {msg.senderName} • {msg.timestamp}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input bar */}
            <form onSubmit={handleSend} className="p-4 bg-[#f2f3ff] border-t border-[#eaedff] flex items-center gap-2">
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-white rounded-xl px-4 py-2.5 text-xs text-[#131b2e] placeholder:text-[#737687] focus:outline-none focus:ring-2 focus:ring-[#0047c1] border border-[#eaedff]"
                placeholder="Type statutory inquiry or transport temperature confirmation..."
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-[#155eef] text-white rounded-xl text-xs font-bold hover:bg-[#0047c1] transition-colors flex items-center gap-1.5"
              >
                <span>Send</span>
                <span className="material-symbols-outlined text-base">send</span>
              </button>
            </form>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};
