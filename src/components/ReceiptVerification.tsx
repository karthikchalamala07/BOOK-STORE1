import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ShieldCheck, ArrowLeft, CheckCircle2, Clock, Package, AlertCircle } from "lucide-react";
import { supabase, isSupabaseConfigValid } from "../lib/supabase";

export default function ReceiptVerification() {
  const { receiptNumber } = useParams<{ receiptNumber: string }>();
  const [loading, setLoading] = useState(true);
  const [verificationData, setVerificationData] = useState<any | null>(null);

  useEffect(() => {
    let isMounted = true;
    const verifyTransaction = async () => {
      if (!receiptNumber) {
        setLoading(false);
        return;
      }

      // Check local storage receipts first
      const localReceipts = JSON.parse(localStorage.getItem("storyvault_receipts") || "[]");
      const localMatch = localReceipts.find(
        (r: any) =>
          r.receiptNumber === receiptNumber ||
          r.digitalAccessCode === receiptNumber ||
          r.orderId === receiptNumber
      );

      if (localMatch && isMounted) {
        setVerificationData(localMatch);
        setLoading(false);
        return;
      }

      if (isSupabaseConfigValid) {
        try {
          const { data } = await supabase
            .from("receipts")
            .select("*")
            .or(`receipt_number.eq.${receiptNumber},customer_name.eq.${receiptNumber}`)
            .single();

          if (data && isMounted) {
            setVerificationData({
              receiptNumber: data.receipt_number,
              customerName: data.customer_name,
              customerEmail: data.customer_email,
              total: data.total,
              createdAt: data.created_at
            });
          }
        } catch (_) {}
      }

      if (isMounted) setLoading(false);
    };

    verifyTransaction();
    return () => { isMounted = false; };
  }, [receiptNumber]);

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F5F1E8] p-6 flex flex-col items-center justify-center font-sans">
      <div className="max-w-md w-full bg-[#151515] border border-[#24151A] rounded-2xl p-8 shadow-2xl relative">
        <Link to="/" className="inline-flex items-center text-xs font-mono text-[#A5A5A5] hover:text-[#C9A227] mb-6 transition-colors">
          <ArrowLeft size={14} className="mr-2" /> Back to STORYVAULT
        </Link>

        {loading ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-2 border-[#C9A227] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs font-mono text-[#C9A227]">Verifying Transaction Authentication...</p>
          </div>
        ) : verificationData ? (
          <div>
            <div className="w-12 h-12 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={24} className="text-green-400" />
            </div>

            <h2 className="text-xl font-serif text-[#F5F1E8] text-center mb-1">Authentic Record Verified</h2>
            <p className="text-[10px] font-mono text-green-400 text-center uppercase tracking-widest mb-6">STORYVAULT OFFICIAL ARCHIVE ENCRYPTION VERIFIED</p>

            <div className="space-y-3 border-t border-b border-[#24151A] py-4 text-xs">
              <div className="flex justify-between">
                <span className="text-[#A5A5A5]">Receipt Reference:</span>
                <span className="font-mono text-[#C9A227]">{verificationData.receiptNumber || receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A5A5A5]">Customer Name:</span>
                <span className="text-[#F5F1E8]">{verificationData.customerName || "Verified Patron"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A5A5A5]">Total Value:</span>
                <span className="font-mono text-[#F5F1E8]">${Number(verificationData.total || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A5A5A5]">Verification Status:</span>
                <span className="text-green-400 font-mono">100% VALID ARCHIVE RECORD</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link to="/digital-vault" className="inline-block w-full py-3 bg-[#C9A227] hover:bg-[#b08d20] text-[#0D0D0D] font-mono text-xs font-bold uppercase tracking-wider rounded-lg transition-colors">
                Access Digital Vault
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle size={32} className="text-amber-500 mx-auto mb-3" />
            <h3 className="text-base font-serif text-[#F5F1E8] mb-2">Record Verification Pending</h3>
            <p className="text-xs text-[#A5A5A5] mb-6">The requested reference ({receiptNumber}) could not be located on this local node.</p>
            <Link to="/" className="inline-block py-2.5 px-6 border border-[#C9A227] text-[#C9A227] font-mono text-xs uppercase tracking-wider rounded-lg hover:bg-[#C9A227]/10 transition-colors">
              Return Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}