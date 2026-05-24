import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, MessageCircle, Package, Shield, Zap } from "lucide-react";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";

/**
 * PharmaBridge Home Page
 * Scandinavian minimalist design with Japanese language support
 */
export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-scandinavian-bg">
        <Loader2 className="w-8 h-8 animate-spin text-scandinavian-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-scandinavian-bg">
      {/* Navigation */}
      <nav className="border-b border-scandinavian-border bg-scandinavian-bg-secondary">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-scandinavian-blue to-scandinavian-pink"></div>
            <h1 className="text-xl font-bold text-scandinavian-text-primary">PharmaBridge</h1>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/products" className="text-scandinavian-text-primary hover:text-scandinavian-blue transition">
                  製品
                </Link>
                <Link href="/orders" className="text-scandinavian-text-primary hover:text-scandinavian-blue transition">
                  注文
                </Link>
                <Link href="/profile" className="text-scandinavian-text-primary hover:text-scandinavian-blue transition">
                  プロフィール
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden section-spacing">
        {/* Decorative shapes */}
        <div className="accent-circle accent-circle-lg -top-20 -right-20"></div>
        <div className="accent-rectangle accent-rectangle-md -bottom-10 -left-10"></div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-scandinavian-text-primary mb-6">
                信頼できる医薬品、<br />
                <span className="text-scandinavian-blue">直接配送</span>
              </h1>
              <p className="text-lg text-scandinavian-text-secondary mb-8 leading-relaxed">
                インド発の高品質な医薬品を日本へ。AI チャットボットがあなたの購入をサポートします。
              </p>

              {isAuthenticated ? (
                <div className="flex gap-4">
                  <Link href="/products">
                    <Button className="btn-scandinavian">
                      製品を見る
                    </Button>
                  </Link>
                  <Link href="/chat">
                    <Button className="btn-scandinavian-secondary">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      チャットサポート
                    </Button>
                  </Link>
                </div>
              ) : (
                <a href={getLoginUrl()}>
                  <Button className="btn-scandinavian">
                    ログイン / 登録
                  </Button>
                </a>
              )}
            </div>

            {/* Right Visual */}
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-scandinavian-blue/20 to-scandinavian-pink/20 rounded-lg flex items-center justify-center">
                <Package className="w-32 h-32 text-scandinavian-blue opacity-30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-spacing bg-scandinavian-bg-secondary">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-scandinavian-text-primary mb-4">
              PharmaBridge の特徴
            </h2>
            <p className="text-scandinavian-text-secondary max-w-2xl mx-auto">
              シンプルで安全な医薬品購入体験をお届けします
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <Card className="scandinavian-card">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-lg bg-scandinavian-blue/20 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-scandinavian-blue" />
                </div>
                <h3 className="font-bold text-scandinavian-text-primary mb-2">
                  高速配送
                </h3>
                <p className="text-sm text-scandinavian-text-secondary">
                  インドから日本へ、迅速で安全な配送
                </p>
              </div>
            </Card>

            {/* Feature 2 */}
            <Card className="scandinavian-card">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-lg bg-scandinavian-pink/20 flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-scandinavian-pink" />
                </div>
                <h3 className="font-bold text-scandinavian-text-primary mb-2">
                  AI サポート
                </h3>
                <p className="text-sm text-scandinavian-text-secondary">
                  24/7 日本語チャットボットがサポート
                </p>
              </div>
            </Card>

            {/* Feature 3 */}
            <Card className="scandinavian-card">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-lg bg-scandinavian-blue/20 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-scandinavian-blue" />
                </div>
                <h3 className="font-bold text-scandinavian-text-primary mb-2">
                  安全な取引
                </h3>
                <p className="text-sm text-scandinavian-text-secondary">
                  暗号化された支払いと個人情報保護
                </p>
              </div>
            </Card>

            {/* Feature 4 */}
            <Card className="scandinavian-card">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-lg bg-scandinavian-pink/20 flex items-center justify-center mb-4">
                  <Package className="w-6 h-6 text-scandinavian-pink" />
                </div>
                <h3 className="font-bold text-scandinavian-text-primary mb-2">
                  追跡可能
                </h3>
                <p className="text-sm text-scandinavian-text-secondary">
                  リアルタイムで配送状況を確認
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Product Categories Section */}
      {isAuthenticated && (
        <section className="section-spacing">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <h2 className="text-3xl font-bold text-scandinavian-text-primary mb-8">
              製品カテゴリ
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {/* ED Category */}
              <Link href="/products?category=ED">
                <Card className="scandinavian-card cursor-pointer hover:shadow-lg transition">
                  <div className="aspect-square bg-gradient-to-br from-scandinavian-blue/30 to-transparent rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-4xl">💊</span>
                  </div>
                  <h3 className="font-bold text-scandinavian-text-primary mb-2">
                    ED 治療薬
                  </h3>
                  <p className="text-sm text-scandinavian-text-secondary">
                    勃起不全治療の信頼できるソリューション
                  </p>
                </Card>
              </Link>

              {/* AGA Category */}
              <Link href="/products?category=AGA">
                <Card className="scandinavian-card cursor-pointer hover:shadow-lg transition">
                  <div className="aspect-square bg-gradient-to-br from-scandinavian-pink/30 to-transparent rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-4xl">💇</span>
                  </div>
                  <h3 className="font-bold text-scandinavian-text-primary mb-2">
                    AGA 治療薬
                  </h3>
                  <p className="text-sm text-scandinavian-text-secondary">
                    脱毛症治療の実績ある医薬品
                  </p>
                </Card>
              </Link>

              {/* Cancer Drugs Category */}
              <Link href="/products?category=cancer_targeted">
                <Card className="scandinavian-card cursor-pointer hover:shadow-lg transition">
                  <div className="aspect-square bg-gradient-to-br from-scandinavian-blue/30 to-scandinavian-pink/30 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-4xl">🔬</span>
                  </div>
                  <h3 className="font-bold text-scandinavian-text-primary mb-2">
                    がん靶向薬
                  </h3>
                  <p className="text-sm text-scandinavian-text-secondary">
                    最新の標的治療薬へのアクセス
                  </p>
                </Card>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="section-spacing bg-scandinavian-bg-secondary relative overflow-hidden">
        <div className="accent-circle accent-circle-md top-0 right-0 opacity-50"></div>

        <div className="max-w-3xl mx-auto px-4 md:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-scandinavian-text-primary mb-6">
            今すぐ始めましょう
          </h2>
          <p className="text-lg text-scandinavian-text-secondary mb-8">
            安全で信頼できる医薬品配送サービスに登録して、AI チャットボットのサポートを受けてください。
          </p>

          {!isAuthenticated && (
            <a href={getLoginUrl()}>
              <Button className="btn-scandinavian btn-scandinavian-accent">
                ログイン / 登録
              </Button>
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-scandinavian-border bg-scandinavian-bg-secondary">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-scandinavian-text-primary mb-4">
                PharmaBridge
              </h4>
              <p className="text-sm text-scandinavian-text-secondary">
                信頼できる医薬品配送サービス
              </p>
            </div>
            <div>
              <h5 className="font-semibold text-scandinavian-text-primary mb-4">
                サービス
              </h5>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-scandinavian-text-secondary hover:text-scandinavian-text-primary transition">
                    製品
                  </a>
                </li>
                <li>
                  <a href="#" className="text-scandinavian-text-secondary hover:text-scandinavian-text-primary transition">
                    注文追跡
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-scandinavian-text-primary mb-4">
                サポート
              </h5>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-scandinavian-text-secondary hover:text-scandinavian-text-primary transition">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="text-scandinavian-text-secondary hover:text-scandinavian-text-primary transition">
                    お問い合わせ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-scandinavian-text-primary mb-4">
                法務
              </h5>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-scandinavian-text-secondary hover:text-scandinavian-text-primary transition">
                    プライバシー
                  </a>
                </li>
                <li>
                  <a href="#" className="text-scandinavian-text-secondary hover:text-scandinavian-text-primary transition">
                    利用規約
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-scandinavian-border pt-8 text-center text-sm text-scandinavian-text-secondary">
            <p>&copy; 2026 PharmaBridge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
