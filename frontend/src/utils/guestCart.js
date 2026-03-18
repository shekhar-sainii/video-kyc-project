const KEY = 'guest_cart';

export const getGuestCart = () =>
  JSON.parse(localStorage.getItem(KEY)) || [];

export const setGuestCart = (items) =>{

  localStorage.setItem(KEY, JSON.stringify(items));
     window.dispatchEvent(new Event("guest-cart-updated"));
}

export const addGuestItem = ({ productId, quantity }) => {
  const cart = getGuestCart();
  const item = cart.find(i => i.productId === productId);

  if (item) item.quantity += quantity;
  else cart.push({ productId, quantity });

  setGuestCart(cart);
};

export const updateGuestItem = (productId, quantity) => {
  setGuestCart(
    getGuestCart().map(i =>
      i.productId === productId
        ? { ...i, quantity }
        : i
    )
  );
};

export const removeGuestItem = (productId) => {
  setGuestCart(
    getGuestCart().filter(i => i.productId !== productId)
  );
};

export const clearGuestCart = () =>
  localStorage.removeItem(KEY);
