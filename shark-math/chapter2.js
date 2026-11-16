/* Shark Math, Chapter 2: The Deep Blue.
   Loaded right after the main script. It registers new puzzle renderers on R and pushes nine
   new islands onto WORLDS with ch: 2. Everything lives inside one function so that no name
   here can clash with the main script. */
'use strict';
(() => {
/* ================================================================ styles */
const CSS = `
.c2-row{display:flex;gap:14px;align-items:center;justify-content:center;flex-wrap:wrap;max-width:100%}
.c2-col{display:flex;flex-direction:column;gap:10px;align-items:center}
.c2-pop{animation:c2pop .45s}
@keyframes c2pop{40%{transform:scale(1.25)}}
.c2-glow{animation:c2glow 1s ease-in-out infinite}
@keyframes c2glow{50%{box-shadow:0 0 0 6px rgba(255,207,90,.9)}}
.c2-log{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;max-width:720px;font-size:16px;min-height:26px;align-items:center}
.c2-log span{background:#eef3f5;border-radius:10px;padding:2px 10px}
.c2-log span.new{background:#ffe7a0}
.c2-log b{color:var(--ink2)}
.c2-status{font-size:20px;font-weight:600;text-align:center;min-height:27px}
.c2-goal{background:#fff7e0;border-radius:14px;padding:4px 16px;font-weight:600;text-align:center}

/* number machines */
.c2-pipe{display:flex;align-items:flex-end;gap:6px;justify-content:center;max-width:100%;margin-top:4px}
.c2-vcol{display:flex;flex-direction:column;align-items:center;gap:4px}
.c2-vlab{font-size:14px;font-weight:700;color:var(--ink2);text-transform:uppercase;letter-spacing:.05em;min-height:18px;white-space:nowrap}
.c2-val{min-width:66px;height:66px;border-radius:50%;padding:0 8px;display:grid;place-items:center;font-size:30px;font-weight:700;background:radial-gradient(circle at 35% 30%,#fff,#ffe2a6 60%,#f5c35a);box-shadow:0 3px 0 rgba(0,0,0,.12);margin-bottom:22px}
.c2-val.unk{background:#eef3f5;color:#9fb3c2}
.c2-val.want{background:#fff;border:3px dashed var(--coral);color:var(--coral-d)}
.c2-val.jam{background:var(--bad-l);color:var(--bad)}
.c2-arr{font-size:24px;color:var(--teal);padding-bottom:40px}
.c2-mach{width:122px;display:flex;flex-direction:column;align-items:center;flex:none}
.c2-hop{width:56px;height:16px;background:#2b7f99;clip-path:polygon(0 0,100% 0,72% 100%,28% 100%)}
.c2-mbody{width:100%;border-radius:18px;background:linear-gradient(#8ad6e6,#3aa3c4);border:3px solid #2b7f99;padding:6px 6px 8px;display:flex;flex-direction:column;align-items:center;gap:4px}
.c2-gear{font-size:24px;line-height:1;display:inline-block}
.c2-mach.run .c2-gear{animation:c2spin .45s linear}
.c2-mach.run .c2-mbody{background:linear-gradient(#b5ecf5,#56bdd8)}
@keyframes c2spin{to{transform:rotate(360deg)}}
.c2-plate{min-width:86px;height:50px;border-radius:12px;background:#fff;display:grid;place-items:center;font-size:25px;font-weight:700;padding:0 6px}
.c2-plate.hid{background:#fff7ef;border:3px dashed var(--coral);color:var(--coral-d);font-size:28px}
.c2-plate.lock{box-shadow:0 0 0 3px var(--good)}
.c2-pipe.compact{gap:3px}
.c2-pipe.compact .c2-mach{width:100px}.c2-pipe.compact .c2-val{min-width:54px;height:54px;font-size:24px}.c2-pipe.compact .c2-plate{min-width:74px}.c2-pipe.compact .c2-arr{font-size:18px}
.c2-rcard{min-width:82px;height:48px;border-radius:12px;background:#fff;border:3px solid var(--line);font-size:25px;font-weight:700;box-shadow:0 4px 0 var(--line);padding:0 8px}
.c2-plate .c2-rcard{box-shadow:none;border-color:transparent;min-width:72px;height:42px}
.c2-cards{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;align-items:center;background:var(--sand);border-radius:18px;padding:8px 16px;min-height:66px;min-width:min(100%,300px)}
.c2-extab{border-collapse:separate;border-spacing:0;font-size:22px;background:#fff;border:3px solid var(--line);border-radius:14px;overflow:hidden}
.c2-extab th{background:var(--teal-l);padding:3px 12px;font-size:16px;text-align:left;white-space:nowrap}
.c2-extab td{padding:2px 10px;text-align:center;font-weight:600;min-width:50px;border-left:2px solid var(--line)}
.c2-extab td.test{background:#fff7e0}
.c2-extab td.ok{background:var(--good-l);color:var(--good)}
.c2-extab td.no{background:var(--bad-l);color:var(--bad)}
.c2-extab td.dif{color:var(--coral-d);font-size:19px}
.c2-extab tr+tr td,.c2-extab tr+tr th{border-top:2px solid var(--line)}
.c2-feed{display:flex;gap:10px;align-items:center;background:var(--teal-l);border-radius:16px;padding:8px 14px;flex-wrap:wrap;justify-content:center}
.c2-feed .numin{width:84px;height:50px;font-size:26px}
.c2-rev{display:flex;gap:8px;align-items:center;justify-content:center;background:#fff7e0;border-radius:14px;padding:6px 14px;font-size:20px;font-weight:600;flex-wrap:wrap}
.c2-rev .rb{background:#fff;border-radius:10px;padding:0 10px;border:2px solid var(--sun-d)}
.c2-rev .rv{font-size:24px}

/* coins */
.c2-coin{width:60px;height:60px;border-radius:50%;display:inline-grid;place-items:center;font-size:24px;font-weight:700;color:#5a3d0a;border:3px solid rgba(90,61,10,.25);box-shadow:inset 0 -4px 0 rgba(0,0,0,.14),0 3px 0 rgba(0,0,0,.12);padding:0;flex:none}
.c2-coin.v1{background:radial-gradient(circle at 35% 30%,#ffe0c2,#d98c4a)}
.c2-coin.v2{background:radial-gradient(circle at 35% 30%,#fff,#b6c2cc);color:#3d4d5a}
.c2-coin.v3{background:radial-gradient(circle at 35% 30%,#d9fbf4,#3fb8a5);color:#0d4d44}
.c2-coin.v4{background:radial-gradient(circle at 35% 30%,#efe2ff,#9b6ad6);color:#3c1d66}
.c2-coin.v5{background:radial-gradient(circle at 35% 30%,#fff6c4,#e9b824)}
.c2-coin.v10{width:68px;height:68px;background:radial-gradient(circle at 35% 30%,#ffe7c7,#f08a24);font-size:26px}
.c2-coin.sm{width:32px;height:32px;font-size:15px;border-width:2px;box-shadow:inset 0 -2px 0 rgba(0,0,0,.14)}
.c2-mat{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:center;border-radius:20px;padding:8px 14px;min-height:84px}
.c2-purse{background:linear-gradient(#c7edf5,#93d4e6);min-width:min(100%,520px)}
.c2-counter{background:linear-gradient(#f6e4b8,#e2c47f);min-width:min(100%,520px)}
.c2-mat .coins{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;min-height:60px;align-items:center}
.c2-mlab{width:100%;text-align:center;font-weight:600;font-size:17px;color:var(--ink2)}
.c2-shop{display:flex;align-items:center;gap:16px;font-size:22px;font-weight:600}
.c2-tag{background:#fff;border:3px solid var(--sun-d);border-radius:12px;padding:4px 14px;font-size:24px;font-weight:700}
.c2-itemem{font-size:50px;line-height:1}
.c2-big{font-size:26px;font-weight:700}
.c2-piles{display:flex;gap:16px;flex-wrap:wrap;justify-content:center}
.c2-pile{width:290px;min-height:150px;background:linear-gradient(#f6e4b8,#e2c47f);border-radius:20px;padding:8px;display:flex;flex-direction:column;align-items:center;gap:6px}
.c2-pile .coins{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}
.c2-steps{display:flex;flex-direction:column;gap:8px}
.c2-step{display:flex;align-items:center;gap:8px;background:var(--teal-l);border-radius:16px;padding:6px 12px}
.c2-step .cnt{width:40px;text-align:center;font-size:28px;font-weight:700}
.c2-step .strip{display:flex;gap:2px;flex-wrap:wrap;width:176px;min-height:32px;align-items:center}
.c2-waysbox{max-height:270px;overflow:auto;background:#fff;border:3px solid var(--line);border-radius:14px;padding:4px 8px;min-width:210px}
.c2-ways{border-collapse:collapse;font-size:20px;width:100%}
.c2-ways th,.c2-ways td{padding:1px 8px;text-align:center;border-bottom:2px solid var(--line)}
.c2-ways th .c2-coin{margin:2px auto}
.c2-ways tr.new td{background:#ffe7a0}
.c2-ways tr.ghost td{color:#a9bccb}

/* clocks and calendars */
.c2-clock{width:250px;height:250px;flex:none;touch-action:none}
.c2-clock svg{width:100%;height:100%;display:block}
.c2-hand{cursor:grab}
body.c2-turning,body.c2-turning *{cursor:grabbing!important}
.c2-side{display:flex;flex-direction:column;gap:10px;align-items:center;max-width:320px}
.c2-digi{font-size:38px;font-weight:700;background:#14365a;color:#7ff0c4;border-radius:14px;padding:2px 18px;font-variant-numeric:tabular-nums;letter-spacing:.04em}
.c2-ela{font-size:19px;text-align:center;min-height:52px}
.c2-tbtns{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.c2-tbtns .btn{font-size:17px;padding:7px 10px}
.c2-minic{display:flex;flex-direction:column;align-items:center;gap:0;font-weight:600;font-size:17px}
.c2-minic svg{width:104px;height:104px}
.c2-ring{position:relative;width:330px;height:330px;flex:none}
.c2-day{position:absolute;width:86px;height:62px;margin:-31px 0 0 -43px;border-radius:20px;background:#fff;border:3px solid var(--line);display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:600;font-size:19px;line-height:1.1;transition:background .2s,transform .2s;padding:0}
.c2-day small{font-size:13px;color:var(--ink2);font-weight:600;min-height:14px}
.c2-day.on{background:#ffe7a0;border-color:var(--sun-d);transform:scale(1.14)}
.c2-day.start{border-color:var(--teal)}
.c2-day.ok{background:var(--good-l);border-color:var(--good)}
.c2-ringmid{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);text-align:center;display:flex;flex-direction:column;align-items:center;gap:2px;width:150px}
.c2-ringmid svg{width:104px;height:68px}
.c2-hops{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.c2-hops .btn{font-size:17px;padding:8px 10px}
.c2-month{display:grid;grid-template-columns:repeat(7,50px);gap:4px}
.c2-month .hd{font-size:14px;font-weight:700;color:var(--ink2);text-align:center}
.c2-mday{height:40px;border-radius:10px;background:#fff;border:2px solid var(--line);font-size:19px;font-weight:600;padding:0;position:relative}
.c2-mday.on{background:#bfe9f5;border-color:var(--teal)}
.c2-mday.on:after{content:'🏊';position:absolute;right:-4px;top:-8px;font-size:15px}
.c2-mday.t1{box-shadow:inset 0 -6px 0 #ffd27a}.c2-mday.t2{box-shadow:inset 0 -6px 0 #b5a3e8}.c2-mday.t3{box-shadow:inset 0 -6px 0 var(--coral)}

/* venn */
.c2-venn{position:relative;flex:none}
.c2-venn svg{position:absolute;inset:0;overflow:visible}
.c2-venn path.rg{transition:fill .2s}
.c2-venn path.rg.over,.c2-venn path.rg.c2-hl{fill:rgba(255,207,90,.6)!important}
.c2-venn path.rg.c2-hl{animation:c2blink 1s ease-in-out infinite}
@keyframes c2blink{50%{fill-opacity:.3}}
body.picking .c2-venn path.rg,body.dragging .c2-venn path.rg{stroke:rgba(13,132,150,.5);stroke-width:2;stroke-dasharray:6 5}
.c2-vtok{position:absolute;width:52px;height:52px;margin:-26px 0 0 -26px;border-radius:16px;background:#fff;border:3px solid var(--line);display:flex;align-items:center;justify-content:center;padding:0;box-shadow:0 3px 0 var(--line);font-size:23px;font-weight:700;color:var(--ink)}
.c2-vtok.num{border-radius:50%}
.c2-vtok.placed{cursor:default;box-shadow:none;animation:c2pop .4s}
body.dragging .c2-vtok.placed,body.picking .c2-vtok.placed,.c2-vlbl,.c2-vtok.placed{pointer-events:none}
.c2-vlbl{position:absolute;transform:translate(-50%,-50%);border-radius:999px;padding:3px 14px;font-weight:700;font-size:18px;color:#fff;white-space:nowrap;z-index:2}
.c2-vlbl.slot{pointer-events:auto;background:#fff!important;border:3px dashed currentColor;min-width:130px;text-align:center;padding:2px 8px}
.c2-vlbl.slot.filled{border-style:solid}
.c2-vtray{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;background:var(--sand);border-radius:18px;padding:8px 14px;min-height:70px;align-items:center;min-width:min(100%,420px);max-width:640px}
.c2-vtray .c2-vtok{position:static;margin:0}
.c2-lcard{border:3px solid var(--line);background:#fff;border-radius:999px;padding:6px 16px;font-weight:700;font-size:18px;box-shadow:0 3px 0 var(--line);color:var(--ink)}
.c2-vin{position:absolute;transform:translate(-50%,-50%);width:70px;height:52px;border-radius:12px;border:3px solid var(--line);text-align:center;font-size:26px;font-weight:700;background:#fff;z-index:2}
.c2-vin.ok{border-color:var(--good);background:var(--good-l)}
.c2-vin.fixed{background:#eef3f5;border-color:#d5e2ea;display:grid;place-items:center}
.c2-vcap{position:absolute;transform:translate(-50%,-50%);font-size:14px;font-weight:700;color:var(--ink2);white-space:nowrap;pointer-events:none}

/* jugs */
.c2-jugs{display:flex;gap:30px;align-items:flex-end;justify-content:center;flex-wrap:wrap}
.c2-jug{display:flex;flex-direction:column;align-items:center;gap:5px}
.c2-jugtop{font-weight:700;font-size:17px;color:var(--ink2)}
.c2-vessel{position:relative;width:92px;border:5px solid #5c7d96;border-top:0;border-radius:0 0 22px 22px;background:rgba(255,255,255,.75);overflow:hidden;transition:transform .45s;padding:0;display:block}
.c2-vessel.tl{transform:rotate(-16deg)}.c2-vessel.tr{transform:rotate(16deg)}
.c2-water{position:absolute;left:0;right:0;bottom:0;background:linear-gradient(#8fe0f2,#2f8fb5);transition:height .7s ease-in-out}
.c2-tick{position:absolute;left:0;width:16px;border-top:2px solid rgba(92,125,150,.5);pointer-events:none}
.c2-amt{font-size:23px;font-weight:700;line-height:1.1}
.c2-amt small{font-size:15px;color:var(--ink2);font-weight:600}
.c2-jbtns{display:flex;flex-direction:column;gap:5px;align-items:stretch}
.c2-jbtns .btn{font-size:15px;padding:5px 10px}

/* pearls */
.c2-pearl{width:44px;height:44px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,#f4eefa 45%,#d6cbe6);border:2px solid #c3b5d6;font-size:18px;font-weight:700;color:#5d4d75;padding:0;box-shadow:0 2px 0 rgba(0,0,0,.12);flex:none}
.c2-pearl.real{opacity:.45}
.c2-pearl.fake{background:radial-gradient(circle at 35% 30%,#fff,#ffe7a0 50%,#f5c35a);border-color:var(--sun-d);animation:c2pop .5s 2}
.c2-pearl.sm{width:16px;height:16px;border-width:1px;box-shadow:none;display:inline-block}
.c2-pscale.scale{height:226px;margin-top:0}
.c2-zones{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;width:min(100%,720px)}
.c2-zone{border-radius:18px;padding:5px 10px;min-height:74px;display:flex;flex-direction:column;align-items:center;gap:3px}
.c2-zone .zl{font-size:15px;font-weight:700;color:var(--ink2)}
.c2-zone .zp{display:flex;flex-wrap:wrap;gap:4px;justify-content:center;min-height:46px;align-items:center}
.c2-ztable{background:linear-gradient(#c7edf5,#93d4e6);flex:1;min-width:250px}
.c2-zreal{background:var(--good-l);min-width:140px}
.c2-zfake{background:#fff1d6;border:3px dashed var(--coral);min-width:110px}
.c2-wcount{font-weight:700;font-size:19px}
.c2-think{display:flex;flex-direction:column;gap:10px;align-items:stretch}
.c2-trow{display:flex;align-items:center;gap:14px;background:var(--teal-l);border-radius:16px;padding:6px 14px;min-height:56px}
.c2-trow .tl{width:170px;font-weight:600}
.c2-trow .grp{display:flex;gap:2px;flex-wrap:wrap;width:56px;justify-content:center;background:#fff;border-radius:10px;padding:3px}
.c2-trow .grp.g9{width:62px}

/* cubes and nets */
.c2-cubes{display:flex;gap:18px;align-items:center;justify-content:center;flex-wrap:wrap;width:100%}
.c2-iso{flex:none;display:grid;place-items:center}
.c2-iso svg{display:block}
.c2-cside{display:flex;flex-direction:column;gap:10px;align-items:stretch;max-width:340px}
.c2-layers{font-size:18px;text-align:center;min-height:24px}
.c2-nets{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
.c2-netcard{width:184px;border:3px solid var(--line);border-radius:18px;background:#fff;padding:6px;display:flex;flex-direction:column;align-items:center;gap:4px;box-shadow:0 4px 0 var(--line);cursor:pointer}
.c2-netcard.on{border-color:var(--teal);background:var(--teal-l);box-shadow:0 4px 0 var(--teal)}
.c2-netcard.good{border-color:var(--good);background:var(--good-l)}
.c2-netcard .pk{font-weight:700;font-size:16px;color:var(--ink2)}
.c2-netcard.on .pk{color:var(--teal-d)}
.c2-scene{width:170px;height:132px;perspective:640px;display:grid;place-items:center}
.c2-scene.big{width:300px;height:240px}
.c2-n3d{position:relative;transform-style:preserve-3d;transition:transform 1.1s ease-in-out}
.c2-n3d.folded{transform:rotateX(56deg) rotateZ(-30deg) scale(1.35)}
.c2-scene.big .c2-n3d.folded{transform:rotateX(56deg) rotateZ(-30deg) scale(1.1)}
.c2-face{position:absolute;transform-style:preserve-3d;transition:transform 1.1s ease-in-out;box-shadow:inset 0 0 0 2px #2b7f99;display:grid;place-items:center;font-weight:700;color:#14365a}
.c2-face.f0{background:#9fe0ee}.c2-face.f1{background:#ffd98a}.c2-face.f2{background:#b9e7c5}.c2-face.f3{background:#f6b8a8}.c2-face.f4{background:#d4c4f2}.c2-face.f5{background:#fff3b0}
.c2-foldb{font-size:15px!important;padding:4px 10px!important}

/* digits */
.c2-sum{display:grid;gap:5px;justify-content:center;align-items:center}
.c2-dc{width:58px;height:62px;border-radius:14px;display:grid;place-items:center;font-size:38px;font-weight:700;position:relative}
.c2-dc.fix{background:var(--teal-l)}
.c2-dc.var{background:#fff;border:3px dashed var(--teal);cursor:pointer}
.c2-dc.var.filled{border-style:solid;background:#fff7e0;border-color:var(--sun-d)}
.c2-dc .lt{position:absolute;top:0;left:5px;font-size:15px;color:var(--coral-d);line-height:1.2}
.c2-dc.op{font-size:36px;color:var(--teal)}
.c2-dc.var .q{color:#9fb3c2}
.c2-line{grid-column:1/-1;height:5px;background:var(--ink);border-radius:3px}
.c2-dtiles{display:flex;gap:7px;flex-wrap:wrap;justify-content:center;background:var(--sand);border-radius:18px;padding:8px 14px;min-height:76px;align-items:center}
.c2-dt{width:52px;height:60px;border-radius:12px;background:#fff;border:3px solid #fff;box-shadow:0 4px 0 var(--sand-d);font-size:32px;font-weight:700;padding:0}
.c2-dnum{display:flex;gap:4px;background:var(--teal-l);border-radius:16px;padding:6px}
.c2-dslot{width:62px;height:70px;border-radius:14px;background:#fff;border:3px dashed var(--teal);display:grid;place-items:center}
.c2-dslot .c2-dt{box-shadow:none;border-color:transparent}
.c2-dbig{font-size:30px;font-weight:700;color:var(--teal-d)}
.c2-wheel{display:flex;flex-direction:column;align-items:center;gap:4px}
.c2-wheel .wv{width:76px;height:84px;border-radius:16px;background:#fff;border:3px solid var(--teal);display:grid;place-items:center;font-size:54px;font-weight:700}
.c2-wheel .wl{font-size:15px;font-weight:700;color:var(--ink2)}
.c2-chips{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;min-height:44px;max-width:520px;align-items:center}
.c2-chip{background:var(--good-l);border:2px solid var(--good);border-radius:12px;padding:2px 12px;font-size:24px;font-weight:700}
.c2-chip.new{animation:c2pop .45s}

/* river */
.c2-riv{display:grid;grid-template-columns:150px 1fr 150px;width:min(100%,700px);height:246px;border-radius:22px;overflow:hidden;flex:none;box-shadow:var(--shadow)}
.c2-bank{background:linear-gradient(#f6e4b8,#e2c47f);display:flex;flex-wrap:wrap;align-content:center;justify-content:center;gap:6px;padding:20px 8px 8px;position:relative}
.c2-bank .bl{position:absolute;top:4px;left:0;right:0;text-align:center;font-size:13px;font-weight:700;color:#8a6a3a;text-transform:uppercase;letter-spacing:.06em}
.c2-flow{position:relative;background:repeating-linear-gradient(100deg,rgba(255,255,255,0) 0 26px,rgba(255,255,255,.22) 26px 30px),linear-gradient(#7fd6e8,#2d8fb3);min-width:240px}
.c2-raft{position:absolute;top:50%;transform:translateY(-50%);transition:left .85s ease-in-out;display:flex;flex-direction:column;align-items:center;left:8px}
.c2-raft.atR{left:calc(100% - var(--rw) - 8px)}
.c2-seats{display:flex;gap:4px;justify-content:center;align-items:flex-end;min-height:72px;width:100%}
.c2-plank{width:100%;height:22px;background:repeating-linear-gradient(90deg,#b07a40 0 20px,#8a5d2e 20px 24px);border-radius:8px;box-shadow:0 5px 0 rgba(0,0,0,.18)}
.c2-who{width:64px;height:70px;border-radius:14px;background:#fff;border:3px solid #fff;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0;box-shadow:0 3px 0 rgba(0,0,0,.14);line-height:1.05}
.c2-who .e{font-size:34px;line-height:1;display:grid;place-items:center;height:38px}
.c2-who .e svg{width:58px;height:38px}
.c2-who.small .e{font-size:23px}
.c2-who .n{font-size:13px;font-weight:600}
.c2-who .w{font-size:12px;font-weight:700;color:var(--coral-d)}
.c2-who.inboat{border-color:var(--sun)}
.c2-riv.many .c2-who{width:58px;height:62px}.c2-riv.many .c2-who .e{font-size:28px;height:32px}.c2-riv.many .c2-bank{gap:5px;padding-top:18px}
.c2-rules{background:#fff;border:3px solid var(--line);border-radius:16px;padding:4px 14px;font-size:17px;max-width:700px}
.c2-rules div{margin:2px 0}
@media (max-height:780px){.c2-rules{font-size:15px;padding:2px 12px}.c2-venn{zoom:.84}.c2-mday{height:35px}.c2-riv{height:232px}.c2-pscale.scale{height:212px}.c2-clock{width:230px;height:230px}.c2-ring{transform:scale(.94)}}
`;
document.head.append(h('style', { id: 'ch2-style' }, CSS));

/* ================================================================ small helpers */
const shakeEl = el => { if (!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
const popEl = el => { if (!el) return; el.classList.remove('c2-pop'); void el.offsetWidth; el.classList.add('c2-pop'); };
const winLater = (api, ms = 500) => setTimeout(() => api.win(), ms);
const plural = (n, one, many) => `${n} ${n === 1 ? one : (many || one + 's')}`;
const mod = (a, n) => ((a % n) + n) % n;
const sumOf = a => a.reduce((x, y) => x + y, 0);
const ord = n => n + ((n % 100 >= 11 && n % 100 <= 13) ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' })[n % 10] || 'th');

/* ================================================================ 1. number machines */
const RULE = {
  p: s => ({ op: s[0], n: +s.slice(1) }),
  f(s, x) {
    if (x == null) return null; const { op, n } = RULE.p(s);
    if (op === '+') return x + n; if (op === '-') return x >= n ? x - n : null;
    if (op === 'x') return x * n; if (op === '/') return x % n === 0 ? x / n : null; return null;
  },
  label(s) { const { op, n } = RULE.p(s); return ({ '+': '+ ', '-': '− ', 'x': '× ', '/': '÷ ' })[op] + n; },
  inv(s) { const { op, n } = RULE.p(s); return ({ '+': '-', '-': '+', 'x': '/', '/': 'x' })[op] + n; },
  stuck(s, x) { const { op, n } = RULE.p(s); return op === '-' ? `it can’t take ${n} away from ${x}` : `it can’t split ${x} into ${n} equal whole parts`; },
};
const runRules = (rules, x) => rules.reduce((v, r) => RULE.f(r, v), x);
function machineInput(p) { for (let x = 0; x <= 999; x++) if (runRules(p.ms, x) === p.target) return x; return null; }

R.machine = (st, p, api) => {
  const k = p.ms.length, mode = p.mode;
  const hidden = mode === 'order' ? range(k) : (p.hide || []);
  const plate = p.ms.map((r, i) => hidden.includes(i) ? null : r);
  let tray = (p.cards || (mode === 'order' ? p.ms.slice().reverse() : [])).slice();
  const vals = Array(k + 1).fill(null);
  const locked = new Set(); const tests = []; const ex = p.ex || [];
  let busy = false, jam = -1, showDiff = false, revLevel = 0;
  const pipe = h('div', { class: 'c2-pipe' + (k >= 3 ? ' compact' : '') });
  const machEls = [];
  const tableBox = h('div');
  const trayEl = h('div', { class: 'c2-cards' });
  droppable(trayEl, d => { if (d.from >= 0) back(d); }, 'Card tray');
  const rev = h('div', { class: 'c2-rev' }); rev.hidden = true;
  const fmtV = v => v == null ? '✋' : String(v);
  const cardEl = (c, from) => {
    const b = h('button', { class: 'c2-rcard', 'aria-label': 'Rule card ' + RULE.label(c) }, RULE.label(c));
    if (!locked.has(from)) draggable(b, { card: c, from }); else b.classList.add('nodrag');
    return b;
  };
  if (mode === 'rule') { vals[0] = ex[0]; vals[k] = runRules(p.ms, ex[0]); }
  if (mode === 'order') vals[0] = p.input;

  function drawPipe() {
    pipe.innerHTML = '';
    for (let i = 0; i <= k; i++) {
      const isOut = i === k;
      let cls = 'c2-val', txt = vals[i] == null ? '?' : String(vals[i]), lab = i === 0 ? 'in' : isOut ? 'out' : '';
      if (vals[i] == null) cls += ' unk';
      if (mode === 'rule' && i > 0 && i < k) { cls = 'c2-val unk'; txt = '?'; }
      if (isOut && (mode === 'in' || mode === 'order') && vals[i] == null && jam < 0) { cls = 'c2-val want'; txt = String(p.target); lab = 'we want'; }
      if (jam === i) { cls = 'c2-val jam'; txt = '✋'; lab = 'stuck'; }
      pipe.append(h('div', { class: 'c2-vcol' }, h('div', { class: 'c2-vlab' }, lab), h('div', { class: cls, 'data-v': i }, txt)));
      if (i === k) break;
      pipe.append(h('div', { class: 'c2-arr' }, '➜'));
      const isHid = hidden.includes(i);
      const pl = h('div', { class: 'c2-plate' + (isHid && !plate[i] ? ' hid' : '') + (locked.has(i) ? ' lock' : '') });
      if (plate[i]) { if (isHid) pl.append(cardEl(plate[i], i)); else pl.textContent = RULE.label(plate[i]); } else pl.textContent = '?';
      if (isHid) droppable(pl, d => put(d, i), `Machine ${i + 1}: drop a rule card here`);
      const m = h('div', { class: 'c2-mach' }, h('div', { class: 'c2-hop' }), h('div', { class: 'c2-mbody' }, h('span', { class: 'c2-gear' }, '⚙️'), pl));
      machEls[i] = m; pipe.append(m);
      pipe.append(h('div', { class: 'c2-arr' }, '➜'));
    }
  }
  function drawTray() {
    trayEl.innerHTML = '';
    tray.forEach(c => trayEl.append(cardEl(c, -1)));
    if (!tray.length) trayEl.append(h('span', { class: 'note' }, 'All the cards are on the machines.'));
  }
  function drawTable() {
    if (mode !== 'rule') return;
    tableBox.innerHTML = '';
    const full = hidden.every(i => plate[i]);
    const cols = [...ex.map(x => ({ x })), ...tests.map(x => ({ x, test: true }))];
    const t = h('table', { class: 'c2-extab' });
    t.append(h('tr', {}, h('th', {}, 'In'), cols.map(c => h('td', { class: c.test ? 'test' : '' }, String(c.x)))));
    t.append(h('tr', {}, h('th', {}, 'Out'), cols.map(c => h('td', { class: c.test ? 'test' : '' }, fmtV(runRules(p.ms, c.x))))));
    if (showDiff) t.append(h('tr', {}, h('th', {}, 'Change'), cols.map(c => { const o = runRules(p.ms, c.x); return h('td', { class: 'dif' }, o == null ? '' : (o >= c.x ? '+' : '−') + Math.abs(o - c.x)); })));
    if (full) t.append(h('tr', {}, h('th', {}, 'Your cards'), cols.map(c => { const v = runRules(plate, c.x); return h('td', { class: v === runRules(p.ms, c.x) ? 'ok' : 'no' }, fmtV(v)); })));
    tableBox.append(t);
  }
  function drawRev() {
    if (!revLevel) { rev.hidden = true; return; }
    rev.hidden = false; rev.innerHTML = '';
    rev.append(h('span', {}, 'Backwards:'));
    let v = p.target; rev.append(h('span', { class: 'rv' }, String(v)));
    for (let i = k - 1; i >= 0; i--) {
      const inv = RULE.inv(p.ms[i]); v = RULE.f(inv, v);
      rev.append(h('span', {}, '➜'), h('span', { class: 'rb' }, RULE.label(inv)), h('span', {}, '➜'), h('span', { class: 'rv' }, revLevel > 1 ? String(v) : '?'));
    }
  }
  function draw() { drawPipe(); drawTray(); drawTable(); drawRev(); }
  function put(d, i) {
    if (api.done() || busy || locked.has(i) || d.card == null) return;
    if (d.from === i) return;
    if (d.from >= 0 && locked.has(d.from)) return;
    const old = plate[i];
    if (d.from >= 0) plate[d.from] = old;
    else { const j = tray.indexOf(d.card); if (j < 0) return; tray.splice(j, 1); if (old) tray.push(old); }
    plate[i] = d.card; snd.drop(); draw(); afterPlace();
  }
  function back(d) {
    if (api.done() || busy || locked.has(d.from) || !plate[d.from]) return;
    tray.push(plate[d.from]); plate[d.from] = null; snd.pop(); draw();
  }
  async function run(x, rules) {
    if (busy) return undefined;
    busy = true; jam = -1; vals.fill(null); vals[0] = x; drawPipe(); popEl($('[data-v="0"]', pipe));
    for (let i = 0; i < k; i++) {
      await sleep(220); if (api.done()) { busy = false; return undefined; }
      machEls[i].classList.add('run'); snd.pop(); await sleep(450);
      const v = RULE.f(rules[i], vals[i]);
      if (v == null) { jam = i + 1; drawPipe(); busy = false; return null; }
      vals[i + 1] = v; drawPipe(); popEl($(`[data-v="${i + 1}"]`, pipe));
    }
    busy = false; return vals[k];
  }
  function afterPlace() {
    drawTable();
    if (!hidden.every(i => plate[i])) return;
    if (mode === 'rule') {
      const bad = ex.find(x => runRules(plate, x) !== runRules(p.ms, x));
      if (bad == null) { api.say('Every example matches!'); $$('td.ok', tableBox).forEach((td, n) => td.animate([{ transform: 'none' }, { transform: 'scale(1.3)' }, { transform: 'none' }], { duration: 400, delay: n * 90 })); winLater(api, 800); return; }
      const v = runRules(plate, bad), cards = hidden.map(i => RULE.label(plate[i])).join(' and then ');
      api.nudge(`With ${cards}, ${bad} would become ${v == null ? 'stuck' : v}. But the real machine turns ${bad} into ${runRules(p.ms, bad)}. Try a different card.`);
      const back = hidden.filter(i => !locked.has(i) && plate[i]).map(i => [i, plate[i]]);
      const bounce = () => { if (api.done()) return; if (busy) return setTimeout(bounce, 400); back.forEach(([i, c]) => { if (plate[i] === c) { plate[i] = null; tray.push(c); } }); draw(); }; setTimeout(bounce, 1600);
    } else if (mode === 'order') {
      run(p.input, plate).then(v => {
        if (v === undefined || api.done()) return;
        if (v === p.target) { api.say(`${p.input} → ${p.target}. Yes!`); winLater(api, 500); }
        else api.nudge(v == null ? 'The machines got stuck. Try another order.' : `This order turns ${p.input} into ${v}, not ${p.target}. Try swapping the machines.`);
      });
    }
  }
  function placeCorrect(only) {
    const pool = tray.concat(hidden.map(i => plate[i]).filter(Boolean));
    const todo = only != null ? [only] : hidden;
    todo.forEach(i => plate[i] = null);
    hidden.forEach(i => { if (plate[i]) { const j = pool.indexOf(plate[i]); if (j >= 0) pool.splice(j, 1); } });
    todo.forEach(i => { const j = pool.indexOf(p.ms[i]); if (j >= 0) pool.splice(j, 1); else hidden.forEach(o => { if (o !== i && plate[o] === p.ms[i]) plate[o] = null; }); plate[i] = p.ms[i]; });
    tray = pool;
  }

  if (mode === 'rule') {
    const inp = h('input', { type: 'number', min: 0, max: 99, class: 'numin', placeholder: '?', 'aria-label': 'A number to test the machine with' });
    const feed = async () => {
      if (api.done() || busy) return;
      const x = parseInt(inp.value);
      if (isNaN(x) || x < 0 || x > 99) return api.nudge('Type a number from 0 to 99 to test the machine.');
      if (!tests.includes(x) && !ex.includes(x)) { tests.push(x); if (tests.length > 3) tests.shift(); }
      const o = await run(x, p.ms); if (o === undefined) return; drawTable();
      api.say(o == null ? `The machine got stuck on ${x}!` : `${x} went in and ${o} came out.`);
    };
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') feed(); });
    draw();
    st.append(pipe, tableBox, h('div', { class: 'c2-row' },
      h('div', { class: 'c2-feed' }, h('span', { class: 'asklabel' }, 'Test it:'), inp, h('button', { class: 'btn', onclick: feed }, 'Feed it in ▶')),
      h('div', { class: 'c2-col' }, trayEl, h('div', { class: 'note' }, 'Drag a rule card onto the ? on the machine.'))));
    return {
      hint(l) { if (l >= 2) { if (hidden.length === 1) { showDiff = true; drawTable(); } else if (!locked.has(hidden[0])) { placeCorrect(hidden[0]); locked.add(hidden[0]); draw(); } } },
      solve() { placeCorrect(); draw(); afterPlace(); },
    };
  }
  if (mode === 'order') {
    draw();
    st.append(pipe, trayEl, h('div', { class: 'note' }, 'Drag the machine cards onto the machines. Drag one onto another to swap.'));
    return {
      hint(l) { if (l >= 2 && !locked.has(0)) { placeCorrect(0); locked.add(0); draw(); afterPlace(); } },
      solve() { placeCorrect(); draw(); afterPlace(); },
    };
  }
  /* mode 'in': find the input */
  const ans = machineInput(p);
  const ask = numAsk(api, { label: 'What number should go in?', answer: ans, max: 999,
    onRight: n => { run(n, p.ms).then(v => { if (v !== undefined) winLater(api, 400); else if (!api.done()) setTimeout(() => api.win(), 900); }); },
    wrong: n => {
      run(n, p.ms);
      let v = n, i = 0; for (; i < k; i++) { const nv = RULE.f(p.ms[i], v); if (nv == null) break; v = nv; }
      if (i < k) return `When ${n} goes in, the machine gets stuck: ${RULE.stuck(p.ms[i], v)}. Try another number.`;
      return `${n} goes in and ${v} comes out. We want ${p.target}, so try a ${v > p.target ? 'smaller' : 'bigger'} number.`;
    } });
  draw();
  st.append(pipe, rev, ask);
  return {
    hint(l) { if (l >= 2) { revLevel = l > (p.hints || []).length ? 2 : 1; drawRev(); } },
    solve() { ask.set(ans); revLevel = 2; drawRev(); run(ans, p.ms).then(() => winLater(api, 400)); },
  };
};

/* ================================================================ 2. coins */
function minCoins(types, T) { const dp = [0]; for (let t = 1; t <= T; t++) { dp[t] = Infinity; for (const c of types) if (c <= t && dp[t - c] + 1 < dp[t]) dp[t] = dp[t - c] + 1; } return dp[T]; }
function minCoinSet(types, T) {
  const ts = types.slice().sort((a, b) => b - a), out = []; let t = T;
  while (t > 0) { const best = minCoins(ts, t); const c = ts.find(c => c <= t && minCoins(ts, t - c) === best - 1); out.push(c); t -= c; }
  return out;
}
function coinWays(types, T) {
  const ts = types.slice().sort((a, b) => b - a), out = [];
  const rec = (i, left, acc) => {
    if (i === ts.length - 1) { if (left % ts[i] === 0) out.push([...acc, left / ts[i]]); return; }
    for (let n = Math.floor(left / ts[i]); n >= 0; n--) rec(i + 1, left - n * ts[i], [...acc, n]);
  };
  rec(0, T, []); return out;
}
function subsetFor(vals, T) { // indices of a subset with sum T, using the fewest coins
  let best = null;
  for (let m = 0; m < (1 << vals.length); m++) { let s = 0, n = 0; vals.forEach((v, i) => { if (m >> i & 1) { s += v; n++; } }); if (s === T && (!best || n < best.n)) best = { m, n }; }
  return best ? vals.map((_, i) => (best.m >> i) & 1 ? i : -1).filter(i => i >= 0) : null;
}
const coinEl = (v, sm) => h('span', { class: `c2-coin v${v}${sm ? ' sm' : ''}` }, String(v));

R.coins = (st, p, api) => (p.mode === 'ways' || p.mode === 'exact') ? coinSteps(st, p, api) : coinDrag(st, p, api);

function coinDrag(st, p, api) {
  const mode = p.mode, T = p.target, unlimited = !p.wallet;
  let uid = 0; const coins = (p.wallet || []).map(v => ({ v, id: uid++, at: 'bank' }));
  const best = mode === 'fewest' ? minCoins(p.types, T) : 0;
  const pileNames = mode === 'split' ? ['L', 'R'] : ['C'];
  const bankEl = h('div', { class: 'c2-mat c2-purse' });
  droppable(bankEl, d => moveTo(d, 'bank'), unlimited ? 'The coin bank: drop a coin here to take it back' : 'Your purse: drop a coin here to take it back');
  const pileEl = {}, pileBox = {}, pileHead = {};
  pileNames.forEach(k => {
    pileHead[k] = h('div', { class: 'c2-mlab' });
    pileBox[k] = h('div', { class: 'coins' });
    pileEl[k] = mode === 'split' ? h('div', { class: 'c2-pile' }, h('div', { class: 'c2-itemem' }, k === 'L' ? '🏴‍☠️' : '🦜'), pileHead[k], pileBox[k]) : h('div', { class: 'c2-mat c2-counter' }, pileHead[k], pileBox[k]);
    droppable(pileEl[k], d => moveTo(d, k), mode === 'split' ? (k === 'L' ? 'Pirate Pete’s pile' : 'Pirate Polly’s pile') : 'The shop counter');
  });
  const at = k => coins.filter(c => c.at === k);
  const sumAt = k => sumOf(at(k).map(c => c.v));
  const status = h('div', { class: 'c2-status' });
  function coinBtn(c) { const b = h('button', { class: `c2-coin v${c.v}`, 'aria-label': `Coin worth ${c.v}` }, String(c.v)); draggable(b, { id: c.id }); return b; }
  function draw() {
    bankEl.innerHTML = '';
    bankEl.append(h('div', { class: 'c2-mlab' }, unlimited ? 'Coin bank (take as many as you like)' : mode === 'split' ? 'Coins to share' : 'Your purse'));
    if (unlimited) p.types.forEach(v => { const b = h('button', { class: `c2-coin v${v}`, 'aria-label': `A new coin worth ${v}` }, String(v)); draggable(b, { tpl: v }); bankEl.append(b); });
    else { at('bank').forEach(c => bankEl.append(coinBtn(c))); if (!at('bank').length) bankEl.append(h('span', { class: 'note' }, 'Empty!')); }
    pileNames.forEach(k => {
      pileBox[k].innerHTML = ''; at(k).forEach(c => pileBox[k].append(coinBtn(c)));
      const s = sumAt(k), n = at(k).length;
      pileHead[k].innerHTML = mode === 'split' ? `${k === 'L' ? 'Pirate Pete' : 'Pirate Polly'} gets <b class="c2-big">${s}</b>` : `On the counter: <b class="c2-big">${s}</b> ${mode === 'fewest' ? `<span class="note">(${plural(n, 'coin')})</span>` : ''}`;
      if (!n) pileBox[k].append(h('span', { class: 'note' }, mode === 'split' ? 'Drop coins here' : 'Drop coins here to pay'));
    });
  }
  function moveTo(d, where) {
    if (api.done()) return;
    if (d.tpl != null) { if (where === 'bank') return; coins.push({ v: d.tpl, id: uid++, at: where }); }
    else if (d.id != null) {
      const c = coins.find(x => x.id === d.id); if (!c || c.at === where) return;
      if (unlimited && where === 'bank') coins.splice(coins.indexOf(c), 1); else c.at = where;
    } else return;
    where === 'bank' ? snd.bloop() : snd.drop(); draw(); check();
  }
  function check() {
    if (mode === 'split') {
      const L = sumAt('L'), Rr = sumAt('R'), left = at('bank').length;
      if (left) { status.textContent = `${plural(left, 'coin')} still to share.`; return; }
      if (L === Rr) { status.textContent = `${L} and ${Rr}. Fair!`; winLater(api, 500); }
      else { status.textContent = `${L} and ${Rr}`; api.nudge(`Pete gets ${L} and Polly gets ${Rr}. That is not fair yet. Move a coin from one pile to the other.`); }
      return;
    }
    const s = sumAt('C'), n = at('C').length;
    status.textContent = s < T ? `${T - s} more to pay.` : s === T ? 'Exactly right!' : `That is ${s - T} too much.`;
    if (s > T) return api.nudge(`That is ${s}. It is more than ${T}! Drag a coin back.`);
    if (s < T) return;
    if (mode === 'fewest' && n > best) return api.nudge(`Yes, that makes ${T}! You used ${n} coins. Can you pay ${T} with fewer coins? Swap some small coins for a bigger one.`);
    winLater(api, 500);
  }
  if (mode === 'split') st.append(h('div', { class: 'c2-piles' }, pileEl.L, pileEl.R), status, bankEl);
  else st.append(h('div', { class: 'c2-shop' }, h('span', { class: 'c2-itemem' }, p.item), h('span', {}, p.itemName), h('span', { class: 'c2-tag' }, `costs ${T}`)), pileEl.C, status, bankEl);
  st.append(h('div', { class: 'note' }, 'Drag coins, or click a coin and then click where it goes. Drag a coin back to take it off.'));
  draw(); check();
  return {
    async solve() {
      coins.forEach(c => { c.at = 'bank'; });
      if (unlimited) coins.length = 0;
      draw(); await sleep(300);
      if (mode === 'fewest') { for (const v of minCoinSet(p.types, T)) { coins.push({ v, id: uid++, at: 'C' }); snd.drop(); draw(); await sleep(250); } }
      else if (mode === 'pay') { for (const i of subsetFor(coins.map(c => c.v), T)) { coins[i].at = 'C'; snd.drop(); draw(); await sleep(250); } }
      else { const half = sumOf(coins.map(c => c.v)) / 2; const L = subsetFor(coins.map(c => c.v), half); for (const c of coins) { c.at = L.includes(c.id) ? 'L' : 'R'; snd.drop(); draw(); await sleep(200); } }
      if (!api.done()) check();
    },
  };
}

function coinSteps(st, p, api) {
  const types = p.types.slice().sort((a, b) => b - a), T = p.target;
  const cnt = types.map(() => 0);
  const all = p.mode === 'ways' ? coinWays(types, T).map(w => w.join(',')) : [];
  const found = []; let lastNew = null, ghosts = false;
  const total = () => sumOf(cnt.map((n, i) => n * types[i]));
  const count = () => sumOf(cnt);
  const rowsEl = h('div', { class: 'c2-steps' });
  const sumEl = h('div', { class: 'c2-status' });
  const listBox = h('div', { class: 'c2-waysbox' });
  const maxOf = i => p.mode === 'exact' ? p.count : Math.floor(T / types[i]);
  function draw() {
    rowsEl.innerHTML = '';
    types.forEach((v, i) => {
      const strip = h('div', { class: 'strip' }); range(cnt[i]).forEach(() => strip.append(coinEl(v, true)));
      rowsEl.append(h('div', { class: 'c2-step' }, coinEl(v), h('button', { class: 'btn alt sq', 'aria-label': `One less ${v}-coin`, onclick: () => bump(i, -1) }, '−'), h('span', { class: 'cnt', 'aria-label': `${cnt[i]} coins of ${v}` }, String(cnt[i])), h('button', { class: 'btn alt sq', 'aria-label': `One more ${v}-coin`, onclick: () => bump(i, 1) }, '+'), strip));
    });
    sumEl.innerHTML = p.mode === 'exact' ? `Coins: <b>${count()}</b> of ${p.count} &nbsp;·&nbsp; Total: <b>${total()}</b> of ${T}` : `Total: <b>${total()}</b> ${total() === T ? '✓' : `(we want ${T})`}`;
  }
  function drawList() {
    if (p.mode !== 'ways') return;
    listBox.innerHTML = '';
    const t = h('table', { class: 'c2-ways' }, h('tr', {}, types.map(v => h('th', {}, coinEl(v, true))), h('th', {}, '')));
    const rows = all.filter(w => found.includes(w) || ghosts);
    rows.forEach(w => {
      const have = found.includes(w), c = w.split(',');
      t.append(h('tr', { class: have ? (w === lastNew ? 'new' : '') : 'ghost' }, c.map((x, i) => h('td', {}, have || i === 0 ? x : '?')), h('td', {}, have ? '✓' : '')));
    });
    if (!rows.length) t.append(h('tr', {}, h('td', { colspan: types.length + 1, class: 'note' }, 'Your ways go here.')));
    listBox.append(h('div', { class: 'c2-mlab' }, `Ways found: ${found.length}`), t);
    const nr = $('tr.new', t); if (nr) nr.scrollIntoView({ block: 'nearest' });
  }
  function bump(i, d) {
    if (api.done()) return;
    const nv = cnt[i] + d; if (nv < 0) return;
    if (nv > maxOf(i)) return api.nudge(p.mode === 'exact' ? `The pirate has only ${p.count} coins.` : `${nv} coins of ${types[i]} would be more than ${T}.`);
    cnt[i] = nv; snd.pop(); draw();
    if (p.mode === 'exact') checkExact();
  }
  function checkExact() {
    if (count() === p.count && total() === T) { api.say(`${p.count} coins, and they make ${T}!`); winLater(api, 500); }
    else if (count() === p.count) api.nudge(`That is ${p.count} coins, but they make ${total()}, not ${T}. ${total() < T ? 'Swap a 2 for a 5.' : 'Swap a 5 for a 2.'}`);
  }
  function add() {
    if (api.done()) return;
    const s = total();
    if (s !== T) return api.nudge(s < T ? `These coins make ${s}. You need ${T - s} more to make ${T}.` : `These coins make ${s}. That is more than ${T}.`);
    const key = cnt.join(',');
    if (found.includes(key)) return api.nudge('That way is already on your list. Try a different mix of coins.');
    found.push(key); lastNew = key; snd.good(); drawList();
    if (found.length === all.length) { api.say('That is every way!'); winLater(api, 700); }
    else api.say(`Added! You have ${plural(found.length, 'way')} so far.`);
  }
  draw();
  if (p.mode === 'ways') {
    drawList();
    st.append(h('div', { class: 'c2-row', style: { alignItems: 'flex-start' } }, h('div', { class: 'c2-col' }, rowsEl, sumEl, h('button', { class: 'btn coral big', onclick: add }, '➕ Add this way to my list')), listBox));
  } else st.append(rowsEl, sumEl);
  return {
    hint(l) { if (l >= 2 && p.mode === 'ways') { ghosts = true; drawList(); } },
    async solve() {
      if (p.mode === 'exact') { const a = (T - 2 * p.count) / 3; cnt[0] = a; cnt[1] = p.count - a; draw(); checkExact(); return; }
      for (const w of all) { if (found.includes(w) || api.done()) continue; w.split(',').forEach((x, i) => cnt[i] = +x); draw(); found.push(w); lastNew = w; drawList(); snd.pop(); await sleep(220); }
      if (!api.done()) winLater(api, 400);
    },
  };
}

/* ================================================================ 3. clocks and calendars */
const fmtT = t => { const m = mod(t, 720); return `${Math.floor(m / 60) || 12}:${String(m % 60).padStart(2, '0')}`; };
const durTxt = d => { const a = Math.abs(d), hh = Math.floor(a / 60), mm = a % 60; return [hh ? plural(hh, 'hour') : '', mm || !hh ? plural(mm, 'minute') : ''].filter(Boolean).join(' '); };
function clockFace(small) {
  let s = '<svg viewBox="0 0 200 200" aria-hidden="true">';
  s += '<circle cx="100" cy="100" r="95" fill="#fff" stroke="#2b7f99" stroke-width="7"/>';
  for (let i = 0; i < 60; i++) { const a = i * 6 * Math.PI / 180, r1 = i % 5 ? 84 : 78; s += `<line x1="${(100 + 89 * Math.sin(a)).toFixed(1)}" y1="${(100 - 89 * Math.cos(a)).toFixed(1)}" x2="${(100 + r1 * Math.sin(a)).toFixed(1)}" y2="${(100 - r1 * Math.cos(a)).toFixed(1)}" stroke="#14365a" stroke-width="${i % 5 ? 1.4 : 3.2}"/>`; }
  for (let i = 1; i <= 12; i++) { const a = i * 30 * Math.PI / 180; s += `<text x="${(100 + 64 * Math.sin(a)).toFixed(1)}" y="${(100 - 64 * Math.cos(a) + 8).toFixed(1)}" text-anchor="middle" font-size="${small ? 24 : 22}" font-weight="700" fill="#14365a" font-family="Fredoka, sans-serif">${i}</text>`; }
  s += '<g class="c2-ghost" style="display:none" opacity=".35"><line class="gh" x1="100" y1="100" x2="100" y2="54" stroke="#ef6a4a" stroke-width="9" stroke-linecap="round"/><line class="gm" x1="100" y1="100" x2="100" y2="26" stroke="#ef6a4a" stroke-width="6" stroke-linecap="round"/></g>';
  s += '<g class="c2-hand c2-hh" data-hand="h"><line x1="100" y1="100" x2="100" y2="54" stroke="transparent" stroke-width="28"/><line x1="100" y1="106" x2="100" y2="54" stroke="#14365a" stroke-width="9" stroke-linecap="round"/><circle cx="100" cy="58" r="8" fill="#14365a"/></g>';
  s += '<g class="c2-hand c2-mh" data-hand="m"><line x1="100" y1="100" x2="100" y2="22" stroke="transparent" stroke-width="26"/><line x1="100" y1="110" x2="100" y2="24" stroke="#0d8496" stroke-width="6" stroke-linecap="round"/><circle cx="100" cy="28" r="9" fill="#ef6a4a"/></g>';
  s += '<circle cx="100" cy="100" r="7" fill="#ef6a4a"/></svg>';
  return s;
}
function setHands(root, t) {
  const m = mod(t, 720);
  $('.c2-hh', root).setAttribute('transform', `rotate(${m / 2} 100 100)`);
  $('.c2-mh', root).setAttribute('transform', `rotate(${(m % 60) * 6} 100 100)`);
}
function staticClock(t, label) { const d = h('div', { class: 'c2-minic' }, h('div', { html: clockFace(true) }), h('span', {}, label)); $$('.c2-hand', d).forEach(g => g.classList.remove('c2-hand')); setHands(d, t); return d; }

R.clock = (st, p, api) => {
  let t = p.start, drag = null, busy = false;
  const target = p.mode === 'go' ? p.start + p.add : p.end;
  const box = h('div', { class: 'c2-clock', html: clockFace(), role: 'img', 'aria-label': 'A clock. Drag the hands to change the time.' });
  const svg = $('svg', box);
  const digi = h('div', { class: 'c2-digi', 'aria-live': 'polite' });
  const ela = h('div', { class: 'c2-ela' });
  function draw() {
    setHands(box, t); digi.textContent = fmtT(t);
    const d = t - p.start;
    ela.innerHTML = d === 0 ? `This is the start time.<br><span class="note">Turn the hands forward.</span>` : d > 0 ? `<b>${durTxt(d)}</b> after ${fmtT(p.start)}${d >= 60 && d % 60 ? `<br><span class="note">(${d} minutes)</span>` : ''}` : `<b>${durTxt(d)}</b> <i>before</i> ${fmtT(p.start)}`;
  }
  function change(dlt) { if (!dlt || api.done() || busy) return; t += dlt; snd.pop(); draw(); }
  svg.addEventListener('pointerdown', e => {
    const g = e.target.closest('[data-hand]'); if (!g || api.done() || busy) return;
    drag = g.dataset.hand; svg.setPointerCapture(e.pointerId); document.body.classList.add('c2-turning'); e.preventDefault();
  });
  svg.addEventListener('pointermove', e => {
    if (!drag) return;
    const r = svg.getBoundingClientRect(); const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
    let ang = Math.atan2(x, -y) * 180 / Math.PI; if (ang < 0) ang += 360;
    if (drag === 'm') { const mNew = (Math.round(ang / 30) * 5) % 60; let dl = mNew - mod(t, 60); if (dl > 30) dl -= 60; if (dl < -30) dl += 60; change(dl); }
    else { const hn = mod(Math.round(ang / 30 - mod(t, 60) / 60), 12), h0 = Math.floor(mod(t, 720) / 60); let dl = hn - h0; if (dl > 6) dl -= 12; if (dl < -6) dl += 12; change(dl * 60); }
  });
  const stop = () => { drag = null; document.body.classList.remove('c2-turning'); };
  svg.addEventListener('pointerup', stop); svg.addEventListener('pointercancel', stop);
  const btns = h('div', { class: 'c2-tbtns' },
    h('button', { class: 'btn alt', onclick: () => change(-60) }, '◀ 1 hour'), h('button', { class: 'btn alt', onclick: () => change(60) }, '1 hour ▶'),
    h('button', { class: 'btn alt', onclick: () => change(-5) }, '◀ 5 min'), h('button', { class: 'btn alt', onclick: () => change(5) }, '5 min ▶'));
  const side = h('div', { class: 'c2-side' }, h('div', { class: 'note' }, `Starts at ${fmtT(p.start)}`), digi, ela, btns);
  const showGhost = () => { const g = $('.c2-ghost', box); g.style.display = ''; const m = mod(target, 720); $('.gh', g).setAttribute('transform', `rotate(${m / 2} 100 100)`); $('.gm', g).setAttribute('transform', `rotate(${(m % 60) * 6} 100 100)`); };
  let ask = null;
  if (p.mode === 'go') {
    api.button('✅ Check', () => {
      if (busy) return;
      if (mod(t, 720) === mod(target, 720)) { api.say(`${fmtT(t)}. Yes!`); winLater(api, 400); return; }
      const d = t - p.start;
      api.nudge(d <= 0 ? `Your clock shows ${fmtT(t)}. That is not after ${fmtT(p.start)} yet. Turn the hands forward (clockwise).` : `Your clock shows ${fmtT(t)}. That is ${durTxt(d)} after ${fmtT(p.start)}, but we need ${durTxt(p.add)}.`);
    });
    st.append(h('div', { class: 'c2-row' }, box, side));
  } else {
    const whole = 60 * Math.floor((target - p.start) / 60);
    ask = numAsk(api, { label: 'How many minutes is that?', answer: target - p.start, wrong: n => whole && n === whole ? 'Not quite. Check the extra minutes after the whole hour.' : `Not ${n}. Turn the clock from ${fmtT(p.start)} to ${fmtT(p.end)} and watch the minutes add up.` });
    st.append(h('div', { class: 'c2-row' }, box, side, staticClock(p.end, `Ends at ${fmtT(p.end)}`)), ask);
  }
  st.append(h('div', { class: 'note' }, 'Drag the long minute hand or the short hour hand, or use the buttons.'));
  draw();
  return {
    hint(l) { if (l > (p.hints || []).length) showGhost(); },
    async solve() {
      busy = true; showGhost();
      while (t !== target && !api.done()) { const step = Math.abs(target - t) >= 60 ? 60 : 5; t += Math.sign(target - t) * step; draw(); snd.pop(); await sleep(step === 60 ? 260 : 110); }
      busy = false; if (ask) ask.set(target - p.start);
      if (!api.done()) winLater(api, 400);
    },
  };
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
R.week = (st, p, api) => {
  let pos = p.start, moved = 0, busy = false;
  const target = mod(p.start + p.n, 7);
  const ring = h('div', { class: 'c2-ring' });
  const mid = h('div', { class: 'c2-ringmid' });
  const dayEls = DAYS.map((d, i) => {
    const a = (i / 7) * 2 * Math.PI;
    const b = h('button', { class: 'c2-day', style: { left: (165 + 128 * Math.sin(a)) + 'px', top: (165 - 128 * Math.cos(a)) + 'px' }, onclick: () => answer(i) });
    ring.append(b); return b;
  });
  ring.append(mid);
  const dateOf = () => p.date + moved;
  function draw() {
    dayEls.forEach((b, i) => {
      b.className = 'c2-day' + (i === pos ? ' on' : '') + (i === p.start ? ' start' : '');
      const sub = i === pos ? (p.date ? `the ${ord(dateOf())}` : moved ? (moved > 0 ? `+${moved}` : String(moved)) : 'today') : i === p.start ? (p.date ? '' : 'today') : '';
      b.innerHTML = ''; b.append(DAYS[i].slice(0, 3), h('small', {}, sub));
      b.setAttribute('aria-label', DAYS[i] + (i === pos ? ', Finn is here' : '') + '. Click to choose it as your answer.');
    });
    mid.innerHTML = '';
    mid.append(h('div', { html: sharkSVG() }), h('div', { class: 'c2-big' }, moved === 0 ? (p.date ? `the ${ord(p.date)}` : 'Today') : `${moved > 0 ? '+' : '−'}${plural(Math.abs(moved), 'day')}`));
    if (p.date && moved) mid.append(h('div', { class: 'note' }, `the ${ord(dateOf())}`));
  }
  async function hop(d) {
    if (api.done() || busy) return;
    busy = true; const step = Math.sign(d);
    for (let i = 0; i < Math.abs(d); i++) { pos = mod(pos + step, 7); moved += step; draw(); snd.pop(); await sleep(Math.abs(d) > 1 ? 70 : 10); }
    busy = false;
  }
  function answer(i) {
    if (api.done() || busy) return;
    if (i === target) { dayEls[i].classList.add('ok'); snd.good(); winLater(api, 500); return; }
    shakeEl(dayEls[i]);
    const N = Math.abs(p.n), w = Math.floor(N / 7), r = N % 7;
    api.nudge(N < 7 ? `Not ${DAYS[i]}. Count the days one by one with the hop buttons.` : `Not ${DAYS[i]}. ${N} days is ${plural(w, 'week')}${r ? ` and ${plural(r, 'more day')}` : ''}. A whole week brings you back to the same day.`);
  }
  const hops = h('div', { class: 'c2-hops' },
    h('button', { class: 'btn alt', onclick: () => hop(-7) }, '⏪ 7 days'), h('button', { class: 'btn alt', onclick: () => hop(7) }, '7 days ⏩'),
    h('button', { class: 'btn alt', onclick: () => hop(-1) }, '◀ 1 day'), h('button', { class: 'btn alt', onclick: () => hop(1) }, '1 day ▶'));
  const reset = h('button', { class: 'btn alt', onclick: () => { if (busy || api.done()) return; pos = p.start; moved = 0; snd.bloop(); draw(); } }, '↺ Back to the start');
  st.append(h('div', { class: 'c2-row' }, ring, h('div', { class: 'c2-side' }, h('div', { class: 'asklabel' }, 'Hop Finn around the week.'), hops, reset, h('div', { class: 'note' }, 'When you know the answer, click that day on the ring.'))));
  draw();
  return {
    async solve() {
      if (busy) return; pos = p.start; moved = 0; draw(); await sleep(300);
      const N = Math.abs(p.n), sg = Math.sign(p.n);
      for (let i = 0; i < Math.floor(N / 7); i++) { await hop(7 * sg); await sleep(200); if (api.done()) return; }
      for (let i = 0; i < N % 7; i++) { await hop(sg); await sleep(250); if (api.done()) return; }
      answer(target);
    },
  };
};

R.month = (st, p, api) => {
  const marks = new Set(); let tint = false;
  const grid = h('div', { class: 'c2-month', role: 'group', 'aria-label': 'A calendar for the month' });
  const count = h('div', { class: 'c2-status' });
  function draw() {
    grid.innerHTML = '';
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(d => grid.append(h('div', { class: 'hd' }, d)));
    for (let i = 0; i < p.first; i++) grid.append(h('div'));
    for (let d = 1; d <= p.days; d++) {
      const tc = !tint ? '' : (d === p.days && d % 2) ? ' t3' : ' t' + (Math.ceil(d / 2) % 2 + 1);
      grid.append(h('button', { class: 'c2-mday' + (marks.has(d) ? ' on' : '') + tc, 'aria-pressed': marks.has(d) ? 'true' : 'false', 'aria-label': `${p.monthName} ${ord(d)}`, onclick: () => { if (api.done()) return; marks.has(d) ? marks.delete(d) : marks.add(d); snd.pop(); draw(); } }, String(d)));
    }
    count.innerHTML = `Marked days: <b>${marks.size}</b>`;
  }
  const ask = numAsk(api, { label: p.ask, answer: p.answer, wrong: n => n === p.answer - 1 ? 'So close! Look at the very last day of the month.' : n === p.days ? 'That is every day of the month! Only the odd dates count.' : `Not ${n}. Try marking the odd dates and counting them, or pair the days up.` });
  draw();
  st.append(h('div', { class: 'c2-row' }, h('div', { class: 'c2-col' }, h('div', { class: 'asklabel' }, p.monthName), grid), h('div', { class: 'c2-col' }, count, ask)));
  return {
    hint(l) { if (l >= 2) { tint = true; draw(); } },
    async solve() { for (let d = 1; d <= p.days; d++) if (p.mark(d) && !marks.has(d)) { marks.add(d); draw(); await sleep(60); } ask.set(p.answer); if (!api.done()) winLater(api, 400); },
  };
};

/* ================================================================ 4. venn diagrams */
const VW = 600, VH = 312, VR = 112, VCY = 168, VCA = 230, VCB = 370;
const VSLOT = (() => {
  const A = [[165, 168], [216, 168], [186, 113], [186, 223], [236, 98], [236, 238]];
  return { A, B: A.map(([x, y]) => [VW - x, y]), AB: [[300, 120], [300, 170], [300, 220]],
    N: [[40, 48], [40, 108], [40, 168], [40, 228], [40, 286], [560, 48], [560, 108], [560, 168], [560, 228], [560, 286], [104, 290], [496, 290]] };
})();
const VCOL = { A: '#e2583e', B: '#8a63d2' };
function vennSVG() {
  const k = Math.sqrt(VR * VR - 70 * 70), P1 = `300 ${(VCY - k).toFixed(2)}`, P2 = `300 ${(VCY + k).toFixed(2)}`, r = `${VR} ${VR}`;
  const lens = `M${P1} A${r} 0 0 1 ${P2} A${r} 0 0 1 ${P1}Z`;
  const onlyA = `M${P1} A${r} 0 1 0 ${P2} A${r} 0 0 1 ${P1}Z`;
  const onlyB = `M${P1} A${r} 0 1 1 ${P2} A${r} 0 0 0 ${P1}Z`;
  const union = `M${P1} A${r} 0 1 0 ${P2} A${r} 0 1 0 ${P1}Z`;
  return `<svg width="${VW}" height="${VH}" viewBox="0 0 ${VW} ${VH}">
    <path class="rg" data-r="N" d="M4 4 H${VW - 4} V${VH - 4} H4 Z ${union}" fill="#f2fafc" fill-rule="evenodd" stroke="#bcdde6" stroke-width="3"/>
    <path class="rg" data-r="A" d="${onlyA}" fill="rgba(226,88,62,.18)"/>
    <path class="rg" data-r="B" d="${onlyB}" fill="rgba(138,99,210,.18)"/>
    <path class="rg" data-r="AB" d="${lens}" fill="rgba(190,80,150,.30)"/>
    <circle cx="${VCA}" cy="${VCY}" r="${VR}" fill="none" stroke="${VCOL.A}" stroke-width="4" pointer-events="none"/>
    <circle cx="${VCB}" cy="${VCY}" r="${VR}" fill="none" stroke="${VCOL.B}" stroke-width="4" pointer-events="none"/></svg>`;
}
let fishClip = 0;
function vfishSVG(o) {
  const c = FISHC[o.c] || o.c, w = o.big ? 50 : 32, id = 'c2fc' + (fishClip++);
  const body = 'M12 20 L0 6 L2 20 L0 34 Z M32 6 C44 6 54 12 54 20 C54 28 44 34 32 34 C20 34 10 28 10 20 C10 12 20 6 32 6 Z';
  return `<svg viewBox="0 0 60 40" width="${w}" height="${(w * .67).toFixed(1)}" aria-hidden="true"><defs><clipPath id="${id}"><path d="${body}"/></clipPath></defs>
    <path d="${body}" fill="${c}"/>
    ${o.st ? `<g clip-path="url(#${id})" fill="#1d2b3a" opacity=".55"><rect x="20" y="0" width="5" height="40"/><rect x="31" y="0" width="5" height="40"/></g>` : ''}
    ${o.sp ? '<g fill="#fff"><circle cx="24" cy="14" r="2.8"/><circle cx="32" cy="25" r="2.8"/><circle cx="20" cy="25" r="2.2"/><circle cx="38" cy="13" r="2.2"/></g>' : ''}
    <circle cx="45" cy="17" r="3.6" fill="#fff"/><circle cx="46" cy="17" r="1.9" fill="#123"/><path d="M49 25 q3 1 5 -1" stroke="#123" stroke-width="1.4" fill="none"/></svg>`;
}
const vRegion = (p, it) => { const a = p.A.f(it), b = p.B.f(it); return a && b ? 'AB' : a ? 'A' : b ? 'B' : 'N'; };
const vName = it => it.n != null ? String(it.n) : 'this fish';

R.venn = (st, p, api) => {
  const mode = p.mode || 'sort';
  const wrap = h('div', { class: 'c2-venn', style: { width: VW + 'px', height: VH + 'px' } });
  wrap.innerHTML = vennSVG();
  const regs = {}; ['N', 'A', 'B', 'AB'].forEach(r => { regs[r] = $(`[data-r="${r}"]`, wrap); });
  const REGTXT = { A: `inside the ${p.A.col || 'red'} circle only`, B: `inside the ${p.B.col || 'purple'} circle only`, AB: 'in the middle, where the circles overlap', N: 'outside both circles' };
  const lblA = h('div', { class: 'c2-vlbl', style: { left: (VCA - 46) + 'px', top: '26px', background: VCOL.A, color: VCOL.A } });
  const lblB = h('div', { class: 'c2-vlbl', style: { left: (VCB + 46) + 'px', top: '26px', background: VCOL.B, color: VCOL.B } });
  if (mode === 'count') { lblA.style.color = lblB.style.color = '#fff'; lblA.textContent = `${p.A.t}: ${p.A.n}`; lblB.textContent = `${p.B.t}: ${p.B.n}`; }
  else if (mode === 'sort') { lblA.style.color = lblB.style.color = '#fff'; lblA.textContent = p.A.t; lblB.textContent = p.B.t; }
  wrap.append(lblA, lblB);
  const layer = h('div'); wrap.append(layer);
  if (mode === 'count') return vennCount(st, p, api, wrap);

  const items = p.items.map((it, i) => ({ ...it, i, at: null }));
  if (mode === 'labels') items.forEach(it => it.at = vRegion(p, it));
  function tok(it, placed, x, y) {
    const b = h('button', { class: 'c2-vtok' + (it.n != null ? ' num' : '') + (placed ? ' placed' : ''), 'aria-label': it.n != null ? 'Number ' + it.n : 'a fish' });
    if (it.n != null) b.textContent = String(it.n); else b.innerHTML = vfishSVG(it);
    if (placed) { b.style.left = x + 'px'; b.style.top = y + 'px'; b.tabIndex = -1; } else draggable(b, { i: it.i });
    return b;
  }
  const tray = h('div', { class: 'c2-vtray' });
  let glowFor = null;
  function draw() {
    layer.innerHTML = '';
    const used = { A: 0, B: 0, AB: 0, N: 0 };
    items.forEach(it => { if (!it.at) return; const s = VSLOT[it.at][used[it.at]++ % VSLOT[it.at].length]; layer.append(tok(it, true, s[0], s[1])); });
    if (mode === 'sort') {
      tray.innerHTML = '';
      const left = items.filter(it => !it.at); left.forEach(it => tray.append(tok(it, false)));
      if (!left.length) tray.append(h('span', { class: 'note' }, 'All sorted!'));
      Object.entries(regs).forEach(([r, el]) => el.classList.toggle('c2-hl', glowFor != null && !items[glowFor].at && vRegion(p, items[glowFor]) === r));
    }
  }
  const facts = it => `${it.n != null ? it.n : 'This fish'} ${p.A.f(it) ? p.A.yes : p.A.no}, and ${p.B.f(it) ? p.B.yes : p.B.no}`;
  function drop(d, r) {
    if (api.done() || d.i == null) return;
    const it = items[d.i]; if (it.at) return;
    const truth = vRegion(p, it);
    if (r === truth) {
      it.at = r; snd.good(); draw();
      if (items.every(x => x.at)) { api.say('All sorted!'); winLater(api, 600); }
      else api.say(`${pick(['Yes!', 'Right!', 'Good thinking!'])} ${facts(it)}. So it goes ${REGTXT[r]}.`);
    } else {
      api.nudge(`Not there. ${facts(it)}. Where does that go?`);
      const el = $$('.c2-vtray .c2-vtok', st).find(b => b._dd && b._dd.i === d.i); shakeEl(el);
    }
  }
  if (mode === 'sort') {
    Object.entries(regs).forEach(([r, el]) => droppable(el, d => drop(d, r), r === 'N' ? 'Outside both circles' : r === 'AB' ? 'The middle, inside both circles' : r === 'A' ? `Inside the ${p.A.t} circle only` : `Inside the ${p.B.t} circle only`));
    draw();
    st.append(wrap, tray, h('div', { class: 'note' }, 'Drag each one to its place. Or click it, then click the place.'));
    return {
      hint(l) { if (l >= 2) { const it = items.find(x => !x.at); if (it) { glowFor = it.i; draw(); } } },
      async solve() { for (const it of items) { if (it.at || api.done()) continue; it.at = vRegion(p, it); draw(); snd.pop(); await sleep(160); } if (!api.done()) winLater(api, 400); },
    };
  }
  /* mode 'labels': find the labels */
  const slot = { A: null, B: null };
  const inSide = (it, s) => s === 'A' ? (it.at === 'A' || it.at === 'AB') : (it.at === 'B' || it.at === 'AB');
  const fits = (card, s) => items.every(it => inSide(it, s) === card.f(it));
  const cardsTray = h('div', { class: 'c2-vtray' });
  droppable(cardsTray, d => { if (d.from && !api.done()) { slot[d.from] = null; snd.pop(); drawLabels(); } }, 'Label tray');
  const cardBtn = (ci, from) => { const b = h('button', { class: 'c2-lcard', 'aria-label': 'Label: ' + p.cards[ci].t }, p.cards[ci].t); draggable(b, { ci, from }); return b; };
  function drawLabels() {
    [['A', lblA], ['B', lblB]].forEach(([s, el]) => {
      el.className = 'c2-vlbl slot' + (slot[s] != null ? ' filled' : ''); el.innerHTML = '';
      if (slot[s] != null) el.append(cardBtn(slot[s], s)); else el.textContent = '? label';
    });
    cardsTray.innerHTML = '';
    p.cards.forEach((c, ci) => { if (slot.A !== ci && slot.B !== ci) cardsTray.append(cardBtn(ci, null)); });
  }
  function putLabel(d, s) {
    if (api.done() || d.ci == null) return;
    const other = s === 'A' ? 'B' : 'A';
    if (d.from === other) slot[other] = slot[s]; else if (slot.A === d.ci) slot.A = null; else if (slot.B === d.ci) slot.B = null;
    slot[s] = d.ci; snd.drop(); drawLabels();
    const card = p.cards[d.ci];
    if (!fits(card, s)) {
      const it = items.find(x => inSide(x, s) !== card.f(x));
      api.nudge(inSide(it, s) ? `“${card.t}” can’t be that label. ${vName(it)} is inside that circle, but ${vName(it)} ${card.no}.` : `“${card.t}” can’t be that label. ${vName(it)} ${card.yes}, but it is outside that circle.`);
      setTimeout(() => { if (!api.done() && slot[s] === d.ci) { slot[s] = null; drawLabels(); } }, 1400);
      return;
    }
    if (slot.A != null && slot.B != null && fits(p.cards[slot.A], 'A') && fits(p.cards[slot.B], 'B')) { api.say('Both labels fit!'); winLater(api, 600); }
    else api.say(`Yes, “${card.t}” fits that circle. Now the other one.`);
  }
  droppable(lblA, d => putLabel(d, 'A'), 'Label for the red circle'); droppable(lblB, d => putLabel(d, 'B'), 'Label for the purple circle');
  draw(); drawLabels();
  st.append(wrap, cardsTray, h('div', { class: 'note' }, 'Drag a label onto the “? label” sign of a circle.'));
  return {
    solve() { slot.A = p.cards.findIndex(c => fits(c, 'A')); slot.B = p.cards.findIndex(c => fits(c, 'B')); drawLabels(); winLater(api, 600); },
  };
};

function vennCount(st, p, api, wrap) {
  const truth = { A: p.A.n - p.AB, B: p.B.n - p.AB, AB: p.AB, N: p.total - (p.A.n + p.B.n - p.AB) };
  const pos = { A: [168, VCY], AB: [300, VCY], B: [432, VCY], N: [64, 272] };
  const cap = { A: `${p.A.t} only`, B: `${p.B.t} only`, AB: 'both', N: 'neither' };
  const capPos = { A: [168, VCY - 40], AB: [300, VCY - 40], B: [432, VCY - 40], N: [64, 236] };
  const done = {};
  const knowAB = () => done.AB || (p.given || []).includes('AB');
  const why = {
    A: () => `This part is for ${p.who} who ${p.A.t} but not ${p.B.t.replace(/^(like|do) /, '')}.${knowAB() ? ` ${p.A.n} ${p.A.t} in all, and ${truth.AB} of them are in the middle.` : ''}`,
    B: () => `This part is for ${p.who} who ${p.B.t} but not ${p.A.t.replace(/^(like|do) /, '')}.${knowAB() ? ` ${p.B.n} ${p.B.t} in all, and ${truth.AB} of them are in the middle.` : ''}`,
    AB: () => `The middle is for ${p.who} who ${p.A.t} AND ${p.B.t.replace(/^(like|do) /, '')}.`,
    N: () => `Outside both circles are the ${p.who} who do neither.`,
  };
  const inputs = {};
  Object.keys(pos).forEach(r => {
    wrap.append(h('div', { class: 'c2-vcap', style: { left: capPos[r][0] + 'px', top: capPos[r][1] + 'px' } }, cap[r]));
    if ((p.given || []).includes(r)) { done[r] = true; wrap.append(h('div', { class: 'c2-vin fixed', style: { left: pos[r][0] + 'px', top: pos[r][1] + 'px' } }, String(truth[r]))); return; }
    const inp = h('input', { type: 'number', min: 0, max: 99, class: 'c2-vin', placeholder: '?', 'aria-label': `How many ${p.who}: ${cap[r]}`, style: { left: pos[r][0] + 'px', top: pos[r][1] + 'px' } });
    const chk = () => {
      if (api.done() || done[r]) return; const v = parseInt(inp.value); if (isNaN(v)) return;
      if (v === truth[r]) { done[r] = true; inp.classList.add('ok'); inp.readOnly = true; snd.good(); api.say(`Yes! ${v} ${p.who}: ${cap[r]}.`); }
      else { shakeEl(inp); api.nudge(`Not ${v}. ${why[r]()}`); }
    };
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') chk(); });
    inp.addEventListener('change', chk);
    inputs[r] = inp; wrap.append(inp);
  });
  const ask = numAsk(api, { label: p.ask, answer: p.answer, wrong: n => (p.wrong && p.wrong(n)) || `Not ${n}. Fill in the parts of the circles first. Each fish goes in exactly one part.` });
  st.append(wrap, ask);
  return {
    hint(l) { if (l >= 2 && inputs.AB && !done.AB) { inputs.AB.value = truth.AB; inputs.AB.dispatchEvent(new Event('change')); } },
    async solve() { for (const r of Object.keys(inputs)) { if (done[r]) continue; inputs[r].value = truth[r]; inputs[r].dispatchEvent(new Event('change')); await sleep(250); } ask.set(p.answer); if (!api.done()) winLater(api, 400); },
  };
}

/* ================================================================ 5. jugs */
function jugMove(s, caps, m) { const t = s.slice(); if (m.t === 'fill') t[m.i] = caps[m.i]; else if (m.t === 'empty') t[m.i] = 0; else { const a = Math.min(t[m.i], caps[m.j] - t[m.j]); t[m.i] -= a; t[m.j] += a; } return t; }
function jugMoves(caps, sea) { const ms = []; caps.forEach((_, i) => { if (sea) ms.push({ t: 'fill', i }, { t: 'empty', i }); caps.forEach((_, j) => { if (i !== j) ms.push({ t: 'pour', i, j }); }); }); return ms; }
const jugGoal = p => p.share ? (s => s.filter(x => x === p.share).length >= 2) : (s => s.includes(p.target));
function jugBFS(p, from) {
  const goal = jugGoal(p), ms = jugMoves(p.caps, p.sea !== false), key = s => s.join(',');
  const prev = new Map([[key(from), null]]); const q = [from];
  while (q.length) {
    const s = q.shift();
    if (goal(s)) { const path = []; let k = key(s); while (prev.get(k)) { const [pk, m] = prev.get(k); path.unshift(m); k = pk; } return path; }
    for (const m of ms) { const t = jugMove(s, p.caps, m), kt = key(t); if (!prev.has(kt)) { prev.set(kt, [key(s), m]); q.push(t); } }
  }
  return null;
}
function jugAmounts(p) { // every amount that can ever be in a jug
  const ms = jugMoves(p.caps, p.sea !== false), start = p.start || p.caps.map(() => 0), seen = new Set([start.join(',')]), q = [start], amts = new Set();
  while (q.length) { const s = q.shift(); s.forEach(x => amts.add(x)); for (const m of ms) { const t = jugMove(s, p.caps, m); if (!seen.has(t.join(','))) { seen.add(t.join(',')); q.push(t); } } }
  return [...amts].sort((a, b) => a - b);
}

R.jugs = (st, p, api) => {
  const caps = p.caps, sea = p.sea !== false, goal = jugGoal(p);
  let s = (p.start || caps.map(() => 0)).slice(); const hist = [], log = []; let busy = false;
  const unit = Math.min(26, Math.floor(176 / Math.max(...caps)));
  const btnFor = {}; const jugs = [];
  const mkey = m => m.t + m.i + (m.j != null ? '-' + m.j : '');
  caps.forEach((c, i) => {
    const water = h('div', { class: 'c2-water' });
    const vessel = h('button', { class: 'c2-vessel', style: { height: c * unit + 'px' }, 'aria-label': `The ${c}-cup jug. Drag it onto another jug to pour.` }, water, range(c - 1).map(k => h('span', { class: 'c2-tick', style: { bottom: (k + 1) * unit + 'px' } })));
    draggable(vessel, { i }); droppable(vessel, d => { if (d.i != null && d.i !== i) doMove({ t: 'pour', i: d.i, j: i }); }, `The ${c}-cup jug`);
    const amt = h('div', { class: 'c2-amt' });
    const bs = h('div', { class: 'c2-jbtns' });
    const add = (m, label, cls = 'btn alt') => { const b = h('button', { class: cls, onclick: () => doMove(m) }, label); btnFor[mkey(m)] = b; bs.append(b); };
    if (sea) { add({ t: 'fill', i }, '🌊 Fill'); add({ t: 'empty', i }, '💧 Empty'); }
    caps.forEach((c2, j) => { if (j !== i) add({ t: 'pour', i, j }, `Pour into the ${c2} ➜`); });
    jugs.push({ water, vessel, amt });
    jugs[i].el = h('div', { class: 'c2-jug' }, h('div', { class: 'c2-jugtop' }, `${c}-cup jug`), vessel, amt, bs);
  });
  const logEl = h('div', { class: 'c2-log' });
  const goalTxt = p.share ? `Goal: ${p.share} cups in two of the jugs` : `Goal: exactly ${p.target} ${p.target === 1 ? 'cup' : 'cups'} in a jug`;
  function draw() {
    caps.forEach((c, i) => { jugs[i].water.style.height = (s[i] * unit) + 'px'; jugs[i].amt.innerHTML = `${s[i]} <small>of ${c}</small>`; jugs[i].vessel.setAttribute('aria-label', `The ${c}-cup jug has ${s[i]} cups. Drag it onto another jug to pour.`); });
    logEl.innerHTML = log.length ? `<b>Moves: ${log.length}</b> ` + log.map((t, k) => `<span class="${k === log.length - 1 ? 'new' : ''}">${t}</span>`).join('') : '<span>No moves yet. Use the buttons, or drag one jug onto another to pour.</span>';
  }
  const label = m => m.t === 'fill' ? `Fill ${caps[m.i]}` : m.t === 'empty' ? `Empty ${caps[m.i]}` : `${caps[m.i]} ➜ ${caps[m.j]}`;
  async function doMove(m) {
    if (api.done() || busy) return;
    $$('.c2-glow', st).forEach(b => b.classList.remove('c2-glow'));
    const why = m.t === 'fill' && s[m.i] === caps[m.i] ? `The ${caps[m.i]}-cup jug is already full.` : m.t === 'empty' && !s[m.i] ? `The ${caps[m.i]}-cup jug is already empty.`
      : m.t === 'pour' && !s[m.i] ? `The ${caps[m.i]}-cup jug is empty. There is nothing to pour.` : m.t === 'pour' && s[m.j] === caps[m.j] ? `The ${caps[m.j]}-cup jug is full. There is no room.` : null;
    if (why) return api.nudge(why);
    busy = true; hist.push(s.slice());
    if (m.t === 'pour') jugs[m.i].vessel.classList.add(m.j > m.i ? 'tr' : 'tl');
    s = jugMove(s, caps, m); log.push(label(m)); m.t === 'empty' ? snd.bloop() : snd.drop(); draw();
    await sleep(m.t === 'pour' ? 750 : 500);
    jugs.forEach(j => j.vessel.classList.remove('tl', 'tr')); busy = false;
    if (api.done()) return;
    if (goal(s)) { logEl.append(h('span', { class: 'new' }, `🎉 Done in ${plural(log.length, 'move')}!`)); winLater(api, 250); }
  }
  api.button('↶ Undo', () => { if (busy || !hist.length) return; s = hist.pop(); log.pop(); snd.bloop(); draw(); }, 'btn alt');
  if (sea) api.button('🙅 It can’t be done', () => {
    if (busy) return;
    if (p.impossible) { logEl.append(h('span', { class: 'new' }, `Amounts you can make: ${jugAmounts(p).join(', ')}`)); api.say('You are right!'); winLater(api, 500); }
    else api.nudge('It can be done! Keep trying. Every pour gives you a new amount to work with.');
  }, 'btn alt');
  st.append(h('div', { class: 'c2-goal' }, goalTxt), h('div', { class: 'c2-jugs' }, jugs.map(j => j.el)), logEl);
  draw();
  return {
    hint(l) { if (l >= 2 && !p.impossible) { const path = jugBFS(p, s); if (path && path[0]) { const b = btnFor[mkey(path[0])]; if (b) b.classList.add('c2-glow'); } } },
    async solve() {
      while (busy) await sleep(100);
      if (p.impossible) { logEl.append(h('span', { class: 'new' }, `Amounts you can make: ${jugAmounts(p).join(', ')}`)); await sleep(700); api.win(); return; }
      const path = jugBFS(p, s) || [];
      for (const m of path) { if (api.done()) return; await doMove(m); await sleep(220); }
    },
  };
};

/* ================================================================ 6. pearls */
R.pearls = (st, p, api) => {
  if (p.think) return pearlThink(st, p, api);
  const n = p.n, heavy = !!p.heavy, max = p.max;
  const at = range(n).map(() => 'T');
  let C = range(n), used = 0, busy = false, autoReal = false, found = -1, dir = 0;
  const W = []; // weighings: {L, R, dir}
  const beam = h('div', { class: 'beam' }); const panEl = {}, items = {};
  const scale = h('div', { class: 'scale c2-pscale' }, h('div', { class: 'post' }), h('div', { class: 'sbase' }), beam);
  for (const sd of ['L', 'R']) {
    items[sd] = h('div', { class: 'pitems' });
    panEl[sd] = h('div', { class: 'pan pan' + sd }, h('div', { class: 'strings', html: '<svg viewBox="0 0 100 100" preserveAspectRatio="none"><line x1="50" y1="0" x2="3" y2="100"/><line x1="50" y1="0" x2="97" y2="100"/></svg>' }), items[sd], h('div', { class: 'dish' }));
    droppable(panEl[sd], d => move(d.i, sd), sd === 'L' ? 'Left pan' : 'Right pan'); scale.append(panEl[sd]);
  }
  scale.append(h('div', { class: 'pivot' }));
  function tilt() {
    const ang = dir * 9, dy = scale.offsetWidth * .35 * Math.sin(ang * Math.PI / 180);
    beam.style.transform = `rotate(${ang}deg)`; panEl.L.style.transform = `translateY(${-dy}px)`; panEl.R.style.transform = `translateY(${dy}px)`;
  }
  const zone = (cls, label, key, aria) => { const zp = h('div', { class: 'zp' }); const z = h('div', { class: 'c2-zone ' + cls }, h('div', { class: 'zl' }, label), zp); droppable(z, d => move(d.i, key), aria); z.zp = zp; return z; };
  const zT = zone('c2-ztable', 'Table', 'T', 'The table'), zOK = zone('c2-zreal', '✓ Sure they are real', 'OK', 'Box for pearls you are sure are real'), zF = zone('c2-zfake', '🔍 The fake!', 'F', 'Drop the fake pearl here');
  const wcount = h('div', { class: 'c2-wcount' });
  const logEl = h('div', { class: 'c2-log' });
  const pearlBtn = i => { const b = h('button', { class: 'c2-pearl' + (autoReal && !C.includes(i) ? ' real' : '') + (found === i ? ' fake' : ''), 'aria-label': `Pearl ${i + 1}` }, String(i + 1)); draggable(b, { i }); return b; };
  function draw() {
    items.L.innerHTML = ''; items.R.innerHTML = ''; zT.zp.innerHTML = ''; zOK.zp.innerHTML = ''; zF.zp.innerHTML = '';
    range(n).forEach(i => ({ L: items.L, R: items.R, T: zT.zp, OK: zOK.zp, F: zF.zp })[at[i]].append(pearlBtn(i)));
    wcount.innerHTML = `Weighings: ${used} <span class="note">(you may use ${max})</span>`;
    logEl.innerHTML = W.map((w, k) => `<span>${k + 1}: ${w.L.map(x => x + 1).join(' ')} vs ${w.R.map(x => x + 1).join(' ')} → ${w.dir === 0 ? 'level' : w.dir > 0 ? 'left up' : 'right up'}</span>`).join('');
    tilt();
  }
  function move(i, where) {
    if (api.done() || busy || i == null || at[i] === where) return;
    at[i] = where; dir = 0; snd.drop(); draw();
    if (where === 'F') pickFake(i);
  }
  async function weigh() {
    if (api.done() || busy) return;
    const L = range(n).filter(i => at[i] === 'L'), Rr = range(n).filter(i => at[i] === 'R');
    if (!L.length || !Rr.length) return api.nudge('Put pearls on both pans of the scale first.');
    if (L.length !== Rr.length) return api.nudge(`There are ${L.length} on the left and ${Rr.length} on the right. Put the same number on each side, so the scale compares them fairly.`);
    const cl = C.filter(i => L.includes(i)), cr = C.filter(i => Rr.includes(i)), c0 = C.filter(i => !L.includes(i) && !Rr.includes(i));
    // the fake is not chosen in advance: the scale always gives the answer that leaves the most pearls possible
    const opts = [['L', cl], ['R', cr], ['0', c0]].filter(o => o[1].length);
    const mx = Math.max(...opts.map(o => o[1].length)), ch = pick(opts.filter(o => o[1].length === mx));
    C = ch[1]; used++;
    dir = ch[0] === '0' ? 0 : ((ch[0] === 'L') !== heavy ? 1 : -1);
    W.push({ L, R: Rr, dir });
    busy = true; dir === 0 ? snd.pop() : snd.drop(); draw(); await sleep(800); busy = false;
    if (api.done()) return;
    const up = dir > 0 ? 'left' : 'right', down = dir > 0 ? 'right' : 'left';
    const msg = dir === 0 ? 'Level! The pearls on the scale all weigh the same, so they are all real. The fake is somewhere else.'
      : heavy ? `The ${down} side went DOWN. It is heavier, so the fake is on the ${down} pan!` : `The ${up} side went UP. It is lighter, so the fake is on the ${up} pan!`;
    used > max ? api.nudge(`${msg} That was weighing number ${used}, and we wanted to use only ${max}.`) : api.say(msg);
  }
  function reasonReal(i) {
    for (const w of W) {
      const on = w.L.includes(i) || w.R.includes(i);
      if (w.dir === 0 && on) return `Pearl ${i + 1} was on the scale when it stayed level, so it is real.`;
      if (w.dir !== 0 && !on) return `When the scale tipped, the fake was on the scale. Pearl ${i + 1} was not on the scale, so it is real.`;
      if (w.dir !== 0) { const inL = w.L.includes(i), wentUp = (w.dir > 0) === inL; if (wentUp === heavy) return `Pearl ${i + 1} was on the side that went ${heavy ? 'up' : 'down'}, so it can’t be the ${heavy ? 'heavier' : 'lighter'} fake.`; }
    }
    return `Pearl ${i + 1} is real.`;
  }
  function pickFake(i) {
    if (C.length === 1 && C[0] === i) {
      if (used <= max) { found = i; draw(); api.say(`Pearl ${i + 1} is the fake!`); winLater(api, 700); }
      else api.nudge(`Yes, pearl ${i + 1} is the fake! But that took ${used} weighings. Can you find it with only ${max}? Press “Start over” and try again.`);
      return;
    }
    if (C.includes(i)) api.nudge(`Maybe! But ${C.filter(x => x !== i).map(x => 'pearl ' + (x + 1)).join(' or ')} could be the fake too. Weigh again to be sure.`);
    else api.nudge(reasonReal(i));
    setTimeout(() => { if (!api.done() && at[i] === 'F') { at[i] = 'T'; draw(); } }, 900);
  }
  api.button('⚖️ Weigh', weigh, 'btn coral big');
  st.append(scale, h('div', { class: 'c2-row' }, wcount, logEl), h('div', { class: 'c2-zones' }, zT, zOK, zF));
  new ResizeObserver(() => tilt()).observe(scale);
  draw();
  return {
    hint(l) { if (l >= 2) { autoReal = true; draw(); } },
    async solve() {
      while (busy) await sleep(100);
      autoReal = true;
      while (C.length > 1 && !api.done()) {
        const a = Math.ceil(C.length / 3), g = C.slice();
        range(n).forEach(i => at[i] = C.includes(i) ? 'T' : 'OK');
        g.slice(0, a).forEach(i => at[i] = 'L'); g.slice(a, 2 * a).forEach(i => at[i] = 'R'); dir = 0; draw(); await sleep(700);
        await weigh(); await sleep(900);
      }
      if (api.done()) return;
      range(n).forEach(i => at[i] = i === C[0] ? 'F' : 'OK'); found = C[0]; draw(); winLater(api, 600);
    },
  };
};
function pearlThink(st, p, api) {
  const pearls = k => range(k).map(() => h('span', { class: 'c2-pearl sm' }));
  const grp = (k, cls) => h('div', { class: 'grp ' + (cls || '') }, pearls(k));
  const r3 = h('div', { class: 'c2-row', style: { justifyContent: 'flex-start', gap: '8px' } }, h('span', { class: 'c2-big' }, '?'));
  st.append(h('div', { class: 'c2-think' },
    h('div', { class: 'c2-trow' }, h('span', { class: 'tl' }, '⚖️ 1 weighing'), h('div', { class: 'c2-row', style: { gap: '8px' } }, grp(1), grp(1), grp(1)), h('b', {}, '→ 3 pearls')),
    h('div', { class: 'c2-trow' }, h('span', { class: 'tl' }, '⚖️⚖️ 2 weighings'), h('div', { class: 'c2-row', style: { gap: '8px' } }, grp(3), grp(3), grp(3)), h('b', {}, '→ 9 pearls')),
    h('div', { class: 'c2-trow' }, h('span', { class: 'tl' }, '⚖️⚖️⚖️ 3 weighings'), r3)));
  const reveal = () => { r3.innerHTML = ''; r3.append(grp(9, 'g9'), grp(9, 'g9'), grp(9, 'g9'), h('b', {}, '→ 27 pearls')); $$('.grp', r3).forEach((g, k) => g.animate([{ transform: 'scale(.3)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 400, delay: k * 200, fill: 'backwards' })); };
  const ask = choiceAsk(api, 'With 3 weighings, what is the most pearls Finn can search?', [
    { t: '12', no: '12 is too few. Think of 3 groups, and each group must be small enough for 2 weighings.' },
    { t: '18', no: 'Close! 2 groups of 9 would be 18. But you can also leave a third group of 9 off the scale.' },
    { t: '27', ok: true },
    { t: '30', no: '30 is too many. Each group can only be as big as 2 weighings can handle: 9 pearls.' }], () => { reveal(); winLater(api, 1100); });
  st.append(ask);
  return { solve() { ask.pick(2); } };
}

/* ================================================================ 7. digits */
const dVar = (lines, r, c) => { const ch = lines[r][c]; return ch === '_' ? `b${r}_${c}` : /[A-Z]/.test(ch) ? ch : null; };
function digitCheck(p, val) { // val: map variable -> digit. returns {ok, msg}
  const lines = [...p.rows, p.res];
  const numStr = r => [...lines[r]].map((ch, c) => { const v = dVar(lines, r, c); return v ? val[v] : ch; }).join('');
  for (let r = 0; r < lines.length; r++) if (lines[r].length > 1 && dVar(lines, r, 0) && val[dVar(lines, r, 0)] === 0) return { ok: false, msg: 'A number can’t start with 0.' };
  if (p.distinct) { const ls = [...new Set(lines.join('').replace(/[^A-Z]/g, ''))]; const ds = ls.map(l => val[l]); if (new Set(ds).size < ds.length) return { ok: false, msg: 'Different letters must be different digits.' }; }
  const nums = p.rows.map((_, r) => +numStr(r)), res = +numStr(lines.length - 1);
  const got = p.op === '-' ? nums[0] - nums[1] : sumOf(nums);
  const expr = nums.join(p.op === '-' ? ' − ' : ' + ');
  return got === res ? { ok: true, msg: `${expr} = ${res}` } : { ok: false, msg: `${expr} = ${got}, but the bottom line says ${res}. Try another digit.` };
}
function digitVars(p) { const lines = [...p.rows, p.res], vars = []; lines.forEach((s, r) => [...s].forEach((_, c) => { const v = dVar(lines, r, c); if (v && !vars.includes(v)) vars.push(v); })); return vars; }
function digitSolutions(p) {
  const vars = digitVars(p), out = [];
  const rec = (i, val) => { if (i === vars.length) { if (digitCheck(p, val).ok) out.push({ ...val }); return; } for (let d = 0; d <= 9; d++) { val[vars[i]] = d; rec(i + 1, val); } delete val[vars[i]]; };
  rec(0, {}); return out;
}
function makeBest(p) {
  let best = null;
  for (const pr of perms(p.digits)) {
    let k = 0, okLead = true; const nums = p.sizes.map(sz => { const s = pr.slice(k, k + sz); k += sz; if (sz > 1 && s[0] === 0) okLead = false; return +s.join(''); });
    if (!okLead) continue;
    const v = p.goal === 'maxsum' ? sumOf(nums) : nums[0];
    if (best == null || (p.goal === 'min' ? v < best : v > best)) best = v;
  }
  return best;
}

R.digits = (st, p, api) => p.mode === 'make' ? digitMake(st, p, api) : p.mode === 'list' ? digitList(st, p, api) : digitFill(st, p, api);

const digitTiles = (digits, data) => h('div', { class: 'c2-dtiles' }, digits.map((d, k) => { const b = h('button', { class: 'c2-dt', 'aria-label': 'Digit ' + d }, String(d)); draggable(b, data(d, k)); return b; }));
function digitFill(st, p, api) {
  const lines = [...p.rows, p.res], Wd = Math.max(...lines.map(s => s.length)) + 1;
  const val = {}; let solved = false;
  const grid = h('div', { class: 'c2-sum', style: { gridTemplateColumns: `repeat(${Wd}, 58px)` } });
  function draw() {
    grid.innerHTML = '';
    lines.forEach((s, r) => {
      if (r === lines.length - 1) grid.append(h('div', { class: 'c2-line' }));
      const isLastTop = r === p.rows.length - 1;
      for (let c = 0; c < Wd; c++) {
        const k = c - (Wd - s.length);
        if (k < 0) { grid.append(h('div', { class: 'c2-dc op' }, c === 0 && isLastTop ? (p.op === '-' ? '−' : '+') : '')); continue; }
        const v = dVar(lines, r, k);
        if (!v) { grid.append(h('div', { class: 'c2-dc fix' }, s[k])); continue; }
        const filled = val[v] != null, letter = /[A-Z]/.test(v);
        const cell = h('div', { class: 'c2-dc var' + (filled ? ' filled' : '') }, letter ? h('span', { class: 'lt' }, v) : null, filled ? String(val[v]) : h('span', { class: 'q' }, letter ? '' : '?'));
        droppable(cell, d => { if (api.done() || solved || d.d == null) return; val[v] = d.d; snd.drop(); draw(); check(); }, letter ? `Letter ${v}` : 'Empty box');
        cell.addEventListener('click', e => { if (DnD.sel || api.done() || solved || val[v] == null) return; e.stopPropagation(); delete val[v]; snd.pop(); draw(); });
        grid.append(cell);
      }
    });
  }
  const vars = digitVars(p);
  function check() {
    if (vars.some(v => val[v] == null)) { if (/[A-Z]/.test(vars.join(''))) api.say('Every box with the same letter gets the same digit.'); return; }
    const r = digitCheck(p, val);
    if (r.ok) { solved = true; api.say(r.msg + ' ✓'); $$('.c2-dc', grid).forEach((el, i) => el.animate([{ transform: 'none' }, { transform: 'translateY(-10px)' }, { transform: 'none' }], { duration: 400, delay: i * 30 })); winLater(api, 700); }
    else api.nudge(r.msg);
  }
  draw();
  st.append(grid, digitTiles(range(10), d => ({ d })), h('div', { class: 'note' }, 'Drag a digit into a box, or click a digit and then a box. Click a filled box to empty it.'));
  return { solve() { const s = digitSolutions(p)[0]; Object.assign(val, s); draw(); check(); } };
}
function digitMake(st, p, api) {
  const nSlots = sumOf(p.sizes), slot = Array(nSlots).fill(null); // tile index in each slot
  const best = makeBest(p);
  const area = h('div', { class: 'c2-row' }); const tilesBox = h('div', { class: 'c2-dtiles' }); const out = h('div', { class: 'c2-status' });
  droppable(tilesBox, d => { if (d.from >= 0 && !api.done()) { slot[d.from] = null; snd.pop(); draw(); } }, 'Digit tray');
  const tile = (k, from) => { const b = h('button', { class: 'c2-dt', 'aria-label': 'Digit ' + p.digits[k] }, String(p.digits[k])); draggable(b, { k, from }); return b; };
  const nums = () => { let k = 0; return p.sizes.map(sz => { const s = slot.slice(k, k + sz); k += sz; return s; }); };
  function draw() {
    area.innerHTML = ''; let idx = 0;
    p.sizes.forEach((sz, ni) => {
      if (ni) area.append(h('span', { class: 'c2-dbig' }, '+'));
      const box = h('div', { class: 'c2-dnum' });
      for (let j = 0; j < sz; j++) { const i = idx++; const sEl = h('div', { class: 'c2-dslot' }); if (slot[i] != null) sEl.append(tile(slot[i], i)); droppable(sEl, d => place(d, i), `Place ${j + 1} of number ${ni + 1}`); box.append(sEl); }
      area.append(box);
    });
    if (p.goal === 'maxsum') { const full = slot.every(x => x != null); area.append(h('span', { class: 'c2-dbig' }, '= ' + (full ? sumOf(nums().map(s => +s.map(k => p.digits[k]).join(''))) : '?'))); }
    tilesBox.innerHTML = '';
    p.digits.forEach((d, k) => { if (!slot.includes(k)) tilesBox.append(tile(k, -1)); });
    if (slot.every(x => x != null)) tilesBox.append(h('span', { class: 'note' }, 'All the digits are used.'));
  }
  function place(d, i) {
    if (api.done() || d.k == null || d.from === i) return;
    const old = slot[i];
    if (d.from >= 0) slot[d.from] = old; slot[i] = d.k; snd.drop(); draw();
    if (slot.every(x => x != null)) check();
  }
  function check() {
    const ns = nums().map(s => s.map(k => p.digits[k]));
    if (ns.some(s => s.length > 1 && s[0] === 0)) return api.nudge('A number can’t start with 0. Move the 0 to another place.');
    const vals = ns.map(s => +s.join('')), v = p.goal === 'maxsum' ? sumOf(vals) : vals[0];
    if (v === best) { out.textContent = p.goal === 'maxsum' ? `${vals.join(' + ')} = ${v}` : String(v); winLater(api, 500); return; }
    api.nudge(p.goal === 'max' ? `${v} is big, but you can make a bigger number. Which digit is worth the most at the front?` : p.goal === 'min' ? `${v} is small, but you can make a smaller one. Which digit should go first? (Not 0!)` : `${vals.join(' + ')} = ${v}. You can make the sum bigger! Which digits should go in the tens places?`);
  }
  draw();
  st.append(area, out, tilesBox, h('div', { class: 'note' }, 'Drag the digits into the boxes. Drag one onto another to swap.'));
  return {
    solve() {
      for (const pr of perms(range(p.digits.length))) {
        pr.forEach((k, i) => slot[i] = k);
        const ns = nums().map(s => s.map(k => p.digits[k])); if (ns.some(s => s.length > 1 && s[0] === 0)) continue;
        const vals = ns.map(s => +s.join('')); if ((p.goal === 'maxsum' ? sumOf(vals) : vals[0]) === best) break;
      }
      draw(); check();
    },
  };
}
function digitList(st, p, api) {
  let tens = 1, ones = 0; const found = []; let last = null;
  const all = range(90).map(i => i + 10).filter(p.test);
  const wheel = (lab, get, set, lo) => h('div', { class: 'c2-wheel' }, h('div', { class: 'wl' }, lab),
    h('button', { class: 'btn alt sq', 'aria-label': `${lab} up`, onclick: () => { if (api.done()) return; set(get() === 9 ? lo : get() + 1); snd.pop(); draw(); } }, '▲'),
    h('div', { class: 'wv' }, String(get())),
    h('button', { class: 'btn alt sq', 'aria-label': `${lab} down`, onclick: () => { if (api.done()) return; set(get() === lo ? 9 : get() - 1); snd.pop(); draw(); } }, '▼'));
  const wheels = h('div', { class: 'c2-row' }); const chips = h('div', { class: 'c2-chips' }); const info = h('div', { class: 'c2-status' });
  function draw() {
    wheels.innerHTML = '';
    wheels.append(wheel('tens', () => tens, v => tens = v, 1), wheel('ones', () => ones, v => ones = v, 0), h('div', { class: 'c2-col' }, h('div', { class: 'c2-big' }, `${tens} + ${ones} = ${tens + ones}`), h('button', { class: 'btn coral big', onclick: add }, `➕ Add ${tens}${ones}`)));
    chips.innerHTML = ''; found.slice().sort((a, b) => a - b).forEach(x => chips.append(h('span', { class: 'c2-chip' + (x === last ? ' new' : '') }, String(x))));
    if (!found.length) chips.append(h('span', { class: 'note' }, 'Your numbers go here.'));
    info.textContent = `Found: ${found.length}`;
  }
  function add() {
    if (api.done()) return;
    const x = tens * 10 + ones;
    if (!p.test(x)) return api.nudge(p.why(x));
    if (found.includes(x)) return api.nudge(`${x} is already on your list.`);
    found.push(x); last = x; snd.good(); draw();
    if (found.length === all.length) { api.say('That is all of them!'); winLater(api, 600); } else api.say(`${x} works! ${plural(found.length, 'number')} so far.`);
  }
  draw();
  st.append(wheels, info, chips);
  return { async solve() { for (const x of all) { if (found.includes(x) || api.done()) continue; tens = Math.floor(x / 10); ones = x % 10; found.push(x); last = x; draw(); snd.pop(); await sleep(300); } if (!api.done()) winLater(api, 400); } };
}

/* ================================================================ 8. cubes and nets */
const ISOC = Math.cos(Math.PI / 6);
function isoSVG(H, o) {
  const rows = H.length, cols = H[0].length, s = o.s, gap = o.gap || 0;
  const zmax = Math.max(o.full || 0, ...H.flat());
  const P = (r, c, z) => [(c - r) * s * ISOC, (c + r) * s * .5 - z * s];
  const cubes = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    for (let z = 0; z < H[r][c]; z++) cubes.push({ r, c, z });
    if (o.full) for (let z = H[r][c]; z < o.full; z++) cubes.push({ r, c, z, ghost: true });
  }
  // back to front; when the layers are pulled apart, draw layer by layer
  cubes.sort(gap ? (a, b) => a.z - b.z || (a.r + a.c) - (b.r + b.c) : (a, b) => (a.r + a.c + a.z) - (b.r + b.c + b.z) || a.z - b.z);
  const minX = -rows * s * ISOC - 6, maxX = cols * s * ISOC + 6, minY = -zmax * s - (zmax - 1) * gap - 6, maxY = (rows + cols) * s * .5 + 6;
  const pt = (q, z) => `${q[0].toFixed(1)},${(q[1] - z * gap).toFixed(1)}`;
  let out = `<svg width="${(maxX - minX).toFixed(0)}" height="${(maxY - minY).toFixed(0)}" viewBox="${minX.toFixed(1)} ${minY.toFixed(1)} ${(maxX - minX).toFixed(1)} ${(maxY - minY).toFixed(1)}" aria-hidden="true">`;
  const COL = { top: '#a8e6f2', left: '#56b8d2', right: '#2f8fb5' }, PAINT = { top: '#f47c64', left: '#e05a40', right: '#c4462e' }, WOOD = { top: '#f6dca0', left: '#e2c47f', right: '#c9a55c' };
  for (const q of cubes) {
    const { r, c, z } = q;
    const top = [P(r, c, z + 1), P(r, c + 1, z + 1), P(r + 1, c + 1, z + 1), P(r + 1, c, z + 1)];
    const left = [P(r + 1, c, z + 1), P(r + 1, c + 1, z + 1), P(r + 1, c + 1, z), P(r + 1, c, z)];
    const right = [P(r, c + 1, z + 1), P(r + 1, c + 1, z + 1), P(r + 1, c + 1, z), P(r, c + 1, z)];
    const poly = (pts, f, extra = '') => `<polygon points="${pts.map(x => pt(x, z)).join(' ')}" ${f ? `fill="${f}"` : ''} ${extra}/>`;
    if (q.ghost) { const g = 'fill="rgba(13,132,150,.06)" stroke="#0d8496" stroke-width="1.5" stroke-dasharray="4 4" opacity=".7"'; out += poly(top, '', g) + poly(left, '', g) + poly(right, '', g); continue; }
    const col = face => !o.paint ? COL[face] : (face === 'top' ? z === zmax - 1 : face === 'left' ? r === rows - 1 : c === cols - 1) ? PAINT[face] : WOOD[face];
    const sk = 'stroke="#14365a" stroke-width="1.6" stroke-linejoin="round"';
    out += poly(top, col('top'), sk) + poly(left, col('left'), sk) + poly(right, col('right'), sk);
  }
  if (o.xray) for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const hh = H[r][c]; if (!hh) continue; const [x, y] = P(r + .5, c + .5, hh), yy = y - (hh - 1) * gap;
    out += `<circle cx="${x.toFixed(1)}" cy="${yy.toFixed(1)}" r="${s * .3}" fill="#fff" stroke="#ef6a4a" stroke-width="2.5"/><text x="${x.toFixed(1)}" y="${(yy + s * .13).toFixed(1)}" text-anchor="middle" font-size="${(s * .38).toFixed(0)}" font-weight="700" fill="#c9502f" font-family="Fredoka, sans-serif">${hh}</text>`;
  }
  return out + '</svg>';
}
R.cubes = (st, p, api) => {
  const H = p.H, total = sumOf(H.flat());
  const answer = p.answer != null ? p.answer : p.full ? p.full ** 3 - total : total;
  const S = p.s || 46; let gap = 0, xray = false, anim = 0, layersTxt = false;
  const box = h('div', { class: 'c2-iso' });
  const zmax = Math.max(...H.flat());
  const layerCounts = range(zmax).map(z => H.flat().filter(x => x > z).length);
  const layersEl = h('div', { class: 'c2-layers' });
  const names = zmax === 2 ? ['Bottom', 'Top'] : ['Bottom', 'Middle', 'Top'];
  const render = () => {
    box.innerHTML = isoSVG(H, { s: S, gap, xray, paint: p.paint, full: p.full });
    layersEl.innerHTML = layersTxt && !p.paint ? layerCounts.map((n, z) => `${names[z]} layer: <b>${n}</b>${p.full ? ` (${p.full * p.full - n} missing)` : ''}`).reverse().join('<br>') : '';
  };
  const btn = h('button', { class: 'btn alt', onclick: () => toggle() }, '↕️ Pull the layers apart');
  function toggle(to) {
    const want = to != null ? to : gap ? 0 : S * .8, from = gap, t0 = performance.now(), id = ++anim;
    btn.textContent = want ? '↕️ Push the layers together' : '↕️ Pull the layers apart'; snd.pop();
    const step = now => { if (id !== anim) return; const k = Math.min(1, (now - t0) / 380); gap = from + (want - from) * (1 - Math.pow(1 - k, 3)); render(); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  const ask = numAsk(api, { label: p.ask || 'How many cubes are there?', answer, wrong: n => (p.wrong && p.wrong(n)) || (n < answer ? `Not ${n}. Some cubes are hidden behind or under others. Try pulling the layers apart.` : `Not ${n}. That is too many. Count one layer at a time.`) });
  render();
  st.append(h('div', { class: 'c2-cubes' }, box, h('div', { class: 'c2-cside' }, btn, layersEl, ask)));
  return {
    hint(l) { if (l >= 2) { if (!p.paint) xray = true; if (l > (p.hints || []).length) layersTxt = true; if (!gap) toggle(S * .8); else render(); } },
    solve() { if (!p.paint) xray = true; layersTxt = true; if (!gap) toggle(S * .8); else render(); ask.set(answer); winLater(api, 900); },
  };
};

function netFold(cells) { // face number (0..5) for each cell, found by rolling a cube over the net
  const key = (r, c) => r + ',' + c, idx = new Map(cells.map((x, i) => [key(x[0], x[1]), i])), lab = Array(cells.length).fill(null);
  const ROLL = { E: s => ({ ...s, b: s.e, w: s.b, t: s.w, e: s.t }), W: s => ({ ...s, b: s.w, e: s.b, t: s.e, w: s.t }), S: s => ({ ...s, b: s.s, n: s.b, t: s.n, s: s.t }), N: s => ({ ...s, b: s.n, s: s.b, t: s.s, n: s.t }) };
  const go = (i, s) => { lab[i] = s.b; const [r, c] = cells[i]; for (const [dr, dc, d] of [[0, 1, 'E'], [0, -1, 'W'], [1, 0, 'S'], [-1, 0, 'N']]) { const j = idx.get(key(r + dr, c + dc)); if (j != null && lab[j] == null) go(j, ROLL[d](s)); } };
  go(0, { b: 0, t: 1, n: 2, s: 3, e: 4, w: 5 });
  return lab;
}
const netOK = cells => cells.length === 6 && new Set(netFold(cells)).size === 6;
const FOLD = { E: 'rotateY(-90deg)', W: 'rotateY(90deg)', S: 'rotateX(90deg)', N: 'rotateX(-90deg)' };
function net3D(cells, size, labels) {
  const minR = Math.min(...cells.map(c => c[0])), minC = Math.min(...cells.map(c => c[1]));
  const maxR = Math.max(...cells.map(c => c[0])), maxC = Math.max(...cells.map(c => c[1]));
  const inner = h('div', { class: 'c2-n3d', style: { width: (maxC - minC + 1) * size + 'px', height: (maxR - minR + 1) * size + 'px' } });
  const key = (r, c) => r + ',' + c, has = new Set(cells.map(([r, c]) => key(r, c)));
  const nb = ([r, c]) => [[r, c + 1, 'E'], [r, c - 1, 'W'], [r + 1, c, 'S'], [r - 1, c, 'N']].filter(([a, b]) => has.has(key(a, b)));
  const root = cells.slice().sort((a, b) => nb(b).length - nb(a).length)[0];
  const faces = [];
  const mk = (cell, dir) => { const i = cells.findIndex(x => x[0] === cell[0] && x[1] === cell[1]); const f = h('div', { class: 'c2-face f' + i, style: { width: size + 'px', height: size + 'px', fontSize: (size * .55) + 'px' } }, labels ? String(labels[i]) : ''); f._dir = dir; faces.push(f); return f; };
  const rootEl = mk(root, null); rootEl.style.left = (root[1] - minC) * size + 'px'; rootEl.style.top = (root[0] - minR) * size + 'px'; inner.append(rootEl);
  const seen = new Set([key(...root)]), q = [[root, rootEl]];
  while (q.length) {
    const [cell, el] = q.shift();
    for (const [r, c, d] of nb(cell)) {
      if (seen.has(key(r, c))) continue; seen.add(key(r, c));
      const f = mk([r, c], d), ps = { E: [size, 0, 'left center'], W: [-size, 0, 'right center'], S: [0, size, 'center top'], N: [0, -size, 'center bottom'] }[d];
      f.style.left = ps[0] + 'px'; f.style.top = ps[1] + 'px'; f.style.transformOrigin = ps[2]; el.append(f); q.push([[r, c], f]);
    }
  }
  inner.fold = on => { inner.classList.toggle('folded', on); faces.forEach(f => { if (f._dir) f.style.transform = on ? FOLD[f._dir] : 'none'; }); };
  return inner;
}
R.nets = (st, p, api) => {
  if (p.die) return netDie(st, p, api);
  const ok = p.nets.map(netOK); const sel = p.nets.map(() => false); let canFold = false;
  const cards = p.nets.map((cells, i) => {
    const rows = Math.max(...cells.map(c => c[0])) - Math.min(...cells.map(c => c[0])) + 1, cols = Math.max(...cells.map(c => c[1])) - Math.min(...cells.map(c => c[1])) + 1;
    const size = Math.min(30, Math.floor(160 / cols), Math.floor(118 / rows));
    const n3 = net3D(cells, size); let folded = false;
    const scene = h('div', { class: 'c2-scene' }, n3);
    const pk = h('div', { class: 'pk' });
    const fb = h('button', { class: 'btn alt c2-foldb', onclick: e => { e.stopPropagation(); folded = !folded; n3.fold(folded); fb.textContent = folded ? 'Unfold' : 'Fold ▶'; snd.pop(); } }, 'Fold ▶');
    fb.hidden = true;
    const card = h('div', { class: 'c2-netcard', role: 'button', tabindex: 0, 'aria-pressed': 'false', 'aria-label': `Net ${i + 1}. Click to choose it.` }, h('div', { class: 'pk' }, `Net ${i + 1}`), scene, pk, fb);
    const upd = () => { card.classList.toggle('on', sel[i]); card.setAttribute('aria-pressed', sel[i] ? 'true' : 'false'); pk.textContent = sel[i] ? '✓ Makes a cube' : 'Click if it makes a cube'; };
    const tog = () => { if (api.done()) return; sel[i] = !sel[i]; snd.pop(); upd(); };
    card.addEventListener('click', tog); card.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target === card) { e.preventDefault(); tog(); } });
    upd();
    return { card, fb, set: v => { folded = v; n3.fold(v); fb.textContent = v ? 'Unfold' : 'Fold ▶'; }, upd, good: () => card.classList.add('good') };
  });
  const unlock = () => { canFold = true; cards.forEach(c => c.fb.hidden = false); };
  api.button('✅ Check', () => {
    if (!sel.some(Boolean)) return api.nudge('Click the nets you think fold into a cube first.');
    const wrongPick = sel.findIndex((s, i) => s && !ok[i]), missed = ok.findIndex((g, i) => g && !sel[i]);
    if (wrongPick < 0 && missed < 0) { cards.forEach((c, i) => { if (ok[i]) { c.good(); c.set(true); } }); api.say('Yes! Watch them fold.'); winLater(api, 1400); return; }
    const was = canFold; unlock();
    api.nudge((wrongPick >= 0 ? `Net ${wrongPick + 1} can’t fold into a cube.` : 'You missed one: another net works too.') + (was ? ' Use the Fold buttons to test them.' : ' Now you can test each net with its Fold button!'));
  });
  st.append(h('div', { class: 'c2-nets' }, cards.map(c => c.card)));
  return {
    hint(l) { if (l >= 2) unlock(); },
    solve() { unlock(); cards.forEach((c, i) => { sel[i] = ok[i]; c.upd(); if (ok[i]) { c.good(); c.set(true); } }); winLater(api, 1400); },
  };
};
function netDie(st, p, api) {
  const cells = p.nets[0], lab = netFold(cells);
  const iOf = p.nums.indexOf(p.of);
  const opp = p.nums[lab.indexOf(lab[iOf] ^ 1)];
  const touches = x => { const [a, b] = cells[p.nums.indexOf(x)], [c, d] = cells[iOf]; return Math.abs(a - c) + Math.abs(b - d) === 1; };
  const n3 = net3D(cells, 54, p.nums); let folded = false;
  const fb = h('button', { class: 'btn alt', onclick: () => { folded = !folded; n3.fold(folded); fb.textContent = folded ? 'Unfold' : 'Fold it ▶'; snd.pop(); } }, 'Fold it ▶');
  fb.hidden = true;
  const others = p.nums.filter(x => x !== p.of);
  const ask = choiceAsk(api, `Which number ends up opposite the ${p.of}?`, others.map(x => ({ t: String(x), ok: x === opp, no: `Not ${x}. ${touches(x) ? `In the net, ${x} touches the ${p.of}, so they end up side by side.` : 'Those two end up side by side.'} Fold it to check!` })),
    () => { folded = true; n3.fold(true); fb.hidden = false; fb.textContent = 'Unfold'; winLater(api, 1500); });
  $$('.choice', ask).forEach(b => b.addEventListener('click', () => { if (!api.done()) fb.hidden = false; }));
  st.append(h('div', { class: 'c2-row' }, h('div', { class: 'c2-scene big' }, n3), h('div', { class: 'c2-col' }, ask, fb)));
  return { hint(l) { if (l >= 2) fb.hidden = false; }, solve() { fb.hidden = false; ask.pick(others.indexOf(opp)); } };
}

/* ================================================================ 9. river crossings */
function riverDanger(p, ids, sideName) {
  const byId = Object.fromEntries(p.chars.map(c => [c.id, c]));
  if (p.eats && !(p.guard && ids.includes(p.guard))) for (const [a, b] of p.eats) if (ids.includes(a) && ids.includes(b)) return `the ${byId[a].name.toLowerCase()} would eat the ${byId[b].name.toLowerCase()} on the ${sideName} side`;
  if (p.outnumber) {
    const [big, small] = p.outnumber, nb = ids.filter(i => byId[i].kind === big).length, ns = ids.filter(i => byId[i].kind === small).length;
    if (ns > 0 && nb > ns) return `the ${p.kindNames[big]} would outnumber the ${p.kindNames[small]} on the ${sideName} side`;
  }
  return null;
}
function riverTrip(p, side, bs, group) { // returns {side, bs} or {why, kind}
  const byId = Object.fromEntries(p.chars.map(c => [c.id, c]));
  if (!group.length) return { why: 'Put someone on the raft first.', kind: 'empty' };
  if (sumOf(group.map(id => byId[id].w || 1)) > p.cap) return { why: p.capMsg || 'The raft is too full.', kind: 'cap' };
  if (!group.some(id => p.anyRow || byId[id].row)) return { why: p.rowMsg || 'Someone on the raft has to paddle.', kind: 'row' };
  const ns = { ...side }, nb = bs === 'L' ? 'R' : 'L'; group.forEach(id => ns[id] = nb);
  const ids = p.chars.map(c => c.id);
  const why = riverDanger(p, ids.filter(i => ns[i] === 'L'), 'left') || riverDanger(p, ids.filter(i => ns[i] === 'R'), 'right');
  return why ? { why, kind: 'danger' } : { side: ns, bs: nb };
}
function riverBFS(p, side0, bs0) {
  const ids = p.chars.map(c => c.id), key = (sd, bs) => ids.map(i => sd[i]).join('') + bs;
  const prev = new Map([[key(side0, bs0), null]]), q = [{ side: side0, bs: bs0 }];
  while (q.length) {
    const s = q.shift();
    if (ids.every(i => s.side[i] === 'R')) { const path = []; let k = key(s.side, s.bs); while (prev.get(k)) { const [pk, g] = prev.get(k); path.unshift(g); k = pk; } return path; }
    const here = ids.filter(i => s.side[i] === s.bs);
    for (let m = 1; m < (1 << here.length); m++) {
      const g = here.filter((_, i) => m >> i & 1); if (g.length > (p.seats || 2)) continue;
      const t = riverTrip(p, s.side, s.bs, g); if (t.why) continue;
      const kt = key(t.side, t.bs); if (!prev.has(kt)) { prev.set(kt, [key(s.side, s.bs), g]); q.push(t); }
    }
  }
  return null;
}
R.river = (st, p, api) => {
  const byId = Object.fromEntries(p.chars.map(c => [c.id, c])), ids = p.chars.map(c => c.id);
  let side = Object.fromEntries(ids.map(i => [i, 'L'])), bs = 'L', boat = [], trips = 0, busy = false;
  const hist = [], log = [];
  const seats = p.seats || 2;
  const bankL = h('div', { class: 'c2-bank' }), bankR = h('div', { class: 'c2-bank' });
  const seatsEl = h('div', { class: 'c2-seats' });
  const raft = h('div', { class: 'c2-raft', style: { width: (seats * 68 + 8) + 'px' } }, seatsEl, h('div', { class: 'c2-plank' }));
  raft.style.setProperty('--rw', (seats * 68 + 8) + 'px');
  const flow = h('div', { class: 'c2-flow' }, raft);
  const riv = h('div', { class: 'c2-riv' + (ids.length > 4 ? ' many' : '') }, bankL, flow, bankR);
  const logEl = h('div', { class: 'c2-log' });
  const tripsEl = h('div', { class: 'c2-status' });
  const whoBtn = id => {
    const c = byId[id], inb = boat.includes(id);
    return h('button', { class: 'c2-who' + (c.small ? ' small' : '') + (inb ? ' inboat' : ''), 'aria-label': `${c.name}${p.showW ? ', ' + c.w + ' kilos' : ''}${inb ? ', on the raft' : ''}`, onclick: () => tap(id) },
      h('span', { class: 'e', html: c.e === 'shark' ? sharkSVG() : c.e }), h('span', { class: 'n' }, c.name), p.showW ? h('span', { class: 'w' }, `${c.w} kg`) : null);
  };
  function draw() {
    bankL.innerHTML = '<div class="bl">start</div>'; bankR.innerHTML = '<div class="bl">goal</div>';
    ids.forEach(id => { if (!boat.includes(id)) (side[id] === 'L' ? bankL : bankR).append(whoBtn(id)); });
    seatsEl.innerHTML = ''; boat.forEach(id => seatsEl.append(whoBtn(id)));
    raft.classList.toggle('atR', bs === 'R');
    tripsEl.innerHTML = `Trips: <b>${trips}</b>`;
    logEl.innerHTML = log.length ? log.map((t, k) => `<span class="${k === log.length - 1 ? 'new' : ''}">${t}</span>`).join('') : '<span>Click someone to put them on the raft.</span>';
  }
  const load = list => sumOf(list.map(i => byId[i].w || 1));
  function tap(id) {
    if (api.done() || busy) return;
    if (boat.includes(id)) { boat = boat.filter(x => x !== id); snd.pop(); draw(); return; }
    if (side[id] !== bs) return api.nudge(`The raft is on the other side, so ${byId[id].name} can’t get on.`);
    if (boat.length >= seats || load([...boat, id]) > p.cap) return api.nudge(p.capMsg || 'The raft is full!');
    boat.push(id); snd.drop(); draw();
  }
  const icon = id => byId[id].e === 'shark' ? '🦈' : byId[id].e;
  async function cross() {
    if (api.done() || busy) return;
    const t = riverTrip(p, side, bs, boat);
    if (t.why) return api.nudge(t.kind === 'danger' ? `Wait! If the raft goes now, ${t.why}. Try something else.` : t.why);
    busy = true; hist.push({ side: { ...side }, bs, trips, log: log.length });
    const goingR = bs === 'L';
    bs = t.bs; raft.classList.toggle('atR', bs === 'R'); snd.drop();
    await sleep(850);
    side = t.side; trips++; log.push(goingR ? `${boat.map(icon).join('')} ➜` : `⬅ ${boat.map(icon).join('')}`);
    boat = []; busy = false; draw();
    if (api.done()) return;
    if (ids.every(i => side[i] === 'R')) { api.say(`Everyone is across in ${plural(trips, 'trip')}!`); winLater(api, 500); }
  }
  const crossBtn = h('button', { class: 'btn coral big', onclick: cross }, '⛵ Cross');
  api.button('↶ Undo', () => { if (busy || !hist.length || api.done()) return; const s = hist.pop(); side = s.side; bs = s.bs; trips = s.trips; log.length = s.log; boat = []; snd.bloop(); draw(); }, 'btn alt');
  st.append(h('div', { class: 'c2-rules' }, p.rules.map(r => h('div', { html: r }))), riv, h('div', { class: 'c2-row' }, crossBtn, tripsEl, logEl));
  draw();
  return {
    async solve() {
      while (busy) await sleep(100);
      boat = []; draw();
      const path = riverBFS(p, side, bs) || [];
      for (const g of path) {
        if (api.done()) return;
        for (const id of g) { boat.push(id); draw(); snd.pop(); await sleep(260); }
        await cross(); await sleep(250);
      }
    },
  };
};

/* ================================================================ content */
const FISH = (c, o = {}) => ({ c, ...o });
const NUM = n => ({ n });
const EVEN = { t: 'Even', yes: 'is even', no: 'is not even', f: it => it.n % 2 === 0 };
const ODD = { t: 'Odd', yes: 'is odd', no: 'is not odd', f: it => it.n % 2 === 1 };
const FINN = { id: 'finn', e: 'shark', name: 'Finn', row: true };
const FINN_ROWS = 'Only Finn can push the raft. Put Finn on it!';

const CH2 = [
/* ---------------------------------------------------------------- 1 */
{ ch: 2, id: 'machines', name: 'Machine Reef', emoji: '⚙️', creature: '🐌', prize: '🦕', prizeName: 'sea monster', concept: 'Number machines and rules',
  teaches: 'Function machines: finding a rule from examples (and checking it on every example), running a machine backwards with the opposite operation, and chaining machines, where order matters.',
  puzzles: [
  { type: 'machine', mode: 'rule', ms: ['+3'], hide: [0], cards: ['x2', '+3', '+5', '-3'], ex: [2, 4, 7],
    task: 'A number goes into this machine and a new number comes out. Find the secret rule! Drag the right card onto the ? on the machine.',
    hints: ['Look at the table. 2 goes in and 5 comes out. What happened to the 2?', '2 → 5, 4 → 7, 7 → 10. Each time the number goes up by the same amount.'],
    walk: 'Each number comes out 3 bigger: 2 + 3 = 5, 4 + 3 = 7, 7 + 3 = 10. Drag the + 3 card onto the machine.',
    explain: 'The machine does the same thing every time. Its rule is “add 3”. Finding a rule from examples is what mathematicians do all the time.' },
  { type: 'machine', mode: 'rule', ms: ['x2'], hide: [0], cards: ['+3', '+2', 'x2', '-1'], ex: [3, 5, 1],
    task: 'A new machine. You can feed it your own numbers to test it. Then find its rule.',
    hints: ['3 → 6 could be “add 3”. But does “add 3” work for 5?', '5 → 10 and 1 → 2. The number that comes out is always twice as big.'],
    walk: '3 → 6, 5 → 10, 1 → 2. Each number is doubled. Drag the × 2 card onto the machine.',
    explain: 'One example can fool you: 3 → 6 looks like “add 3”. Always check the rule on every example.' },
  { type: 'machine', mode: 'rule', ms: ['-4'], hide: [0], cards: ['+4', '-3', '/2', '-4'], ex: [10, 7, 12],
    task: 'This machine makes numbers smaller. What is its rule?',
    hints: ['10 goes in and 6 comes out. How much smaller is 6 than 10?', 'Now check the other two: 7 → 3 and 12 → 8.'],
    walk: '10 − 4 = 6, 7 − 4 = 3, 12 − 4 = 8. The rule is “take away 4”.',
    explain: 'The rule is “take away 4”. The gap between what goes in and what comes out is always 4.' },
  { type: 'machine', mode: 'in', ms: ['+7'], target: 15,
    task: 'This machine adds 7. Finn wants 15 to come out. Which number should he put in?',
    hints: ['Guess a number and feed it in. Was the answer too big or too small?', 'Run the machine backwards. The opposite of adding 7 is taking away 7.'],
    walk: 'Backwards: 15 − 7 = 8. Check: 8 + 7 = 15.',
    explain: 'To run a machine backwards, do the opposite. The opposite of “add 7” is “take away 7”.' },
  { type: 'machine', mode: 'in', ms: ['x2'], target: 18,
    task: 'This machine doubles. Which number goes in if 18 comes out?',
    hints: ['Doubling means adding a number to itself.', 'The opposite of doubling is halving. What is half of 18?'],
    walk: 'Half of 18 is 9. Check: 9 + 9 = 18.',
    explain: 'The opposite of doubling is halving: 18 → 9.' },
  { type: 'machine', mode: 'in', ms: ['x2', '+3'], target: 17,
    task: 'Two machines in a row! The first one doubles, the second one adds 3. 17 comes out at the end. What went in?',
    hints: ['Go backwards from 17. Undo the last machine first.', 'Undo “+ 3”: 17 − 3 = 14. Then undo “× 2”.'],
    walk: '17 − 3 = 14, and half of 14 is 7. Check: 7 × 2 = 14, and 14 + 3 = 17.',
    explain: 'Going backwards through a chain, undo the last machine first. It is like rewinding a video.' },
  { type: 'machine', mode: 'order', ms: ['+3', 'x2'], input: 5, target: 16,
    task: 'Put the two machines in the right order, so that 5 goes in and 16 comes out.',
    hints: ['Try one order and watch what comes out.', '5 × 2 = 10, and 10 + 3 = 13. Not 16! What if you add 3 first?'],
    walk: 'First + 3, then × 2: 5 + 3 = 8, and 8 × 2 = 16.',
    explain: 'Order matters! Adding then doubling gives 16. Doubling then adding gives 13.' },
  { type: 'machine', mode: 'rule', ms: ['x2', '+1'], hide: [0, 1], cards: ['+2', 'x3', '+1', '-1', 'x2'], ex: [1, 2, 5],
    task: 'Two secret machines! Find both rules. Use the cards, and test numbers if you like.',
    hints: ['The answers 3, 5, 11 grow fast. Maybe one machine doubles.', 'Double first: 1 → 2, 2 → 4, 5 → 10. Each one is 1 short. What does the second machine do?'],
    walk: 'First × 2, then + 1: 1 → 2 → 3, 2 → 4 → 5, 5 → 10 → 11.',
    explain: 'Two simple rules can make a trickier one: double, then add 1.' },
  { type: 'machine', mode: 'in', ms: ['+4', 'x2', '-6'], target: 20,
    task: 'Three machines! 20 comes out at the end. What number went in?',
    hints: ['Start at the end with 20. Undo “− 6” first.', '20 + 6 = 26. Half of 26 is 13. Then undo “+ 4”.'],
    walk: '20 + 6 = 26, half of 26 is 13, and 13 − 4 = 9. Check: 9 + 4 = 13, 13 × 2 = 26, 26 − 6 = 20.',
    explain: 'Long chains are easy backwards: undo each step, last one first.' },
  ] },
/* ---------------------------------------------------------------- 2 */
{ ch: 2, id: 'coins', name: 'Treasure Cove', emoji: '🪙', creature: '🦜', prize: '🐲', prizeName: 'treasure dragon', concept: 'Coins and money',
  teaches: 'Paying exact amounts, the fewest-coins idea (and a coin set where taking the biggest coin first fails), sharing fairly, and listing every way to make an amount in an organised table.',
  puzzles: [
  { type: 'coins', mode: 'pay', wallet: [5, 2, 2, 1, 1, 1], target: 8, item: '🐚', itemName: 'A shiny shell',
    task: 'Pay exactly 8 for the shiny shell. Drag coins from your purse onto the counter.',
    hints: ['Start with your biggest coin, the 5.', '5 and 3 more makes 8. Which coins make 3?'],
    walk: '5 + 2 + 1 = 8. (5 + 1 + 1 + 1 works too.)',
    explain: 'There can be more than one way to pay. Starting with the biggest coin makes it quick.' },
  { type: 'coins', mode: 'fewest', types: [10, 5, 2, 1], target: 17, item: '🗺️', itemName: 'A treasure map',
    task: 'The treasure map costs 17. Pay exactly 17 with as few coins as you can.',
    hints: ['Use big coins first. What is the biggest coin that fits into 17?', 'Take a 10 first. Then 7 is left. Which big coin fits into 7?'],
    walk: '10 + 5 + 2 = 17. That is only 3 coins.',
    explain: 'To use the fewest coins, take the biggest coin that fits, again and again. It works with 10, 5, 2 and 1.' },
  { type: 'coins', mode: 'fewest', types: [10, 5, 2, 1], target: 9, item: '🧭', itemName: 'A compass',
    task: 'Now pay 9 for the compass, with as few coins as you can.',
    hints: ['Start with the 5. How much is left?', '4 is left. Two coins can make 4.'],
    walk: '5 + 2 + 2 = 9. Three coins.',
    explain: '5 + 2 + 2 uses only 3 coins. Biggest coin first, then the next biggest, finds it fast.' },
  { type: 'coins', mode: 'ways', types: [2, 1], target: 5,
    task: 'In how many different ways can you make 5 with 2-coins and 1-coins? Build each way with the + and − buttons, then add it to your list.',
    hints: ['Start with as many 2s as you can. Then use one 2 fewer.', 'Two 2s, one 2, no 2s. Fill up the rest with 1s.'],
    walk: '2 + 2 + 1, then 2 + 1 + 1 + 1, then 1 + 1 + 1 + 1 + 1. That is 3 ways.',
    explain: 'Going in order (most 2s first, then fewer) means you can be sure you did not miss a way.' },
  { type: 'coins', mode: 'split', wallet: [5, 5, 2, 2, 2, 1, 1], target: 9,
    task: 'Two pirates found these coins. Share them so both pirates get the same amount. Every coin must be used.',
    hints: ['Add up all the coins first. How much should each pirate get?', 'All the coins make 18, so each pirate gets 9. Give each pirate one 5.'],
    walk: 'Pete gets 5 + 2 + 2 = 9. Polly gets 5 + 2 + 1 + 1 = 9.',
    explain: 'First find the total, then halve it. Then you know what each pile must add up to.' },
  { type: 'coins', mode: 'ways', types: [5, 2, 1], target: 7,
    task: 'How many ways can you make 7 with 5s, 2s and 1s?',
    hints: ['Start with the ways that use a 5. Then find the ways with no 5.', 'With a 5, 2 is left to make. With no 5, use three 2s, then two, then one, then none.'],
    walk: '5 + 2 and 5 + 1 + 1. Then 2 + 2 + 2 + 1, 2 + 2 + 1 + 1 + 1, 2 + 1 + 1 + 1 + 1 + 1, and seven 1s. That is 6 ways.',
    explain: 'Sort the ways by the biggest coin first. Then each group is easy to finish, and none get lost.' },
  { type: 'coins', mode: 'fewest', types: [4, 3, 1], target: 6, item: '🔭', itemName: 'A telescope',
    task: 'On Odd Island the coins are 1, 3 and 4. Pay 6 for the telescope with as few coins as you can.',
    hints: ['Try the biggest coin first: 4 + 1 + 1. That is 3 coins. Is there a way with only 2?', 'What about using two coins that are the same?'],
    walk: '3 + 3 = 6. Only 2 coins! Taking the 4 first needs 3 coins.',
    explain: 'Biggest-first does not always win! With strange coins, check other ways too.' },
  { type: 'coins', mode: 'exact', types: [5, 2], target: 21, count: 6,
    task: 'A pirate has 6 coins. They are all 5s and 2s, and they add up to 21. How many of each does the pirate have? Build it.',
    hints: ['Start with six 2s: that makes 12. Too small! Swap a 2 for a 5. What happens to the total?', 'Each swap of a 2 for a 5 adds 3. From 12 you need 9 more, so swap 3 times.'],
    walk: 'Three 5s and three 2s: 15 + 6 = 21, and 3 + 3 = 6 coins.',
    explain: 'Swapping one coin for another changes the total by the same amount each time. Here every swap added 3.' },
  { type: 'coins', mode: 'ways', types: [5, 2, 1], target: 10,
    task: 'The big one! How many ways can you make 10 with 5s, 2s and 1s? Find them all.',
    hints: ['Be organised. First use two 5s, then one 5, then no 5s.', 'With one 5 there are 3 ways. With no 5s, use five 2s, then four, three… down to none.'],
    walk: 'Two 5s: 1 way. One 5: 5 + 2 + 2 + 1, 5 + 2 + 1 + 1 + 1, 5 + 1 + 1 + 1 + 1 + 1 (3 ways). No 5s: five 2s, four, three, two, one or none (6 ways). 1 + 3 + 6 = 10 ways.',
    explain: 'A tidy table, with the biggest coins first, finds every way exactly once. There are 10 ways.' },
  ] },
/* ---------------------------------------------------------------- 3 */
{ ch: 2, id: 'clocks', name: 'Tick-Tock Bay', emoji: '⏰', creature: '🐸', prize: '🐊', prizeName: 'tick-tock crocodile', concept: 'Time and calendars',
  teaches: 'Elapsed time on an analogue clock (counting on to the next o’clock, then adding the rest, also past 12), and the 7-day cycle: jumping whole weeks forwards or backwards, dates 7 apart, and odd dates in a month.',
  puzzles: [
  { type: 'clock', mode: 'go', start: 180, add: 120,
    task: 'Finn starts his nap at 3 o’clock. He sleeps for 2 hours. Move the hands to show when he wakes up, then press Check.',
    hints: ['Drag the short hour hand, or use the “1 hour ▶” button.', 'One hour after 3 o’clock is 4 o’clock. One more hour is…'],
    walk: '3 o’clock + 2 hours = 5 o’clock. The short hand points at 5, and the long hand points at 12.',
    explain: 'The short hand shows the hour. Every hour it moves on to the next number.' },
  { type: 'clock', mode: 'go', start: 270, add: 45,
    task: 'The swim race starts at half past 4 and takes 45 minutes. When does it end? Move the long minute hand, then press Check.',
    hints: ['For the long hand, each number on the clock is 5 minutes.', '30 minutes gets you to 5 o’clock. Then 15 minutes more.'],
    walk: '4:30 + 30 minutes = 5:00. Then 15 more minutes = 5:15. The long hand points at the 3.',
    explain: 'Count up to the next o’clock first, then add the rest: 4:30 → 5:00 → 5:15.' },
  { type: 'clock', mode: 'how', start: 135, end: 180,
    task: 'Shell school starts at 2:15 and ends at 3:00. How many minutes is that?',
    hints: ['Move the long hand from 2:15 to 3:00 and count in 5s.', 'From the 3 on the clock round to the 12 is 9 jumps of 5 minutes.'],
    walk: '2:15 → 3:00 is 45 minutes: 9 jumps of 5.',
    explain: 'A whole hour is 60 minutes. From quarter past to o’clock is three quarters of an hour: 45 minutes.' },
  { type: 'clock', mode: 'go', start: 700, add: 50,
    task: 'Lunch starts at 11:40 and lasts 50 minutes. When does it end?',
    hints: ['Count to 12 o’clock first. How many minutes is it from 11:40 to 12:00?', '20 minutes gets you to 12:00. 30 minutes are still left.'],
    walk: '11:40 + 20 minutes = 12:00. 12:00 + 30 minutes = 12:30.',
    explain: 'Jump to the next o’clock first: 11:40 → 12:00 is 20 minutes. Then add what is left.' },
  { type: 'clock', mode: 'how', start: 590, end: 670,
    task: 'Finn’s trip starts at 9:50 and ends at 11:10. How many minutes long is the trip?',
    hints: ['Break it up: 9:50 to 10:00, then 10:00 to 11:00, then 11:00 to 11:10.', '10 minutes + 60 minutes + 10 minutes.'],
    walk: '9:50 → 10:00 is 10 minutes, 10:00 → 11:00 is 60 minutes, 11:00 → 11:10 is 10 minutes. 10 + 60 + 10 = 80 minutes.',
    explain: 'Break time into easy pieces: up to the o’clock, whole hours, then the rest. 1 hour = 60 minutes.' },
  { type: 'week', start: 0, n: 10,
    task: 'Today is Monday. Finn’s party is in 10 days. What day of the week will it be?',
    hints: ['Use the hop buttons. A jump of 7 days brings you back to Monday!', '10 days = 7 days and 3 more days.'],
    walk: '7 days after Monday is Monday again. 3 more days: Tuesday, Wednesday, Thursday.',
    explain: 'The days of the week go round in a circle of 7. Jumping 7 days lands on the same day.' },
  { type: 'week', start: 2, n: -9,
    task: 'Today is Wednesday. What day of the week was it 9 days ago?',
    hints: ['Go backwards. 7 days ago was also a Wednesday.', '9 days = 7 days and 2 more. What is 2 days before Wednesday?'],
    walk: '7 days ago: Wednesday. 2 more days back: Tuesday, Monday.',
    explain: 'Backwards works the same way: take away whole weeks, then count the few days that are left.' },
  { type: 'week', start: 0, n: 21, date: 3,
    task: 'The 3rd of June is a Monday. What day of the week is the 24th of June?',
    hints: ['From the 3rd to the 24th is 21 days.', '21 days is exactly 3 weeks. What happens after whole weeks?'],
    walk: '24 − 3 = 21 days = 3 weeks. So the 24th is a Monday too. The 3rd, 10th, 17th and 24th are all Mondays.',
    explain: 'Dates 7 apart fall on the same day of the week: 3, 10, 17, 24 are all Mondays.' },
  { type: 'week', start: 4, n: 100,
    task: 'Today is Friday. What day of the week will it be in 100 days?',
    hints: ['Hop by whole weeks. How many 7s fit into 100?', '14 weeks is 98 days. Then 2 more days.'],
    walk: '14 × 7 = 98. After 98 days it is Friday again. 2 more days: Saturday, Sunday.',
    explain: '100 days = 14 weeks and 2 days. The 14 weeks change nothing, so only the 2 extra days count.' },
  { type: 'month', days: 31, first: 4, monthName: 'May', answer: 16, mark: d => d % 2 === 1, ask: 'How many days does Finn swim in May?',
    task: 'May has 31 days. Finn swims on every odd date: the 1st, 3rd, 5th and so on. How many days does he swim?', intro: 'You can click the days on the calendar to mark them.',
    hints: ['Pair the days up: 1 and 2, 3 and 4, 5 and 6… Each pair has one odd day.', '30 days make 15 pairs. Then the 31st is left over. Is 31 odd?'],
    walk: '15 pairs give 15 odd days, and the 31st is odd too: 16 swim days.',
    explain: 'From 1 to 31 there is one more odd number than even: 16 odd and 15 even. Pairing up shows why.' },
  ] },
/* ---------------------------------------------------------------- 4 */
{ ch: 2, id: 'venn', name: 'Circle Lagoon', emoji: '⭕', creature: '🦩', prize: '🐻‍❄️', prizeName: 'polar bear', concept: 'Sorting with overlapping circles',
  teaches: 'Venn diagrams: sorting by two properties at once (both, one, neither), working out the labels from a sorted picture, and counting with an overlap (12 + 9 − 4).',
  puzzles: [
  { type: 'venn', A: { t: 'Red fish', col: 'red', yes: 'is red', no: 'is not red', f: it => it.c === 'red' }, B: { t: 'Striped fish', col: 'purple', yes: 'it has stripes', no: 'it has no stripes', f: it => !!it.st },
    items: [FISH('red', { st: 1 }), FISH('blue', { st: 1 }), FISH('red'), FISH('yellow'), FISH('red', { st: 1 }), FISH('yellow', { st: 1 }), FISH('blue'), FISH('red')],
    task: 'Sort the fish! Red fish go in the red circle. Striped fish go in the purple circle. A fish that is both goes in the middle.',
    hints: ['Look at one fish at a time. Is it red? Does it have stripes?', 'A red fish with stripes is in BOTH circles: that is the middle. A fish that is neither goes outside.'],
    walk: 'Red with stripes → the middle. Red with no stripes → the red circle only. Stripes but not red → the purple circle only. Neither → outside.',
    explain: 'Two circles that overlap make four places: only the first, only the second, both (the middle), and neither (outside).' },
  { type: 'venn', A: { t: 'Big fish', col: 'red', yes: 'is big', no: 'is small', f: it => !!it.big }, B: { t: 'Fish with spots', col: 'purple', yes: 'it has spots', no: 'it has no spots', f: it => !!it.sp },
    items: [FISH('blue', { big: 1, sp: 1 }), FISH('green', { big: 1 }), FISH('orange', { sp: 1 }), FISH('yellow'), FISH('purple', { big: 1, sp: 1 }), FISH('red', { sp: 1 }), FISH('green'), FISH('orange', { big: 1 })],
    task: 'Big fish go in the red circle. Fish with spots go in the purple circle.',
    hints: ['Colour does not matter this time. Only look at size and spots.', 'A big fish with spots goes in the middle. A small fish with no spots goes outside.'],
    walk: 'Big with spots → the middle. Big, no spots → red only. Small with spots → purple only. Small, no spots → outside.',
    explain: 'The same circles can sort by any two questions. Here the questions were “Is it big?” and “Does it have spots?”' },
  { type: 'venn', A: { ...EVEN, t: 'Even numbers', col: 'red' }, B: { t: 'Bigger than 10', col: 'purple', yes: 'is bigger than 10', no: 'is not bigger than 10', f: it => it.n > 10 },
    items: [3, 8, 12, 15, 6, 14, 1, 11, 20].map(NUM),
    task: 'Now numbers! Even numbers go in the red circle. Numbers bigger than 10 go in the purple circle.',
    hints: ['Even numbers end in 0, 2, 4, 6 or 8.', '12 is even AND bigger than 10, so it goes in the middle. 3 is neither, so it goes outside.'],
    walk: 'Middle: 12, 14, 20. Even only: 6, 8. Bigger than 10 only: 11, 15. Outside: 1, 3.',
    explain: 'The middle holds the numbers that follow both rules: even and bigger than 10.' },
  { type: 'venn', A: { t: 'Count by 5s', col: 'red', yes: 'is in the 5s (5, 10, 15…)', no: 'is not in the 5s', f: it => it.n % 5 === 0 }, B: { ...EVEN, t: 'Even numbers', col: 'purple' },
    items: [10, 5, 4, 15, 7, 20, 8, 25, 9].map(NUM),
    task: 'The red circle is for numbers you say when you count by 5s: 5, 10, 15, 20… The purple circle is for even numbers.',
    hints: ['Counting by 5s: 5, 10, 15, 20, 25. Which of those are even?', '10 and 20 are in the 5s AND even. They go in the middle.'],
    walk: 'Middle: 10, 20. Count by 5s only: 5, 15, 25. Even only: 4, 8. Outside: 7, 9.',
    explain: 'Counting by 5s goes odd, even, odd, even: 5, 10, 15, 20. The even ones end in 0.' },
  { type: 'venn', mode: 'labels', A: EVEN, B: { t: 'Count by 3s', yes: 'is in the 3s', no: 'is not in the 3s', f: it => it.n % 3 === 0 },
    items: [2, 4, 8, 6, 12, 3, 9, 15, 1, 5, 7].map(NUM),
    cards: [{ t: 'Bigger than 5', yes: 'is bigger than 5', no: 'is not bigger than 5', f: it => it.n > 5 }, { t: 'Count by 3s', yes: 'is in the 3s (3, 6, 9…)', no: 'is not in the 3s (3, 6, 9…)', f: it => it.n % 3 === 0 }, ODD, EVEN],
    task: 'Someone sorted these numbers but lost the labels! Drag the right label onto each circle.',
    hints: ['Look at the red circle: 2, 4, 8, and 6, 12 in the middle. What do they all have in common?', 'The purple circle has 3, 9, 15, and 6, 12. Count by 3s: 3, 6, 9, 12, 15!'],
    walk: 'Red circle: Even. Purple circle: Count by 3s. 6 and 12 are both, so they sit in the middle.',
    explain: 'Each circle has a rule. The numbers in the middle follow both rules, like 6 and 12.' },
  { type: 'venn', mode: 'count', intro: 'Type a number into each part of the circles and press Enter. Then answer the question.', who: 'fish', A: { t: 'like worms', n: 12 }, B: { t: 'like shrimp', n: 9 }, AB: 4, total: 17, given: ['AB', 'N'],
    ask: 'How many fish are in the class?', answer: 17, wrong: n => n === 21 ? '12 + 9 = 21 counts the 4 fish who like both TWICE. Fill in the circles to see.' : null,
    task: 'In Finn’s class, 12 fish like worms 🪱 and 9 fish like shrimp 🦐. 4 fish like both. Every fish likes at least one. How many fish are in the class?',
    hints: ['Fill in the circles. The 4 fish who like both go in the middle.', 'Worms only: 12 − 4 = 8. Shrimp only: 9 − 4 = 5. Now add up the three parts.'],
    walk: '8 + 4 + 5 = 17 fish. (12 + 9 = 21 counts the 4 “both” fish twice, and 21 − 4 = 17.)',
    explain: 'If you just add 12 + 9, the fish who like both are counted twice. Take them away once: 12 + 9 − 4 = 17.' },
  { type: 'venn', mode: 'count', intro: 'Type a number into each part of the circles and press Enter. Then answer the question.', who: 'fish', A: { t: 'do flips', n: 11 }, B: { t: 'do spins', n: 8 }, AB: 3, total: 20, given: ['AB'],
    ask: 'How many fish can do neither trick?', answer: 4, wrong: n => n === 1 ? '20 − 11 − 8 = 1 forgets that 3 fish were counted twice. Fill in the circles first.' : null,
    task: '20 fish are in the dance club. 11 can do flips and 8 can do spins. 3 can do both. How many fish can do neither?',
    hints: ['Flips only: 11 − 3. Spins only: 8 − 3.', '8 + 3 + 5 = 16 fish can do at least one trick. The rest can do neither.'],
    walk: 'Flips only 8, both 3, spins only 5: that is 16 fish. 20 − 16 = 4 fish can do neither.',
    explain: 'The fish outside both circles are the “neither” group: the total minus everyone inside the circles.' },
  { type: 'venn', mode: 'count', intro: 'Type a number into each part of the circles and press Enter. Then answer the question.', who: 'fish', A: { t: 'like worms', n: 9 }, B: { t: 'like shrimp', n: 10 }, AB: 4, total: 15, given: ['N'],
    ask: 'How many fish like both?', answer: 4, wrong: n => n === 19 ? '19 is more than all 15 fish! The extra fish were counted twice.' : null,
    task: 'There are 15 fish. 9 like worms and 10 like shrimp. Every fish likes at least one. How many fish like both?',
    hints: ['9 + 10 = 19. But there are only 15 fish!', 'The 4 extra fish were counted twice. Those are the fish who like both.'],
    walk: '9 + 10 = 19, which is 4 more than 15. Those 4 were counted twice, so 4 fish like both.',
    explain: 'When the two circles add up to more than the total, the extra is the overlap.' },
  ] },
/* ---------------------------------------------------------------- 5 */
{ ch: 2, id: 'jugs', name: 'Jug Springs', emoji: '🏺', creature: '🦆', prize: '🦢', prizeName: 'swan', concept: 'Measuring with jugs',
  teaches: 'Planning and searching: filling, emptying and pouring between jugs to measure an exact amount, building on earlier tricks, sharing without a tap, and seeing when it is impossible (even jugs only make even amounts).',
  puzzles: [
  { type: 'jugs', caps: [3, 5], target: 2,
    task: 'You have a 3-cup jug, a 5-cup jug, and the whole sea to fill them from. Get exactly 2 cups of water in one jug.',
    hints: ['Fill the 5-cup jug from the sea.', 'Now pour from the 5 into the 3 until the 3 is full. What is left in the 5?'],
    walk: 'Fill the 5. Pour it into the 3. 5 − 3 = 2 cups stay in the big jug.',
    explain: 'Pouring a big jug into a small one until it is full is a way to take away: 5 − 3 = 2.' },
  { type: 'jugs', caps: [3, 5], target: 1,
    task: 'Same jugs. Now get exactly 1 cup.',
    hints: ['Fill the small jug and pour it into the big one. Then do it again.', 'The second time, the big jug only has room for 2 more cups.'],
    walk: 'Fill the 3 and pour it into the 5. Fill the 3 again and pour: only 2 cups fit. 1 cup stays in the small jug.',
    explain: '3 + 3 = 6, but the big jug holds only 5. So 1 cup is left over. Going past the top is a way to measure too.' },
  { type: 'jugs', caps: [3, 5], target: 4,
    task: 'The famous one: get exactly 4 cups.',
    hints: ['You already know how to make 2 cups in the big jug. Can that help?', 'Make 2 in the big jug and move it into the small jug. Then fill the big jug again and top up the small one.'],
    walk: 'Fill the 5, pour into the 3 (2 left). Empty the 3. Pour the 2 into the 3. Fill the 5 again. Pour into the 3 until it is full: only 1 cup goes in. 4 cups stay in the big jug!',
    explain: 'Small tricks join up into a big one: first make 2, then use it to make 4. Filling the 3 again and again works too.' },
  { type: 'jugs', caps: [4, 7], target: 6,
    task: 'New jugs: 4 cups and 7 cups. Get exactly 6 cups.',
    hints: ['6 is 1 less than 7. Can you fill the 7 and pour out just 1 cup?', 'Get 3 cups into the 4-cup jug first. Then fill the 7 and top up the 4.'],
    walk: 'Fill the 7, pour into the 4 (3 left). Empty the 4. Pour the 3 into the 4. Fill the 7 again and pour into the 4: only 1 cup fits. 6 cups stay!',
    explain: 'To make 6, take 1 away from 7. You made a jug with room for exactly 1 cup.' },
  { type: 'jugs', caps: [3, 7], target: 5,
    task: 'Jugs of 3 cups and 7 cups. Get exactly 5 cups.',
    hints: ['Try making 1 cup first: fill the 7 and pour into the 3 twice.', 'With 1 cup in the 3-cup jug, there is room for 2 more. 7 − 2 = 5.'],
    walk: 'Fill 7, pour into 3, empty 3, pour into 3 again: 1 cup is left. Empty 3, put the 1 cup in it. Fill 7 and top up the 3: 2 cups go in, 5 stay.',
    explain: 'You can build any small amount first and then use it. 7 − 3 − 3 = 1, and 7 − 2 = 5.' },
  { type: 'jugs', caps: [4, 6], target: 3, impossible: true,
    task: 'Jugs of 4 cups and 6 cups. Can you get exactly 3 cups? If you think it is impossible, press “It can’t be done”.',
    hints: ['Play a bit. Look at every amount you can make. Do you notice anything?', 'Every amount is 0, 2, 4 or 6. Always even! 4 and 6 are even, so pouring never makes an odd amount.'],
    walk: 'Filling, emptying or pouring with 4 and 6 only ever makes even amounts. 3 is odd, so it can’t be done.',
    explain: 'Sometimes the smart answer is “impossible”. Even jugs can only ever make even amounts.' },
  { type: 'jugs', caps: [8, 5, 3], start: [8, 0, 0], share: 4, sea: false,
    task: 'No sea this time! The 8-cup jug is full of juice. Share it fairly: 4 cups in one jug and 4 cups in another.',
    hints: ['You can only pour between the jugs now. Start by pouring the 8 into the 5.', 'Try to make 4 in the 5-cup jug, while the 8-cup jug keeps the rest.'],
    walk: '8→5, 5→3, 3→8, 5→3, 8→5, 5→3, 3→8. Now the 8 and the 5 both hold 4.',
    explain: 'With no sea, the juice just moves around. Planning many pours ahead is what puzzle solvers do.' },
  { type: 'jugs', caps: [10, 7, 3], start: [10, 0, 0], share: 5, sea: false,
    task: 'The hardest jug puzzle! Share 10 cups of juice so that two jugs hold 5 cups each.',
    hints: ['Pour the 10 into the 3, and the 3 into the 7. Keep doing that, and watch the numbers.', 'Try to make 5 in the 7-cup jug, using the 3-cup jug as a scoop.'],
    walk: 'One way: 10→3, 3→7, 10→3, 3→7, 10→3, 3→7 (the 7 is now full and 2 stay in the 3), 7→10, 3→7, 10→3, 3→7. Now the 10 and the 7 both hold 5.',
    explain: 'Long puzzles are many small steps. Using the small jug as a scoop again and again gets you there.' },
  ] },
/* ---------------------------------------------------------------- 6 */
{ ch: 2, id: 'pearls', name: 'Pearl Grotto', emoji: '🦪', creature: '🦪', prize: '🧜‍♀️', prizeName: 'mermaid', concept: 'Finding the fake with a balance',
  teaches: 'Weighing strategy: every weighing has three results, so split into three groups (two on the scale, one off). 3 pearls need 1 weighing, 9 need 2, 27 need 3. The scale never picks the fake in advance, so lucky guesses do not work.',
  puzzles: [
  { type: 'pearls', n: 2, max: 1,
    task: 'One of these 2 pearls is a fake, and fakes are lighter. Put the pearls on the scale, press Weigh, then drag the fake into the 🔍 box.',
    hints: ['Put one pearl on each side of the scale, then press Weigh.', 'The lighter side goes up. The fake is on that side.'],
    walk: 'Pearl 1 on the left, pearl 2 on the right. Weigh. The side that goes up has the fake.',
    explain: 'A balance compares two things. The lighter side goes up.' },
  { type: 'pearls', n: 3, max: 1,
    task: 'Now 3 pearls, and only 1 weighing! Find the lighter fake.',
    hints: ['You can leave a pearl off the scale.', 'Weigh pearl 1 against pearl 2. If the scale stays level, which one is the fake?'],
    walk: 'Weigh 1 against 2. If one side goes up, that pearl is the fake. If it stays level, both are real, so pearl 3 is the fake.',
    explain: 'The pearl you leave off the scale gets checked too! A level scale tells you the fake is the one left out.' },
  { type: 'pearls', n: 4, max: 2,
    task: '4 pearls. Find the lighter fake in at most 2 weighings.',
    hints: ['Try 1 against 1 first.', 'If it is level, the fake is one of the other two. Weigh them against each other.'],
    walk: 'Weigh 1 against 2. If one side goes up, you found it. If it is level, weigh 3 against 4.',
    explain: 'Each weighing splits the pearls into groups. Then you only keep looking in one small group.' },
  { type: 'pearls', n: 5, max: 2,
    task: '5 pearls, 2 weighings. Find the lighter fake.',
    hints: ['Put 2 pearls on each side and leave 1 off.', 'If it is level, the one left off is the fake. If not, the fake is one of the 2 on the side that went up. Weigh those two.'],
    walk: 'Weigh 2 against 2. Level? Then the fifth pearl is fake. Not level? Weigh the 2 from the lighter side against each other.',
    explain: 'Leaving some pearls off the scale is part of the plan. Groups of 2, 2 and 1 work here.' },
  { type: 'pearls', n: 9, max: 2,
    task: '9 pearls and only 2 weighings! Can you find the lighter fake?',
    hints: ['Split the 9 pearls into 3 groups of 3.', 'Weigh 3 against 3. Then you know which group of 3 has the fake. And you already know how to find a fake among 3 with one weighing!'],
    walk: 'Weigh 3 against 3, leaving 3 off. The fake is in the lighter group, or in the group left off if it is level. Then weigh 1 against 1 from that group.',
    explain: 'Split into 3 groups: two on the scale, one off. Each weighing makes the search 3 times smaller: 9 → 3 → 1.' },
  { type: 'pearls', n: 7, max: 2,
    task: '7 pearls, 2 weighings.',
    hints: ['Make 3 groups again, as equal as you can: 3, 3 and 1.', 'Weigh 3 against 3. If it is level, the one left off is the fake!'],
    walk: 'Weigh 3 against 3. Level? The seventh pearl is fake. Not level? Take the 3 from the lighter side and weigh 1 against 1.',
    explain: 'The groups do not have to be the same size. They just must not be bigger than 3, so one more weighing can finish the job.' },
  { type: 'pearls', n: 8, max: 2,
    task: '8 pearls, 2 weighings.',
    hints: ['Use groups of 3, 3 and 2.', 'If the scale is level, the fake is one of the 2 left off. Weigh them against each other.'],
    walk: 'Weigh 3 against 3. Level? Weigh the last 2 against each other. Not level? Weigh 1 against 1 from the lighter 3.',
    explain: 'Groups of 3, 3 and 2. Every group is small enough to finish with one more weighing.' },
  { type: 'pearls', n: 9, max: 2, heavy: true,
    task: 'Oh no, this time the fake pearl is HEAVIER. 9 pearls, 2 weighings.',
    hints: ['The same trick works. But which way does the scale tip now?', 'The side that goes DOWN has the fake.'],
    walk: 'Weigh 3 against 3. The heavier side (the one that goes down) has the fake, or it is in the 3 left off if the scale is level. Then weigh 1 against 1.',
    explain: 'Heavier or lighter, the three-groups trick works the same. Only the direction of the tip changes.' },
  { type: 'pearls', think: true,
    task: 'Finn sees a pattern: 1 weighing can search 3 pearls, and 2 weighings can search 9 pearls. How many pearls can 3 weighings search?',
    hints: ['1 weighing handles 3 pearls. 2 weighings handle 9: three groups of 3.', 'With 3 weighings, make three groups, each small enough for 2 weighings: 9 + 9 + 9.'],
    walk: 'Weigh 9 against 9 and leave 9 off. Then 2 weighings find the fake among those 9. That is 27 pearls.',
    explain: 'Each extra weighing triples how many pearls you can search: 3, 9, 27, 81…' },
  ] },
/* ---------------------------------------------------------------- 7 */
{ ch: 2, id: 'digits', name: 'Digit Docks', emoji: '🔢', creature: '🦎', prize: '🧜‍♂️', prizeName: 'merman', concept: 'Digits and place value',
  teaches: 'Place value: missing digits in sums and differences (carrying and borrowing), making the biggest or smallest number from digits, digit sums listed in order, and letter puzzles like AB + BA.',
  puzzles: [
  { type: 'digits', rows: ['3_', '25'], res: '61', op: '+',
    task: 'A digit fell off! Drag the missing digit into the empty box.',
    hints: ['Look at the ones column: ? + 5 ends in 1.', '6 + 5 = 11. Write 1 and carry 1. Check the tens: 3 + 2 + 1 = 6.'],
    walk: '36 + 25 = 61. The missing digit is 6.',
    explain: 'Start with the ones column. When it adds up to more than 9, carry 1 to the tens.' },
  { type: 'digits', rows: ['4_', '_7'], res: '82', op: '+',
    task: 'Two digits are missing now.',
    hints: ['Ones column: ? + 7 ends in 2. So ? + 7 must be 12.', 'The first box is 5, and 1 is carried. Tens: 4 + ? + 1 = 8.'],
    walk: '45 + 37 = 82.',
    explain: 'The carry is the secret. 5 + 7 = 12 sends a 1 over to the tens column.' },
  { type: 'digits', rows: ['5_', '_8'], res: '27', op: '-',
    task: 'A take-away with missing digits.',
    hints: ['Ones: ? − 8 ends in 7. You need to borrow: 1? − 8 = 7.', '15 − 8 = 7, so the first box is 5. After borrowing, the 5 tens became 4 tens. 4 − ? = 2.'],
    walk: '55 − 28 = 27.',
    explain: 'When the top digit is too small, borrow 10 from the next column. Check it: 27 + 28 = 55.' },
  { type: 'digits', mode: 'make', digits: [4, 9, 2], sizes: [3], goal: 'max',
    task: 'Use the digits 4, 9 and 2 to make the BIGGEST number you can.',
    hints: ['The first digit is worth the most. It counts hundreds!', 'Put the biggest digit first, then the next biggest.'],
    walk: '942.',
    explain: 'The left place is worth the most, so the biggest digits go on the left.' },
  { type: 'digits', mode: 'make', digits: [0, 7, 3], sizes: [3], goal: 'min',
    task: 'Use 0, 7 and 3 to make the SMALLEST 3-digit number. (A number can’t start with 0.)',
    hints: ['You want a small first digit, but it can’t be 0.', 'Put 3 first. Then the smallest digit that is left.'],
    walk: '307.',
    explain: '0 can’t go first, so the smallest first digit is 3. Then 0, then 7: 307.' },
  { type: 'digits', mode: 'make', digits: [1, 2, 3, 4], sizes: [2, 2], goal: 'maxsum',
    task: 'Use 1, 2, 3 and 4 once each to make two 2-digit numbers. Make their sum as BIG as you can.',
    hints: ['A digit in the tens place is worth 10 times as much. Which digits should go there?', 'Put 4 and 3 in the tens places, and 2 and 1 in the ones places.'],
    walk: '41 + 32 = 73. (42 + 31 = 73 works too.)',
    explain: 'The big digits belong in the tens places, because there they count 10 times as much.' },
  { type: 'digits', mode: 'list', test: n => Math.floor(n / 10) + n % 10 === 5, why: n => `${n}: ${Math.floor(n / 10)} + ${n % 10} = ${Math.floor(n / 10) + n % 10}, not 5.`,
    task: 'Find all the 2-digit numbers whose digits add up to 5. Build each one and add it to the list.',
    hints: ['Example: 23, because 2 + 3 = 5. Go in order of the tens digit: 1, 2, 3…', 'Tens 1 needs ones 4. Tens 2 needs ones 3. Keep going up to tens 5.'],
    walk: '14, 23, 32, 41, 50. That is 5 numbers.',
    explain: 'Going in order (tens 1, 2, 3, 4, 5) makes sure none are missed. Did you spot 50? 5 + 0 = 5.' },
  { type: 'digits', rows: ['A', 'A', 'A'], res: 'BA', op: '+', distinct: true,
    task: 'A letter puzzle! Each letter stands for a digit. The same letter is always the same digit, and different letters are different digits.',
    hints: ['A + A + A ends in A. Try some digits: 1 + 1 + 1 = 3. That ends in 3, not 1.', 'Try 5: 5 + 5 + 5 = 15. Does it end in 5?'],
    walk: 'A = 5 and B = 1: 5 + 5 + 5 = 15.',
    explain: 'Trying digits one by one is a fine way to start. Only A = 5 works here (0 does not, because then B would be 0 too).' },
  { type: 'digits', rows: ['AB', 'BA'], res: '77', op: '+', distinct: true,
    task: 'AB and BA are 2-digit numbers made from the same two digits, like 25 and 52. Find digits so that AB + BA = 77.',
    hints: ['Try a pair, like 25 + 52. What do you get?', 'Each digit is counted once as tens and once as ones. So A + B must be 7.'],
    walk: '16 + 61 = 77, 25 + 52 = 77, 34 + 43 = 77. Any two different digits that add up to 7 work!',
    explain: 'AB + BA is always 11 times (A + B). 77 = 11 × 7, so A + B = 7. Lots of answers!' },
  { type: 'digits', rows: ['AB', 'B'], res: 'BA', op: '+', distinct: true,
    task: 'A harder letter puzzle: AB + B = BA.',
    hints: ['Adding one digit can only make the tens go up by 1. So B is 1 more than A.', 'Ones: B + B must end in A. Try B = 9: 9 + 9 = 18. So A = 8?'],
    walk: '89 + 9 = 98. A = 8 and B = 9.',
    explain: 'Adding one digit can only bump the tens up by 1, so B = A + 1. And B + B must end in A. Only 89 + 9 = 98 works.' },
  ] },
/* ---------------------------------------------------------------- 8 */
{ ch: 2, id: 'cubes', name: 'Cube Canyon', emoji: '🧊', creature: '🐍', prize: '🦣', prizeName: 'woolly mammoth (it was frozen in an ice cube!)', concept: 'Cubes and nets',
  teaches: 'Seeing in 3D: counting cubes in stacks including hidden ones (by layers or by towers), nets that fold into a cube, which faces end up opposite, and the painted-cube puzzle.',
  puzzles: [
  { type: 'cubes', H: [[2, 2], [2, 2]], s: 56,
    task: 'How many cubes are in this stack? Some are hidden behind others! (Every cube sits on the floor or on another cube.)',
    hints: ['Count layer by layer. Press “Pull the layers apart”.', 'Each layer is 2 by 2. There are 2 layers.'],
    walk: 'Each layer has 4 cubes, and there are 2 layers: 4 + 4 = 8.',
    explain: 'Counting by layers finds the hidden cubes. 2 layers of 4 make 8.' },
  { type: 'cubes', H: [[3, 2, 1], [2, 1, 0], [1, 0, 0]],
    task: 'A staircase of cubes. How many cubes are there?',
    hints: ['Count the towers. How tall is each tower?', 'In the back row the towers are 3, 2 and 1 tall. Then 2 and 1. Then 1.'],
    walk: '3 + 2 + 1 + 2 + 1 + 1 = 10.',
    explain: 'Adding up the height of each tower is another way to find hidden cubes.' },
  { type: 'cubes', H: [[3, 3, 1], [3, 1, 1], [1, 1, 1]],
    task: 'A bigger stack. How many cubes?',
    hints: ['Pull the layers apart and count each layer.', 'The bottom layer is 3 by 3 = 9. The middle layer has 3. The top layer has 3.'],
    walk: '9 + 3 + 3 = 15.',
    explain: 'Layers: 9 + 3 + 3 = 15. The hidden cubes underneath still count!' },
  { type: 'cubes', H: [[3, 3, 3], [3, 2, 1], [3, 1, 0]], full: 3, ask: 'How many more cubes does Finn need?',
    wrong: n => n === 19 ? 'There are 19 cubes already. We want how many MORE are needed to reach 27.' : null,
    task: 'Finn wants to finish a big 3 × 3 × 3 cube. The dotted cubes are missing. How many more small cubes does he need?',
    hints: ['A full 3 × 3 × 3 cube has 3 layers of 9: that is 27 cubes.', 'Count the missing cubes in each layer, or count the cubes that are there and take that away from 27.'],
    walk: 'Missing: 1 in the bottom layer, 3 in the middle layer, 4 in the top layer. 1 + 3 + 4 = 8. (Or: 19 cubes are there, and 27 − 19 = 8.)',
    explain: 'Counting what is missing can be easier than counting what is there.' },
  { type: 'nets', nets: [[[0, 1], [1, 0], [1, 1], [1, 2], [2, 1], [3, 1]], [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]], [[0, 0], [1, 0], [1, 1], [1, 2], [1, 3], [2, 3]], [[1, 0], [1, 1], [1, 2], [1, 3], [0, 0], [0, 3]]],
    task: 'A net is a flat shape that folds up into a box. Which of these nets fold into a cube? Click every one that works, then press Check.',
    hints: ['A cube has 6 faces. When you fold, no two squares may land on the same face.', 'A 2 by 3 block folds into a tube with both ends open. Look for nets where squares can close the top and the bottom.'],
    walk: 'Net 1 (the cross) and net 3 (the zigzag) fold into cubes. Nets 2 and 4 leave a hole, and two squares bump into each other.',
    explain: 'A net is a cube cut open and laid flat. There are exactly 11 different nets for a cube!' },
  { type: 'nets', nets: [[[0, 0], [0, 1], [1, 1], [1, 2], [2, 2], [2, 3]], [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [1, 1]], [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0], [3, 0]], [[0, 0], [0, 1], [0, 2], [1, 2], [1, 3], [1, 4]]],
    task: 'More nets! Which ones fold into a cube?',
    hints: ['A row of 5 is too long: a cube is only 4 faces around.', 'A 2 by 2 block of squares can never fold into a cube: those four squares would all meet at one corner.'],
    walk: 'Net 1 (the staircase) and net 4 (two rows of 3) fold into cubes. Net 2 has a row of 5, and net 3 has a 2 by 2 block.',
    explain: 'Two quick tests: no row longer than 4, and no 2 by 2 block. Then fold it in your head to be sure.' },
  { type: 'nets', die: true, nets: [[[0, 0], [1, 0], [1, 1], [1, 2], [1, 3], [2, 3]]], nums: [1, 2, 3, 5, 4, 6], of: 3,
    task: 'This net folds into a dice. Which number ends up opposite the 3?',
    hints: ['In a straight row of 4 squares, squares two apart end up opposite: the 1st with the 3rd, and the 2nd with the 4th.', 'The row is 2, 3, 5, 4. The 3 is the 2nd square. Which is the 4th?'],
    walk: '3 and 4 are opposite. Fold it to check!',
    explain: 'In a row of squares, faces two apart end up opposite. On a real dice, opposite faces always add up to 7.' },
  { type: 'cubes', H: [[3, 3, 3], [3, 3, 3], [3, 3, 3]], s: 42, paint: true, answer: 1, ask: 'How many small cubes have no paint at all?',
    wrong: n => n === 0 ? 'Look again: is there a cube right in the middle that touches nothing outside?' : n === 27 ? 'Most of the cubes touch the outside, so they get paint.' : null,
    task: 'Finn paints the outside of this big cube red. Then he breaks it into the 27 small cubes. How many small cubes have no paint at all?',
    hints: ['A small cube gets paint if it touches the outside. Which cubes are hidden inside?', 'Pull the layers apart. In the middle layer, only the centre cube is hidden on every side.'],
    walk: 'Only the very middle cube touches no outside face. So 1 cube has no paint.',
    explain: 'Take away the painted outside and only a 1 × 1 × 1 cube is left in the middle.' },
  { type: 'cubes', H: [[3, 3, 3], [3, 3, 3], [3, 3, 3]], s: 42, paint: true, answer: 8, ask: 'How many small cubes have paint on 3 faces?',
    wrong: n => n === 4 ? 'You found the top corners! Do not forget the bottom ones.' : n === 12 ? 'Those are the cubes with 2 painted faces (the edges). We want 3.' : null,
    task: 'The same painted cube. How many small cubes have red paint on 3 of their faces?',
    hints: ['A cube with 3 painted faces must stick out in 3 directions. Where are those?', 'They are the corners of the big cube. Count the corners.'],
    walk: 'The corner cubes have 3 painted faces. A cube has 8 corners: 4 on the top and 4 on the bottom.',
    explain: 'Every corner cube shows 3 faces, and a cube has 8 corners. So 8 small cubes have 3 red faces.' },
  ] },
/* ---------------------------------------------------------------- 9 */
{ ch: 2, id: 'river', name: 'Raft Rapids', emoji: '🛶', creature: '🦫', prize: '🦛', prizeName: 'hippo', concept: 'River crossing puzzles',
  teaches: 'Planning with rules and keeping track of who is where: the wolf–goat–cabbage pattern, bringing someone back, weight limits, and the never-outnumbered rule.',
  puzzles: [
  { type: 'river', cap: 2, seats: 2, guard: 'finn', eats: [['crab', 'weed']], rowMsg: FINN_ROWS, capMsg: 'The raft holds Finn and one more.',
    chars: [FINN, { id: 'crab', e: '🦀', name: 'Crab' }, { id: 'weed', e: '🌿', name: 'Seaweed' }],
    rules: ['🦈 Only Finn can push the raft. It holds Finn and one more.', '🦀 The crab eats the 🌿 seaweed if Finn is not there.'],
    task: 'Finn pushes a raft across the stormy channel. Get the crab and the seaweed to the other side safely.',
    hints: ['Click Finn and one passenger to put them on the raft, then press Cross.', 'Take one across, come back, then take the other.'],
    walk: 'Take the crab across. Come back. Take the seaweed across.',
    explain: 'Finn is the guard. Things are only in danger when Finn is not with them.' },
  { type: 'river', cap: 2, seats: 2, guard: 'finn', eats: [['octo', 'crab'], ['crab', 'weed']], rowMsg: FINN_ROWS, capMsg: 'The raft holds Finn and one more.',
    chars: [FINN, { id: 'octo', e: '🐙', name: 'Octopus' }, { id: 'crab', e: '🦀', name: 'Crab' }, { id: 'weed', e: '🌿', name: 'Seaweed' }],
    rules: ['🦈 Only Finn can push the raft. It holds Finn and one more.', '🐙 The octopus eats the 🦀 crab if Finn is not there.', '🦀 The crab eats the 🌿 seaweed if Finn is not there.'],
    task: 'The famous puzzle! Get the octopus, the crab and the seaweed across.',
    hints: ['The crab is in danger with both of the others. Take the crab first.', 'The trick: you can bring someone BACK on the raft. After taking the octopus over, bring the crab back.'],
    walk: 'Take the crab. Come back. Take the octopus. Bring the crab back! Take the seaweed. Come back. Take the crab.',
    explain: 'Sometimes you have to go backwards to go forwards. Bringing the crab back was the key.' },
  { type: 'river', cap: 3, seats: 3, guard: 'finn', eats: [['octo', 'crab'], ['crab', 'weed'], ['crab', 'shrimp']], rowMsg: FINN_ROWS, capMsg: 'The raft holds Finn and two more.',
    chars: [FINN, { id: 'octo', e: '🐙', name: 'Octopus' }, { id: 'crab', e: '🦀', name: 'Crab' }, { id: 'weed', e: '🌿', name: 'Seaweed' }, { id: 'shrimp', e: '🦐', name: 'Shrimp' }],
    rules: ['🦈 Only Finn can push the raft. Now it holds Finn and TWO more.', '🐙 The octopus eats the 🦀 crab, and the crab eats the 🌿 seaweed and the 🦐 shrimp.', 'Nobody eats anybody while Finn is there.'],
    task: 'A bigger raft and a hungrier crab! Get everyone across.',
    hints: ['The crab is the trouble-maker. It can’t be left with anyone except Finn.', 'Take the crab first. Later, bring the crab back, so it is never left alone with the others.'],
    walk: 'Take the crab. Come back. Take the octopus and the seaweed. Bring the crab back. Take the crab and the shrimp.',
    explain: 'Find the one who causes the trouble, and plan around it. The crab only ever travels with Finn.' },
  { type: 'river', cap: 2, seats: 2, anyRow: true, capMsg: 'The raft holds one grown-up, or two babies.',
    chars: [{ id: 'g', e: '🐢', name: 'Grandpa', w: 2 }, { id: 't1', e: '🐢', name: 'Tim', w: 1, small: true }, { id: 't2', e: '🐢', name: 'Tam', w: 1, small: true }],
    rules: ['🐢 The raft holds one grown-up turtle, or two baby turtles.', 'Anyone can paddle, but the raft can’t cross on its own.'],
    task: 'Grandpa Turtle and the two babies, Tim and Tam, need to cross. Get them all over.',
    hints: ['First, both babies go across.', 'One baby comes back. Then Grandpa goes alone. Then the other baby comes back for its twin.'],
    walk: 'Tim and Tam cross. Tim comes back. Grandpa crosses. Tam comes back. Tim and Tam cross. 5 trips.',
    explain: 'Someone small has to bring the raft back each time. Thinking about who paddles back is the key.' },
  { type: 'river', cap: 2, seats: 2, anyRow: true, capMsg: 'The raft holds one grown-up, or two babies.',
    chars: [{ id: 'g', e: '🐢', name: 'Grandpa', w: 2 }, { id: 'm', e: '🐢', name: 'Granny', w: 2 }, { id: 't1', e: '🐢', name: 'Tim', w: 1, small: true }, { id: 't2', e: '🐢', name: 'Tam', w: 1, small: true }],
    rules: ['🐢 The raft holds one grown-up turtle, or two baby turtles.', 'Anyone can paddle.'],
    task: 'Now Granny comes too! Get both grown-ups and both babies across.',
    hints: ['Use the trick from before to get one grown-up across.', 'After the first grown-up is over, the babies are back at the start. Do the same trick again.'],
    walk: 'Babies cross, one baby back, Grandpa crosses, the other baby back. Do it again for Granny. Then the two babies cross together. 9 trips.',
    explain: 'Once you have a trick that moves one grown-up, just repeat it. Big puzzles are often small puzzles done again.' },
  { type: 'river', cap: 8, seats: 2, anyRow: true, showW: true, capMsg: 'Too heavy! The raft can carry at most 8 kilos.',
    chars: [{ id: 'p', e: '🐧', name: 'Penny', w: 3 }, { id: 'o', e: '🦦', name: 'Otto', w: 4 }, { id: 't', e: '🐢', name: 'Tess', w: 5 }, { id: 's', e: '🦭', name: 'Sam', w: 8 }],
    rules: ['⚖️ The raft can carry at most 8 kilos.', 'Anyone can paddle.'],
    task: 'Four friends must cross. Each one shows their weight. The raft carries at most 8 kilos.',
    hints: ['Sam weighs 8, so Sam must go alone. And someone has to be waiting on the far side to bring the raft back.', 'Penny is the lightest. She is a good paddler to bring the raft back.'],
    walk: 'Penny + Otto cross, Penny back. Penny + Tess cross, Penny back. Sam crosses alone, Otto comes back. Penny + Otto cross. 7 trips.',
    explain: 'Plan ahead: when Sam crosses alone, someone must already be on the other side to paddle the raft back.' },
  { type: 'river', cap: 2, seats: 2, anyRow: true, outnumber: ['octo', 'crab'], kindNames: { octo: 'octopuses', crab: 'crabs' }, capMsg: 'The raft holds two.',
    chars: [{ id: 'c1', e: '🦀', name: 'Crab 1', kind: 'crab' }, { id: 'c2', e: '🦀', name: 'Crab 2', kind: 'crab' }, { id: 'o1', e: '🐙', name: 'Octo 1', kind: 'octo' }, { id: 'o2', e: '🐙', name: 'Octo 2', kind: 'octo' }],
    rules: ['🛶 The raft holds two. Anyone can paddle.', '🦀 If octopuses ever outnumber the crabs on a side, the crabs get scared! (No crabs there is fine.) Count the raft too, when it is at that side.'],
    task: 'Two crabs and two octopuses must cross. Keep the crabs from being outnumbered.',
    hints: ['Send one crab and one octopus first.', 'Then the crab comes back and takes the other crab. Check each side after every trip!'],
    walk: 'Crab + octopus cross. The crab comes back. The two crabs cross. A crab comes back. Crab + octopus cross. 5 trips.',
    explain: 'Before each trip, check both sides. A rule that must always be true helps you choose the next move.' },
  { type: 'river', cap: 2, seats: 2, anyRow: true, outnumber: ['octo', 'crab'], kindNames: { octo: 'octopuses', crab: 'crabs' }, capMsg: 'The raft holds two.',
    chars: [{ id: 'c1', e: '🦀', name: 'Crab 1', kind: 'crab' }, { id: 'c2', e: '🦀', name: 'Crab 2', kind: 'crab' }, { id: 'c3', e: '🦀', name: 'Crab 3', kind: 'crab' }, { id: 'o1', e: '🐙', name: 'Octo 1', kind: 'octo' }, { id: 'o2', e: '🐙', name: 'Octo 2', kind: 'octo' }, { id: 'o3', e: '🐙', name: 'Octo 3', kind: 'octo' }],
    rules: ['🛶 The raft holds two. Anyone can paddle.', '🦀 Octopuses must never outnumber the crabs on a side (no crabs there is fine). Count the raft too, when it is at that side.'],
    task: 'The master puzzle: three crabs and three octopuses. Keep the crabs safe all the way.',
    hints: ['Octopuses can travel and wait together safely when there are no crabs with them.', 'A good start: two octopuses cross, one comes back, two octopuses cross, one comes back. Now two crabs can cross.'],
    walk: '2 octos over, 1 octo back, 2 octos over, 1 octo back. 2 crabs over, 1 crab + 1 octo back. 2 crabs over, 1 octo back. 2 octos over, 1 octo back, 2 octos over. 11 trips.',
    explain: 'This is a very famous puzzle. It needs 11 trips, and the clever bit is the trip in the middle where a crab and an octopus go back together.' },
  ] },
];
CH2.forEach(w => WORLDS.push(w));

/* the solvers behind the checkers, for tests */
window.CH2 = { RULE, runRules, machineInput, minCoins, coinWays, subsetFor, jugBFS, jugAmounts, riverBFS, riverTrip, netFold, netOK, digitSolutions, makeBest, vRegion, ids: CH2.map(w => w.id) };
})();
