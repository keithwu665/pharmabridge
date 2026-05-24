import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { Bell, CheckCircle2, AlertCircle } from "lucide-react";

export default function NotificationsPage() {
  const { user } = useAuth();
  const { data: notifications, isLoading } = trpc.notifications.getNotifications.useQuery();
  const markAsReadMutation = trpc.notifications.markAsRead.useMutation();

  const handleMarkAsRead = (notificationId: number) => {
    markAsReadMutation.mutate({ notificationId });
  };

  const getMilestoneIcon = (milestone: string) => {
    switch (milestone) {
      case "order_confirmed":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "shipped_from_india":
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      case "cleared_japanese_customs":
        return <CheckCircle2 className="w-5 h-5 text-blue-600" />;
      case "handed_to_local_team":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">ログインが必要です</h1>
          <p className="text-gray-600">通知を表示するにはログインしてください。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">通知</h1>
          <p className="text-gray-600">ご注文の最新情報をご確認ください</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        ) : !notifications || notifications.length === 0 ? (
          <Card className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">通知はありません</h2>
            <p className="text-gray-600">ご注文の最新情報はここに表示されます</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification: any) => (
              <Card
                key={notification.id}
                className={`p-6 border-l-4 ${
                  notification.isRead
                    ? "border-l-gray-300 bg-gray-50"
                    : "border-l-blue-600 bg-blue-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">
                      {getMilestoneIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <Badge variant="default" className="bg-blue-600">
                            新着
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-700 mb-2">{notification.content}</p>
                      <p className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          locale: ja,
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                  {!notification.isRead && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="ml-4"
                    >
                      既読にする
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
