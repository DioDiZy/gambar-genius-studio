import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Camera, Users, MapPin, Clock } from "lucide-react";

interface StoryboardContinuityProps {
  imageUrls: string[];
  prompts: string[];
  currentIndex: number;
}

export const StoryboardContinuity = ({ imageUrls, prompts, currentIndex }: StoryboardContinuityProps) => {
  if (imageUrls.length === 0) return null;

  const analyzePromptFeatures = (prompt: string) => {
    const features = {
      characters: [] as string[],
      location: "",
      timeOfDay: "",
      cameraAngle: "",
      style: "",
    };

    const characterMatch = prompt.match(/Characters in scene: ([^.]+)/);
    if (characterMatch) {
      features.characters = characterMatch[1].split(";").map((c) => c.trim().split(" ")[0]);
    }

    const locationMatch = prompt.match(/\b(?:in|at|on|inside|outside|near|by|di|dalam|dekat)\s+(?:the\s+)?([a-zA-Z\s]+?)(?:\s|,|\.)/i);
    if (locationMatch) features.location = locationMatch[1].trim();

    const timeMatch = prompt.match(/\b(morning|afternoon|evening|night|dawn|dusk|pagi|siang|sore|malam)\b/i);
    if (timeMatch) features.timeOfDay = timeMatch[1];

    const cameraMatch = prompt.match(/\b(wide shot|close-up|medium shot|establishing shot|medium-wide shot)\b/i);
    if (cameraMatch) features.cameraAngle = cameraMatch[1];

    const styleMatch = prompt.match(/\b(photorealistic|digital art|anime|3d render|oil painting|watercolor|comic book|storyboard sketch)\b/i);
    if (styleMatch) features.style = styleMatch[1];

    return features;
  };

  const currentFeatures = analyzePromptFeatures(prompts[currentIndex] || "");
  const prevFeatures = currentIndex > 0 ? analyzePromptFeatures(prompts[currentIndex - 1] || "") : null;
  const nextFeatures = currentIndex < prompts.length - 1 ? analyzePromptFeatures(prompts[currentIndex + 1] || "") : null;

  const getConnectionType = (current: any, other: any) => {
    if (!other) return null;
    if (current.location === other.location) return "same-location";
    if (current.characters.some((char: string) => other.characters.includes(char))) return "character-continuity";
    if (current.timeOfDay === other.timeOfDay) return "time-continuity";
    return "scene-transition";
  };

  const prevConnection = getConnectionType(currentFeatures, prevFeatures);
  const nextConnection = getConnectionType(currentFeatures, nextFeatures);

  const getConnectionLabel = (type: string) => {
    switch (type) {
      case "same-location":
        return "Lokasi sama";
      case "character-continuity":
        return "Karakter berlanjut";
      case "time-continuity":
        return "Waktu konsisten";
      case "scene-transition":
        return "Pergantian adegan";
      default:
        return "";
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Camera className="h-4 w-4" />
          Kontinuitas Storyboard
        </CardTitle>
        <CardDescription className="text-xs">Hubungan visual antar frame</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground">Frame Saat Ini ({currentIndex + 1})</h4>
          <div className="flex flex-wrap gap-1">
            {currentFeatures.characters.length > 0 && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                <Users className="h-3 w-3" />
                {currentFeatures.characters.slice(0, 2).join(", ")}
                {currentFeatures.characters.length > 2 && "..."}
              </Badge>
            )}
            {currentFeatures.location && (
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {currentFeatures.location}
              </Badge>
            )}
            {currentFeatures.timeOfDay && (
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {currentFeatures.timeOfDay}
              </Badge>
            )}
            {currentFeatures.cameraAngle && (
              <Badge variant="secondary" className="text-xs">
                {currentFeatures.cameraAngle}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 flex-1">
            {prevConnection && (
              <>
                <Badge variant={prevConnection === "same-location" ? "default" : "outline"} className="text-xs">
                  {currentIndex}
                </Badge>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <ArrowRight className="h-3 w-3 rotate-180" />
                  <span className="text-xs">{getConnectionLabel(prevConnection)}</span>
                </div>
              </>
            )}
          </div>

          <Badge variant="default" className="mx-2 text-xs">
            Frame {currentIndex + 1}
          </Badge>

          <div className="flex items-center gap-1 flex-1 justify-end">
            {nextConnection && (
              <>
                <span className="text-xs text-muted-foreground">{getConnectionLabel(nextConnection)}</span>
                <ArrowRight className="h-3 w-3" />
                <Badge variant={nextConnection === "same-location" ? "default" : "outline"} className="text-xs">
                  {currentIndex + 2}
                </Badge>
              </>
            )}
          </div>
        </div>

        <div className="bg-muted/50 p-2 rounded text-xs space-y-1">
          <div className="font-medium text-muted-foreground">Alur Visual:</div>
          <div className="text-muted-foreground">
            {imageUrls.length === 1 && "Cerita satu frame"}
            {imageUrls.length === 2 && "Urutan dua bagian"}
            {imageUrls.length >= 3 && imageUrls.length <= 5 && `Urutan naratif ${imageUrls.length} frame`}
            {imageUrls.length > 5 && `Storyboard ${imageUrls.length} frame diperluas`}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
