import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, ShoppingCart, Heart } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const { data: product, isLoading } = trpc.products.getDetail.useQuery(
    { id: id || "" },
    { enabled: !!id }
  );

  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: () => {
      toast.success("Order created");
      setQuantity(1);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create order");
    },
  });

  const handleAddToCart = () => {
    if (!product) return;
    createOrderMutation.mutate({
      productId: product.id,
      quantity,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-scandinavian-bg">
        <Loader2 className="w-8 h-8 animate-spin text-scandinavian-blue" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-scandinavian-bg section-spacing">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-scandinavian-text-primary">
            Product not found
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-scandinavian-bg section-spacing">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <div className="aspect-square bg-gradient-to-br from-scandinavian-blue/20 to-scandinavian-pink/20 rounded-lg flex items-center justify-center mb-4">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name_ja}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <span className="text-8xl">💊</span>
              )}
            </div>
            <Button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={isWishlisted ? "btn-scandinavian w-full" : "btn-scandinavian-secondary w-full"}
            >
              <Heart className={`w-4 h-4 mr-2 ${isWishlisted ? "fill-current" : ""}`} />
              {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            </Button>
          </div>

          <div>
            <div className="mb-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h1 className="text-3xl font-bold text-scandinavian-text-primary mb-2">
                    {product.name_ja}
                  </h1>
                  {product.genericName && (
                    <p className="text-scandinavian-text-secondary">
                      {product.genericName}
                    </p>
                  )}
                </div>
                <span className="badge-scandinavian">
                  {product.category === "ED"
                    ? "ED"
                    : product.category === "AGA"
                    ? "AGA"
                    : product.category === "cancer_targeted"
                    ? "Cancer"
                    : "Other"}
                </span>
              </div>
            </div>

            <Card className="scandinavian-card mb-6">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-scandinavian-border">
                <span className="text-4xl font-bold text-scandinavian-blue">
                  ¥{product.price?.toLocaleString()}
                </span>
                <span
                  className={`text-lg font-semibold ${
                    product.stockLevel && product.stockLevel > 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {product.stockLevel && product.stockLevel > 0
                    ? `Stock: ${product.stockLevel}`
                    : "Out of Stock"}
                </span>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-scandinavian-text-primary mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="btn-scandinavian-secondary w-12 h-12 p-0"
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="input-scandinavian w-20 text-center"
                    min="1"
                  />
                  <Button
                    onClick={() => setQuantity(quantity + 1)}
                    className="btn-scandinavian-secondary w-12 h-12 p-0"
                  >
                    +
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={!product.stockLevel || product.stockLevel === 0 || createOrderMutation.isPending}
                className="btn-scandinavian w-full"
              >
                {createOrderMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Ordering...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Order Now
                  </>
                )}
              </Button>
            </Card>

            <Card className="scandinavian-card">
              <h3 className="font-bold text-scandinavian-text-primary mb-4">
                Product Information
              </h3>
              <div className="space-y-4">
                {product.dosage && (
                  <div>
                    <p className="text-sm font-semibold text-scandinavian-text-secondary mb-1">
                      Dosage
                    </p>
                    <p className="text-scandinavian-text-primary">{product.dosage}</p>
                  </div>
                )}
                {product.manufacturer && (
                  <div>
                    <p className="text-sm font-semibold text-scandinavian-text-secondary mb-1">
                      Manufacturer
                    </p>
                    <p className="text-scandinavian-text-primary">{product.manufacturer}</p>
                  </div>
                )}
                {product.description && (
                  <div>
                    <p className="text-sm font-semibold text-scandinavian-text-secondary mb-1">
                      Description
                    </p>
                    <p className="text-scandinavian-text-primary">{product.description}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
