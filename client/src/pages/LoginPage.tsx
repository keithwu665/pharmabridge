import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { LogIn } from "lucide-react";

/**
 * PharmaBridge Login Page
 * Manus OAuth integration with Scandinavian design
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-scandinavian-bg flex items-center justify-center relative overflow-hidden">
      {/* Decorative shapes */}
      <div className="accent-circle accent-circle-lg -top-32 -left-32 opacity-40"></div>
      <div className="accent-rectangle accent-rectangle-lg -bottom-20 -right-20 opacity-30"></div>

      <div className="w-full max-w-md px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-scandinavian-blue to-scandinavian-pink flex items-center justify-center">
              <div className="text-3xl font-black text-white">Φ</div>
            </div>
          </div>
          <h1 className="text-3xl font-black text-scandinavian-text-primary mb-2">
            PharmaBridge
          </h1>
          <p className="subtitle-lg">
            信頼できる医薬品配送サービス
          </p>
        </div>

        {/* Login Card */}
        <div className="scandinavian-card mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-scandinavian-text-primary mb-2">
              ログイン
            </h2>
            <p className="text-scandinavian-text-secondary">
              アカウントにアクセスして、医薬品を注文してください
            </p>
          </div>

          {/* OAuth Login Button */}
          <a href={getLoginUrl()} className="block w-full">
            <Button className="w-full btn-scandinavian mb-4">
              <LogIn className="w-4 h-4 mr-2" />
              Manus でログイン
            </Button>
          </a>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-scandinavian-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-scandinavian-bg-secondary text-scandinavian-text-secondary">
                または
              </span>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-scandinavian-blue/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-scandinavian-blue">✓</span>
              </div>
              <div>
                <p className="text-sm font-medium text-scandinavian-text-primary">
                  安全なログイン
                </p>
                <p className="text-xs text-scandinavian-text-secondary">
                  Manus OAuth で保護されたアクセス
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-scandinavian-blue/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-scandinavian-blue">✓</span>
              </div>
              <div>
                <p className="text-sm font-medium text-scandinavian-text-primary">
                  プライバシー保護
                </p>
                <p className="text-xs text-scandinavian-text-secondary">
                  個人情報は暗号化されて保護されます
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-scandinavian-blue/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-scandinavian-blue">✓</span>
              </div>
              <div>
                <p className="text-sm font-medium text-scandinavian-text-primary">
                  即座にアクセス
                </p>
                <p className="text-xs text-scandinavian-text-secondary">
                  登録から数秒でサービス利用開始
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-scandinavian-bg-secondary rounded-lg p-6 border border-scandinavian-border">
          <h3 className="font-semibold text-scandinavian-text-primary mb-3">
            初めてですか？
          </h3>
          <p className="text-sm text-scandinavian-text-secondary mb-4">
            Manus でログインすると、自動的にアカウントが作成されます。追加の登録は必要ありません。
          </p>
          <p className="text-xs text-scandinavian-text-secondary">
            ログイン後、プロフィール情報（電話番号、配送住所など）を入力してください。
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-scandinavian-text-secondary">
          <p>
            ログインすることで、
            <a href="#" className="underline hover:text-scandinavian-text-primary transition">
              利用規約
            </a>
            と
            <a href="#" className="underline hover:text-scandinavian-text-primary transition">
              プライバシーポリシー
            </a>
            に同意します
          </p>
        </div>
      </div>
    </div>
  );
}
