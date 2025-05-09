import { useEffect, useState } from "react";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { FaChevronDown } from "react-icons/fa";
import { FiShoppingBag, FiUser } from "react-icons/fi";
import { IoClose, IoSearchOutline } from "react-icons/io5";
import { Link, useLocation } from "react-router-dom";
import { logo } from "../assets";
import Container from "./Container";
import { config } from "../../config";
import { getData } from "../lib";
import { ProductProps } from "../../type";
import ProductCard from "./ProductCard";
import { store } from "../lib/store";
import { categories } from "../config/categories";

const bottomNavigation = [
  { title: "Home", link: "/" },
  { title: "Shop", link: "/product" },
  { title: "Kitchen", link: "/kitchen" },
  { title: "Cart", link: "/cart" },
  { title: "Orders", link: "/orders" },
];

const Header = () => {
  const [searchText, setSearchText] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { cartProduct, currentUser } = store();
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      const endpoint = `${config?.baseUrl}/products`;
      try {
        const data = await getData(endpoint);
        setProducts(data);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = products.filter((item: ProductProps) =>
      item.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchText, products]);

  return (
    <>
      {isSearchFocused && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-all duration-500 ease-in" />
      )}
      <div className="w-full bg-white border-b border-gray-200 md:sticky md:top-0 z-50">
        <Container>
          <div className="h-20 flex items-center justify-between">
            {/* Logo */}
            <Link to={"/"} className="transform hover:scale-105 transition-transform duration-300">
              <img src={logo} alt="logo" className="w-24" />
            </Link>
            {/* SearchBar */}
            <div className="hidden md:inline-flex max-w-3xl w-full relative mx-8">
              <input
                type="text"
                onChange={(e) => setSearchText(e.target.value)}
                value={searchText}
                placeholder="Search products..."
                className="w-full flex-1 rounded-full text-darkText text-lg placeholder:text-base placeholder:tracking-wide shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 placeholder:font-normal focus:ring-1 focus:ring-gray-300 focus:outline-none transition-all duration-500 ease-in sm:text-sm px-4 py-2"
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              {searchText ? (
                <IoClose
                  onClick={() => setSearchText("")}
                  className="absolute top-2.5 right-4 text-xl hover:text-primary hover:scale-110 cursor-pointer transition-all duration-300 ease-in-out"
                />
              ) : (
                <IoSearchOutline className="absolute top-2.5 right-4 text-xl text-gray-400" />
              )}
            </div>
            {/* Search product will go here */}
            {searchText && (
              <div className="absolute left-0 top-20 w-full mx-auto max-h-[500px] px-10 py-5 bg-white z-20 overflow-y-scroll text-darkText shadow-lg border-t border-gray-200 scrollbar-hide animate-fadeIn">
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
                    {filteredProducts?.map((item: ProductProps) => (
                      <ProductCard
                        key={item?._id}
                        item={item}
                        setSearchText={setSearchText}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-10 bg-gray-50 w-full flex items-center justify-center border border-gray-200 rounded-md">
                    <p className="text-xl font-normal">
                      Nothing matches with your search keywords{" "}
                      <span className="underline underline-offset-2 decoration-[1px] text-primary font-semibold">{`(${searchText})`}</span>
                    </p>
                    . Please try again
                  </div>
                )}
              </div>
            )}

            {/* Menubar */}
            <div className="flex items-center gap-x-6 text-2xl">
            <Link to="/profile" className="transform hover:scale-110 transition-all duration-300 ease-in-out">
                <FiUser className="text-gray-600 hover:text-primary transition-colors duration-300" />
              </Link>
              <Link to={"/cart"} className="relative block transform hover:scale-110 transition-all duration-300 ease-in-out">
                <FiShoppingBag className="text-gray-600 hover:text-primary transition-colors duration-300" />
                <span className="inline-flex items-center justify-center bg-primary text-white absolute -top-1 -right-2 text-[9px] rounded-full w-4 h-4 transition-transform duration-300">
                  {cartProduct?.length > 0 ? cartProduct?.length : "0"}
                </span>
              </Link>
            </div>
          </div>
        </Container>
        <Container className="py-3 border-t border-gray-100">
          <div className="flex items-center gap-8">
            <Menu as="div" className="relative">
              <MenuButton className="inline-flex items-center gap-2 text-gray-600 hover:text-primary py-1.5 px-3 font-medium transition-all duration-300 ease-in-out hover:scale-105">
                Categories <FaChevronDown className="text-sm mt-1 transition-transform duration-300 group-hover:rotate-180" />
              </MenuButton>
              <Transition
                enter="transition ease-out duration-300"
                enterFrom="opacity-0 translate-y-2"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-2"
              >
                <MenuItems
                  className="absolute top-full left-0 w-52 mt-1 origin-top-right rounded-lg border border-gray-200 bg-white p-1 text-sm shadow-lg focus:outline-none z-50"
                >
                  {categories.map((item) => (
                    <MenuItem key={item._id}>
                      <Link
                        to={`/category/${item._base}`}
                        className="flex w-full items-center gap-2 rounded-md py-2 px-3 text-gray-600 hover:bg-primary hover:text-white transition-all duration-300 ease-in-out transform hover:translate-x-1"
                      >
                        <img
                          src={item.image}
                          alt="categoryImage"
                          className="w-6 h-6 rounded-md transition-transform duration-300 group-hover:scale-110"
                        />
                        {item.name}
                      </Link>
                    </MenuItem>
                  ))}
                </MenuItems>
              </Transition>
            </Menu>
            <nav className="flex items-center gap-12">
              {bottomNavigation.map(({ title, link }) => {
                const isActive = location.pathname === link ||
                  (link !== "/" && location.pathname.startsWith(link));

                return (
                  <Link
                    to={link}
                    key={title}
                    className={`text-sm font-medium transform transition-all duration-450 ease-in hover:scale-105 rounded-full ${
                      isActive
                        ? "bg-primary text-white px-4 py-2 rounded-full shadow-sm hover:shadow-md hover:bg-primary/90"
                        : "text-gray-600 hover:text-primary"
                    }`}
                  >
                    {title}
                  </Link>
                );
              })}
            </nav>
          </div>
        </Container>
      </div>
    </>
  );
};

export default Header;
