
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, XCircle, Zap } from "lucide-react";
import { ClipService } from "@/services/ClipService";

interface ClipValidationProps {
  imageUrls: string[];
  prompts: string[];
  characterDescriptions?: string[];
  isVisible?: boolean;
}

interface ValidationResult {
  promptAccuracy: {
    score: number;
    confidence: "high" | "medium" | "low";
  };
  characterConsistency?: {
    isConsistent: boolean;
    score: number;
    issues: string[];
  };
  recommendations: string[];
}

export const ClipValidation = ({ 
  imageUrls, 
  prompts, 
  characterDescriptions = [],
  isVisible = true 
}: ClipValidationProps) => {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [overallScore, setOverallScore] = useState<number>(0);

  useEffect(() => {
    if (isVisible && imageUrls.length > 0 && prompts.length > 0) {
      validateImages();
    }
  }, [imageUrls, prompts, characterDescriptions, isVisible]);

  const validateImages = async () => {
    setIsValidating(true);
    try {
      const results = await ClipService.validateGeneratedImages(
        imageUrls,
        prompts,
        characterDescriptions
      );
      
      setValidationResults(results);
      
      // Calculate overall score
      const totalScore = results.reduce((sum, result) => sum + result.promptAccuracy.score, 0);
      setOverallScore(totalScore / results.length);
      
    } catch (error) {
      console.error("Error validating images:", error);
    } finally {
      setIsValidating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.7) return "text-green-600";
    if (score >= 0.4) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 0.7) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (score >= 0.4) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getConfidenceBadge = (confidence: "high" | "medium" | "low") => {
    const variants = {
      high: "default",
      medium: "secondary",
      low: "destructive"
    } as const;
    
    return (
      <Badge variant={variants[confidence]} className="ml-2">
        {confidence} confidence
      </Badge>
    );
  };

  if (!isVisible || imageUrls.length === 0) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          CLIP Validation
          {isValidating && <span className="text-sm text-muted-foreground">Analyzing...</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isValidating ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-sm text-muted-foreground">
                Validating image accuracy and character consistency...
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Overall Score */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="font-medium">Overall Accuracy Score</span>
              <div className="flex items-center gap-2">
                {getScoreIcon(overallScore)}
                <span className={`font-bold ${getScoreColor(overallScore)}`}>
                  {Math.round(overallScore * 100)}%
                </span>
              </div>
            </div>

            {/* Individual Image Results */}
            <div className="space-y-3">
              {validationResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">Image {index + 1}</span>
                    <div className="flex items-center">
                      {getScoreIcon(result.promptAccuracy.score)}
                      <span className={`ml-2 font-medium ${getScoreColor(result.promptAccuracy.score)}`}>
                        {Math.round(result.promptAccuracy.score * 100)}%
                      </span>
                      {getConfidenceBadge(result.promptAccuracy.confidence)}
                    </div>
                  </div>
                  
                  {/* Character Consistency */}
                  {result.characterConsistency && (
                    <div className="text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Character Consistency:</span>
                        {result.characterConsistency.isConsistent ? (
                          <Badge variant="default">Consistent</Badge>
                        ) : (
                          <Badge variant="destructive">Inconsistent</Badge>
                        )}
                        <span className="text-muted-foreground">
                          ({Math.round(result.characterConsistency.score * 100)}%)
                        </span>
                      </div>
                      
                      {result.characterConsistency.issues.length > 0 && (
                        <div className="mt-2">
                          {result.characterConsistency.issues.map((issue, issueIndex) => (
                            <Alert key={issueIndex} className="mt-1">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription className="text-xs">
                                {issue}
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Recommendations */}
                  {result.recommendations.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-muted-foreground">Recommendations:</span>
                      {result.recommendations.map((rec, recIndex) => (
                        <div key={recIndex} className="text-xs text-muted-foreground flex items-start gap-1">
                          <span>•</span>
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
