# Build a reel from clip segments with caption overlays + end card.
import json,subprocess,sys
spec=json.load(open(sys.argv[1])); out=sys.argv[2]; cdir=sys.argv[3]
inputs=[];filters=[];n=0;labels=[]
for i,s in enumerate(spec['segments']):
    inputs+=['-ss',str(s['start']),'-t',str(s['dur']),'-i',s['file']]; vi=n; n+=1
    inputs+=['-loop','1','-t',str(s['dur']),'-i',f"{cdir}/{s['cap']}.png"]; ci=n; n+=1
    filters.append(f"[{vi}:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1[v{i}];[v{i}][{ci}:v]overlay=0:0:shortest=1,format=yuv420p[s{i}]")
    labels.append(f"[s{i}]")
inputs+=['-loop','1','-t',str(spec.get('end_dur',2)),'-i',spec['end']]; ei=n; n+=1
filters.append(f"[{ei}:v]scale=1080:1920,fps=30,format=yuv420p,setsar=1[e]"); labels.append('[e]')
inputs+=['-f','lavfi','-i','anullsrc=r=44100:cl=stereo']; ai=n
filters.append(''.join(labels)+f"concat=n={len(labels)}:v=1[outv]")
cmd=['ffmpeg','-v','error','-y',*inputs,'-filter_complex',';'.join(filters),'-map','[outv]','-map',f'{ai}:a','-shortest','-c:v','libx264','-preset','veryfast','-crf','21','-pix_fmt','yuv420p','-c:a','aac','-b:a','96k','-movflags','+faststart',out]
subprocess.run(cmd,check=True); print(out)
