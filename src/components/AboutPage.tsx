import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, Sparkles, ShoppingBag, CloudLightning, 
  Zap, Palette, Award, Eye, ShieldCheck, Heart 
} from "lucide-react";

export default function AboutPage() {
  const navigate = useNavigate();

  // Animation configurations
  const fadeUpVariants: any = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.215, 0.61, 0.355, 1.0] }
    }
  };

  const staggerContainer: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const cardVariants: any = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-background text-primaryText relative overflow-hidden select-text">
      
      {/* BACKGROUND PARTICLES HERO EFFECT */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Large gold ambient glows */}
        <div className="absolute top-[-100px] left-1/4 w-[600px] h-[500px] bg-radial-gold-glow opacity-30" />
        <div className="absolute bottom-[20%] right-[-100px] w-[500px] h-[500px] bg-radial-gold-glow opacity-20" />
        <div className="absolute top-[40%] left-[-200px] w-[600px] h-[600px] bg-[#1a160f]/20 rounded-full blur-[120px]" />
        
        {/* Floating dust particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-gold/30 rounded-full blur-[1px]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 30 - 15, 0],
              opacity: [0.1, 0.6, 0.1]
            }}
            transition={{
              duration: 15 + Math.random() * 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 pt-28 pb-20">
        
        {/* HERO SECTION */}
        <section className="min-h-[75vh] flex flex-col justify-center text-left py-12 border-b border-customBorder/30">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUpVariants}
            className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 items-center"
          >
            {/* Logo Column */}
            <div className="md:col-span-4 flex justify-center md:justify-start">
              <div className="w-44 h-44 md:w-56 md:h-56 rounded-2xl overflow-hidden border border-gold/30 shadow-[0_0_50px_rgba(201,162,39,0.15)] bg-black relative group">
                <img 
                  src="/storyvault-logo.jpg" 
                  alt="StoryVault Logo" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                />
                <div className="absolute inset-0 border border-gold/15 rounded-2xl pointer-events-none" />
              </div>
            </div>

            {/* Text Column */}
            <div className="md:col-span-8 space-y-6">
              <span className="font-mono text-xs text-gold uppercase tracking-[0.3em] font-semibold block">
                PRESENCE IN LITERATURE
              </span>
              <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-wider text-primaryText leading-none">
                STORYVAULT
              </h1>
              <h2 className="font-serif italic text-2xl md:text-3xl text-gold/90 font-medium">
                Where Every Story Finds a Home.
              </h2>
              
              <p className="text-secondaryText text-base md:text-lg leading-relaxed pt-2 font-sans">
                StoryVault is more than an online bookstore. It is a digital sanctuary where timeless literature is preserved, celebrated, and shared with readers around the world. From beloved classics to treasured collections, StoryVault transforms reading into an immersive experience through beautiful design, thoughtful technology, and a passion for storytelling.
              </p>

              <div className="pt-4">
                <button
                  onClick={() => navigate("/library")}
                  className="py-4 px-10 bg-gold hover:bg-gold-hover text-background font-mono text-xs uppercase tracking-widest font-bold rounded-lg transition-all duration-300 shadow-gold-glow flex items-center space-x-2 cursor-pointer"
                >
                  <BookOpen size={14} />
                  <span>Explore Our Library</span>
                </button>
              </div>
            </div>
          </motion.div>
        </section>

        {/* OUR STORY */}
        <section className="py-24 border-b border-customBorder/30 text-left">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariants}
            className="grid grid-cols-1 md:grid-cols-5 gap-12 items-start"
          >
            <div className="md:col-span-2">
              <span className="font-mono text-xs text-gold uppercase tracking-widest font-bold">
                THE ORIGINS
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-primaryText mt-2 leading-tight">
                Every Great Story Deserves a Home
              </h2>
            </div>
            
            <div className="md:col-span-3 space-y-6 text-secondaryText text-sm md:text-base leading-relaxed font-sans">
              <p>
                Long before digital libraries existed, stories were carefully preserved on wooden shelves, passed down from generation to generation.
              </p>
              <p className="font-serif italic text-gold text-lg py-2 border-l-2 border-gold/40 pl-6 my-4">
                "StoryVault was created with one simple belief: Books should never feel forgotten. Every page holds imagination. Every chapter carries history. Every reader deserves an experience as memorable as the story itself."
              </p>
              <p>
                Instead of building another bookstore, StoryVault was designed as a digital library where literature feels alive through elegant design, immersive interactions, and carefully curated collections.
              </p>
            </div>
          </motion.div>
        </section>

        {/* OUR MISSION */}
        <section className="py-24 border-b border-customBorder/30 text-left">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariants}
            className="grid grid-cols-1 md:grid-cols-5 gap-12 items-start"
          >
            <div className="md:col-span-2">
              <span className="font-mono text-xs text-gold uppercase tracking-widest font-bold">
                THE PURPOSE
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-primaryText mt-2 leading-tight">
                Preserving Literature for Every Generation
              </h2>
            </div>

            <div className="md:col-span-3 text-secondaryText text-sm md:text-base leading-relaxed space-y-4 font-sans">
              <p>
                Our mission is to make timeless public-domain literature accessible, enjoyable, and beautifully presented for readers across the world.
              </p>
              <p>
                StoryVault combines modern technology with literary heritage, creating an environment where readers can discover classics, preview books, build personal collections, and continue their reading journey from anywhere.
              </p>
            </div>
          </motion.div>
        </section>

        {/* WHAT MAKES STORYVAULT DIFFERENT */}
        <section className="py-24 border-b border-customBorder/30 text-left">
          <div className="mb-12">
            <span className="font-mono text-xs text-gold uppercase tracking-widest font-bold">
              THE EXPERIENCE
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primaryText mt-2">
              What Makes StoryVault Different
            </h2>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* Card 1 */}
            <motion.div variants={cardVariants} className="bg-[#121212] border border-customBorder hover:border-gold/40 p-6 rounded-xl flex flex-col justify-between hover:shadow-gold-glow/5 transition-all duration-300 group">
              <div className="mb-4 text-gold p-3 bg-customBorder/25 rounded-lg w-fit group-hover:scale-110 transition-transform">
                <BookOpen size={20} />
              </div>
              <div>
                <h4 className="font-serif text-base font-bold text-primaryText mb-2">Curated Public Domain Library</h4>
                <p className="text-secondaryText text-xs font-sans leading-relaxed">Explore a growing collection of timeless literary classics.</p>
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div variants={cardVariants} className="bg-[#121212] border border-customBorder hover:border-gold/40 p-6 rounded-xl flex flex-col justify-between hover:shadow-gold-glow/5 transition-all duration-300 group">
              <div className="mb-4 text-gold p-3 bg-customBorder/25 rounded-lg w-fit group-hover:scale-110 transition-transform">
                <Sparkles size={20} />
              </div>
              <div>
                <h4 className="font-serif text-base font-bold text-primaryText mb-2">Immersive Reading Experience</h4>
                <p className="text-secondaryText text-xs font-sans leading-relaxed">Enjoy realistic page-turning, elegant typography, and distraction-free reading.</p>
              </div>
            </motion.div>

            {/* Card 3 */}
            <motion.div variants={cardVariants} className="bg-[#121212] border border-customBorder hover:border-gold/40 p-6 rounded-xl flex flex-col justify-between hover:shadow-gold-glow/5 transition-all duration-300 group">
              <div className="mb-4 text-gold p-3 bg-customBorder/25 rounded-lg w-fit group-hover:scale-110 transition-transform">
                <ShoppingBag size={20} />
              </div>
              <div>
                <h4 className="font-serif text-base font-bold text-primaryText mb-2">Modern Online Bookstore</h4>
                <p className="text-secondaryText text-xs font-sans leading-relaxed">Purchase physical and digital books through a seamless shopping experience.</p>
              </div>
            </motion.div>

            {/* Card 4 */}
            <motion.div variants={cardVariants} className="bg-[#121212] border border-customBorder hover:border-gold/40 p-6 rounded-xl flex flex-col justify-between hover:shadow-gold-glow/5 transition-all duration-300 group">
              <div className="mb-4 text-gold p-3 bg-customBorder/25 rounded-lg w-fit group-hover:scale-110 transition-transform">
                <CloudLightning size={20} />
              </div>
              <div>
                <h4 className="font-serif text-base font-bold text-primaryText mb-2">Cloud Powered</h4>
                <p className="text-secondaryText text-xs font-sans leading-relaxed">Your library, bookmarks, wishlist, and orders stay securely synchronized through StoryVault Cloud Services.</p>
              </div>
            </motion.div>

            {/* Card 5 */}
            <motion.div variants={cardVariants} className="bg-[#121212] border border-customBorder hover:border-gold/40 p-6 rounded-xl flex flex-col justify-between hover:shadow-gold-glow/5 transition-all duration-300 group">
              <div className="mb-4 text-gold p-3 bg-customBorder/25 rounded-lg w-fit group-hover:scale-110 transition-transform">
                <Zap size={20} />
              </div>
              <div>
                <h4 className="font-serif text-base font-bold text-primaryText mb-2">Fast Performance</h4>
                <p className="text-secondaryText text-xs font-sans leading-relaxed">Built with modern technologies for speed, reliability, and smooth interactions.</p>
              </div>
            </motion.div>

            {/* Card 6 */}
            <motion.div variants={cardVariants} className="bg-[#121212] border border-customBorder hover:border-gold/40 p-6 rounded-xl flex flex-col justify-between hover:shadow-gold-glow/5 transition-all duration-300 group">
              <div className="mb-4 text-gold p-3 bg-customBorder/25 rounded-lg w-fit group-hover:scale-110 transition-transform">
                <Palette size={20} />
              </div>
              <div>
                <h4 className="font-serif text-base font-bold text-primaryText mb-2">Beautiful Design</h4>
                <p className="text-secondaryText text-xs font-sans leading-relaxed">Inspired by museums, luxury libraries, and editorial publications.</p>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* READING EXPERIENCE */}
        <section className="py-24 border-b border-customBorder/30 text-left">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariants}
            className="grid grid-cols-1 md:grid-cols-5 gap-12 items-center"
          >
            <div className="md:col-span-2">
              <span className="font-mono text-xs text-gold uppercase tracking-widest font-bold">
                THE IMMERSION
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-primaryText mt-2 leading-tight">
                Recreating the Touch of Paper
              </h2>
            </div>
            
            <div className="md:col-span-3 text-secondaryText text-sm md:text-base leading-relaxed space-y-4 font-sans">
              <p>
                Instead of simply displaying text on a screen, StoryVault recreates the feeling of opening a cherished hardcover book.
              </p>
              <p>
                Readers can browse elegant collections, preview selected works, save their progress, create wishlists, and build a personal digital library—all within a thoughtfully designed environment that celebrates literature.
              </p>
            </div>
          </motion.div>
        </section>

        {/* OUR COLLECTION */}
        <section className="py-24 border-b border-customBorder/30 text-left">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariants}
            className="grid grid-cols-1 md:grid-cols-5 gap-12"
          >
            <div className="md:col-span-2">
              <span className="font-mono text-xs text-gold uppercase tracking-widest font-bold">
                THE WRITERS
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-primaryText mt-2 leading-tight">
                Our Collection
              </h2>
              <p className="text-secondaryText text-xs font-sans mt-3 leading-relaxed">
                StoryVault features an expanding library of classic public-domain works from some of history's most celebrated authors.
              </p>
            </div>

            <div className="md:col-span-3">
              <span className="font-mono text-[9px] text-[#A5A5A5] uppercase tracking-wider block mb-4">
                Explore masterpieces by literary legends:
              </span>
              <div className="grid grid-cols-2 gap-4 text-xs font-serif font-semibold italic text-primaryText/90">
                <div className="space-y-2">
                  <p>• Jane Austen</p>
                  <p>• Arthur Conan Doyle</p>
                  <p>• Bram Stoker</p>
                  <p>• Charles Dickens</p>
                  <p>• Jules Verne</p>
                </div>
                <div className="space-y-2">
                  <p>• H. G. Wells</p>
                  <p>• Alexandre Dumas</p>
                  <p>• Mary Shelley</p>
                  <p>• Oscar Wilde</p>
                  <p>• Mark Twain</p>
                </div>
              </div>
              <span className="text-[10px] text-gold/75 font-mono block mt-6">
                ...and many more historical curators of story.
              </span>
            </div>
          </motion.div>
        </section>

        {/* TECHNOLOGY STACK */}
        <section className="py-24 border-b border-customBorder/30 text-left">
          <div className="mb-12">
            <span className="font-mono text-xs text-gold uppercase tracking-widest font-bold">
              THE FOUNDATION
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primaryText mt-2">
              The Technology Stack
            </h2>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
          >
            <motion.div variants={cardVariants} className="bg-[#121212] border border-customBorder p-5 rounded-lg flex flex-col justify-between">
              <span className="font-mono text-[9px] text-gold uppercase tracking-wider block">Frontend</span>
              <div className="mt-4 space-y-1 font-sans text-xs text-secondaryText">
                <p className="text-primaryText font-bold">React</p>
                <p>Vite</p>
                <p>TypeScript</p>
                <p>Tailwind CSS</p>
              </div>
            </motion.div>

            <motion.div variants={cardVariants} className="bg-[#121212] border border-customBorder p-5 rounded-lg flex flex-col justify-between">
              <span className="font-mono text-[9px] text-gold uppercase tracking-wider block">Backend</span>
              <div className="mt-4 space-y-1 font-sans text-xs text-secondaryText">
                <p className="text-primaryText font-bold">User Authentication</p>
                <p>Content Database</p>
                <p>Digital Asset Library</p>
              </div>
            </motion.div>

            <motion.div variants={cardVariants} className="bg-[#121212] border border-customBorder p-5 rounded-lg flex flex-col justify-between">
              <span className="font-mono text-[9px] text-gold uppercase tracking-wider block">Animations</span>
              <div className="mt-4 space-y-1 font-sans text-xs text-secondaryText">
                <p className="text-primaryText font-bold">GSAP</p>
                <p>Framer Motion</p>
                <p>Lenis Scroll</p>
              </div>
            </motion.div>

            <motion.div variants={cardVariants} className="bg-[#121212] border border-customBorder p-5 rounded-lg flex flex-col justify-between">
              <span className="font-mono text-[9px] text-gold uppercase tracking-wider block">Reader Engine</span>
              <div className="mt-4 space-y-1 font-sans text-xs text-secondaryText">
                <p className="text-primaryText font-bold">StPageFlip</p>
                <p>Responsive Canvas</p>
                <p>Progress Saver</p>
              </div>
            </motion.div>

            <motion.div variants={cardVariants} className="bg-[#121212] border border-customBorder p-5 rounded-lg flex flex-col justify-between">
              <span className="font-mono text-[9px] text-gold uppercase tracking-wider block">Performance</span>
              <div className="mt-4 space-y-1 font-sans text-xs text-secondaryText">
                <p className="text-primaryText font-bold">Lazy Loading</p>
                <p>Image WebP</p>
                <p>Caching API</p>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* OUR VALUES */}
        <section className="py-24 border-b border-customBorder/30 text-left">
          <div className="mb-12">
            <span className="font-mono text-xs text-gold uppercase tracking-widest font-bold">
              THE PILLARS
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primaryText mt-2">
              Our Core Values
            </h2>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
          >
            <motion.div variants={cardVariants} className="space-y-2 border-l border-gold/45 pl-4 py-2 text-left">
              <h4 className="font-serif text-base font-bold text-primaryText flex items-center space-x-1.5">
                <Award size={14} className="text-gold" />
                <span>Knowledge</span>
              </h4>
              <p className="text-secondaryText text-xs font-sans leading-relaxed">
                We believe knowledge should remain accessible for future generations.
              </p>
            </motion.div>

            <motion.div variants={cardVariants} className="space-y-2 border-l border-gold/45 pl-4 py-2 text-left">
              <h4 className="font-serif text-base font-bold text-primaryText flex items-center space-x-1.5">
                <ShieldCheck size={14} className="text-gold" />
                <span>Craftsmanship</span>
              </h4>
              <p className="text-secondaryText text-xs font-sans leading-relaxed">
                Every interaction is designed with care and attention to detail.
              </p>
            </motion.div>

            <motion.div variants={cardVariants} className="space-y-2 border-l border-gold/45 pl-4 py-2 text-left">
              <h4 className="font-serif text-base font-bold text-primaryText flex items-center space-x-1.5">
                <Eye size={14} className="text-gold" />
                <span>Innovation</span>
              </h4>
              <p className="text-secondaryText text-xs font-sans leading-relaxed">
                Technology should enhance reading, never distract from it.
              </p>
            </motion.div>

            <motion.div variants={cardVariants} className="space-y-2 border-l border-gold/45 pl-4 py-2 text-left">
              <h4 className="font-serif text-base font-bold text-primaryText flex items-center space-x-1.5">
                <Heart size={14} className="text-gold" />
                <span>Community</span>
              </h4>
              <p className="text-secondaryText text-xs font-sans leading-relaxed">
                Readers are part of a shared journey through literature.
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* OUR VISION */}
        <section className="py-24 border-b border-customBorder/30 text-left">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariants}
            className="space-y-4 max-w-3xl"
          >
            <span className="font-mono text-xs text-gold uppercase tracking-widest font-bold">
              THE FUTURE
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primaryText leading-tight">
              Our Vision
            </h2>
            <p className="text-secondaryText text-base leading-relaxed font-sans pt-2">
              We envision a world where every timeless story remains only a click away. StoryVault is built not simply to sell books, but to preserve literary heritage, inspire curiosity, and create a reading experience that feels as meaningful as the books themselves.
            </p>
          </motion.div>
        </section>

        {/* CALL TO ACTION */}
        <section className="py-20 text-center relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121212] to-[#0a0a0a] border border-gold/20 shadow-2xl">
          <div className="absolute inset-0 bg-radial-gold-glow opacity-10 pointer-events-none" />
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUpVariants}
            className="max-w-2xl mx-auto px-6 space-y-6"
          >
            <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-wide text-primaryText">
              Ready to Begin Your Next Literary Journey?
            </h2>
            <p className="text-secondaryText text-xs md:text-sm leading-relaxed font-sans max-w-md mx-auto">
              Thousands of timeless classics are waiting to be discovered. Whether you're searching for unforgettable adventures, inspiring philosophies, gripping mysteries, or beloved romances, your next great story begins here.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6">
              <button
                onClick={() => navigate("/library")}
                className="w-full sm:w-auto py-3.5 px-8 bg-gold hover:bg-gold-hover text-background font-mono text-[10px] uppercase font-bold tracking-widest rounded transition-all cursor-pointer shadow-gold-glow flex items-center justify-center space-x-1.5"
              >
                <BookOpen size={12} />
                <span>Explore Library</span>
              </button>
              
              <button
                onClick={() => navigate("/library")}
                className="w-full sm:w-auto py-3.5 px-8 border border-gold hover:bg-gold/10 text-gold font-mono text-[10px] uppercase font-bold tracking-widest rounded transition-all cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <ShoppingBag size={12} />
                <span>Visit Book Store</span>
              </button>
            </div>
          </motion.div>
        </section>

      </div>
    </div>
  );
}
