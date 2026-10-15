import { Cart } from '@prisma/client';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartState {
  cartProducts: Cart[];
}

const initialState: CartState = {
  cartProducts: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addCartProducts(state, action: PayloadAction<Cart[]>) {
      state.cartProducts = action.payload;
    },
    addToCart(state, action: PayloadAction<Cart>) {
      const index = state.cartProducts.findIndex(item => item.id === action.payload.id);
      if (index >= 0) state.cartProducts[index] = action.payload;
      else state.cartProducts.push(action.payload);
    },
    setQuantity(state, action: PayloadAction<{ id: number; quantity: number }>) {
      const item = state.cartProducts.find(i => i.id === action.payload.id);
      if (item) item.quantity = action.payload.quantity;
    },
    removeFromCart(state, action: PayloadAction<number>) {
      state.cartProducts = state.cartProducts.filter(item => item.id !== action.payload);
    },
    clearCart(state) {
      state.cartProducts = [];
    },
  },
});

export const { addCartProducts, addToCart, setQuantity, removeFromCart, clearCart } = cartSlice.actions;

export default cartSlice.reducer;
