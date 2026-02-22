
import { DashboardLayout } from "@/components/DashboardLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomButton } from "@/components/ui/custom-button";
import { Clock, Image, Medal } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const displayName = profile?.full_name || profile?.username || user?.email || "Pengguna";
  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })
    : "";

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Profil</h1>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="md:col-span-1">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile?.avatar_url || ""} alt={displayName} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {displayName.split(" ").map(n => n[0]).join("").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle>{displayName}</CardTitle>
              <CardDescription className="break-all">{user?.email}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <CustomButton variant="outline" size="sm">
                Edit Profil
              </CustomButton>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Informasi Akun</CardTitle>
              <CardDescription>Detail akun dan statistik Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <div className="h-10 w-10 bg-primary/10 text-primary flex items-center justify-center rounded-full">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bergabung Sejak</p>
                    <p className="font-medium">{joinDate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <div className="h-10 w-10 bg-primary/10 text-primary flex items-center justify-center rounded-full">
                    <Image className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gambar Dibuat</p>
                    <p className="font-medium">{profile?.images_generated ?? 0}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 border rounded-lg col-span-2">
                  <div className="h-10 w-10 bg-primary/10 text-primary flex items-center justify-center rounded-full">
                    <Medal className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Langganan</p>
                    <p className="font-medium">Paket Gratis</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
