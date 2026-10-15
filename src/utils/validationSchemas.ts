import { z } from "zod";

export const createProductSchema = z.object({
  title: z
    .string({
      required_error: "title is required",
      invalid_type_error: "title should be of type string",
    })
    .min(2, { message: "title should be at least 2 characters long" })
    .max(200, { message: "title should be less than 200 characters" }),

  description: z.string().min(10),
  price:z.string({
    required_error:"price is required"
  }),

});

export const registerSchema = z.object({
  username: z.string().min(2).max(100), 
  email: z.string().min(3).max(200).email(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().min(3).max(200).email(),
  password: z.string().min(6),
});

export const createCommentShema = z.object({
  text: z.string().min(2).max(500),
  articleId: z.number(),
});
export const createCartShema = z.object({
  title: z
    .string({
      required_error: "title is required",
      invalid_type_error: "title should be of type string",
    })
    .min(2, { message: "title should be at least 2 characters long" })
    .max(200, { message: "title should be less than 200 characters" }),

  description: z.string().min(10),
  price:z.string({
    required_error:"price is required"
  }),
  image:z.string({
    required_error:"image is required"
  }),
  
});

export const updateUserSchema = z.object({
  username: z.string().min(2).max(100).optional(),
  email: z.string().min(3).max(200).email().optional(),
  password: z.string().min(6).optional(),
});

export const addToCartSchema = z.object({
  productId: z.number({ required_error: "productId is required" }).int().positive(),
  quantity: z.number().int().min(1).max(10).optional(),
});

export const updateCartSchema = z.object({
  quantity: z.number().int().min(1, { message: "quantity should be at least 1" }).max(10, { message: "you can order up to 10 of one product" }),
});

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, { message: "full name is required" }).max(120),
  phone: z.string().trim().regex(/^[+\d][\d\s-]{6,20}$/, { message: "enter a valid phone number" }),
  city: z.string().trim().min(2, { message: "city is required" }).max(80),
  address: z.string().trim().min(5, { message: "address is required" }).max(300),
  notes: z.string().max(500).optional(),
  coupon: z.string().max(30).optional(),
  paymentMethod: z.enum(["CARD", "CASH"]),
  card: z
    .object({ number: z.string(), expiry: z.string(), cvc: z.string(), name: z.string() })
    .optional(),
});

export const orderStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
  note: z.string().max(200).optional(),
});
