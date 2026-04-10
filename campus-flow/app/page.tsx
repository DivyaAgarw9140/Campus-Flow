import {createClient} from '../utils/supabase/server';
export const dynamic = 'force-dynamic'; // This line forces Next.js to fetch fresh data every time
export  default async function HomePage()
{
const supabase=await createClient();
const {data:menu_items,error}= await supabase.from('menu_items').select('*');
console.log("Data from Supabase:", menu_items);
  console.log("Error from Supabase:", error);

  if (error) return <div>Error: {error.message}</div>;
return (
  <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Campus Menu</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {menu_items?.map((item)=>(
         <div key={item.id} className="border p-4 rounded-lg shadow">
          <h2 className='text-xl font-semibold'>{item.name} </h2>
            <p className="text-gray-600">{item.price}</p>
        
<button className='mt-4 bg-pink-700'>
Add to 
</button>
         </div>
        ))}
        </div>
          {/* If the list is empty, show a message */}

      {menu_items?.length === 0 && <p>No items found in the database.</p>}
        </main>
)
}