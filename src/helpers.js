// Small pure helpers shared by the pages.
export const isInStock = (p) => Boolean(p.available) && p.stock > 0
export const discountOf = (p) => (p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0)
