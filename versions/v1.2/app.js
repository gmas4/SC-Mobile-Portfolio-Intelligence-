const app = document.querySelector('#app');
const params = new URLSearchParams(location.search);
const currentPersona = ['simon', 'alex', 'sarah'].includes(params.get('persona')) ? params.get('persona') : 'simon';

const personaContext = {
  simon: { name:'Simon', age:55, label:'Approaching Retirement', situation:['Holds CPF savings, investments and insurance','Seeks a comfortable, independent retirement','Wants to maintain lifestyle, travel and leave a legacy'], triggers:['Approaching retirement or CPF payout','Market volatility affecting assets','Rising healthcare and living costs','Concern about outliving savings'], moment:'Offer a quick retirement-readiness view and options to strengthen future income.' },
  alex: { name:'Alex', age:35, label:'Established Income Earner', situation:['Stable income with a mortgage and family commitments','Wants to protect finances while building wealth','Seeks financial independence and lifestyle security'], triggers:['Changes in income, debt or dependants','Health events among family or peers','Coverage not reviewed recently'], moment:'Invite a quick check of whether current protection still matches evolving commitments.' },
  sarah: { name:'Sarah', age:30, label:'Expecting New Dependant', situation:['Dual income with competing priorities','Wants to fund education without affecting retirement','Seeks long-term family security and opportunity'], triggers:['Arrival of a new child','Rising childcare and education costs','Home purchase or career change'], moment:'Help explore how new family priorities may shape protection and education planning.' }
};

const personaPopover = document.querySelector('#persona-popover');
const momentTrigger = document.querySelector('.moment-trigger');
const momentCallout = document.querySelector('#moment-callout');
let momentCloseTimer;
let suppressMomentFocus = false;
function closeMomentCallout(returnFocus = false) {
  clearTimeout(momentCloseTimer);
  if (!momentCallout?.classList.contains('is-visible')) return;
  momentCallout.classList.remove('is-visible');
  momentCallout.setAttribute('aria-hidden', 'true');
  momentTrigger?.setAttribute('aria-expanded', 'false');
  if (returnFocus) momentTrigger?.focus();
}
function toggleMomentCallout(forceOpen) {
  if (!momentCallout || !momentTrigger) return;
  clearTimeout(momentCloseTimer);
  const open = forceOpen ?? !momentCallout.classList.contains('is-visible');
  momentCallout.classList.toggle('is-visible', open);
  momentCallout.setAttribute('aria-hidden', String(!open));
  momentTrigger.setAttribute('aria-expanded', String(open));
}
momentTrigger?.addEventListener('click', () => toggleMomentCallout(true));
momentTrigger?.addEventListener('mouseenter', () => {
  if (window.matchMedia('(hover: hover)').matches) toggleMomentCallout(true);
});
momentTrigger?.addEventListener('mouseleave', () => {
  momentCloseTimer = setTimeout(() => {
    if (!momentCallout?.matches(':hover') && document.activeElement !== momentTrigger) closeMomentCallout();
  }, 180);
});
momentTrigger?.addEventListener('focus', () => {
  if (suppressMomentFocus) { suppressMomentFocus = false; return; }
  toggleMomentCallout(true);
});
momentTrigger?.addEventListener('blur', () => {
  momentCloseTimer = setTimeout(() => {
    if (!momentCallout?.matches(':hover')) closeMomentCallout();
  }, 180);
});
momentCallout?.addEventListener('mouseenter', () => toggleMomentCallout(true));
momentCallout?.addEventListener('mouseleave', () => {
  momentCloseTimer = setTimeout(() => {
    if (document.activeElement !== momentTrigger) closeMomentCallout();
  }, 180);
});
document.addEventListener('click', event => {
  if (momentCallout?.classList.contains('is-visible') && !event.target.closest('.moment-explainer')) closeMomentCallout();
});
document.addEventListener('click', event => {
  if (event.target.closest('[data-close-next-guide]')) {
    const openGuide = document.querySelector('.next-steps-details[open]');
    if (openGuide) {
      openGuide.open = false;
      openGuide.querySelector('summary')?.focus();
    }
    return;
  }
  const openGuide = document.querySelector('.next-steps-details[open]');
  if (openGuide && !openGuide.contains(event.target)) openGuide.open = false;
});
document.querySelector('.next-steps-details')?.addEventListener('toggle', event => {
  if (event.currentTarget.open) event.currentTarget.querySelector('.next-guide-close')?.focus();
});
document.querySelector('.next-guide-progress')?.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  const destination = document.querySelector(link.getAttribute('href'));
  if (!destination) return;
  event.preventDefault();
  destination.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
document.addEventListener('keydown', event => {
  const openGuide = document.querySelector('.next-steps-details[open]');
  if (!openGuide) return;
  if (event.key === 'Escape') {
    openGuide.open = false;
    openGuide.querySelector('summary')?.focus();
    return;
  }
  if (event.key !== 'Tab') return;
  const focusable = [...openGuide.querySelector('.next-steps-callout').querySelectorAll('a[href],button:not([disabled]),summary,[tabindex]:not([tabindex="-1"])')].filter(item => item.getClientRects().length > 0 && !item.closest('[hidden]'));
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && (document.activeElement === first || !openGuide.contains(document.activeElement))) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && (document.activeElement === last || !openGuide.contains(document.activeElement))) {
    event.preventDefault();
    first?.focus();
  }
});
let personaPopoverTimer;
let activePersonaLink = null;
let touchPreviewPersona = null;
let lastTouchStartAt = 0;
function showPersonaPopover(link) {
  const context = personaContext[link.dataset.persona];
  if (!context || !personaPopover) return;
  clearTimeout(personaPopoverTimer);
  activePersonaLink = link;
  personaPopover.innerHTML = `<div class="persona-popover-head"><span class="persona-photo persona-photo-${link.dataset.persona}" role="img" aria-label="${context.name} portrait"></span><div><strong class="persona-popover-name">${context.name}, ${context.age}</strong><span class="persona-popover-label">${context.label}</span></div></div><section><b>Financial Situation &amp; Goal</b><ul>${context.situation.map(item => `<li>${item}</li>`).join('')}</ul></section><section><b>Potential Triggers</b><ul>${context.triggers.map(item => `<li>${item}</li>`).join('')}</ul></section><section class="persona-advisory"><b>Advisory Moment</b><p>${context.moment}</p></section>`;
  const bounds = link.getBoundingClientRect();
  personaPopover.classList.add('is-visible');
  personaPopover.setAttribute('aria-hidden', 'false');
  document.querySelectorAll('.demo-bar [data-persona]').forEach(item => item.setAttribute('aria-expanded', item === link ? 'true' : 'false'));
  const width = personaPopover.offsetWidth;
  const left = Math.max(8, Math.min(bounds.left, window.innerWidth - width - 8));
  personaPopover.style.left = `${left}px`;
  personaPopover.style.top = `${bounds.bottom + 10}px`;
}
function hidePersonaPopover() {
  personaPopoverTimer = setTimeout(() => {
    if (touchPreviewPersona) return;
    if (personaPopover.matches(':hover') || activePersonaLink?.matches(':hover') || activePersonaLink === document.activeElement) return;
    closePersonaPopover();
  }, 180);
}
function closePersonaPopover() {
  clearTimeout(personaPopoverTimer);
  personaPopover.classList.remove('is-visible');
  personaPopover.setAttribute('aria-hidden', 'true');
  document.querySelectorAll('.demo-bar [data-persona]').forEach(item => item.setAttribute('aria-expanded', 'false'));
  activePersonaLink = null;
}
document.querySelectorAll('.demo-bar [data-persona]').forEach(link => {
  link.addEventListener('pointerdown', event => { if (event.pointerType === 'touch') lastTouchStartAt = Date.now(); });
  link.addEventListener('touchstart', () => { lastTouchStartAt = Date.now(); }, {passive:true});
  link.addEventListener('click', event => {
    const isTouchClick = event.pointerType === 'touch' || event.sourceCapabilities?.firesTouchEvents || Date.now() - lastTouchStartAt < 1500;
    lastTouchStartAt = 0;
    if (!isTouchClick) return;
    const persona = link.dataset.persona;
    if (touchPreviewPersona === persona) {
      touchPreviewPersona = null;
      return;
    }
    event.preventDefault();
    touchPreviewPersona = persona;
    showPersonaPopover(link);
  });
  link.addEventListener('mouseenter', () => {
    if (window.matchMedia('(hover: hover)').matches) personaPopoverTimer = setTimeout(() => showPersonaPopover(link), 180);
  });
  link.addEventListener('mouseleave', hidePersonaPopover);
  link.addEventListener('focus', () => showPersonaPopover(link));
  link.addEventListener('blur', hidePersonaPopover);
});
personaPopover?.addEventListener('mouseenter', () => clearTimeout(personaPopoverTimer));
personaPopover?.addEventListener('mouseleave', hidePersonaPopover);
document.addEventListener('click', event => {
  if (!touchPreviewPersona || event.target.closest('.demo-bar [data-persona]') || personaPopover?.contains(event.target)) return;
  touchPreviewPersona = null;
  closePersonaPopover();
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (document.querySelector('.protection-dialog')) {
    event.preventDefault();
    closeProtectionDialog();
    return;
  }
  if (momentCallout?.classList.contains('is-visible')) {
    suppressMomentFocus = true;
    closeMomentCallout(true);
    return;
  }
  if (!personaPopover?.classList.contains('is-visible')) return;
  touchPreviewPersona = null;
  closePersonaPopover();
});
document.addEventListener('click', event => {
  const openHelp = document.querySelector('.gap-help[open], .protection-info[open]');
  if (openHelp && !openHelp.contains(event.target)) openHelp.open = false;
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const openHelp = document.querySelector('.gap-help[open], .protection-info[open]');
  if (!openHelp) return;
  openHelp.open = false;
  openHelp.querySelector('summary')?.focus();
});

const people = {
  simon: {
    name: 'Simon', initials: 'S', title: 'Your retirement outlook', needTitle: 'Will your income support the retirement you want?', icon: '◔',
    nudge: 'Take a quick look at how your savings, investments and protection could support the retirement you have in mind.',
    summary: 'You are approaching retirement. A short review now can help you understand what may affect your future monthly income.',
    signals: ['Your selected scenario spans 20 years of retirement.', 'Known CPF, investments and insurance have been included in this illustrative view.', 'Your assumed monthly lifestyle income is higher than the forecast retirement income.'],
    fields: [
      { key:'desired', label:'Desired monthly retirement income', min:4000, max:10000, step:500, prefix:'S$', value:7000 },
      { key:'forecast', label:'Forecast monthly retirement income', min:2000, max:8000, step:500, prefix:'S$', value:5000 },
      { key:'years', label:'Years in retirement', min:10, max:30, step:1, suffix:' years', value:20 }
    ],
    calculation: v => Math.max(0, (v.desired - v.forecast) * 12 * v.years),
    gapLabel: v => `S$${number(v.desired - v.forecast)}/month`,
    gapHelp: 'Illustrative retirement income shortfall across your selected retirement years: desired monthly income minus forecast monthly income, multiplied by 12 months and the number of years. The supporting label shows the monthly difference.',
    formula: v => `(S$${number(v.desired)} desired monthly income − S$${number(v.forecast)} forecast income) × 12 months × ${v.years} years`,
    types: [['Retirement income planning','Explore how a future income target, existing assets and protection can work together.'], ['Health and long-term care review','Understand how care or medical costs may affect retirement plans.'], ['Legacy planning','Consider how a plan can support the people and causes important to you.']],
    products: [['PRUWealth Plus (SGD)','A flexible wealth-planning plan described by SC Singapore as supporting changing financial needs and family goals.','Retirement and family goals'], ['PRUActive Retirement II','An SC Singapore retirement solution to explore with an adviser.','Retirement planning']],
    handoff: 'Request a retirement planning conversation',
    protectionSnapshot: {
      supportingText: 'See the protection currently visible to SCB and areas that may be worth reviewing as retirement approaches.',
      coverages: [
        { key:'health', label:'Health', icon:'health', status:'covered', note:'Health protection information is visible in this illustrative SCB view. Check that the details are current.' },
        { key:'critical-illness', label:'Critical illness', icon:'critical', status:'worth-reviewing', note:'It may be useful to revisit how critical illness cover fits alongside your healthcare and retirement plans. This does not mean you lack cover.' },
        { key:'life', label:'Life', icon:'life', status:'covered', note:'Life protection information is visible in this illustrative SCB view. Check that the details are current.' },
        { key:'long-term-care', label:'Long-term care', icon:'care', status:'not-visible', note:'Long-term care protection details are not currently visible to SCB in this illustrative profile. You may already have cover elsewhere.' },
        { key:'travel', label:'Travel', icon:'travel', status:'covered', note:'Travel protection information is visible in this illustrative SCB view. Check that the details are current.' },
        { key:'legacy-planning', label:'Legacy planning', icon:'legacy', status:'worth-reviewing', note:'You may wish to review how your legacy intentions fit your wider retirement plans. This does not mean you lack cover.' }
      ]
    }
  },
  alex: {
    name: 'Alex', initials: 'A', title: 'Your family protection review', needTitle: 'Could your household manage an income interruption?', icon: '✚',
    nudge: 'Based on your income, mortgage, dependants and cover we currently know about, a serious illness could leave an illustrative S$270k household funding gap.',
    summary: 'Your commitments have changed. Explore what an interruption to income could mean for your household finances.',
    signals: ['A mortgage and family commitments are visible in this illustrative customer profile.', 'The household funding horizon uses five years of essential costs.', 'Known protection is lower than the calculated support, debt and recovery scenario.'],
    fields: [
      { key:'costs', label:'Essential monthly household costs', min:3000, max:10000, step:500, prefix:'S$', value:6400 },
      { key:'mortgage', label:'Mortgage or debt to protect', min:50000, max:400000, step:10000, prefix:'S$', value:180000 },
      { key:'cover', label:'Existing protection recognised', min:0, max:600000, step:10000, prefix:'S$', value:324000 }
    ],
    calculation: v => Math.max(0, (v.costs * 60) + v.mortgage + 30000 - v.cover),
    gapLabel: () => 'household funding gap',
    gapHelp: 'Illustrative household funding gap: 60 months of essential household costs, plus mortgage or debt and a S$30,000 recovery reserve, less existing protection.',
    formula: v => `S$${number(v.costs)} monthly costs × 60 months + S$${number(v.mortgage)} debt + S$30,000 recovery reserve − S$${number(v.cover)} existing cover`,
    types: [['Income continuity','Explore protection designed to help a family manage loss of income from illness, disability or accident.'], ['Mortgage protection','Review how family housing commitments could be supported.'], ['Critical illness and health','Understand the different roles of medical and critical-illness cover.']],
    products: [['PRUActive Term','An SC Singapore protection option described as flexible coverage for changing lifestyles.','Protection discussion'], ['Allianz Cancer Protect','An SC Singapore critical-illness option to discuss in the context of Alex’s broader needs.','Critical illness discussion']],
    handoff: 'Request a protection review',
    protectionSnapshot: {
      supportingText: 'See the protection currently visible to SCB and areas that may be worth reviewing as your commitments evolve.',
      coverages: [
        { key:'home', label:'Home', icon:'home', status:'covered', note:'Home protection information is visible in this illustrative SCB view. Check that the details are current.' },
        { key:'life', label:'Life', icon:'life', status:'not-visible', note:'Life protection details are not currently visible to SCB in this illustrative profile. You may already have cover elsewhere.' },
        { key:'income-protection', label:'Income protection', icon:'income', status:'worth-reviewing', note:'It may be useful to review how your household could manage an interruption to income. This does not mean you lack cover.' },
        { key:'critical-illness', label:'Critical illness', icon:'critical', status:'worth-reviewing', note:'It may be useful to review how critical illness cover fits your household commitments. This does not mean you lack cover.' },
        { key:'travel', label:'Travel', icon:'travel', status:'covered', note:'Travel protection information is visible in this illustrative SCB view. Check that the details are current.' },
        { key:'cyber', label:'Cyber', icon:'cyber', status:'covered', note:'Cyber protection information is visible in this illustrative SCB view. Check that the details are current.' }
      ]
    }
  },
  sarah: {
    name: 'Sarah', initials: 'S', title: 'Your family goal outlook', needTitle: 'How could you prepare for your child’s education goal?', icon: '♡',
    nudge: 'Based on a new dependant and the education savings we currently know about, this illustrative scenario shows a future education funding gap of S$34k.',
    summary: 'A new family priority can change how you balance education, protection and your own long-term goals.',
    signals: ['A new dependant has been included in this synthetic scenario.', 'An education objective and current savings have been added to the family view.', 'Future planned savings do not fully meet the illustrative education target.'],
    fields: [
      { key:'goal', label:'Future education goal', min:60000, max:220000, step:5000, prefix:'S$', value:120000 },
      { key:'funds', label:'Existing education funds', min:0, max:120000, step:2000, prefix:'S$', value:46000 },
      { key:'savings', label:'Projected future savings', min:0, max:100000, step:2000, prefix:'S$', value:40000 }
    ],
    calculation: v => Math.max(0, v.goal - v.funds - v.savings),
    gapLabel: () => 'future education gap',
    gapHelp: 'Illustrative future education funding gap: the education goal less existing education funds and projected future savings.',
    formula: v => `S$${number(v.goal)} education goal − S$${number(v.funds)} current funds − S$${number(v.savings)} projected savings`,
    types: [['Education savings','Explore a goal, time horizon and the role of regular savings.'], ['Family protection','Consider how a parent’s ability to provide could affect the goal.'], ['Legacy and guardianship','Start a broader conversation about family security and intentions.']],
    products: [['PRUActive Saver III','An SC Singapore customisable insurance-savings plan presented for life milestones.','Family milestone planning'], ['PRUWealth Plus (SGD)','A wealth-planning option to explore for longer-term family goals.','Family goals discussion']],
    handoff: 'Request a family-planning conversation',
    protectionSnapshot: {
      supportingText: 'See the protection currently visible to SCB and areas you may want to review as your family priorities evolve.',
      coverages: [
        { key:'travel', label:'Travel', icon:'travel', status:'covered', note:'Travel protection information is visible in this illustrative SCB view. Check that the details are current.' },
        { key:'home', label:'Home', icon:'home', status:'not-visible', note:'Home protection details are not currently visible to SCB in this illustrative profile. You may already have cover elsewhere.' },
        { key:'cyber', label:'Cyber', icon:'cyber', status:'covered', note:'Cyber protection information is visible in this illustrative SCB view. Check that the details are current.' },
        { key:'life', label:'Life', icon:'life', status:'not-visible', note:'Life protection details are not currently visible to SCB in this illustrative profile. You may already have cover elsewhere.' },
        { key:'health', label:'Health & critical illness', icon:'health', status:'covered', note:'Health protection information is visible in this illustrative SCB view. Check that the details are current.' },
        { key:'family-protection', label:'Family protection', icon:'family', status:'worth-reviewing', note:'It may be useful to review how protection fits your family’s changing responsibilities. This does not mean you lack cover.' }
      ]
    }
  }
};

const financialPictures = {
  simon: [
    { icon:'home', label:'Mortgage with SCB', summary:'No current SCB mortgage balance visible', detail:'No active mortgage balance is included in this illustrative SCB profile. Lending held elsewhere may not be visible here.' },
    { icon:'family', label:'Family commitments', summary:'Retirement lifestyle and legacy priorities declared', detail:'Your retirement lifestyle, travel and legacy priorities are included where you have chosen to share them.' },
    { icon:'insurance', label:'Existing protection', summary:'Health, life and travel cover visible', detail:'Some policies held through SCB or partners are visible. Cover held elsewhere may not be included.' },
    { icon:'invest', label:'Savings & investments', summary:'SCB balances and known retirement assets included', detail:'Balances currently visible to SCB and the retirement assets used in this scenario are included.' }
  ],
  alex: [
    { icon:'home', label:'Mortgage with SCB', summary:'S$180,000 illustrative outstanding balance', detail:'The lending relationship and balance used in this scenario are visible to SCB. Check the scenario if this has changed.' },
    { icon:'family', label:'Family commitments', summary:'Household profile and dependants declared', detail:'Family and household commitments you have chosen to share are included in this illustrative profile.' },
    { icon:'insurance', label:'Existing protection', summary:'S$324,000 recognised in this scenario', detail:'Protection visible through SCB or partners is included. Policies held elsewhere may not be visible.' },
    { icon:'invest', label:'Savings & investments', summary:'SCB accounts and balances currently visible', detail:'This view includes accounts and balances currently visible to SCB, but may not include assets held elsewhere.' }
  ],
  sarah: [
    { icon:'home', label:'Mortgage with SCB', summary:'No current SCB mortgage balance visible', detail:'No active SCB mortgage is included in this illustrative profile. Lending held elsewhere may not be visible here.' },
    { icon:'family', label:'Family commitments', summary:'New dependant and education goal declared', detail:'The new dependant and education priority you have chosen to share are included in this scenario.' },
    { icon:'insurance', label:'Existing protection', summary:'Health and selected policies visible', detail:'Some protection held through SCB or partners is visible. Cover held elsewhere may not be included.' },
    { icon:'invest', label:'Savings & investments', summary:'S$46,000 education savings used in this scenario', detail:'The S$46,000 education funds used in this scenario are illustrative. Other SCB balances and assets may not be included.' }
  ]
};

const transactions = [
  { label:'Salary credit', detail:'Monthly salary', amount:'+ SGD 8,450.00', incoming:true },
  { label:'Mortgage / Home Loan', detail:'Monthly repayment', amount:'− SGD 3,180.00' },
  { label:'NTUC FairPrice', detail:'Card purchase', amount:'− SGD 126.40' },
  { label:'Grab', detail:'Card purchase', amount:'− SGD 24.80' },
  { label:'SP Group', detail:'Utilities', amount:'− SGD 183.20' },
  { label:'Insurance premium', detail:'Recurring payment', amount:'− SGD 315.00' },
  { label:'Education payment', detail:'Scheduled transfer', amount:'− SGD 620.00' }
];

const policyFixtures = {
  simon: {
    insurer:'Illustrative Assurance Co.', policyName:'Retirement Health & Care', policyType:'Health and long-term care', insured:'Simon', countryOfIssue:'Singapore', territory:'Singapore with limited overseas emergency benefits', benefit:'S$300,000 annual hospitalisation limit', emergency:'Overseas emergency treatment appears included, subject to limits', planned:'Not clear from the policy', dependants:'No dependant cover identified', renewal:'Renews 30 June 2027', exclusions:'Residency, pre-existing condition and treatment authorisation wording should be checked'
  },
  alex: {
    insurer:'Illustrative Life Singapore', policyName:'SecureLife Term Protect', policyType:'Term life insurance', insured:'Alex', countryOfIssue:'Singapore', territory:'Worldwide wording appears in the policy', benefit:'S$750,000 life benefit', emergency:'Not applicable to this life policy', planned:'Not applicable to this life policy', dependants:'Family members are not insured; beneficiary wording is present', renewal:'Policy term to 31 December 2046', exclusions:'Territorial, residency and material-change wording should be reviewed'
  },
  sarah: {
    insurer:'Illustrative Family Assurance', policyName:'FamilyGuard Life & Health', policyType:'Life insurance with dependant health rider', insured:'Sarah and one dependant', countryOfIssue:'Singapore', territory:'Worldwide emergency wording; planned treatment territory unclear', benefit:'S$500,000 life benefit; S$100,000 dependant health limit', emergency:'Emergency overseas treatment appears included, subject to limits', planned:'Not clear from the policy', dependants:'One named dependant appears included', renewal:'Renews 31 March 2027', exclusions:'Residency, student healthcare and planned overseas treatment wording should be checked'
  }
};

const coverageCountries = ['Singapore','United Kingdom','Australia','India','United States','UAE','Other'];

const person = people[currentPersona];
const defaults = Object.fromEntries(person.fields.map(field => [field.key, field.value]));
const initialView = currentPersona === 'alex' ? 'email' : currentPersona === 'sarah' ? 'banking' : 'lock';
let state = { values: {...defaults}, view: initialView, tab: 'overview', response: null, needConfirmed: false, booking: false, assistant: false, chat: [], notificationVisible: false, pushVisible: false, customValues: false, protectionReview: false, protectionCategory: null, confirmedPolicies: {}, protectionMessage: null, policyFlow: null, policyDraft: null, policyFileName: null, policyUploadError: null, selectedCountry: null, policyAiMessage: null, documentPreview: false };
let lastRenderedView = null;
let protectionFocusSelector = null;
let notificationTimer = null;
let pushTimer = null;
const number = value => new Intl.NumberFormat('en-SG').format(Math.round(value));
const gap = () => person.calculation(state.values);
const route = view => { state.view = view; state.tab = 'overview'; render(); };
function resetDemo() {
  state = { values:{...defaults}, view:initialView, tab:'overview', response:null, needConfirmed:false, booking:false,assistant:false,chat:[],notificationVisible:false,pushVisible:false,customValues:false,protectionReview:false,protectionCategory:null,confirmedPolicies:{},protectionMessage:null,policyFlow:null,policyDraft:null,policyFileName:null,policyUploadError:null,selectedCountry:null,policyAiMessage:null,documentPreview:false };
  lastRenderedView = null;
  protectionFocusSelector = null;
  touchPreviewPersona = null;
  closePersonaPopover();
  closeMomentCallout();
  render();
}
function protectionStatus(coverage) {
  if (state.confirmedPolicies[coverage.key]) return { key:'customer-confirmed', label:'Customer confirmed', mark:'✓' };
  const statuses = {
    covered: { key:'covered', label:'Covered', mark:'✓' },
    'not-visible': { key:'not-visible', label:'Not visible', mark:'+' },
    'worth-reviewing': { key:'worth-reviewing', label:'Worth reviewing', mark:'i' }
  };
  return statuses[coverage.status];
}
const escapeHtml = value => String(value ?? '').replace(/[&<>"]/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[character]));
function createPolicyRecord(source = 'Customer-uploaded') {
  const fixture = policyFixtures[currentPersona];
  const coverage = person.protectionSnapshot.coverages.find(item => item.key === state.protectionCategory);
  return { ...fixture, category:coverage?.label || 'Existing cover', source, provenance:source === 'Customer-uploaded' ? 'Customer-provided document · illustrative extraction' : 'Details entered by customer', consent:'Session-only demonstrator consent', confirmationStatus:'Pending customer review', capturedAt:'28 Oct 2026 · illustrative session' };
}
function policySummaryRows(record) {
  return [['Insurer',record.insurer],['Policy name',record.policyName],['Policy type',record.policyType],['Policyholder / insured',record.insured],['Country of issue',record.countryOfIssue],['Coverage territory',record.territory],['Sum insured / benefit limit',record.benefit],['Emergency overseas treatment',record.emergency],['Planned overseas treatment',record.planned],['Dependants covered',record.dependants],['Expiry / renewal',record.renewal],['Important exclusions',record.exclusions],['Source',record.source],['Provenance',record.provenance],['Consent',record.consent],['Confirmation status',record.confirmationStatus],['Captured',record.capturedAt]];
}
function interpretationRows() {
  if (currentPersona === 'alex') return [
    ['Life benefit while overseas','likely','Likely included','Worldwide wording appears to support this, subject to the full policy terms.'],
    ['Family living in another country','unclear','Unclear / check required','The beneficiary wording does not clearly explain every cross-border circumstance.'],
    ['Territorial exclusions','not-identified','Not identified','No specific exclusion for the selected country was identified in the illustrative summary.'],
    ['Changes to residence or work','review','Review required','A change in residence, occupation or family circumstances should be checked with the insurer.']
  ];
  if (currentPersona === 'sarah') return [
    ['Emergency overseas treatment','likely','Likely included','Policy wording appears to support emergency treatment in the selected country, subject to limits.'],
    ['Routine / planned treatment in UK','unclear','Unclear / check required','The policy wording does not clearly confirm planned treatment in the UK.'],
    ['Long-term residency / student healthcare','not-identified','Not identified','The uploaded policy does not appear to contain this coverage.'],
    ['Dependants overseas','review','Review required','Dependant eligibility and duration abroad need confirmation with the insurer.']
  ];
  return [
    ['Emergency overseas treatment','likely','Likely included','Policy wording appears to support emergency treatment, subject to limits.'],
    ['Planned treatment overseas','unclear','Unclear / check required','The wording does not clearly confirm planned treatment outside Singapore.'],
    ['Long-term residency healthcare','not-identified','Not identified','No long-term overseas residency benefit was identified.'],
    ['Extended stays and eligibility','review','Review required','Duration abroad and residency requirements should be confirmed.']
  ];
}
function policyFlowDialog() {
  const record = state.policyDraft || createPolicyRecord();
  const shell = (eyebrow,title,copy,body) => `<div class="protection-dialog" data-action="protection-backdrop"><section class="protection-dialog-card policy-flow-card" role="dialog" aria-modal="true" aria-labelledby="protection-dialog-title"><button class="protection-dialog-close" type="button" data-action="protection-close" aria-label="Close policy flow">×</button><span class="protection-eyebrow">${eyebrow}</span><h2 id="protection-dialog-title">${title}</h2>${copy ? `<p class="protection-dialog-copy">${copy}</p>` : ''}${body}</section></div>`;
  if (state.policyFlow === 'add') return shell('Complete your protection picture','Add your existing cover','Help us complete your protection picture. You can add a policy you already hold with another insurer or in another country.',`<div class="policy-entry-actions"><button class="policy-primary" data-action="policy-upload">Upload policy</button><button class="policy-secondary" data-action="policy-manual">Enter details manually</button><button class="policy-tertiary" data-action="policy-later">Do this later</button></div><p class="policy-privacy">Nothing is sent or stored in this static prototype.</p>`);
  if (state.policyFlow === 'upload') return shell('Customer-provided policy','Upload your policy document','Upload an existing policy to help us summarise the cover shown in this prototype.',`<label class="policy-dropzone"><span class="policy-upload-icon" aria-hidden="true">↑</span><strong>Choose a PDF, JPG or PNG</strong><small>Prototype limit: 10 MB</small><input class="policy-file-input" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" /></label>${state.policyUploadError ? `<p class="policy-error" role="alert">${state.policyUploadError}</p>` : ''}<button class="policy-primary full" data-action="policy-sample-upload">Use illustrative sample policy</button><button class="policy-tertiary full" data-action="policy-back-add">Back</button><p class="policy-disclaimer">Document extraction is simulated using synthetic fixtures. No production AI or document service is connected.</p>`);
  if (state.policyFlow === 'manual') return shell('Customer-entered details','Enter policy details','Add what you know. You can review everything before it is added to your protection picture.',`<div class="policy-form"><label>Insurer<input data-policy-field="insurer" value="${escapeHtml(record.insurer)}" /></label><label>Policy name<input data-policy-field="policyName" value="${escapeHtml(record.policyName)}" /></label><label>Policy type<input data-policy-field="policyType" value="${escapeHtml(record.policyType)}" /></label><label>Sum insured / benefit limit<input data-policy-field="benefit" value="${escapeHtml(record.benefit)}" /></label><label>Country of issue<select data-policy-field="countryOfIssue">${coverageCountries.map(country => `<option${country === record.countryOfIssue ? ' selected':''}>${country}</option>`).join('')}</select></label></div><button class="policy-primary full" data-action="policy-manual-summary">Review details</button><button class="policy-tertiary full" data-action="policy-back-add">Back</button>`);
  if (state.policyFlow === 'summary') return shell('Illustrative policy summary','Here’s what we found. Please check that this looks right.','This summary is generated from synthetic policy data for the prototype. It is not verified bank information.',`${state.policyFileName ? `<p class="policy-file-name"><strong>Document:</strong> ${escapeHtml(state.policyFileName)}</p>` : ''}<dl class="policy-summary">${policySummaryRows(record).map(([label,value]) => `<div><dt>${label}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</dl>${state.documentPreview ? `<div class="document-preview" role="status"><strong>Original document preview</strong><p>This prototype does not store or render the document. In production, an authorised secure viewer would open the customer-provided file.</p></div>` : ''}<div class="policy-summary-actions"><button class="policy-primary" data-action="policy-confirm">Looks right</button><button class="policy-secondary" data-action="policy-edit">Edit details</button><button class="policy-tertiary" data-action="policy-original">View original document</button><button class="policy-tertiary" data-action="policy-missing">Something is missing</button></div><p class="policy-disclaimer">This is an illustrative summary to help you understand your policy. Coverage depends on the full policy wording and insurer assessment.</p>`);
  if (state.policyFlow === 'missing') return shell('Keep the record accurate','Tell us what is missing','Add another document or update the details yourself. Nothing changes until you confirm the summary.',`<div class="policy-entry-actions"><button class="policy-primary" data-action="policy-upload">Upload another document</button><button class="policy-secondary" data-action="policy-edit">Edit details</button><button class="policy-tertiary" data-action="policy-back-summary">Back to summary</button></div>`);
  if (state.policyFlow === 'country') return shell('Customer-confirmed external cover','Where do you need this cover to work?','Choose a country to explore what the policy wording appears to support. We will not infer a destination for you.',`<div class="country-grid">${coverageCountries.map(country => `<button class="country-choice${state.selectedCountry === country ? ' selected':''}" data-action="policy-country" data-country="${country}" aria-pressed="${state.selectedCountry === country}">${country}</button>`).join('')}</div><button class="policy-primary full" data-action="policy-interpret"${state.selectedCountry ? '' : ' disabled'}>Review this country</button><button class="policy-tertiary full" data-action="policy-finish">Do this later</button>`);
  if (state.policyFlow === 'coverage') return shell('International context',`What we can understand for ${escapeHtml(state.selectedCountry)}`,'This is a plain-English interpretation of the illustrative summary, not a coverage determination.',`<div class="interpretation-list">${interpretationRows().map(([name,key,label,copy]) => `<article class="interpretation-row"><div><strong>${name}</strong><span class="interpretation-state state-${key}">${label}</span></div><p>${copy}</p></article>`).join('')}</div><section class="check-list"><h3>What you may want to check</h3><ul><li>Emergency treatment limits</li><li>Planned overseas treatment</li><li>Territorial exclusions and residency requirements</li><li>Dependant eligibility and duration abroad</li><li>Evacuation or repatriation where relevant</li></ul></section><div class="policy-ai"><strong>✦ Ask Portfolio Intelligence</strong><div><button data-action="policy-ai" data-question="unclear">Why is this unclear?</button><button data-action="policy-ai" data-question="overseas">Does this still apply if I live overseas?</button><button data-action="policy-ai" data-question="family">What if my family lives abroad?</button><button data-action="policy-ai" data-question="adviser">Questions for an adviser</button></div>${state.policyAiMessage ? `<p role="status">${state.policyAiMessage}</p>` : ''}</div><div class="policy-next-actions"><button class="policy-primary" data-action="policy-adviser">Talk to an adviser</button><button class="policy-secondary" data-action="policy-options">Explore international health options</button><button class="policy-tertiary" data-action="policy-save">Save this review</button><button class="policy-tertiary" data-action="policy-wording">Review policy wording</button><button class="policy-tertiary" data-action="policy-upload">Upload another document</button></div><p class="policy-disclaimer">This is an illustrative summary to help you understand your policy. Coverage depends on the full policy wording and insurer assessment.</p>`);
  const completion = state.policyFlow === 'adviser' ? ['Conversation requested','An SC Wealth Planning specialist can help you prepare questions for the insurer. No product or coverage recommendation has been made.'] : state.policyFlow === 'options' ? ['Areas to explore','You can discuss international medical, student or long-stay health needs after confirming how your existing policy works. This prototype does not rank or recommend a product.'] : ['Review saved for this session','Your illustrative review is available only in this browser session and has not been submitted to SCB or an insurer.'];
  return shell('Next best conversation',completion[0],completion[1],`<button class="policy-primary full" data-action="policy-continue-journey">Continue to Portfolio Intelligence</button><button class="policy-tertiary full" data-action="policy-finish">Return to protection portfolio</button>`);
}
function protectionSnapshot() {
  const snapshot = person.protectionSnapshot;
  const visibleAreas = snapshot.coverages.filter(coverage => coverage.status === 'covered').length;
  const externalAreas = Object.keys(state.confirmedPolicies).length;
  return `<section class="protection-section" aria-labelledby="protection-heading"><div class="protection-section-heading"><div><span class="protection-eyebrow">Insurance &amp; protection</span><h2 id="protection-heading">Protect What Matters Most</h2></div><details class="protection-info"><summary aria-label="About this protection view" aria-controls="protection-info-copy">i</summary><div id="protection-info-copy" class="protection-info-pop" role="note"><strong>About this protection view</strong><p>This view reflects protection visible to SCB, plus external policies you choose to add and confirm.</p><p>It may not include every policy or the latest insurer assessment.</p></div></details></div><p class="protection-intro">${snapshot.supportingText}</p><p class="protection-visible-count">SCB-visible protection in <strong>${visibleAreas} areas</strong>${externalAreas ? ` · <strong>${externalAreas} customer-confirmed external</strong>` : ''}</p>${state.protectionMessage ? `<p class="protection-message" role="status">${state.protectionMessage}</p>` : ''}<div class="protection-grid">${snapshot.coverages.map(coverage => { const status = protectionStatus(coverage); const external = state.confirmedPolicies[coverage.key]; return `<button class="protection-category" type="button" data-action="protection-category" data-category="${coverage.key}" data-status="${status.key}" aria-label="${coverage.label}: ${status.label}">${scIcon(coverage.icon)}<span class="protection-category-label">${coverage.label}</span><span class="protection-status protection-status-${status.key}"><i aria-hidden="true">${status.mark}</i>${status.label}</span>${external ? '<small class="external-policy-note">External policy added</small>' : ''}</button>`; }).join('')}</div><div class="protection-actions"><button class="protection-review" type="button" data-action="protection-review">Review your protection portfolio</button><button class="protection-explore" type="button" data-action="open">Explore insurance solutions</button></div></section>`;
}
function protectionDialog() {
  if (state.policyFlow) return policyFlowDialog();
  if (!state.protectionReview && !state.protectionCategory) return '';
  const snapshot = person.protectionSnapshot;
  const coverage = snapshot.coverages.find(item => item.key === state.protectionCategory);
  const title = state.protectionReview ? 'Review your protection portfolio' : coverage?.label || 'Protection details';
  const detail = !coverage ? '' : state.confirmedPolicies[coverage.key]
    ? 'A customer-confirmed external policy has been added for this area. It remains distinct from protection visible through SCB or its partners.'
    : coverage.status === 'not-visible'
      ? `We don’t currently see protection for ${coverage.label.toLowerCase()} in the information available to us. You may already have cover elsewhere.`
      : coverage.note;
  const reviewRows = snapshot.coverages.map(item => {
    const status = protectionStatus(item);
    return `<article class="protection-review-row">${scIcon(item.icon)}<div><div class="protection-review-title"><strong>${item.label}</strong><span class="protection-status protection-status-${status.key}"><i aria-hidden="true">${status.mark}</i>${status.label}</span></div><p>${item.note}</p></div></article>`;
  }).join('');
  return `<div class="protection-dialog" data-action="protection-backdrop"><section class="protection-dialog-card" role="dialog" aria-modal="true" aria-labelledby="protection-dialog-title"><button class="protection-dialog-close" type="button" data-action="protection-close" aria-label="Close protection details">×</button><span class="protection-eyebrow">Your current protection picture</span><h2 id="protection-dialog-title">${title}</h2>${state.protectionReview ? `<p class="protection-dialog-intro">${snapshot.supportingText}</p><div class="protection-review-list">${reviewRows}</div><button class="protection-explore-area" type="button" data-action="protection-explore-area">Explore these areas</button>` : `<p class="protection-dialog-copy">${detail}</p>${coverage?.status === 'worth-reviewing' ? `<p class="protection-dialog-note">Worth reviewing does not mean you lack protection.</p>` : ''}${coverage?.status === 'not-visible' && !state.confirmedPolicies[coverage.key] ? `<div class="protection-dialog-actions"><button class="protection-confirm" type="button" data-action="protection-confirm" data-category="${coverage.key}">I already have cover</button><button class="protection-explore-area" type="button" data-action="protection-explore-area">Explore this area</button></div>` : state.confirmedPolicies[coverage?.key] ? `<button class="protection-explore-area" type="button" data-action="policy-review-country">Review international context</button>` : `<button class="protection-explore-area" type="button" data-action="protection-explore-area">Explore this area</button>`}`}</section></div>`;
}
function openProtectionDialog(focusSelector) {
  protectionFocusSelector = focusSelector;
  document.querySelector('.protection-info[open]')?.removeAttribute('open');
  render();
  document.querySelector('.protection-dialog-close')?.focus();
}
function closeProtectionDialog() {
  const focusSelector = protectionFocusSelector;
  state.protectionReview = false;
  state.protectionCategory = null;
  state.policyFlow = null;
  state.policyDraft = null;
  state.policyFileName = null;
  state.policyUploadError = null;
  state.selectedCountry = null;
  state.policyAiMessage = null;
  state.documentPreview = false;
  render();
  if (focusSelector) document.querySelector(focusSelector)?.focus();
  protectionFocusSelector = null;
}

function lockScreen() {
  return `<div class="lock-screen"><div class="lock-status"><span>9:41</span><span>▮▮▮ ◔ ▰</span></div><div class="lock-content"><span class="lock-lock">⌁</span><div class="lock-time">9:41</div><div class="lock-date">Monday, 7 September</div>${state.pushVisible ? `<button class="push-card push-arrived" data-action="unlock" aria-label="Open SC Mobile notification"><div class="push-app"><img src="assets/scb/sc-wordmark.png" alt="Standard Chartered" /></div><div class="push-copy"><div><strong>SC Mobile</strong><span>now</span></div><b>${person.title}</b><p>${person.nudge}</p></div></button><p class="tap-hint">Tap notification to open</p>` : ''}</div></div>`;
}

function emailScreen() {
  return `<div class="email-screen"><header class="email-status"><span>9:41</span><span>▮▮▮ ◔ ▰</span></header><div class="email-toolbar"><button>‹</button><b>Inbox</b><span>•••</span></div><article class="email-message"><div class="email-sender"><div class="mail-mark"><img src="assets/scb/sc-wordmark.png" alt="Standard Chartered"/></div><div><b>SC Mobile</b><small>to Alex · now</small></div><button>⌄</button></div><h1>Alex, see how prepared your household may be for an income interruption</h1><p class="email-preheader">See how prepared you may be if life temporarily disrupted your income or plans.</p><div class="email-divider"></div><p>Hi Alex,</p><p>See how prepared you may be if life temporarily disrupted your income or plans. Based on the mortgage, family commitments and protection information currently included in your SC Mobile profile, our illustrative analysis can help you understand the funds that may be available to support your household during an extended interruption.</p><p>Review the factors behind this illustrative view, consider how a disruption could affect your commitments and next steps, and correct any information that is out of date before deciding whether a conversation would be useful.</p><div class="email-callout"><span>Portfolio Intelligence</span><b>Review your illustrative family protection outlook</b><small>See the information used, the potential impact and suitable next actions.</small></div><button class="email-cta" data-action="open">Review my outlook in SC Mobile</button><p class="email-fine">This message is part of an illustrative prototype. It does not contain a recommendation, quote or application outcome.</p></article></div>`;
}

function bankingHome() {
  return `<div class="screen banking-home"><header class="banking-header"><div class="sc-app-status"><span>11:28</span><span>▮▮▮ ◔ ▰</span></div><div class="sc-header-actions"><div></div><div><button class="sc-icon" aria-label="Notifications">♧<i></i></button><button class="sc-icon" aria-label="Messages">▢</button><button class="logout">Logout</button></div></div><h1>Pay &amp; Transfer</h1></header><div class="banking-body"><section class="transfer-panel"><div class="transfer-option">${scIcon('accounts')}<b>Between<br>My Accounts</b></div><div class="transfer-option">${scIcon('paynow')}<b>PayNow</b></div><div class="transfer-option">${scIcon('scan')}<b>Scan<br>&amp; Pay</b></div><div class="transfer-option">${scIcon('transfer')}<b>Local<br>Transfer</b></div><div class="transfer-option">${scIcon('globe')}<b>International<br>Transfer</b></div><div class="transfer-option">${scIcon('card')}<b>Pay All<br>Credit Cards</b></div></section><div class="transfer-pills"><button>${scIcon('bill')}Pay Bills</button><button>${scIcon('person')}Add Payees</button><button>${scIcon('receipt')}EasyBill</button><button data-action="open">${scIcon('insurance')}Insurance</button></div><nav class="transfer-tabs"><button>My Payees</button><button class="selected">Transactions</button><button>Scheduled</button><button>Manage</button></nav><h2>Recent transactions</h2><div class="transaction-list">${transactions.map(transaction => `<article class="transaction-row"><span class="transaction-mark" aria-hidden="true">${transaction.incoming ? '↓' : '↑'}</span><span class="transaction-copy"><strong>${transaction.label}</strong><small>${transaction.detail}</small></span><b class="${transaction.incoming ? 'incoming':''}">${transaction.amount}</b></article>`).join('')}</div></div>${state.notificationVisible ? `<button class="in-app-pop notification-arrived" data-action="open" aria-label="Open new Portfolio Intelligence insight"><span class="notification-logo"><img src="assets/scb/sc-wordmark.png" alt=""/></span><span class="notification-copy"><small>SC Mobile · now</small><b>Portfolio Intelligence</b><strong>As life evolves, it can be useful to revisit how your finances support your future priorities.</strong></span><span class="notification-chevron">›</span></button>` : ''}</div>`;
}

function scIcon(type) { const paths={paynow:'<path d="M8 12h8M12 8l4 4-4 4M16 18H8M12 22l-4-4 4-4"/>',invest:'<path d="M12 4l5 4v12H7V8l5-4Zm0 5v7m-3-4h6"/>',insurance:'<path d="M12 3 19 6v5c0 4.5-2.9 8.1-7 10-4.1-1.9-7-5.5-7-10V6l7-3Zm-3 9 2 2 4-4"/>',insights:'<path d="M9 18h6m-5 3h4M8.5 15.5A6 6 0 1 1 15.5 15.5L14 18h-4l-1.5-2.5Z"/>',refer:'<path d="M8 19V9a2 2 0 0 1 4 0v5m0-3a2 2 0 0 1 4 0v2m0-1a2 2 0 0 1 4 0v5c0 3-2 5-5 5h-3c-2 0-4-1-5-3l-2-4a2 2 0 0 1 3-2l1 1"/>',accounts:'<path d="M7 8h10v12H7zM10 5h7v12M9 12h6"/>',scan:'<path d="M8 4H4v4m12-4h4v4M4 16v4h4m12-4v4h-4M8 12h8"/>',transfer:'<path d="M5 9h12m-3-3 3 3-3 3M19 15H7m3 3-3-3 3-3"/>',globe:'<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2 2 3 5 3 8s-1 6-3 8c-2-2-3-5-3-8s1-6 3-8"/>',card:'<rect x="4" y="7" width="16" height="10" rx="2"/><path d="M4 11h16m-9 3h3"/>',bill:'<path d="M7 4h10v16l-2-1-3 1-3-1-2 1V4Zm3 5h4m-4 3h4"/>',person:'<circle cx="12" cy="8" r="3"/><path d="M5 20c1-4 3-6 7-6s6 2 7 6M18 7v4m-2-2h4"/>',receipt:'<path d="M7 4h10v16l-2-1-3 1-3-1-2 1V4Zm3 5h4m-4 3h4"/>'}; Object.assign(paths,{travel:'<path d="m3 17 18-10-7 13-3-6-8 3Zm8-3 4 1"/>',home:'<path d="m3 10 9-7 9 7M5 9v12h14V9m-9 12v-7h4v7"/>',cyber:'<path d="M12 3 20 6v5c0 5-3 8-8 10-5-2-8-5-8-10V6l8-3Zm-3 9v-2a3 3 0 0 1 6 0v2m-7 0h8v5H8z"/>',life:'<path d="M20.8 8.8c0 5-8.8 11-8.8 11s-8.8-6-8.8-11A4.8 4.8 0 0 1 12 6a4.8 4.8 0 0 1 8.8 2.8Z"/>',health:'<path d="M12 3 20 6v5c0 5-3 8-8 10-5-2-8-5-8-10V6l8-3Zm0 5v8m-4-4h8"/>',family:'<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c.5-4 2.5-6 6-6s5.5 2 6 6m0-4c3.5-.5 5.5 1 6 4"/>',income:'<path d="M4 19V5m0 14h17M8 15l4-4 3 2 5-6m-1 0h-4m4 0v4"/>',critical:'<path d="M20.8 8.8c0 5-8.8 11-8.8 11s-8.8-6-8.8-11A4.8 4.8 0 0 1 12 6a4.8 4.8 0 0 1 8.8 2.8ZM5 12h4l2-3 3 6 2-3h3"/>',care:'<path d="M12 21s-8-4.5-8-11a4.5 4.5 0 0 1 8-2.9A4.5 4.5 0 0 1 20 10c0 6.5-8 11-8 11Zm0-11v6m-3-3h6"/>',legacy:'<path d="M6 3h9l4 4v14H6zM15 3v5h4m-9 4h6m-6 4h6m-6 4h4"/>'}); return `<span class="sc-line-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">${paths[type] || paths.insights}</svg></span>`; }
function quickActions() { return `<div class="quick-actions-row"><button>${scIcon('paynow')}PayNow</button><button>${scIcon('invest')}SC Invest</button><button data-action="open">${scIcon('insurance')}Insurance</button><button data-action="open">${scIcon('insights')}Insights</button><button>${scIcon('refer')}Refer</button></div>`; }

function financialPicture() {
  const externalCount = Object.keys(state.confirmedPolicies).length;
  const rows = financialPictures[currentPersona].map(row => row.label === 'Existing protection' && externalCount ? { ...row, summary:`${externalCount} customer-confirmed external policy added`, detail:'This includes policies visible through SCB or partners and external cover you confirmed in this session. Sources remain clearly distinguished.' } : row);
  return `<section class="financial-picture" aria-labelledby="financial-picture-title"><div class="financial-picture-head"><div><span class="picture-kicker">What SCB currently knows</span><h2 id="financial-picture-title">Your current financial picture</h2></div><span class="picture-status">Illustrative view</span></div><p class="picture-intro">This brings together information visible to SCB and details you have chosen to share. It may not include finances or protection held elsewhere.</p><div class="picture-rows">${rows.map(row => `<details class="picture-row"><summary>${scIcon(row.icon)}<span><strong>${row.label}</strong><small>${row.summary}</small></span><i aria-hidden="true">›</i></summary><p>${row.detail}</p></details>`).join('')}</div><div class="picture-insight">${scIcon('insights')}<p>Based on this picture, there may be value in reviewing <strong>${person.title.toLowerCase()}</strong>. You can validate the assumptions before considering any next step.</p></div></section>`;
}

function portfolioLanding() {
  const response = state.response === 'defer' ? 'Reminder saved for this demonstrator session.' : state.response === 'decline' ? 'This insight is hidden for this demonstrator session.' : null;
  return `<div class="screen sc-home"><header class="sc-header"><div class="sc-app-status"><span>9:41</span><span>▮▮▮ ◔ ▰</span></div><div class="sc-header-actions"><img src="assets/scb/sc-wordmark.png" alt="Standard Chartered"/><div><button class="sc-icon" aria-label="Notifications">♧<i></i></button><button class="sc-icon" aria-label="Messages">▢</button><button class="logout">Logout</button></div></div></header><div class="sc-content"><h1>Portfolio Intelligence</h1><p class="sc-subtitle">A clearer view of what matters to you</p><section class="sc-promo-card"><span class="promo-kicker">SC Mobile insight</span><h2>Make your financial picture work harder for you</h2><p>Explore relevant insights from across your accounts, goals and protection.</p><button data-action="open">Explore insights</button><span class="promo-orb orb-one"></span><span class="promo-orb orb-two"></span></section>${response ? `<div class="sc-state">${response}<button data-action="reset">Reset demo</button></div>` : `<button class="in-app-notification" data-action="open"><span class="insight-dot">✦</span><span><b>New in Portfolio Intelligence</b><small>${person.title} · View your illustrative outlook</small></span><span class="chevron">›</span></button>`}</div></div>`;
}

function assumptions() {
  return `<div class="scenario-controls">${person.fields.map((field,index) => `<article class="scenario-control"><div class="scenario-number">0${index + 1}</div><div class="scenario-copy"><label for="${field.key}">${field.label}</label><small>Adjust to explore the impact on this illustrative view.</small></div><output id="out-${field.key}">${field.prefix || ''}${number(state.values[field.key])}${field.suffix || ''}</output><input id="${field.key}" data-field="${field.key}" type="range" min="${field.min}" max="${field.max}" step="${field.step}" value="${state.values[field.key]}" /><div class="scenario-edit"><span>Set amount</span><div><span>${field.prefix || ''}</span><input data-field="${field.key}" type="number" min="${field.min}" max="${field.max}" step="${field.step}" value="${state.values[field.key]}" aria-label="${field.label}" /><span>${field.suffix || ''}</span></div></div></article>`).join('')}</div>`;
}

function overview() { return `${financialPicture()}<article class="card panel need-panel"><span class="panel-kicker">Why this came up</span><div class="need-evidence"><strong>What this view is based on</strong><div class="signal-list">${person.signals.map(signal => `<div class="signal"><span class="tick" aria-hidden="true">✓</span><span>${signal}</span></div>`).join('')}</div></div><div class="need-check"><strong>Does this reflect your situation?</strong>${state.needConfirmed ? `<p class="need-confirmed" role="status">Thanks. We’ll use this as the starting point for your scenario review.</p>` : `<div class="need-check-actions"><button class="primary" data-action="need-confirm">This reflects my situation</button><button class="secondary" data-action="need-update">I need to update something</button></div>`}<button class="need-later" data-action="defer">Remind me later</button><button class="need-decline" data-action="decline">This isn’t relevant to me</button></div>${state.needConfirmed ? `<button class="primary need-continue" data-action="tab" data-tab="assumptions">Review my scenario</button>` : ''}<button class="need-assistant" data-action="assistant">Ask a question instead</button></article>`; }
function assumptionsPanel() { return `<article class="card panel scenario-panel"><span class="panel-kicker">Your scenario</span><h2>Check the figures behind this need</h2><p>These estimates use simple assumptions. Adjust any value to see the impact; this is not a quote or recommendation.</p><div class="formula"><strong>How this view is calculated</strong><br>${person.formula(state.values)}<br><strong>Illustrative estimate: S$${number(gap())}</strong></div>${assumptions()}<div class="actions"><button class="primary" data-action="tab" data-tab="options">Explore possible next steps</button><button class="secondary" data-action="assistant">Ask about this scenario</button></div></article>`; }
function options() { return `<article class="card panel"><span class="panel-kicker">Ways forward</span><h2>Start with the right conversation</h2><p>These are areas to consider after understanding the need; they are not ranked offers.</p>${person.types.map(item => `<div class="choice"><span class="choice-icon">→</span><div><strong>${item[0]}</strong><small>${item[1]}</small></div></div>`).join('')}</article><article class="card panel products-panel"><h2>Products to explore with an adviser</h2><p>These public SC Singapore product references are illustrative starting points. Terms, suitability and availability require adviser review.</p>${person.products.map((item,index) => `<div class="card product product-card"><div class="product-visual product-visual-${index}">${scIcon(index === 0 ? 'invest' : 'card')}</div><div class="product-body"><span class="badge">${item[2]}</span><h3>${item[0]}</h3><p>${item[1]}</p><button data-action="detail">Explore this option</button></div></div>`).join('')}<div class="actions"><button class="primary" data-action="book">${person.handoff}</button><button class="secondary" data-action="assistant">Ask Portfolio Intelligence</button></div></article>`; }
function assistantPanel() { const opening = `I’m your Portfolio Intelligence guide. Based on the information in this illustrative scenario, we identified a potential S$${number(gap())} ${person.gapLabel(state.values)}. I can explain what contributed to it, show what changes the picture, and help you choose a next step such as exploring options or speaking with an adviser.`; const conversation = [{role:'assistant',text:opening},...state.chat]; const ready = state.chat.some(message => message.role === 'user' && message.text === 'What could I do next?'); return `<section class="assistant-sheet" role="dialog" aria-modal="true" aria-label="Portfolio Intelligence conversation"><div class="assistant-panel"><div class="assistant-head"><div class="assistant-mark">✦</div><div><span>Portfolio Intelligence</span><b>Your optional guide</b></div><button data-action="assistant-close" aria-label="Close assistant">×</button></div><div class="chat-stream">${conversation.map(message => `<div class="chat-bubble ${message.role}">${message.text}</div>`).join('')}</div><div class="assistant-prompts"><button data-action="ask" data-prompt="why">Why did you identify this gap?</button><button data-action="ask" data-prompt="change">Show me what changes the outcome</button><button data-action="ask" data-prompt="next">What could I do next?</button></div>${ready ? `<button class="chat-cta" data-action="chat-continue">See ways forward</button>` : ''}<p>This optional assistant uses demonstrator data and is not financial advice.</p></div></section>`; }
function journey() { const content = state.tab === 'overview' ? overview() : state.tab === 'assumptions' ? assumptionsPanel() : options(); return `<div class="screen"><header class="journey-top"><button class="back" data-action="home" aria-label="Back to home">‹</button><span class="journey-title">Portfolio Intelligence</span><button class="reset" data-action="reset">Reset</button></header><div class="journey"><div class="notice">Illustrative prototype using synthetic customer data. It does not provide a quote, recommendation, underwriting or eligibility outcome.</div><section class="hero"><span class="eyebrow">${person.name}'s possible need</span><h1>${person.needTitle}</h1><p>${person.summary}</p><div class="gap-number"><div class="gap-amount"><b>S$${number(gap())}</b><details class="gap-help"><summary aria-label="Explain this illustrative amount" aria-controls="gap-help-copy">?</summary><div id="gap-help-copy" class="gap-help-copy" role="note">${person.gapHelp}</div></details></div><span>${person.gapLabel(state.values)}<br>based on current assumptions</span></div><button class="hero-assistant" data-action="assistant">✦ Ask Portfolio Intelligence</button></section><nav class="tabs" aria-label="Insight sections"><button class="${state.tab === 'overview' ? 'active':''}" data-action="tab" data-tab="overview">Your outlook</button><button class="${state.tab === 'assumptions' ? 'active':''}" data-action="tab" data-tab="assumptions">Your scenario</button><button class="${state.tab === 'options' ? 'active':''}" data-action="tab" data-tab="options">Ways forward</button></nav>${state.booking ? booking() : content}</div></div>${state.assistant ? assistantPanel() : ''}`; }
function booking() { return `<article class="card booking"><div class="booking-icon">✓</div><span class="eyebrow">Conversation request received</span><h2>We will be in touch to arrange your review</h2><p>An SC Wealth Planning specialist will contact ${person.name} through the preferred channel on file to arrange a conversation about the illustrative scenario. The details explored here will help start that discussion.</p><div class="booking-next"><b>What happens next</b><span>1. We confirm a suitable time</span><span>2. You review your goals with a specialist</span><span>3. Any product discussion follows the required fact-find</span></div><p class="booking-fine">This is a demonstrator confirmation only—no real contact request has been submitted.</p><div class="actions"><button class="primary" data-action="home">Return to SC Mobile</button><button class="quiet" data-action="reset">Reset demo</button></div></article>`; }
function nav() { return `<nav class="bottom-nav rebuilt-nav" aria-label="Primary navigation"><button class="nav-link active" data-action="home"><span>⌂</span>Home</button><button class="nav-link"><span>⇆</span>Pay &amp; Transfer</button><button class="nav-link" data-action="open"><span>▥</span>Invest &amp; Insure</button><button class="nav-link"><span>◌</span>Discover</button><button class="nav-link"><span>▢</span>Services</button></nav>`; }
function render() {
  const homeScrollTop = state.view === 'banking' && lastRenderedView === 'banking' ? app.querySelector('.banking-home')?.scrollTop || 0 : 0;
  if (state.view !== 'banking' && notificationTimer) { clearTimeout(notificationTimer); notificationTimer = null; }
  if (state.view !== 'lock' && pushTimer) { clearTimeout(pushTimer); pushTimer = null; }
  app.innerHTML = (state.view === 'lock' ? lockScreen() : state.view === 'email' ? emailScreen() : state.view === 'banking' ? bankingHome() + nav() : journey() + nav()) + (state.view === 'banking' ? protectionDialog() : '');
  if (state.view === 'banking') {
    const homeScreen = app.querySelector('.banking-home');
    homeScreen?.insertAdjacentHTML('beforeend', protectionSnapshot());
    if (lastRenderedView === 'banking' && homeScreen) homeScreen.scrollTop = homeScrollTop;
  }
  lastRenderedView = state.view;
  if (state.view === 'banking' && !state.notificationVisible && !notificationTimer) { notificationTimer = setTimeout(() => { notificationTimer = null; if (state.view === 'banking' && !state.notificationVisible) { state.notificationVisible = true; render(); } }, 900); }
  if (state.view === 'lock' && !state.pushVisible && !pushTimer) { pushTimer = setTimeout(() => { pushTimer = null; if (state.view === 'lock' && !state.pushVisible) { state.pushVisible = true; render(); } }, 900); }
}

app.addEventListener('click', event => {
  const target = event.target.closest('[data-action]'); if (!target) return;
  const action = target.dataset.action;
  if (action === 'protection-review') { state.protectionReview = true; state.protectionCategory = null; openProtectionDialog('.protection-review'); return; }
  if (action === 'protection-category') { const key = target.dataset.category; state.protectionReview = false; state.protectionCategory = key; openProtectionDialog(`.protection-category[data-category="${key}"]`); return; }
  if (action === 'protection-close' || action === 'protection-backdrop') { if (action === 'protection-backdrop' && event.target !== target) return; closeProtectionDialog(); return; }
  if (action === 'protection-confirm') { state.protectionCategory = target.dataset.category; state.policyFlow = 'add'; state.policyDraft = null; render(); return; }
  if (action === 'policy-upload') { state.policyFlow = 'upload'; state.policyUploadError = null; render(); return; }
  if (action === 'policy-manual') { state.policyDraft = createPolicyRecord('External / consented'); state.policyFlow = 'manual'; render(); return; }
  if (action === 'policy-back-add') { state.policyFlow = 'add'; state.policyUploadError = null; render(); return; }
  if (action === 'policy-sample-upload') { state.policyDraft = createPolicyRecord('Customer-uploaded'); state.policyFileName = 'Illustrative_Policy.pdf'; state.policyFlow = 'summary'; render(); return; }
  if (action === 'policy-manual-summary') { state.policyDraft = state.policyDraft || createPolicyRecord('External / consented'); state.policyFlow = 'summary'; render(); return; }
  if (action === 'policy-edit') { state.policyDraft = state.policyDraft || createPolicyRecord('External / consented'); state.policyFlow = 'manual'; render(); return; }
  if (action === 'policy-original') { state.documentPreview = true; render(); return; }
  if (action === 'policy-missing') { state.policyFlow = 'missing'; render(); return; }
  if (action === 'policy-back-summary') { state.policyFlow = 'summary'; render(); return; }
  if (action === 'policy-confirm') { const record = { ...(state.policyDraft || createPolicyRecord()), confirmationStatus:'Customer confirmed', confirmedAt:'28 Oct 2026 · illustrative session' }; state.policyDraft = record; state.confirmedPolicies[state.protectionCategory] = record; state.protectionMessage = 'External policy added and customer confirmed for this demonstration session.'; state.policyFlow = 'country'; render(); return; }
  if (action === 'policy-country') { state.selectedCountry = target.dataset.country; state.policyAiMessage = null; render(); return; }
  if (action === 'policy-interpret') { if (!state.selectedCountry) return; state.policyFlow = 'coverage'; render(); return; }
  if (action === 'policy-ai') { const replies = { unclear:'The summary does not contain enough specific wording to interpret planned treatment, residency or dependant eligibility safely. Check the full wording or ask the insurer.', overseas:'Worldwide wording may continue to apply, but residence, occupation and duration abroad can change how terms work. Confirm this with the insurer.', family:'Beneficiary and dependant terms are different. The summary cannot confirm every cross-border family circumstance, so check eligibility and claims requirements.', adviser:'Ask about territorial limits, residency rules, dependant eligibility, treatment authorisation, duration abroad and how claims are assessed.' }; state.policyAiMessage = replies[target.dataset.question]; render(); return; }
  if (action === 'policy-adviser' || action === 'policy-options' || action === 'policy-save') { state.policyFlow = action.replace('policy-',''); render(); return; }
  if (action === 'policy-review-country') { state.policyDraft = state.confirmedPolicies[state.protectionCategory]; state.selectedCountry = null; state.policyFlow = 'country'; render(); return; }
  if (action === 'policy-wording') { state.documentPreview = true; state.policyFlow = 'summary'; render(); return; }
  if (action === 'policy-later' || action === 'policy-finish') { closeProtectionDialog(); return; }
  if (action === 'policy-continue-journey') { state.policyFlow = null; state.protectionCategory = null; state.selectedCountry = null; state.policyAiMessage = null; route('journey'); return; }
  if (action === 'protection-explore-area') { state.protectionReview = false; state.protectionCategory = null; protectionFocusSelector = null; route('journey'); return; }
  if (action === 'open') route('journey');
  if (action === 'unlock') { route('journey'); }
  if (action === 'home') { state.view = 'banking'; state.booking = false; render(); }
  if (action === 'tab') { state.tab = target.dataset.tab; state.booking = false; state.assistant = false; render(); }
  if (action === 'need-confirm') {
    state.needConfirmed = true;
    render();
    const screen = app.querySelector('.screen');
    const nextStep = app.querySelector('.need-continue');
    nextStep?.scrollIntoView({ block:'nearest' });
    if (screen && nextStep) {
      const navTop = app.querySelector('.bottom-nav')?.getBoundingClientRect().top ?? screen.getBoundingClientRect().bottom;
      const covered = nextStep.getBoundingClientRect().bottom - navTop + 12;
      if (covered > 0) screen.scrollTop += covered;
    }
  }
  if (action === 'need-update') { state.tab = 'assumptions'; state.needConfirmed = false; render(); }
  if (action === 'defer' || action === 'decline') { state.response = action; state.view = 'home'; render(); }
  if (action === 'reset') { resetDemo(); return; }
  if (action === 'book') { state.booking = true; render(); }
  if (action === 'assistant') { state.assistant = true; render(); }
  if (action === 'assistant-close') { state.assistant = false; render(); }
  if (action === 'chat-continue') { state.assistant = false; state.tab = 'options'; render(); }
  if (action === 'ask') { const prompts = { why:'Why did you identify this gap?', change:'Show me what changes the outcome', next:'What could I do next?' }; const replies = { why: `We identified this as a potential gap because ${person.signals[0].toLowerCase()} ${person.signals[1]} The result is illustrative and you can review every input in “Your outlook”.`, change: `The largest drivers are shown in “Your scenario”. Try adjusting one card at a time—the illustrative gap refreshes immediately so you can see what makes the greatest difference.`, next: `There are three appropriate next steps: explore the solution areas, review the public product references with an adviser, or request a conversation with an SC Wealth Planning specialist. You remain in control.` }; state.chat.push({role:'user',text:prompts[target.dataset.prompt]},{role:'assistant',text:replies[target.dataset.prompt]}); state.assistant = true; render(); }
  if (action === 'detail') { state.tab = 'options'; alert('Demonstration only: product terms, suitability, availability and any application would be confirmed with an authorised adviser.'); }
});
document.querySelector('.demo-reset')?.addEventListener('click', resetDemo);
app.addEventListener('change', event => { if (!event.target.matches('.policy-file-input')) return; const file = event.target.files?.[0]; if (!file) return; const supported = /\.(pdf|jpe?g|png)$/i.test(file.name) || ['application/pdf','image/jpeg','image/png'].includes(file.type); if (!supported || file.size > 10 * 1024 * 1024) { state.policyUploadError = 'Choose a PDF, JPG or PNG up to 10 MB.'; render(); return; } state.policyDraft = createPolicyRecord('Customer-uploaded'); state.policyFileName = file.name; state.policyUploadError = null; state.policyFlow = 'summary'; render(); });
app.addEventListener('input', event => { const policyKey = event.target.dataset.policyField; if (policyKey) { state.policyDraft = state.policyDraft || createPolicyRecord('External / consented'); state.policyDraft[policyKey] = event.target.value; return; } const key = event.target.dataset.field; if (!key || event.target.value === '') return; const field = person.fields.find(item => item.key === key); state.values[key] = Math.max(field.min, Math.min(field.max, Number(event.target.value))); state.customValues = true; document.querySelectorAll(`[data-field="${key}"]`).forEach(input => { if (input !== event.target) input.value = state.values[key]; }); const out = document.querySelector(`#out-${key}`); if(out) out.textContent = `${field.prefix || ''}${number(state.values[key])}${field.suffix || ''}`; const formula = event.target.closest('.panel')?.querySelector('.formula'); if(formula) formula.innerHTML = `<strong>Calculation:</strong><br>${person.formula(state.values)}<br><strong>Illustrative gap: S$${number(gap())}</strong>`; const heroNumber = document.querySelector('.gap-number b'); if(heroNumber) heroNumber.textContent = `S$${number(gap())}`; });
render();
