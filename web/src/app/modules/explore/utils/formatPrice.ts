export function formatPrice(price: string) {
    const value = Number(price);
  
    if (Number.isNaN(value)) {
      return price;
    }
  
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  }