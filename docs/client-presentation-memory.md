# Client presentation memory

## Source

- Deck: `Presentation for the client/Customer Journey Prototype for SCB (2).pptx`
- Cover title: **Bancassurance Customer Journey Prototype for Standard Chartered**
- Cover date: October 2026
- Reviewed: 4 November 2026

This file records the presentation's client narrative, assumptions and follow-up context for future work on the prototype and APAC insurance-partner discussions. It does not replace the deck.

## Core narrative

The client idea is a proactive, needs-led engagement capability using financial, behavioural and contextual data. The proposed journey is:

1. Build a holistic client view from bank-held, partner, declared and permitted external data.
2. Detect a potential need or life event from client signals.
3. Assess the need and select an appropriate next action, including no action, education or advice.
4. Start a timely, contextual conversation through digital or a relationship manager.
5. Enable a useful outcome and learn from customer responses.

The prototype is intended to make this idea tangible through three illustrative personas: Simon (55, approaching retirement), Alex (35, established income earner with family commitments) and Sarah (30, expecting a new dependant). It is a concept for feedback, not a live decisioning capability or a validated recommendation.

The `Prototype screenshots/Vision_Gautam.png` reference frames the central client need: an Alex family-protection outlook informed by mortgage, family commitments, existing protection, and savings/investments. The proposition should therefore be told as a holistic household/financial picture that puts insurance in context. A policy inventory alone is too narrow; the customer should be able to understand the commitments, resources and cover behind a possible review conversation.

## Proposition assessment

The proposition is strongest as a customer-service capability: a timely prompt, clear evidence, customer correction and choice, followed by a relevant self-service or adviser path. Its central control is to treat a detected need as a hypothesis, not a coverage conclusion or product recommendation.

The main gaps to resolve are (1) verified event and data access, freshness and customer/household matching; (2) who owns the decision rules, no-action/suppression policy and customer contact limits; (3) SCB–insurer handoff, service levels, case outcomes and commercial value exchange; and (4) an evaluation design covering customer usefulness, trust, service completion and risk before claiming commercial uplift. The current prototype's data, calculations, assistant and response loop are illustrative/session-only, so it demonstrates an experience rather than technical or commercial feasibility.

The insurance portfolio is the proposition's foundation. The first increment should establish which policy records are visible, from which sources, and how current and complete they are. A mortgage milestone can later be one way to bring a customer back to the portfolio; it is not the proposition itself. Keep early review prompts transparent and customer-validated, without treating incomplete policy data as a coverage gap.

## Narrative embedded in the prototype

The presenter control **How the journey works** in the v1.1 demo bar now maps the five strategy stages to the experience: financial picture, potential need, customer validation, digital/adviser next steps, and learning from outcomes. The fifth stage is explicitly marked future-state because the demonstrator keeps responses in-session and does not have a persistent learning loop. This keeps the strategy narrative available to presenters without adding another section to the customer journey.

## Data and architecture path to a pilot

The presenter control **What is needed next?** frames a target flow: source systems → governed client context → need decision → SC Mobile/RM activation → measured outcomes. It is a discovery hypothesis; SCB platform choices, data access, ownership and approvals remain to be confirmed.

The feasibility work should establish:

- One pilot moment, business owner, customer group and customer outcome.
- Source inventory with owners, fields, stable person/household identifiers, lineage, freshness, completeness and match quality.
- Permitted purpose, consent, insurer/partner sharing, retention and customer correction, reviewed with the relevant SCB control owners.
- A governed context record that carries source, timestamp and confidence, plus explainable decision rules, reason codes, no-action routes and contact limits.
- The customer/adviser channel handoff and response/outcome events, with customer, service and risk measures.

Ask the Data team to help scope a short feasibility discovery: identify policy data owners, map available SCB and partner records, confirm access and permitted use, and agree a safe profiling approach. Start with portfolio data mapping and transparent status rules; assess machine learning after reliable policy and customer-outcome data exists.

### Candidate incremental use cases

1. **Establish the portfolio inventory:** map in-scope SCB and partner-held policies, source systems, owners, policy fields and data quality; prove a useful visibility baseline.
2. **Complete the picture with the customer:** support consented, customer-confirmed external policies and corrections; prove broader coverage of the portfolio without unsupported assumptions.
3. **Explain a review area:** use transparent rules and customer context to identify a question worth discussing; prove relevance, comprehension and trust.
4. **Connect the service loop:** enable a consented adviser handoff and capture review status and customer outcomes; prove operational usefulness.
5. **Expand sources and decisioning:** add governed feeds and evaluate more advanced models only after policy data and outcome labels are reliable.

A mortgage milestone check-in remains a possible use case once the portfolio and data foundation are understood. Validate the event source, permissions, freshness, customer matching, channel owner and adviser capacity before choosing it as the first live moment.

The value is a set of hypotheses to test: timely customer help, better first-party context, completed adviser reviews and reusable decisioning/channel components. Do not present any revenue or engagement uplift as achieved until a measured pilot supports it.

## Rebuilt client presentation

The HTML presentation was rebuilt around a holistic household protection outlook, rather than a policy list or mortgage-triggered pilot. Its story is: why mortgage, family, savings and protection belong in one view; what a holistic outlook means; what the prototype demonstrates today; how the view supports a customer-chosen conversation; how it applies to different life moments; what a narrow first increment can prove; and what the Data team should help validate next.

The prototype currently demonstrates a **category-level snapshot** with “Covered,” “Not visible” and “Worth reviewing” states, customer confirmation and an external-policy entry journey. It is not yet a complete policy-level portfolio: records and calculations are synthetic, uploads use a fixture rather than document extraction, and changes are not persisted. The presentation makes these limits explicit while showing the direction of travel.

The immediate ask is a focused data discovery to define a first household/protection view, identify SCB and partner sources and owners, confirm permissions and data quality, and agree a safe sample/profiling route. First-increment measures include permitted record access; customer/policy match quality; field completeness, freshness, duplicates and conflicts; and whether reviewers understand source/date labels and the distinction between “not visible” and “no cover.” The learning should determine which sources and fields are reliable, what customers need to provide, and what to build next. Set thresholds after profiling; do not promise universal policy coverage, a true coverage gap or sales uplift from this increment.

## Slide map

| Slides | Content | Context to retain |
| --- | --- | --- |
| 1–3 | Cover, agenda and objectives | Continue alignment on the client's “customers like you” idea; show an illustrative future journey and collect feedback. |
| 4 | Outside-in view of SCB digital engagement | Frames current-state observations across client view, need detection, next action, conversation, and learning. These are external observations, not confirmation of SCB's internal capabilities. |
| 5 | Leading-practice and market examples | Positions connected data, AI/ML decisioning, contextual conversations and feedback loops. The slide contains large bank metrics and footnote markers; recheck every number and source before client circulation. Speaker notes contain source links/details. |
| 6 | Prototype demo divider | Introduces the SC Mobile protection insight demonstrator and the three archetypes. |
| 7 | Data availability model | Separates information likely available within SCB, information that may need inference or customer input, and potential external/ecosystem sources. Need identification is modelled and must be validated by the customer or adviser. |
| 8 | Singapore external-data peers | Cites UOB/TMRW, DBS/digiWealth and OCBC/OneView as examples of financial-data aggregation. Check current product names, scope and availability before external use. |
| 9 | Next steps | Capture SCB feedback and align focus, participants and timing. |
| 10 | Capco credentials | Insurance and wealth capabilities, practice metrics, partnerships and thought leadership. This reads as a credentials appendix after the next-steps slide. |
| 11–12 | Blank | Both slides contain no visible slide content and should be removed or populated before presenting. |
| 13 | Persona detail | Financial goals, triggers, potential protection gaps and in-app advisory moments for Simon, Alex and Sarah. These are illustrative hypotheses, not assessed customer facts. |
| 14 | Concept summary | Four principles: translate data into insight; identify a need before a product; explain why and why now; use customer actions to improve what happens next. |

## Client discussion context

- The client previously raised a “customers like you” idea and proactive engagement using data intelligence.
- The presentation proposes combining financial, behavioural and contextual signals to support timely guidance, risk identification, financial education and engagement.
- The prototype and data slides make an important distinction between what SCB may already hold and what could require customer-declared, partner, consent-based or inferred data.
- Customer validation is a core control: a modelled need should be presented as a possibility, with its evidence and assumptions open to review.
- The next-step discussion should establish the focus use case, participants and timing, then clarify data availability, ownership, quality, consent and partner dependencies.

## Review notes to carry forward

- The slide order is uneven: the deck reaches “Next Steps” on slide 9, then places Capco credentials, two blank slides, persona detail and a concept summary after it. Consider moving persona and concept slides ahead of the demo, moving credentials to the appendix, and ending with specific next steps.
- Slide 2 lists four agenda topics, while the detailed story places the market view, prototype, data and persona content in a different sequence. Align the agenda with the final slide order.
- Slide 3 says “to personalized the experiences”; correct the grammar to “to personalise the experience” or “to personalise experiences.” Keep spelling consistent for the intended client audience.
- Slide 4's statements about SCB being product-led and limited evidence of proactive need detection are outside-in observations. Qualify them as observations from the external client experience and avoid implying access to internal decisioning.
- Slide 5's comparative metrics and slide 8's peer examples need current primary-source validation and clear citations on the slides. Avoid presenting peer operating metrics as directly comparable without definitions and dates.
- Slide 7 should preserve its availability distinctions. “Potentially available” or “likely available” is not confirmation of actual access, permitted purpose, data quality or consent.
- Slide 8 speaker notes contain rough internal workstream fragments (for example, Customer 360, data products, metadata/context layer and data catalogue), plus spelling errors and incomplete phrases. Clean or remove these notes before sharing the deck.
- Slides 11–12 are empty slides in the presentation sequence; remove them before the client walkthrough.
- The persona protection gaps on slide 13 are hypotheses. In the prototype, the dollar estimates are synthetic and formula-based. Keep this distinction explicit in the meeting and avoid implying a real customer recommendation or coverage assessment.
- The Capco credentials on slide 10 include practice statistics. Confirm that the figures and thought-leadership references remain approved and current before circulation.

## Suggested client-facing close

Use the closing discussion to agree one candidate use case, the minimum data needed to assess feasibility, the SCB and partner owners, the validation and governance questions, and a date for a data-readiness review. Do not frame the prototype numbers as pilot performance or evidence of commercial impact.
