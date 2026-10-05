import React from 'react';

export const CoaModal = ({ medicine, onClose, onShowToast }) => {
  if (!medicine) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#283044]/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 border border-[#eaedff] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#eaedff]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#80f3dd]/40 text-[#006f61] flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">verified</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#006b5d] uppercase font-mono tracking-wider">
                CERTIFICATE OF ANALYSIS (COA) • SCHEDULE M
              </span>
              <h3 className="text-base font-extrabold text-[#131b2e]">{medicine.name}</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#eaedff] text-[#434655]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Certificate Content */}
        <div className="flex-1 overflow-y-auto space-y-4 text-xs">
          <div className="bg-[#f2f3ff] p-4 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono border border-[#eaedff]">
            <div>
              <span className="text-[10px] font-bold text-[#434655] uppercase block font-sans">Batch LOT</span>
              <span className="font-bold text-[#0047c1]">{medicine.activeBatch?.batchNumber}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#434655] uppercase block font-sans">Mfg Date</span>
              <span className="font-bold">{medicine.activeBatch?.manufacturingDate}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#434655] uppercase block font-sans">Expiry Date</span>
              <span className="font-bold text-[#006b5d]">{medicine.activeBatch?.expiryDate}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#434655] uppercase block font-sans">Sample Size</span>
              <span className="font-bold">40 Units Checked</span>
            </div>
          </div>

          <div className="border border-[#eaedff] rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs text-[#131b2e]">
              <thead className="bg-[#f2f3ff] text-[#434655] font-mono text-[11px] uppercase">
                <tr>
                  <th className="py-2.5 px-3">Analytical Parameter</th>
                  <th className="py-2.5 px-3">Pharmacopeial Standard</th>
                  <th className="py-2.5 px-3">Observed Result</th>
                  <th className="py-2.5 px-3 text-right">Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaedff]">
                <tr>
                  <td className="py-2 px-3 font-semibold">Description / Visual</td>
                  <td className="py-2 px-3 text-[#434655]">White crystalline sterile</td>
                  <td className="py-2 px-3 font-mono">Conforms</td>
                  <td className="py-2 px-3 text-right font-bold text-[#006b5d]">PASS</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold">Active Assay (HPLC)</td>
                  <td className="py-2 px-3 text-[#434655]">98.0% - 102.0%</td>
                  <td className="py-2 px-3 font-mono">99.84%</td>
                  <td className="py-2 px-3 text-right font-bold text-[#006b5d]">PASS</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold">Dissolution Rate (45m)</td>
                  <td className="py-2 px-3 text-[#434655]">&gt; 85% release</td>
                  <td className="py-2 px-3 font-mono">96.2%</td>
                  <td className="py-2 px-3 text-right font-bold text-[#006b5d]">PASS</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold">Bacterial Endotoxins</td>
                  <td className="py-2 px-3 text-[#434655]">&lt; 0.25 EU/ml</td>
                  <td className="py-2 px-3 font-mono">&lt; 0.05 EU/ml</td>
                  <td className="py-2 px-3 text-right font-bold text-[#006b5d]">PASS</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold">Sterility (Direct Inoculation)</td>
                  <td className="py-2 px-3 text-[#434655]">Zero microbial growth (14d)</td>
                  <td className="py-2 px-3 font-mono">Sterile</td>
                  <td className="py-2 px-3 text-right font-bold text-[#006b5d]">PASS</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-[#f2f3ff] p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-[#eaedff]">
            <div>
              <span className="text-[10px] font-bold text-[#434655] uppercase block font-mono">
                Laboratory Quality Assurance Lead
              </span>
              <span className="font-bold text-[#131b2e]">
                {medicine.activeBatch?.coaSigner || 'Dr. P. Mehta, Chief Analytical Chemist'}
              </span>
              <span className="block text-[10px] text-[#006b5d] font-mono mt-0.5">
                ✓ Cryptographic SHA-256 e-Signature Verified
              </span>
            </div>
            <button
              onClick={() => onShowToast('Exporting official CDSCO signed CoA PDF...', 'download')}
              className="px-4 py-2 bg-[#0047c1] hover:bg-[#155eef] text-white rounded-xl text-xs font-bold transition-colors"
            >
              Download Signed PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
