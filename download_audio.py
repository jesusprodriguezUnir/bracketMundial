import subprocess
import sys

result = subprocess.run([
    'yt-dlp',
    '-f', 'bestaudio',
    '--extract-audio',
    '--audio-format', 'mp3',
    '-o', 'recordings/dai_dai_audio.%(ext)s',
    '--',
    'https://www.youtube.com/watch?v=fcnDmrtj6Sk'
], capture_output=True, text=True)

print(result.stdout)
print(result.stderr)