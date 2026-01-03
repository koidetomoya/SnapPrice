import { supabase } from "@/lib/supabase";

export const revalidate = 0;

export default async function Home() {
  const { data: stores, error } = await supabase
    .from('stores')
    .select('*');

  if (error) {
    console.error("Error fetching stores:", error);
  }

  const hasStores = stores && stores.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto space-y-4">
        {!hasStores ? (
          <p className="text-center text-gray-500">
            店舗情報が見つかりません。データベースを確認してください。
          </p>
        ) : (
          stores.map((store) => (
            <div
              key={store.id}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
            >
              <h2 className="font-bold text-lg text-gray-900">{store.name}</h2>
              <div className="mt-1 text-sm text-gray-500 flex flex-col sm:flex-row sm:gap-2">
                {store.chain_name && <span>{store.chain_name}</span>}
                {store.address && <span>{store.address}</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
