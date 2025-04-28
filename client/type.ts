export interface HighlightsType {
  _id: number;
  _base: string;
  title: string;
  name: string;
  image: string;
  color: string;
  buttonTitle: string;
}

export interface CategoryProps {
  _id: number;
  image: string;
  name: string;
  _base: string;
  description: string;
}

export interface ProductProps {
  options?: string[];
  _id: number;
  _base: string;
  reviews: number;
  rating: number;
  quantity: number;
  overView: string;
  name: string;
  isStock: boolean;
  isNew: boolean;
  images: [string];
  discountedPrice: number;
  regularPrice: number;
  description: string;
  colors: [string];
  category: string;
  brand: string;
  pageType?: string;
  isKitchenOnly?: boolean;
}

export interface BlogProps {
  _id: number;
  image: string;
  title: string;
  description: string;
  _base: string;
}

export interface AddressType {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface UserTypes {
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  avatar?: string;
  id: string;
  address?: AddressType;
  createdAt?: string;
  lastLogin?: string;
  role?: string;
}

export interface OrderTypes {
  orderItems: [ProductProps];
  paymentId: string;
  paymentMethod: string;
  userEmail?: string;
  phoneNumber?: string;
  userName?: string;
  userId: string;
  orderDate: string;
  totalAmount: number;
  shippingAddress?: AddressType;
  shippingCost?: number;
  taxAmount?: number;
}
