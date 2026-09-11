export type RosterEntry = {
  slug: string;
  name: string;
  role: string;
  era: string;
  files: string[];
};

/**
 * Reference photos are freely-licensed images from Wikimedia Commons,
 * downloaded into /public/players at build time.
 */
export const ROSTER: RosterEntry[] = [
  {
    slug: "virat-kohli",
    name: "Virat Kohli",
    role: "Top-order batter",
    era: "India · 2008–present",
    files: [
      "/players/virat-kohli-0.jpg",
      "/players/virat-kohli-2.jpg",
      "/players/virat-kohli-3.jpg",
      "/players/virat-kohli-4.jpg",
    ],
  },
  {
    slug: "rohit-sharma",
    name: "Rohit Sharma",
    role: "Opening batter · Captain",
    era: "India · 2007–present",
    files: ["/players/rohit-sharma-90.jpg", "/players/rohit-sharma-91.jpg"],
  },
  {
    slug: "ms-dhoni",
    name: "MS Dhoni",
    role: "Wicket-keeper batter",
    era: "India · 2004–2019",
    files: [
      "/players/ms-dhoni-1.jpg",
      "/players/ms-dhoni-90.jpg",
      "/players/ms-dhoni-91.jpg",
      "/players/ms-dhoni-92.jpg",
      "/players/ms-dhoni-93.jpg",
    ],
  },
  {
    slug: "sachin-tendulkar",
    name: "Sachin Tendulkar",
    role: "Top-order batter",
    era: "India · 1989–2013",
    files: [
      "/players/sachin-tendulkar-0.jpg",
      "/players/sachin-tendulkar-1.jpg",
      "/players/sachin-tendulkar-2.jpg",
      "/players/sachin-tendulkar-90.jpg",
      "/players/sachin-tendulkar-91.jpg",
    ],
  },
  {
    slug: "jasprit-bumrah",
    name: "Jasprit Bumrah",
    role: "Right-arm fast bowler",
    era: "India · 2016–present",
    files: [
      "/players/jasprit-bumrah-0.jpg",
      "/players/jasprit-bumrah-90.jpg",
      "/players/jasprit-bumrah-91.jpg",
      "/players/jasprit-bumrah-92.jpg",
      "/players/jasprit-bumrah-93.jpg",
    ],
  },
  {
    slug: "ravindra-jadeja",
    name: "Ravindra Jadeja",
    role: "All-rounder",
    era: "India · 2009–present",
    files: [
      "/players/ravindra-jadeja-0.jpg",
      "/players/ravindra-jadeja-2.jpg",
      "/players/ravindra-jadeja-3.jpg",
      "/players/ravindra-jadeja-90.jpg",
      "/players/ravindra-jadeja-91.jpg",
    ],
  },
  {
    slug: "kl-rahul",
    name: "KL Rahul",
    role: "Batter · Wicket-keeper",
    era: "India · 2014–present",
    files: [
      "/players/kl-rahul-2.jpg",
      "/players/kl-rahul-90.jpg",
      "/players/kl-rahul-91.jpg",
      "/players/kl-rahul-92.jpg",
      "/players/kl-rahul-93.jpg",
    ],
  },
  {
    slug: "hardik-pandya",
    name: "Hardik Pandya",
    role: "Seam-bowling all-rounder",
    era: "India · 2016–present",
    files: [
      "/players/hardik-pandya-90.jpg",
      "/players/hardik-pandya-91.jpg",
      "/players/hardik-pandya-92.jpg",
      "/players/hardik-pandya-93.jpg",
      "/players/hardik-pandya-94.jpg",
    ],
  },
  {
    slug: "rishabh-pant",
    name: "Rishabh Pant",
    role: "Wicket-keeper batter",
    era: "India · 2017–present",
    files: [
      "/players/rishabh-pant-0.jpg",
      "/players/rishabh-pant-1.jpg",
      "/players/rishabh-pant-3.jpg",
      "/players/rishabh-pant-90.jpg",
      "/players/rishabh-pant-91.jpg",
    ],
  },
  {
    slug: "shubman-gill",
    name: "Shubman Gill",
    role: "Opening batter",
    era: "India · 2019–present",
    files: [
      "/players/shubman-gill-0.jpg",
      "/players/shubman-gill-3.jpg",
      "/players/shubman-gill-90.jpg",
      "/players/shubman-gill-91.jpg",
      "/players/shubman-gill-92.jpg",
    ],
  },
  {
    slug: "mohammed-shami",
    name: "Mohammed Shami",
    role: "Right-arm fast bowler",
    era: "India · 2013–present",
    files: [
      "/players/mohammed-shami-0.jpg",
      "/players/mohammed-shami-1.jpg",
      "/players/mohammed-shami-2.jpg",
      "/players/mohammed-shami-4.jpg",
    ],
  },
  {
    slug: "yuzvendra-chahal",
    name: "Yuzvendra Chahal",
    role: "Leg-spin bowler",
    era: "India · 2016–present",
    files: [
      "/players/yuzvendra-chahal-0.jpg",
      "/players/yuzvendra-chahal-90.jpg",
      "/players/yuzvendra-chahal-91.jpg",
    ],
  },
  {
    slug: "suryakumar-yadav",
    name: "Suryakumar Yadav",
    role: "Middle-order batter",
    era: "India · 2021–present",
    files: [
      "/players/suryakumar-yadav-1.jpg",
      "/players/suryakumar-yadav-90.jpg",
      "/players/suryakumar-yadav-91.jpg",
      "/players/suryakumar-yadav-92.jpg",
      "/players/suryakumar-yadav-93.jpg",
    ],
  },
  {
    slug: "ravichandran-ashwin",
    name: "Ravichandran Ashwin",
    role: "Off-spin all-rounder",
    era: "India · 2010–2024",
    files: [
      "/players/ravichandran-ashwin-1.jpg",
      "/players/ravichandran-ashwin-2.jpg",
      "/players/ravichandran-ashwin-3.jpg",
      "/players/ravichandran-ashwin-4.jpg",
    ],
  },
  {
    slug: "shikhar-dhawan",
    name: "Shikhar Dhawan",
    role: "Opening batter",
    era: "India · 2010–2022",
    files: [
      "/players/shikhar-dhawan-0.jpg",
      "/players/shikhar-dhawan-1.jpg",
      "/players/shikhar-dhawan-2.jpg",
      "/players/shikhar-dhawan-90.jpg",
      "/players/shikhar-dhawan-91.jpg",
    ],
  },
  {
    slug: "anil-kumble",
    name: "Anil Kumble",
    role: "Leg-spin bowler",
    era: "India · 1990–2008",
    files: [
      "/players/anil-kumble-1.jpg",
      "/players/anil-kumble-2.jpg",
      "/players/anil-kumble-3.jpg",
      "/players/anil-kumble-90.jpg",
      "/players/anil-kumble-91.jpg",
    ],
  },
  {
    slug: "rahul-dravid",
    name: "Rahul Dravid",
    role: "Top-order batter",
    era: "India · 1996–2012",
    files: [
      "/players/rahul-dravid-0.jpg",
      "/players/rahul-dravid-2.jpg",
      "/players/rahul-dravid-3.jpg",
      "/players/rahul-dravid-90.jpg",
      "/players/rahul-dravid-91.jpg",
    ],
  },
  {
    slug: "sourav-ganguly",
    name: "Sourav Ganguly",
    role: "Opening batter · Captain",
    era: "India · 1992–2008",
    files: [
      "/players/sourav-ganguly-0.jpg",
      "/players/sourav-ganguly-1.jpg",
      "/players/sourav-ganguly-3.jpg",
      "/players/sourav-ganguly-4.jpg",
    ],
  },
];
