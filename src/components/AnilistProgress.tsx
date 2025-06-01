
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { AnilistAnime } from "@/services/anilistClient";
import { ApiClient } from "@/services/apiClient";
import { useToast } from "@/hooks/use-toast";

const WATCH_STATUSES = ['CURRENT', 'PLANNING', 'COMPLETED', 'REPEATING', 'PAUSED'] as const;

interface AnilistProgressProps {
  anilistAnime: AnilistAnime;
}

export function AnilistProgress({ anilistAnime }: AnilistProgressProps) {
  const [progress, setProgress] = useState<number>(0);
  const [watchStatus, setWatchStatus] = useState<string>('PLANNING');
  const [editingProgress, setEditingProgress] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const [tempProgress, setTempProgress] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleProgressSave = async () => {
    const maxEpisodes = anilistAnime.episodes || 0;
    if (tempProgress <= maxEpisodes) {
      setIsUpdating(true);
      try {
        await ApiClient.updateAniList(anilistAnime.id, tempProgress);
        setProgress(tempProgress);
        setEditingProgress(false);
        
        toast({
          title: "Progress Updated",
          description: `Progress set to ${tempProgress} and synced with AniList`,
        });
      } catch (error) {
        console.error('Failed to update AniList progress:', error);
        toast({
          title: "Update Failed",
          description: "Failed to sync progress with AniList. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsUpdating(false);
      }
    } else {
      toast({
        title: "Invalid Progress",
        description: "Progress cannot exceed total episodes",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (newStatus: typeof WATCH_STATUSES[number]) => {
    setIsUpdating(true);
    try {
      await ApiClient.updateAniList(anilistAnime.id, undefined, newStatus);
      setWatchStatus(newStatus);
      setEditingStatus(false);
      
      toast({
        title: "Status Updated",
        description: `Status changed to ${newStatus} and synced with AniList`,
      });
    } catch (error) {
      console.error('Failed to update AniList status:', error);
      toast({
        title: "Update Failed",
        description: "Failed to sync status with AniList. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">AniList Progress & Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="anilist-progress">Progress</Label>
          {editingProgress ? (
            <div className="flex gap-2">
              <Input
                id="anilist-progress"
                type="number"
                min="0"
                max={anilistAnime.episodes || 0}
                value={tempProgress}
                onChange={(e) => setTempProgress(parseInt(e.target.value) || 0)}
                className="flex-1"
                disabled={isUpdating}
              />
              <Button 
                onClick={handleProgressSave} 
                size="sm"
                disabled={isUpdating}
              >
                {isUpdating ? "Saving..." : "Save"}
              </Button>
              <Button 
                onClick={() => {
                  setEditingProgress(false);
                  setTempProgress(progress);
                }} 
                variant="outline" 
                size="sm"
                disabled={isUpdating}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-medium">{progress} / {anilistAnime.episodes || 0}</span>
              <Button 
                onClick={() => {
                  setEditingProgress(true);
                  setTempProgress(progress);
                }} 
                variant="outline" 
                size="sm"
                disabled={isUpdating}
              >
                Edit
              </Button>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Label>Watch Status</Label>
          {editingStatus ? (
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex-1 justify-between"
                    disabled={isUpdating}
                  >
                    {watchStatus}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full bg-background border border-border z-50">
                  {WATCH_STATUSES.map((status) => (
                    <DropdownMenuItem 
                      key={status} 
                      onClick={() => handleStatusChange(status)}
                      className="cursor-pointer"
                      disabled={isUpdating}
                    >
                      {status}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                onClick={() => setEditingStatus(false)} 
                variant="outline" 
                size="sm"
                disabled={isUpdating}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Badge 
                variant={
                  watchStatus === "COMPLETED" ? "success" :
                  watchStatus === "CURRENT" ? "warning" :
                  "secondary"
                }
              >
                {watchStatus}
              </Badge>
              <Button 
                onClick={() => setEditingStatus(true)} 
                variant="outline" 
                size="sm"
                disabled={isUpdating}
              >
                Edit
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {isUpdating && (
        <div className="text-sm text-muted-foreground">
          Syncing changes with AniList...
        </div>
      )}
    </div>
  );
}
