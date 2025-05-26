
import Container from "./Container";
import { payment } from "../assets";
import FooterTop from "./FooterTop";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div className="mt-10 bg-background">
      <FooterTop />
      <Container className="flex flex-col md:flex-row items-center gap-4 justify-between py-6 border-t border-border">
        <div className="flex items-center gap-4">
          <p className="text-darkText">@2025 SnapEat. All rights reserved.</p>
          <Link to="/privacy-policy" className="text-darkText hover:underline">Privacy Policy</Link>
          <Link to="/request-account-deletion" className="text-darkText hover:underline">Request Account Deletion</Link>
        </div>
        <img src={payment} alt="payment-img" className="object-cover" />
      </Container>
    </div>
  );
};

export default Footer;
