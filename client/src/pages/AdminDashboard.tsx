import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { BarChart, Users, Package, ShoppingCart } from "lucide-react";
import { useState } from "react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: stats } = trpc.admin.getDashboardStats.useQuery();
  const { data: ordersData } = trpc.admin.getAllOrders.useQuery({ page: 1, limit: 10 });
  const { data: customersData } = trpc.admin.getAllCustomers.useQuery({ page: 1, limit: 10 });
  const { data: productsData } = trpc.admin.getAllProducts.useQuery({ page: 1, limit: 10 });

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">アクセス拒否</h1>
          <p className="text-gray-600">管理者のみがこのページにアクセスできます。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">管理者ダッシュボード</h1>
          <p className="text-gray-600">プラットフォームの統計情報と管理機能</p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">総注文数</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalOrders}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-blue-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">顧客数</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalCustomers}</p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">製品数</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalProducts}</p>
                </div>
                <Package className="w-8 h-8 text-purple-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">保留中の注文</p>
                  <p className="text-3xl font-bold text-foreground">{stats.pendingOrders}</p>
                </div>
                <BarChart className="w-8 h-8 text-orange-600" />
              </div>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 font-semibold ${
              activeTab === "overview"
                ? "text-foreground border-b-2 border-foreground"
                : "text-gray-600"
            }`}
          >
            概要
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 font-semibold ${
              activeTab === "orders"
                ? "text-foreground border-b-2 border-foreground"
                : "text-gray-600"
            }`}
          >
            注文管理
          </button>
          <button
            onClick={() => setActiveTab("customers")}
            className={`px-4 py-2 font-semibold ${
              activeTab === "customers"
                ? "text-foreground border-b-2 border-foreground"
                : "text-gray-600"
            }`}
          >
            顧客管理
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2 font-semibold ${
              activeTab === "products"
                ? "text-foreground border-b-2 border-foreground"
                : "text-gray-600"
            }`}
          >
            製品管理
          </button>
        </div>

        {/* Content */}
        {activeTab === "overview" && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">プラットフォーム概要</h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                PharmaBridge 管理ダッシュボードへようこそ。ここから以下の操作ができます：
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>注文の管理と状態の更新</li>
                <li>顧客情報の確認</li>
                <li>製品の在庫管理</li>
                <li>通知の送信</li>
                <li>供給業者の管理</li>
              </ul>
            </div>
          </Card>
        )}

        {activeTab === "orders" && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">注文管理</h2>
            {ordersData && ordersData.orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="text-left py-2 px-4">注文 ID</th>
                      <th className="text-left py-2 px-4">顧客 ID</th>
                      <th className="text-left py-2 px-4">状態</th>
                      <th className="text-left py-2 px-4">金額</th>
                      <th className="text-left py-2 px-4">日付</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersData.orders.map((order: any) => (
                      <tr key={order.id} className="border-b border-gray-100">
                        <td className="py-2 px-4">#{order.id}</td>
                        <td className="py-2 px-4">{order.userId}</td>
                        <td className="py-2 px-4">
                          <Badge variant="outline">{order.status}</Badge>
                        </td>
                        <td className="py-2 px-4">¥{order.totalPrice}</td>
                        <td className="py-2 px-4 text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString("ja-JP")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600">注文がありません</p>
            )}
          </Card>
        )}

        {activeTab === "customers" && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">顧客管理</h2>
            {customersData && customersData.customers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="text-left py-2 px-4">顧客 ID</th>
                      <th className="text-left py-2 px-4">名前</th>
                      <th className="text-left py-2 px-4">メール</th>
                      <th className="text-left py-2 px-4">役割</th>
                      <th className="text-left py-2 px-4">登録日</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customersData.customers.map((customer: any) => (
                      <tr key={customer.id} className="border-b border-gray-100">
                        <td className="py-2 px-4">#{customer.id}</td>
                        <td className="py-2 px-4">{customer.name}</td>
                        <td className="py-2 px-4">{customer.email}</td>
                        <td className="py-2 px-4">
                          <Badge variant={customer.role === "admin" ? "default" : "outline"}>
                            {customer.role}
                          </Badge>
                        </td>
                        <td className="py-2 px-4 text-sm text-gray-600">
                          {new Date(customer.createdAt).toLocaleDateString("ja-JP")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600">顧客がありません</p>
            )}
          </Card>
        )}

        {activeTab === "products" && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">製品管理</h2>
            {productsData && productsData.products.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="text-left py-2 px-4">製品 ID</th>
                      <th className="text-left py-2 px-4">名前</th>
                      <th className="text-left py-2 px-4">カテゴリ</th>
                      <th className="text-left py-2 px-4">価格</th>
                      <th className="text-left py-2 px-4">在庫</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsData.products.map((product: any) => (
                      <tr key={product.id} className="border-b border-gray-100">
                        <td className="py-2 px-4">#{product.id}</td>
                        <td className="py-2 px-4">{product.name_ja}</td>
                        <td className="py-2 px-4">{product.category}</td>
                        <td className="py-2 px-4">¥{product.price}</td>
                        <td className="py-2 px-4">
                          <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                            {product.stock}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600">製品がありません</p>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
