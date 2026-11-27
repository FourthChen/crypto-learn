/* ==================== 背景粒子效果 ==================== */
(function initBackground() {
    const canvas = document.getElementById('bgCanvas');
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createParticles() {
        particles = [];
        const count = Math.floor((canvas.width * canvas.height) / 15000);
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 1,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: (Math.random() - 0.5) * 0.3,
                color: `hsl(${Math.random() * 60 + 200}, 70%, 60%)`
            });
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
            if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        });

        // 连线
        particles.forEach((a, i) => {
            particles.slice(i + 1).forEach(b => {
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = `rgba(123, 47, 247, ${0.15 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            });
        });

        requestAnimationFrame(animate);
    }

    resize();
    createParticles();
    animate();
    window.addEventListener('resize', () => {
        resize();
        createParticles();
    });
})();

/* ==================== 导航切换 ==================== */
const navLinks = document.querySelectorAll('.nav-link');
const chapters = document.querySelectorAll('.chapter');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');

navLinks.forEach((link, index) => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);

        // 更新导航
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // 切换章节
        chapters.forEach(ch => ch.classList.remove('active'));
        document.getElementById(targetId).classList.add('active');

        // 更新进度
        updateProgress(index);

        // 关闭移动端菜单
        document.querySelector('.nav').classList.remove('show');
    });
});

// 移动端菜单
document.getElementById('menuBtn').addEventListener('click', () => {
    document.querySelector('.nav').classList.toggle('show');
});

function updateProgress(index) {
    const progress = Math.round((index / (chapters.length - 1)) * 100);
    progressFill.style.width = progress + '%';
    progressText.textContent = progress + '%';
}

/* ==================== 第1章：加解密动画 ==================== */
function playIntroAnimation() {
    const plain = document.getElementById('plainMsg');
    const cipher = document.getElementById('cipherMsg');
    const key = document.querySelector('.key-box');
    const arrows = document.querySelectorAll('.arrow-box');

    // 重置
    plain.style.opacity = '0.3';
    plain.style.transform = 'scale(0.9)';
    cipher.style.opacity = '0.3';
    cipher.style.transform = 'scale(0.9)';
    key.style.transform = 'scale(0) rotate(0deg)';

    // 开始动画
    setTimeout(() => {
        plain.style.opacity = '1';
        plain.style.transform = 'scale(1)';
        arrows[0].querySelector('.arrow').style.transform = 'translateX(10px)';
        arrows[0].querySelector('.arrow').style.transition = 'all 0.3s';
    }, 300);

    setTimeout(() => {
        key.style.transform = 'scale(1.2) rotate(360deg)';
    }, 1000);

    setTimeout(() => {
        cipher.style.opacity = '1';
        cipher.style.transform = 'scale(1)';
        cipher.querySelector('.msg-content').style.color = '#f107a3';
        cipher.querySelector('.msg-content').style.textShadow = '0 0 20px rgba(241, 7, 163, 0.8)';
    }, 1500);

    setTimeout(() => {
        arrows[1].querySelector('.arrow').style.transform = 'translateX(-10px)';
    }, 2000);

    setTimeout(() => {
        plain.style.opacity = '1';
        plain.style.transform = 'scale(1)';
        plain.querySelector('.msg-content').style.color = '#00d4ff';
        plain.querySelector('.msg-content').style.textShadow = '0 0 20px rgba(0, 212, 255, 0.8)';
    }, 2500);

    setTimeout(() => {
        resetIntroAnimation();
    }, 4000);
}

function resetIntroAnimation() {
    const plain = document.getElementById('plainMsg');
    const cipher = document.getElementById('cipherMsg');
    const key = document.querySelector('.key-box');
    const arrows = document.querySelectorAll('.arrow-box');

    plain.style.opacity = '';
    plain.style.transform = '';
    plain.querySelector('.msg-content').style.color = '';
    plain.querySelector('.msg-content').style.textShadow = '';

    cipher.style.opacity = '';
    cipher.style.transform = '';
    cipher.querySelector('.msg-content').style.color = '';
    cipher.querySelector('.msg-content').style.textShadow = '';

    key.style.transform = '';

    arrows.forEach(a => {
        a.querySelector('.arrow').style.transform = '';
    });
}

/* ==================== 第2章：凯撒密码 ==================== */
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function shiftChar(ch, shift) {
    const upper = ch.toUpperCase();
    const idx = ALPHABET.indexOf(upper);
    if (idx === -1) return ch;
    const newIdx = (idx + shift + 26) % 26;
    return ALPHABET[newIdx];
}

function caesarEncrypt(text, shift) {
    return text.split('').map(c => shiftChar(c, shift)).join('');
}

function setShift(n) {
    document.getElementById('shiftSlider').value = n;
    updateCaesarAnimation();
}

function updateCaesarAnimation() {
    const shift = parseInt(document.getElementById('shiftSlider').value);
    document.getElementById('shiftValue').textContent = shift;

    // 更新字母表显示
    const shiftedRow = document.getElementById('shiftedRow');
    const shiftedLetters = ALPHABET.split('').map((_, i) => {
        const newIdx = (i + shift) % 26;
        return ALPHABET[newIdx];
    });

    shiftedRow.innerHTML = shiftedLetters.map(c => `<span>${c}</span>`).join('');

    // 更新编码器
    encodeCaesar();
}

function encodeCaesar() {
    const input = document.getElementById('caesarInput').value.toUpperCase();
    const shift = parseInt(document.getElementById('caesarShift').value);
    const output = caesarEncrypt(input, shift);

    document.getElementById('caesarOutput').textContent = output;

    // 生成可视化
    const visual = document.getElementById('caesarVisual');
    if (input && output) {
        let html = '<div style="display:flex;justify-content:center;flex-wrap:wrap;gap:8px;">';
        for (let i = 0; i < input.length; i++) {
            if (ALPHABET.includes(input[i])) {
                html += `<div class="caesar-pair" style="text-align:center;">
                    <div style="color:#00d4ff;font-size:14px;">${input[i]}</div>
                    <div style="color:#888;font-size:12px;">↓</div>
                    <div style="color:#f107a3;font-size:14px;font-weight:bold;">${output[i]}</div>
                </div>`;
            } else {
                html += `<div style="color:#666;padding:0 5px;">${output[i]}</div>`;
            }
        }
        html += '</div>';
        visual.innerHTML = html;
    }
}

// 暴力破解
function runBruteForce(cipher) {
    const result = document.getElementById('bruteResult');
    result.innerHTML = '';
    const correctPlain = 'HELLO';
    const cipherUpper = cipher.toUpperCase();

    for (let shift = 0; shift < 26; shift++) {
        setTimeout(() => {
            const plain = caesarEncrypt(cipherUpper, -shift);
            const isCorrect = plain === correctPlain;
            const div = document.createElement('div');
            div.textContent = `偏移 ${shift.toString().padStart(2, ' ')}: ${plain}`;
            if (isCorrect) div.className = 'correct';
            result.appendChild(div);
            result.scrollTop = result.scrollHeight;
        }, shift * 80);
    }
}

/* ==================== 第3章：替换密码 ==================== */
let currentMapping = generateMapping();

function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function generateMapping() {
    const shuffled = shuffleArray(ALPHABET.split(''));
    const mapping = {};
    for (let i = 0; i < 26; i++) {
        mapping[ALPHABET[i]] = shuffled[i];
    }

    // 显示在页面上
    const mappingBox = document.getElementById('mappingBox');
    const mappingDisplay = document.getElementById('mappingDisplay');

    const pairs = Object.entries(mapping);

    mappingBox.innerHTML = pairs.slice(0, 13).map(([from, to]) =>
        `<span class="mapping-pair"><span class="from">${from}</span>→<span class="to">${to}</span></span>`
    ).join('') + '<br>' + pairs.slice(13).map(([from, to]) =>
        `<span class="mapping-pair"><span class="from">${from}</span>→<span class="to">${to}</span></span>`
    ).join('');

    mappingDisplay.innerHTML = pairs.map(([from, to]) =>
        `<span style="padding:4px 8px;background:rgba(123,47,247,0.2);border-radius:4px;font-size:13px;">${from}→${to}</span>`
    ).join('');

    return mapping;
}

function substitutionEncrypt(text) {
    return text.toUpperCase().split('').map(c => {
        return currentMapping[c] || c;
    }).join('');
}

function encodeSubstitution() {
    const input = document.getElementById('subInput').value;
    const output = substitutionEncrypt(input);
    document.getElementById('subOutput').textContent = output;
}

/* ==================== 第4章：维吉尼亚密码 ==================== */
function vigenereEncrypt(plain, key) {
    plain = plain.toUpperCase().replace(/[^A-Z]/g, '');
    key = key.toUpperCase().replace(/[^A-Z]/g, '');
    if (!key) return plain;

    let result = '';
    for (let i = 0; i < plain.length; i++) {
        const pIdx = ALPHABET.indexOf(plain[i]);
        const kIdx = ALPHABET.indexOf(key[i % key.length]);
        const cIdx = (pIdx + kIdx) % 26;
        result += ALPHABET[cIdx];
    }
    return result;
}

function vigenereDecrypt(cipher, key) {
    cipher = cipher.toUpperCase().replace(/[^A-Z]/g, '');
    key = key.toUpperCase().replace(/[^A-Z]/g, '');
    if (!key) return cipher;

    let result = '';
    for (let i = 0; i < cipher.length; i++) {
        const cIdx = ALPHABET.indexOf(cipher[i]);
        const kIdx = ALPHABET.indexOf(key[i % key.length]);
        const pIdx = (cIdx - kIdx + 26) % 26;
        result += ALPHABET[pIdx];
    }
    return result;
}

function encodeVigenere() {
    const input = document.getElementById('vigenereInput').value;
    const key = document.getElementById('vigenereKeyInput').value;
    const output = vigenereEncrypt(input, key);
    document.getElementById('vigenereOutput').textContent = output;
}

// 维吉尼亚轮盘
let vigenereCanvas, vigenereCtx;
let wheelAngle = 0;

function initVigenereWheel() {
    vigenereCanvas = document.getElementById('vigenereWheel');
    if (!vigenereCanvas) return;
    vigenereCtx = vigenereCanvas.getContext('2d');
    drawVigenereWheel();
}

function drawVigenereWheel(angle = 0) {
    if (!vigenereCtx) return;
    const cx = 200, cy = 200, outerR = 180, innerR = 130;

    vigenereCtx.clearRect(0, 0, 400, 400);

    // 外圈
    vigenereCtx.beginPath();
    vigenereCtx.arc(cx, cy, outerR, 0, Math.PI * 2);
    vigenereCtx.strokeStyle = '#00d4ff';
    vigenereCtx.lineWidth = 2;
    vigenereCtx.stroke();

    // 内圈
    vigenereCtx.beginPath();
    vigenereCtx.arc(cx, cy, innerR, 0, Math.PI * 2);
    vigenereCtx.strokeStyle = '#f107a3';
    vigenereCtx.lineWidth = 2;
    vigenereCtx.stroke();

    // 绘制外圈字母（固定）
    vigenereCtx.font = 'bold 14px Arial';
    vigenereCtx.fillStyle = '#00d4ff';
    for (let i = 0; i < 26; i++) {
        const a = (i * 360 / 26 - 90) * Math.PI / 180;
        const x = cx + Math.cos(a) * (outerR - 20);
        const y = cy + Math.sin(a) * (outerR - 20);
        vigenereCtx.save();
        vigenereCtx.translate(x, y);
        vigenereCtx.rotate(a + Math.PI / 2);
        vigenereCtx.fillText(ALPHABET[i], -5, 5);
        vigenereCtx.restore();
    }

    // 绘制内圈字母（旋转）
    vigenereCtx.save();
    vigenereCtx.translate(cx, cy);
    vigenereCtx.rotate(angle);
    vigenereCtx.fillStyle = '#f107a3';
    for (let i = 0; i < 26; i++) {
        const a = (i * 360 / 26 - 90) * Math.PI / 180;
        const x = Math.cos(a) * (innerR - 20);
        const y = Math.sin(a) * (innerR - 20);
        vigenereCtx.save();
        vigenereCtx.translate(x, y);
        vigenereCtx.rotate(a + Math.PI / 2);
        vigenereCtx.fillText(ALPHABET[i], -5, 5);
        vigenereCtx.restore();
    }
    vigenereCtx.restore();

    // 指针
    vigenereCtx.beginPath();
    vigenereCtx.moveTo(cx, cy - outerR - 10);
    vigenereCtx.lineTo(cx - 8, cy - outerR + 10);
    vigenereCtx.lineTo(cx + 8, cy - outerR + 10);
    vigenereCtx.closePath();
    vigenereCtx.fillStyle = '#ffc107';
    vigenereCtx.fill();
}

function playVigenereAnimation() {
    const plain = 'HELLO';
    const key = 'KEY';

    let step = 0;
    function nextStep() {
        if (step >= plain.length) {
            resetVigenere();
            return;
        }

        const pChar = plain[step];
        const kChar = key[step % key.length];
        const kIdx = ALPHABET.indexOf(kChar);
        const cChar = ALPHABET[(ALPHABET.indexOf(pChar) + kIdx) % 26];

        document.getElementById('vigenerePlain').textContent = pChar;
        document.getElementById('vigenereKey').textContent = kChar;
        document.getElementById('vigenereCipher').textContent = cChar;

        // 旋转轮盘
        let targetAngle = -kIdx * (360 / 26) * Math.PI / 180;
        let currentAngle = 0;
        const animateRotate = () => {
            currentAngle += 0.05;
            if (currentAngle >= Math.abs(targetAngle)) {
                drawVigenereWheel(targetAngle);
            } else {
                drawVigenereWheel(-currentAngle);
                requestAnimationFrame(animateRotate);
            }
        };
        animateRotate();

        step++;
        setTimeout(nextStep, 1200);
    }
    nextStep();
}

function resetVigenere() {
    document.getElementById('vigenerePlain').textContent = 'HELLO';
    document.getElementById('vigenereKey').textContent = 'KEY';
    document.getElementById('vigenereCipher').textContent = 'RIJVS';
    drawVigenereWheel(0);
}

/* ==================== 第5章：XOR ==================== */
function stringToBinary(str) {
    return str.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
}

function xorBinary(a, b) {
    let result = '';
    for (let i = 0; i < a.length; i++) {
        result += a[i] === b[i] ? '0' : '1';
    }
    return result;
}

function updateXor() {
    const input = document.getElementById('xorInput').value || 'HI';
    const binary = stringToBinary(input);
    const key = stringToBinary('A'.repeat(input.length || 2));
    const cipher = binary.split(' ').map((b, i) => xorBinary(b, key.split(' ')[i])).join(' ');

    document.getElementById('xorPlain').textContent = binary;
    document.getElementById('xorKey').textContent = key;
    document.getElementById('xorCipher').textContent = cipher;
}

function playXorAnimation() {
    updateXor();
    const groups = document.querySelectorAll('.xor-group');

    let opacity = 0.3;
    const interval = setInterval(() => {
        opacity += 0.1;
        groups.forEach(g => g.style.opacity = opacity);
        if (opacity >= 1) clearInterval(interval);
    }, 100);

    setTimeout(() => {
        groups.forEach(g => {
            g.style.transform = 'scale(1.05)';
            setTimeout(() => g.style.transform = 'scale(1)', 200);
        });
    }, 500);
}

/* ==================== 第6章：RSA ==================== */
function isPrime(n) {
    if (n < 2) return false;
    if (n < 4) return true;
    if (n % 2 === 0) return false;
    for (let i = 3; i <= Math.sqrt(n); i += 2) {
        if (n % i === 0) return false;
    }
    return true;
}

function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

function modInverse(e, phi) {
    let m = phi, x = 0, y = 1;
    while (e > 1) {
        const q = Math.floor(e / phi);
        [e, phi] = [phi, e % phi];
        [x, y] = [y - q * x, x];
    }
    return y < 0 ? y + m : y;
}

function generateRSA(p, q) {
    if (!isPrime(p) || !isPrime(q)) {
        alert('p 和 q 必须是质数！');
        return null;
    }

    const n = p * q;
    const phi = (p - 1) * (q - 1);

    let e = 17;
    while (gcd(e, phi) !== 1) e++;

    const d = modInverse(e, phi);

    return { e, d, n, phi };
}

function rsaGenerate() {
    let p = parseInt(document.getElementById('rsaP').value);
    let q = parseInt(document.getElementById('rsaQ').value);

    if (isNaN(p) || !isPrime(p)) {
        p = 61;
        document.getElementById('rsaP').value = p;
    }
    if (isNaN(q) || !isPrime(q)) {
        q = 53;
        document.getElementById('rsaQ').value = q;
    }

    const rsa = generateRSA(p, q);
    if (rsa) {
        document.getElementById('rsaE').textContent = rsa.e;
        document.getElementById('rsaD').textContent = rsa.d;
        document.getElementById('rsaN').textContent = rsa.n;
        document.getElementById('rsaN2').textContent = rsa.n;
    }
}

function rsaEncrypt() {
    const p = parseInt(document.getElementById('rsaP').value);
    const q = parseInt(document.getElementById('rsaQ').value);
    const rsa = generateRSA(p, q);
    if (!rsa) return;

    let msg = parseInt(document.getElementById('rsaMsg').value);
    if (isNaN(msg) || msg >= rsa.n) {
        msg = 65;
        document.getElementById('rsaMsg').value = msg;
    }

    const cipher = BigInt(msg) ** BigInt(rsa.e) % BigInt(rsa.n);
    document.getElementById('rsaCipher').textContent = cipher.toString();

    // 保存以供解密
    window.currentCipher = cipher;
    window.currentRSA = rsa;
    window.currentMsg = msg;
}

function rsaDecrypt() {
    if (!window.currentRSA) {
        alert('请先加密！');
        return;
    }

    const plain = window.currentCipher ** BigInt(window.currentRSA.d) % BigInt(window.currentRSA.n);
    document.getElementById('rsaDecrypted').textContent = plain.toString();

    if (parseInt(plain.toString()) === window.currentMsg) {
        document.getElementById('rsaDecrypted').style.color = '#4cd964';
        setTimeout(() => {
            document.getElementById('rsaDecrypted').style.color = '#00d4ff';
        }, 2000);
    }
}

// RSA 动画
function playRsaAnimation() {
    const steps = document.querySelectorAll('.rsa-steps .step');
    const box = document.getElementById('rsaBox');
    const lock = document.getElementById('rsaLock');

    let currentStep = 0;

    function nextStep() {
        if (currentStep >= steps.length) {
            setTimeout(resetRsa, 2000);
            return;
        }

        steps.forEach(s => s.classList.remove('active'));
        steps[currentStep].classList.add('active');

        // 动画效果
        if (currentStep === 0) {
            box.style.left = '10%';
            lock.style.display = 'none';
        } else if (currentStep === 1) {
            box.style.left = '10%';
            setTimeout(() => {
                lock.style.display = 'inline';
                box.textContent = '🔒';
            }, 500);
        } else if (currentStep === 2) {
            box.style.left = '80%';
        } else if (currentStep === 3) {
            setTimeout(() => {
                lock.style.display = 'none';
                box.textContent = '📦';
            }, 500);
        }

        currentStep++;
        setTimeout(nextStep, 1500);
    }
    nextStep();
}

function resetRsa() {
    const steps = document.querySelectorAll('.rsa-steps .step');
    steps.forEach(s => s.classList.remove('active'));
    steps[0].classList.add('active');

    const box = document.getElementById('rsaBox');
    const lock = document.getElementById('rsaLock');
    box.style.left = '';
    box.textContent = '📦';
    lock.style.display = 'none';
}

/* ==================== 初始化 ==================== */
window.addEventListener('load', () => {
    updateCaesarAnimation();
    initVigenereWheel();
    updateXor();
    rsaGenerate();
    encodeVigenere();

    // 初始导航状态
    document.querySelector('.nav-link.active').click();
});

// 平滑滚动到章节
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target && target.classList.contains('chapter')) {
            e.preventDefault();
        }
    });
});

// 添加一些悬停动画效果
document.querySelectorAll('.algo-card, .app-item, .stat-card').forEach(el => {
    el.addEventListener('mouseenter', function () {
        this.style.transition = 'all 0.3s ease';
    });
});

// 数字动画（统计数字）
function animateNumber(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target + '+';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start) + '+';
        }
    }, 16);
}
