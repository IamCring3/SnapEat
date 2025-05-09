
import { FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { twMerge } from "tailwind-merge";

interface Props {
  showButton?: boolean;
  link?: string;
  className?: string;
  text?: string;
}

const LinkButton = ({ showButton, link, className, text }: Props) => {
  const newClassName = twMerge(
    "bg-primary text-white py-3 px-6 rounded-full flex items-center gap-2 transition-all duration-300 ease-in border-2 border-transparent hover:!bg-white hover:text-red-600 hover:border-red-600 font-medium",
    className
  );
  return (
    <Link to={link ? link : "/product"} className={newClassName}>
      {text || "Shop Now"} {!showButton && <FaArrowRight className="ml-2" />}
    </Link>
  );
};

export default LinkButton;
