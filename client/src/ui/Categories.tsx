
import Container from "./Container";
import Title from "./Title";
import { Link } from "react-router-dom";
import { categories } from "../config/categories";

const Categories = () => {
  return (
    <Container>
      <div className="mb-10">
        <div className="flex items-center justify-between">
          <Title text="Popular categories" />
          <Link
            to="/category"
            className="font-medium relative group overflow-hidden"
          >
            View All Categories{" "}
            <span className="absolute bottom-0 left-0 w-full block h-[1px] bg-gray-600 -translate-x-[100%] group-hover:translate-x-0 duration-300" />
          </Link>
        </div>
        <div className="w-full h-[1px] bg-gray-200 mt-3" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.map((item) => (
          <Link
            to={`/category/${item._base}`}
            key={item._id}
            className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition-all duration-300 flex flex-col items-center gap-2"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-16 h-16 object-contain group-hover:scale-110 duration-300"
            />
            <p className="text-sm font-medium text-center">{item.name}</p>
          </Link>
        ))}
      </div>
    </Container>
  );
};

export default Categories;
