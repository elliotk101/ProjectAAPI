import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/i18nProvider';
import { calculateBMI, evaluateScreeningGuidance } from '../utils/riskCalculator';
import { SITE } from '../config/site';

const COPY = {
  en: { intro: 'This educational check helps you prepare for a conversation with a healthcare professional. It does not calculate your chance of developing diabetes.', privacy: 'Your answers stay on this device and are cleared when you leave or restart.', submit: 'Show my guidance', result: 'Your screening conversation guide', discuss: 'Consider talking with a healthcare professional about diabetes screening.', routine: 'Keep up with routine preventive care and ask when screening is right for you.', explain: 'These are discussion points, not a diagnosis or a medical risk score.', present: 'Worth discussing', absent: 'No flag from this answer', error: 'Please complete the required fields using realistic values.', ageHelp: 'For adults age 18 and older.', bodyHelp: 'BMI is a screening reference and does not measure health by itself.', next: 'What to do next', doctor: 'Save or show this page when you speak with a healthcare professional.', restart: 'Start over' },
  ko: { intro: '이 교육용 확인은 의료진과 상담을 준비하도록 돕습니다. 당뇨병 발생 확률을 계산하지 않습니다.', privacy: '답변은 이 기기에만 머물며 페이지를 나가거나 다시 시작하면 지워집니다.', submit: '안내 보기', result: '검사 상담 안내', discuss: '의료진과 당뇨병 검사에 관해 상담해 보세요.', routine: '정기 예방 진료를 계속하고 언제 검사가 필요한지 의료진에게 물어보세요.', explain: '아래 내용은 상담을 위한 참고사항이며 진단이나 의료 위험 점수가 아닙니다.', present: '상담해 볼 항목', absent: '이 답변에서는 해당 없음', error: '필수 항목을 현실적인 값으로 모두 입력해 주세요.', ageHelp: '18세 이상 성인을 위한 안내입니다.', bodyHelp: 'BMI는 참고용 검사 기준이며 이것만으로 건강을 판단하지 않습니다.', next: '다음 단계', doctor: '의료진과 상담할 때 이 페이지를 저장하거나 보여 주세요.', restart: '다시 시작' },
  zh: { intro: '此教育工具帮助您准备与医疗专业人员沟通，并不计算您患糖尿病的概率。', privacy: '您的回答只保留在此设备上，离开或重新开始后即清除。', submit: '查看指导', result: '您的筛查沟通指南', discuss: '建议与医疗专业人员讨论糖尿病筛查。', routine: '继续常规预防保健，并询问何时适合筛查。', explain: '以下内容仅供沟通参考，不是诊断或医疗风险评分。', present: '值得讨论', absent: '此答案未提示', error: '请使用合理数值完成所有必填项。', ageHelp: '适用于18岁及以上成年人。', bodyHelp: 'BMI仅是筛查参考，不能单独衡量健康。', next: '下一步', doctor: '与医疗专业人员交流时可保存或展示此页面。', restart: '重新开始' },
  bn: { intro: 'এই শিক্ষামূলক যাচাইটি স্বাস্থ্যসেবা পেশাজীবীর সঙ্গে কথা বলার প্রস্তুতিতে সাহায্য করে। এটি ডায়াবেটিস হওয়ার সম্ভাবনা গণনা করে না।', privacy: 'আপনার উত্তর এই ডিভাইসেই থাকে এবং পৃষ্ঠা ছাড়লে বা আবার শুরু করলে মুছে যায়।', submit: 'আমার নির্দেশনা দেখান', result: 'স্ক্রিনিং আলোচনার নির্দেশিকা', discuss: 'ডায়াবেটিস স্ক্রিনিং নিয়ে স্বাস্থ্যসেবা পেশাজীবীর সঙ্গে কথা বলার কথা বিবেচনা করুন।', routine: 'নিয়মিত প্রতিরোধমূলক যত্ন চালিয়ে যান এবং স্ক্রিনিং কখন উপযুক্ত তা জিজ্ঞাসা করুন।', explain: 'এগুলো আলোচনার বিষয়, রোগ নির্ণয় বা ঝুঁকির স্কোর নয়।', present: 'আলোচনা করা উপকারী', absent: 'এই উত্তরে সংকেত নেই', error: 'বাস্তবসম্মত মান দিয়ে প্রয়োজনীয় ঘরগুলো পূরণ করুন।', ageHelp: '১৮ বছর বা তার বেশি বয়সী প্রাপ্তবয়স্কদের জন্য।', bodyHelp: 'BMI একটি স্ক্রিনিং নির্দেশক; এটি একা স্বাস্থ্য নির্ধারণ করে না।', next: 'পরবর্তী পদক্ষেপ', doctor: 'স্বাস্থ্যসেবা পেশাজীবীর সঙ্গে কথা বলার সময় এই পৃষ্ঠা দেখান।', restart: 'আবার শুরু' },
  ur: { intro: 'یہ تعلیمی جانچ صحت کے ماہر سے گفتگو کی تیاری میں مدد دیتی ہے۔ یہ ذیابیطس ہونے کے امکان کا حساب نہیں لگاتی۔', privacy: 'آپ کے جوابات اسی آلے پر رہتے ہیں اور صفحہ چھوڑنے یا دوبارہ شروع کرنے پر مٹ جاتے ہیں۔', submit: 'میری رہنمائی دکھائیں', result: 'اسکریننگ گفتگو کی رہنمائی', discuss: 'ذیابیطس اسکریننگ کے بارے میں صحت کے ماہر سے بات کرنے پر غور کریں۔', routine: 'معمول کی احتیاطی نگہداشت جاری رکھیں اور پوچھیں کہ اسکریننگ کب مناسب ہے۔', explain: 'یہ گفتگو کے نکات ہیں، تشخیص یا طبی خطرے کا اسکور نہیں۔', present: 'بات کرنا مفید ہے', absent: 'اس جواب سے کوئی نشان نہیں', error: 'حقیقت پسندانہ قدروں کے ساتھ تمام ضروری خانے مکمل کریں۔', ageHelp: '18 سال یا اس سے زیادہ عمر کے بالغوں کے لیے۔', bodyHelp: 'BMI صرف اسکریننگ کا حوالہ ہے؛ یہ اکیلا صحت نہیں ناپتا۔', next: 'اگلا قدم', doctor: 'صحت کے ماہر سے بات کرتے وقت یہ صفحہ دکھائیں۔', restart: 'دوبارہ شروع کریں' },
};

const INITIAL = { age: '', heightFt: '', heightIn: '', weightLbs: '', heightCm: '', weightKg: '', familyHistory: '', gestational: '', activityLevel: '' };

function RiskScreener() {
  const { t, lang } = useI18n();
  const copy = COPY[lang] || COPY.en;
  const [data, setData] = useState(INITIAL);
  const [unit, setUnit] = useState(() => localStorage.getItem('aapicheck-units') || 'imperial');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { document.title = `${t('screener.title')} — ${SITE.name}`; }, [t]);
  useEffect(() => { localStorage.setItem('aapicheck-units', unit); }, [unit]);

  const measurements = useMemo(() => {
    const heightCm = unit === 'metric' ? Number(data.heightCm) : ((Number(data.heightFt) * 12) + Number(data.heightIn)) * 2.54;
    const weightKg = unit === 'metric' ? Number(data.weightKg) : Number(data.weightLbs) * 0.453592;
    return { heightCm, weightKg, bmi: calculateBMI(heightCm, weightKg) };
  }, [data, unit]);

  const update = (key, value) => { setData((current) => ({ ...current, [key]: value })); setError(''); };
  const valid = () => Number(data.age) >= 18 && Number(data.age) <= 120 && measurements.heightCm >= 100 && measurements.heightCm <= 250 && measurements.weightKg >= 25 && measurements.weightKg <= 350 && data.familyHistory !== '' && data.activityLevel;
  const submit = (event) => {
    event.preventDefault();
    if (!valid()) { setError(copy.error); return; }
    setResult(evaluateScreeningGuidance({ ...data, age: Number(data.age), bmi: measurements.bmi, familyHistory: data.familyHistory === 'yes', gestational: data.gestational === 'yes' }));
    requestAnimationFrame(() => document.getElementById('screening-result')?.focus());
  };

  const factorLabels = { bmi: t('screener.factor_bmi'), age: t('screener.factor_age'), family: t('screener.factor_family'), gestational: t('screener.factor_gestational'), activity: t('screener.factor_activity') };

  if (result) return (
    <section className="screener screener--result" aria-labelledby="screening-result">
      <div className="screener__intro"><p className="eyebrow">Private educational tool</p><h1 id="screening-result" tabIndex="-1">{copy.result}</h1><p>{copy.explain}</p></div>
      <div className={`guidance-result ${result.discussionRecommended ? 'guidance-result--discuss' : ''}`}>
        <div className="guidance-result__headline"><span aria-hidden="true">{result.discussionRecommended ? '!' : '✓'}</span><h2>{result.discussionRecommended ? copy.discuss : copy.routine}</h2></div>
        <dl className="factor-list">{result.factors.map((factor) => <div key={factor.key}><dt>{factorLabels[factor.key]}{factor.key === 'bmi' && factor.value ? `: ${factor.value}` : ''}</dt><dd className={factor.present ? 'is-present' : ''}>{factor.present ? copy.present : copy.absent}</dd></div>)}</dl>
        <div className="next-step-box"><h2>{copy.next}</h2><p>{copy.doctor}</p><div className="button-row"><Link className="btn btn--primary" to="/resources">{t('screener.find_provider')}</Link><button className="btn btn--secondary" onClick={() => { setData(INITIAL); setResult(null); }}>{copy.restart}</button></div></div>
      </div>
    </section>
  );

  return (
    <section className="screener" aria-labelledby="screener-title">
      <div className="screener__intro"><p className="eyebrow">About 2 minutes</p><h1 id="screener-title">{t('screener.title')}</h1><p>{copy.intro}</p><p className="privacy-note"><span aria-hidden="true">●</span> {copy.privacy}</p></div>
      <form className="health-check-form" onSubmit={submit} noValidate>
        <fieldset><legend>1. {t('screener.step_age')}</legend><p>{copy.ageHelp}</p><label>{t('screener.age_label')}<input type="number" inputMode="numeric" min="18" max="120" value={data.age} onChange={(e) => update('age', e.target.value)} /></label></fieldset>
        <fieldset><legend>2. {t('screener.step_body')}</legend><p>{copy.bodyHelp}</p>
          <div className="unit-toggle" role="group" aria-label="Measurement units"><button type="button" aria-pressed={unit === 'imperial'} onClick={() => setUnit('imperial')}>{t('screener.unit_imperial')}</button><button type="button" aria-pressed={unit === 'metric'} onClick={() => setUnit('metric')}>{t('screener.unit_metric')}</button></div>
          {unit === 'imperial' ? <div className="form-grid form-grid--three"><label>{t('screener.height_ft_label')}<input type="number" min="3" max="8" value={data.heightFt} onChange={(e) => update('heightFt', e.target.value)} /></label><label>{t('screener.height_in_label')}<input type="number" min="0" max="11" value={data.heightIn} onChange={(e) => update('heightIn', e.target.value)} /></label><label>{t('screener.weight_lbs_label')}<input type="number" min="55" max="770" value={data.weightLbs} onChange={(e) => update('weightLbs', e.target.value)} /></label></div> : <div className="form-grid"><label>{t('screener.height_label')}<input type="number" min="100" max="250" value={data.heightCm} onChange={(e) => update('heightCm', e.target.value)} /></label><label>{t('screener.weight_label')}<input type="number" min="25" max="350" value={data.weightKg} onChange={(e) => update('weightKg', e.target.value)} /></label></div>}
          {measurements.bmi && <p className="bmi-preview"><strong>{t('screener.your_bmi')}: {measurements.bmi}</strong> · {t('screener.bmi_note')}</p>}
        </fieldset>
        <fieldset><legend>3. {t('screener.step_health')}</legend>
          <Question label={t('screener.family_history')} value={data.familyHistory} onChange={(value) => update('familyHistory', value)} t={t} required />
          <Question label={t('screener.gestational')} value={data.gestational} onChange={(value) => update('gestational', value)} t={t} allowNA />
          <label>{t('screener.activity_label')}<select value={data.activityLevel} onChange={(e) => update('activityLevel', e.target.value)}><option value="">—</option>{['daily','weekly','occasional','rarely'].map((key) => <option value={key} key={key}>{t(`screener.activity_${key}`)}</option>)}</select></label>
        </fieldset>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="btn btn--primary btn--lg" type="submit">{copy.submit}</button>
        <p className="medical-disclaimer">This tool does not diagnose diabetes, replace laboratory testing, or provide medical advice. Seek urgent care for urgent symptoms.</p>
      </form>
    </section>
  );
}

function Question({ label, value, onChange, t, allowNA = false }) {
  return <div className="form-question"><span>{label}</span><div className="choice-row">{[['yes',t('screener.yes')],['no',t('screener.no')],...(allowNA ? [['na',t('screener.not_applicable')]] : [])].map(([key,text]) => <button type="button" key={key} aria-pressed={value === key} onClick={() => onChange(key)}>{text}</button>)}</div></div>;
}

export default RiskScreener;
