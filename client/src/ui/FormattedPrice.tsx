const FormattedPrice = ({ amount }: { amount?: number }) => {
  // Use en-IN locale for Indian Rupee symbol (₹)
  const formattedAmount = new Number(amount).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  });
  return <span>{formattedAmount}</span>;
};

export default FormattedPrice;
