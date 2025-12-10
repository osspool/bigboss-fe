// app/profile/my-orders/page.tsx
import { auth } from "@/app/(auth)/auth";
import OrdersList from "./components/orders-list";


export default async function OrdersPage({searchParams}) {
  const page = Number((await searchParams)?.page) || 1;
  const session = await auth()

  return (
    <div className="max-w-5xl mx-auto">
     
        <OrdersList initialPage={page} token={session?.accessToken} />
   
    </div>
  );
}