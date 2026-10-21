#!/usr/bin/env python3
"""Orientation AI exam-film renderer. Free neural voice via Edge TTS; no API keys."""
import argparse, asyncio, json, re, textwrap, subprocess, shutil, sys
from pathlib import Path
from mutagen.mp3 import MP3
from PIL import Image, ImageDraw, ImageFont

HERE=Path(__file__).resolve().parent
OUT=HERE/"rendered"
OUT.mkdir(exist_ok=True)
VOICE_OPTIONS=["en-US-AndrewNeural","en-GB-RyanNeural","en-US-AvaNeural"]
C_BG=(9,15,30)
WHITE=(244,249,255)
MUTED=(151,169,195)
TEAL=(84,227,211)
PURPLE=(157,131,255)
def font(size,bold=False):
    names=["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf","/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]
    return ImageFont.truetype(names[0 if bold else 1],size)
def lines_for(text, chars=55, maxlines=3):
    return textwrap.wrap(text,chars,break_long_words=False,break_on_hyphens=False)[:maxlines]
def break_sents(text):
    chunks=re.split(r"(?<=[.!?])\s+(?=[A-Z0-9])",text)
    return [c.strip() for c in chunks if c.strip()]
def scene_slide(item,index,total):
    W,H=1280,720
    im=Image.new("RGB",(W,H),C_BG)
    d=ImageDraw.Draw(im)
    for y in range(H):
        f=y/H
        d.line((0,y,W,y),fill=(int(9+f*5),int(15+f*9),int(30+f*15)))
    d.ellipse((945,-260,1480,305),outline=(42,95,124),width=3)
    d.ellipse((1035,-165,1385,190),outline=(58,61,108),width=3)
    d.ellipse((-180,530,205,910),outline=(43,84,105),width=3)
    d.rounded_rectangle((56,47,1224,102),radius=16,fill=(19,31,54))
    d.text((76,63),"ORIENTATION AI   /   EXAM REVISION",font=font(21,True),fill=TEAL)
    d.text((1207,65),f"{index+1:02} / {total:02}",anchor="ra",font=font(20),fill=MUTED)
    d.text((64,138),item.get("chapter","COURSE REVIEW").upper(),font=font(20,True),fill=PURPLE)
    title=item["title"]
    title_lines=lines_for(title,33,2)
    yy=180
    for line in title_lines:
        d.text((64,yy),line,font=font(43,True),fill=WHITE)
        yy+=55
    boxy=max(290,yy+28)
    d.rounded_rectangle((58,boxy,1222,660),radius=22,fill=(19,31,52),outline=(34,58,85),width=2)
    d.text((89,boxy+24),"WHAT TO REMEMBER",font=font(20,True),fill=TEAL)
    phrases=break_sents(item["text"])
    # Combine short phrases into four balanced memory cues without paraphrasing the lecture.
    points=[]
    for phrase in phrases:
        if len(points)<4:points.append(phrase)
        else:points[-1]+=" "+phrase
    available=660-(boxy+69)-24
    step=max(64,min(104,available/max(1,len(points))))
    y=boxy+67
    for i,point in enumerate(points):
        if y+50>657:break
        color=TEAL if i%2==0 else PURPLE
        d.rounded_rectangle((87,y+5,103,y+21),radius=5,fill=color)
        maxchars=74 if len(points)<=3 else 81
        rows=lines_for(point,maxchars,3 if len(points)<=3 else 2)
        for k,ln in enumerate(rows):
            d.text((120,y+k*30),ln,font=font(22),fill=(218,230,246))
        y+=max(70,step)
    d.rectangle((0,706,int(W*(index+1)/total),720),fill=TEAL)
    im.save(OUT/f"slide_{index:03d}.png",optimize=True)
def ff_time(v):
    ms=round(v*1000)
    h,ms=divmod(ms,3600000)
    m,ms=divmod(ms,60000)
    s,ms=divmod(ms,1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"
def cmd(args):
    print("$"," ".join(map(str,args[:8])),"...",flush=True)
    proc=subprocess.run([str(z) for z in args],text=True,capture_output=True)
    if proc.returncode:
        print(proc.stdout[-2500:],proc.stderr[-5000:],file=sys.stderr)
        raise RuntimeError("FFmpeg command failed")
async def speak(text,path,voice):
    import edge_tts
    for trial in range(4):
        try:
            await edge_tts.Communicate(text=text,voice=voice,rate="-5%").save(str(path))
            if path.stat().st_size<3000:raise ValueError("Small audio file")
            return
        except Exception as exc:
            if trial==3:raise
            print(f"Speech attempt {trial+1} failed ({type(exc).__name__}). Waiting...",flush=True)
            await asyncio.sleep(3*(trial+1))
async def main():
    pa=argparse.ArgumentParser()
    pa.add_argument("--voice",default="en-US-AndrewNeural",choices=VOICE_OPTIONS)
    pa.add_argument("--preview",action="store_true")
    a=pa.parse_args()
    scenes=json.loads((HERE/"scenes.json").read_text(encoding="utf8"))
    assert len(scenes)==32, "Expected 32 scenes"
    if a.preview:scenes=scenes[:2]
    ff=shutil.which("ffmpeg")
    if not ff:raise RuntimeError("ffmpeg is required on the runner")
    durations=[]
    subtitles=[]
    position=0.0
    pause=0.85
    for i,item in enumerate(scenes):
        scene_slide(item,i,len(scenes))
        mp3=OUT/f"narration_{i:03d}.mp3"
        if not mp3.exists() or mp3.stat().st_size<3000:
            print(f"Creating voice {i+1}/{len(scenes)}: {item['title']}",flush=True)
            await speak(item["text"],mp3,a.voice)
        sec=MP3(str(mp3)).info.length
        wav=OUT/f"narration_{i:03d}.wav"
        cmd([ff,"-nostdin","-hide_banner","-loglevel","error","-y","-i",mp3,"-af",f"apad=pad_dur={pause}","-ac","2","-ar","48000","-c:a","pcm_s16le",wav])
        durations.append(sec+pause)
        sentences=break_sents(item["text"])
        count=sum(max(1,len(s.split())) for s in sentences)
        elapsed=position
        for sent in sentences:
            t=sec*max(1,len(sent.split()))/count
            subtitles.append((elapsed,elapsed+t,sent))
            elapsed+=t
        position+=sec+pause
    slides=OUT/"slides.ffconcat"
    with slides.open("w") as fp:
        fp.write("ffconcat version 1.0\n")
        for i,d in enumerate(durations):
            fp.write(f"file '{(OUT/f'slide_{i:03d}.png').as_posix()}'\n")
            fp.write(f"duration {d:.5f}\n")
        fp.write(f"file '{(OUT/f'slide_{len(scenes)-1:03d}.png').as_posix()}'\n")
    audios=OUT/"audio.ffconcat"
    with audios.open("w") as fp:
        fp.write("ffconcat version 1.0\n")
        for i in range(len(scenes)):
            fp.write(f"file '{(OUT/f'narration_{i:03d}.wav').as_posix()}'\n")
    srt=HERE/"Orientation_AI_Natural_Voice_Subtitles.srt"
    with srt.open("w",encoding="utf8") as fp:
        for n,(beg,end,txt) in enumerate(subtitles,1):
            fp.write(f"{n}\n{ff_time(beg)} --> {ff_time(end)}\n")
            fp.write("\n".join(lines_for(txt,62,5))+"\n\n")
    mp4=HERE/("Orientation_AI_Preview.mp4" if a.preview else "Orientation_AI_Natural_Voice.mp4")
    cmd([ff,"-nostdin","-hide_banner","-loglevel","error","-y",
         "-safe","0","-f","concat","-i",slides,"-safe","0","-f","concat","-i",audios,
         "-map","0:v:0","-map","1:a:0","-r","8","-fps_mode","cfr",
         "-c:v","libx264","-preset","veryfast","-crf","23","-pix_fmt","yuv420p",
         "-c:a","aac","-b:a","160k","-movflags","+faststart","-shortest",mp4])
    assert mp4.stat().st_size>1_000_000
    print(f"SUCCESS {mp4} ({mp4.stat().st_size} bytes) - {position/60:.1f} minutes",flush=True)
if __name__=="__main__":
    asyncio.run(main())
