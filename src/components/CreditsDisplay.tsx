
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

const CREDIT_PACKS = [
  { amount: 10, label: "10 Credits", description: "Free top-up" },
  { amount: 25, label: "25 Credits", description: "Free top-up" },
  { amount: 50, label: "50 Credits", description: "Free top-up" },
];

export function CreditsDisplay() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile-credits", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("credits, images_generated")
        .eq("id", user?.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const handleAddCredits = async (amount: number) => {
    if (!user) return;
    setIsAdding(true);
    try {
      const { data, error } = await supabase.rpc("add_credits", { amount });
      if (error) throw error;
      toast.success(`Added ${amount} credits! New balance: ${data}`);
      queryClient.invalidateQueries({ queryKey: ["profile-credits"] });
    } catch (error) {
      toast.error("Failed to add credits");
      console.error(error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-primary" />
          Credits
        </CardTitle>
        <CardDescription>Your current balance and top-up options</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10">
          <Sparkles className="h-8 w-8 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Available Credits</p>
            <p className="text-3xl font-bold text-primary">
              {isLoading ? "..." : profile?.credits ?? 0}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Add Free Credits</p>
          <div className="grid grid-cols-3 gap-2">
            {CREDIT_PACKS.map((pack) => (
              <Button
                key={pack.amount}
                variant="outline"
                size="sm"
                disabled={isAdding}
                onClick={() => handleAddCredits(pack.amount)}
                className="flex flex-col h-auto py-3"
              >
                <Plus className="h-4 w-4 mb-1" />
                <span className="font-semibold">{pack.label}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground pt-2 border-t">
          <p>Images generated: {profile?.images_generated ?? 0}</p>
          <p>Each image costs 1 credit</p>
        </div>
      </CardContent>
    </Card>
  );
}
