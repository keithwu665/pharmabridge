import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { Search, Filter, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: products, isLoading } = trpc.products.list.useQuery(
    { category: selectedCategory || undefined, search: searchQuery || undefined },
    { enabled: true }
  );

  const categories = [
    { id: "ED", label: "ED Treatment", emoji: "💊" },
    { id: "AGA", label: "AGA Treatment", emoji: "💇" },
    { id: "cancer_targeted", label: "Cancer Drugs", emoji: "🔬" },
    { id: "other", label: "Other", emoji: "📦" },
  ];

  return (
    <div className="min-h-screen bg-scandinavian-bg section-spacing">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-scandinavian-text-primary mb-4">
            Product Catalog
          </h1>
          <p className="text-scandinavian-text-secondary max-w-2xl">
            Browse and order pharmaceutical products
          </p>
        </div>

        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-scandinavian-text-secondary" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-scandinavian w-full pl-10"
            />
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-scandinavian-text-secondary" />
            <h3 className="font-semibold text-scandinavian-text-primary">
              Filter by Category
            </h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setSelectedCategory(null)}
              className={`${
                selectedCategory === null
                  ? "btn-scandinavian"
                  : "btn-scandinavian-secondary"
              }`}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`${
                  selectedCategory === category.id
                    ? "btn-scandinavian"
                    : "btn-scandinavian-secondary"
                }`}
              >
                <span className="mr-2">{category.emoji}</span>
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-scandinavian-blue" />
          </div>
        ) : products && products.length > 0 ? (
          <div className="product-grid">
            {products.map((product: any) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <Card className="scandinavian-card h-full cursor-pointer hover:shadow-lg transition">
                  <div className="aspect-square bg-gradient-to-br from-scandinavian-blue/20 to-scandinavian-pink/20 rounded-lg mb-4 flex items-center justify-center">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name_ja}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-4xl">💊</span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-scandinavian-text-primary flex-1">
                        {product.name_ja}
                      </h3>
                      <span className="badge-scandinavian text-xs ml-2">
                        {product.category === "ED"
                          ? "ED"
                          : product.category === "AGA"
                          ? "AGA"
                          : product.category === "cancer_targeted"
                          ? "Cancer"
                          : "Other"}
                      </span>
                    </div>

                    {product.genericName && (
                      <p className="text-xs text-scandinavian-text-secondary mb-2">
                        {product.genericName}
                      </p>
                    )}

                    {product.dosage && (
                      <p className="text-sm text-scandinavian-text-secondary mb-3">
                        {product.dosage}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-scandinavian-border">
                      <span className="text-lg font-bold text-scandinavian-blue">
                        ¥{product.price?.toLocaleString() || "-"}
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          product.stockLevel && product.stockLevel > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {product.stockLevel && product.stockLevel > 0
                          ? "In Stock"
                          : "Out of Stock"}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-scandinavian-text-secondary text-lg">
              No products found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
