import React, { useRef } from "react";
import { motion } from "framer-motion";
import { X, Printer, Download, BookOpen, ShieldCheck, Clock, MapPin, Truck } from "lucide-react";
import { useBookstore } from "../context/useBookstore";

interface ReceiptBook {
  bookId: string;
  title: string;
  cover: string;
  format: "physical" | "ebook";
  price: number;
  quantity: number;
  digitalAccessCode?: string;
}

interface ReceiptData {
  receiptId: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  books: ReceiptBook[];
  receiptNumber?: string;
  digitalAccessCode?: string;
  bookType: "Physical" | "Digital" | "Mixed";
  paymentStatus: string;
  amount: number;
  createdAt: string;
  shippingAddress?: string;
}

interface ReceiptViewProps {
  receipt: ReceiptData;
  onClose: () => void;
}

export default function ReceiptView({ receipt, onClose }: ReceiptViewProps) {
  const printableRef = useRef<HTMLDivElement>(null);

  // Dynamic QR Verification URL Resolution
  const { addToast } = useBookstore();
  const qrIdentifier = receipt.receiptNumber || receipt.digitalAccessCode || receipt.receiptId;
  const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const baseUrl = isLocal 
    ? window.location.origin 
    : (import.meta.env.VITE_APP_URL || window.location.origin);
  const secureUrl = `${baseUrl}/receipt/${qrIdentifier}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Triggers browser print dialog which allows saving as PDF natively
    window.print();
  };

  // Calculate pricing elements
  const subtotal = receipt.books.reduce((acc, b) => acc + (b.price * b.quantity), 0);
  const discount = 0; // Or calculate if coupons apply
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
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-10 select-text print:bg-white print:p-0 print:static">
      
      {/* Print Overrides CSS injection */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #storyvault-invoice-wrapper, #storyvault-invoice-wrapper * {
            visibility: visible;
          }
          #storyvault-invoice-wrapper {
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

      {/* Main Container Card */}
      <div className="max-w-3xl w-full flex flex-col no-print h-full max-h-[90vh]">
        
        {/* Top Control Bar */}
        <div className="flex justify-between items-center mb-4 text-white">
          <div className="flex items-center space-x-2">
            <span className="font-serif text-sm font-bold text-gold uppercase tracking-widest">
              StoryVault Invoice
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-secondaryText hover:text-gold p-2 hover:bg-[#202020] rounded-full transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="flex-1 overflow-y-auto pr-1">
          
          {/* Printable Invoice Page */}
          <div 
            id="storyvault-invoice-wrapper"
            ref={printableRef}
            className="bg-white text-black p-8 md:p-12 shadow-2xl rounded-2xl relative overflow-hidden border border-gold/45 select-text print:rounded-none print:border-none"
            style={{
              fontFamily: "'Georgia', serif",
            }}
          >
            {/* StoryVault Subtle Gold Watermark Logo Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] w-[400px] h-[400px] pointer-events-none select-none">
              <img src="/storyvault-logo.jpg" alt="" className="w-full h-full object-contain filter grayscale" />
            </div>

            {/* Receipt Header logo block */}
            <div className="text-center space-y-2 border-b-2 border-gold/30 pb-6">
              <div className="w-16 h-16 rounded-full border border-gold mx-auto overflow-hidden bg-black flex items-center justify-center">
                <img src="/storyvault-logo.jpg" alt="STORYVAULT" className="w-full h-full object-cover" />
              </div>
              <h1 className="font-serif text-2xl font-bold tracking-[0.2em] text-black">
                STORYVAULT
              </h1>
              <p className="font-mono text-[9px] text-[#C9A227] uppercase tracking-[0.3em]">
                Unlock Timeless Stories
              </p>
              <p className="font-sans text-[10px] text-gray-500 tracking-wider">
                Digital Library & Premium Book Store
              </p>
            </div>

            {/* Receipt Title */}
            <div className="text-center my-6">
              <h2 className="font-serif text-xl font-bold tracking-widest text-gray-800 uppercase">
                Purchase Receipt
              </h2>
            </div>

            {/* Customer Details Box */}
            <div className="grid grid-cols-2 gap-6 text-xs font-sans text-gray-600 mb-8 border-b border-gray-100 pb-6">
              <div className="space-y-1.5">
                <h5 className="font-serif text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                  Customer Credentials
                </h5>
                <div><span className="font-semibold text-gray-800">Name:</span> {receipt.customerName}</div>
                <div><span className="font-semibold text-gray-800">Email:</span> {receipt.customerEmail}</div>
                <div><span className="font-semibold text-gray-800">Payment Status:</span> <span className="text-green-600 font-bold uppercase">{receipt.paymentStatus}</span></div>
              </div>

              <div className="space-y-1.5 text-right md:text-left md:pl-10">
                <h5 className="font-serif text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                  Transaction Metadata
                </h5>
                <div><span className="font-semibold text-gray-800">Order ID:</span> #{receipt.orderId}</div>
                <div><span className="font-semibold text-gray-800">Date:</span> {orderDateFormatted}</div>
                <div><span className="font-semibold text-gray-800">Payment Method:</span> Credit Card</div>
              </div>
            </div>

            {/* Items Table */}
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
                  {receipt.books.map((b, idx) => (
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
                  ))}
                </tbody>
              </table>
            </div>

            {/* Conditional Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 font-sans">
              
              {/* DIGITAL PURCHASE SECTION */}
              {receipt.digitalAccessCode && (
                <div className="bg-gold/5 border border-gold/30 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-[#C9A227] flex items-center space-x-1.5 mb-2">
                      <ShieldCheck size={16} />
                      <span>Digital Access Code</span>
                    </h4>
                    <span className="font-mono text-base font-bold bg-white border border-gold/30 text-gray-800 px-3 py-1.5 rounded block text-center shadow-inner tracking-wider select-all my-3">
                      {receipt.digitalAccessCode}
                    </span>
                    <div className="flex justify-between items-center text-[10px] text-gray-500 font-semibold mb-3">
                      <span>Verification Status:</span>
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
                          onClose();
                          window.location.href = "/digital-vault";
                        }, 1500);
                      }}
                      className="py-2 px-3 bg-gold hover:bg-gold-hover text-background font-mono text-[9px] uppercase font-bold tracking-wider rounded transition-colors text-center cursor-pointer font-sans"
                    >
                      Copy Code & Unlock
                    </button>
                    <button
                      onClick={() => window.location.reload()}
                      className="py-2 px-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-mono text-[9px] uppercase font-bold tracking-wider rounded transition-colors text-center cursor-pointer"
                    >
                      View Library
                    </button>
                  </div>
                </div>
              )}

              {/* PHYSICAL PURCHASE SECTION */}
              {receipt.receiptNumber && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-3 text-xs text-gray-600">
                  <h4 className="font-serif text-sm font-bold text-gray-800 flex items-center space-x-1.5 mb-1">
                    <Truck size={16} className="text-gold" />
                    <span>Physical Order Metadata</span>
                  </h4>
                  
                  <div className="space-y-1.5">
                    <div>
                      <span className="font-semibold text-gray-700">Receipt No:</span>{" "}
                      <span className="font-mono text-gray-800 font-bold">{receipt.receiptNumber}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Delivery Est:</span>{" "}
                      <span className="text-gray-800 font-semibold">{estimatedDelivery}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Tracking No:</span>{" "}
                      <span className="font-mono text-gray-800 font-semibold">SV-TRK-{Math.floor(10000000 + Math.random() * 90000000)}</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <MapPin size={12} className="text-gold shrink-0 mt-0.5" />
                      <div className="leading-tight text-[11px]">
                        <span className="font-semibold text-gray-700">Ship To:</span>{" "}
                        {receipt.shippingAddress || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* QR Code and Verification */}
              <div className="border border-gray-200 rounded-xl p-5 flex items-center justify-between">
                <div className="space-y-2">
                  <h4 className="font-serif text-xs font-bold text-gray-800 uppercase tracking-wider">
                    QR Verification
                  </h4>
                  <p className="text-[10px] text-gray-500 leading-relaxed max-w-[150px]">
                    Scan this code to verify your transaction index or download your acquired digital editions directly.
                  </p>
                </div>
                <div className="w-20 h-20 bg-white border border-gray-100 rounded p-1 shadow-inner shrink-0">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(secureUrl)}`} 
                    alt="QR Code" 
                    className="w-full h-full object-contain" 
                  />
                </div>
              </div>

            </div>

            {/* Subtotal summary section */}
            <div className="border-t border-gray-100 pt-6 mb-8 flex justify-end">
              <div className="w-64 space-y-2 font-sans text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono text-gray-800">${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount (WELCOME20):</span>
                    <span className="font-mono">-${discount.toFixed(2)}</span>
                  </div>
                )}
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

            {/* Thank you message */}
            <div className="text-center space-y-2 border-t border-gold/20 pt-6 mt-8">
              <p className="font-serif italic text-xs text-gray-700">
                "Thank you for choosing STORYVAULT."
              </p>
              <p className="font-sans text-[10px] text-gray-500 max-w-sm mx-auto leading-relaxed">
                Every purchase helps preserve timeless literature for future generations. Enjoy your reading journey.
              </p>
            </div>

            {/* Footer metadata */}
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

        </div>

        {/* Action buttons outside printed receipt card */}
        <div className="grid grid-cols-4 gap-4 mt-6 no-print">
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

          <button
            onClick={onClose}
            className="py-3.5 bg-[#222] hover:bg-[#333] border border-customBorder text-secondaryText hover:text-white font-mono text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer text-center"
          >
            Back to Library
          </button>

          <button
            onClick={onClose}
            className="py-3.5 border border-customBorder hover:border-[#A5A5A5] text-secondaryText hover:text-white font-mono text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer text-center"
          >
            Continue Shopping
          </button>
        </div>

      </div>

    </div>
  );
}
