import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Printer, Download, BookOpen, ShieldCheck, MapPin, Truck, ArrowLeft, Loader2, Home } from "lucide-react";
import { getBookPricing } from "../services/booksDb";
import { useBookstore } from "../context/useBookstore";

export default function ReceiptVerification() {
  const { receiptNumber } = useParams<{ receiptNumber: string }>();
  const navigate = useNavigate();
  const { addToast } = useBookstore();
  const printableRef = useRef<HTMLDivElement>(null);

  const [receipt, setReceipt] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReceipt() {
      if (!receiptNumber) {
        setError("Invalid URL parameters. Missing Receipt Reference.");
        setLoading(false);
        return;
      }
      try {
        // Query Firestore receipts collection where receiptNumber == route param
        const q1 = query(
          collection(db, "receipts"),
          where("receiptNumber", "==", receiptNumber)
        );
        const snap1 = await getDocs(q1);
        
        let foundData = null;
        if (!snap1.empty) {
          foundData = snap1.docs[0].data();
        } else {
          // Try digitalAccessCode query
          const q2 = query(
            collection(db, "receipts"),
            where("digitalAccessCode", "==", receiptNumber)
          );
          const snap2 = await getDocs(q2);
          if (!snap2.empty) {
            foundData = snap2.docs[0].data();
          } else {
            // Try fallback receiptId query for backwards compatibility
            const q3 = query(
              collection(db, "receipts"),
              where("receiptId", "==", receiptNumber)
            );
            const snap3 = await getDocs(q3);
            if (!snap3.empty) {
              foundData = snap3.docs[0].data();
            }
          }
        }

        if (foundData) {
          setReceipt(foundData);
        } else {
          // Fallback to local storage
          const local = JSON.parse(localStorage.getItem("storyvault_receipts") || "[]");
          const found = local.find(
            (r: any) => 
              r.receiptNumber === receiptNumber || 
              r.digitalAccessCode === receiptNumber ||
              r.receiptId === receiptNumber
          );
          if (found) {
            setReceipt(found);
          } else {
            setError("The receipt you scanned is invalid or has been removed.");
          }
        }
      } catch (err) {
        console.warn("Firestore fetch failed. Checking local fallback:", err);
        const local = JSON.parse(localStorage.getItem("storyvault_receipts") || "[]");
        const found = local.find(
          (r: any) => 
            r.receiptNumber === receiptNumber || 
            r.digitalAccessCode === receiptNumber ||
            r.receiptId === receiptNumber
        );
        if (found) {
          setReceipt(found);
        } else {
          setError("The receipt you scanned is invalid or has been removed.");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchReceipt();
  }, [receiptNumber]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-6">
        <Loader2 className="text-gold animate-spin" size={36} />
        <p className="font-mono text-xs text-gold uppercase tracking-[0.25em] animate-pulse">
          Querying Registry Database...
        </p>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="max-w-md w-full bg-surface border border-gold/45 rounded-2xl p-8 flex flex-col items-center space-y-6 shadow-gold-glow/5">
          <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center border border-gold/30">
            <XCircle className="text-gold" size={26} />
          </div>
          <div className="space-y-2">
            <h3 className="font-serif text-xl font-bold text-primaryText uppercase tracking-wider">
              Receipt Not Found
            </h3>
            <p className="font-sans text-xs text-secondaryText leading-relaxed">
              The receipt you scanned is invalid or has been removed.
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="py-3 px-8 bg-gold hover:bg-gold-hover text-background font-mono text-[10px] uppercase font-bold tracking-widest rounded-lg cursor-pointer transition-colors flex items-center space-x-2"
          >
            <Home size={12} />
            <span>Return Home</span>
          </button>
        </div>
      </div>
    );
  }

  // Calculate pricing elements
  const subtotal = receipt.books ? receipt.books.reduce((acc: number, b: any) => acc + (b.price * b.quantity), 0) : receipt.amount;
  const tax = 1.50;
  const shipping = receipt.bookType === "Digital" ? 0 : 5.00;
  const total = receipt.amount;

  const orderDateFormatted = new Date(receipt.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const estimatedDelivery = new Date(new Date(receipt.createdAt).getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div className="min-h-screen bg-background py-16 px-4 md:px-10 flex flex-col items-center justify-center select-text print:bg-white print:p-0">
      
      {/* Print Overrides CSS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #storyvault-verification-wrapper, #storyvault-verification-wrapper * {
            visibility: visible;
          }
          #storyvault-verification-wrapper {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Main Container */}
      <div className="max-w-3xl w-full flex flex-col no-print mb-6">
        <button
          onClick={() => navigate("/library")}
          className="flex items-center space-x-2 text-secondaryText hover:text-gold cursor-pointer font-mono text-[10px] uppercase tracking-widest self-start bg-surface/50 border border-customBorder py-2 px-5 rounded-full mb-6"
        >
          <ArrowLeft size={12} />
          <span>Exit Verification</span>
        </button>
      </div>

      {/* Verification Card */}
      <div 
        id="storyvault-verification-wrapper"
        ref={printableRef}
        className="max-w-3xl w-full bg-white text-black p-8 md:p-12 shadow-2xl rounded-2xl relative overflow-hidden border border-gold/45 select-text print:rounded-none print:border-none print:shadow-none"
        style={{
          fontFamily: "'Georgia', serif",
        }}
      >
        {/* StoryVault Gold Watermark Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] w-[400px] h-[400px] pointer-events-none select-none">
          <img src="/storyvault-logo.jpg" alt="" className="w-full h-full object-contain filter grayscale" />
        </div>

        {/* Verified Ribbon Header Banner */}
        <div className="mb-6 bg-gold/10 border border-gold/30 rounded-xl p-4 flex items-center space-x-3 text-left">
          <CheckCircle className="text-gold shrink-0" size={24} />
          <div>
            <span className="font-serif text-sm font-bold text-[#C9A227] tracking-wider block">
              ✓ VERIFIED RECEIPT
            </span>
            <p className="font-sans text-[11px] text-gray-600 mt-0.5 leading-relaxed">
              This receipt has been successfully verified by STORYVAULT.
            </p>
          </div>
        </div>

        {/* Logo block */}
        <div className="text-center space-y-2 border-b-2 border-gold/30 pb-6 mt-4">
          <div className="w-14 h-14 rounded-full border border-gold mx-auto overflow-hidden bg-black flex items-center justify-center">
            <img src="/storyvault-logo.jpg" alt="STORYVAULT" className="w-full h-full object-cover" />
          </div>
          <h1 className="font-serif text-xl font-bold tracking-[0.2em] text-black">
            STORYVAULT
          </h1>
          <p className="font-mono text-[9px] text-[#C9A227] uppercase tracking-[0.3em]">
            Unlock Timeless Stories
          </p>
          <p className="font-sans text-[9px] text-gray-400 tracking-wider">
            Digital Library & Premium Book Store
          </p>
        </div>

        {/* Receipt Title */}
        <div className="text-center my-6">
          <h2 className="font-serif text-lg font-bold tracking-widest text-gray-800 uppercase">
            Official Purchase Receipt
          </h2>
        </div>

        {/* Customer & Order details grid */}
        <div className="grid grid-cols-2 gap-6 text-xs font-sans text-gray-600 mb-8 border-b border-gray-100 pb-6">
          <div className="space-y-1.5 font-sans">
            <h5 className="font-serif text-[10px] font-bold text-gray-800 uppercase tracking-wider mb-2">
              Customer Credentials
            </h5>
            <div><span className="font-semibold text-gray-800">Name:</span> {receipt.customerName}</div>
            <div><span className="font-semibold text-gray-800">Email:</span> {receipt.customerEmail}</div>
            <div><span className="font-semibold text-gray-800">Payment Status:</span> <span className="text-green-600 font-bold uppercase">{receipt.paymentStatus}</span></div>
          </div>

          <div className="space-y-1.5 md:pl-10 font-sans">
            <h5 className="font-serif text-[10px] font-bold text-gray-800 uppercase tracking-wider mb-2">
              Transaction Metadata
            </h5>
            <div><span className="font-semibold text-gray-800">Receipt No:</span> <span className="font-mono text-gray-800 font-bold">{receipt.receiptNumber || "N/A (Digital-Only)"}</span></div>
            <div><span className="font-semibold text-gray-800">Order ID:</span> #{receipt.orderId}</div>
            <div><span className="font-semibold text-gray-800">Date:</span> {orderDateFormatted}</div>
            <div><span className="font-semibold text-gray-800">Method:</span> Credit Card</div>
          </div>
        </div>

        {/* Table of books */}
        <div className="mb-8">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="border-t border-b border-gold/40 text-gray-700 font-bold uppercase text-[9px] tracking-wider bg-gray-50">
                <th className="py-2.5 pl-2">Book Cover</th>
                <th className="py-2.5">Title</th>
                <th className="py-2.5">Format</th>
                <th className="py-2.5 text-center">Qty</th>
                <th className="py-2.5 text-right pr-2">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {receipt.books ? receipt.books.map((b: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50/50">
                  <td className="py-3 pl-2">
                    <div className="w-10 h-14 rounded shadow border border-gray-100 overflow-hidden">
                      <img src={b.cover} alt="" className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="py-3 font-serif font-bold text-gray-800 text-sm">
                    {b.title}
                  </td>
                  <td className="py-3 font-mono text-[10px] text-gray-500">
                    {b.format === "physical" ? "📚 Hardcover" : "💻 Digital eBook"}
                  </td>
                  <td className="py-3 text-center font-bold text-gray-800">
                    {b.quantity}
                  </td>
                  <td className="py-3 text-right font-mono text-gray-800 pr-2">
                    ${b.price.toFixed(2)}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td className="py-4 pl-2 font-serif font-bold text-gray-800" colSpan={5}>
                    Preservation Classic Volume ({receipt.bookType})
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Delivery / Access codes panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 font-sans">
          
          {/* DIGITAL ACCESS CODE */}
          {receipt.digitalAccessCode && (
            <div className="bg-gold/5 border border-gold/30 rounded-xl p-5 flex flex-col justify-between text-left">
              <div>
                <h4 className="font-serif text-xs font-bold text-[#C9A227] flex items-center space-x-1.5 mb-2 uppercase tracking-wide">
                  <ShieldCheck size={16} />
                  <span>Digital Access Code</span>
                </h4>
                <span className="font-mono text-base font-bold bg-white border border-gold/30 text-gray-800 px-3 py-1.5 rounded block text-center shadow-inner tracking-wider select-all my-3">
                  {receipt.digitalAccessCode}
                </span>
                <div className="flex justify-between items-center text-[10px] text-gray-500 font-semibold mb-3">
                  <span>Activation State:</span>
                  <span className="text-green-600 font-bold">✓ Activated</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2 no-print">
                <button
                  onClick={() => {
                    const code = receipt.digitalAccessCode || "SV-DR84MN";
                    navigator.clipboard.writeText(code);
                    addToast({
                      title: "✓ Code Copied",
                      message: `Activation code ${code} copied to clipboard! Redirecting to Digital Vault...`
                    });
                    setTimeout(() => {
                      navigate("/digital-vault");
                    }, 1500);
                  }}
                  className="py-2 px-3 bg-[#111] hover:bg-[#252525] text-gold font-mono text-[9px] uppercase font-bold tracking-wider rounded transition-colors text-center cursor-pointer font-sans"
                >
                  Copy Code & Unlock
                </button>
                <button
                  onClick={() => navigate("/library")}
                  className="py-2 px-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-mono text-[9px] uppercase font-bold tracking-wider rounded transition-colors text-center cursor-pointer font-sans"
                >
                  Open Library
                </button>
              </div>
            </div>
          )}

          {/* PHYSICAL METADATA */}
          {receipt.receiptNumber && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-3 text-xs text-gray-600 text-left">
              <h4 className="font-serif text-xs font-bold text-gray-800 flex items-center space-x-1.5 mb-1 uppercase tracking-wide">
                <Truck size={16} className="text-gold" />
                <span>Physical Order Metadata</span>
              </h4>
              
              <div className="space-y-1.5">
                <div>
                  <span className="font-semibold text-gray-700">Receipt No:</span>{" "}
                  <span className="font-mono text-gray-800 font-bold">{receipt.receiptNumber}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Courier Partner:</span>{" "}
                  <span className="text-gray-800 font-semibold">DHL Express Premium</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Estimated Arrival:</span>{" "}
                  <span className="text-gray-800 font-semibold">{estimatedDelivery}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Delivery Status:</span>{" "}
                  <span className="text-gold font-bold uppercase text-[10px]">Acquired by Courier</span>
                </div>
                <div className="flex items-start gap-1">
                  <MapPin size={12} className="text-gold shrink-0 mt-0.5" />
                  <div className="leading-tight text-[11px]">
                    <span className="font-semibold text-gray-700">Address:</span>{" "}
                    {receipt.shippingAddress || "N/A"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Verification Audit details */}
          <div className="border border-gray-200 rounded-xl p-5 flex flex-col justify-center text-left">
            <h4 className="font-serif text-[10px] font-bold text-gray-800 uppercase tracking-wider mb-2">
              System Audit Verification
            </h4>
            <div className="space-y-1 text-[10px] text-gray-500 font-sans leading-tight">
              <div><span className="font-semibold">Ledger Key:</span> {receipt.receiptId}</div>
              <div><span className="font-semibold">Signature:</span> SV-SIG-{receipt.orderId}</div>
              <div><span className="font-semibold">Node Status:</span> Preserved & Confirmed</div>
            </div>
          </div>

        </div>

        {/* Pricing Subtotals */}
        <div className="border-t border-gray-100 pt-6 mb-8 flex justify-end">
          <div className="w-64 space-y-2 font-sans text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-mono text-gray-800">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Sales Tax (1.5%):</span>
              <span className="font-mono text-gray-800">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping & Handling:</span>
              <span className="font-mono text-gray-800">${shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 text-sm font-bold text-gray-900">
              <span className="font-serif">Grand Total:</span>
              <span className="font-mono text-[#C9A227]">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Thank You quote */}
        <div className="text-center space-y-2 border-t border-gold/20 pt-6 mt-8">
          <p className="font-serif italic text-xs text-gray-700">
            "Thank you for choosing STORYVAULT."
          </p>
          <p className="font-sans text-[10px] text-gray-500 max-w-sm mx-auto leading-relaxed">
            Every purchase helps preserve timeless literature for future generations. Enjoy your reading journey.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center text-[9px] text-gray-400 font-sans mt-10 pt-4 border-t border-gray-100">
          <div className="flex space-x-3">
            <span>Terms & Conditions</span>
            <span>•</span>
            <span>Privacy Policy</span>
          </div>
          <div className="text-right">
            <span>support@storyvault.com</span>
            <span className="mx-1">|</span>
            <span>www.storyvault.com</span>
          </div>
        </div>

      </div>

      {/* Control Buttons */}
      <div className="max-w-3xl w-full grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 no-print">
        <button
          onClick={handleDownloadPDF}
          className="py-3.5 bg-gold hover:bg-gold-hover text-background font-mono text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer text-center flex items-center justify-center space-x-1.5 shadow-lg shadow-gold/10"
        >
          <Download size={12} />
          <span>Download PDF</span>
        </button>
        
        <button
          onClick={handlePrint}
          className="py-3.5 border border-gold hover:bg-gold/15 text-gold font-mono text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer text-center flex items-center justify-center space-x-1.5"
        >
          <Printer size={12} />
          <span>Print Receipt</span>
        </button>

        {receipt.digitalAccessCode ? (
          <button
            onClick={() => {
              const code = receipt.digitalAccessCode || "SV-DR84MN";
              navigator.clipboard.writeText(code);
              addToast({
                title: "✓ Code Copied",
                message: `Activation code ${code} copied to clipboard! Redirecting to Digital Vault...`
              });
              setTimeout(() => {
                navigate("/digital-vault");
              }, 1500);
            }}
            className="py-3.5 bg-[#222] hover:bg-[#333] border border-customBorder text-secondaryText hover:text-white font-mono text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer text-center font-sans"
          >
            Copy Code & Unlock
          </button>
        ) : (
          <button
            onClick={() => alert("Shipment Tracking: Package in transit to destination.")}
            className="py-3.5 bg-[#222] hover:bg-[#333] border border-customBorder text-secondaryText hover:text-white font-mono text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer text-center font-sans"
          >
            Track Shipment
          </button>
        )}

        <button
          onClick={() => navigate("/library")}
          className="py-3.5 border border-customBorder hover:border-[#A5A5A5] text-secondaryText hover:text-white font-mono text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer text-center"
        >
          Back to Library
        </button>
      </div>

    </div>
  );
}
