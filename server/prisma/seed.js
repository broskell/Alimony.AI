import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const LAWYERS = [
  { firstName: 'Priya', lastName: 'Sharma', state: 'Delhi', city: 'New Delhi', court: 'Delhi High Court', bar: 'DL/2891/2008', year: 2008, fee: 5500, specs: ['Matrimonial Law', 'Domestic Violence', 'Child Custody'], langs: ['Hindi', 'English'], rating: 4.8, reviews: 124 },
  { firstName: 'Rajan', lastName: 'Mehta', state: 'Maharashtra', city: 'Mumbai', court: 'Bombay High Court', bar: 'MH/4521/2005', year: 2005, fee: 8000, specs: ['Matrimonial Law', 'NRI Divorce', 'Property Division'], langs: ['Hindi', 'English', 'Marathi'], rating: 4.9, reviews: 210 },
  { firstName: 'Lakshmi', lastName: 'Iyer', state: 'Tamil Nadu', city: 'Chennai', court: 'Madras High Court', bar: 'TN/3312/2010', year: 2010, fee: 4200, specs: ['Matrimonial Law', 'Maintenance', 'Custody'], langs: ['Tamil', 'English'], rating: 4.6, reviews: 89 },
  { firstName: 'Arjun', lastName: 'Reddy', state: 'Telangana', city: 'Hyderabad', court: 'Telangana High Court', bar: 'TS/1890/2012', year: 2012, fee: 3800, specs: ['Matrimonial Law', 'DV Act', 'CrPC 125'], langs: ['Telugu', 'English', 'Hindi'], rating: 4.7, reviews: 67 },
  { firstName: 'Anita', lastName: 'Desai', state: 'Karnataka', city: 'Bangalore', court: 'Karnataka High Court', bar: 'KA/5567/2009', year: 2009, fee: 4500, specs: ['Matrimonial Law', 'Property Division'], langs: ['Kannada', 'English', 'Hindi'], rating: 4.5, reviews: 95 },
  { firstName: 'Vikram', lastName: 'Singh', state: 'Punjab', city: 'Chandigarh', court: 'Punjab & Haryana High Court', bar: 'CH/2234/2007', year: 2007, fee: 3500, specs: ['Matrimonial Law', 'Child Custody'], langs: ['Punjabi', 'Hindi', 'English'], rating: 4.4, reviews: 56 },
  { firstName: 'Meera', lastName: 'Nair', state: 'Kerala', city: 'Kochi', court: 'Kerala High Court', bar: 'KL/7789/2011', year: 2011, fee: 3200, specs: ['Matrimonial Law', 'Maintenance'], langs: ['Malayalam', 'English'], rating: 4.6, reviews: 43 },
  { firstName: 'Suresh', lastName: 'Patel', state: 'Gujarat', city: 'Ahmedabad', court: 'Gujarat High Court', bar: 'GJ/3345/2006', year: 2006, fee: 4000, specs: ['Matrimonial Law', 'Property Division', 'NRI Divorce'], langs: ['Gujarati', 'Hindi', 'English'], rating: 4.7, reviews: 78 },
  { firstName: 'Kavita', lastName: 'Joshi', state: 'Rajasthan', city: 'Jaipur', court: 'Rajasthan High Court', bar: 'RJ/1123/2013', year: 2013, fee: 2800, specs: ['Matrimonial Law', 'DV Act'], langs: ['Hindi', 'English'], rating: 4.3, reviews: 34 },
  { firstName: 'Rohit', lastName: 'Banerjee', state: 'West Bengal', city: 'Kolkata', court: 'Calcutta High Court', bar: 'WB/6678/2004', year: 2004, fee: 5000, specs: ['Matrimonial Law', 'Custody', 'Maintenance'], langs: ['Bengali', 'Hindi', 'English'], rating: 4.8, reviews: 156 },
  { firstName: 'Deepa', lastName: 'Kulkarni', state: 'Maharashtra', city: 'Pune', court: 'Bombay High Court', bar: 'MH/9901/2014', year: 2014, fee: 3000, specs: ['Matrimonial Law', 'CrPC 125'], langs: ['Marathi', 'Hindi', 'English'], rating: 4.5, reviews: 41 },
  { firstName: 'Amit', lastName: 'Verma', state: 'Uttar Pradesh', city: 'Lucknow', court: 'Allahabad High Court', bar: 'UP/4456/2008', year: 2008, fee: 2500, specs: ['Matrimonial Law', 'Maintenance'], langs: ['Hindi', 'English'], rating: 4.2, reviews: 28 },
  { firstName: 'Sunita', lastName: 'Rao', state: 'Karnataka', city: 'Mangalore', court: 'Karnataka High Court', bar: 'KA/2234/2015', year: 2015, fee: 2200, specs: ['Matrimonial Law', 'DV Act'], langs: ['Kannada', 'English'], rating: 4.4, reviews: 19 },
  { firstName: 'Harish', lastName: 'Chopra', state: 'Delhi', city: 'New Delhi', court: 'Delhi High Court', bar: 'DL/1122/2003', year: 2003, fee: 7500, specs: ['NRI Divorce', 'Property Division', 'Matrimonial Law'], langs: ['Hindi', 'English', 'Punjabi'], rating: 4.9, reviews: 198 },
  { firstName: 'Neha', lastName: 'Gupta', state: 'Delhi', city: 'New Delhi', court: 'Delhi High Court', bar: 'DL/5567/2016', year: 2016, fee: 3500, specs: ['Matrimonial Law', 'Child Custody'], langs: ['Hindi', 'English'], rating: 4.6, reviews: 52 },
  { firstName: 'Karthik', lastName: 'Subramanian', state: 'Tamil Nadu', city: 'Coimbatore', court: 'Madras High Court', bar: 'TN/8890/2012', year: 2012, fee: 2800, specs: ['Matrimonial Law', 'Maintenance'], langs: ['Tamil', 'English'], rating: 4.3, reviews: 31 },
  { firstName: 'Fatima', lastName: 'Khan', state: 'Maharashtra', city: 'Mumbai', court: 'Bombay High Court', bar: 'MH/3344/2010', year: 2010, fee: 4800, specs: ['Matrimonial Law', 'DV Act', 'CrPC 125'], langs: ['Hindi', 'Urdu', 'English'], rating: 4.7, reviews: 73 },
  { firstName: 'Sanjay', lastName: 'Malhotra', state: 'Punjab', city: 'Ludhiana', court: 'Punjab & Haryana High Court', bar: 'PB/7788/2009', year: 2009, fee: 3200, specs: ['Matrimonial Law', 'Property Division'], langs: ['Punjabi', 'Hindi', 'English'], rating: 4.5, reviews: 47 },
  { firstName: 'Revathi', lastName: 'Menon', state: 'Kerala', city: 'Thiruvananthapuram', court: 'Kerala High Court', bar: 'KL/2233/2013', year: 2013, fee: 2900, specs: ['Matrimonial Law', 'Custody'], langs: ['Malayalam', 'English'], rating: 4.4, reviews: 25 },
  { firstName: 'Ashok', lastName: 'Tiwari', state: 'Madhya Pradesh', city: 'Bhopal', court: 'Madhya Pradesh High Court', bar: 'MP/5566/2011', year: 2011, fee: 2400, specs: ['Matrimonial Law', 'Maintenance', 'DV Act'], langs: ['Hindi', 'English'], rating: 4.3, reviews: 22 },
];

const ACTS = [
  {
    name: 'Hindu Marriage Act 1955', shortName: 'HMA', year: 1955,
    description: 'Governs marriage and divorce among Hindus, including maintenance and alimony.',
    sections: [
      { number: 'Section 24', title: 'Maintenance pendente lite and expenses', text: 'Where in any proceeding under this Act it appears to the court that either the wife or the husband, as the case may be, has no independent income sufficient for her or his support and the necessary expenses of the proceeding, it may, on the application of the wife or the husband, order the respondent to pay to the petitioner the expenses of the proceeding, and monthly during the proceeding such sum as, having regard to the petitioner\'s own income and the income of the respondent, it may seem to the court to be reasonable.', keywords: ['interim', 'maintenance', 'pendente lite'], relevance: 'alimony' },
      { number: 'Section 25', title: 'Permanent alimony and maintenance', text: 'The court may, at the time of passing any decree or at any time subsequent thereto, on application made to it for the purpose by either the wife or the husband, order that the respondent shall pay to the applicant for her or his maintenance and support such gross sum or such monthly or periodical sum for a term not exceeding the life of the applicant as, having regard to the respondent\'s own income and other property, the income and other property of the applicant, the conduct of the parties and other circumstances of the case, it may seem to the court to be just.', keywords: ['permanent', 'alimony', 'maintenance'], relevance: 'alimony' },
    ],
  },
  {
    name: 'Code of Criminal Procedure Section 125', shortName: 'CrPC125', year: 1973,
    description: 'Criminal procedure for maintenance of wives, children and parents.',
    sections: [
      { number: 'Section 125', title: 'Order for maintenance of wives, children and parents', text: 'If any person having sufficient means neglects or refuses to maintain his wife, unable to maintain herself, or his legitimate or illegitimate minor child, whether married or not, unable to maintain itself, or his legitimate or illegitimate child (not being a married daughter) who has attained majority, where such child is, by reason of any physical or mental abnormality or injury unable to maintain itself, or his father or mother, unable to maintain himself or herself, a Magistrate may order such person to make a monthly allowance for the maintenance of his wife or such child, father or mother, at such monthly rate as such Magistrate thinks fit.', keywords: ['maintenance', 'wife', 'criminal'], relevance: 'maintenance' },
    ],
  },
  {
    name: 'Special Marriage Act 1954', shortName: 'SMA', year: 1954,
    description: 'Provides for civil marriages and maintenance for inter-faith couples.',
    sections: [
      { number: 'Section 36', title: 'Alimony pendente lite', text: 'Where in any proceeding under Chapter V or VI it appears to the district court that the wife or the husband, as the case may be, has no independent income sufficient for her or his support and the necessary expenses of the proceeding, it may, on the application of the wife or the husband, order the respondent to pay the expenses of the proceeding and monthly during the proceeding such sum as it may consider reasonable.', keywords: ['interim', 'alimony'], relevance: 'alimony' },
      { number: 'Section 37', title: 'Permanent alimony and maintenance', text: 'The district court may, at the time of passing any decree or at any time subsequent thereto, on application made to it for the purpose by either the wife or the husband, order that the respondent shall pay to the applicant for her or his maintenance and support such gross sum or such monthly or periodical sum for a term not exceeding the life of the applicant as, having regard to the respondent\'s own income and other property, it may seem to the court to be just.', keywords: ['permanent', 'alimony'], relevance: 'alimony' },
    ],
  },
  {
    name: 'Protection of Women from Domestic Violence Act 2005', shortName: 'DV', year: 2005,
    description: 'Protection and relief for women facing domestic violence including monetary relief.',
    sections: [
      { number: 'Section 20', title: 'Monetary reliefs', text: 'While disposing of an application under sub-section (1) of section 12, the Magistrate may direct the respondent to pay monetary relief to meet the expenses incurred and losses suffered by the aggrieved person and any child of the aggrieved person as a result of the domestic violence.', keywords: ['monetary', 'relief', 'domestic violence'], relevance: 'maintenance' },
    ],
  },
  {
    name: 'Hindu Adoption and Maintenance Act 1956', shortName: 'HAMA', year: 1956,
    description: 'Maintenance obligations among Hindus including wives and widows.',
    sections: [
      { number: 'Section 18', title: 'Maintenance of wife', text: 'Subject to the provisions of this section, a Hindu wife, whether married before or after the commencement of this Act, shall be entitled to be maintained by her husband during her lifetime.', keywords: ['wife', 'maintenance', 'hindu'], relevance: 'maintenance' },
    ],
  },
];

const PRECEDENTS = [
  { citation: 'Manish Jain v. Kavita Jain, AIR 2018 SC 445', court: 'Supreme Court of India', year: 2018, parties: 'Manish Jain v. Kavita Jain', summary: 'Supreme Court clarified principles for determining maintenance quantum in matrimonial disputes.', holding: 'Maintenance must be fair and based on the standard of living and income of both parties.', relevance: ['maintenance', 'alimony'], acts: ['HMA', 'CrPC125'] },
  { citation: 'Rajnesh v. Neha, (2020) 4 SCC 153', court: 'Supreme Court of India', year: 2020, parties: 'Rajnesh v. Neha', summary: 'Landmark judgment establishing comprehensive guidelines for maintenance under Section 125 CrPC and HMA.', holding: 'Courts must consider income disparity, standard of living, and marriage duration; maintenance typically 25% of income gap.', relevance: ['maintenance', 'alimony'], acts: ['HMA', 'CrPC125'] },
  { citation: 'Bhuwan Mohan Singh v. Meena, (2015) 6 SCC 353', court: 'Supreme Court of India', year: 2015, parties: 'Bhuwan Mohan Singh v. Meena', summary: "Wife's right to maintenance at a standard commensurate with marital lifestyle.", holding: 'Maintenance should enable the claimant to live with reasonable parity to the marital standard.', relevance: ['maintenance', 'alimony'], acts: ['HMA'] },
  { citation: 'Kusumita Bora v. Pratim Bora, (2021) 3 SCC 742', court: 'Supreme Court of India', year: 2021, parties: 'Kusumita Bora v. Pratim Bora', summary: 'Interim maintenance under Section 24 HMA must be granted expeditiously.', holding: 'Delay in interim maintenance causes hardship; courts should pass orders within reasonable time.', relevance: ['maintenance'], acts: ['HMA'] },
  { citation: 'Shail Kumari Devi v. Krishan Bhagwan Pathak, AIR 2008 SC 3208', court: 'Supreme Court of India', year: 2008, parties: 'Shail Kumari Devi v. Krishan Bhagwan Pathak', summary: 'CrPC Section 125 maintenance is a summary remedy independent of matrimonial proceedings.', holding: 'Magistrate can award maintenance even when divorce proceedings are pending in civil court.', relevance: ['maintenance'], acts: ['CrPC125'] },
];

async function main() {
  console.log('Seeding Alimony.AI database...');
  await prisma.savedLawyer.deleteMany();
  await prisma.consultation.deleteMany();
  await prisma.hearing.deleteMany();
  await prisma.document.deleteMany();
  await prisma.alimonyCal.deleteMany();
  await prisma.chatSession.deleteMany();
  await prisma.case.deleteMany();
  await prisma.lawyerProfile.deleteMany();
  await prisma.legalSection.deleteMany();
  await prisma.legalAct.deleteMany();
  await prisma.casePrecedent.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Demo@1234', 12);

  const client = await prisma.user.create({
    data: { email: 'client@demo.com', passwordHash, firstName: 'Ananya', lastName: 'Kapoor', role: 'CLIENT', state: 'Delhi', city: 'New Delhi', phone: '+91 98765 43210' },
  });

  const lawyerUser = await prisma.user.create({
    data: { email: 'lawyer@demo.com', passwordHash, firstName: 'Priya', lastName: 'Sharma', role: 'LAWYER', state: 'Delhi', city: 'New Delhi' },
  });

  await prisma.user.create({
    data: { email: 'admin@demo.com', passwordHash, firstName: 'Admin', lastName: 'User', role: 'ADMIN', state: 'Delhi', city: 'New Delhi' },
  });

  const demoLawyer = await prisma.lawyerProfile.create({
    data: {
      userId: lawyerUser.id,
      barNumber: 'DL/2891/2008',
      enrollmentYear: 2008,
      court: 'Delhi High Court',
      specializations: ['Matrimonial Law', 'Domestic Violence', 'Child Custody'],
      experience: 16,
      rating: 4.8,
      reviewCount: 124,
      feePerHour: 5500,
      feeConsultation: 2500,
      bio: 'Senior advocate specializing in matrimonial disputes with 16 years at Delhi High Court.',
      languages: ['Hindi', 'English'],
      verified: true,
      available: true,
      state: 'Delhi',
      city: 'New Delhi',
      highCourtBars: ['Delhi High Court', 'Supreme Court'],
    },
  });

  for (const l of LAWYERS) {
    if (l.bar === 'DL/2891/2008') continue;
    const email = `lawyer.${l.bar.replace(/\//g, '.')}@demo.alimony.ai`;
    const user = await prisma.user.create({
      data: { email, passwordHash, firstName: l.firstName, lastName: l.lastName, role: 'LAWYER', state: l.state, city: l.city },
    });
    await prisma.lawyerProfile.create({
      data: {
        userId: user.id,
        barNumber: l.bar,
        enrollmentYear: l.year,
        court: l.court,
        specializations: l.specs,
        experience: new Date().getFullYear() - l.year,
        rating: l.rating,
        reviewCount: l.reviews,
        feePerHour: l.fee,
        feeConsultation: Math.round(l.fee * 0.5),
        bio: `Advocate practicing ${l.specs[0]} at ${l.court}.`,
        languages: l.langs,
        verified: true,
        available: Math.random() > 0.2,
        state: l.state,
        city: l.city,
        highCourtBars: [l.court],
      },
    });
  }

  for (const act of ACTS) {
    const created = await prisma.legalAct.create({
      data: { name: act.name, shortName: act.shortName, year: act.year, description: act.description },
    });
    for (const s of act.sections) {
      await prisma.legalSection.create({
        data: { actId: created.id, ...s },
      });
    }
  }

  for (const p of PRECEDENTS) {
    await prisma.casePrecedent.create({ data: p });
  }

  const case1 = await prisma.case.create({
    data: {
      caseNumber: 'MACT/2024/001234',
      title: 'Kapoor v. Kapoor — Maintenance & Custody',
      court: 'Family Court, Tis Hazari',
      state: 'Delhi',
      clientId: client.id,
      lawyerId: demoLawyer.id,
      status: 'ACTIVE',
      filingDate: new Date('2024-03-15'),
      nextHearing: new Date('2024-08-20'),
      acts: ['HMA', 'CrPC125'],
      sections: ['Section 24', 'Section 25', 'Section 125'],
      description: '8-year marriage dissolution with interim maintenance pending. Husband employed in IT sector, wife homemaker with full career sacrifice.',
      aiSummary: 'Strong maintenance claim under HMA §25 with interim relief likely under §24.',
    },
  });

  await prisma.hearing.createMany({
    data: [
      { caseId: case1.id, date: new Date('2024-04-10'), court: 'Family Court, Tis Hazari', judge: 'Hon\'ble Ms. Justice R. Malhotra', outcome: 'Interim maintenance application listed', nextDate: new Date('2024-05-15') },
      { caseId: case1.id, date: new Date('2024-05-15'), court: 'Family Court, Tis Hazari', judge: 'Hon\'ble Ms. Justice R. Malhotra', outcome: 'Interim maintenance of ₹45,000/month granted', nextDate: new Date('2024-08-20') },
    ],
  });

  await prisma.case.create({
    data: {
      caseNumber: 'MACT/2023/009876',
      title: 'Kapoor — Property Settlement',
      court: 'District Court, Saket',
      state: 'Delhi',
      clientId: client.id,
      status: 'PENDING',
      filingDate: new Date('2023-11-01'),
      acts: ['HMA'],
      sections: ['Section 27'],
      description: 'Partition of matrimonial home and joint investments.',
    },
  });

  await prisma.case.create({
    data: {
      caseNumber: 'MACT/2024/005678',
      title: 'Interim Maintenance Review',
      court: 'Family Court, Tis Hazari',
      state: 'Delhi',
      clientId: client.id,
      lawyerId: demoLawyer.id,
      status: 'SETTLED',
      filingDate: new Date('2024-01-20'),
      acts: ['CrPC125'],
      sections: ['Section 125'],
      description: 'Review petition for enhancement of interim maintenance — settled at ₹55,000/month.',
      aiSummary: 'Settled with enhanced maintenance reflecting Rajnesh guidelines.',
    },
  });

  await prisma.alimonyCal.createMany({
    data: [
      {
        userId: client.id,
        state: 'Delhi',
        act: 'HMA',
        inputData: { act: 'HMA', state: 'Delhi', marriageYears: 8, yourIncome: 0, spouseIncome: 250000, children: 2, careerSacrifice: 'full', role: 'claimant' },
        result: { monthly: 52000, annual: 624000, total: 3744000, duration: 5, score: 78 },
      },
      {
        userId: client.id,
        state: 'Delhi',
        act: 'CrPC125',
        inputData: { act: 'CrPC125', state: 'Delhi', marriageYears: 8, yourIncome: 0, spouseIncome: 250000, children: 2, role: 'claimant' },
        result: { monthly: 48000, annual: 576000, total: 3456000, duration: 5, score: 72 },
      },
    ],
  });

  console.log('Seed complete.');
  console.log('Demo: client@demo.com / lawyer@demo.com / admin@demo.com — password: Demo@1234');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
