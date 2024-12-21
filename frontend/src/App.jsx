import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import Components and Pages
import Header from "./Components/Header";
import Footer from "./Components/Footer";

import Error404 from "./Pages/Error404";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import About from "./Pages/About";
import Gallery from "./Pages/Gallery";
import Cart from "./Pages/Cart";
import Checkout from "./Pages/Checkout";
import FAQs from "./Pages/FAQs";
import Contact from "./Pages/Contact";
import Restaurant from "./Pages/Restaurant";
import Menu from "./Pages/Menu";
import Room from "./Pages/Room";
import RoomDetails from "./Pages/RoomDetails";
import Otpverification from "./Pages/OtpVerification";
import Forgetpass from "./Pages/Forgetpass";
import ResetPassword from "./Pages/ResetPassword";
import EmailOtpVerification from "./Pages/EmailOtpVerification";


const App = () => {


  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="*" element={<Error404 />} />
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/room" element={<Room />} />
        <Route path="/roomdetails" element={<RoomDetails />} />
        <Route path="/restaurant" element={<Restaurant />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/faq" element={<FAQs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/otpverification" element={<Otpverification />} />
        <Route path="/emailotpverification" element={<EmailOtpVerification />} />
        <Route path="/forgetpass" element={<Forgetpass />} />
        <Route path="/resetpassword" element={<ResetPassword />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
};

export default App;
