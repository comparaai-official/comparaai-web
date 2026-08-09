const API_URL = "http://localhost:3000";

export async function getCategories() {
  const res = await fetch(`${API_URL}/categories`, { cache: "no-store" });
  return res.json();
}

export async function getProducts(filters?: {
  categoryId?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  minRam?: string;
  minStorage?: string;
  minBattery?: string;
}) {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
  }
  const res = await fetch(`${API_URL}/products?${params.toString()}`, {
    cache: "no-store",
  });
  return res.json();
}

export async function getProduct(id: string) {
  const res = await fetch(`${API_URL}/products/${id}`, { cache: "no-store" });
  return res.json();
}
