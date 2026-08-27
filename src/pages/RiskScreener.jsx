import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/i18nProvider';
import { calculateBMI, evaluateScreeningGuidance } from '../utils/riskCalculator';
import { SITE } from '../config/site';

const COPY = {
  en: {
    intro: 'A private, step-by-step check that helps you understand screening timing and prepare questions. It does not diagnose diabetes or calculate a risk score.', self: 'I am checking for myself', family: 'I am helping a family member', familyNote: 'Family mode uses larger controls and plain-language prompts. Please answer for the person being checked.', private: 'Answers stay on this device and disappear when you restart or leave.', next: 'Continue', back: 'Back', show: 'Show my guide', step: 'Step', of: 'of', required: 'Please answer the required questions before continuing.',
    basics: 'Start with the basics', basicsHelp: 'Age helps identify routine screening timing. Age alone will never be shown as a high-risk warning.', lastTest: 'When was the last blood sugar or A1C test?', never: 'Never', within1: 'Within 1 year', within3: '1–3 years ago', over3: 'More than 3 years ago', unknown: 'I do not remember',
    body: 'AAPI body-size context', bodyHelp: 'BMI 23 is a screening reference for people of Asian ancestry. An optional waist measurement adds context; neither is a diagnosis.', waist: 'Waist circumference (optional)', waistHelp: 'Measure around the waist. Skip this if measuring is uncomfortable or uncertain.', inches: 'inches', centimeters: 'cm',
    history: 'Health history', historyHelp: 'Choose “Not sure” when you do not know. These answers help prepare useful questions.', hypertension: 'High blood pressure or blood-pressure medicine?', cardiovascular: 'Heart disease or stroke history?', pcos: 'Polycystic ovary syndrome (PCOS)?', prediabetes: 'Previously told you had prediabetes or elevated blood sugar?', unsure: 'Not sure',
    lifestyle: 'Daily-life context', lifestyleHelp: 'These answers do not raise or lower a medical score. They only personalize conversation ideas.', sugary: 'How often do you drink sugary drinks?', daily: 'Most days', sometimes: 'Sometimes', rarely: 'Rarely or never', afterMeal: 'Do you usually move or walk after meals?', sleep: 'Do you often sleep fewer than 6 hours?',
    result: 'Your screening conversation guide', ageOnly: 'Your age suggests checking routine screening timing—not that you are automatically high risk.', discuss: 'You have one or more items worth discussing at a routine healthcare visit.', routine: 'No additional screening flag appeared from these answers. Keep up with routine preventive care.', due: 'Your screening history may be due for review.', bodyContext: 'Body-size context', historyContext: 'Health-history context', lifeContext: 'Lifestyle conversation ideas', noFlag: 'No additional item selected', notDiagnosis: 'This is a conversation guide, not a diagnosis or probability score.',
    card: 'Bilingual visit card', cardHelp: 'Show, save, or share this card for a healthcare visit. The English line can help staff understand the request.', timing: 'Screening timing', recentTest: 'You reported a blood sugar or A1C test within the past year.', qTiming: 'When should I have an A1C, fasting glucose, or another diabetes screening test?', qNext: 'If my recent result was normal, when should I be screened again?', qAsian: 'Does the Asian-ancestry BMI 23 screening threshold apply to me?', qHistory: 'How does my health history affect when I should be screened?', qLanguage: 'Please provide a qualified interpreter in my preferred language.', waistRatio: 'Waist-to-height ratio', lifeCount: '{count} lifestyle topics are available for an optional conversation.', print: 'Print', download: 'Download to device', email: 'Email', share: 'Share', copy: 'Copy text', copied: 'Copied', screenedOn: 'Check date', privacyShare: 'This card stays on this device until you choose to download, copy, email, or share it. Your chosen app or email provider may keep a copy.', resources: 'Find language-friendly care', restart: 'Start over',
  },
  ko: {
    intro: '검사 시기를 이해하고 진료 질문을 준비하는 비공개 단계형 확인입니다. 당뇨병을 진단하거나 위험 점수를 계산하지 않습니다.', self: '내 건강을 직접 확인합니다', family: '가족의 확인을 도와드립니다', familyNote: '가족 모드는 큰 버튼과 쉬운 문장을 사용합니다. 확인받는 분을 기준으로 답해주세요.', private: '답변은 이 기기에만 있으며 다시 시작하거나 페이지를 나가면 사라집니다.', next: '계속', back: '이전', show: '내 안내 보기', step: '단계', of: '/', required: '계속하기 전에 필수 질문에 답해주세요.',
    basics: '기본 정보부터 시작합니다', basicsHelp: '나이는 정기검사 시기를 안내하는 데만 사용합니다. 나이만으로 고위험 경고를 표시하지 않습니다.', lastTest: '마지막 혈당검사 또는 A1C 검사는 언제 받으셨나요?', never: '받은 적 없음', within1: '1년 이내', within3: '1~3년 전', over3: '3년보다 오래됨', unknown: '기억나지 않음',
    body: 'AAPI 체형 기준 확인', bodyHelp: 'BMI 23은 아시아계 성인을 위한 검사 참고 기준입니다. 선택적인 허리둘레는 추가 맥락을 제공하며 어느 것도 진단이 아닙니다.', waist: '허리둘레 (선택사항)', waistHelp: '허리 주위를 측정하세요. 불편하거나 정확하지 않으면 건너뛰어도 됩니다.', inches: '인치', centimeters: 'cm',
    history: '건강 이력', historyHelp: '모르는 경우 “잘 모름”을 선택하세요. 진료 시 필요한 질문을 준비하는 데 사용됩니다.', hypertension: '고혈압이 있거나 혈압약을 복용하나요?', cardiovascular: '심장질환 또는 뇌졸중 이력이 있나요?', pcos: '다낭성난소증후군(PCOS)이 있나요?', prediabetes: '전당뇨 또는 혈당 상승을 들은 적이 있나요?', unsure: '잘 모름',
    lifestyle: '일상생활 확인', lifestyleHelp: '생활 답변은 의료 위험 점수에 반영하지 않습니다. 상담 내용을 개인화하는 데만 사용합니다.', sugary: '당이 든 음료를 얼마나 자주 드시나요?', daily: '거의 매일', sometimes: '가끔', rarely: '거의 또는 전혀 안 함', afterMeal: '식사 후 걷거나 몸을 움직이는 편인가요?', sleep: '6시간보다 적게 자는 날이 자주 있나요?',
    result: '나의 검사 상담 안내', ageOnly: '연령상 정기검사 시기를 확인할 때입니다. 나이만으로 고위험이라는 의미는 아닙니다.', discuss: '정기 진료 때 의료진과 이야기해 볼 항목이 있습니다.', routine: '입력한 답변에서는 추가 검사 신호가 나타나지 않았습니다. 정기 예방 진료를 이어가세요.', due: '최근 검사 시기를 다시 확인해 볼 수 있습니다.', bodyContext: '체형 관련 참고사항', historyContext: '건강 이력 참고사항', lifeContext: '생활 상담 아이디어', noFlag: '추가로 선택된 항목 없음', notDiagnosis: '이 결과는 대화 준비용이며 진단이나 발생 확률 점수가 아닙니다.',
    card: '이중언어 진료 카드', cardHelp: '진료를 위해 이 카드를 보여주거나 기기에 저장·공유할 수 있습니다. 영어 문장은 의료진의 이해를 도울 수 있습니다.', timing: '검사 시기', recentTest: '최근 1년 안에 혈당검사 또는 A1C 검사를 받은 것으로 입력했습니다.', qTiming: 'A1C, 공복혈당 또는 다른 당뇨병 검사를 언제 받는 것이 좋을까요?', qNext: '최근 검사 결과가 정상이었다면 다음 검사는 언제 받으면 될까요?', qAsian: '아시아계 BMI 23 검사 기준이 저에게 적용되나요?', qHistory: '제 건강 이력이 검사 시기에 어떤 영향을 주나요?', qLanguage: '제가 선호하는 언어의 전문 통역사를 제공해 주세요.', waistRatio: '허리-키 비율', lifeCount: '원할 경우 상담에 활용할 생활 항목이 {count}개 있습니다.', print: '인쇄', download: '기기에 다운로드', email: '이메일', share: '휴대전화 공유', copy: '내용 복사', copied: '복사됨', screenedOn: '확인 날짜', privacyShare: '다운로드·복사·이메일·공유를 직접 선택하기 전에는 이 카드가 기기 밖으로 전송되지 않습니다. 선택한 앱이나 이메일 서비스에는 사본이 남을 수 있습니다.', resources: '언어 지원 의료기관 찾기', restart: '다시 시작',
  },
  zh: {
    intro: '通过私密的分步检查了解筛查时间并准备就诊问题；不诊断糖尿病，也不计算风险分数。', self: '为自己检查', family: '帮助家人检查', familyNote: '家庭模式使用更大的按钮和简明提示。请按被检查者的情况回答。', private: '答案仅保留在本设备，重新开始或离开后即清除。', next: '继续', back: '返回', show: '查看我的指南', step: '步骤', of: '/', basics: '从基本信息开始', basicsHelp: '年龄仅用于提示常规筛查时间，不会单独产生高风险警告。', lastTest: '上次血糖或A1C检测是什么时候？', never: '从未检测', within1: '一年内', within3: '1至3年前', over3: '超过3年', unknown: '不记得', body: 'AAPI体型参考', bodyHelp: 'BMI 23是亚裔人群筛查参考。可选腰围可提供更多信息，两者都不是诊断。', waist: '腰围（可选）', waistHelp: '测量腰部一周；不舒服或不确定可跳过。', inches: '英寸', centimeters: '厘米', history: '健康史', historyHelp: '不知道时请选择“不确定”。', hypertension: '高血压或正在服用降压药？', cardiovascular: '有心脏病或中风史？', pcos: '多囊卵巢综合征（PCOS）？', prediabetes: '曾被告知前期糖尿病或血糖偏高？', unsure: '不确定', lifestyle: '日常生活', lifestyleHelp: '这些答案不计入医疗风险分数，只用于准备沟通。', sugary: '多久喝一次含糖饮料？', daily: '大多数日子', sometimes: '有时', rarely: '很少或从不', afterMeal: '饭后通常会走动吗？', sleep: '是否经常睡眠少于6小时？', result: '筛查沟通指南', ageOnly: '您的年龄提示应确认常规筛查时间，并不表示自动属于高风险。', discuss: '有一项或多项内容值得在常规就诊时讨论。', routine: '这些答案未显示额外提示，请继续常规预防保健。', due: '可以重新确认您的筛查记录。', bodyContext: '体型参考', historyContext: '健康史参考', lifeContext: '生活沟通建议', noFlag: '未选择其他项目', notDiagnosis: '这是沟通指南，不是诊断或概率分数。', card: '双语就诊卡', cardHelp: '可在诊所展示或打印此卡。', qTiming: '我应该何时做A1C、空腹血糖或其他糖尿病筛查？', qAsian: '亚裔BMI 23筛查标准适用于我吗？', qHistory: '我的健康史会如何影响筛查时间？', qLanguage: '请提供我首选语言的合格口译员。', print: '打印就诊卡', resources: '查找语言友好医疗服务', restart: '重新开始',
  },
};

COPY.bn = { ...COPY.en,
  intro: 'এই ব্যক্তিগত ধাপে ধাপে যাচাই স্ক্রিনিংয়ের সময় বুঝতে ও প্রশ্ন প্রস্তুত করতে সাহায্য করে; এটি রোগ নির্ণয় বা ঝুঁকির স্কোর নয়।', self: 'নিজের জন্য যাচাই করছি', family: 'পরিবারের সদস্যকে সাহায্য করছি', familyNote: 'পরিবার মোডে বড় বোতাম ও সহজ ভাষা ব্যবহার করা হয়। যার জন্য যাচাই করছেন তার তথ্য দিন।', private: 'উত্তর শুধু এই ডিভাইসে থাকে এবং পৃষ্ঠা ছাড়লে মুছে যায়।', next: 'চালিয়ে যান', back: 'পেছনে', show: 'আমার নির্দেশিকা দেখুন', step: 'ধাপ', of: 'এর', basics: 'প্রাথমিক তথ্য', basicsHelp: 'বয়স শুধু নিয়মিত স্ক্রিনিংয়ের সময় জানাতে ব্যবহৃত হয়; শুধু বয়সের জন্য উচ্চ ঝুঁকির সতর্কতা দেখানো হবে না।', lastTest: 'শেষ রক্তে শর্করা বা A1C পরীক্ষা কখন হয়েছিল?', never: 'কখনও নয়', within1: '১ বছরের মধ্যে', within3: '১–৩ বছর আগে', over3: '৩ বছরের বেশি', unknown: 'মনে নেই', body: 'AAPI শরীরের মাপের প্রসঙ্গ', bodyHelp: 'BMI ২৩ এশীয় বংশোদ্ভূতদের জন্য একটি স্ক্রিনিং রেফারেন্স; এটি রোগ নির্ণয় নয়।', waist: 'কোমরের মাপ (ঐচ্ছিক)', waistHelp: 'অস্বস্তি বা অনিশ্চয়তা হলে এড়িয়ে যেতে পারেন।', inches: 'ইঞ্চি', centimeters: 'সেমি', history: 'স্বাস্থ্য ইতিহাস', historyHelp: 'না জানলে “নিশ্চিত নই” বেছে নিন।', hypertension: 'উচ্চ রক্তচাপ বা ওষুধ?', cardiovascular: 'হৃদরোগ বা স্ট্রোকের ইতিহাস?', pcos: 'পলিসিস্টিক ওভারি সিনড্রোম (PCOS)?', prediabetes: 'আগে প্রিডায়াবেটিস বা উচ্চ রক্তশর্করা বলা হয়েছে?', unsure: 'নিশ্চিত নই', lifestyle: 'দৈনন্দিন জীবন', lifestyleHelp: 'এই উত্তরগুলো চিকিৎসা ঝুঁকির স্কোরে যোগ হয় না; শুধু আলোচনার প্রস্তুতির জন্য।', sugary: 'চিনিযুক্ত পানীয় কত ঘন ঘন পান করেন?', daily: 'বেশিরভাগ দিন', sometimes: 'কখনও কখনও', rarely: 'খুব কম বা কখনও নয়', afterMeal: 'খাবারের পর সাধারণত হাঁটেন বা নড়াচড়া করেন?', sleep: 'প্রায়ই ৬ ঘণ্টার কম ঘুমান?', result: 'স্ক্রিনিং আলোচনার নির্দেশিকা', ageOnly: 'আপনার বয়স নিয়মিত স্ক্রিনিংয়ের সময় যাচাই করার পরামর্শ দেয়—এটি নিজে থেকে উচ্চ ঝুঁকি নয়।', discuss: 'নিয়মিত চিকিৎসা সাক্ষাতে আলোচনা করার মতো এক বা একাধিক বিষয় আছে।', routine: 'এই উত্তরগুলোতে অতিরিক্ত সংকেত পাওয়া যায়নি। নিয়মিত প্রতিরোধমূলক যত্ন চালিয়ে যান।', due: 'স্ক্রিনিংয়ের সময়', bodyContext: 'শরীরের মাপ', historyContext: 'স্বাস্থ্য ইতিহাস', lifeContext: 'জীবনযাত্রার আলোচনা', noFlag: 'অতিরিক্ত বিষয় নেই', notDiagnosis: 'এটি কথোপকথনের নির্দেশিকা, রোগ নির্ণয় বা সম্ভাবনার স্কোর নয়।', card: 'দ্বিভাষিক ভিজিট কার্ড', cardHelp: 'ক্লিনিকে এই কার্ড দেখান বা প্রিন্ট করুন।', qTiming: 'আমার A1C, ফাস্টিং গ্লুকোজ বা অন্য ডায়াবেটিস স্ক্রিনিং কখন করা উচিত?', qAsian: 'এশীয় বংশোদ্ভূতদের BMI ২৩ স্ক্রিনিং মান কি আমার ক্ষেত্রে প্রযোজ্য?', qHistory: 'আমার স্বাস্থ্য ইতিহাস স্ক্রিনিংয়ের সময়কে কীভাবে প্রভাবিত করে?', qLanguage: 'আমার পছন্দের ভাষায় একজন যোগ্য দোভাষী দিন।', print: 'ভিজিট কার্ড প্রিন্ট', resources: 'ভাষা-সহায়ক সেবা খুঁজুন', restart: 'আবার শুরু',
};
COPY.ur = { ...COPY.en,
  intro: 'یہ نجی مرحلہ وار جانچ اسکریننگ کا وقت سمجھنے اور سوالات تیار کرنے میں مدد دیتی ہے؛ یہ تشخیص یا خطرے کا اسکور نہیں۔', self: 'اپنے لیے جانچ رہا/رہی ہوں', family: 'خاندان کے فرد کی مدد کر رہا/رہی ہوں', familyNote: 'خاندانی موڈ میں بڑے بٹن اور آسان زبان ہے۔ جس شخص کی جانچ ہے اسی کے مطابق جواب دیں۔', private: 'جوابات اسی آلے پر رہتے ہیں اور صفحہ چھوڑنے پر مٹ جاتے ہیں۔', next: 'جاری رکھیں', back: 'واپس', show: 'میری رہنمائی دکھائیں', step: 'مرحلہ', of: 'از', basics: 'بنیادی معلومات', basicsHelp: 'عمر صرف معمول کی اسکریننگ کا وقت بتانے کے لیے ہے؛ صرف عمر پر زیادہ خطرے کی تنبیہ نہیں ہوگی۔', lastTest: 'آخری بلڈ شوگر یا A1C ٹیسٹ کب ہوا؟', never: 'کبھی نہیں', within1: 'ایک سال کے اندر', within3: '۱–۳ سال پہلے', over3: '۳ سال سے زیادہ', unknown: 'یاد نہیں', body: 'AAPI جسمانی پیمائش', bodyHelp: 'BMI 23 ایشیائی نسب کے لوگوں کے لیے اسکریننگ حوالہ ہے؛ یہ تشخیص نہیں۔', waist: 'کمر کا گھیر (اختیاری)', waistHelp: 'اگر ناپنا مشکل یا غیر آرام دہ ہو تو چھوڑ دیں۔', inches: 'انچ', centimeters: 'سینٹی میٹر', history: 'صحت کی تاریخ', historyHelp: 'معلوم نہ ہو تو “یقین نہیں” منتخب کریں۔', hypertension: 'ہائی بلڈ پریشر یا اس کی دوا؟', cardiovascular: 'دل کی بیماری یا فالج کی تاریخ؟', pcos: 'پولی سسٹک اووری سنڈروم (PCOS)؟', prediabetes: 'کیا کبھی پری ذیابیطس یا بلند شوگر بتائی گئی؟', unsure: 'یقین نہیں', lifestyle: 'روزمرہ زندگی', lifestyleHelp: 'یہ جواب طبی خطرے کے اسکور میں شامل نہیں ہوتے؛ صرف گفتگو کی تیاری کے لیے ہیں۔', sugary: 'میٹھے مشروبات کتنی بار پیتے ہیں؟', daily: 'زیادہ تر دن', sometimes: 'کبھی کبھار', rarely: 'شاذ یا کبھی نہیں', afterMeal: 'کیا کھانے کے بعد عموماً چلتے یا حرکت کرتے ہیں؟', sleep: 'کیا اکثر ۶ گھنٹے سے کم سوتے ہیں؟', result: 'اسکریننگ گفتگو کی رہنمائی', ageOnly: 'آپ کی عمر معمول کی اسکریننگ کا وقت معلوم کرنے کی طرف اشارہ کرتی ہے—یہ خودبخود زیادہ خطرہ نہیں۔', discuss: 'معمول کے طبی دورے میں ایک یا زیادہ باتیں زیرِ بحث لائی جا سکتی ہیں۔', routine: 'ان جوابات سے کوئی اضافی اشارہ نہیں ملا۔ معمول کی احتیاطی نگہداشت جاری رکھیں۔', due: 'اسکریننگ کا وقت', bodyContext: 'جسمانی پیمائش', historyContext: 'صحت کی تاریخ', lifeContext: 'طرزِ زندگی کی گفتگو', noFlag: 'کوئی اضافی بات نہیں', notDiagnosis: 'یہ گفتگو کی رہنمائی ہے، تشخیص یا امکان کا اسکور نہیں۔', card: 'دو لسانی وزٹ کارڈ', cardHelp: 'کلینک میں یہ کارڈ دکھائیں یا پرنٹ کریں۔', qTiming: 'مجھے A1C، فاسٹنگ گلوکوز یا دوسری ذیابیطس اسکریننگ کب کرانی چاہیے؟', qAsian: 'کیا ایشیائی نسب کے لیے BMI 23 اسکریننگ معیار مجھ پر لاگو ہوتا ہے؟', qHistory: 'میری صحت کی تاریخ اسکریننگ کے وقت کو کیسے متاثر کرتی ہے؟', qLanguage: 'براہ کرم میری پسندیدہ زبان میں مستند ترجمان فراہم کریں۔', print: 'وزٹ کارڈ پرنٹ کریں', resources: 'زبان دوست نگہداشت تلاش کریں', restart: 'دوبارہ شروع کریں',
};

Object.assign(COPY.zh, { timing: '筛查时间', recentTest: '您填写的是过去一年内做过血糖或A1C检测。', qNext: '如果最近的结果正常，下次应何时筛查？', waistRatio: '腰高比', lifeCount: '如有需要，可讨论{count}项生活习惯。', download: '下载到设备', email: '电子邮件', share: '手机分享', copy: '复制文字', copied: '已复制', screenedOn: '检查日期', privacyShare: '在您主动下载、复制、发送邮件或分享之前，此卡不会离开设备。所选应用或邮件服务可能保留副本。' });
Object.assign(COPY.bn, { timing: 'স্ক্রিনিংয়ের সময়', recentTest: 'আপনি গত এক বছরের মধ্যে রক্তে শর্করা বা A1C পরীক্ষা করেছেন বলে জানিয়েছেন।', qNext: 'সাম্প্রতিক ফল স্বাভাবিক হলে আবার কখন পরীক্ষা করাব?', waistRatio: 'কোমর-উচ্চতা অনুপাত', lifeCount: 'ইচ্ছা করলে {count}টি জীবনযাত্রার বিষয় আলোচনা করতে পারেন।', download: 'ডিভাইসে ডাউনলোড', email: 'ইমেইল', share: 'ফোনে শেয়ার', copy: 'লেখা কপি', copied: 'কপি হয়েছে', screenedOn: 'যাচাইয়ের তারিখ', privacyShare: 'আপনি ডাউনলোড, কপি, ইমেইল বা শেয়ার না করা পর্যন্ত কার্ডটি ডিভাইসেই থাকে। নির্বাচিত অ্যাপ বা ইমেইল সেবায় একটি কপি থাকতে পারে।' });
Object.assign(COPY.ur, { timing: 'اسکریننگ کا وقت', recentTest: 'آپ نے بتایا کہ گزشتہ ایک سال میں بلڈ شوگر یا A1C ٹیسٹ ہوا ہے۔', qNext: 'اگر حالیہ نتیجہ نارمل تھا تو دوبارہ اسکریننگ کب کرانی چاہیے؟', waistRatio: 'کمر اور قد کا تناسب', lifeCount: 'اگر چاہیں تو طرزِ زندگی کے {count} موضوعات پر بات کر سکتے ہیں۔', download: 'آلے پر ڈاؤن لوڈ', email: 'ای میل', share: 'فون پر شیئر', copy: 'متن کاپی کریں', copied: 'کاپی ہوگیا', screenedOn: 'جانچ کی تاریخ', privacyShare: 'جب تک آپ خود ڈاؤن لوڈ، کاپی، ای میل یا شیئر نہ کریں یہ کارڈ اسی آلے پر رہتا ہے۔ منتخب ایپ یا ای میل سروس ایک نقل رکھ سکتی ہے۔' });

const INITIAL = { mode: 'self', age: '', lastTest: '', heightFt: '', heightIn: '', weightLbs: '', heightCm: '', weightKg: '', waistIn: '', waistCm: '', familyHistory: '', gestational: '', hypertension: '', cardiovascular: '', pcos: '', priorPrediabetes: '', activityLevel: '', sugaryDrinks: '', afterMeal: '', sleep: '' };

function RiskScreener() {
  const { t, lang } = useI18n();
  const copy = COPY[lang] || COPY.en;
  const english = COPY.en;
  const [data, setData] = useState(INITIAL);
  const [unit, setUnit] = useState(() => localStorage.getItem('aapicheck-units') || 'imperial');
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { document.title = `${t('screener.title')} — ${SITE.name}`; }, [t]);
  useEffect(() => { localStorage.setItem('aapicheck-units', unit); }, [unit]);

  const measurements = useMemo(() => {
    const heightCm = unit === 'metric' ? Number(data.heightCm) : ((Number(data.heightFt) * 12) + Number(data.heightIn)) * 2.54;
    const weightKg = unit === 'metric' ? Number(data.weightKg) : Number(data.weightLbs) * 0.453592;
    const waistCm = unit === 'metric' ? Number(data.waistCm) : Number(data.waistIn) * 2.54;
    return { heightCm, weightKg, waistCm: waistCm || null, bmi: calculateBMI(heightCm, weightKg) };
  }, [data, unit]);

  const update = (key, value) => { setData((current) => ({ ...current, [key]: value })); setError(''); };
  const validStep = () => {
    if (step === 0) return Number(data.age) >= 18 && Number(data.age) <= 120 && data.lastTest;
    if (step === 1) return measurements.heightCm >= 100 && measurements.heightCm <= 250 && measurements.weightKg >= 25 && measurements.weightKg <= 350;
    if (step === 2) return data.familyHistory && data.gestational && data.hypertension && data.cardiovascular && data.pcos && data.priorPrediabetes;
    return data.activityLevel && data.sugaryDrinks && data.afterMeal && data.sleep;
  };
  const goNext = () => { if (!validStep()) { setError(copy.required || 'Please answer the required questions.'); return; } setStep((value) => Math.min(value + 1, 3)); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const submit = () => {
    if (!validStep()) { setError(copy.required || 'Please answer the required questions.'); return; }
    const yes = (value) => value === 'yes';
    setResult({ ...evaluateScreeningGuidance({ ...data, ...measurements, age: Number(data.age), familyHistory: yes(data.familyHistory), gestational: yes(data.gestational), hypertension: yes(data.hypertension), cardiovascular: yes(data.cardiovascular), pcos: yes(data.pcos), priorPrediabetes: yes(data.priorPrediabetes) }), screenedAt: new Date().toISOString() });
    requestAnimationFrame(() => document.getElementById('screening-result')?.focus());
  };

  if (result) return <Result result={result} data={data} copy={copy} english={english} lang={lang} t={t} onRestart={() => { setData(INITIAL); setStep(0); setResult(null); }} />;

  const steps = [copy.basics, copy.body, copy.history, copy.lifestyle];
  return <section className={`screener screener--guided ${data.mode === 'family' ? 'screener--family' : ''}`} aria-labelledby="screener-title">
    <div className="screener__intro"><p className="eyebrow">{t('hero.badge')}</p><h1 id="screener-title">{t('screener.title')}</h1><p>{copy.intro}</p><p className="privacy-note">● {copy.private}</p></div>
    <div className="support-mode" role="group" aria-label={t('screener.title')}>
      <button type="button" aria-pressed={data.mode === 'self'} onClick={() => update('mode', 'self')}>👤 {copy.self}</button>
      <button type="button" aria-pressed={data.mode === 'family'} onClick={() => update('mode', 'family')}>👥 {copy.family}</button>
    </div>
    {data.mode === 'family' && <p className="family-mode-note">{copy.familyNote}</p>}
    <div className="screener-progress" aria-label={`${copy.step} ${step + 1} ${copy.of} 4`}><div><strong>{copy.step} {step + 1} {copy.of} 4</strong><span>{steps[step]}</span></div><div className="screener-progress__track"><span style={{ width: `${(step + 1) * 25}%` }} /></div></div>
    <form className="health-check-form" onSubmit={(event) => event.preventDefault()} noValidate>
      {step === 0 && <fieldset><legend>1. {copy.basics}</legend><p>{copy.basicsHelp}</p><label>{t('screener.age_label')}<input type="number" inputMode="numeric" min="18" max="120" value={data.age} onChange={(e) => update('age', e.target.value)} /></label><Choice label={copy.lastTest} value={data.lastTest} onChange={(value) => update('lastTest', value)} options={['never','within1','within3','over3','unknown'].map((key) => [key,copy[key]])} /></fieldset>}
      {step === 1 && <fieldset><legend>2. {copy.body}</legend><p>{copy.bodyHelp}</p><div className="unit-toggle" role="group" aria-label="Measurement units"><button type="button" aria-pressed={unit === 'imperial'} onClick={() => setUnit('imperial')}>{t('screener.unit_imperial')}</button><button type="button" aria-pressed={unit === 'metric'} onClick={() => setUnit('metric')}>{t('screener.unit_metric')}</button></div>{unit === 'imperial' ? <div className="form-grid form-grid--three"><NumberField label={t('screener.height_ft_label')} value={data.heightFt} onChange={(v) => update('heightFt',v)} /><NumberField label={t('screener.height_in_label')} value={data.heightIn} onChange={(v) => update('heightIn',v)} /><NumberField label={t('screener.weight_lbs_label')} value={data.weightLbs} onChange={(v) => update('weightLbs',v)} /><NumberField label={`${copy.waist} — ${copy.inches}`} value={data.waistIn} onChange={(v) => update('waistIn',v)} optional /></div> : <div className="form-grid"><NumberField label={t('screener.height_label')} value={data.heightCm} onChange={(v) => update('heightCm',v)} /><NumberField label={t('screener.weight_label')} value={data.weightKg} onChange={(v) => update('weightKg',v)} /><NumberField label={`${copy.waist} — ${copy.centimeters}`} value={data.waistCm} onChange={(v) => update('waistCm',v)} optional /></div>}<p className="field-help">{copy.waistHelp}</p>{measurements.bmi && <p className="bmi-preview"><strong>{t('screener.your_bmi')}: {measurements.bmi}</strong> · {t('screener.bmi_note')}</p>}</fieldset>}
      {step === 2 && <fieldset><legend>3. {copy.history}</legend><p>{copy.historyHelp}</p><HealthChoice label={t('screener.family_history')} value={data.familyHistory} onChange={(v) => update('familyHistory',v)} copy={copy} t={t} /><HealthChoice label={t('screener.gestational')} value={data.gestational} onChange={(v) => update('gestational',v)} copy={copy} t={t} na /><HealthChoice label={copy.hypertension} value={data.hypertension} onChange={(v) => update('hypertension',v)} copy={copy} t={t} /><HealthChoice label={copy.cardiovascular} value={data.cardiovascular} onChange={(v) => update('cardiovascular',v)} copy={copy} t={t} /><HealthChoice label={copy.pcos} value={data.pcos} onChange={(v) => update('pcos',v)} copy={copy} t={t} na /><HealthChoice label={copy.prediabetes} value={data.priorPrediabetes} onChange={(v) => update('priorPrediabetes',v)} copy={copy} t={t} /></fieldset>}
      {step === 3 && <fieldset><legend>4. {copy.lifestyle}</legend><p>{copy.lifestyleHelp}</p><Choice label={t('screener.activity_label')} value={data.activityLevel} onChange={(v) => update('activityLevel',v)} options={[['daily',t('screener.activity_daily')],['weekly',t('screener.activity_weekly')],['occasional',t('screener.activity_occasional')],['rarely',t('screener.activity_rarely')]]} /><Choice label={copy.sugary} value={data.sugaryDrinks} onChange={(v) => update('sugaryDrinks',v)} options={[['daily',copy.daily],['sometimes',copy.sometimes],['rarely',copy.rarely]]} /><HealthChoice label={copy.afterMeal} value={data.afterMeal} onChange={(v) => update('afterMeal',v)} copy={copy} t={t} /><HealthChoice label={copy.sleep} value={data.sleep} onChange={(v) => update('sleep',v)} copy={copy} t={t} /></fieldset>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="screener-actions">{step > 0 && <button className="btn btn--secondary" type="button" onClick={() => setStep((value) => value - 1)}>{copy.back}</button>}<button className="btn btn--primary btn--lg" type="button" onClick={step === 3 ? submit : goNext}>{step === 3 ? copy.show : copy.next}</button></div>
      <p className="medical-disclaimer">{t('terms.section_medical_text')}</p>
    </form>
  </section>;
}

function Result({ result, data, copy, english, lang, t, onRestart }) {
  const [copied, setCopied] = useState(false);
  const ui = { ...english, ...copy };
  const historyKeys = ['family','gestational','hypertension','cardiovascular','pcos','prediabetes'];
  const historyPresent = result.factors.some((factor) => historyKeys.includes(factor.key) && factor.present);
  const bodyPresent = result.factors.some((factor) => ['bmi','centralAdiposity'].includes(factor.key) && factor.present);
  const questions = [
    result.routineScreeningDue && [data.lastTest === 'within1' ? 'qNext' : 'qTiming'],
    bodyPresent && ['qAsian'],
    historyPresent && ['qHistory'],
    lang !== 'en' && ['qLanguage'],
  ].filter(Boolean).flat();
  const headline = result.ageOnly ? ui.ageOnly : result.discussionRecommended ? ui.discuss : ui.routine;
  const locale = { ko: 'ko-KR', zh: 'zh-CN', bn: 'bn-BD', ur: 'ur-PK', en: 'en-US' }[lang] || 'en-US';
  const screenedDate = new Date(result.screenedAt).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
  const timingText = data.lastTest === 'within1' ? ui.recentTest : result.routineScreeningDue ? ui.qTiming : ui.routine;
  const lifestyleText = result.lifestyleFactors.length ? ui.lifeCount.replace('{count}', result.lifestyleFactors.length) : ui.noFlag;
  const summaryText = [
    'AAPICHECK',
    `${ui.screenedOn}: ${screenedDate}`,
    `${t('screener.step_age')}: ${data.age}`,
    '',
    headline,
    '',
    ...questions.flatMap((key, index) => [
      `${index + 1}. ${ui[key]}`,
      ...(lang !== 'en' ? [`   ${english[key]}`] : []),
    ]),
    '',
    ui.notDiagnosis,
    'AAPICheck.org',
  ].join('\n');
  const emailHref = `mailto:?subject=${encodeURIComponent(`AAPICHECK — ${ui.card} — ${screenedDate}`)}&body=${encodeURIComponent(summaryText)}`;

  function downloadCard() {
    const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AAPICHECK_${result.screenedAt.slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function shareCard() {
    if (navigator.share) {
      try { await navigator.share({ title: `AAPICHECK — ${ui.card}`, text: summaryText }); return; }
      catch (error) { if (error.name === 'AbortError') return; }
    }
    await navigator.clipboard.writeText(summaryText);
    setCopied(true); window.setTimeout(() => setCopied(false), 2000);
  }

  async function copyCard() {
    await navigator.clipboard.writeText(summaryText);
    setCopied(true); window.setTimeout(() => setCopied(false), 2000);
  }

  return <section className="screener screener--result" aria-labelledby="screening-result">
    <div className="screener__intro"><p className="eyebrow">{t('screener.title')}</p><h1 id="screening-result" tabIndex="-1">{ui.result}</h1><p>{ui.notDiagnosis}</p></div>
    <div className={`guidance-result ${result.discussionRecommended ? 'guidance-result--discuss' : ''}`}>
      <div className="guidance-result__headline"><span aria-hidden="true">{result.ageOnly ? '○' : result.discussionRecommended ? '!' : '✓'}</span><h2>{headline}</h2></div>
      <div className="result-summary-grid">
        <article><h3>{ui.timing}</h3><p>{timingText}</p></article>
        <article><h3>{ui.bodyContext}</h3><p>{bodyPresent ? ui.qAsian : ui.noFlag}{result.waistToHeight ? ` · ${ui.waistRatio}: ${result.waistToHeight}` : ''}</p></article>
        <article><h3>{ui.historyContext}</h3><p>{historyPresent ? ui.qHistory : ui.noFlag}</p></article>
        <article><h3>{ui.lifeContext}</h3><p>{lifestyleText}</p></article>
      </div>
      <section className="visit-card"><div><p className="eyebrow">{ui.card}</p><h2>{ui.card}</h2><p>{ui.cardHelp}</p></div><ol>{questions.map((key) => <li key={key}><strong>{ui[key]}</strong>{lang !== 'en' && <span lang="en">{english[key]}</span>}</li>)}</ol><p className="visit-card__meta">AAPICHECK · {t('screener.step_age')} {data.age} · {ui.screenedOn}: {screenedDate}</p></section>
      <div className="card-share-panel"><p>🔒 {ui.privacyShare}</p><div className="card-share-actions"><button className="btn btn--primary" type="button" onClick={() => window.print()}>{ui.print}</button><button className="btn btn--secondary" type="button" onClick={downloadCard}>{ui.download}</button><a className="btn btn--secondary" href={emailHref}>{ui.email}</a><button className="btn btn--secondary" type="button" onClick={shareCard}>{ui.share}</button><button className="btn btn--secondary" type="button" onClick={copyCard}>{copied ? ui.copied : ui.copy}</button></div></div>
      <div className="next-step-box"><div className="button-row"><Link className="btn btn--secondary" to="/resources">{ui.resources}</Link><button className="btn btn--secondary" type="button" onClick={onRestart}>{ui.restart}</button></div></div>
    </div>
  </section>;
}

function NumberField({ label, value, onChange }) { return <label>{label}<input type="number" inputMode="decimal" min="0" value={value} onChange={(e) => onChange(e.target.value)} /></label>; }
function Choice({ label, value, onChange, options }) { return <div className="form-question"><span>{label}</span><div className="choice-row">{options.map(([key,text]) => <button type="button" key={key} aria-pressed={value === key} onClick={() => onChange(key)}>{text}</button>)}</div></div>; }
function HealthChoice({ label, value, onChange, copy, t, na = false }) { return <Choice label={label} value={value} onChange={onChange} options={[['yes',t('screener.yes')],['no',t('screener.no')],['unsure',copy.unsure],...(na ? [['na',t('screener.not_applicable')]] : [])]} />; }

export default RiskScreener;
