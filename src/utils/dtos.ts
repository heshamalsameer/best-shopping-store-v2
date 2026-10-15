export interface CreateProductDto {
    title: string;
    description: string;
    price:string
    image: string;
}

export interface UpdateProductDto {
    title?: string;
    description?: string;
    price?: string ;
    image?:string
}

export interface RegisterUserDto {
    username: string;
    email: string;
    password: string;
}

export interface LoginUserDto {
    email: string;
    password: string;
}

export interface UpdateUserDto {
    username?: string;
    email?: string;
    password?: string;
}

export interface CreateCommentDto {
    text: string;
    articleId: number;
}
export interface CreateCartDto {
    title: string;
    description: string;
    image:string;
    price:string
    userId: number;
}

export interface UpdateCommentDto {
    text: string;
}
export interface AddToCartDto {
    productId: number;
    quantity?: number;
}

export interface CheckoutDto {
    fullName: string;
    phone: string;
    city: string;
    address: string;
    notes?: string;
    coupon?: string;
    paymentMethod: "CARD" | "CASH";
    card?: { number: string; expiry: string; cvc: string; name: string };
}
