import { auth } from "@/app/(auth)/auth";
import CartPage from "@/components/platform/cart/CartClient"

 
export default async function Page() {
  const session = await auth();

  return <CartPage token={session?.accessToken}/>
}