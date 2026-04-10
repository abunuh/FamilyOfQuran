
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, ScrollText, ArrowRight, Bookmark, History, FileText, HeartHandshake } from 'lucide-react';
import { motion } from 'framer-motion';
import BilingualSearch from '@/components/BilingualSearch.jsx';
import DonationModal from '@/components/DonationModal.jsx';

const HomePage = () => {
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

  return (
    <>
      <Helmet>
        <title>Family of the Quran - Your Gateway to Islamic Knowledge</title>
        <meta name="description" content="Explore the Holy Quran and authentic Hadith collections. Family of the Quran connects you to essential Islamic resources." />
      </Helmet>

      <div className="min-h-screen">
        <header className="absolute top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex-1"></div>
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" className="rounded-full bg-background/50 backdrop-blur-md hover:bg-background shadow-sm hidden sm:flex">
                <Link to="/reading-history" className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  History
                </Link>
              </Button>
              <Button asChild variant="ghost" className="rounded-full bg-background/50 backdrop-blur-md hover:bg-background shadow-sm hidden sm:flex">
                <Link to="/notepad" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Notepad
                </Link>
              </Button>
              <Button asChild variant="secondary" className="rounded-full bg-background/80 backdrop-blur-md hover:bg-background shadow-sm hidden sm:flex">
                <Link to="/bookmarks" className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4" />
                  Bookmarks
                </Link>
              </Button>
              <Button 
                onClick={() => setIsDonationModalOpen(true)}
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-all active:scale-[0.98]"
              >
                <HeartHandshake className="w-4 h-4 mr-2" />
                Support Us
              </Button>
            </div>
          </div>
        </header>

        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1684668128818-1ebd8b3e0f54)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background"></div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Family of the Quran
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mx-auto leading-relaxed mb-8 max-w-2xl">
                Welcome to your gateway for Islamic knowledge and spiritual growth. We connect you to the timeless wisdom of the Holy Quran and the authentic teachings of Prophet Muhammad (peace be upon him).
              </p>
              <p className="text-base sm:text-lg text-muted-foreground mx-auto max-w-xl">
                Begin your journey of learning and reflection with trusted resources.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-24 px-4 sm:px-6 lg:px-8 relative z-20 -mt-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <BilingualSearch />
          </motion.div>
        </section>

        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Explore Sacred Texts
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Access comprehensive collections of Islamic scripture and prophetic traditions
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-2 hover:border-primary/50">
                  <CardContent className="p-8 flex flex-col h-full">
                    <div className="mb-6">
                      <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <BookOpen className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-2xl font-semibold text-foreground mb-3">
                        Explore the Holy Quran
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Read, listen, and study the complete Quran with translations in multiple languages, recitations by renowned scholars, and detailed tafsir.
                      </p>
                    </div>
                    <div className="mt-auto">
                      <Button 
                        asChild 
                        size="lg" 
                        className="w-full group transition-all duration-200 active:scale-[0.98]"
                      >
                        <a 
                          href="https://quran.com" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2"
                        >
                          Visit Quran.com
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-2 hover:border-primary/50">
                  <CardContent className="p-8 flex flex-col h-full">
                    <div className="mb-6">
                      <div className="w-16 h-16 rounded-xl bg-secondary/20 flex items-center justify-center mb-4">
                        <ScrollText className="w-8 h-8 text-secondary-foreground" />
                      </div>
                      <h3 className="text-2xl font-semibold text-foreground mb-3">
                        Discover Authentic Hadith
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Access authentic Hadith collections including Sahih Bukhari, Sahih Muslim, and other trusted sources of prophetic guidance and wisdom.
                      </p>
                    </div>
                    <div className="mt-auto">
                      <Button 
                        asChild 
                        size="lg" 
                        variant="secondary"
                        className="w-full group transition-all duration-200 active:scale-[0.98]"
                      >
                        <a 
                          href="https://sunnah.com" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2"
                        >
                          Visit Sunnah.com
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto text-center bg-card border border-border/50 rounded-3xl p-8 sm:p-12 shadow-sm"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <HeartHandshake className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 font-serif">
              Support Our Mission
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
              Family of the Quran is dedicated to providing free, accessible, and authentic Islamic knowledge. Your generous donations help us maintain our servers, develop new features, and keep the platform ad-free for everyone.
            </p>
            <Button 
              size="lg" 
              onClick={() => setIsDonationModalOpen(true)}
              className="text-lg px-8 h-14 rounded-full shadow-md transition-all active:scale-[0.98]"
            >
              Make a Donation
            </Button>
          </motion.div>
        </section>

        <footer className="bg-muted/50 border-t border-border py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground mb-2">
                Family of the Quran
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Connecting hearts to divine guidance
              </p>
              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-4">
                <a href="#" className="hover:text-foreground transition-colors duration-200">Privacy Policy</a>
                <span>•</span>
                <a href="#" className="hover:text-foreground transition-colors duration-200">Terms of Service</a>
              </div>
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Family of the Quran. All rights reserved.
              </p>
            </div>
          </div>
        </footer>

        <DonationModal 
          isOpen={isDonationModalOpen} 
          onClose={() => setIsDonationModalOpen(false)} 
        />
      </div>
    </>
  );
};

export default HomePage;
