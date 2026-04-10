
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import HomePage from '@/pages/HomePage.jsx';
import BookmarksPage from '@/pages/BookmarksPage.jsx';
import ReadingHistoryPage from '@/pages/ReadingHistoryPage.jsx';
import MyNotesPage from '@/pages/MyNotesPage.jsx';
import DonationSuccessPage from '@/pages/DonationSuccessPage.jsx';
import DonationCancelPage from '@/pages/DonationCancelPage.jsx';
import ScrollToTop from '@/components/ScrollToTop.jsx';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/bookmarks" element={<BookmarksPage />} />
        <Route path="/reading-history" element={<ReadingHistoryPage />} />
        <Route path="/notepad" element={<MyNotesPage />} />
        <Route path="/donation-success" element={<DonationSuccessPage />} />
        <Route path="/donation-cancel" element={<DonationCancelPage />} />
        <Route path="*" element={
          <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
            <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
            <p className="text-muted-foreground mb-8">The page you are looking for does not exist.</p>
            <a href="/" className="text-primary hover:underline">Return to Home</a>
          </div>
        } />
      </Routes>
      <Toaster position="bottom-right" />
    </BrowserRouter>
  );
}

export default App;
