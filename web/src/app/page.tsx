import { supabase } from "@/lib/supabase";
import StoreList from "@/components/StoreList";

export const revalidate = 0;

export default async function Home() {
  const { data: stores, error } = await supabase
    .from('stores')
    .select('*, location:location::text');

  if (error) {
    console.error("Error fetching stores:", error);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <StoreList initialStores={stores || []} />
      </div>
    </div>
  );
}
