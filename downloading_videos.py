import yt_dlp
import os

def download_first_20_videos(playlist_url, download_folder="downloads"):
    """
    Download first 20 videos from a YouTube playlist
    """
    
    # Create download folder if it doesn't exist
    if not os.path.exists(download_folder):
        os.makedirs(download_folder)
    
    # Configuration options
    ydl_opts = {
        'format': 'best[height<=720]',  # Download 720p or lower quality
        'outtmpl': f'{download_folder}/%(playlist_index)02d - %(title)s.%(ext)s',  # Filename format with padding
        'playlist_items': '1-20',  # Only download first 20 videos
        'ignoreerrors': True,  # Skip videos that can't be downloaded
        'no_warnings': False,  # Show warnings
        'writesubtitles': False,  # Set to True if you want subtitles
        'writeautomaticsub': False,  # Set to True for auto-generated subtitles
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            print("🎬 Starting download of first 20 videos from playlist...")
            print(f"📁 Download folder: {download_folder}")
            print("=" * 60)
            
            # Download the videos
            ydl.download([playlist_url])
            
            print("\n✅ Download completed!")
            print(f"📁 Check your '{download_folder}' folder for the videos")
            
    except Exception as e:
        print(f"❌ Error occurred: {str(e)}")

def download_audio_only(playlist_url, download_folder="downloads_audio"):
    """
    Download first 20 videos as audio only (MP3)
    """
    
    if not os.path.exists(download_folder):
        os.makedirs(download_folder)
    
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': f'{download_folder}/%(playlist_index)02d - %(title)s.%(ext)s',
        'playlist_items': '1-20',
        'ignoreerrors': True,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            print("🎵 Downloading first 20 videos as MP3 audio...")
            print(f"📁 Download folder: {download_folder}")
            print("=" * 60)
            
            ydl.download([playlist_url])
            
            print("\n✅ Audio download completed!")
            print(f"📁 Check your '{download_folder}' folder for the MP3 files")
            
    except Exception as e:
        print(f"❌ Error occurred: {str(e)}")

# Example usage
if __name__ == "__main__":
    # Replace with your playlist URL
    playlist_url = "https://www.youtube.com/watch?v=tVzUXW6siu0&list=PLu0W_9lII9agq5TrH9XLIKQvv0iaF2X3w"
    
    print("📺 YOUTUBE PLAYLIST DOWNLOADER - FIRST 20 VIDEOS")
    print("=" * 60)
    
    # Download first 20 videos (default)
    download_first_20_videos(playlist_url)
    
    # Uncomment below if you want audio only instead
    download_audio_only(playlist_url)