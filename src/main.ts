import { FileInput } from './types';
import { runCode } from './api';
import { t, getLang, setLang } from './core/i18n';

const DEFAULT_CODE: Record<string, string> = {
  c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
  cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}',
  python: 'print("Hello, World!")'
};

let currentProgLang = localStorage.getItem('progLang') || 'c';

let files: Array<{ id: number, name: string, content: string, isMain: boolean }> = [
  { id: 1, name: 'main.c', content: DEFAULT_CODE.c, isMain: true }
];

let nextId = 2;

function getExtForLang(lang: string): string {
  if (lang === 'python') return '.py';
  if (lang === 'cpp') return '.cpp';
  if (lang === 'c') return '.c';
  return '.c';
}

function changeFileExt(file: any, lang: string) {
  const ext = getExtForLang(lang);
  file.name = file.name.replace(/\.[^./]+$/i, ext);
}

function applySettings() {
  const theme = localStorage.getItem('theme') || 'dark';
  document.body.classList.toggle('light', theme === 'light');
  const outColor = localStorage.getItem('outColor') || '#22c55e';
  const errColor = localStorage.getItem('errColor') || '#f87171';
  document.documentElement.style.setProperty('--output', outColor);
  document.documentElement.style.setProperty('--errors', errColor);
}

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = (el as HTMLElement).getAttribute('data-i18n');
    if (key) (el as HTMLElement).textContent = t(key);
  });
  document.documentElement.lang = getLang();
}

function render() {
  const filesDiv = document.getElementById('files')!;
  filesDiv.innerHTML = '';
  
  for (const file of files) {
    const fileDiv = document.createElement('div');
    fileDiv.className = 'file';
    
    const header = document.createElement('div');
    header.className = 'file-header';
    
    const nameWrap = document.createElement('div');
    nameWrap.className = 'file-name-wrap';
    const baseInput = document.createElement('input');
    baseInput.className = 'file-base';
    const extSpan = document.createElement('span');
    extSpan.className = 'file-ext';
    const extMatch = file.name.match(/\.[^./]+$/);
    if (extMatch) {
      baseInput.value = file.name.replace(extMatch[0], '');
      extSpan.textContent = extMatch[0];
    } else {
      baseInput.value = file.name;
      extSpan.textContent = '';
    }
    const updateName = () => {
      const base = baseInput.value === '' ? 'file' : baseInput.value;
      file.name = base + extSpan.textContent;
      baseInput.style.width = Math.max(20, base.length * 8 + 4) + 'px';
      nameWrap.style.width = 'fit-content';
    };
    baseInput.oninput = () => {
      baseInput.style.width = Math.max(20, (baseInput.value.length || 1) * 8 + 4) + 'px';
      file.name = (baseInput.value || 'file') + extSpan.textContent;
      nameWrap.style.width = 'fit-content';
    };
    baseInput.onblur = updateName;
    baseInput.onkeydown = (e) => {
      if (e.key === 'Enter') {
        baseInput.blur();
      }
    };
    setTimeout(() => {
      baseInput.style.width = Math.max(20, (baseInput.value.length || 1) * 8 + 4) + 'px';
      nameWrap.style.width = 'fit-content';
    }, 0);
    nameWrap.appendChild(baseInput);
    nameWrap.appendChild(extSpan);
    
    const mainLabel = document.createElement('label');
    mainLabel.className = 'file-main';
    const mainRadio = document.createElement('input');
    mainRadio.type = 'radio';
    mainRadio.checked = file.isMain;
    mainRadio.onchange = () => {
      files.forEach(f => f.isMain = false);
      file.isMain = true;
      render();
    };
    mainLabel.appendChild(mainRadio);
    const mainText = document.createElement('span');
    mainText.setAttribute('data-i18n', 'main');
    mainText.textContent = t('main');
    mainLabel.appendChild(mainText);
    
    const delBtn = document.createElement('button');
    delBtn.textContent = t('delete');
    delBtn.onclick = () => {
      if (files.length === 1) return;
      files = files.filter(f => f.id !== file.id);
      if (!files.some(f => f.isMain)) {
        files[0].isMain = true;
      }
      render();
    };
    
    header.appendChild(nameWrap);
    header.appendChild(mainLabel);
    header.appendChild(delBtn);
    
    const textarea = document.createElement('textarea');
    textarea.value = file.content;
    textarea.oninput = () => {
      file.content = textarea.value;
    };
    textarea.spellcheck = false;
    textarea.onkeydown = (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = textarea.value;
        textarea.value = value.substring(0, start) + '    ' + value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + 4;
        file.content = textarea.value;
      }
    };
    
    fileDiv.appendChild(header);
    fileDiv.appendChild(textarea);
    filesDiv.appendChild(fileDiv);
  }
  renderNav();
}

function renderNav() {
  const navList = document.getElementById('navList');
  if (!navList) return;
  navList.innerHTML = '';
  for (const file of files) {
    const item = document.createElement('div');
    item.className = 'nav-item' + (file.isMain ? ' active' : '');
    const name = document.createElement('span');
    name.className = 'nav-name';
    name.textContent = file.name;
    const mainBtn = document.createElement('button');
    mainBtn.textContent = t('main');
    mainBtn.onclick = () => {
      files.forEach(f => f.isMain = false);
      file.isMain = true;
      render();
    };
    const delBtn = document.createElement('button');
    delBtn.className = 'nav-del';
    delBtn.textContent = '×';
    delBtn.onclick = () => {
      if (files.length === 1) return;
      files = files.filter(f => f.id !== file.id);
      if (!files.some(f => f.isMain)) files[0].isMain = true;
      render();
    };
    item.appendChild(name);
    item.appendChild(mainBtn);
    item.appendChild(delBtn);
    navList.appendChild(item);
  }
}

function init() {
  console.log('[code-runner] init');
  const progLangSelect = document.getElementById('progLangSelect') as HTMLSelectElement | null;
  if (progLangSelect) {
    progLangSelect.value = currentProgLang;
    progLangSelect.addEventListener('change', () => {
      const lang = progLangSelect.value;
      currentProgLang = lang;
      localStorage.setItem('progLang', lang);
      for (const f of files) {
        if (f.isMain) {
          changeFileExt(f, lang);
          if (!f.content.trim() || f.content === DEFAULT_CODE.c || f.content === DEFAULT_CODE.cpp || f.content === DEFAULT_CODE.python) {
            f.content = DEFAULT_CODE[lang] || '';
          }
        }
      }
      render();
    });
  }

  const addFileBtn = document.getElementById('addFile');
  if (addFileBtn) {
    addFileBtn.onclick = () => {
      const lang = progLangSelect?.value || 'c';
      const ext = getExtForLang(lang);
      files.push({ id: nextId++, name: `file${nextId-1}${ext}`, content: '', isMain: false });
      render();
    };
  }

  const navAddFileBtn = document.getElementById('navAddFile');
  if (navAddFileBtn) {
    navAddFileBtn.addEventListener('click', () => {
      const lang = progLangSelect?.value || 'c';
      const ext = getExtForLang(lang);
      files.push({ id: nextId++, name: `file${nextId-1}${ext}`, content: '', isMain: false });
      render();
    });
  }

  const navToggle = document.getElementById('navToggle');
  const verticalNav = document.getElementById('verticalNav');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      verticalNav?.classList.toggle('open');
    });
  }
}

const runBtn = document.getElementById('runBtn');
if (runBtn) {
  runBtn.onclick = async () => {
  const output = document.getElementById('output')!;
  const errors = document.getElementById('errors')!;
  const runBtn = document.getElementById('runBtn') as HTMLButtonElement;
  const mainFile = files.find(f => f.isMain);
  
  if (!mainFile) {
    output.textContent = t('noMain');
    errors.textContent = '';
    return;
  }
  if (!mainFile.name.trim()) {
    output.textContent = t('emptyMain');
    errors.textContent = '';
    return;
  }
  
  const fileInputs: FileInput[] = files.map(f => ({ name: f.name, content: f.content }));
  output.textContent = t('runnings');
  errors.textContent = '';
  runBtn.disabled = true;
  
  try {
    const result = await runCode(fileInputs, mainFile.name);
    output.textContent = result.stdout || (result.stderr ? '' : t('noOutput'));
    if (result.stderr) {
      errors.textContent = result.stderr;
    } else {
      errors.textContent = '';
    }
  } catch (e: any) {
    output.textContent = '';
    errors.textContent = 'Error: ' + e.message;
  } finally {
    (runBtn as HTMLButtonElement).disabled = false;
  }
};
}

const addonsBtn = document.getElementById('addonsBtn');
const addonsMenu = document.getElementById('addonsMenu');
addonsBtn?.addEventListener('click', () => {
  addonsMenu?.classList.toggle('show');
});

const toggleErrors = document.getElementById('toggleErrors') as HTMLInputElement;
const errorsWrap = document.getElementById('errorsWrap');
toggleErrors?.addEventListener('change', () => {
  if (errorsWrap) errorsWrap.style.display = toggleErrors.checked ? 'flex' : 'none';
});

const toggleDebugger = document.getElementById('toggleDebugger') as HTMLInputElement;
const debuggerPanel = document.getElementById('debuggerPanel');
toggleDebugger?.addEventListener('change', () => {
  debuggerPanel?.classList.toggle('show', toggleDebugger.checked);
});

const errorsResize = document.getElementById('errorsResize');
const errorsEl = document.getElementById('errors') as HTMLElement;
errorsResize?.addEventListener('mousedown', (e) => {
  e.preventDefault();
  const startY = e.clientY;
  const startH = errorsEl.offsetHeight;
  const onMove = (ev: MouseEvent) => {
    const h = startH + (startY - ev.clientY);
    if (h >= 80 && h <= 400) errorsEl.style.height = h + 'px';
  };
  const onUp = () => {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
  };
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
});

const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const settingsClose = document.getElementById('settingsClose');
settingsBtn?.addEventListener('click', () => settingsModal?.classList.add('show'));
settingsClose?.addEventListener('click', () => settingsModal?.classList.remove('show'));

document.querySelectorAll('input[name="theme"]').forEach(r => {
  r.addEventListener('change', (e) => {
    const val = (e.target as HTMLInputElement).value;
    localStorage.setItem('theme', val);
    applySettings();
  });
});

const outPick = document.getElementById('outputColorPick') as HTMLInputElement;
const errPick = document.getElementById('errorsColorPick') as HTMLInputElement;
outPick?.addEventListener('input', () => {
  localStorage.setItem('outColor', outPick.value);
  applySettings();
});
errPick?.addEventListener('input', () => {
  localStorage.setItem('errColor', errPick.value);
  applySettings();
});

document.getElementById('resetSettings')?.addEventListener('click', () => {
  localStorage.removeItem('theme');
  localStorage.removeItem('outColor');
  localStorage.removeItem('errColor');
  if (outPick) outPick.value = '#22c55e';
  if (errPick) errPick.value = '#f87171';
  (document.querySelector('input[name="theme"][value="dark"]') as HTMLInputElement).checked = true;
  applySettings();
});

const uiLangSelect = document.getElementById('uiLangSelect') as HTMLSelectElement | null;
if (uiLangSelect) {
  uiLangSelect.value = getLang();
  uiLangSelect.addEventListener('change', () => {
    setLang(uiLangSelect.value);
    applyI18n();
    render();
    renderNav();
  });
}

applySettings();
applyI18n();
if (typeof init === 'function') {
  try { init(); } catch {}
}
render();
renderNav();
