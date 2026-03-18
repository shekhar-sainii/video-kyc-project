const CART_KEY = 'guest_cart';

export const getLocalCart = () => {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
};

export const setLocalCart = (items) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
};

export const clearLocalCart = () => {
  localStorage.removeItem(CART_KEY);
};

export const addLocalItem = ({ productId, quantity }) => {
  const cart = getLocalCart();
  const existing = cart.find(i => i.productId === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }

  setLocalCart(cart);
};

export const updateLocalItem = (productId, quantity) => {
  const cart = getLocalCart().map(item =>
    item.productId === productId ? { ...item, quantity } : item
  );
  setLocalCart(cart);
};

export const removeLocalItem = (productId) => {
  setLocalCart(
    getLocalCart().filter(i => i.productId !== productId)
  );
};
