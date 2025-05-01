import { useEffect, useState } from "react";
import { FaQuestionCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { store } from "../lib/store";
import CartProduct from "../ui/CartProduct";
import RazorpayCheckoutBtn from "../ui/RazorpayCheckoutBtn";
import Container from "../ui/Container";
import FormattedPrice from "../ui/FormattedPrice";
import ShippingAddressForm, { ShippingAddressType } from "../ui/ShippingAddressForm";

const Cart = () => {
  const [totalAmt, setTotalAmt] = useState({ regular: 0, discounted: 0 });
  const { cartProduct, currentUser } = store();
  const [shippingAddress, setShippingAddress] = useState<ShippingAddressType | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(true);

  const shippingAmt = 25;
  const taxAmt = 15;

  useEffect(() => {
    const totals = cartProduct.reduce(
      (sum, product) => {
        sum.regular += product?.regularPrice * product?.quantity;
        sum.discounted += product?.discountedPrice * product?.quantity;
        return sum;
      },
      { regular: 0, discounted: 0 }
    );
    setTotalAmt(totals);
  }, [cartProduct]);
  return (
    <Container>
      {cartProduct.length > 0 ? (
        <>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Shopping Cart
          </h1>

          <div className="mt-10 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
            <section className="lg:col-span-7">
              <div className=" divide-y divide-gray-200 border-b border-t border-gray-200">
                {cartProduct.map((product) => (
                  <CartProduct product={product} key={product?._id} />
                ))}
              </div>
            </section>
            <section className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
              <h2 className="text-lg font-medium text-gray-900">
                Order summary
              </h2>
              <dl className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Subtotal</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    <FormattedPrice amount={totalAmt?.regular} />
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="flex items-center text-sm text-gray-600">
                    <span>Shipping estimate</span>

                    <FaQuestionCircle
                      className="h-5 w-5 text-gray-400 ml-2"
                      aria-hidden="true"
                    />
                  </dt>
                  <dd className="text-sm font-medium text-gray-900">
                    <FormattedPrice amount={shippingAmt} />
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="flex text-sm text-gray-600">
                    <span>Tax estimate</span>

                    <FaQuestionCircle
                      className="h-5 w-5 text-gray-400 ml-2"
                      aria-hidden="true"
                    />
                  </dt>
                  <dd className="text-sm font-medium text-gray-900">
                    <FormattedPrice amount={taxAmt} />
                  </dd>
                </div>
                {Number((totalAmt?.regular - totalAmt?.discounted).toFixed(2)) > 0 && (
                  <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                    <dt className="text-base font-medium text-gray-900">
                      Total Discount
                    </dt>
                    <dd className="text-base font-medium text-gray-500">
                      <FormattedPrice
                        amount={totalAmt?.regular - totalAmt?.discounted}
                      />
                    </dd>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="text-base font-medium text-gray-900">
                    Order total
                  </dt>
                  <dd className="text-lg font-bold text-gray-900">
                    <FormattedPrice
                      amount={totalAmt?.discounted + shippingAmt + taxAmt}
                    />
                  </dd>
                </div>
              </dl>

              {showAddressForm ? (
                <ShippingAddressForm
                  onAddressSubmit={(address) => {
                    setShippingAddress(address);
                    setShowAddressForm(false);
                  }}
                />
              ) : (
                <div className="mt-6">
                  <div className="bg-gray-100 p-4 rounded-md mb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Shipping to:</h3>
                        <p className="mt-1 text-sm text-gray-600">{shippingAddress?.fullName}</p>
                        <p className="mt-1 text-sm text-gray-600">{shippingAddress?.addressLine1}</p>
                        {shippingAddress?.addressLine2 && (
                          <p className="text-sm text-gray-600">{shippingAddress?.addressLine2}</p>
                        )}
                        <p className="text-sm text-gray-600">
                          {shippingAddress?.city}, {shippingAddress?.state} {shippingAddress?.postalCode}
                        </p>
                        <p className="text-sm text-gray-600">{shippingAddress?.country}</p>
                        <p className="text-sm text-gray-600">{shippingAddress?.phoneNumber}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(true)}
                        className="text-sm font-medium text-red-600 hover:text-red-500"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                  <RazorpayCheckoutBtn products={cartProduct} shippingAddress={shippingAddress} />
                </div>
              )}
            </section>
          </div>
        </>
      ) : (
        <div className="bg-white h-96 flex flex-col gap-2 items-center justify-center py-5 rounded-lg border border-gray-200 drop-shadow-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Shopping Cart
          </h1>
          <p className="text-lg max-w-[600px] text-center text-gray-600 tracking-wide leading-6">
            Your cart is empty.
          </p>
          <Link
            to={"/product"}
            className="bg-red-600 text-gray-200 px-8 py-4 rounded-md border-2 border-transparent hover:bg-white hover:text-red-600 hover:border-2 hover:border-red-600 duration-200 uppercase text-sm font-semibold tracking-wide"
          >
            go to shopping
          </Link>
        </div>
      )}
    </Container>
  );
};

export default Cart;
