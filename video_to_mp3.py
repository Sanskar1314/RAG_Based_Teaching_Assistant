# converts webm to mp3
import os
import subprocess
files = os.listdir("downloads_audio")
for file in files:
    tutorial_number = file.split(" -")[0]
    tutorial_name = file.split(" ｜ ")[0].split(" - ")[1]
    print(tutorial_number,tutorial_name)
    subprocess.run(["ffmpeg","-i",f"downloads_audio/{file}",f"audios/{tutorial_number}_{tutorial_name}.mp3"])