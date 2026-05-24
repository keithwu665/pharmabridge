import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Loader2, Save, Edit2, Check } from "lucide-react";
import { toast } from "sonner";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Invalid phone"),
  address: z.string().min(10, "Address too short"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: "",
      address: "",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      toast.success("Profile updated");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || "Update failed");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-scandinavian-bg">
        <Loader2 className="w-8 h-8 animate-spin text-scandinavian-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-scandinavian-bg section-spacing">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-scandinavian-text-primary mb-2">
            Profile
          </h1>
          <p className="text-scandinavian-text-secondary">
            Manage your account information
          </p>
        </div>

        <Card className="scandinavian-card-lg mb-6">
          <div className="flex items-center justify-between mb-8 pb-8 border-b border-scandinavian-border">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-scandinavian-blue to-scandinavian-pink flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div>
                <h2 className="text-xl font-bold text-scandinavian-text-primary">
                  {user?.name || "User"}
                </h2>
                <p className="text-sm text-scandinavian-text-secondary">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              className={isEditing ? "btn-scandinavian-secondary" : "btn-scandinavian-accent"}
            >
              {isEditing ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Done
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </>
              )}
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
              <div>
                <Label htmlFor="name" className="block text-sm font-semibold text-scandinavian-text-primary mb-2">
                  Name
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  disabled={!isEditing}
                  className="input-scandinavian w-full"
                  placeholder="Your Name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name?.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="block text-sm font-semibold text-scandinavian-text-primary mb-2">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  disabled={!isEditing}
                  className="input-scandinavian w-full"
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email?.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone" className="block text-sm font-semibold text-scandinavian-text-primary mb-2">
                  Phone
                </Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  disabled={!isEditing}
                  className="input-scandinavian w-full"
                  placeholder="09012345678"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone?.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="address" className="block text-sm font-semibold text-scandinavian-text-primary mb-2">
                  Address
                </Label>
                <Textarea
                  id="address"
                  {...register("address")}
                  disabled={!isEditing}
                  className="input-scandinavian w-full"
                  placeholder="Your address"
                  rows={3}
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address?.message}</p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="mt-8 flex gap-4">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="btn-scandinavian flex-1"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    reset();
                  }}
                  className="btn-scandinavian-secondary flex-1"
                >
                  Cancel
                </Button>
              </div>
            )}
          </form>
        </Card>

        <Card className="scandinavian-card">
          <h3 className="font-bold text-scandinavian-text-primary mb-4">
            Account Info
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-scandinavian-text-secondary">Created</span>
              <span className="text-scandinavian-text-primary font-medium">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-scandinavian-text-secondary">Last Login</span>
              <span className="text-scandinavian-text-primary font-medium">
                {user?.lastSignedIn
                  ? new Date(user.lastSignedIn).toLocaleDateString()
                  : "-"}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
