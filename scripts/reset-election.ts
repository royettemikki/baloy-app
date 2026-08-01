import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type CandidateSeed = {
  name: string;
  unit: string;
  statement: string;
  isIncumbent?: boolean;
  slate?: 'Unity Team' | 'Kapit-Bisig Slate' | null;
};

type PositionSeed = {
  title: string;
  seats: number;
  candidates: CandidateSeed[];
};

const positions: PositionSeed[] = [
  {
    title: 'President',
    seats: 1,
    candidates: [
      {
        name: 'Renata Osei',
        unit: '6C',
        isIncumbent: true,
        slate: 'Unity Team',
        statement:
          "I've served as Treasurer for two years and helped rebuild our reserve fund by 30%. As President, I'll focus on transparent budgeting and faster maintenance response times.",
      },
      {
        name: 'Marcus Ibarra',
        unit: '21A',
        slate: 'Kapit-Bisig Slate',
        statement:
          "I've led our landscaping committee for three years. I'd bring that same hands-on approach to the full board, with more resident input on major decisions.",
      },
    ],
  },
  {
    title: 'Vice President',
    seats: 1,
    candidates: [
      {
        name: 'Priya Chandran',
        unit: '9D',
        slate: 'Unity Team',
        statement:
          'As a CPA, I want clearer monthly financial reports shared with every resident, not just the board.',
      },
      {
        name: 'Owen Fletcher',
        unit: '3B',
        slate: null,
        statement:
          "I'm not aligned with any group. I'll listen to every unit equally and push for lower unnecessary spending.",
      },
    ],
  },
  {
    title: 'Secretary',
    seats: 1,
    candidates: [
      {
        name: 'Liza Domingo',
        unit: '11F',
        isIncumbent: true,
        slate: 'Kapit-Bisig Slate',
        statement:
          "I've kept our meeting minutes organized and on-time for two terms. I'll keep doing that, plus start publishing them online within 48 hours.",
      },
      {
        name: 'Carlo Mendoza',
        unit: '17B',
        slate: 'Unity Team',
        statement:
          'I want to modernize how we communicate — less paper flyers, more timely updates through the app.',
      },
    ],
  },
  {
    title: 'Election Committee',
    seats: 3,
    candidates: [
      {
        name: 'Bea Santos',
        unit: '4A',
        slate: null,
        statement:
          'Fair, transparent elections matter to me — I have no board ties and no agenda beyond that.',
      },
      {
        name: 'Jun Aquino',
        unit: '19C',
        isIncumbent: true,
        slate: 'Unity Team',
        statement:
          'I helped set up our current voting process last year and want to keep improving it.',
      },
      {
        name: 'Nora Villanueva',
        unit: '2E',
        slate: 'Kapit-Bisig Slate',
        statement:
          "I'll make sure every household actually gets notified before voting opens, not just a select few.",
      },
      {
        name: 'Ramon Cruz',
        unit: '13D',
        slate: null,
        statement:
          'Independent oversight keeps elections honest. That is what I will provide.',
      },
    ],
  },
  {
    title: 'Audit Committee',
    seats: 3,
    candidates: [
      {
        name: 'Grace Tan',
        unit: '8B',
        isIncumbent: true,
        slate: 'Unity Team',
        statement:
          'I have a background in accounting and have reviewed our books for the past year without a single discrepancy missed.',
      },
      {
        name: 'Danilo Reyes',
        unit: '22A',
        slate: 'Kapit-Bisig Slate',
        statement:
          'I want quarterly, not just annual, financial reviews — residents deserve more frequent visibility.',
      },
      {
        name: 'Michelle Bautista',
        unit: '5C',
        slate: null,
        statement:
          'I bring outside eyes with no board affiliation, which I think an audit committee genuinely needs.',
      },
      {
        name: 'Paolo Garcia',
        unit: '16E',
        slate: 'Unity Team',
        statement:
          'My background is in internal audits at a listed company — I want to bring that same rigor here.',
      },
    ],
  },
  {
    title: 'Grievance Committee',
    seats: 3,
    candidates: [
      {
        name: 'Teresa Lim',
        unit: '1D',
        isIncumbent: true,
        slate: 'Kapit-Bisig Slate',
        statement:
          "I've handled noise and parking disputes fairly for two years, and I want to keep doing that.",
      },
      {
        name: 'Alvin Torres',
        unit: '14A',
        slate: 'Unity Team',
        statement:
          'Disputes should be resolved faster than they currently are. I want a clear 5-day response standard.',
      },
      {
        name: 'Josefina Ramos',
        unit: '7F',
        slate: null,
        statement:
          'I have no personal stake in ongoing disputes and can mediate impartially.',
      },
      {
        name: 'Ricardo Flores',
        unit: '20B',
        slate: 'Kapit-Bisig Slate',
        statement:
          'I want more mediation, less escalation straight to formal complaints.',
      },
    ],
  },
  {
    title: 'Safety Committee',
    seats: 3,
    candidates: [
      {
        name: 'Ederlyn Castro',
        unit: '3F',
        isIncumbent: true,
        slate: 'Unity Team',
        statement:
          'I coordinated our gate code rollout last quarter and want to keep improving perimeter security.',
      },
      {
        name: 'Bayani Delacruz',
        unit: '18C',
        slate: null,
        statement:
          'I want visible security patrol hours posted, and CCTV coverage extended to the north lot.',
      },
      {
        name: 'Cecilia Manalo',
        unit: '9A',
        slate: 'Kapit-Bisig Slate',
        statement:
          'Fire safety and evacuation planning have been overlooked. I want that addressed first.',
      },
      {
        name: 'Vicente Ocampo',
        unit: '12D',
        slate: 'Unity Team',
        statement:
          "I'm a former security consultant and want to bring a proper risk assessment to this community.",
      },
    ],
  },
  {
    title: 'Environment Committee',
    seats: 3,
    candidates: [
      {
        name: 'Fely Navarro',
        unit: '6A',
        isIncumbent: true,
        slate: null,
        statement:
          'I started our composting pilot last year and want to expand it community-wide.',
      },
      {
        name: 'Rogelio Pascual',
        unit: '10E',
        slate: 'Unity Team',
        statement:
          'Better waste segregation and a real recycling schedule are overdue here.',
      },
      {
        name: 'Ana Belmonte',
        unit: '15B',
        slate: 'Kapit-Bisig Slate',
        statement:
          'I want more trees planted along the walkways and a real tree-maintenance budget line.',
      },
      {
        name: 'Herminia Salazar',
        unit: '4C',
        slate: null,
        statement:
          'Clean waterways matter to me — I want our drainage system properly inspected this year.',
      },
    ],
  },
  {
    title: 'Maintenance Committee',
    seats: 3,
    candidates: [
      {
        name: 'Boy Abalos',
        unit: '19A',
        isIncumbent: true,
        slate: 'Kapit-Bisig Slate',
        statement:
          'I manage the pool resurfacing project and want to keep overseeing major repairs directly.',
      },
      {
        name: 'Cristina Valdez',
        unit: '2B',
        slate: 'Unity Team',
        statement:
          'I want a public maintenance ticket tracker so residents can see repair status themselves.',
      },
      {
        name: 'Edgar Espinosa',
        unit: '17D',
        slate: null,
        statement:
          "I'm a licensed engineer and want technical oversight, not just vendor trust, on major repairs.",
      },
      {
        name: 'Marilou Sarmiento',
        unit: '8F',
        slate: 'Kapit-Bisig Slate',
        statement:
          'Preventive maintenance saves money long-term. I want a real annual inspection calendar.',
      },
    ],
  },
  {
    title: 'Social and Cultural Affairs Committee',
    seats: 3,
    candidates: [
      {
        name: 'Joy Fernandez',
        unit: '11C',
        isIncumbent: true,
        slate: 'Unity Team',
        statement:
          "I organized last year's block party and want more regular community events, not just once a year.",
      },
      {
        name: 'Ariel Padilla',
        unit: '5D',
        slate: null,
        statement:
          'I want events that actually fit every age group here, not just families with young kids.',
      },
      {
        name: 'Corazon Mercado',
        unit: '13A',
        slate: 'Kapit-Bisig Slate',
        statement:
          'Holiday decorations and a real budget for them have been missing for two years running.',
      },
      {
        name: 'Dennis Uy',
        unit: '20F',
        slate: 'Unity Team',
        statement:
          'I want a resident welcome program for new homeowners, something we currently do not have at all.',
      },
    ],
  },
];

async function main() {
  const votes = await prisma.vote.deleteMany({});
  const candidates = await prisma.candidate.deleteMany({});
  const positionRows = await prisma.position.deleteMany({});
  const slates = await prisma.slate.deleteMany({});
  const elections = await prisma.election.deleteMany({});

  console.log('Cleared:');
  console.log(`  ${votes.count} vote(s)`);
  console.log(`  ${candidates.count} candidate(s)`);
  console.log(`  ${positionRows.count} position(s)`);
  console.log(`  ${slates.count} slate(s)`);
  console.log(`  ${elections.count} election(s)`);

  const election = await prisma.election.create({
    data: {
      title: '2026 Board Election',
      closesAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      slates: {
        create: [
          { name: 'Unity Team', color: '#0F6E56' },
          { name: 'Kapit-Bisig Slate', color: '#B45309' },
        ],
      },
    },
  });

  const slateRows = await prisma.slate.findMany({
    where: { electionId: election.id },
  });
  const slateIdByName = new Map(slateRows.map((s) => [s.name, s.id]));

  for (const pos of positions) {
    await prisma.position.create({
      data: {
        electionId: election.id,
        title: pos.title,
        seats: pos.seats,
        candidates: {
          create: pos.candidates.map((c, index) => ({
            name: c.name,
            roleDescription: `Unit ${c.unit}`,
            statement: c.statement,
            ballotNumber: index + 1,
            isIncumbent: c.isIncumbent ?? false,
            slateId: c.slate ? slateIdByName.get(c.slate) : null,
          })),
        },
      },
    });
  }

  const totalCandidates = positions.reduce(
    (sum, p) => sum + p.candidates.length,
    0,
  );
  console.log(
    `\nCreated fresh election #${election.id} with ${positions.length} positions and ${totalCandidates} candidates.`,
  );
  console.log(`Closes ${election.closesAt}`);
}

main().finally(() => prisma.$disconnect());
