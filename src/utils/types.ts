import { Cart, Comment, Order, OrderEvent, OrderItem, Product, User } from "@prisma/client";

export type JWTPayload = {
    id: number;
    isAdmin: boolean;
    username: string;
}

export type CommentWithUser = Comment & { user: User };

export type SingleProduct = Product & { comments: CommentWithUser[] };

export type CartLine = Cart & { product: Product | null };

export type OrderWithItems = Order & { items: OrderItem[]; history: OrderEvent[] };

export type OrderWithUser = Order & { items: OrderItem[]; user: Pick<User, "username" | "email"> };
