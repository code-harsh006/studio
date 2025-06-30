'use server';

import { s3 } from "@/lib/s3";
import { supabase } from "@/lib/supabase";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { Song } from "@/types";
import { v4 as uuidv4 } from 'uuid';

export async function getPresignedUrl(file: {name: string, type: string}) {
    const fileName = `${uuidv4()}-${file.name}`;

    const command = new PutObjectCommand({
        Bucket: process.env.HETZNER_BUCKET_NAME!,
        Key: fileName,
        ContentType: file.type,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

    const publicUrl = `${process.env.HETZNER_ENDPOINT!}/${process.env.HETZNER_BUCKET_NAME!}/${fileName}`;

    return { signedUrl, publicUrl };
}

export async function addSong(songData: Omit<Song, 'id' | 'createdAt'>): Promise<Song> {
    const { data, error } = await supabase
        .from('songs')
        .insert([
            {
                title: songData.title,
                artist: songData.artist,
                song_url: songData.songUrl,
                album_art_url: songData.albumArtUrl,
            },
        ])
        .select()
        .single();
    
    if (error) {
        console.error('Error adding song to DB:', error);
        throw new Error('Could not add song to database.');
    }

    return {
        id: data.id,
        title: data.title,
        artist: data.artist,
        albumArtUrl: data.album_art_url,
        songUrl: data.song_url,
        createdAt: data.created_at,
    };
}

export async function getSongs(): Promise<Song[]> {
    const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching songs:', error);
        return [];
    }

    return data.map(song => ({
        id: song.id,
        title: song.title,
        artist: song.artist,
        albumArtUrl: song.album_art_url,
        songUrl: song.song_url,
        createdAt: song.created_at,
    }));
}
