import { CustomerDetail } from '@/components/customers/CustomerDetail';

interface CustomerDetailPageProps {
  params: Promise<{
    customerId: string;
  }>;
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { customerId } = await params;
  return <CustomerDetail customerId={customerId} />;
}