import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n/i18nProvider';

const COPY = {
  en: { open: 'Accessibility options', title: 'Accessibility options', text: 'Text size', contrast: 'High contrast', color: 'Strengthen color cues', links: 'Underline links', motion: 'Reduce motion', read: 'Read this page aloud', stop: 'Stop reading', reset: 'Reset settings', close: 'Close accessibility options', normal: 'Default', medium: 'Large', large: 'Extra large', note: 'Settings are saved only on this device.' },
  ko: { open: '접근성 설정', title: '접근성 설정', text: '글자 크기', contrast: '고대비 화면', color: '색상 구분 강화', links: '링크 밑줄 표시', motion: '움직임 줄이기', read: '이 페이지 읽어주기', stop: '읽기 중지', reset: '설정 초기화', close: '접근성 설정 닫기', normal: '기본', medium: '크게', large: '아주 크게', note: '설정은 이 기기에만 저장됩니다.' },
  zh: { open: '无障碍设置', title: '无障碍设置', text: '文字大小', contrast: '高对比度', color: '加强颜色提示', links: '链接加下划线', motion: '减少动态效果', read: '朗读本页', stop: '停止朗读', reset: '重置设置', close: '关闭无障碍设置', normal: '默认', medium: '大', large: '特大', note: '设置仅保存在此设备。' },
  bn: { open: 'অ্যাক্সেসিবিলিটি সেটিংস', title: 'অ্যাক্সেসিবিলিটি সেটিংস', text: 'লেখার আকার', contrast: 'উচ্চ কনট্রাস্ট', color: 'রঙের সংকেত স্পষ্ট করুন', links: 'লিংকে দাগ দিন', motion: 'নড়াচড়া কমান', read: 'এই পৃষ্ঠা পড়ে শোনান', stop: 'পড়া বন্ধ করুন', reset: 'সেটিংস রিসেট', close: 'সেটিংস বন্ধ করুন', normal: 'স্বাভাবিক', medium: 'বড়', large: 'আরও বড়', note: 'সেটিংস শুধু এই ডিভাইসে সংরক্ষিত থাকে।' },
  ur: { open: 'رسائی کی ترتیبات', title: 'رسائی کی ترتیبات', text: 'متن کا سائز', contrast: 'زیادہ کنٹراسٹ', color: 'رنگ کے اشارے واضح کریں', links: 'لنکس کے نیچے لکیر', motion: 'حرکت کم کریں', read: 'یہ صفحہ پڑھ کر سنائیں', stop: 'پڑھنا بند کریں', reset: 'ترتیبات ری سیٹ', close: 'رسائی کی ترتیبات بند کریں', normal: 'عام', medium: 'بڑا', large: 'بہت بڑا', note: 'ترتیبات صرف اس آلے پر محفوظ ہوتی ہیں۔' },
};

const DEFAULTS = { textSize: 'normal', contrast: false, colorAssist: false, underlineLinks: false, reduceMotion: false };

// Keep accessibility preferences local to the visitor's device.

function loadSettings() {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem('aapicheck-accessibility') || '{}') }; }
  catch { return DEFAULTS; }
}

function AccessibilityIcon() {
  return <svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21" /><circle cx="24" cy="13" r="3.5" /><path d="M13 19h22M24 19v17M24 25l-8 11M24 25l8 11" /></svg>;
}

export default function AccessibilityTools() {
  const { lang } = useI18n();
  const copy = COPY[lang] || COPY.en;
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(loadSettings);
  const [reading, setReading] = useState(false);
  const closeRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.a11yText = settings.textSize;
    root.dataset.a11yContrast = String(settings.contrast);
    root.dataset.a11yColor = String(settings.colorAssist);
    root.dataset.a11yLinks = String(settings.underlineLinks);
    root.dataset.a11yMotion = String(settings.reduceMotion);
    try { localStorage.setItem('aapicheck-accessibility', JSON.stringify(settings)); } catch { /* no-op */ }
  }, [settings]);

  useEffect(() => {
    if (open) closeRef.current?.focus();
    const onKey = (event) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  function toggle(key) { setSettings((current) => ({ ...current, [key]: !current[key] })); }

  function stopReading() {
    window.speechSynthesis?.cancel();
    setReading(false);
  }

  function readPage() {
    if (!('speechSynthesis' in window)) return;
    if (reading) { stopReading(); return; }
    const main = document.querySelector('main');
    const text = main?.innerText?.replace(/\s+/g, ' ').trim();
    if (!text) return;
    const chunks = text.match(/.{1,220}(?:\s|$)/g) || [text];
    let index = 0;
    setReading(true);
    const speakNext = () => {
      if (index >= chunks.length) { setReading(false); return; }
      const utterance = new SpeechSynthesisUtterance(chunks[index++]);
      utterance.lang = { en: 'en-US', ko: 'ko-KR', zh: 'zh-CN', bn: 'bn-BD', ur: 'ur-PK' }[lang] || 'en-US';
      utterance.rate = 0.92;
      utterance.onend = speakNext;
      utterance.onerror = () => setReading(false);
      window.speechSynthesis.speak(utterance);
    };
    speakNext();
  }

  function reset() {
    stopReading();
    setSettings(DEFAULTS);
  }

  return <div className="a11y-tools">
    <button type="button" className="a11y-launcher" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="a11y-panel" aria-label={copy.open} title={copy.open}><AccessibilityIcon /></button>
    {open && <section id="a11y-panel" className="a11y-panel" role="dialog" aria-modal="false" aria-labelledby="a11y-title">
      <header><h2 id="a11y-title">{copy.title}</h2><button ref={closeRef} type="button" onClick={() => setOpen(false)} aria-label={copy.close}>×</button></header>
      <fieldset><legend>{copy.text}</legend><div className="a11y-size-options">
        {[['normal', copy.normal, 'A'], ['medium', copy.medium, 'A+'], ['large', copy.large, 'A++']].map(([value, label, mark]) => <button key={value} type="button" aria-pressed={settings.textSize === value} onClick={() => setSettings((current) => ({ ...current, textSize: value }))}><strong>{mark}</strong><span>{label}</span></button>)}
      </div></fieldset>
      <div className="a11y-toggles">
        {[['contrast', copy.contrast], ['colorAssist', copy.color], ['underlineLinks', copy.links], ['reduceMotion', copy.motion]].map(([key, label]) => <button key={key} type="button" className="a11y-option" aria-pressed={settings[key]} onClick={() => toggle(key)}><span aria-hidden="true">{settings[key] ? '✓' : ''}</span>{label}</button>)}
      </div>
      <button type="button" className="a11y-read" aria-pressed={reading} onClick={readPage}>{reading ? `■ ${copy.stop}` : `▶ ${copy.read}`}</button>
      <button type="button" className="a11y-reset" onClick={reset}>{copy.reset}</button>
      <p>{copy.note}</p>
    </section>}
  </div>;
}
