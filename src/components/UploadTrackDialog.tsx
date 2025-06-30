"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { usePlayer } from '@/context/PlayerContext';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, Loader2 } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { getPresignedUrl, addSong as addSongAction } from '@/app/actions';

const uploadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  artist: z.string().min(1, "Artist is required"),
  songFile: (typeof window === 'undefined' ? z.any() : z.instanceof(FileList)).refine(files => files?.length === 1, "Song file is required."),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

export function UploadTrackDialog() {
  const { addSong } = usePlayer();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: '',
      artist: '',
    }
  });

  const onSubmit = async (data: UploadFormValues) => {
    setIsUploading(true);
    try {
      const songFile = data.songFile[0];
      
      const { signedUrl, publicUrl } = await getPresignedUrl({
          name: songFile.name,
          type: songFile.type
      });

      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        body: songFile,
      });

      if (!uploadResponse.ok) {
        throw new Error('Song upload failed.');
      }

      const newSongData = {
        title: data.title,
        artist: data.artist,
        albumArtUrl: `https://placehold.co/300x300/9400D3/ffffff`,
        songUrl: publicUrl,
      };

      const addedSong = await addSongAction(newSongData);

      addSong(addedSong);

      toast({
        title: "Track uploaded!",
        description: `${data.title} by ${data.artist} is now in your library.`,
      });
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: "Upload failed",
        description: "Something went wrong during upload. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!isUploading) { setOpen(o); form.reset(); } }}>
      <DialogTrigger asChild>
        <Button>
          <UploadCloud className="mr-2 h-4 w-4" />
          Upload Track
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload a new track</DialogTitle>
          <DialogDescription>
            Add a new song to your vibe-loop. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Song Title" {...field} disabled={isUploading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="artist"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Artist</FormLabel>
                  <FormControl>
                    <Input placeholder="Artist Name" {...field} disabled={isUploading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="songFile"
              render={({ field: { onChange, onBlur, name, ref } }) => (
                <FormItem>
                  <FormLabel>Song File (MP3)</FormLabel>
                  <FormControl>
                    <Input 
                      type="file" 
                      accept="audio/mpeg" 
                      ref={ref}
                      name={name}
                      onBlur={onBlur}
                      onChange={(e) => onChange(e.target.files)} 
                      disabled={isUploading} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isUploading} className="w-full">
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
