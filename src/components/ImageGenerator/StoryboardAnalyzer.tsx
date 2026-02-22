import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Users, 
  Link, 
  Eye, 
  Target, 
  Camera,
  MapPin,
  Clock,
  Palette,
  ArrowRight
} from "lucide-react";
import { StoryboardPrompt, CharacterReference, ContinuityLink } from "@/types/story";

interface StoryboardAnalyzerProps {
  storyboardData: {
    prompts: string[];
    structuredData: StoryboardPrompt[];
    metadata: {
      totalScenes: number;
      charactersResolved: number;
      enhancedFormat: boolean;
    };
  } | null;
  isVisible: boolean;
}

export const StoryboardAnalyzer = ({ storyboardData, isVisible }: StoryboardAnalyzerProps) => {
  if (!isVisible || !storyboardData) {
    return null;
  }

  const { structuredData, metadata } = storyboardData;

  const renderCharacterReference = (char: CharacterReference) => (
    <div key={char.characterId} className="p-3 bg-secondary/50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h5 className="font-medium">{char.name}</h5>
        <Badge variant={char.roleInScene === 'primary' ? 'default' : 'secondary'}>
          {char.roleInScene}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-2">{char.appearance}</p>
      <div className="flex flex-wrap gap-1 mb-2">
        {char.pronouns.map(pronoun => (
          <Badge key={pronoun} variant="outline" className="text-xs">
            {pronoun}
          </Badge>
        ))}
      </div>
      <div className="text-xs text-muted-foreground">
        Consistency: {Math.round(char.visualConsistencyWeight * 100)}%
      </div>
    </div>
  );

  const renderContinuityLink = (link: ContinuityLink) => (
    <div key={`${link.sourceElementId}-${link.targetElementId}`} 
         className="flex items-center gap-2 p-2 bg-accent/30 rounded">
      <Badge variant="outline" className="text-xs capitalize">
        {link.linkType}
      </Badge>
      <ArrowRight className="h-3 w-3" />
      <span className="text-xs flex-1">{link.description}</span>
      <span className="text-xs font-mono">
        {Math.round(link.connectionStrength * 100)}%
      </span>
    </div>
  );

  const renderSceneMetadata = (scene: StoryboardPrompt) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="flex items-center gap-2">
        <Camera className="h-4 w-4 text-muted-foreground" />
        <div>
          <div className="text-xs text-muted-foreground">Camera</div>
          <div className="text-sm font-medium">{scene.sceneMetadata.cameraAngle}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <div>
          <div className="text-xs text-muted-foreground">Location</div>
          <div className="text-sm font-medium">{scene.sceneMetadata.location}</div>
        </div>
      </div>
      {scene.sceneMetadata.timeOfDay && (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">Time</div>
            <div className="text-sm font-medium">{scene.sceneMetadata.timeOfDay}</div>
          </div>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Palette className="h-4 w-4 text-muted-foreground" />
        <div>
          <div className="text-xs text-muted-foreground">Tone</div>
          <div className="text-sm font-medium">{scene.sceneMetadata.emotionalTone}</div>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Storyboard Analysis
        </CardTitle>
        <CardDescription>
          JSON-structured prompts with pronoun resolution and visual continuity analysis
        </CardDescription>
        <div className="flex gap-2">
          <Badge variant="secondary">
            {metadata.totalScenes} scenes
          </Badge>
          <Badge variant="secondary">
            {metadata.charactersResolved} characters
          </Badge>
          {metadata.enhancedFormat && (
            <Badge variant="default">
              Enhanced format
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="scenes" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="scenes">Scenes</TabsTrigger>
            <TabsTrigger value="characters">Characters</TabsTrigger>
            <TabsTrigger value="continuity">Continuity</TabsTrigger>
            <TabsTrigger value="json">Raw JSON</TabsTrigger>
          </TabsList>

          <TabsContent value="scenes" className="space-y-4">
            <ScrollArea className="h-[500px]">
              {structuredData.map((scene, index) => (
                <div key={scene.sceneIndex} className="mb-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Scene {scene.sceneIndex + 1}</CardTitle>
                        <Badge variant="outline" className="capitalize">
                          {scene.sceneMetadata.sceneType}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h5 className="font-medium mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Original Text
                        </h5>
                        <p className="text-sm bg-muted p-3 rounded">{scene.originalText}</p>
                      </div>

                      <div>
                        <h5 className="font-medium mb-2 flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Enhanced Prompt
                        </h5>
                        <p className="text-sm bg-accent/20 p-3 rounded">{scene.enhancedPrompt}</p>
                      </div>

                      <Separator />

                      <div>
                        <h5 className="font-medium mb-3">Scene Metadata</h5>
                        {renderSceneMetadata(scene)}
                      </div>

                      {scene.sceneMetadata.visualFocus.length > 0 && (
                        <div>
                          <h5 className="font-medium mb-2">Visual Focus</h5>
                          <div className="flex flex-wrap gap-1">
                            {scene.sceneMetadata.visualFocus.map(focus => (
                              <Badge key={focus} variant="outline" className="text-xs">
                                {focus}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="characters" className="space-y-4">
            <ScrollArea className="h-[500px]">
              {structuredData.map((scene, index) => (
                <div key={scene.sceneIndex} className="mb-6">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Scene {scene.sceneIndex + 1} Characters
                  </h4>
                  {scene.characters.length > 0 ? (
                    <div className="space-y-3">
                      {scene.characters.map(renderCharacterReference)}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No characters identified in this scene</p>
                  )}
                  <Separator className="my-4" />
                </div>
              ))}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="continuity" className="space-y-4">
            <ScrollArea className="h-[500px]">
              {structuredData.map((scene, index) => (
                <div key={scene.sceneIndex} className="mb-6">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Scene {scene.sceneIndex + 1} Continuity Links
                  </h4>
                  {scene.continuityLinks.length > 0 ? (
                    <div className="space-y-2">
                      {scene.continuityLinks.map(renderContinuityLink)}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      {index === 0 ? "First scene - no continuity links" : "No continuity links identified"}
                    </p>
                  )}
                  <Separator className="my-4" />
                </div>
              ))}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="json" className="space-y-4">
            <ScrollArea className="h-[500px]">
              <pre className="text-xs bg-muted p-4 rounded overflow-auto">
                {JSON.stringify(storyboardData, null, 2)}
              </pre>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};