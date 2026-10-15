import { Product } from '@prisma/client';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProductState {
  allProducts: Product[];
}

const initialState: ProductState = {
  allProducts: [],
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    addProducts(state, action: PayloadAction<Product[]>) {
      state.allProducts = action.payload;
    },
    addProduct(state, action: PayloadAction<Product>) {
      state.allProducts.push(action.payload);
    },
    editProduct(state, action: PayloadAction<Product>) {
      state.allProducts = state.allProducts.map((product,index) => {
        if (product.id != action.payload.id){
           return product;
          }else {
          return action.payload
        }
      })
    },
    removeProduct(state, action: PayloadAction<number>) {
      state.allProducts = state.allProducts.filter(product => product.id !== action.payload);
    },
  },
});

export const {addProducts,editProduct, addProduct, removeProduct } = productSlice.actions;

export default productSlice.reducer;
