
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
import { AnimeShowWithSoundtrack } from "@/types/anime";
import { ApiClient } from "@/services/apiClient";
import { useToast } from "@/hooks/use-toast";

const WATCH_STATUSES = ['CURRENT', 'PLANNING', 'COMPLETED', 'REPEATING', 'PAUSED'] as const;

interface AnimeProgressProps {
  anime: AnimeShowWithSoundtrack;
  onAnimeUpdate: (updatedAnime: AnimeShowWithSoundtrack) => void;
}

export function AnimeProgress({ anime, onAnimeUpdate }: AnimeProgressProps) {
  const [editingProgress, setEditingProgress] = useState(false);
  const [tempProgress, setTempProgress] = useState<number>(anime.anilist_progress || 0);
  const [editingStatus, setEditingStatus] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleProgressSave = async () => {
    console.log(`[AnimeProgress] Starting progress update for anime ID ${anime.id} from ${anime.anilist_progress || 0} to ${tempProgress}`);
    if (tempProgress <= (anime.episodes || 0)) {
      setIsUpdating(true);
      try {
        // Update the database
        console.log(`[AnimeProgress] Updating database for anime ID ${anime.id} with progress: ${tempProgress}`);
        const updatedAnime = await ApiClient.updateAnime(anime.id, {
          anilist_progress: tempProgress
        });
        console.log(`[AnimeProgress] Database update successful for anime ID ${anime.id}:`, updatedAnime);
        
        // Sync with AniList
        console.log(`[AnimeProgress] Syncing with AniList for anime ID ${anime.id} with progress: ${tempProgress}`);
        await ApiClient.updateAniList(anime.id, tempProgress);
        console.log(`[AnimeProgress] AniList sync successful for anime ID ${anime.id}`);
        
        // Update the local state
        onAnimeUpdate({ ...anime, anilist_progress: tempProgress });
        setEditingProgress(false);
        
        toast({
          title: "Progress Updated",
          description: `Progress set to ${tempProgress}, saved to database, and synced with AniList`,
        });
        console.log(`[AnimeProgress] Complete progress update successful for anime ID ${anime.id}`);
      } catch (error) {
        console.error(`[AnimeProgress] Failed to update progress for anime ID ${anime.id}:`, error);
        console.error(`[AnimeProgress] Error details:`, {
          name: error?.name,
          message: error?.message,
          stack: error?.stack
        });
        toast({
          title: "Update Failed",
          description: `Failed to save progress. Please try again. Error: ${error?.message || 'Unknown error'}`,
          variant: "destructive",
        });
      } finally {
        setIsUpdating(false);
      }
    } else {
      console.warn(`[AnimeProgress] Invalid progress value: ${tempProgress} > ${anime.episodes || 0} episodes`);
      toast({
        title: "Invalid Progress",
        description: "Progress cannot exceed total episodes",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (newStatus: typeof WATCH_STATUSES[number]) => {
    console.log(`[AnimeProgress] Starting status update for anime ID ${anime.id} from "${anime.watch_status}" to "${newStatus}"`);
    setIsUpdating(true);
    try {
      // Update the database
      console.log(`[AnimeProgress] Updating database for anime ID ${anime.id} with status: ${newStatus}`);
      const updatedAnime = await ApiClient.updateAnime(anime.id, {
        watch_status: newStatus
      });
      console.log(`[AnimeProgress] Database update successful for anime ID ${anime.id}:`, updatedAnime);
      
      // Sync with AniList
      console.log(`[AnimeProgress] Syncing with AniList for anime ID ${anime.id} with status: ${newStatus}`);
      await ApiClient.updateAniList(anime.id, undefined, newStatus);
      console.log(`[AnimeProgress] AniList sync successful for anime ID ${anime.id}`);
      
      // Update the local state
      onAnimeUpdate({ ...anime, watch_status: newStatus });
      setEditingStatus(false);
      
      toast({
        title: "Status Updated",
        description: `Status changed to ${newStatus}, saved to database, and synced with AniList`,
      });
      console.log(`[AnimeProgress] Complete status update successful for anime ID ${anime.id}`);
    } catch (error) {
      console.error(`[AnimeProgress] Failed to update status for anime ID ${anime.id}:`, error);
      console.error(`[AnimeProgress] Error details:`, {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      });
      toast({
        title: "Update Failed",
        description: `Failed to save status. Please try again. Error: ${error?.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Progress & Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="progress">AniList Progress</Label>
          {editingProgress ? (
            <div className="flex gap-2">
              <Input
                id="progress"
                type="number"
                min="0"
                max={anime.episodes || 0}
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
                  setTempProgress(anime.anilist_progress || 0);
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
              <span className="font-medium">{anime.anilist_progress || 0} / {anime.episodes || 0}</span>
              <Button 
                onClick={() => setEditingProgress(true)} 
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
                    {anime.watch_status || "Select Status"}
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
                  anime.watch_status === "COMPLETED" ? "success" :
                  anime.watch_status === "CURRENT" ? "warning" :
                  "secondary"
                }
              >
                {anime.watch_status || "Unknown"}
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
          Saving changes to database and syncing with AniList...
        </div>
      )}
    </div>
  );
}
