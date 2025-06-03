import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CookiesProvider } from 'react-cookie';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import EventDetails from './pages/EventDetails';
import LoginPage from './pages/LoginPage';
import AccountPage from './pages/AccountPage';
import TicketDetails from './pages/TicketDetails';
import BookingDetails from './pages/BookingDetails';
import CreateEvent from './pages/CreateEvent';
import OrderConfirmation from './pages/OrderConfirmation';
import EventCategoryPage from './pages/EventCategoryPage';

function App() {

  return (
    <CookiesProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/ticket/:id" element={<TicketDetails />} />
          <Route path="/bookings/:id" element={<BookingDetails />} /> 
          <Route path="/create" element={<CreateEvent />} /> 
          <Route path="/order-confirmation/:paymentID" element={<OrderConfirmation />} />
          <Route path="/events/type/:category" element={<EventCategoryPage />} />
        </Routes>
      </Router>
    </CookiesProvider>

  );
}

export default App;
