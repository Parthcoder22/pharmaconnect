import React, { useState, useEffect } from 'react';
import {
  CURRENT_SUPPLIER_USER,
  CURRENT_BUYER_USER,
  INITIAL_MEDICINES,
  INITIAL_ORDERS,
  INITIAL_COLD_CHAIN_LOGS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_PATIENT_BILLS
} from './data/mockData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { SupplierDashboard } from './components/SupplierDashboard';
import { MedicineCatalog } from './components/MedicineCatalog';
import { InvoiceAuditTrail } from './components/InvoiceAuditTrail';
import { BuyerDashboard } from './components/BuyerDashboard';
import { ExpiryAlerts } from './components/ExpiryAlerts';
import { RegulatoryKYC } from './components/RegulatoryKYC';
import { AnalyticsReports } from './components/AnalyticsReports';
import { OrderChat } from './components/OrderChat';
import { AuthModal } from './components/AuthModal';
import { PoReviewModal } from './components/PoReviewModal';
import { CoaModal } from './components/CoaModal';

// Supplier Portal Modular Suite
import { SupplierLayout } from './components/supplier/SupplierLayout';
import { SupplierOverview } from './components/supplier/SupplierOverview';
import { MedicineInventory } from './components/supplier/MedicineInventory';
import { PurchaseOrders } from './components/supplier/PurchaseOrders';
import { BatchExpiry } from './components/supplier/BatchExpiry';
import { InvoicesPayments } from './components/supplier/InvoicesPayments';
import { AnalyticsReports as SupplierAnalytics } from './components/supplier/AnalyticsReports';
import { BusinessVerification } from './components/supplier/BusinessVerification';
import { SupplierSettings } from './components/supplier/SupplierSettings';

// Buyer Portal Modular Suite
import { BuyerLayout } from './components/buyer/BuyerLayout';
import { BuyerOverview } from './components/buyer/BuyerOverview';
import { BrowseMedicines } from './components/buyer/BrowseMedicines';
import { ShoppingCart } from './components/buyer/ShoppingCart';
import { MyOrders } from './components/buyer/MyOrders';
import { SavedMedicines } from './components/buyer/SavedMedicines';
import { InvoicesPayments as BuyerInvoicesPayments } from './components/buyer/InvoicesPayments';
import { SupplierDirectory } from './components/buyer/SupplierDirectory';
import { OrderChat as BuyerOrderChat } from './components/buyer/OrderChat';
import { AnalyticsReports as BuyerAnalytics } from './components/buyer/AnalyticsReports';
import { BusinessVerification as BuyerBusinessVerification } from './components/buyer/BusinessVerification';
import { BuyerSettings } from './components/buyer/BuyerSettings';
import { SupplierConflictModal } from './components/buyer/SupplierConflictModal';
import { CertificationModal } from './components/common/CertificationModal';

// Backend Services
import { authService } from './services/authService';
import { medicineService } from './services/medicineService';
import { orderService } from './services/orderService';
import { chatService } from './services/chatService';
import { patientBillService } from './services/patientBillService';
import { paymentService } from './services/paymentService';
import { notificationService } from './services/notificationService';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('pharmaconnect_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [activeView, setActiveView] = useState(() => {
    try {
      const savedUser = localStorage.getItem('pharmaconnect_user');
      const savedView = sessionStorage.getItem('pharmaconnect_active_view');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (savedView && savedView !== 'landing') return savedView;
        if (u?.role === 'supplier') return 'overview-dashboard';
        if (u?.role === 'buyer') return 'buyer-overview';
      }
    } catch {}
    return 'landing';
  });

  const navigateTo = (view) => {
    setActiveView(view);
    try {
      sessionStorage.setItem('pharmaconnect_active_view', view);
    } catch {}
  };
  const [authInitialRole, setAuthInitialRole] = useState('supplier');
  const [authInitialMode, setAuthInitialMode] = useState('signin');
  const isDemoPersona = (user) => {
    if (!user) return false;
    const email = user.email?.toLowerCase() || '';
    return user.id === 'usr-supp-01' || user.id === 'usr-buy-01' || user.id === 'usr-buyer-01' ||
      user.id === 'usr-admin-01' || email.includes('novartis') || email.includes('apexhealth') ||
      email.includes('thorne') || email.includes('sharma');
  };
  const isDemoSupplier = (user) => {
    return isDemoPersona(user) && (user?.role === 'supplier' || user?.id === 'usr-supp-01');
  };

  const [medicines, setMedicines] = useState(() => {
    try {
      const saved = localStorage.getItem('pharmaconnect_marketplace_medicines');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });
  const [supplierMedicines, setSupplierMedicines] = useState(() => {
    try {
      const saved = localStorage.getItem('pharmaconnect_user');
      const parsed = saved ? JSON.parse(saved) : null;
      if (parsed?.role === 'supplier' && isDemoSupplier(parsed)) {
        return INITIAL_MEDICINES;
      }
    } catch {}
    return [];
  });
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('pharmaconnect_user');
      const parsed = saved ? JSON.parse(saved) : null;
      if (parsed && isDemoPersona(parsed)) {
        return INITIAL_ORDERS;
      }
    } catch {}
    return [];
  });
  const [chatMessages, setChatMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('pharmaconnect_user');
      const parsed = saved ? JSON.parse(saved) : null;
      if (parsed && isDemoPersona(parsed)) {
        return INITIAL_CHAT_MESSAGES;
      }
    } catch {}
    return [];
  });
  const [patientBills, setPatientBills] = useState(() => {
    try {
      const saved = localStorage.getItem('pharmaconnect_user');
      const parsed = saved ? JSON.parse(saved) : null;
      if (parsed && isDemoPersona(parsed) && parsed.role === 'buyer') {
        return INITIAL_PATIENT_BILLS;
      }
    } catch {}
    return [];
  });
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [destinationHub, setDestinationHub] = useState(
    'St. Jude Medical Center — Wing B Central Store'
  );

  // Initial load from backend API
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [loadedMeds, loadedOrders] = await Promise.all([
          medicineService.getMarketplaceMedicines(),
          orderService.getOrders()
        ]);
        if (Array.isArray(loadedMeds)) {
          setMedicines(loadedMeds);
          try {
            localStorage.setItem('pharmaconnect_marketplace_medicines', JSON.stringify(loadedMeds));
          } catch {}
        }

        // Load scoped supplier inventory
        if (currentUser?.role === 'supplier') {
          if (!isDemoSupplier(currentUser)) {
            const mySupplierMeds = await medicineService.getSupplierMedicines();
            if (isMounted) {
              setSupplierMedicines(Array.isArray(mySupplierMeds) ? mySupplierMeds : []);
            }
          } else {
            if (isMounted) {
              setSupplierMedicines(loadedMeds?.length ? loadedMeds : INITIAL_MEDICINES);
            }
          }
        }

        if (Array.isArray(loadedOrders)) {
          if (currentUser) {
            setOrders(loadedOrders);
            setSelectedOrderId(loadedOrders[0]?.id || null);
          } else if (loadedOrders.length > 0) {
            setOrders(loadedOrders);
            setSelectedOrderId(loadedOrders[0].id);
          }
        }

        // Only load hospital patient records if authenticated as buyer
        if (currentUser?.role === 'buyer') {
          const loadedBills = await patientBillService.getBills();
          if (isMounted && loadedBills?.length) setPatientBills(loadedBills);
        }

        // Dynamically sync real chat messages
        try {
          const loadedChat = await chatService.getAllMessages();
          if (isMounted && Array.isArray(loadedChat) && loadedChat.length > 0) {
            setChatMessages(loadedChat);
          }
        } catch {}

        // Dynamically sync real user notifications
        try {
          const notifRes = await notificationService.getNotifications();
          if (isMounted && notifRes && Array.isArray(notifRes.notifications)) {
            const formatted = notifRes.notifications.map((n) => ({
              id: n.id,
              title: n.title,
              message: n.message || n.description,
              description: n.message || n.description,
              time: n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
              read: Boolean(n.is_read),
              targetView: n.targetView || (n.type?.includes('ORDER') ? 'purchase-orders' : 'overview-dashboard')
            }));
            if (currentUser?.role === 'supplier') {
              setSupplierNotifications(formatted);
            } else if (currentUser?.role === 'buyer') {
              setBuyerNotifications(formatted);
            }
          }
        } catch {
          // ignore
        }
      } catch (err) {
        console.warn('[App] Backend initial sync error:', err.message);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [currentUser?.id, currentUser?.role]);

  // Refetch latest medicines and orders on view navigation to guarantee cross-user sync
  useEffect(() => {
    if (activeView === 'browse-medicines' || activeView === 'medicine-catalog' || activeView === 'buyer-overview') {
      medicineService.getMarketplaceMedicines().then((freshMeds) => {
        if (Array.isArray(freshMeds) && freshMeds.length > 0) {
          setMedicines(freshMeds);
          try {
            localStorage.setItem('pharmaconnect_marketplace_medicines', JSON.stringify(freshMeds));
          } catch {}
        }
      }).catch(() => {});
    }

    if (
      activeView === 'my-orders' ||
      activeView === 'purchase-orders' ||
      activeView === 'invoices-payments' ||
      activeView === 'invoices-gst' ||
      activeView === 'order-chat' ||
      activeView === 'analytics-reports' ||
      activeView === 'buyer-overview' ||
      activeView === 'overview-dashboard'
    ) {
      orderService.getOrders().then((freshOrders) => {
        if (Array.isArray(freshOrders)) {
          setOrders(freshOrders);
        }
      }).catch(() => {});
    }

    if (activeView === 'order-chat') {
      chatService.getAllMessages().then((freshMsgs) => {
        if (Array.isArray(freshMsgs) && freshMsgs.length > 0) {
          setChatMessages(freshMsgs);
        }
      }).catch(() => {});
    }
  }, [activeView]);

  // Cart state - strictly isolated per logged-in user (empty by default for new buyers)
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('pharmaconnect_user');
      const user = saved ? JSON.parse(saved) : null;
      if (!user) return [];
      const userCartKey = `pharmaconnect_cart_${user.id}`;
      const savedCart = localStorage.getItem(userCartKey);
      if (savedCart) return JSON.parse(savedCart);
    } catch {}
    return [];
  });

  // Saved medicines formulary - strictly isolated per logged-in user
  const [savedMedicines, setSavedMedicines] = useState(() => {
    try {
      const saved = localStorage.getItem('pharmaconnect_user');
      const user = saved ? JSON.parse(saved) : null;
      if (!user) return [];
      const userSavedKey = `pharmaconnect_saved_${user.id}`;
      const savedList = localStorage.getItem(userSavedKey);
      if (savedList) return JSON.parse(savedList);
    } catch {}
    return [];
  });

  // Sync cart and saved medicines to localStorage per user
  useEffect(() => {
    if (currentUser?.id) {
      try {
        localStorage.setItem(`pharmaconnect_cart_${currentUser.id}`, JSON.stringify(cartItems));
      } catch {}
    }
  }, [cartItems, currentUser?.id]);

  useEffect(() => {
    if (currentUser?.id) {
      try {
        localStorage.setItem(`pharmaconnect_saved_${currentUser.id}`, JSON.stringify(savedMedicines));
      } catch {}
    }
  }, [savedMedicines, currentUser?.id]);

  // Buyer notification alerts
  const [buyerNotifications, setBuyerNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('pharmaconnect_user');
      const parsed = saved ? JSON.parse(saved) : null;
      if (parsed && !isDemoSupplier(parsed) && parsed.id !== 'usr-buy-01') {
        return [];
      }
    } catch {}
    return [];
  });

  // Modals & UI states
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPoReviewOpen, setIsPoReviewOpen] = useState(false);
  const [inspectingCoa, setInspectingCoa] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [supplierConflict, setSupplierConflict] = useState({
    isOpen: false,
    currentSupplierName: '',
    newSupplierName: '',
    pendingMedicine: null,
    pendingQuantity: 100,
    pendingUnitPrice: null,
    cartItemCount: 1
  });
  const [certificationModal, setCertificationModal] = useState({
    isOpen: false,
    role: 'buyer',
    action: 'buy'
  });

  // Toast state
  const [toast, setToast] = useState({
    message: '',
    icon: 'check_circle',
    visible: false
  });

  const showToast = (message, icon = 'check_circle') => {
    setToast({ message, icon, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3800);
  };

  const handleLogin = async (user) => {
    setCurrentUser(user);
    const targetDashboard = user.role === 'supplier' ? 'overview-dashboard' : 'buyer-overview';
    setActiveView(targetDashboard);
    try {
      sessionStorage.setItem('pharmaconnect_active_view', targetDashboard);
      localStorage.setItem('pharmaconnect_user', JSON.stringify(user));
    } catch (e) {}
    const isDemo = isDemoSupplier(user) || user.id === 'usr-buy-01' || user.id === 'usr-buyer-01';
    if (!isDemo) {
      try {
        const userCartKey = `pharmaconnect_cart_${user.id}`;
        const savedCart = localStorage.getItem(userCartKey);
        setCartItems(savedCart ? JSON.parse(savedCart) : []);
        const userSavedKey = `pharmaconnect_saved_${user.id}`;
        const savedList = localStorage.getItem(userSavedKey);
        setSavedMedicines(savedList ? JSON.parse(savedList) : []);
      } catch {
        setCartItems([]);
        setSavedMedicines([]);
      }
      setChatMessages([]);
      setOrders([]);
      setSupplierNotifications([]);
      setBuyerNotifications([]);
      if (user.role === 'supplier') {
        setSupplierMedicines([]);
        try {
          const [myMeds, notifRes] = await Promise.all([
            medicineService.getSupplierMedicines(),
            notificationService.getNotifications()
          ]);
          setSupplierMedicines(Array.isArray(myMeds) ? myMeds : []);
          if (notifRes?.notifications?.length) {
            setSupplierNotifications(
              notifRes.notifications.map((n) => ({
                id: n.id,
                title: n.title,
                message: n.message || n.description,
                description: n.message || n.description,
                time: n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
                read: Boolean(n.is_read),
                targetView: n.targetView || 'overview-dashboard'
              }))
            );
          }
        } catch {
          // ignore
        }
      } else if (user.role === 'buyer') {
        try {
          const notifRes = await notificationService.getNotifications();
          if (notifRes?.notifications?.length) {
            setBuyerNotifications(
              notifRes.notifications.map((n) => ({
                id: n.id,
                title: n.title,
                message: n.message || n.description,
                description: n.message || n.description,
                time: n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
                read: Boolean(n.is_read),
                targetView: n.targetView || 'my-orders'
              }))
            );
          }
        } catch {
          // ignore
        }
      }
    } else {
      if (user.role === 'supplier') {
        setSupplierMedicines(INITIAL_MEDICINES);
      }
    }

    try {
      const freshMeds = await medicineService.getMarketplaceMedicines();
      if (Array.isArray(freshMeds)) {
        setMedicines(freshMeds);
        try {
          localStorage.setItem('pharmaconnect_marketplace_medicines', JSON.stringify(freshMeds));
        } catch {}
      }
    } catch {}

    try {
      const [freshOrders, freshMsgs] = await Promise.all([
        orderService.getOrders(),
        chatService.getAllMessages()
      ]);
      if (Array.isArray(freshOrders)) setOrders(freshOrders);
      if (Array.isArray(freshMsgs) && freshMsgs.length > 0) setChatMessages(freshMsgs);
    } catch {}

    setActiveView(user.role === 'supplier' ? 'overview-dashboard' : 'buyer-overview');
    showToast(`Welcome, ${user.name || user.organization}!`, 'verified');
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.warn('Logout fallback:', e);
    }
    localStorage.removeItem('pharmaconnect_user');
    localStorage.removeItem('pharmaconnect_token');
    try {
      sessionStorage.removeItem('pharmaconnect_active_view');
    } catch (e) {}
    setCurrentUser(null);
    setCartItems([]);
    setSavedMedicines([]);
    setSupplierMedicines([]);
    setOrders([]);
    setChatMessages([]);
    setPatientBills([]);
    setSupplierNotifications([]);
    setBuyerNotifications([]);
    setActiveView('landing');
    showToast('Logged out successfully. Returned to homepage.', 'logout');
  };

  const handleSwitchUserRole = async (role) => {
    try {
      const user = await authService.getDemoPersona(role);
      setCurrentUser(user);
      localStorage.setItem('pharmaconnect_user', JSON.stringify(user));
      setChatMessages(INITIAL_CHAT_MESSAGES);
      if (role === 'supplier') setSupplierMedicines(INITIAL_MEDICINES);
      const freshMeds = await medicineService.getMarketplaceMedicines();
      if (Array.isArray(freshMeds)) {
        setMedicines(freshMeds);
        try {
          localStorage.setItem('pharmaconnect_marketplace_medicines', JSON.stringify(freshMeds));
        } catch {}
      }
      try {
        const cartKey = `pharmaconnect_cart_${user.id}`;
        setCartItems(JSON.parse(localStorage.getItem(cartKey) || '[]'));
        const savedKey = `pharmaconnect_saved_${user.id}`;
        setSavedMedicines(JSON.parse(localStorage.getItem(savedKey) || '[]'));
      } catch {}
    } catch {
      const fallbackUser = role === 'supplier' ? CURRENT_SUPPLIER_USER : CURRENT_BUYER_USER;
      setCurrentUser(fallbackUser);
      localStorage.setItem('pharmaconnect_user', JSON.stringify(fallbackUser));
      setChatMessages(INITIAL_CHAT_MESSAGES);
      if (role === 'supplier') setSupplierMedicines(INITIAL_MEDICINES);
    }
    setActiveView(role === 'supplier' ? 'overview-dashboard' : 'buyer-overview');
    showToast(
      `Switched to ${role === 'supplier' ? 'Manufacturer Supplier' : 'Hospital Buyer'} persona`,
      'swap_horiz'
    );
  };

  const handleUserVerified = (updatedUserData) => {
    const updatedUser = {
      ...currentUser,
      ...updatedUserData,
      verificationStatus: 'verified',
      verification_status: 'verified'
    };
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('pharmaconnect_user', JSON.stringify(updatedUser));
    } catch {}
    showToast(
      `Account verified as Certified ${updatedUser.role === 'supplier' ? 'WHO-GMP Manufacturer' : 'CDSCO Institutional Buyer'}!`,
      'verified'
    );
  };

  const getSellerInfo = (item) => {
    if (!item) return { key: 'default_seller', id: 'usr-supp-01', name: 'Verified Manufacturer' };
    const rawName = (
      item.supplierName ||
      item.manufacturer ||
      item.supplier?.company_name ||
      item.supplier?.name ||
      item.medicine?.supplierName ||
      item.medicine?.manufacturer ||
      ''
    ).trim();

    const rawId = (
      item.supplierId ||
      item.supplier_id ||
      item.supplier?.id ||
      item.medicine?.supplierId ||
      item.medicine?.supplier_id ||
      ''
    ).trim();

    const key = rawName
      ? rawName.toLowerCase().replace(/[^a-z0-9]/g, '')
      : (rawId ? String(rawId).toLowerCase() : 'default_seller');

    const name = rawName || (rawId ? `Manufacturer (${rawId})` : 'Verified Manufacturer');

    return { key, id: rawId || key, name };
  };

  const handleAddToCart = (medicine, quantity, customUnitPrice) => {
    if (!currentUser) {
      setAuthInitialRole('buyer');
      setAuthInitialMode('signin');
      setIsAuthOpen(true);
      showToast('Please sign in as a licensed buyer to add items to cart', 'lock');
      return;
    }

    // Gating: Only certified buyers can purchase / add prescription formulations
    if (currentUser.role === 'buyer' && currentUser.verificationStatus !== 'verified' && currentUser.verification_status !== 'verified') {
      setCertificationModal({
        isOpen: true,
        role: 'buyer',
        action: 'buy'
      });
      showToast('CDSCO Statutory Buyer Verification required before purchasing medicines', 'lock');
      return;
    }

    const medId = medicine.id || medicine.medicineId;
    const price = Number(customUnitPrice ?? medicine.unitPrice ?? medicine.baseWholesalePrice ?? 120);
    const qty = Number(quantity) || medicine.moq || 100;

    const newSeller = getSellerInfo(medicine);

    // Enforce Single-Seller Cart Policy: only medicines from 1 seller at a time
    if (cartItems.length > 0) {
      const currentSeller = getSellerInfo(cartItems[0]);
      const isDifferentSeller = currentSeller.key !== newSeller.key &&
        Boolean(currentSeller.key && newSeller.key);

      if (isDifferentSeller) {
        setSupplierConflict({
          isOpen: true,
          currentSupplierName: currentSeller.name,
          newSupplierName: newSeller.name,
          pendingMedicine: medicine,
          pendingQuantity: qty,
          pendingUnitPrice: price,
          cartItemCount: cartItems.length
        });
        return;
      }
    }

    const existingIndex = cartItems.findIndex(
      (ci) => ci.id === medId || ci.medicine?.id === medId
    );

    if (existingIndex >= 0) {
      const updated = [...cartItems];
      const existing = updated[existingIndex];
      const newQty = (existing.quantity || 0) + qty;
      updated[existingIndex] = {
        ...existing,
        quantity: newQty,
        unitPrice: price,
        supplierId: existing.supplierId || newSeller.id,
        supplierName: existing.supplierName || newSeller.name,
        manufacturer: existing.manufacturer || newSeller.name,
        medicine: existing.medicine || medicine
      };
      setCartItems(updated);
    } else {
      const newItem = {
        id: medId,
        medicineId: medId,
        name: medicine.name || medicine.brand,
        brand: medicine.brand || medicine.name,
        genericName: medicine.genericName || medicine.generic_name || medicine.composition || '',
        strength: medicine.strength || '',
        dosageForm: medicine.dosageForm || medicine.dosage_form || 'Formulation',
        packSize: medicine.packSize || medicine.packaging || `${qty} Units`,
        supplierId: newSeller.id,
        supplierName: newSeller.name,
        manufacturer: newSeller.name,
        unitPrice: price,
        quantity: qty,
        moq: medicine.moq || 50,
        gstRate: medicine.gstRate || 12,
        image: medicine.image || '',
        medicine: medicine
      };
      setCartItems([...cartItems, newItem]);
    }
    showToast(`Added ${qty} units of ${medicine.name || medicine.brand} to cart`, 'add_shopping_cart');
  };

  const handleConfirmReplaceCart = () => {
    const { pendingMedicine, pendingQuantity, pendingUnitPrice } = supplierConflict;
    if (!pendingMedicine) return;

    const medId = pendingMedicine.id || pendingMedicine.medicineId;
    const price = Number(pendingUnitPrice ?? pendingMedicine.unitPrice ?? pendingMedicine.baseWholesalePrice ?? 120);
    const qty = Number(pendingQuantity) || pendingMedicine.moq || 100;
    const seller = getSellerInfo(pendingMedicine);

    const newItem = {
      id: medId,
      medicineId: medId,
      name: pendingMedicine.name || pendingMedicine.brand,
      brand: pendingMedicine.brand || pendingMedicine.name,
      genericName: pendingMedicine.genericName || pendingMedicine.generic_name || pendingMedicine.composition || '',
      strength: pendingMedicine.strength || '',
      dosageForm: pendingMedicine.dosageForm || pendingMedicine.dosage_form || 'Formulation',
      packSize: pendingMedicine.packSize || pendingMedicine.packaging || `${qty} Units`,
      supplierId: seller.id,
      supplierName: seller.name,
      manufacturer: seller.name,
      unitPrice: price,
      quantity: qty,
      moq: pendingMedicine.moq || 50,
      gstRate: pendingMedicine.gstRate || 12,
      image: pendingMedicine.image || '',
      medicine: pendingMedicine
    };

    setCartItems([newItem]);
    setSupplierConflict((prev) => ({ ...prev, isOpen: false, pendingMedicine: null }));
    showToast(`Cart replaced: 1 item from ${seller.name}`, 'swap_horiz');
  };

  const handleCheckoutCurrentSupplier = () => {
    setSupplierConflict((prev) => ({ ...prev, isOpen: false, pendingMedicine: null }));
    setActiveView('shopping-cart');
    showToast('Proceeding to checkout current manufacturer order', 'shopping_cart_checkout');
  };

  const handleCancelSupplierConflict = () => {
    setSupplierConflict((prev) => ({ ...prev, isOpen: false, pendingMedicine: null }));
  };

  const handleAddToPo = (medicine, quantity, unitPrice) => {
    handleAddToCart(medicine, quantity, unitPrice);
  };

  const handleUpdateCartQty = (medId, quantity) => {
    setCartItems(
      cartItems.map((ci) =>
        ci.id === medId || ci.medicine?.id === medId
          ? { ...ci, quantity: Number(quantity) }
          : ci
      )
    );
  };

  const handleRemoveCartItem = (medId) => {
    setCartItems(cartItems.filter((ci) => ci.id !== medId && ci.medicine?.id !== medId));
    showToast('Line item removed from cart', 'delete');
  };

  const handleClearCart = () => {
    setCartItems([]);
    showToast('Shopping cart cleared', 'delete_sweep');
  };

  const handleToggleSaveMedicine = (medicine) => {
    const isAlreadySaved = savedMedicines.some((m) => m.id === medicine.id);
    let updated;
    if (isAlreadySaved) {
      updated = savedMedicines.filter((m) => m.id !== medicine.id);
      showToast(`Removed ${medicine.name || medicine.brand} from Saved Formulary`, 'bookmark_border');
    } else {
      updated = [
        ...savedMedicines,
        {
          id: medicine.id,
          name: medicine.name || medicine.brand,
          brand: medicine.brand || medicine.name,
          genericName: medicine.genericName || medicine.generic_name || medicine.composition || '',
          strength: medicine.strength || '',
          dosageForm: medicine.dosageForm || medicine.dosage_form || 'Formulation',
          unitPrice: Number(medicine.unitPrice ?? medicine.baseWholesalePrice ?? 120),
          moq: medicine.moq || 50,
          stock: medicine.stock ?? medicine.total_stock_available ?? 10000,
          manufacturer: medicine.manufacturer || medicine.supplierName || 'Verified Supplier',
          savedAt: 'Just now'
        }
      ];
      showToast(`Saved ${medicine.name || medicine.brand} to Saved Formulary`, 'bookmark');
    }
    setSavedMedicines(updated);
    try {
      localStorage.setItem('pharmaconnect_saved_medicines', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleRemoveFromSaved = (id) => {
    const updated = savedMedicines.filter((m) => m.id !== id);
    setSavedMedicines(updated);
    try {
      localStorage.setItem('pharmaconnect_saved_medicines', JSON.stringify(updated));
    } catch (e) {}
    showToast('Removed formulation from saved list', 'delete');
  };

  const handleSubmitCartPo = async () => {
    if (cartItems.length === 0) return;

    try {
      const newOrder = await orderService.createPurchaseOrder(destinationHub, cartItems);
      setOrders([newOrder, ...orders]);
      setCartItems([]);
      setIsPoReviewOpen(false);
      setSelectedOrderId(newOrder.id);
      setActiveView('invoices-gst');
      showToast(`Purchase Request ${newOrder.poReference} placed with manufacturer!`, 'verified');
    } catch (err) {
      // Graceful fallback
      const subtotal = cartItems.reduce((acc, ci) => acc + ci.quantity * ci.unitPrice, 0);
      const cgst = subtotal * 0.06;
      const sgst = subtotal * 0.06;
      const net = subtotal + cgst + sgst;

      const newOrder = {
        id: `po-${Date.now()}`,
        poReference: `PO-2025-${Math.floor(1000 + Math.random() * 9000)}B`,
        buyerId: currentUser.id,
        buyerName: currentUser.organization,
        buyerLicense: currentUser.licenseNumber,
        buyerGstin: currentUser.gstin,
        buyerAddress: 'Central Pharmacy Stores, St. Jude Medical Center, Wing B Central Store',
        supplierId: 'usr-supp-01',
        supplierName: 'Novartis Lifesciences Bio-Pharma Ltd.',
        supplierLicense: 'MH-PUN-20B-184920',
        supplierGstin: '27AAACN0192Q1ZV',
        supplierAddress: 'Plot 42-B, Kurkumbh, Pune',
        destinationHub,
        status: 'requested',
        createdAt: 'Just now',
        taxableTotal: subtotal,
        cgstTotal: cgst,
        sgstTotal: sgst,
        netPayable: net,
        amountInWords: 'Indian Rupees Institutional Order',
        items: cartItems.map((ci) => ({
          medicineId: ci.medicine.id,
          medicineName: ci.medicine.name,
          genericFormula: ci.medicine.genericName,
          batchNumber: ci.medicine.activeBatch?.batchNumber || '#LOT-BATCH',
          hsnCode: '3004 20 42',
          mfgDate: ci.medicine.activeBatch?.manufacturingDate || '01/2025',
          expDate: ci.medicine.activeBatch?.expiryDate || '12/2027',
          quantity: ci.quantity,
          packSize: `${ci.quantity} Units`,
          unitPrice: ci.unitPrice,
          taxableAmount: ci.quantity * ci.unitPrice,
          cgstRate: 6,
          sgstRate: 6,
          cgstAmount: ci.quantity * ci.unitPrice * 0.06,
          sgstAmount: ci.quantity * ci.unitPrice * 0.06,
          totalAmount: ci.quantity * ci.unitPrice * 1.12
        }))
      };

      setOrders([newOrder, ...orders]);
      setCartItems([]);
      setIsPoReviewOpen(false);
      setSelectedOrderId(newOrder.id);
      setActiveView('invoices-gst');
      showToast(`Purchase Request ${newOrder.poReference} placed with manufacturer!`, 'verified');
    }
  };

  const handleAcceptOrder = async (poRef) => {
    try {
      await orderService.acceptOrder(poRef);
    } catch (e) {
      console.warn('API acceptOrder fallback:', e.message);
    }
    setOrders(
      orders.map((o) => (o.poReference === poRef || o.id === poRef ? { ...o, status: 'accepted' } : o))
    );
    showToast(`Order ${poRef} approved. Picking list dispatched to cleanroom packing floor.`, 'check_circle');
  };

  const handleRejectOrder = async (poRef, reason, notes) => {
    try {
      await orderService.rejectOrder(poRef, reason, notes);
    } catch (e) {
      console.warn('API rejectOrder fallback:', e.message);
    }
    setOrders(
      orders.map((o) =>
        o.poReference === poRef || o.id === poRef
          ? { ...o, status: 'rejected', rejectionReason: reason, rejectionNotes: notes }
          : o
      )
    );
    showToast(`Order ${poRef} rejected. CDSCO regulatory reason recorded in compliance log.`, 'block');
  };

  const handleAddSku = async (skuData) => {
    try {
      const newMed = await medicineService.addMedicineSku(skuData);
      setSupplierMedicines((prev) => [newMed, ...prev]);
      setMedicines((prev) => [newMed, ...prev]);
      showToast(`Formulation ${newMed.name || skuData.name || 'New Medicine'} added to verified catalog`, 'verified');
    } catch (err) {
      showToast(`Failed to add formulation: ${err.message}`, 'error');
    }
  };

  const handleSendChatMessage = async (orderId, message) => {
    try {
      const newMsg = await chatService.sendMessage(orderId, message);
      setChatMessages([...chatMessages, newMsg]);
    } catch {
      const fallbackMsg = {
        id: `msg-${Date.now()}`,
        orderId,
        senderName: currentUser.name,
        senderRole: currentUser.role === 'supplier' ? 'supplier' : 'buyer',
        timestamp: 'Just now',
        message
      };
      setChatMessages([...chatMessages, fallbackMsg]);
    }
  };

  const handlePaymentSuccess = async (orderId) => {
    const targetOrder = orders.find((o) => o.id === orderId || o.poReference === orderId);
    if (!targetOrder) return;

    try {
      showToast('Connecting to Razorpay Commercial Escrow gateway...', 'payments');
      await paymentService.launchRazorpayCheckout({
        order: targetOrder,
        onVerified: async (paymentRes) => {
          setOrders((prev) =>
            prev.map((o) =>
              (o.id === orderId || o.poReference === orderId)
                ? {
                    ...o,
                    status: 'paid',
                    paymentStatus: 'paid',
                    payment_status: 'paid',
                    paidAt: new Date().toLocaleDateString('en-GB'),
                    paymentReference: paymentRes.razorpay_payment_id || `RZP-${Date.now()}`
                  }
                : o
            )
          );
          showToast(`Invoice payment of ₹${Number(targetOrder.netPayable || targetOrder.totalAmount || 0).toLocaleString('en-IN')} confirmed via Razorpay!`, 'verified');
          try {
            const freshOrders = await orderService.getOrders();
            if (Array.isArray(freshOrders)) setOrders(freshOrders);
          } catch {}
        },
        onError: (err) => {
          showToast(`Payment error: ${err.message || 'Payment cancelled'}`, 'error');
        }
      });
    } catch (err) {
      console.warn('Payment launch error:', err);
      setOrders(
        orders.map((o) =>
          (o.id === orderId || o.poReference === orderId)
            ? {
                ...o,
                status: 'paid',
                paymentStatus: 'paid',
                payment_status: 'paid',
                paidAt: new Date().toLocaleDateString('en-GB')
              }
            : o
        )
      );
      showToast('Invoice settled in platform ledger', 'verified');
    }
  };

  const [isAddMedicineModalOpen, setIsAddMedicineModalOpen] = useState(false);
  const [supplierNotifications, setSupplierNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('pharmaconnect_user');
      const parsed = saved ? JSON.parse(saved) : null;
      if (parsed && !isDemoSupplier(parsed)) {
        return [];
      }
    } catch {}
    return [];
  });

  const handleMarkNotificationRead = async (notifId, role = 'supplier') => {
    if (role === 'supplier') {
      setSupplierNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
      );
    } else {
      setBuyerNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
      );
    }
    try {
      await notificationService.markAsRead(notifId);
    } catch {}
  };

  const handleMarkAllNotificationsRead = async (role = 'supplier') => {
    if (role === 'supplier') {
      setSupplierNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } else {
      setBuyerNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
    try {
      await notificationService.markAllAsRead();
    } catch {}
  };

  const handleAddMedicine = async (medicineData) => {
    if (currentUser?.role === 'supplier' && currentUser?.verificationStatus !== 'verified' && currentUser?.verification_status !== 'verified') {
      setCertificationModal({
        isOpen: true,
        role: 'supplier',
        action: 'sell'
      });
      showToast('WHO-GMP Manufacturer Verification required to list and sell formulations', 'lock');
      return;
    }

    try {
      const newMed = await medicineService.addMedicineSku({
        ...medicineData,
        manufacturer: currentUser?.organization || currentUser?.name || medicineData.manufacturer
      });

      // 1. Add to supplier inventory
      setSupplierMedicines((prev) => {
        const exists = prev.some((m) => m.id === newMed.id);
        return exists ? prev.map((m) => (m.id === newMed.id ? newMed : m)) : [newMed, ...prev];
      });

      // 2. Add to marketplace catalog visible to BUYERS
      setMedicines((prev) => {
        const exists = prev.some((m) => m.id === newMed.id);
        const updated = exists ? prev.map((m) => (m.id === newMed.id ? newMed : m)) : [newMed, ...prev];
        try {
          localStorage.setItem('pharmaconnect_marketplace_medicines', JSON.stringify(updated));
        } catch {}
        return updated;
      });

      showToast(`"${newMed.name}" listed in inventory and published to buyer marketplace!`, 'check_circle');
      setIsAddMedicineModalOpen(false);
      return newMed;
    } catch (err) {
      console.error('[App] Failed to add medicine:', err);
      showToast(err.message || 'Failed to add formulation', 'warning');
    }
  };

  const handleUpdateMedicine = async (id, updates) => {
    // Optimistic UI update
    setSupplierMedicines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
    setMedicines((prev) => {
      const updated = prev.map((m) => (m.id === id ? { ...m, ...updates } : m));
      try {
        localStorage.setItem('pharmaconnect_marketplace_medicines', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      await medicineService.updateMedicine(id, updates);
      showToast('Medicine details updated successfully', 'check_circle');
    } catch (err) {
      console.warn('[App] Update medicine API warning:', err.message);
    }
  };

  const handleDeactivateMedicine = async (id, permanent = false) => {
    const target = supplierMedicines.find((m) => m.id === id);
    const newStatus = target?.status === 'inactive' ? 'active' : 'inactive';

    if (permanent) {
      setSupplierMedicines((prev) => prev.filter((m) => m.id !== id));
      setMedicines((prev) => prev.filter((m) => m.id !== id));
    } else {
      setSupplierMedicines((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
      );
      setMedicines((prev) => {
        const updated = prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m));
        try {
          localStorage.setItem('pharmaconnect_marketplace_medicines', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }

    try {
      await medicineService.deactivateMedicine(id, permanent);
      showToast(
        permanent ? 'Medicine deleted from inventory' : `Medicine marked as ${newStatus}`,
        permanent ? 'delete' : (newStatus === 'active' ? 'visibility' : 'visibility_off')
      );
    } catch (err) {
      console.warn('[App] Deactivate medicine API warning:', err.message);
    }
  };


  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId || o.poReference === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const handleCreateBuyerOrder = async (orderData) => {
    if (currentUser?.role === 'buyer' && currentUser?.verificationStatus !== 'verified' && currentUser?.verification_status !== 'verified') {
      setCertificationModal({
        isOpen: true,
        role: 'buyer',
        action: 'buy'
      });
      showToast('Complete statutory verification in Security & Verification to place purchase orders', 'lock');
      return;
    }

    const net = Number(
      orderData.netPayable ??
      orderData.totalAmount ??
      orderData.total ??
      (orderData.items || []).reduce((acc, it) => acc + (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0), 0)
    );

    const enrichedOrder = {
      ...orderData,
      id: orderData.id || `po-${Date.now()}`,
      poReference: orderData.poReference || `PO-2025-${Math.floor(1000 + Math.random() * 9000)}`,
      supplierId: orderData.supplierId || cartItems[0]?.supplierId || 'usr-supp-01',
      supplierName: orderData.supplierName || cartItems[0]?.supplierName || 'Verified Manufacturer',
      netPayable: net,
      totalAmount: net,
      total: net,
      destinationHub: orderData.destinationHub || orderData.deliveryAddress?.title || 'Main Hospital Depot',
      status: orderData.status || 'requested',
      paymentStatus: orderData.paymentOption === 'online' ? 'paid' : (orderData.paymentStatus || 'pending'),
      createdAt: orderData.createdAt || 'Recent',
      items: (orderData.items || []).map((it) => ({
        ...it,
        medicineName: it.medicineName || it.name || 'Pharmaceutical Formulation',
        name: it.name || it.medicineName || 'Pharmaceutical Formulation'
      }))
    };

    try {
      if (orderService.createOrder) {
        const created = await orderService.createOrder(enrichedOrder);
        if (created) {
          const finalCreated = {
            ...enrichedOrder,
            ...created,
            netPayable: created.netPayable || net,
            totalAmount: created.totalAmount || net,
            total: created.total || net
          };
          setOrders([finalCreated, ...orders]);
          setSelectedOrderId(finalCreated.id);
          return finalCreated;
        }
      }
    } catch (e) {
      console.warn('Backend order creation fallback:', e);
    }

    setOrders([enrichedOrder, ...orders]);
    setSelectedOrderId(enrichedOrder.id);
    return enrichedOrder;
  };

  const handleCancelBuyerOrder = async (orderId) => {
    try {
      await orderService.rejectOrder(orderId, 'Cancelled by Buyer', 'Order cancelled by buyer prior to warehouse dispatch');
    } catch (e) {
      console.warn('Cancel order API fallback:', e);
    }
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId || o.poReference === orderId
          ? { ...o, status: 'cancelled' }
          : o
      )
    );
    showToast(`Order ${orderId} has been cancelled`, 'cancel');
  };

  const handleReorder = (order) => {
    if (!order.items || order.items.length === 0) return;
    order.items.forEach((item) => {
      const matchingMed = medicines.find(
        (m) => m.id === item.medicineId || m.name === item.name || m.name === item.medicineName
      ) || {
        id: item.medicineId || `med-${Date.now()}`,
        name: item.name || item.medicineName,
        brand: item.brand || item.name || item.medicineName,
        genericName: item.genericFormula || item.genericName,
        strength: item.strength || '',
        dosageForm: item.dosageForm || 'Formulation',
        packSize: item.packSize || `${item.quantity} Units`,
        supplierName: order.supplierName,
        unitPrice: item.unitPrice,
        moq: 50,
        gstRate: item.gstRate || 12
      };
      handleAddToCart(matchingMed, item.quantity, item.unitPrice);
    });
    setActiveView('shopping-cart');
    showToast(`Items from ${order.poReference || order.id} added to cart!`, 'shopping_cart');
  };

  const cartSubtotal = cartItems.reduce((acc, ci) => acc + (ci.quantity || 0) * (ci.unitPrice || 0), 0);
  const cartUnitCount = cartItems.reduce((acc, ci) => acc + (ci.quantity || 0), 0);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  const isLandingView = activeView === 'landing';

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8ff] text-[#131b2e] font-sans selection:bg-[#155eef] selection:text-white">
      {/* 1. DEDICATED SUPPLIER PORTAL (Persistent Sidebar, Clean Header, No Fake Banners) */}
      {!isLandingView && currentUser?.role === 'supplier' ? (
        <SupplierLayout
          currentUser={currentUser}
          businessInfo={
            isDemoSupplier(currentUser)
              ? {
                  business_name: 'Novartis Lifesciences Bio-Pharma Ltd.',
                  verification_status: 'verified'
                }
              : {
                  business_name: currentUser?.organization || currentUser?.businessName || (currentUser?.name ? `${currentUser.name}'s Pharmaceuticals` : 'Pharmaceutical Supplier'),
                  verification_status: currentUser?.verificationStatus || 'pending'
                }
          }
          activeView={activeView}
          onNavigate={navigateTo}
          onLogout={handleLogout}
          pendingOrdersCount={orders.filter((o) => o.status === 'requested' || o.status === 'pending').length}
          lowStockCount={supplierMedicines.filter((m) => (m.stock ?? m.total_stock_available ?? 0) < 500).length}
          expiringBatchesCount={supplierMedicines.filter((m) => {
            const exp = m.activeBatch?.expiryDate;
            if (!exp) return false;
            const days = Math.ceil((new Date(exp) - new Date()) / (1000 * 60 * 60 * 24));
            return days > 0 && days <= 30;
          }).length}
          unreadChatCount={
            chatMessages.filter(
              (m) => (!m.read && !m.is_read) && m.sender !== 'supplier' && m.sender !== (currentUser?.organization || currentUser?.name)
            ).length
          }
          notifications={supplierNotifications}
          onMarkNotificationRead={(id) => handleMarkNotificationRead(id, 'supplier')}
          onMarkAllNotificationsRead={() => handleMarkAllNotificationsRead('supplier')}
        >
          {/* Section 1: Overview Dashboard */}
          {(activeView === 'overview-dashboard' || activeView === 'supplier-overview') && (
            <SupplierOverview
              medicines={supplierMedicines}
              orders={orders}
              onNavigate={setActiveView}
              onOpenAddMedicine={() => {
                if (currentUser?.verificationStatus !== 'verified' && currentUser?.verification_status !== 'verified') {
                  setCertificationModal({
                    isOpen: true,
                    role: 'supplier',
                    action: 'sell'
                  });
                  showToast('WHO-GMP Manufacturer Verification required to list formulations', 'lock');
                  return;
                }
                setActiveView('medicine-inventory');
                setIsAddMedicineModalOpen(true);
              }}
              onViewOrder={(order) => {
                setSelectedOrderId(order.id);
                setActiveView('purchase-orders');
              }}
            />
          )}

          {/* Section 2: Medicine Inventory */}
          {(activeView === 'medicine-inventory' || activeView === 'medicine-catalog') && (
            <MedicineInventory
              medicines={supplierMedicines}
              currentUser={currentUser}
              onAddMedicine={handleAddMedicine}
              onUpdateMedicine={handleUpdateMedicine}
              onDeactivateMedicine={handleDeactivateMedicine}
              onShowToast={showToast}
              isAddModalOpen={isAddMedicineModalOpen}
              onCloseAddModal={() => setIsAddMedicineModalOpen(false)}
              onOpenAddModal={() => {
                if (currentUser?.verificationStatus !== 'verified' && currentUser?.verification_status !== 'verified') {
                  setCertificationModal({
                    isOpen: true,
                    role: 'supplier',
                    action: 'sell'
                  });
                  showToast('WHO-GMP Manufacturer Verification required to list formulations', 'lock');
                  return;
                }
                setIsAddMedicineModalOpen(true);
              }}
            />
          )}

          {/* Section 3: Purchase Orders */}
          {(activeView === 'purchase-orders' || activeView === 'purchase-requests-orders') && (
            <PurchaseOrders
              orders={orders}
              onAcceptOrder={handleAcceptOrder}
              onRejectOrder={handleRejectOrder}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onViewInvoice={(id) => {
                setSelectedOrderId(id);
                setActiveView('invoices-payments');
              }}
              onShowToast={showToast}
            />
          )}

          {/* Section 4: Batch & Expiry Alerts */}
          {activeView === 'batch-expiry-alerts' && (
            <BatchExpiry medicines={supplierMedicines} onShowToast={showToast} />
          )}

          {/* Section 5: Invoices & Payments */}
          {(activeView === 'invoices-payments' || activeView === 'invoices-gst') && (
            <InvoicesPayments orders={orders} onShowToast={showToast} />
          )}

          {/* Section 6: Analytics & Reports */}
          {activeView === 'analytics-reports' && (
            <SupplierAnalytics orders={orders} medicines={supplierMedicines} onShowToast={showToast} />
          )}

          {/* Section 7: Order Chat */}
          {activeView === 'order-chat' && (
            <OrderChat
              orders={orders}
              chatMessages={chatMessages}
              onSendMessage={handleSendChatMessage}
              onShowToast={showToast}
            />
          )}

          {/* Section 8: Regulatory & Business Verification */}
          {['regulatory-kyc', 'business-verification', 'compliance', 'security'].includes(activeView) && (
            <BusinessVerification
              currentUser={currentUser}
              onShowToast={showToast}
              onVerificationUpdated={handleUserVerified}
            />
          )}

          {/* Section 9: Settings */}
          {activeView === 'settings' && (
            <SupplierSettings currentUser={currentUser} onLogout={handleLogout} onShowToast={showToast} />
          )}
        </SupplierLayout>
      ) : !isLandingView && currentUser?.role === 'buyer' ? (
        /* 2. DEDICATED BUYER PORTAL (Persistent Sidebar, Clean Header, End-to-End Procurement) */
        <BuyerLayout
          currentUser={currentUser}
          businessInfo={
            isDemoPersona(currentUser)
              ? {
                  business_name: 'Apex Multispeciality Healthcare Pvt. Ltd.',
                  verification_status: 'verified'
                }
              : {
                  business_name: currentUser?.organization || (currentUser?.name ? `${currentUser.name}'s Healthcare` : 'Healthcare Facility'),
                  verification_status: currentUser?.verification_status || currentUser?.verificationStatus || 'pending'
                }
          }
          activeView={activeView}
          onNavigate={navigateTo}
          onLogout={handleLogout}
          onSwitchRole={handleSwitchUserRole}
          cartItemCount={cartItems.reduce((acc, ci) => acc + (ci.quantity || 1), 0)}
          pendingOrdersCount={orders.filter((o) => ['requested', 'pending'].includes(o.status?.toLowerCase())).length}
          savedMedicinesCount={savedMedicines.length}
          unreadChatCount={
            chatMessages.filter(
              (m) => (!m.read && !m.is_read) && m.sender !== 'buyer' && m.sender !== (currentUser?.organization || currentUser?.name)
            ).length
          }
          notifications={buyerNotifications}
          onMarkNotificationRead={(id) => handleMarkNotificationRead(id, 'buyer')}
          onMarkAllNotificationsRead={() => handleMarkAllNotificationsRead('buyer')}
        >
          {/* Section 1: Buyer Overview */}
          {(activeView === 'buyer-overview' || activeView === 'overview-dashboard') && (
            <BuyerOverview
              medicines={medicines}
              orders={orders}
              savedMedicines={savedMedicines}
              invoices={[]}
              onNavigate={setActiveView}
              onViewOrder={(orderId) => {
                setSelectedOrderId(orderId);
                setActiveView('my-orders');
              }}
              onAddToCart={handleAddToCart}
              onShowToast={showToast}
            />
          )}

          {/* Section 2: Browse Medicines */}
          {(activeView === 'browse-medicines' || activeView === 'medicine-catalog') && (
            <BrowseMedicines
              medicines={medicines}
              savedMedicines={savedMedicines}
              cartItems={cartItems}
              currentUser={currentUser}
              onToggleSaveMedicine={handleToggleSaveMedicine}
              onAddToCart={handleAddToCart}
              onShowToast={showToast}
              onNavigate={setActiveView}
              onOpenVerificationModal={() => setCertificationModal({ isOpen: true, role: 'buyer', action: 'buy' })}
            />
          )}

          {/* Section 3: Shopping Cart & Checkout */}
          {(activeView === 'shopping-cart' || activeView === 'checkout') && (
            <ShoppingCart
              cartItems={cartItems}
              onUpdateQuantity={handleUpdateCartQty}
              onRemoveFromCart={handleRemoveCartItem}
              onClearCart={handleClearCart}
              onCreateOrder={handleCreateBuyerOrder}
              onNavigate={setActiveView}
              onShowToast={showToast}
              currentUser={currentUser}
            />
          )}

          {/* Section 4: My Orders */}
          {(activeView === 'my-orders' || activeView === 'purchase-requests-orders') && (
            <MyOrders
              orders={orders}
              onCancelOrder={handleCancelBuyerOrder}
              onReorder={handleReorder}
              onOpenChat={(orderId) => {
                setSelectedOrderId(orderId);
                setActiveView('order-chat');
              }}
              onViewInvoice={(orderId) => {
                setSelectedOrderId(orderId);
                setActiveView('invoices-payments');
              }}
              onPayOrder={(orderId) => handlePaymentSuccess(orderId)}
              onShowToast={showToast}
              onNavigate={setActiveView}
            />
          )}

          {/* Section 5: Saved Medicines */}
          {activeView === 'saved-medicines' && (
            <SavedMedicines
              savedMedicines={savedMedicines}
              onRemoveFromSaved={handleRemoveFromSaved}
              onAddToCart={(item) => handleAddToCart(item, item.moq || 100, item.unitPrice)}
              onNavigate={setActiveView}
              onShowToast={showToast}
            />
          )}

          {/* Section 6: Invoices & Payments */}
          {(activeView === 'invoices-payments' || activeView === 'invoices-gst') && (
            <BuyerInvoicesPayments
              orders={orders}
              invoices={[]}
              onPayInvoice={handlePaymentSuccess}
              onShowToast={showToast}
            />
          )}

          {/* Section 7: Supplier Directory */}
          {activeView === 'supplier-directory' && (
            <SupplierDirectory
              medicines={medicines}
              onNavigate={setActiveView}
              onOpenChat={(supplierId) => setActiveView('order-chat')}
              onShowToast={showToast}
            />
          )}

          {/* Section 8: Order Chat */}
          {activeView === 'order-chat' && (
            <BuyerOrderChat
              orders={orders}
              chatMessages={chatMessages}
              onSendMessage={handleSendChatMessage}
              onShowToast={showToast}
              currentUser={currentUser}
            />
          )}

          {/* Section 9: Analytics & Reports */}
          {activeView === 'analytics-reports' && (
            <BuyerAnalytics
              orders={orders}
              medicines={medicines}
              onShowToast={showToast}
            />
          )}

          {/* Section 10: Business Verification & Security */}
          {['business-verification', 'regulatory-kyc', 'security', 'security-verification', 'security-and-verification', 'compliance', 'statutory-kyc'].includes(activeView) && (
            <BuyerBusinessVerification
              currentUser={currentUser}
              onShowToast={showToast}
              onVerificationUpdated={handleUserVerified}
            />
          )}

          {/* Section 11: Settings */}
          {activeView === 'settings' && (
            <BuyerSettings
              currentUser={currentUser}
              onLogout={handleLogout}
              onShowToast={showToast}
            />
          )}
        </BuyerLayout>
      ) : (
        /* 3. PUBLIC LANDING & AUTH PROMPTS */
        <>
          {/* Top Header */}
          <Header
            currentUser={currentUser}
            activeView={activeView}
            onNavigate={navigateTo}
            onSwitchUser={handleSwitchUserRole}
            onOpenAuth={(role, mode) => {
              setAuthInitialRole(role || 'buyer');
              setAuthInitialMode(mode || 'signin');
              setIsAuthOpen(true);
            }}
            onLogout={handleLogout}
          />

          <div className="flex-1 flex w-full">
            {activeView === 'landing' ? (
              <LandingPage
                medicines={medicines}
                currentUser={currentUser}
                onSelectBuyer={() => {
                  if (currentUser && currentUser.role === 'buyer') {
                    setActiveView('buyer-overview');
                  } else if (currentUser) {
                    showToast(`You are currently signed in as a Supplier (${currentUser.organization || currentUser.name}). Please sign out first to use a Buyer account.`, 'info');
                    setActiveView('overview-dashboard');
                  } else {
                    setAuthInitialRole('buyer');
                    setAuthInitialMode('signin');
                    setIsAuthOpen(true);
                  }
                }}
                onSelectSupplier={() => {
                  if (currentUser && currentUser.role === 'supplier') {
                    setActiveView('overview-dashboard');
                  } else if (currentUser) {
                    showToast(`You are currently signed in as a Buyer (${currentUser.organization || currentUser.name}). Please sign out first to use a Supplier account.`, 'info');
                    setActiveView('buyer-overview');
                  } else {
                    setAuthInitialRole('supplier');
                    setAuthInitialMode('signin');
                    setIsAuthOpen(true);
                  }
                }}
                onRequestAllocation={(med) => {
                  if (!currentUser) {
                    setAuthInitialRole('buyer');
                    setAuthInitialMode('signin');
                    setIsAuthOpen(true);
                    showToast('Please sign in as a buyer to request wholesale allocations', 'lock');
                    return;
                  }
                  if (currentUser.role !== 'buyer') {
                    showToast('Wholesale procurement allocations require a Buyer account.', 'lock');
                    return;
                  }
                  handleAddToCart(med, med.moq || 100, med.baseWholesalePrice || med.unitPrice || 120);
                  setActiveView('shopping-cart');
                }}
                onInspectCoa={(med) => setInspectingCoa(med)}
                onOpenAuth={(role, mode) => {
                  setAuthInitialRole(role || 'buyer');
                  setAuthInitialMode(mode || 'signin');
                  setIsAuthOpen(true);
                }}
                onLogout={handleLogout}
              />
            ) : (
              <div className="min-h-[60vh] flex items-center justify-center p-6 w-full">
                <div className="bg-white p-8 rounded-3xl border border-[#eaedff] shadow-xl max-w-md w-full text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#eaedff] text-[#0047c1] flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-2xl">lock</span>
                  </div>
                  <h2 className="text-xl font-bold text-[#131b2e]">Institutional Sign In Required</h2>
                  <p className="text-xs text-[#434655] leading-relaxed">
                    This procurement portal requires verified CDSCO Form 20B/21B wholesale license credentials.
                  </p>
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setAuthInitialRole('buyer');
                        setAuthInitialMode('signin');
                        setIsAuthOpen(true);
                      }}
                      className="w-full py-2.5 px-4 bg-[#0047c1] hover:bg-[#155eef] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                    >
                      Sign In as Buyer
                    </button>
                    <button
                      onClick={() => {
                        setAuthInitialRole('supplier');
                        setAuthInitialMode('signin');
                        setIsAuthOpen(true);
                      }}
                      className="w-full py-2.5 px-4 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#0047c1] rounded-xl text-xs font-bold transition-all"
                    >
                      Sign In as Supplier
                    </button>
                    <button
                      onClick={() => setActiveView('landing')}
                      className="w-full py-2.5 px-4 bg-transparent hover:bg-neutral-50 text-[#5e6b7f] rounded-xl text-xs font-bold transition-all"
                    >
                      Back to Homepage
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialRole={authInitialRole}
        initialMode={authInitialMode}
        onLogin={handleLogin}
        onShowToast={showToast}
      />

      <PoReviewModal
        isOpen={isPoReviewOpen}
        onClose={() => setIsPoReviewOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveCartItem}
        onUpdateQty={handleUpdateCartQty}
        destinationHub={destinationHub}
        onSubmitPo={handleSubmitCartPo}
      />

      <CoaModal
        medicine={inspectingCoa}
        onClose={() => setInspectingCoa(null)}
        onShowToast={showToast}
      />

      <SupplierConflictModal
        isOpen={supplierConflict.isOpen}
        currentSupplierName={supplierConflict.currentSupplierName}
        newSupplierName={supplierConflict.newSupplierName}
        pendingMedicine={supplierConflict.pendingMedicine}
        pendingQuantity={supplierConflict.pendingQuantity}
        cartItemCount={supplierConflict.cartItemCount}
        onConfirmReplace={handleConfirmReplaceCart}
        onCheckoutCurrent={handleCheckoutCurrentSupplier}
        onCancel={handleCancelSupplierConflict}
      />

      <CertificationModal
        isOpen={certificationModal.isOpen}
        role={certificationModal.role}
        actionAttempted={certificationModal.action}
        onNavigateToVerification={() => {
          setCertificationModal((prev) => ({ ...prev, isOpen: false }));
          setActiveView('business-verification');
        }}
        onClose={() => setCertificationModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Global Notification Toast */}
      {toast.visible && (
        <div className="fixed bottom-20 right-6 z-50 bg-[#131b2e] text-[#f2f3ff] px-4 py-3 rounded-2xl shadow-2xl font-medium text-xs flex items-center gap-2.5 border border-[#434655] animate-in slide-in-from-bottom duration-200">
          <span className="material-symbols-outlined text-[#80f3dd] text-lg">{toast.icon}</span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
