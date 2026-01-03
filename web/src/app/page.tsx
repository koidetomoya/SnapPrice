import { supabase } from "@/lib/supabase";
import ProductSearch, { ProductItem } from "@/components/ProductSearch";

export const revalidate = 0;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams; // Next.js 15+ needs await for searchParams
  const query = params.q;

  let items: ProductItem[] = [];

  if (query) {
    const { data: products, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        prices (
          id,
          price,
          stores (
            name,
            location
          )
        )
      `)
      .ilike("name", `%${query}%`);

    if (error) {
      console.error("Error fetching products:", error);
    }

    if (products) {
      // Flatten the data
      products.forEach((product: any) => {
        if (product.prices) {
          product.prices.forEach((priceData: any) => {
            if (priceData.stores) {
              // handle array or single store object depending on relation
              // Assuming One-to-One or Many-to-One from prices to stores
              const store = priceData.stores;
              items.push({
                id: priceData.id,
                product_name: product.name,
                price: priceData.price,
                store_name: store.name,
                store_location: store.location, // raw postgis string
              });
            }
          });
        }
      });
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <ProductSearch initialItems={items} />
    </main>
  );
}
