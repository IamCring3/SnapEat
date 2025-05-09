// This component is deprecated and will be removed
// Use RazorpayCheckoutBtn instead

import { ProductProps } from "../../type";

const CheckoutBtn = ({ products }: { products: ProductProps[] }) => {
  console.warn("CheckoutBtn is deprecated. Use RazorpayCheckoutBtn instead.");

  return (
    <div className="mt-6">
      <p className="text-red-500">This payment method is no longer available.</p>
    </div>
  );
};

export default CheckoutBtn;
