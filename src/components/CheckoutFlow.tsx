import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Tag, CreditCard, ChevronRight, CheckCircle, Package, ArrowRight, ArrowLeft } from "lucide-react";
import { useBookstore, CartItem } from "../context/useBookstore";
import confetti from "canvas-confetti";
import ReceiptView from "./ReceiptView";

interface CheckoutFlowProps {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: "cart" | "shipping" | "payment" | "review" | "confirmation";
}

type CheckoutStep = "cart" | "shipping" | "payment" | "review" | "confirmation";

export default function CheckoutFlow({ isOpen, onClose, initialStep }: CheckoutFlowProps) {
  const {
    cart,
    removeFromCart,
    clearCart,
    activeCoupon,
    applyCoupon,
    removeCoupon,
    shippingDetails,
    saveShipping,
    checkout,
    addToast
  } = useBookstore();

  const [step, setStep] = useState<CheckoutStep>(initialStep || "cart");
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");

  // Shipping Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("United States");

  // Payment State
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");

  // Receipt Order metadata
  const [confirmedOrderId, setConfirmedOrderId] = useState("");
  const [confirmedReceipt, setConfirmedReceipt] = useState<any | null>(null);
  const [purchasedItems, setPurchasedItems] = useState<CartItem[]>([]);

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = activeCoupon ? subtotal * activeCoupon.discount : 0;
  const shippingCost = subtotal > 35 ? 0 : subtotal === 0 ? 0 : 4.99;
  const total = subtotal - discountAmount + shippingCost;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    const success = applyCoupon(couponCode);
    if (success) {
      setCouponCode("");
    } else {
      setCouponError("Invalid coupon code.");
    }
  };

  const handleSaveShipping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !addressLine || !city || !postalCode) {
      addToast({
        title: "⚠️ Incomplete Shipping",
        message: "Please fill in all shipping fields before continuing."
      });
      return;
    }
    saveShipping({ fullName, email, addressLine, city, postalCode, country });
    setStep("payment");
  };

  const handleCompletePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardExpiry || !cardCVC) {
      addToast({
        title: "⚠️ Invalid Payment Details",
        message: "Please enter valid credit card details before continuing."
      });
      return;
    }
    setStep("review");
  };

  const handlePlaceOrder = async () => {
    setPurchasedItems([...cart]);
    try {
      const result = await checkout();
      if (result.success) {
        setConfirmedOrderId(result.orderId);
        setConfirmedReceipt(result.receipt || null);
        setStep("confirmation");
        
        confetti({
          particleCount: 100,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#C9A227", "#F8F6F2"]
        });
      }
    } catch (err) {
      console.error("Order failed:", err);
      addToast({
        title: "❌ Checkout Failed",
        message: "We encountered an issue processing your order. Please try again."
      });
    }
  };

  const handleExitFlow = () => {
    setStep("cart");
    setCouponCode("");
    setCouponError("");
    setFullName("");
    setEmail("");
    setAddressLine("");
    setCity("");
    setPostalCode("");
    setCardNumber("");
    setCardExpiry("");
    setCardCVC("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-[#0c0c0c]/90 backdrop-blur-md flex justify-end overflow-hidden"
        >
          <div className="absolute inset-0 z-0" onClick={onClose} />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 220 }}
            className="relative z-10 w-full max-w-md bg-surface border-l border-customBorder h-full flex flex-col shadow-2xl p-6 select-text"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-secondaryText hover:text-gold p-2 hover:bg-[#252525] rounded-full cursor-pointer transition-colors duration-300"
            >
              <X size={20} />
            </button>

            <h2 className="font-serif text-2xl font-bold text-primaryText mt-8 mb-6 text-left">
              {step === "confirmation" ? "Order Confirmed" : "Bookstore Checkout"}
            </h2>

            {/* Steps views list */}
            <div className="flex-grow overflow-y-auto pr-2 py-4 text-left">
              {step === "cart" && (
                <div className="space-y-4">
                  <span className="font-mono text-[10px] text-gold uppercase tracking-wider block font-bold">Shopping Cart</span>
                  {cart.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-[#151515] p-3 rounded-lg border border-customBorder">
                      <div className="flex items-center space-x-3">
                        <img src={item.book.coverUrl} className="w-8 h-12 object-cover rounded" />
                        <div>
                          <span className="text-xs font-bold text-white block">{item.book.title}</span>
                          <span className="text-[10px] text-secondaryText font-mono uppercase">{item.format} • Qty {item.quantity}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-mono text-gold font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                        <button onClick={() => removeFromCart(item.book.id, item.format)} className="text-red-400 hover:text-red-300 cursor-pointer">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {cart.length === 0 && (
                    <div className="py-12 text-center text-xs font-mono text-secondaryText italic uppercase">
                      Your cart is empty.
                    </div>
                  )}

                  {cart.length > 0 && (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2 border-t border-customBorder/40 pt-4">
                      <input 
                        type="text" 
                        placeholder="Coupon Code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="bg-[#111111] border border-customBorder p-2 text-xs text-white rounded flex-1 focus:border-gold focus:outline-none"
                      />
                      <button type="submit" className="bg-[#222] border border-customBorder text-gold font-mono text-xs px-4 rounded cursor-pointer">
                        Apply
                      </button>
                    </form>
                  )}
                  {couponError && <p className="text-red-400 text-[10px] font-mono">{couponError}</p>}
                </div>
              )}

              {step === "shipping" && (
                <form id="shipping-form" onSubmit={handleSaveShipping} className="space-y-4">
                  <span className="font-mono text-[10px] text-gold uppercase tracking-wider block font-bold">Shipping Address</span>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-secondaryText uppercase">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-[#111111] border border-customBorder p-2 text-xs text-white rounded focus:border-gold focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-secondaryText uppercase">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-[#111111] border border-customBorder p-2 text-xs text-white rounded focus:border-gold focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-secondaryText uppercase">Address Line</label>
                    <input 
                      type="text" 
                      required
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      className="bg-[#111111] border border-customBorder p-2 text-xs text-white rounded focus:border-gold focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono text-secondaryText uppercase">City</label>
                      <input 
                        type="text" 
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="bg-[#111111] border border-customBorder p-2 text-xs text-white rounded focus:border-gold focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono text-secondaryText uppercase">Postal Code</label>
                      <input 
                        type="text" 
                        required
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="bg-[#111111] border border-customBorder p-2 text-xs text-white rounded focus:border-gold focus:outline-none"
                      />
                    </div>
                  </div>

                  <button type="submit" id="submit-shipping-btn" className="hidden" />
                </form>
              )}

              {step === "payment" && (
                <form id="payment-form" onSubmit={handleCompletePayment} className="space-y-4">
                  <span className="font-mono text-[10px] text-gold uppercase tracking-wider block font-bold">Secure Payment</span>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-secondaryText uppercase">Card Number</label>
                    <input 
                      type="text" 
                      required
                      placeholder="1234 5678 1234 5678"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="bg-[#111111] border border-customBorder p-2 text-xs text-white rounded focus:border-gold focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono text-secondaryText uppercase">Expiry (MM/YY)</label>
                      <input 
                        type="text" 
                        required
                        placeholder="12/28"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="bg-[#111111] border border-customBorder p-2 text-xs text-white rounded focus:border-gold focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono text-secondaryText uppercase">CVC</label>
                      <input 
                        type="password" 
                        required
                        placeholder="***"
                        value={cardCVC}
                        onChange={(e) => setCardCVC(e.target.value)}
                        className="bg-[#111111] border border-customBorder p-2 text-xs text-white rounded focus:border-gold focus:outline-none"
                      />
                    </div>
                  </div>

                  <button type="submit" id="submit-payment-btn" className="hidden" />
                </form>
              )}

              {step === "review" && (
                <div className="space-y-4">
                  <span className="font-mono text-[10px] text-gold uppercase tracking-wider block font-bold">Review Order details</span>
                  
                  <div className="bg-[#151515] border border-customBorder rounded-lg p-3 text-xs space-y-2">
                    <p className="text-white"><span className="text-[#A5A5A5] font-mono">Recipient:</span> {fullName}</p>
                    <p className="text-white"><span className="text-[#A5A5A5] font-mono">Shipping to:</span> {addressLine}, {city}</p>
                    <p className="text-white"><span className="text-[#A5A5A5] font-mono">Card Ending:</span> **** **** **** {cardNumber.slice(-4) || "1111"}</p>
                  </div>
                </div>
              )}

              {step === "confirmation" && confirmedReceipt && (
                <ReceiptView receipt={confirmedReceipt} onClose={handleExitFlow} />
              )}
            </div>

            {/* BILLING CALCULATION PANEL */}
            {step !== "confirmation" && (
              <div className="border-t border-customBorder/60 pt-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono text-secondaryText">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {activeCoupon && (
                    <div className="flex justify-between items-center text-xs font-mono text-gold">
                      <span>Discount (Code: {activeCoupon.code})</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-xs font-mono text-secondaryText">
                    <span>Estimated Shipping</span>
                    <span>{shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-mono text-primaryText font-bold border-t border-customBorder/40 pt-2">
                    <span>Total Amount</span>
                    <span className="text-gold text-base">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Next Step / Trigger buttons */}
                {step === "cart" && (
                  <button
                    onClick={() => setStep("shipping")}
                    disabled={cart.length === 0}
                    className="w-full py-4 bg-gold hover:bg-gold-hover text-background font-mono text-xs uppercase tracking-widest font-bold rounded-lg transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <span>Proceed to Shipping</span>
                    <ChevronRight size={14} />
                  </button>
                )}

                {step === "shipping" && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setStep("cart")}
                      className="w-1/3 py-4 border border-customBorder text-secondaryText hover:text-gold font-mono text-xs uppercase tracking-widest font-bold rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <ArrowLeft size={12} />
                      <span>Cart</span>
                    </button>
                    <button
                      onClick={() => document.getElementById("submit-shipping-btn")?.click()}
                      className="flex-grow py-4 bg-gold hover:bg-gold-hover text-background font-mono text-xs uppercase tracking-widest font-bold rounded-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <span>Proceed to Payment</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}

                {step === "payment" && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setStep("shipping")}
                      className="w-1/3 py-4 border border-customBorder text-secondaryText hover:text-gold font-mono text-xs uppercase tracking-widest font-bold rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <ArrowLeft size={12} />
                      <span>Back</span>
                    </button>
                    <button
                      onClick={() => document.getElementById("submit-payment-btn")?.click()}
                      className="flex-grow py-4 bg-gold hover:bg-gold-hover text-background font-mono text-xs uppercase tracking-widest font-bold rounded-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <span>Review Order</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}

                {step === "review" && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setStep("payment")}
                      className="w-1/3 py-4 border border-customBorder text-secondaryText hover:text-gold font-mono text-xs uppercase tracking-widest font-bold rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <ArrowLeft size={12} />
                      <span>Back</span>
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      className="flex-grow py-4 bg-gold hover:bg-gold-hover text-background font-mono text-xs uppercase tracking-widest font-bold rounded-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-gold-glow"
                    >
                      <span>Place Order</span>
                      <Package size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
