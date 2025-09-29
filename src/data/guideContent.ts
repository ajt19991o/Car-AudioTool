import type { GuideChapter } from '../types';

export const guideChapters: GuideChapter[] = [
  {
    id: 'part-1',
    title: 'Part 1 · The Foundation – Signal & Power',
    summary:
      'Build a rock-solid electrical backbone so every component downstream performs at its best. The Bible makes it clear: weak power delivery or a noisy signal path will drag down even the most expensive gear.',
    sections: [
      {
        id: 'section-1-1',
        title: 'Section 1.1 · Head Units & Digital Media Receivers',
        focus:
          'Choose a source unit that matches your integration needs, desired outputs, and future upgrade plans.',
        keyPoints: [
          'Head unit capability sets the performance ceiling for the entire system – prioritize high-quality DACs, robust pre-outs, and flexible source support.',
          'DIN sizing (single, double, floating) governs retrofit difficulty; confirm dash kits, climate controls, and vehicle data integration before you buy.',
          'Modern receivers are command centers: plan for wireless CarPlay/Android Auto, HDMI, DSP outputs, and OEM retention interfaces early.',
        ],
        actionSteps: [
          'Audit the factory system (amplified? data bus? steering controls?) and list the integration modules you will need.',
          'Match pre-out voltage and number of channels to your amplifier/DSP roadmap so you are not forced to re-buy later.',
          'Sketch your infotainment UX: which sources, apps, and hands-free workflows matter most to daily driving?',
        ],
        references: ['Car Audio & AV Bible · Section 1.1'],
      },
      {
        id: 'section-1-2',
        title: 'Section 1.2 · Amplifiers',
        focus: 'Deliver clean, stable power matched to speaker loads and installation realities.',
        keyPoints: [
          'Channel topology (mono, 2ch, 4ch, 5ch, 6+ channels) should mirror your speaker layout and active vs. passive crossover plans.',
          'Amplifier classes (A/B vs. Class D) trade efficiency, heat, and sonic character – ventilation and mounting matter.',
          'Respect RMS matching: align amplifier continuous power with speaker handling at the target impedance, keeping 20–30% headroom.',
        ],
        actionSteps: [
          'Map every speaker or subwoofer to a dedicated channel and note the required RMS/impedance on a build sheet.',
          'Plan amplifier placement with airflow, serviceability, and cable routing in mind; add spacers or ducts if mounting under panels.',
          'Stock the hardware: distribution blocks, ANL/mini-ANL fusing, and ground lugs sized to your amplifier draw.',
        ],
        references: ['Car Audio & AV Bible · Section 1.2'],
      },
      {
        id: 'section-1-3',
        title: 'Section 1.3 · Wiring, Fusing & Power Delivery',
        focus: 'Treat power wire as the system’s lifeblood – undersized or cheap conductors cap performance and risk failure.',
        keyPoints: [
          'Use oxygen-free copper (OFC) for power/ground runs; copper-clad aluminum (CCA) drops current capacity and heats up.',
          'Gauge selection is current-based: calculate amplifier draw, include safety margin, and size fuse + distribution accordingly.',
          'Fuse placement (within 18" of the battery, plus downstream blocks) and short, clean grounds stop catastrophic faults.',
        ],
        actionSteps: [
          'Blueprint the power path: battery → main fuse → distribution → amplifiers; note cable lengths and gauge for each leg.',
          'Plan a “Big 3” upgrade (battery positive, chassis ground, engine ground) when total current draw spikes or dimming appears.',
          'Prep surfaces: sand to bare metal, treat with protectant, and torque fasteners to spec for every ground point.',
        ],
        references: ['Car Audio & AV Bible · Section 1.3'],
      },
      {
        id: 'section-1-4',
        title: 'Section 1.4 · Electrical Fundamentals',
        focus: 'Use Ohm’s law to predict amplifier behavior, speaker loads, and safe wiring combinations.',
        keyPoints: [
          'Voltage, current, and resistance are inseparable; halving impedance doubles current draw and stresses both amplifier and wiring.',
          'Know your amplifier’s stable load – running below-rated impedance invites clipping, heat, and protection faults.',
          'Series/parallel wiring of multi-voice-coil subs changes load drastically; plan combinations on paper before soldering.',
        ],
        actionSteps: [
          'Calculate net impedance for every speaker set you intend to bridge or parallel.',
          'Use a DMM to verify resistance at the amplifier terminals before powering up.',
          'Document expected rail voltage/current draw so you can diagnose problems later.',
        ],
        references: ['Car Audio & AV Bible · Section 1.4'],
      },
    ],
  },
  {
    id: 'part-2',
    title: 'Part 2 · The Voice – Transducers & Enclosures',
    summary:
      'Speakers and subwoofers translate electrical energy into emotion. Proper driver selection and enclosure design define the system’s sonic signature.',
    sections: [
      {
        id: 'section-2-1',
        title: 'Section 2.1 · Speakers Demystified',
        focus: 'Match driver topology, materials, and mounting to the vehicle’s acoustic realities.',
        keyPoints: [
          'Coaxial speakers simplify installs; component sets unlock staging and imaging when paired with custom tweeter placement.',
          'Sensitivity, frequency response, and crossover slope dictate how easily speakers blend with subs and amplifiers.',
          'Vehicle doors need sealing and baffles to act as enclosures; flimsy mounting robs midbass and invites rattles.',
        ],
        actionSteps: [
          'Measure factory openings (diameter, depth, mounting points) and plan for adapters or fabrication.',
          'Decide passive vs. active crossovers early; it changes amplifier channel count and DSP routing.',
          'Use foam gaskets, fasteners, and damping tiles to stiffen doors and focus energy into the cabin.',
        ],
        references: ['Car Audio & AV Bible · Section 2.1'],
      },
      {
        id: 'section-2-2',
        title: 'Section 2.2 · Subwoofers & Enclosure Design',
        focus: 'Low-frequency authority hinges on proper enclosure volume, tuning, and amplifier synergy.',
        keyPoints: [
          'Choose enclosure style to match goals: sealed for accuracy, ported for output, bandpass/passive radiator for specialized tuning.',
          'Thiele/Small parameters (Fs, Qts, Vas) and recommended airspace matter – deviating changes response drastically.',
          'Dual voice-coil subs offer wiring flexibility but require precise load planning to keep amplifiers happy.',
        ],
        actionSteps: [
          'Define target response (tight SQ vs. max SPL) and select enclosure alignment accordingly.',
          'Model volume and port dimensions before cutting wood; use bracing, glue, and gasket tape to seal joints.',
          'Address airflow and cooling when placing enclosures in trunks or under seats.',
        ],
        references: ['Car Audio & AV Bible · Section 2.2'],
      },
    ],
  },
  {
    id: 'part-3',
    title: 'Part 3 · The Brain – Signal Processing & Control',
    summary:
      'Digital processing is the lever that overcomes cabin asymmetry. The Bible treats DSP work as mandatory for truly high-fidelity sound.',
    sections: [
      {
        id: 'section-3-1',
        title: 'Section 3.1 · Digital Signal Processors (DSPs)',
        focus: 'Time-alignment, routing, and custom target curves transform raw hardware into a coherent soundstage.',
        keyPoints: [
          'DSPs sum factory sources, provide flexible inputs/outputs, and enable fully active crossovers per driver.',
          'Time alignment equalizes arrival times so vocals center on the dash instead of the door closest to the driver.',
          'Accurate tuning hinges on measurement mics, repeatable test tracks, and methodical adjustments.',
        ],
        actionSteps: [
          'Inventory channels: assign DSP inputs to every source and map outputs to each amplifier channel.',
          'Create a baseline tune (crossover points, time delays, starter EQ) before chasing fine detail.',
          'Schedule measurement sessions with an RTA or at least calibrated ears + reference tracks.',
        ],
        references: ['Car Audio & AV Bible · Section 3.1'],
      },
      {
        id: 'section-3-2',
        title: 'Section 3.2 · Equalizers & Crossovers',
        focus: 'Shape frequency response and speaker protection with purpose-built filters.',
        keyPoints: [
          'Graphic vs. parametric EQ: parametric filters offer precise control of frequency, Q, and gain for problem solving.',
          'High-pass, low-pass, and band-pass filters protect drivers and prevent overlap that causes comb filtering.',
          'Filter slopes (6–48 dB/octave) determine how aggressively frequencies roll off; steeper slopes suit active systems.',
        ],
        actionSteps: [
          'Set protective high-pass filters for mids/tweeters before applying any EQ boost.',
          'Use EQ cuts to tame peaks; apply boosts sparingly to avoid exhausting amplifier headroom.',
          'Document crossover points, slopes, and EQ moves so you can revert if experiments fail.',
        ],
        references: ['Car Audio & AV Bible · Section 3.2'],
      },
    ],
  },
  {
    id: 'part-4',
    title: 'Part 4 · The Environment – In-Car Acoustics & Treatment',
    summary:
      'Master the cabin itself. Reflections, resonance, and panel buzz can undo even the best speakers unless you treat them.',
    sections: [
      {
        id: 'section-4-1',
        title: 'Section 4.1 · In-Vehicle Acoustics',
        focus: 'Understand frequency response, soundstage, and imaging to set realistic tuning goals.',
        keyPoints: [
          'Cabin size and asymmetry create peaks/dips; measurement reveals where to apply EQ or physical tweaks.',
          'Soundstage width, depth, and height depend on matching arrival times and minimizing reflections.',
          'Imaging precision requires consistent polar response from tweeters/mids and equal path length to ears.',
        ],
        actionSteps: [
          'Measure baseline response from the driver seat to identify dominant room modes.',
          'Aim tweeters strategically (A-pillars, sail panels) to simulate a centered stage.',
          'Set a target curve (slight downward tilt) and iterate until the stage locks in.',
        ],
        references: ['Car Audio & AV Bible · Section 4.1'],
      },
      {
        id: 'section-4-2',
        title: 'Section 4.2 · Acoustic Treatment',
        focus: 'Control resonance and noise with layered materials: deadeners, decouplers, and absorbers.',
        keyPoints: [
          'Constrained-layer damping (CLD) on outer door skins stops panel resonance and rattles.',
          'Closed-cell foam decouples trim panels; mass-loaded vinyl (MLV) blocks road noise on floors/firewalls.',
          'Trunks and hatch areas benefit from bracing and foam to keep subwoofer energy from shaking panels.',
        ],
        actionSteps: [
          'Prioritize doors, floors, and wheel wells; treat in layers (CLD → foam → MLV).',
          'Use rollers and heat to bond damping sheets fully; seal seams with aluminum tape.',
          'Plan reassembly workflow so wiring and fasteners remain accessible after treatment.',
        ],
        references: ['Car Audio & AV Bible · Section 4.2'],
      },
    ],
  },
  {
    id: 'part-5',
    title: 'Part 5 · Beyond Audio – Integrated AV',
    summary:
      'Augment the build with passenger entertainment, safety cameras, and navigation while keeping usability front and center.',
    sections: [
      {
        id: 'section-5-1',
        title: 'Section 5.1 · Video & Rear-Seat Entertainment',
        focus: 'Design screen layouts and signal paths that are safe, legal, and maintainable.',
        keyPoints: [
          'Modern double-DIN and floating receivers provide HDMI inputs, high-res playback, and screen mirroring.',
          'Rear-seat entertainment can be overhead, headrest, or tablet-based – each needs proper mounting and power.',
          'Parking brake lockouts and safety interlocks are non-negotiable; video front-of-dash must disable while driving.',
        ],
        actionSteps: [
          'Decide on content sources (USB, streaming stick, console) and verify the head unit’s inputs support them.',
          'Route video, power, and audio lines cleanly through seat frames and pillars using loom and strain relief.',
          'Document how to update firmware, apps, or streaming credentials for the next owner/user.',
        ],
        references: ['Car Audio & AV Bible · Section 5.1'],
      },
      {
        id: 'section-5-2',
        title: 'Section 5.2 · Cameras & Navigation',
        focus: 'Increase safety and situational awareness with multi-camera integration and reliable routing tools.',
        keyPoints: [
          'Most receivers auto-switch to backup camera feeds in reverse; add front/side inputs for off-road or parking aids.',
          'Dash cameras and DVR systems require constant power plus event trigger wiring – plan battery protection.',
          'Integrated navigation thrives on external GPS antennas and regular map updates; smartphone nav still needs strong data signal.',
        ],
        actionSteps: [
          'Map camera coverage (rear, front, blind-spot) and ensure the head unit or switcher has enough inputs.',
          'Fuse camera power leads separately to avoid dropping the entire AV system if a camera shorts.',
          'Mount GPS and digital compasses away from metal obstructions to maintain accuracy.',
        ],
        references: ['Car Audio & AV Bible · Section 5.2'],
      },
    ],
  },
  {
    id: 'part-6',
    title: 'Part 6 · The Blueprint – System Design & Tuning',
    summary:
      'Decide what you are building (SQ vs. SPL) and execute calibration with discipline so equipment lives a long, loud life.',
    sections: [
      {
        id: 'section-6-1',
        title: 'Section 6.1 · SQ vs. SPL Strategy',
        focus: 'Clarify your mission statement before purchasing gear or laying wire.',
        keyPoints: [
          'Sound Quality builds chase realism: wide soundstage, accurate imaging, low distortion, controlled bass.',
          'Sound Pressure Level builds prioritize sheer output: high-efficiency drivers, larger enclosures, multiple alternators/batteries.',
          'Hybrid builds are possible, but compromises must be explicit – especially regarding enclosure tuning and interior comfort.',
        ],
        actionSteps: [
          'Write down your top three listening priorities and score each candidate component against them.',
          'Assess electrical upgrades needed (high-output alternator, additional batteries, big-3 wiring) for SPL ambitions.',
          'Plan system expandability (extra channels, DSP outputs) if you expect the mission to evolve.',
        ],
        references: ['Car Audio & AV Bible · Section 6.1'],
      },
      {
        id: 'section-6-2',
        title: 'Section 6.2 · Gain Setting & Clipping Prevention',
        focus: 'Protect speakers and maintain fidelity by matching source voltage to amplifier input sensitivity.',
        keyPoints: [
          'Gain is input sensitivity, not a volume knob – it should be set once, using clean reference signals.',
          'Clipping destroys tweeters and subs; watch for early warning signs (harshness, heat, smell) during tests.',
          'Use diagnostic tools: true-RMS multimeters, oscilloscopes, or distortion meters improve accuracy.',
        ],
        actionSteps: [
          'Generate test tones (0 dBFS, 40 Hz for subs, 1 kHz for mids/tweeters) and play them from the head unit at max clean volume.',
          'Adjust each amplifier gain until just before clipping; lock knobs with paint or covers to avoid future tampering.',
          'Re-check gains after any source change, DSP adjustment, or electrical upgrade.',
        ],
        references: ['Car Audio & AV Bible · Section 6.2'],
      },
    ],
  },
  {
    id: 'part-7',
    title: 'Part 7 · The Toolbox – Installation & Troubleshooting',
    summary:
      'Successful installs rely on the right tools, repeatable processes, and a troubleshooting mindset when noise or failures appear.',
    sections: [
      {
        id: 'section-7-1',
        title: 'Section 7.1 · Essential Tools & Workshop Setup',
        focus: 'Equip yourself for clean fabrication, safe wiring, and accurate measurement.',
        keyPoints: [
          'Trim tools, socket sets, crimpers, and heat shrink are the baseline for every install.',
          'Advanced tools – RTA, clamp meters, oscilloscopes – accelerate tuning and diagnosis.',
          'Safety gear (gloves, eye protection, battery disconnect tools) prevents injuries and electrical mishaps.',
        ],
        actionSteps: [
          'Assemble tool kits by job type: disassembly, wiring, fabrication, calibration.',
          'Label storage bins for fastener reuse and keep torque specs handy for critical bolts.',
          'Invest in a quality soldering station and practice on scrap wire before touching the vehicle.',
        ],
        references: ['Car Audio & AV Bible · Section 7.1'],
      },
      {
        id: 'section-7-2',
        title: 'Section 7.2 · Troubleshooting Playbook',
        focus: 'Trace noise, distortion, and dropouts methodically to protect gear and sanity.',
        keyPoints: [
          'Alternator whine usually means ground potential differences – inspect every ground and signal cable path.',
          'Voltage sag/dimming points to undersized wiring or tired charging systems; verify with load testing.',
          'Intermittent channel loss can stem from pinched wires, loose set screws, or DSP routing errors.',
        ],
        actionSteps: [
          'Build a checklist: power integrity, grounds, signal path, processors, speakers – verify each in order.',
          'Carry spare fuses, RCAs, and test leads to isolate faults quickly in the field.',
          'Log every issue and fix so recurring problems reveal patterns.',
        ],
        references: ['Car Audio & AV Bible · Section 7.2'],
      },
    ],
  },
];

export const guideResources = [
  {
    id: 'resource-bible',
    title: 'Read the Full Car Audio & AV Bible',
    description: 'Original 100+ page reference that inspired these summaries. Dive into the complete text, source notes, and diagrams.',
    href: '/guides/car-audio-av-bible.html',
  },
  {
    id: 'resource-checklist',
    title: 'Printable System Design Checklist',
    description: 'Use the chapter action steps as a pre-install worksheet to keep planning organized.',
    href: '#part-6',
  },
];

export default guideChapters;
