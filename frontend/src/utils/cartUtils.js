export const isInCart = (items, productId) => {
  if (!Array.isArray(items)) return false;

  return items.some(item => item.product.id === productId);
};
