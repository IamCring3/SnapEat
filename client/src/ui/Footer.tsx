
import Container from "./Container";
import { payment } from "../assets";
import FooterTop from "./FooterTop";

const Footer = () => {
  return (
    <div className="mt-10 bg-background">
      <FooterTop />
      <Container className="flex flex-col md:flex-row items-center gap-4 justify-between py-6 border-t border-border">
        <p className="text-darkText">@2025 SnapEat. All rights reserved.</p>
        <img src={payment} alt="payment-img" className="object-cover" />
      </Container>
    </div>
  );
};

export default Footer;
