import React, { useState } from 'react';
import { authService } from '../services/authService';
import { CURRENT_SUPPLIER_USER, CURRENT_BUYER_USER } from '../data/mockData';

export const AuthModal = ({
  isOpen,
  onClose,
  onLogin,
  onShowToast,
  initialRole = 'supplier',
  initialMode = 'signin'
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState(initialMode);
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [authError, setAuthError] = useState(null);
  const [detectedMismatchRole, setDetectedMismatchRole] = useState(null);

  React.useEffect(() => {
    setMode(initialMode);
    setSelectedRole(initialRole);
    setAuthError(null);
    setDetectedMismatchRole(null);
  }, [initialMode, initialRole, isOpen]);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [gstin, setGstin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuickLogin = async (role) => {
    setIsSubmitting(true);
    setAuthError(null);
    setDetectedMismatchRole(null);
    setSelectedRole(role);
    try {
      const user = await authService.getDemoPersona(role);
      onLogin(user);
      onShowToast(`Signed in as ${user.name} (${role === 'supplier' ? 'Supplier' : 'Buyer'})`, 'verified');
    } catch {
      if (role === 'supplier') {
        onLogin(CURRENT_SUPPLIER_USER);
      } else {
        onLogin(CURRENT_BUYER_USER);
      }
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setAuthError(null);
    setDetectedMismatchRole(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError(null);
    setDetectedMismatchRole(null);

    try {
      if (mode === 'signin') {
        if (!email.trim() || !password) {
          throw new Error('Please enter both email and password');
        }
        const user = await authService.login(email.trim(), password, selectedRole);

        // Explicit role guard: check that account role matches the selected role
        if (user.role && selectedRole && user.role.toLowerCase() !== selectedRole.toLowerCase()) {
          const expected = selectedRole === 'supplier' ? 'Pharma Supplier' : 'Hospital Buyer';
          const actual = user.role === 'supplier' ? 'Pharma Supplier' : 'Hospital Buyer';
          setDetectedMismatchRole(user.role);
          throw new Error(
            `Role Mismatch: This account is registered as a ${actual}. You cannot log in as a ${expected}. Please switch to ${actual}.`
          );
        }

        if (user) {
          onLogin(user);
          onShowToast(`Signed in successfully as ${user.name} (${user.role === 'supplier' ? 'Pharma Supplier' : 'Hospital Buyer'})`, 'verified');
          onClose();
        }
      } else {
        // Register
        if (!email.trim() || !password || !orgName.trim()) {
          throw new Error('Please fill in all required fields');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }

        const registerPayload = {
          email: email.trim(),
          password: password,
          fullName: fullName.trim() || orgName.trim() || email.split('@')[0],
          role: selectedRole,
          organization: orgName.trim(),
          licenseNumber: licenseNumber.trim() || (selectedRole === 'supplier' ? 'MH-PUN-20B-184920' : 'MH-MUM-20-9942'),
          licenseType: selectedRole === 'supplier' ? 'Form 20B/21B' : 'Form 20/21',
          gstin: (gstin.trim() || '27AAACN0192Q1ZV').toUpperCase()
        };

        const registeredUser = await authService.register(registerPayload);
        if (registeredUser) {
          onLogin(registeredUser);
          onShowToast(`Account registered: ${registeredUser.organization}. Verification pending CDSCO.`, 'verified');
          onClose();
        }
      }
    } catch (err) {
      const msg = err.message || 'Authentication error';
      setAuthError(msg);
      if (err.actualRole) {
        setDetectedMismatchRole(err.actualRole);
      } else if (msg.toLowerCase().includes('buyer') && selectedRole === 'supplier') {
        setDetectedMismatchRole('buyer');
      } else if (msg.toLowerCase().includes('supplier') && selectedRole === 'buyer') {
        setDetectedMismatchRole('supplier');
      }
      onShowToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#283044]/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 border border-[#eaedff] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
          <div className="flex items-center gap-3">
            <img
              alt="PharmaConnect Logo"
              className="h-8 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida/AEtjO1UO5_tyDRPaj7nyvc1dDCQgK0vlMqv9_N8BbwwCcOZs3sUU18Dx_zExBvTGjIbc_RrB-6VX6Ylb9XiISp4v1yl9VPYb2PHBhV_0gCqCLcDHLWQcA7WSl85l4y9TPEP4QS17xJp_nxoz1CsH2e_CjtXJT427MbT9noJfef7JS8zq42Ggv6LQavt4flL5lu_kBiQ8kssK5AEy0FSIsHm4AVoSylQdThCMh4l7ZAe0pij366-wQ9hMWwOKVp4"
            />
            <div>
              <h3 className="text-base font-extrabold text-[#131b2e]">Institutional Gateway</h3>
              <span className="font-mono text-[10px] text-[#006b5d] font-bold">256-BIT ENCRYPTED</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#eaedff] text-[#434655]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* 1-Click Fast Persona Switcher */}
        <div className="p-3 bg-[#f2f3ff] rounded-2xl border border-[#eaedff] space-y-2">
          <span className="text-[10px] font-bold uppercase text-[#434655] font-mono block">
            Instant Demo Sign-in Personas
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickLogin('supplier')}
              className="p-2.5 rounded-xl bg-white border border-[#eaedff] hover:border-[#0047c1] text-left transition-all text-xs shadow-xs"
              type="button"
            >
              <span className="font-bold text-[#131b2e] block">Dr. Aris (Supplier)</span>
              <span className="text-[10px] text-[#0047c1] font-mono">Novartis Form 20B</span>
            </button>

            <button
              onClick={() => handleQuickLogin('buyer')}
              className="p-2.5 rounded-xl bg-white border border-[#eaedff] hover:border-[#006b5d] text-left transition-all text-xs shadow-xs"
              type="button"
            >
              <span className="font-bold text-[#131b2e] block">Dr. Sharma (Buyer)</span>
              <span className="text-[10px] text-[#006b5d] font-mono">Apex Hospital 20/21</span>
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex bg-[#f2f3ff] p-1 rounded-xl text-xs font-bold border border-[#eaedff]">
          <button
            onClick={() => {
              setMode('signin');
              setAuthError(null);
              setDetectedMismatchRole(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === 'signin' ? 'bg-white text-[#131b2e] shadow-xs' : 'text-[#434655]'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode('register');
              setAuthError(null);
              setDetectedMismatchRole(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === 'register' ? 'bg-white text-[#131b2e] shadow-xs' : 'text-[#434655]'
            }`}
          >
            Institutional KYC Register
          </button>
        </div>

        {/* Role toggle */}
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-[#434655] uppercase font-mono">
              {mode === 'signin' ? 'Sign In As (Role Verification)' : 'Select Entity Role'}
            </label>
            <span className="text-[10px] font-mono text-[#0047c1] font-semibold">
              Portal: {selectedRole === 'supplier' ? 'Manufacturer' : 'Hospital Buyer'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleRoleChange('supplier')}
              className={`p-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                selectedRole === 'supplier'
                  ? 'bg-[#155eef] text-white border-[#0047c1]'
                  : 'bg-[#f2f3ff] text-[#434655] border-[#eaedff]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">factory</span>
              <span>Pharma Supplier</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange('buyer')}
              className={`p-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                selectedRole === 'buyer'
                  ? 'bg-[#006b5d] text-white border-[#005046]'
                  : 'bg-[#f2f3ff] text-[#434655] border-[#eaedff]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">local_hospital</span>
              <span>Hospital Buyer</span>
            </button>
          </div>
        </div>

        {/* Role Verification & Auth Error Banner */}
        {authError && (
          <div className="p-3.5 bg-[#fff8e6] border border-[#f5dc99] rounded-2xl text-xs space-y-2 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[#b37400] text-lg shrink-0 mt-0.5">
                warning
              </span>
              <div className="flex-1">
                <span className="font-bold text-[#131b2e] block">Account Role Verification Alert</span>
                <p className="text-[11px] text-[#5e6b7f] mt-0.5 leading-snug">{authError}</p>
              </div>
            </div>

            {detectedMismatchRole && (
              <div className="pt-2 border-t border-[#f5dc99]/70 flex items-center justify-between gap-2">
                <span className="text-[11px] text-[#131b2e] font-semibold">
                  Switch to your registered role?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    handleRoleChange(detectedMismatchRole);
                  }}
                  className="px-3 py-1 bg-[#0047c1] hover:bg-[#155eef] text-white rounded-lg text-xs font-bold transition-colors shrink-0 shadow-2xs flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">swap_horiz</span>
                  <span>Switch to {detectedMismatchRole === 'supplier' ? 'Pharma Supplier' : 'Hospital Buyer'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-[#434655] uppercase mb-1">
              Registered Corporate Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:ring-2 focus:ring-[#0047c1]"
              placeholder="e.g. procurement@hospital.org"
              required
              type="email"
            />
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-[10px] font-bold text-[#434655] uppercase mb-1">
                  Full Name / Authorized Officer
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:ring-2 focus:ring-[#0047c1]"
                  placeholder="e.g. Dr. Rajesh Sharma"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#434655] uppercase mb-1">
                  Organization / Hospital Name
                </label>
                <input
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:ring-2 focus:ring-[#0047c1]"
                  placeholder="e.g. Apollo Medics Hospital"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-[#434655] uppercase mb-1">
                    Drug License (Form 20/21)
                  </label>
                  <input
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] font-mono"
                    placeholder="MH-MUM-20-9942"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#434655] uppercase mb-1">
                    GSTIN
                  </label>
                  <input
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] font-mono uppercase"
                    placeholder="27AABTA4481M1ZR"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[10px] font-bold text-[#434655] uppercase mb-1">
              Password {mode === 'register' ? '(min. 6 characters)' : ''}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signin' ? 'Enter password' : 'Create password (min 6 chars)'}
              className="w-full h-9 px-3 bg-[#f2f3ff] rounded-xl text-xs text-[#131b2e] focus:ring-2 focus:ring-[#0047c1]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-[#0047c1] hover:bg-[#155eef] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all mt-2 flex items-center justify-center gap-1.5"
          >
            {isSubmitting ? (
              <span>Validating Credentials & Role...</span>
            ) : mode === 'signin' ? (
              <>
                <span className="material-symbols-outlined text-sm">login</span>
                <span>Sign In as {selectedRole === 'supplier' ? 'Pharma Supplier' : 'Hospital Buyer'}</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">how_to_reg</span>
                <span>Register as {selectedRole === 'supplier' ? 'Pharma Supplier' : 'Hospital Buyer'}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
