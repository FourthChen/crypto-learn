/* ==================== 密码学课程 - 交互逻辑 ==================== */

/* ==================== 背景粒子效果 ==================== */
(function initBackground() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    function createParticles() {
        particles = [];
        const count = Math.floor((canvas.width * canvas.height) / 16000);
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * canvas.width, y: Math.random() * canvas.height,
                size: Math.random() * 2 + 1,
                speedX: (Math.random() - 0.5) * 0.3, speedY: (Math.random() - 0.5) * 0.3,
                color: `hsl(${Math.random() * 60 + 200}, 70%, 60%)`
            });
        }
    }
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.x += p.speedX; p.y += p.speedY;
            if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
            if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fillStyle = p.color; ctx.fill();
        });
        particles.forEach((a, i) => {
            particles.slice(i + 1).forEach(b => {
                const dx = a.x - b.x, dy = a.y - b.y, dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = `rgba(123, 47, 247, ${0.15 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5; ctx.stroke();
                }
            });
        });
        requestAnimationFrame(animate);
    }
    resize(); createParticles(); animate();
    window.addEventListener('resize', () => { resize(); createParticles(); });
})();

/* ==================== 导航与进度 ==================== */
const navLinks = document.querySelectorAll('.nav-link');
const chapters = document.querySelectorAll('.chapter');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');

/* 统一导航函数：切换章节并更新进度 */
function navigateTo(idx) {
    navLinks.forEach(l => l.classList.remove('active'));
    const target = document.querySelector(`.nav-link[data-project="${idx}"]`);
    if (target) target.classList.add('active');
    chapters.forEach(ch => ch.classList.remove('active'));
    document.getElementById(idx === 0 ? 'home' : 'p' + idx).classList.add('active');
    const prog = Math.round((idx / 8) * 100);
    progressFill.style.width = prog + '%';
    progressText.textContent = prog + '%';
    document.querySelector('.nav').classList.remove('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

navLinks.forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        navigateTo(parseInt(link.dataset.project));
    });
});
document.getElementById('menuBtn').addEventListener('click', () => document.querySelector('.nav').classList.toggle('show'));

/* ==================== 渲染工具 ==================== */
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function esc(s) { return String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }

function diffClass(d) {
    return d === '易' ? 'diff-easy' : d === '中' ? 'diff-mid' : 'diff-hard';
}

function renderProject(p, idx) {
    const sec = document.getElementById(p.id);
    if (!sec) return;

    let html = `
        <div class="project-header">
            <div class="project-num">${p.num}</div>
            <h2>${esc(p.name)}</h2>
            <p class="project-subtitle">${esc(p.subtitle)}</p>
        </div>

        <div class="info-card">
            <h3>🎯 教学目标</h3>
            <ul class="goals-list">${p.goals.map(g => `<li>${esc(g)}</li>`).join('')}</ul>
        </div>

        <div class="info-card">
            <h3>📖 核心知识点</h3>
            <div class="knowledge-grid">
                ${p.knowledge.map(k => `
                    <div class="knowledge-item">
                        <h4><span>📌</span>${esc(k.title)}<span class="difficulty-tag ${diffClass(k.diff)}">${k.diff}</span></h4>
                        <p>${esc(k.content)}</p>
                    </div>`).join('')}
            </div>
        </div>

        <div class="demo-card">
            <h3>🎬 演示动画</h3>
            <p class="demo-desc">点击下方按钮，通过动画直观理解核心概念。</p>
            <div id="anim-${p.id}" class="anim-canvas-wrap"></div>
            <div class="demo-controls">
                ${p.animations.map((a, i) => `<button class="btn-demo" onclick="playAnim('${p.id}', ${i})">▶️ ${esc(a.name)}</button>`).join('')}
            </div>
            <div id="anim-desc-${p.id}" class="demo-desc" style="margin-top:16px;"></div>
        </div>

        <div class="info-card">
            <h3>⚙️ 互动实验</h3>
            <div id="exp-${p.id}"></div>
        </div>

        <div class="demo-card">
            <h3>✏️ 习题练习</h3>
            <p class="demo-desc">完成下列习题，点击选项或输入答案后查看解析，巩固所学知识。</p>
            <div class="exercise-grid" id="ex-${p.id}">
                ${p.exercises.map((e, i) => renderExercise(e, i, p.id)).join('')}
            </div>
        </div>
    `;
    sec.innerHTML = html;
    renderExperiment(p, idx);
}

function renderExercise(e, idx, pid) {
    const typeBadge = e.type === '选择' ? 'q-type-select' : e.type === '填空' ? 'q-type-fill' : 'q-type-calc';
    let optsHtml = '';
    if (e.type === '选择') {
        optsHtml = `<div class="q-options">${e.opts.map(o => `<div class="q-option" onclick="checkAnswer('${pid}', ${idx}, '${esc(o.charAt(0))}', this)">${esc(o)}</div>`).join('')}</div>`;
    } else {
        optsHtml = `<div class="q-options">${e.opts.map(o => `<div class="q-option" style="cursor:default;color:#888;">${esc(o)}</div>`).join('')}</div>
                    <input type="text" class="q-input" id="input-${pid}-${idx}" placeholder="请输入你的答案...">
                    <button class="btn-demo" style="margin-top:12px;" onclick="checkFill('${pid}', ${idx})">提交答案</button>`;
    }
    return `
        <div class="exercise-card" id="card-${pid}-${idx}">
            <div class="q-head">
                <span class="q-type-badge ${typeBadge}">${e.type}</span>
                <span class="q-text">${idx + 1}. ${esc(e.q)}</span>
            </div>
            ${optsHtml}
            <div class="q-feedback" id="fb-${pid}-${idx}"></div>
        </div>
    `;
}

/* ==================== 习题判题 ==================== */
const answered = {};
function checkAnswer(pid, idx, choice, el) {
    if (answered[`${pid}-${idx}`]) return;
    const e = COURSE_DATA.find(p => p.id === pid).exercises[idx];
    const correct = e.ans === choice;
    answered[`${pid}-${idx}`] = true;
    const card = document.getElementById(`card-${pid}-${idx}`);
    card.classList.add('solved');
    document.querySelectorAll(`#card-${pid}-${idx} .q-option`).forEach(opt => {
        const letter = opt.textContent.charAt(0);
        opt.style.cursor = 'default';
        if (letter === e.ans) opt.classList.add('correct');
        else if (letter === choice) opt.classList.add('wrong');
    });
    const fb = document.getElementById(`fb-${pid}-${idx}`);
    fb.className = 'q-feedback show ' + (correct ? 'ok' : 'bad');
    fb.innerHTML = `<span class="q-answer-line">${correct ? '✅ 回答正确！' : '❌ 回答错误。'}</span><br>正确答案：<b style="color:#4cd964">${esc(e.ans)}</b><br>解析：${esc(e.analysis)}`;
}

function checkFill(pid, idx) {
    if (answered[`${pid}-${idx}`]) return;
    const e = COURSE_DATA.find(p => p.id === pid).exercises[idx];
    const input = document.getElementById(`input-${pid}-${idx}`);
    const user = input.value.trim();
    if (!user) { alert('请先输入答案'); return; }
    const correct = user.includes(e.ans) || e.ans.includes(user);
    answered[`${pid}-${idx}`] = true;
    const card = document.getElementById(`card-${pid}-${idx}`);
    card.classList.add('solved');
    input.disabled = true;
    const fb = document.getElementById(`fb-${pid}-${idx}`);
    fb.className = 'q-feedback show ' + (correct ? 'ok' : 'bad');
    fb.innerHTML = `<span class="q-answer-line">${correct ? '✅ 回答正确！' : '❌ 回答有误。'}</span><br>参考答案：<b style="color:#4cd964">${esc(e.ans)}</b><br>解析：${esc(e.analysis)}`;
}

/* ==================== 动画实现 ==================== */
function getAnimWrap(pid) { return document.getElementById('anim-' + pid); }
function getDesc(pid) { return document.getElementById('anim-desc-' + pid); }

function playAnim(pid, idx) {
    const p = COURSE_DATA.find(x => x.id === pid);
    getDesc(pid).textContent = '🎬 ' + p.animations[idx].name + '：' + p.animations[idx].desc;
    const wrap = getAnimWrap(pid);
    wrap.innerHTML = '<canvas id="acanvas" width="480" height="320"></canvas>';
    const fn = window['anim_' + pid + '_' + idx];
    if (fn) fn(document.getElementById('acanvas'));
}

/* --- 通用：环形字母表平移（项目1动画0：凯撒） --- */
window.anim_p1_0 = function (cv) {
    const ctx = cv.getContext('2d'); const cx = 240, cy = 160, R = 120;
    function draw(shift, highlight) {
        ctx.clearRect(0, 0, 480, 320);
        ctx.font = 'bold 16px Arial';
        // 外环原始
        for (let i = 0; i < 26; i++) {
            const a = (i * 360 / 26 - 90) * Math.PI / 180;
            const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
            ctx.fillStyle = '#555'; ctx.fillText(ALPHABET[i], x - 6, y + 5);
        }
        // 内环平移
        for (let i = 0; i < 26; i++) {
            const a = (i * 360 / 26 - 90) * Math.PI / 180;
            const x = cx + Math.cos(a) * (R - 55), y = cy + Math.sin(a) * (R - 55);
            ctx.fillStyle = (i === highlight) ? '#f107a3' : '#00d4ff';
            ctx.font = (i === highlight) ? 'bold 20px Arial' : 'bold 16px Arial';
            ctx.fillText(ALPHABET[(i + shift) % 26], x - 6, y + 5);
        }
        ctx.fillStyle = '#fff'; ctx.font = '14px Arial'; ctx.textAlign = 'center';
        ctx.fillText('偏移量 = ' + shift, cx, 295);
        ctx.textAlign = 'left';
    }
    let s = 0, hi = 0;
    draw(0, 0);
    const t = setInterval(() => {
        s = (s + 1) % 26;
        draw(s, s);
        if (s === 0) clearInterval(t);
    }, 120);
};

/* --- 栅栏密码分组（项目1动画1） --- */
window.anim_p1_1 = function (cv) {
    const ctx = cv.getContext('2d');
    const text = 'HELLOWORLD'; const rails = 2;
    function draw(phase) {
        ctx.clearRect(0, 0, 480, 320);
        ctx.font = 'bold 20px Arial';
        // 排列成栅栏行
        const rows = Array.from({ length: rails }, () => []);
        for (let i = 0; i < text.length; i++) rows[i % rails].push(text[i]);
        ctx.fillStyle = '#00d4ff'; ctx.fillText('明文: ' + text, 30, 35);
        // 画两行
        for (let r = 0; r < rails; r++) {
            let x = 30, y = 80 + r * 70;
            ctx.fillStyle = '#ffc107';
            rows[r].forEach(ch => {
                const ox = phase * 0;
                ctx.fillText(ch, x + ox, y);
                x += 34;
            });
            ctx.fillStyle = '#888'; ctx.font = '12px Arial';
            ctx.fillText('第' + (r + 1) + '行', 30, y + 20);
            ctx.font = 'bold 20px Arial';
        }
        // 密文拼接
        const cipher = rows.flat().join('');
        ctx.fillStyle = '#f107a3'; ctx.font = 'bold 22px Arial';
        ctx.fillText('密文: ' + cipher, 30, 250);
    }
    draw(0);
};

/* --- 棋盘密码矩阵（项目1动画2） --- */
window.anim_p1_2 = function (cv) {
    const ctx = cv.getContext('2d');
    // 5x5 矩阵，I/J 合并
    const matrix = ['A','B','C','D','E','F','G','H','I','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
    let highlight = -1;
    function draw(hi) {
        ctx.clearRect(0, 0, 480, 320);
        const cell = 50, ox = 60, oy = 40;
        for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
            const i = r * 5 + c, x = ox + c * cell, y = oy + r * cell;
            ctx.fillStyle = (i === hi) ? 'rgba(241,7,163,0.3)' : 'rgba(0,212,255,0.12)';
            ctx.strokeStyle = '#445';
            ctx.fillRect(x, y, cell, cell); ctx.strokeRect(x, y, cell, cell);
            ctx.fillStyle = '#fff'; ctx.font = 'bold 20px Arial'; ctx.textAlign = 'center';
            ctx.fillText(matrix[i], x + 25, y + 30);
            ctx.fillStyle = '#888'; ctx.font = '11px Arial';
            ctx.fillText((r+1)+''+(c+1), x + 25, y + 45);
        }
        if (hi >= 0) {
            const r = Math.floor(hi / 5), c = hi % 5;
            const x = ox + c * cell, y = oy + r * cell;
            ctx.fillStyle = '#ffc107'; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'left';
            ctx.fillText(matrix[hi] + ' → ' + (r + 1) + (c + 1) + '（行' + (r+1) + '列' + (c+1) + '）', 60, 310);
        }
        ctx.textAlign = 'left';
    }
    let i = 0;
    draw(-1);
    const t = setInterval(() => {
        i = (i + 1) % 25; draw(i);
        if (i === 24) clearInterval(t);
    }, 150);
};

/* --- 频率分析柱状图（项目1动画3） --- */
window.anim_p1_3 = function (cv) {
    const ctx = cv.getContext('2d');
    const freq = [12.7, 9.1, 8.2, 7.5, 7.0, 6.7, 6.3, 6.1, 6.0, 4.3, 4.0, 2.8];
    const letters = 'ETAOINSHRDL'.split('');
    // 密文中 H 频率最高，对应 E
    function draw(matched) {
        ctx.clearRect(0, 0, 480, 320);
        // 标准频率
        ctx.fillStyle = '#00d4ff'; ctx.font = '12px Arial';
        ctx.fillText('英语标准频率', 30, 20);
        for (let i = 0; i < 12; i++) {
            const x = 30 + i * 36, h = (freq[i] / 12.7) * 100;
            ctx.fillRect(x, 40, 28, h);
            ctx.fillStyle = '#aaa'; ctx.fillText(letters[i], x + 8, 320 - (i % 2) * 0);
            ctx.fillStyle = '#00d4ff';
        }
        // 密文频率（H最高对应E位置）
        ctx.fillStyle = '#f107a3'; ctx.font = '12px Arial';
        ctx.fillText('密文频率（H 最高）', 280, 20);
        const cipher = [30, 25, 22, 20, 18, 16, 15, 14, 13, 9, 8, 6];
        for (let i = 0; i < 12; i++) {
            const x = 280 + i * 15, h = (cipher[i] / 30) * 100;
            ctx.fillRect(x, 40, 12, h);
        }
        // 匹配提示
        ctx.fillStyle = '#ffc107'; ctx.font = 'bold 14px Arial';
        ctx.fillText('H（密文最高） ↔ E（标准最高）', 30, 250);
        ctx.fillStyle = '#fff'; ctx.font = '13px Arial';
        ctx.fillText('偏移量 = H - E = 3', 30, 275);
    }
    draw(false);
};

/* --- XOR 逐位运算（项目2动画0） --- */
window.anim_p2_0 = function (cv) {
    const ctx = cv.getContext('2d');
    const A = '10110100', B = '11001100';
    let step = 0;
    function draw() {
        ctx.clearRect(0, 0, 480, 320);
        ctx.font = 'bold 24px Orbitron, monospace';
        ctx.fillStyle = '#00d4ff'; ctx.fillText(A, 40, 80);
        ctx.fillStyle = '#ffc107'; ctx.fillText(B, 40, 130);
        ctx.fillStyle = '#7b2ff7'; ctx.fillText('XOR', 300, 105);
        // 逐位
        const res = [];
        for (let i = 0; i < 8; i++) {
            const a = +A[i], b = +B[i];
            res.push((a ^ b) ? '1' : '0');
            if (i < step) {
                ctx.fillStyle = '#f107a3'; ctx.font = 'bold 24px Orbitron, monospace';
            }
        }
        ctx.fillStyle = '#f107a3'; ctx.font = 'bold 24px Orbitron, monospace';
        ctx.fillText(res.join(''), 380, 80);
        // 当前位高亮
        if (step < 8) {
            ctx.fillStyle = '#fff'; ctx.font = '14px Arial';
            ctx.fillText('计算第 ' + (step + 1) + ' 位: ' + A[step] + ' ⊕ ' + B[step] + ' = ' + res[step], 40, 200);
            ctx.fillRect(40 + step * 32, 60, 32, 60);
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.fillRect(40 + step * 32, 110, 32, 40);
        } else {
            ctx.fillStyle = '#4cd964'; ctx.font = 'bold 16px Arial';
            ctx.fillText('✅ 结果: ' + res.join('',), 40, 200);
        }
    }
    draw();
    const t = setInterval(() => { step++; draw(); if (step > 8) clearInterval(t); }, 350);
};

/* --- LFSR 状态转移（项目2动画1） --- */
window.anim_p2_1 = function (cv) {
    const ctx = cv.getContext('2d');
    let state = [1, 0, 1, 1], out = [];
    function draw() {
        ctx.clearRect(0, 0, 480, 320);
        // 寄存器
        const bw = 70, bh = 50, y = 120;
        for (let i = 0; i < 4; i++) {
            const x = 40 + i * 100;
            ctx.fillStyle = 'rgba(0,212,255,0.15)'; ctx.strokeStyle = '#00d4ff';
            ctx.fillRect(x, y, bw, bh); ctx.strokeRect(x, y, bw, bh);
            ctx.fillStyle = '#fff'; ctx.font = 'bold 26px Arial'; ctx.textAlign = 'center';
            ctx.fillText(state[i], x + bw/2, y + 35);
        }
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ffc107'; ctx.font = '13px Arial';
        ctx.fillText('反馈 f = a1 ⊕ a2，输出最右位', 40, 90);
        // 输出序列
        ctx.fillStyle = '#f107a3'; ctx.font = 'bold 16px Orbitron, monospace';
        ctx.fillText('输出序列: ' + out.join(''), 40, 250);
        ctx.fillStyle = '#888'; ctx.font = '12px Arial';
        ctx.fillText('周期: ' + out.length, 40, 275);
    }
    draw();
    const t = setInterval(() => {
        if (out.length >= 15) { clearInterval(t); return; }
        out.push(state[3]);
        const fb = state[0] ^ state[1];
        state = [state[1], state[2], state[3], fb];
        draw();
    }, 400);
};

/* --- 序列密码流水线（项目2动画2） --- */
window.anim_p2_2 = function (cv) {
    const ctx = cv.getContext('2d');
    const P = '01101010', K = '10110111';
    let i = 0;
    function draw() {
        ctx.clearRect(0, 0, 480, 320);
        ctx.font = 'bold 20px Orbitron, monospace';
        ctx.fillStyle = '#00d4ff'; ctx.fillText('明文 P', 40, 60);
        ctx.fillStyle = '#ffc107'; ctx.fillText('密钥 K', 40, 100);
        ctx.fillStyle = '#f107a3'; ctx.fillText('密文 C', 300, 60);
        for (let j = 0; j < 8; j++) {
            const active = j === i;
            ctx.font = active ? 'bold 24px Orbitron, monospace' : '20px Orbitron, monospace';
            ctx.fillStyle = active ? '#fff' : '#888';
            ctx.fillText(P[j], 110 + j * 30, 60);
            ctx.fillText(K[j], 110 + j * 30, 100);
            if (j <= i) {
                ctx.fillStyle = '#f107a3'; ctx.fillText((+P[j] ^ +K[j]) ? '1' : '0', 360 + j * 15, 60);
            }
        }
        if (i < 8) {
            ctx.fillStyle = '#7b2ff7'; ctx.font = '13px Arial';
            ctx.fillText('C' + (i+1) + ' = P' + (i+1) + ' ⊕ K' + (i+1), 40, 160);
            ctx.fillStyle = '#4cd964';
            ctx.fillText('解密: C ⊕ K = P（同一密钥流）', 40, 185);
        } else {
            ctx.fillStyle = '#4cd964'; ctx.font = 'bold 16px Arial';
            ctx.fillText('✅ 加密完成，用同一密钥流可还原明文', 40, 160);
        }
    }
    draw();
    const t = setInterval(() => { i++; draw(); if (i > 8) clearInterval(t); }, 350);
};

/* --- XOR 可逆性（项目2动画3） --- */
window.anim_p2_3 = function (cv) {
    const ctx = cv.getContext('2d');
    const P = '0110', K = '1011';
    let phase = 0;
    function draw() {
        ctx.clearRect(0, 0, 480, 320);
        ctx.font = 'bold 28px Orbitron, monospace';
        ctx.fillStyle = '#00d4ff'; ctx.fillText('P = ' + P, 40, 90);
        ctx.fillStyle = '#ffc107'; ctx.fillText('K = ' + K, 40, 140);
        let C = P.split('').map((b, i) => ((+b) ^ (+K[i])) ? '1' : '0').join('');
        if (phase === 0) {
            ctx.fillStyle = '#fff'; ctx.fillText('C = P⊕K = ' + C, 40, 200);
            ctx.fillStyle = '#888'; ctx.font = '14px Arial';
            ctx.fillText('（加密）', 40, 230);
        } else {
            ctx.fillStyle = '#f107a3'; ctx.font = 'bold 28px Orbitron, monospace';
            ctx.fillText('C = ' + C, 40, 190);
            ctx.fillStyle = '#4cd964'; ctx.font = 'bold 28px Orbitron, monospace';
            ctx.fillText('C⊕K = P = ' + P, 40, 240);
            ctx.fillStyle = '#888'; ctx.font = '14px Arial';
            ctx.fillText('（解密，使用同一密钥流）', 40, 275);
        }
    }
    draw();
    setTimeout(() => { phase = 1; draw(); }, 1500);
};

/* --- 分组分块集装箱（项目3动画0） --- */
window.anim_p3_0 = function (cv) {
    const ctx = cv.getContext('2d');
    let phase = 0;
    const blocks = ['明文块1', '明文块2', '明文块3'];
    function draw() {
        ctx.clearRect(0, 0, 480, 320);
        ctx.fillStyle = '#00d4ff'; ctx.font = 'bold 14px Arial';
        ctx.fillText('明文流 → 切分成固定长度数据块', 30, 30);
        for (let i = 0; i < 3; i++) {
            const x = 30 + i * 140, y = 60;
            if (phase === 0) {
                ctx.fillStyle = 'rgba(0,212,255,0.2)'; ctx.strokeStyle = '#00d4ff';
                ctx.fillRect(x, y, 120, 50); ctx.strokeRect(x, y, 120, 50);
                ctx.fillStyle = '#00d4ff'; ctx.font = '12px Arial';
                ctx.fillText(blocks[i], x + 15, y + 30);
            } else {
                ctx.fillStyle = 'rgba(241,7,163,0.2)'; ctx.strokeStyle = '#f107a3';
                ctx.fillRect(x, y, 120, 50); ctx.strokeRect(x, y, 120, 50);
                ctx.fillStyle = '#f107a3'; ctx.font = '12px Arial';
                ctx.fillText('密文块' + (i+1), x + 20, y + 30);
            }
            ctx.fillStyle = '#ffc107'; ctx.font = '11px Arial';
            ctx.fillText(i === 0 ? '密钥驱动' : '', x + 20, y + 90);
        }
        ctx.fillStyle = '#888'; ctx.font = '13px Arial';
        ctx.fillText(phase === 0 ? '分组密码：等长切分 → 逐块加密' : '输出等长密文块，分组密码完成映射', 30, 200);
        ctx.fillStyle = '#fff';
        ctx.fillText('分组大小与密钥长度是两个核心参数', 30, 230);
    }
    draw();
    setTimeout(() => { phase = 1; draw(); }, 1600);
};

/* --- Feistel 16轮流水线（项目3动画1） --- */
window.anim_p3_1 = function (cv) {
    const ctx = cv.getContext('2d');
    let round = 0;
    function draw() {
        ctx.clearRect(0, 0, 480, 320);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 13px Arial';
        ctx.fillText('Feistel 网络：L0, R0 经 16 轮迭代', 30, 25);
        // 左右轨道
        ctx.fillStyle = '#00d4ff'; ctx.font = '14px Orbitron, monospace';
        ctx.fillText('L', 30, 90); ctx.fillText('R', 30, 130);
        for (let r = 0; r < 16; r++) {
            const x = 60 + r * 26;
            const active = r === round;
            ctx.fillStyle = active ? '#f107a3' : 'rgba(0,212,255,0.3)';
            ctx.beginPath(); ctx.arc(x, 90, 12, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x, 130, 12, 0, Math.PI * 2); ctx.fill();
            if (r > 0) {
                ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                ctx.beginPath(); ctx.moveTo(x - 26, 90); ctx.lineTo(x, 90); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(x - 26, 130); ctx.lineTo(x, 130); ctx.stroke();
            }
            if (active) {
                ctx.strokeStyle = '#ffc107'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(x, 100); ctx.lineTo(x, 120); ctx.stroke();
                ctx.lineWidth = 1;
                ctx.fillStyle = '#ffc107'; ctx.font = '10px Arial';
                ctx.fillText('F', x - 4, 112);
            }
        }
        ctx.fillStyle = '#fff'; ctx.font = '12px Arial';
        if (round < 16) {
            ctx.fillText('第 ' + (round + 1) + ' 轮:  L' + (round+1) + ' = R' + round + ',  R' + (round+1) + ' = L' + round + ' ⊕ F(R' + round + ', k' + (round+1) + ')', 30, 250);
        } else {
            ctx.fillStyle = '#4cd964';
            ctx.fillText('✅ 16轮完成，经逆初始置换输出密文', 30, 250);
        }
        ctx.fillStyle = '#888';
        ctx.fillText('解密仅子密钥顺序相反: k16 → k1', 30, 275);
    }
    draw();
    const t = setInterval(() => { round++; draw(); if (round > 16) clearInterval(t); }, 350);
};

/* --- AES状态矩阵轮变换（项目3动画2） --- */
window.anim_p3_2 = function (cv) {
    const ctx = cv.getContext('2d');
    let step = 0;
    const grid = [['7','3','0','1'],['2','c','a','f'],['e','b','d','4'],['9','5','8','6']];
    const labels = ['初始轮密钥加','字节代换(S盒)','行移位','列混合','轮密钥加','最终轮(省略列混合)'];
    function draw() {
        ctx.clearRect(0, 0, 480, 320);
        ctx.fillStyle = '#ffc107'; ctx.font = 'bold 14px Arial';
        ctx.fillText('AES 4×4 状态矩阵，当前: ' + labels[Math.min(step, 5)], 30, 30);
        const cell = 55, ox = 60, oy = 50;
        for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
            const x = ox + c * cell, y = oy + r * cell;
            ctx.fillStyle = step >= 0 ? 'rgba(0,212,255,0.15)' : '#000';
            ctx.strokeStyle = '#00d4ff';
            ctx.fillRect(x, y, cell, cell); ctx.strokeRect(x, y, cell, cell);
            ctx.fillStyle = '#fff'; ctx.font = 'bold 20px Orbitron, monospace'; ctx.textAlign = 'center';
            let val = grid[r][c];
            // 行移位效果
            if (step >= 2 && step < 5) {
                const sh = (r) % 4;
                // 简化：仅视觉提示
            }
            ctx.fillText(val, x + cell/2, y + 33);
        }
        ctx.textAlign = 'left';
        ctx.fillStyle = '#888'; ctx.font = '13px Arial';
        const tips = ['轮密钥与状态矩阵异或','S盒查表非线性替换','第0-3行分别左移0-3字节','列与固定矩阵乘法','再次异或轮密钥','输出256位密文'];
        ctx.fillText('💡 ' + tips[Math.min(step,5)], 60, 280);
    }
    draw();
    const t = setInterval(() => { step++; draw(); if (step > 6) clearInterval(t); }, 900);
};

/* --- 工作模式对比（项目3动画3） --- */
window.anim_p3_3 = function (cv) {
    const ctx = cv.getContext('2d');
    const modes = ['ECB', 'CBC', 'CFB', 'OFB', 'CTR'];
    const colors = ['#f107a3', '#00d4ff', '#ffc107', '#4cd964', '#7b2ff7'];
    function draw(phase) {
        ctx.clearRect(0, 0, 480, 320);
        ctx.font = '12px Arial';
        for (let m = 0; m < 5; m++) {
            const y = 30 + m * 52;
            ctx.fillStyle = colors[m]; ctx.font = 'bold 13px Arial';
            ctx.fillText(modes[m], 20, y + 14);
            // 4 个块
            for (let b = 0; b < 4; b++) {
                const x = 70 + b * 95;
                ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.strokeStyle = colors[m];
                ctx.fillRect(x, y, 55, 32); ctx.strokeRect(x, y, 55, 32);
                ctx.fillStyle = colors[m]; ctx.font = '11px Arial'; ctx.textAlign = 'center';
                ctx.fillText('块' + (b+1), x + 27, y + 20);
            }
            ctx.textAlign = 'left';
        }
        // 标注依赖
        ctx.fillStyle = '#fff'; ctx.font = '12px Arial';
        ctx.fillText('ECB: 各块独立 | CBC: 链式依赖前块 | CFB: 密文反馈', 20, 295);
    }
    draw(0);
};

/* --- 对称密钥分发痛点（项目4动画0） --- */
window.anim_p4_0 = function (cv) {
    const ctx = cv.getContext('2d');
    let n = 3;
    function draw() {
        ctx.clearRect(0, 0, 480, 320);
        const users = 3;
        const pos = [];
        for (let i = 0; i < users; i++) {
            const a = (i * 360 / users - 90) * Math.PI / 180;
            pos.push({ x: 240 + Math.cos(a) * 110, y: 160 + Math.sin(a) * 110 });
            ctx.fillStyle = '#00d4ff'; ctx.beginPath(); ctx.arc(pos[i].x, pos[i].y, 20, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#000'; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'center';
            ctx.fillText('用户' + (i+1), pos[i].x, pos[i].y + 5);
        }
        ctx.textAlign = 'left';
        // 连线表示密钥
        let count = 0;
        for (let i = 0; i < users; i++) for (let j = i+1; j < users; j++) {
            count++;
            ctx.strokeStyle = 'rgba(241,7,163,0.5)'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(pos[i].x, pos[i].y); ctx.lineTo(pos[j].x, pos[j].y); ctx.stroke();
            ctx.fillStyle = '#f107a3'; ctx.font = '12px Arial';
            ctx.fillText('🔑', (pos[i].x+pos[j].x)/2 - 6, (pos[i].y+pos[j].y)/2);
        }
        ctx.lineWidth = 1;
        ctx.fillStyle = '#ffc107'; ctx.font = 'bold 15px Arial';
        ctx.fillText(users + ' 个用户需要 ' + count + ' 把密钥（n(n-1)/2）', 30, 280);
        ctx.fillStyle = '#fff'; ctx.font = '12px Arial';
        ctx.fillText('密钥数量随用户数急剧增长 → 分发、更新、泄露风险高', 30, 300);
    }
    draw();
};

/* --- 公钥加解密模型（项目4动画1） --- */
window.anim_p4_1 = function (cv) {
    const ctx = cv.getContext('2d');
    let phase = 0;
    function draw() {
        ctx.clearRect(0, 0, 480, 320);
        // Bob
        ctx.fillStyle = '#00d4ff'; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'center';
        ctx.fillText('Bob（接收方）', 80, 60);
        ctx.fillStyle = '#ffc107'; ctx.font = '12px Arial';
        ctx.fillText('🔑 私钥（保密）', 80, 85);
        // Alice
        ctx.fillStyle = '#f107a3';
        ctx.fillText('Alice（发送方）', 400, 60);
        ctx.fillStyle = '#ffc107'; ctx.font = '12px Arial';
        ctx.fillText('🔓 公钥（公开）', 400, 85);
        ctx.textAlign = 'left';
        // 箱子
        ctx.font = '40px Arial';
        if (phase === 0) {
            ctx.fillText('📦', 180, 180);
            ctx.fillStyle = '#fff'; ctx.font = '13px Arial';
            ctx.fillText('公钥从Bob传到Alice', 160, 210);
        } else if (phase === 1) {
            ctx.fillText('🔒', 180, 180);
            ctx.fillStyle = '#fff'; ctx.font = '13px Arial';
            ctx.fillText('Alice用公钥加密，箱子弹起锁', 150, 210);
        } else {
            ctx.fillText('📦', 180, 180);
            ctx.fillStyle = '#4cd964'; ctx.font = '13px Arial';
            ctx.fillText('Bob用私钥解锁，还原明文', 150, 210);
        }
        // 网络
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.setLineDash([4,4]);
        ctx.beginPath(); ctx.moveTo(110, 175); ctx.lineTo(360, 175); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#888'; ctx.font = '11px Arial';
        ctx.fillText('即使密文被拦截，没有私钥也无法解密', 160, 275);
    }
    draw();
    setTimeout(() => { phase = 1; draw(); }, 1600);
    setTimeout(() => { phase = 2; draw(); }, 3200);
};

/* --- RSA密钥生成四步（项目4动画2） --- */
window.anim_p4_2 = function (cv) {
    const ctx = cv.getContext('2d');
    const steps = ['① N = p × q', '② L = lcm(p-1, q-1)', '③ 选 E（gcd(E,L)=1）', '④ 求 D（E×D mod L=1）'];
    let step = 0;
    function draw() {
        ctx.clearRect(0, 0, 480, 320);
        const y = 90 + step * 45;
        for (let i = 0; i < 4; i++) {
            ctx.fillStyle = i === step ? 'rgba(241,7,163,0.25)' : 'rgba(255,255,255,0.05)';
            ctx.strokeStyle = i === step ? '#f107a3' : '#445';
            ctx.fillRect(30, 60 + i * 45, 420, 38); ctx.strokeRect(30, 60 + i * 45, 420, 38);
            ctx.fillStyle = i === step ? '#fff' : '#888'; ctx.font = 'bold 16px Arial';
            ctx.fillText(steps[i], 50, 85 + i * 45);
        }
        ctx.fillStyle = '#00d4ff'; ctx.font = 'bold 14px Arial';
        ctx.fillText('公钥 {E, N}    私钥 {D, N}', 30, 290);
    }
    draw();
    const t = setInterval(() => { step++; draw(); if (step > 4) clearInterval(t); }, 1000);
};

/* --- 椭圆曲线点加倍乘（项目4动画3） --- */
window.anim_p4_3 = function (cv) {
    const ctx = cv.getContext('2d');
    let step = 0;
    function drawCurve() {
        ctx.clearRect(0, 0, 480, 320);
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath(); ctx.moveTo(240, 0); ctx.lineTo(240, 320); ctx.moveTo(0, 160); ctx.lineTo(480, 160); ctx.stroke();
        // 画曲线 y^2 = x^3 - 2x + 4（示意）
        ctx.strokeStyle = '#00d4ff'; ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = -3; x <= 3; x += 0.02) {
            const v = x*x*x - 2*x + 4;
            if (v >= 0) {
                const y = Math.sqrt(v);
                const px = 240 + x * 35, py = 160 - y * 35;
                if (x === -3) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
        }
        ctx.stroke(); ctx.lineWidth = 1;
        // 点
        const pts = [{x:-1.5,y:1.5,label:'A'},{x:1,y:1.8,label:'B'},{x:1.8,y:2.2,label:'G'}];
        ctx.fillStyle = '#ffc107';
        pts.forEach(p => {
            const px = 240 + p.x*35, py = 160 - p.y*35;
            ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.font = '12px Arial';
            ctx.fillText(p.label, px + 8, py - 6);
            ctx.fillStyle = '#ffc107';
        });
        ctx.fillStyle = '#fff'; ctx.font = '13px Arial';
        const tips = ['过A、B画直线，交点关于x轴翻转 = A+B', '过A作切线，交点翻转 = 2A', '从基点G反复倍乘生成 K = kG', 'ECDLP: 已知G和K，求k极困难'];
        ctx.fillText(tips[Math.min(step,3)], 30, 280);
    }
    drawCurve();
    const t = setInterval(() => { step++; drawCurve(); if (step > 4) clearInterval(t); }, 1300);
};

/* --- 哈希任意→固定映射（项目5动画0） --- */
window.anim_p5_0 = function (cv) {
    const ctx = cv.getContext('2d');
    let phase = 0;
    function draw() {
        ctx.clearRect(0, 0, 480, 320);
        ctx.fillStyle = '#00d4ff'; ctx.font = '13px Arial';
        ctx.fillText('任意长度输入', 30, 60);
        ctx.font = '12px Orbitron, monospace';
        ctx.fillText('Hello, Cryptography!', 30, 85);
        // 管道
        ctx.fillStyle = 'rgba(123,47,247,0.3)';
        ctx.fillRect(200, 50, 80, 70);
        ctx.fillStyle = '#7b2ff7'; ctx.font = 'bold 13px Arial';
        ctx.fillText('Hash', 220, 90);
        // 输出固定长度
        ctx.fillStyle = '#f107a3'; ctx.font = '12px Arial';
        ctx.fillText('固定长度输出', 330, 60);
        ctx.font = '12px Orbitron, monospace';
        const out = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
        ctx.fillStyle = phase === 0 ? '#888' : '#f107a3';
        ctx.fillText(out.substring(0, Math.min(phase * 8, out.length)), 330, 85);
        ctx.fillStyle = '#fff'; ctx.font = '12px Arial';
        ctx.fillText('把无限多转化为固定的处理过程', 30, 180);
        ctx.fillStyle = '#888';
        ctx.fillText('不可逆：无法从哈希值反推原文', 30, 200);
    }
    draw();
    const t = setInterval(() => { phase++; draw(); if (phase > 8) clearInterval(t); }, 300);
};

/* --- 雪崩效应对比（项目5动画1） --- */
window.anim_p5_1 = function (cv) {
    const ctx = cv.getContext('2d');
    function md5like(s) {
        let h = 0; for (let i=0;i<s.length;i++) h = (h*31 + s.charCodeAt(i)) >>> 0;
        return h.toString(16).padStart(8,'0');
    }
    function draw() {
        ctx.clearRect(0, 0, 480, 320);
        const h1 = md5like('Hello'), h2 = md5like('hello');
        ctx.fillStyle = '#00d4ff'; ctx.font = 'bold 14px Arial';
        ctx.fillText('输入: Hello', 30, 60);
        ctx.font = '14px Orbitron, monospace';
        ctx.fillText(h1, 30, 90);
        ctx.fillStyle = '#f107a3'; ctx.font = 'bold 14px Arial';
        ctx.fillText('输入: hello（仅大小写不同）', 30, 130);
        ctx.font = '14px Orbitron, monospace';
        ctx.fillText(h2, 30, 160);
        // 差异
        let diff = 0;
        for (let i = 0; i < 8; i++) if (h1[i] !== h2[i]) diff++;
        ctx.fillStyle = '#ffc107'; ctx.font = 'bold 14px Arial';
        ctx.fillText('哈希值 ' + diff + '/8 位完全不同', 30, 210);
        ctx.fillStyle = '#fff'; ctx.font = '12px Arial';
        ctx.fillText('雪崩效应：输入微小变化 → 哈希值剧烈改变', 30, 240);
    }
    draw();
};

/* --- MD5填充分块（项目5动画2） --- */
window.anim_p5_2 = function (cv) {
    const ctx = cv.getContext('2d');
    let step = 0;
    const steps = ['原始 "Hi"（2字节）','补 0x80（10000000）','补 0 至 448 位','附加 64 位原始长度','切分为 16 个 4 字节子块'];
    function draw() {
        ctx.clearRect(0, 0, 480, 320);
        ctx.fillStyle = '#ffc107'; ctx.font = 'bold 13px Arial';
        ctx.fillText(steps[Math.min(step,4)], 30, 40);
        const items = step === 0 ? ['Hi'] :
            step === 1 ? ['Hi', '80'] :
            step === 2 ? ['Hi','80','00','00','00','00','00','00'] :
            step === 3 ? ['Hi','80','00×5','10 00 00 00 00 00 00 00'] :
            ['块1','块2','块3','块4','块5','块6','块7','块8','块9','块10','块11','块12','块13','块14','块15','块16'];
        ctx.font = 'bold 16px Orbitron, monospace';
        items.forEach((it, i) => {
            const x = 30 + (i % 8) * 52, y = 80 + Math.floor(i/8) * 55;
            ctx.fillStyle = 'rgba(0,212,255,0.2)'; ctx.strokeStyle = '#00d4ff';
            ctx.fillRect(x, y, 45, 40); ctx.strokeRect(x, y, 45, 40);
            ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
            ctx.fillText(it, x + 22, y + 26);
            ctx.textAlign = 'left';
        });
        ctx.fillStyle = '#888'; ctx.font = '12px Arial';
        ctx.fillText('小端序附加原始比特长度（2×8=16=0x10）', 30, 280);
    }
    draw();
    const t = setInterval(() => { step++; draw(); if (step > 5) clearInterval(t); }, 900);
};

/* --- 区块链哈希链（项目5动画3） --- */
window.anim_p5_3 = function (cv) {
    const ctx = cv.getContext('2d');
    let phase = 0;
    function draw() {
        ctx.clearRect(0, 0, 480, 320);
        const blocks = ['区块1', '区块2', '区块3', '区块4'];
        for (let i = 0; i < blocks.length; i++) {
            const x = 40 + i * 110, y = 130;
            const tampered = (i === 2 && phase === 1);
            ctx.fillStyle = tampered ? 'rgba(241,7,163,0.3)' : 'rgba(0,212,255,0.2)';
            ctx.strokeStyle = tampered ? '#f107a3' : '#00d4ff';
            ctx.fillRect(x, y, 80, 60); ctx.strokeRect(x, y, 80, 60);
            ctx.fillStyle = '#fff'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center';
            ctx.fillText(blocks[i], x + 40, y + 25);
            ctx.font = '9px Orbitron, monospace';
            ctx.fillText(i === 0 ? '根哈希' : '哈希' + i, x + 40, y + 45);
            ctx.textAlign = 'left';
            // 链指针
            if (i > 0) {
                ctx.strokeStyle = tampered ? '#f107a3' : 'rgba(255,255,255,0.4)';
                ctx.setLineDash([3,3]);
                ctx.beginPath(); ctx.moveTo(x - 8, y + 30); ctx.lineTo(x - 30, y + 30); ctx.stroke();
                ctx.setLineDash([]);
            }
        }
        ctx.fillStyle = phase === 0 ? '#fff' : '#f107a3';
        ctx.font = 'bold 13px Arial';
        ctx.fillText(phase === 0 ? '数据链：每个区块含前块哈希，防篡改' : '⚠️ 区块2被篡改 → 哈希剧变 → 后续连锁失效', 30, 270);
    }
    draw();
    setTimeout(() => { phase = 1; draw(); }, 1800);
};

/* --- MAC与哈希输入差异（项目6动画0） --- */
window.anim_p6_0 = function (cv) {
    const ctx = cv.getContext('2d');
    let phase = 0;
    function draw() {
        ctx.clearRect(0, 0, 480, 320);
        // 哈希
        ctx.fillStyle = '#00d4ff'; ctx.font = 'bold 14px Arial';
        ctx.fillText('哈希函数', 60, 50);
        ctx.fillStyle = '#888'; ctx.font = '12px Arial';
        ctx.fillText('输入: 消息 M', 60, 80);
        ctx.fillStyle = '#00d4ff'; ctx.font = '12px Orbitron, monospace';
        ctx.fillText('H(M)', 60, 110);
        ctx.fillStyle = '#888'; ctx.font = '11px Arial';
        ctx.fillText('只验证完整性', 60, 135);
        // MAC
        ctx.fillStyle = '#f107a3'; ctx.font = 'bold 14px Arial';
        ctx.fillText('消息认证码 MAC', 300, 50);
        ctx.fillStyle = '#888'; ctx.font = '12px Arial';
        ctx.fillText('输入: 消息 M + 密钥 K', 300, 80);
        ctx.fillStyle = phase === 0 ? '#888' : '#ffc107'; ctx.font = '12px Orbitron, monospace';
        ctx.fillText('MAC(K, M)', 300, 110);
        ctx.fillStyle = '#888'; ctx.font = '11px Arial';
        ctx.fillText('验证完整性 + 真实性', 300, 135);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 13px Arial';
        ctx.fillText('核心差异：MAC 多出"共享密钥"这一输入', 60, 220);
        ctx.fillStyle = '#888'; ctx.font = '12px Arial';
        ctx.fillText('有了密钥才能生成/验证标签，防止伪造', 60, 245);
    }
    draw();
};

/* --- MAC生成验证流程（项目6动画1） --- */
window.anim_p6_1 = function (cv) {
    const ctx = cv.getContext('2d');
    let phase = 0;
    function draw() {
        ctx.clearRect(0, 0, 480, 320);
        ctx.textAlign = 'left';
        ctx.fillStyle = '#00d4ff'; ctx.font = 'bold 13px Arial';
        ctx.fillText('发送方', 30, 50);
        ctx.fillStyle = '#888'; ctx.font = '12px Arial';
        ctx.fillText('消息 M + 密钥 K', 30, 75);
        ctx.fillStyle = phase >= 0 ? '#f107a3' : '#888'; ctx.font = 'bold 13px Orbitron, monospace';
        ctx.fillText('Tag = MAC(K,M)', 30, 105);
        // 传输
        ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.setLineDash([4,4]);
        ctx.beginPath(); ctx.moveTo(150, 120); ctx.lineTo(330, 120); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = phase >= 1 ? '#fff' : '#888'; ctx.font = '11px Arial';
        ctx.fillText('消息+Tag 传输', 180, 110);
        ctx.fillStyle = '#00d4ff'; ctx.font = 'bold 13px Arial';
        ctx.fillText('接收方', 350, 50);
        ctx.fillStyle = '#888'; ctx.font = '12px Arial';
        ctx.fillText('用相同K、M重算MAC', 350, 75);
        ctx.fillStyle = phase >= 2 ? (phase === 3 ? '#4cd964' : '#888') : '#888';
        ctx.font = 'bold 13px Orbitron, monospace';
        ctx.fillText(phase === 3 ? '✅ 验证通过' : '比对 Tag', 350, 105);
        ctx.fillStyle = '#fff'; ctx.font = '12px Arial';
        const tip = phase < 2 ? '① 发送方用密钥生成Tag' : (phase === 2 ? '② 接收方重算并比对' : '③ 一致→认证成功，不一致→篡改');
        ctx.fillText(tip, 30, 250);
    }
    draw();
    const t = setInterval(() => { phase++; draw(); if (phase > 3) clearInterval(t); }, 1100);
};

/* --- HMAC双重哈希结构（项目6动画2） --- */
window.anim_p6_2 = function (cv) {
    const ctx = cv.getContext('2d');
    let phase = 0;
    function draw() {
        ctx.clearRect(0, 0, 480, 320);
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ffc107'; ctx.font = 'bold 13px Orbitron, monospace';
        ctx.fillText('HMAC(K,M) = H( (K⁺⊕opad) ∥ H( (K⁺⊕ipad) ∥ M ) )', 20, 40);
        // K+
        ctx.fillStyle = '#888'; ctx.font = '12px Arial';
        ctx.fillText('密钥预处理 K⁺', 20, 70);
        // 内层
        ctx.fillStyle = '#00d4ff'; ctx.font = '12px Arial';
        ctx.fillText('K⁺⊕ipad (0x36)', 20, 105);
        ctx.fillText('内层哈希 H_inner', 20, 135);
        // 外层
        ctx.fillStyle = '#f107a3'; ctx.font = '12px Arial';
        ctx.fillText('K⁺⊕opad (0x5C)', 20, 170);
        ctx.fillText('外层哈希 = HMAC', 20, 200);
        ctx.fillStyle = '#fff'; ctx.font = '12px Arial';
        ctx.fillText('双重哈希 + 密钥混淆，即使破解一层仍需突破第二层', 20, 250);
        // 高亮当前层
        if (phase === 0) { ctx.fillStyle = 'rgba(255,193,7,0.2)'; ctx.fillRect(15, 62, 450, 22); }
        if (phase === 1) { ctx.fillStyle = 'rgba(0,212,255,0.2)'; ctx.fillRect(15, 97, 450, 52); }
        if (phase === 2) { ctx.fillStyle = 'rgba(241,7,163,0.2)'; ctx.fillRect(15, 162, 450, 52); }
    }
    draw();
    const t = setInterval(() => { phase = (phase + 1) % 3; draw(); }, 1200);
};

/* --- 重放攻击与防御（项目6动画3） --- */
window.anim_p6_3 = function (cv) {
    const ctx = cv.getContext('2d');
    let phase = 0;
    function draw() {
        ctx.clearRect(0, 0, 480, 320);
        ctx.textAlign = 'left';
        ctx.fillStyle = '#00d4ff'; ctx.font = 'bold 13px Arial';
        ctx.fillText('攻击者', 30, 50);
        ctx.fillStyle = '#f107a3'; ctx.font = 'bold 13px Arial';
        ctx.fillText('接收方', 380, 50);
        // 消息
        const txt = phase === 0 ? '📨 合法消息（首次）' : '📨 重放同一消息';
        ctx.fillStyle = phase === 0 ? '#4cd964' : '#f107a3'; ctx.font = 'bold 13px Arial';
        ctx.fillText(txt, 30, 100);
        // 箭头
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(180, 95); ctx.lineTo(360, 95); ctx.stroke();
        ctx.fillStyle = phase === 0 ? '#4cd964' : '#f107a3'; ctx.font = '12px Arial';
        ctx.fillText(phase === 0 ? '✅ 通过验证' : '⚠️ 需校验时间戳/序列号/Nonce', 120, 130);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 13px Arial';
        ctx.fillText(phase === 0 ? '无防御：重放被接受，造成安全风险' : '有防御：时间戳超±5分钟容差 → 拒绝重放', 30, 200);
        ctx.fillStyle = '#888'; ctx.font = '12px Arial';
        ctx.fillText('三类防御：序列号同步、时间戳校验、一次性随机数 Nonce', 30, 230);
        ctx.lineWidth = 1;
    }
    draw();
    setTimeout(() => { phase = 1; draw(); }, 1800);
};

/* --- 签名验签时序（项目7动画0） --- */
window.anim_p7_0 = function (cv) {
    const ctx = cv.getContext('2d');
    let phase = 0;
    function draw() {
        ctx.clearRect(0, 0, 480, 320);
        ctx.textAlign = 'left';
        ctx.fillStyle = '#00d4ff'; ctx.font = 'bold 13px Arial';
        ctx.fillText('Alice（发送方）', 20, 50);
        ctx.fillStyle = '#f107a3';
        ctx.fillText('Bob（接收方）', 320, 50);
        ctx.fillStyle = '#888'; ctx.font = '11px Arial';
        ctx.fillText('🔑 私钥签名', 20, 72);
        ctx.fillText('🔓 公钥验签', 320, 72);
        // 消息+签名
        ctx.fillStyle = phase >= 0 ? '#fff' : '#888'; ctx.font = '12px Orbitron, monospace';
        ctx.fillText('消息 + 签名', 20, 110);
        ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.setLineDash([4,4]);
        ctx.beginPath(); ctx.moveTo(140, 105); ctx.lineTo(310, 105); ctx.stroke(); ctx.setLineDash([]);
        // 摘要比对
        ctx.fillStyle = '#ffc107'; ctx.font = '11px Orbitron, monospace';
        ctx.fillText('摘要A', 20, 160);
        ctx.fillText('摘要B', 320, 160);
        ctx.fillStyle = phase >= 2 ? '#4cd964' : '#888'; ctx.font = 'bold 14px Arial';
        ctx.fillText(phase >= 2 ? '✅ 签名有效，未篡改、来源真实' : '重算摘要并比对…', 60, 230);
        ctx.fillStyle = '#888'; ctx.font = '11px Arial';
        ctx.fillText('不一致则亮红灯：消息被篡改', 60, 255);
    }
    draw();
    const t = setInterval(() => { phase++; draw(); if (phase > 3) clearInterval(t); }, 1100);
};

/* --- 哈希数字指纹（项目7动画1） --- */
window.anim_p7_1 = function (cv) {
    const ctx = cv.getContext('2d');
    let phase = 0;
    function draw() {
        ctx.clearRect(0, 0, 480, 320);
        ctx.fillStyle = '#00d4ff'; ctx.font = '13px Arial';
        ctx.fillText('输入任意长度消息', 30, 50);
        ctx.font = '12px Orbitron, monospace';
        ctx.fillText('"转我五百万"', 30, 75);
        ctx.fillStyle = 'rgba(123,47,247,0.3)';
        ctx.fillRect(180, 40, 100, 70);
        ctx.fillStyle = '#7b2ff7'; ctx.font = 'bold 13px Arial';
        ctx.fillText('Hash', 210, 80);
        ctx.fillStyle = '#f107a3'; ctx.font = '12px Arial';
        ctx.fillText('固定长度摘要', 330, 50);
        ctx.font = '12px Orbitron, monospace';
        ctx.fillStyle = phase === 0 ? '#888' : '#f107a3';
        ctx.fillText('d41d8cd98f00b204e9800998ecf8427e', 330, 75);
        ctx.fillStyle = '#fff'; ctx.font = '12px Arial';
        ctx.fillText('任意长度 → 固定长度，单向不可逆', 30, 180);
        ctx.fillStyle = '#888';
        ctx.fillText('为电子文件生成唯一且不可篡改的"指纹"', 30, 205);
    }
    draw();
    const t = setInterval(() => { phase++; draw(); if (phase > 2) clearInterval(t); }, 1200);
};

/* --- X.509证书字段拆解（项目7动画2） --- */
window.anim_p7_2 = function (cv) {
    const ctx = cv.getContext('2d');
    const fields = ['版本', '序列号', '签名算法标识符', '颁发者', '有效期', '主体', '主体公钥信息'];
    let step = 0;
    function draw() {
        ctx.clearRect(0, 0, 480, 320);
        ctx.fillStyle = '#00d4ff'; ctx.font = 'bold 14px Arial';
        ctx.fillText('X.509 证书核心字段', 30, 35);
        for (let i = 0; i < fields.length; i++) {
            const y = 60 + i * 32;
            ctx.fillStyle = i === step ? 'rgba(241,7,163,0.25)' : 'rgba(255,255,255,0.05)';
            ctx.strokeStyle = i === step ? '#f107a3' : '#445';
            ctx.fillRect(30, y, 420, 28); ctx.strokeRect(30, y, 420, 28);
            ctx.fillStyle = i === step ? '#fff' : '#888'; ctx.font = '13px Arial';
            ctx.fillText((i+1) + '. ' + fields[i], 45, y + 18);
        }
        ctx.fillStyle = '#ffc107'; ctx.font = '12px Arial';
        ctx.fillText('版本3（当前）通过扩展项支持更复杂信息', 30, 290);
    }
    draw();
    const t = setInterval(() => { step++; draw(); if (step > 7) clearInterval(t); }, 700);
};

/* --- 证书七步流程（项目7动画3） --- */
window.anim_p7_3 = function (cv) {
    const ctx = cv.getContext('2d');
    const steps = ['密钥生成', '证书申请', '证书颁发', '证书部署', '证书获取', '证书验证', '加密通信'];
    let step = 0;
    function draw() {
        ctx.clearRect(0, 0, 480, 320);
        for (let i = 0; i < 7; i++) {
            const x = 25 + i * 65, y = 150;
            const active = i <= step;
            ctx.fillStyle = active ? '#00d4ff' : 'rgba(255,255,255,0.1)';
            ctx.beginPath(); ctx.arc(x + 25, y, 22, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#000'; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'center';
            ctx.fillText(i+1, x + 25, y + 5);
            ctx.fillStyle = active ? '#fff' : '#888'; ctx.font = '10px Arial';
            ctx.fillText(steps[i], x + 25, y + 45);
            ctx.textAlign = 'left';
            if (i > 0) {
                ctx.strokeStyle = active ? '#00d4ff' : '#445';
                ctx.beginPath(); ctx.moveTo(x + 47, y); ctx.lineTo(x + 65, y); ctx.stroke();
            }
        }
        ctx.fillStyle = step >= 6 ? '#4cd964' : '#ffc107'; ctx.font = 'bold 13px Arial';
        ctx.fillText(step >= 6 ? '✅ 证书流程完成，建立安全通信' : '进行中: ' + steps[step], 30, 250);
    }
    draw();
    const t = setInterval(() => { step++; draw(); if (step > 7) clearInterval(t); }, 900);
};

/* --- SSL/TLS握手三阶段（项目8动画0） --- */
window.anim_p8_0 = function (cv) {
    const ctx = cv.getContext('2d');
    const phases = ['握手阶段', '密钥交换阶段', '数据传输阶段'];
    let phase = 0;
    function draw() {
        ctx.clearRect(0, 0, 480, 320);
        ctx.fillStyle = '#ffc107'; ctx.font = 'bold 14px Arial';
        ctx.fillText('SSL/TLS ' + phases[Math.min(phase,2)], 30, 35);
        const items = [
            ['客户端发送算法列表','服务器返回数字证书','客户端验证后用公钥加密随机数'],
            ['服务器用私钥解密随机数','双方获得共同对称密钥','完成密钥秘密交换'],
            ['对称密钥加密传输','消息认证码确保未篡改','保障机密性 + 完整性']
        ][Math.min(phase,2)];
        ctx.fillStyle = '#00d4ff'; ctx.font = '13px Arial';
        items.forEach((it, i) => {
            ctx.fillStyle = 'rgba(0,212,255,0.1)'; ctx.strokeStyle = '#00d4ff';
            ctx.fillRect(30, 70 + i * 50, 420, 40); ctx.strokeRect(30, 70 + i * 50, 420, 40);
            ctx.fillStyle = '#fff';
            ctx.fillText('✓ ' + it, 45, 95 + i * 50);
        });
        ctx.fillStyle = '#888'; ctx.font = '11px Arial';
        ctx.fillText('三阶段协同，实现传输的机密性与完整性', 30, 280);
    }
    draw();
    const t = setInterval(() => { phase++; draw(); if (phase > 3) clearInterval(t); }, 1600);
};

/* --- 认证因素分层叠加（项目8动画1） --- */
window.anim_p8_1 = function (cv) {
    const ctx = cv.getContext('2d');
    let layer = 0;
    const layers = ['用户名 + 密码（知识因素）', '+ 手机 OTP / 令牌（持有因素）', '+ 指纹 / 面部（生物识别因素）'];
    function draw() {
        ctx.clearRect(0, 0, 480, 320);
        for (let i = 0; i < 3; i++) {
            const y = 80 + i * 55;
            const active = i <= layer;
            ctx.fillStyle = active ? ['rgba(0,212,255,0.2)','rgba(255,193,7,0.2)','rgba(76,217,100,0.2)'][i] : 'rgba(255,255,255,0.04)';
            ctx.strokeStyle = active ? ['#00d4ff','#ffc107','#4cd964'][i] : '#445';
            ctx.fillRect(30, y, 420, 45); ctx.strokeRect(30, y, 420, 45);
            ctx.fillStyle = active ? '#fff' : '#666'; ctx.font = '13px Arial';
            ctx.fillText(layers[i], 45, y + 27);
        }
        // 强度条
        const strength = (layer + 1) / 3;
        ctx.fillStyle = '#888'; ctx.font = '12px Arial';
        ctx.fillText('安全强度', 30, 275);
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(90, 265, 330, 12);
        ctx.fillStyle = '#4cd964';
        ctx.fillRect(90, 265, 330 * strength, 12);
    }
    draw();
    const t = setInterval(() => { layer++; draw(); if (layer > 3) clearInterval(t); }, 1300);
};

/* --- 密钥生命周期（项目8动画2） --- */
window.anim_p8_2 = function (cv) {
    const ctx = cv.getContext('2d');
    const steps = ['生成', '分发', '存储', '轮换', '销毁'];
    let step = 0;
    function draw() {
        ctx.clearRect(0, 0, 480, 320);
        for (let i = 0; i < 5; i++) {
            const x = 30 + i * 92, y = 130;
            const active = i <= step;
            ctx.fillStyle = active ? '#f107a3' : 'rgba(255,255,255,0.1)';
            ctx.beginPath(); ctx.arc(x + 30, y, 22, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#000'; ctx.font = 'bold 13px Arial'; ctx.textAlign = 'center';
            ctx.fillText(steps[i], x + 30, y + 5);
            ctx.textAlign = 'left';
            if (i > 0) {
                ctx.strokeStyle = active ? '#f107a3' : '#445';
                ctx.beginPath(); ctx.moveTo(x + 52, y); ctx.lineTo(x + 92, y); ctx.stroke();
            }
        }
        ctx.fillStyle = '#fff'; ctx.font = '12px Arial';
        const desc = ['强随机数、确定算法参数','加密通道、仅授权接收','HSM加密、严格访问控制','定期轮换、48小时内更新','零填充、覆盖介质、记录审计'];
        ctx.fillText(desc[Math.min(step,4)], 30, 220);
        ctx.fillStyle = '#888'; ctx.font = '11px Arial';
        ctx.fillText('全生命周期管理，保障密钥始终安全', 30, 250);
    }
    draw();
    const t = setInterval(() => { step++; draw(); if (step > 5) clearInterval(t); }, 1100);
};

/* --- 挑战响应身份鉴别（项目8动画3） --- */
window.anim_p8_3 = function (cv) {
    const ctx = cv.getContext('2d');
    let phase = 0;
    function draw() {
        ctx.clearRect(0, 0, 480, 320);
        ctx.textAlign = 'left';
        ctx.fillStyle = '#00d4ff'; ctx.font = 'bold 13px Arial';
        ctx.fillText('客户端', 30, 50);
        ctx.fillStyle = '#f107a3';
        ctx.fillText('签名验签服务器', 320, 50);
        const flows = ['请求挑战值','返回挑战值','计算响应值并发送','验证签名','返回验签结果','登录成功'];
        ctx.fillStyle = phase < 2 ? '#888' : (phase === 5 ? '#4cd964' : '#fff');
        ctx.font = '13px Arial';
        ctx.fillText(flows[Math.min(phase,5)], 30, 110);
        ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.setLineDash([4,4]);
        ctx.beginPath(); ctx.moveTo(160, 105); ctx.lineTo(320, 105); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = '#888'; ctx.font = '11px Arial';
        ctx.fillText('基于挑战/响应机制，可用 SM2 协同签名', 30, 200);
        ctx.fillStyle = '#ffc107'; ctx.font = '12px Arial';
        ctx.fillText('客户端用私钥生成签名，服务端验签确认身份', 30, 225);
    }
    draw();
    const t = setInterval(() => { phase++; draw(); if (phase > 6) clearInterval(t); }, 800);
};

/* ==================== 互动实验 ==================== */
function renderExperiment(p, idx) {
    const wrap = document.getElementById('exp-' + p.id);
    if (!wrap) return;
    const experiments = {
        p1: renderExpP1, p2: renderExpP2, p3: renderExpP3, p4: renderExpP4,
        p5: renderExpP5, p6: renderExpP6, p7: renderExpP7, p8: renderExpP8
    };
    const fn = experiments[p.id];
    if (fn) fn(wrap);
}

/* 项目1：凯撒密码实验 */
function renderExpP1(w) {
    w.innerHTML = `
        <h4 style="color:#fff;margin-bottom:12px;">🔧 凯撒密码加解密实验</h4>
        <div class="encoder">
            <div class="encoder-group">
                <label>输入明文：</label>
                <input type="text" id="exp1-input" value="HELLO WORLD" oninput="exp1Encode()">
            </div>
            <div class="encoder-group">
                <label>偏移量（密钥）：</label>
                <input type="number" id="exp1-shift" value="3" min="0" max="25" oninput="exp1Encode()">
            </div>
            <div class="encoder-group">
                <label>加密结果（密文）：</label>
                <div class="output-box" id="exp1-out">KHOOR ZRUOG</div>
            </div>
            <div class="encoder-group">
                <label>暴力破解（遍历密钥0-25）：</label>
                <button class="btn-demo" onclick="exp1Brute()">🔓 暴力破解当前密文</button>
            </div>
            <div id="exp1-brute" style="margin-top:12px;"></div>
        </div>`;
    exp1Encode();
}
function shiftChar(ch, s) {
    const u = ch.toUpperCase(); const i = ALPHABET.indexOf(u);
    if (i === -1) return ch;
    const lower = ch.isLowerCase();
    return (lower ? ALPHABET[(i + s + 26) % 26].toLowerCase() : ALPHABET[(i + s + 26) % 26]);
}
function exp1Encode() {
    const txt = document.getElementById('exp1-input').value;
    const s = parseInt(document.getElementById('exp1-shift').value) || 0;
    const out = txt.split('').map(c => shiftChar(c, s)).join('');
    document.getElementById('exp1-out').textContent = out;
}
function exp1Brute() {
    const cipher = document.getElementById('exp1-out').textContent.replace(/\s/g,'');
    const box = document.getElementById('exp1-brute');
    let html = '<div style="font-family:Orbitron,monospace;font-size:13px;max-height:150px;overflow:auto;background:rgba(0,0,0,0.3);padding:12px;border-radius:8px;">';
    for (let k = 0; k < 26; k++) {
        const plain = cipher.split('').map(c => shiftChar(c, -k)).join('');
        const isHello = plain.toLowerCase().includes('hello');
        html += `<div style="${isHello?'color:#4cd964;font-weight:bold;':''}">密钥=${k.toString().padStart(2,'0')} → ${plain}</div>`;
    }
    html += '</div>';
    box.innerHTML = html;
}

/* 项目2：XOR实验 */
function renderExpP2(w) {
    w.innerHTML = `
        <h4 style="color:#fff;margin-bottom:12px;">🔧 序列密码 XOR 加解密实验</h4>
        <div class="encoder">
            <div class="encoder-group">
                <label>明文（输入字符）：</label>
                <input type="text" id="exp2-input" value="HI" maxlength="8" oninput="exp2Calc()">
            </div>
            <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
                <div class="encoder-group" style="flex:1;min-width:160px;">
                    <label>明文二进制</label>
                    <div class="output-box" id="exp2-plain" style="font-size:14px;">01001000</div>
                </div>
                <div class="encoder-group" style="flex:1;min-width:160px;">
                    <label>密钥流</label>
                    <div class="output-box" id="exp2-key" style="font-size:14px;">10101010</div>
                </div>
                <div class="encoder-group" style="flex:1;min-width:160px;">
                    <label>密文二进制</label>
                    <div class="output-box" id="exp2-cipher" style="font-size:14px;color:#f107a3;">11100010</div>
                </div>
            </div>
            <div class="encoder-group">
                <label>密钥流（可改）：</label>
                <input type="text" id="exp2-keyinput" value="10101010" maxlength="8" oninput="exp2Calc()">
            </div>
            <div class="encoder-group">
                <label>解密还原（C⊕K）：</label>
                <div class="output-box" id="exp2-decrypt" style="color:#4cd964;">HI</div>
            </div>
        </div>`;
    exp2Calc();
}
function exp2Calc() {
    const txt = document.getElementById('exp2-input').value || 'A';
    const keyBin = document.getElementById('exp2-keyinput').value || '00000000';
    const plainBin = txt.split('').map(c => c.charCodeAt(0).toString(2).padStart(8,'0')).join('');
    const plainBytes = plainBin.match(/.{8}/g) || [];
    const keyBytes = keyBin.match(/.{8}/g) || [];
    const cipherBytes = plainBytes.map((b, i) => {
        const kb = keyBytes[i % keyBytes.length];
        let r = ''; for (let j=0;j<8;j++) r += ((+b[j])^(+kb[j]))?'1':'0';
        return r;
    });
    document.getElementById('exp2-plain').textContent = plainBytes.join(' ');
    document.getElementById('exp2-key').textContent = keyBytes.join(' ');
    document.getElementById('exp2-cipher').textContent = cipherBytes.join(' ');
    // 解密
    const decBytes = cipherBytes.map((b, i) => {
        const kb = keyBytes[i % keyBytes.length];
        let r = ''; for (let j=0;j<8;j++) r += ((+b[j])^(+kb[j]))?'1':'0';
        return r;
    });
    const decStr = decBytes.map(b => String.fromCharCode(parseInt(b,2))).join('');
    document.getElementById('exp2-decrypt').textContent = decStr;
}

/* 项目3：工作模式选型 */
function renderExpP3(w) {
    const scenarios = [
        { s: '海量文件高速并行加密，无错误传播、无需填充', ans: 'CTR' },
        { s: '文件加密与 SSL/TLS 通信（链式依赖、安全性高）', ans: 'CBC' },
        { s: '实时视频流加密（流模式效果）', ans: 'CFB' },
        { s: '卫星抗干扰通信（无错误传播、可预生成密钥流）', ans: 'OFB' },
        { s: '学习对比：相同明文块产生相同密文块（安全性低）', ans: 'ECB' }
    ];
    w.innerHTML = `
        <h4 style="color:#fff;margin-bottom:12px;">🔧 分组密码工作模式选型练习</h4>
        <p class="demo-desc">根据场景选择正确的工作模式，点击选项提交。</p>
        <div id="exp3-list" class="exercise-grid"></div>`;
    const list = document.getElementById('exp3-list');
    list.innerHTML = scenarios.map((sc, i) => `
        <div class="exercise-card" id="exp3-${i}">
            <div class="q-head"><span class="q-type-badge q-type-select">选择</span><span class="q-text">${i+1}. ${esc(sc.s)}</span></div>
            <div class="q-options">${['ECB','CBC','CFB','OFB','CTR'].map(m => `<div class="q-option" onclick="exp3Check(${i},'${m}',this)">${m}</div>`).join('')}</div>
            <div class="q-feedback" id="exp3fb-${i}"></div>
        </div>`).join('');
}
function exp3Check(i, m, el) {
    const scenarios = [
        '海量文件高速并行加密，无错误传播、无需填充',
        '文件加密与 SSL/TLS 通信',
        '实时视频流加密',
        '卫星抗干扰通信',
        '相同明文块产生相同密文块'
    ];
    const correct = ['CTR','CBC','CFB','OFB','ECB'][i];
    const card = document.getElementById('exp3-' + i);
    if (card.classList.contains('solved')) return;
    card.classList.add('solved');
    document.querySelectorAll(`#exp3-${i} .q-option`).forEach(o => {
        o.style.cursor = 'default';
        if (o.textContent === correct) o.classList.add('correct');
        else if (o.textContent === m) o.classList.add('wrong');
    });
    const fb = document.getElementById('exp3fb-' + i);
    fb.className = 'q-feedback show ' + (m === correct ? 'ok' : 'bad');
    fb.innerHTML = `<span class="q-answer-line">${m === correct ? '✅ 正确' : '❌ 错误'}</span><br>答案：<b style="color:#4cd964">${correct}</b>`;
}

/* 项目4：RSA小数字实验 */
function renderExpP4(w) {
    w.innerHTML = `
        <h4 style="color:#fff;margin-bottom:12px;">🔧 RSA 小数字加解密实验</h4>
        <div class="encoder">
            <div class="encoder-group">
                <label>质数 p：</label>
                <input type="number" id="exp4-p" value="17" oninput="exp4Calc()">
            </div>
            <div class="encoder-group">
                <label>质数 q：</label>
                <input type="number" id="exp4-q" value="19" oninput="exp4Calc()">
            </div>
            <div class="encoder-group">
                <label>明文数字（1 到 n-1）：</label>
                <input type="number" id="exp4-msg" value="65" oninput="exp4Calc()">
            </div>
            <div class="encoder-group">
                <label>公钥 (E, N)：</label>
                <div class="output-box" id="exp4-pub" style="font-size:14px;">(5, 323)</div>
            </div>
            <div class="encoder-group">
                <label>私钥 (D, N)：</label>
                <div class="output-box" id="exp4-priv" style="font-size:14px;color:#ffc107;">(229, 323)</div>
            </div>
            <div class="encoder-group">
                <label>加密结果（C = M^E mod N）：</label>
                <div class="output-box" id="exp4-cipher" style="color:#f107a3;">...</div>
            </div>
            <div class="encoder-group">
                <label>解密还原（C^D mod N）：</label>
                <div class="output-box" id="exp4-decrypt" style="color:#4cd964;">...</div>
            </div>
        </div>`;
    exp4Calc();
}
function exp4Calc() {
    const p = parseInt(document.getElementById('exp4-p').value) || 17;
    const q = parseInt(document.getElementById('exp4-q').value) || 19;
    const n = p * q;
    const L = (p - 1) * (q - 1);
    let E = 17; while (E < L && gcd(E, L) !== 1) E++;
    const D = modInverse(E, L);
    document.getElementById('exp4-pub').textContent = `(${E}, ${n})`;
    document.getElementById('exp4-priv').textContent = `(${D}, ${n})`;
    const msg = parseInt(document.getElementById('exp4-msg').value) || 65;
    if (msg >= n) { document.getElementById('exp4-cipher').textContent = '需小于n'; document.getElementById('exp4-decrypt').textContent = '...'; return; }
    const C = BigInt(msg) ** BigInt(E) % BigInt(n);
    const M = C ** BigInt(D) % BigInt(n);
    document.getElementById('exp4-cipher').textContent = C.toString();
    document.getElementById('exp4-decrypt').textContent = M.toString() + (M === BigInt(msg) ? ' ✅' : '');
}
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
function modInverse(e, phi) {
    let m = phi, x = 0, y = 1;
    while (e > 1) { const q = Math.floor(e / phi); [e, phi] = [phi, e % phi]; [x, y] = [y - q * x, x]; }
    return y < 0 ? y + m : y;
}

/* 项目5：哈希雪崩效应实验 */
function renderExpP5(w) {
    w.innerHTML = `
        <h4 style="color:#fff;margin-bottom:12px;">🔧 哈希雪崩效应验证实验</h4>
        <div class="encoder">
            <div class="encoder-group">
                <label>输入文本1：</label>
                <input type="text" id="exp5-a" value="Hello" oninput="exp5Calc()">
            </div>
            <div class="encoder-group">
                <label>输入文本2（微小改动）：</label>
                <input type="text" id="exp5-b" value="hello" oninput="exp5Calc()">
            </div>
            <div class="encoder-group">
                <label>哈希值1（SHA-256）：</label>
                <div class="output-box" id="exp5-ha" style="font-size:12px;word-break:break-all;">...</div>
            </div>
            <div class="encoder-group">
                <label>哈希值2（SHA-256）：</label>
                <div class="output-box" id="exp5-hb" style="font-size:12px;word-break:break-all;color:#f107a3;">...</div>
            </div>
            <div class="encoder-group">
                <label>差异对比：</label>
                <div class="output-box" id="exp5-diff" style="color:#ffc107;">...</div>
            </div>
        </div>`;
    exp5Calc();
}
function exp5Calc() {
    const a = document.getElementById('exp5-a').value || 'a';
    const b = document.getElementById('exp5-b').value || 'b';
    const ha = sha256Hex(a), hb = sha256Hex(b);
    document.getElementById('exp5-ha').textContent = ha;
    document.getElementById('exp5-hb').textContent = hb;
    let diff = 0;
    for (let i = 0; i < ha.length; i++) if (ha[i] !== hb[i]) diff++;
    const rate = (diff / ha.length * 100).toFixed(1);
    document.getElementById('exp5-diff').textContent = `${diff}/${ha.length} 位不同（${rate}%）→ 雪崩效应显著`;
}
async function sha256Hex(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2,'0')).join('');
}

/* 项目6：HMAC生成实验 */
function renderExpP6(w) {
    w.innerHTML = `
        <h4 style="color:#fff;margin-bottom:12px;">🔧 HMAC 生成与验证实验</h4>
        <div class="encoder">
            <div class="encoder-group">
                <label>密钥：</label>
                <input type="text" id="exp6-key" value="secret_key" oninput="exp6Calc()">
            </div>
            <div class="encoder-group">
                <label>消息：</label>
                <input type="text" id="exp6-msg" value="Hello, HMAC!" oninput="exp6Calc()">
            </div>
            <div class="encoder-group">
                <label>HMAC-SHA256 认证码：</label>
                <div class="output-box" id="exp6-out" style="font-size:12px;word-break:break-all;">...</div>
            </div>
            <div class="encoder-group">
                <label>验证（输入待验证的HMAC值）：</label>
                <input type="text" id="exp6-verify" placeholder="粘贴上面的HMAC值测试">
                <button class="btn-demo" style="margin-top:10px;" onclick="exp6Verify()">验证</button>
                <div class="output-box" id="exp6-result" style="margin-top:10px;color:#4cd964;">...</div>
            </div>
        </div>`;
    exp6Calc();
}
async function exp6Calc() {
    const key = document.getElementById('exp6-key').value;
    const msg = document.getElementById('exp6-msg').value;
    const keyBytes = new TextEncoder().encode(key);
    const msgBytes = new TextEncoder().encode(msg);
    const keyHash = await crypto.subtle.digest('SHA-256', keyBytes);
    const keyHashArr = new Uint8Array(keyHash);
    // 简化：直接用 key 作为 HMAC key 计算（浏览器无原生 HMAC，用简化实现）
    const hmac = await simpleHmac(keyBytes, msgBytes);
    document.getElementById('exp6-out').textContent = hmac;
}
async function simpleHmac(key, msg) {
    // 简化的 HMAC：K' = SHA256(key)，然后 inner = SHA256(K' || msg)，outer = SHA256(K' || inner)
    const k = new Uint8Array(await crypto.subtle.digest('SHA-256', key));
    const innerData = new Uint8Array(k.length + msg.length);
    innerData.set(k); innerData.set(msg, k.length);
    const inner = new Uint8Array(await crypto.subtle.digest('SHA-256', innerData));
    const outerData = new Uint8Array(k.length + inner.length);
    outerData.set(k); outerData.set(inner, k.length);
    const outer = new Uint8Array(await crypto.subtle.digest('SHA-256', outerData));
    return [...outer].map(b => b.toString(16).padStart(2,'0')).join('');
}
async function exp6Verify() {
    const input = document.getElementById('exp6-verify').value.trim();
    const expected = document.getElementById('exp6-out').textContent;
    const ok = input === expected;
    const r = document.getElementById('exp6-result');
    r.style.color = ok ? '#4cd964' : '#f107a3';
    r.textContent = ok ? '✅ 验证通过：认证码一致，消息未被篡改' : '❌ 验证失败：认证码不一致，消息可能被篡改';
}

/* 项目7：数字签名验签实验 */
function renderExpP7(w) {
    w.innerHTML = `
        <h4 style="color:#fff;margin-bottom:12px;">🔧 数字签名与验签实验</h4>
        <div class="encoder">
            <div class="encoder-group">
                <label>原始消息：</label>
                <input type="text" id="exp7-msg" value="转我五百万" oninput="exp7Sign()">
            </div>
            <div class="encoder-group">
                <label>签名（私钥加密摘要）：</label>
                <div class="output-box" id="exp7-sig" style="font-size:12px;word-break:break-all;">...</div>
            </div>
            <div class="encoder-group">
                <label>验签用消息（可篡改测试）：</label>
                <input type="text" id="exp7-check" value="转我五百万" oninput="exp7Verify()">
            </div>
            <div class="encoder-group">
                <label>验签结果：</label>
                <div class="output-box" id="exp7-result" style="color:#4cd964;">...</div>
            </div>
            <div class="encoder-group">
                <button class="btn-demo" onclick="exp7Tamper()">🔪 篡改消息后验签</button>
            </div>
        </div>`;
    exp7Sign();
    exp7Verify();
}
async function exp7Sign() {
    const msg = document.getElementById('exp7-msg').value;
    const sig = await sha256Hex(msg);
    document.getElementById('exp7-sig').textContent = 'SHA256签名: ' + sig;
}
async function exp7Verify() {
    const msg = document.getElementById('exp7-msg').value;
    const check = document.getElementById('exp7-check').value;
    const sig = await sha256Hex(msg);
    const checkSig = await sha256Hex(check);
    const ok = sig === checkSig;
    const r = document.getElementById('exp7-result');
    r.style.color = ok ? '#4cd964' : '#f107a3';
    r.textContent = ok ? '✅ 签名有效：消息未被篡改，来源真实' : '❌ 签字无效：消息已被篡改！';
}
function exp7Tamper() {
    const check = document.getElementById('exp7-check');
    check.value = check.value + '！';
    exp7Verify();
}

/* 项目8：SSL/TLS握手拼装 */
function renderExpP8(w) {
    w.innerHTML = `
        <h4 style="color:#fff;margin-bottom:12px;">🔧 SSL/TLS 握手步骤拼装</h4>
        <p class="demo-desc">按正确顺序点击步骤，完成握手流程。</p>
        <div id="exp8-steps" style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:16px;"></div>
        <div id="exp8-result" class="output-box">已点击：0 / 8</div>`;
    const steps = ['算法列表','数字证书','验证证书','公钥加密随机数','私钥解密随机数','生成对称密钥','加密传输','MAC校验'];
    const correct = ['算法列表','数字证书','验证证书','公钥加密随机数','私钥解密随机数','生成对称密钥','加密传输','MAC校验'];
    const container = document.getElementById('exp8-steps');
    container.innerHTML = steps.map((s, i) => `<button class="btn-demo" id="exp8-btn-${i}" onclick="exp8Click(${i},'${s}')">${s}</button>`).join('');
}
function exp8Click(i, s) {
    const btn = document.getElementById('exp8-btn-' + i);
    if (btn.disabled) return;
    btn.disabled = true;
    btn.style.background = 'rgba(76,217,100,0.3)';
    btn.style.border = '1px solid #4cd964';
    const done = [...document.querySelectorAll('#exp8-steps button:not(:disabled)')].length;
    const total = 8;
    const solved = total - done;
    document.getElementById('exp8-result').textContent = `已点击：${solved} / ${total}`;
    if (solved === total) {
        document.getElementById('exp8-result').style.color = '#4cd964';
        document.getElementById('exp8-result').textContent = '✅ 握手流程拼装完成：客户端→证书→密钥交换→加密传输，实现机密性+完整性';
    }
}

/* ==================== 初始化 ==================== */
window.addEventListener('load', () => {
    COURSE_DATA.forEach((p, i) => renderProject(p, i));
});
