// ─── SECTOR CONFIG ────────────────────────────────────────────────────────────
const SECTORS = {
  engineering: {
    name: 'Precision & Engineering',
    volumes: ['batch','lowvol','oneoff'],
    benchmarks: {
      quality: 'First Pass Yield — world class: 97%+, typical SME: 75–85%',
      efficiency: 'OEE — world class: 85%, typical: 60–70%',
      keyRisk: 'Scrap on expensive materials (steel, titanium, aluminium) is the dominant hidden cost.'
    },
    matLabel: 'Raw material cost (% of revenue)',
    matHint: 'Machined/fabricated materials are high value. If unsure, 40% is a reasonable estimate for machining operations.',
    matPlaceholder: '40',
    machineLabel: 'Machine running cost (energy, tooling, coolant)',
    machineHint: 'CNC running costs vary widely. £25–£60/hr is typical depending on machine type.',
    machinePlaceholder: '35',
    methodNote: 'For precision engineering, defect costs include the full material value of scrapped parts plus all labour operations performed up to the point of rejection — not just the final operation. Scrap on high-value materials (titanium, specialist alloys) is the dominant cost driver. Setup time is calculated against your machine rate, reflecting the true cost of prove-out on short-run work.',
    questions: [
      { id:'defects', label:'How often do parts or assemblies fail inspection or have to be scrapped?', hint:'First-offs, in-process rejects, final inspection failures. As a percentage of parts started.', benchmark:'World-class First Pass Yield is 97%+. Below 90% is a concern for machining operations.', prefix:'', suffix:'% of parts', placeholder:'3', calc:(v,ctx) => v>0 ? (v/100)*ctx.revenue*ctx.matPct*0.9 + (v/100)*ctx.annualLabour*0.35 : 0 },
      { id:'rework', label:'How many hours per week does your team spend on rework, correction, or re-machining?', hint:'Going back over jobs, correcting dimensions, re-finishing. Include all staff involved.', benchmark:'', prefix:'', suffix:'hrs/wk', placeholder:'8', calc:(v,ctx) => v*ctx.hourly*52 },
      { id:'downtime', label:'How many hours per week do machines sit idle due to breakdowns or faults?', hint:'Unplanned stoppages only — not scheduled maintenance or tool changes. Across all equipment.', benchmark:'', prefix:'', suffix:'hrs/wk', placeholder:'5', calc:(v,ctx) => v*(ctx.hourly*Math.max(ctx.employees*0.2,1) + ctx.machineRate)*52 },
      { id:'changeover', label:'How long does setup and prove-out take for a new job?', hint:'From finishing the previous job to running good parts on the next. Include program loading, tooling, first-off approval wait time.', benchmark:'Setup above 30% of total job time is a red flag for short-run work.', dual:true, timeLabel:'Average setup time', countLabel:'New jobs per week', timePlaceholder:'60', countPlaceholder:'8', calc:(v,ctx) => (v.time/60)*v.count*(ctx.hourly*Math.max(ctx.employees*0.15,1)+ctx.machineRate)*52 },
      { id:'waiting', label:'How much time do your machinists or operators spend waiting — for materials, drawings, decisions, or the previous operation?', hint:'Queue time between operations, waiting for inspection sign-off, waiting for tooling. Average per person per day.', benchmark:'', prefix:'', suffix:'mins/person/day', placeholder:'25', calc:(v,ctx) => (v/60)*ctx.hourly*ctx.employees*250 },
      { id:'inventory', label:'What is the value of raw material and bought-in stock you are currently holding?', hint:'Bar stock, sheet, castings, bought-out components waiting to be machined. Approximate total value.', benchmark:'', prefix:'£', suffix:'', placeholder:'80000', calc:(v,ctx) => v*0.25 },
      { id:'unnecessary', label:'How much time per person goes on admin, estimating rework, or non-productive tasks?', hint:'Re-quoting jobs that have changed, chasing purchase orders, paperwork that duplicates what is already in the ERP. Per person per day.', benchmark:'', prefix:'', suffix:'mins/person/day', placeholder:'20', calc:(v,ctx) => (v/60)*ctx.hourly*ctx.employees*250 }
    ]
  },

  food: {
    name: 'Food Manufacturing',
    volumes: ['highvol','batch'],
    benchmarks: {
      quality: 'Yield rate — world class: 98%+, typical SME: 90–95% of raw material converted to saleable product',
      efficiency: 'OEE — world class: 85%, food industry typical: 55–65%',
      keyRisk: 'In food manufacturing, waste reduction is a bigger margin lever than speed increase. A 2% yield improvement goes straight to profit.'
    },
    matLabel: 'Raw ingredient cost (% of revenue)',
    matHint: 'Food raw material costs are typically 35–55% of revenue for SME producers. Specialty ingredients push this higher.',
    matPlaceholder: '45',
    machineLabel: 'Line/equipment running cost',
    machineHint: 'Energy, CIP chemicals, packaging material running through the line. £10–£30/hr depending on line complexity.',
    machinePlaceholder: '18',
    methodNote: 'For food manufacturing, yield loss is calculated against raw material cost because food waste is both an ingredient loss and a compliance/disposal cost. Allergen changeover costs hit all three OEE dimensions simultaneously: stopped time, startup rejects, and slow ramp-up. Compliance paperwork time is calculated as direct labour cost with no production output offset.',
    questions: [
      { id:'defects', label:'What percentage of raw ingredients or finished product is wasted or rejected during production?', hint:'Yield loss during processing, products failing weight/quality checks, returns from customers. As a percentage of raw material going in.', benchmark:'Yield below 95% signals significant raw material waste. Every 1% improvement goes directly to margin.', prefix:'', suffix:'% yield loss', placeholder:'4', calc:(v,ctx) => ctx.revenue>0 ? (v/100)*ctx.revenue*ctx.matPct + (v/100)*ctx.annualLabour*0.2 : (v/100)*ctx.annualLabour*0.5 },
      { id:'rework', label:'How many hours per week does your team spend on rework, sorting, or reprocessing product?', hint:'Downgrading product, blending off-spec batches, re-packaging, manual sorting of rejects.', benchmark:'', prefix:'', suffix:'hrs/wk', placeholder:'10', calc:(v,ctx) => v*ctx.hourly*52 },
      { id:'downtime', label:'How many hours per week does your production line or equipment stop unexpectedly?', hint:'Unplanned stoppages, equipment failures, jams. Not including planned CIP, scheduled maintenance, or planned changeovers.', benchmark:'Downtime on a food line stops the whole flow — labour cost continues while output stops.', prefix:'', suffix:'hrs/wk', placeholder:'6', calc:(v,ctx) => v*(ctx.hourly*Math.max(ctx.employees*0.3,1)+ctx.machineRate)*52 },
      { id:'changeover', label:'How long does a product or allergen changeover take on your line?', hint:'Time from last good product on the previous run to first good product on the next. Include CIP, line clearing, allergen checks, and startup rejects.', benchmark:'Allergen changeovers hit availability, quality, and performance simultaneously. Sub-15 minutes is the target on packaging lines.', dual:true, timeLabel:'Average changeover time', countLabel:'Changeovers per week', timePlaceholder:'45', countPlaceholder:'5', calc:(v,ctx) => (v.time/60)*v.count*(ctx.hourly*Math.max(ctx.employees*0.4,1)+ctx.machineRate)*52 },
      { id:'waiting', label:'How much time do your line workers spend waiting — for materials, batch paperwork, or the previous step to complete?', hint:'Queue time between production stages, waiting for QC release, waiting for materials to arrive at line.', benchmark:'', prefix:'', suffix:'mins/person/day', placeholder:'20', calc:(v,ctx) => (v/60)*ctx.hourly*ctx.employees*250 },
      { id:'inventory', label:'What is the value of raw ingredients and packaging materials you are currently holding?', hint:'Ingredients in cold store, ambient warehouse, packaging materials. Include any product close to or past best-before date.', benchmark:'', prefix:'£', suffix:'', placeholder:'60000', calc:(v,ctx) => v*0.3 },
      { id:'unnecessary', label:'How much time per person goes on compliance paperwork, HACCP records, and documentation that is not directly productive?', hint:'Time completing food safety records, allergen logs, traceability paperwork. Not the value of compliance itself — just the time cost above the minimum required.', benchmark:'', prefix:'', suffix:'mins/person/day', placeholder:'25', calc:(v,ctx) => (v/60)*ctx.hourly*ctx.employees*250 }
    ]
  },

  automotive: {
    name: 'Automotive Supply',
    volumes: ['highvol','batch','lowvol'],
    benchmarks: {
      quality: 'PPM defect rate — world class: <10 PPM, industry average: ~75 PPM. Customer scorecards penalise above 50 PPM.',
      efficiency: 'OTIF — world class: 99%+. Below 98% triggers customer scorecard action on most OEM programmes.',
      keyRisk: 'A quality failure in automotive can be existential. One warranty escalation can cost more than a year\'s profit.'
    },
    matLabel: 'Component and raw material cost (% of revenue)',
    matHint: 'Automotive sub-contract typically 40–60% material cost depending on the process.',
    matPlaceholder: '50',
    machineLabel: 'Machine/press running cost',
    machineHint: 'Include tooling wear, energy, coolant. Presses and CNC: typically £20–£60/hr.',
    machinePlaceholder: '40',
    methodNote: 'For automotive suppliers, defect costs are calculated conservatively — internal scrap only. Real-world costs are higher because customer-detected defects trigger warranty claims, containment costs, and scorecard penalties that can far exceed the direct part cost. IATF compliance and controlled shipping costs are captured in the unnecessary tasks category.',
    questions: [
      { id:'defects', label:'What is your current internal defect or scrap rate?', hint:'Parts scrapped in-process or at final inspection, before they leave your site. As a percentage of parts started. If you know your PPM, divide by 10,000 to get percentage.', benchmark:'Industry average is ~75 PPM (0.0075%). World class is <10 PPM. Above 100 PPM triggers most customer scorecard action.', prefix:'', suffix:'% scrap rate', placeholder:'0.5', calc:(v,ctx) => (v/100)*ctx.revenue*ctx.matPct + (v/100)*ctx.annualLabour*0.4 },
      { id:'rework', label:'How many hours per week does your team spend reworking, re-inspecting, or sorting components?', hint:'Any operation done twice. Include first-off sorting, 100% inspection driven by quality issues, rework stations.', benchmark:'', prefix:'', suffix:'hrs/wk', placeholder:'12', calc:(v,ctx) => v*ctx.hourly*52 + v*ctx.machineRate*0.3*52 },
      { id:'downtime', label:'How many hours per week do machines or presses sit idle due to unplanned breakdowns?', hint:'Unplanned only — not scheduled maintenance, tool changes, or planned production stops.', benchmark:'', prefix:'', suffix:'hrs/wk', placeholder:'4', calc:(v,ctx) => v*(ctx.hourly*Math.max(ctx.employees*0.25,1)+ctx.machineRate)*52 },
      { id:'changeover', label:'How long does a tool change or product changeover take on your main machines?', hint:'From last good part on the previous job to first approved part on the next. Include first-off approval wait time from quality.', benchmark:'First-off approval wait time is often the hidden cost — tool is set up but line cannot run.', dual:true, timeLabel:'Average changeover time', countLabel:'Changeovers per week', timePlaceholder:'90', countPlaceholder:'6', calc:(v,ctx) => (v.time/60)*v.count*(ctx.hourly*Math.max(ctx.employees*0.2,1)+ctx.machineRate)*52 },
      { id:'waiting', label:'How much time do operators spend waiting — for materials, first-off sign-off, gauge availability, or the previous operation?', hint:'Queue time between operations, waiting for QA sign-off on first-offs, waiting for programming or tooling.', benchmark:'', prefix:'', suffix:'mins/person/day', placeholder:'30', calc:(v,ctx) => (v/60)*ctx.hourly*ctx.employees*250 },
      { id:'inventory', label:'What is the value of raw material, WIP, and bought-in components you are currently holding?', hint:'Include all material on site — raw bar/billet, castings, WIP between operations, bought-out components.', benchmark:'', prefix:'£', suffix:'', placeholder:'120000', calc:(v,ctx) => v*0.25 },
      { id:'unnecessary', label:'How much time per person goes on IATF documentation, PPAP, controlled shipping, or audit preparation beyond normal quality checks?', hint:'Time on customer portal updates, APQP documentation, controlled shipping administration, corrective action reports. Per person per day average.', benchmark:'IATF compliance costs typically 3–7% of turnover for automotive SMEs.', prefix:'', suffix:'mins/person/day', placeholder:'30', calc:(v,ctx) => (v/60)*ctx.hourly*ctx.employees*250 }
    ]
  },

  print: {
    name: 'Print & Packaging',
    volumes: ['highvol','batch','lowvol'],
    benchmarks: {
      quality: 'Production yield — world class: 98%+. Below 95% is significant loss. Target: zero customer rejects.',
      efficiency: 'OEE on press/converting — target 75–85%. Makeready waste is the single biggest material cost lever.',
      keyRisk: 'Material cost is 50–70% of total cost. Every 1% improvement in yield is material to the bottom line.'
    },
    matLabel: 'Substrate and ink cost (% of revenue)',
    matHint: 'Substrate (paper, board, film) and ink/consumables. Typically 45–65% of revenue for print operations.',
    matPlaceholder: '55',
    machineLabel: 'Press/converting line running cost',
    machineHint: 'Energy, rollers, blankets, plates amortised per hour. Typically £15–£50/hr depending on press type.',
    machinePlaceholder: '30',
    methodNote: 'For print and packaging, makeready waste is calculated against your full material cost because substrate consumed during setup generates no revenue. The calculation includes both the substrate wasted during makeready and the press/line time. Short-run digital vs offset decisions are often made by default — the changeover cost calculation helps make this visible.',
    questions: [
      { id:'defects', label:'What percentage of your substrate and output is wasted or rejected during and after production?', hint:'Makeready waste, mis-prints, rejects at converting, customer returns. As a percentage of total material going through.', benchmark:'Production yield below 95% requires investigation. Makeready waste above 8% of substrate is a concern.', prefix:'', suffix:'% waste', placeholder:'6', calc:(v,ctx) => (v/100)*ctx.revenue*ctx.matPct + (v/100)*ctx.annualLabour*0.25 },
      { id:'rework', label:'How many hours per week does your team spend reprinting, re-converting, or sorting rejects?', hint:'Any work done twice. Jobs reprinted at cost, rejects sent back through line, manual sorting.', benchmark:'', prefix:'', suffix:'hrs/wk', placeholder:'8', calc:(v,ctx) => v*ctx.hourly*52 + v*(ctx.revenue*ctx.matPct/(ctx.employees*1800||1800))*0.5*52 },
      { id:'downtime', label:'How many hours per week do presses or converting lines sit idle due to breakdowns or mechanical faults?', hint:'Unplanned stoppages. Not planned maintenance or job changeovers.', benchmark:'', prefix:'', suffix:'hrs/wk', placeholder:'4', calc:(v,ctx) => v*(ctx.hourly*Math.max(ctx.employees*0.2,1)+ctx.machineRate)*52 },
      { id:'changeover', label:'How long does each job changeover or makeready take on your main press or line?', hint:'Plate/forme changes, ink changes, substrate loading, register setting, approval before run. How many changeovers per week?', benchmark:'Sub-15 minute changeovers are the target on packaging lines. Above 30 minutes needs SMED attention.', dual:true, timeLabel:'Average makeready time', countLabel:'Changeovers per week', timePlaceholder:'45', countPlaceholder:'12', calc:(v,ctx) => (v.time/60)*v.count*(ctx.hourly*Math.max(ctx.employees*0.15,1)+ctx.machineRate)*52 },
      { id:'waiting', label:'How much time do press operators or finishing staff spend waiting — for jobs, approvals, materials, or the previous process?', hint:'Queue time between print and finishing, waiting for customer proof approval, waiting for plates or materials.', benchmark:'', prefix:'', suffix:'mins/person/day', placeholder:'25', calc:(v,ctx) => (v/60)*ctx.hourly*ctx.employees*250 },
      { id:'inventory', label:'What is the value of substrate, ink, and packaging materials you are currently holding?', hint:'Paper/board/film stocks, ink inventory, bought-in packaging components. Include slow-moving or obsolete stock.', benchmark:'', prefix:'£', suffix:'', placeholder:'80000', calc:(v,ctx) => v*0.25 },
      { id:'unnecessary', label:'How much time per person goes on admin, estimating, and non-productive tasks?', hint:'Re-estimating jobs, chasing proofs, data entry, reprinting job cards. Per person per day.', benchmark:'', prefix:'', suffix:'mins/person/day', placeholder:'20', calc:(v,ctx) => (v/60)*ctx.hourly*ctx.employees*250 }
    ]
  },

  plastics: {
    name: 'Plastics & Rubber',
    volumes: ['highvol','batch','lowvol'],
    benchmarks: {
      quality: 'Scrap rate — world class: <1%, typical SME: 2–5% before regrind. Regrind quality implications add hidden cost.',
      efficiency: 'Machine utilisation — world class: 85%+, typical: 65–75%. Energy is 90%+ of running cost — cycle time directly affects energy per part.',
      keyRisk: 'Energy is the dominant cost in injection moulding. Any improvement in cycle time or reduction in purging directly reduces cost per part.'
    },
    matLabel: 'Material cost — polymer, compound (% of revenue)',
    matHint: 'Polymer/compound cost is typically 35–55% of revenue for moulding operations.',
    matPlaceholder: '45',
    machineLabel: 'Machine running cost (energy, mould wear)',
    machineHint: 'Energy is 90%+ of injection moulding running cost. All-electric machines: £8–£20/hr. Hydraulic: £12–£28/hr.',
    machinePlaceholder: '18',
    methodNote: 'For plastics and rubber, cycle time losses are calculated against your machine rate because slower cycles consume energy with no additional output. Purging waste during colour or material changes is calculated against full material cost — purge material generates no revenue. Scrap includes regrind management cost even where material is recycled, because regrinding consumes energy and degrades material properties.',
    questions: [
      { id:'defects', label:'What percentage of your moulded or extruded output is rejected or scrapped (before regrind)?', hint:'Short shots, flash, sink marks, weld lines, dimensional rejects, colour issues. As a percentage of shots or output.', benchmark:'Scrap above 3% before regrind signals process instability. Even regrindable scrap has hidden cost.', prefix:'', suffix:'% scrap', placeholder:'3', calc:(v,ctx) => (v/100)*ctx.revenue*ctx.matPct + (v/100)*ctx.annualLabour*0.3 },
      { id:'rework', label:'How many hours per week does your team spend on regrinding, sorting, or reworking moulded parts?', hint:'Manual degating, sorting rejects, operating regrind equipment, blending regrind with virgin material.', benchmark:'', prefix:'', suffix:'hrs/wk', placeholder:'8', calc:(v,ctx) => v*ctx.hourly*52 + v*ctx.machineRate*0.3*52 },
      { id:'downtime', label:'How many hours per week do moulding machines or extruders sit idle due to unplanned breakdowns?', hint:'Hydraulic faults, heater failures, mould damage, robot failures. Not planned maintenance or mould changes.', benchmark:'Machine utilisation below 70% indicates a scheduling or maintenance problem.', prefix:'', suffix:'hrs/wk', placeholder:'5', calc:(v,ctx) => v*(ctx.hourly*Math.max(ctx.employees*0.15,1)+ctx.machineRate)*52 },
      { id:'changeover', label:'How long does a mould change or material/colour purge take on your machines?', hint:'Crane time, mould change, purging, first-off approval before running. Include purge material cost — it is significant.', benchmark:'Purging waste is a major hidden material cost — each colour change can consume kilos of material.', dual:true, timeLabel:'Average mould/colour change time', countLabel:'Changes per week', timePlaceholder:'120', countPlaceholder:'8', calc:(v,ctx) => (v.time/60)*v.count*(ctx.hourly*Math.max(ctx.employees*0.1,1)+ctx.machineRate)*52 },
      { id:'waiting', label:'How much time do machine operators spend waiting — for material, mould changes, first-off approval, or work to arrive?', hint:'Idle time while moulds are being changed, waiting for crane, waiting for QA sign-off on first-offs.', benchmark:'', prefix:'', suffix:'mins/person/day', placeholder:'30', calc:(v,ctx) => (v/60)*ctx.hourly*ctx.employees*250 },
      { id:'inventory', label:'What is the value of polymer, compound, and bought-in material you are currently holding?', hint:'Raw material in bags, octabins, or silos. Include regrind stock and slow-moving material.', benchmark:'', prefix:'£', suffix:'', placeholder:'70000', calc:(v,ctx) => v*0.25 },
      { id:'unnecessary', label:'How much time per person goes on admin, documentation, or non-moulding tasks?', hint:'Paperwork, material tracking, job cards, quality records beyond what is needed. Per person per day.', benchmark:'', prefix:'', suffix:'mins/person/day', placeholder:'20', calc:(v,ctx) => (v/60)*ctx.hourly*ctx.employees*250 }
    ]
  },

  electronics: {
    name: 'Electronics & Assembly',
    volumes: ['highvol','batch','lowvol'],
    benchmarks: {
      quality: 'First Pass Yield at SMT — world class: 99.9%+, typical SME: 98–99%. Functional test FPY: world class 99%, concern below 95%.',
      efficiency: 'Component availability — any shortage stops an assembly. Above 2 line stops per week due to missing parts indicates a planning failure.',
      keyRisk: 'Cost of a defect escalates dramatically through the build. A solder defect found at SMT costs pennies. Found at functional test: pounds. Found by customer: potentially thousands.'
    },
    matLabel: 'Component and material cost (% of revenue)',
    matHint: 'PCB, components, consumables typically 40–65% of revenue for EMS operations.',
    matPlaceholder: '52',
    machineLabel: 'Line/equipment running cost',
    machineHint: 'SMT line running cost including solder paste, flux, energy. Typically £15–£40/hr.',
    machinePlaceholder: '25',
    methodNote: 'For electronics assembly, defect costs are calculated at the point of detection — but the true cost escalates with each subsequent process step the defective board passes through. Functional test failures are calculated including all prior assembly cost added. Component shortage stops are calculated as full line idle cost because a missing part typically stops an entire assembly run.',
    questions: [
      { id:'defects', label:'What percentage of boards or assemblies fail inspection or test at any stage of your process?', hint:'SMT inspection failures, reflow defects, functional test failures, final inspection rejects. Combined across all stages.', benchmark:'First Pass Yield below 98% at SMT is a concern. Functional test FPY below 95% indicates a systemic quality issue.', prefix:'', suffix:'% failure rate', placeholder:'2', calc:(v,ctx) => (v/100)*(ctx.annualLabour*0.5 + ctx.revenue*ctx.matPct*0.3) },
      { id:'rework', label:'How many hours per week does your team spend reworking boards, resoldering joints, or fault-finding?', hint:'Hand rework after SMT, component replacements, manual fault-finding on failed boards. All technicians included.', benchmark:'Rework cost escalates with skill level required — hand rework is slow and expensive.', prefix:'', suffix:'hrs/wk', placeholder:'15', calc:(v,ctx) => v*ctx.hourly*52 },
      { id:'downtime', label:'How many hours per week does your SMT line or assembly area stop due to machine faults or component shortages?', hint:'Feeder jams, placement head faults, component shortages stopping the line. Not planned maintenance.', benchmark:'Component shortage stops above 2 per week indicate a planning or procurement failure.', prefix:'', suffix:'hrs/wk', placeholder:'5', calc:(v,ctx) => v*(ctx.hourly*Math.max(ctx.employees*0.3,1)+ctx.machineRate)*52 },
      { id:'changeover', label:'How long does a product changeover or new build setup take on your line?', hint:'Feeder changes, programme loading, first-article inspection, solder paste setup. Per new product build.', benchmark:'', dual:true, timeLabel:'Average setup time', countLabel:'New products per week', timePlaceholder:'60', countPlaceholder:'5', calc:(v,ctx) => (v.time/60)*v.count*(ctx.hourly*Math.max(ctx.employees*0.2,1)+ctx.machineRate)*52 },
      { id:'waiting', label:'How much time do assembly technicians spend waiting — for kits, components, drawings, test equipment, or the previous stage?', hint:'Queue time between processes, waiting for kits to be issued, waiting for test rigs to become available.', benchmark:'', prefix:'', suffix:'mins/person/day', placeholder:'25', calc:(v,ctx) => (v/60)*ctx.hourly*ctx.employees*250 },
      { id:'inventory', label:'What is the value of components, PCBs, and materials you are currently holding?', hint:'Component inventory, raw PCBs, bought-out sub-assemblies. Include slow-moving and obsolete components.', benchmark:'Obsolete component stock is common in electronics — often underestimated in value.', prefix:'£', suffix:'', placeholder:'90000', calc:(v,ctx) => v*0.25 },
      { id:'unnecessary', label:'How much time per person goes on admin, component shortage chasing, or non-assembly tasks?', hint:'Chasing purchase orders, manual stock counts, updating spreadsheets, paperwork duplication. Per person per day.', benchmark:'', prefix:'', suffix:'mins/person/day', placeholder:'25', calc:(v,ctx) => (v/60)*ctx.hourly*ctx.employees*250 }
    ]
  },

  service: {
    name: 'Field Service & Maintenance',
    volumes: ['service'],
    benchmarks: {
      quality: 'First Time Fix Rate — world class: 90%+, industry typical: 72–80%. 25% of field visits are not resolved on the first visit.',
      efficiency: 'Technician billable utilisation — world class: 80%+, typical: 60–70%. Travel above 35% of working day is a concern.',
      keyRisk: 'Every return visit costs the full mobilisation cost with no additional revenue. Improving FTFR by 10% typically recovers 8–12% of turnover.'
    },
    matLabel: 'Parts and materials as % of revenue',
    matHint: 'Parts used in service delivery. If you supply parts separately, include the cost of parts used on warranty/callback jobs. Typically 15–40% of service revenue.',
    matPlaceholder: '25',
    machineLabel: 'Vehicle running cost per hour',
    machineHint: 'Fuel, depreciation, insurance per vehicle per hour. Typically £8–£20/hr per van.',
    machinePlaceholder: '12',
    methodNote: 'For field service, return visits are the dominant hidden cost — each one costs the full mobilisation (travel, technician time) with no additional revenue. The calculation uses your average job revenue implied from turnover and headcount. Parts not on van are the most common cause of return visits and are captured in the downtime calculation.',
    questions: [
      { id:'defects', label:'What percentage of your service visits require a return visit to resolve the same issue?', hint:'Callbacks, warranty returns, repeat visits for the same fault. As a percentage of all jobs. If you do not track this, estimate from your experience.', benchmark:'World-class FTFR is 90%+. Industry typical is 72–80%. 25% of field visits industry-wide are not resolved first time.', prefix:'', suffix:'% return visits', placeholder:'20', calc:(v,ctx) => { const jobRev = ctx.revenue>0&&ctx.employees>0 ? ctx.revenue/ctx.employees/50 : 500; return (v/100)*ctx.employees*50*jobRev*0.7; } },
      { id:'rework', label:'How many hours per week does your team spend on rework, warranty jobs, or correcting previous visits?', hint:'Time completing work that should have been done on the first visit. Include travel to the return visit.', benchmark:'', prefix:'', suffix:'hrs/wk', placeholder:'8', calc:(v,ctx) => v*(ctx.hourly+ctx.machineRate)*52 },
      { id:'downtime', label:'How many hours per week do your engineers or technicians sit idle — waiting for parts, access, or the customer?', hint:'On-site waiting, broken-down vans, waiting for materials to arrive, waiting for site access.', benchmark:'Each idle technician hour costs you full labour and vehicle cost with no revenue.', prefix:'', suffix:'hrs/wk', placeholder:'6', calc:(v,ctx) => v*(ctx.hourly+ctx.machineRate)*52 },
      { id:'changeover', label:'How much time does your team spend between jobs — travelling, completing admin, and preparing for the next job?', hint:'Door-to-door travel time, completing job sheets from the previous call, loading vans. Average time between productive work.', benchmark:'Travel above 35% of working day indicates territory or scheduling problems.', dual:true, timeLabel:'Average time between jobs', countLabel:'Jobs per engineer per week', timePlaceholder:'45', countPlaceholder:'5', calc:(v,ctx) => (v.time/60)*v.count*(ctx.hourly+ctx.machineRate)*52 },
      { id:'waiting', label:'How much time per engineer per day is spent on admin, paperwork, or non-billable tasks?', hint:'Job sheet completion, timesheet entry, phone time with office, quote preparation. Time that is not billable.', benchmark:'Admin above 15% of working day signals process inefficiency in a field service operation.', prefix:'', suffix:'mins/engineer/day', placeholder:'60', calc:(v,ctx) => (v/60)*ctx.hourly*ctx.employees*250 },
      { id:'inventory', label:'What is the approximate value of parts and materials held in vans and at your depot?', hint:'Van stock, warehouse parts, consumables. Include slow-moving or obsolete stock.', benchmark:'Field service operations typically carry 20–30% of parts stock that has not moved in 6 months.', prefix:'£', suffix:'', placeholder:'40000', calc:(v,ctx) => v*0.25 },
      { id:'unnecessary', label:'How much engineer time goes on tasks that are not directly billable or do not help resolve the job?', hint:'Unnecessary paperwork, duplicate data entry, manual scheduling, non-technical admin. Per engineer per day.', benchmark:'', prefix:'', suffix:'mins/engineer/day', placeholder:'30', calc:(v,ctx) => (v/60)*ctx.hourly*ctx.employees*250 }
    ]
  },

  general: {
    name: 'General / Mixed Manufacturing',
    volumes: ['highvol','batch','lowvol','oneoff'],
    benchmarks: {
      quality: 'First Pass Yield — world class: 95%+. OEE — world class: 85%, typical SME: 60%.',
      efficiency: 'OTIF — world class: 98%+. Labour efficiency — target 85% of time value-adding.',
      keyRisk: 'The most common hidden cost in general manufacturing is waste that nobody has ever quantified.'
    },
    matLabel: 'Materials and bought-in parts (% of revenue)',
    matHint: 'Your total material spend as a percentage of revenue. 30–50% is typical for light manufacturing.',
    matPlaceholder: '38',
    machineLabel: 'Equipment running cost per hour',
    machineHint: 'Energy, tooling, consumables per hour across your equipment. £10–£30 is a reasonable starting estimate.',
    machinePlaceholder: '15',
    methodNote: 'Every figure is converted to an annual pound cost using your revenue, headcount, hourly rate, material cost, and machine rate. All calculations are conservative — independent audits consistently find actual waste costs are 30–50% higher than initial estimates.',
    questions: [
      { id:'defects', label:'How often do you produce things that are wrong and need fixing or scrapping?', hint:'Products rejected, parts remade, jobs redone. As a percentage of your total output.', benchmark:'World-class First Pass Yield is 95%+. Below 90% indicates a significant quality problem.', prefix:'', suffix:'% of output', placeholder:'3', calc:(v,ctx) => (v/100)*(ctx.revenue*ctx.matPct + ctx.annualLabour*0.35) },
      { id:'rework', label:'How many hours per week does your team spend fixing things that were not right first time?', hint:'Rework, corrections, going back over jobs. All staff involved.', benchmark:'', prefix:'', suffix:'hrs/wk', placeholder:'12', calc:(v,ctx) => v*ctx.hourly*52 },
      { id:'downtime', label:'How many hours per week do machines or equipment sit idle due to unplanned breakdowns?', hint:'Unplanned stoppages only. Not scheduled maintenance.', benchmark:'', prefix:'', suffix:'hrs/wk', placeholder:'6', calc:(v,ctx) => v*(ctx.hourly*Math.max(ctx.employees*0.2,1)+ctx.machineRate)*52 },
      { id:'changeover', label:'How long does it take to switch from one job, product, or customer to the next?', hint:'Setup, preparation, loading, clearing down. Time that is not productive.', benchmark:'', dual:true, timeLabel:'Average setup time', countLabel:'Setups per week', timePlaceholder:'45', countPlaceholder:'8', calc:(v,ctx) => (v.time/60)*v.count*(ctx.hourly*Math.max(ctx.employees*0.15,1)+ctx.machineRate)*52 },
      { id:'waiting', label:'How much time do your people spend waiting — for materials, instructions, decisions, or others to finish?', hint:'Any idle time caused by delays in the process. Average across your team per day.', benchmark:'', prefix:'', suffix:'mins/person/day', placeholder:'25', calc:(v,ctx) => (v/60)*ctx.hourly*ctx.employees*250 },
      { id:'inventory', label:'What is the value of materials, stock, or work-in-progress you are currently holding?', hint:'Everything purchased but not yet sold or invoiced. Approximate total value.', benchmark:'', prefix:'£', suffix:'', placeholder:'80000', calc:(v,ctx) => v*0.25 },
      { id:'unnecessary', label:'How much time per person goes on tasks that feel like they add no real value?', hint:'Admin, reports, double-checking, sign-offs that could be removed. Per person per day.', benchmark:'', prefix:'', suffix:'mins/person/day', placeholder:'20', calc:(v,ctx) => (v/60)*ctx.hourly*ctx.employees*250 }
    ]
  }
};

const VOLUME_PROFILES = {
  highvol:  { icon:'🔁', name:'High volume / repetitive', desc:'Same product, continuous or near-continuous production' },
  batch:    { icon:'📦', name:'Batch / campaign', desc:'Runs of the same product, then changeover to the next' },
  lowvol:   { icon:'🎛️', name:'Low volume, high variety', desc:'Many different products in small quantities, make to order' },
  oneoff:   { icon:'✏️', name:'One-off / bespoke / project', desc:'Each job is unique — no two the same' },
  service:  { icon:'🚐', name:'Service delivery', desc:'No physical product — deliver service at customer site' }
};

// ─── KPI EXPLANATIONS PER SECTOR+QUESTION ────────────────────────────────────
const KPI_DATA = {
  engineering: {
    defects:    { name:'First Pass Yield (FPY)', what:'The percentage of parts or assemblies that pass quality inspection the first time, without needing rework or scrapping. It tells you how capable your process actually is.', formula:'FPY = (Parts passing inspection first time ÷ Total parts started) × 100', why:'A First Pass Yield of 90% sounds reasonable — but it means 1 in 10 parts needs rework or scrap. On high-value materials, that cost compounds fast.' },
    rework:     { name:'Rework Rate', what:'The proportion of your production time and labour being spent correcting work that was not right first time. Distinct from scrap — the part is saved, but at additional cost.', formula:'Rework cost = Rework hours per week × Hourly labour rate × 52 weeks', why:'Rework hides in the day-to-day — it feels normal. But every rework hour is a billable hour lost on new work.' },
    downtime:   { name:'OEE — Availability Component', what:'Overall Equipment Effectiveness measures how well your machines are actually being used. Unplanned downtime directly reduces the Availability score — one of three OEE components.', formula:'Availability = Run time ÷ Planned production time × 100
OEE = Availability × Performance × Quality', why:'World-class OEE is 85%. Most engineering SMEs run at 60–70%. The gap is capacity you already own.' },
    changeover: { name:'Setup-to-Run Ratio', what:'For short-run precision engineering, setup time can exceed actual run time on a job. This ratio shows how much of your machine capacity is consumed getting ready rather than making parts.', formula:'Setup ratio = Setup time ÷ (Setup time + Run time) × 100
Target: below 25% for most operations', why:'A 90-minute setup for a 2-hour run means 45% of machine time is non-productive. Halving setup time adds capacity without buying a machine.' },
    waiting:    { name:'Queue / Wait Time', what:'Time your machinists or operators are present and paid but unable to work because they are waiting for something — materials, drawings, inspection sign-off, or the previous operation to finish.', formula:'Wait cost = Wait time (mins) ÷ 60 × Hourly rate × Headcount × 250 working days', why:'Waiting is invisible waste — it looks like people are on site and working. But if they are waiting, every minute is a direct cost with no output.' },
    inventory:  { name:'Inventory Holding Cost', what:'The true annual cost of holding raw material stock is approximately 25% of its value — covering storage, insurance, capital tied up, obsolescence risk, and handling. Most businesses only see the purchase price.', formula:'Annual holding cost = Stock value × 25%
(25% is the industry-standard benchmark for total holding cost)', why:'£100,000 of bar stock held longer than needed is costing you £25,000 per year. That is money not working.' },
    unnecessary:{ name:'Non-Value-Added Time', what:'Any time spent on tasks that do not directly contribute to producing a saleable part or service. In engineering this includes re-quoting, chasing orders, and paperwork duplication.', formula:'NVA cost = NVA mins per person ÷ 60 × Hourly rate × Headcount × 250 working days', why:'30 minutes of admin per person per day across 30 people is 750 hours per week — equivalent to nearly 5 full-time people doing nothing productive.' }
  },
  food: {
    defects:    { name:'Yield Rate', what:'The percentage of raw ingredient that becomes saleable finished product. Yield loss includes processing waste, products failing weight or quality checks, and anything that cannot be sold.', formula:'Yield rate = Good finished product weight ÷ Raw ingredient input weight × 100
Yield loss % = 100 − Yield rate', why:'In food manufacturing, yield improvement is a bigger margin lever than speed. A 2% yield gain on a £2M ingredient spend recovers £40,000 — and it goes straight to profit.' },
    rework:     { name:'Reprocessing Rate', what:'The proportion of product that requires an additional operation — downgrading, blending off-spec batches, re-packaging, or manual sorting — before it can be sold.', formula:'Reprocessing cost = Reprocessing hours × Labour rate × 52 weeks', why:'Reprocessed product is sold at reduced value or scrapped after additional labour cost. The margin hit is double.' },
    downtime:   { name:'OEE — Availability', what:'In food manufacturing, OEE (Overall Equipment Effectiveness) is the gold standard metric. Unplanned stoppages directly reduce the Availability component and stop the whole line.', formula:'Availability = Actual run time ÷ Planned production time × 100
Food industry typical OEE: 55–65%. World class: 85%', why:'A line planned for 8 hours that loses 2 to unplanned stops has 75% availability — and those 2 hours of lost production are gone forever.' },
    changeover: { name:'Changeover Loss (All Three OEE Dimensions)', what:'In food manufacturing, changeovers — especially allergen changeovers — are uniquely damaging because they hit all three OEE components simultaneously: the line is stopped (availability), startup rejects waste product (quality), and the line runs slowly as it ramps up (performance).', formula:'Changeover cost = Changeover hours × (Labour rate × operators on line + Line running cost)', why:'An allergen changeover that takes 2 hours on a 10-person line at £18/hr costs £360 in labour alone — before startup waste.' },
    waiting:    { name:'Flow Efficiency', what:'Time when production workers are present but not producing — waiting for batch paperwork, QC release, or materials to arrive at the line.', formula:'Wait cost = Wait mins per person ÷ 60 × Labour rate × Headcount × 250 days', why:'A food line with 20 operators waiting 15 minutes per shift costs £22,500 per year in idle labour — every year, invisibly.' },
    inventory:  { name:'Inventory Holding Cost (with Spoilage)', what:'For food, holding cost is higher than other sectors because raw ingredients have shelf lives. The 30% rate used here reflects standard holding cost plus a spoilage risk premium.', formula:'Annual holding cost = Ingredient stock value × 30%
(Higher than manufacturing average due to spoilage risk)', why:'Overordering perishable ingredients is one of the most common profit leaks in food manufacturing. Stock that expires is 100% waste.' },
    unnecessary:{ name:'Compliance Administration Time', what:'Time spent on HACCP records, allergen logs, BRC documentation, and traceability paperwork beyond the absolute minimum required. The compliance itself is necessary — excessive manual documentation is not.', formula:'Admin cost = Admin mins per person ÷ 60 × Labour rate × Headcount × 250 days', why:'Digitalising one manual record that takes 5 people 20 minutes per day recovers over £15,000 per year at £18/hr.' }
  },
  automotive: {
    defects:    { name:'PPM (Parts Per Million) Defect Rate', what:'The number of defective parts per million produced. The automotive industry standard quality metric. Most OEM customer scorecards use PPM as a primary quality KPI and will take formal action above certain thresholds.', formula:'PPM = (Defective parts ÷ Total parts produced) × 1,000,000
Scrap % = PPM ÷ 10,000
Industry average: ~75 PPM. World class: <10 PPM', why:'A 0.01% scrap rate sounds tiny. That is 100 PPM — above the threshold that triggers corrective action from most OEM customers.' },
    rework:     { name:'Rework and Containment Cost', what:'The labour and machine cost of correcting parts before they leave your site. In automotive this also includes containment costs — 100% inspection of a production run when a quality concern is raised.', formula:'Rework cost = Rework hours × Labour rate × 52 + Machine time × Machine rate × 52', why:'Customer-mandated containment (100% sort of all stock) can cost more than the parts themselves — and it signals to the customer that your process is not in control.' },
    downtime:   { name:'OEE — Availability', what:'Equipment downtime in automotive directly risks an OTIF failure — being late or short on a JIT delivery. A single delivery miss can stop an OEM production line, triggering financial penalties.', formula:'Availability = Run time ÷ Planned production time × 100
OEE = Availability × Performance × Quality. World class: 85%', why:'In JIT automotive supply, your downtime is your customer's downtime. The financial consequences of a line stop at an OEM can far exceed your direct cost.' },
    changeover: { name:'SMED — Setup Time', what:'Single Minute Exchange of Die (SMED) is the methodology for reducing changeover time. In automotive, every changeover reduces available capacity for a JIT programme.', formula:'Changeover cost = Changeover hours × (Labour rate × operators + Machine rate) × 52 weeks', why:'A 90-minute tool change that happens 8 times a week consumes 12 hours of press time weekly. At £40/hr machine rate that is £25,000 per year of lost capacity.' },
    waiting:    { name:'Value-Added Time Ratio', what:'The proportion of total process time where value is actually being added. In automotive, waiting for first-off approval, gauge availability, or the previous operation are common sources of non-value-added time.', formula:'Wait cost = Wait mins ÷ 60 × Labour rate × Headcount × 250 days', why:'A first-off approval wait of 30 minutes on a machine running at £40/hr costs £20 per job. Across 300 jobs per year that is £6,000 in idle machine time alone.' },
    inventory:  { name:'Inventory Holding Cost', what:'Working capital tied up in raw materials and WIP. In automotive, buffer stock is often held to protect against delivery risk — but this has a real cost.', formula:'Annual holding cost = Stock value × 25%
Industry benchmark: 5–10 inventory turns per year', why:'£150,000 of raw material and WIP held as safety stock costs £37,500 per year to carry. Demand-led replenishment reduces this without delivery risk.' },
    unnecessary:{ name:'Cost of Quality Administration', what:'IATF 16949 compliance, PPAP preparation, customer portal updates, corrective action reports, controlled shipping administration. Necessary for the contract — but the labour cost is real.', formula:'Admin cost = Admin mins ÷ 60 × Labour rate × Headcount × 250 days
IATF compliance typically costs 3–7% of turnover for automotive SMEs', why:'30 minutes of quality admin per operator per day across 20 operators is 2,500 hours per year — over a full person-year of cost.' }
  },
  print: {
    defects:    { name:'Production Yield Rate', what:'The percentage of substrate (paper, board, film) fed into the process that comes out as saleable finished product. Every point below 100% is direct material cost with no revenue.', formula:'Yield = Good output quantity ÷ Total substrate input × 100
Target: 98%+. Below 95% requires investigation.', why:'At 55% material cost, a 3% yield loss on £2M revenue costs £33,000 per year in wasted substrate alone — before labour or machine time.' },
    rework:     { name:'Reprint and Rework Rate', what:'Jobs that have to be reprinted or reprocessed due to quality failures — mis-register, colour variation, cutting defects. Each reprint consumes full substrate and press time with no additional revenue.', formula:'Reprint cost = Reprint hours × Labour rate + Substrate cost per hour × Reprint hours', why:'A reprint is a job done twice for the same price. On a short run it can eliminate the entire job margin.' },
    downtime:   { name:'OEE — Press Availability', what:'The proportion of planned press time when the press is actually running. Breakdowns, mechanical faults, and plate/plate problems all reduce availability.', formula:'Availability = Run time ÷ Planned production time × 100
Target OEE for print: 75–85%. Below 60% is significant.', why:'A press running at 70% OEE has 30% of its capacity lost to stops, slowdowns, and waste. On a £400,000/year machine that is £120,000 of capacity gone.' },
    changeover: { name:'Makeready Time and Waste', what:'Makeready is the time and material consumed getting a press ready for a new job — plate changes, ink changes, substrate loading, colour matching, and the waste printed during the approval process before running good product.', formula:'Makeready cost = Makeready hours × (Labour rate × operators + Press rate) + Substrate wasted × Material cost per unit', why:'Makeready waste is the single biggest lever in print. On high-SKU operations it is common for makeready to consume 10–15% of total substrate.' },
    waiting:    { name:'Press Idle Time', what:'Time press operators are on site but not running — waiting for jobs, approvals, plates, or substrate. A press not running is a cost centre with no output.', formula:'Wait cost = Wait mins ÷ 60 × Labour rate × Headcount × 250 days', why:'An idle press at £30/hr machine cost plus two operators at £18/hr wastes £66 per idle hour. 4 hours per day across 50 weeks is £66,000 per year.' },
    inventory:  { name:'Substrate and Ink Inventory', what:'Paper, board, film, and ink held in stock. Print materials have a cost of carry plus the risk of obsolescence if a customer changes specification or stops the job.', formula:'Annual holding cost = Stock value × 25%', why:'Obsolete substrate from a job that changed specification is often a total write-off. Holding only what you need for committed orders significantly reduces risk.' },
    unnecessary:{ name:'Non-Productive Time', what:'Estimating re-runs, chasing customer proofs, data entry, manual scheduling administration. Time that does not produce saleable print.', formula:'Admin cost = Admin mins ÷ 60 × Labour rate × Headcount × 250 days', why:'20 minutes of admin per operator per day across 15 people is 1,250 hours per year — the equivalent of nearly one full-time person.' }
  },
  plastics: {
    defects:    { name:'Scrap Rate and Regrind Management', what:'The percentage of moulded or extruded output rejected before regrinding. Even regrindable scrap has hidden cost: regrinding energy, quality degradation, and blending limits on regrind percentage.', formula:'Scrap rate = Rejected parts ÷ Total parts produced × 100
Regrind cost ≈ 30–40% of virgin material cost (energy + quality risk)', why:'A 3% scrap rate that gets regrinded back looks free — but regrind energy, quality risk, and blending limits mean it is not.' },
    rework:     { name:'Regrind and Sorting Labour', what:'Labour time operating regrind equipment, sorting rejects, blending regrind with virgin material, and managing regrind quality. Often invisible in production costs.', formula:'Regrind cost = Sorting/regrinding hours × Labour rate + Regrind machine energy cost', why:'A regrind operation running 8 hours per week costs £7,500/year in labour alone — before the energy cost of the granulator.' },
    downtime:   { name:'Machine Utilisation / OEE', what:'The proportion of time your moulding machines or extruders are actually running and producing good parts. Downtime reduces utilisation directly.', formula:'Machine utilisation = Run hours ÷ Available hours × 100
World class: 85%+. Typical SME: 65–75%.', why:'In injection moulding, energy cost is 90%+ of running cost. A machine that is paid for but idle still consumes energy overhead.' },
    changeover: { name:'Mould Change and Purge Time', what:'The time and material consumed changing moulds or purging between materials and colours. Purge material generates no revenue and has limited regrind value. Mould change requires crane time, toolroom involvement, and first-off approval.', formula:'Change cost = Change hours × (Labour rate × operators + Machine rate) + Purge kg × Material cost/kg', why:'A 2-hour mould change with 3 operators on a machine costing £18/hr to run costs £120 in labour plus machine time — every change.' },
    waiting:    { name:'Operator Idle Time', what:'Time machine operators are on site but not productive — waiting for mould changes, first-off approval, material delivery, or crane availability.', formula:'Wait cost = Wait mins ÷ 60 × Labour rate × Headcount × 250 days', why:'In high-volume moulding, operators monitoring running machines are productive. Operators waiting for a mould change to finish are pure cost.' },
    inventory:  { name:'Polymer and Compound Stock', what:'Raw material (polymer, compound, masterbatch) held in stock. Plastics raw materials have moderate holding cost but significant obsolescence risk if a customer changes specification.', formula:'Annual holding cost = Stock value × 25%', why:'Slow-moving specialist grades held speculatively are common in moulding operations — and often written off when the customer changes their spec.' },
    unnecessary:{ name:'Non-Moulding Admin Time', what:'Documentation, stock management, job card administration, and non-production tasks consuming operator or supervisor time.', formula:'Admin cost = Admin mins ÷ 60 × Labour rate × Headcount × 250 days', why:'20 minutes of paperwork per person per day across 25 people is 2,083 hours per year — over a full person-year of labour cost.' }
  },
  electronics: {
    defects:    { name:'First Pass Yield (FPY) — Multi-Stage', what:'The percentage of boards or assemblies that pass all quality checks and tests on the first attempt, at every stage of the build. FPY is measured at each process stage: SMT, reflow, wave solder, ICT, and functional test.', formula:'FPY per stage = Passes ÷ Total started × 100
Overall FPY = FPY stage 1 × FPY stage 2 × FPY stage 3...
World class SMT: 99.9%+', why:'A 98% FPY at three stages gives an overall yield of 94%. That means 1 in 17 boards needs rework — and cost escalates dramatically at each later stage.' },
    rework:     { name:'Rework Cost Escalation', what:'In electronics, the cost of fixing a defect escalates dramatically as the product moves through the build. A cold solder joint caught at SMT takes seconds to fix. The same joint caught at functional test means fault-finding, desoldering, and reverification.', formula:'Rework cost = Rework hours × (Senior technician rate) × 52 weeks
Rule of thumb: rework at test costs 10× more than rework at SMT', why:'Most electronics rework requires skilled technicians at premium rates. 15 hours per week of rework is a significant skilled labour cost.' },
    downtime:   { name:'Line Availability / Component Shortage Stops', what:'Unplanned stops on an electronics assembly line are often caused by component shortages rather than machine failure. Both stop the line — and both cost the same.', formula:'Stop cost = Stop hours × (Labour rate × line operators + Line running cost) × 52 weeks
Above 2 component shortage stops per week = planning failure', why:'A component shortage that stops a 10-person SMT line for 2 hours costs £360 in idle labour — every time it happens.' },
    changeover: { name:'New Product Introduction Setup Time', what:'Time to set up for a new product build: feeder loading, programme loading, first-article inspection, solder paste setup, and stencil change. High-mix EMS operations do this frequently.', formula:'Setup cost = Setup hours × (Labour rate × setup crew + Line cost) × 52 weeks', why:'On a high-mix line with 5 new products per week, a 1-hour setup saves 260 hours of line time per year.' },
    waiting:    { name:'Kit Availability and Queue Time', what:'Time assembly technicians spend waiting for kits to be issued, for test rigs to become available, or for preceding stages to complete. Common on high-mix operations without flow scheduling.', formula:'Wait cost = Wait mins ÷ 60 × Labour rate × Headcount × 250 days', why:'25 minutes of waiting per technician per day across 20 people costs £45,000 per year in idle skilled labour.' },
    inventory:  { name:'Component Inventory and Obsolescence', what:'Electronic component inventory carries significant obsolescence risk — components become end-of-life, customers change specifications, and long-lead items ordered speculatively may never be used.', formula:'Annual holding cost = Stock value × 25%
Obsolescence risk for electronics is higher — use 30% for long-lead or slow-moving lines', why:'Obsolete components are a common write-off in electronics. Kanbans and consignment stock agreements with distributors significantly reduce this exposure.' },
    unnecessary:{ name:'Non-Assembly Admin Time', what:'Time technicians and engineers spend on component shortage chasing, manual stock counts, spreadsheet updates, and paperwork rather than building product.', formula:'Admin cost = Admin mins ÷ 60 × Labour rate × Headcount × 250 days', why:'25 minutes of admin per person per day across 20 people is 2,083 hours per year — over a full-time person doing no assembly.' }
  },
  service: {
    defects:    { name:'First Time Fix Rate (FTFR)', what:'The percentage of service visits that fully resolve the customer's problem on the first visit, without requiring a return call. It is the single most important metric in field service — improving FTFR simultaneously reduces cost and increases customer satisfaction.', formula:'FTFR = Jobs resolved first visit ÷ Total jobs × 100
World class: 90%+. Industry typical: 72–80%.
25% of field visits industry-wide are not resolved on first visit (Aberdeen Group)', why:'A return visit costs the full mobilisation (travel + technician time) with zero additional revenue. A 10% FTFR improvement typically recovers 8–12% of turnover.' },
    rework:     { name:'Return Visit Cost', what:'The fully-loaded cost of a return visit to resolve an issue that should have been fixed on the first call. Includes technician time, travel, vehicle cost, and the opportunity cost of the job that did not get done instead.', formula:'Return visit cost = (Technician hourly rate + Vehicle running cost) × Average job time + Average travel time', why:'Each return visit also carries a customer satisfaction risk — customers who needed two visits are significantly less likely to renew a contract.' },
    downtime:   { name:'Technician Idle Time', what:'Time when a technician is on the clock but not working on a job — waiting for parts, waiting for site access, waiting for the customer, or vehicle breakdown. All of it costs you full labour plus vehicle running cost.', formula:'Idle cost = Idle hours × (Labour rate + Vehicle rate) × 52 weeks
Billable utilisation target: 80%+. Typical: 60–70%', why:'A technician earning £20/hr in a van costing £12/hr who spends 6 hours a week idle costs £17,000 per year in unrecovered cost.' },
    changeover: { name:'Between-Job Travel and Admin', what:'The time between completing one job and starting productive work on the next — travel, completing job sheets, loading the van, and scheduling administration. This is the field service equivalent of changeover time in manufacturing.', formula:'Between-job cost = Between-job hours × (Labour rate + Vehicle rate) × jobs per week × 52 weeks
Travel above 35% of working day is a concern', why:'If each technician spends 45 minutes between jobs and does 5 jobs per day, that is 3.75 hours per day — nearly half the working day — not directly billable.' },
    waiting:    { name:'On-Site Admin and Non-Billable Time', what:'Time engineers spend on paperwork, timesheet completion, call handling, and scheduling administration rather than directly resolving the customer's problem.', formula:'Admin cost = Admin mins ÷ 60 × Labour rate × Engineers × 250 days
Admin above 15% of working day signals process inefficiency', why:'1 hour of admin per engineer per day across 10 engineers is 2,500 hours per year — equivalent to over a full-time person doing no technical work.' },
    inventory:  { name:'Van Stock and Parts Holding Cost', what:'Parts carried in vans and at the depot have a real annual holding cost. Slow-moving or rarely-used parts are particularly expensive to carry. Missing the right part is the most common cause of return visits.', formula:'Annual holding cost = Parts stock value × 25%
Industry finding: 20–30% of field service parts stock has not moved in 6 months', why:'£40,000 of van stock costs £10,000 per year to carry. An audit of the last 30 jobs shows exactly which parts were needed and which were never touched.' },
    unnecessary:{ name:'Non-Billable Admin Time', what:'Time spent on tasks that neither resolve a customer problem nor generate direct revenue — duplicate data entry, manual scheduling, report generation, and paperwork that could be digitalised.', formula:'Admin cost = Admin mins ÷ 60 × Labour rate × Engineers × 250 days', why:'30 minutes of non-billable admin per engineer per day across 8 engineers costs £54,000 per year at £18/hr — for work that generates no revenue.' }
  },
  general: {
    defects:    { name:'First Pass Yield (FPY)', what:'The percentage of products or outputs that meet quality standards the first time, without rework or rejection. The most common measure of process quality.', formula:'FPY = Good units produced ÷ Total units started × 100
World class: 95%+. Below 90% indicates a significant problem.', why:'A 92% FPY means 8% of everything you produce needs rework or scrapping. Across a full year that compounds into a major cost.' },
    rework:     { name:'Rework Rate', what:'Hours and labour cost spent correcting work that was not right first time. Rework is the most visible form of quality waste — and the easiest to underestimate.', formula:'Rework cost = Rework hours per week × Hourly labour rate × 52 weeks', why:'Rework feels like productivity because people are working. It is not — it is the same work being done twice for the same price.' },
    downtime:   { name:'OEE — Overall Equipment Effectiveness', what:'A composite measure of how effectively your equipment is being used. It combines Availability (is it running?), Performance (is it running at speed?), and Quality (is it making good product?).', formula:'OEE = Availability × Performance × Quality
World class: 85%. Typical SME: 60%. Below 40% is very common in operations new to measurement.', why:'60% OEE means 40% of your machine capacity is being lost to stops, slowdowns, and defects. Most of that is recoverable without capital investment.' },
    changeover: { name:'Changeover / Setup Time', what:'The time from finishing one job, product, or batch to making good product on the next. Every minute stopped is a cost — labour continues, machines may continue running, but no output is produced.', formula:'Changeover cost = Setup hours × (Labour rate × operators + Machine rate) × setups per week × 52', why:'Reducing changeover time by 50% does not just save time — it adds capacity and allows smaller batch sizes, which reduces work-in-progress.' },
    waiting:    { name:'Waiting / Queue Time', what:'Time when people are present and paid but unable to work due to a constraint — waiting for materials, instructions, the previous person to finish, or a decision to be made.', formula:'Wait cost = Wait mins per person ÷ 60 × Labour rate × Headcount × 250 working days', why:'15 minutes of waiting per person per day across 40 people is 2,500 hours per year — the equivalent of over a full-time person doing nothing.' },
    inventory:  { name:'Inventory Holding Cost', what:'The true annual cost of carrying stock — materials, WIP, or finished goods — is approximately 25% of the stock value. This covers storage, insurance, obsolescence, handling, and the capital cost of money tied up.', formula:'Annual holding cost = Stock value × 25%
Good practice: 8–12 stock turns per year (replenish every 4–6 weeks)', why:'Most businesses significantly underestimate their stock holding cost because they only see the purchase price, not the ongoing cost of carrying it.' },
    unnecessary:{ name:'Non-Value-Added Time', what:'Time spent on tasks that would not be missed by the customer if they were removed — paperwork, double-checking, reports nobody reads, unnecessary sign-off steps.', formula:'NVA cost = NVA mins per person ÷ 60 × Labour rate × Headcount × 250 working days', why:'20 minutes of unnecessary admin per person per day across 30 people is 2,500 hours per year — over a full-time person's work spent on tasks that add no value.' }
  }
};

const PART_NAMES = ['Defects and scrap','Rework and corrections','Equipment downtime','Changeover / setup','Waiting and bottlenecks','Excess stock holding','Unnecessary tasks'];
const TOOL_MAP = {
  'Defects and scrap':       'Quality Culture Checker + Root Cause Analysis Tool',
  'Rework and corrections':  'Operational Audit + 5S Assessment',
  'Equipment downtime':      'Maintenance Maturity Checker + OEE Calculator',
  'Changeover / setup':      'SMED Changeover Analyser + Capacity Planner',
  'Waiting and bottlenecks': 'Capacity Planner + Daily Management Planner',
  'Excess stock holding':    'Operational Audit + Supplier Health Check',
  'Unnecessary tasks':       'Operational Audit + Kaizen Log'
};

// ─── STATE ────────────────────────────────────────────────────────────────────
let currentSector = null;
let currentVolume = null;
let recDebounce   = null;
let lastRecHash   = '';
let prevTotal     = -1;

// ─── SELECTORS ───────────────────────────────────────────────────────────────
function setSector(key, btn) {
  currentSector = key;
  document.querySelectorAll('#sectorGrid .sel-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  buildVolumeOptions();
  document.getElementById('volBlock').style.display = 'block';
  document.getElementById('calcBlock').style.display = 'none';
  currentVolume = null;
}

function buildVolumeOptions() {
  const cfg = SECTORS[currentSector];
  const grid = document.getElementById('volGrid');
  grid.innerHTML = '';
  cfg.volumes.forEach(v => {
    const p = VOLUME_PROFILES[v];
    const btn = document.createElement('button');
    btn.className = 'sel-btn';
    btn.onclick = () => { setVolume(v, btn); };
    btn.innerHTML = `<span class="sel-icon">${p.icon}</span><span class="sel-name">${p.name}</span><span class="sel-desc">${p.desc}</span>`;
    grid.appendChild(btn);
  });
}

function setVolume(key, btn) {
  currentVolume = key;
  document.querySelectorAll('#volGrid .sel-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  buildCalculator();
  document.getElementById('calcBlock').style.display = 'block';
  setTimeout(() => document.getElementById('calcBlock').scrollIntoView({behavior:'smooth',block:'start'}), 100);
}

// ─── BUILD CALCULATOR ─────────────────────────────────────────────────────────
function buildCalculator() {
  const cfg = SECTORS[currentSector];
  document.getElementById('panelTitle').textContent = cfg.name + ' — your operation';
  document.getElementById('matLabel').textContent   = cfg.matLabel;
  document.getElementById('materialPct').placeholder = cfg.matPlaceholder;
  document.getElementById('matLabel').title          = cfg.matHint;
  document.getElementById('machineLabel').textContent = cfg.machineLabel;
  document.getElementById('machineRate').placeholder  = cfg.machinePlaceholder;
  document.getElementById('methodBody').textContent   = cfg.methodNote;

  // Hide machine rate for service (use vehicle cost instead)
  document.getElementById('machineRateWrap').style.display = 'block';

  const container = document.getElementById('wasteQuestions');
  container.innerHTML = '';

  cfg.questions.forEach((q, i) => {
    const row = document.createElement('div');
    row.className = 'q-row';

    let inputHTML = '';
    if (q.dual) {
      inputHTML = `
        <div class="dual-wrap">
          <div>
            <div class="dual-label">${q.timeLabel}</div>
            <div class="inp-wrap">
              <input type="number" class="inp-num" id="inp_${q.id}_time" placeholder="e.g. ${q.timePlaceholder}" min="0" oninput="calc()" style="padding-left:0.75rem">
              <div class="inp-suf">mins</div>
            </div>
          </div>
          <div>
            <div class="dual-label">${q.countLabel}</div>
            <div class="inp-wrap">
              <input type="number" class="inp-num" id="inp_${q.id}_count" placeholder="e.g. ${q.countPlaceholder}" min="0" oninput="calc()" style="padding-left:0.75rem">
              <div class="inp-suf">per week</div>
            </div>
          </div>
        </div>`;
    } else {
      inputHTML = `
        <div class="inp-wrap" style="max-width:${q.prefix?'280px':'300px'}">
          ${q.prefix ? `<div class="inp-pre">${q.prefix}</div>` : ''}
          <input type="number" class="inp-num" id="inp_${q.id}" placeholder="${q.placeholder}" min="0" oninput="calc()" style="padding-left:${q.prefix?'0.5rem':'1rem'}">
          ${q.suffix ? `<div class="inp-suf">${q.suffix}</div>` : ''}
        </div>`;
    }

    // Get KPI explanation for this sector+question
    const kpi = (KPI_DATA[currentSector] || {})[q.id];
    const kpiId = `kpi_${q.id}`;

    const kpiBoxHTML = kpi ? `
      <div class="kpi-box">
        <div class="kpi-box-header" onclick="toggleKpi('${kpiId}')">
          <div class="kpi-box-label">📐 How to measure: ${kpi.name}</div>
          <div class="kpi-box-toggle" id="${kpiId}_arrow">▼</div>
        </div>
        <div class="kpi-box-body" id="${kpiId}">
          <div class="kpi-what">${kpi.what}</div>
          <div class="kpi-calc">
            <div class="kpi-calc-label">Calculation</div>
            <div class="kpi-calc-formula">${kpi.formula.replace(/\n/g,'<br>')}</div>
          </div>
          <div class="kpi-why">${kpi.why}</div>
        </div>
      </div>` : '';

    row.innerHTML = `
      <div class="q-label">${q.label}</div>
      <div class="q-hint">${q.hint}</div>
      ${kpiBoxHTML}
      ${q.benchmark ? `<div class="q-benchmark">📊 ${q.benchmark}</div>` : ''}
      ${inputHTML}
      <div class="cost-preview" id="prev_${q.id}"></div>
    `;

    if (i === cfg.questions.length - 1) row.style.borderBottom = 'none';
    container.appendChild(row);
  });

  calc();
}

// ─── CALCULATION ──────────────────────────────────────────────────────────────
function v(id) { return parseFloat(document.getElementById(id)?.value) || 0; }

function fmt(n) {
  if (n >= 1000000) return '£' + (n/1000000).toFixed(1) + 'M';
  if (n >= 1000)    return '£' + Math.round(n/1000) + 'k';
  return '£' + Math.round(n).toLocaleString();
}

function fmtFull(n) { return '£' + Math.round(n).toLocaleString(); }

function getCtx() {
  const revenue   = v('revenue');
  const employees = v('employees');
  const hourly    = v('hourly') || 20;
  const matPct    = v('materialPct')/100 || (parseFloat(SECTORS[currentSector]?.matPlaceholder||35)/100);
  const machineRate = v('machineRate') || parseFloat(SECTORS[currentSector]?.machinePlaceholder||15);
  return { revenue, employees, hourly, matPct, machineRate, annualLabour: employees * hourly * 1800 };
}

function calc() {
  if (!currentSector) return;
  const cfg = SECTORS[currentSector];
  const ctx = getCtx();
  const parts = [];

  cfg.questions.forEach((q, i) => {
    let val;
    if (q.dual) {
      val = { time: v(`inp_${q.id}_time`), count: v(`inp_${q.id}_count`) };
    } else {
      val = v(`inp_${q.id}`);
    }

    const cost = q.calc(val, ctx);
    parts.push({ name: PART_NAMES[i], cost });

    const prevEl = document.getElementById(`prev_${q.id}`);
    if (prevEl) {
      if (cost > 0) {
        prevEl.textContent = `This is costing you approximately ${fmtFull(cost)} per year`;
        prevEl.classList.add('show');
      } else {
        prevEl.textContent = '';
        prevEl.classList.remove('show');
      }
    }
  });

  const total = parts.reduce((s,p) => s + p.cost, 0);

  document.getElementById('totalYear').textContent  = fmt(total);
  document.getElementById('totalMonth').textContent = fmt(total/12);

  if (total !== prevTotal) {
    const el = document.getElementById('totalYear');
    el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
    prevTotal = total;
  }

  const zeroEl  = document.getElementById('zeroState');
  const liveEl  = document.getElementById('liveResults');
  const alertEl = document.getElementById('alertBox');

  if (total > 0) {
    zeroEl.style.display = 'none';
    liveEl.style.display = 'block';

    const pctRev  = ctx.revenue > 0 ? (total/ctx.revenue*100) : 0;
    const perHead = ctx.employees > 0 ? Math.round(total/ctx.employees) : 0;
    const top = [...parts].sort((a,b)=>b.cost-a.cost).find(p=>p.cost>0);

    document.getElementById('wm1').textContent = perHead > 0
      ? `This works out to ${fmtFull(perHead)} per employee per year sitting in problems rather than productivity.`
      : `Your biggest recoverable cost is waste already happening in your operation.`;

    document.getElementById('wm2').textContent = top
      ? `Your largest single cost driver is ${top.name.toLowerCase()} at ${fmt(top.cost)} per year.`
      : '';

    document.getElementById('wm3').textContent = pctRev > 0
      ? `This represents ${pctRev.toFixed(1)}% of your turnover. Recovering half of it is worth ${fmt(total*0.5)} per year.`
      : `Even recovering half of this would make a material difference to your bottom line.`;

    // Breakdown
    const sorted = [...parts].sort((a,b)=>b.cost-a.cost).filter(p=>p.cost>0);
    const maxCost = sorted[0]?.cost || 1;
    const bdEl = document.getElementById('bdRows');
    bdEl.innerHTML = '';
    sorted.forEach(p => {
      const barW = Math.round((p.cost/maxCost)*100);
      bdEl.innerHTML += `<div class="bd-row"><div class="bd-top"><div class="bd-name">${p.name}</div><div class="bd-val">${fmt(p.cost)}</div></div><div class="bd-bar-bg"><div class="bd-bar" style="width:${barW}%"></div></div></div>`;
    });

    // Alert
    if (ctx.revenue > 0 && pctRev >= 15) {
      alertEl.className = 'result-alert red show';
      alertEl.innerHTML = `<strong>Significant exposure.</strong> At ${pctRev.toFixed(1)}% of revenue, you are well above the 5–10% benchmark. The opportunity to recover margin here is substantial.`;
    } else if (ctx.revenue > 0 && pctRev >= 5) {
      alertEl.className = 'result-alert amber show';
      alertEl.innerHTML = `<strong>Clear opportunity.</strong> At ${pctRev.toFixed(1)}% of revenue, you are above the benchmark of below 5%. Tackling your top two cost drivers would make a material difference.`;
    } else if (total > 0) {
      alertEl.className = 'result-alert amber show';
      alertEl.innerHTML = `<strong>Every number here is recoverable.</strong>Add your annual revenue to see how this compares to your turnover and what the realistic recovery looks like.`;
    } else {
      alertEl.className = 'result-alert';
    }

    buildRecs(parts, total, ctx);
  } else {
    zeroEl.style.display = 'block';
    liveEl.style.display = 'none';
    alertEl.className = 'result-alert';
    document.getElementById('summaryPanel').classList.remove('show');
  }
}

// ─── AI RECOMMENDATIONS ───────────────────────────────────────────────────────
function buildRecs(parts, total, ctx) {
  const panel = document.getElementById('summaryPanel');
  const top3  = [...parts].sort((a,b)=>b.cost-a.cost).filter(p=>p.cost>0).slice(0,3);
  if (!top3.length) { panel.classList.remove('show'); return; }
  panel.classList.add('show');

  const hash = top3.map(p => p.name + ':' + Math.round(p.cost/1000)).join('|')
    + '|s:' + currentSector + '|v:' + currentVolume
    + '|r:' + Math.round((ctx.revenue||0)/10000)
    + '|e:' + (ctx.employees||0);

  if (hash === lastRecHash) return;
  lastRecHash = hash;

  const cards = document.getElementById('recCards');
  cards.innerHTML = `<div style="padding:2rem 1.75rem;text-align:center"><div style="display:inline-flex;align-items:center;gap:10px;font-size:13px;color:var(--w40)"><div class="spinner"></div>Analysing your specific situation&hellip;</div></div>`;

  const ctaTitle = document.getElementById('ctaTitle');
  const ctaBody  = document.getElementById('ctaBody');
  ctaTitle.textContent = 'The full action plan is inside Mandate OpEx.';
  ctaBody.textContent  = `Join the waitlist for access to the tools that tackle ${top3.map(p=>p.name.split(' ')[0]).join(', ')} and 13 more. First 200 get 3 months free.`;

  clearTimeout(recDebounce);
  recDebounce = setTimeout(() => fetchRecs(top3, total, parts, ctx), 900);
}

async function fetchRecs(top3, total, allParts, ctx) {
  const sectorCfg  = SECTORS[currentSector];
  const volumeName = VOLUME_PROFILES[currentVolume]?.name || currentVolume;
  const pctRev     = ctx.revenue > 0 ? ((total/ctx.revenue)*100).toFixed(1) : null;
  const perHead    = ctx.employees > 0 ? Math.round(total/ctx.employees) : null;

  const sectorContext = `
Sector: ${sectorCfg.name}
Volume profile: ${volumeName}
Key quality benchmark for this sector: ${sectorCfg.benchmarks.quality}
Key efficiency benchmark: ${sectorCfg.benchmarks.efficiency}
Critical insight for this sector: ${sectorCfg.benchmarks.keyRisk}`;

  const prompt = `You are an operational excellence expert with 25 years of manufacturing experience, specialising in ${sectorCfg.name}. You are reviewing Cost of Waste Calculator results for a specific business and must write a genuinely personalised assessment.

${sectorContext}

BUSINESS PROFILE:
- Annual turnover: ${ctx.revenue > 0 ? '£' + ctx.revenue.toLocaleString() : 'Not provided'}
- Employees: ${ctx.employees > 0 ? ctx.employees : 'Not provided'}
- Hourly labour cost: £${ctx.hourly}/hr
- Material cost: ${Math.round(ctx.matPct*100)}% of revenue
- Machine running cost: £${ctx.machineRate}/hr

CALCULATED ANNUAL WASTE COSTS:
${allParts.filter(p=>p.cost>0).map(p=>'- ' + p.name + ': £' + Math.round(p.cost).toLocaleString()).join('\n')}
TOTAL: £${Math.round(total).toLocaleString()}/year${pctRev ? ' (' + pctRev + '% of turnover)' : ''}${perHead ? ' / £' + perHead.toLocaleString() + ' per employee' : ''}

TOP ${top3.length} COST DRIVERS:
${top3.map((p,i) => (i+1) + '. ' + p.name + ': £' + Math.round(p.cost).toLocaleString() + '/year').join('\n')}

Your task: Write a personalised operational assessment for THIS specific business in THIS specific sector. The business owner does not know lean terminology — speak in plain English.

Respond with ONLY a valid JSON array, no markdown, no text outside JSON. Exactly ${top3.length} objects:
[{
  "waste": "exact waste name from the list above",
  "cost": "£X,XXX/yr",
  "insight": "2-3 sentences: WHY this is costing them this specific amount in this sector. Reference their actual numbers. Use sector-specific knowledge (e.g. for automotive mention PPM/customer scorecard risk, for food mention yield/OEE, for field service mention first-time fix rate). No jargon without explanation.",
  "action": "The single most impactful first action for this business given their size, sector, and the scale of the problem. One paragraph. Plain English. Reference their actual numbers where possible. What to do on Monday morning. British English.",
  "secondAction": "One follow-on action once the first is done. One sentence.",
  "tool": "Mandate OpEx tool that addresses this"
}]

Be specific to THEIR numbers and THEIR sector. Generic advice is not acceptable. If automotive, reference PPM and customer scorecard risk. If food, reference yield and OEE gaps. If field service, reference first-time fix rate. If print, reference makeready waste. If plastics, reference energy cost per part.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'YOUR_ANTHROPIC_API_KEY',
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1400,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data  = await response.json();
    const raw   = data.content?.[0]?.text || '';
    const clean = raw.replace(/```json|```/g,'').trim();
    const recs  = JSON.parse(clean);
    renderRecs(recs, top3);
  } catch(e) {
    renderFallback(top3);
  }
}

function renderRecs(recs, top3) {
  const cards     = document.getElementById('recCards');
  const rankClass = ['r1','r2','r3'];
  cards.innerHTML = '';
  recs.forEach((r, i) => {
    if (!r) return;
    const card = document.createElement('div');
    card.className = 'rec-card';
    card.innerHTML = `
      <div class="rec-rank-row">
        <div class="rec-rank ${rankClass[i]||'r3'}">${i+1}</div>
        <div class="rec-waste-name">${r.waste || top3[i]?.name || ''}</div>
        <div class="rec-cost">${r.cost || fmt(top3[i]?.cost||0)+'/yr'}</div>
      </div>
      <div class="rec-insight">${r.insight||''}</div>
      <div class="rec-action">${r.action||''}</div>
      ${r.secondAction ? `<div class="rec-second">Then: ${r.secondAction}</div>` : ''}
      <div class="rec-tool">Mandate OpEx: ${r.tool || TOOL_MAP[r.waste] || 'Operational Audit'}</div>
    `;
    cards.appendChild(card);
  });
}

function renderFallback(top3) {
  const FB = {
    'Defects and scrap':       {i:'Your defect cost includes both the labour and the material in every rejected part — not just the time to make it.',a:'Map your last 10 rejected outputs and identify the most common cause. In most operations 80% of defects come from one or two root causes. Fix those first.',t:'Quality Culture Checker + Root Cause Analysis Tool'},
    'Rework and corrections':  {i:'Rework is a symptom. The cost you see is the direct labour and material cost of going back over work that was not right first time.',a:'Identify where in your process the problem is introduced. Work backwards from where you find it — that is where to intervene.',t:'Operational Audit + 5S Assessment'},
    'Equipment downtime':      {i:'Every hour your equipment stops unexpectedly costs you idle labour, ongoing machine running cost, and lost production simultaneously.',a:'List your top 3 breakdown causes from the last month. In most operations 2 causes account for most downtime. Address those specifically.',t:'Maintenance Maturity Checker + OEE Calculator'},
    'Changeover / setup':      {i:'Every minute stopped for a changeover or setup costs you idle labour and machine time simultaneously.',a:'Film one changeover. Watch it back with the operator. You will find tasks that can be prepared before the machine stops — moving those outside the stoppage is the biggest lever.',t:'SMED Changeover Analyser + Capacity Planner'},
    'Waiting and bottlenecks': {i:'Waiting is pure waste — your people are present and paid but cannot be productive because of a constraint somewhere in the process.',a:'Ask every person to note what they waited for this week. One week of data will show exactly where the bottlenecks are.',t:'Capacity Planner + Daily Management Planner'},
    'Excess stock holding':    {i:'Holding stock costs approximately 25% of its value per year in storage, insurance, obsolescence, and capital that could be working elsewhere.',a:'Count your stock by value and by date last moved. Anything not moved in 3 months is your starting point for a rationalisation conversation.',t:'Operational Audit + Supplier Health Check'},
    'Unnecessary tasks':       {i:'Time on tasks that add no value to your customer is pure cost — and it compounds across every person, every day.',a:'Pick your most time-consuming recurring task. Ask: what decision does this enable? If nobody can answer clearly, it is a candidate for elimination.',t:'Operational Audit + Kaizen Log'}
  };
  const cards     = document.getElementById('recCards');
  const rankClass = ['r1','r2','r3'];
  cards.innerHTML = '';
  top3.forEach((p,i) => {
    const fb = FB[p.name] || {i:'Review this cost area with your team.',a:'Quantify the problem more precisely, then identify root cause before implementing any solution.',t:'Operational Audit'};
    const card = document.createElement('div');
    card.className = 'rec-card';
    card.innerHTML = `
      <div class="rec-rank-row">
        <div class="rec-rank ${rankClass[i]}">${i+1}</div>
        <div class="rec-waste-name">${p.name}</div>
        <div class="rec-cost">${fmt(p.cost)}/yr</div>
      </div>
      <div class="rec-insight">${fb.i}</div>
      <div class="rec-action">${fb.a}</div>
      <div class="rec-tool">Mandate OpEx: ${fb.t}</div>
    `;
    cards.appendChild(card);
  });
}

// ─── KPI BOX TOGGLE ──────────────────────────────────────────────────────────
function toggleKpi(id) {
  const body  = document.getElementById(id);
  const arrow = document.getElementById(id + '_arrow');
  if (!body) return;
  const isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  if (arrow) arrow.classList.toggle('open', !isOpen);
}

// ─── RESET ────────────────────────────────────────────────────────────────────
function resetAll() {
  ['revenue','employees','hourly','materialPct','machineRate'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  if (currentSector) {
    SECTORS[currentSector].questions.forEach(q => {
      if (q.dual) {
        const t = document.getElementById(`inp_${q.id}_time`);
        const c = document.getElementById(`inp_${q.id}_count`);
        if (t) t.value = '';
        if (c) c.value = '';
      } else {
        const el = document.getElementById(`inp_${q.id}`);
        if (el) el.value = '';
      }
    });
  }
  prevTotal = -1;
  lastRecHash = '';
  calc();
}
