import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBookstore } from "../context/useBookstore";
import { User, MapPin, Download, Receipt, BookOpen, Heart, LogOut, Lock, Edit3, Save, Compass } from "lucide-react";
import { updatePassword, updateProfile } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";

export default function CustomerProfile() {
  const navigate = useNavigate();
  const { currentUser, currentUserProfile, customerLogout, addToast, receipts, books } = useBookstore();
  
  const [activeTab, setActiveTab] = useState<"profile" | "addresses" | "library" | "orders" | "progress" | "wishlist">("profile");

  // Profile Edit fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [updatingPass, setUpdatingPass] = useState(false);

  // Address fields
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [editingAddress, setEditingAddress] = useState(false);

  // User Library states
  const [libraryItems, setLibraryItems] = useState<any[]>([]);
  const [loadingLib, setLoadingLib] = useState(false);

  useEffect(() => {
    if (currentUserProfile) {
      setFullName(currentUserProfile.name || "");
      setPhone(currentUserProfile.phone || "");
      const addr = currentUserProfile.address || {};
      setAddressLine(addr.addressLine || "");
      setCity(addr.city || "");
      setPostalCode(addr.postalCode || "");
      setCountry(addr.country || "");
    }
  }, [currentUserProfile]);

  // Load Library Items
  useEffect(() => {
    async function loadLib() {
      if (!currentUser) return;
      setLoadingLib(true);
      try {
        const userLib: any[] = [];
        const purchasedIds = currentUserProfile?.purchasedBooks || [];
        
        for (const bookId of purchasedIds) {
          const bookObj = books.find(b => b.id === bookId);
          if (bookObj) {
            // Fetch reading progress if available
            const progressRef = doc(db, "userLibrary", `${currentUser.uid}_${bookId}`);
            const progressSnap = await getDoc(progressRef);
            const progressData = progressSnap.exists() ? progressSnap.data() : { chapterIndex: 0, pageIndex: 0 };
            userLib.push({ book: bookObj, ...progressData });
          }
        }
        setLibraryItems(userLib);
      } catch (err) {
        console.warn("Failed to load user digital library:", err);
      } finally {
        setLoadingLib(false);
      }
    }
    if (currentUserProfile) {
      loadLib();
    }
  }, [currentUserProfile, books, currentUser]);

  const handleUpdateProfile = async () => {
    if (!currentUser) return;
    try {
      // Update Firebase Auth displayName
      if (fullName !== currentUser.displayName) {
        await updateProfile(currentUser, { displayName: fullName });
      }
      
      // Update Firestore user document
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        name: fullName,
        phone: phone,
        updatedAt: new Date().toISOString()
      });

      addToast({
        title: "✓ Profile Updated",
        message: "Your profile details have been updated."
      });
      setEditingProfile(false);
    } catch (err: any) {
      addToast({
        title: "Update Failed",
        message: err.message || "Failed to update profile details."
      });
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentUser || !newPassword) return;
    if (newPassword !== confirmPassword) {
      addToast({
        title: "Mismatch",
        message: "Passwords do not match."
      });
      return;
    }
    setUpdatingPass(true);
    try {
      await updatePassword(currentUser, newPassword);
      addToast({
        title: "✓ Password Changed",
        message: "Your account password has been changed successfully."
      });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      addToast({
        title: "Change Failed",
        message: err.message || "Password update failed. Please re-authenticate."
      });
    } finally {
      setUpdatingPass(false);
    }
  };

  const handleUpdateAddress = async () => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        address: {
          addressLine,
          city,
          postalCode,
          country
        }
      });
      addToast({
        title: "✓ Address Preserved",
        message: "Shipping address updated successfully."
      });
      setEditingAddress(false);
    } catch (err: any) {
      addToast({
        title: "Failed to Update",
        message: err.message || "Could not preserve shipping address."
      });
    }
  };

  const handleLogout = async () => {
    await customerLogout();
    navigate("/");
  };

  const memberInitials = fullName ? fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "G";

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-[#F8F6F2] pt-28 pb-16 px-6 md:px-12 font-sans select-none relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-radial-gold-glow pointer-events-none opacity-20" />
      
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8 z-10 relative">
        {/* Left Sidebar */}
        <div className="bg-[#151515] border border-customBorder rounded-xl p-6 flex flex-col justify-between h-fit">
          <div className="space-y-6">
            {/* User Profile Avatar */}
            <div className="text-center pb-6 border-b border-customBorder">
              <div className="w-16 h-16 rounded-full bg-gold/15 border border-gold/45 text-gold flex items-center justify-center font-serif text-xl font-bold mx-auto shadow-gold-glow mb-4">
                {memberInitials}
              </div>
              <h3 className="font-serif text-base font-bold truncate max-w-[200px] mx-auto">{fullName || "Guest Reader"}</h3>
              <span className="font-mono text-[9px] text-[#A5A5A5] uppercase tracking-wider block mt-1">{currentUserProfile?.email}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-gold/10 border border-gold/30 text-gold font-mono text-[8px] uppercase tracking-widest mt-3 inline-block">
                Preservation Member
              </span>
            </div>

            {/* Menu options */}
            <nav className="flex flex-col space-y-2">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex items-center space-x-3 w-full py-2.5 px-4 rounded-lg font-mono text-[10px] uppercase tracking-widest border transition-all cursor-pointer ${
                  activeTab === "profile" 
                    ? "bg-gold border-gold text-background font-bold" 
                    : "bg-[#0C0C0C] border-customBorder text-[#A5A5A5] hover:border-gold/30 hover:text-gold"
                }`}
              >
                <User size={13} />
                <span>Profile Info</span>
              </button>

              <button
                onClick={() => setActiveTab("addresses")}
                className={`flex items-center space-x-3 w-full py-2.5 px-4 rounded-lg font-mono text-[10px] uppercase tracking-widest border transition-all cursor-pointer ${
                  activeTab === "addresses" 
                    ? "bg-gold border-gold text-background font-bold" 
                    : "bg-[#0C0C0C] border-customBorder text-[#A5A5A5] hover:border-gold/30 hover:text-gold"
                }`}
              >
                <MapPin size={13} />
                <span>Addresses</span>
              </button>

              <button
                onClick={() => setActiveTab("library")}
                className={`flex items-center space-x-3 w-full py-2.5 px-4 rounded-lg font-mono text-[10px] uppercase tracking-widest border transition-all cursor-pointer ${
                  activeTab === "library" 
                    ? "bg-gold border-gold text-background font-bold" 
                    : "bg-[#0C0C0C] border-customBorder text-[#A5A5A5] hover:border-gold/30 hover:text-gold"
                }`}
              >
                <Download size={13} />
                <span>Digital Library</span>
              </button>

              <button
                onClick={() => setActiveTab("orders")}
                className={`flex items-center space-x-3 w-full py-2.5 px-4 rounded-lg font-mono text-[10px] uppercase tracking-widest border transition-all cursor-pointer ${
                  activeTab === "orders" 
                    ? "bg-gold border-gold text-background font-bold" 
                    : "bg-[#0C0C0C] border-customBorder text-[#A5A5A5] hover:border-gold/30 hover:text-gold"
                }`}
              >
                <Receipt size={13} />
                <span>Order Logs</span>
              </button>

              <button
                onClick={() => setActiveTab("progress")}
                className={`flex items-center space-x-3 w-full py-2.5 px-4 rounded-lg font-mono text-[10px] uppercase tracking-widest border transition-all cursor-pointer ${
                  activeTab === "progress" 
                    ? "bg-gold border-gold text-background font-bold" 
                    : "bg-[#0C0C0C] border-customBorder text-[#A5A5A5] hover:border-gold/30 hover:text-gold"
                }`}
              >
                <BookOpen size={13} />
                <span>Reading Logs</span>
              </button>

              <button
                onClick={() => setActiveTab("wishlist")}
                className={`flex items-center space-x-3 w-full py-2.5 px-4 rounded-lg font-mono text-[10px] uppercase tracking-widest border transition-all cursor-pointer ${
                  activeTab === "wishlist" 
                    ? "bg-gold border-gold text-background font-bold" 
                    : "bg-[#0C0C0C] border-customBorder text-[#A5A5A5] hover:border-gold/30 hover:text-gold"
                }`}
              >
                <Heart size={13} />
                <span>Wishlist</span>
              </button>
            </nav>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center space-x-3 w-full mt-8 py-2.5 bg-red-950/20 border border-red-500/30 hover:bg-red-900/30 text-red-400 font-mono text-[10px] uppercase tracking-widest rounded-lg cursor-pointer transition-colors"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Right Dashboard panel */}
        <div className="bg-[#151515] border border-customBorder rounded-xl p-8 lg:col-span-3 text-left min-h-[500px]">
          
          {/* TAB: PROFILE */}
          {activeTab === "profile" && (
            <div className="space-y-8">
              <div className="border-b border-customBorder pb-4 flex justify-between items-center">
                <div>
                  <h2 className="font-serif text-xl font-bold">Profile Information</h2>
                  <p className="font-mono text-[9px] text-[#A5A5A5] uppercase tracking-wider mt-1">Manage details and codex credentials</p>
                </div>
                <button
                  onClick={() => { if (editingProfile) handleUpdateProfile(); else setEditingProfile(true); }}
                  className="flex items-center space-x-2 py-1.5 px-4 bg-[#0C0C0C] border border-customBorder hover:border-gold text-gold font-mono text-[9px] uppercase tracking-widest rounded cursor-pointer transition-colors"
                >
                  {editingProfile ? <Save size={10} /> : <Edit3 size={10} />}
                  <span>{editingProfile ? "Save Profile" : "Edit Profile"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[9px] font-mono text-[#A5A5A5] uppercase tracking-wider mb-2">Full Name</label>
                  <input
                    type="text"
                    disabled={!editingProfile}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full py-2.5 px-4 bg-[#0C0C0C] border border-customBorder rounded-lg text-sm text-[#F8F6F2] outline-none focus:border-gold focus:shadow-gold-glow disabled:opacity-50 transition-all font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono text-[#A5A5A5] uppercase tracking-wider mb-2">Phone Contact</label>
                  <input
                    type="text"
                    disabled={!editingProfile}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full py-2.5 px-4 bg-[#0C0C0C] border border-customBorder rounded-lg text-sm text-[#F8F6F2] outline-none focus:border-gold focus:shadow-gold-glow disabled:opacity-50 transition-all font-sans"
                  />
                </div>
              </div>

              <div className="pt-8 border-t border-customBorder space-y-6">
                <div>
                  <h3 className="font-serif text-sm text-white">Codex Authentication Password</h3>
                  <p className="font-mono text-[9px] text-[#A5A5A5] uppercase tracking-wider mt-1">Change account access credentials</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[9px] font-mono text-[#A5A5A5] uppercase tracking-wider mb-2">New Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full py-2.5 px-4 bg-[#0C0C0C] border border-customBorder rounded-lg text-sm text-[#F8F6F2] outline-none focus:border-gold focus:shadow-gold-glow transition-all font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono text-[#A5A5A5] uppercase tracking-wider mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full py-2.5 px-4 bg-[#0C0C0C] border border-customBorder rounded-lg text-sm text-[#F8F6F2] outline-none focus:border-gold focus:shadow-gold-glow transition-all font-sans"
                    />
                  </div>
                </div>

                <button
                  onClick={handleUpdatePassword}
                  disabled={updatingPass || !newPassword}
                  className="flex items-center space-x-2 py-2 px-6 bg-gold hover:bg-gold-hover disabled:bg-gold/30 text-background font-mono text-[10px] uppercase font-bold tracking-widest rounded cursor-pointer transition-colors"
                >
                  <Lock size={12} />
                  <span>Update Password</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: ADDRESSES */}
          {activeTab === "addresses" && (
            <div className="space-y-8">
              <div className="border-b border-customBorder pb-4 flex justify-between items-center">
                <div>
                  <h2 className="font-serif text-xl font-bold">Saved Shipping Address</h2>
                  <p className="font-mono text-[9px] text-[#A5A5A5] uppercase tracking-wider mt-1">Configure default address for print orders</p>
                </div>
                <button
                  onClick={() => { if (editingAddress) handleUpdateAddress(); else setEditingAddress(true); }}
                  className="flex items-center space-x-2 py-1.5 px-4 bg-[#0C0C0C] border border-customBorder hover:border-gold text-gold font-mono text-[9px] uppercase tracking-widest rounded cursor-pointer transition-colors"
                >
                  {editingAddress ? <Save size={10} /> : <Edit3 size={10} />}
                  <span>{editingAddress ? "Save Address" : "Change Address"}</span>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[9px] font-mono text-[#A5A5A5] uppercase tracking-wider mb-2">Address Line</label>
                  <input
                    type="text"
                    disabled={!editingAddress}
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    placeholder="Street name, suite or apartment number"
                    className="w-full py-2.5 px-4 bg-[#0C0C0C] border border-customBorder rounded-lg text-sm text-[#F8F6F2] outline-none focus:border-gold focus:shadow-gold-glow disabled:opacity-50 transition-all font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[9px] font-mono text-[#A5A5A5] uppercase tracking-wider mb-2">City</label>
                    <input
                      type="text"
                      disabled={!editingAddress}
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="E.g. London"
                      className="w-full py-2.5 px-4 bg-[#0C0C0C] border border-customBorder rounded-lg text-sm text-[#F8F6F2] outline-none focus:border-gold focus:shadow-gold-glow disabled:opacity-50 transition-all font-sans"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[9px] font-mono text-[#A5A5A5] uppercase tracking-wider mb-2">Postal / Zip Code</label>
                    <input
                      type="text"
                      disabled={!editingAddress}
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="E.g. SW1A 1AA"
                      className="w-full py-2.5 px-4 bg-[#0C0C0C] border border-customBorder rounded-lg text-sm text-[#F8F6F2] outline-none focus:border-gold focus:shadow-gold-glow disabled:opacity-50 transition-all font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono text-[#A5A5A5] uppercase tracking-wider mb-2">Country</label>
                    <input
                      type="text"
                      disabled={!editingAddress}
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="E.g. United Kingdom"
                      className="w-full py-2.5 px-4 bg-[#0C0C0C] border border-customBorder rounded-lg text-sm text-[#F8F6F2] outline-none focus:border-gold focus:shadow-gold-glow disabled:opacity-50 transition-all font-sans"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DIGITAL LIBRARY */}
          {activeTab === "library" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-xl font-bold">Your Digital Library</h2>
                <p className="font-mono text-[9px] text-[#A5A5A5] uppercase tracking-wider mt-1">Access fully unlocked digital codex editions</p>
              </div>

              {loadingLib ? (
                <div className="py-12 text-center font-mono text-[10px] text-gold uppercase tracking-[0.25em] animate-pulse">
                  Unlocking preserved digital library...
                </div>
              ) : libraryItems.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-customBorder rounded-xl bg-[#0C0C0C] space-y-4">
                  <Download size={24} className="text-gold/40 mx-auto" />
                  <p className="font-sans text-xs text-[#A5A5A5] leading-relaxed">
                    No books in your digital library. Purchase eBooks in the catalog or verify print edition receipts to unlock digital copies here!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {libraryItems.map(item => (
                    <div 
                      key={item.book.id} 
                      className="flex items-center space-x-4 p-4 bg-[#0C0C0C] border border-customBorder hover:border-gold/30 rounded-xl transition-all group"
                    >
                      <img
                        src={item.book.coverUrl}
                        alt={item.book.title}
                        className="w-12 h-16 object-cover rounded border border-customBorder group-hover:scale-105 transition-transform"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif text-sm font-bold truncate text-white">{item.book.title}</h4>
                        <span className="font-mono text-[9px] text-gold uppercase tracking-wider block mt-0.5">{item.book.author}</span>
                        <span className="font-mono text-[8px] text-[#A5A5A5] uppercase block mt-2">
                          Last Read: Page {item.pageIndex || 0}
                        </span>
                      </div>
                      <a
                        href={item.book.downloadURL}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 bg-gold text-background rounded-full hover:bg-gold-hover cursor-pointer"
                        title="Download eBook PDF"
                      >
                        <Download size={13} />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: ORDERS */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-xl font-bold">Your Order Logs</h2>
                <p className="font-mono text-[9px] text-[#A5A5A5] uppercase tracking-wider mt-1">Review purchase receipts and delivery status</p>
              </div>

              {receipts.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-customBorder rounded-xl bg-[#0C0C0C] space-y-4">
                  <Receipt size={24} className="text-gold/40 mx-auto" />
                  <p className="font-sans text-xs text-[#A5A5A5] leading-relaxed">
                    No order receipts found. Go to the Catalog and start buying classics to build your vault collection!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {receipts.map(r => (
                    <div 
                      key={r.id} 
                      className="p-5 bg-[#0C0C0C] border border-customBorder rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-gold/20 transition-all"
                    >
                      <div>
                        <div className="flex items-center space-x-3">
                          <span className="font-serif text-sm font-bold text-white">Receipt {r.receiptNumber || r.id}</span>
                          <span className="font-mono text-[8px] bg-gold/10 border border-gold/30 text-gold px-2 py-0.5 rounded-full uppercase tracking-widest">
                            {r.paymentStatus || "PAID"}
                          </span>
                        </div>
                        <p className="font-mono text-[8px] text-[#A5A5A5] uppercase tracking-wider mt-1.5">
                          Placed On: {new Date(r.createdAt || r.date).toLocaleDateString()} • Items: {r.items?.length || 1}
                        </p>
                      </div>

                      <div className="flex items-center space-x-6 w-full md:w-auto justify-between md:justify-end border-t border-customBorder/30 md:border-t-0 pt-3 md:pt-0">
                        <span className="font-mono text-sm text-white font-bold">
                          ₹{r.total || r.amount}
                        </span>
                        
                        <button
                          onClick={() => navigate(`/receipt/${r.receiptNumber || r.id}`)}
                          className="flex items-center space-x-1.5 py-1.5 px-4 border border-customBorder hover:border-gold text-gold font-mono text-[9px] uppercase tracking-widest rounded cursor-pointer transition-colors"
                        >
                          <Compass size={11} />
                          <span>Verify QR</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: READING PROGRESS */}
          {activeTab === "progress" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-xl font-bold">Saved Reading Logs</h2>
                <p className="font-mono text-[9px] text-[#A5A5A5] uppercase tracking-wider mt-1">Resume book previews and historical scrolls</p>
              </div>

              {libraryItems.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-customBorder rounded-xl bg-[#0C0C0C] space-y-4">
                  <BookOpen size={24} className="text-gold/40 mx-auto" />
                  <p className="font-sans text-xs text-[#A5A5A5] leading-relaxed">
                    No active reading progress records. Choose a volume from the Library catalog and click "Preview" to begin!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {libraryItems.map(item => {
                    const pageNo = item.pageIndex || 0;
                    const totalP = item.book.totalPages || 150;
                    const percent = Math.min(100, Math.round((pageNo / totalP) * 100));
                    
                    return (
                      <div key={item.book.id} className="p-5 bg-[#0C0C0C] border border-customBorder rounded-xl hover:border-gold/20 transition-all">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-serif text-sm font-bold text-white">{item.book.title}</h4>
                            <p className="font-mono text-[8px] text-gold uppercase tracking-wider mt-1">{item.book.author}</p>
                          </div>
                          <span className="font-mono text-[9px] text-gold font-bold">{percent}%</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-[#1A1A1A] h-1.5 rounded-full overflow-hidden mt-4">
                          <div 
                            style={{ width: `${percent}%` }} 
                            className="bg-gold h-full rounded-full transition-all duration-500 shadow-gold-glow" 
                          />
                        </div>

                        <div className="flex justify-between items-center text-[9px] font-mono text-[#A5A5A5] mt-3">
                          <span>Page {pageNo} of {totalP}</span>
                          <span>Last Sync: {item.lastRead ? new Date(item.lastRead).toLocaleDateString() : "Just Now"}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: WISHLIST */}
          {activeTab === "wishlist" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-xl font-bold">Your Saved Wishlist</h2>
                <p className="font-mono text-[9px] text-[#A5A5A5] uppercase tracking-wider mt-1">Bookmarked masterpieces representing timeless fiction</p>
              </div>

              {currentUserProfile?.wishlist?.length === 0 || !currentUserProfile?.wishlist ? (
                <div className="p-12 text-center border border-dashed border-customBorder rounded-xl bg-[#0C0C0C] space-y-4">
                  <Heart size={24} className="text-gold/40 mx-auto" />
                  <p className="font-sans text-xs text-[#A5A5A5] leading-relaxed">
                    Your wishlist is empty. Tap the heart icons on book detail profiles to save them here!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentUserProfile.wishlist.map((bookId: string) => {
                    const bookObj = books.find(b => b.id === bookId);
                    if (!bookObj) return null;
                    return (
                      <div 
                        key={bookObj.id} 
                        onClick={() => navigate(`/library`)} // Navigate to library details
                        className="flex items-center space-x-4 p-4 bg-[#0C0C0C] border border-customBorder hover:border-gold/30 rounded-xl cursor-pointer transition-all group"
                      >
                        <img
                          src={bookObj.coverUrl}
                          alt={bookObj.title}
                          className="w-10 h-14 object-cover rounded border border-customBorder group-hover:scale-105 transition-transform"
                        />
                        <div className="text-left flex-1 min-w-0">
                          <h4 className="font-serif text-sm font-bold truncate text-white">{bookObj.title}</h4>
                          <p className="font-mono text-[9px] text-gold uppercase tracking-wider block mt-0.5">{bookObj.author}</p>
                          <span className="font-mono text-[8px] text-[#A5A5A5] uppercase block mt-2">
                            {bookObj.genre} • {bookObj.year}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
