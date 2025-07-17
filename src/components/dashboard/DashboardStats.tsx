import { db } from '@/lib/db';
import { customers, orders } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';
import { Users, ShoppingCart, DollarSign, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkline } from '@/components/ui/sparkline';

export async function DashboardStats() {
  const [totalCustomers, totalOrders, totalRevenue, paidOrders] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(customers),
    db.select({ count: sql<number>`count(*)` }).from(orders),
    db.select({ 
      total: sql<number>`sum(cast(amount as numeric))` 
    }).from(orders),
    db.select({ 
      count: sql<number>`count(*)` 
    }).from(orders).where(sql`is_paid = true`),
  ]);

  const stats = [
    {
      title: '総顧客数',
      value: totalCustomers[0]?.count || 0,
      icon: Users,
      change: '+12%',
      changeType: 'positive',
      description: 'アクティブな顧客',
      color: 'from-blue-500 to-cyan-500',
      sparklineData: [3, 4, 3, 5, 4, 6, 5],
    },
    {
      title: '総注文数',
      value: totalOrders[0]?.count || 0,
      icon: ShoppingCart,
      change: '+5%',
      changeType: 'positive',
      description: '今月の注文数',
      color: 'from-purple-500 to-pink-500',
      sparklineData: [8, 9, 7, 10, 9, 11, 10],
    },
    {
      title: '総収益',
      value: `¥${(totalRevenue[0]?.total || 0).toLocaleString()}`,
      icon: DollarSign,
      change: '+18%',
      changeType: 'positive',
      description: '累計収益',
      color: 'from-green-500 to-emerald-500',
      sparklineData: [2800000, 3000000, 3200000, 3400000, 3600000, 3700000, 3740000],
    },
    {
      title: '支払済注文',
      value: paidOrders[0]?.count || 0,
      icon: CheckCircle,
      change: '+3%',
      changeType: 'positive',
      description: '成功した支払い',
      color: 'from-orange-500 to-red-500',
      sparklineData: [7, 8, 8, 9, 8, 9, 9],
    },
  ];

  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-12 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.changeType === 'positive';
          const TrendIcon = isPositive ? TrendingUp : TrendingDown;
          
          return (
            <div key={stat.title} className="col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-3">
              <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white/80 backdrop-blur-sm border-0 shadow-lg h-40">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col justify-between h-full">
                  <div className="text-3xl font-semibold tracking-tight text-gray-900 mb-2">{stat.value}</div>
                  <div className="flex items-center justify-between space-x-2 mb-2">
                    <div className="flex items-center space-x-1">
                      <TrendIcon className={`h-4 w-4 ${
                        isPositive ? 'text-emerald-500' : 'text-rose-500'
                      }`} />
                      <span className={`text-sm font-semibold ${
                        isPositive ? 'text-emerald-500' : 'text-rose-500'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                    <Sparkline 
                      data={stat.sparklineData} 
                      width={60} 
                      height={20} 
                      className={isPositive ? 'text-emerald-500' : 'text-rose-500'} 
                      color={isPositive ? '#10b981' : '#ef4444'} 
                    />
                  </div>
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}