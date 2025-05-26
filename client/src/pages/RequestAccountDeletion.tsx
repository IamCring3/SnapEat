import Container from "../ui/Container";

const RequestAccountDeletion = () => {
  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <Container className="mt-10">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Account Deletion Request</h1>
        <p className="text-center text-lg text-gray-600 mb-10">Manage your data with SnapEat</p>
        <section className="bg-white rounded-lg p-8 mb-8 shadow-lg border border-gray-200 text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-red-500 pb-2 inline-block">Request Account Deletion</h2>
          <p className="text-gray-700 mb-4">To request the deletion of your SnapEat account, please send an email to our support team.</p>
          <p className="text-gray-700 mb-6">In your email, please include the following information:</p>
          <ul className="list-none pl-0 mb-8">
            <li className="relative pl-6 mb-2 before:content-['•'] before:absolute before:left-0 before:text-red-500 before:text-xl">Your Full Name</li>
            <li className="relative pl-6 mb-2 before:content-['•'] before:absolute before:left-0 before:text-red-500 before:text-xl">The Phone Number associated with your SnapEat account</li>
          </ul>
          <p className="text-gray-700 mb-8">We will process your request as quickly as possible and confirm the deletion of your account.</p>
          <a
            href="mailto:snapeat247@gmail.com?subject=Account%20Deletion%20Request&body=Dear%20SnapEat%20Support%20Team,%0A%0AI would like to request the deletion of my account.%0A%0AMy Name:%20[Your Full Name]%0AMy Phone Number:%20[Your Phone Number]%0A%0AThank you."
            className="inline-block bg-red-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-red-600 transition-colors duration-300"
          >
            Email Us to Request Deletion
          </a>
          <p className="text-gray-700 mt-4">Alternatively, you can email us directly at: <strong className="text-gray-900">snapeat247@gmail.com</strong></p>
        </section>
      </Container>
    </div>
  );
};

export default RequestAccountDeletion;
