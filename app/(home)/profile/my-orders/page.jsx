// app/profile/my-orders/page.tsx
import { auth } from "@/app/(auth)/auth";
import { Section, Container } from "@classytic/clarity/layout";
import OrdersList from "./components/orders-list";


export default async function OrdersPage({searchParams}) {
  const page = Number((await searchParams)?.page) || 1;
  const session = await auth()

  return (
    <Section padding="md">
      <Container maxWidth="5xl">
        <OrdersList initialPage={page} token={session?.accessToken} />
      </Container>
    </Section>
  );
}
