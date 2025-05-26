import Container from "../ui/Container";

const PrivacyPolicy = () => {
  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <Container className="mt-10">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Privacy Policy</h1>
        <p className="text-center text-lg text-gray-600 mb-10">Effective Date: 26-05-2025</p>
        <section className="bg-white rounded-lg p-8 mb-8 shadow-lg border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-green-500 pb-2 inline-block">1. Who We Are</h2>
            <p className="text-gray-700">
              <strong className="text-gray-900">SnapEat</strong> is an instant food delivery app based in Dimapur, Nagaland, India. Your privacy is important to us, and this policy outlines how we handle your data.
            </p>
          </section>

          <section className="bg-white rounded-lg p-8 mb-8 shadow-lg border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-green-500 pb-2 inline-block">2. Information We Collect</h2>
            <ul className="list-none pl-0">
              <li className="relative pl-6 mb-2 before:content-['•'] before:absolute before:left-0 before:text-green-500 before:text-xl">Full Name</li>
              <li className="relative pl-6 mb-2 before:content-['•'] before:absolute before:left-0 before:text-green-500 before:text-xl">Phone Number</li>
              <li className="relative pl-6 mb-2 before:content-['•'] before:absolute before:left-0 before:text-green-500 before:text-xl">Delivery Address</li>
              <li className="relative pl-6 mb-2 before:content-['•'] before:absolute before:left-0 before:text-green-500 before:text-xl">Order History</li>
            </ul>
            <p className="text-gray-700">
              We do <strong className="text-gray-900">not</strong> collect your email address, real-time location, or device details.
            </p>
          </section>

          <section className="bg-white rounded-lg p-8 mb-8 shadow-lg border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-green-500 pb-2 inline-block">3. How We Use Your Data</h2>
            <p className="text-gray-700">We use your information strictly for:</p>
            <ul className="list-none pl-0">
              <li className="relative pl-6 mb-2 before:content-['•'] before:absolute before:left-0 before:text-green-500 before:text-xl">Processing and delivering your orders</li>
              <li className="relative pl-6 mb-2 before:content-['•'] before:absolute before:left-0 before:text-green-500 before:text-xl">Providing customer support</li>
              <li className="relative pl-6 mb-2 before:content-['•'] before:absolute before:left-0 before:text-green-500 before:text-xl">Sending transactional notifications</li>
            </ul>
            <p className="text-gray-700">
              We do <strong className="text-gray-900">not</strong> use your information for marketing or advertising.
            </p>
          </section>

          <section className="bg-white rounded-lg p-8 mb-8 shadow-lg border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-green-500 pb-2 inline-block">4. Payments</h2>
            <p className="text-gray-700">
              All payments are securely handled by <strong className="text-gray-900">Razorpay</strong>. We do <strong className="text-gray-900">not</strong> store your payment details on our servers.
            </p>
          </section>

          <section className="bg-white rounded-lg p-8 mb-8 shadow-lg border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-green-500 pb-2 inline-block">5. Data Sharing</h2>
            <p className="text-gray-700">
              We do <strong className="text-gray-900">not</strong> sell or share your data with third parties, except where required to complete your payment via Razorpay.
            </p>
          </section>

          <section className="bg-white rounded-lg p-8 mb-8 shadow-lg border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-green-500 pb-2 inline-block">6. Account Management</h2>
            <ul className="list-none pl-0">
              <li className="relative pl-6 mb-2 before:content-['•'] before:absolute before:left-0 before:text-green-500 before:text-xl">You can request to delete your account by contacting our support team.</li>
              <li className="relative pl-6 mb-2 before:content-['•'] before:absolute before:left-0 before:text-green-500 before:text-xl">You may request access to your personal data anytime.</li>
            </ul>
          </section>

          <section className="bg-white rounded-lg p-8 mb-8 shadow-lg border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-green-500 pb-2 inline-block">7. Security</h2>
            <p className="text-gray-700">
              We use <strong className="text-gray-900">two-factor authentication (2FA)</strong> to secure your account and keep your data protected.
            </p>
          </section>

          <section className="bg-white rounded-lg p-8 mb-8 shadow-lg border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-green-500 pb-2 inline-block">8. Children’s Privacy</h2>
            <p className="text-gray-700">
              We do not knowingly collect information from children under 18. If we do, we will take steps to delete it.
            </p>
          </section>

          <section className="bg-white rounded-lg p-8 mb-8 shadow-lg border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-green-500 pb-2 inline-block">9. Updates to This Policy</h2>
            <p className="text-gray-700">
              We may update this policy from time to time. The updated version will be available on this page with the new effective date.
            </p>
          </section>

          <section className="bg-white rounded-lg p-8 mb-8 shadow-lg border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-green-500 pb-2 inline-block">10. Contact Us</h2>
            <p className="text-gray-700">If you have any questions or requests, please contact us:</p>
            <p className="text-gray-700">
              <strong className="text-gray-900">Email:</strong>{" "}
              <a href="mailto:snapeat247@gmail.com" className="text-green-500 hover:underline">
                snapeat247@gmail.com
              </a>{" "}
              <br />
              <strong className="text-gray-900">Phone:</strong>+91 6909 150 947
            </p>
          </section>
        </Container>
      </div>
  );
};

export default PrivacyPolicy;
